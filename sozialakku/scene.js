// "Gleicher Akku. Drei Ladegeräte." – Canvas-Animation (deutsche Version).
// render.js ruft window.setup() und dann window.renderFrame(t) für jedes Bild auf.
"use strict";

const W = 1080, H = 1920;
const FLOOR = 1010;                       // Bodenlinie
const XS = [215, 500, 785];               // Introvertiert, Ambivertiert, Extrovertiert
const TEXT_CX = 490, TEXT_W = 820;        // Text unter der Szene, frei von den Buttons rechts
const TEXT_Y = 1135;
window.DURATION = 13.7;

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function mix(c1, c2, k) {
  const a = c1.match(/\w\w/g).map(h => parseInt(h, 16)), b = c2.match(/\w\w/g).map(h => parseInt(h, 16));
  return "rgb(" + a.map((v, i) => Math.round(lerp(v, b[i], clamp(k)))).join(",") + ")";
}
// stückweise konstante / lineare Schlüsselwerte [[t, v], ...]
function step(keys, t) { let v = keys[0][1]; for (const [k, x] of keys) if (t >= k) v = x; return v; }
function lin(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i];
    return lerp(va, vb, easeIO((t - a) / (b - a)));
  }
  return keys[keys.length - 1][1];
}

// ------------------------------------------------------------------ Ablauf
// Szenen: party (0–5.3), home (5.45–11.4), door (11.4–Ende)
const T_DIM = 4.3, T_HOME = 5.45, T_DOOR = 11.4, T_PARTY2 = 11.95;

// Akkustand je Figur (Segmente 1–5), Laden-Blitz an/aus
const LEVEL = [
  [[0, 5], [1.4, 4], [1.9, 2], [2.35, 1], [T_HOME + 0.45, 2], [6.3, 3], [6.75, 4], [7.15, 5], [T_DOOR, 5]],
  [[0, 5], [2.35, 4], [3.3, 3], [6.0, 4], [8.35, 5]],
  [[0, 1], [1.3, 3], [1.9, 5], [6.5, 4], [6.9, 2], [7.6, 1], [12.35, 2], [12.85, 3], [13.25, 4]],
];
const CHARGING = [
  [[0, 0], [T_HOME, 1], [7.4, 0]],
  [[0, 0], [T_HOME, 1], [8.6, 0]],
  [[0, 1], [2.0, 0], [11.0, 1]],
];
const SPARKLE = [[7.2], [8.4], [1.95, 3.35]];   // "voll"-Funkeln

// Sprechblasen: [Figur, Start, Ende, Text, Versatz x, Versatz y] (relativ zum Kopf)
const BUBBLES = [
  [0, 0.95, 2.15, "~", 20, 0],
  [2, 1.45, 2.4, "♪", 10, 0],
  [2, 2.45, 4.0, "Juhuu!", -10, 0],
  [0, 2.85, 4.0, "Kann ich heim?", -5, 0],
  [1, 3.35, 4.0, "Kurze Pause …", 70, -40],
  [2, 6.95, 8.45, "Ist da wer?", 0, 0],
  [1, 7.4, 8.45, "Hallo? Erzähl alles!", -60, 6],
  [0, 11.55, 12.6, "Oh nein …", -10, 0],
  [1, 11.6, 12.6, "Ok, 1 Std. dann!", 30, -40],
];
const TITLE1 = "GLEICHER AKKU.", TITLE2 = "DREI LADEGERÄTE.";
const T_TITLE = [8.45, 9.2, 10.85];          // Zeile 1, Zeile 2, Ausblenden
const T_NOTE = 10.95;                        // Nachricht kommt an

// ------------------------------------------------------------------ Hintergrund
let CONF = [], CROWD = [], NOISE = [];
function buildStatic() {
  const R = rng(7);
  CONF = Array.from({ length: 140 }, () => ({
    x: R() * W, y0: R() * H, v: 60 + R() * 90, w: 6 + R() * 8, h: 10 + R() * 10, rot: R() * 6, vr: (R() - 0.5) * 6,
    c: ["#f25f8a", "#ffd25c", "#62d0ff", "#9b7cff", "#5ce0a0", "#ffffff"][Math.floor(R() * 6)], sway: R() * 6,
  }));
  const cols = ["#a99bd6", "#8f86b8", "#b8a8e6", "#9d93c7", "#c5b7f0", "#7e7aa3"];
  const hats = ["#5ad2c4", "#ff6f91", "#ffcf5a", "#8f7cff", "#62b0ff", "#ff9a5a"];
  for (let i = 0; i < 17; i++) {
    const row = i % 2;
    CROWD.push({
      x: 40 + i * 62 + R() * 20, row, s: row ? 0.5 : 0.62, c: cols[Math.floor(R() * cols.length)],
      hat: hats[Math.floor(R() * hats.length)], ph: R() * 6, sp: 5 + R() * 3,
    });
  }
  for (let k = 0; k < 4; k++) {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d"), img = g.createImageData(256, 256), Rn = rng(100 + k);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Rn() * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    NOISE.push(ctx.createPattern(c, "repeat"));
  }
}

// wie "partyhaft" ist die Szene gerade (Licht, Konfetti, bunte Wimpel)
function partyAmt(t) {
  if (t < T_DIM) return 1;
  if (t < T_HOME) return 1 - easeIO(ramp(t, T_DIM, T_DIM + 0.6));
  if (t < T_PARTY2) return 0;
  return easeOut(ramp(t, T_PARTY2, T_PARTY2 + 0.7));
}
const scene = t => (t < T_HOME ? "party" : t < T_DOOR ? "home" : "door");

function drawBackground(t) {
  const p = partyAmt(t);
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
  g.addColorStop(0, mix("17182a", "1f1438", p));
  g.addColorStop(1, mix("23263a", "34215a", p));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, FLOOR);
  const f = ctx.createLinearGradient(0, FLOOR, 0, H);
  f.addColorStop(0, mix("14151f", "1a1230", p));
  f.addColorStop(1, mix("0a0a10", "0b0815", p));
  ctx.fillStyle = f;
  ctx.fillRect(0, FLOOR, W, H - FLOOR);
  // Fußleiste
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, FLOOR - 4, W, 4);
}

function drawDoor(t, open) {
  const x = XS[1] - 70, y = FLOOR - 300, w = 140, h = 300;
  ctx.fillStyle = "#1f2538";
  rr(x - 10, y - 10, w + 20, h + 10, 6); ctx.fill();
  if (open > 0) {
    // Licht aus der offenen Tür
    ctx.fillStyle = `rgba(255,246,214,${0.95 * open})`;
    ctx.fillRect(x, y, w, h);
    const lg = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 520);
    lg.addColorStop(0, `rgba(255,220,150,${0.32 * open})`);
    lg.addColorStop(1, "rgba(255,220,150,0)");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(x, FLOOR); ctx.lineTo(x + w, FLOOR); ctx.lineTo(x + w + 190, FLOOR + 520); ctx.lineTo(x - 190, FLOOR + 520);
    ctx.fill();
    // Türblatt (aufgeschwungen)
    ctx.fillStyle = "#2b3350";
    ctx.beginPath();
    ctx.moveTo(x + w, y); ctx.lineTo(x + w - w * (1 - open * 0.75), y + 8);
    ctx.lineTo(x + w - w * (1 - open * 0.75), y + h - 6); ctx.lineTo(x + w, y + h); ctx.fill();
  } else {
    ctx.fillStyle = "#2b3350";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 3;
    ctx.strokeRect(x + 16, y + 18, w - 32, 110); ctx.strokeRect(x + 16, y + 150, w - 32, 130);
    ctx.fillStyle = "#8d93ab";
    ctx.beginPath(); ctx.arc(x + w - 22, y + 160, 6, 0, 7); ctx.fill();
  }
}

function drawBunting(t) {
  const p = partyAmt(t);
  const cols = ["#ff6f91", "#ffcf5a", "#5ad2c4", "#8f7cff", "#62b0ff", "#ff9a5a"];
  for (let row = 0; row < 2; row++) {
    const y0 = 150 + row * 62, sag = 34;
    const yAt = x => y0 + sag * Math.sin(Math.PI * ((x / W * 2) % 1)) * (row ? 0.8 : 1);
    ctx.strokeStyle = `rgba(200,200,220,${0.25 + 0.2 * p})`; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -10; x <= W + 10; x += 10) (x < 0 ? ctx.moveTo(x, yAt(0)) : ctx.lineTo(x, yAt(x)));
    ctx.stroke();
    for (let i = 0; i < 24; i++) {
      const x = 12 + i * 45 + row * 22, y = yAt(x);
      const sw = Math.sin(t * 2 + i + row) * 2;
      ctx.fillStyle = mix("3a3d52", cols[(i + row * 3) % 6].slice(1), p);
      ctx.beginPath(); ctx.moveTo(x - 15, y); ctx.lineTo(x + 15, y); ctx.lineTo(x + sw, y + 36); ctx.fill();
    }
  }
}

function drawDisco(t) {
  const p = partyAmt(t);
  if (p <= 0.01) return;
  const bx = 540, by = 300 - (1 - p) * 260;
  // Lichtstrahlen
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const beams = [["255,80,170", 0], ["80,220,255", 1.3], ["170,110,255", 2.6], ["255,210,90", 3.9], ["120,255,190", 5.1]];
  for (const [c, ph] of beams) {
    const a = Math.sin(t * 0.9 + ph) * 0.75;
    const len = 1250, sp = 0.13;
    const g = ctx.createLinearGradient(bx, by, bx + Math.sin(a) * len, by + Math.cos(a) * len);
    g.addColorStop(0, `rgba(${c},${0.32 * p})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.sin(a - sp) * len, by + Math.cos(a - sp) * len);
    ctx.lineTo(bx + Math.sin(a + sp) * len, by + Math.cos(a + sp) * len);
    ctx.fill();
  }
  ctx.restore();
  // Kugel
  ctx.globalAlpha = p;
  ctx.strokeStyle = "rgba(220,220,230,0.6)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, by - 40); ctx.stroke();
  const r = 42;
  const bg = ctx.createRadialGradient(bx - 12, by - 14, 4, bx, by, r);
  bg.addColorStop(0, "#ffffff"); bg.addColorStop(0.5, "#b9bccb"); bg.addColorStop(1, "#6b6f82");
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.clip();
  ctx.strokeStyle = "rgba(60,60,80,0.45)"; ctx.lineWidth = 1.5;
  for (let k = -4; k <= 4; k++) {
    ctx.beginPath(); ctx.moveTo(bx - r, by + k * 10); ctx.lineTo(bx + r, by + k * 10); ctx.stroke();
    const off = ((t * 18) % 10);
    ctx.beginPath(); ctx.moveTo(bx + k * 10 + off, by - r); ctx.lineTo(bx + k * 10 + off, by + r); ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawLamp(t, a) {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  // Lichtkegel
  const g = ctx.createLinearGradient(0, 300, 0, FLOOR + 40);
  g.addColorStop(0, "rgba(255,214,140,0.55)");
  g.addColorStop(1, "rgba(255,214,140,0.05)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(62, 318); ctx.lineTo(170, 318); ctx.lineTo(430, FLOOR + 40); ctx.lineTo(-60, FLOOR + 40);
  ctx.fill();
  const pool = ctx.createRadialGradient(200, FLOOR + 10, 10, 200, FLOOR + 10, 300);
  pool.addColorStop(0, "rgba(255,214,140,0.25)"); pool.addColorStop(1, "rgba(255,214,140,0)");
  ctx.fillStyle = pool;
  ctx.fillRect(-100, FLOOR - 200, 600, 500);
  // Stehlampe
  ctx.fillStyle = "#3a3f55";
  ctx.fillRect(38, 300, 8, FLOOR - 300);
  ctx.fillRect(10, FLOOR - 8, 64, 8);
  ctx.fillStyle = "#e9d5a6";
  ctx.beginPath(); ctx.moveTo(52, 260); ctx.lineTo(160, 260); ctx.lineTo(178, 320); ctx.lineTo(48, 320); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawConfetti(t, a) {
  if (a <= 0) return;
  ctx.globalAlpha = a;
  for (const c of CONF) {
    const y = (c.y0 + c.v * t) % (H + 40) - 20;
    const x = c.x + Math.sin(t * 1.5 + c.sway) * 14;
    ctx.save(); ctx.translate(x, y); ctx.rotate(c.rot + c.vr * t);
    ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h * Math.abs(Math.cos(t * 3 + c.sway)) + 2);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Figuren
// Kapsel-Körper + runder Kopf. pose: {sit, arms:"down|up|wave|phoneEar|console|cup|holdPhone|lap", face, tint}
function face(x, y, r, kind, t) {
  ctx.strokeStyle = "#2a2433"; ctx.fillStyle = "#2a2433"; ctx.lineWidth = r * 0.08; ctx.lineCap = "round";
  const ex = r * 0.34, ey = y - r * 0.05;
  const blink = (Math.sin(t * 1.7 + x) > 0.985) ? 0.15 : 1;
  const dot = (dx) => { ctx.beginPath(); ctx.ellipse(x + dx, ey, r * 0.075, r * 0.1 * blink, 0, 0, 7); ctx.fill(); };
  const arcEye = (dx, up) => { ctx.beginPath(); ctx.arc(x + dx, ey + (up ? r * 0.06 : -r * 0.04), r * 0.12, up ? Math.PI * 1.1 : 0.15, up ? Math.PI * 1.9 : Math.PI - 0.15); ctx.stroke(); };
  const blush = () => {
    ctx.fillStyle = "rgba(255,120,140,0.35)";
    ctx.beginPath(); ctx.ellipse(x - r * 0.55, y + r * 0.2, r * 0.16, r * 0.09, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.55, y + r * 0.2, r * 0.16, r * 0.09, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#2a2433";
  };
  switch (kind) {
    case "calm": dot(-ex); dot(ex); ctx.beginPath(); ctx.arc(x, y + r * 0.22, r * 0.16, 0.2, Math.PI - 0.2); ctx.stroke(); break;
    case "happy": arcEye(-ex, true); arcEye(ex, true); blush(); ctx.beginPath(); ctx.arc(x, y + r * 0.2, r * 0.2, 0.15, Math.PI - 0.15); ctx.stroke(); break;
    case "sing": arcEye(-ex, true); arcEye(ex, true); ctx.beginPath(); ctx.ellipse(x, y + r * 0.32, r * 0.13, r * 0.17, 0, 0, 7); ctx.fill(); break;
    case "meh": dot(-ex); dot(ex); ctx.beginPath(); ctx.moveTo(x - ex - r * 0.14, ey - r * 0.2); ctx.lineTo(x - ex + r * 0.12, ey - r * 0.16); ctx.moveTo(x + ex + r * 0.14, ey - r * 0.2); ctx.lineTo(x + ex - r * 0.12, ey - r * 0.16); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - r * 0.15, y + r * 0.3); ctx.lineTo(x + r * 0.15, y + r * 0.3); ctx.stroke(); break;
    case "dead": for (const dx of [-ex, ex]) { ctx.beginPath(); ctx.moveTo(x + dx - r * 0.1, ey - r * 0.1); ctx.lineTo(x + dx + r * 0.1, ey + r * 0.1); ctx.moveTo(x + dx + r * 0.1, ey - r * 0.1); ctx.lineTo(x + dx - r * 0.1, ey + r * 0.1); ctx.stroke(); }
      ctx.beginPath(); for (let k = 0; k <= 6; k++) ctx.lineTo(x - r * 0.18 + k * r * 0.06, y + r * 0.32 + (k % 2 ? -1 : 1) * r * 0.04); ctx.stroke(); break;
    case "tired": for (const dx of [-ex, ex]) { ctx.beginPath(); ctx.moveTo(x + dx - r * 0.12, ey); ctx.lineTo(x + dx + r * 0.12, ey); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - r * 0.12, y + r * 0.3); ctx.lineTo(x + r * 0.12, y + r * 0.3); ctx.stroke(); break;
    case "content": dot(-ex); dot(ex); blush(); ctx.beginPath(); ctx.arc(x, y + r * 0.18, r * 0.14, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.fillStyle = "#e9707e"; ctx.beginPath(); ctx.ellipse(x + r * 0.05, y + r * 0.36, r * 0.05, r * 0.07, 0, 0, 7); ctx.fill(); break;
    case "sad": dot(-ex); dot(ex); ctx.beginPath(); ctx.moveTo(x - ex - r * 0.14, ey - r * 0.14); ctx.lineTo(x - ex + r * 0.1, ey - r * 0.24); ctx.moveTo(x + ex + r * 0.14, ey - r * 0.14); ctx.lineTo(x + ex - r * 0.1, ey - r * 0.24); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y + r * 0.42, r * 0.17, Math.PI + 0.35, -0.35); ctx.stroke();
      ctx.fillStyle = "#7fd0ff"; ctx.beginPath(); ctx.ellipse(x - ex - r * 0.04, ey + r * 0.24 + (t * 30 % 12), r * 0.05, r * 0.08, 0, 0, 7); ctx.fill(); break;
    case "shock": ctx.beginPath(); ctx.arc(x - ex, ey, r * 0.11, 0, 7); ctx.arc(x + ex, ey, r * 0.11, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x - ex + 3, ey - 3, r * 0.04, 0, 7); ctx.arc(x + ex + 3, ey - 3, r * 0.04, 0, 7); ctx.fill(); ctx.fillStyle = "#2a2433"; ctx.beginPath(); ctx.ellipse(x, y + r * 0.34, r * 0.08, r * 0.11, 0, 0, 7); ctx.fill(); break;
    case "worried": dot(-ex); dot(ex); ctx.beginPath(); ctx.moveTo(x - ex - r * 0.14, ey - r * 0.14); ctx.lineTo(x - ex + r * 0.1, ey - r * 0.24); ctx.moveTo(x + ex + r * 0.14, ey - r * 0.14); ctx.lineTo(x + ex - r * 0.1, ey - r * 0.24); ctx.stroke();
      ctx.beginPath(); for (let k = 0; k <= 6; k++) ctx.lineTo(x - r * 0.18 + k * r * 0.06, y + r * 0.32 + (k % 2 ? -1 : 1) * r * 0.035); ctx.stroke(); break;
  }
}

function limb(x1, y1, x2, y2, w, col) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function redCup(x, y, s = 1) {
  ctx.fillStyle = "#e23b47";
  ctx.beginPath(); ctx.moveTo(x - 13 * s, y - 16 * s); ctx.lineTo(x + 13 * s, y - 16 * s); ctx.lineTo(x + 10 * s, y + 16 * s); ctx.lineTo(x - 10 * s, y + 16 * s); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(x - 12 * s, y - 10 * s, 24 * s, 4 * s);
}
function phone(x, y, rot, glow) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (glow > 0) { ctx.shadowColor = `rgba(170,210,255,${glow})`; ctx.shadowBlur = 40; }
  ctx.fillStyle = "#24252f"; rr(-15, -26, 30, 52, 6); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = glow > 0 ? `rgba(190,225,255,${0.4 + 0.6 * glow})` : "#3a3d4c"; rr(-11, -21, 22, 40, 3); ctx.fill();
  ctx.restore();
}
function consoleDev(x, y) {
  ctx.fillStyle = "#5ad2c4"; rr(x - 92, y - 26, 44, 56, 18); ctx.fill();
  ctx.fillStyle = "#a990ff"; rr(x + 48, y - 26, 44, 56, 18); ctx.fill();
  ctx.fillStyle = "#24252f"; rr(x - 58, y - 30, 116, 64, 8); ctx.fill();
  ctx.fillStyle = `rgba(120,200,255,0.35)`; rr(x - 50, y - 23, 100, 50, 4); ctx.fill();
  ctx.fillStyle = "#24252f"; ctx.beginPath(); ctx.arc(x - 72, y - 6, 7, 0, 7); ctx.arc(x + 72, y + 6, 6, 0, 7); ctx.fill();
}

function figure(x, base, o, t) {
  const s = o.s || 1;
  const col = o.col, dark = o.dark || "rgba(0,0,0,0.12)";
  const bw = 112 * s, bh = (o.sit ? 150 : 215) * s, r = 56 * s;
  const bob = o.bob || 0;
  const by = base - bh + bob;              // Oberkante Körper
  const hx = x + (o.lean || 0), hy = by - r * 0.55;
  ctx.globalAlpha = o.alpha ?? 1;
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(x, base + 4, bw * 0.6, 10 * s, 0, 0, 7); ctx.fill();
  // Arme hinter dem Körper
  const sh = by + 34 * s, aw = 30 * s;
  const arms = o.arms || "down";
  const L = x - bw * 0.42, R = x + bw * 0.42;
  const wave = Math.sin(t * 8) * 10 * s;
  // Körper
  ctx.fillStyle = col;
  rr(x - bw / 2, by, bw, bh + 6 * s, bw / 2); ctx.fill();
  ctx.fillStyle = dark;
  rr(x + bw * 0.12, by + 10 * s, bw * 0.36, bh - 10 * s, bw * 0.18); ctx.fill();
  // Arme
  const ac = col;
  if (arms === "up") { limb(L, sh, L - 40 * s, sh - 110 * s + wave, aw, ac); limb(R, sh, R + 40 * s, sh - 110 * s - wave, aw, ac); }
  else if (arms === "upOne") { limb(L, sh, L - 30 * s, sh + 70 * s, aw, ac); limb(R, sh, R + 45 * s, sh - 105 * s + wave, aw, ac); }
  else if (arms === "cup") { limb(L, sh, L - 14 * s, sh + 95 * s, aw, ac); limb(R, sh, R + 26 * s, sh + 72 * s, aw, ac); redCup(R + 30 * s, sh + 82 * s, s); }
  else if (arms === "cupUp") { limb(L, sh, L - 14 * s, sh + 95 * s, aw, ac); limb(R, sh, R + 34 * s, sh - 80 * s + wave * 0.5, aw, ac); redCup(R + 36 * s, sh - 96 * s + wave * 0.5, s); }
  else if (arms === "phoneEar") { limb(L, sh, L - 6 * s, sh + 80 * s, aw, ac); limb(R, sh, hx + r * 0.85, hy + 10 * s, aw, ac); phone(hx + r * 0.9, hy - 4 * s, 0.35, 0); }
  else if (arms === "holdPhone") { limb(L, sh, L - 10 * s, sh + 90 * s, aw, ac); limb(R, sh, R - 4 * s, sh + 76 * s, aw, ac); phone(R - 8 * s, sh + 82 * s, 0.1, o.glow || 0); }
  else if (arms === "console") { limb(L, sh, x - 50 * s, sh + 66 * s, aw, ac); limb(R, sh, x + 50 * s, sh + 66 * s, aw, ac); }
  else if (arms === "lap") { limb(L, sh, x - 26 * s, sh + 70 * s, aw, ac); limb(R, sh, x + 26 * s, sh + 70 * s, aw, ac); }
  else { limb(L, sh, L - 10 * s, sh + 92 * s, aw, ac); limb(R, sh, R + 10 * s, sh + 92 * s, aw, ac); }
  // Kopf
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(hx, hy, r, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath(); ctx.arc(hx - r * 0.3, hy - r * 0.35, r * 0.28, 0, 7); ctx.fill();
  face(hx, hy, r, o.face, t);
  if (o.hat) {
    ctx.fillStyle = o.hat;
    ctx.beginPath(); ctx.moveTo(hx - r * 0.42, hy - r * 0.78); ctx.lineTo(hx + r * 0.42, hy - r * 0.78); ctx.lineTo(hx + r * 0.05, hy - r * 1.75); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(hx - r * 0.25, hy - r * 1.05); ctx.lineTo(hx + r * 0.28, hy - r * 1.15); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx + r * 0.05, hy - r * 1.78, 6 * s, 0, 7); ctx.fill();
  }
  if (arms === "console") consoleDev(x, sh + 74 * s);
  ctx.globalAlpha = 1;
  return { hx, hy, r };
}

function beanbag(x, c = "#5b3f9e") {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - 150, FLOOR);
  ctx.bezierCurveTo(x - 175, FLOOR - 110, x - 120, FLOOR - 150, x - 60, FLOOR - 120);
  ctx.bezierCurveTo(x - 20, FLOOR - 100, x + 20, FLOOR - 100, x + 60, FLOOR - 120);
  ctx.bezierCurveTo(x + 120, FLOOR - 150, x + 175, FLOOR - 110, x + 150, FLOOR);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath(); ctx.ellipse(x - 80, FLOOR - 90, 40, 18, -0.4, 0, 7); ctx.fill();
}
function armchair(x) {
  ctx.fillStyle = "#6f8f7c";
  rr(x - 115, FLOOR - 250, 230, 180, 34); ctx.fill();           // Lehne
}
function armchairFront(x) {
  ctx.fillStyle = "#86a693";
  rr(x - 92, FLOOR - 115, 184, 100, 18); ctx.fill();             // Sitz
  ctx.fillStyle = "#7a9a87";
  rr(x - 135, FLOOR - 170, 52, 160, 24); ctx.fill();
  rr(x + 83, FLOOR - 170, 52, 160, 24); ctx.fill();
  ctx.fillStyle = "#3a3f55";
  ctx.fillRect(x - 118, FLOOR - 12, 10, 12); ctx.fillRect(x + 108, FLOOR - 12, 10, 12);
}

function drawCrowd(t, a, enter) {
  if (a <= 0) return;
  for (const c of CROWD) {
    if (Math.abs(c.x - XS[0]) < 70 && !c.row) continue;
    const bob = Math.abs(Math.sin(t * c.sp + c.ph)) * -12;
    const dx = enter ? (c.x - XS[1]) * (1 - enter) : 0;
    figure(c.x - dx, FLOOR - 70 - c.row * 40, {
      s: c.s, col: c.c, face: ["happy", "sing", "calm"][Math.floor(c.ph) % 3], hat: c.hat, bob,
      arms: Math.floor(c.ph * 3) % 4 === 0 ? "up" : "down", alpha: a * (c.row ? 0.75 : 0.95),
    }, t);
  }
}

// ------------------------------------------------------------------ Akkus
const LABELS = ["INTROVERTIERT", "AMBIVERTIERT", "EXTROVERTIERT"];
const LCOL = ["#a98bff", "#59d39a", "#ff7aa8"];
function segColor(n) { return n <= 1 ? "#ef3e45" : n <= 3 ? "#f6a623" : "#36d06a"; }
function bolt(x, y, s, a) {
  ctx.globalAlpha = a;
  ctx.fillStyle = "#ffd23f";
  ctx.beginPath();
  ctx.moveTo(x + 4 * s, y - 20 * s); ctx.lineTo(x - 9 * s, y + 3 * s); ctx.lineTo(x, y + 3 * s);
  ctx.lineTo(x - 4 * s, y + 20 * s); ctx.lineTo(x + 9 * s, y - 3 * s); ctx.lineTo(x, y - 3 * s); ctx.fill();
  ctx.globalAlpha = 1;
}
function drawBatteries(t) {
  for (let i = 0; i < 3; i++) {
    const cx = XS[i], y = 470;
    ctx.font = "600 27px InterSB";
    ctx.letterSpacing = "2px";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f2f0f8";
    ctx.fillText(LABELS[i], cx, 425);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = LCOL[i];
    ctx.fillRect(cx - 95, 438, 190, 4);
    // Gehäuse
    const bw = 186, bh = 72;
    ctx.lineWidth = 6; ctx.strokeStyle = "#f4f4f8";
    rr(cx - bw / 2, y, bw, bh, 14); ctx.stroke();
    ctx.fillStyle = "rgba(10,10,18,0.55)"; rr(cx - bw / 2 + 3, y + 3, bw - 6, bh - 6, 11); ctx.fill();
    ctx.fillStyle = "#f4f4f8"; rr(cx + bw / 2 + 4, y + 24, 9, 24, 3); ctx.fill();
    // Segmente (das jeweils neue Segment blendet ein)
    const lvl = step(LEVEL[i], t);
    let since = 9;
    for (const [k] of LEVEL[i]) if (t >= k) since = t - k;
    const pop = easeOut(ramp(since, 0, 0.25));
    const c = segColor(lvl);
    for (let k = 0; k < lvl; k++) {
      ctx.globalAlpha = k === lvl - 1 ? 0.35 + 0.65 * pop : 1;
      ctx.fillStyle = c;
      rr(cx - bw / 2 + 13 + k * 33, y + 13, 28, bh - 26, 4); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Laden
    if (step(CHARGING[i], t)) bolt(cx - bw / 2 - 26, y + bh / 2, 1, 0.6 + 0.4 * Math.sin(t * 9));
    // Funkeln bei voll
    for (const ts of SPARKLE[i]) {
      const p = ramp(t, ts, ts + 0.6);
      if (p <= 0 || p >= 1) continue;
      ctx.strokeStyle = `rgba(90,230,130,${1 - p})`; ctx.lineWidth = 4;
      for (let k = 0; k < 10; k++) {
        const a = k / 10 * Math.PI * 2, r1 = 110 + 30 * p, r2 = r1 + 26;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, y + bh / 2 + Math.sin(a) * r1 * 0.5);
        ctx.lineTo(cx + Math.cos(a) * r2, y + bh / 2 + Math.sin(a) * r2 * 0.5);
        ctx.stroke();
      }
    }
  }
  ctx.textAlign = "left";
}

// ------------------------------------------------------------------ Sprechblasen
function bubble(x, y, txt, p) {
  const sc = back(p);
  if (sc <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  const icon = txt === "~" || txt === "♪";
  ctx.font = "600 36px InterSB";
  const w = icon ? 92 : ctx.measureText(txt).width + 50, h = icon ? 74 : 72;
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#fbfbfd";
  rr(-w / 2, -h, w, h, h / 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(14, -2); ctx.lineTo(-4, 22); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = "#1d1b26";
  if (txt === "~") {
    ctx.strokeStyle = "#1d1b26"; ctx.lineWidth = 4;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let u = 0; u <= 1; u += 0.05) ctx.lineTo(-30 + u * 60, -h / 2 - 14 + k * 13 + Math.sin(u * 14 + k) * 4);
      ctx.stroke();
    }
  } else if (txt === "♪") {
    ctx.font = "900 46px InterBlk"; ctx.textAlign = "center"; ctx.fillText("♪", 0, -h / 2 + 16);
  } else {
    ctx.textAlign = "center"; ctx.fillText(txt, 0, -h / 2 + 13);
  }
  ctx.textAlign = "left";
  ctx.restore();
}
function drawBubbles(t, heads) {
  for (const [who, a, b, txt, dx, dy] of BUBBLES) {
    if (t < a || t > b + 0.3) continue;
    const p = Math.min(ramp(t, a, a + 0.3), 1 - ramp(t, b, b + 0.22));
    const h = heads[who];
    if (!h) continue;
    // Blasen leicht zur Bildmitte hin, damit sie nicht aus dem Bild ragen
    bubble(clamp(h.hx + dx, 175, 860), h.hy - h.r - 26 + dy, txt, p);
  }
}

// ------------------------------------------------------------------ Text unter der Szene
function drawTitle(t) {
  const [t1, t2, tout] = T_TITLE;
  if (t < t1 - 0.1 || t > tout + 0.4) return;
  const out = ramp(t, tout, tout + 0.35);
  let size = 92;
  ctx.font = `900 ${size}px InterBlk`;
  const wmax = Math.max(ctx.measureText(TITLE1).width, ctx.measureText(TITLE2).width);
  if (wmax > TEXT_W) size *= TEXT_W / wmax;
  ctx.font = `900 ${size}px InterBlk`;
  const lines = [[TITLE1, "#ffffff", t1, 0], [TITLE2, "#ffad2e", t2, size * 1.08]];
  for (const [txt, col, ts, dy] of lines) {
    const w = ctx.measureText(txt).width;
    let x = TEXT_CX - w / 2;
    // Buchstaben von links nach rechts mit Unschärfe einblenden
    for (let i = 0; i < txt.length; i++) {
      const ch = txt[i];
      const p = ramp(t, ts + i * 0.035, ts + i * 0.035 + 0.3);
      if (p > 0) {
        ctx.globalAlpha = easeOut(p) * (1 - out);
        const bl = (1 - p) * 12 + out * 10;
        ctx.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : "none";
        ctx.fillStyle = col;
        ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 18;
        ctx.fillText(ch, x, TEXT_Y + dy + size * 0.8 + (1 - easeOut(p)) * 14);
      }
      x += ctx.measureText(ch).width;
    }
  }
  ctx.filter = "none"; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

function drawNotification(t) {
  if (t < T_NOTE) return;
  const p = easeOut(ramp(t, T_NOTE, T_NOTE + 0.35));
  const out = ramp(t, 12.75, 13.1);
  const w = 740, h = 132, x = TEXT_CX - w / 2, y = TEXT_Y + (1 - p) * 60;
  ctx.globalAlpha = p * (1 - out);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  ctx.fillStyle = "rgba(242,242,247,0.97)";
  rr(x, y, w, h, 30); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  // App-Symbol
  ctx.fillStyle = "#34c759"; rr(x + 26, y + 30, 70, 70, 16); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(x + 61, y + 62, 23, 19, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 46, y + 74); ctx.lineTo(x + 42, y + 88); ctx.lineTo(x + 56, y + 79); ctx.fill();
  ctx.fillStyle = "#111"; ctx.font = "900 34px InterBlk"; ctx.fillText("LEA", x + 120, y + 58);
  ctx.fillStyle = "#8a8a8e"; ctx.font = "500 28px InterMed"; ctx.textAlign = "right"; ctx.fillText("jetzt", x + w - 30, y + 56); ctx.textAlign = "left";
  ctx.fillStyle = "#111"; ctx.font = "600 36px InterSB"; ctx.fillText("Wir kommen zu dir!!", x + 120, y + 104);
  ctx.globalAlpha = 1;
}

function bell(x, y, t) {
  const p = ramp(t, T_NOTE, T_NOTE + 0.2) * (1 - ramp(t, T_DOOR - 0.05, T_DOOR));
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 28) * 0.35); ctx.globalAlpha = p;
  ctx.fillStyle = "#ffc93c";
  ctx.beginPath(); ctx.moveTo(-26, 18); ctx.quadraticCurveTo(-24, -30, 0, -32); ctx.quadraticCurveTo(24, -30, 26, 18); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 26, 8, 0, 7); ctx.fill();
  ctx.strokeStyle = "#ffc93c"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(0, -4, 48, -2.6, -2.0); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -4, 48, -1.1, -0.5); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ Szenen
const C_I = "#ece8f5", C_A = "#efcfa5", C_E = "#f1eff9", C_BLUE = "#8e93c4";

function drawScene(t) {
  const sc = scene(t);
  const heads = [];
  drawBackground(t);
  drawBunting(t);
  drawDisco(t);
  if (sc === "party") {
    const dim = easeIO(ramp(t, T_DIM, T_DIM + 0.6));
    drawDoor(t, easeOut(ramp(t, T_DIM + 0.2, T_DIM + 0.6)));
    drawCrowd(t, 1 - dim, 0);
    beanbag(XS[0]);
    const lvlI = step(LEVEL[0], t);
    const fI = t < 0.9 ? "calm" : t < 1.9 ? "meh" : t < 2.4 ? "tired" : "dead";
    heads[0] = figure(XS[0], FLOOR - 95, { sit: 1, col: mix(C_I.slice(1), C_BLUE.slice(1), dim * 0.8), face: dim > 0.5 ? "tired" : fI, arms: "lap", alpha: 1 - dim * 0.55, hat: t < 0.9 ? "#ff6f91" : null }, t);
    const fA = t < 2.3 ? "sing" : t < 3.3 ? "calm" : "meh";
    heads[1] = figure(XS[1], FLOOR, { col: C_A, face: dim > 0.3 ? "content" : fA, arms: "cup", bob: t < 2.3 ? -Math.abs(Math.sin(t * 6)) * 10 : 0 }, t);
    const fE = (Math.floor(t * 2) % 3 === 2) ? "happy" : "sing";
    heads[2] = figure(XS[2], FLOOR, { col: C_E, face: fE, arms: lvlI < 3 || t > 1.4 ? "up" : "upOne", bob: -Math.abs(Math.sin(t * 7)) * 16 }, t);
    redCup(XS[2] + 130, FLOOR - 14, 0.8);
  } else if (sc === "home") {
    drawLamp(t, 1);
    drawDoor(t, 0);
    armchair(XS[1]);
    beanbag(XS[0]);
    const lv = step(LEVEL[0], t);
    heads[0] = figure(XS[0], FLOOR - 95, { sit: 1, col: "#f3e2c4", face: lv >= 5 ? "content" : "calm", arms: "console" }, t);
    const call = t >= 7.3;
    heads[1] = figure(XS[1], FLOOR - 110, { sit: 1, col: C_A, face: call ? "happy" : "content", arms: call ? "phoneEar" : "lap" }, t);
    armchairFront(XS[1]);
    if (!call) { ctx.fillStyle = "#d9474f"; rr(XS[1] - 42, FLOOR - 150, 84, 56, 8); ctx.fill(); ctx.fillStyle = "#f2c94c"; ctx.fillRect(XS[1] - 6, FLOOR - 150, 12, 56); }
    // Extrovertiert wird blass und traurig
    const fade = easeIO(ramp(t, 6.2, 7.6));
    const note = t >= T_NOTE;
    heads[2] = figure(XS[2], FLOOR, { col: mix(C_E.slice(1), C_BLUE.slice(1), note ? fade * 0.6 : fade), face: note ? "shock" : t < 6.3 ? "calm" : "sad", arms: "holdPhone", glow: note ? 0.7 + 0.3 * Math.sin(t * 12) : 0, lean: note ? Math.sin(t * 30) * 2 : 0 }, t);
    bell(XS[2] + 2, heads[2].hy - 150, t);
    redCup(XS[2] + 130, FLOOR - 14, 0.8);
    ctx.save(); ctx.translate(XS[2] + 190, FLOOR - 8); ctx.rotate(1.4); redCup(0, 0, 0.8); ctx.restore();
  } else {
    const enter = easeOut(ramp(t, T_PARTY2, T_PARTY2 + 0.9));
    drawLamp(t, 0.5 * (1 - partyAmt(t)));
    drawDoor(t, 1);
    drawCrowd(t, enter, enter);
    beanbag(XS[0]);
    heads[0] = figure(XS[0], FLOOR - 95, { sit: 1, col: "#f3e2c4", face: "worried", arms: "lap" }, t);
    heads[1] = figure(XS[1] + 55, FLOOR, { col: "#e8bf8c", face: "happy", arms: "cupUp" }, t);
    heads[2] = figure(XS[2], FLOOR, { col: C_E, face: "sing", arms: "up", bob: -Math.abs(Math.sin(t * 8)) * 22 }, t);
    redCup(XS[2] + 130, FLOOR - 14, 0.8);
  }
  drawConfetti(t, partyAmt(t));
  drawBatteries(t);
  drawBubbles(t, heads);
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  // sanfter Zoom (Kamera atmet leicht), Text bleibt fest
  const z = 1 + 0.025 * Math.sin(t * 0.5) + (t > T_DOOR ? 0.03 * easeOut(ramp(t, T_DOOR, T_DOOR + 1.5)) : 0);
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 760 - 760 * z);
  drawScene(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H * 0.4, H * 0.25, W / 2, H * 0.45, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  drawTitle(t);
  drawNotification(t);

  // Szenenwechsel: kurz abdunkeln
  const cut = Math.max(1 - Math.abs(t - (T_HOME - 0.02)) / 0.16, 1 - Math.abs(t - T_DOOR) / 0.1, 0);
  if (cut > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(cut)})`; ctx.fillRect(0, 0, W, H); }

  ctx.globalAlpha = 0.03;
  ctx.fillStyle = NOISE[Math.floor(t * 8) % NOISE.length];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.2), ramp(t, window.DURATION - 0.45, window.DURATION - 0.05));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

// Zeitpunkte für die Soundeffekte
window.exportEvents = function () {
  const up = [], down = [];
  LEVEL.forEach((keys, i) => keys.forEach(([k, v], j) => { if (j) (v > keys[j - 1][1] ? up : down).push({ t: k, who: i, v }); }));
  return {
    up, down,
    full: SPARKLE.flat(),
    bubbles: BUBBLES.map(b => ({ t: b[1], who: b[0], end: b[2] })),
    dim: T_DIM, home: T_HOME, door: T_DOOR, party2: T_PARTY2,
    title: T_TITLE, note: T_NOTE, call: 7.3,
    duration: window.DURATION,
  };
};

window.setup = async function () {
  await Promise.all([document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk"), document.fonts.load("500 30px InterMed")]);
  buildStatic();
  return true;
};
