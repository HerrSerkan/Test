// "Frühaufsteher / Nachteule / Immer müde" – deutsche Version (1080x1920), ohne Sprecher.
// Gezeichnet im Raster des Originals (576 x 1024) und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 12.2;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const moonCv = document.createElement("canvas"); moonCv.width = moonCv.height = 64;
function crescent(x, y, r, col) {
  const m = moonCv.getContext("2d");
  m.clearRect(0, 0, 64, 64);
  m.fillStyle = col; m.beginPath(); m.arc(32, 32, 30, 0, Math.PI * 2); m.fill();
  m.globalCompositeOperation = "destination-out";
  m.beginPath(); m.arc(48, 22, 26, 0, Math.PI * 2); m.fill();
  m.globalCompositeOperation = "source-over";
  ctx.drawImage(moonCv, x - r, y - r, 2 * r, 2 * r);
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  if (a <= 0.004) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgb(c, a)); g.addColorStop(1, rgb(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
// Zustand zur Zeit t aus [[t, wert], ...]
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
// Keyframes [t, a, b, ...] weich interpoliert
function keys(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}

// ------------------------------------------------------------ Uhr
const CLOCK = [[0, "05:00"], [0.4, "05:30"], [1.0, "06:00"], [1.6, "06:30"], [2.0, "07:00"], [2.3, "07:30"], [2.5, "08:00"],
  [2.7, "08:30"], [2.8, "09:00"], [3.0, "09:30"], [3.1, "10:00"], [3.2, "10:30"], [3.4, "11:00"], [3.5, "11:30"], [3.7, "12:00"],
  [3.8, "12:30"], [4.0, "13:00"], [4.2, "13:30"], [4.4, "14:00"], [4.6, "14:30"], [4.8, "15:00"], [5.0, "15:30"], [5.2, "16:00"],
  [5.4, "16:30"], [5.6, "17:00"], [5.8, "17:30"], [6.0, "18:00"], [6.2, "18:30"], [6.5, "19:00"], [6.7, "19:30"], [7.0, "20:00"],
  [7.3, "20:30"], [7.5, "21:00"], [7.8, "21:30"], [8.0, "22:00"], [8.2, "22:30"], [8.4, "23:00"], [8.6, "23:30"], [8.8, "00:00"],
  [9.0, "00:30"], [9.2, "01:00"], [9.4, "01:30"], [9.7, "02:06"], [9.8, "02:16"], [9.9, "02:25"], [10.0, "02:32"], [10.1, "02:38"],
  [10.2, "02:44"], [10.3, "02:49"], [10.4, "02:54"], [10.5, "02:56"], [10.6, "02:58"], [10.7, "02:59"], [10.8, "03:00"],
  [11.5, "03:30"], [11.6, "04:00"], [11.8, "04:30"]];
const T_THREE = 10.8;
// fortlaufende Stunde (für Himmel, Sonne, Mond)
const MINS = (() => { let off = 0, prev = -1; return CLOCK.map(([t, s]) => { let m = +s.slice(0, 2) * 60 + +s.slice(3); if (m + off < prev) off += 1440; prev = m + off; return [t, m + off]; }); })();
function hourAt(t) {
  if (t <= 0) return 5;
  for (let i = 1; i < MINS.length; i++) if (t < MINS[i][0]) return lerp(MINS[i - 1][1], MINS[i][1], (t - MINS[i - 1][0]) / (MINS[i][0] - MINS[i - 1][0])) / 60;
  const L = MINS[MINS.length - 1]; return (L[1] + (t - L[0]) * 150) / 60;
}

// ------------------------------------------------------------ Himmel
const SKY = [ // Stunde, oben, unten
  [0, "#10142e", "#1d2350"], [4.6, "#141a3a", "#272c5c"], [5.2, "#3f3f86", "#8c76b6"], [6.0, "#6672b8", "#eaa98e"],
  [7.0, "#5c9ce0", "#d8c8c0"], [8.0, "#4f98e0", "#b8daf4"], [16.5, "#5a9de0", "#c0dbef"], [17.6, "#8f97c8", "#efc0a8"],
  [18.6, "#7a6aa8", "#f2a184"], [19.5, "#3d3a7c", "#8a5f9c"], [20.5, "#161a3c", "#262b58"], [24, "#10142e", "#1d2350"],
  [28.6, "#141a3a", "#272c5c"], [29.2, "#3f3f86", "#8c76b6"]];
function skyAt(h) {
  for (let i = 1; i < SKY.length; i++) if (h <= SKY[i][0]) {
    const a = SKY[i - 1], b = SKY[i], k = (h - a[0]) / (b[0] - a[0]);
    return [mix(hex(a[1]), hex(b[1]), k), mix(hex(a[2]), hex(b[2]), k)];
  }
  return [hex("#141a3a"), hex("#272c5c")];
}
// Dunkelheit draußen 0 (Tag) .. 1 (Nacht)
function nightAt(h) {
  const x = h % 24;
  if (x < 4.8) return 1;
  if (x < 7.2) return 1 - (x - 4.8) / 2.4;
  if (x < 17.4) return 0;
  if (x < 20.6) return (x - 17.4) / 3.2;
  return 1;
}

const STARS = (() => { const r = rng(7), a = []; for (let i = 0; i < 90; i++) a.push([r() * W, r() * 380, 0.4 + r() * 0.9, r() * 6]); return a; })();

function drawSky(t, h) {
  const [top, bot] = skyAt(h);
  const g = ctx.createLinearGradient(0, 0, 0, 840);
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 840);
  const n = nightAt(h);
  // Sterne
  if (n > 0.05) for (const [x, y, r, p] of STARS) {
    ctx.globalAlpha = n * (0.55 + 0.45 * Math.sin(t * 2.2 + p));
    circle(x, y, r, "#ffffff");
  }
  ctx.globalAlpha = 1;
  // Sonne: 6 Uhr links unten -> 18 Uhr rechts unten
  const hs = h % 24;
  if (hs > 5.6 && hs < 18.8) {
    const k = (hs - 5.6) / 13.2;
    const x = lerp(-40, W + 40, k), y = 360 - Math.sin(k * Math.PI) * 250;
    glow(x, y, 90, [255, 244, 200], 0.55);
    circle(x, y, 27, "#fff3c4");
    circle(x, y, 24, "#ffeaa0");
  }
  // Mond
  const hm = (h + 24 - 18.6) % 24;      // 0 bei 18:36
  if (hm < 12.4) {
    const k = hm / 12.4;
    const x = lerp(-30, W + 30, k), y = 330 - Math.sin(k * Math.PI) * 240;
    glow(x, y, 60, [220, 225, 255], 0.25);
    crescent(x, y, 15, "#f4f2e6");
  }
  // Wolken (am Tag)
  const day = 1 - n;
  const tint = mix([255, 255, 255], [236, 190, 200], clamp(Math.abs(hs - 12) / 7 - 0.6) * 1.6);
  ctx.globalAlpha = clamp(day * 1.4 - 0.05);
  for (const [x0, y, s, sp] of [[380, 90, 1, 9], [30, 160, 1.25, 7], [140, 110, 0.9, 6]]) {
    const x = ((x0 + t * sp * 6) % (W + 220)) - 110;
    ctx.fillStyle = rgb(mix(tint, top, n * 0.7));
    ctx.beginPath();
    ctx.arc(x, y, 18 * s, 0, Math.PI * 2); ctx.arc(x + 22 * s, y - 10 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 46 * s, y, 18 * s, 0, Math.PI * 2); ctx.rect(x, y, 46 * s, 18 * s);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Vögel am Morgen
  const bk = ramp(t, 1.3, 2.6);
  if (bk > 0 && bk < 1) {
    ctx.strokeStyle = "rgba(60,50,90,0.7)"; ctx.lineWidth = 1.4; ctx.lineCap = "round";
    for (const [dx, dy] of [[0, 0], [16, 6], [30, -4]]) {
      const x = lerp(220, 600, bk) + dx, y = 250 - bk * 40 + dy, f = Math.sin(t * 18 + dx) * 2;
      ctx.beginPath(); ctx.moveTo(x - 5, y - f); ctx.quadraticCurveTo(x - 2, y - 2, x, y); ctx.quadraticCurveTo(x + 2, y - 2, x + 5, y - f); ctx.stroke();
    }
  }
}

// ------------------------------------------------------------ Gebäude
const PANES = [{ x0: 38, x1: 202 }, { x0: 208, x1: 371 }, { x0: 377, x1: 540 }];
const PY0 = 462, PY1 = 699;
PANES.forEach(p => { p.y0 = PY0; p.y1 = PY1; p.w = p.x1 - p.x0; p.h = PY1 - PY0; p.cx = (p.x0 + p.x1) / 2; });

function drawOwlBird(x, y) {
  ctx.fillStyle = "#6d5a48"; rr(x - 5, y - 13, 10, 13, 4); ctx.fill();
  circle(x - 2.2, y - 9, 2.2, "#f6d77a"); circle(x + 2.2, y - 9, 2.2, "#f6d77a");
  circle(x - 2.2, y - 9, 1, "#222"); circle(x + 2.2, y - 9, 1, "#222");
}

function drawBuilding(t, n) {
  // Antenne + Schornstein
  ctx.strokeStyle = "#2c2a33"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(105, 383); ctx.lineTo(105, 328); ctx.moveTo(92, 334); ctx.lineTo(118, 334); ctx.moveTo(95, 342); ctx.lineTo(115, 342); ctx.stroke();
  if (t < 1.4 || t > 7.0) { ctx.globalAlpha = t < 1.4 ? 1 - ramp(t, 1.0, 1.4) : ramp(t, 7.0, 7.4); drawOwlBird(105, 328); ctx.globalAlpha = 1; }
  ctx.fillStyle = "#8b3b2e"; ctx.fillRect(437, 337, 33, 47);
  ctx.fillStyle = "#73302a"; ctx.fillRect(434, 333, 39, 6);
  // Wand
  ctx.fillStyle = "#a6553f"; ctx.fillRect(10, 397, 556, 422);
  ctx.strokeStyle = "rgba(120,55,40,0.55)"; ctx.lineWidth = 1;
  for (let y = 402, row = 0; y < 818; y += 9.5, row++) {
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(566, y); ctx.stroke();
    for (let x = 10 + (row % 2) * 14; x < 566; x += 28) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 9.5); ctx.stroke(); }
  }
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(10, 397, 556, 8);
  // Dachkante
  ctx.fillStyle = "#ddd2c4"; ctx.fillRect(4, 383, 568, 15);
  ctx.fillStyle = "#c4b8a8"; ctx.fillRect(4, 395, 568, 3);
  // Tür
  ctx.fillStyle = "#4b2f27"; ctx.fillRect(260, 740, 56, 78);
  ctx.fillStyle = "#2a1b17"; ctx.fillRect(266, 747, 44, 24);
  circle(307, 786, 2.2, "#e2b04a");
  // Gehweg + Straße
  ctx.fillStyle = "#7f8288"; ctx.fillRect(0, 818, W, 14);
  ctx.fillStyle = "#9a9da2"; ctx.fillRect(0, 832, W, 26);
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
  for (let x = 20; x < W; x += 58) { ctx.beginPath(); ctx.moveTo(x, 832); ctx.lineTo(x - 8, 858); ctx.stroke(); }
  ctx.fillStyle = "#c3c5c8"; ctx.fillRect(0, 858, W, 7);
  ctx.fillStyle = "#2c2e34"; ctx.fillRect(0, 865, W, H - 865);
  ctx.fillStyle = "#d9dadc";
  for (let x = 15; x < W; x += 76) ctx.fillRect(x, 950, 44, 4);
  // Nacht über Fassade/Straße
  if (n > 0) { ctx.fillStyle = `rgba(14,16,46,${0.62 * n})`; ctx.fillRect(0, 383, W, H - 383); ctx.fillRect(434, 333, 39, 50); }
}

// ------------------------------------------------------------ Räume
const ROOM = [
  { wall: "#f4d58c", wallDark: "#3a3230", curtain: "#f0a43a", blanket: "#f2a93b", poster: "sun", item: "flowers" },
  { wall: "#3b2f78", wallDark: "#211c44", curtain: "#7b4fd6", blanket: "#7a52c8", poster: "moon", item: "cactus" },
  { wall: "#8796b0", wallDark: "#273048", curtain: "#7a879f", blanket: "#5f78a8", poster: "pic", item: "plant" },
];

function drawLamp(p, on) {
  const x = p.cx, y = p.y0;
  ctx.strokeStyle = "#2b2b31"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 26); ctx.stroke();
  ctx.fillStyle = on > 0.5 ? "#fff1b8" : "#3a3a42";
  ctx.beginPath(); ctx.moveTo(x - 7, y + 26); ctx.lineTo(x + 7, y + 26); ctx.lineTo(x + 17, y + 38); ctx.lineTo(x - 17, y + 38); ctx.closePath(); ctx.fill();
  if (on > 0) {
    ctx.save(); ctx.globalAlpha = on;
    const g = ctx.createLinearGradient(0, y + 38, 0, y + 200);
    g.addColorStop(0, "rgba(255,240,190,0.55)"); g.addColorStop(1, "rgba(255,240,190,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 17, y + 38); ctx.lineTo(x + 17, y + 38); ctx.lineTo(x + 75, y + 210); ctx.lineTo(x - 75, y + 210); ctx.closePath(); ctx.fill();
    circle(x, y + 40, 6, "#fffbe6");
    ctx.restore();
  }
}

function drawPoster(p, kind) {
  const x = p.x0 + 18, y = p.y0 + 18;
  if (kind === "sun") {
    ctx.fillStyle = "#fbe7b0"; ctx.fillRect(x, y, 34, 44);
    ctx.strokeStyle = "#f0a020"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x + 17 + Math.cos(a) * 11, y + 22 + Math.sin(a) * 11); ctx.lineTo(x + 17 + Math.cos(a) * 15, y + 22 + Math.sin(a) * 15); ctx.stroke(); }
    circle(x + 17, y + 22, 8.5, "#f4a422");
  } else if (kind === "moon") {
    ctx.fillStyle = "#17142e"; ctx.fillRect(x, y, 30, 42);
    crescent(x + 15, y + 22, 8.5, "#f2efe2");
    circle(x + 23, y + 9, 0.9, "#fff"); circle(x + 7, y + 33, 0.8, "#fff");
  } else {
    ctx.save(); ctx.translate(x + 18, y + 22); ctx.rotate(-0.12);
    ctx.fillStyle = "#e9eef3"; ctx.fillRect(-15, -12, 30, 24);
    ctx.fillStyle = "#a9c7de"; ctx.fillRect(-12, -9, 24, 18);
    ctx.fillStyle = "#6d9a6a"; ctx.beginPath(); ctx.moveTo(-12, 9); ctx.lineTo(-3, -2); ctx.lineTo(3, 4); ctx.lineTo(7, 0); ctx.lineTo(12, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

function drawBed(p, blanket) {
  const x = p.x0 + 2, y = p.y0;
  ctx.fillStyle = "#7a4a33"; rr(x + 2, y + 120, 98, 44, [12, 12, 0, 0]); ctx.fill();
  ctx.fillStyle = "#8c573d"; rr(x + 8, y + 126, 86, 34, 8); ctx.fill();
  ctx.fillStyle = "#6a3f2c"; ctx.fillRect(x, y + 186, 108, 30);
  ctx.fillStyle = "#f4f2ee"; rr(x + 12, y + 143, 72, 18, 8); ctx.fill();
  return { x, y };
}
function drawBlanket(p, color) {
  const x = p.x0 + 2, y = p.y0;
  ctx.fillStyle = "#f7f5f1"; ctx.fillRect(x, y + 158, 108, 6);
  ctx.fillStyle = color; rr(x, y + 162, 108, 26, [3, 3, 0, 0]); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(x, y + 182, 108, 6);
}
function drawNightstand(p) {
  const x = p.x1 - 44, y = p.y0 + 150;
  ctx.fillStyle = "#5a3a2b"; ctx.fillRect(x, y, 34, 66);
  ctx.fillStyle = "#4a2f22"; ctx.fillRect(x + 3, y + 6, 28, 24);
  circle(x + 26, y + 18, 1.6, "#d6b25a");
}
function drawAlarm(p, t, ringing) {
  const sh = ringing ? Math.sin(t * 80) * 1.6 : 0;
  const x = p.x1 - 27 + sh, y = p.y0 + 136;
  ctx.fillStyle = "#d63a32";
  circle(x - 7, y - 10, 4.5, "#d63a32"); circle(x + 7, y - 10, 4.5, "#d63a32");
  circle(x, y, 11, "#e2463c"); circle(x, y, 7.8, "#fbfbf6");
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 5); ctx.moveTo(x, y); ctx.lineTo(x + 4, y + 1); ctx.stroke();
  if (ringing) {
    ctx.strokeStyle = "rgba(240,90,70,0.9)"; ctx.lineWidth = 1.4;
    for (const s of [-1, 1]) for (const r of [15, 20]) { ctx.beginPath(); ctx.arc(x, y, r, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke(); }
  }
}
function drawSillItem(p, kind) {
  const y = PY1 + 1;
  if (kind === "flowers") {
    ctx.fillStyle = "#9b5a3a"; rr(p.x0 + 30, y - 16, 104, 16, 3); ctx.fill();
    const cols = ["#f2c54a", "#ef7aa0", "#ffffff", "#f2c54a", "#ef7aa0", "#ffffff", "#f2c54a"];
    cols.forEach((c, i) => {
      const x = p.x0 + 40 + i * 14, top = y - 30 - (i % 2) * 6;
      ctx.strokeStyle = "#4f8a46"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x, top); ctx.stroke();
      for (let k = 0; k < 5; k++) circle(x + Math.cos(k * 1.257) * 3.2, top + Math.sin(k * 1.257) * 3.2, 2.4, c);
      circle(x, top, 1.8, "#b06a2a");
    });
  } else if (kind === "cactus") {
    const x = p.x0 + 122;
    ctx.fillStyle = "#c0603e"; rr(x - 11, y - 16, 22, 16, 2); ctx.fill();
    ctx.fillStyle = "#3f8a5a"; rr(x - 5, y - 46, 10, 32, 5); ctx.fill();
    rr(x - 14, y - 36, 7, 14, 3.5); ctx.fill(); rr(x + 7, y - 40, 7, 15, 3.5); ctx.fill();
    ctx.fillRect(x - 10, y - 26, 6, 5); ctx.fillRect(x + 4, y - 29, 6, 5);
  } else {
    const x = p.x0 + 122;
    ctx.fillStyle = "#8f8a9a"; rr(x - 10, y - 18, 20, 18, 2); ctx.fill();
    ctx.strokeStyle = "#6c7a4a"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x - 4, y - 34, x - 14, y - 34); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 6, y - 32, x + 16, y - 28); ctx.stroke();
    circle(x - 15, y - 33, 3, "#8a9a52"); circle(x + 17, y - 27, 3, "#8a9a52");
  }
}

// ------------------------------------------------------------ Figur
const SKIN = "#f1ece0", BODY = "#e9e3d4", LINE = "#cfc7b6";
let TINT = null;   // [r,g,b,k] färbt die Figur ein (Partylicht)
const tc = c => (TINT ? rgb(mix(hex(c), TINT, TINT[3])) : c);
function face(x, y, f, wink) {
  ctx.strokeStyle = "#2a2a2e"; ctx.fillStyle = "#2a2a2e"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  const E = 5.5, ey = y - 2;
  const arcs = (down) => { for (const s of [-1, 1]) { ctx.beginPath(); down ? ctx.arc(x + s * E, ey - 1, 3, 0.15 * Math.PI, 0.85 * Math.PI) : ctx.arc(x + s * E, ey + 1.5, 3, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  const dots = (r = 1.7) => { circle(x - E, ey, r, "#2a2a2e"); circle(x + E, ey, r, "#2a2a2e"); };
  const lids = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * E - 3.5, ey - 1); ctx.lineTo(x + s * E + 3.5, ey - 1); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * E, ey - 1, 2, 0, Math.PI); ctx.fill(); } };
  const mouth = (kind) => {
    ctx.beginPath();
    if (kind === "smile") ctx.arc(x, y + 4, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    else if (kind === "grin") { ctx.arc(x, y + 4, 5.5, 0, Math.PI); ctx.closePath(); ctx.fill(); return; }
    else if (kind === "flat") { ctx.moveTo(x - 3, y + 7); ctx.lineTo(x + 3, y + 7); }
    else if (kind === "frown") ctx.arc(x, y + 10, 4, 1.2 * Math.PI, 1.8 * Math.PI);
    else if (kind === "o") { ctx.ellipse(x, y + 7, 2.2, 2.8, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (kind === "O") { ctx.ellipse(x, y + 7, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.stroke();
  };
  switch (f) {
    case "happy": arcs(false); mouth("grin"); break;
    case "smile": dots(); mouth("smile"); break;
    case "open": dots(2); mouth("grin"); break;
    case "sleep": arcs(true); mouth("smile"); break;
    case "sleepFrown": for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * E - 3, ey - (s < 0 ? 1 : 0)); ctx.lineTo(x + s * E + 3, ey + (s < 0 ? 1 : -1) * 0.5); ctx.stroke(); } mouth("frown"); break;
    case "sleepO": arcs(true); mouth("o"); break;
    case "tired": lids(); mouth("flat"); break;
    case "tiredO": lids(); mouth("o"); break;
    case "yawn": arcs(true); mouth("O"); break;
    case "shock": dots(2.2); mouth("o"); break;
    case "wink": { ctx.beginPath(); ctx.arc(x - E, ey + 1.5, 3, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); circle(x + E, ey, 1.9, "#2a2a2e"); mouth("grin"); break; }
  }
}
function wideEyes(x, y, a) {
  ctx.globalAlpha = a;
  for (const s of [-1, 1]) { circle(x + s * 6, y - 1, 5, "#f8f8f8"); circle(x + s * 6 + 0.5, y - 0.5, 2.3, "#16161a"); }
  ctx.globalAlpha = 1;
}
function arm(sx, sy, ang, len = 32) {
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
  ctx.fillStyle = tc("#ddd6c6"); rr(-3.6, -2, 7.2, len, 3.6); ctx.fill();
  ctx.restore();
  return [sx - Math.sin(ang) * (len - 3), sy + Math.cos(ang) * (len - 3)];
}
function holdItem(x, y, kind, t) {
  if (kind === "smoothie") {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; rr(-5, -14, 10, 16, 2); ctx.fill();
    ctx.fillStyle = "#68c35a"; rr(-4.2, -10, 8.4, 11, 1.5); ctx.fill();
    ctx.strokeStyle = "#e55"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(1, -12); ctx.lineTo(4, -20); ctx.stroke();
    ctx.restore();
  } else if (kind === "mug") {
    ctx.fillStyle = "#f6f4ef"; rr(x - 6, y - 10, 12, 12, 2); ctx.fill();
    ctx.strokeStyle = "#f6f4ef"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 7, y - 4, 3.2, -1.4, 1.4); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1;
    for (const d of [-2, 2]) { ctx.beginPath(); ctx.moveTo(x + d, y - 13); ctx.quadraticCurveTo(x + d + 2 * Math.sin(t * 5), y - 17, x + d, y - 21); ctx.stroke(); }
  } else if (kind === "phone") {
    ctx.fillStyle = "#1d2230"; rr(x - 5, y - 9, 10, 16, 2); ctx.fill();
    ctx.fillStyle = "#9fd2ff"; rr(x - 3.6, y - 7.5, 7.2, 13, 1.2); ctx.fill();
  }
}
// stehende/sitzende Figur. o: {x, y (Unterkante Körper), arms:[l, r], face, hold, lean, tint, phones}
function figure(o, t) {
  ctx.save();
  ctx.translate(o.x, o.y); ctx.rotate(o.lean || 0);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  const by = 0, hy = -86;
  // Körper
  TINT = o.tint || null;
  ctx.fillStyle = tc(BODY); rr(-21, -72, 42, 74, 21); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.06)"; rr(4, -70, 16, 70, 12); ctx.fill();
  const [la, ra] = o.arms || [0.15, -0.15];
  arm(-17, -58, la);
  const hand = arm(17, -58, ra);
  // Kopf
  circle(0, hy, 17.5, tc(LINE)); circle(0, hy, 16.6, tc(SKIN));
  if (o.phones) { ctx.fillStyle = "#8a6be8"; rr(-20, hy - 6, 6, 13, 3); ctx.fill(); rr(14, hy - 6, 6, 13, 3); ctx.fill(); ctx.strokeStyle = "#8a6be8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, hy, 18.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  face(0, hy, o.face, t);
  if (o.hold) holdItem(hand[0], hand[1], o.hold, t);
  TINT = null;
  ctx.restore();
}
// liegend im Bett: Kopf auf dem Kissen + Schultern unter der Decke
function sleeper(p, f, opts = {}) {
  const x = p.x0 + 50, y = p.y0 + 146;
  circle(x - 20, y + 14, 12, BODY); circle(x + 20, y + 14, 12, BODY);
  circle(x, y, 17.5, LINE); circle(x, y, 16.6, SKIN);
  if (f) face(x, y, f);
  return { x, y };
}

// ------------------------------------------------------------ Zzz + Noten
function zzz(x, y, t, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#f2f2f2"; ctx.textAlign = "center";
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.9 + i / 3) % 1;
    ctx.globalAlpha = a * Math.sin(ph * Math.PI);
    ctx.font = `900 ${10 + ph * 6}px InterX`;
    ctx.fillText("Z", x + Math.sin(ph * 6) * 2, y + 26 - ph * 30);
  }
  ctx.restore();
}
function notes(x, y, t, a) {
  if (a <= 0) return;
  const cols = ["#7fe3c9", "#f28bd0", "#9ac6ff"];
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.55 + i / 3) % 1;
    ctx.globalAlpha = a * Math.sin(ph * Math.PI);
    const nx = x + (i - 1) * 22 + Math.sin(ph * 8 + i) * 5, ny = y - ph * 55;
    ctx.fillStyle = cols[i]; ctx.strokeStyle = cols[i]; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(nx, ny, 3, 2.3, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(nx + 2.6, ny); ctx.lineTo(nx + 2.6, ny - 10); ctx.lineTo(nx + 7, ny - 7); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function sparkles(x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#fff";
  for (let i = 0; i < 6; i++) {
    const ang = i * 1.047 + t * 2, r = 24 + 3 * Math.sin(t * 9 + i), s = 2.5 + 1.5 * Math.sin(t * 12 + i * 2);
    const px = x + Math.cos(ang) * r, py = y + Math.sin(ang) * r;
    ctx.beginPath(); ctx.moveTo(px, py - s * 1.6); ctx.lineTo(px + s * 0.5, py - s * 0.5); ctx.lineTo(px + s * 1.6, py); ctx.lineTo(px + s * 0.5, py + s * 0.5);
    ctx.lineTo(px, py + s * 1.6); ctx.lineTo(px - s * 0.5, py + s * 0.5); ctx.lineTo(px - s * 1.6, py); ctx.lineTo(px - s * 0.5, py - s * 0.5); ctx.fill();
  }
  ctx.restore();
}

// ------------------------------------------------------------ Ablauf je Fenster
// Frühaufsteher
const L_FACE = [[0, "sleep"], [0.25, "happy"], [3.3, "smile"], [3.9, "happy"], [4.9, "smile"], [5.3, "happy"], [6.0, "smile"], [6.2, "tiredO"], [6.45, "yawn"], [6.9, "sleep"]];
function leftRoom(t, p) {
  const awake = t >= 0.22 && t < 7.45;
  const lampOn = (t >= 0.22 && t < 1.7 ? 1 : 0) + (t >= 6.2 && t < 7.45 ? 1 : 0);
  return { awake, lampOn, dark: awake ? 0 : 0.72 };
}
function leftFigure(t, p) {
  const x = p.x0 + 108, base = p.y0 + 214;
  const up = easeOut(ramp(t, 0.22, 0.5));
  let arms = [0.2, -0.2], hold = null, lean = 0, y = base + (1 - up) * 30;
  if (t < 1.4) { const s = Math.sin((t - 0.3) * 7); arms = [Math.PI - 0.5 + s * 0.25, -Math.PI + 0.5 - s * 0.25]; }
  else if (t < 3.3) { const s = Math.sin((t - 1.4) * 9); arms = [0.5 + s * 0.6, -1.1 + s * 0.5]; lean = s * 0.05; }
  else if (t < 6.2) { arms = [0.2, -1.0 - (Math.sin(t * 2.4) > 0.6 ? 0.9 : 0)]; hold = "smoothie"; }
  else { const s = ramp(t, 6.2, 6.5); arms = [0.2 + s * 1.9, -0.2 - s * 1.9]; }
  return { x, y, arms, hold, lean, face: stateAt(L_FACE, t) };
}
// Nachteule
const M_FACE = [[0, "sleep"], [4.25, "tired"], [5.0, "tiredO"], [5.25, "tired"], [7.6, "open"], [8.0, "happy"], [8.6, "wink"], [9.2, "open"], [9.8, "happy"], [10.4, "open"], [11.1, "happy"], [11.55, "sleep"]];
function partyCol(t) {
  const c = [[122, 80, 230], [76, 96, 240], [190, 80, 220], [100, 70, 230]];
  const k = (t * 0.8) % c.length, i = Math.floor(k);
  return mix(c[i], c[(i + 1) % c.length], k - i);
}

// ------------------------------------------------------------ Bild
function drawPane(t, i, n) {
  const p = PANES[i], R = ROOM[i];
  ctx.save();
  ctx.beginPath(); ctx.rect(p.x0, p.y0, p.w, p.h); ctx.clip();
  // Licht im Raum
  let dark, lampOn = 0, party = 0, phone = 0;
  if (i === 0) { const s = leftRoom(t, p); dark = s.dark; lampOn = s.lampOn; if (t >= 0.22 && t < 1.7) dark = 0; }
  if (i === 1) { lampOn = t >= 7.0 && t < 8.0 ? 1 : 0; party = ramp(t, 7.95, 8.15) * (1 - ramp(t, 11.5, 11.65)); dark = t < 4.0 ? 0.3 : (t > 11.6 ? 0.75 : 0.12 * n); }
  if (i === 2) { lampOn = t >= 6.5 && t < 7.6 ? 1 : 0; phone = ramp(t, 7.95, 8.1) * (1 - ramp(t, 9.95, 10.1)); dark = lampOn ? 0 : n * 0.78; if (t < 1.8) dark = Math.max(dark, 0.45); }
  ctx.fillStyle = R.wall; ctx.fillRect(p.x0, p.y0, p.w, p.h);
  if (i === 1 && party > 0) { ctx.fillStyle = rgb(partyCol(t), 0.55 * party); ctx.fillRect(p.x0, p.y0, p.w, p.h); }
  // Vorhänge seitlich
  ctx.fillStyle = R.curtain;
  ctx.fillRect(p.x0, p.y0, 12, p.h); ctx.fillRect(p.x1 - 12, p.y0, 12, p.h);
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(p.x0 + 6, p.y0, 2, p.h); ctx.fillRect(p.x1 - 7, p.y0, 2, p.h);
  drawPoster(p, R.poster);
  drawLamp(p, lampOn);
  drawBed(p);
  drawNightstand(p);

  // Figuren
  if (i === 0) {
    const awake = t >= 0.22 && t < 7.45;
    if (awake) { drawBlanket(p, R.blanket); figure(leftFigure(t, p), t); }
    else { sleeper(p, "sleep"); drawBlanket(p, R.blanket); }
  }
  if (i === 1) {
    const inBed = t < 4.6 || t >= 11.55;
    if (inBed) {
      const f = t < 4.25 || t >= 11.55 ? "sleep" : "tired";
      if (t >= 4.25 && t < 4.6) { drawBlanket(p, R.blanket); figure({ x: p.x0 + 60, y: p.y0 + 186 + 20 * (1 - ramp(t, 4.25, 4.45)), arms: [0.3, -0.3], face: "tired" }, t); }
      else { sleeper(p, f); drawBlanket(p, R.blanket); }
    } else {
      drawBlanket(p, R.blanket);
      let o = { x: p.x0 + 104, y: p.y0 + 206, arms: [0.15, -0.9], hold: "mug", face: stateAt(M_FACE, t) };
      if (t > 4.95 && t < 5.25 || t > 6.7 && t < 7.0) o.arms = [0.15, -2.2];
      if (t >= 7.6) {
        const d = t - 7.6, beat = Math.sin(d * Math.PI * 2 * 1.05);
        o.hold = null; o.phones = t >= 7.95;
        o.y = p.y0 + 206 - Math.abs(beat) * (t >= 7.95 ? 7 : 0);
        o.arms = t >= 7.95 ? [Math.PI - 0.45 + beat * 0.35, -Math.PI + 0.6 + beat * 0.4] : [0.3, -0.3];
        o.lean = t >= 7.95 ? beat * 0.08 : 0;
        if (t >= 11.4) { const k = ramp(t, 11.4, 11.55); o.arms = [lerp(o.arms[0], 0.2, k), lerp(o.arms[1], -0.2, k)]; }
      }
      if (party > 0) o.tint = [...mix(partyCol(t), [255, 255, 255], 0.3), 0.35 * party];
      figure(o, t);
      if (t >= 7.6 && t < 8.2) sparkles(o.x, o.y - 86, t, 1 - ramp(t, 8.0, 8.2));
    }
    // LED-Lichterkette
    if (party > 0) for (let k = 0; k < 13; k++) {
      const x = p.x0 + 8 + k * (p.w - 16) / 12, c = ["#ff7ad9", "#7ae8ff", "#b27aff", "#7affc4"][(k + Math.floor(t * 4)) % 4];
      glow(x, p.y0 + 7, 6, hex(c), 0.7 * party); circle(x, p.y0 + 7, 1.8, c);
    }
  }
  if (i === 2) {
    const sitting = t >= 3.2 && t < 7.6;
    if (!sitting) {
      let f = "sleep";
      if (t >= 2.25 && t < 2.95) f = "sleepFrown";
      if (t >= 2.95 && t < 3.2) f = "tired";
      if (t >= 7.6 && t < 10.0) f = t > 9.2 && t < 9.45 ? "tiredO" : "tired";
      if (t >= 10.0 && t < 10.45) f = "sleep";
      if (t >= 10.45 && t < 11.75) f = null;
      if (t >= 11.75) f = "sleep";
      const h = sleeper(p, f);
      drawBlanket(p, R.blanket);
      if (phone > 0) {
        // Hände mit Handy über der Decke
        circle(h.x - 9, h.y + 22, 5, BODY); circle(h.x + 9, h.y + 22, 5, BODY);
        holdItem(h.x, h.y + 24, "phone", t);
      }
      if (t >= 2.6 && t < 2.85) arm(h.x + 30, h.y + 18, -1.6 + ramp(t, 2.6, 2.75) * 0.3, 38);
    } else {
      drawBlanket(p, R.blanket);
      const o = { x: p.x0 + 104, y: p.y0 + 206, arms: [0.15, -0.9], hold: "mug", face: "tired" };
      if (t < 3.45) { o.hold = null; o.arms = [0.2, -0.2]; o.y += (1 - ramp(t, 3.2, 3.4)) * 18; }
      if (t > 4.6 && t < 5.15) { o.face = "sleepO"; o.lean = -0.12 * Math.sin(ramp(t, 4.6, 5.15) * Math.PI); }
      if (t >= 5.15 && t < 5.45) o.face = "shock";
      if (t > 5.9 && t < 6.15 || t > 6.9 && t < 7.15) { o.arms = [0.15, -2.2]; }
      if (t >= 7.4) o.alpha = 1 - ramp(t, 7.4, 7.6);
      figure(o, t);
    }
    drawAlarm(p, t, t >= 2.05 && t < 2.75);
  }

  // Nachtteule: Vorhang zu (davor)
  if (i === 1) {
    const open = easeIO(ramp(t, 3.95, 4.3)) * (1 - easeIO(ramp(t, 11.75, 12.1)));
    if (open < 1) {
      const half = (p.w / 2) * (1 - open);
      for (const s of [0, 1]) {
        const x0 = s ? p.x1 - half - 2 : p.x0, w = half + 2;
        ctx.fillStyle = "#1d1c45"; ctx.fillRect(x0, p.y0, w, p.h);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        for (let k = 0; k < 4; k++) ctx.fillRect(x0 + (k + 0.5) * w / 4, p.y0, 3, p.h);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        for (let k = 0; k < 4; k++) ctx.fillRect(x0 + (k + 0.5) * w / 4 + 6, p.y0, 4, p.h);
      }
    }
  }
  // Abdunkeln
  if (dark > 0) { ctx.fillStyle = `rgba(12,14,38,${dark})`; ctx.fillRect(p.x0, p.y0, p.w, p.h); }
  // Raumlicht leuchtet bei Nacht
  if (i === 2 && phone > 0) {
    const h = { x: p.x0 + 50, y: p.y0 + 146 };
    glow(h.x, h.y + 10, 55, [120, 170, 255], 0.55 * phone);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    glow(h.x, h.y + 4, 26, [70, 110, 200], 0.6 * phone);
    ctx.restore();
  }
  if (i === 2 && t >= 10.45 && t < 11.75) {
    const h = { x: p.x0 + 50, y: p.y0 + 146 };
    wideEyes(h.x, h.y, ramp(t, 10.45, 10.55));
  }
  if (i === 1 && party > 0) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    glow(p.cx, p.y0 + 110, 140, partyCol(t), 0.25 * party);
    ctx.restore();
  }
  // Zzz
  if (i === 0 && (t < 0.22 || t >= 7.5)) zzz(p.x0 + 106, p.y0 + 24, t, t < 0.22 ? 1 : ramp(t, 7.5, 7.7));
  if (i === 1 && t < 3.95) zzz(p.x0 + 108, p.y0 + 16, t + 0.3);
  if (i === 2 && (t < 2.05 || (t >= 11.85))) zzz(p.x0 + 70, p.y0 + 30, t + 0.6, t < 2.05 ? 1 : ramp(t, 11.85, 12.0));
  if (i === 2 && t > 4.65 && t < 5.1) zzz(p.x0 + 140, p.y0 + 60, t, 0.9);
  // Glasreflex
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath(); ctx.moveTo(p.x0 + p.w * 0.55, p.y0); ctx.lineTo(p.x0 + p.w * 0.75, p.y0); ctx.lineTo(p.x0 + p.w * 0.25, p.y1); ctx.lineTo(p.x0 + p.w * 0.05, p.y1); ctx.fill();
  ctx.restore();
}

function drawWindowFrame(n) {
  const fc = rgb(mix([234, 230, 222], [70, 72, 98], n * 0.85));
  ctx.fillStyle = fc;
  ctx.fillRect(32, 456, 514, 6); ctx.fillRect(32, 456, 6, 246); ctx.fillRect(540, 456, 6, 246);
  ctx.fillRect(202, 456, 6, 246); ctx.fillRect(371, 456, 6, 246);
  ctx.fillRect(26, 698, 526, 11);
  ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(26, 709, 526, 4);
  PANES.forEach((p, i) => { ctx.save(); ctx.globalAlpha = 1; ctx.restore(); });
}

function label(text, cx, y, color, a = 1, scale = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = "700 14.5px InterX"; ctx.letterSpacing = "1.6px";
  const w = ctx.measureText(text).width + 22;
  ctx.translate(cx, y); ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(26,28,38,0.92)"; rr(-w / 2, -13, w, 26, 7); ctx.fill();
  ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 0.8, 1);
  ctx.restore();
}

function drawClock(t) {
  const s = stateAt(CLOCK, t);
  const red = t >= T_THREE ? 1 - ramp(t, 11.3, 11.6) : 0;
  const pop = t >= T_THREE ? 1 + 0.12 * Math.exp(-(t - T_THREE) * 7) * Math.cos((t - T_THREE) * 18) : 1;
  ctx.save();
  ctx.translate(288, 252); ctx.scale(pop, pop);
  ctx.font = "900 64px InterX"; ctx.letterSpacing = "0px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillText(s, 1.5, 3);
  ctx.fillStyle = rgb(mix([255, 255, 255], [244, 76, 64], red));
  ctx.fillText(s, 0, 0);
  ctx.restore();
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const h = hourAt(t), n = nightAt(h);
  // Kamera: langsam näher ran bis 3 Uhr, kurzer Ruck, dann zurück
  const z = 1 + 0.035 * easeIO(ramp(t, 9.5, 10.8)) - 0.035 * easeIO(ramp(t, 11.3, 11.95));
  const shake = t >= T_THREE && t < 11.2 ? Math.sin(t * 70) * 2.2 * Math.exp(-(t - T_THREE) * 8) : 0;
  ctx.translate(288 + shake, 580); ctx.scale(z, z); ctx.translate(-288, -580);
  drawSky(t, h);
  drawBuilding(t, n);
  for (let i = 0; i < 3; i++) drawPane(t, i, n);
  drawWindowFrame(n);
  // Musiknoten über dem Partyfenster
  const party = ramp(t, 7.95, 8.15) * (1 - ramp(t, 11.45, 11.6));
  notes(PANES[1].cx + 10, 448, t, party);
  // Schilder
  label("FRÜHAUFSTEHER", PANES[0].cx + 2, 444, "#f3f3f3");
  label("NACHTEULE", PANES[1].cx - 6, 444, "#f3f3f3");
  const tired = t >= T_THREE ? 1 - ramp(t, 11.8, 12.05) : 0;
  const swap = easeOut(ramp(t, T_THREE, T_THREE + 0.15));
  if (tired > 0) label("IMMER MÜDE", PANES[2].cx, 444, "#f7c948", tired, 0.85 + 0.15 * swap + 0.08 * Math.exp(-(t - T_THREE) * 8));
  label("???", PANES[2].cx, 444, "#f3f3f3", t < T_THREE ? 1 : ramp(t, 11.95, 12.15));
  ctx.setTransform(S, 0, 0, S, 0, 0);
  drawClock(t);
};

window.exportEvents = function () {
  return {
    duration: DUR,
    clock: CLOCK.map(c => c[0]),
    three: T_THREE,
    lampOn: [0.22, 6.2, 6.5, 7.0],
    lampOff: [1.7, 7.45, 7.6],
    alarm: [2.05, 2.75],
    curtainOpen: 3.95, curtainClose: 11.75,
    party: [7.95, 11.5],
    sips: [3.6, 4.95, 5.9, 6.7, 6.9],
    wake: 0.22, yawn: 6.45, sparkle: 7.6, eyes: 10.45,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 64px InterX"), document.fonts.load("700 15px InterX")]);
  return { duration: DUR };
};
