// "Gleiche Spinne. 3 verschiedene Gehirne" – deutsche Version (Idee: @nkzwl1), ohne Sprecher, 14 s.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 14.0;
const { ramp, clamp, lerp, back, stateAt, rr, keys } = NB;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const TITLE_Y = 450, CEIL = 540, FEET = 1340, LABEL_Y = 1405;
const X = [215, 520, 815], S = 0.82;
const CLACK = 5.5, WHERE = [5.9, 7.7], HEAD = 8.0, SCREAM = 9.0, SAVE = 9.6, BIG = 11.4, AGAIN = 12.6;
const SPEECH = [
  [0.4, 1.6, 0, ["äh…"]],
  [0.5, 1.8, 1, ["hiii 😊"]],
  [0.6, 1.9, 2, ["NÖ."]],
  [2.0, 3.6, 0, ["ich mach", "das."]],
  [2.2, 3.8, 1, ["so süß!!"]],
  [3.8, 5.4, 2, ["RAUS", "DAMIT!"]],
  [6.4, 7.7, 1, ["Steve??"]],
  [7.0, 8.4, 2, ["sie ist jetzt", "in meinem bett."]],
  [SCREAM + 0.1, SAVE + 0.9, 1, ["STEVE!! 😍"]],
  [SAVE + 0.3, 11.2, 0, ["puh."]],
  [10.2, BIG - 0.1, 2, ["ich zieh aus."]],
];
const FACE = [
  [[0, "curious"], [2.0, "smug"], [CLACK, "shock"], [6.0, "worried"], [SAVE, "calm"], [11.2, "neutral"]],
  [[0, "happy"], [2.2, "awe"], [3.8, "smile"], [5.9, "worried"], [6.4, "curious"], [SCREAM, "awe"], [SAVE, "love"]],
  [[0, "shock"], [2.0, "annoyed"], [3.8, "worried"], [5.9, "shock"], [7.0, "worried"], [HEAD, "zone"], [SCREAM, "shock"], [SAVE, "worried"], [BIG, "shock"]],
];
// Spinne: [t, x, y]; null-Phasen = versteckt
const SPIDER = [[0, 380, CEIL + 10], [1.5, 380, 880], [2.6, 640, 900], [3.6, 700, 860], [4.6, 650, 900], [5.3, 600, 1180]];

function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, FEET);
  g.addColorStop(0, "#1c1838"); g.addColorStop(0.35, "#3b3268"); g.addColorStop(1, "#4a3f7c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, FEET);
  // Fenster (Nacht) und Bild
  ctx.fillStyle = "#2a2450"; rr(760, 600, 130, 150, 8); ctx.fill();
  ctx.fillStyle = "#161436"; rr(770, 610, 110, 130, 4); ctx.fill();
  ctx.fillStyle = "#2a2450"; ctx.fillRect(822, 610, 6, 130); ctx.fillRect(770, 672, 110, 6);
  ctx.fillStyle = "#f2eee0"; ctx.beginPath(); ctx.arc(855, 640, 10, 0, 7); ctx.fill();
  ctx.fillStyle = "#5a4d8e"; rr(90, 610, 110, 90, 6); ctx.fill();
  ctx.fillStyle = "#7d70b4"; rr(100, 620, 90, 70, 3); ctx.fill();
  ctx.fillStyle = "#9c90d0"; ctx.beginPath(); ctx.moveTo(105, 685); ctx.lineTo(140, 645); ctx.lineTo(165, 670); ctx.lineTo(185, 655); ctx.lineTo(185, 685); ctx.fill();
  // Boden
  ctx.fillStyle = "#2a2348"; ctx.fillRect(0, FEET - 40, W, H - FEET + 40);
  ctx.fillStyle = "#3a3160"; ctx.fillRect(0, FEET - 44, W, 6);
  ctx.fillStyle = "#1e1938"; ctx.fillRect(0, FEET + 140, W, H);
  // Decke / Linie, an der die Spinne hängt
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(0, CEIL - 6, W, 4);
}

function spider(x, y, s, t, thread) {
  if (thread !== null) { ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(thread, CEIL - 4); ctx.lineTo(x, y - 20 * s); ctx.stroke(); }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#1a1626"; ctx.lineWidth = 6; ctx.lineCap = "round";
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
    const wig = Math.sin(t * 14 + i) * 4, a = -0.6 + i * 0.4;
    ctx.beginPath(); ctx.moveTo(sd * 14, -4 + i * 6);
    ctx.lineTo(sd * (40 + wig), -26 + i * 16 + a * 10); ctx.lineTo(sd * (58 + wig), 6 + i * 14); ctx.stroke();
  }
  ctx.fillStyle = "#231d33"; ctx.beginPath(); ctx.ellipse(0, 4, 30, 28, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffffff"; for (const ex of [-11, 11]) { ctx.beginPath(); ctx.arc(ex, -2, 9, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#1a1626"; for (const ex of [-10, 12]) { ctx.beginPath(); ctx.arc(ex, 0, 4.5, 0, 7); ctx.fill(); }
  ctx.restore();
}

function title(t) {
  ctx.save(); ctx.textAlign = "center";
  ctx.font = "900 70px InterBlk"; ctx.letterSpacing = "2px"; ctx.fillStyle = "#ffffff"; ctx.fillText("GLEICHE SPINNE.", 540, TITLE_Y);
  ctx.font = "600 32px InterSB"; ctx.letterSpacing = "0px"; ctx.fillStyle = "rgba(230,225,245,0.8)"; ctx.fillText("3 verschiedene Gehirne:", 540, TITLE_Y + 50);
  ctx.restore();
}
function label(i, top, sub, col) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 26px InterBlk"; ctx.fillStyle = col; ctx.fillText(top, X[i], LABEL_Y);
  ctx.font = "600 23px InterSB"; ctx.fillStyle = "rgba(235,230,245,0.75)"; ctx.fillText(sub, X[i], LABEL_Y + 36);
  ctx.restore();
}
function glass(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "rgba(200,225,255,0.35)"; ctx.strokeStyle = "rgba(230,240,255,0.9)"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-34, -40); ctx.lineTo(34, -40); ctx.lineTo(28, 40); ctx.lineTo(-28, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function slipper(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#ff7aa8"; rr(-18, -62, 36, 110, 18); ctx.fill();
  ctx.fillStyle = "#ffb3cc"; rr(-18, -62, 36, 44, 16); ctx.fill();
  ctx.restore();
}
function chair(x) {
  ctx.fillStyle = "#8a5a36"; rr(x - 90, FEET - 120, 180, 22, 6); ctx.fill();
  ctx.fillRect(x - 80, FEET - 100, 14, 100); ctx.fillRect(x + 66, FEET - 100, 14, 100);
  rr(x + 66, FEET - 330, 16, 220, 6); ctx.fill();
}

window.renderFrame = function (t) {
  NB.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bg(t); title(t);
  chair(X[2]);
  const holdGlass = t > 2.0 && t < CLACK;
  const slam = ramp(t, CLACK - 0.15, CLACK);
  const figs = [
    NB.blob(X[0], FEET, { s: S, t, face: stateAt(FACE[0], t), aR: holdGlass ? 150 : t >= CLACK && t < 6.5 ? 60 : 10, aL: 10, side: t > 6 && t < 8 ? Math.sin(t * 3) : 0 }),
    NB.blob(X[1], FEET, { s: S, t, face: stateAt(FACE[1], t), aR: t > SAVE ? 40 : t < 2 ? 160 : 10, aL: t > SAVE ? 40 : t < 2 ? 160 : 10, side: t < 2 ? -0.6 : t > 6 && t < 8 ? Math.sin(t * 2.5) : 0 }),
    NB.blob(X[2] - 10, FEET - 80, { s: S, t, sit: true, face: stateAt(FACE[2], t), aR: t > 2 && t < HEAD ? 165 : t >= SCREAM ? 166 : 10, aL: t >= SCREAM || t < 2 ? 166 : 10, armLenL: 82, armLenR: t > 2 && t < HEAD ? 105 : 82, shiver: t < 2 || t > SCREAM, sweat: t > 5.9 }),
  ];
  // Requisiten
  if (holdGlass) glass(figs[0].handR[0], figs[0].handR[1] - 30, Math.PI);
  else if (t >= CLACK - 0.15) glass(lerp(figs[0].handR ? figs[0].handR[0] : X[0] + 90, 330, slam), lerp(FEET - 250, FEET - 40, slam), Math.PI);
  if (t > 2 && t < HEAD) slipper(figs[2].handR[0], figs[2].handR[1] - 40, 0.3 + Math.sin(t * 6) * 0.25);
  // Spinne
  if (t < CLACK - 0.2) {
    const [sx, sy] = keys(SPIDER.map(k => [k[0], k[1], k[2]]), t);
    spider(sx, sy, 0.85, t, t < 1.5 ? 380 : lerp(380, sx, 0.7));
  } else if (t >= HEAD && t < SAVE) {
    const drop = back(ramp(t, HEAD, HEAD + 0.3));
    const hx = figs[2].headX, hy = figs[2].headY - 56;
    spider(hx + (t > SCREAM ? Math.sin(t * 40) * 6 : 0), lerp(CEIL, hy, drop), 0.75, t, t < HEAD + 0.3 ? hx : null);
  } else if (t >= SAVE) {
    // gerettet: sitzt in den Händen der Mitte
    const hx = X[1], hy = FEET - 150 - Math.abs(Math.sin(t * 3)) * 4;
    spider(hx, hy, 0.6, t, null);
    for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; NB.heart(hx - 40 + i * 40, hy - 70 - u * 120, 0.8, Math.sin(u * Math.PI)); }
  }
  // zweite Spinne kommt am Ende über dem Ängstlichen herunter
  if (t > AGAIN) spider(X[2] + 40, lerp(CEIL - 40, CEIL + 120, NB.easeOut(ramp(t, AGAIN, AGAIN + 1.2))), 0.7, t, X[2] + 40);
  // "*klack*"
  const cl = ramp(t, CLACK, CLACK + 0.1) * (1 - ramp(t, CLACK + 0.6, CLACK + 0.8));
  if (cl > 0) { ctx.save(); ctx.globalAlpha = cl; ctx.font = "900 34px InterBlk"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.translate(250, FEET - 160); ctx.rotate(-0.12); ctx.fillText("*klack*", 0, 0); ctx.restore(); }
  // "…wo ist sie hin?"
  const wh = ramp(t, WHERE[0], WHERE[0] + 0.25) * (1 - ramp(t, WHERE[1] - 0.2, WHERE[1]));
  if (wh > 0) { ctx.save(); ctx.globalAlpha = wh; ctx.font = "900 54px InterBlk"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.fillText("…wo ist sie hin?", 540, 680); ctx.restore(); }
  // "AAAAAA!!"
  const sc = ramp(t, SCREAM, SCREAM + 0.08) * (1 - ramp(t, SAVE + 0.2, SAVE + 0.4));
  if (sc > 0) {
    ctx.save(); ctx.translate(560 + Math.sin(t * 60) * 5, 690 + Math.cos(t * 55) * 4); const k = back(ramp(t, SCREAM, SCREAM + 0.2)); ctx.scale(k, k);
    ctx.font = "900 92px InterBlk"; ctx.textAlign = "center"; ctx.lineWidth = 12; ctx.strokeStyle = "#ffffff"; ctx.strokeText("AAAAAA!!", 0, 0);
    ctx.fillStyle = "#ff4d6d"; ctx.fillText("AAAAAA!!", 0, 0); ctx.restore();
  }
  label(0, "DIE MEISTEN", "(normal)", "#e8e4f2");
  label(1, "RETTET SIE", "(jede Spinne)", "#7fe08a");
  label(2, "PANIK", "(Arachnophobie)", "#ff6b8a");
  for (const [a, b, who, lines] of SPEECH) {
    const p = ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.15, b));
    const f = figs[who];
    NB.bubble(lines, X[who], f.headY - 92, f.headX, f.headY - 48, p, 26);
  }
  const bp = ramp(t, BIG, BIG + 0.3);
  if (bp > 0) {
    ctx.save(); ctx.translate(Math.sin(t * 30) * 2, 0);
    NB.bubble(["WIE SOLL ICH JETZT", "SCHLAFEN?!"], 640, 840, figs[2].headX, figs[2].headY - 60, bp, 40);
    ctx.restore();
  }
};
window.exportEvents = function () {
  return { duration: window.DURATION, speech: SPEECH.map(s => s[0]), clack: CLACK, where: WHERE[0], head: HEAD, scream: SCREAM, save: SAVE, big: BIG, again: AGAIN };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  await document.fonts.load("600 50px InterSB");
  return { duration: window.DURATION };
};
