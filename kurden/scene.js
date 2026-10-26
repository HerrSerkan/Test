// "Alle Nationalitäten erklärt: Kurden" – Canvas-Animation (deutsche Version).
// render.js: await window.setup(timeline) -> window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const SCX = 540, SCY = 660;            // Mitte der Szene (oben), Text darunter
const TEXT_TOP = 1165, TEXT_CX = 490, TEXT_W = 820;
const LIME = "#a8f03c", LIME_RGB = "168,240,60";
const CARD = "#363833", CARD2 = "#2c2e2a";
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

let TL = null, S = [], E = [], TOK = [];

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
// Startzeit eines Wortes in Satz si
function Wt(si, text, nth = 0) {
  const n = norm(text);
  const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) throw new Error("Wort nicht gefunden: " + si + " " + text);
  return hits[Math.min(nth, hits.length - 1)].s;
}
const pop = (t, t0, d = 0.35) => back(ramp(t, t0, t0 + d));
function glow(x, y, r, a, rgb = LIME_RGB) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function font(w, size, fam = "InterSB") { ctx.font = `${w} ${size}px ${fam}`; }
function textC(s, x, y) { ctx.textAlign = "center"; ctx.fillText(s, x, y); ctx.textAlign = "left"; }
// Pille mit Punkt: z.B. "• du"
function pill(x, y, txt, p, opts = {}) {
  if (p <= 0) return;
  const sc = back(p);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(p * 3);
  font(600, opts.size || 30);
  const dot = opts.dot !== false;
  const w = ctx.measureText(txt).width + (dot ? 64 : 44), h = (opts.size || 30) * 1.8;
  ctx.fillStyle = opts.bg || "#1f201d";
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = opts.stroke || "rgba(255,255,255,0.12)"; ctx.lineWidth = 2; ctx.stroke();
  if (dot) { ctx.fillStyle = opts.dotCol || LIME; ctx.beginPath(); ctx.arc(-w / 2 + 26, 0, 6, 0, 7); ctx.fill(); }
  ctx.fillStyle = opts.col || "#f2f3ee";
  ctx.fillText(txt, -w / 2 + (dot ? 42 : 22), (opts.size || 30) * 0.36);
  ctx.restore();
}

// ------------------------------------------------------------------ Flaggen & Grafiken
function flagKurd(x, y, w, h) {
  ctx.fillStyle = "#ed2024"; ctx.fillRect(x, y, w, h / 3);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(x, y + h / 3, w, h / 3);
  ctx.fillStyle = "#278e43"; ctx.fillRect(x, y + 2 * h / 3, w, h / 3 + 0.5);
  const cx = x + w / 2, cy = y + h / 2, r = h * 0.16;
  ctx.fillStyle = "#febd11";
  ctx.beginPath();
  for (let k = 0; k < 42; k++) { const a = k / 42 * Math.PI * 2, rr2 = k % 2 ? r : r * 1.55; ctx.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); }
  ctx.fill();
}
function flagTurk(x, y, w, h) {
  ctx.fillStyle = "#e30a17"; ctx.fillRect(x, y, w, h);
  const cx = x + w * 0.38, cy = y + h / 2, r = h * 0.25;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  ctx.fillStyle = "#e30a17"; ctx.beginPath(); ctx.arc(cx + r * 0.25, cy, r * 0.8, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath();
  const sx = cx + r * 1.0, sr = r * 0.4;
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5 + Math.PI / 2, q = k % 2 ? sr * 0.4 : sr; ctx.lineTo(sx + Math.cos(a) * q, cy + Math.sin(a) * q); }
  ctx.fill();
}
function flagAlb(x, y, w, h) {
  ctx.fillStyle = "#e41e20"; ctx.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h / 2, s = h / 100;
  ctx.fillStyle = "#111";
  ctx.beginPath();          // stilisierter Doppeladler
  ctx.moveTo(cx, cy - 30 * s);
  ctx.lineTo(cx - 10 * s, cy - 18 * s); ctx.lineTo(cx - 42 * s, cy - 30 * s); ctx.lineTo(cx - 34 * s, cy - 8 * s);
  ctx.lineTo(cx - 44 * s, cy - 2 * s); ctx.lineTo(cx - 28 * s, cy + 8 * s); ctx.lineTo(cx - 34 * s, cy + 18 * s);
  ctx.lineTo(cx - 12 * s, cy + 14 * s); ctx.lineTo(cx - 8 * s, cy + 36 * s); ctx.lineTo(cx, cy + 26 * s);
  ctx.lineTo(cx + 8 * s, cy + 36 * s); ctx.lineTo(cx + 12 * s, cy + 14 * s); ctx.lineTo(cx + 34 * s, cy + 18 * s);
  ctx.lineTo(cx + 28 * s, cy + 8 * s); ctx.lineTo(cx + 44 * s, cy - 2 * s); ctx.lineTo(cx + 34 * s, cy - 8 * s);
  ctx.lineTo(cx + 42 * s, cy - 30 * s); ctx.lineTo(cx + 10 * s, cy - 18 * s);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 14 * s, cy - 32 * s, 7 * s, 0, 7); ctx.arc(cx + 14 * s, cy - 32 * s, 7 * s, 0, 7); ctx.fill();
}
const AFRICA = [[-17, 21], [-10, 35], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [20, -35], [15, -27], [12, -5], [9, 4], [-8, 4], [-17, 14]];
function africa(x, y, s) {
  ctx.fillStyle = "#86d63a";
  ctx.beginPath();
  for (const [lo, la] of AFRICA) ctx.lineTo(x + lo * s, y - la * s);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 47 * s, y + 20 * s, 3 * s, 8 * s, 0.3, 0, 7); ctx.fill();
}
// Radiergummi (der Mitschüler)
function eraser(x, y, s = 1, rot = -0.12, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(6, 36, 92, 14, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#c9cbcc"; rr(-90, -10, 180, 44, 14); ctx.fill();
  const g = ctx.createLinearGradient(0, -34, 0, 10);
  g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e3e5e6");
  ctx.fillStyle = g; rr(-90, -34, 180, 50, 16); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)"; rr(-70, -28, 110, 8, 4); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ Hintergrund
let PATTERN = null, NOISE = [];
function buildStatic() {
  const c = document.createElement("canvas");
  c.width = 180; c.height = 180;
  const g = c.getContext("2d");
  g.strokeStyle = "rgba(255,255,255,0.035)"; g.lineWidth = 2;
  const icon = (x, y, r) => {
    g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    g.beginPath(); g.ellipse(x, y, r * 0.45, r, 0, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.stroke();
  };
  icon(45, 45, 18); icon(135, 130, 14);
  g.beginPath(); g.arc(130, 40, 8, 0, 7); g.stroke();
  g.beginPath(); g.arc(40, 140, 6, 0, 7); g.stroke();
  PATTERN = ctx.createPattern(c, "repeat");
  for (let k = 0; k < 4; k++) {
    const n = document.createElement("canvas");
    n.width = 256; n.height = 256;
    const gg = n.getContext("2d"), img = gg.createImageData(256, 256), R = rng(50 + k);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(R() * 255); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gg.putImageData(img, 0, 0);
    NOISE.push(ctx.createPattern(n, "repeat"));
  }
}
function drawBackground(t) {
  const g = ctx.createRadialGradient(SCX, SCY, 50, SCX, SCY + 200, 1300);
  g.addColorStop(0, "#353731"); g.addColorStop(0.6, "#262824"); g.addColorStop(1, "#1a1b18");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate((t * 6) % 180, (t * 3) % 180);
  ctx.fillStyle = PATTERN; ctx.fillRect(-180, -180, W + 360, H + 360);
  ctx.restore();
}

// ------------------------------------------------------------------ Szene 0: Raster der Nationalitäten
function scGrid(t) {
  const s0 = S[0], tk = Wt(0, "Kurden");
  const cards = [["Kurde", flagKurd], ["Afrikaner", null], ["Albaner", flagAlb], ["Türke", flagTurk]];
  const zoom = easeIO(ramp(t, tk - 0.1, tk + 0.6));
  cards.forEach(([name, fl], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    let cx = SCX + (col ? 135 : -135), cy = SCY - 40 + (row ? 270 : 0);
    const p = pop(t, s0 + 0.05 + i * 0.12);
    let sc = p, a = 1;
    if (i === 0) { cx = lerp(cx, SCX, zoom); cy = lerp(cy, SCY, zoom); sc *= 1 + 1.7 * zoom; }
    else a = 1 - zoom;
    if (sc <= 0.01 || a <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha = a;
    if (i === 0) glow(0, 0, 220, 0.25 * zoom);
    const cw = 240, ch = 250;
    ctx.fillStyle = "rgba(0,0,0,0.35)"; rr(-cw / 2 + 6, -ch / 2 + 10, cw, ch, 26); ctx.fill();
    const g = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2);
    g.addColorStop(0, "#43453f"); g.addColorStop(1, "#30322d");
    ctx.fillStyle = g; rr(-cw / 2, -ch / 2, cw, ch, 26); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; ctx.stroke();
    if (fl) {
      ctx.save(); rr(-80, -95, 160, 110, 8); ctx.clip(); fl(-80, -95, 160, 110); ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(-80, -95, 160, 30);
    } else africa(-10, -40, 2.4);
    ctx.fillStyle = "#f2f3ee"; font(600, 32); textC(name, 0, 82);
    ctx.restore();
  });
}

// ------------------------------------------------------------------ Szene 1: Atlas + Suche
let ATLAS = null;
function buildAtlas() {
  const c = document.createElement("canvas");
  c.width = 900; c.height = 560;
  const g = c.getContext("2d"), R = rng(4);
  g.fillStyle = "#6fb3d8"; g.fillRect(0, 0, 900, 560);
  for (let k = 0; k < 9; k++) {
    const cx = R() * 900, cy = R() * 560, r = 60 + R() * 140;
    g.fillStyle = ["#7fb86a", "#a9c77a", "#d8c48a", "#c79a5e", "#5f9e5a"][k % 5];
    g.beginPath();
    for (let a = 0; a < 6.28; a += 0.3) { const q = r * (0.6 + R() * 0.5); g.lineTo(cx + Math.cos(a) * q * 1.3, cy + Math.sin(a) * q); }
    g.fill();
  }
  g.strokeStyle = "rgba(60,60,60,0.25)"; g.lineWidth = 1.5;
  for (let x = 0; x < 900; x += 75) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 560); g.stroke(); }
  for (let y = 0; y < 560; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(900, y); g.stroke(); }
  ATLAS = c;
}
function book(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(0, 30, 520, 0.18);
  // Buchdeckel / Seitenstapel
  ctx.fillStyle = "#e9e3d2";
  ctx.beginPath(); ctx.moveTo(-430, -90); ctx.lineTo(0, -40); ctx.lineTo(430, -90); ctx.lineTo(450, 190); ctx.lineTo(0, 250); ctx.lineTo(-450, 190); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#cfc7b0";
  ctx.beginPath(); ctx.moveTo(-450, 190); ctx.lineTo(0, 250); ctx.lineTo(450, 190); ctx.lineTo(450, 214); ctx.lineTo(0, 276); ctx.lineTo(-450, 214); ctx.fill();
  // zwei Seiten mit Karte (verzerrt)
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -48); ctx.quadraticCurveTo(side * 200, -110, side * 420, -100); ctx.lineTo(side * 438, 176); ctx.quadraticCurveTo(side * 200, 190, 0, 236); ctx.closePath();
    ctx.clip();
    ctx.setTransform(ctx.getTransform().multiply(new DOMMatrix([1, side * -0.06, 0, 1, 0, 0])));
    ctx.drawImage(ATLAS, side < 0 ? 0 : 450, 0, 450, 560, side < 0 ? -440 : 0, -110, 440, 350);
    ctx.restore();
  }
  const sh = ctx.createLinearGradient(-60, 0, 60, 0);
  sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(0.5, "rgba(0,0,0,0.35)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh; ctx.fillRect(-60, -60, 120, 300);
  ctx.restore();
}
function magnifier(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#2b2b2b"; ctx.lineWidth = 26; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(78, 78); ctx.lineTo(170, 170); ctx.stroke();
  ctx.fillStyle = "rgba(200,230,255,0.18)"; ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.fill();
  ctx.strokeStyle = "#5a5d63"; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 80, -2.6, -1.8); ctx.stroke();
  ctx.restore();
}
function searchBar(t, txt, typed, sub) {
  const x = SCX - 300, y = 300, w = 600, h = 84;
  ctx.fillStyle = "#1d1e1b"; rr(x, y, w, h, 42); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = LIME; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x + 48, y + 38, 14, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 58, y + 48); ctx.lineTo(x + 68, y + 58); ctx.stroke();
  const s = txt.slice(0, typed);
  ctx.fillStyle = "#f2f3ee"; font(600, 38); ctx.fillText(s, x + 90, y + 56);
  if (Math.floor(t * 3) % 2 === 0) { const cw = ctx.measureText(s).width; ctx.fillRect(x + 94 + cw, y + 22, 3, 42); }
  if (sub > 0) { ctx.globalAlpha = sub; ctx.fillStyle = "#ff8a7a"; font(600, 30); textC("0 Treffer", SCX, y + 132); ctx.globalAlpha = 1; }
}
function scAtlas(t) {
  const s1 = S[1], s2 = S[2];
  const z = easeIO(ramp(t, s1, s2 + 1.5));
  book(SCX, SCY + 60, 0.98 + 0.08 * z, t);
  // Lupe wandert über die Karte
  const k = ramp(t, s1, E[2] + 0.5);
  const mx = SCX - 150 + Math.sin(k * 9) * 230, my = SCY + 30 + Math.cos(k * 7) * 70;
  const shake = t > Wt(2, "nichts") && t < Wt(2, "nichts") + 0.5 ? Math.sin(t * 60) * 10 : 0;
  magnifier(mx + shake, my, 0.9);
  const tk = Wt(2, "Kurdistan");
  if (t > s2 - 0.2) {
    const p = easeOut(ramp(t, s2 - 0.2, s2 + 0.1));
    ctx.globalAlpha = p;
    const word = "Kurdistan";
    const typed = Math.round(clamp((t - tk + 0.25) / 0.55) * word.length);
    searchBar(t, word, typed, ramp(t, Wt(2, "nichts"), Wt(2, "nichts") + 0.25));
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ Szene 2: Karte
const CENTER_LON = 44.5, CENTER_LAT = 35, KM = 25;
const P = (lon, lat) => [SCX + (lon - CENTER_LON) * KM, SCY - (lat - CENTER_LAT) * KM * 1.22];
const C_TUR = [[26, 40.5], [29, 41.2], [33, 42], [36, 41.7], [41.5, 41.5], [43.5, 41.1], [44.8, 39.7], [44.3, 37.2], [42.4, 37.1], [40, 36.9], [38, 36.8], [36.6, 36.2], [36, 36.9], [32.5, 36.1], [30.4, 36.2], [28, 36.7], [26.3, 38.2]];
const C_SYR = [[36, 36.9], [36.6, 36.2], [38, 36.8], [40, 36.9], [42.4, 37.1], [41.3, 36.3], [41, 34.4], [38.8, 33.4], [36.8, 32.3], [35.7, 32.7], [35.9, 34.6], [35.9, 35.9]];
const C_IRQ = [[42.4, 37.1], [44.3, 37.2], [45.5, 35.9], [46, 35], [45.8, 34], [47.8, 32], [48.5, 30], [47.9, 29.9], [47.1, 29.9], [46.5, 29.1], [44.7, 29.2], [42.1, 31.1], [39, 32.2], [38.8, 33.4], [41, 34.4], [41.3, 36.3]];
const C_IRN = [[44.8, 39.7], [46.5, 38.9], [48, 38.4], [48.8, 38.4], [49.2, 37.6], [51, 36.8], [53.9, 37.3], [56, 38], [57.3, 38.2], [59.5, 37.5], [61.1, 36.5], [61, 34.5], [60.5, 33.5], [60.9, 31.5], [61.7, 31.3], [62.7, 28.3], [61.8, 26.2], [61.6, 25.2], [57.3, 25.7], [56.4, 27.2], [54.7, 26.5], [51.5, 27.9], [50.1, 30.2], [48.5, 30], [47.8, 32], [45.8, 34], [46, 35], [45.5, 35.9], [44.3, 37.2]];
const SEAS = [
  [[18, 31], [36, 31], [36.2, 33], [35.8, 36.8], [32.5, 36.1], [30.4, 36.2], [28, 36.7], [26.3, 38.2], [26, 40.2], [18, 40]],
  [[27.6, 41.5], [29, 41.2], [33, 42], [36, 41.7], [41.5, 41.5], [41.5, 44], [37, 46], [30, 46], [28, 43.5]],
  [[47, 47], [49.2, 37.6], [51, 36.8], [53.9, 37.3], [54, 41], [52, 47]],
  [[48.5, 30], [50.1, 30.2], [51.5, 27.9], [54.7, 26.5], [56.4, 27.2], [57.3, 25.7], [56, 24], [52, 24], [48, 28.5]],
];
const KURD = [[37, 37.5], [38.5, 38.6], [40, 39.5], [42, 39.8], [43.8, 39.6], [44.6, 38.4], [45.5, 37], [46.6, 35.6], [47.2, 34.3], [46.2, 33.6], [45, 34.5], [43.6, 35.4], [42.3, 35.8], [40.6, 36.4], [38.5, 36.6]];
function polyLL(pts) { ctx.beginPath(); for (const [lo, la] of pts) { const [x, y] = P(lo, la); ctx.lineTo(x, y); } ctx.closePath(); }
function pin(x, y, label, p, labelBelow = true) {
  if (p <= 0) return;
  const s = back(p);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(0, -10, 60, 0.4);
  ctx.fillStyle = LIME;
  ctx.beginPath(); ctx.arc(0, -34, 18, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#1f201d"; ctx.beginPath(); ctx.arc(0, -34, 7, 0, 7); ctx.fill();
  ctx.fillStyle = "#f2f3ee"; font(600, 28); textC(label, 0, labelBelow ? 34 : -64);
  ctx.restore();
}
function scMap(t) {
  const z = 1 + 0.06 * easeIO(ramp(t, S[3], E[6]));
  ctx.save(); ctx.translate(SCX, SCY); ctx.scale(z, z); ctx.translate(-SCX, -SCY);
  // Karte als abgerundete Kachel
  const x0 = 70, y0 = 330, w = 940, h = 640;
  ctx.save(); rr(x0, y0, w, h, 36); ctx.clip();
  ctx.fillStyle = "#3c3e39"; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = "#262a2a"; for (const s of SEAS) { polyLL(s); ctx.fill(); }
  ctx.fillStyle = "#4a4c46";
  for (const c of [C_TUR, C_SYR, C_IRQ, C_IRN]) { polyLL(c); ctx.fill(); }
  ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2;
  for (const c of [C_TUR, C_SYR, C_IRQ, C_IRN]) { polyLL(c); ctx.stroke(); }
  // Kurdengebiet: erst gestrichelt (gesucht), dann leuchtend
  const t3 = Wt(3, "keine"), t5 = Wt(5, "größte");
  const fill = easeOut(ramp(t, t5, t5 + 1.2));
  if (t > t3) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 6);
    if (fill > 0) {
      ctx.save(); polyLL(KURD); ctx.clip();
      const [kx, ky] = P(42, 37.2);
      glow(kx, ky, 300, 0.75 * fill);
      ctx.restore();
      ctx.filter = "blur(18px)"; ctx.fillStyle = `rgba(${LIME_RGB},${0.35 * fill})`; polyLL(KURD); ctx.fill(); ctx.filter = "none";
    }
    ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30;
    ctx.strokeStyle = `rgba(${LIME_RGB},${(1 - fill * 0.7) * pulse * ramp(t, t3, t3 + 0.3)})`; ctx.lineWidth = 4;
    polyLL(KURD); ctx.stroke(); ctx.setLineDash([]);
  }
  // Pins: Türkei, Irak, Iran, Syrien
  const pins = [["Türkei", 33, 39.3, true], ["Irak", 43.6, 32.6, true], ["Iran", 54, 32.6, true], ["Syrien", 38.4, 34.9, true]];
  for (const [name, lo, la, below] of pins) {
    const [x, y] = P(lo, la);
    pin(x, y, name, ramp(t, Wt(6, name) - 0.05, Wt(6, name) + 0.3), below);
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 2; rr(x0, y0, w, h, 36); ctx.stroke();
  // Tags
  ctx.globalAlpha = 1 - ramp(t, S[4], S[4] + 0.3);
  pill(SCX, y0 - 50, "keine Kurden?", ramp(t, t3, t3 + 0.3), { dotCol: "#9a9c95" });
  ctx.globalAlpha = 1;
  pill(SCX, y0 - 50, "kein eigener Staat", ramp(t, Wt(4, "nicht"), Wt(4, "nicht") + 0.3));
  ctx.restore();
}

// ------------------------------------------------------------------ Szene 3: Klassenzimmer
function desk(x, y, a, du, er) {
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(0,0,0,0.3)"; rr(x - 112, y - 46, 230, 100, 16); ctx.fill();
  ctx.fillStyle = "#3d3f3a"; rr(x - 116, y - 52, 232, 100, 16); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.05)"; rr(x - 116, y - 52, 232, 18, 10); ctx.fill();
  for (const [dx, hl] of [[-58, du], [58, er]]) {
    ctx.fillStyle = hl === 1 ? LIME : hl === 2 ? "#8a8c85" : "#33352f";
    if (hl === 1) glow(x + dx, y + 84, 70, 0.5);
    rr(x + dx - 26, y + 62, 52, 46, 10); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function scClass(t) {
  const t8 = S[8];
  const z = 1 + 0.9 * easeIO(ramp(t, t8 - 0.4, t8 + 0.6));
  const fx = SCX - 120, fy = SCY + 20;     // Tisch von "du" und "er"
  ctx.save(); ctx.translate(SCX, SCY); ctx.scale(z, z); ctx.translate(-fx, -fy);
  for (let r = -3; r <= 3; r++) for (let c = -2; c <= 2; c++) {
    const x = fx + c * 290, y = fy + r * 200;
    const me = r === 0 && c === 0;
    desk(x, y, me ? 1 : 0.85, me ? 1 : 0, me ? 2 : 0);
  }
  // Labels
  const s7 = S[7];
  ctx.save(); ctx.translate(fx - 58, fy + 150); ctx.scale(1 / z, 1 / z); pill(0, 0, "du", ramp(t, s7 - 0.2, s7 + 0.1)); ctx.restore();
  ctx.save(); ctx.translate(fx + 58, fy + 150); ctx.scale(1 / z, 1 / z); pill(0, 0, "er", ramp(t, s7, s7 + 0.3), { dotCol: "#9a9c95" }); ctx.restore();
  const tn = Wt(7, "neben");
  if (t > tn) {
    const p = easeOut(ramp(t, tn, tn + 0.4)) * (1 - ramp(t, t8 - 0.3, t8));
    ctx.globalAlpha = p; ctx.strokeStyle = LIME; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(fx - 58, fy - 80); ctx.lineTo(fx + 58, fy - 80); ctx.moveTo(fx - 58, fy - 92); ctx.lineTo(fx - 58, fy - 68); ctx.moveTo(fx + 58, fy - 92); ctx.lineTo(fx + 58, fy - 68); ctx.stroke();
    ctx.fillStyle = "#f2f3ee"; font(600, 30); textC("direkt daneben", fx, fy - 104);
    ctx.globalAlpha = 1;
  }
  // Radiergummi wandert von "du" zu "er"
  const tg = Wt(8, "geborgt"), tr = Wt(8, "Radiergummi");
  if (t > tr - 0.3) {
    const m = easeIO(ramp(t, tg - 0.35, tg + 0.35));
    eraser(lerp(fx - 58, fx + 58, m), fy - 4 - Math.sin(m * Math.PI) * 30, 0.42 * pop(t, tr - 0.3), -0.15 + 0.3 * m);
    ctx.save(); ctx.translate(fx + 58, fy - 48); ctx.scale(1 / z, 1 / z);
    pill(0, 0, "geborgt", ramp(t, tg + 0.2, tg + 0.5), { dot: false, size: 26 });
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ Szene 4: Anruf bei Oma
function scPhone(t) {
  const s9 = S[9], s10 = S[10];
  const shift = easeIO(ramp(t, s10 - 0.2, s10 + 0.5)) * -70;
  const px = SCX + shift, py = SCY + 10, w = 330, h = 600;
  pill(px, py - h / 2 - 60, "Pause", ramp(t, Wt(9, "Pause") - 0.1, Wt(9, "Pause") + 0.2), { size: 28 });
  glow(px, py, 420, 0.16);
  ctx.fillStyle = "#121311"; rr(px - w / 2 - 10, py - h / 2 - 10, w + 20, h + 20, 56); ctx.fill();
  const g = ctx.createLinearGradient(0, py - h / 2, 0, py + h / 2);
  g.addColorStop(0, "#2d3f22"); g.addColorStop(0.5, "#1d2318"); g.addColorStop(1, "#151713");
  ctx.fillStyle = g; rr(px - w / 2, py - h / 2, w, h, 46); ctx.fill();
  ctx.fillStyle = "#000"; rr(px - 50, py - h / 2 + 16, 100, 28, 14); ctx.fill();
  // Avatar mit Flagge
  const ay = py - 150;
  glow(px, ay, 120, 0.35);
  ctx.save(); ctx.beginPath(); ctx.arc(px, ay, 64, 0, 7); ctx.clip(); flagKurd(px - 96, ay - 64, 192, 128); ctx.restore();
  ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(px, ay, 68, 0, 7); ctx.stroke();
  ctx.fillStyle = "#fff"; font(900, 46, "InterBlk"); textC("Oma", px, ay + 125);
  const sec = Math.floor(ramp(t, s9, E[10] + 1) * 5);
  ctx.fillStyle = "#cfd2c8"; font(600, 28); textC(`18:4${2 + sec}`, px + 10, ay + 168);
  ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(px - 52, ay + 158, 6, 0, 7); ctx.fill();
  // Sprachwelle
  for (let k = 0; k < 13; k++) {
    const hh = 12 + 40 * Math.abs(Math.sin(t * 9 + k * 1.3) * Math.sin(t * 3.1 + k));
    ctx.fillStyle = LIME; rr(px - 120 + k * 20, ay + 250 - hh / 2, 10, hh, 5); ctx.fill();
  }
  for (let k = -1; k <= 1; k++) { ctx.fillStyle = "#33352f"; ctx.beginPath(); ctx.arc(px + k * 80, py + h / 2 - 90, 30, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#c9ccc3"; rr(px - 60, py + h / 2 - 22, 120, 6, 3); ctx.fill();
  // Mitschüler (Radiergummi) hört mit
  if (t > s10 - 0.1) {
    const p = easeOut(ramp(t, s10 - 0.1, s10 + 0.5));
    const ex = lerp(W + 200, px + 260, p), ey = py + 250;
    eraser(ex, ey, 0.75, -0.2);
    pill(ex + 10, ey - 90, "er", ramp(t, s10 + 0.2, s10 + 0.5), { dotCol: "#9a9c95", size: 26 });
    const ta = Wt(10, "Türkisch");
    const q = ramp(t, ta - 0.1, ta + 0.25);
    if (q > 0) {
      ctx.save(); ctx.translate(px + 120, py + 140); const s = back(q); ctx.scale(s, s);
      font(600, 30); const tw = ctx.measureText("Türkisch mit Akzent?").width + 44;
      ctx.fillStyle = "#e9eae4"; rr(-tw / 2, -32, tw, 64, 32); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tw / 2 - 70, 26); ctx.lineTo(tw / 2 - 30, 26); ctx.lineTo(tw / 2 - 20, 60); ctx.fill();
      ctx.fillStyle = "#1d1e1b"; textC("Türkisch mit Akzent?", 0, 11);
      ctx.restore();
    }
  }
}

// ------------------------------------------------------------------ Szene 5: Sprachfamilien
function node(x, y, label, p, col = LIME, below = false, side = 0) {
  if (p <= 0) return;
  ctx.globalAlpha = clamp(p * 2);
  glow(x, y, 50, col === LIME ? 0.5 * p : 0);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 14 * back(p), 0, 7); ctx.fill();
  ctx.fillStyle = "#f2f3ee"; font(600, 32);
  if (side) ctx.fillText(label, x + 30, y + 11); else textC(label, x, below ? y + 56 : y - 32);
  ctx.globalAlpha = 1;
}
function edge(x1, y1, x2, y2, p, col = LIME, curve = 0) {
  if (p <= 0) return;
  ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = "round";
  if (col === LIME) { ctx.shadowColor = `rgba(${LIME_RGB},0.8)`; ctx.shadowBlur = 16; }
  ctx.beginPath();
  const N = 30;
  for (let i = 0; i <= N * p; i++) {
    const u = i / N;
    const x = lerp(x1, x2, u) + Math.sin(u * Math.PI) * curve, y = lerp(y1, y2, easeIO(u));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.shadowBlur = 0;
}
function scTree(t) {
  const s11 = S[11], s12 = S[12];
  const pan = easeIO(ramp(t, s12 - 0.2, s12 + 0.6));
  ctx.save(); ctx.translate(-130 * pan, 0);
  const K = [SCX - 140, SCY - 220], Pp = [SCX + 140, SCY - 220], I = [SCX, SCY], G = [SCX, SCY + 200];
  const tK = Wt(11, "Kurdisch"), tP = Wt(11, "Persisch"), tV = Wt(11, "verwandt");
  node(...K, "Kurdisch", ramp(t, tK - 0.1, tK + 0.3));
  node(...Pp, "Persisch", ramp(t, tP - 0.1, tP + 0.3));
  edge(...K, ...I, ramp(t, tV - 0.4, tV + 0.2), LIME, -30);
  edge(...Pp, ...I, ramp(t, tV - 0.4, tV + 0.2), LIME, 30);
  node(...I, "Iranisch", ramp(t, tV, tV + 0.3), LIME, false, 1);
  edge(I[0], I[1] + 14, ...G, ramp(t, tV + 0.2, tV + 0.7));
  node(...G, "Indogermanisch", ramp(t, tV + 0.5, tV + 0.8), LIME, true);
  pill(SCX, SCY - 330, "verwandt", ramp(t, tV, tV + 0.3));
  // Türkisch: eigener, grauer Strang
  const T1 = [SCX + 420, SCY - 220], T2 = [SCX + 420, SCY + 200];
  const tT = Wt(12, "Türkisch"), tF = Wt(12, "Sprachfamilie");
  node(...T1, "Türkisch", ramp(t, tT - 0.1, tT + 0.3), "#b9bbb4");
  edge(...T1, ...T2, ramp(t, tT + 0.2, tF), "#8a8c85");
  node(...T2, "Turksprachen", ramp(t, tF - 0.2, tF + 0.2), "#b9bbb4", true);
  // keine Verbindung
  const q = ramp(t, tF, tF + 0.4);
  if (q > 0) {
    ctx.globalAlpha = q; ctx.setLineDash([10, 12]); ctx.strokeStyle = "#6c6e68"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(G[0] + 30, G[1]); ctx.lineTo(T2[0] - 30, T2[1]); ctx.stroke(); ctx.setLineDash([]);
    const mx = (G[0] + T2[0]) / 2, my = G[1];
    ctx.fillStyle = "#262824"; ctx.beginPath(); ctx.arc(mx, my, 26, 0, 7); ctx.fill();
    ctx.strokeStyle = "#ff7a6a"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(mx - 12, my - 12); ctx.lineTo(mx + 12, my + 12); ctx.moveTo(mx + 12, my - 12); ctx.lineTo(mx - 12, my + 12); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ------------------------------------------------------------------ Szene 6: Brot
let BREAD = null;
function buildBread() {
  const c = document.createElement("canvas");
  c.width = 560; c.height = 360;
  const g = c.getContext("2d"), R = rng(8);
  const grd = g.createRadialGradient(280, 170, 20, 280, 180, 270);
  grd.addColorStop(0, "#f0cf8f"); grd.addColorStop(0.7, "#dcae64"); grd.addColorStop(1, "#b9803c");
  g.fillStyle = grd; g.beginPath(); g.ellipse(280, 180, 260, 160, 0, 0, 7); g.fill();
  g.strokeStyle = "rgba(150,90,30,0.35)"; g.lineWidth = 10;
  g.beginPath(); g.ellipse(280, 180, 200, 118, 0, 0, 7); g.stroke();
  // Rillen in Rautenmuster (typisch Fladenbrot)
  g.save(); g.beginPath(); g.ellipse(280, 180, 190, 110, 0, 0, 7); g.clip();
  g.strokeStyle = "rgba(140,85,30,0.35)"; g.lineWidth = 6;
  g.fillStyle = "rgba(140,85,30,0.4)";
  for (let yy = 70; yy < 300; yy += 30) for (let xx = 80 + (yy / 30 % 2) * 20; xx < 480; xx += 40) { g.beginPath(); g.ellipse(xx, yy, 7, 5, 0, 0, 7); g.fill(); }
  g.restore();
  for (let i = 0; i < 26; i++) {
    const a = R() * 6.28, r = Math.sqrt(R()) * 0.85;
    const x = 280 + Math.cos(a) * r * 240, y = 180 + Math.sin(a) * r * 145;
    g.fillStyle = `rgba(${150 + R() * 30},${90 + R() * 20},30,${0.2 + R() * 0.25})`;
    g.beginPath(); g.ellipse(x, y, 8 + R() * 14, 5 + R() * 8, R() * 3, 0, 7); g.fill();
  }
  // Rand etwas dunkler und aufgegangen
  const rim = g.createRadialGradient(280, 180, 150, 280, 180, 265);
  rim.addColorStop(0, "rgba(120,60,10,0)"); rim.addColorStop(0.8, "rgba(160,90,30,0.25)"); rim.addColorStop(1, "rgba(110,55,15,0.45)");
  g.fillStyle = rim; g.beginPath(); g.ellipse(280, 180, 260, 160, 0, 0, 7); g.fill();
  for (let i = 0; i < 40; i++) {
    const a = R() * 6.28, r = Math.sqrt(R()) * 0.7;
    g.fillStyle = "rgba(255,240,200,0.35)";
    g.beginPath(); g.arc(280 + Math.cos(a) * r * 240, 180 + Math.sin(a) * r * 140, 3 + R() * 4, 0, 7); g.fill();
  }
  BREAD = c;
}
function wordCard(x, y, lang, word, p, active = true) {
  if (p <= 0) return;
  const s = back(p);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 3);
  font(900, 84, "InterBlk"); const w = Math.max(250, ctx.measureText(word).width + 70);
  ctx.fillStyle = "rgba(0,0,0,0.35)"; rr(-w / 2 + 5, -78, w, 170, 24); ctx.fill();
  ctx.fillStyle = active ? "#3a3c37" : "#30322e"; rr(-w / 2, -84, w, 170, 24); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#a9aba3"; font(600, 28); textC(lang, 0, -38);
  if (active) { ctx.shadowColor = `rgba(${LIME_RGB},0.7)`; ctx.shadowBlur = 24; }
  ctx.fillStyle = active ? LIME : "#c3c5bd"; font(900, 76, "InterBlk"); textC(word, 0, 52);
  ctx.restore(); ctx.shadowBlur = 0;
}
function scBread(t) {
  const s13 = S[13];
  const z = easeOut(ramp(t, s13 - 0.2, s13 + 0.6));
  const by = SCY - 150;
  // Teller + Brot + Dampf
  ctx.fillStyle = "#1d1e1b"; ctx.beginPath(); ctx.ellipse(SCX, by + 30, 300 * z, 190 * z, 0, 0, 7); ctx.fill();
  glow(SCX, by, 380, 0.18 * z);
  if (z > 0) ctx.drawImage(BREAD, SCX - 280 * z, by - 180 * z + 10, 560 * z, 360 * z);
  for (let k = 0; k < 3; k++) {
    const ph = (t * 0.6 + k / 3) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.12 * Math.sin(ph * Math.PI)})`; ctx.lineWidth = 14; ctx.lineCap = "round";
    ctx.beginPath();
    for (let u = 0; u <= 1; u += 0.1) ctx.lineTo(SCX - 60 + k * 60 + Math.sin(u * 6 + t * 2 + k) * 14, by - 160 - ph * 120 - u * 90);
    ctx.stroke();
  }
  const tN = Wt(13, "NAN"), tP = Wt(14, "Persisch"), tG = Wt(14, "genauso"), tE = Wt(15, "EKMEK");
  const sp = easeIO(ramp(t, tP - 0.2, tP + 0.3));
  wordCard(SCX - 170 * sp, SCY + 210, "Kurdisch", "Nan", ramp(t, tN - 0.1, tN + 0.3));
  wordCard(SCX + 170, SCY + 210, "Persisch", "Nan", ramp(t, tP, tP + 0.35));
  const eq = ramp(t, tG - 0.1, tG + 0.2);
  if (eq > 0) {
    ctx.save(); ctx.translate(SCX, SCY + 210); ctx.scale(back(eq), back(eq));
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
    ctx.fillStyle = "#1d1e1b"; ctx.fillRect(-13, -9, 26, 6); ctx.fillRect(-13, 4, 26, 6);
    ctx.restore();
  }
  // Ekmek: grau, abgesetzt, leicht schief
  const pe = ramp(t, tE - 0.1, tE + 0.35);
  if (pe > 0) { ctx.save(); ctx.translate(SCX + 110, SCY + 390); ctx.rotate(-0.06); wordCard(0, 0, "Türkisch", "Ekmek", pe, false); ctx.restore(); }
}

// ------------------------------------------------------------------ Szene 7: ein Wort Türkisch -> Döner
function doner(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(0, 0, 340, 0.3);
  ctx.fillStyle = "#9da0a3"; ctx.fillRect(-6, -320, 12, 560);
  ctx.fillStyle = "#c9ccce"; ctx.beginPath(); ctx.ellipse(0, 250, 150, 28, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#8f9295"; ctx.beginPath(); ctx.ellipse(0, 244, 150, 22, 0, 0, 7); ctx.fill();
  // Fleischkegel in Schichten
  for (let i = 0; i < 26; i++) {
    const u = i / 25, yy = -260 + u * 460;
    const r = lerp(120, 70, u) + Math.sin(i * 1.7) * 6;
    ctx.fillStyle = i % 2 ? "#7a3f1e" : "#93512a";
    ctx.beginPath(); ctx.ellipse(0, yy, r, 22, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,190,120,0.18)"; ctx.beginPath(); ctx.ellipse(-r * 0.35, yy - 4, r * 0.4, 8, 0, 0, 7); ctx.fill();
  }
  ctx.fillStyle = "rgba(60,25,10,0.45)"; ctx.beginPath(); ctx.moveTo(30, -270); ctx.lineTo(120, -260); ctx.lineTo(70, 200); ctx.lineTo(30, 200); ctx.fill();
  ctx.fillStyle = "#7a3f1e"; ctx.beginPath(); ctx.ellipse(0, -282, 100, 26, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function scWord(t) {
  const s16 = S[16], tD = Wt(17, "Döner"), s18 = S[18];
  // Heft-Karte
  const cardA = 1 - easeIO(ramp(t, tD - 0.3, tD + 0.1));
  if (cardA > 0) {
    const p = pop(t, s16 - 0.2);
    ctx.save(); ctx.translate(SCX, SCY - 20); ctx.scale(p, p); ctx.globalAlpha = cardA; ctx.rotate(-0.25 * (1 - cardA));
    const w = 560, h = 420;
    ctx.fillStyle = "rgba(0,0,0,0.4)"; rr(-w / 2 + 8, -h / 2 + 12, w, h, 22); ctx.fill();
    ctx.fillStyle = "#efeadf"; rr(-w / 2, -h / 2, w, h, 22); ctx.fill();
    ctx.fillStyle = "#262824"; font(600, 44); ctx.fillText("Türkisch", -w / 2 + 34, -h / 2 + 70);
    ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const yy = -h / 2 + 120 + i * 58;
      ctx.beginPath(); ctx.moveTo(-w / 2 + 30, yy + 18); ctx.lineTo(w / 2 - 30, yy + 18); ctx.stroke();
      ctx.fillStyle = i ? "#b5b0a4" : "#3a3a3a"; font(600, 28); ctx.fillText(`${i + 1}.`, -w / 2 + 34, yy + 6);
    }
    const tw = Wt(16, "Wort");
    const fill = easeOut(ramp(t, tw, tw + 0.5));
    ctx.fillStyle = "#8fd14a"; rr(-w / 2 + 80, -h / 2 + 100, 330 * fill, 26, 13); ctx.fill();
    const b = ramp(t, tw - 0.1, tw + 0.2);
    if (b > 0) { ctx.save(); ctx.translate(w / 2 - 100, -h / 2 + 56); ctx.scale(back(b), back(b)); ctx.fillStyle = "#1f201d"; rr(-80, -26, 160, 52, 26); ctx.fill(); ctx.fillStyle = "#fff"; font(600, 28); textC("1 Wort", 0, 10); ctx.restore(); }
    ctx.restore();
  }
  // Döner
  const dp = ramp(t, tD - 0.25, tD + 0.3);
  if (dp > 0) {
    ctx.globalAlpha = clamp(dp * 2);
    doner(SCX, SCY - 20 + (1 - easeOut(dp)) * 80, 0.95);
    ctx.save(); ctx.translate(SCX + 10, SCY - 10); ctx.rotate(-0.05); ctx.scale(back(dp), back(dp));
    ctx.shadowColor = `rgba(${LIME_RGB},0.8)`; ctx.shadowBlur = 30;
    ctx.fillStyle = LIME; ctx.font = "italic 400 170px ISerif"; textC("Döner.", 0, 40);
    ctx.restore(); ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  // Sicherheits-Balken
  if (t > s18 - 0.1) {
    const ts = Wt(18, "SICHER");
    const p = easeOut(ramp(t, s18, ts + 0.3));
    const y = SCY + 330;
    ctx.globalAlpha = ramp(t, s18 - 0.1, s18 + 0.2);
    ctx.fillStyle = "#f2f3ee"; font(900, 46, "InterBlk"); textC(`${Math.round(p * 100)} %`, SCX, y - 30);
    ctx.fillStyle = "#3b3d38"; rr(SCX - 220, y, 440, 22, 11); ctx.fill();
    ctx.fillStyle = LIME; rr(SCX - 220, y, 440 * p, 22, 11); ctx.fill();
    glow(SCX - 220 + 440 * p, y + 11, 50, 0.6 * p);
    ctx.fillStyle = "#a9aba3"; font(600, 26); textC("Selbstsicherheit", SCX, y + 62);
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ Szene 8+9: Hochzeit, Gäste
let TABLES = [];
function buildTables() {
  const R = rng(21);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    const seats = [];
    for (let k = 0; k < 14; k++) seats.push({ a: k / 14 * Math.PI * 2, d: R() * 0.8, known: R() < 0.04 });
    TABLES.push({ x: SCX - 312 + c * 125, y: SCY - 280 + r * 125, seats, ord: R() });
  }
}
function scWedding(t) {
  const s19 = S[19], s20 = S[20];
  // Einladung
  const inv = 1 - easeIO(ramp(t, s20 - 0.3, s20 + 0.1));
  pill(SCX, SCY - 390, "Samstag", ramp(t, Wt(19, "Samstag") - 0.1, Wt(19, "Samstag") + 0.2) * (inv > 0 ? 1 : 0), { size: 28 });
  if (inv > 0) {
    const p = pop(t, s19 + 0.1, 0.5);
    ctx.save(); ctx.translate(SCX, SCY - 30); ctx.scale(p * (1 + (1 - inv) * 0.6), p * (1 + (1 - inv) * 0.6)); ctx.globalAlpha = inv;
    glow(0, 0, 380, 0.15);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; rr(-262, -172, 530, 350, 14); ctx.fill();
    ctx.fillStyle = "#f3ecd8"; rr(-265, -178, 530, 350, 14); ctx.fill();
    ctx.strokeStyle = "#b9a374"; ctx.lineWidth = 3; rr(-240, -153, 480, 300, 8); ctx.stroke();
    ctx.lineWidth = 1.5; rr(-228, -141, 456, 276, 6); ctx.stroke();
    ctx.fillStyle = "#3a3324"; ctx.font = "italic 400 80px ISerif"; textC("Einladung", 0, -10);
    ctx.fillStyle = "#8a7a55"; font(600, 26); textC("zur Hochzeit · Samstag", 0, 50);
    ctx.strokeStyle = "#b9a374"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(-16, 100, 18, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(16, 100, 18, 0, 7); ctx.stroke();
    ctx.restore();
  }
  if (t < s20 - 0.3) return;
  // Gäste an runden Tischen
  const t500 = Wt(20, "500"), t20 = Wt(21, "20"), tdu = Wt(22, "du");
  const fill = ramp(t, t500 - 0.2, E[20] + 0.3);
  const known = ramp(t, t20, t20 + 0.4);
  const focus = easeIO(ramp(t, S[22], tdu + 0.2));
  const DU = TABLES[14];
  const z = 1 + 0.9 * focus;
  const vis = ramp(t, s20 - 0.3, s20 + 0.2);
  ctx.save();
  ctx.globalAlpha = vis;
  ctx.translate(SCX, SCY); ctx.scale(z, z); ctx.translate(-lerp(SCX, DU.x, focus), -lerp(SCY, DU.y, focus));
  ctx.fillStyle = "#30322d"; rr(SCX - 395, SCY - 350, 790, 770, 40); ctx.fill();
  const duA = DU.seats[3].a, duX = DU.x + Math.cos(duA) * 52, duY = DU.y + Math.sin(duA) * 52;
  for (const tb of TABLES) {
    ctx.fillStyle = "#23241f"; ctx.beginPath(); ctx.arc(tb.x, tb.y, 34, 0, 7); ctx.fill();
    tb.seats.forEach((s, k) => {
      const on = (tb.ord * 0.5 + k / 14 * 0.5) < fill;
      if (!on) { ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.arc(tb.x + Math.cos(s.a) * 52, tb.y + Math.sin(s.a) * 52, 4, 0, 7); ctx.fill(); return; }
      const x = tb.x + Math.cos(s.a) * 52, y = tb.y + Math.sin(s.a) * 52;
      const isDu = tb === DU && k === 3;
      if (isDu) return;
      const kn = s.known && known > 0;
      ctx.fillStyle = kn ? LIME : "#e8e9e3";
      if (kn) glow(x, y, 22, 0.5 * known);
      ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
      // alle "schauen" zu dir
      if (focus > 0) {
        const dx = duX - x, dy = duY - y, d = Math.hypot(dx, dy) || 1;
        ctx.fillStyle = "#1d1e1b"; ctx.beginPath(); ctx.arc(x + dx / d * 4 * focus, y + dy / d * 4 * focus, 3, 0, 7); ctx.fill();
      }
    });
  }
  // du
  glow(duX, duY, 60, 0.6 * (0.5 + 0.5 * focus));
  ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(duX, duY, 11, 0, 7); ctx.fill();
  if (focus > 0) {
    ctx.strokeStyle = `rgba(${LIME_RGB},${0.8 * focus})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(duX, duY, 20 + 6 * Math.sin(t * 6), 0, 7); ctx.stroke();
  }
  ctx.save(); ctx.translate(duX - 2, duY + 34); ctx.scale(1 / z, 1 / z); pill(0, 0, "du", focus, { size: 28 }); ctx.restore();
  ctx.restore();
  // Zähler
  const n = Math.round(500 * easeOut(fill));
  ctx.globalAlpha = vis * (1 - focus);
  pill(SCX, SCY - 405, `${Math.max(1, n)} Gäste`, vis, { size: 30 });
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Szene 10-13: Trommel, Reihe, Taschentuch, Kreis
function drum(x, y, s, t, beat) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // Körper
  const g = ctx.createLinearGradient(-30, 0, 260, 0);
  g.addColorStop(0, "#b8732f"); g.addColorStop(0.5, "#d68f45"); g.addColorStop(1, "#8a5221");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(170, 0, 90, 200, 0, -Math.PI / 2, Math.PI / 2); ctx.lineTo(0, 200); ctx.lineTo(0, -200); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#5a3313"; ctx.lineWidth = 6;
  for (let k = 0; k < 9; k++) { const y1 = -190 + k * 47; ctx.beginPath(); ctx.moveTo(10, y1); ctx.lineTo(150, y1 + 23); ctx.lineTo(10, y1 + 47); ctx.stroke(); }
  // Fell
  const pulse = 1 + 0.03 * beat;
  ctx.fillStyle = "#6b3a17"; ctx.beginPath(); ctx.ellipse(0, 0, 100, 210, 0, 0, 7); ctx.fill();
  const sk = ctx.createRadialGradient(-20, -40, 10, 0, 0, 220);
  sk.addColorStop(0, "#f6efdc"); sk.addColorStop(1, "#d8ccad");
  ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(0, 0, 88 * pulse, 196 * pulse, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function link(x, y, ang, a = 1, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.strokeStyle = `rgba(${LIME_RGB},${a})`; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
// Kette entlang einer Kurve f(u) -> [x, y], u in [0, len]
function chain(f, n, a, t, glowA = 0.6) {
  ctx.shadowColor = `rgba(${LIME_RGB},${glowA})`; ctx.shadowBlur = 22;
  for (let i = 0; i < n; i++) {
    const [x, y] = f(i), [x2, y2] = f(i + 0.5);
    link(x, y, Math.atan2(y2 - y, x2 - x) + (i % 2 ? 0 : 0), a, i % 2 ? 0.92 : 1);
  }
  ctx.shadowBlur = 0;
}
function cloth(x, y, t, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pts = [];
  const N = 8;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const u = i / N, v = j / N;
    const wave = Math.sin(t * 7 - u * 4 - v * 2) * 26 * v;
    pts.push([u * 150 + v * 60 + wave * 0.6, v * 280 + Math.sin(t * 5 + u * 3) * 10 * v + wave * 0.3, u, v]);
  }
  const at = (i, j) => pts[i * (N + 1) + j];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    const border = i === 0 || j === 0 || i === N - 1 || j === N - 1;
    const mid = Math.abs(i - 3.5) + Math.abs(j - 3.5) < 2.2;
    ctx.fillStyle = border ? ((i + j) % 2 ? "#a3282d" : "#8a1f24") : mid ? ((i + j) % 2 ? "#b8363a" : "#2f5d48") : ((i + j) % 2 ? "#efe4cc" : "#e6d7b6");
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
  }
  // Fransen
  ctx.strokeStyle = "#d9c49a"; ctx.lineWidth = 2;
  for (let i = 0; i <= N; i++) { const q = at(i, N); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + 3, q[1] + 16); ctx.stroke(); }
  ctx.restore();
}
function scDance(t) {
  const s23 = S[23], s24 = S[24], s25 = S[25], s26 = S[26];
  const tT = Wt(23, "Takt");
  // Trommel (bis die Reihe kommt)
  const dA = 1 - easeIO(ramp(t, s24 + 0.4, s24 + 1.2));
  if (dA > 0) {
    let beat = 0;
    const bt = t - tT;
    if (bt > -0.1) beat = Math.exp(-((bt % 0.55) + 0.55) % 0.55 * 9);
    const ds = (0.9 + 0.05 * beat) * (1 - 0.5 * (1 - dA));
    ctx.globalAlpha = dA * easeOut(ramp(t, s23 - 0.2, s23 + 0.3));
    glow(SCX, SCY, 400, 0.15 + 0.2 * beat);
    // Ringe auf jedem Schlag
    if (bt > 0) {
      const k = (bt % 0.55) / 0.55;
      ctx.strokeStyle = `rgba(${LIME_RGB},${0.8 * (1 - k)})`; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(SCX - 60, SCY, (110 + 140 * k) * ds, (230 + 140 * k) * ds, 0, 0, 7); ctx.stroke();
    }
    drum(SCX - 60, SCY, ds, t, beat);
    pill(SCX - 60, SCY - 300, "Takt", ramp(t, tT, tT + 0.3) * (1 - ramp(t, s24, s24 + 0.3)), { size: 28 });
    ctx.globalAlpha = 1;
  }
  if (t < s24 - 0.1) return;
  // Reihe: Kette aus kleinen Fingern, wandert nach links
  const grow = easeOut(ramp(t, s24, Wt(24, "REIHE") + 0.3));
  const toEraser = easeIO(ramp(t, s26 - 0.2, s26 + 0.6));
  const n = Math.round(46 * grow);
  const off = t * 30;
  const yBase = SCY - 40;
  const f = i => {
    const x = W + 60 - i * 34 - (off % 34);
    return [x - toEraser * 700, yBase + Math.sin(x * 0.012 + t * 2) * 40];
  };
  ctx.globalAlpha = 1 - toEraser;
  chain(f, n, 1, t);
  pill(SCX, SCY - 230, "Reihe", ramp(t, Wt(24, "REIHE"), Wt(24, "REIHE") + 0.3) * (1 - ramp(t, s25, s25 + 0.3)), { size: 28 });
  // Taschentuch ganz vorne
  const tt = Wt(25, "Taschentuch");
  const cp = easeOut(ramp(t, s25 - 0.1, s25 + 0.6));
  if (cp > 0) {
    const fx = lerp(-200, 260, cp), fy = yBase + Math.sin(fx * 0.012 + t * 2) * 40;
    // Kette bis vorne
    const f2 = i => { const x = fx - 20 + i * 34; return [x, yBase + Math.sin(x * 0.012 + t * 2) * 40]; };
    chain(f2, 12, 1, t);
    cloth(fx - 60, fy + 10, t, 1.0 + 0.1 * ramp(t, tt, tt + 0.4));
    pill(fx - 20, fy - 90, "vorne", ramp(t, Wt(25, "vorne"), Wt(25, "vorne") + 0.3), { size: 28 });
  }
  ctx.globalAlpha = 1;
}
function scFinale(t) {
  const s26 = S[26], s27 = S[27], s28 = S[28], s29 = S[29];
  const ex = SCX + 120, ey = SCY + 260;
  // Radiergummi "aus Erdkunde"
  const ep = easeOut(ramp(t, s26 - 0.1, s26 + 0.5));
  const circ = easeIO(ramp(t, s29 - 0.3, s29 + 1.2));
  // Kette: erst wellig von rechts bis zum Radiergummi, dann Kreis
  const join = easeIO(ramp(t, s27, Wt(27, "Reihe") + 0.2));
  const cx = SCX, cy = SCY - 30, R = 330;
  const n = 60;
  const f = i => {
    const u = i / n;
    // Linie: von Radiergummi nach rechts aus dem Bild
    const lx = ex + 40 + i * 34 * (0.4 + 0.6 * join) + (1 - join) * 500, ly = ey - 20 + Math.sin(i * 0.5 + t * 3) * 24 * (1 - circ);
    const a = Math.PI / 2 - 0.12 - u * (Math.PI * 2 - 0.24);
    const kx = cx + Math.cos(a) * R, ky = cy + Math.sin(a) * R;
    return [lerp(lx, kx, circ), lerp(ly, ky, circ)];
  };
  const tL = Wt(28, "LOSLASSEN");
  const brighter = ramp(t, tL - 0.3, tL + 0.4);
  if (join > 0) chain(f, n, clamp(join * 2), t, 0.6 + 0.4 * brighter + 0.3 * circ);
  // Sonne in der Mitte (Kreis geschlossen)
  if (circ > 0) {
    ctx.globalAlpha = circ;
    glow(cx, cy, 260, 0.45);
    ctx.fillStyle = LIME;
    ctx.beginPath();
    for (let k = 0; k < 42; k++) { const a = k / 42 * Math.PI * 2 + t * 0.4, r2 = k % 2 ? 50 : 82 + 6 * Math.sin(t * 5 + k); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); }
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  const exx = lerp(ex, cx, circ), eyy = lerp(ey, cy + R, circ);
  eraser(exx, eyy, 0.9 * ep, -0.12 + 0.1 * circ);
  if (brighter > 0) glow(exx + 80, eyy, 90, 0.5 * brighter);
  pill(ex, ey - 110, "aus Erdkunde", ramp(t, Wt(26, "Erdkunde"), Wt(26, "Erdkunde") + 0.3) * (1 - ramp(t, s27, s27 + 0.3)), { size: 28, dotCol: "#9a9c95" });
  // Timer
  const tm = ramp(t, Wt(27, "fünf") - 0.1, Wt(27, "fünf") + 0.2), th = Wt(28, "drei");
  const tv = tm * (1 - ramp(t, s29 - 0.4, s29));
  pill(SCX, SCY - 380, t < th ? "⏱ 5 min" : "⏱ 3 h", tv, { size: 30, dot: false });
  // "keine Kurden?" wird durchgestrichen
  const tk = Wt(29, "keine");
  const kp = ramp(t, tk - 0.1, tk + 0.3) * (1 - ramp(t, S[30], S[30] + 0.3));
  if (kp > 0) {
    pill(cx, cy + 150, "keine Kurden?", kp, { dotCol: "#9a9c95", size: 28 });
    const st = easeOut(ramp(t, Wt(29, "nicht", 0) - 0.2, Wt(29, "mehr") + 0.1));
    ctx.globalAlpha = kp; ctx.strokeStyle = "#ff7a6a"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx - 120, cy + 152); ctx.lineTo(cx - 120 + 240 * st, cy + 148); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ Szenen-Tabelle
// [ab Satz, Zeichenfunktion]
const SCENES = [[0, scGrid], [1, scAtlas], [3, scMap], [7, scClass], [9, scPhone], [11, scTree], [13, scBread], [16, scWord], [19, scWedding], [23, scDance], [26, scFinale]];
function sceneStart(i) { return i === 0 ? -1 : S[SCENES[i][0]] - 0.3; }
function drawScenes(t) {
  for (let i = 0; i < SCENES.length; i++) {
    const a0 = sceneStart(i), a1 = i + 1 < SCENES.length ? sceneStart(i + 1) : 1e9;
    if (t < a0 - 0.01 || t > a1 + 0.35) continue;
    const fin = i === 0 ? 1 : easeOut(ramp(t, a0, a0 + 0.35));
    const fout = 1 - easeIO(ramp(t, a1, a1 + 0.35));
    const a = Math.min(fin, fout);
    if (a <= 0) continue;
    // sanfte Kamerafahrt: neue Szene kommt leicht von unten/groß
    const z = 1 + 0.06 * (1 - fin) - 0.04 * (1 - fout);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, TEXT_TOP - 50); ctx.clip();
    ctx.globalAlpha = a;
    ctx.translate(SCX, SCY + (1 - fin) * 40); ctx.scale(z, z); ctx.translate(-SCX, -SCY);
    SCENES[i][1](t);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ Text (Wort für Wort)
const SIZES = { plain: 62, big: 78, italic: 92, heavy: 116, counter: 150 };
const LH = { plain: 1.22, big: 1.18, italic: 1.08, heavy: 1.0, counter: 0.98 };
const ASC = { plain: 0.95, big: 0.95, italic: 0.88, heavy: 0.86, counter: 0.86 };
function setFont(style, size) {
  ctx.letterSpacing = "0px";
  if (style === "italic") ctx.font = `italic 400 ${size}px ISerif`;
  else if (style === "heavy" || style === "counter") { ctx.font = `900 ${size}px InterBlk`; ctx.letterSpacing = `${-size * 0.015}px`; }
  else ctx.font = `600 ${size}px InterSB`;
}
const LAYOUT = new Map();
function layoutCard(card) {
  if (LAYOUT.has(card)) return LAYOUT.get(card);
  const lines = [];
  let y = 0;
  for (const line of card.lines) {
    let scale = 1, items, width;
    for (let pass = 0; pass < 2; pass++) {
      items = []; width = 0;
      line.forEach((tok, i) => {
        const size = SIZES[tok.style] * scale;
        setFont(tok.style, size);
        const w = ctx.measureText(tok.text).width;
        const gap = i ? size * 0.26 : 0;
        width += gap;
        items.push({ tok, size, x: width, w });
        width += w;
      });
      if (width <= TEXT_W) break;
      scale *= TEXT_W / width;
    }
    const big = items.reduce((a, b) => (b.size > a.size ? b : a));
    const lh = big.size * LH[big.tok.style];
    lines.push({ items, width, y: y + big.size * ASC[big.tok.style], lh });
    y += lh;
  }
  const res = { lines, height: y };
  LAYOUT.set(card, res);
  return res;
}
function drawCard(card, t) {
  const L = layoutCard(card);
  const out = ramp(t, card.end - 0.2, card.end);
  if (out >= 1) return;
  for (const line of L.lines) {
    const x0 = TEXT_CX - line.width / 2;
    for (const it of line.items) {
      const tok = it.tok;
      const p = ramp(t, tok.s - 0.04, tok.s + 0.24);
      if (p <= 0) continue;
      const a = easeOut(p) * (1 - out);
      const blur = (1 - p) * 10 + out * 12;
      const dy = (1 - easeOut(p)) * 18;
      setFont(tok.style, it.size);
      ctx.globalAlpha = a;
      ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      const lime = tok.style === "italic" || tok.style === "counter";
      ctx.shadowColor = lime ? `rgba(${LIME_RGB},0.55)` : "rgba(255,255,255,0.3)";
      ctx.shadowBlur = tok.style === "heavy" || lime ? 30 : 14;
      ctx.fillStyle = lime ? LIME : "#f4f5f0";
      let txt = tok.text;
      if (tok.style === "counter") {
        const n = parseInt(txt, 10);
        const c = easeOut(ramp(t, tok.s - 0.05, tok.s + 0.7));
        txt = String(Math.max(1, Math.round(1 + (n - 1) * c)));
        const fw = ctx.measureText(txt).width;
        ctx.fillText(txt, x0 + it.x + (it.w - fw) / 2, TEXT_TOP + line.y + dy);
      } else ctx.fillText(txt, x0 + it.x, TEXT_TOP + line.y + dy);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  drawBackground(t);
  drawScenes(t);
  // dunkler Verlauf hinter dem Text
  const band = ctx.createLinearGradient(0, TEXT_TOP - 90, 0, TEXT_TOP + 60);
  band.addColorStop(0, "rgba(20,21,18,0)"); band.addColorStop(1, "rgba(20,21,18,0.55)");
  ctx.fillStyle = band; ctx.fillRect(0, TEXT_TOP - 90, W, H - TEXT_TOP + 90);
  const vg = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.3, W / 2, H * 0.45, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const card of TL.cards) if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = NOISE[Math.floor(t * 8) % NOISE.length];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.25), ramp(t, TL.duration - 1.0, TL.duration - 0.1));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

// Zeitpunkte für die Soundeffekte
window.exportEvents = function () {
  const tk = Wt(2, "Kurdistan");
  return {
    scenes: SCENES.map((s, i) => sceneStart(i)).filter(x => x > 0),
    cards: [0, 1, 2, 3].map(i => S[0] + 0.05 + i * 0.12),
    flagZoom: Wt(0, "Kurden"),
    typing: Array.from({ length: 9 }, (_, i) => tk - 0.25 + 0.55 * (i + 0.5) / 9),
    noHits: Wt(2, "nichts"),
    pins: ["Türkei", "Irak", "Iran", "Syrien"].map(n => Wt(6, n)),
    glowRegion: Wt(5, "größte"),
    tags: [Wt(3, "keine"), Wt(4, "nicht"), Wt(7, "neben"), Wt(11, "verwandt"), Wt(9, "Pause"), Wt(19, "Samstag"), Wt(23, "Takt"), Wt(24, "REIHE"), Wt(25, "vorne"), Wt(26, "Erdkunde")],
    eraserMove: Wt(8, "geborgt"),
    call: S[9], bubble: Wt(10, "Türkisch"),
    tree: [Wt(11, "Kurdisch"), Wt(11, "Persisch"), Wt(12, "Türkisch")], noLink: Wt(12, "Sprachfamilie"),
    words: [Wt(13, "NAN"), Wt(14, "Persisch"), Wt(14, "genauso"), Wt(15, "EKMEK"), Wt(16, "Wort")],
    doner: Wt(17, "Döner"), sure: [S[18], Wt(18, "SICHER")],
    invite: S[19], guests: [Wt(20, "500"), E[20]], known: Wt(21, "20"), du: Wt(22, "du"),
    drum: Wt(23, "Takt"), drumEnd: S[24] + 1.2, chain: [S[24], Wt(24, "REIHE")], cloth: S[25],
    timer: [Wt(27, "fünf"), Wt(28, "drei")], letgo: Wt(28, "LOSLASSEN"), strike: Wt(29, "nicht"),
    circle: S[29], finale: Wt(30, "GETANZT"),
    duration: TL.duration,
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  window.DURATION = TL.duration;
  S = TL.sentences.map(s => s.start);
  E = TL.sentences.map(s => s.end);
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"),
    document.fonts.load("900 50px InterBlk"), document.fonts.load("500 30px InterMed")]);
  buildStatic(); buildAtlas(); buildBread(); buildTables();
  return true;
};
