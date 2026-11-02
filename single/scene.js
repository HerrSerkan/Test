// "Manche Menschen bleiben jahrelang Single." – deutsche Version (1080x1920) mit Sprecher.
// Schwarze Bühne, Lichtkegel, weiße Strichfigur; pro Satz eine Szene. Text oben, Wort für Wort zur Stimme.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const L = window.LINES;
const START = L.map(l => l[0][1]);
const END_SPEECH = L[L.length - 1].at(-1)[2];
const DUR = END_SPEECH + 1.7;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function circle(x, y, r, c) { if (!(r > 0)) return; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  if (a <= 0.003) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
const sceneAt = t => { let i = 0; for (let k = 0; k < START.length; k++) if (t >= START[k] - 0.15) i = k; return i; };

// ------------------------------------------------------------ Bühne
const FLOOR = 735;
function spotlight(x, a = 1, w = 120) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
  g.addColorStop(0, `rgba(255,255,255,${0.0 * a})`); g.addColorStop(1, `rgba(255,255,255,${0.09 * a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 22, 0); ctx.lineTo(x + 22, 0); ctx.lineTo(x + w, FLOOR); ctx.lineTo(x - w, FLOOR); ctx.fill();
  ctx.save(); ctx.scale(1, 0.18); glow(x, FLOOR / 0.18, w * 1.1, "255,255,255", 0.22 * a); ctx.restore();
}
function stage() {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, FLOOR - 20, 0, H);
  g.addColorStop(0, "#0b0b0d"); g.addColorStop(1, "#000"); ctx.fillStyle = g; ctx.fillRect(0, FLOOR, W, H - FLOOR);
}

// ------------------------------------------------------------ Strichfigur (weiß, ohne Umriss, leichtes Glühen)
const L1 = 70, L2 = 70, TL = 112, A1 = 54, A2 = 52, HEAD = 22, LW = 13;
function pt(p, ang, len) { const a = ang * Math.PI / 180; return [p[0] + Math.sin(a) * len, p[1] + Math.cos(a) * len]; }
function joints(o) {
  const hip = [o.x, o.y - L1 - L2 + (o.drop || 0)];
  const neck = pt(hip, 180 + (o.lean || 0), TL);
  const head = pt(hip, 180 + (o.lean || 0), TL + HEAD + 6);
  const kL = pt(hip, o.thL, L1), fL = pt(kL, o.thL - o.knL, L2);
  const kR = pt(hip, o.thR, L1), fR = pt(kR, o.thR - o.knR, L2);
  const sh = pt(hip, 180 + (o.lean || 0), TL - 8);
  const eL = pt(sh, o.arL, A1), hL = pt(eL, o.arL + o.elL, A2);
  const eR = pt(sh, o.arR, A1), hR = pt(eR, o.arR + o.elR, A2);
  return { hip, neck, head, kL, fL, kR, fR, sh, eL, hL, eR, hR };
}
const STAND = { thL: -4, thR: 4, knL: 0, knR: 0, arL: -4, arR: 4, elL: 2, elR: -2 };
function stroke(pts, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
}
// o: {x, y, col, s (Größe), alpha, reflect, ...Pose}
function fig(o) {
  const p = Object.assign({}, STAND, o);
  const s = p.s || 1, col = p.col || "#f5f5f5", dark = p.dark || "#d8d8d8";
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s, s); ctx.translate(-p.x, -p.y);
  ctx.globalAlpha *= p.alpha ?? 1;
  for (const mirror of (p.reflect === false ? [false] : [true, false])) {
    ctx.save();
    if (mirror) { ctx.translate(0, 2 * p.y); ctx.scale(1, -1); ctx.globalAlpha *= 0.12; }
    const J = joints(p);
    if (!mirror && (p.glow ?? 1) > 0) glow(J.sh[0], J.sh[1] + 30, 120, "255,255,255", 0.06 * (p.glow ?? 1));
    stroke([J.fL, J.kL, J.hip], dark, LW); stroke([J.hL, J.eL, J.sh], dark, LW);
    stroke([J.hip, J.neck], col, LW + 2);
    stroke([J.fR, J.kR, J.hip], col, LW); stroke([J.hR, J.eR, J.sh], col, LW);
    circle(J.head[0], J.head[1], HEAD, col);
    if (p.hold && !mirror) p.hold(J);
    ctx.restore();
    if (!mirror) o._J = joints(p);
  }
  ctx.restore();
  return o._J;
}
const GREY = { col: "#7d7d82", dark: "#66666b", glow: 0 };
function walk(ph, amp = 1) {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  return { thL: 24 * s * amp, thR: -24 * s * amp, knL: 6 + 26 * Math.max(0, -c) * amp, knR: 6 + 26 * Math.max(0, c) * amp, arL: -16 * s * amp, arR: 16 * s * amp, elL: 10, elR: 10, drop: -Math.abs(c) * 3 * amp };
}
function heart(x, y, r, col = "#e5262b", a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(r / 10, r / 10); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-13, -1, -7, -12, 0, -5); ctx.bezierCurveTo(7, -12, 13, -1, 0, 8); ctx.fill();
  ctx.restore();
}
// Paar (grau, Hand in Hand)
function couple(x, sway, a = 1) {
  const o1 = { x: x - 20, y: FLOOR, s: 0.85, ...GREY, alpha: a, arR: 30 + sway, elR: 0, reflect: true };
  const o2 = { x: x + 20, y: FLOOR, s: 0.85, ...GREY, alpha: a, arL: -30 - sway, elL: 0, reflect: true };
  fig(o1); fig(o2);
}

// ------------------------------------------------------------ Szenen (lt = Zeit seit Satzbeginn, d = Satzdauer)
const CX = 288;
const SCENES = [
  // 0 Manche Menschen bleiben jahrelang Single.
  (t, lt) => {
    spotlight(CX); couple(95, Math.sin(t * 2) * 4); couple(480, Math.sin(t * 2 + 1) * 4);
    fig({ x: CX, y: FLOOR, arL: -10, arR: 10 });
    const yr = Math.min(2025, 2019 + Math.floor(lt / 0.42));
    ctx.font = "700 26px Pix"; ctx.textAlign = "center"; ctx.fillStyle = "#e9e9ec"; ctx.fillText(String(yr), CX, 330);
  },
  // 1 Nicht, weil niemand sie will.
  (t, lt) => {
    spotlight(CX); couple(95, Math.sin(t * 2) * 4); couple(480, Math.sin(t * 2 + 1) * 4);
    fig({ x: CX, y: FLOOR, arR: 25, elR: 120, arL: -10 });
    const r = rng(2);
    for (let i = 0; i < 8; i++) { const k = (lt * 0.5 + r()) % 1, x = [95, 480, CX][i % 3] + (r() - 0.5) * 120; heart(x, 520 - k * 160, 7 + r() * 4, "#e5262b", Math.sin(k * Math.PI)); }
  },
  // 2 … nicht mehr mit weniger zufrieden.
  (t, lt) => {
    spotlight(CX); couple(95, Math.sin(t * 2) * 4); couple(480, Math.sin(t * 2 + 1) * 4);
    fig({ x: CX, y: FLOOR, arL: -6, arR: 6, lean: -2 + Math.sin(lt * 1.5) });
  },
  // 3 Sie haben die falsche Art von Liebe schon erlebt.
  (t, lt) => {
    spotlight(CX);
    fig({ x: CX, y: FLOOR, arL: -6, arR: 6, lean: 3 });
    const k = back(ramp(lt, 0.1, 0.5));
    ctx.save(); ctx.translate(CX + 60, 320); ctx.scale(k, k);
    ctx.fillStyle = "#1a1a1e"; ctx.strokeStyle = "#cfcfd4"; ctx.lineWidth = 2;
    ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ctx.moveTo(Math.cos(a) * 70 + 22, Math.sin(a) * 42); ctx.arc(Math.cos(a) * 70, Math.sin(a) * 42, 22, 0, Math.PI * 2); } ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 80, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // zwei kleine Figuren streiten, rotes gebrochenes Herz
    for (const sx of [-18, 18]) { ctx.strokeStyle = "#e9e9ec"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sx, 30); ctx.lineTo(sx, 0); ctx.moveTo(sx - 6, 32); ctx.lineTo(sx, 14); ctx.lineTo(sx + 6, 32); ctx.moveTo(sx, 4); ctx.lineTo(sx + (sx < 0 ? 12 : -12), -2 + Math.sin(t * 12) * 3); ctx.stroke(); circle(sx, -8, 6, "#e9e9ec"); }
    const br = ramp(lt, 1.0, 1.3) * 3;
    heart(-br, -26, 8); ctx.save(); ctx.beginPath(); ctx.rect(0, -40, 20, 30); ctx.clip(); heart(br, -26, 8); ctx.restore();
    ctx.restore();
    for (const [dx, dy, r] of [[-40, 66, 8], [-52, 90, 5]]) { circle(CX + 60 + dx, 320 + dy, (r + 1.5) * k, "#cfcfd4"); circle(CX + 60 + dx, 320 + dy, r * k, "#1a1a1e"); }
  },
  // 4 Deshalb schützen sie jetzt ihren Frieden.
  (t, lt) => {
    spotlight(CX);
    fig({ x: CX, y: FLOOR, arL: -8, arR: 8 });
    const k = easeOut(ramp(lt, 0.2, 0.8));
    ctx.save(); ctx.globalAlpha = k;
    const g = ctx.createRadialGradient(CX, 600, 60, CX, 600, 150);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.85, "rgba(255,255,255,0.05)"); g.addColorStop(1, "rgba(255,255,255,0.25)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, 600, 150 * (0.8 + 0.2 * k), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    // rote Pfeile prallen ab
    for (const [t0, a] of [[0.6, 0.3], [1.2, 2.8]]) {
      const q = ramp(lt, t0, t0 + 0.5); if (q <= 0 || q >= 1) continue;
      const r = q < 0.6 ? lerp(320, 155, q / 0.6) : lerp(155, 260, (q - 0.6) / 0.4);
      const x = CX + Math.cos(a) * r, y = 600 + Math.sin(a) * r;
      ctx.strokeStyle = "#e5262b"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); ctx.stroke();
    }
  },
  // 5 Sie besetzen keinen Platz, nur weil er frei ist.
  (t, lt) => {
    lamp(330, t); table(CX + 10);
    chair(165, false); chair(410, true);
    fig({ x: 190, y: FLOOR, ...sit(), reflect: false, arR: 70, elR: 30 });
    const k = easeOut(ramp(lt, 0.9, 1.8));
    if (lt > 0.9) fig({ x: lerp(620, 470, k), y: FLOOR, ...GREY, ...(k < 1 ? walk(lt * 1.6) : STAND), arL: k >= 1 ? -30 : undefined, elL: k >= 1 ? 40 : undefined });
  },
  // 6 Allein zu sein macht ihnen keine Angst.
  (t, lt) => {
    floorLamp(170, t); armchair(250);
    fig({ x: 285, y: FLOOR - 10, ...sit(), reflect: false, lean: -10, arR: 95, elR: 80, arL: 90, elL: 90,
      hold: J => { ctx.fillStyle = "#e9e9ec"; ctx.save(); ctx.translate(J.hR[0] + 4, J.hR[1] - 6); ctx.rotate(-0.4); ctx.fillRect(-14, -10, 28, 20); ctx.fillStyle = "#555"; ctx.fillRect(-1, -10, 2, 20); ctx.restore(); } });
  },
  // 7 Sich neben jemandem allein zu fühlen schon.
  (t, lt) => {
    const k = ramp(lt, 1.4, 1.8);
    if (k < 1) {
      ctx.save(); ctx.globalAlpha = 1 - k;
      sofa(CX);
      fig({ x: 175, y: FLOOR - 20, ...sit(), ...GREY, col: "#a3a3a8", dark: "#8a8a8f", reflect: false });
      fig({ x: 400, y: FLOOR - 20, ...sit(), ...GREY, col: "#a3a3a8", dark: "#8a8a8f", reflect: false });
      ctx.restore();
    }
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; spotlight(CX); fig({ x: CX, y: FLOOR, ...GREY, col: "#c9c9cd", dark: "#a9a9ad", lean: 4 }); ctx.restore(); }
  },
  // 8 Also bauen sie sich ein Leben, das sich schon voll anfühlt.
  (t, lt) => {
    spotlight(CX);
    const up = easeOut(ramp(lt, 0.2, 0.7));
    fig({ x: CX, y: FLOOR, arL: lerp(-6, -60, up), arR: lerp(6, 60, up), elL: 0, elR: 0 });
    orbit(lt, 0.8);
  },
  // 9 Darum beeindrucken große Gesten sie nicht.
  (t, lt) => {
    spotlight(CX); orbit(lt + 3, 1, 0.6);
    fig({ x: CX, y: FLOOR, arL: 30, arR: -40, elL: 100, elR: -100, lean: -4 });
    const k = easeOut(ramp(lt, 0.3, 1.1));
    fig({ x: lerp(640, 440, k), y: FLOOR, ...GREY, ...(k < 1 ? walk(lt * 1.6) : STAND), lean: k >= 1 ? -12 : 0, arL: -95, elL: -15,
      hold: J => { heart(J.hL[0] - 6, J.hL[1] - 10, 13); } });
    if (lt > 1.2) heart(CX + 60, 430 - (lt - 1.2) * 20, 18 * back(ramp(lt, 1.2, 1.5)));
  },
  // 10 Nicht, weil ihre Ansprüche zu hoch sind.
  (t, lt) => {
    spotlight(CX + 30);
    fig({ x: CX + 30, y: FLOOR, arL: 60, elL: 70, arR: 4 });
    const k = back(ramp(lt, 0.1, 0.45));
    ctx.save(); ctx.translate(150, 540); ctx.rotate(-0.06); ctx.scale(k, k);
    ctx.fillStyle = "#f2f2f2"; rr(-62, -62, 124, 124, 6); ctx.fill();
    ctx.fillStyle = "#1a1a1e"; ctx.font = "700 11px Pix"; ctx.textAlign = "left"; ctx.fillText("ANSPRÜCHE", -50, -40);
    ["EHRLICH", "FREUNDLICH", "VERLÄSSLICH"].forEach((s, i) => {
      const y = -14 + i * 26; ctx.strokeStyle = "#1a1a1e"; ctx.lineWidth = 1.5; ctx.strokeRect(-50, y - 8, 11, 11);
      if (i < 2 || lt > 1.4) { ctx.strokeStyle = i < 2 ? "#e5262b" : "#e5262b"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-48, y - 2); ctx.lineTo(-45, y + 2); ctx.lineTo(-38, y - 9); ctx.stroke(); }
      ctx.fillStyle = "#1a1a1e"; ctx.font = "400 9.5px Pix"; ctx.fillText(s, -33, y + 2);
    });
    ctx.restore();
  },
  // 11 Sondern weil sie wissen, was ein falsches Ja kostet.
  (t, lt, d) => {
    spotlight(CX - 20);
    fig({ x: CX - 20, y: FLOOR, arL: -6, arR: 6, lean: 2 });
    const k = back(ramp(lt, 0.2, 0.5)), brk = ramp(lt, d - 1.3, d - 1.0) * 6;
    heart(410 - brk, 480, 22 * k); ctx.save(); ctx.beginPath(); ctx.rect(410, 440, 40, 80); ctx.clip(); heart(410 + brk, 480, 22 * k); ctx.restore();
    ctx.strokeStyle = "#cfcfd4"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(410, 500); ctx.lineTo(420, 525); ctx.stroke();
    ctx.save(); ctx.translate(425, 545); ctx.rotate(0.08); ctx.scale(k, k);
    ctx.fillStyle = "#f2f2f2"; rr(-34, -16, 68, 34, 4); ctx.fill();
    ctx.textAlign = "center"; ctx.fillStyle = "#1a1a1e"; ctx.font = "700 9px Pix"; ctx.fillText("PREIS:", 0, -3);
    ctx.fillStyle = lt > d - 1.3 ? "#e5262b" : "#1a1a1e"; ctx.font = "700 10px Pix"; ctx.fillText(lt > d - 1.3 ? "3 JAHRE" : "???", 0, 11);
    ctx.restore();
  },
  // 12 Single sein ist nicht immer Weglaufen.
  (t, lt) => {
    spotlight(CX);
    const k = ramp(lt, 0.8, 2.0);
    fig({ x: lerp(CX, CX - 260, easeIO(k)), y: FLOOR, ...walk(lt * 2.2, 1.3), alpha: 0.35 * (1 - k) });
    fig({ x: CX, y: FLOOR, arL: -6, arR: 6 });
  },
  // 13 Manchmal ist es Selbstachtung.
  (t, lt) => {
    spotlight(CX, 1.4);
    const k = ramp(lt, 0.6, 1.2);
    glow(CX, 590, 170, "255,240,210", 0.25 * k);
    fig({ x: CX, y: FLOOR, arL: -8, arR: 8, lean: -2 });
    const r = rng(8);
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, rad = 70 + r() * 90, tw = Math.sin(t * 5 + i) * 0.5 + 0.5; circle(CX + Math.cos(a) * rad, 590 + Math.sin(a) * rad * 1.4, 1.6, `rgba(255,230,180,${k * tw})`); }
  },
  // 14 Und wenn sich einer von ihnen je für dich entscheidet,
  (t, lt) => {
    const k = easeIO(ramp(lt, 0.4, 2.4));
    spotlight(lerp(150, 230, k), 0.9, 100); spotlight(lerp(430, 345, k), 0.9, 100);
    fig({ x: lerp(150, 230, k), y: FLOOR, ...(k > 0 && k < 1 ? walk(lt * 1.4, 0.8) : STAND) });
    fig({ x: lerp(430, 345, k), y: FLOOR, col: "#cfcfd3", dark: "#b1b1b5", ...(k > 0 && k < 1 ? walk(lt * 1.4 + 0.5, 0.8) : STAND) });
  },
  // 15 dann nicht, weil er jemanden gebraucht hat.
  (t, lt) => {
    spotlight(288, 1.1, 140);
    const k = easeIO(ramp(lt, 0.2, 1.4));
    fig({ x: lerp(230, 255, k), y: FLOOR, lean: 3, arR: lerp(4, 40, k), elR: lerp(0, -10, k) });
    fig({ x: lerp(345, 322, k), y: FLOOR, col: "#cfcfd3", dark: "#b1b1b5", lean: -3, arL: lerp(-4, -40, k), elL: lerp(0, 10, k) });
  },
  // 16 Sondern weil du es warst.
  (t, lt) => {
    spotlight(288, 1.2, 140);
    fig({ x: 258, y: FLOOR, lean: 4, arR: 45, elR: -10 });
    fig({ x: 318, y: FLOOR, col: "#cfcfd3", dark: "#b1b1b5", lean: -4, arL: -45, elL: 10 });
    const k = back(ramp(lt, 0.7, 1.0));
    if (k > 0) heart(288, 470 - Math.sin(t * 3) * 3, 16 * k);
  },
];
// Möbel
function sit() { return { thL: 80, thR: 86, knL: 86, knR: 90, drop: 60, arL: 10, arR: 20, elL: 20, elR: 20 }; }
function lamp(x, t) {
  ctx.strokeStyle = "#333"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 330); ctx.stroke();
  ctx.fillStyle = "#2a2a2e"; ctx.beginPath(); ctx.moveTo(x - 14, 330); ctx.lineTo(x + 14, 330); ctx.lineTo(x + 38, 368); ctx.lineTo(x - 38, 368); ctx.fill();
  const g = ctx.createLinearGradient(0, 368, 0, FLOOR);
  g.addColorStop(0, "rgba(255,214,150,0.35)"); g.addColorStop(1, "rgba(255,214,150,0.06)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 38, 368); ctx.lineTo(x + 38, 368); ctx.lineTo(x + 230, FLOOR); ctx.lineTo(x - 230, FLOOR); ctx.fill();
  glow(x, 372, 40, "255,230,180", 0.8);
}
function floorLamp(x, t) {
  ctx.fillStyle = "#3a3a3e"; ctx.fillRect(x - 2, 420, 4, FLOOR - 420); ctx.fillRect(x - 22, FLOOR - 4, 44, 4);
  ctx.fillStyle = "#e9dcc0"; ctx.beginPath(); ctx.moveTo(x - 16, 380); ctx.lineTo(x + 16, 380); ctx.lineTo(x + 28, 425); ctx.lineTo(x - 28, 425); ctx.fill();
  const g = ctx.createLinearGradient(0, 425, 0, FLOOR);
  g.addColorStop(0, "rgba(255,214,150,0.32)"); g.addColorStop(1, "rgba(255,214,150,0.05)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 28, 425); ctx.lineTo(x + 28, 425); ctx.lineTo(x + 220, FLOOR); ctx.lineTo(x - 150, FLOOR); ctx.fill();
}
function table(x) { ctx.fillStyle = "#4a3426"; ctx.beginPath(); ctx.ellipse(x, 615, 80, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 5, 615, 10, FLOOR - 615); ctx.fillRect(x - 30, FLOOR - 5, 60, 5); ctx.fillStyle = "#e9e9ec"; ctx.fillRect(x - 40, 600, 14, 14); }
function chair(x, flip) {
  const d = flip ? 1 : -1; ctx.fillStyle = "#4a3426";
  ctx.fillRect(x - 32, 650, 64, 9); ctx.fillRect(x + d * 30 - 4, 545, 8, 110);
  ctx.fillRect(x - 30, 655, 6, FLOOR - 655); ctx.fillRect(x + 24, 655, 6, FLOOR - 655);
}
function armchair(x) { ctx.fillStyle = "#3b3b45"; rr(x - 20, 520, 50, 200, 14); ctx.fill(); rr(x - 10, 650, 150, 60, 12); ctx.fill(); ctx.fillStyle = "#4a4a56"; rr(x + 110, 610, 40, 100, 12); ctx.fill(); ctx.fillRect(x, 708, 8, 27); ctx.fillRect(x + 125, 708, 8, 27); }
function sofa(x) { ctx.fillStyle = "#26262c"; rr(x - 250, 560, 500, 110, 16); ctx.fill(); ctx.fillStyle = "#303038"; rr(x - 240, 640, 480, 60, 12); ctx.fill(); rr(x - 270, 610, 40, 100, 12); ctx.fill(); rr(x + 230, 610, 40, 100, 12); ctx.fill(); }
// Kreis aus Symbolen (Buch, Hantel, Musik, Freunde, Reisen, Kaffee …)
const ICONS = ["📖", "🏋️", "🎵", "👥", "✈️", "☕", "🎨", "🌱"];
function orbit(lt, a = 1, sc = 1) {
  const k = easeOut(ramp(lt, 0.2, 1.2));
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = `rgba(255,255,255,${0.35 * k})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(CX, 600, 170 * sc * k, 200 * sc * k, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.font = "26px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ICONS.forEach((ic, i) => {
    const q = clamp(k * ICONS.length - i); if (q <= 0) return;
    const ang = i / ICONS.length * Math.PI * 2 - Math.PI / 2 + lt * 0.15;
    const x = CX + Math.cos(ang) * 170 * sc, y = 600 + Math.sin(ang) * 200 * sc;
    circle(x, y, 20 * q, "rgba(30,30,34,0.9)"); ctx.save(); ctx.translate(x, y); ctx.scale(q, q); ctx.fillText(ic, 0, 2); ctx.restore();
  });
  ctx.restore();
}

// ------------------------------------------------------------ Text oben (Wort für Wort)
function caption(t) {
  const i = sceneAt(t), words = L[i];
  ctx.save(); ctx.font = "700 20px Pix"; ctx.letterSpacing = "2px"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  const maxW = 470, sp = ctx.measureText(" ").width;
  const lines = [[]]; let w = 0;
  for (const wd of words) {
    const ww = ctx.measureText(wd[0].toUpperCase()).width;
    if (w + ww > maxW && lines.at(-1).length) { lines.push([]); w = 0; }
    lines.at(-1).push([wd, ww]); w += ww + sp;
  }
  const fadeIn = ramp(t, START[i] - 0.15, START[i] + 0.05), fadeOut = 1 - ramp(t, END_SPEECH + 0.9, END_SPEECH + 1.4);
  lines.forEach((ln, li) => {
    const lw = ln.reduce((s, [, ww]) => s + ww + sp, -sp);
    let x = W / 2 - lw / 2; const y = 200 + li * 32;
    for (const [[tx, s, e, key], ww] of ln) {
      const spoken = t >= s - 0.03;
      ctx.globalAlpha = fadeIn * fadeOut * (spoken ? 1 : 0.32);
      ctx.fillStyle = spoken && key ? "#e5262b" : "#f2f2f4";
      ctx.fillText(tx.toUpperCase(), x, y);
      x += ww + sp;
    }
  });
  ctx.restore();
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  stage();
  const i = sceneAt(t), lt = t - START[i], d = (START[i + 1] ?? DUR) - START[i];
  // Szenenwechsel: kurze Abblende + langsamer Zoom
  const z = 1 + 0.03 * clamp(lt / d);
  ctx.save(); ctx.translate(CX, 600); ctx.scale(z, z); ctx.translate(-CX, -600);
  SCENES[i](t, lt, d);
  ctx.restore();
  const fade = Math.max(1 - ramp(lt, -0.15, 0.12), i < L.length - 1 ? ramp(t, START[i + 1] - 0.27, START[i + 1] - 0.15) : 0);
  if (i > 0 && fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  // Vignette
  const v = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.7)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  caption(t);
  const out = ramp(t, DUR - 0.5, DUR);
  if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${out})`; ctx.fillRect(0, 0, W, H); }
};
window.exportEvents = function () { return { duration: DUR, starts: START, hearts: [START[1], START[9] + 1.2, START[16] + 0.7], shield: START[4] + 0.2, sparkle: START[13] + 0.6, years: START[0] }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("700 20px Pix"), document.fonts.load("400 10px Pix"), document.fonts.load("26px 'Noto Color Emoji'")]);
  return { duration: DUR };
};
