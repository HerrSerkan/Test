// "4 Typen von Introvertierten – welcher bist du?" (deutsche Version nach @nobodytoldme_1), ohne Sprecher.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 11.8;
const FEET = 1225, LABEL_Y = 1268, TITLE_X = 520, TITLE_Y = 1355;
const SWITCH = 8.0;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const { ramp, clamp, lerp, back, easeOut, easeIO, keys, stateAt, rr } = NB;

const FIG = [
  { x: 210, l: "S", col: "#26b5a8", name: "SOZIAL" },
  { x: 410, l: "N", col: "#8a6bff", name: "NACHDENKLICH" },
  { x: 610, l: "Ä", col: "#ff8a3d", name: "ÄNGSTLICH" },
  { x: 810, l: "Z", col: "#4cc96b", name: "ZURÜCKHALTEND" },
];
const SC = 0.82;
const NOTE1 = 0.6, NOTE2 = 2.0;
const FACES = [
  [[0, "neutral"], [1.0, "curious"], [2.3, "tired"], [SWITCH + 0.2, "happy"]],
  [[0, "zone"], [3.0, "shock"], [3.8, "neutral"], [SWITCH + 0.2, "happy"]],
  [[0, "neutral"], [2.2, "worried"], [SWITCH + 0.2, "happy"]],
  [[0, "neutral"], [5.8, "think"], [SWITCH + 0.2, "happy"]],
];
// Arme [t, aR, aL]
const ARMS = [
  [[0, 8, 8], [0.95, 8, 8], [1.15, 8, 150], [1.9, 8, 150], [2.2, 8, 8]],
  [[0, 8, 8]],
  [[0, 8, 8], [4.1, 8, 8], [4.3, 30, 30], [5.6, 30, 30], [5.9, 8, 8]],
  [[0, 8, 8], [6.7, 8, 8], [6.9, 150, 8], [7.9, 150, 8], [8.2, 8, 8]],
];
const SPEECH = [
  [1.05, 2.0, 0, ["WIE VIELE", "LEUTE?"]],
  [3.0, 4.0, 1, ["SORRY,", "WAS?"]],
  [4.2, 5.6, 2, ["UND WENN'S", "PEINLICH WIRD?"]],
  [5.8, 6.7, 3, ["…"]],
  [6.85, 7.95, 3, ["ICH ÜBERLEG'S", "MIR NOCH."]],
];
const FLY = [8.25, 9.0], BACK_T = [10.6, 11.35];

// ------------------------------------------------------------------ Zimmer
function room(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1180);
  g.addColorStop(0, "#1c1838"); g.addColorStop(1, "#3b3064");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1180);
  // Lichterkette
  ctx.strokeStyle = "#1a1530"; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = -20; x <= W + 20; x += 10) { const y = 300 + Math.sin(x / W * Math.PI * 3) * 18; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  const cols = ["#ffd56a", "#ff7a9a", "#7ad0ff", "#a6f07a"];
  for (let i = 0; i < 16; i++) {
    const x = 30 + i * 68, y = 306 + Math.sin(x / W * Math.PI * 3) * 18, on = 0.65 + 0.35 * Math.sin(t * 3 + i * 1.7);
    const gl = ctx.createRadialGradient(x, y, 1, x, y, 30); gl.addColorStop(0, cols[i % 4]); gl.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.35 * on; ctx.fillStyle = gl; ctx.fillRect(x - 30, y - 30, 60, 60); ctx.globalAlpha = 1;
    ctx.fillStyle = cols[i % 4]; ctx.beginPath(); ctx.ellipse(x, y + 6, 6, 9, 0, 0, 7); ctx.fill();
  }
  // Fenster mit Nacht und Mond
  const wx = 380, wy = 610, ww = 320, wh = 300;
  ctx.fillStyle = "#14102a"; rr(wx - 14, wy - 14, ww + 28, wh + 28, 8); ctx.fill();
  const sky = ctx.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, "#0e1230"); sky.addColorStop(1, "#2a2a5a");
  ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
  const R = NB.rng(4);
  for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * R()})`; ctx.fillRect(wx + R() * ww, wy + R() * wh * 0.6, 2, 2); }
  ctx.fillStyle = "#fff4d0"; ctx.beginPath(); ctx.arc(wx + 240, wy + 70, 30, 0, 7); ctx.fill();
  ctx.fillStyle = "#0e1230"; ctx.beginPath(); ctx.arc(wx + 254, wy + 60, 26, 0, 7); ctx.fill();
  ctx.fillStyle = "#1a1838"; for (let i = 0; i < 7; i++) { const bh = 40 + R() * 70; ctx.fillRect(wx + i * 48, wy + wh - bh, 44, bh); ctx.fillStyle = "#ffd56a"; for (let k = 0; k < 3; k++) if (R() < 0.6) ctx.fillRect(wx + i * 48 + 8 + k * 12, wy + wh - bh + 12 + (k % 2) * 14, 5, 7); ctx.fillStyle = "#1a1838"; }
  ctx.strokeStyle = "#14102a"; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
  // Stehlampe links
  const lg = ctx.createRadialGradient(110, 760, 10, 110, 860, 360); lg.addColorStop(0, "rgba(255,210,140,0.28)"); lg.addColorStop(1, "rgba(255,210,140,0)");
  ctx.fillStyle = lg; ctx.fillRect(0, 500, 500, 700);
  ctx.fillStyle = "#2a2440"; ctx.fillRect(106, 790, 8, 400);
  ctx.fillStyle = "#f2d9a8"; ctx.beginPath(); ctx.moveTo(60, 790); ctx.lineTo(160, 790); ctx.lineTo(140, 720); ctx.lineTo(80, 720); ctx.closePath(); ctx.fill();
  // Pflanze rechts
  ctx.fillStyle = "#3e8a52";
  for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(960, 1080); ctx.rotate(-1.2 + i * 0.4); ctx.beginPath(); ctx.ellipse(0, -60, 18, 60, 0, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = "#b5653a"; rr(925, 1070, 70, 90, 10); ctx.fill();
  // Boden
  const fl = ctx.createLinearGradient(0, 1160, 0, H); fl.addColorStop(0, "#6a4a32"); fl.addColorStop(1, "#2e2016");
  ctx.fillStyle = fl; ctx.fillRect(0, 1160, W, H - 1160);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, 1160, W, 14);
  ctx.fillStyle = "#3a3060"; ctx.beginPath(); ctx.ellipse(520, 1240, 470, 46, 0, 0, 7); ctx.fill();
}
function notif(y, txt, t0, t) {
  const p = ramp(t, t0, t0 + 0.3) * (1 - ramp(t, SWITCH - 0.3, SWITCH));
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(0, (1 - easeOut(p)) * -40);
  ctx.fillStyle = "rgba(255,255,255,0.95)"; rr(190, y - 40, 660, 80, 20); ctx.fill();
  ctx.fillStyle = "#3fc35a"; rr(214, y - 22, 44, 44, 12); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(236, y - 2, 13, 10, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#8a8a8a"; ctx.font = "900 15px InterBlk"; ctx.textBaseline = "middle"; ctx.fillText("GRUPPENCHAT", 276, y - 18); ctx.fillText("jetzt", 790, y - 18);
  ctx.fillStyle = "#1a1a1a"; ctx.font = "900 28px InterBlk"; ctx.fillText(txt, 276, y + 12);
  ctx.restore();
}
function thoughtCloud(x, y, t) {
  ctx.save(); ctx.globalAlpha = 1 - ramp(t, 2.9, 3.1) + ramp(t, 3.9, 4.2);
  for (const [dx, dy, r] of [[-30, 10, 26], [0, -4, 32], [32, 8, 26], [8, 22, 24]]) { ctx.fillStyle = "#f4f0ff"; ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x + 40, y + 52, 9, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x + 54, y + 72, 6, 0, 7); ctx.fill();
  ctx.fillStyle = "#b08cf0"; ctx.beginPath(); ctx.arc(x + 2, y + 8, 16, 0, 7); ctx.fill();
  ctx.strokeStyle = "#7a5ad0"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x + 2, y + 8, 30, 8, -0.3 + Math.sin(t) * 0.1, 0, 7); ctx.stroke();
  ctx.restore();
}
function battery(x, y, t) {
  const p = ramp(t, 2.25, 2.5) * (1 - ramp(t, SWITCH - 0.3, SWITCH));
  if (p <= 0) return;
  const lvl = lerp(1, 0.15, ramp(t, 2.4, 3.4));
  ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
  rr(x, y, 64, 32, 6); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.fillRect(x + 64, y + 10, 6, 12);
  ctx.fillStyle = lvl > 0.5 ? "#4cc96b" : lvl > 0.25 ? "#f4c430" : "#ef4b3f"; rr(x + 5, y + 5, 54 * lvl, 22, 4); ctx.fill();
  ctx.restore();
}

window.renderFrame = function (t) {
  NB.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  room(t);
  notif(440, "PARTY HEUTE ABEND? 🎉", NOTE1, t);
  notif(530, "SO 40 LEUTE!", NOTE2, t);
  const heads = [];
  FIG.forEach((f, i) => {
    const [aR, aL] = keys(ARMS[i], t);
    // Buchstaben fliegen zur Kugel und zurück
    const fly = ramp(t, FLY[0] + i * 0.08, FLY[1] + i * 0.08) * (1 - ramp(t, BACK_T[0] + i * 0.08, BACK_T[1] + i * 0.08));
    const r = NB.blob(f.x, FEET, { s: SC, aR, aL, face: stateAt(FACES[i], t), t, sweat: i === 2 && t > 4.2 && t < 5.8,
      badge: { l: f.l, col: f.col, s: 1 - clamp(fly * 3) } });
    heads.push(r);
    NB.label(f.name, f.x, LABEL_Y, 19);
  });
  thoughtCloud(FIG[1].x - 60, heads[1].headY - 70, t);
  battery(FIG[0].x + 40, heads[0].headY - 10, t);
  for (const [a, b, i, lines] of SPEECH) {
    const p = ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.15, b));
    NB.bubble(lines, FIG[i].x + (i < 2 ? -10 : 10), heads[i].headY - 100, FIG[i].x, heads[i].headY - 30, p, 32);
  }
  // Buchstaben-Kugel: "Viele sind eine Mischung"
  const ballX = 540, ballY = 470;
  FIG.forEach((f, i) => {
    const a = ramp(t, FLY[0] + i * 0.08, FLY[1] + i * 0.08), b = ramp(t, BACK_T[0] + i * 0.08, BACK_T[1] + i * 0.08);
    if (a <= 0 || b >= 1) return;
    const sx = f.x, sy = FEET - 14 * SC - 220 * SC * 0.32;
    const k = easeIO(a) * (1 - easeIO(b));
    const spin = t * 3 + i * Math.PI / 2;
    const tx = ballX + Math.cos(spin) * 34 * k, ty = ballY + Math.sin(spin) * 34 * k;
    const x = lerp(sx, tx, k), y = lerp(sy, ty, k) - Math.sin(k * Math.PI) * 120;
    ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "900 30px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(f.l, x, y + 2);
  });
  const bg = ramp(t, FLY[1], FLY[1] + 0.3) * (1 - ramp(t, BACK_T[0] - 0.2, BACK_T[0]));
  if (bg > 0) { const gl = ctx.createRadialGradient(ballX, ballY, 5, ballX, ballY, 140); gl.addColorStop(0, `rgba(255,240,180,${0.45 * bg})`); gl.addColorStop(1, "rgba(255,240,180,0)"); ctx.fillStyle = gl; ctx.fillRect(ballX - 140, ballY - 140, 280, 280); }
  NB.title(t, SWITCH, [["4 TYPEN VON INTROVERTIERTEN", 52, "#ffffff"], ["WELCHER BIST DU?", 66, "#f4b740"]],
    [["VIELE INTROVERTIERTE", 56, "#ffffff"], ["SIND EINE MISCHUNG.", 66, "#f4b740"]], TITLE_X, TITLE_Y);
};
window.exportEvents = function () {
  return { duration: window.DURATION, notes: [NOTE1, NOTE2], speech: SPEECH.map(s => s[0]), battery: 2.3, sweat: 4.2,
    fly: FLY, back: BACK_T, switch: SWITCH };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 50px InterBlk"), document.fonts.load("48px 'Noto Color Emoji'")]);
  return true;
};
