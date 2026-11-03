// "Gleicher Supermarkt." – 1:1-Nachbau (deutsche Version, eigene Zeichnung), ohne Sprecher.
// INTROVERTIERT und HSP im selben Supermarkt: Die HSP leidet unter flackerndem Licht und Durchsagen und flüchtet in die
// Tiefkühltruhe („ahh …“), die introvertierte Person wird von einer Bekannten zugetextet.
// Pointe: „INTROVERTIERT: MENSCHEN. / HSP: ALLES.“ Endlosschleife. Raster 576 x 1024, hochskaliert auf 1080 x 1920.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 11.9;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (c1, c2, k) => { const a = c1.match(/\w\w/g).map(h => parseInt(h, 16)), b = c2.match(/\w\w/g).map(h => parseInt(h, 16));
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(",")})`; };
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, rx, ry, c, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore();
}

// ---------------- Zeitplan ----------------
const T = {
  flick: 1.3, buzz: 1.45, ding1: 2.0, ears: 2.7, ding2: 4.6, walk: 5.3, inFreezer: 5.95, ahh: 6.25,
  pink: 7.15, omg: 7.35, grey: 7.9, punch: 9.0, bye: 10.15, pinkOut: 10.55, back: 10.75, home: 11.35, t5: 11.3,
};
const TALK = [[7.35, "OMG HIII!!"], [7.85, "WIE GEHT'S DIR?!"], [8.3, "UND DEINE MAMA?"], [8.8, "EGAL, ALSO …"], [9.35, "UND DANN …"], [9.85, "UND WEISST DU WAS?"]];
const IX = 168, HX = 378, FX = 522, PINK_X = 58;

// ---------------- Regal ----------------
const R0 = rng(11);
const PCOL = ["#7e2c33", "#a85f2c", "#2d4a7d", "#5f376a", "#6f5236", "#2f5e57", "#8c3a4a", "#3b5b8f"];
const ROWS = [];
for (const y of [352, 430, 508, 586, 664, 742]) {
  const items = []; let x = -6;
  while (x < 460) {
    const kind = R0() < 0.6 ? "box" : R0() < 0.6 ? "bottle" : "can";
    const w = kind === "box" ? 22 + R0() * 18 : kind === "bottle" ? 13 + R0() * 6 : 15 + R0() * 6;
    const h = kind === "box" ? 38 + R0() * 26 : kind === "bottle" ? 46 + R0() * 16 : 26 + R0() * 10;
    const c = PCOL[Math.floor(R0() * PCOL.length)], n = 2 + Math.floor(R0() * 3);
    for (let k = 0; k < n && x < 460; k++) { items.push([x, w, h, c, kind]); x += w + 2; }
    x += 3 + R0() * 6;
  }
  ROWS.push([y, items]);
}
const FROZEN = []; for (const y of [380, 470, 560, 650]) for (let x = 474; x < 576; x += 18) FROZEN.push([x, y, 14, 26 + R0() * 14, ["#f3c6d0", "#cfe6f5", "#f7e3a6", "#d7d0f2", "#c8eedd"][Math.floor(R0() * 5)]]);

function store(t) {
  ctx.fillStyle = "#101017"; ctx.fillRect(0, 0, W, H);
  const cg = ctx.createLinearGradient(0, 0, 0, 320); cg.addColorStop(0, "#0b0b10"); cg.addColorStop(1, "#191a24");
  ctx.fillStyle = cg; ctx.fillRect(0, 0, W, 320);
  // Deckenlampen (rechte flackert)
  const r = rng(Math.floor(t * 14));
  const flick = t > T.flick && t < T.walk ? (r() < 0.45 ? 0.15 : 1) : 1;
  for (const [x0, x1, k] of [[48, 230, 1], [300, 500, flick]]) {
    glow((x0 + x1) / 2, 262, 170, 60, "rgba(220,235,255,0.9)", 0.25 * k);
    ctx.fillStyle = `rgba(${lerp(90, 240, k)},${lerp(95, 246, k)},${lerp(110, 255, k)},1)`;
    ctx.beginPath(); ctx.roundRect(x0, 258, x1 - x0, 7, 3.5); ctx.fill();
  }
  circle(264, 260, 15, "#26262f"); circle(264, 260, 13, "#30303b");
  ctx.fillStyle = "#1c1c24"; for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) if ((a - 2.5) ** 2 + (b - 2.5) ** 2 < 8) circle(255 + a * 3.6, 251 + b * 3.6, 1.1, "#1a1a22");
  // Regal
  ctx.fillStyle = "#1a3236"; ctx.fillRect(0, 318, 462, 22);
  ctx.fillStyle = "#16161e"; ctx.fillRect(0, 340, 462, 470);
  for (const x of [0, 150, 305, 458]) { ctx.fillStyle = "#2a2a35"; ctx.fillRect(x, 330, 6, 480); }
  for (const [y, items] of ROWS) {
    for (const [x, w, h, c, kind] of items) {
      const by = y + 70;
      ctx.fillStyle = c;
      if (kind === "box") { ctx.fillRect(x, by - h, w, h); ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(x + 3, by - h * 0.65, w - 6, h * 0.3); }
      else if (kind === "bottle") { ctx.beginPath(); ctx.roundRect(x, by - h * 0.7, w, h * 0.7, 4); ctx.fill(); ctx.fillRect(x + w * 0.3, by - h, w * 0.4, h * 0.32);
        ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(x + 2, by - h * 0.6, 2.5, h * 0.45); }
      else { ctx.beginPath(); ctx.roundRect(x, by - h, w, h, 3); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(x, by - h * 0.6, w, 4); }
    }
    ctx.fillStyle = "#4a4b57"; ctx.fillRect(0, y + 70, 462, 5);
    ctx.fillStyle = "#c33"; for (let x = 30; x < 460; x += 72) ctx.fillRect(x, y + 71, 10, 3);
  }
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(0, 340, 462, 470);
  // Tiefkühlschrank
  ctx.fillStyle = "#2a2d38"; ctx.fillRect(458, 330, 130, 480);
  const fg = ctx.createLinearGradient(466, 0, 576, 0); fg.addColorStop(0, "#8fbde2"); fg.addColorStop(1, "#bfdff3");
  ctx.fillStyle = fg; ctx.fillRect(466, 340, 120, 460);
  for (const [x, y, w, h, c] of FROZEN) { ctx.fillStyle = c; ctx.fillRect(x, y + 50 - h, w, h); }
  ctx.fillStyle = "#e8f4fb"; for (const y of [430, 520, 610, 700]) ctx.fillRect(466, y, 120, 4);
  ctx.fillStyle = "#3e8fd0"; ctx.beginPath(); ctx.roundRect(462, 318, 92, 16, 3); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 9px InterX"; ctx.letterSpacing = "1.5px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("TIEFKÜHL", 508, 326.5);
  // Boden
  const bg = ctx.createLinearGradient(0, 800, 0, H); bg.addColorStop(0, "#2c2e38"); bg.addColorStop(1, "#14151b");
  ctx.fillStyle = bg; ctx.fillRect(0, 800, W, H - 800);
  ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(0, 800, W, 3);
}
function freezerGlass(t) {
  ctx.save();
  ctx.fillStyle = "rgba(200,230,250,0.28)"; ctx.fillRect(466, 340, 120, 460);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(480, 360); ctx.lineTo(520, 330 + 60); ctx.stroke();
  ctx.fillStyle = "#2a2d38"; ctx.fillRect(458, 330, 8, 480); ctx.fillRect(458, 800, 130, 10);
  ctx.fillStyle = "#9aa3b5"; ctx.fillRect(472, 520, 4, 90);
  ctx.restore();
}
function labels() {
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#1b1b24"; ctx.strokeStyle = "#3a3a48"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(IX - 70, 380, 140, 30, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f2f0f5"; ctx.font = "900 13px InterX"; ctx.letterSpacing = "2px"; ctx.fillText("INTROVERTIERT", IX, 395.5);
  ctx.fillStyle = "#f2b632"; ctx.beginPath(); ctx.roundRect(HX - 62, 372, 124, 40, 6); ctx.fill();
  ctx.fillStyle = "#1d1a16"; ctx.font = "900 17px InterX"; ctx.letterSpacing = "2.5px"; ctx.fillText("HSP", HX, 386);
  ctx.font = "700 7.5px InterX"; ctx.letterSpacing = "1.5px"; ctx.fillText("HOCHSENSIBEL", HX, 402);
}

// ---------------- Figuren ----------------
function bean(x, col, f, arms, opts = {}) {
  const y = 750, dark = opts.dark || "rgba(0,0,0,0.1)";
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(x, y + 8, 44, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8e8a84"; ctx.beginPath(); ctx.roundRect(x - 30, y - 6, 60, 12, 6); ctx.fill();
  // hinterer Arm
  ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = opts.armCol || col; ctx.lineWidth = 15;
  const sh = [x, 628 + (opts.bob || 0)];
  const arm = (a) => { ctx.beginPath(); ctx.moveTo(sh[0] + a[0], sh[1] + a[1]); ctx.lineTo(sh[0] + a[2], sh[1] + a[3]); ctx.lineTo(sh[0] + a[4], sh[1] + a[5]); ctx.stroke(); };
  arm(arms[0]);
  ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - 40, 600 + (opts.bob || 0), 80, 152 - (opts.bob || 0), [40, 40, 22, 22]); ctx.fill();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.roundRect(x + 8, 610, 28, 136, [30, 30, 18, 18]); ctx.fill();
  const hy = 560 + (opts.bob || 0) + (opts.shake ? Math.sin(opts.shake * 60) * 1.5 : 0), hx = x + (opts.shake ? Math.sin(opts.shake * 47) * 1.5 : 0);
  circle(hx, hy, 31, col);
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(hx, hy, 31, -0.7, 1.4); ctx.arc(hx - 6, hy, 27, 1.4, -0.7, true); ctx.fill();
  if (opts.box) box(x - 2, 668);
  arm(arms[1]);
  face(hx, hy, f, opts.look || 0);
  return [hx, hy];
}
function box(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06);
  ctx.fillStyle = "#f2b632"; ctx.strokeStyle = "#b07d18"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-20, -30, 40, 60, 3); ctx.fill(); ctx.stroke();
  circle(0, -10, 10, "#d8392f"); circle(0, -10, 5.5, "#fff"); circle(0, -10, 3, "#d8392f");
  ctx.fillStyle = "#fff"; ctx.fillRect(-12, 8, 24, 6); ctx.fillStyle = "#e8a52a"; ctx.fillRect(-12, 18, 24, 4);
  ctx.restore();
}
function face(x, y, f, look) {
  const ink = "#24202a"; ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 2.4; ctx.lineCap = "round";
  const ex = look * 4;
  const eye = (cx, cy, r = 4.6, px = 0) => { circle(cx, cy, r + 1.2, "#fffdf7"); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, r + 1.2, 0, Math.PI * 2); ctx.stroke();
    circle(cx + px, cy + 0.5, r * 0.55, ink); circle(cx + px + 1, cy - 1, 1, "#fff"); ctx.lineWidth = 2.4; };
  if (f === "smile" || f === "talk" || f === "forced") {
    eye(x - 11 + ex, y - 5, 4.4, look * 1.5); eye(x + 11 + ex, y - 5, 4.4, look * 1.5);
    ctx.beginPath();
    if (f === "forced") { ctx.moveTo(x - 8 + ex, y + 12); ctx.quadraticCurveTo(x + ex, y + 15, x + 8 + ex, y + 10); ctx.stroke(); }
    else ctx.arc(x + ex, y + 6, 9, 0.35, Math.PI - 0.35), ctx.stroke();
  } else if (f === "uneasy") {
    eye(x - 11, y - 3, 4, 0); eye(x + 11, y - 3, 4, 0);
    ctx.beginPath(); ctx.moveTo(x - 17, y - 14); ctx.lineTo(x - 6, y - 17); ctx.moveTo(x + 17, y - 14); ctx.lineTo(x + 6, y - 17); ctx.stroke();
    ctx.beginPath(); for (let k = 0; k <= 8; k++) ctx.lineTo(x - 8 + k * 2, y + 13 + (k % 2 ? -2 : 2)); ctx.stroke();
  } else if (f === "pain") {
    ctx.beginPath(); ctx.moveTo(x - 16, y - 8); ctx.lineTo(x - 7, y - 4); ctx.lineTo(x - 16, y);
    ctx.moveTo(x + 16, y - 8); ctx.lineTo(x + 7, y - 4); ctx.lineTo(x + 16, y); ctx.stroke();
    ctx.beginPath(); for (let k = 0; k <= 8; k++) ctx.lineTo(x - 8 + k * 2, y + 12 + (k % 2 ? -2 : 2)); ctx.stroke();
  } else if (f === "shock") {
    eye(x - 11, y - 6, 5.5, 0); eye(x + 11, y - 6, 5.5, 0);
    ctx.beginPath(); ctx.ellipse(x, y + 12, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  } else if (f === "bliss") {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 11, y - 2, 5.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(x, y + 6, 8, 0.3, Math.PI - 0.3); ctx.stroke();
    circle(x - 19, y + 6, 4, "rgba(240,130,150,0.35)"); circle(x + 19, y + 6, 4, "rgba(240,130,150,0.35)");
  } else if (f === "dead") {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 11 - 6, y - 5); ctx.lineTo(x + s * 11 + 6, y - 5); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 11, y - 4.5, 3.4, 0, Math.PI); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(x - 7, y + 12); ctx.lineTo(x + 7, y + 11); ctx.stroke();
  } else if (f === "chatty") {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 11 + 3, y - 2, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    ctx.fillStyle = "#4b1a22"; ctx.beginPath(); ctx.moveTo(x - 6, y + 7); ctx.quadraticCurveTo(x + 4, y + 25, x + 14, y + 7); ctx.closePath(); ctx.fill();
  }
}

// ---------------- Effekte ----------------
function zigzags(x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#f2d14a"; ctx.lineWidth = 2.6; ctx.lineJoin = "round";
  for (const dx of [-20, 0, 20]) {
    const j = rng(Math.floor(t * 16) + dx);
    ctx.beginPath(); for (let k = 0; k <= 6; k++) ctx.lineTo(x + dx + (k % 2 ? 6 : -6) + (j() - 0.5) * 3, y - 70 + k * 8 + dx * 0.2); ctx.stroke();
  }
  ctx.restore();
}
function waves(x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#e8e6ef"; ctx.lineWidth = 2.2;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const r = 10 + k * 8 + ((t * 30) % 8);
    ctx.beginPath(); ctx.arc(x + s * 34, y - 4, r, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke();
  }
  ctx.restore();
}
function spiky(x, y, text, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(back(k), back(k)); ctx.rotate(Math.sin(k * 30) * 0.03);
  ctx.fillStyle = "#e23d46"; ctx.beginPath();
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 1 : 1.14; ctx.lineTo(Math.cos(a) * 58 * rr, Math.sin(a) * 18 * rr); }
  ctx.fill();
  ctx.fillStyle = "#1a1a22"; ctx.beginPath();
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 1 : 1.12; ctx.lineTo(Math.cos(a) * 54 * rr, Math.sin(a) * 15 * rr); }
  ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.letterSpacing = "0.5px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 1);
  ctx.restore();
}
function scribble(x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#f4f2f8"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let k = 0; k < 60; k++) { const u = k / 60 * Math.PI * 6; ctx.lineTo(x + Math.cos(u * 1.3 + t * 3) * (16 + 6 * Math.sin(u * 2.1)), y + Math.sin(u * 1.7 + t * 2) * (11 + 4 * Math.cos(u))); }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#fff"; ctx.font = "700 20px DejaVu Sans"; ctx.textAlign = "center";
  ctx.fillText("♪", x - 48, y + 60 + Math.sin(t * 6) * 4); ctx.fillText("♫", x + 46, y + 40 + Math.cos(t * 6) * 4);
  ctx.fillStyle = "#e23d46"; ctx.font = "900 22px InterX"; ctx.fillText("!", x - 40, y + 30); ctx.fillText("!", x + 52, y + 80);
  ctx.restore();
}
function bubble(x, y, text, k, tail, alpha = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k * 3) * alpha;
  ctx.font = "900 10.5px InterX"; ctx.letterSpacing = "0.3px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const w = ctx.measureText(text).width + 20, s = back(clamp(k * 1.6));
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f6f3ec"; ctx.beginPath(); ctx.roundRect(-w / 2, -12, w, 24, 12); ctx.fill();
  if (tail) { ctx.beginPath(); ctx.moveTo(tail * 10 - 6, 10); ctx.lineTo(tail * 18, 22); ctx.lineTo(tail * 10 + 6, 10); ctx.fill(); }
  ctx.fillStyle = "#1e1b22"; ctx.fillText(text, 0, 1);
  ctx.restore();
}

// ---------------- Titel ----------------
const TITLES = [[0, ["GLEICHER SUPERMARKT."]], [T.punch, ["INTROVERTIERT: MENSCHEN.", "HSP: ALLES."]], [T.t5, ["GLEICHER SUPERMARKT."]]];
function star(x, y, r) { ctx.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * 0.35 : r, a = (k * Math.PI) / 4; ctx.lineTo(x + Math.sin(a) * rr, y - Math.cos(a) * rr); } ctx.fill(); }
function title(t) {
  let idx = 0; for (let k = 0; k < TITLES.length; k++) if (t >= TITLES[k][0]) idx = k;
  const [t0, lines] = TITLES[idx], next = TITLES[idx + 1] ? TITLES[idx + 1][0] : 99;
  const k = (idx === 0 ? 1 : easeOut(ramp(t, t0, t0 + 0.18))) * (1 - ramp(t, next - 0.12, next));
  ctx.save(); ctx.translate(288, 175); ctx.scale(lerp(1.25, 1, k), Math.max(0.02, k)); ctx.translate(-288, -175);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (lines.length === 1) {
    ctx.font = "900 36px InterX"; ctx.letterSpacing = "-0.5px"; ctx.fillStyle = "#f3f1ee"; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
    ctx.fillText(lines[0], 288, 175);
  } else {
    ctx.font = "900 27px InterX"; ctx.letterSpacing = "0px"; ctx.fillStyle = "#f3f1ee"; ctx.fillText(lines[0], 288, 155);
    ctx.font = "900 33px InterX"; ctx.fillStyle = "#f6b941"; ctx.shadowColor = "rgba(246,185,65,0.6)"; ctx.shadowBlur = 16; ctx.fillText(lines[1], 288, 193);
  }
  ctx.restore();
  if (idx === 1 && t < t0 + 0.7) {
    const r = rng(4), a = Math.sin(ramp(t, t0, t0 + 0.7) * Math.PI);
    ctx.fillStyle = `rgba(255,228,150,${a})`;
    for (let n = 0; n < 14; n++) star(160 + r() * 260 + (r() < 0.5 ? -60 : 60), 170 + r() * 45, 2 + r() * 3.5);
  }
}

// ---------------- Szene ----------------
const STAND = [[-26, 4, -38, 40, -30, 82], [26, 4, 38, 40, 30, 82]];
const HOLD = [[-26, 4, -34, 36, -10, 46], [26, 4, 34, 36, 10, 46]];
const EARS = [[-26, 4, -50, -20, -30, -60], [26, 4, 50, -20, 30, -60]];
const STIFF = [[-26, 4, -60, 30, -95, 52], [26, 4, 60, 30, 95, 52]];
const SHRUG = [[-26, 4, -58, 22, -72, -10], [26, 4, 58, 22, 72, -10]];
const lerpArms = (A, B, k) => A.map((a, i) => a.map((v, j) => lerp(v, B[i][j], k)));
function hsp(t) {
  // Position: 5.3 – 5.95 in die Truhe, 10.75 – 11.35 zurück
  const x = lerp(lerp(HX, FX, easeIO(ramp(t, T.walk, T.inFreezer))), HX, easeIO(ramp(t, T.back, T.home)));
  const inF = ramp(t, T.walk + 0.4, T.inFreezer) * (1 - ramp(t, T.back, T.back + 0.3));
  let f = "smile", arms = STAND, bob = 0, shake = 0;
  if (t > T.buzz) f = "uneasy";
  if (t > T.ding1 && t < T.ears) { f = "shock"; arms = lerpArms(STAND, STIFF, easeOut(ramp(t, T.ding1, T.ding1 + 0.15))); shake = t; }
  if (t >= T.ears && t < T.ding2) { f = "pain"; arms = lerpArms(STIFF, EARS, easeOut(ramp(t, T.ears, T.ears + 0.2))); }
  if (t >= T.ding2 && t < T.walk) { f = "shock"; arms = EARS; shake = t; bob = -3 * Math.abs(Math.sin(t * 20)); }
  if (t >= T.walk && t < T.inFreezer) { f = "uneasy"; arms = lerpArms(EARS, STAND, ramp(t, T.walk, T.walk + 0.3)); bob = -4 * Math.abs(Math.sin(t * 16)); }
  if (t >= T.inFreezer) { f = "bliss"; arms = STAND; bob = Math.sin(t * 2) * 1.5; }
  if (t >= T.back) { f = "smile"; bob = -4 * Math.abs(Math.sin(t * 16)) * (1 - ramp(t, T.home - 0.05, T.home)); }
  const col = mix("efe6d6", "e4eefa", inF);
  const [hx, hy] = bean(x, col, f, arms, { bob, shake, armCol: mix("ddd2bf", "d4e0f0", inF) });
  if (inF > 0) freezerGlass(t);
  zigzags(hx, hy, t, ramp(t, T.buzz, T.buzz + 0.1) * (1 - ramp(t, T.walk, T.walk + 0.15)));
  waves(hx, hy, t, (t > T.ding1 && t < T.ding1 + 0.9 ? 1 : 0) + (t > T.ding2 && t < T.walk ? 1 : 0));
  scribble(hx, hy - 58, t, ramp(t, T.ding2, T.ding2 + 0.1) * (1 - ramp(t, T.walk, T.walk + 0.2)));
  // „ahh …“ und Schneeflocken in der Truhe
  if (t > T.ahh && t < T.back) {
    const a = ramp(t, T.ahh, T.ahh + 0.3) * (1 - ramp(t, T.back - 0.25, T.back));
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#f4f8ff"; ctx.font = "700 17px InterX"; ctx.letterSpacing = "1px"; ctx.textAlign = "center";
    ctx.shadowColor = "rgba(30,60,110,0.6)"; ctx.shadowBlur = 6; ctx.fillText("ahh …", FX - 4, 482 - 6 * ramp(t, T.ahh, T.ahh + 1)); ctx.restore();
    for (let k = 0; k < 9; k++) { const ph = (t * 0.5 + k / 9) % 1; ctx.fillStyle = `rgba(255,255,255,${Math.sin(ph * Math.PI) * a})`; star(478 + ((k * 37) % 92), 520 + ph * 200, 2.5); }
  }
}
function introvert(t) {
  const g = ramp(t, T.grey, T.grey + 0.8) * (1 - ramp(t, T.home - 0.3, T.home + 0.1));
  const col = mix("efe6d6", "8f93a8", g);
  let f = "smile", arms = HOLD;
  if (t > T.omg) f = "forced";
  if (t > T.grey + 0.4 && t < T.home - 0.2) f = "dead";
  const [hx, hy] = bean(IX, col, f, arms, { box: true, look: t > T.pink && t < T.pinkOut + 0.2 ? -0.8 : 0.4, armCol: mix("ddd2bf", "7f8397", g) });
  if (g > 0.6 && t < T.bye) { const ph = (t * 0.8) % 1; ctx.fillStyle = `rgba(120,170,230,${(1 - ph) * 0.9})`; ctx.beginPath(); ctx.ellipse(hx + 34, hy - 10 + ph * 18, 3, 4.5, 0, 0, Math.PI * 2); ctx.fill(); }
}
function pink(t) {
  if (t < T.pink || t > T.pinkOut + 0.6) return;
  const x = lerp(-80, PINK_X, easeOut(ramp(t, T.pink, T.pink + 0.3))) - 150 * easeIO(ramp(t, T.pinkOut, T.pinkOut + 0.5));
  const talking = t > T.omg && t < T.bye;
  const reach = [[-26, 4, -40, 40, -30, 82], [26, 4, 60, 30 + (talking ? Math.sin(t * 9) * 6 : 0), 92, 40]];
  const wave = [[-26, 4, -40, 40, -30, 82], [26, 4, 46, -10, 50 + Math.sin(t * 22) * 8, -52]];
  bean(x, "#e79ab0", "chatty", t > T.bye ? wave : reach, { look: 0.8, armCol: "#d9869e", bob: talking ? -2 * Math.abs(Math.sin(t * 9)) : 0 });
}
function talk(t) {
  if (t < T.omg || t > T.bye + 0.6) return;
  // die letzten drei Sprechblasen; die neueste schiebt die älteren nach oben
  let n = 0; for (const [t0] of TALK) if (t >= t0) n++;
  const fade = 1 - ramp(t, T.bye - 0.12, T.bye);
  const e = easeOut(ramp(t, TALK[n - 1][0], TALK[n - 1][0] + 0.18));
  for (let i = Math.max(0, n - 4); i < n; i++) {
    const slot = n - 1 - i;                               // 0 = neueste (unten)
    const y = 512 - slot * 30 - 30 * (e - 1);
    const a = fade * (slot === 3 ? 1 - e : 1);
    if (a > 0) bubble(110, y, TALK[i][1], ramp(t, TALK[i][0], TALK[i][0] + 0.25), slot === 0 ? -1 : 0, a);
  }
  if (t > T.bye) bubble(PINK_X + 30, 498, "TSCHÜÜSS!!", ramp(t, T.bye, T.bye + 0.25), -1, 1 - ramp(t, T.pinkOut + 0.3, T.pinkOut + 0.5));
}

window.setup = async () => {
  await Promise.all(["900 36px InterX", "700 10px InterX"].map(f => document.fonts.load(f)));
  return { duration: DUR };
};
window.renderFrame = t => {
  const z = 1 + 0.02 * Math.sin((t / DUR) * Math.PI);
  ctx.setTransform(S * z, 0, 0, S * z, (1080 - 1080 * z) / 2, (1920 - 1920 * z) * 0.6);
  store(t);
  labels();
  introvert(t);
  pink(t);
  hsp(t);
  talk(t);
  spiky(264, 330, "DING DONG!", ramp(t, T.ding1, T.ding1 + 0.2) * (1 - ramp(t, T.ding1 + 0.65, T.ding1 + 0.8)));
  spiky(264, 330, "DING DONG!", ramp(t, T.ding2, T.ding2 + 0.2) * (1 - ramp(t, T.ding2 + 0.65, T.ding2 + 0.8)));
  ctx.setTransform(S, 0, 0, S, 0, 0);
  title(t);
};
window.exportEvents = () => ({ duration: DUR, T, talk: TALK.map(x => x[0]) });
