// "Mach den Ton aus. Hörst du es trotzdem?" – deutsche Version (Idee: @nkzwl1), ohne Sprecher, 14 s.
// Ein Würfel springt Seil auf der Leinwand; drei Zuschauer: hört nichts / hört es (vEAR) / hört es irgendwie.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 14.0;
const { ramp, clamp, lerp, back, stateAt, rr } = NB;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const TITLE_Y = 450, SCR = { x: 180, y: 585, w: 720, h: 400 }, FEET = 1345, LABEL_Y = 1405;
const X = [215, 520, 810], S = 0.82;
const SLOW = [5.4, 8.0], NOW = 8.6, CRACK = 9.4, FACT = 10.6;
const SPEECH = [
  [0.6, 2.6, 1, ["BUMM. BUMM.", "BUMM."]],
  [2.0, 3.6, 0, ["was hören? 🙂"]],
  [3.8, 5.3, 2, ["…irgendwie??"]],
  [5.9, 7.9, 1, ["SO LAUT! 😭"]],
  [8.2, 8.9, 0, ["…moment."]],
  [9.0, 10.5, 0, ["JETZT HÖR", "ICH'S AUCH 😳"]],
];
const FACE = [
  [[0, "calm"], [2.0, "smile"], [3.6, "calm"], [8.2, "curious"], [9.0, "shock"]],
  [[0, "worried"], [0.6, "squint"], [2.6, "worried"], [5.9, "shock"], [8.0, "worried"], [FACT, "squint"]],
  [[0, "neutral"], [3.8, "curious"], [5.3, "think"], [8.0, "curious"], [FACT, "worried"]],
];

function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#14122a"); g.addColorStop(0.55, "#252046"); g.addColorStop(1, "#0f0d20");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Saalwände, Wandlampen
  for (const x of [70, 1010]) {
    const lg = ctx.createRadialGradient(x, 1080, 5, x, 1080, 200); lg.addColorStop(0, "rgba(255,210,140,0.3)"); lg.addColorStop(1, "rgba(255,210,140,0)");
    ctx.fillStyle = lg; ctx.fillRect(x - 200, 880, 400, 400);
    ctx.fillStyle = "#e9c46a"; rr(x - 14, 1065, 28, 34, 6); ctx.fill();
  }
  // Boden (Holz)
  const fg = ctx.createLinearGradient(0, FEET - 120, 0, H); fg.addColorStop(0, "#3a2a26"); fg.addColorStop(1, "#1e1614");
  ctx.fillStyle = fg; ctx.fillRect(0, FEET - 120, W, H);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 2;
  for (let y = FEET - 100; y < H; y += 46) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const R = NB.rng(9);
  for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.1 * R()})`; ctx.beginPath(); ctx.arc(R() * W, R() * 380 + 80, 1.5, 0, 7); ctx.fill(); }
}

// Würfel-Figur mit Springseil, auf der Leinwand
function screenScene(t) {
  const { x, y, w, h } = SCR;
  const zoom = 1 + 0.18 * ramp(t, NOW, NOW + 0.8);
  ctx.save();
  ctx.fillStyle = "#1a1626"; rr(x - 16, y - 16, w + 32, h + 32, 18); ctx.fill();
  rr(x, y, w, h, 8); ctx.clip();
  ctx.fillStyle = "#bfe3f2"; ctx.fillRect(x, y, w, h);
  ctx.translate(x + w / 2, y + h * 0.62); ctx.scale(zoom, zoom);
  // Gras
  ctx.fillStyle = "#86c56a"; ctx.fillRect(-w, h * 0.18, w * 2, h);
  // Zeit (Zeitlupe dehnt die Sprünge)
  const slowK = t < SLOW[0] ? 0 : t < SLOW[1] ? 1 : 0;
  const tt = t < SLOW[0] ? t : t < SLOW[1] ? SLOW[0] + (t - SLOW[0]) * 0.35 : SLOW[0] + (SLOW[1] - SLOW[0]) * 0.35 + (t - SLOW[1]);
  const ph = tt * 2.1;                       // Sprünge pro Sekunde
  const u = ph % 1;
  const jump = Math.sin(u * Math.PI);       // 0 am Boden
  const ground = h * 0.18;
  const squash = Math.max(0, 1 - jump * 6) * 0.14;
  const by = ground - 8 - jump * 95;
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.beginPath(); ctx.ellipse(0, ground + 2, 80 - jump * 30, 10, 0, 0, 7); ctx.fill();
  // Seil: Winkel läuft einmal pro Sprung herum
  const a = u * Math.PI * 2 + Math.PI / 2;
  const handY = by - 70, hx = 118;
  const ry = Math.sin(a) * 110, behind = Math.cos(a) < 0;
  const rope = () => { ctx.strokeStyle = "#d8322f"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-hx, handY); ctx.quadraticCurveTo(0, handY + 40 + ry * 1.6, hx, handY); ctx.stroke(); };
  if (behind) rope();
  // Körper
  const bw = 150 * (1 + squash), bh = 140 * (1 - squash);
  ctx.save(); ctx.translate(0, by);
  ctx.strokeStyle = "#e0662f"; ctx.lineWidth = 12; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-bw / 2 + 6, -bh * 0.5); ctx.lineTo(-hx, handY - by); ctx.moveTo(bw / 2 - 6, -bh * 0.5); ctx.lineTo(hx, handY - by); ctx.stroke();
  ctx.fillStyle = "#ef6d33"; rr(-bw / 2, -bh, bw, bh, 20); ctx.fill();
  ctx.strokeStyle = "#2a1a14"; ctx.lineWidth = 5; rr(-bw / 2, -bh, bw, bh, 20); ctx.stroke();
  ctx.fillStyle = "#2a1a14"; for (const ex of [-30, 30]) { ctx.beginPath(); ctx.arc(ex, -bh * 0.62, 8, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, -bh * 0.48, 26, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
  if (!behind) rope();
  // Staub beim Aufkommen
  if (u < 0.12 || u > 0.94) for (const s of [-1, 1]) { ctx.fillStyle = "rgba(240,230,200,0.7)"; ctx.beginPath(); ctx.arc(s * (80 + (u < 0.5 ? u : 0) * 300), ground - 6, 10, 0, 7); ctx.fill(); }
  ctx.restore();
  // Risse ab CRACK
  const cr = ramp(t, CRACK, CRACK + 0.25);
  if (cr > 0) {
    ctx.save(); rr(x, y, w, h, 8); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3;
    const R = NB.rng(21), cx = x + w * 0.55, cy = y + h * 0.4;
    for (let i = 0; i < 7; i++) {
      let px = cx, py = cy; const an = i / 7 * Math.PI * 2 + R();
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 0; k < 5; k++) { px += Math.cos(an + (R() - 0.5)) * 50 * cr; py += Math.sin(an + (R() - 0.5)) * 50 * cr; ctx.lineTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
  }
  // Zeitlupen-Rahmen
  const sl = ramp(t, SLOW[0], SLOW[0] + 0.2) * (1 - ramp(t, SLOW[1] - 0.2, SLOW[1]));
  if (sl > 0) {
    ctx.save(); ctx.globalAlpha = sl; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5;
    const m = 34, L = 50;
    for (const [cx, cy, sx, sy] of [[x - m, y - m, 1, 1], [x + w + m, y - m, -1, 1], [x - m, y + h + m, 1, -1], [x + w + m, y + h + m, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(cx, cy + sy * L); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * L, cy); ctx.stroke();
    }
    ctx.fillStyle = "#ffffff"; ctx.font = "900 24px InterBlk"; const tw = ctx.measureText("ZEITLUPE").width + 50;
    rr(540 - tw / 2, y + 18, tw, 40, 20); ctx.fill();
    ctx.fillStyle = "#d8322f"; ctx.beginPath(); ctx.arc(540 - tw / 2 + 20, y + 38, 7, 0, 7); ctx.fill();
    ctx.fillStyle = "#1a1730"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("ZEITLUPE", 540 - tw / 2 + 34, y + 39);
    ctx.restore();
  }
  return { land: u < 0.06 };
}

function title(t) {
  ctx.save(); ctx.textAlign = "center";
  const a = 1 - ramp(t, FACT - 0.15, FACT), b = back(ramp(t, FACT, FACT + 0.3));
  if (a > 0) {
    ctx.globalAlpha = a;
    ctx.font = "900 62px InterBlk"; ctx.fillStyle = "#ffffff"; ctx.fillText("MACH DEN TON AUS.", 540, TITLE_Y);
    ctx.font = "900 44px InterBlk"; ctx.fillStyle = "#f4b740"; ctx.fillText("HÖRST DU ES TROTZDEM? 🔇", 540, TITLE_Y + 60);
  }
  if (b > 0) {
    ctx.globalAlpha = 1; ctx.translate(540, TITLE_Y); ctx.scale(b, b);
    ctx.font = "900 62px InterBlk"; ctx.fillStyle = "#ffffff"; ctx.fillText("1 VON 5 MENSCHEN", 0, 0);
    ctx.font = "900 42px InterBlk"; ctx.fillStyle = "#f4b740"; ctx.fillText("HÖRT LAUTLOSE BEWEGUNG.", 0, 54);
    ctx.font = "600 22px InterSB"; ctx.fillStyle = "rgba(230,225,245,0.75)"; ctx.fillText("(22 % von ca. 4.000 Befragten, City University London)", 0, 88);
  }
  ctx.restore();
}

function popcorn(x, y, spill) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spill * 0.9);
  ctx.fillStyle = "#fff6d8";
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-34 + (i % 5) * 17, -40 - Math.floor(i / 5) * 12 + (i % 2) * 4, 12, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-44, -36); ctx.lineTo(44, -36); ctx.lineTo(34, 40); ctx.lineTo(-34, 40); ctx.closePath();
  ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = "#d8322f"; for (let k = -3; k <= 3; k += 2) ctx.fillRect(k * 13 - 6, -40, 13, 90);
  ctx.restore(); ctx.restore();
}

function label(i, top, sub, col) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 28px InterBlk"; ctx.fillStyle = col; ctx.fillText(top, X[i], LABEL_Y);
  ctx.font = "600 23px InterSB"; ctx.fillStyle = "rgba(235,230,245,0.75)"; ctx.fillText(sub, X[i], LABEL_Y + 36);
  ctx.restore();
}

window.renderFrame = function (t) {
  NB.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bg(t); title(t);
  screenScene(t);
  const ears = t > 0.5;
  const shake = t > 5.9 && t < 7.9;
  const spill = ramp(t, 9.0, 9.4);
  const figs = [
    NB.blob(X[0], FEET, { s: S, t, face: stateAt(FACE[0], t), aR: t > 9 ? 150 : 40, aL: t > 9 ? 150 : 40, armLenR: t > 9 ? 82 : 105, armLenL: t > 9 ? 82 : 105, side: t > 8.2 && t < 9 ? 0.8 : 0 }),
    NB.blob(X[1], FEET, { s: S, t, face: stateAt(FACE[1], t), aR: ears ? 166 : 10, aL: ears ? 166 : 10, armLenR: 82, armLenL: 82, shiver: shake }),
    NB.blob(X[2], FEET, { s: S, t, face: stateAt(FACE[2], t), aR: t > 3.8 && t < 5.3 ? 120 : t > FACT ? 160 : 10, aL: t > FACT ? 160 : 10, armLenR: t > FACT ? 82 : 105, armLenL: t > FACT ? 82 : 105, side: t > 3.8 && t < 5.3 ? -0.6 : 0 }),
  ];
  // Popcorn: in den Armen, fällt bei "JETZT HÖR ICH'S"
  const fall = ramp(t, 9.0, 9.5);
  popcorn(X[0] + fall * 30, FEET - 120 + fall * fall * 110, spill);
  if (fall > 0) {
    const R = NB.rng(4);
    for (let i = 0; i < 12; i++) {
      const k = clamp((t - 9.0 - R() * 0.2) / 0.8);
      if (k <= 0) continue;
      const px = X[0] + (R() - 0.3) * 170 * k, py = FEET - 160 - 120 * Math.sin(k * Math.PI) + 150 * k;
      ctx.fillStyle = "#fff6d8"; ctx.beginPath(); ctx.arc(px, Math.min(py, FEET - 8), 9, 0, 7); ctx.fill();
    }
  }
  // Schallwellen um den Hörenden (er hört es)
  if (ears) {
    const tt = t < SLOW[0] ? t : t < SLOW[1] ? SLOW[0] + (t - SLOW[0]) * 0.35 : t;
    const u = (tt * 2.1) % 1;
    const a = Math.max(0, 1 - u * 2.5);
    if (a > 0) for (const s of [-1, 1]) {
      ctx.strokeStyle = `rgba(255,255,255,${a * 0.8})`; ctx.lineWidth = 4;
      for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(X[1], figs[1].headY, 70 + k * 18 + u * 40, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); ctx.stroke(); }
    }
  }
  label(0, "DIE MEISTEN", "(hören nichts)", "#e8e4f2");
  label(1, "HÖRT ES", "(visuelles Hören)", "#f4b740");
  label(2, "HÖRT ES HALB", "(Vorstellung)", "#9fb7ff");
  for (const [a, b, who, lines] of SPEECH) {
    const p = ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.15, b));
    const f = figs[who];
    NB.bubble(lines, X[who], f.headY - 92, f.headX, f.headY - 48, p, 26);
  }
};
window.exportEvents = function () {
  return { duration: window.DURATION, speech: SPEECH.map(s => s[0]), slow: SLOW, now: 9.0, crack: CRACK, fact: FACT };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  await document.fonts.load("600 50px InterSB");
  return { duration: window.DURATION };
};
