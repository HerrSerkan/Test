// "Gleicher Tisch. Anderer Grund." – deutsche Version (1080x1920), ohne Sprecher.
// Gezeichnet im Raster des Originals (576 x 1024) und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 13.35;
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

// ------------------------------------------------------------ Zeitplan
const T = {
  dots: 0.45, hi: 0.6, hey: 1.25, sit: 1.9, shyUp: 2.2,
  gStand: 2.3, gArrive: 3.3, gAsk1: 3.45, iLook: 3.7, iNo: 4.4, gCool: 4.95, gBack: 5.2, gArrive2: 5.85, heart1: 5.5,
  gAsk2: 5.95, pop: 6.25, greet: 6.75, greetEnd: 7.7, laugh: 7.75, gSeat: 7.95, shyStand: 8.1, shyWalk: 8.3, shySeat: 9.3,
  title1: 9.2, title2: 9.75, heart2: 10.5, bell: 11.8, crowd: 12.1, end: DUR,
};

// ------------------------------------------------------------ Raum
const DRAW_CACHE = {};
function drawRoom(t) {
  // Decke
  let g = ctx.createLinearGradient(0, 0, 0, 295);
  g.addColorStop(0, "#0b0f16"); g.addColorStop(1, "#1a2433");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 296);
  for (const x of [62, 228, 393]) {
    glow(x + 61, 285, 70, "220,235,255", 0.12);
    ctx.fillStyle = "#eef3f8"; rr(x, 281, 121, 4.5, 2); ctx.fill();
  }
  // Wand
  ctx.fillStyle = "#26384f"; ctx.fillRect(0, 295, W, 185);
  ctx.fillStyle = "#304661"; ctx.fillRect(0, 295, W, 3);
  // Fenster
  for (const x0 of [27, 393]) drawWindow(x0, 320, 156, 150, t);
  // Glocke
  const ring = t >= T.bell && t < T.bell + 0.65;
  const sh = ring ? Math.sin(t * 90) * 1.2 : 0;
  circle(232 + sh, 337, 10, "#c9302c"); circle(232 + sh, 337, 6.5, "#e2453e"); circle(232 + sh, 337, 2.2, "#f5d0cc");
  if (ring) {
    ctx.strokeStyle = "#f4c744"; ctx.lineWidth = 1.6;
    for (const r of [15, 20, 25]) for (const s of [0, Math.PI]) { ctx.beginPath(); ctx.arc(232, 337, r, s - 0.6, s + 0.6); ctx.stroke(); }
    ctx.font = "900 13px InterX"; ctx.textAlign = "center"; ctx.fillStyle = "#f4c744"; ctx.fillText("RRRING!", 232, 316);
  }
  // Uhr
  circle(288, 381, 31, "#2a3a50"); circle(288, 381, 29, "#f6f4ef");
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.2;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(288 + Math.cos(a) * 24, 381 + Math.sin(a) * 24); ctx.lineTo(288 + Math.cos(a) * 27, 381 + Math.sin(a) * 27); ctx.stroke(); }
  const mA = -Math.PI / 2 + 0.05 + t * 0.03, hA = -Math.PI / 2 + 0.02;
  ctx.lineWidth = 2; ctx.strokeStyle = "#222"; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(288, 381); ctx.lineTo(288 + Math.cos(hA) * 15, 381 + Math.sin(hA) * 15); ctx.stroke();
  ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(288, 381); ctx.lineTo(288 + Math.cos(mA + 2.2) * 21, 381 + Math.sin(mA + 2.2) * 21); ctx.stroke();
  circle(288, 381, 2, "#c33");
  // Pinnwand
  ctx.fillStyle = "#9c6b3e"; ctx.fillRect(197, 405, 62, 46);
  ctx.fillStyle = "#c79a62"; ctx.fillRect(201, 409, 54, 38);
  ctx.fillStyle = "#f6f2e6"; ctx.fillRect(205, 412, 16, 13);
  ctx.fillStyle = "#f6c84a"; ctx.fillRect(226, 411, 17, 14);
  ctx.fillStyle = "#8fc0e6"; ctx.fillRect(207, 429, 19, 14);
  ctx.fillStyle = "#f0a0a8"; ctx.fillRect(231, 430, 17, 13);
  circle(213, 413, 1.5, "#d33"); circle(234, 412, 1.5, "#36c");
  // Schild „Heute Nudeln“
  ctx.fillStyle = "#f3ece0"; rr(318, 410, 62, 40, 2); ctx.fill();
  ctx.textAlign = "center"; ctx.fillStyle = "#333";
  ctx.font = "700 7.5px InterX"; ctx.letterSpacing = "0.8px"; ctx.fillText("HEUTE", 349, 423);
  ctx.font = "900 11px InterX"; ctx.letterSpacing = "0.3px"; ctx.fillStyle = "#d4483a"; ctx.fillText("NUDELN", 349, 440);
  ctx.letterSpacing = "0px";
  // Fliesen
  ctx.fillStyle = "#89ab9f"; ctx.fillRect(0, 478, W, 112);
  ctx.fillStyle = "#e9eee8"; ctx.fillRect(0, 474, W, 6);
  ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1;
  for (let y = 480, r = 0; y < 590; y += 13, r++) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    for (let x = (r % 2) * 16; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 13); ctx.stroke(); }
  }
  // Boden: Schachbrett in Perspektive
  ctx.fillStyle = "#14161d"; ctx.fillRect(0, 588, W, H - 588);
  const vx = 288, vy = 300, y0 = 588;
  const rows = [];
  for (let k = 0, y = y0; y < H + 60; k++) { rows.push(y); y += 14 + k * 5.5; }
  for (let i = 0; i < rows.length - 1; i++) {
    for (let c = -10; c < 10; c++) {
      const xA = x => vx + (x - vx) * ((rows[i] - vy) / (y0 - vy));
      const xB = x => vx + (x - vx) * ((rows[i + 1] - vy) / (y0 - vy));
      const xl = 30 + c * 46, xr = xl + 46;
      ctx.fillStyle = (i + c) % 2 ? "#2d3343" : "#3a4153";
      ctx.beginPath(); ctx.moveTo(xA(xl), rows[i]); ctx.lineTo(xA(xr), rows[i]); ctx.lineTo(xB(xr), rows[i + 1]); ctx.lineTo(xB(xl), rows[i + 1]); ctx.fill();
    }
  }
  // dunkle Seiten + Vignette unten
  g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(10,10,14,0.85)"); g.addColorStop(0.12, "rgba(10,10,14,0)"); g.addColorStop(0.88, "rgba(10,10,14,0)"); g.addColorStop(1, "rgba(10,10,14,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, 588, W, H - 588);
  g = ctx.createLinearGradient(0, 760, 0, H);
  g.addColorStop(0, "rgba(8,9,13,0)"); g.addColorStop(1, "rgba(8,9,13,0.75)");
  ctx.fillStyle = g; ctx.fillRect(0, 760, W, H - 760);
}

function drawWindow(x0, y0, w, h, t) {
  ctx.fillStyle = "#f2f2ef"; ctx.fillRect(x0 - 3, y0 - 3, w + 6, h + 6);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + 4, y0 + 4, w - 8, h - 8); ctx.clip();
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, "#4ea3e6"); g.addColorStop(1, "#bfe2f7");
  ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
  // Wolkenband
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 9; i++) { const cx = x0 + ((i * 22 + t * 4) % (w + 30)) - 10; ctx.beginPath(); ctx.arc(cx, y0 + 26 + (i % 2) * 4, 11 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill(); }
  // Wiese + Zaun
  ctx.fillStyle = "#6dbb5a"; ctx.fillRect(x0, y0 + h - 34, w, 34);
  ctx.strokeStyle = "#f4f4f0"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, y0 + h - 30); ctx.lineTo(x0 + w, y0 + h - 30); ctx.moveTo(x0, y0 + h - 22); ctx.lineTo(x0 + w, y0 + h - 22); ctx.stroke();
  for (let x = x0 + 3; x < x0 + w; x += 6) { ctx.beginPath(); ctx.moveTo(x, y0 + h - 36); ctx.lineTo(x, y0 + h - 18); ctx.stroke(); }
  // Baum
  const tx = x0 < 200 ? x0 + 50 : x0 + 108;
  ctx.fillStyle = "#7a5432"; ctx.fillRect(tx - 3, y0 + h - 60, 6, 44);
  circle(tx, y0 + h - 78, 24, "#4f9a4a"); circle(tx - 14, y0 + h - 66, 15, "#5aa652"); circle(tx + 14, y0 + h - 68, 16, "#468f42");
  ctx.restore();
  // Sprossen
  ctx.fillStyle = "#f2f2ef";
  ctx.fillRect(x0 + w / 2 - 2.5, y0, 5, h); ctx.fillRect(x0, y0 + h / 2 - 2.5, w, 5);
  ctx.fillStyle = "#e4e4df"; ctx.fillRect(x0 - 6, y0 + h, w + 12, 6);
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
function haText(t) {
  const L = [[7.85, 250, 448], [8.0, 290, 455], [8.15, 270, 440], [9.6, 262, 448], [9.8, 300, 455], [10.4, 280, 445], [10.8, 255, 452], [11.0, 300, 447], [11.3, 268, 450]];
  ctx.font = "900 12.5px InterX"; ctx.textAlign = "center"; ctx.fillStyle = "#f2f2f2";
  for (const [t0, x, y] of L) {
    const k = ramp(t, t0, t0 + 0.8); if (k <= 0 || k >= 1) continue;
    ctx.globalAlpha = Math.sin(k * Math.PI); ctx.fillText("ha", x, y - k * 14);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Ablauf der Figuren
// Grün: [t, x, y(Kopf), r]
const GREEN = [[0, 375, 512, 23], [T.gStand, 375, 512, 23], [T.gStand + 0.2, 372, 500, 23.5], [T.gArrive, 228, 548, 27],
  [T.gBack, 228, 548, 27], [T.gArrive2, 388, 548, 27], [T.gSeat, 388, 548, 27], [T.gSeat + 0.6, 375, 512, 23]];
const SHY = [[0, 450, 594, 32], [T.shyStand, 450, 594, 32], [T.shyStand + 0.2, 452, 570, 32], [T.shySeat - 0.3, 432, 486, 25], [T.shySeat, 424, 512, 23]];

function greenState(t) {
  const [x, y, r] = keys(GREEN, t);
  const walking = (t > T.gStand + 0.15 && t < T.gArrive) || (t > T.gBack && t < T.gArrive2) || (t > T.gSeat && t < T.gSeat + 0.6);
  const bob = walking ? Math.abs(Math.sin(t * 14)) * 3 : 0;
  let face = "smile", arm = null, look = 0;
  const standing = t > T.gStand + 0.1 && t < T.gSeat + 0.55;
  if (t < T.gStand) face = stateAt([[0, "smile"], [0.8, "happy"], [1.6, "smile"], [1.95, "talk"], [2.1, "smile"]], t);
  if (t >= T.gAsk1 && t < T.iNo) { face = t < T.iLook ? "talk" : "smile"; arm = [{ side: 1, ang: -1.9, len: r * 2 }]; }
  if (t >= T.iNo && t < T.gCool) face = "smile";
  if (t >= T.gCool && t < T.gBack + 0.3) { face = "happyTalk"; const s = Math.sin((t - T.gCool) * 16); arm = [{ side: -1, ang: 2.6 + s * 0.3, len: r * 1.8 }]; }
  if (t >= T.gAsk2 && t < T.greet) { face = t < T.pop ? "talk" : "shock"; arm = [{ side: -1, ang: 1.6, len: r * 2 }]; look = 1; }
  if (t >= T.greet && t < T.laugh) face = t < T.greet + 0.5 ? "wide" : "smile";
  if (t >= T.laugh) face = t < 9.4 ? "laugh" : stateAt([[0, "smile"], [9.8, "happy"], [10.3, "smile"], [10.9, "happy"], [11.4, "smile"], [T.bell, "shock"]], t);
  return { col: "green", x, y: y - bob, r, face, arm, look, bodyH: standing && y >= 520 ? r * 5.4 : r * 3, wide: standing && y >= 520 ? 2.35 : 1.85 };
}
function shyState(t) {
  let [x, y, r] = keys(SHY, t);
  // halbes Aufstehen und wieder hinsetzen
  y -= Math.sin(clamp((t - T.shyUp) / 0.45) * Math.PI) * 14;
  const walking = t > T.shyWalk && t < T.shySeat - 0.15;
  if (walking) y -= Math.abs(Math.sin(t * 13)) * 3;
  let face = "neutral", arm = null, blushA = 0, look = 0;
  face = stateAt([[0, "neutral"], [T.hi, "neutral"], [T.shyUp + 0.15, "worried"], [T.shyUp + 0.55, "neutral"], [T.gAsk1, "wide"], [T.iNo, "neutral"],
    [T.gAsk2, "wide"], [T.pop, "shock"], [T.greet, "wide"], [T.greet + 0.55, "worried"], [T.laugh, "laugh"], [T.shyWalk, "happy"], [T.shySeat, "laugh"],
    [9.9, "smile"], [10.4, "happy"], [11.0, "smile"], [T.bell, "shock"]], t);
  if (t >= T.greet && t < T.greetEnd) { const s = Math.sin((t - T.greet) * 14); arm = [{ side: 1, ang: -2.3 + s * 0.45, len: r * 1.9 }]; }
  if (t >= T.greet + 0.4 && t < T.shySeat) blushA = 1;
  if (t >= T.gAsk1 && t < T.iNo) look = -1;
  return { col: "white", x, y, r, face, arm, look, blush: blushA, bodyH: r * 3.2 };
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // Ende: Schleife – Szene springt hinter den Schatten auf den Anfang zurück
  const tt = t >= 12.85 ? 0.05 : t;
  drawRoom(tt);

  const shy = shyState(tt), green = greenState(tt);
  const shyBehind = tt >= T.shySeat - 0.25;
  // Gruppe hinten
  const gf = stateAt([[0, ["smile", "neutral"]], [0.3, ["talk", "happy"]], [0.7, ["smile", "smile"]], [1.2, ["happy", "talk"]], [1.7, ["smile", "neutral"]],
    [T.gAsk1, ["smile", "smile"]], [T.gAsk2, ["neutral", "neutral"]], [T.greet, ["shock", "wide"]], [T.laugh, ["laugh", "laugh"]],
    [9.4, ["talk", "smile"]], [9.8, ["laugh", "happy"]], [10.4, ["smile", "talk"]], [10.9, ["happy", "laugh"]], [11.4, ["smile", "smile"]], [T.bell, ["shock", "wide"]]], tt);
  person({ col: "pink", x: 277, y: 512, r: 23, face: gf[0], bodyH: 70 });
  person({ col: "blue", x: 326, y: 512, r: 23, face: gf[1], bodyH: 70 });
  const greenBehind = green.y < 520;
  if (greenBehind) person(green);
  if (shyBehind) person(shy);
  drawBackTable();
  tray(293, 578, 40); juice(323, 578);
  if (shyBehind) { tray(418, 579, 40); apple(436, 576); }
  if (!greenBehind) person(green);

  // vorne: Introvertiert + Schüchtern
  const iFace = stateAt([[0, "smug"], [T.iLook, "smile"], [T.iNo, "talk"], [T.iNo + 0.35, "happyTalk"], [T.gCool, "happy"], [T.gArrive2, "smug"],
    [T.greet, "happy"], [T.laugh, "smug"], [9.5, "happy"], [10.3, "smile"], [10.8, "happy"], [11.3, "smug"], [T.bell, "neutral"]], tt);
  person({ col: "white", x: 126, y: 593, r: 32, face: iFace, bodyH: 96, look: tt >= T.iLook && tt < T.iNo ? 1 : 0 });
  if (!shyBehind) {
    person(shy);
  }
  drawFrontTable();
  tray(184, 676, 60); juice(222, 676);
  drawBook(130, 655, -0.06 + Math.sin(tt * 1.3) * 0.01);
  if (!shyBehind) {
    if (tt < T.shyStand + 0.1) { tray(440, 677, 62); apple(482, 674); }
    else { tray(shy.x - 6, shy.y + shy.r * 2.6, 60 * shy.r / 32); apple(shy.x + 22 * shy.r / 32, shy.y + shy.r * 2.5); }
  }

  // Schilder
  label("INTROVERTIERT", 124, 536);
  if (tt < T.shyWalk + 0.15) label("SCHÜCHTERN", 451, 537, 1 - ramp(tt, T.shyStand, T.shyWalk + 0.15));
  else label("SCHÜCHTERN", 424, 463, ramp(tt, T.shySeat, T.shySeat + 0.25));

  // Gedankenblasen von Schüchtern
  const tEnd = T.pop;
  const dotsA = popIn(tt, T.dots, tEnd + 0.15, 0.15);
  if (dotsA > 0) { for (const [dx, dy, r] of [[-38, -18, 2.6], [-44, -30, 3.4], [-48, -44, 4.2]]) circle(450 + dx, 594 + dy, r * dotsA, "#f7f2e6"); }
  bubble("hi.", 437, 482, popIn(tt, T.hi, tEnd), "thought");
  bubble("hey Leute!", 444, 438, popIn(tt, T.hey, tEnd + 0.1), "thought");
  bubble("darf ich mich dazusetzen?", 428, 394, popIn(tt, T.sit, tEnd + 0.2), "thought");
  puff(437, 482, tt, tEnd + 0.05); puff(444, 438, tt, tEnd + 0.15); puff(428, 394, tt, tEnd + 0.25);

  // Sprechblasen
  bubble("willst du zu uns?", 262, 462, popIn(tt, T.gAsk1, T.iNo - 0.1), "speech", [-30, -8]);
  bubble("nein danke, passt schon!", 172, 462, popIn(tt, T.iNo, T.gCool - 0.05), "speech", [-30, -10]);
  bubble("cool!", 250, 460, popIn(tt, T.gCool, T.gBack + 0.25), "speech", [0, -4]);
  heart(158, 525, tt, T.heart1); heart(160, 525, tt, T.heart2);
  bubble("willst du zu uns?", 290, 463, popIn(tt, T.gAsk2, T.greet - 0.15), "speech", [40, 8]);
  bubble("SEI GEGRÜSST, MENSCH.", 410, 480, popIn(tt, T.greet, T.greetEnd, 0.12), "robot", [30, 8]);
  bubble("haha, du bist lustig. setz dich!", 318, 418, popIn(tt, T.laugh, 8.6), "speech", [-20, -6]);
  haText(tt);

  // Titel
  const a1 = back(ramp(t, T.title1, T.title1 + 0.3)), a2 = back(ramp(t, T.title2, T.title2 + 0.3));
  const fade = 1 - ramp(t, T.bell, T.bell + 0.35);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 37px InterX"; ctx.letterSpacing = "-1.2px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  if (a1 > 0) { ctx.globalAlpha = clamp(a1) * fade; ctx.save(); ctx.translate(288, 197); ctx.scale(a1, a1); ctx.fillStyle = "#f5f1e8"; ctx.fillText("GLEICHER TISCH.", 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.globalAlpha = clamp(a2) * fade; ctx.save(); ctx.translate(288, 241); ctx.scale(a2, a2);
    const w1 = ctx.measureText("ANDERER ").width, w2 = ctx.measureText("GRUND.").width, x0 = -(w1 + w2) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#f5f1e8"; ctx.fillText("ANDERER ", x0, 0);
    ctx.fillStyle = "#f6b23a"; ctx.fillText("GRUND.", x0 + w1, 0);
    ctx.restore();
  }
  ctx.restore();

  // Pausengong: Schüler laufen unscharf vor der Kamera vorbei
  if (t > T.crowd) {
    ctx.save(); ctx.filter = "blur(14px)";
    const L = [[12.1, 0.55, -1, 260], [12.3, 0.6, 1, 360], [12.45, 0.6, -1, 220], [12.65, 0.6, 1, 300], [12.8, 0.55, -1, 260]];
    for (const [t0, d, dir, sz] of L) {
      const k = (t - t0) / d; if (k < 0 || k > 1) continue;
      const x = dir > 0 ? lerp(-sz, W + sz, k) : lerp(W + sz, -sz, k);
      ctx.fillStyle = "rgba(22,26,38,0.96)";
      ctx.beginPath(); ctx.arc(x, 420, sz * 0.42, 0, Math.PI * 2); ctx.fill();
      rr(x - sz * 0.55, 420 + sz * 0.3, sz * 1.1, 900, sz * 0.4); ctx.fill();
    }
    ctx.restore();
  }
};

window.exportEvents = function () {
  return {
    duration: DUR,
    pops: [T.dots, T.hi, T.hey, T.sit, T.gAsk1, T.iNo, T.gCool, T.gAsk2, T.laugh],
    puffs: [T.pop + 0.05, T.pop + 0.15, T.pop + 0.25],
    shyUp: T.shyUp,
    steps: [[T.gStand + 0.15, T.gArrive], [T.gBack, T.gArrive2], [T.gSeat, T.gSeat + 0.6], [T.shyWalk, T.shySeat - 0.15]],
    greet: T.greet, laugh: T.laugh, hearts: [T.heart1, T.heart2],
    title: [T.title1, T.title2], bell: T.bell, crowd: [12.1, 12.3, 12.45, 12.65, 12.8],
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  return { duration: DUR };
};
