// "Wenn ihr beide in dieselbe Richtung ausweicht" – Canvas-Animation (deutsche Version), ohne Sprecher.
// Nacht-Gehweg, zwei Figuren weichen sich immer wieder gleich aus, oben der Peinlichkeits-Balken.
"use strict";

const W = 1080, H = 1920;
window.DURATION = 18.2;
const ZY = 880;                       // Höhe, um die gezoomt wird
const FEET = 1100;                    // Fußlinie (Welt)
const PAVE = 960;                     // Beginn Gehweg (Welt)

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
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
// Keyframes [t, wert...] mit weichem Übergang
function keys(K, t, ease = easeIO) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = ease((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}
const lin = x => x;
// Zustand (Gesicht usw.) zur Zeit t aus [[t, wert], ...]
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

// ------------------------------------------------------------------ Ablauf
// Positionen: [t, x, Spur]  Spur -1 = weiter hinten, +1 = weiter vorn (beide weichen gleich aus)
const YOU = [[0, 290, 0], [0.5, 330, 0], [1.75, 330, 0], [1.95, 305, -1], [2.6, 305, -1], [2.8, 330, 1], [3.8, 330, 1],
  [3.95, 310, -1], [4.45, 310, -1], [4.6, 330, 1], [5.05, 330, 1], [5.2, 312, -1], [5.5, 312, -1], [5.68, 330, 0],
  [10.4, 330, 0], [10.55, 352, 0], [10.8, 330, 0], [13.0, 330, 0], [13.5, 380, -0.6], [14.1, 450, 0], [20, 450, 0]];
const OTH = [[0, 900, 0], [0.5, 560, 0], [1.75, 560, 0], [1.95, 545, -1], [2.6, 545, -1], [2.8, 565, 1], [3.8, 565, 1],
  [3.95, 548, -1], [4.45, 548, -1], [4.6, 565, 1], [5.05, 565, 1], [5.2, 550, -1], [5.5, 550, -1], [5.68, 560, 0],
  [10.4, 560, 0], [10.55, 535, 0], [10.8, 560, 0], [12.85, 560, 0], [13.3, 420, 1], [13.75, 180, 1], [14.5, -260, 0.6], [20, -260, 0.6]];
const PEACH = [[0, 1400, 0], [15.75, 1400, 0], [16.35, 650, 0], [20, 650, 0]];
const CAM = [[0, 1, 540], [0.45, 1, 540], [0.72, 1.25, 445], [13.3, 1.25, 445], [13.85, 1, 470], [16.35, 1, 520], [16.55, 1.2, 530], [20, 1.2, 530]];

const FACE_Y = [[0, "neutral"], [0.55, "shock"], [1.8, "teeth"], [6.0, "calm"], [8.1, "plain"], [9.2, "shockW"],
  [10.55, "dizzy"], [11.0, "teeth"], [13.4, "worried"], [13.9, "relief"], [16.45, "shock"], [16.95, "done"]];
const FACE_O = [[0, "smile"], [0.55, "shock"], [1.0, "happyO"], [2.5, "big"], [4.0, "grin"], [6.0, "smile"], [8.1, "smile"],
  [9.2, "shockW"], [10.55, "dizzy"], [11.0, "happyO"], [12.7, "happy"], [13.5, "big"]];
const FACE_P = [[0, "smile"], [16.45, "big"]];

const BUBBLES = [   // [von, bis, wer, text, Gedanke?]
  [0.95, 2.3, "o", "Ups! Sorry!"],
  [2.5, 3.85, "y", "Nee, mir tut's leid!"],
  [6.0, 8.0, "y", "Stehen bleiben. Lass ihn vorbei.", true],
  [8.15, 9.1, "y", "…"], [8.2, 9.1, "o", "…"],
  [9.25, 10.45, "y", "Nein, du zuerst!"], [9.4, 10.45, "o", "Geh du!"],
  [11.0, 12.7, "o", "Okay … nach dir!"],
  [14.1, 15.25, "y", "Nie wieder.", true],
  [16.95, 30, "both", "Jedes. Einzelne. Mal.", true],
];
const METER = [[0, 15], [0.45, 15], [0.6, 19], [0.75, 40], [1.75, 40], [1.88, 50], [2.6, 50], [2.75, 56], [3.0, 58], [3.75, 58],
  [3.88, 65], [4.25, 66], [4.62, 72], [5.1, 78], [5.6, 83], [8.0, 83], [8.2, 85], [8.4, 88], [10.35, 88], [10.5, 92], [10.7, 97],
  [13.1, 97], [13.3, 90], [13.5, 57], [13.75, 15], [14.0, 5], [16.4, 5], [16.5, 7], [16.75, 101], [17.0, 143], [17.25, 150], [30, 150]];
const BUMP = 10.56, FLASH = 16.48, PASS = [12.85, 14.5], CLAP = [11.35, 12.9];

// ------------------------------------------------------------------ Hintergrund
let BLD = [], LAMPS = [-60, 470, 1000, 1530];
function buildStatic() {
  const R = rng(3);
  for (const layer of [0, 1]) {
    let x = -400;
    while (x < 1500) {
      const w = 90 + R() * 150, h = (layer ? 220 : 330) + R() * (layer ? 200 : 260);
      const win = [];
      for (let yy = 30; yy < h - 20; yy += 46) for (let xx = 18; xx < w - 22; xx += 36) if (R() < (layer ? 0.32 : 0.22)) win.push([xx, yy, R()]);
      BLD.push({ layer, x, w, h, win });
      x += w + (layer ? 30 : 10) + R() * 60;
    }
  }
}
function drawWorld(c, t) {
  const sky = c.createLinearGradient(0, -300, 0, PAVE);
  sky.addColorStop(0, "#17142b"); sky.addColorStop(1, "#2a2546");
  c.fillStyle = sky; c.fillRect(-600, -600, 2400, PAVE + 600);
  for (const b of BLD) {
    c.fillStyle = b.layer ? "#2f2a4d" : "#262140";
    c.fillRect(b.x, PAVE - b.h, b.w, b.h);
    for (const [wx, wy, r] of b.win) {
      c.fillStyle = r < 0.7 ? "rgba(236,190,108,0.75)" : "rgba(236,190,108,0.35)";
      c.fillRect(b.x + wx, PAVE - b.h + wy, 13, 17);
    }
  }
  // Gehweg
  const pv = c.createLinearGradient(0, PAVE, 0, 1700);
  pv.addColorStop(0, "#2b2643"); pv.addColorStop(1, "#1d1a30");
  c.fillStyle = pv; c.fillRect(-600, PAVE, 2400, 1600);
  c.fillStyle = "#3a3458"; c.fillRect(-600, PAVE, 2400, 6);
  c.strokeStyle = "rgba(255,255,255,0.035)"; c.lineWidth = 3;
  for (let x = -800; x < 1800; x += 120) { c.beginPath(); c.moveTo(x, PAVE + 6); c.lineTo(x - 260, 1700); c.stroke(); }
  // Laternen mit Lichtschein
  for (const lx of LAMPS) {
    const gl = c.createRadialGradient(lx, 650, 10, lx, 650, 260);
    gl.addColorStop(0, "rgba(255,206,120,0.30)"); gl.addColorStop(1, "rgba(255,206,120,0)");
    c.fillStyle = gl; c.fillRect(lx - 270, 385, 540, 540);
    c.fillStyle = "#3d3760"; c.fillRect(lx - 5, 650, 10, PAVE - 650 + 8);
    c.fillStyle = "#4a4370"; c.fillRect(lx - 30, 635, 60, 12);
    c.fillStyle = "#ffd47a"; c.beginPath(); c.moveTo(lx - 26, 647); c.lineTo(lx + 26, 647); c.lineTo(lx + 16, 661); c.lineTo(lx - 16, 661); c.closePath(); c.fill();
  }
}

// ------------------------------------------------------------------ Figuren
const PAL = {
  y: { body: "#ebe2f3", shade: "#c5b4d8", arm: "#a68fc0", foot: "#9a86b4" },
  o: { body: "#e3e9e4", shade: "#b4bfb7", arm: "#98a59c", foot: "#8e9a92" },
  p: { body: "#f3dccb", shade: "#d9b7a0", arm: "#c79a80", foot: "#b98d74" },
};
const INK = "#2f2944";

function eye(c, x, y, kind, look) {
  c.lineWidth = 4; c.strokeStyle = INK; c.lineCap = "round";
  if (kind === "closed") { c.beginPath(); c.arc(x, y - 4, 11, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); return; }
  if (kind === "happy") { c.beginPath(); c.arc(x, y + 6, 11, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); return; }
  const r = kind === "wide" ? 15 : 12;
  c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.lineWidth = 3; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(x + look, y + 1, kind === "wide" ? 5 : 5.5, 0, 7); c.fill();
}
function face(c, kind, look, t) {
  // Kopf-Mitte = (0,0), Radius 60
  const E = {
    neutral: ["dot", "line"], plain: ["dot", "flat"], shock: ["wide", "o"], shockW: ["wide", "o", "brows"], teeth: ["dot", "teeth", "brows"],
    calm: ["closed", "flat"], worried: ["dot", "wave", "brows"], relief: ["closed", "smileS"], done: ["closed", "flat"],
    dizzy: ["wide", "o"], smile: ["dot", "smile"], happyO: ["happy", "oS"], happy: ["happy", "smile"], big: ["dot", "big"], grin: ["dot", "big"],
  }[kind];
  const [ek, mk, br] = E;
  eye(c, -21, -8, ek, look); eye(c, 21, -8, ek, look);
  if (br) {
    c.strokeStyle = INK; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-32, -30); c.lineTo(-12, -36); c.stroke();
    c.beginPath(); c.moveTo(32, -30); c.lineTo(12, -36); c.stroke();
  }
  c.strokeStyle = INK; c.lineWidth = 4; c.fillStyle = INK;
  const my = 24;
  switch (mk) {
    case "line": c.beginPath(); c.moveTo(-10, my); c.lineTo(10, my); c.stroke(); break;
    case "flat": c.beginPath(); c.moveTo(-14, my); c.lineTo(14, my); c.stroke(); break;
    case "smile": c.beginPath(); c.arc(0, my - 10, 14, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); break;
    case "smileS": c.beginPath(); c.arc(0, my - 8, 10, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); break;
    case "o": c.beginPath(); c.ellipse(0, my + 2, 9, 12, 0, 0, 7); c.fill(); break;
    case "oS": c.beginPath(); c.ellipse(0, my, 7, 8, 0, 0, 7); c.fill(); break;
    case "wave": c.beginPath(); c.moveTo(-14, my); c.quadraticCurveTo(-7, my - 6, 0, my); c.quadraticCurveTo(7, my + 6, 14, my); c.stroke(); break;
    case "big":
      c.beginPath(); c.moveTo(-18, my - 6); c.lineTo(18, my - 6); c.arc(0, my - 6, 18, 0, Math.PI); c.closePath(); c.fill();
      c.fillStyle = "#e7748a"; c.beginPath(); c.arc(0, my + 6, 8, Math.PI, 0); c.fill(); break;
    case "teeth":
      c.fillStyle = "#fff"; rr(c, -20, my - 10, 40, 20, 6); c.fill(); c.lineWidth = 3; c.stroke();
      c.beginPath(); c.moveTo(-20, my); c.lineTo(20, my); for (const xx of [-7, 7]) { c.moveTo(xx, my - 10); c.lineTo(xx, my + 10); } c.stroke(); break;
  }
}

// x, Fußlinie y, Skalierung s
function blob(c, who, x, y, s, faceKind, t, o = {}) {
  const P = PAL[who];
  c.save();
  c.translate(x, y); c.scale(s, s);
  // Schatten
  c.fillStyle = "rgba(10,8,25,0.35)"; c.beginPath(); c.ellipse(0, 4, 82, 13, 0, 0, 7); c.fill();
  // Füße
  const st = o.walk ? Math.sin(o.walk) : 0;
  c.fillStyle = P.foot;
  rr(c, -46, -18 - Math.max(0, st) * 12, 40, 20, 10); c.fill();
  rr(c, 6, -18 - Math.max(0, -st) * 12, 40, 20, 10); c.fill();
  const bob = o.walk ? -Math.abs(Math.cos(o.walk)) * 8 : 0;
  c.translate(0, bob);
  c.rotate((o.lean || 0) * Math.PI / 180);
  // Körper (Ei-Form)
  const bh = 215, bw = 76, by = -14;
  c.beginPath();
  c.moveTo(0, by - bh);
  c.bezierCurveTo(bw * 0.95, by - bh, bw * 1.12, by - bh * 0.35, bw, by - bh * 0.12);
  c.bezierCurveTo(bw * 0.9, by, bw * 0.4, by, 0, by);
  c.bezierCurveTo(-bw * 0.4, by, -bw * 0.9, by, -bw, by - bh * 0.12);
  c.bezierCurveTo(-bw * 1.12, by - bh * 0.35, -bw * 0.95, by - bh, 0, by - bh);
  c.closePath();
  c.fillStyle = P.body; c.fill();
  c.save(); c.clip();
  c.fillStyle = P.shade; c.globalAlpha = 0.7;
  c.beginPath(); c.ellipse(bw * 0.95, by - bh * 0.45, 40, bh * 0.75, 0, 0, 7); c.fill();
  c.restore();
  // Arme (auf dem Bauch)
  c.strokeStyle = P.arm; c.lineWidth = 17; c.lineCap = "round";
  c.beginPath(); c.moveTo(-bw + 10, by - bh * 0.6); c.quadraticCurveTo(-bw - 6, by - bh * 0.4, -bw * 0.45, by - bh * 0.33); c.stroke();
  if (o.armOut) {         // "Nach dir"-Geste: langer Arm zur Seite
    const k = o.armOut, dx = -(o.armDir || 1);
    c.beginPath(); c.moveTo(bw - 10, by - bh * 0.55);
    c.quadraticCurveTo(bw + 10, by - bh * 0.2, bw - 10 - dx * -1 * (60 + 120 * k), by - bh * (0.25 - 0.18 * k));
    c.stroke();
  } else {
    c.beginPath(); c.moveTo(bw - 10, by - bh * 0.6); c.quadraticCurveTo(bw + 6, by - bh * 0.4, bw * 0.45, by - bh * 0.33); c.stroke();
  }
  // Kopf
  const hy = by - bh - 52;
  c.fillStyle = P.body; c.beginPath(); c.arc(0, hy, 60, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(0, hy, 60, 0, 7); c.clip();
  c.fillStyle = P.shade; c.globalAlpha = 0.55; c.beginPath(); c.arc(28, hy + 10, 52, 0, 7); c.fill();
  c.restore();
  c.save(); c.translate(0, hy); face(c, faceKind, o.look || 0, t); c.restore();
  c.restore();
  return { headTop: y + s * (bob + hy - 60), x };
}

// ------------------------------------------------------------------ Szene
function charState(K, t) {
  const [x, lane] = keys(K, t);
  const [x2] = keys(K, t + 0.04);
  const v = (x2 - x) / 0.04;
  return { x, lane, v };
}
let walkPh = { y: 0, o: 0, p: 0 };

function drawStars(c, x, y, t, t0) {
  const u = ramp(t, t0, t0 + 0.9);
  if (u <= 0 || u >= 1) return;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + t * 7;
    const px = x + Math.cos(a) * 70, py = y + Math.sin(a) * 18;
    c.save(); c.translate(px, py); c.rotate(t * 4 + k);
    c.globalAlpha = 1 - u;
    c.fillStyle = "#ffd76a";
    c.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 5 : 14, aa = i * Math.PI / 4; c.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); }
    c.closePath(); c.fill(); c.restore();
  }
}

function bubble(c, x, y, text, thought, t, t0, t1, pink) {
  const a = ramp(t, t0, t0 + 0.06) * (1 - ramp(t, t1 - 0.1, t1));
  if (a <= 0) return;
  const s = back(ramp(t, t0, t0 + 0.2));
  c.save();
  c.font = (thought ? "italic " : "") + "900 40px InterBlk";
  c.letterSpacing = thought ? "0.5px" : "0px";
  const tw = c.measureText(text).width;
  const bw = tw + 52, bh = 74;
  x = clamp(x, 40 + bw / 2, 900 - bw / 2);
  c.globalAlpha = a;
  c.translate(x, y); c.scale(s, s);
  c.fillStyle = pink ? "rgba(120,45,70,0.88)" : "rgba(46,41,78,0.93)";
  rr(c, -bw / 2, -bh / 2, bw, bh, 22); c.fill();
  c.fillStyle = "#f6f3ff"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(text, 0, 3);
  c.restore();
}

function meterColor(v) {
  if (v < 40) return "#f2c95e";
  if (v < 85) return "#ef9d62";
  return "#e7697d";
}

function drawHUD(t) {
  const v = keys(METER, t, lin)[0];
  const shake = v > 100 ? (Math.sin(t * 90) * 4) : 0;
  // Batterie
  ctx.save();
  ctx.translate(892, 385);
  ctx.strokeStyle = "#cfc7ea"; ctx.lineWidth = 4; rr(ctx, -34, -17, 62, 34, 7); ctx.stroke();
  ctx.fillStyle = "#cfc7ea"; ctx.fillRect(30, -7, 6, 14);
  ["#9b8cd8", "#e7a35e", "#7cc58e"].forEach((col, i) => { ctx.fillStyle = col; rr(ctx, -27 + i * 18, -10, 15, 20, 3); ctx.fill(); });
  ctx.restore();
  // Label
  ctx.save();
  ctx.translate(shake, 0);
  ctx.font = "900 34px InterBlk"; ctx.letterSpacing = "3px";
  ctx.fillStyle = "#f0d9a8"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(15,10,35,0.9)"; ctx.shadowBlur = 12;
  ctx.fillText("PEINLICHKEIT", 540, 385);
  ctx.shadowBlur = 0;
  // Balken
  const X0 = 240, BW = 600, Y0 = 420, BH = 44;
  ctx.fillStyle = "#15122a"; rr(ctx, X0, Y0, BW, BH, 14); ctx.fill();
  const fillW = BW * Math.min(v, 100) / 100 + (v > 100 ? (v - 100) / 50 * 95 : 0);
  let col = meterColor(v);
  let alpha = 1;
  if (v >= 95 && v <= 100) alpha = 0.75 + 0.25 * Math.sin(t * 22);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col; rr(ctx, X0 + 6, Y0 + 6, Math.max(18, fillW - 12), BH - 12, 10); ctx.fill();
  ctx.globalAlpha = 1;
  if (v > 100) {        // Funken am überlaufenden Ende
    const R = rng(Math.floor(t * 20));
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = `rgba(255,150,170,${0.4 + R() * 0.6})`;
      ctx.beginPath(); ctx.arc(X0 + fillW + R() * 40 - 10, Y0 + R() * BH - 20 + R() * 20, 3 + R() * 4, 0, 7); ctx.fill();
    }
  }
  ctx.font = "900 50px InterBlk"; ctx.letterSpacing = "0px";
  ctx.fillStyle = col;
  const pop = 1 + 0.12 * (1 - ramp(t, Math.floor(t * 4) / 4, Math.floor(t * 4) / 4 + 0.1)) * (v > 100 ? 1 : 0);
  ctx.save(); ctx.translate(540, 515); ctx.scale(pop, pop);
  ctx.shadowColor = "rgba(15,10,35,0.8)"; ctx.shadowBlur = 14;
  ctx.fillText(Math.round(v) + "%", 0, 0);
  ctx.restore();
  ctx.restore();
}

function drawTitle(t) {
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 54px InterBlk"; ctx.letterSpacing = "1px";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 12;
  ctx.fillText("WENN IHR BEIDE IN DIESELBE", 470, 1345);
  const l2 = "RICHTUNG AUSWEICHT";
  ctx.fillText(l2, 450, 1413);
  const w2 = ctx.measureText(l2).width;
  ctx.shadowBlur = 0;
  ctx.font = "48px 'Noto Color Emoji'";
  ctx.fillText("🚶", 450 + w2 / 2 + 40, 1411);
  ctx.restore();
}

function drawFrame(t) {
  const [z, ax] = keys(CAM, t);
  ctx.save();
  ctx.fillStyle = "#17142b"; ctx.fillRect(0, -OFF, W, H + 2 * OFF);
  ctx.translate(540, ZY); ctx.scale(z, z); ctx.translate(-ax, -ZY);
  drawWorld(ctx, t);

  const Y = charState(YOU, t), O = charState(OTH, t), Pc = charState(PEACH, t);
  const chars = [
    { who: "y", st: Y, face: stateAt(FACE_Y, t), look: 4 },
    { who: "o", st: O, face: stateAt(FACE_O, t), look: -4 },
    { who: "p", st: Pc, face: stateAt(FACE_P, t), look: -4 },
  ].filter(ch => ch.st.x > -400 && ch.st.x < 1300);
  chars.sort((a, b) => a.st.lane - b.st.lane);
  const pos = {};
  for (const ch of chars) {
    const moving = Math.abs(ch.st.v) > 60;
    const wp = moving ? t * 15 : 0;
    const lean = ch.who === "y" && t > BUMP - 0.05 && t < BUMP + 0.3 ? -6 * Math.sin(Math.PI * ramp(t, BUMP - 0.05, BUMP + 0.3))
      : ch.who === "o" && t > BUMP - 0.05 && t < BUMP + 0.3 ? 6 * Math.sin(Math.PI * ramp(t, BUMP - 0.05, BUMP + 0.3)) : 0;
    const armOut = ch.who === "o" ? ramp(t, CLAP[0], CLAP[0] + 0.25) * (1 - ramp(t, CLAP[1] - 0.2, CLAP[1])) : 0;
    const fy = FEET + ch.st.lane * 30, s = 0.92 + ch.st.lane * 0.07;
    const r = blob(ctx, ch.who, ch.st.x, fy, s, ch.face, t, { walk: moving ? wp : 0, lean, armOut, armDir: 1, look: ch.look });
    pos[ch.who] = { x: ch.st.x, top: r.headTop, fy };
    if (ch.who === "y") {
      ctx.save();
      ctx.font = "900 38px InterBlk"; ctx.letterSpacing = "4px"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(225,215,245,0.85)";
      ctx.fillText("DU", ch.st.x, fy + 55);
      ctx.restore();
    }
  }
  if (pos.y && pos.o) { drawStars(ctx, pos.y.x, pos.y.top - 10, t, BUMP); drawStars(ctx, pos.o.x, pos.o.top - 10, t, BUMP + 0.05); }
  // Sprechblasen (Position über den Köpfen, gezeichnet ohne Zoom)
  const bubbleList = [];
  for (const [a, b, who, text, th] of BUBBLES) {
    if (t < a || t > b) continue;
    let x, y;
    if (who === "both") {
      const py = pos.y || { x: 450, top: 700 }, pp = pos.p || py;
      x = (py.x + pp.x) / 2; y = Math.min(py.top, pp.top) - 60;
    } else {
      const p = pos[who]; if (!p) continue;
      x = p.x; y = p.top - 52;
    }
    if (text === "Nein, du zuerst!") x -= 30;
    if (text === "Geh du!") x += 30;
    bubbleList.push([540 + (x - ax) * z, ZY + (y - ZY) * z - 10, text, th, a, b, who === "both"]);
  }
  ctx.restore();
  for (const [x, y, text, th, a, b, pink] of bubbleList) bubble(ctx, x, y, text, th, t, a, b, pink);

  // rosa Blitz beim neuen Passanten
  if (t > FLASH) {
    const f = 0.55 * (1 - ramp(t, FLASH, FLASH + 0.35)) + 0.22;
    ctx.fillStyle = `rgba(214,96,128,${f})`; ctx.fillRect(0, -OFF, W, H + 2 * OFF);
  }
  drawHUD(t);
  drawTitle(t);
  // kurzes Abblenden am Ende
  const fo = ramp(t, window.DURATION - 0.35, window.DURATION);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, -OFF, W, H + 2 * OFF); }
};

// Inhalt (Szene + Text) vertikal mittig: gleich viel Rand oben und unten
const OFF = 56;
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#17142b"; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(0, OFF);
  drawFrame(t);
  ctx.restore();
};

window.exportEvents = function () {
  const dodges = [];
  for (let i = 1; i < YOU.length; i++) if (YOU[i][2] !== YOU[i - 1][2] && YOU[i][0] < 6) dodges.push(YOU[i - 1][0]);
  const meterSteps = [];
  for (let i = 1; i < METER.length; i++) if (METER[i][1] !== METER[i - 1][1] && METER[i][0] < 20) meterSteps.push({ t: METER[i - 1][0], v: METER[i][1], up: METER[i][1] > METER[i - 1][1] });
  return {
    duration: window.DURATION, bubbles: BUBBLES.map(b => ({ t: b[0], who: b[2], thought: !!b[4] })),
    dodges, meter: meterSteps, bump: BUMP, flash: FLASH, pass: PASS, clap: CLAP,
    walkO: [0, 0.5], walkP: [15.75, 16.35], zoom: [0.45, 13.3, 16.35],
  };
};

window.setup = async function () {
  await Promise.all([document.fonts.load("900 40px InterBlk"), document.fonts.load("italic 900 40px InterBlk")]);
  buildStatic();
  return true;
};
