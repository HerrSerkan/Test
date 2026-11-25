// "Wenn die Lehrerin sagt: Sucht euch einen Partner!" – deutsche Version (Idee: @nkzwl1), ohne Sprecher, 14 s.
// Introvertiert / Omnivertiert / Extrovertiert mit sozialem Akku, Klassenzimmer.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 14.0;
const { ramp, clamp, lerp, back, stateAt, rr } = NB;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const TITLE_Y = 420, SUB_Y = 548, BAT_Y = 660, FEET = 1250, CAP_Y = 1335;
const X = [205, 515, 805], S = 0.85;
const NAMES = [["INTROVERTIERT", "#e8e4f2"], ["OMNIVERTIERT", "#f4b740"], ["EXTROVERTIERT", "#e8e4f2"]];
const PH = [0, 3.0, 5.5, 8.5, 11.0];
const SUBS = ["Gruppenarbeit…", "Alle haben schon einen Partner…", "Lehrerin: „Jetzt stellt es der Klasse vor!“", "Präsentation…", "Lehrerin: „Nächste Woche gleiche Partner!“"];
const CAPS = [
  [["OH NEIN."], ["*schaut sich um*"], ["ICH! ICH! ICH!"]],
  [["*tut so, als", "ob er liest*"], ["Team?"], ["Ich hab", "4 Partner!"]],
  [["…"], ["Du redest,", "ich klicke."], ["ENDLICH!!"]],
  [["*flüstert*", "Folie eins…"], ["Nächste", "Folie…"], ["UND NOCH", "WAS!!"]],
  [["NIEMALS."], ["Deal."], ["JAAA!!"]],
];
// Akku in Prozent über die Zeit
const BAT = [
  [[0, 76], [1.5, 55], [3.0, 54], [4.0, 42], [5.5, 42], [6.2, 12], [8.5, 12], [9.0, 4], [11.0, 4], [11.6, 1]],
  [[0, 66], [3.0, 66], [3.6, 62], [5.5, 62], [6.2, 50], [8.5, 50], [9.0, 38], [11.0, 38], [12.0, 45]],
  [[0, 76], [1.0, 96], [3.0, 96], [3.8, 100]],
];
const FACE = [
  [[0, "shock"], [1.5, "worried"], [3.0, "neutral"], [5.5, "shock"], [6.2, "worried"], [8.5, "tired"], [11.0, "shock"], [11.4, "worried"]],
  [[0, "neutral"], [0.8, "side"], [3.0, "smile"], [5.5, "calm"], [8.5, "neutral"], [11.0, "calm"]],
  [[0, "happy"], [3.0, "awe"], [3.5, "happy"], [5.5, "awe"], [6.0, "happy"], [8.5, "awe"], [11.0, "happy"]],
];
const phase = t => { let p = 0; PH.forEach((a, i) => { if (t >= a) p = i; }); return p; };
function batAt(K, t) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const k = NB.easeIO((t - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return lerp(K[i - 1][1], K[i][1], k); }
  return K[K.length - 1][1];
}

function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#15132a"); g.addColorStop(0.55, "#211d3e"); g.addColorStop(1, "#110f22");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Lichterkette
  ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2;
  ctx.beginPath(); for (let x = -20; x <= W + 20; x += 20) ctx.lineTo(x, 590 + Math.sin(x / W * Math.PI) * 16); ctx.stroke();
  for (let x = 20; x < W; x += 54) {
    const y = 592 + Math.sin(x / W * Math.PI) * 16, on = 0.55 + 0.45 * Math.sin(t * 3 + x);
    ctx.fillStyle = `rgba(255,224,150,${0.25 * on})`; ctx.beginPath(); ctx.arc(x, y + 6, 12, 0, 7); ctx.fill();
    ctx.fillStyle = `rgba(255,236,190,${0.6 + 0.4 * on})`; ctx.beginPath(); ctx.arc(x, y + 6, 4, 0, 7); ctx.fill();
  }
  // Tafel
  ctx.fillStyle = "#4a3428"; rr(150, 830, 780, 300, 14); ctx.fill();
  ctx.fillStyle = "#284a3c"; rr(166, 846, 748, 268, 8); ctx.fill();
  ctx.save(); ctx.font = "900 44px InterBlk"; ctx.letterSpacing = "6px"; ctx.fillStyle = "rgba(240,240,230,0.35)"; ctx.textAlign = "center";
  ctx.fillText("GRUPPENARBEIT", 540, 920);
  ctx.strokeStyle = "rgba(240,240,230,0.25)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(260, 1020); ctx.quadraticCurveTo(400, 960, 520, 1030); ctx.quadraticCurveTo(640, 1080, 800, 990); ctx.stroke();
  ctx.restore();
  // Stehlampe links
  const lamp = 0.6 + 0.4 * clamp(Math.sin(t * 1.3) * 3);
  const lg = ctx.createRadialGradient(70, 980, 10, 70, 980, 260); lg.addColorStop(0, `rgba(255,220,140,${0.28 * lamp})`); lg.addColorStop(1, "rgba(255,220,140,0)");
  ctx.fillStyle = lg; ctx.fillRect(0, 720, 340, 520);
  ctx.fillStyle = "#e9c46a"; ctx.beginPath(); ctx.moveTo(40, 960); ctx.lineTo(100, 960); ctx.lineTo(88, 925); ctx.lineTo(52, 925); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a3450"; ctx.fillRect(67, 960, 6, FEET - 960);
  // Boden
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(0, FEET - 6, W, H - FEET + 6);
}

function title(t) {
  ctx.save(); ctx.textAlign = "center";
  ctx.font = "900 44px InterBlk"; ctx.letterSpacing = "1px"; ctx.fillStyle = "#ffffff";
  ctx.fillText("WENN DIE LEHRERIN SAGT:", 540, TITLE_Y);
  ctx.font = "900 56px InterBlk"; ctx.fillText("„SUCHT EUCH EINEN PARTNER!“", 540, TITLE_Y + 72);
  const p = phase(t), a = ramp(t, PH[p], PH[p] + 0.25);
  ctx.globalAlpha = a; ctx.font = "800 30px InterBlk"; ctx.letterSpacing = "0px"; ctx.fillStyle = "#f4b740";
  ctx.fillText(SUBS[p], 540, SUB_Y + (1 - a) * 10);
  ctx.restore();
}

function battery(x, y, pct, name, ncol) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 22px InterBlk"; ctx.letterSpacing = "1px"; ctx.fillStyle = ncol; ctx.fillText(name, x, y - 46);
  const w = 130, h = 50;
  ctx.strokeStyle = "#f2eee8"; ctx.lineWidth = 5; rr(x - w / 2, y - h / 2, w, h, 9); ctx.stroke();
  ctx.fillStyle = "#f2eee8"; rr(x + w / 2 + 3, y - 10, 8, 20, 3); ctx.fill();
  const col = pct > 60 ? "#4cd964" : pct > 25 ? "#f4b740" : "#ff4d5e";
  const n = 5, segs = Math.ceil(pct / 20 - 0.001);
  for (let i = 0; i < n; i++) {
    const on = i < segs, last = i === segs - 1 && pct < 8;
    ctx.fillStyle = on ? col : "rgba(255,255,255,0.08)";
    if (last) ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(performanceT * 6));
    rr(x - w / 2 + 8 + i * 23.4, y - h / 2 + 8, 19, h - 16, 3); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.font = "900 30px InterBlk"; ctx.fillStyle = col; ctx.fillText(Math.round(pct) + "%", x, y + 52);
  ctx.restore();
}
let performanceT = 0;

function caption(i, lines, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const size = 27; ctx.font = `800 ${size}px InterBlk`;
  const w = Math.max(240, ...lines.map(l => ctx.measureText(l).width + 36)), h = lines.length * size * 1.18 + 26;
  ctx.fillStyle = "rgba(48,44,78,0.95)"; rr(X[i] - w / 2, CAP_Y - 10, w, h, 14); ctx.fill();
  ctx.fillStyle = "#f2eee8";
  lines.forEach((l, k) => ctx.fillText(l, X[i], CAP_Y - 10 + 13 + size * 0.62 + k * size * 1.18));
  ctx.restore();
}

function book(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#3d5ea8"; rr(-62, -46, 60, 84, 6); ctx.fill(); rr(2, -46, 60, 84, 6); ctx.fill();
  ctx.fillStyle = "#e9eefc"; rr(-54, -38, 50, 70, 3); ctx.fill(); rr(4, -38, 50, 70, 3); ctx.fill();
  ctx.strokeStyle = "rgba(60,80,140,0.5)"; ctx.lineWidth = 2;
  for (let k = 0; k < 5; k++) { for (const ox of [-48, 10]) { ctx.beginPath(); ctx.moveTo(ox, -26 + k * 12); ctx.lineTo(ox + 38, -26 + k * 12); ctx.stroke(); } }
  ctx.restore();
}
function laptop(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#c9ccd8"; rr(-60, -70, 120, 78, 6); ctx.fill();
  ctx.fillStyle = "#6fa8ff"; rr(-52, -62, 104, 62, 4); ctx.fill();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(-40, -50, 50, 6); ctx.fillRect(-40, -38, 70, 4); ctx.fillRect(-40, -30, 60, 4);
  ctx.fillStyle = "#a9adbb"; rr(-74, 8, 148, 12, 4); ctx.fill();
  ctx.restore();
}

window.renderFrame = function (t) {
  NB.ctx = ctx; performanceT = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bg(t); title(t);
  const p = phase(t);
  const pct = BAT.map(K => batAt(K, t));
  X.forEach((x, i) => battery(x, BAT_Y + 40, pct[i], NAMES[i][0], NAMES[i][1]));
  const jump = t > 0.2 && t < 3 ? Math.abs(Math.sin(t * 8)) * 22 : t > 5.5 && t < 6.6 ? Math.abs(Math.sin(t * 9)) * 26 : t > 11 ? Math.abs(Math.sin(t * 7)) * 22 : 0;
  const extroArms = p === 0 ? [175 - Math.abs(Math.sin(t * 8)) * 25, 165] : p === 1 ? [150 + Math.sin(t * 6) * 20, 10] : p === 2 ? [170, 170] : p === 3 ? [130 + Math.sin(t * 7) * 30, 20] : [170, 170];
  const omniArms = p === 1 ? [120 + Math.sin(t * 4) * 8, 8] : p === 2 ? [40, 8] : p === 4 ? [70, 8] : [10, 10];
  const reading = p === 1 || p === 3;
  const figs = [
    NB.blob(X[0], FEET, { s: S, t, face: stateAt(FACE[0], t), aR: reading ? 60 : 10, aL: reading ? 60 : 10, shiver: p === 2 || p === 4, sweat: p >= 2, side: p === 0 && t > 0.5 ? Math.sin(t * 3) : 0 }),
    NB.blob(X[1], FEET, { s: S, t, face: stateAt(FACE[1], t), aR: omniArms[0], aL: omniArms[1], side: p === 0 ? Math.sin(t * 2.4) : p === 1 ? -0.7 : 0 }),
    NB.blob(X[2], FEET - jump, { s: S, t, face: stateAt(FACE[2], t), aR: extroArms[0], aL: extroArms[1], lean: p === 3 ? Math.sin(t * 5) * 5 : 0 }),
  ];
  if (reading) book(X[0], FEET - 105);
  if (p === 2 || p === 3) laptop(X[1] + 10, FEET - 92);
  // Herzklopfen beim Introvertierten
  if (p >= 2) {
    const beat = Math.pow(Math.abs(Math.sin(t * 7)), 6);
    NB.heart(X[0] + 62, figs[0].headY - 40, 0.8 + beat * 0.35, 0.9);
  }
  // Alarm-Striche
  if ((t > 0 && t < 1.4) || (t > 5.5 && t < 6.4) || (t > 11 && t < 11.8)) {
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    for (const [dx, dy, ex, ey] of [[-50, -70, -66, -92], [0, -82, 0, -110], [50, -70, 66, -92]]) { ctx.beginPath(); ctx.moveTo(X[0] + dx, figs[0].headY + dy); ctx.lineTo(X[0] + ex, figs[0].headY + ey); ctx.stroke(); }
  }
  // Untertitel-Kästen pro Phase
  X.forEach((x, i) => caption(i, CAPS[p][i], ramp(t, PH[p] + 0.1 + i * 0.12, PH[p] + 0.3 + i * 0.12)));
};
window.exportEvents = function () {
  return { duration: window.DURATION, phases: PH, low: [6.2, 9.0, 11.6] };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  await document.fonts.load("600 50px InterSB");
  return { duration: window.DURATION };
};
