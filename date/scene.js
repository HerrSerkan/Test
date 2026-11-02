// "Ängstlich + Vermeidend beim ersten Date" – Canvas-Animation (eigene Zeichnung), ohne Sprecher.
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const TEXT_CX = 500, T_END = 13.6;
const SC = [430, 1260];                // Szene (Bildschirm-y)
const TY = 1030;                       // Tischkante
const AX = 300, VX = 700;              // ängstlich / vermeidend
const WIN = { x: 770, y: 470, w: 150, h: 190 };
const PINK = "#f39ab4", BLUE = "#7fa8e8", GOLD = "#ffcf6a";
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let TL = null;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeBack = x => { const c = 1.7; x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function glowAt(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

// ------------------------------------------------------------------ Zeitplan
const T = {
  nice: 1.3, dream: 2.3, ring: 2.75, house: 3.15, kids: 3.55, dog: 3.95, ask: 4.6,
  sweat: 5.1, exit: 5.35, flee: 6.6, gone: 7.25, story: 8.0, secure1: 8.4, secure2: 9.25,
  which: 9.6, back: 10.3, hey: 11.0, hearts: 11.3,
};

// ------------------------------------------------------------------ Raum
function room(t) {
  const [y0, y1] = SC;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "#3a1520"); g.addColorStop(0.55, "#4a1b27"); g.addColorStop(1, "#2a0f16");
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
  // Holzvertäfelung unten
  ctx.fillStyle = "#2d1410"; ctx.fillRect(0, 860, W, y1 - 860);
  ctx.fillStyle = "rgba(255,200,150,0.06)"; ctx.fillRect(0, 860, W, 6);
  for (let x = 40; x < W; x += 120) { ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x, 870, 4, y1 - 870); }
  // Bilder an der Wand
  for (const [x, y, w, h, c] of [[90, 520, 120, 100, "#2f4a3a"], [230, 540, 70, 90, "#5a4630"]]) {
    ctx.fillStyle = "#8a6a3a"; rr(x - 8, y - 8, w + 16, h + 16, 4); ctx.fill();
    ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.5, y + h * 0.4); ctx.lineTo(x + w, y + h); ctx.fill();
  }
  // Fenster mit Mond und Vorhang
  const { x, y, w, h } = WIN;
  ctx.fillStyle = "#0e1630"; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 14; i++) { ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(x + (i * 53) % w, y + (i * 37) % h, 2, 2); }
  ctx.fillStyle = "#f6f0d0"; ctx.beginPath(); ctx.arc(x + w - 40, y + 44, 16, 0, 7); ctx.fill();
  ctx.fillStyle = "#0e1630"; ctx.beginPath(); ctx.arc(x + w - 33, y + 39, 14, 0, 7); ctx.fill();
  ctx.strokeStyle = "#2a1a14"; ctx.lineWidth = 8; ctx.strokeRect(x, y, w, h);
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  ctx.fillStyle = "#7a1828";
  ctx.beginPath(); ctx.moveTo(x - 30, y - 20); ctx.quadraticCurveTo(x + 10, y + h / 2, x - 20, y + h + 20); ctx.lineTo(x - 40, y + h + 20); ctx.lineTo(x - 40, y - 20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w + 30, y - 20); ctx.quadraticCurveTo(x + w - 10, y + h / 2, x + w + 20, y + h + 20); ctx.lineTo(x + w + 40, y + h + 20); ctx.lineTo(x + w + 40, y - 20); ctx.fill();
  // Lampen
  for (const lx of [250, 540, 830]) {
    ctx.strokeStyle = "#1a0a0e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, y0); ctx.lineTo(lx, y0 + 40); ctx.stroke();
    glowAt(lx, y0 + 52, 220, "255,200,130", 0.25);
    ctx.fillStyle = "#2b1a12"; ctx.beginPath(); ctx.ellipse(lx, y0 + 46, 40, 12, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "rgba(255,220,160,0.9)"; ctx.beginPath(); ctx.ellipse(lx, y0 + 47, 34, 5, 0, 0, 7); ctx.fill();
  }
}

// ------------------------------------------------------------------ Figuren (Kapsel-Körper + Kopf)
function chip(x, y, txt, col, a = 1) {
  ctx.globalAlpha = a;
  ctx.font = "800 18px InterBlk"; ctx.letterSpacing = "1.5px";
  const w = ctx.measureText(txt).width + 22;
  ctx.fillStyle = col; rr(x - w / 2, y - 22, w, 30, 15); ctx.fill();
  ctx.fillStyle = "#1a1016"; ctx.fillText(txt, x - w / 2 + 11, y - 1);
  ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
}

// sitzende Figur, Kopfmitte bei (x, hy); o = {col, mood, blush, sweat, tear, look, wave, s}
function person(x, hy, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(x, hy); ctx.scale(s, s);
  // Stuhllehne
  if (o.chair !== false) { ctx.fillStyle = "#3a1d12"; rr(-58, 10, 116, 160, 14); ctx.fill(); }
  // Körper
  ctx.fillStyle = o.col; rr(-48, 34, 96, 140, 40); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.1)"; rr(-48, 110, 96, 64, [0, 0, 40, 40]); ctx.fill();
  // Arm (Winken)
  if (o.wave > 0) {
    const w = Math.sin(o.wt * 14) * 0.35;
    ctx.save(); ctx.translate(38, 60); ctx.rotate(-1.9 + w);
    ctx.fillStyle = o.col; rr(-12, -8, 24, 92, 12); ctx.fill(); ctx.restore();
  }
  // Kopf
  ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.arc(-15, -17, 14, 0, 7); ctx.fill();
  const lk = (o.look || 0) * 8;
  const mood = o.mood || 0;            // 1 froh, 0 neutral, -1 traurig, 2 verliebt (Augen zu)
  ctx.fillStyle = "#24161c"; ctx.strokeStyle = "#24161c"; ctx.lineWidth = 4; ctx.lineCap = "round";
  if (mood === 2) {
    for (const dx of [-15, 15]) { ctx.beginPath(); ctx.arc(dx + lk, -2, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  } else {
    for (const dx of [-15, 15]) { ctx.beginPath(); ctx.arc(dx + lk, -4, 5.5, 0, 7); ctx.fill(); }
    if (mood < 0) {                    // Brauen traurig
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-24 + lk, -18); ctx.lineTo(-8 + lk, -14); ctx.moveTo(24 + lk, -18); ctx.lineTo(8 + lk, -14); ctx.stroke();
      ctx.lineWidth = 4;
    }
  }
  const m = mood === 2 ? 1.2 : mood;
  ctx.beginPath(); ctx.moveTo(-12 + lk, 18 - m * 2); ctx.quadraticCurveTo(lk, 18 + m * 9, 12 + lk, 18 - m * 2); ctx.stroke();
  if (o.blush > 0) {
    ctx.fillStyle = `rgba(255,90,120,${0.55 * o.blush})`;
    ctx.beginPath(); ctx.ellipse(-26, 12, 10, 6, 0, 0, 7); ctx.ellipse(26, 12, 10, 6, 0, 0, 7); ctx.fill();
  }
  if (o.sweat > 0) {
    ctx.globalAlpha = o.sweat; ctx.fillStyle = "#bfe3ff";
    for (const [dx, ph] of [[44, 0], [-46, 0.5]]) {
      const p = (o.wt * 1.4 + ph) % 1;
      ctx.beginPath(); ctx.moveTo(dx, -26 + p * 30); ctx.quadraticCurveTo(dx + 8, -12 + p * 30, dx, -8 + p * 30); ctx.quadraticCurveTo(dx - 8, -12 + p * 30, dx, -26 + p * 30); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (o.tear > 0) {
    ctx.globalAlpha = o.tear; ctx.fillStyle = "#bfe3ff";
    const p = (o.wt * 0.8) % 1;
    ctx.beginPath(); ctx.ellipse(-15 + lk, 6 + p * 26, 4, 6, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function table(t) {
  // runder Tisch mit Tischdecke
  const cx = 500;
  ctx.fillStyle = "#8e1a2a";
  ctx.beginPath(); ctx.moveTo(cx - 360, TY); ctx.lineTo(cx + 360, TY); ctx.lineTo(cx + 390, SC[1]); ctx.lineTo(cx - 390, SC[1]); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 100, TY + 20); ctx.lineTo(cx + i * 112, SC[1]); ctx.lineTo(cx + i * 112 + 18, SC[1]); ctx.lineTo(cx + i * 100 + 12, TY + 20); ctx.fill(); }
  ctx.fillStyle = "#a82236"; ctx.beginPath(); ctx.ellipse(cx, TY, 360, 46, 0, 0, 7); ctx.fill();
  // Teller, Gläser, Kerze
  for (const px of [cx - 200, cx + 200]) {
    ctx.fillStyle = "#f2ece2"; ctx.beginPath(); ctx.ellipse(px, TY - 2, 62, 14, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#e0d8ca"; ctx.beginPath(); ctx.ellipse(px, TY - 2, 38, 8, 0, 0, 7); ctx.fill();
  }
  for (const gx of [cx - 90, cx + 90]) {
    ctx.strokeStyle = "rgba(240,240,255,0.8)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(gx - 13, TY - 66); ctx.quadraticCurveTo(gx - 13, TY - 34, gx, TY - 32); ctx.quadraticCurveTo(gx + 13, TY - 34, gx + 13, TY - 66); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, TY - 32); ctx.lineTo(gx, TY - 6); ctx.moveTo(gx - 10, TY - 6); ctx.lineTo(gx + 10, TY - 6); ctx.stroke();
    ctx.fillStyle = "rgba(160,20,40,0.85)"; ctx.beginPath(); ctx.moveTo(gx - 12, TY - 52); ctx.quadraticCurveTo(gx, TY - 30, gx + 12, TY - 52); ctx.fill();
  }
  ctx.fillStyle = "#f3ead8"; ctx.fillRect(cx - 7, TY - 60, 14, 56);
  const f = 1 + Math.sin(t * 13) * 0.08;
  glowAt(cx, TY - 72, 120, "255,170,80", 0.45);
  ctx.fillStyle = "#ffd070"; ctx.beginPath(); ctx.ellipse(cx, TY - 72, 7 * f, 15 * f, 0, 0, 7); ctx.fill();
}

// Paar im Hintergrund (klein)
function securePair(t) {
  const y = 790, x = 500;
  ctx.fillStyle = "#5a2018"; rr(x - 70, y + 52, 140, 12, 4); ctx.fill();
  ctx.fillStyle = "#3a140e"; ctx.fillRect(x - 6, y + 64, 12, 60);
  const nod = t > T.secure2 && t < T.secure2 + 0.8 ? Math.sin((t - T.secure2) * 16) * 3 : 0;
  person(x - 48, y, { col: "#6fcf97", mood: 1, s: 0.42, chair: false });
  person(x + 48, y + nod, { col: "#f2c14e", mood: 1, s: 0.42, chair: false });
  ctx.fillStyle = "#f3ead8"; ctx.fillRect(x - 3, y + 36, 6, 16);
  glowAt(x, y + 32, 40, "255,170,80", 0.4);
  chip(x, y - 40, "SICHER", "#6fcf97", 0.9);
}

// ------------------------------------------------------------------ Blasen
function speech(x, y, txt, a, size = 30, tail = 0) {
  if (a <= 0) return;
  ctx.font = `700 ${size}px InterSB`;
  const w = ctx.measureText(txt).width + 36, h = size + 30;
  const s = easeBack(Math.min(1, a * 1.4));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, a * 2);
  ctx.fillStyle = "#fbf7f2"; rr(-w / 2, -h, w, h, h / 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tail - 10, -2); ctx.lineTo(tail + 14, -2); ctx.lineTo(tail + 2, 18); ctx.fill();
  ctx.fillStyle = "#24161c"; ctx.fillText(txt, -w / 2 + 18, -h / 2 + size * 0.36);
  ctx.restore(); ctx.globalAlpha = 1;
}

function cloudShape(x, y, s) {
  ctx.beginPath();
  for (const [dx, dy, r] of [[-110, 10, 62], [-50, -40, 74], [40, -46, 76], [110, 0, 64], [60, 50, 60], [-40, 52, 62], [0, 0, 80]]) {
    ctx.moveTo(x + (dx + r) * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7);
  }
  ctx.fill();
}

function thought(x, y, s, a, bubbleFrom, drawInside) {
  if (a <= 0 || s <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = "#fbf7f2";
  for (const [k, r] of [[0.25, 9], [0.5, 14]]) {
    ctx.beginPath(); ctx.arc(lerp(bubbleFrom[0], x, k), lerp(bubbleFrom[1], y + 80 * s, k), r, 0, 7); ctx.fill();
  }
  cloudShape(x, y, s);
  ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a; drawInside(); ctx.restore();
  ctx.globalAlpha = 1;
}

function pop(t, t0) { return easeBack(ramp(t, t0, t0 + 0.3)); }

function dreamIcons(t) {
  // Ring
  let p = pop(t, T.ring);
  if (p > 0) {
    ctx.save(); ctx.translate(-95, -20); ctx.scale(p, p);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 8, 24, 0, 7); ctx.stroke();
    ctx.fillStyle = "#9fe3ff"; ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(12, -16); ctx.lineTo(0, 0); ctx.fill();
    ctx.restore();
  }
  // Haus
  p = pop(t, T.house);
  if (p > 0) {
    ctx.save(); ctx.translate(-5, -28); ctx.scale(p, p);
    ctx.fillStyle = "#e9a46b"; ctx.fillRect(-30, -6, 60, 44);
    ctx.fillStyle = "#c8443f"; ctx.beginPath(); ctx.moveTo(-40, -4); ctx.lineTo(0, -38); ctx.lineTo(40, -4); ctx.fill();
    ctx.fillStyle = "#6b3b25"; ctx.fillRect(-8, 14, 16, 24);
    ctx.fillStyle = "#9fd3ff"; ctx.fillRect(14, 2, 12, 12);
    ctx.restore();
  }
  // Kinder
  p = pop(t, T.kids);
  if (p > 0) {
    ctx.save(); ctx.translate(-55, 40); ctx.scale(p, p);
    for (const [dx, c] of [[-14, "#f39ab4"], [14, "#7fa8e8"]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dx, -18, 10, 0, 7); ctx.fill(); rr(dx - 10, -6, 20, 28, 9); ctx.fill();
    }
    ctx.restore();
  }
  // Hund
  p = pop(t, T.dog);
  if (p > 0) {
    ctx.save(); ctx.translate(60, 40); ctx.scale(p, p);
    ctx.fillStyle = "#c28a4e";
    rr(-26, -10, 46, 22, 10); ctx.fill();
    ctx.beginPath(); ctx.arc(26, -14, 13, 0, 7); ctx.fill();
    ctx.fillRect(-22, 8, 7, 14); ctx.fillRect(8, 8, 7, 14);
    ctx.fillStyle = "#8a5a2e"; ctx.beginPath(); ctx.ellipse(32, -22, 5, 9, 0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = "#c28a4e"; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-26, -6); ctx.lineTo(-38, -18 + Math.sin(t * 20) * 4); ctx.stroke();
    ctx.restore();
  }
}

function exitSign(t) {
  const p = pop(t, T.exit + 0.1);
  if (p <= 0) return;
  ctx.save(); ctx.scale(p, p);
  const blink = Math.floor(t * 6) % 2 ? 1 : 0.85;
  ctx.globalAlpha *= blink;
  ctx.fillStyle = "#1f9d55"; rr(-120, -42, 240, 84, 10); ctx.fill();
  ctx.strokeStyle = "#e8fff0"; ctx.lineWidth = 4; rr(-112, -34, 224, 68, 7); ctx.stroke();
  // laufendes Männchen
  ctx.strokeStyle = "#fff"; ctx.fillStyle = "#fff"; ctx.lineWidth = 6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(-78, -18, 7, 0, 7); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-80, -8); ctx.lineTo(-86, 10);
  ctx.moveTo(-86, 10); ctx.lineTo(-96, 22); ctx.moveTo(-86, 10); ctx.lineTo(-74, 24);
  ctx.moveTo(-80, -6); ctx.lineTo(-94, 0); ctx.moveTo(-80, -6); ctx.lineTo(-66, 2);
  ctx.stroke();
  ctx.font = "900 34px InterBlk"; ctx.fillStyle = "#fff";
  ctx.fillText("AUSGANG", -54, 12);
  ctx.restore();
}

function smoke(x, y, t, t0) {
  const p = ramp(t, t0, t0 + 1.8);
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < 7; i++) {
    const a = (1 - p) * 0.8;
    const r = 30 + p * 50 + (i % 3) * 8;
    ctx.fillStyle = `rgba(200,195,205,${a})`;
    ctx.beginPath(); ctx.arc(x + Math.sin(i * 2.1) * 40 * (0.5 + p), y - p * 90 - i * 22, r * 0.7, 0, 7); ctx.fill();
  }
}

function hearts(x, y, t, t0) {
  for (let i = 0; i < 5; i++) {
    const p = ramp(t, t0 + i * 0.12, t0 + i * 0.12 + 1.5);
    if (p <= 0 || p >= 1) continue;
    const hx = x + Math.sin(i * 1.9) * 60, hy = y - p * 110;
    ctx.globalAlpha = Math.sin(Math.PI * p);
    ctx.fillStyle = "#ff5c8a";
    ctx.save(); ctx.translate(hx, hy); ctx.scale(1.2, 1.2);
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-14, -4, -8, -16, 0, -8); ctx.bezierCurveTo(8, -16, 14, -4, 0, 6); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Szene
function scene(t) {
  room(t);
  securePair(t);
  // Vermeidend: Position (flieht durchs Fenster, kommt zurück)
  let vx = VX, vy = 905, vs = 1, va = 1;
  const fl = ramp(t, T.flee, T.gone);
  if (t >= T.flee && t < T.back) {
    vx = lerp(VX, WIN.x + WIN.w / 2, easeIO(fl)); vy = lerp(905, WIN.y + 90, easeIO(fl)) - Math.sin(Math.PI * fl) * 120;
    vs = lerp(1, 0.4, fl); va = 1 - ramp(t, T.gone - 0.15, T.gone);
  }
  if (t >= T.back) {
    const p = easeOut(ramp(t, T.back, T.back + 0.6));
    vx = lerp(W + 120, VX, p); vy = 905;
  }
  const anxMood = t < T.ask ? (t > T.nice + 0.2 ? 2 : 1) : t < T.flee ? 0 : t < T.hearts ? -1 : 2;
  person(AX, 905, { col: PINK, mood: anxMood, blush: t > T.nice + 0.2 && t < T.flee ? 1 : t > T.hearts ? 1 : 0,
    tear: ramp(t, T.gone, T.gone + 0.3) * (1 - ramp(t, T.back, T.back + 0.3)), look: t > T.flee && t < T.back ? 1 : 0.3, wt: t });
  if (va > 0) {
    ctx.globalAlpha = va;
    const vMood = t < T.ask ? 1 : t < T.back ? -1 : 0;
    person(vx, vy, { col: BLUE, mood: vMood, s: vs, sweat: t > T.sweat && t < T.flee ? 1 : 0, look: t > T.ask && t < T.flee ? -0.6 : -0.3,
      wave: t > T.hey - 0.2 && t < T.hey + 1.6 ? 1 : 0, wt: t, chair: t < T.flee || t >= T.back });
    ctx.globalAlpha = 1;
  }
  if (t >= T.flee && t < T.back) { ctx.fillStyle = "#3a1d12"; rr(VX - 58, 915, 116, 160, 14); ctx.fill(); }  // leerer Stuhl
  table(t);
  smoke(VX, 960, t, T.flee + 0.05);
  // Namens-Chips
  chip(AX, 820, "ÄNGSTLICH", PINK);
  if (va > 0.5 || t >= T.back + 0.4) chip(t >= T.back ? VX : vx, 820, "VERMEIDEND", BLUE, t >= T.flee && t < T.back ? va : 1);
  // Blasen
  const bA = (t0, t1) => ramp(t, t0, t0 + 0.25) * (1 - ramp(t, t1 - 0.2, t1));
  speech(VX - 20, 768, "War echt ein schöner Abend.", bA(T.nice, T.dream + 0.2), 28, 60);
  const dS = easeOut(ramp(t, T.dream, T.dream + 0.4)), dA = 1 - ramp(t, T.ask - 0.15, T.ask + 0.1);
  thought(330, 640, 0.95 * dS, dA, [AX + 20, 790], () => dreamIcons(t));
  speech(AX - 30, 768, "Also … was sind wir jetzt?", bA(T.ask, T.flee), 28, 10);
  const eS = easeOut(ramp(t, T.exit, T.exit + 0.35)), eA = 1 - ramp(t, T.flee - 0.1, T.flee + 0.1);
  thought(640, 640, 0.85 * eS, eA, [VX - 10, 790], () => exitSign(t));
  speech(545, 716, "Selbe Zeit nächste Woche?", bA(T.secure1, T.secure2 + 1.0), 22, -40);
  speech(560, 716, "Gerne!", bA(T.secure2 + 1.05, T.which + 1.6), 22, 30);
  speech(VX + 10, 768, "…hey.", bA(T.hey, T_END), 30, -10);
  hearts(AX + 75, 880, t, T.hearts);
}

// ------------------------------------------------------------------ Titel / Unterzeile
function title(t) {
  const a = easeOut(ramp(t, 0.05, 0.4));
  ctx.globalAlpha = a;
  ctx.font = "900 60px InterBlk"; ctx.letterSpacing = "-1px";
  const parts = [["ÄNGSTLICH", PINK], [" + ", "#fff"], ["VERMEIDEND", BLUE]];
  const ws = parts.map(p => ctx.measureText(p[0]).width);
  let x = TEXT_CX - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, i) => { ctx.fillStyle = p[1]; ctx.fillText(p[0], x, 320); x += ws[i]; });
  // zweite Zeile wechselt
  const sw = easeIO(ramp(t, T.story, T.story + 0.4));
  for (const [txt, col, k] of [["BEIM ERSTEN DATE", "#fff", 1 - sw], ["EINE LIEBESGESCHICHTE.", GOLD, sw]]) {
    if (k <= 0) continue;
    ctx.globalAlpha = a * k;
    ctx.font = "900 50px InterBlk";
    const w = ctx.measureText(txt).width;
    ctx.fillStyle = col; ctx.fillText(txt, TEXT_CX - w / 2, 385 + (1 - k) * (txt === "BEIM ERSTEN DATE" ? -16 : 16));
  }
  ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
}

function bottomLine(t) {
  const a = easeOut(ramp(t, T.which, T.which + 0.35));
  if (a <= 0) return;
  ctx.globalAlpha = a;
  ctx.font = "700 46px InterSB";
  const s = "Welcher bist du?"; const w = ctx.measureText(s).width;
  ctx.fillStyle = "#fff"; ctx.fillText(s, TEXT_CX - w / 2, 1345 + (1 - a) * 14);
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#12070b"; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.beginPath(); ctx.rect(0, SC[0], W, SC[1] - SC[0]); ctx.clip();
  scene(t);
  ctx.restore();
  let g = ctx.createLinearGradient(0, SC[0] - 20, 0, SC[0] + 50);
  g.addColorStop(0, "#12070b"); g.addColorStop(1, "rgba(18,7,11,0)");
  ctx.fillStyle = g; ctx.fillRect(0, SC[0] - 20, W, 70);
  g = ctx.createLinearGradient(0, SC[1] - 60, 0, SC[1] + 2);
  g.addColorStop(0, "rgba(18,7,11,0)"); g.addColorStop(1, "#12070b");
  ctx.fillStyle = g; ctx.fillRect(0, SC[1] - 60, W, 62);
  title(t);
  bottomLine(t);
  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, T_END - 0.9, T_END - 0.1));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () { return { ...T, end: T_END }; };

window.setup = async function (timeline) {
  TL = timeline;
  await Promise.all([document.fonts.load("700 50px InterSB"), document.fonts.load("900 50px InterBlk")]);
  return true;
};
