// "Bekommst du Gänsehaut bei Musik?" (deutsche Version nach @nobodytoldme_1), ohne Sprecher.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 11.8;
const SEAT = 1185, LABEL_Y = 1250, TITLE_X = 520, TITLE_Y = 1340;
const CHORUS = 5.5, SWITCH = 9.0;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const { ramp, clamp, lerp, back, easeOut, easeIO, keys, stateAt, rr } = NB;

const LX = 420, RX = 640;
const FACE_L = [[0, "calm"], [3.6, "hope"], [CHORUS, "awe"], [8.0, "bliss"], [9.6, "calm"]];
const FACE_R = [[0, "neutral"], [6.8, "curious"], [7.9, "neutral"]];
const SPEECH = [[6.9, 7.9, "r", ["IST DIR", "KALT?"]], [8.0, 9.0, "l", ["DER", "REFRAIN."]]];

function sky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1000);
  g.addColorStop(0, "#2a1f5e"); g.addColorStop(0.45, "#7a3f8a"); g.addColorStop(0.75, "#e0607a"); g.addColorStop(1, "#ffb366");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1000);
  const R = NB.rng(2);
  for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.4 * R()})`; ctx.fillRect(R() * W, R() * 420, 2, 2); }
  // Vögel
  ctx.strokeStyle = "rgba(60,30,60,0.6)"; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) { const x = (200 + i * 90 + t * 30) % 1200 - 60, y = 470 + i * 26; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.quadraticCurveTo(x - 6, y - 8, x, y); ctx.quadraticCurveTo(x + 6, y - 8, x + 12, y); ctx.stroke(); }
  // Lichtstrahlen beim Refrain
  const rays = ramp(t, CHORUS - 0.2, CHORUS + 0.5) * (1 - ramp(t, SWITCH + 0.6, SWITCH + 1.6));
  if (rays > 0) {
    ctx.save(); ctx.translate(540, 990); ctx.globalAlpha = rays * 0.5;
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI + (i + 0.5) / 12 * Math.PI + Math.sin(t * 0.6) * 0.04;
      ctx.fillStyle = i % 2 ? "rgba(255,240,200,0.35)" : "rgba(255,220,160,0.2)";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.08) * 1400, Math.sin(a - 0.08) * 1400); ctx.lineTo(Math.cos(a + 0.08) * 1400, Math.sin(a + 0.08) * 1400); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // Sonne
  const sg = ctx.createRadialGradient(540, 990, 20, 540, 990, 380); sg.addColorStop(0, "rgba(255,230,160,0.8)"); sg.addColorStop(1, "rgba(255,230,160,0)");
  ctx.fillStyle = sg; ctx.fillRect(160, 610, 760, 760);
  ctx.fillStyle = "#ffe7a0"; ctx.beginPath(); ctx.arc(540, 1000, 120, Math.PI, 0); ctx.fill();
  // Hügel
  ctx.fillStyle = "#4a2a5a";
  ctx.beginPath(); ctx.moveTo(0, 1000); for (const [x, y] of [[0, 950], [150, 925], [300, 960], [420, 990], [680, 985], [820, 930], [960, 945], [1080, 920]]) ctx.lineTo(x, y); ctx.lineTo(W, 1000); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a1f4a"; for (const x of [90, 130, 880, 930, 970]) { ctx.beginPath(); ctx.moveTo(x - 14, 990); ctx.lineTo(x, 930 - (x % 3) * 8); ctx.lineTo(x + 14, 990); ctx.fill(); }
  // See
  const lk = ctx.createLinearGradient(0, 1000, 0, H); lk.addColorStop(0, "#8a4a8a"); lk.addColorStop(0.4, "#4a2f6a"); lk.addColorStop(1, "#22183a");
  ctx.fillStyle = lk; ctx.fillRect(0, 1000, W, H - 1000);
  for (let i = 0; i < 14; i++) { const y = 1010 + i * 22 + i * i * 2, w = 260 - i * 12 + Math.sin(t * 2 + i) * 20; ctx.fillStyle = `rgba(255,220,160,${0.5 - i * 0.03})`; ctx.fillRect(540 - w / 2, y, w, 4); }
}
function pier() {
  // Steg aus der Mitte nach unten (Perspektive)
  ctx.fillStyle = "#7a4e2c"; ctx.beginPath(); ctx.moveTo(250, 1160); ctx.lineTo(830, 1160); ctx.lineTo(1180, H); ctx.lineTo(-100, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(40,20,10,0.45)"; ctx.lineWidth = 3;
  let y = 1160, h = 16;
  while (y < H) { const k = (y - 1160) / (H - 1160); ctx.beginPath(); ctx.moveTo(lerp(250, -100, k), y); ctx.lineTo(lerp(830, 1180, k), y); ctx.stroke(); y += h; h *= 1.13; }
  for (const x0 of [0.25, 0.5, 0.75]) { ctx.beginPath(); ctx.moveTo(lerp(250, 830, x0), 1160); ctx.lineTo(lerp(-100, 1180, x0), H); ctx.stroke(); }
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(250, 1150, 580, 14);
  for (const x of [230, 840]) { ctx.fillStyle = "#4a2e18"; rr(x - 12, 1090, 24, 90, 6); ctx.fill(); }
}
function notes(t, x, y, gold, seed) {
  for (let i = 0; i < 4; i++) {
    const u = ((t * 0.45 + i / 4 + seed) % 1);
    const a = Math.sin(u * Math.PI);
    NB.note(x + Math.sin(u * 6 + i) * 30 + (i - 1.5) * 20, y - u * 260, a * 0.9, gold ? "#ffd56a" : "#f6e7d8", gold ? 1.3 : 1);
  }
}

window.renderFrame = function (t) {
  NB.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  sky(t); pier();
  const gold = t > CHORUS && t < SWITCH + 0.5;
  const goose = ramp(t, CHORUS + 0.2, CHORUS + 0.6) * (1 - ramp(t, 8.6, 9.2));
  const L = NB.blob(LX, SEAT, { sit: true, face: stateAt(FACE_L, t), t, aR: 8, aL: goose > 0.3 ? 40 : 8, goose, shiver: goose > 0.3, earbuds: true });
  const R = NB.blob(RX, SEAT, { sit: true, face: stateAt(FACE_R, t), side: t > 6.8 && t < 7.9 ? -1 : 0.6, t, aR: 22, aL: 8, earbuds: true });
  // Kopfhörer-Kabel
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3;
  const lx = LX + 54, rx = RX - 54, ey = L.headY + 70;
  ctx.beginPath(); ctx.moveTo(lx, ey); ctx.quadraticCurveTo((lx + rx) / 2, ey + 90, rx, ey); ctx.stroke();
  const ph = R.handR;
  if (ph) {
    ctx.save(); ctx.translate(ph[0] - 6, ph[1] - 20); ctx.rotate(-0.25);
    ctx.fillStyle = "#2a2440"; rr(-17, -30, 34, 60, 7); ctx.fill(); ctx.fillStyle = "#8a6bff"; rr(-13, -25, 26, 50, 5); ctx.fill(); ctx.restore();
  }
  if (goose > 0.3) { ctx.strokeStyle = `rgba(255,255,255,${goose * 0.8})`; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(LX + s * 92, SEAT - 120); ctx.lineTo(LX + s * 100, SEAT - 108); ctx.lineTo(LX + s * 92, SEAT - 96); ctx.lineTo(LX + s * 100, SEAT - 84); ctx.stroke(); } }
  notes(t, LX - 20, L.headY - 30, gold, 0);
  notes(t, RX + 20, R.headY - 30, false, 0.5);
  NB.label("GÄNSEHAUT", LX, LABEL_Y, 22); NB.label("KEINE GÄNSEHAUT", RX + 40, LABEL_Y, 22);
  for (const [a, b, who, lines] of SPEECH) {
    const p = ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.15, b));
    const f = who === "l" ? L : R, x = who === "l" ? LX - 30 : RX + 40;
    NB.bubble(lines, x, f.headY - 110, who === "l" ? LX : RX, f.headY - 30, p, 32);
  }
  NB.title(t, SWITCH, [["BEKOMMST DU GÄNSEHAUT", 54, "#ffffff"], ["BEI MUSIK?", 74, "#f4b740"]],
    [["DAS NENNT MAN", 48, "#ffffff"], ["FRISSON.", 78, "#f4b740"], ["NICHT JEDER HAT DAS.", 40, "#ffffff"]], TITLE_X, TITLE_Y);
};
window.exportEvents = function () {
  return { duration: window.DURATION, chorus: CHORUS, goose: [CHORUS + 0.2, 8.6], speech: SPEECH.map(s => s[0]), switch: SWITCH };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  return true;
};
