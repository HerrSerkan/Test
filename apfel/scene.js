// "Gleiche Vorstellung. 3 verschiedene Köpfe" – deutsche Version (Idee: @nkzwl1), ohne Sprecher, 14 s.
// Stell dir einen roten Apfel vor: normales Kopfkino / Aphantasie / Hyperphantasie.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 14.0;
const { ramp, clamp, lerp, back, easeOut, stateAt, rr } = NB;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

// Inhalt vertikal zentriert (Titel 430 … Schilder 1470)
const TITLE_Y = 430, CARD_Y = 560, FEET = 1330, LABEL_Y = 1395;
const X = [205, 515, 805], S = 0.85;
const CLOUD_IN = 0.45;
const SPEECH = [
  [1.5, 2.9, 0, ["okay,", "ein apfel."], 26],
  [3.0, 4.6, 1, ["moment…", "ihr SEHT ihn?"], 26],
  [4.7, 6.3, 2, ["ER HAT", "WASSERTROPFEN!"], 26],
  [6.4, 7.9, 2, ["jetzt dreht", "er sich ↻"], 26],
  [8.0, 10.2, 0, ["SO genau", "siehst du das?!"], 26],
];
const BIG = 10.4;
const FACE = [
  [[0, "smile"], [1.4, "calm"], [3.2, "curious"], [4.8, "hope"], [8.0, "shock"], [10.4, "worried"]],
  [[0, "neutral"], [0.9, "squint"], [2.9, "shock"], [4.7, "worried"], [6.4, "annoyed"], [8.0, "curious"], [10.4, "shock"]],
  [[0, "smile"], [0.6, "awe"], [2.0, "happy"], [3.0, "smug"], [4.6, "awe"], [6.3, "happy"], [8.0, "smug"], [10.4, "happy"]],
];

function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#14122a"); g.addColorStop(0.5, "#1d1a3a"); g.addColorStop(1, "#0f0d20");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // drei Lichtkegel in den Farben der Typen
  const cols = ["rgba(150,150,190,", "rgba(80,140,230,", "rgba(230,80,120,"];
  X.forEach((x, i) => {
    const lg = ctx.createLinearGradient(0, 300, 0, FEET + 40);
    lg.addColorStop(0, cols[i] + "0)"); lg.addColorStop(1, cols[i] + "0.16)");
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(x - 60, 300); ctx.lineTo(x + 60, 300); ctx.lineTo(x + 160, FEET + 30); ctx.lineTo(x - 160, FEET + 30); ctx.closePath(); ctx.fill();
  });
  // Boden
  ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(0, FEET - 10, W, 4);
  const R = NB.rng(3);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.12 * R()})`; ctx.beginPath(); ctx.arc(R() * W, R() * H, 1.5, 0, 7); ctx.fill(); }
}

function star(x, y, r, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#ffffff"; ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr2 = i % 2 ? r * 0.28 : r; ctx.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// Apfel: detail 0 = flach, 1 = mit Licht, Tropfen, Glanz; spin = Drehwinkel
function apple(x, y, r, detail, spin, t) {
  if (!(r > 0.5)) return;
  const sx = detail ? Math.max(0.1, Math.abs(Math.cos(spin))) : 1;
  ctx.save(); ctx.translate(x, y);
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.beginPath(); ctx.ellipse(0, r * 1.02, r * 0.85 * Math.max(sx, 0.5), r * 0.12, 0, 0, 7); ctx.fill();
  ctx.scale(sx, 1);
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.72);
    ctx.bezierCurveTo(r * 0.5, -r * 1.05, r * 1.12, -r * 0.7, r * 1.0, -r * 0.05);
    ctx.bezierCurveTo(r * 0.95, r * 0.6, r * 0.5, r * 1.02, r * 0.22, r * 0.95);
    ctx.quadraticCurveTo(0, r * 0.88, -r * 0.22, r * 0.95);
    ctx.bezierCurveTo(-r * 0.5, r * 1.02, -r * 0.95, r * 0.6, -r * 1.0, -r * 0.05);
    ctx.bezierCurveTo(-r * 1.12, -r * 0.7, -r * 0.5, -r * 1.05, 0, -r * 0.72);
    ctx.closePath();
  };
  // Stiel + Blatt
  ctx.strokeStyle = "#6b3e1e"; ctx.lineWidth = r * 0.09; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -r * 0.68); ctx.quadraticCurveTo(r * 0.05, -r * 1.0, r * 0.14, -r * 1.12); ctx.stroke();
  ctx.fillStyle = detail ? "#3fa648" : "#4caf50";
  ctx.beginPath(); ctx.moveTo(r * 0.1, -r * 0.92); ctx.quadraticCurveTo(r * 0.45, -r * 1.25, r * 0.7, -r * 1.02); ctx.quadraticCurveTo(r * 0.4, -r * 0.82, r * 0.1, -r * 0.92); ctx.fill();
  if (detail) { ctx.strokeStyle = "#2b7a33"; ctx.lineWidth = r * 0.025; ctx.beginPath(); ctx.moveTo(r * 0.12, -r * 0.92); ctx.lineTo(r * 0.62, -r * 1.02); ctx.stroke(); }
  body();
  if (detail) {
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.15);
    g.addColorStop(0, "#ff5a4f"); g.addColorStop(0.55, "#d8231d"); g.addColorStop(1, "#7d0d10");
    ctx.fillStyle = g;
  } else ctx.fillStyle = "#e5322b";
  ctx.fill();
  if (detail) {
    ctx.save(); body(); ctx.clip();
    ctx.strokeStyle = "rgba(255,200,120,0.18)"; ctx.lineWidth = r * 0.03;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.22, -r * 0.7); ctx.quadraticCurveTo(i * r * 0.3, 0, i * r * 0.2, r * 0.9); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.beginPath(); ctx.ellipse(-r * 0.45, -r * 0.35, r * 0.13, r * 0.26, 0.5, 0, 7); ctx.fill();
    // Wassertropfen
    const R = NB.rng(11);
    for (let i = 0; i < 9; i++) {
      const dx = (R() - 0.5) * r * 1.4, dy = (R() - 0.4) * r * 1.2, dr = r * (0.04 + 0.05 * R());
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.ellipse(dx, dy, dr, dr * 1.3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.beginPath(); ctx.arc(dx - dr * 0.35, dy - dr * 0.4, dr * 0.35, 0, 7); ctx.fill();
    }
    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(-r * 0.45, -r * 0.3, r * 0.1, r * 0.18, 0.5, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// Gedankenwolke mit Punkten zum Kopf
function cloud(x, y, w, h, p, hx, hy) {
  if (p <= 0) return;
  ctx.save();
  const s = Math.max(0.01, back(p));
  ctx.globalAlpha = clamp(p * 2);
  ctx.fillStyle = "#f3eee6";
  for (let i = 0; i < 3; i++) {
    const k = (i + 1) / 4, r = 8 + i * 5;
    ctx.beginPath(); ctx.arc(lerp(hx, x, k * 0.85), lerp(hy, y + h * 0.45, k * 0.9), r * s, 0, 7); ctx.fill();
  }
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    ctx.moveTo(Math.cos(a) * w * 0.38 + w * 0.2, Math.sin(a) * h * 0.32);
    ctx.arc(Math.cos(a) * w * 0.38, Math.sin(a) * h * 0.32, w * 0.2, 0, 7);
  }
  ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.42, h * 0.36, 0, 0, 7); ctx.fill();
  ctx.restore();
}

function label(i, top, sub, col) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 30px InterBlk"; ctx.letterSpacing = "1px"; ctx.fillStyle = col; ctx.fillText(top, X[i], LABEL_Y);
  ctx.font = "600 25px InterSB"; ctx.letterSpacing = "0px"; ctx.fillStyle = "rgba(235,230,245,0.7)"; ctx.fillText(sub, X[i], LABEL_Y + 38);
  ctx.restore();
}

function title(t) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const p = back(ramp(t, 0, 0.35));
  ctx.translate(540, TITLE_Y); ctx.scale(p, p);
  ctx.font = "900 66px InterBlk"; ctx.letterSpacing = "2px"; ctx.fillStyle = "#ffffff"; ctx.fillText("GLEICHE VORSTELLUNG.", 0, 0);
  ctx.font = "600 32px InterSB"; ctx.letterSpacing = "0px"; ctx.fillStyle = "rgba(230,225,245,0.8)"; ctx.fillText("3 verschiedene Köpfe:", 0, 50);
  ctx.restore();
  // Karte "Stell dir einen roten Apfel vor."
  const cp = ramp(t, 0.15, 0.45) * (1 - ramp(t, 2.8, 3.0));
  if (cp > 0) {
    ctx.save(); ctx.translate(540, CARD_Y + 30); const s = back(cp); ctx.scale(s, s); ctx.globalAlpha = clamp(cp * 2);
    ctx.font = "900 36px InterBlk"; const tw = ctx.measureText("STELL DIR EINEN ROTEN APFEL VOR.").width;
    const w = tw + 110;
    ctx.fillStyle = "#ffffff"; rr(-w / 2, -38, w, 76, 38); ctx.fill();
    ctx.fillStyle = "#1a1730"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("STELL DIR EINEN ROTEN APFEL VOR.", -w / 2 + 30, 2);
    apple(w / 2 - 44, 2, 20, 0, 0, t);
    ctx.restore();
  }
}

window.renderFrame = function (t) {
  NB.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bg(t);
  title(t);
  const strain = t > 0.9 && t < 2.9;
  const arms = [
    t > 8.0 && t < 10.3 ? [150, 8] : [8, 8],
    strain ? [168, 168] : t > BIG ? [120, 120] : t > 2.9 && t < 4.6 ? [35, 8] : [8, 8],
    t > 4.6 && t < 6.3 ? [165, 165] : t > 6.3 && t < 7.9 ? [100, 8] : [10, 10],
  ];
  const figs = X.map((x, i) => {
    const bob = Math.sin(t * 2.2 + i * 1.7) * 3 + (i === 2 && t > 4.6 && t < 6.3 ? -Math.abs(Math.sin(t * 9)) * 16 : 0);
    return NB.blob(x, FEET + bob, {
      s: S, t, face: stateAt(FACE[i], t), side: i === 1 && t > 2.9 ? (t < 8 ? 0.6 : -0.6) : i === 0 && t > 8 ? 0.7 : 0,
      aR: arms[i][0], aL: arms[i][1], armLenR: i === 1 && strain ? 82 : 105, armLenL: i === 1 && strain ? 82 : 105,
      shiver: i === 1 && strain, sweat: i === 1 && strain && t > 1.8,
    });
  });
  // Gedankenwolken
  const cp = ramp(t, CLOUD_IN, CLOUD_IN + 0.35);
  const CL = [[X[0], 760, 200, 170], [X[1], 760, 200, 170], [X[2] - 10, 740, 270, 240]];
  CL.forEach(([x, y, w, h], i) => cloud(x, y, w, h, ramp(t, CLOUD_IN + i * 0.08, CLOUD_IN + 0.35 + i * 0.08), figs[i].headX, figs[i].headY - 60));
  if (cp > 0) {
    apple(CL[0][0], CL[0][1] + 4, 42 * back(ramp(t, 0.6, 0.9)), 0, 0, t);
    // Aphantasie: nichts – nur ein schwacher Fleck, der wieder verschwindet
    const ghost = ramp(t, 1.0, 1.6) * (1 - ramp(t, 1.8, 2.6));
    if (ghost > 0) { ctx.fillStyle = `rgba(200,190,185,${ghost * 0.35})`; ctx.beginPath(); ctx.arc(CL[1][0], CL[1][1], 26, 0, 7); ctx.fill(); }
    if (t > 2.9 && t < 4.6) { ctx.save(); ctx.font = "900 54px InterBlk"; ctx.fillStyle = "rgba(120,110,130,0.6)"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", CL[1][0], CL[1][1] + 4); ctx.restore(); }
    // Hyperphantasie: großer Apfel, ab 6,4 s dreht er sich
    const spin = t > 6.4 ? (t - 6.4) * 3.2 : 0;
    const big = 82 * back(ramp(t, 0.7, 1.05)) * (1 + 0.04 * Math.sin(t * 3));
    apple(CL[2][0], CL[2][1] + 10, big, 1, spin, t);
    if (t > 4.6) for (let i = 0; i < 5; i++) {
      const u = (t * 0.9 + i / 5) % 1;
      star(CL[2][0] + Math.cos(i * 2.1) * 105, CL[2][1] + Math.sin(i * 2.7) * 85, 14 * Math.sin(u * Math.PI), Math.sin(u * Math.PI));
    }
  }
  // Schilder
  label(0, "SIEHT ES", "(normales Kopfkino)", "#e8e4f2");
  label(1, "SIEHT NICHTS", "(Aphantasie)", "#6fa8ff");
  label(2, "SIEHT ALLES", "(Hyperphantasie)", "#ff5f86");
  // Sprechblasen
  for (const [a, b, who, lines, size] of SPEECH) {
    const p = ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.15, b));
    const f = figs[who];
    NB.bubble(lines, X[who], f.headY - 100, f.headX, f.headY - 50, p, size);
  }
  // Große Pointe
  const bp = ramp(t, BIG, BIG + 0.3);
  if (bp > 0) {
    ctx.save(); ctx.translate(0, Math.sin(t * 2) * 3);
    NB.bubble(["MOMENT… DU SIEHST ECHT", "BILDER IM KOPF?!"], 540, 600, X[1], figs[1].headY - 60, bp, 44);
    ctx.restore();
  }
};
window.exportEvents = function () {
  return { duration: window.DURATION, clouds: [CLOUD_IN, CLOUD_IN + 0.08, CLOUD_IN + 0.16], speech: SPEECH.map(s => s[0]), drops: 4.7, spin: 6.4, big: BIG, strain: 0.9 };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  await document.fonts.load("600 50px InterSB");
  return { duration: window.DURATION };
};
