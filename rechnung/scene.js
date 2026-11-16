// "Gleiche Rechnung. Andere Strategie." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Grundformen (Gesichter, Schilder, Blasen) aus mensa/scene.js.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 13.3;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
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
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

// ------------------------------------------------------------ Figuren
const COL = { pink: ["#e7aeb0", "#d99a9d"], blue: ["#a6b8e6", "#91a6da"], green: ["#93c4b0", "#80b29e"], white: ["#f3efe6", "#ddd7cb"] };
function face(x, y, r, f, look = 0) {
  ctx.save(); ctx.translate(x, y); const k = r / 30; ctx.scale(k, k);
  ctx.strokeStyle = "#26262a"; ctx.fillStyle = "#26262a"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
  const E = 10, ey = -3, lx = look * 3;
  const dots = (r = 3.4) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * E + lx, ey, r * 0.85, r * 1.2, 0, 0, Math.PI * 2); ctx.fill(); } };
  const big = () => { for (const s of [-1, 1]) { circle(s * E + lx, ey, 4.6, "#26262a"); circle(s * E + lx + 1.3, ey - 1.5, 1.4, "#fff"); } ctx.fillStyle = "#26262a"; };
  const happy = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * E, ey + 2.5, 5, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  const smug = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * E - 6, ey - 1); ctx.lineTo(s * E + 6, ey - 1); ctx.stroke(); ctx.beginPath(); ctx.arc(s * E + 1, ey - 1, 3.2, 0, Math.PI); ctx.fill(); } };
  const m = (kind) => {
    ctx.beginPath();
    if (kind === "smile") ctx.arc(0, 6, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    else if (kind === "grin") { ctx.arc(0, 7, 8.5, 0, Math.PI); ctx.closePath(); ctx.fill(); return; }
    else if (kind === "flat") { ctx.moveTo(-5, 12); ctx.lineTo(5, 12); }
    else if (kind === "o") { ctx.ellipse(0, 12, 3.4, 4.3, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (kind === "wavy") { ctx.moveTo(-7, 12); ctx.quadraticCurveTo(-3.5, 8, 0, 12); ctx.quadraticCurveTo(3.5, 16, 7, 12); }
    else if (kind === "small") ctx.arc(0, 8, 5, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
  };
  switch (f) {
    case "neutral": dots(); m("flat"); break;
    case "smile": dots(); m("smile"); break;
    case "happy": happy(); m("smile"); break;
    case "laugh": happy(); m("grin"); break;
    case "smug": smug(); m("small"); break;
    case "talk": dots(); m("o"); break;
    case "happyTalk": happy(); m("o"); break;
    case "worried": dots(); m("wavy"); break;
    case "wide": big(); m("flat"); break;
    case "shock": big(); m("o"); break;
  }
  ctx.restore();
}
function blush(x, y, r, a) {
  if (a <= 0) return;
  ctx.globalAlpha = a * 0.6;
  circle(x - r * 0.52, y + r * 0.25, r * 0.17, "#f08a8a"); circle(x + r * 0.52, y + r * 0.25, r * 0.17, "#f08a8a");
  ctx.globalAlpha = 1;
}
// Kopf + Körper; Körper oben bei y + r*0.85
function person(o) {
  const [c1, c2] = COL[o.col];
  const r = o.r, bw = r * (o.wide || 1.85), bh = o.bodyH || r * 3;
  ctx.save();
  ctx.translate(o.x, o.y); ctx.rotate(o.lean || 0); ctx.translate(-o.x, -o.y);
  // Körper
  ctx.fillStyle = c2; rr(o.x - bw / 2, o.y + r * 0.82, bw, bh, [bw / 2, bw / 2, 4, 4]); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)"; rr(o.x - bw / 2 + 3, o.y + r * 0.9, bw * 0.4, bh - 6, bw / 4); ctx.fill();
  // Arme
  if (o.arm) for (const a of o.arm) {
    ctx.save(); ctx.translate(o.x + a.side * bw * 0.42, o.y + r * 1.25); ctx.rotate(a.ang);
    ctx.fillStyle = c2; ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
    rr(-r * 0.15, -r * 0.1, r * 0.3, a.len || r * 1.6, r * 0.15); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // Kopf
  const g = ctx.createRadialGradient(o.x - r * 0.35, o.y - r * 0.4, r * 0.1, o.x, o.y, r);
  g.addColorStop(0, o.col === "white" ? "#fbf9f4" : c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.fill();
  face(o.x, o.y, r, o.face, o.look || 0);
  blush(o.x, o.y, r, o.blush || 0);
  ctx.restore();
}

function tray(x, y, w, food = true) {
  ctx.fillStyle = "#6f8f96"; rr(x - w / 2, y - 7, w, 14, 3); ctx.fill();
  ctx.fillStyle = "#88a9af"; rr(x - w / 2 + 2, y - 6, w - 4, 9, 2); ctx.fill();
  if (food) {
    ctx.fillStyle = "#f5f2ea"; ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - 2, w * 0.28, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ec8a3a"; ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - 2.5, w * 0.19, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function juice(x, y) {
  ctx.fillStyle = "#f6b928"; ctx.fillRect(x - 4, y - 12, 8, 12);
  ctx.strokeStyle = "#e44"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 1, y - 12); ctx.lineTo(x + 3, y - 19); ctx.stroke();
}
function apple(x, y) { circle(x, y, 4.5, "#d63b34"); ctx.fillStyle = "#4b8a3c"; ctx.fillRect(x - 0.5, y - 7, 1.2, 3); }

function drawBackTable() {
  ctx.fillStyle = "#c08a55"; ctx.beginPath(); ctx.moveTo(220, 572); ctx.lineTo(456, 572); ctx.lineTo(460, 584); ctx.lineTo(214, 584); ctx.fill();
  ctx.fillStyle = "#a5723f"; ctx.fillRect(214, 584, 246, 4);
  ctx.fillStyle = "#151a24"; ctx.fillRect(218, 588, 238, 22);
  ctx.fillStyle = "#b98450"; rr(210, 606, 254, 9, 2); ctx.fill();
  ctx.fillStyle = "#8c5f35"; ctx.fillRect(210, 615, 254, 4);
}
function drawFrontTable() {
  ctx.fillStyle = "#c69259"; ctx.beginPath(); ctx.moveTo(48, 667); ctx.lineTo(530, 667); ctx.lineTo(540, 692); ctx.lineTo(38, 692); ctx.fill();
  ctx.fillStyle = "#a8743f"; ctx.fillRect(38, 692, 502, 7);
  ctx.fillStyle = "#151a24"; ctx.fillRect(44, 699, 490, 22);
  ctx.fillStyle = "#c08a55"; rr(30, 718, 516, 26, 3); ctx.fill();
  ctx.fillStyle = "#99683b"; ctx.fillRect(30, 740, 516, 12);
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
  for (const x of [150, 300, 430]) { ctx.beginPath(); ctx.moveTo(x, 720); ctx.lineTo(x - 4, 744); ctx.stroke(); }
}
function drawBook(x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = "#3b2f78"; rr(-48, -32, 96, 64, 3); ctx.fill();
  ctx.fillStyle = "#4b3c94"; rr(-46, -30, 44, 60, 2); ctx.fill(); rr(2, -30, 44, 60, 2); ctx.fill();
  ctx.fillStyle = "#2b2358"; ctx.fillRect(-1.5, -32, 3, 64);
  ctx.fillStyle = "#f2c85a"; ctx.beginPath(); const sx = 24, sy = -6;
  ctx.moveTo(sx, sy - 7); ctx.lineTo(sx + 2, sy - 2); ctx.lineTo(sx + 7, sy); ctx.lineTo(sx + 2, sy + 2); ctx.lineTo(sx, sy + 7); ctx.lineTo(sx - 2, sy + 2); ctx.lineTo(sx - 7, sy); ctx.lineTo(sx - 2, sy - 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(10, 12, 28, 2.5); ctx.fillRect(-38, 12, 22, 2.5);
  ctx.restore();
}

// ------------------------------------------------------------ Schilder + Blasen
function label(text, cx, cy, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = "700 14px InterX"; ctx.letterSpacing = "1.6px";
  const w = ctx.measureText(text).width + 20;
  ctx.fillStyle = "rgba(38,44,56,0.95)"; rr(cx - w / 2, cy - 12, w, 24, 12); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#eef0f2"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, cx + 0.8, cy + 1);
  ctx.restore();
}
// Sprechblase: kind "speech" (mit Spitze), "thought" (Wolke), "robot" (Kasten)
function bubble(text, cx, cy, s, kind, tail) {
  if (s <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s);
  const robot = kind === "robot";
  ctx.font = robot ? "900 16.5px InterX" : "700 16.5px InterX";
  ctx.letterSpacing = robot ? "1.4px" : "0px";
  const w = ctx.measureText(text).width + (robot ? 26 : 30), h = robot ? 32 : 34;
  ctx.fillStyle = "#f7f2e6";
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  if (kind === "thought") {
    ctx.beginPath();
    const n = Math.max(3, Math.round(w / 22));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + 6 + i * (w - 12) / n; ctx.moveTo(x + 12, -h / 2 + 4); ctx.arc(x, -h / 2 + 6, 11, 0, Math.PI * 2); ctx.moveTo(x + 12, h / 2 - 4); ctx.arc(x, h / 2 - 6, 11, 0, Math.PI * 2); }
    ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 14);
    ctx.fill();
  } else if (robot) {
    ctx.fillStyle = "#eef3fa"; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#7d9cc4"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
    if (tail) { ctx.fillStyle = "#eef3fa"; ctx.beginPath(); ctx.moveTo(tail[0] - 6, h / 2 - 1); ctx.lineTo(tail[0] + 6, h / 2 - 1); ctx.lineTo(tail[0] + tail[1], h / 2 + 12); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    if (tail) { ctx.moveTo(tail[0] - 7, h / 2 - 2); ctx.lineTo(tail[0] + tail[1], h / 2 + 13); ctx.lineTo(tail[0] + 7, h / 2 - 2); }
    ctx.fill();
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = robot ? "#22324a" : "#1d1d22";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, robot ? 0.7 : 0, 1);
  ctx.restore();
}
// Auftauchen (federnd) und Verschwinden
function popIn(t, a, b = 99, dur = 0.25) { if (t < a || t > b + 0.2) return 0; return back(ramp(t, a, a + dur)) * (1 - easeIO(ramp(t, b, b + 0.2))); }
function puff(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = "#f7f2e6";
  for (let i = 0; i < 8; i++) { const a = i * 0.785; circle(x + Math.cos(a) * 26 * k, y + Math.sin(a) * 16 * k, 7 * (1 - k * 0.6), "#f7f2e6"); }
  ctx.restore();
}
function heart(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.9); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.translate(x, y - k * 16); ctx.scale(0.5 + back(ramp(t, t0, t0 + 0.25)) * 0.5, 0.5 + back(ramp(t, t0, t0 + 0.25)) * 0.5);
  ctx.fillStyle = "#f27a9a"; ctx.beginPath(); ctx.moveTo(0, 5); ctx.bezierCurveTo(-9, -2, -5, -9, 0, -4); ctx.bezierCurveTo(5, -9, 9, -2, 0, 5); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------ eigene Farben + Erkennungsmerkmale
COL.gold = ["#ffd36e", "#f2bc45"];
COL.sky = ["#9cc7ff", "#7fb0f2"];
COL.lime = ["#a8e57a", "#8ccf5e"];

// ------------------------------------------------------------ Bestellungen: [Zeit, wer, Gericht, Preis]
const X = { zahlt: 112, wer: 288, cent: 462 };
const ORDERS = [
  [0.4, "zahlt", "pizza", 14.9], [0.9, "wer", "burger", 18.5], [1.35, "cent", "salat", 6.8], [1.75, "wer", "cocktail", 11.5],
  [2.1, "zahlt", "cola", 3.9], [2.45, "wer", "cocktail", 11.5], [2.75, "cent", "wasser", 0], [3.05, "wer", "nachos", 9.9],
  [3.3, "wer", "steak", 32.0], [3.55, "zahlt", "tiramisu", 7.5], [3.8, "wer", "cocktail", 11.5], [4.05, "wer", "pommes", 5.9],
  [4.3, "wer", "cocktail", 11.5], [4.55, "wer", "eisbecher", 14.9], [4.8, "wer", "cocktail", 11.5], [5.1, "wer", "espresso", 3.2],
  [6.2, "wer", "kurzer", 4.5], [7.4, "wer", "kurzer", 2.5],
];
const TOTAL = ORDERS.reduce((a, o) => a + o[3], 0);
const T = { lade: 1.0, eins: 2.15, rechnet: 3.0, wasser: 2.9, bill: 8.55, climax: 9.0, klo: 9.1, run: 9.35, gone: 9.85,
  card: 10.0, calc: 10.45, title1: 9.7, title2: 10.2, sticker: 11.6, stickerEnd: 12.55, loop: 12.95, end: DUR };
const TY = 604;                                    // Tischkante

const fmt = v => v.toFixed(2).replace(".", ",") + " €";
function totalAt(t) {
  let v = 0;
  for (const [a, , , p] of ORDERS) { if (t >= a + 0.18) v += p; else if (t >= a) v += p * easeOut((t - a) / 0.18); }
  return v;
}

// ------------------------------------------------------------ Restaurant
function drawRoom(t) {
  let g = ctx.createLinearGradient(0, 280, 0, TY);
  g.addColorStop(0, "#5a2a2a"); g.addColorStop(1, "#6e3532");
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, TY - 280);
  // Streifentapete
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let x = 0; x < W; x += 36) ctx.fillRect(x, 280, 16, TY - 280);
  // Holzleiste
  ctx.fillStyle = "#3d1f17"; ctx.fillRect(0, 500, W, 104);
  ctx.fillStyle = "#4e291e"; ctx.fillRect(0, 500, W, 5);
  // Tafel "Heute"
  ctx.fillStyle = "#6b4a2c"; rr(30, 312, 132, 110, 6); ctx.fill();
  ctx.fillStyle = "#22302a"; rr(37, 319, 118, 96, 4); ctx.fill();
  ctx.fillStyle = "#e9efe6"; ctx.textAlign = "center"; ctx.font = "900 13px InterX"; ctx.letterSpacing = "1.5px";
  ctx.fillText("HEUTE", 96, 342);
  ctx.font = "700 10px InterX"; ctx.letterSpacing = "0.5px";
  ctx.fillText("Cocktails 11,50", 96, 364); ctx.fillText("Steak 32,00", 96, 382); ctx.fillText("Wasser gratis", 96, 400);
  ctx.letterSpacing = "0px";
  // Bild rechts
  ctx.fillStyle = "#b8893a"; rr(410, 320, 120, 86, 4); ctx.fill();
  ctx.fillStyle = "#2d4a6a"; ctx.fillRect(418, 328, 104, 70);
  ctx.fillStyle = "#f2e2a8"; circle(492, 348, 9, "#f2e2a8");
  ctx.fillStyle = "#3d6b4a"; ctx.beginPath(); ctx.moveTo(418, 398); ctx.lineTo(456, 360); ctx.lineTo(494, 398); ctx.fill();
  // Lampen
  for (const lx of [108, 288, 468]) {
    ctx.strokeStyle = "#1e0e0a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, 280); ctx.lineTo(lx, 304); ctx.stroke();
    glow(lx, 318, 120, "255,200,130", 0.22);
    ctx.fillStyle = "#2a1a12"; ctx.beginPath(); ctx.moveTo(lx - 22, 318); ctx.lineTo(lx - 8, 302); ctx.lineTo(lx + 8, 302); ctx.lineTo(lx + 22, 318); ctx.fill();
    ctx.fillStyle = "#ffe0a8"; ctx.beginPath(); ctx.ellipse(lx, 318, 20, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function drawChairs(empty) {
  for (const x of [X.zahlt, X.wer, X.cent]) {
    ctx.fillStyle = x === X.wer && empty ? "#4a2418" : "#3a1c12";
    rr(x - 40, 470, 80, 140, [14, 14, 2, 2]); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.2)"; rr(x - 30, 480, 60, 110, 8); ctx.fill();
  }
}
function drawTable() {
  ctx.fillStyle = "#f3ece0"; ctx.fillRect(0, TY, W, 12);
  ctx.fillStyle = "#e6dccb"; ctx.fillRect(0, TY + 12, W, 150);
  ctx.strokeStyle = "rgba(160,140,110,0.25)"; ctx.lineWidth = 1;
  for (let x = 20; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, TY + 14); ctx.lineTo(x - 4, TY + 162); ctx.stroke(); }
  ctx.fillStyle = "#c8b89e"; ctx.fillRect(0, TY + 160, W, 6);
  ctx.fillStyle = "#1a1012"; ctx.fillRect(0, TY + 166, W, H - TY - 166);
  const g = ctx.createLinearGradient(0, TY + 166, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0.2)"); g.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = g; ctx.fillRect(0, TY + 166, W, H - TY - 166);
}

// ------------------------------------------------------------ Gerichte (eigene einfache Formen)
function dish(kind, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const plateBase = () => { ctx.fillStyle = "#fbfaf6"; ctx.beginPath(); ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2); ctx.fill(); };
  switch (kind) {
    case "pizza": plateBase(); ctx.fillStyle = "#e9b04f"; ctx.beginPath(); ctx.ellipse(0, -2, 19, 4.5, 0, 0, Math.PI * 2); ctx.fill();
      for (const [dx, dy] of [[-8, -2], [5, -3], [9, -1], [-2, -1]]) circle(dx, dy, 2.2, "#c8402f"); break;
    case "burger": plateBase(); ctx.fillStyle = "#e3a24c"; ctx.beginPath(); ctx.arc(0, -10, 13, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#5b8f3a"; ctx.fillRect(-14, -10, 28, 3); ctx.fillStyle = "#6b3a22"; ctx.fillRect(-13, -7, 26, 5); ctx.fillStyle = "#e3a24c"; rr(-13, -3, 26, 4, 2); ctx.fill(); break;
    case "salat": plateBase(); for (const [dx, c] of [[-6, "#7cc35a"], [3, "#5aa64a"], [8, "#d9483c"], [-1, "#9fd36d"]]) circle(dx, -3, 4, c); break;
    case "cocktail": ctx.fillStyle = "rgba(255,140,170,0.9)"; ctx.beginPath(); ctx.moveTo(-10, -26); ctx.lineTo(10, -26); ctx.lineTo(0, -12); ctx.fill();
      ctx.strokeStyle = "#e9eef5"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 0); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.fillStyle = "#ffd23a"; ctx.beginPath(); ctx.moveTo(4, -26); ctx.lineTo(16, -36); ctx.lineTo(12, -26); ctx.fill(); break;
    case "cola": ctx.fillStyle = "#3a1f14"; rr(-6, -22, 12, 22, 2); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(-4, -20, 2, 18); break;
    case "wasser": ctx.fillStyle = "rgba(190,225,255,0.8)"; rr(-6, -20, 12, 20, 2); ctx.fill(); break;
    case "nachos": plateBase(); ctx.fillStyle = "#f2c447"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-14 + i * 6, -1); ctx.lineTo(-10 + i * 6, -12); ctx.lineTo(-6 + i * 6, -1); ctx.fill(); } break;
    case "steak": plateBase(); ctx.fillStyle = "#7a3a24"; ctx.beginPath(); ctx.ellipse(-2, -3, 13, 5, 0, 0, Math.PI * 2); ctx.fill(); circle(11, -3, 3, "#6cb24a"); break;
    case "tiramisu": ctx.fillStyle = "#f3e6cf"; rr(-10, -14, 20, 14, 2); ctx.fill(); ctx.fillStyle = "#6b4426"; ctx.fillRect(-10, -14, 20, 3); ctx.fillRect(-10, -8, 20, 2); break;
    case "pommes": ctx.fillStyle = "#d9443c"; ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(9, -14); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.fill();
      ctx.fillStyle = "#f6d04a"; for (let i = 0; i < 5; i++) ctx.fillRect(-8 + i * 3.6, -22 + (i % 2) * 3, 2.4, 10); break;
    case "eisbecher": ctx.fillStyle = "rgba(230,240,255,0.7)"; ctx.beginPath(); ctx.moveTo(-10, -16); ctx.lineTo(10, -16); ctx.lineTo(4, 0); ctx.lineTo(-4, 0); ctx.fill();
      circle(-5, -20, 6, "#f6b3c8"); circle(5, -20, 6, "#f4e3b0"); circle(0, -27, 6, "#9a6a46"); circle(0, -34, 2.5, "#d9443c"); break;
    case "espresso": ctx.fillStyle = "#fbfaf6"; rr(-6, -10, 12, 10, 2); ctx.fill(); ctx.fillStyle = "#4a2a1a"; ctx.fillRect(-5, -9, 10, 2); break;
    case "kurzer": ctx.fillStyle = "rgba(255,210,120,0.85)"; rr(-5, -12, 10, 12, 1); ctx.fill(); break;
  }
  ctx.restore();
}
// feste Plätze auf dem Tisch je Person
const SLOTS = {
  zahlt: [[X.zahlt + 6, TY + 2], [X.zahlt + 48, TY + 2], [X.zahlt - 36, TY + 2]],
  cent: [[X.cent + 4, TY + 2], [X.cent + 42, TY + 2]],
  wer: [[X.wer - 8, TY + 2], [X.wer - 58, TY + 1], [X.wer + 40, TY + 2], [X.wer + 4, TY - 4], [X.wer - 30, TY - 8], [X.wer + 62, TY + 1],
        [X.wer - 78, TY + 2], [X.wer + 24, TY - 10], [X.wer - 46, TY - 12], [X.wer + 78, TY - 2], [X.wer - 10, TY - 16], [X.wer + 48, TY - 14],
        [X.wer - 66, TY - 10], [X.wer + 8, TY - 20]],
};
function drawDishes(t) {
  const used = { zahlt: 0, cent: 0, wer: 0 };
  for (const [a, who, kind] of ORDERS) {
    const slot = SLOTS[who][used[who]++ % SLOTS[who].length];
    if (t < a) continue;
    const s = back(ramp(t, a, a + 0.22));
    dish(kind, slot[0], slot[1] - (1 - easeOut(ramp(t, a, a + 0.18))) * 24, s);
  }
}
function priceTags(t) {
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const [a, who, , p] of ORDERS) {
    const k = ramp(t, a, a + 0.9);
    if (k <= 0 || k >= 1) continue;
    const x = X[who] + (who === "wer" ? 54 : 46), y = TY - 70 - k * 34;
    ctx.globalAlpha = Math.sin(Math.PI * k);
    ctx.font = "900 15px InterX";
    const txt = "+" + fmt(p);
    const w = ctx.measureText(txt).width + 14;
    ctx.fillStyle = p === 0 ? "#7fd0a0" : "#ffd36e"; rr(x - w / 2, y - 11, w, 22, 11); ctx.fill();
    ctx.fillStyle = "#2a1a12"; ctx.fillText(txt, x, y + 1);
  }
  ctx.globalAlpha = 1;
}
function billFolder(t) {
  const k = easeOut(ramp(t, T.bill, T.bill + 0.35));
  if (k <= 0) return;
  const x = lerp(W + 60, 210, k), y = TY + 4;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05);
  ctx.fillStyle = "#1f1a1c"; rr(-30, -8, 60, 10, 2); ctx.fill();
  ctx.fillStyle = "#f6f2e6"; ctx.fillRect(-18, -14, 36, 7);
  ctx.fillStyle = "#c8a24a"; ctx.font = "900 6px InterX"; ctx.textAlign = "center"; ctx.fillText("RECHNUNG", 0, -2);
  ctx.restore();
}

// ------------------------------------------------------------ Figuren mit Merkmalen
function goldChain(x, y, r) {
  ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y + r * 0.9, r * 0.55, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  circle(x, y + r * 1.45, 4, "#ffe08a");
}
function glasses(x, y, r) {
  ctx.strokeStyle = "#1f2838"; ctx.lineWidth = 2.4;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 10, y - 3, 7.5, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - 2.5, y - 3); ctx.lineTo(x + 2.5, y - 3); ctx.stroke();
}
function cap(x, y, r, dir = 1) {
  ctx.fillStyle = "#e0573f";
  ctx.beginPath(); ctx.arc(x, y - r * 0.3, r * 0.98, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#c2432e"; rr(x + (dir > 0 ? -4 : -r * 1.5 + 4), y - r * 0.38, r * 1.5, 7, 3); ctx.fill();
  circle(x, y - r * 1.26, 3.5, "#c2432e");
}
function calculator(x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = "#2a3346"; rr(-14, -20, 28, 36, 4); ctx.fill();
  ctx.fillStyle = "#b9f0c4"; ctx.fillRect(-10, -16, 20, 8);
  ctx.fillStyle = "#cfd6e4"; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.fillRect(-10 + i * 7.5, -4 + j * 6.5, 5, 4.5);
  ctx.restore();
}
function card(x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.25); ctx.scale(k, k);
  ctx.fillStyle = "#1e2433"; rr(-18, -12, 36, 24, 3); ctx.fill();
  ctx.fillStyle = "#e8c45a"; ctx.fillRect(-12, -5, 8, 6);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(-12, 5, 22, 2);
  ctx.restore();
}

function werState(t) {
  // sitzt, steht auf, rennt nach links raus
  let x = X.wer, y = 506, face = "smug", arm = null, alpha = 1;
  if (t > T.lade - 0.1 && t < T.lade + 0.6) face = "happy";
  if (t > T.eins - 0.05 && t < T.eins + 0.7) face = "talk";
  if (t > 5.3 && t < T.bill) face = stateAt([[5.3, "happy"], [6.2, "laugh"], [6.8, "smug"], [7.4, "laugh"], [8.0, "smug"]], t);
  if (t >= T.bill) face = "wide";
  if (t >= T.klo) { face = "talk"; y = 506 - 26 * easeOut(ramp(t, T.klo, T.klo + 0.2)); }
  if (t >= T.run) {
    const k = ramp(t, T.run, T.gone);
    x = lerp(X.wer, -60, easeIO(k)); y = 480 - Math.abs(Math.sin(t * 18)) * 6; face = "worried"; alpha = 1;
  }
  if (t >= T.gone) alpha = 0;
  return { col: "lime", x, y, r: 30, face, bodyH: t >= T.klo ? 150 : 100, look: t >= T.run ? -1 : 0, arm, alpha };
}

function people(t) {
  const wer = werState(t);
  const running = t >= T.run && t < T.gone;
  drawChairs(t >= T.run);
  if (running && wer.alpha > 0) { person(wer); cap(wer.x, wer.y, 30, -1); }   // läuft hinter den anderen vorbei
  // Zahlt alles
  const zf = stateAt([[0, "happy"], [0.5, "smile"], [T.lade - 0.05, "happyTalk"], [T.lade + 0.6, "smile"], [3.6, "happy"], [4.4, "smile"], [T.bill, "neutral"], [T.climax, "shock"], [T.card - 0.1, "happyTalk"], [T.card + 0.7, "smile"], [T.sticker, "happy"]], t);
  const cardK = back(ramp(t, T.card, T.card + 0.25));
  person({ col: "gold", x: X.zahlt, y: 512, r: 30, face: zf, bodyH: 100, look: t > T.climax && t < T.card ? 1 : 0,
    arm: cardK > 0 ? [{ side: 1, ang: -2.6, len: 54 }] : null });
  goldChain(X.zahlt, 512, 30);
  // Rechnet auf den Cent
  const cf = stateAt([[0, "neutral"], [T.wasser - 0.05, "smug"], [T.rechnet, "talk"], [T.rechnet + 0.7, "neutral"], [4.2, "worried"], [5.0, "neutral"], [T.climax, "wide"], [T.calc - 0.05, "talk"], [T.calc + 0.9, "neutral"], [T.sticker, "smile"]], t);
  person({ col: "sky", x: X.cent, y: 512, r: 30, face: cf, bodyH: 100, look: t > 2.9 && t < 5.5 ? -1 : t > T.climax && t < T.calc ? -1 : 0 });
  glasses(X.cent, 512, 30);
  // ??? sitzend / aufstehend
  if (!running && wer.alpha > 0) { person(wer); cap(wer.x, wer.y, 30, 1); }
  return { cardK };
}

// ------------------------------------------------------------ Zähler, Titel, Sticker
function counter(t) {
  const v = totalAt(t);
  const red = t >= T.climax;
  const last = ORDERS.filter(o => t >= o[0]).pop();
  const lt = red ? T.climax : last ? last[0] : -9;
  const popK = 1 + (1 - easeOut(ramp(t, lt, lt + 0.2))) * (red ? 0.45 : 0.12);
  const fade = 1 - ramp(t, T.title1 - 0.2, T.title1 + 0.1);
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha = fade;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = "700 13px InterX"; ctx.letterSpacing = "3px"; ctx.fillStyle = "rgba(240,240,245,0.65)";
  if (!((t > 0.05 && t < 2.15) || (t > 5.45 && t < 7.75))) ctx.fillText("RECHNUNG", 288, 168);   // Platz für Hook/Rehook
  ctx.translate(288, 222); ctx.scale(popK, popK);
  ctx.font = "900 50px InterX"; ctx.letterSpacing = "-1px";
  ctx.shadowColor = red ? "rgba(255,60,60,0.7)" : "rgba(0,0,0,0.5)"; ctx.shadowBlur = red ? 18 : 8;
  ctx.fillStyle = red ? "#ff4b4b" : "#f5f1e8";
  ctx.fillText(fmt(red ? TOTAL : v), 0, 0);
  ctx.restore();
}
function titles(t) {
  const a1 = back(ramp(t, T.title1, T.title1 + 0.3)), a2 = back(ramp(t, T.title2, T.title2 + 0.3));
  const fade = 1 - ramp(t, T.loop - 0.3, T.loop);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 37px InterX"; ctx.letterSpacing = "-1.2px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  if (a1 > 0) { ctx.globalAlpha = clamp(a1) * fade; ctx.save(); ctx.translate(288, 197); ctx.scale(a1, a1); ctx.fillStyle = "#f5f1e8"; ctx.fillText("GLEICHE RECHNUNG.", 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.globalAlpha = clamp(a2) * fade; ctx.save(); ctx.translate(288, 241); ctx.scale(a2, a2);
    const w1 = ctx.measureText("ANDERE ").width, w2 = ctx.measureText("STRATEGIE.").width, x0 = -(w1 + w2) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#f5f1e8"; ctx.fillText("ANDERE ", x0, 0);
    ctx.fillStyle = "#f6b23a"; ctx.fillText("STRATEGIE.", x0 + w1, 0);
    ctx.restore();
  }
  ctx.restore();
}
function sticker(t, text) {
  const s = popIn(t, T.sticker, T.stickerEnd, 0.3);
  if (s <= 0) return;
  ctx.save(); ctx.translate(288, 708); ctx.rotate(-0.08); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  circle(0, 0, 52, "#f6b23a");
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#fff4d6"; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 14px InterX"; ctx.letterSpacing = "0.5px";
  ctx.fillText(text[0], 0, -8); ctx.fillText(text[1], 0, 10);
  ctx.restore();
}
let GRAIN = [];
function grain(t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.045;
  ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}

// ------------------------------------------------------------ Hook + Rehook (nach kurzvideo-regeln)
// Zeile erscheint Wort für Wort (0,28 s/Wort), Schlüsselwort in oranger Box, übrige Wörter etwas grauer.
function hookLine(t, words, key, t0, t1, y) {
  const out = ramp(t, t1 - 0.2, t1);
  if (t < t0 || out >= 1) return false;
  ctx.save(); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.font = "900 25px InterX"; ctx.letterSpacing = "0.5px";
  const sp = ctx.measureText(" ").width;
  const ws = words.map(w => ctx.measureText(w).width);
  let x = 288 - (ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2;
  words.forEach((w, i) => {
    const p = ramp(t, t0 + i * 0.28, t0 + i * 0.28 + 0.18);
    if (p > 0) {
      ctx.globalAlpha = easeOut(p) * (1 - out);
      const dy = (1 - easeOut(p)) * 8;
      if (i === key) {
        const s = back(p);
        ctx.save(); ctx.translate(x + ws[i] / 2, y - 9 + dy); ctx.scale(s, s);
        ctx.fillStyle = "#f6b23a"; rr(-ws[i] / 2 - 7, -18, ws[i] + 14, 32, 7); ctx.fill();
        ctx.fillStyle = "#1d1d22"; ctx.fillText(w, -ws[i] / 2, 9);
        ctx.restore();
      } else {
        ctx.fillStyle = "#d9dae2"; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 6;
        ctx.fillText(w, x, y + dy);
        ctx.shadowBlur = 0;
      }
    }
    x += ws[i] + sp;
  });
  ctx.restore();
  return true;
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#120a0b"; ctx.fillRect(0, 0, 1080, 1920);
  const z = 1 + 0.07 * easeIO(ramp(tt, T.climax, T.climax + 0.3)) * (1 - easeIO(ramp(tt, T.title1 + 0.6, T.title1 + 1.3)));
  const sh = tt > T.climax && tt < T.climax + 0.4 ? Math.sin(tt * 95) * 3 * (1 - ramp(tt, T.climax, T.climax + 0.4)) : 0;
  ctx.setTransform(S * z, 0, 0, S * z, S * (288 - 288 * z + sh), S * (560 - 560 * z));
  drawRoom(tt);
  const P = people(tt);
  drawTable();
  drawDishes(tt);
  billFolder(tt);
  // Hände mit Karte / Taschenrechner vor dem Tisch
  if (P.cardK > 0) card(X.zahlt + 50, 478, P.cardK);
  calculator(X.cent - 34, TY - 14, back(ramp(tt, T.rechnet - 0.1, T.rechnet + 0.15)) * (1 - easeIO(ramp(tt, T.rechnet + 1.0, T.rechnet + 1.2))) || back(ramp(tt, T.calc - 0.1, T.calc + 0.15)));
  priceTags(tt);

  // Schilder
  label("ZAHLT ALLES", X.zahlt, 452);
  label("ZÄHLT JEDEN CENT", X.cent, 452);
  if (tt < T.climax + 0.15) label("???", X.wer, 446);
  else {
    const f = ramp(tt, T.climax + 0.15, T.climax + 0.4);
    ctx.save(); ctx.translate(X.wer, 446); ctx.scale(1, Math.abs(Math.cos(f * Math.PI))); ctx.translate(-X.wer, -446);
    label(f < 0.5 ? "???" : "IST AUFS KLO", X.wer, 446);
    ctx.restore();
  }

  // Blasen
  bubble("ich lad euch ein!", 120, 404, popIn(tt, T.lade, T.lade + 0.75), "speech", [-10, -6]);
  bubble("noch einen!", 288, 404, popIn(tt, T.eins, T.eins + 0.65), "speech", [0, 4]);
  bubble("Leitungswasser, bitte.", 440, 404, popIn(tt, T.wasser - 0.4, T.wasser + 0.25), "speech", [20, 6]);
  bubble("6,80 + 0,00 …", 456, 404, popIn(tt, T.rechnet + 0.3, T.rechnet + 1.2), "thought");
  bubble("bin gleich zurück!", 250, 404, popIn(tt, T.klo, T.gone + 0.1, 0.15), "speech", [-20, 6]);
  bubble("passt schon …", 120, 404, popIn(tt, T.card + 0.1, T.calc - 0.05), "speech", [-10, -6]);
  bubble("ER HATTE 5 COCKTAILS!", 410, 404, popIn(tt, T.calc, T.title2 + 1.4, 0.15), "robot", [20, 6]);
  puff(456, 404, tt, T.rechnet + 1.25);
  puff(70, 520, tt, T.gone - 0.05);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  counter(tt);
  hookLine(t, ["JEDER", "HAT", "DIESEN", "EINEN", "FREUND."], 3, 0.1, 2.1, 163);
  hookLine(t, ["WARTE,", "BIS", "DIE", "RECHNUNG", "KOMMT", "…"], 3, 5.5, 7.7, 163);
  titles(t);
  sticker(t, ["WER", "BIST DU?"]);
  grain(t);
};

window.exportEvents = function () {
  return {
    duration: DUR, hookWords: [0, 1, 2, 3, 4].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4].map(i => (DUR > 0 ? (5.5) : 0) + i * 0.28)), orders: ORDERS.map(o => ({ t: o[0], who: o[1], kind: o[2], free: o[3] === 0 })),
    bill: T.bill, climax: T.climax, klo: T.klo, run: [T.run, T.gone], card: T.card, calc: T.calc, rechnet: T.rechnet,
    pops: [T.lade, T.eins, T.wasser - 0.4, T.rechnet + 0.3, T.klo, T.card + 0.1], puffs: [T.rechnet + 1.25, T.gone - 0.05],
    title: [T.title1, T.title2], sticker: T.sticker, loop: T.loop, total: TOTAL,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return { duration: DUR };
};
