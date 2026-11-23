// "Welcher Geburtsmonat gewinnt? – Das Zauberschul-Rennen" (deutsche Version nach @the_best_month_wins).
// 12 Tiere (je ein Monat) laufen vor einem Zauberschloss; einer nach dem anderen fliegt raus.
"use strict";

const W = 1080, H = 1920;
window.DURATION = 64.0;
const PATH_Y = 1385;            // Füße der Läufer
const BOARD_Y = 400;            // Anzeigetafel (unter den TikTok-Tabs)
const SPEED = 240;
const AS = 1.3;                 // Größe der Tiere
const DY = 55;                  // Szene etwas tiefer: alles vertikal mittig

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const INK = "#26203a";

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
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
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fillStroke(fill, w = 3.5) { ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.stroke(); }

// ------------------------------------------------------------------ Monate & Tiere
const M = [
  { k: "JAN", name: "JANUAR", a: "penguin", tag: "#5aa2ff" }, { k: "FEB", name: "FEBRUAR", a: "rabbit", tag: "#ff6fae" },
  { k: "MÄR", name: "MÄRZ", a: "frog", tag: "#4cc96b" }, { k: "APR", name: "APRIL", a: "duck", tag: "#ffcf3a" },
  { k: "MAI", name: "MAI", a: "pig", tag: "#ff8fb4" }, { k: "JUN", name: "JUNI", a: "cow", tag: "#8e6bff" },
  { k: "JUL", name: "JULI", a: "cheetah", tag: "#ff6a3d" }, { k: "AUG", name: "AUGUST", a: "monkey", tag: "#3fd0c9" },
  { k: "SEP", name: "SEPTEMBER", a: "fox", tag: "#ff5fd0" }, { k: "OKT", name: "OKTOBER", a: "turtle", tag: "#f7b733" },
  { k: "NOV", name: "NOVEMBER", a: "bear", tag: "#4a6cff" }, { k: "DEZ", name: "DEZEMBER", a: "dog", tag: "#3ec88a" },
];
const IX = k => M.findIndex(m => m.k === k);
// Startaufstellung (x, Tiefe)
const POS = { JAN: [520, 0], FEB: [770, -26], MÄR: [480, -20], APR: [430, 12], MAI: [600, -18], JUN: [700, -30],
  JUL: [180, 6], AUG: [370, -24], SEP: [820, 8], OKT: [870, -6], NOV: [270, 10], DEZ: [640, 14] };

// Rausflieger: [Zeit, Monat, Gefahr, Lautwort, Platz]
const OUT = [
  [5.6, "APR", "book", "HAPS!", 12], [11.0, "MÄR", "cauldron", "SCHLÜRF…", 11], [14.4, "JAN", "owl", "WUSCH!", 10],
  [17.7, "MAI", "ghost", "BUH!", 9], [23.6, "DEZ", "ball", "BALL!!!", 8], [27.2, "AUG", "stairs", "HUCH!", 7],
  [31.6, "JUN", "broom", "SCHWUPP!", 6], [35.6, "NOV", "hat", "NÖ! BOING!", 5], [48.6, "OKT", "magic", "TADAA!", 4],
  [53.2, "JUL", "poof", "PUFF!", 3],
];
const WAND = 39.0;               // Juli schnappt sich einen Zauberstab
const LIB1 = [20.0, 22.6], LIB2 = [43.4, 46.0], LIB3 = [59.6, 64.0];
const RACE_START = 3.2, FINISH = 51.6, WIN = 56.0, SECOND = 57.6;

// ------------------------------------------------------------------ Tiere zeichnen (aufrecht, Füße bei y)
function eye(x, y, r = 6) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + 1.5, y + 0.5, r * 0.45, 0, 7); ctx.fill(); }
function animal(kind, x, y, t, o = {}) {
  const s = o.s ?? 1, ph = o.ph ?? 0, run = o.run ?? true;
  const step = run ? Math.sin(t * 13 + ph) : 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.rot) ctx.rotate(o.rot);
  const bob = run ? -Math.abs(Math.cos(t * 13 + ph)) * 6 : 0;
  const C = {
    penguin: ["#2c2f3e", "#f4f4f4"], rabbit: ["#f4f2f6", "#ffd9e6"], frog: ["#5fc95a", "#c9f2a8"], duck: ["#ffd23f", "#ffe98a"],
    pig: ["#ffaec8", "#ffd2e0"], cow: ["#f6f6f6", "#ffd2c4"], cheetah: ["#f6c544", "#ffe7a8"], monkey: ["#9a6a43", "#e8c49a"],
    fox: ["#ff7a2e", "#fff1e4"], turtle: ["#6ccf6a", "#b8ee9b"], bear: ["#8a5a36", "#d8b08a"], dog: ["#d8a46a", "#f2d6b0"],
  }[kind];
  // Beine
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-10, -36 + bob); ctx.lineTo(-10 + step * 12, -2 - Math.max(0, step) * 8);
  ctx.moveTo(10, -36 + bob); ctx.lineTo(10 - step * 12, -2 - Math.max(0, -step) * 8); ctx.stroke();
  ctx.translate(0, bob);
  // Körper
  if (kind === "turtle") { ctx.beginPath(); ctx.ellipse(-8, -66, 40, 36, 0, 0, 7); fillStroke("#8a5a2b"); ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -66); ctx.lineTo(14, -66); ctx.moveTo(-8, -96); ctx.lineTo(-8, -36); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -64, 28, 34, 0, 0, 7); fillStroke(C[0]);
  ctx.beginPath(); ctx.ellipse(6, -60, 16, 22, 0, 0, 7); ctx.fillStyle = C[1]; ctx.fill();
  if (kind === "cheetah") { ctx.fillStyle = "#7a4a1a"; for (const [a, b] of [[-14, -80], [-6, -50], [-18, -58], [10, -86]]) { ctx.beginPath(); ctx.arc(a, b, 3.5, 0, 7); ctx.fill(); } }
  if (kind === "cow") { ctx.fillStyle = "#2c2f3e"; ctx.beginPath(); ctx.ellipse(-14, -74, 9, 7, 0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-8, -48, 7, 5, 0, 0, 7); ctx.fill(); }
  // Arme
  ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-18, -78); ctx.lineTo(-30 - step * 6, -56); ctx.moveTo(18, -78); ctx.lineTo(30 + step * 6, -58); ctx.stroke();
  // Schwanz
  if (kind === "fox") { ctx.beginPath(); ctx.ellipse(-36, -50, 22, 10, -0.6, 0, 7); fillStroke("#ff7a2e", 3); ctx.beginPath(); ctx.arc(-52, -40, 6, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); }
  if (kind === "cheetah" || kind === "monkey") { ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-24, -50); ctx.quadraticCurveTo(-50, -60, -44, -86); ctx.stroke(); }
  // Kopf
  const hx = 4, hy = -122;
  // Ohren
  const ears = {
    rabbit: () => { for (const dx of [-12, 8]) { ctx.beginPath(); ctx.ellipse(hx + dx, hy - 48, 8, 26, dx * 0.01, 0, 7); fillStroke(C[0]); ctx.beginPath(); ctx.ellipse(hx + dx, hy - 48, 4, 18, 0, 0, 7); ctx.fillStyle = "#ffb9cf"; ctx.fill(); } },
    cow: () => { ctx.fillStyle = "#e8d8a8"; for (const dx of [-20, 20]) { ctx.beginPath(); ctx.moveTo(hx + dx, hy - 22); ctx.lineTo(hx + dx * 1.3, hy - 40); ctx.lineTo(hx + dx * 0.6, hy - 26); ctx.closePath(); fillStroke("#e8d8a8", 2.5); } },
    fox: () => { for (const dx of [-16, 16]) { ctx.beginPath(); ctx.moveTo(hx + dx - 10, hy - 18); ctx.lineTo(hx + dx, hy - 44); ctx.lineTo(hx + dx + 10, hy - 18); ctx.closePath(); fillStroke(C[0], 3); } },
    pig: () => { for (const dx of [-18, 18]) { ctx.beginPath(); ctx.moveTo(hx + dx - 8, hy - 20); ctx.lineTo(hx + dx, hy - 34); ctx.lineTo(hx + dx + 8, hy - 20); ctx.closePath(); fillStroke(C[0], 3); } },
    bear: () => { for (const dx of [-20, 20]) { ctx.beginPath(); ctx.arc(hx + dx, hy - 24, 10, 0, 7); fillStroke(C[0], 3); } },
    monkey: () => { for (const dx of [-30, 30]) { ctx.beginPath(); ctx.arc(hx + dx, hy, 10, 0, 7); fillStroke(C[1], 3); } },
    cheetah: () => { for (const dx of [-18, 18]) { ctx.beginPath(); ctx.arc(hx + dx, hy - 24, 7, 0, 7); fillStroke(C[0], 3); } },
    dog: () => { for (const dx of [-26, 26]) { ctx.beginPath(); ctx.ellipse(hx + dx, hy + 4, 9, 18, dx * -0.01, 0, 7); fillStroke("#8a5a36", 3); } },
  }[kind];
  if (ears && kind !== "monkey" && kind !== "dog") ears();
  ctx.beginPath(); ctx.arc(hx, hy, 30, 0, 7); fillStroke(kind === "frog" ? C[0] : C[0]);
  if (ears && (kind === "monkey" || kind === "dog")) ears();
  if (kind === "monkey") { ctx.beginPath(); ctx.ellipse(hx + 4, hy + 6, 20, 18, 0, 0, 7); ctx.fillStyle = C[1]; ctx.fill(); }
  if (kind === "penguin") { ctx.beginPath(); ctx.ellipse(hx + 4, hy + 6, 20, 18, 0, 0, 7); ctx.fillStyle = "#f4f4f4"; ctx.fill(); }
  if (kind === "fox") { ctx.beginPath(); ctx.moveTo(hx - 10, hy + 6); ctx.quadraticCurveTo(hx + 10, hy + 34, hx + 30, hy + 6); ctx.fillStyle = "#fff1e4"; ctx.fill(); }
  // Augen
  if (kind === "frog") { eye(hx - 12, hy - 22, 9); eye(hx + 14, hy - 22, 9); }
  else { eye(hx - 8, hy - 6); eye(hx + 12, hy - 6); }
  // Schnabel/Schnauze
  if (kind === "duck" || kind === "penguin") { ctx.beginPath(); ctx.moveTo(hx + 14, hy + 4); ctx.lineTo(hx + 40, hy + 8); ctx.lineTo(hx + 14, hy + 14); ctx.closePath(); fillStroke("#ff9a2a", 2.5); }
  else if (kind === "pig") { ctx.beginPath(); ctx.ellipse(hx + 16, hy + 10, 12, 9, 0, 0, 7); fillStroke("#ff8fb4", 2.5); ctx.fillStyle = INK; ctx.fillRect(hx + 11, hy + 8, 3, 4); ctx.fillRect(hx + 18, hy + 8, 3, 4); }
  else if (kind === "cow") { ctx.beginPath(); ctx.ellipse(hx + 12, hy + 14, 16, 10, 0, 0, 7); fillStroke("#ffc4b4", 2.5); }
  else if (kind === "frog") { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx + 2, hy + 4, 14, 0.2, Math.PI - 0.2); ctx.stroke(); }
  else { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(hx + 24, hy + 6, 4, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx + 14, hy + 10, 7, 0.3, Math.PI - 0.6); ctx.stroke(); }
  if (o.hat) { ctx.beginPath(); ctx.moveTo(hx - 26, hy - 22); ctx.lineTo(hx + 4, hy - 82); ctx.lineTo(hx + 30, hy - 22); ctx.closePath(); fillStroke("#5a3fb0", 3); ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(hx + 2, hy - 46, 4, 0, 7); ctx.fill(); }
  if (o.wand) { ctx.strokeStyle = "#5a3a20"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(30, -58); ctx.lineTo(56, -96); ctx.stroke(); ctx.fillStyle = "#ffe98a"; ctx.beginPath(); ctx.arc(56, -96, 6 + Math.sin(t * 20) * 2, 0, 7); ctx.fill(); }
  ctx.restore();
}
function tag(m, x, y, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = "900 20px InterBlk";
  const w = ctx.measureText(m.k).width + 16;
  ctx.fillStyle = m.tag; rr(x - w / 2, y - 14, w, 28, 8); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(m.k, x, y + 1); ctx.restore();
}

// ------------------------------------------------------------------ Kulisse
let BLD = [];
function buildStatic() {
  const R = rng(5);
  let x = 0;
  while (x < 2600) {
    const w = 110 + R() * 120, h = 260 + R() * 260;
    const win = [];
    for (let yy = 40; yy < h - 30; yy += 52) for (let xx = 22; xx < w - 24; xx += 34) if (R() < 0.7) win.push([xx, yy]);
    BLD.push({ x, w, h, win, tower: R() < 0.55, flag: R() < 0.5 ? "#ffcf3a" : "#ff5a5a" });
    x += w + 10 + R() * 30;
  }
}
const BLD_W = 2600;
function castle(t, scroll) {
  const sky = ctx.createLinearGradient(0, 0, 0, 1250);
  sky.addColorStop(0, "#1a1440"); sky.addColorStop(1, "#4a3b8a");
  ctx.fillStyle = sky; ctx.fillRect(0, -120, W, 1380);
  // Mond
  const mg = ctx.createRadialGradient(760, 640, 20, 760, 640, 300);
  mg.addColorStop(0, "rgba(255,250,220,0.35)"); mg.addColorStop(1, "rgba(255,250,220,0)");
  ctx.fillStyle = mg; ctx.fillRect(460, 340, 600, 600);
  ctx.fillStyle = "#fff6d8"; ctx.beginPath(); ctx.arc(760, 640, 95, 0, 7); ctx.fill();
  // Schloss (Parallax)
  const off = (scroll * 0.25) % BLD_W;
  for (const b of BLD) {
    for (const rep of [0, BLD_W]) {
      const x = b.x - off + rep - 200;
      if (x > W || x + b.w < 0) continue;
      const top = 1180 - b.h;
      ctx.fillStyle = "#3a2d6e"; ctx.fillRect(x, top, b.w, b.h);
      ctx.fillStyle = "#ffd77a";
      for (const [wx, wy] of b.win) { rr(x + wx, top + wy, 16, 26, 7); ctx.fill(); }
      if (b.tower) {
        ctx.fillStyle = "#2c2258"; ctx.beginPath(); ctx.moveTo(x - 6, top); ctx.lineTo(x + b.w / 2, top - 120); ctx.lineTo(x + b.w + 6, top); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#1a1440"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + b.w / 2, top - 120); ctx.lineTo(x + b.w / 2, top - 160); ctx.stroke();
        ctx.fillStyle = b.flag; ctx.beginPath(); ctx.moveTo(x + b.w / 2, top - 160); ctx.lineTo(x + b.w / 2 + 26, top - 150); ctx.lineTo(x + b.w / 2, top - 140); ctx.fill();
      }
    }
  }
  // schwebende Kerzen
  for (let i = 0; i < 9; i++) {
    const x = ((i * 137 - scroll * 0.4) % (W + 100) + W + 100) % (W + 100) - 50, y = 760 + (i % 3) * 70 + Math.sin(t * 2 + i) * 8;
    ctx.fillStyle = "#f6efe0"; ctx.fillRect(x - 4, y, 8, 22); ctx.fillStyle = "#ffcf5a"; ctx.beginPath(); ctx.ellipse(x, y - 6, 4, 7, 0, 0, 7); ctx.fill();
  }
  // Bäume
  ctx.fillStyle = "#1f3b2e";
  for (let i = 0; i < 12; i++) { const x = ((i * 190 - scroll * 0.7) % 2280 + 2280) % 2280 - 100; ctx.beginPath(); ctx.moveTo(x - 50, 1260); ctx.lineTo(x, 1080 - (i % 3) * 30); ctx.lineTo(x + 50, 1260); ctx.fill(); }
  ctx.fillStyle = "#2a5a3c"; ctx.fillRect(0, 1230, W, 60);
  // Weg
  ctx.fillStyle = "#3c8a4a"; ctx.fillRect(0, 1290, W, 40);
  ctx.fillStyle = "#a8a4b8"; ctx.fillRect(0, 1330, W, 90);
  ctx.strokeStyle = "rgba(60,55,80,0.35)"; ctx.lineWidth = 2;
  const po = scroll % 90;
  for (let x = -po; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 1330); ctx.lineTo(x - 20, 1420); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, 1375); ctx.lineTo(W, 1375); ctx.stroke();
  ctx.fillStyle = "#3c8a4a"; ctx.fillRect(0, 1420, W, 50);
  // Laternen
  for (let i = 0; i < 4; i++) {
    const x = ((i * 380 - scroll) % 1520 + 1520) % 1520 - 100;
    const lg = ctx.createRadialGradient(x, 1130, 5, x, 1130, 120); lg.addColorStop(0, "rgba(255,220,120,0.4)"); lg.addColorStop(1, "rgba(255,220,120,0)");
    ctx.fillStyle = lg; ctx.fillRect(x - 120, 1010, 240, 240);
    ctx.fillStyle = "#1a1530"; ctx.fillRect(x - 3, 1130, 6, 200); ctx.fillStyle = "#ffd77a"; rr(x - 10, 1112, 20, 24, 4); ctx.fill();
  }
  // Fluss bis zum unteren Rand
  const rv = ctx.createLinearGradient(0, 1470, 0, H);
  rv.addColorStop(0, "#22305e"); rv.addColorStop(1, "#141c3a");
  ctx.fillStyle = rv; ctx.fillRect(0, 1470, W, H - 1470);
  ctx.strokeStyle = "rgba(160,180,255,0.25)"; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const y = 1520 + i * 50, x = ((i * 170 - scroll * 0.5) % 1200 + 1200) % 1200 - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70, y); ctx.stroke(); }
}
function library(t, scene) {
  ctx.fillStyle = "#4a2a1e"; ctx.fillRect(0, -120, W, H + 240);
  const R = rng(3);
  for (const sx of [60, 560]) {
    ctx.fillStyle = "#2e1a12"; ctx.fillRect(sx, 520, 460, 820);
    for (let r = 0; r < 6; r++) {
      let x = sx + 16;
      while (x < sx + 440) { const w = 14 + R() * 18, h = 90 + R() * 34; ctx.fillStyle = ["#e0563c", "#4cc96b", "#5aa2ff", "#ffcf3a", "#b06bff", "#ff8fb4", "#3fd0c9"][Math.floor(R() * 7)]; ctx.fillRect(x, 540 + r * 132 + 130 - h - 6, w, h); x += w + 3; }
      ctx.fillStyle = "#6a3d26"; ctx.fillRect(sx, 540 + r * 132 + 124, 460, 12);
    }
  }
  for (let i = 0; i < 5; i++) { const x = 140 + i * 200; ctx.fillStyle = "#f6efe0"; ctx.fillRect(x - 5, 430, 10, 30); ctx.fillStyle = "#ffcf5a"; ctx.beginPath(); ctx.ellipse(x, 420 + Math.sin(t * 6 + i) * 2, 6, 10, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#2a1610"; ctx.fillRect(0, 1340, W, H - 1340 + 120);
  ctx.fillStyle = "#a8262e"; ctx.beginPath(); ctx.ellipse(540, 1400, 380, 60, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = "#d84a4a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(540, 1400, 340, 48, 0, 0, 7); ctx.stroke();
  if (scene === 3) {      // Sessel
    ctx.fillStyle = "#b02a2a"; rr(330, 1040, 420, 330, 60); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    rr(300, 1180, 80, 200, 30); ctx.fill(); ctx.stroke(); rr(700, 1180, 80, 200, 30); ctx.fill(); ctx.stroke();
  }
}
function monsterBook(x, y, open, t, s = 1, sleep) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); rr(-80, -24, 160, 30, 8); fillStroke("#5a3fb0");
  ctx.save(); ctx.translate(-80, -24); ctx.rotate(-open * 0.9);
  rr(0, -26, 160, 26, 8); fillStroke("#6a4fc8"); ctx.restore();
  // Zähne + Augen
  ctx.fillStyle = "#fff"; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 22, -24); ctx.lineTo(-52 + i * 22, -10); ctx.lineTo(-44 + i * 22, -24); ctx.fill(); }
  if (sleep) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, -38); ctx.lineTo(44, -38); ctx.moveTo(52, -38); ctx.lineTo(66, -38); ctx.stroke(); }
  else { eye(36, -40, 7); eye(58, -40, 7); }
  ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(0, -10, 6, 0, 7); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ Gefahren
function hazard(ev, t, scroll, vx, vy) {
  const [te, , kind] = ev;
  const u = t - te;
  if (u < -1.2 || u > 2.5) return;
  if (kind === "book") { const bx = vx + 40 - (u > 0 ? u * SPEED : 0) + (u < 0 ? -u * SPEED : 0); monsterBook(bx, PATH_Y + 4, u > 0 && u < 0.5 ? Math.abs(Math.sin(u * 18)) : 0, t, 0.8); }
  if (kind === "cauldron") {
    const cx = vx + (u < 0 ? -u * SPEED : -u * SPEED);
    ctx.beginPath(); ctx.ellipse(cx, PATH_Y - 30, 62, 46, 0, 0, Math.PI); ctx.lineTo(cx - 62, PATH_Y - 30); fillStroke("#2a2440");
    ctx.beginPath(); ctx.ellipse(cx, PATH_Y - 30, 62, 16, 0, 0, 7); fillStroke("#7be04a", 3);
    for (let i = 0; i < 4; i++) { const bu = (t * 1.6 + i / 4) % 1; ctx.fillStyle = `rgba(150,240,90,${1 - bu})`; ctx.beginPath(); ctx.arc(cx - 30 + i * 20, PATH_Y - 40 - bu * 60, 8 * (1 - bu) + 3, 0, 7); ctx.fill(); }
  }
  if (kind === "owl") {
    const p = ramp(t, te - 0.6, te), q = ramp(t, te, te + 1.4);
    const ox = q > 0 ? lerp(vx, -200, easeIO(q)) : lerp(W + 100, vx, easeOut(p)), oy = q > 0 ? lerp(vy - 200, 400, easeIO(q)) : lerp(700, vy - 200, easeOut(p));
    ctx.save(); ctx.translate(ox, oy);
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 40, 0, 0, 7); fillStroke("#8a5a36");
    const fl = Math.sin(t * 30) * 0.6;
    for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (0.6 + fl)); ctx.beginPath(); ctx.ellipse(s * 50, 0, 36, 14, 0, 0, 7); fillStroke("#6a4226", 3); ctx.restore(); }
    eye(-12, -12, 10); eye(12, -12, 10); ctx.fillStyle = "#ffb03a"; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(0, 10); ctx.fill();
    ctx.restore();
  }
  if (kind === "ghost") {
    const p = back(ramp(t, te - 0.15, te + 0.2)) * (1 - ramp(t, te + 1.2, te + 1.6));
    if (p > 0) { ctx.save(); ctx.translate(vx + 90, vy - 70 + Math.sin(t * 6) * 6); ctx.scale(p, p);
      ctx.beginPath(); ctx.moveTo(-40, 50); ctx.lineTo(-40, -20); ctx.arc(0, -20, 40, Math.PI, 0); ctx.lineTo(40, 50);
      for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(30 - i * 20, 34, 20 - i * 20, 50);
      ctx.closePath(); fillStroke("#f6f6ff"); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(-12, -20, 5, 8, 0, 0, 7); ctx.ellipse(12, -20, 5, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 2, 8, 10, 0, 0, 7); ctx.fill(); ctx.restore(); }
  }
  if (kind === "ball") {
    const p = ramp(t, te - 0.5, te);
    if (u < 0) { ctx.beginPath(); ctx.arc(lerp(W + 60, vx + 30, p), lerp(900, vy - 100, p), 24, 0, 7); fillStroke("#e03a3a"); }
    else { ctx.beginPath(); ctx.arc(vx + 30 + u * 500, vy - 100 - u * 400, 24, 0, 7); fillStroke("#e03a3a"); }
  }
  if (kind === "stairs") {
    const a = ramp(t, te - 0.8, te - 0.4) * (1 - ramp(t, te + 2.0, te + 2.4));
    const sx = vx - 40 - Math.max(0, u + 0.8) * 60;
    ctx.save(); ctx.globalAlpha = a;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); rr(sx + i * 34, PATH_Y - 30 - i * 44, 46, 30, 4); fillStroke("#8a86a0", 3); }
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, PATH_Y - 90); ctx.lineTo(sx + 300, PATH_Y - 470); ctx.stroke();
    ctx.restore();
  }
  if (kind === "broom") {
    const p = ramp(t, te - 0.4, te + 0.3);
    if (p > 0 && p < 1) { ctx.save(); ctx.translate(vx - 160 + p * 260, PATH_Y - 20); ctx.rotate(-0.4 + p * 0.8);
      ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -240); ctx.stroke();
      ctx.fillStyle = "#d8a84a"; ctx.beginPath(); ctx.moveTo(-26, 30); ctx.lineTo(26, 30); ctx.lineTo(12, -10); ctx.lineTo(-12, -10); ctx.closePath(); fillStroke("#d8a84a", 3); ctx.restore(); }
  }
  if (kind === "hat") {
    const a = ramp(t, te - 1.0, te - 0.7) * (1 - ramp(t, te + 1.5, te + 1.9));
    const hx = vx + 60 - Math.max(0, u + 1.0) * 40;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(hx - 30, PATH_Y); ctx.lineTo(hx - 24, PATH_Y - 70); ctx.moveTo(hx + 30, PATH_Y); ctx.lineTo(hx + 24, PATH_Y - 70); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx, PATH_Y - 72, 40, 10, 0, 0, 7); fillStroke("#8a5a2b", 3);
    const sq = u > 0 && u < 0.3 ? Math.sin(u / 0.3 * Math.PI) * 0.3 : 0;
    ctx.save(); ctx.translate(hx, PATH_Y - 80); ctx.scale(1 + sq, 1 - sq);
    ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(46, 0); ctx.lineTo(10, -40); ctx.lineTo(30, -110); ctx.lineTo(-20, -40); ctx.closePath(); fillStroke("#7a5a3a", 3); ctx.restore();
    ctx.restore();
  }
  if (kind === "magic") {
    const a = ramp(t, te - 1.0, te - 0.6) * (1 - ramp(t, te + 1.6, te + 2.0));
    const wx = vx + 120;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.moveTo(wx - 50, PATH_Y); ctx.lineTo(wx - 30, PATH_Y - 120); ctx.lineTo(wx + 30, PATH_Y - 120); ctx.lineTo(wx + 50, PATH_Y); ctx.closePath(); fillStroke("#1e2a6a");
    ctx.fillStyle = "#ffd23f"; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(wx - 30 + (i * 23) % 60, PATH_Y - 20 - (i * 37) % 90, 3, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.arc(wx, PATH_Y - 150, 30, 0, 7); fillStroke("#f6f2ea");
    eye(wx + 6, PATH_Y - 154, 5); eye(wx + 20, PATH_Y - 154, 5);
    ctx.beginPath(); ctx.moveTo(wx - 34, PATH_Y - 172); ctx.lineTo(wx + 34, PATH_Y - 172); ctx.lineTo(wx + 20, PATH_Y - 182); ctx.lineTo(wx + 16, PATH_Y - 250); ctx.lineTo(wx - 16, PATH_Y - 250); ctx.lineTo(wx - 20, PATH_Y - 182); ctx.closePath(); fillStroke("#1a1a24");
    ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(wx - 30, PATH_Y - 90); ctx.lineTo(wx - 90, PATH_Y - 130); ctx.stroke();
    ctx.restore();
    // Taube fliegt davon
    if (u > 0.1 && u < 2.2) {
      const d = (u - 0.1) / 2.1;
      ctx.save(); ctx.translate(vx + d * 300, vy - 80 - d * 600);
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 14, 0, 0, 7); fillStroke("#ffffff", 3);
      const fl = Math.sin(t * 28) * 0.7; for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * fl); ctx.beginPath(); ctx.ellipse(s * 26, -6, 20, 8, 0, 0, 7); fillStroke("#f2f2f2", 3); ctx.restore(); }
      ctx.restore();
    }
  }
  if (kind === "poof" || kind === "magic") {
    const p = ramp(t, te, te + 0.9);
    if (p > 0 && p < 1) for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2; ctx.fillStyle = `rgba(190,130,255,${0.85 * (1 - p)})`; ctx.beginPath(); ctx.arc(vx + Math.cos(an) * 50 * easeOut(p), vy - 70 + Math.sin(an) * 40 * easeOut(p), 40 * (1 - p * 0.4), 0, 7); ctx.fill(); }
  }
}
// Wie verschwindet das Opfer? -> {x, y, s, rot, a}
function victim(ev, t, x, y) {
  const [te, , kind] = ev;
  const u = t - te;
  if (u < 0) return { x, y, s: 1, a: 1 };
  switch (kind) {
    case "book": return { x: x + 40 - u * SPEED, y, s: Math.max(0, 1 - u * 3), a: 1 };
    case "cauldron": return { x: x - u * SPEED, y: y + u * 160, s: Math.max(0, 1 - u * 2), a: 1 };
    case "owl": { const q = ramp(t, te, te + 1.4); return { x: lerp(x, -200, easeIO(q)), y: lerp(y, 520, easeIO(q)) + 60, s: 0.8, a: 1, run: false }; }
    case "ghost": return { x: x - u * 700, y, s: 1, a: 1, flip: true };
    case "ball": return { x: x + u * 500, y: y - u * 500, s: 1, rot: u * 12, a: 1 };
    case "stairs": { const q = ramp(t, te, te + 1.8); return { x: x - 40 + q * 300 - u * 40, y: y - q * 420, s: 1, a: 1 - ramp(t, te + 1.8, te + 2.2) }; }
    case "broom": return { x: x + u * 600, y: y - u * 700, s: 1, rot: u * 8, a: 1 };
    case "hat": return { x: x + 60, y: y - 70 - u * 900, s: 1, rot: u * 6, a: 1 };
    case "magic": case "poof": return { x, y, s: 1, a: u < 0.05 ? 1 : 0 };
  }
  return { x, y, s: 1, a: 1 };
}

// ------------------------------------------------------------------ Anzeigen
function board(t) {
  const ROW = [M.slice(0, 6), M.slice(6, 12)];
  ctx.save();
  ROW.forEach((row, r) => row.forEach((m, i) => {
    const x = 70 + i * 160, y = BOARD_Y + r * 64;
    const ev = OUT.find(e => e[1] === m.k);
    const out = ev && t >= ev[0] + 1.0;
    const winner = m.k === "SEP" && t >= WIN;
    ctx.fillStyle = out ? "#cfcad8" : m.tag; rr(x, y - 26, 146, 52, 12); ctx.fill();
    ctx.strokeStyle = winner ? "#ffd23f" : INK; ctx.lineWidth = winner ? 6 : 3; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(x + 28, y, 18, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); ctx.clip();
    animal(m.a, x + 28, y + 36, 0, { s: 0.36, run: false }); ctx.restore();
    ctx.fillStyle = out ? "#8a8498" : "#fff"; ctx.font = "900 26px InterBlk"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(m.k, x + 54, y + 1);
    if (out) {
      const p = back(ramp(t, ev[0] + 1.0, ev[0] + 1.25));
      ctx.save(); ctx.translate(x + 73, y); ctx.scale(p, p);
      ctx.strokeStyle = "#e03a3a"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-40, -16); ctx.lineTo(40, 16); ctx.moveTo(40, -16); ctx.lineTo(-40, 16); ctx.stroke(); ctx.restore();
      ctx.fillStyle = "#e03a3a"; rr(x + 108, y - 38, 44, 24, 8); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 17px InterBlk"; ctx.textAlign = "center"; ctx.fillText("#" + ev[4], x + 130, y - 25);
    }
  }));
  const left = 12 - OUT.filter(e => t >= e[0] + 1.0).length;
  if (t < WIN) { ctx.fillStyle = "#ffffff"; ctx.font = "900 30px InterBlk"; ctx.textAlign = "center"; ctx.fillText(`${left} ÜBRIG`, 540, BOARD_Y + 116); }
  ctx.restore();
}
function banner(t, t0, m, big, small, gold) {
  const p = ramp(t, t0, t0 + 0.25) * (1 - ramp(t, t0 + 1.6, t0 + 1.85));
  if (p <= 0) return;
  ctx.save(); ctx.translate(540, 700); ctx.scale(back(Math.min(1, p * 1.2)), back(Math.min(1, p * 1.2))); ctx.globalAlpha = clamp(p * 3);
  ctx.font = "900 50px InterBlk";
  const w = Math.max(ctx.measureText(big).width + 170, 520);
  ctx.fillStyle = gold ? "#ffd23f" : "#ffffff"; rr(-w / 2, -64, w, 128, 26); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(-w / 2 + 70, 0, 44, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.clip();
  animal(m.a, -w / 2 + 70, 82, 0, { s: 0.8, run: false }); ctx.restore();
  ctx.fillStyle = gold ? INK : "#e03a3a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(big, 50, -14);
  ctx.fillStyle = INK; ctx.font = "900 26px InterBlk"; ctx.fillText(small, 50, 34);
  ctx.restore();
}
function word(t, t0, txt, x, y, col = "#ffffff") {
  const p = ramp(t, t0, t0 + 0.18) * (1 - ramp(t, t0 + 0.9, t0 + 1.15));
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08); const s = back(Math.min(1, p * 1.3)); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 3);
  ctx.font = "900 78px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
function caption(txt, y, a, size = 40) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `900 ${size}px InterBlk`;
  const w = ctx.measureText(txt).width + 50;
  ctx.fillStyle = "#26203a"; rr(540 - w / 2, y - size * 0.85, w, size * 1.7, 18); ctx.fill(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 540, y + 2); ctx.restore();
}

// ------------------------------------------------------------------ Szenen
function raceScene(t) {
  const moving = t >= RACE_START;
  const scroll = moving ? (t - RACE_START) * SPEED : 0;
  castle(t, scroll);
  // Titel am Anfang
  if (t < RACE_START + 0.4) {
    const a = 1 - ramp(t, RACE_START, RACE_START + 0.4);
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.lineJoin = "round";
    for (const [txt, y, s] of [["WELCHER GEBURTSMONAT", 560, 66], ["GEWINNT?", 650, 92]]) {
      ctx.font = `900 ${s}px InterBlk`; ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.strokeText(txt, 520, y); ctx.fillStyle = "#fff"; ctx.fillText(txt, 520, y);
    }
    ctx.font = "900 34px InterBlk"; const w = ctx.measureText("DAS ZAUBERSCHUL-RENNEN").width + 50;
    ctx.fillStyle = "#8e6bff"; rr(520 - w / 2, 700, w, 60, 16); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillText("DAS ZAUBERSCHUL-RENNEN", 520, 742);
    ctx.restore();
    // Zauberlehrer gibt den Start
    const wx = 900;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.moveTo(wx - 46, PATH_Y); ctx.lineTo(wx - 28, PATH_Y - 110); ctx.lineTo(wx + 28, PATH_Y - 110); ctx.lineTo(wx + 46, PATH_Y); ctx.closePath(); fillStroke("#1e2a6a");
    ctx.beginPath(); ctx.arc(wx, PATH_Y - 140, 28, 0, 7); fillStroke("#f6f2ea"); eye(wx - 10, PATH_Y - 144, 5); eye(wx + 6, PATH_Y - 144, 5);
    ctx.beginPath(); ctx.moveTo(wx - 34, PATH_Y - 160); ctx.lineTo(wx + 2, PATH_Y - 250); ctx.lineTo(wx + 34, PATH_Y - 160); ctx.closePath(); fillStroke("#1e2a6a");
    ctx.strokeStyle = "#5a3a20"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(wx - 30, PATH_Y - 80); ctx.lineTo(wx - 60, PATH_Y - 150 - (t > 2.8 ? 20 : 0)); ctx.stroke();
    if (t > 2.9 && t < 3.4) { ctx.fillStyle = "#ffe98a"; ctx.beginPath(); ctx.arc(wx - 60, PATH_Y - 170, 18, 0, 7); ctx.fill(); }
    ctx.restore();
    // Besen fliegt vorbei
    const bp = ramp(t, 0.8, 1.8);
    if (bp > 0 && bp < 1) { ctx.save(); ctx.translate(lerp(-200, W + 200, bp), 880 - Math.sin(bp * Math.PI) * 60); ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(60, 0); ctx.stroke(); ctx.fillStyle = "#d8a84a"; ctx.beginPath(); ctx.moveTo(-90, -14); ctx.lineTo(-150, -26); ctx.lineTo(-150, 26); ctx.lineTo(-90, 14); ctx.closePath(); fillStroke("#d8a84a", 3); ctx.restore(); }
  }
  // Läufer (nach Tiefe sortiert)
  const order = M.map((m, i) => ({ m, i, d: POS[m.k][1] })).sort((a, b) => a.d - b.d);
  for (const { m, i } of order) {
    const [bx, d] = POS[m.k];
    let x = bx + (moving ? Math.sin(t * 0.7 + i * 1.7) * 26 : 0), y = PATH_Y + d;
    if (m.k === "JUL" && t > WAND + 1.4) x += easeIO(ramp(t, WAND + 1.4, WAND + 2.6)) * 520;   // ZOOM!
    if (m.k === "FEB" || m.k === "SEP") x -= 0;
    const ev = OUT.find(e => e[1] === m.k);
    let v = { x, y, s: 1, a: 1 };
    if (ev) { hazard(ev, t, 0, x, y); v = victim(ev, t, x, y); }
    if (v.a <= 0 || v.x < -150 || v.x > W + 150 || v.y < -200) continue;
    ctx.save(); ctx.globalAlpha = v.a;
    if (v.flip) { ctx.translate(v.x, 0); ctx.scale(-1, 1); ctx.translate(-v.x, 0); }
    animal(m.a, v.x, v.y, t, { s: v.s * AS, ph: i * 1.3, rot: v.rot, run: v.run !== false && moving, wand: m.k === "JUL" && t > WAND + 0.3 });
    ctx.restore();
    if (v.s > 0.6 && !v.rot) tag(m, v.x + 8, v.y - 196 * v.s * AS, v.a);
  }
  // Zauberstab-Schild für Juli
  if (t > WAND - 1.2 && t < WAND + 1.0) {
    const sx = POS.JUL[0] + 120 - (t - WAND + 1.2) * 60;
    ctx.fillStyle = "#6a4a2a"; ctx.fillRect(sx - 4, PATH_Y - 120, 8, 120);
    ctx.save(); ctx.translate(sx, PATH_Y - 130); ctx.rotate(-0.05); rr(-90, -26, 180, 52, 8); fillStroke("#e8d8b0", 3);
    ctx.fillStyle = INK; ctx.font = "900 22px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ZAUBERSTÄBE", 0, 2); ctx.restore();
  }
  for (const ev of OUT) {
    const m = M[IX(ev[1])];
    if (ev[2] !== "poof") word(t, ev[0], ev[3], 520, 960, ev[2] === "cauldron" ? "#9cf06a" : "#ffffff");
    if (ev[0] < FINISH) banner(t, ev[0] + 1.0, m, `#${ev[4]} ${m.name}`, "IST RAUS", false);
  }
  word(t, 2.95, "PENG!", 520, 960, "#ffe98a");
  word(t, 0.9, "WUSCH!", 520, 960);
  word(t, WAND, "SCHNAPP!", 520, 960); word(t, WAND + 1.4, "ZOOM!", 560, 960, "#ffe98a");
}
function finishScene(t) {
  // Zieltor vor dem Schloss
  ctx.fillStyle = "#2a2258"; ctx.fillRect(0, -120, W, H + 240);
  const sky = ctx.createLinearGradient(0, 0, 0, 900); sky.addColorStop(0, "#1a1440"); sky.addColorStop(1, "#3a2d6e"); ctx.fillStyle = sky; ctx.fillRect(0, -120, W, 1020);
  ctx.fillStyle = "#4a4470"; ctx.fillRect(0, 560, W, 830);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 2;
  for (let y = 580; y < 1380; y += 50) for (let x = (y / 50 % 2) * 40; x < W; x += 80) { ctx.strokeRect(x, y, 80, 50); }
  ctx.fillStyle = "#ffd77a"; for (const x of [140, 300, 780, 940]) { rr(x, 640, 30, 54, 14); ctx.fill(); }
  // Tor
  ctx.fillStyle = "#6a3d26"; ctx.beginPath(); ctx.moveTo(700, 1385); ctx.lineTo(700, 1060); ctx.arc(800, 1060, 100, Math.PI, 0); ctx.lineTo(900, 1385); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  // Ziel-Banner
  ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(560, 1385); ctx.lineTo(560, 880); ctx.moveTo(900, 1385); ctx.lineTo(900, 880); ctx.stroke();
  rr(520, 840, 420, 96, 10); fillStroke("#ffffff", 5);
  for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? "#26203a" : "#fff"; ctx.fillRect(520 + i * 30, 840, 30, 14); }
  ctx.fillStyle = "#e03a3a"; ctx.font = "900 62px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ZIEL", 730, 896);
  ctx.fillStyle = "#8a86a0"; ctx.fillRect(0, 1385, W, H - 1385 + 120);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; for (let y = 1400; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Läufer: Juli (vorne, verpufft), September, Februar
  const u = t - FINISH;
  const jul = { x: lerp(260, 470, ramp(t, FINISH, FINISH + 1.6)), y: PATH_Y };
  if (t < OUT[9][0] + 0.05) { animal("cheetah", jul.x, jul.y, t, { wand: true, ph: 1, s: AS }); tag(M[6], jul.x + 8, jul.y - 196 * AS); }
  hazard(OUT[9], t, 0, jul.x, jul.y);
  const sepX = lerp(120, 820, easeIO(ramp(t, FINISH + 0.4, WIN))), febX = lerp(60, 600, easeIO(ramp(t, FINISH + 0.6, WIN + 0.3)));
  animal("rabbit", febX, PATH_Y + 10, t, { ph: 2, run: t < WIN + 0.3, s: AS }); tag(M[1], febX + 8, PATH_Y + 10 - 196 * AS - 40);
  animal("fox", sepX, PATH_Y, t, { ph: 0, run: t < WIN, s: AS }); tag(M[8], sepX + 8, PATH_Y - 196 * AS);
  word(t, OUT[9][0], "PUFF!", 520, 1010, "#d8a8ff");
  word(t, WIN - 1.0, "HEY!", 300, 1010);
  banner(t, OUT[9][0] + 0.8, M[6], "#3 JULI", "PUFF – WEG!", false);
  // Sieger
  const wp = ramp(t, WIN, WIN + 0.3);
  if (wp > 0) {
    const R = rng(Math.floor(t * 10));
    for (let i = 0; i < 40; i++) { const r2 = rng(i + 7); const x = r2() * W, y = ((r2() * 900 + (t - WIN) * 300) % 1100) + 480; ctx.fillStyle = ["#ffd23f", "#ff5fd0", "#5aa2ff", "#4cc96b"][i % 4]; ctx.fillRect(x, y, 12, 6); }
  }
  if (t >= WIN) banner(t < SECOND ? t : WIN + 0.5, WIN, M[8], "#1 SEPTEMBER", "GEWINNT!", true);
  if (t >= SECOND) banner(t < SECOND + 1.5 ? t : SECOND + 1.0, SECOND, M[1], "#2 FEBRUAR", "SO KNAPP …", false);
}
function libScene(t, which) {
  library(t, which);
  if (which === 1) {
    caption("UNTERDESSEN …", 520, 1, 40);
    const spit = ramp(t, LIB1[0] + 0.8, LIB1[0] + 1.1);
    monsterBook(640, 1385, spit > 0 && spit < 1 ? Math.sin(spit * Math.PI) : 0, t, 1.4);
    const dx = lerp(560, 360, easeOut(spit));
    if (spit > 0) { animal("duck", dx, 1385, t, { run: false, rot: -0.2 * (1 - spit), s: 1.5 }); ctx.strokeStyle = INK; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(dx - 8 + s * 4, 1260); ctx.lineTo(dx + 4 + s * 4, 1268); ctx.stroke(); } }
    word(t, LIB1[0] + 0.85, "PTUI!", 520, 960);
  } else if (which === 2) {
    caption("UNTERDESSEN …", 520, 1, 40);
    animal("duck", 520, 1330, t, { run: false, s: 1.6 });
    monsterBook(600, 1230, 0.25 + 0.1 * Math.sin(t * 3), t, 1.0);
    for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; ctx.fillStyle = `rgba(255,120,150,${1 - u})`; ctx.font = "900 34px InterBlk"; ctx.fillText("♥", 640 + i * 10, 1150 - u * 80); }
  } else {
    caption("SPÄTER …", 520, 1, 40);
    animal("duck", 520, 1330, t, { run: false, s: 1.6 });
    monsterBook(600, 1240, 0, t, 1.0, true);
    for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; ctx.fillStyle = `rgba(255,255,255,${1 - u})`; ctx.font = "900 34px InterBlk"; ctx.textAlign = "left"; ctx.fillText("z", 600 + u * 40, 1120 - u * 80); }
    const s = ramp(t, LIB3[0] + 1.0, LIB3[0] + 1.3);
    if (s > 0) {
      ctx.save(); ctx.translate(540, 760); ctx.scale(back(s), back(s));
      rr(-380, -80, 760, 160, 26); fillStroke("#ffffff", 5);
      ctx.fillStyle = INK; ctx.font = "900 40px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SCHICK DAS JEMANDEM,", 0, -26);
      ctx.fillStyle = "#e03a3a"; ctx.fillText("DER VERLOREN HAT", 0, 30); ctx.restore();
    }
  }
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.textAlign = "left";
  ctx.save(); ctx.translate(0, DY);
  if (t >= LIB1[0] && t < LIB1[1]) libScene(t, 1);
  else if (t >= LIB2[0] && t < LIB2[1]) libScene(t, 2);
  else if (t >= LIB3[0]) libScene(t, 3);
  else if (t >= FINISH) finishScene(t);
  else raceScene(t);
  ctx.restore();
  if (t >= RACE_START - 0.2) { ctx.save(); ctx.globalAlpha = ramp(t, RACE_START - 0.2, RACE_START + 0.2); board(t); ctx.restore(); }
  // Schnitt-Blitz
  for (const c of [LIB1[0], LIB1[1], LIB2[0], LIB2[1], FINISH, LIB3[0]]) { const f = 1 - ramp(t, c, c + 0.15); if (t >= c && f > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * f})`; ctx.fillRect(0, 0, W, H); } }
  const fo = ramp(t, window.DURATION - 0.4, window.DURATION);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return {
    duration: window.DURATION, start: 2.95, broom0: 0.9, race: [RACE_START, FINISH], outs: OUT.map(e => ({ t: e[0], kind: e[2] })),
    banners: OUT.map(e => e[0] + 1.0), wand: WAND, zoom: WAND + 1.4, cuts: [LIB1[0], LIB1[1], LIB2[0], LIB2[1], FINISH, LIB3[0]],
    spit: LIB1[0] + 0.85, hey: WIN - 1.0, win: WIN, second: SECOND, send: LIB3[0] + 1.0, snore: LIB3[0],
  };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  buildStatic();
  return true;
};
