// "Gleiche Küche. Andere Ausrede." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher.
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
COL.mint = ["#8fe0bf", "#6fcca8"];
COL.peach = ["#ffb98a", "#f59f6c"];
COL.lilac = ["#c7a8ff", "#ad8cf2"];

// ------------------------------------------------------------ Zeitplan
const DAYS = [[0, 1], [0.9, 2], [1.6, 3], [2.2, 4], [2.7, 5], [3.15, 6], [3.55, 7], [3.9, 8], [4.25, 9], [4.6, 10], [4.95, 11], [5.4, 12], [7.0, 13], [9.0, 14]];
const T = { morgen: 0.95, weich1: 1.7, wash1: 3.15, heute: 3.2, weich2: 4.3, wash2: 4.95, look: 6.0, whistle: 7.3,
  climax: 9.0, title1: 9.6, title2: 10.1, sticker: 11.6, stickerEnd: 12.55, loop: 12.95, end: DUR };
const X = { sofort: 108, wer: 288, morgen: 468 };
const CT = 600;                                     // Arbeitsplatte (Oberkante)

function dayAt(t) { let d = 1; for (const [a, v] of DAYS) if (t >= a) d = v; return d; }
function dayStart(t) { let s = 0; for (const [a] of DAYS) if (t >= a) s = a; return s; }

// ------------------------------------------------------------ Küche
function sky(t) {
  // jede Tag-Grenze: kurz Nacht, dann wieder Tag
  let night = 0;
  for (let i = 1; i < DAYS.length; i++) { const a = DAYS[i][0]; night = Math.max(night, 1 - Math.abs(t - (a - 0.08)) / 0.22); }
  return clamp(night);
}
function drawKitchen(t) {
  // Wand
  let g = ctx.createLinearGradient(0, 280, 0, CT);
  g.addColorStop(0, "#2b3347"); g.addColorStop(1, "#343e56");
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, CT - 280);
  // Fliesenspiegel
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(0, 488, W, CT - 488);
  ctx.strokeStyle = "rgba(120,110,95,0.25)"; ctx.lineWidth = 1;
  for (let y = 488; y < CT; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 488); ctx.lineTo(x, CT); ctx.stroke(); }
  // Oberschränke
  for (const [x, w] of [[0, 196], [380, 196]]) {
    ctx.fillStyle = "#c98f5a"; ctx.fillRect(x, 292, w, 92);
    ctx.fillStyle = "#b47c4a"; ctx.fillRect(x, 380, w, 6);
    ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 1.5;
    for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + (w * k) / 3, 296); ctx.lineTo(x + (w * k) / 3, 378); ctx.stroke(); }
    for (let k = 0; k < 3; k++) circle(x + (w * k) / 3 + (k % 2 ? 10 : w / 3 - 10), 360, 2.4, "#6b4a2c");
  }
  // Fenster über der Spüle (Tag/Nacht wechselt mit jedem Tag)
  const n = sky(t);
  const wx = 214, wy = 300, ww = 148, wh = 150;
  ctx.fillStyle = "#f2efe6"; ctx.fillRect(wx - 5, wy - 5, ww + 10, wh + 10);
  g = ctx.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, `rgb(${lerp(110, 18, n)},${lerp(185, 26, n)},${lerp(240, 60, n)})`);
  g.addColorStop(1, `rgb(${lerp(200, 40, n)},${lerp(230, 50, n)},${lerp(250, 90, n)})`);
  ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  if (n < 0.5) { circle(wx + 108, wy + 40, 16, "#ffe27a"); glow(wx + 108, wy + 40, 40, "255,230,120", 0.4); }
  else { circle(wx + 40, wy + 38, 13, "#f3f0d6"); circle(wx + 46, wy + 34, 11, `rgb(${lerp(110, 18, n)},${lerp(185, 26, n)},${lerp(240, 60, n)})`); }
  ctx.fillStyle = "#5a9d55"; ctx.fillRect(wx, wy + wh - 26, ww, 26);
  ctx.fillStyle = "#f2efe6"; ctx.fillRect(wx + ww / 2 - 2.5, wy, 5, wh); ctx.fillRect(wx, wy + wh / 2 - 2.5, ww, 5);
  // Abtropfgitter links mit sauberen Tellern
  ctx.strokeStyle = "#9aa6b8"; ctx.lineWidth = 2;
  ctx.strokeRect(20, CT - 40, 62, 40);
  for (let k = 0; k < 5; k++) { ctx.fillStyle = "#f6f6f2"; rr(26 + k * 11, CT - 52, 6, 50, 3); ctx.fill(); }
  // Wanduhr rechts
  circle(520, 412, 18, "#2a3348"); circle(520, 412, 16, "#f6f4ef");
  ctx.strokeStyle = "#222"; ctx.lineWidth = 2; ctx.lineCap = "round";
  const a = t * 4.2;
  ctx.beginPath(); ctx.moveTo(520, 412); ctx.lineTo(520 + Math.sin(a) * 12, 412 - Math.cos(a) * 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(520, 412); ctx.lineTo(520 + Math.sin(a / 12) * 8, 412 - Math.cos(a / 12) * 8); ctx.stroke();
}
function drawCounter() {
  ctx.fillStyle = "#6a7488"; ctx.fillRect(0, CT, W, 14);                // Arbeitsplatte
  ctx.fillStyle = "#56607a"; ctx.fillRect(0, CT + 14, W, 4);
  ctx.fillStyle = "#c98f5a"; ctx.fillRect(0, CT + 18, W, 150);            // Unterschränke
  ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 2;
  for (const x of [96, 192, 288, 384, 480]) { ctx.beginPath(); ctx.moveTo(x, CT + 22); ctx.lineTo(x, CT + 164); ctx.stroke(); }
  for (const x of [80, 112, 176, 208, 272, 304, 368, 400, 464, 496]) { ctx.fillStyle = "#6b4a2c"; rr(x - 2, CT + 40, 4, 20, 2); ctx.fill(); }
  // Spülbecken
  ctx.fillStyle = "#3b4357"; rr(222, CT + 1, 132, 10, 3); ctx.fill();
  // Wasserhahn
  ctx.strokeStyle = "#b8c2d4"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(332, CT); ctx.lineTo(332, CT - 40); ctx.quadraticCurveTo(332, CT - 52, 318, CT - 52); ctx.lineTo(308, CT - 46); ctx.stroke();
  // Boden
  ctx.fillStyle = "#1a1d27"; ctx.fillRect(0, CT + 168, W, H - CT - 168);
  const g = ctx.createLinearGradient(0, CT + 168, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0.35)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, CT + 168, W, H - CT - 168);
}

// ------------------------------------------------------------ Geschirr
function plate(x, y, s = 1, dirty = 1) {
  ctx.fillStyle = "#f7f6f1"; ctx.beginPath(); ctx.ellipse(x, y, 26 * s, 6.5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e3e1d9"; ctx.beginPath(); ctx.ellipse(x, y - 1, 16 * s, 3.5 * s, 0, 0, Math.PI * 2); ctx.fill();
  if (dirty > 0) {
    ctx.globalAlpha *= dirty;
    circle(x - 6 * s, y - 1.5, 3.4 * s, "#c9772f"); circle(x + 7 * s, y - 0.5, 2.6 * s, "#8a5a2a"); circle(x + 2 * s, y - 2.5, 2 * s, "#5f8a3a");
    ctx.globalAlpha = 1;
  }
}
function cup(x, y) {
  ctx.fillStyle = "#e8665a"; rr(x - 9, y - 20, 18, 20, 3); ctx.fill();
  ctx.strokeStyle = "#e8665a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 10, y - 10, 5, -1.3, 1.3); ctx.stroke();
}
function pot(x, y, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#8d97ab"; rr(-28, -30, 56, 30, [3, 3, 8, 8]); ctx.fill();
  ctx.fillStyle = "#a9b2c4"; ctx.fillRect(-30, -32, 60, 5);
  ctx.fillStyle = "#59627a"; ctx.fillRect(-40, -26, 12, 5); ctx.fillRect(28, -26, 12, 5);
  ctx.restore();
}
function pan(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#3b3f4a"; ctx.beginPath(); ctx.ellipse(0, 0, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a2d35"; rr(24, -3, 34, 6, 3); ctx.fill();
  ctx.restore();
}
// Spülen-Berg: Liste fester Teile, je nach Tag sichtbar
const PILE = [
  ["pot", 288, 600, 0], ["plate", 262, 592, 0], ["plate", 318, 590, 0], ["cup", 244, 590, 0], ["pan", 300, 578, -0.25],
  ["plate", 276, 572, 0], ["cup", 330, 576, 0], ["pot", 284, 566, 0.12], ["plate", 300, 548, 0], ["plate", 268, 544, 0],
  ["cup", 312, 540, 0], ["pan", 276, 528, 0.3], ["plate", 292, 518, 0], ["cup", 262, 514, 0], ["pot", 300, 508, -0.15], ["plate", 286, 486, 0],
];
const PILE_MAX = 10;   // Gesicht von ??? bleibt frei
function pileCount(t) { const d = dayAt(t); return Math.min(PILE_MAX, Math.round(1 + (d - 1) * 0.9)); }
function drawPile(t) {
  const n = pileCount(t);
  for (let i = 0; i < n; i++) {
    const [k, x, y, r] = PILE[i];
    const firstDay = DAYS.find(([, d]) => Math.min(PILE_MAX, Math.round(1 + (d - 1) * 0.9)) > i);
    const t0 = firstDay ? firstDay[0] : 0;
    const drop = (1 - easeOut(ramp(t, t0, t0 + 0.18))) * -30;
    if (k === "plate") plate(x, y + drop, 1, 1);
    else if (k === "cup") cup(x, y + drop);
    else if (k === "pot") pot(x, y + drop, r);
    else pan(x, y + drop, r);
  }
  // Wasser-Bläschen im Becken (weicht ein)
  ctx.fillStyle = "rgba(200,230,255,0.85)";
  for (let i = 0; i < 4; i++) { const p = (t * 0.9 + i * 0.27) % 1; circle(240 + i * 30, CT - 6 - p * 26, 2.2 + i % 2, "rgba(200,230,255,0.8)"); }
  // Gestank ab Tag 7
  const stink = ramp(t, DAYS[6][0], DAYS[6][0] + 0.4);
  if (stink > 0) {
    ctx.strokeStyle = `rgba(120,200,90,${0.75 * stink})`; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const x0 = [236, 340, 352][i], ph = t * 3 + i;
      ctx.beginPath();
      for (let k = 0; k <= 10; k++) { const yy = 520 - k * 6 - (i % 2) * 10; const xx = x0 + Math.sin(ph + k * 0.7) * 6; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
  }
  // Fliegen ab Tag 9
  const fl = ramp(t, DAYS[8][0], DAYS[8][0] + 0.3);
  if (fl > 0) {
    for (let i = 0; i < 4; i++) {
      const a = t * (3 + i * 0.7) + i * 1.6;
      const fx = 288 + Math.cos(a) * (40 + i * 8), fy = 500 + Math.sin(a * 1.3) * 18 - i * 6;
      ctx.globalAlpha = fl;
      circle(fx, fy, 2.6, "#1c1c22");
      ctx.fillStyle = "rgba(230,240,255,0.8)";
      ctx.beginPath(); ctx.ellipse(fx - 2, fy - 3, 2.6, 1.4, -0.6 + Math.sin(t * 60) * 0.3, 0, Math.PI * 2); ctx.ellipse(fx + 2, fy - 3, 2.6, 1.4, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // Pilz am Höhepunkt
  const m = back(ramp(t, T.climax + 0.1, T.climax + 0.45));
  if (m > 0) {
    ctx.save(); ctx.translate(312, 506); ctx.scale(m, m);
    ctx.fillStyle = "#f4ecd8"; rr(-3, -12, 6, 12, 2); ctx.fill();
    ctx.fillStyle = "#d9443c"; ctx.beginPath(); ctx.arc(0, -12, 10, Math.PI, 0); ctx.fill();
    circle(-4, -16, 1.8, "#fff"); circle(4, -14, 1.5, "#fff");
    ctx.restore();
  }
}

// Morgen-Stapel: wächst, an zwei Tagen wird alles auf einmal gespült
function morgenCount(t) {
  const d = dayAt(t);
  if (t >= T.wash2 + 0.35) return d - 11;
  if (t >= T.wash1 + 0.35) return Math.min(d, 11) - 6;
  return d - 1;
}
function drawMorgenStack(t) {
  let n = morgenCount(t);
  const washing = (t > T.wash1 && t < T.wash1 + 0.35) || (t > T.wash2 && t < T.wash2 + 0.35);
  if (washing) {
    const w0 = t < T.wash2 ? T.wash1 : T.wash2;
    const before = t < T.wash2 ? 5 : 5;
    n = Math.round(before * (1 - ramp(t, w0, w0 + 0.32)));
    // Spritzer
    ctx.fillStyle = "rgba(170,215,255,0.9)";
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + t * 8; circle(X.morgen + 10 + Math.cos(a) * 30, CT - 30 + Math.sin(a) * 14, 2.6, "rgba(170,215,255,0.9)"); }
  }
  for (let i = 0; i < Math.max(0, n); i++) plate(X.morgen + 14 + (i % 2) * 3, CT - 4 - i * 7, 0.92, 1);
}

// Sofort: Teller kommt, wird direkt gespült
function drawSofort(t) {
  const s = dayStart(t);
  const k = ramp(t, s + 0.05, s + 0.35);
  if (t > 0.3 && k < 1) {
    ctx.globalAlpha = 1 - easeIO(ramp(t, s + 0.25, s + 0.35));
    plate(X.sofort + 12, CT - 4, 0.92, 1 - k);
    ctx.globalAlpha = 1;
  }
  // Glitzer nach dem Spülen
  const sp = ramp(t, s + 0.3, s + 0.6);
  if (t > 0.5 && sp > 0 && sp < 1) {
    ctx.globalAlpha = Math.sin(Math.PI * sp); ctx.fillStyle = "#fff6b0";
    for (const [dx, dy] of [[-14, -26], [16, -34], [2, -44]]) star(X.sofort + 12 + dx, CT + dy, 5);
    ctx.globalAlpha = 1;
  }
}
function star(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr2 = i % 2 ? r * 0.35 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  ctx.fill();
}

// ------------------------------------------------------------ Figuren mit Merkmalen
function gloves(x, y, r) {        // gelbe Gummihandschuhe vor der Platte
  for (const s of [-1, 1]) { ctx.fillStyle = "#f6d23a"; rr(x + s * r * 0.75 - 7, y + r * 2.75, 14, 16, 6); ctx.fill(); }
}
function headphones(x, y, r) {
  ctx.strokeStyle = "#2d2f3a"; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(x, y, r + 3, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  for (const s of [-1, 1]) { ctx.fillStyle = "#2d2f3a"; rr(x + s * (r + 1) - 6, y - 8, 12, 18, 5); ctx.fill(); ctx.fillStyle = "#ff7a59"; rr(x + s * (r + 1) - 3, y - 4, 6, 10, 3); ctx.fill(); }
}
function beanie(x, y, r) {
  ctx.fillStyle = "#3b3f7a";
  ctx.beginPath(); ctx.arc(x, y - r * 0.25, r * 1.02, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#2c2f60"; rr(x - r * 1.05, y - r * 0.38, r * 2.1, 9, 4); ctx.fill();
  circle(x, y - r * 1.22, 6, "#f0a64b");
}
function shadowUnder(x, y, w) {
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(x, y, w, 6, 0, 0, Math.PI * 2); ctx.fill();
}

function people(t) {
  const climax = t >= T.climax;
  const look = t > T.look && t < T.climax + 1.2;
  // Sofort
  const sf = stateAt([[0, "happy"], [0.5, "smile"], [T.morgen, "neutral"], [1.4, "smile"], [T.weich1, "worried"], [2.4, "happy"], [T.look, "neutral"], [T.whistle, "wide"], [T.climax, "shock"], [T.title1, "neutral"], [T.sticker, "smile"]], t);
  const scrub = Math.sin(t * 22) * 0.25 * (ramp(t, dayStart(t) + 0.05, dayStart(t) + 0.1) * (1 - ramp(t, dayStart(t) + 0.32, dayStart(t) + 0.36)));
  person({ col: "mint", x: X.sofort, y: 512, r: 30, face: sf, bodyH: 100, look: look ? 1 : 0, arm: [{ side: 1, ang: -0.35 + scrub, len: 50 }] });
  // ??? in der Mitte
  const wf = stateAt([[0, "smug"], [T.weich1 - 0.1, "talk"], [T.weich1 + 0.6, "smug"], [T.weich2 - 0.1, "talk"], [T.weich2 + 0.6, "smug"], [T.whistle, "whistle"], [T.climax, "wide"], [T.climax + 0.7, "smug"], [T.sticker, "smile"]], t);
  person({ col: "lilac", x: X.wer, y: 506, r: 30, face: wf === "whistle" ? "talk" : wf, bodyH: 100, lean: t > T.whistle && t < T.climax ? Math.sin(t * 4) * 0.05 : 0 });
  beanie(X.wer, 506, 30);
  // Morgen
  const mf = stateAt([[0, "smile"], [T.morgen - 0.1, "talk"], [T.morgen + 0.5, "smug"], [T.wash1 - 0.05, "worried"], [T.wash1 + 0.4, "talk"], [T.wash1 + 0.9, "smug"], [T.wash2 - 0.05, "worried"], [T.wash2 + 0.4, "smug"], [T.look, "neutral"], [T.whistle, "wide"], [T.climax, "shock"], [T.title1, "smug"], [T.sticker, "happy"]], t);
  const wobble = (t > T.wash1 && t < T.wash1 + 0.35) || (t > T.wash2 && t < T.wash2 + 0.35) ? Math.sin(t * 40) * 0.06 : 0;
  person({ col: "peach", x: X.morgen, y: 512, r: 30, face: mf, bodyH: 100, look: look ? -1 : 0, lean: wobble });
  headphones(X.morgen, 512, 30);
}

// Pfeif-Noten
function note(x, y, s) {
  ctx.fillStyle = "#f6f2e6"; circle(x, y, 4.2 * s, "#f6f2e6");
  ctx.fillRect(x + 3.2 * s, y - 16 * s, 1.8 * s, 16 * s);
  ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 16 * s); ctx.quadraticCurveTo(x + 13 * s, y - 12 * s, x + 10 * s, y - 6 * s); ctx.lineWidth = 2; ctx.strokeStyle = "#f6f2e6"; ctx.stroke();
}
function whistleNotes(t) {
  if (t < T.whistle || t > T.climax - 0.1) return;
  for (let i = 0; i < 3; i++) {
    const p = ((t - T.whistle) * 0.8 + i / 3) % 1;
    ctx.globalAlpha = Math.sin(Math.PI * p);
    note(X.wer + 24 + p * 26 + i * 4, 498 - p * 46, 1);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Zähler, Titel, Sticker
function counter(t) {
  const d = dayAt(t);
  const last = DAYS.filter(([a]) => t >= a).pop()[0];
  const popK = 1 + (1 - easeOut(ramp(t, last, last + 0.18))) * (d === 14 ? 0.45 : 0.18);
  const red = d === 14;
  const fade = 1 - ramp(t, T.title1 - 0.2, T.title1 + 0.1);
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha = fade;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = "700 13px InterX"; ctx.letterSpacing = "3px"; ctx.fillStyle = "rgba(240,240,245,0.65)";
  ctx.fillText("WG-KÜCHE", 288, 168);
  ctx.translate(288, 222); ctx.scale(popK, popK);
  ctx.font = "900 50px InterX"; ctx.letterSpacing = "-1px";
  ctx.shadowColor = red ? "rgba(255,60,60,0.7)" : "rgba(0,0,0,0.5)"; ctx.shadowBlur = red ? 18 : 8;
  ctx.fillStyle = red ? "#ff4b4b" : "#f5f1e8";
  ctx.fillText(`TAG ${d}`, 0, 0);
  ctx.restore();
}
function titles(t) {
  const a1 = back(ramp(t, T.title1, T.title1 + 0.3)), a2 = back(ramp(t, T.title2, T.title2 + 0.3));
  const fade = 1 - ramp(t, T.loop - 0.3, T.loop);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 37px InterX"; ctx.letterSpacing = "-1.2px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  if (a1 > 0) { ctx.globalAlpha = clamp(a1) * fade; ctx.save(); ctx.translate(288, 197); ctx.scale(a1, a1); ctx.fillStyle = "#f5f1e8"; ctx.fillText("GLEICHE KÜCHE.", 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.globalAlpha = clamp(a2) * fade; ctx.save(); ctx.translate(288, 241); ctx.scale(a2, a2);
    const w1 = ctx.measureText("ANDERE ").width, w2 = ctx.measureText("AUSREDE.").width, x0 = -(w1 + w2) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#f5f1e8"; ctx.fillText("ANDERE ", x0, 0);
    ctx.fillStyle = "#f6b23a"; ctx.fillText("AUSREDE.", x0 + w1, 0);
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
  const [l1, l2] = text;
  ctx.fillText(l1, 0, -8); ctx.fillText(l2, 0, 10);
  ctx.restore();
}

// Papier-Körnung
let GRAIN = [];
function grain(t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.045;
  ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0d0f15"; ctx.fillRect(0, 0, 1080, 1920);
  // Kamera: am Höhepunkt leicht ran + Ruckeln
  const z = 1 + 0.07 * easeIO(ramp(tt, T.climax, T.climax + 0.3)) * (1 - easeIO(ramp(tt, T.title1 + 0.6, T.title1 + 1.3)));
  const sh = tt > T.climax && tt < T.climax + 0.4 ? Math.sin(tt * 95) * 3 * (1 - ramp(tt, T.climax, T.climax + 0.4)) : 0;
  ctx.setTransform(S * z, 0, 0, S * z, S * (288 - 288 * z + sh), S * (560 - 560 * z));
  drawKitchen(tt);
  people(tt);
  drawCounter();
  shadowUnder(X.wer, CT + 2, 70);
  drawPile(tt);
  drawMorgenStack(tt);
  drawSofort(tt);
  gloves(X.sofort, 512, 30);
  whistleNotes(tt);

  // Schilder
  label("SPÜLT SOFORT", X.sofort, 452);
  label("SPÜLT MORGEN", X.morgen, 452);
  if (tt < T.climax) label("???", X.wer, 446);
  else {
    const f = ramp(tt, T.climax, T.climax + 0.25);
    ctx.save(); ctx.translate(X.wer, 446); ctx.scale(1, Math.abs(Math.cos(f * Math.PI))); ctx.translate(-X.wer, -446);
    label(f < 0.5 ? "???" : "WEICHT NUR EIN", X.wer, 446);
    ctx.restore();
  }

  // Blasen
  bubble("mach ich morgen!", 452, 404, popIn(tt, T.morgen, T.morgen + 0.55), "speech", [20, 6]);
  bubble("muss noch einweichen.", 288, 404, popIn(tt, T.weich1, T.weich1 + 1.0), "speech", [0, 4]);
  bubble("okay … heute.", 452, 404, popIn(tt, T.heute, T.heute + 0.7), "speech", [20, 6]);
  bubble("weicht noch!", 288, 404, popIn(tt, T.weich2, T.weich2 + 0.9), "speech", [0, 4]);
  bubble("…", 120, 404, popIn(tt, T.look + 0.2, T.whistle + 0.6), "thought");
  bubble("…", 456, 404, popIn(tt, T.look + 0.5, T.whistle + 0.8), "thought");
  bubble("EINWEICHEN, HAB ICH GESAGT!", 300, 404, popIn(tt, T.climax + 0.45, T.title1 + 0.5, 0.15), "robot", [0, 6]);
  puff(120, 404, tt, T.whistle + 0.65); puff(456, 404, tt, T.whistle + 0.85);
  puff(288, 404, tt, T.weich1 + 1.05); puff(288, 404, tt, T.weich2 + 0.95);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  counter(tt);
  titles(t);
  sticker(t, ["WELCHER", "BIST DU?"]);
  grain(t);
};

window.exportEvents = function () {
  return {
    duration: DUR, days: DAYS.map(d => d[0]).slice(1), climax: T.climax, title: [T.title1, T.title2],
    pops: [T.morgen, T.weich1, T.heute, T.weich2, T.look + 0.2, T.look + 0.5],
    puffs: [T.weich1 + 1.05, T.weich2 + 0.95, T.whistle + 0.65, T.whistle + 0.85],
    washes: [T.wash1, T.wash2], scrubs: DAYS.map(d => d[0] + 0.05).filter(x => x > 0.3), whistle: [T.whistle, T.climax],
    flies: DAYS[8][0], stink: DAYS[6][0], robot: T.climax + 0.45, sticker: T.sticker, loop: T.loop,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return { duration: DUR };
};
