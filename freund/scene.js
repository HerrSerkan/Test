// "Falscher Freund / Echter Freund" – deutsche Version (1080x1920), ohne Sprecher.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 12.9, CUT = 6.03;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function keys(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

// ------------------------------------------------------------ Bühne
const GROUND = 712;
const MUD = "#7a4a2a", MUD_D = "#5a3218";
function drawStage(t, scroll) {
  ctx.fillStyle = "#1c1f27"; ctx.fillRect(0, 0, W, H);
  // Ziegelwand, sehr dunkel
  ctx.strokeStyle = "rgba(255,255,255,0.025)"; ctx.lineWidth = 1;
  for (let y = 0, r = 0; y < GROUND; y += 22, r++) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    for (let x = ((r % 2) * 30 - scroll) % 60 - 60; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); }
  }
  // Fenster mit warmem Licht (wandert beim Gehen mit)
  for (const x0 of [-30, 560, 1150]) {
    const x = x0 - scroll * 0.9;
    if (x < -150 || x > W + 50) continue;
    glow(x + 50, 150, 170, "255,170,80", 0.12);
    ctx.fillStyle = "#3a2a1e"; ctx.fillRect(x - 6, 60, 112, 180);
    ctx.fillStyle = "#f5a54a"; ctx.fillRect(x, 66, 100, 168);
    ctx.fillStyle = "#ffcf7a"; ctx.fillRect(x + 8, 74, 38, 70);
    ctx.fillStyle = "#3a2a1e"; ctx.fillRect(x + 47, 66, 6, 168); ctx.fillRect(x, 146, 100, 6);
  }
  // Laterne rechts
  const lx = 520 - scroll * 0.3;
  ctx.fillStyle = "#2b2f38"; ctx.fillRect(lx, 0, 9, GROUND);
  glow(lx + 20, 40, 160, "255,230,180", 0.25);
  // Lichtkegel auf dem Boden
  const g = ctx.createRadialGradient(330, GROUND + 10, 10, 330, GROUND + 10, 260);
  g.addColorStop(0, "rgba(255,225,170,0.22)"); g.addColorStop(1, "rgba(255,225,170,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 450, W, 400);
  // Gehweg
  ctx.fillStyle = "#30333b"; ctx.fillRect(0, GROUND - 40, W, 46);
  ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.2;
  for (let x = (-scroll) % 70 - 70; x < W + 70; x += 70) { ctx.beginPath(); ctx.moveTo(x, GROUND - 40); ctx.lineTo(x - 18, GROUND + 6); ctx.stroke(); }
  ctx.fillStyle = "#8d9097"; ctx.fillRect(0, GROUND + 6, W, 6);
  ctx.fillStyle = "#15171d"; ctx.fillRect(0, GROUND + 12, W, H - GROUND - 12);
  ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(0, GROUND + 12, W, 3);
}

// ------------------------------------------------------------ Strichfigur
// Pose in Grad-Winkeln (0 = senkrecht nach unten, positiv = nach rechts vorn)
const L1 = 76, L2 = 76, T_LEN = 120, A1 = 62, A2 = 58, HEAD = 33, LW = 15;
function pt(p, ang, len) { const a = ang * Math.PI / 180; return [p[0] + Math.sin(a) * len, p[1] + Math.cos(a) * len]; }
function joints(o) {
  const hip = [o.x, o.y - L1 - L2 + (o.drop || 0)];
  const neck = pt(hip, 180 + (o.lean || 0), T_LEN);
  const head = pt(hip, 180 + (o.lean || 0) + (o.headTilt || 0), T_LEN + HEAD + 4);
  const kL = pt(hip, o.thL, L1), fL = pt(kL, o.thL - o.knL, L2);
  const kR = pt(hip, o.thR, L1), fR = pt(kR, o.thR - o.knR, L2);
  const sh = pt(hip, 180 + (o.lean || 0), T_LEN - 10);
  const eL = pt(sh, o.arL, A1), hL = pt(eL, o.arL + o.elL, A2);
  const eR = pt(sh, o.arR, A1), hR = pt(eR, o.arR + o.elR, A2);
  return { hip, neck, head, kL, fL, kR, fR, sh, eL, hL, eR, hR };
}
function limb(pts, col, w = LW) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = "#0d0d10"; ctx.lineWidth = w + 6;
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
}
// Flecken entlang einer Strecke
function spots(a, b, col, n, seed, amt) {
  if (amt <= 0) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const k = r(), side = (r() - 0.5) * LW * 0.7;
    if (r() > amt) continue;
    const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k);
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x - dy / l * side, y + dx / l * side, 3 + r() * 3.5, 2.5 + r() * 2.5, Math.atan2(dy, dx), 0, Math.PI * 2); ctx.fill();
  }
}
function face(c, r, f, dir, a = 1) {
  ctx.save(); ctx.translate(c[0], c[1]); ctx.globalAlpha *= a;
  const ox = dir * 7, E = 8.5, ey = -3;
  ctx.fillStyle = "#121216"; ctx.strokeStyle = "#121216"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
  const dots = (rr = 3) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(ox + s * E, ey, rr * 0.8, rr * 1.15, 0, 0, Math.PI * 2); ctx.fill(); } };
  const big = () => { for (const s of [-1, 1]) { circle(ox + s * E, ey, 6, "#fff"); circle(ox + s * E, ey, 3, "#121216"); } ctx.fillStyle = "#121216"; };
  const happy = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(ox + s * E, ey + 3, 4.5, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  const smug = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ox + s * E - 5, ey - 1); ctx.lineTo(ox + s * E + 5, ey - 1); ctx.stroke(); ctx.beginPath(); ctx.arc(ox + s * E + 1, ey - 1, 2.6, 0, Math.PI); ctx.fill(); } };
  const brows = (k) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ox + s * E - 5, ey - 9 + s * k); ctx.lineTo(ox + s * E + 5, ey - 9 - s * k); ctx.stroke(); } };
  switch (f) {
    case "neutral": dots(); ctx.beginPath(); ctx.arc(ox, 9, 5, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); break;
    case "shock": big(); break;
    case "sad": dots(); ctx.beginPath(); ctx.arc(ox, 16, 5, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); brows(-2); break;
    case "smug": smug(); ctx.beginPath(); ctx.moveTo(ox - 5, 10); ctx.quadraticCurveTo(ox + 2, 13, ox + 8, 7); ctx.stroke(); brows(1.5); break;
    case "concern": dots(2.6); ctx.beginPath(); ctx.moveTo(ox - 4, 11); ctx.lineTo(ox + 4, 11); ctx.stroke(); brows(-2.5); break;
    case "laugh": happy(); ctx.beginPath(); ctx.arc(ox, 7, 8, 0, Math.PI); ctx.closePath(); ctx.fill(); circle(ox, 11, 3, "#e0667a"); break;
    case "grin": happy(); ctx.beginPath(); ctx.arc(ox, 7, 7, 0, Math.PI); ctx.closePath(); ctx.fill(); break;
    case "blink": for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ox + s * E - 4, ey); ctx.lineTo(ox + s * E + 4, ey); ctx.stroke(); } break;
  }
  ctx.restore();
}
// o: {x, y, col, mud (0..1 Flecken), mudCol, pose…, face, dir}
function figure(o) {
  const J = joints(o);
  const col = o.col, sp = o.spotCol || MUD;
  const back = [[J.hip, J.kL, J.fL], [J.sh, J.eL, J.hL]], front = [[J.hip, J.kR, J.fR], [J.sh, J.eR, J.hR]];
  for (const l of back) { limb(l, shade(col)); spots(l[0], l[1], sp, 4, 11, o.mud || 0); spots(l[1], l[2], sp, 4, 12, o.mud || 0); }
  limb([J.hip, J.neck], col); spots(J.hip, J.neck, sp, 7, 13, o.mud || 0);
  for (const l of front) { limb(l, col); spots(l[0], l[1], sp, 4, 14 + l[2][0] % 3, o.mud || 0); spots(l[1], l[2], sp, 4, 17, o.mud || 0); }
  // Kopf
  circle(J.head[0], J.head[1], HEAD + 3, "#0d0d10"); circle(J.head[0], J.head[1], HEAD, col);
  ctx.save(); ctx.beginPath(); ctx.arc(J.head[0], J.head[1], HEAD, 0, Math.PI * 2); ctx.clip();
  if (o.mud) { const r = rng(21); for (let i = 0; i < 6; i++) { if (r() > o.mud) continue; ctx.fillStyle = sp; ctx.beginPath(); ctx.ellipse(J.head[0] + (r() - 0.5) * 50, J.head[1] + (r() - 0.5) * 50, 6 + r() * 6, 5 + r() * 4, r() * 3, 0, Math.PI * 2); ctx.fill(); } }
  if (o.clean) { ctx.fillStyle = o.cleanCol; ctx.beginPath(); ctx.arc(J.head[0], J.head[1], HEAD * o.clean, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.arc(J.head[0] - 10, J.head[1] - 12, 14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (o.face) face(J.head, HEAD, o.face, o.dir || 0, o.faceA ?? 1);
  return J;
}
function shade(c) { return c === "#f4f4f2" ? "#dcdcd8" : c === "#b9bcc2" ? "#a3a6ac" : c === MUD ? MUD_D : c; }

// Gehzyklus
function walk(ph, amp = 1) {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  return { thL: 26 * s * amp, thR: -26 * s * amp, knL: 8 + 30 * Math.max(0, -c) * amp, knR: 8 + 30 * Math.max(0, c) * amp,
    arL: -18 * s * amp, arR: 18 * s * amp, elL: 14, elR: 14, drop: -Math.abs(c) * 4 * amp, lean: 4 };
}
const STAND = { thL: -6, thR: 8, knL: 4, knR: 4, arL: -8, arR: 8, elL: 8, elR: -8, drop: 0, lean: 0 };

// ------------------------------------------------------------ Effekte
const SPLASH = (() => { const r = rng(5), a = []; for (let i = 0; i < 120; i++) a.push({ vx: (r() - 0.3) * 260, vy: -260 - r() * 520, s: 3 + r() * 6, d: r() * 0.15 }); return a; })();
function splash(x, t, t0) {
  for (const p of SPLASH) {
    const dt = t - t0 - p.d; if (dt < 0 || dt > 1.1) continue;
    const y = GROUND + 20 + p.vy * dt + 700 * dt * dt; if (y > GROUND + 40) continue;
    ctx.globalAlpha = 1 - dt / 1.1; ctx.fillStyle = MUD;
    ctx.beginPath(); ctx.ellipse(x + p.vx * dt, y, p.s, p.s * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function car(t, t0) {
  const k = (t - t0) / 0.6; if (k < -0.05 || k > 1.05) return;
  const x = lerp(-440, W + 60, k), y = GROUND + 40;
  ctx.save(); ctx.filter = "blur(3px)";
  ctx.fillStyle = "#e52d2d";
  ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x + 20, y - 10); ctx.lineTo(x + 140, y - 30); ctx.lineTo(x + 250, y - 80); ctx.lineTo(x + 380, y - 70); ctx.lineTo(x + 420, y - 10); ctx.lineTo(x + 420, y + 40); ctx.fill();
  ctx.fillStyle = "#b51e22"; ctx.fillRect(x, y + 25, 420, 18);
  ctx.fillStyle = "rgba(160,200,230,0.6)"; ctx.beginPath(); ctx.moveTo(x + 170, y - 34); ctx.lineTo(x + 255, y - 72); ctx.lineTo(x + 330, y - 66); ctx.lineTo(x + 330, y - 34); ctx.fill();
  for (const wx of [x + 90, x + 330]) { circle(wx, y + 42, 42, "#151515"); circle(wx, y + 42, 22, "#c9ccd2"); }
  ctx.restore();
}
function puddle(x, w, a) { if (a <= 0) return; ctx.fillStyle = `rgba(90,52,26,${0.9 * a})`; ctx.beginPath(); ctx.ellipse(x, GROUND + 2, w, 9, 0, 0, Math.PI * 2); ctx.fill(); }
function drips(J, t, a) {
  if (a <= 0) return;
  const r = rng(3);
  for (let i = 0; i < 6; i++) {
    const k = (t * (0.7 + r() * 0.6) + r()) % 1, src = [J.hL, J.hR, J.fL, J.hip][i % 4];
    ctx.globalAlpha = a * (1 - k); ctx.fillStyle = MUD;
    ctx.beginPath(); ctx.ellipse(src[0] + (r() - 0.5) * 12, src[1] + k * 50, 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function towel(x, y, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = "#0d0d10"; ctx.fillRect(-15, -13, 30, 26);
  ctx.fillStyle = "#f2f2ee"; ctx.fillRect(-13, -11, 26, 22);
  ctx.fillStyle = "rgba(122,74,42,0.6)"; ctx.fillRect(-13, 2, 26, 9);
  ctx.restore();
}
function sparkle(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const a = i * 1.05; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 20 * k, y + Math.sin(a) * 20 * k); ctx.lineTo(x + Math.cos(a) * 34 * k, y + Math.sin(a) * 34 * k); ctx.stroke(); }
  ctx.restore();
}

// ------------------------------------------------------------ Teil 1: falscher Freund
const WHITE = "#f4f4f2", GREY = "#b9bcc2";
function partFake(t) {
  const T_SPLASH = 1.12;
  // Kamera: Totale -> nah an die Figuren
  const [z, cx] = keys([[0, 1, 288], [2.4, 1, 288], [4.0, 1.08, 300], [5.2, 1.16, 305], [6.1, 1.18, 305]], t);
  const walking = t < 1.0;
  const scroll = walking ? t * 120 : 120;
  ctx.translate(288, GROUND + 20); ctx.scale(z * 1.25, z * 1.25); ctx.translate(-cx, -(GROUND + 20));
  drawStage(t, scroll);
  // grauer (falscher) Freund
  const g = { x: 185, y: GROUND, col: GREY, dir: 1, face: "neutral", ...STAND };
  const v = { x: 345, y: GROUND, col: WHITE, dir: 1, face: "neutral", ...STAND };
  if (walking) { Object.assign(g, walk(t * 1.6 + 0.5)); Object.assign(v, walk(t * 1.6)); }
  const hit = t >= T_SPLASH;
  if (hit) { v.col = MUD; v.spotCol = WHITE; v.mud = 0.55; v.face = "shock"; v.dir = 0; Object.assign(v, { arL: -40, arR: 40, elL: 20, elR: -20, thL: -12, thR: 14 }); v.lean = -3; }
  if (t >= 1.25 && t < 2.4) { g.face = "shock"; g.dir = 1; g.arR = 150; g.elR = -150; g.lean = -4; } // Hand vor dem Mund
  if (t >= 2.4) { // geht hin und wischt
    const k = easeIO(ramp(t, 2.4, 3.2));
    g.x = lerp(185, 268, k); g.face = t < 3.6 ? "concern" : "smug"; g.lean = 6 * k;
    if (t < 3.2) Object.assign(g, walk((t - 2.4) * 1.6, 0.7));
    if (t >= 3.2) { const w = Math.sin((t - 3.2) * 9); g.arR = 112 + w * 10; g.elR = 40 + w * 15; g.arL = 30; g.elL = 50; }
    v.face = t < 4.0 ? "sad" : "blink"; v.dir = -1;
  }
  puddle(345, 70, hit ? 1 : 0);
  const Jv = figure(v);
  const Jg = figure(g);
  if (t >= 3.2) towel(Jg.hR[0], Jg.hR[1], Math.sin(t * 9) * 0.4);
  // sauber gewischte Stelle im Gesicht
  if (t >= 3.4) {
    ctx.save(); ctx.beginPath(); ctx.arc(Jv.head[0], Jv.head[1], HEAD, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = WHITE; ctx.beginPath(); ctx.ellipse(Jv.head[0] - 4, Jv.head[1] - 2, 26 * ramp(t, 3.4, 4.6), 18 * ramp(t, 3.4, 4.6), -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    face(Jv.head, HEAD, v.face, -1);
  }
  splash(345, t, T_SPLASH);
  drips(Jv, t, hit ? 1 : 0);
  car(t, T_SPLASH - 0.38);
  return { z };
}

// ------------------------------------------------------------ Teil 2: echter Freund
function partReal(t) {
  const T_SPLASH = 7.12;
  const [z, cx] = keys([[CUT, 1, 288], [7.6, 1, 288], [8.6, 1.05, 285], [10.4, 1.06, 270], [11.4, 1.14, 305], [12.9, 1.18, 310]], t);
  const walking = t < 7.0;
  const scroll = 120 + (walking ? (t - CUT) * 120 : 120);
  ctx.translate(288, GROUND + 20); ctx.scale(z * 1.25, z * 1.25); ctx.translate(-cx, -(GROUND + 20));
  drawStage(t, scroll);
  const f = { x: 205, y: GROUND, col: WHITE, dir: 1, face: "neutral", ...STAND };
  const v = { x: 345, y: GROUND, col: WHITE, dir: 1, face: "neutral", ...STAND };
  if (walking) { Object.assign(f, walk((t - CUT) * 1.6 + 0.5)); Object.assign(v, walk((t - CUT) * 1.6)); }
  const hit = t >= T_SPLASH;
  if (hit) { v.col = MUD; v.spotCol = WHITE; v.mud = 0.55; v.face = stateAt([[0, "shock"], [10.9, "neutral"], [11.6, "grin"], [12.0, "laugh"]], t); v.dir = -1; Object.assign(v, { arL: -40, arR: 40, elL: 20, elR: -20, thL: -12, thR: 14 }); }
  let fMud = 0;
  if (t >= 7.4 && t < 8.6) { // lacht und zeigt
    const b = Math.sin((t - 7.4) * 22); f.face = "laugh"; f.arR = 95 + b * 5; f.elR = 0; f.arL = -10; f.elL = 60; f.lean = -6 + b * 2;
  }
  if (t >= 8.2 && t < 8.9) { const k = ramp(t, 8.2, 8.5); f.lean = lerp(-6, 32, k); f.face = "laugh"; f.arL = 60; f.elL = 70; f.arR = 50; f.elR = 60; f.drop = 10 * k; }
  if (t >= 8.9 && t < 9.25) { f.face = "grin"; f.lean = 0; f.arL = 170; f.arR = 190; f.elL = 0; f.elR = 0; f.drop = -6; } // Anlauf, Arme hoch
  let lying = null;
  if (t >= 9.25 && t < 10.5) { // wirft sich in die Pfütze
    const k = easeOut(ramp(t, 9.25, 9.6));
    lying = { k, x: lerp(205, 175, k) };
    fMud = ramp(t, 9.5, 9.9);
  }
  if (t >= 10.5) { // steht auf, Arm um die Schulter
    fMud = 1;
    const k = easeIO(ramp(t, 10.5, 11.0));
    f.x = lerp(215, 280, k); f.face = t < 11.0 ? "grin" : stateAt([[0, "grin"], [11.4, "laugh"]], t); f.dir = 1;
    f.arR = lerp(20, 105, k); f.elR = lerp(20, 30, k); f.lean = 4;
    if (t >= 11.2) { const b = Math.sin((t - 11.2) * 14); f.drop = Math.abs(b) * 3; v.drop = Math.abs(Math.sin((t - 11.3) * 14)) * 3; }
  }
  puddle(300, 95, hit ? 1 : 0);
  const Jv = figure(v);
  if (lying) {
    // Hechtsprung in die Pfütze: Körper kippt um die Hüfte nach links, landet waagerecht
    const k = lying.k, wig = t > 9.6 ? Math.sin(t * 18) * 14 : 0;
    ctx.save(); ctx.translate(lerp(205, 330, k), lerp(GROUND - L1 - L2, GROUND - 16, k)); ctx.rotate(-Math.PI / 2 * k);
    figure({ x: 0, y: L1 + L2, col: WHITE, spotCol: MUD, mud: fMud, dir: 0, face: t > 9.6 ? "laugh" : "grin",
      thL: 10 + wig, thR: 2 - wig, knL: -30, knR: 0, arL: 150 + wig * 0.6, arR: 170 - wig * 0.6, elL: 10, elR: -10, lean: 0 });
    ctx.restore();
    splash(260, t, 9.48);
  } else {
    f.mud = fMud; f.spotCol = MUD;
    const Jf = figure(f);
    if (t >= 10.5) drips(Jf, t, 0.8);
    if (t < 8.9) sparkle(Jf.head[0], Jf.head[1] - 40, t, 7.45);
  }
  splash(345, t, T_SPLASH);
  drips(Jv, t, hit ? 1 : 0);
  car(t, T_SPLASH - 0.38);
  // „HA HA“
  if (t >= 7.45 && t < 8.85) {
    ctx.font = "700 24px Pix"; ctx.textAlign = "center"; ctx.fillStyle = "#f4f4f2";
    for (const [t0, dx, dy] of [[7.45, -60, -230], [7.75, -20, -255], [8.05, -70, -270], [8.35, -15, -240]]) {
      const k = ramp(t, t0, t0 + 0.7); if (k <= 0 || k >= 1) continue;
      ctx.globalAlpha = Math.sin(k * Math.PI); ctx.fillText("HA", 205 + dx, GROUND + dy - k * 20);
    }
    ctx.globalAlpha = 1;
  }
  return { z };
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.save();
  if (t < CUT) partFake(t); else partReal(t);
  ctx.restore();
  // Vignette
  const v = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, H * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // Überschrift
  ctx.font = "700 15px Pix"; ctx.letterSpacing = "3px"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#eef0f4";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 4;
  ctx.fillText(t < CUT ? "FALSCHER FREUND" : "ECHTER FREUND", W / 2 + 1.5, 166);
  ctx.shadowBlur = 0; ctx.letterSpacing = "0px";
  // Blitz-Schnitt und Ausblenden
  const flash = Math.max(0, 1 - Math.abs(t - CUT) / 0.08);
  if (flash > 0) { ctx.fillStyle = `rgba(0,0,0,${flash})`; ctx.fillRect(0, 0, W, H); }
  const out = ramp(t, 12.45, 12.9);
  if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${out * 0.85})`; ctx.fillRect(0, 0, W, H); }
};
window.exportEvents = function () {
  return { duration: DUR, cut: CUT, splash: [1.12, 7.12], walk: [[0, 1.0], [CUT, 7.0], [2.4, 3.2], [10.5, 11.0]], wipe: [3.2, 5.9],
    gasp: 1.25, laugh: [7.4, 8.85], jump: 9.0, flop: 9.48, wiggle: [9.6, 10.4], up: 10.5, hug: 11.0, laugh2: [11.4, 12.4] };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("700 15px Pix")]);
  return { duration: DUR };
};
