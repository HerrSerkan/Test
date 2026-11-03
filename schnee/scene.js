// "Guter Freund / Bester Freund" – 1:1-Nachbau (deutsche Version, eigene Zeichnung), ohne Sprecher.
// Winterabend vor einem Fachwerkhaus: Er bricht einen Eiszapfen ab, eine Schneeplatte rutscht vom Dach und begräbt ihn.
// Der gute Freund gräbt ihn aus. Zurückspulen. Der beste Freund lacht – und stellt sich selbst unter die nächste Platte.
// Gezeichnet im Raster 576 x 1024 (Welt-Koordinaten mit Kamera) und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 16.6, GROUND = 850;
const cv = document.getElementById("c");
const out = cv.getContext("2d");
const buf = document.createElement("canvas");
buf.width = 1080; buf.height = 1920;
const ctx = buf.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => clamp(x) * clamp(x);
const lerp = (a, b, k) => a + (b - a) * k;
const rad = d => (d * Math.PI) / 180;
const dir = a => [Math.sin(rad(a)), Math.cos(rad(a))];
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
const OUT = "#2b2533";

// ---------------- Zeitplan ----------------
// Teil 1 (GUTER FREUND) 0 – 6.25, Zurückspulen 6.25 – 6.95, Teil 2 (BESTER FREUND) ab 7.0
const T = {
  grab1: 0.95, slide1: 1.6, hit1: 2.45, dig1: 2.75, rise1: 3.85, brush1: 4.35, happy1: 5.3,
  rw0: 6.25, rw1: 6.95, p2: 7.0,
  grab2: 7.35, slide2: 7.85, hit2: 8.55, laugh2: 8.7, think2: 10.0, walk2a: 10.3, walk2b: 11.6,
  arms2: 11.75, slide3: 12.0, hit3: 12.95, zoom2: 13.3, pop2: 14.0, laughEnd: 14.75,
};

// ---------------- Posen ----------------
// Winkel in Grad: 0 = nach unten, 90 = nach rechts, 180 = nach oben, -90 = nach links (absolut, je Segment)
const TORSO = 128, NECK = 10, R = 33, UA = 62, FA = 58, TH = 92, SH = 92;
const STAND_Y = GROUND - 18 - (TH + SH) * Math.cos(rad(5));
const BASE = { x: 0, y: STAND_Y, lean: 0, tilt: 0, aL: [-14, -6], aR: [14, 6], lL: [-5, -3], lR: [5, 3],
  look: 0, snow: 0, bob: 0, dig: 0, brush: 0, walk: 0, face: "smile", ice: false, foot: 1 };
const P = o => Object.assign({}, BASE, o);
function poseAt(K, t) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t < K[i][0]) {
    const a = K[i - 1][1], b = K[i][1], k = easeIO((t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
    const r = {};
    for (const f in a) {
      const va = a[f], vb = b[f];
      if (typeof va === "number") r[f] = lerp(va, vb, k);
      else if (Array.isArray(va)) r[f] = va.map((v, j) => lerp(v, vb[j], k));
      else r[f] = va;
    }
    return r;
  }
  return K[K.length - 1][1];
}
const AX = 230, BX = 420, CX2 = 482;
const BURIED_Y = 792, POP_Y = 655;
const reach = { aR: [170, 172], look: 0.2, tilt: 4 };
const trophy = { aR: [160, 178], face: "grin", lean: -3, look: 0.5, ice: true };
const shock = { face: "shock", look: 0.1, tilt: -10, aL: [-150, -168], aR: [150, 175], ice: true };
const buried = { y: BURIED_Y, aL: [-30, -10], aR: [175, 178], face: "shock", ice: true, tilt: 0, look: 0 };

function keysA(o) {   // o = Zeitversatz, g = Greifen, s = Platte, h = Treffer
  return (g, s, h) => [
    [0 + o, P({ x: AX, look: 0.5 })],
    [g - 0.4, P({ x: AX, look: 0.5 })],
    [g, P({ x: AX, ...reach })],
    [g + 0.18, P({ x: AX, ...reach, aR: [158, 150], ice: true, face: "grin" })],
    [g + 0.45, P({ x: AX, ...trophy })],
    [s + 0.3, P({ x: AX, ...trophy, look: 0.3 })],
    [s + 0.5, P({ x: AX, ...shock })],
    [h - 0.02, P({ x: AX, ...shock, y: STAND_Y + 8 })],
    [h, P({ x: AX, ...buried })],
  ];
}
const A1 = keysA(0)(T.grab1, T.slide1, T.hit1).concat([
  [T.rise1, P({ x: AX, ...buried, face: "squint", snow: 1 })],
  [T.brush1, P({ x: AX, y: STAND_Y, face: "squint", snow: 1, aR: [150, 176], aL: [-20, -10], ice: true, look: 0.4, tilt: 6 })],
  [T.happy1 - 0.15, P({ x: AX, y: STAND_Y, face: "squint", snow: 0.1, aR: [150, 176], aL: [-20, -10], ice: true, look: 0.4, tilt: 4 })],
  [T.happy1, P({ x: AX, face: "grin", aR: [158, 178], ice: true, look: 0.5, lean: -2 })],
  [6.25, P({ x: AX, face: "grin", aR: [160, 179], ice: true, look: 0.55, lean: -3, bob: 0.4 })],
]);
const B1 = [
  [0, P({ x: BX, look: -0.5, aR: [35, -35], foot: -1 })],
  [T.grab1 + 0.3, P({ x: BX, look: -0.5, aR: [35, -35], foot: -1 })],
  [T.grab1 + 0.45, P({ x: BX, look: -0.5, aR: [35, -35], foot: -1, face: "laugh", bob: 0.5 })],
  [T.slide1 + 0.35, P({ x: BX, look: -0.4, aR: [35, -35], foot: -1, face: "laugh" })],
  [T.slide1 + 0.55, P({ x: BX, look: -0.2, tilt: -10, aR: [40, -20], aL: [-60, -140], foot: -1, face: "shock" })],
  [T.hit1 + 0.08, P({ x: BX, look: -0.6, aR: [60, 10], aL: [-80, -150], foot: -1, face: "shock", lean: 4 })],
  [T.dig1, P({ x: BX - 30, look: -0.8, lean: -32, tilt: -8, aL: [-50, -20], aR: [-25, -5], lL: [-14, -4], lR: [14, 6], foot: -1, face: "grin" })],
  [T.rise1 - 0.1, P({ x: BX - 30, look: -0.8, lean: -32, tilt: -8, aL: [-50, -20], aR: [-25, -5], lL: [-14, -4], lR: [14, 6], foot: -1, face: "grin", dig: 1 })],
  [T.rise1, P({ x: BX - 40, look: -0.8, lean: -18, aL: [-80, -60], aR: [-60, -40], lL: [-14, -4], lR: [14, 6], foot: -1, face: "grin" })],
  [T.brush1, P({ x: BX - 45, look: -0.7, lean: -10, aL: [-140, -95], aR: [20, 10], foot: -1, face: "smile" })],
  [T.happy1 - 0.15, P({ x: BX - 45, look: -0.7, lean: -10, aL: [-140, -95], aR: [20, 10], foot: -1, face: "smile", brush: 1 })],
  [T.happy1, P({ x: BX - 30, look: -0.6, aR: [35, -35], aL: [-15, -6], foot: -1, face: "laugh" })],
  [6.25, P({ x: BX - 30, look: -0.6, aR: [35, -35], aL: [-15, -6], foot: -1, face: "laugh", bob: 0.4 })],
];
const A2 = keysA(T.p2)(T.grab2, T.slide2, T.hit2).concat([
  [T.pop2 - 0.05, P({ x: AX, ...buried })],
  [T.pop2 + 0.15, P({ x: AX, y: POP_Y, aR: [172, 178], aL: [-70, -20], ice: true, snow: 1, face: "annoyed", look: 0.3 })],
  [T.laughEnd, P({ x: AX, y: POP_Y, aR: [172, 178], aL: [-70, -20], ice: true, snow: 1, face: "annoyed", look: 0.5 })],
  [T.laughEnd + 0.15, P({ x: AX, y: POP_Y, aR: [168, 176], aL: [-70, -20], ice: true, snow: 1, face: "laugh", look: 0.5, bob: 1 })],
  [DUR, P({ x: AX, y: POP_Y, aR: [168, 176], aL: [-70, -20], ice: true, snow: 1, face: "laugh", look: 0.5, bob: 1 })],
]);
const cStand = { look: -0.5, aR: [35, -35], foot: -1 };
const C2 = [
  [T.p2, P({ x: BX, ...cStand })],
  [T.grab2 + 0.4, P({ x: BX, ...cStand, face: "grin" })],
  [T.slide2 + 0.3, P({ x: BX, ...cStand, face: "grin" })],
  [T.slide2 + 0.5, P({ x: BX, ...cStand, look: -0.2, tilt: -8, face: "smile" })],
  [T.laugh2, P({ x: BX, look: -0.6, lean: -14, tilt: -6, aL: [-95, -105], aR: [25, -40], lL: [-8, -3], lR: [6, 2], foot: -1, face: "laugh", bob: 1 })],
  [T.think2 - 0.1, P({ x: BX, look: -0.6, lean: -10, tilt: -6, aL: [-95, -100], aR: [25, -40], lL: [-8, -3], lR: [6, 2], foot: -1, face: "laugh", bob: 1 })],
  [T.think2 + 0.2, P({ x: BX, look: 0.3, tilt: 12, aR: [140, -160], aL: [-15, -6], foot: 1, face: "calm" })],
  [T.walk2a, P({ x: BX, look: 0.6, aR: [10, 5], aL: [-10, -5], foot: 1, face: "grin" })],
  [T.walk2b, P({ x: CX2, look: 0.6, aR: [10, 5], aL: [-10, -5], foot: 1, face: "grin", walk: 1 })],
  [T.arms2, P({ x: CX2, look: 0, tilt: -6, aR: [150, 160], aL: [-150, -160], foot: 1, face: "laugh" })],
  [T.hit3 - 0.05, P({ x: CX2, look: 0, tilt: -10, aR: [158, 170], aL: [-158, -170], foot: 1, face: "laugh", bob: 0.3 })],
  [T.hit3, P({ x: CX2, y: BURIED_Y, aR: [160, 170], aL: [-160, -170], face: "laugh" })],
  [T.pop2 + 0.05, P({ x: CX2, y: BURIED_Y, aR: [160, 170], aL: [-160, -170], face: "laugh" })],
  [T.pop2 + 0.25, P({ x: CX2, y: POP_Y, aL: [-110, -150], aR: [110, 160], snow: 1, face: "annoyed", look: -0.3 })],
  [T.laughEnd, P({ x: CX2, y: POP_Y, aL: [-110, -150], aR: [110, 160], snow: 1, face: "annoyed", look: -0.5 })],
  [T.laughEnd + 0.15, P({ x: CX2, y: POP_Y, aL: [-105, -140], aR: [110, 160], snow: 1, face: "laugh", look: -0.5, bob: 1 })],
  [DUR, P({ x: CX2, y: POP_Y, aL: [-105, -140], aR: [110, 160], snow: 1, face: "laugh", look: -0.5, bob: 1 })],
];
// Kamera: [t, Mitte x, Mitte y, Zoom]
const CAM1 = [[0, 288, 512, 1.1], [0.45, 288, 512, 1], [T.slide1, 288, 512, 1], [T.slide1 + 0.45, 278, 430, 1], [T.hit1 - 0.1, 278, 440, 1],
  [T.hit1 + 0.2, 288, 520, 1], [T.happy1, 300, 520, 1.03], [6.25, 300, 520, 1.05]];
const CAM2 = [[T.p2, 288, 512, 1], [T.slide2, 288, 512, 1], [T.slide2 + 0.4, 278, 430, 1], [T.hit2 - 0.1, 278, 440, 1], [T.hit2 + 0.2, 288, 515, 1],
  [T.walk2a, 300, 515, 1], [T.walk2b, 385, 512, 1], [T.slide3 + 0.2, 390, 440, 1], [T.hit3 - 0.15, 390, 445, 1], [T.hit3 + 0.25, 390, 520, 1],
  [T.zoom2, 390, 520, 1], [T.zoom2 + 0.6, 356, 548, 0.9], [DUR, 356, 545, 0.95]];
function cam(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}
// Schneeplatten: x, Rutschbeginn, Treffer, Zielhöhe (Kopf)
const SLABS1 = [{ x: AX, s: T.slide1, h: T.hit1, y: 470 }];
const SLABS2 = [{ x: AX, s: T.slide2, h: T.hit2, y: 470 }, { x: CX2, s: T.slide3, h: T.hit3, y: 440 }];

// ---------------- Hintergrund ----------------
const R0 = rng(7);
const ICICLES = []; for (let x = -380; x < 1000; x += 16 + R0() * 14) ICICLES.push([x, 8 + R0() * 34, 5 + R0() * 4]);
const PATCHES = []; for (let i = 0; i < 46; i++) PATCHES.push([-400 + R0() * 1400, -250 + R0() * 520, 20 + R0() * 50, 8 + R0() * 16]);
const FLAKES = []; for (let i = 0; i < 80; i++) FLAKES.push([R0() * W, R0() * H, 0.8 + R0() * 1.8, 18 + R0() * 30, R0() * 6]);
const GRAB_X = 249;

function house(tl, slabs, grabT) {
  // Himmel + Dach
  ctx.fillStyle = "#262840"; ctx.fillRect(-500, -700, 1600, 1060);
  ctx.fillStyle = "#6c3337"; ctx.fillRect(-500, -260, 1600, 560);
  ctx.strokeStyle = "#4e2125"; ctx.lineWidth = 2.5;
  for (let y = -250, r = 0; y < 300; y += 22, r++) {
    ctx.beginPath(); ctx.moveTo(-500, y); ctx.lineTo(1100, y); ctx.stroke();
    for (let x = -500 + (r % 2) * 18; x < 1100; x += 36) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); }
  }
  ctx.fillStyle = "#a9a5c3";
  for (const [x, y, w, h] of PATCHES) { ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + w * 0.6, y + h * 0.5, w * 0.5, h * 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
  // Schneekante am Dachrand
  const g = ctx.createLinearGradient(0, 284, 0, 342);
  g.addColorStop(0, "#d3d1e4"); g.addColorStop(0.5, "#b4b1cc"); g.addColorStop(1, "#8f8bab");
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-500, 286, 1600, 56, 18); ctx.fill();
  for (const s of slabs) if (tl > s.s + 0.05) {         // Lücke, wo die Platte fehlt
    ctx.fillStyle = "#5a272b"; ctx.beginPath(); ctx.roundRect(s.x - 72, 290, 144, 50, 10); ctx.fill();
  }
  // Wand
  const wg = ctx.createLinearGradient(0, 345, 0, 770);
  wg.addColorStop(0, "#8d879f"); wg.addColorStop(0.25, "#b7adb9"); wg.addColorStop(1, "#c3b8c0");
  ctx.fillStyle = wg; ctx.fillRect(-500, 345, 1600, 430);
  // Fachwerk
  ctx.strokeStyle = "#4a3230"; ctx.lineCap = "butt"; ctx.lineWidth = 16;
  const beam = (a, b, c, d) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); };
  beam(-500, 398, 1100, 398); beam(-500, 762, 1100, 762);
  for (const x of [-60, 150, 385, 640, 860]) beam(x, 398, x, 770);
  beam(150, 700, 330, 398); beam(205, 398, 385, 700); beam(-60, 640, -260, 398);
  beam(640, 398, 860, 762); beam(860, 398, 640, 762);
  // Sockel
  ctx.fillStyle = "#86839a"; ctx.fillRect(-500, 770, 1600, 80);
  ctx.strokeStyle = "#6c6982"; ctx.lineWidth = 2;
  for (let y = 770, r = 0; y < 850; y += 27, r++) {
    beam(-500, y, 1100, y);
    for (let x = -500 + (r % 2) * 30; x < 1100; x += 60) beam(x, y, x, y + 27);
  }
  // Fenster
  ctx.fillStyle = "#4a3230"; ctx.fillRect(-36, 462, 176, 200);
  const fg = ctx.createRadialGradient(52, 560, 10, 52, 560, 120);
  fg.addColorStop(0, "#fff1c4"); fg.addColorStop(1, "#f0b860");
  ctx.fillStyle = fg; ctx.fillRect(-26, 472, 156, 180);
  ctx.fillStyle = "#b5443e";
  for (const [x0, s] of [[-26, 1], [130, -1]]) {
    ctx.beginPath(); ctx.moveTo(x0, 472); ctx.lineTo(x0 + s * 48, 472); ctx.quadraticCurveTo(x0 + s * 16, 560, x0 + s * 40, 652); ctx.lineTo(x0, 652); ctx.fill();
  }
  ctx.strokeStyle = "rgba(90,20,20,0.5)"; ctx.lineWidth = 2;
  for (const x of [-12, 2, 116, 102]) beam(x, 476, x + (x < 50 ? 6 : -6), 648);
  ctx.fillStyle = "#4a3230"; ctx.fillRect(-40, 654, 184, 12);
  ctx.fillStyle = "#e3e1ef"; ctx.beginPath(); ctx.roundRect(-42, 648, 188, 10, 5); ctx.fill();
  glow(52, 560, 170, "rgba(255,200,110,1)", 0.25);
  // Fallrohr
  ctx.fillStyle = "#a6a7b6"; ctx.strokeStyle = "#6e6c82"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(642, 350, 14, 500, 4); ctx.fill(); ctx.stroke();
  // Tür
  ctx.fillStyle = "#4a3230"; ctx.fillRect(390, 410, 226, 440);
  ctx.fillStyle = "#2e594c"; ctx.fillRect(402, 422, 202, 428);
  ctx.strokeStyle = "#22463a"; ctx.lineWidth = 3;
  for (let x = 427; x < 604; x += 25) beam(x, 422, x, 850);
  ctx.fillStyle = "#ffe6a2";
  ctx.beginPath(); ctx.moveTo(462, 560); ctx.lineTo(462, 505); ctx.arc(503, 505, 41, Math.PI, 0); ctx.lineTo(544, 560); ctx.fill();
  ctx.strokeStyle = "#2e594c"; ctx.lineWidth = 4; beam(503, 464, 503, 560); beam(462, 520, 544, 520);
  glow(503, 520, 110, "rgba(255,210,120,1)", 0.25);
  ctx.strokeStyle = "#2c7238"; ctx.lineWidth = 11; ctx.beginPath(); ctx.arc(503, 622, 25, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#3f8f4a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(503, 622, 25, 0.3, 2.6); ctx.stroke();
  for (let k = 0; k < 7; k++) circle(503 + 25 * Math.cos(k * 0.9 + 0.4), 622 + 25 * Math.sin(k * 0.9 + 0.4), 3.4, "#d2353a");
  ctx.fillStyle = "#c7303a"; ctx.beginPath(); ctx.moveTo(503, 646); ctx.lineTo(489, 638); ctx.lineTo(489, 656); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(503, 646); ctx.lineTo(517, 638); ctx.lineTo(517, 656); ctx.closePath(); ctx.fill();
  circle(420, 660, 5, "#c9a548");
  // Laterne
  ctx.strokeStyle = "#2f2a34"; ctx.lineWidth = 5; beam(386, 432, 368, 432);
  ctx.fillStyle = "#2f2a34"; ctx.beginPath(); ctx.moveTo(352, 432); ctx.lineTo(384, 432); ctx.lineTo(368, 414); ctx.fill();
  ctx.fillStyle = "#e9e7f2"; ctx.beginPath(); ctx.ellipse(368, 416, 14, 6, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#2f2a34"; ctx.fillRect(353, 432, 30, 44);
  ctx.fillStyle = "#ffd77c"; ctx.fillRect(357, 436, 22, 36);
  glow(368, 455, 140, "rgba(255,200,110,1)", 0.45);
  // Schaufel
  ctx.strokeStyle = "#7a4a2b"; ctx.lineWidth = 6; ctx.lineCap = "round"; beam(128, 600, 100, 790);
  ctx.save(); ctx.translate(98, 812); ctx.rotate(rad(8));
  ctx.fillStyle = "#c8302d"; ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-30, -22, 60, 58, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#eee"; ctx.fillRect(-30, 30, 60, 6); ctx.restore();
  // Dachrinne, Lichterkette, Eiszapfen
  ctx.fillStyle = "#b9bac8"; ctx.strokeStyle = "#6e6c82"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-500, 338, 1600, 14, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e0e8f5"; ctx.strokeStyle = "#8b97b0"; ctx.lineWidth = 1.2;
  for (const [x, l, w] of ICICLES) { if (Math.abs(x - GRAB_X) < 14) continue;
    ctx.beginPath(); ctx.moveTo(x - w / 2, 351); ctx.lineTo(x + w / 2, 351); ctx.lineTo(x, 351 + l); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (tl < grabT) icicle(GRAB_X, 351, GRAB_X, 414, 9);
  ctx.strokeStyle = "#3a3540"; ctx.lineWidth = 1.5;
  for (let x = -480; x < 1000; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 356); ctx.quadraticCurveTo(x + 32, 372, x + 64, 356); ctx.stroke();
    for (let k = 1; k < 4; k++) {
      const u = k / 4, bx = x + 64 * u, by = 356 + 16 * 2 * u * (1 - u) + 4;
      glow(bx, by, 10, "rgba(255,210,120,1)", 0.6); circle(bx, by, 2.6, "#ffe39a");
    }
  }
  // Boden
  const bg = ctx.createLinearGradient(0, 850, 0, 1150);
  bg.addColorStop(0, "#c8c3d9"); bg.addColorStop(1, "#8f8aab");
  ctx.fillStyle = bg; ctx.fillRect(-500, 846, 1600, 400);
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(-500, 846, 1600, 4);
}
function icicle(x0, y0, x1, y1, w) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  ctx.fillStyle = "#e6eef9"; ctx.strokeStyle = "#7f8ba6"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x0 + nx, y0 + ny); ctx.lineTo(x1, y1); ctx.lineTo(x0 - nx, y0 - ny); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0 + nx * 0.4, y0 + ny * 0.4); ctx.lineTo(lerp(x0, x1, 0.7), lerp(y0, y1, 0.7)); ctx.stroke();
}

// ---------------- Figuren ----------------
const LOOKS = {
  A: { body: "#fbfbfd", scarf: ["#cc3438", "#f4f1f1"], hat: true },
  B: { body: "#b3b6c3", scarf: ["#4c5b77", "#a0abc2"], hat: false },
  C: { body: "#fbfbfd", scarf: ["#e3a62b", "#8d5b1f"], hat: false },
};
function limb(pts, col) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (const [c, w] of [[OUT, 15], [col, 10.5]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
  }
}
const add = (p, a, l) => { const d = dir(a); return [p[0] + d[0] * l, p[1] + d[1] * l]; };
function figure(p, who, t) {
  const L = LOOKS[who];
  const bob = p.bob * Math.abs(Math.sin(t * 13)) * -6;
  const hip = [p.x, p.y + bob];
  const up = 180 + p.lean;
  const neck = add(hip, up, TORSO);
  const head = add(neck, up + p.tilt, NECK + R);
  const sh = add(neck, up, -9);
  const w = p.walk * Math.sin(t * 2 * Math.PI * 1.9);
  const dg = p.dig * Math.sin(t * 22), br = p.brush * Math.sin(t * 18);
  const aL = [p.aL[0] - w * 18 + dg * 25 + br * 22, p.aL[1] - w * 14 + dg * 40 + br * 30];
  const aR = [p.aR[0] + w * 18 - dg * 25, p.aR[1] + w * 14 - dg * 40];
  const lL = [p.lL[0] + w * 22, p.lL[1] + w * 22 - Math.max(0, w) * 25];
  const lR = [p.lR[0] - w * 22, p.lR[1] - w * 22 + Math.max(0, -w) * -25];
  ctx.save();
  // Schatten
  if (p.y < STAND_Y + 30) { ctx.fillStyle = "rgba(40,35,70,0.22)"; ctx.beginPath(); ctx.ellipse(p.x, GROUND + 4, 55, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  for (const [l, off] of [[lL, -6], [lR, 6]]) {
    const h0 = [hip[0] + off * 0.5, hip[1]];
    let knee = add(h0, l[0], TH), foot = add(knee, l[1], SH);
    if (p.y > STAND_Y + 2 && p.walk < 0.01) {            // Hocke: Fuß bleibt am Boden, Knie knickt ein
      foot = [h0[0] + off * 3, GROUND - 18];
      const dx = foot[0] - h0[0], dy = foot[1] - h0[1], d = Math.min(Math.hypot(dx, dy), TH + SH - 0.01);
      const a = Math.acos(d / (2 * TH)), b = Math.atan2(dy, dx) - a * p.foot;
      knee = [h0[0] + Math.cos(b) * TH, h0[1] + Math.sin(b) * TH];
    }
    limb([h0, knee, foot], L.body);
    // Stiefel
    ctx.fillStyle = "#6b3e22"; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(foot[0] + p.foot * 7, foot[1] + 11, 15, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#6b3e22"; ctx.fillRect(foot[0] - 9, foot[1] - 2, 18, 12);
    ctx.beginPath(); ctx.moveTo(foot[0] - 9, foot[1] - 2); ctx.lineTo(foot[0] - 9, foot[1] + 8); ctx.moveTo(foot[0] + 9, foot[1] - 2); ctx.lineTo(foot[0] + 9, foot[1] + 8); ctx.stroke();
    ctx.fillStyle = "#e9e1d2"; ctx.beginPath(); ctx.ellipse(foot[0], foot[1] - 3, 12, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  limb([hip, neck], L.body);
  const arms = [];
  for (const [a, side] of [[aL, "L"], [aR, "R"]]) {
    const el = add(sh, a[0], UA), hand = add(el, a[1], FA);
    limb([sh, el, hand], L.body);
    arms.push([el, hand, a[1], side]);
  }
  // Eiszapfen in der rechten Hand
  if (p.ice) { const [, hand, a2] = arms[1]; const tip = add(hand, a2, 78); icicle(hand[0], hand[1], tip[0], tip[1], 13);
    circle(hand[0], hand[1], 7.5, OUT); circle(hand[0], hand[1], 5.5, L.body); }
  // Schal
  ctx.save(); ctx.translate(neck[0], neck[1] + 2); ctx.rotate(rad(p.lean));
  const [c1, c2] = L.scarf;
  ctx.fillStyle = c1; ctx.strokeStyle = OUT; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(4 * p.look - 3, 2, 15, 48, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c2; for (let y = 9; y < 46; y += 11) ctx.fillRect(4 * p.look - 2, y, 13, 5);
  ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect(-19, -8, 38, 16, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c2; for (let x = -13; x < 17; x += 10) ctx.fillRect(x, -7, 4, 14);
  ctx.restore();
  // Kopf
  const [hx, hy] = head;
  circle(hx, hy, R + 2.5, OUT); circle(hx, hy, R, L.body);
  if (L.hat) {
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(rad(p.lean + p.tilt));
    ctx.fillStyle = "#cf3236"; ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, -4, R + 2, Math.PI * 1.03, Math.PI * 1.97); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f4f2f2"; ctx.beginPath(); ctx.roundRect(-R - 3, -12, 2 * R + 6, 11, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f4f2f2"; ctx.fillRect(-22, -28, 44, 5);
    circle(0, -R - 6, 10, OUT); circle(0, -R - 6, 8, "#f4f2f2");
    ctx.restore();
  }
  face(hx + p.look * 9, hy + (L.hat ? 6 : 2), p.face, p.look);
  if (p.snow > 0.02) snowCap(hx, hy - (L.hat ? 40 : 24), p.snow * (L.hat ? 0.85 : 1), p.lean + p.tilt);
  ctx.restore();
}
function face(x, y, f, look) {
  ctx.strokeStyle = "#1d1a22"; ctx.fillStyle = "#1d1a22"; ctx.lineWidth = 3; ctx.lineCap = "round";
  const eyes = { smile: "dot", grin: "dot", laugh: "happy", shock: "wide", squint: "squeeze", calm: "closed", annoyed: "half" }[f];
  for (const s of [-1, 1]) {
    const ex = x + s * 9.5, ey = y - 6;
    ctx.beginPath();
    if (eyes === "dot") { ctx.ellipse(ex, ey, 3.2, 4.6, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (eyes === "wide") { ctx.ellipse(ex, ey - 1, 4.5, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (eyes === "happy") { ctx.arc(ex, ey + 2, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (eyes === "closed") { ctx.arc(ex, ey - 2, 5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    else if (eyes === "squeeze") { ctx.moveTo(ex - 4 * s, ey - 4); ctx.lineTo(ex + 3 * s, ey); ctx.lineTo(ex - 4 * s, ey + 4); ctx.stroke(); }
    else if (eyes === "half") { ctx.moveTo(ex - 5, ey - 2); ctx.lineTo(ex + 5, ey - 2); ctx.stroke(); ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI); ctx.fill(); }
  }
  const mx = x + look * 3, my = y + 9;
  const mouth = (w, h) => {
    ctx.fillStyle = "#4b1a22"; ctx.beginPath(); ctx.moveTo(mx - w, my); ctx.quadraticCurveTo(mx, my + h * 2, mx + w, my); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e66a78"; ctx.beginPath(); ctx.ellipse(mx, my + h * 0.75, w * 0.45, h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  };
  if (f === "smile") mouth(8, 7);
  else if (f === "grin") mouth(10, 9);
  else if (f === "laugh") mouth(12, 11);
  else if (f === "shock") { ctx.fillStyle = "#4b1a22"; ctx.beginPath(); ctx.ellipse(mx, my + 4, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (f === "squint") { ctx.beginPath(); ctx.moveTo(mx - 7, my + 3); ctx.lineTo(mx + 7, my + 3); ctx.stroke(); }
  else if (f === "calm") { ctx.beginPath(); ctx.arc(mx, my - 2, 7, 0.2, Math.PI - 0.2); ctx.stroke(); }
  else if (f === "annoyed") { ctx.beginPath(); ctx.moveTo(mx - 7, my + 4); ctx.lineTo(mx + 7, my + 2); ctx.stroke(); }
}
function snowCap(x, y, k, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rad(rot)); ctx.scale(k, k);
  const blobs = [[-22, 4, 13], [-8, -6, 16], [10, -5, 15], [24, 4, 12], [0, 6, 14], [-14, 8, 9], [16, 8, 9]];
  ctx.fillStyle = "#8c88aa"; for (const [bx, by, r] of blobs) { ctx.beginPath(); ctx.arc(bx, by, r + 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#f2f1f8"; for (const [bx, by, r] of blobs) { ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#d4d2e4"; for (const [bx, by, r] of blobs) { ctx.beginPath(); ctx.arc(bx + 2, by + r * 0.4, r * 0.55, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// ---------------- Schnee ----------------
const MOUNDS = [[0, -150, 120], [-100, -72, 86], [104, -78, 90], [-158, -26, 52], [162, -26, 56], [-60, -24, 62], [62, -22, 60],
  [-200, -9, 20], [-128, -6, 22], [132, -7, 24], [206, -9, 18], [18, -6, 22]];
function pile(x, h, sx = 1) {
  if (h <= 0.01) return;
  ctx.save(); ctx.translate(x, GROUND + 6); ctx.scale(sx * (0.55 + 0.45 * h), h);
  for (const [dx, dy, r] of MOUNDS) {
    const g = ctx.createLinearGradient(0, dy - r, 0, dy + r);
    g.addColorStop(0, "#bfbcd8"); g.addColorStop(0.55, "#8f8bb0"); g.addColorStop(1, "#6f6b92");
    ctx.fillStyle = g; ctx.strokeStyle = "#57536f"; ctx.lineWidth = 2 / h;
    ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.13)"; ctx.beginPath(); ctx.ellipse(dx - r * 0.25, dy - r * 0.45, r * 0.55, r * 0.3, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function slab(sl, tl) {
  if (tl < sl.s || tl > sl.h + 0.02) return;
  let y = 290, rot = 0, sc = 1;
  if (tl < sl.h - 0.28) { const k = easeOut(ramp(tl, sl.s, sl.h - 0.28)); y += k * 40; sc = 1 + k * 0.1; rot = k * 3; }
  else { const k = easeIn(ramp(tl, sl.h - 0.28, sl.h)); y = 330 + k * (sl.y - 300); sc = 1.1; rot = 3 - k * 3; }
  ctx.save(); ctx.translate(sl.x, y); ctx.rotate(rad(rot)); ctx.scale(sc, sc);
  ctx.fillStyle = "#c9c6dd"; ctx.strokeStyle = "#5f5b7c"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-74, -6, 148, 62, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#dedcec"; ctx.beginPath(); ctx.roundRect(-70, -6, 140, 18, 9); ctx.fill();
  ctx.fillStyle = "#9d99bb"; ctx.beginPath(); ctx.roundRect(-70, 40, 140, 14, 7); ctx.fill();
  ctx.restore();
  if (tl < sl.h - 0.28) for (let i = 0; i < 6; i++) {        // bröselnder Schnee
    const ph = (tl * 2.2 + i / 6) % 1;
    circle(sl.x - 60 + i * 24, 345 + ph * 160, 2.6 * (1 - ph), "rgba(240,240,250,0.9)");
  }
}
function burst(t0, x, y, tl, n, spread, seed, up = 1) {
  const dt = tl - t0; if (dt < 0 || dt > 1.4) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = (r() - 0.5) * spread, v = 160 + r() * 260, s = 2 + r() * 5;
    const px = x + Math.sin(a) * v * dt + (r() - 0.5) * 60, py = y - Math.cos(a) * v * dt * up + 520 * dt * dt;
    const al = clamp(1 - dt / (0.8 + r() * 0.6));
    if (al > 0) circle(px, py, s, `rgba(246,246,252,${al})`);
  }
}
function puff(t0, x, y, tl) {
  const dt = tl - t0; if (dt < 0 || dt > 0.9) return;
  const k = dt / 0.9;
  ctx.save(); ctx.globalAlpha = (1 - k) * 0.85;
  for (const [dx, dy, r] of [[0, 0, 70], [-60, 20, 55], [60, 15, 60], [-25, -40, 50], [30, -45, 48]])
  { const px = x + dx * (1 + k), py = y + dy * (1 + k) - k * 30, pr = r * (0.7 + k * 0.8);
    const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
    g.addColorStop(0, "rgba(240,240,248,0.95)"); g.addColorStop(0.6, "rgba(235,235,245,0.6)"); g.addColorStop(1, "rgba(235,235,245,0)");
    ctx.fillStyle = g; ctx.fillRect(px - pr, py - pr, 2 * pr, 2 * pr); }
  ctx.restore();
}

// ---------------- Szene ----------------
function world(tl, part) {
  const slabs = part === 1 ? SLABS1 : SLABS2;
  const [cx, cy, z] = cam(part === 1 ? CAM1 : CAM2, tl);
  let shx = 0, shy = 0;
  for (const s of slabs) { const d = tl - s.h; if (d > 0 && d < 0.35) { const a = (1 - d / 0.35) * 7; shx += Math.sin(d * 90) * a; shy += Math.cos(d * 77) * a; } }
  ctx.setTransform(S * z, 0, 0, S * z, S * (W / 2 - cx * z + shx), S * (H / 2 - cy * z + shy));
  house(tl, slabs, part === 1 ? T.grab1 : T.grab2);
  if (part === 1) {
    const dig = ramp(tl, T.rise1, T.brush1);
    figure(poseAt(A1, tl), "A", tl);
    if (tl >= T.hit1) pile(AX - 70 * easeIO(dig), lerp(Math.min(1, easeOut(ramp(tl, T.hit1, T.hit1 + 0.15))), 0.32, easeIO(dig)) * (1 - 0.1 * ramp(tl, T.dig1, T.rise1)));
    figure(poseAt(B1, tl), "B", tl);
    for (let k = 0, t0 = T.dig1 + 0.1; t0 < T.rise1; t0 += 0.11, k++) burst(t0, AX + 20, 640, tl, 5, 2.6, 100 + k);
    for (let k = 0, t0 = T.brush1; t0 < T.happy1 - 0.1; t0 += 0.12, k++) burst(t0, AX, 450, tl, 3, 2.2, 300 + k, 0.6);
  } else {
    figure(poseAt(A2, tl), "A", tl);
    if (tl >= T.hit2) pile(AX, Math.min(1, easeOut(ramp(tl, T.hit2, T.hit2 + 0.15))), 0.88);
    figure(poseAt(C2, tl), "C", tl);
    if (tl >= T.hit3) pile(CX2, Math.min(1, easeOut(ramp(tl, T.hit3, T.hit3 + 0.15))), 0.88);
    burst(T.pop2, AX, 560, tl, 18, 2.4, 400); burst(T.pop2 + 0.1, CX2, 560, tl, 18, 2.4, 401);
  }
  for (const s of slabs) { slab(s, tl); burst(s.h, s.x, s.y + 60, tl, 34, 3.4, 50 + s.x); puff(s.h, s.x, s.y + 70, tl); }
}
function title(text, y, a) {
  if (a <= 0) return;
  out.save(); out.globalAlpha = a;
  out.font = `900 ${50}px InterX`; out.letterSpacing = "9px"; out.textAlign = "center"; out.textBaseline = "middle";
  out.lineWidth = 9; out.strokeStyle = "rgba(30,28,45,0.55)"; out.lineJoin = "round";
  out.strokeText(text, 540, y); out.fillStyle = "#e4e3ec"; out.fillText(text, 540, y);
  out.fillStyle = "rgba(228,227,236,0.8)"; out.fillRect(520, y + 40, 40, 4);
  out.restore();
}
function rewindLabel(a) {
  out.save(); out.globalAlpha = a; out.fillStyle = "#f2f2f7"; out.strokeStyle = "rgba(30,28,45,0.5)"; out.lineWidth = 6;
  for (const dx of [-30, 2]) { out.beginPath(); out.moveTo(540 + dx + 28, 248); out.lineTo(540 + dx, 272); out.lineTo(540 + dx + 28, 296); out.closePath(); out.stroke(); out.fill(); }
  out.font = "900 30px InterX"; out.letterSpacing = "6px"; out.textAlign = "center"; out.textBaseline = "middle";
  out.strokeText("ZURÜCKSPULEN", 540, 340); out.fillText("ZURÜCKSPULEN", 540, 340);
  out.restore();
}

window.setup = async () => {
  await Promise.all(["900 50px InterX", "700 30px InterX"].map(f => document.fonts.load(f)));
  return { duration: DUR };
};
window.renderFrame = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const rw = t >= T.rw0 && t < T.p2;
  if (t < T.rw0) world(t, 1);
  else if (rw) world(lerp(6.2, 0.6, easeIO(ramp(t, T.rw0, T.rw1))), 1);
  else world(t, 2);
  // Schneefall (Bildschirm)
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const ft = rw ? 6.2 - (t - T.rw0) * 6 : t;
  for (const [x, y, r, v, ph] of FLAKES) {
    const yy = (((y + ft * v) % H) + H) % H, xx = (x + Math.sin(ft * 0.9 + ph) * 12 + W) % W;
    circle(xx, yy, r, "rgba(240,240,250,0.75)");
  }
  const fog = ctx.createLinearGradient(0, 0, 0, 260);
  fog.addColorStop(0, "rgba(120,118,150,0.35)"); fog.addColorStop(1, "rgba(120,118,150,0)");
  ctx.fillStyle = fog; ctx.fillRect(0, 0, W, 260);
  // auf das sichtbare Bild übertragen (beim Zurückspulen entsättigt und mit Störstreifen)
  out.setTransform(1, 0, 0, 1, 0, 0);
  if (rw || (t > T.rw0 - 0.08 && t < T.p2 + 0.1)) {
    const k = rw ? 1 : 0.5;
    out.filter = rw ? "saturate(0.25) brightness(1.15) contrast(0.85)" : "none";
    out.drawImage(buf, 0, 0);
    out.filter = "none";
    const r = rng(Math.floor(t * 30));
    for (let i = 0; i < 9 * k; i++) {
      const y = r() * 1920, h = 10 + r() * 60, dx = (r() - 0.5) * 70;
      out.drawImage(buf, 0, y, 1080, h, dx, y, 1080, h);
      out.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.12})`; out.fillRect(0, y, 1080, 3);
    }
    if (rw) { out.fillStyle = "rgba(220,225,240,0.12)"; out.fillRect(0, 0, 1080, 1920); }
  } else out.drawImage(buf, 0, 0);
  if (t >= T.p2 && t < T.p2 + 0.18) { out.fillStyle = `rgba(255,255,255,${0.6 * (1 - ramp(t, T.p2, T.p2 + 0.18))})`; out.fillRect(0, 0, 1080, 1920); }
  // Titel
  const TY = 300;
  title("GUTER FREUND", TY, ramp(t, 0.2, 0.45) * (1 - ramp(t, T.rw0, T.rw0 + 0.1)));
  if (rw) rewindLabel(ramp(t, T.rw0, T.rw0 + 0.08) * (Math.floor(t * 6) % 2 ? 1 : 0.75));
  title("BESTER FREUND", TY, ramp(t, T.p2 + 0.05, T.p2 + 0.3));
};
window.exportEvents = () => ({
  duration: DUR, T,
  snaps: [T.grab1 + 0.15, T.grab2 + 0.15],
  slides: [[T.slide1, T.hit1], [T.slide2, T.hit2], [T.slide3, T.hit3]],
  hits: [T.hit1, T.hit2, T.hit3],
  steps: Array.from({ length: 5 }, (_, i) => T.walk2a + 0.1 + i * 0.26),
});
