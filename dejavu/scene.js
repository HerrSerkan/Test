// "Kennst du Déjà-vus?" (deutsche Version nach @nobodytoldme_1), ohne Sprecher.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 11.8;
const FEET = 1215, LABEL_Y = 1258, TITLE_X = 520, TITLE_Y = 1345;
const TABLE_Y = 1085;
const FLASH = [1.5, 3.4], SWITCH = 7.5;
const PUSH = 3.8, CATCH = 4.2, PUTBACK = [7.8, 8.4];
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const { ramp, clamp, lerp, back, easeOut, easeIO, keys, stateAt, rr } = NB;

const LX = 240, RX = 830, CAT_X = 560, MUG_X = 690;
const FACE_L = [[0, "smile"], [1.5, "zone"], [3.5, "shock"], [4.4, "squint"], [5.6, "smug"], [8.3, "happy"], [9.4, "smile"]];
const FACE_R = [[0, "neutral"], [8.4, "smile"]];

// ------------------------------------------------------------------ Küche
function kitchen(t, wobble) {
  const g = ctx.createLinearGradient(0, 0, 0, TABLE_Y);
  g.addColorStop(0, "#22545a"); g.addColorStop(1, "#2f6f74");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1200);
  // Fenster (wabert im Déjà-vu)
  ctx.save();
  if (wobble > 0) { ctx.translate(Math.sin(t * 9) * 8 * wobble, 0); }
  const wx = 120, wy = 560, ww = 260, wh = 250;
  ctx.fillStyle = "#f2f2ea"; rr(wx - 14, wy - 14, ww + 28, wh + 28, 6); ctx.fill();
  const sky = ctx.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, "#9fd6f2"); sky.addColorStop(1, "#d8f0f8");
  ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.arc(wx + 60, wy + 60, 26, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffffff"; for (const [dx, dy, r] of [[170, 70, 22], [195, 62, 26], [220, 72, 20]]) { ctx.beginPath(); ctx.arc(wx + dx, wy + dy, r, 0, 7); ctx.fill(); }
  ctx.strokeStyle = "#f2f2ea"; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
  ctx.fillStyle = "#b5653a"; rr(wx + 150, wy + wh - 60, 60, 50, 6); ctx.fill();
  ctx.fillStyle = "#3e8a52"; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(wx + 180, wy + wh - 60); ctx.rotate(-1 + i * 0.5); ctx.beginPath(); ctx.ellipse(0, -30, 10, 30, 0, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore();
  // Uhr
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(820, 640, 70, 0, 7); ctx.fill(); ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 6; ctx.stroke();
  ctx.save(); ctx.translate(820, 640); ctx.strokeStyle = "#2a2a2a"; ctx.lineCap = "round";
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 54, Math.sin(a) * 54); ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); ctx.stroke(); }
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-1.2) * 32, Math.sin(-1.2) * 32); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = "#d8463b"; const sa = t * (wobble > 0.5 ? -2 : 1) * 1.05 - Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sa) * 52, Math.sin(sa) * 52); ctx.stroke();
  ctx.restore();
  // Regal mit Gläsern
  ctx.fillStyle = "#6a4426"; ctx.fillRect(660, 800, 300, 14);
  const jc = ["#e8a05a", "#d8c07a", "#c86a5a", "#b8b0a0", "#a8c0b8"];
  for (let i = 0; i < 5; i++) { ctx.fillStyle = "rgba(240,240,240,0.7)"; rr(675 + i * 56, 740, 40, 60, 6); ctx.fill(); ctx.fillStyle = jc[i]; rr(679 + i * 56, 760, 32, 38, 4); ctx.fill(); ctx.fillStyle = "#8a6a4a"; ctx.fillRect(675 + i * 56, 734, 40, 10); }
  // Fliesenspiegel
  ctx.fillStyle = "#cfe8e6"; ctx.fillRect(0, 960, W, 130);
  ctx.strokeStyle = "rgba(60,110,110,0.35)"; ctx.lineWidth = 2;
  for (let y = 960; y <= 1090; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x < W; x += 64) for (let y = 960; y < 1090; y += 32) { ctx.beginPath(); ctx.moveTo(x + ((y / 32) % 2) * 32, y); ctx.lineTo(x + ((y / 32) % 2) * 32, y + 32); ctx.stroke(); }
  ctx.fillStyle = "#2a5a5e"; ctx.fillRect(0, 1088, W, 18);
  // Boden: Schachbrett
  for (let r = 0; r < 14; r++) for (let c = 0; c < 20; c++) {
    const y = 1106 + r * 60, x = c * 60;
    ctx.fillStyle = (r + c) % 2 ? "#d8c8a8" : "#9a8466"; ctx.fillRect(x, y, 60, 60);
  }
  const sh = ctx.createLinearGradient(0, 1106, 0, H); sh.addColorStop(0, "rgba(0,0,0,0.25)"); sh.addColorStop(0.3, "rgba(10,20,25,0.5)"); sh.addColorStop(1, "rgba(10,20,25,0.6)");
  ctx.fillStyle = sh; ctx.fillRect(0, 1106, W, H - 1106);
}
function table() {
  ctx.fillStyle = "#7a4e2c"; rr(330, TABLE_Y, 460, 26, 6); ctx.fill();
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(350, TABLE_Y + 26, 18, 150); ctx.fillRect(752, TABLE_Y + 26, 18, 150);
}
function cat(x, y, t, paw, glow) {
  ctx.save(); ctx.translate(x, y);
  if (glow) { ctx.shadowColor = "rgba(140,220,255,0.95)"; ctx.shadowBlur = 40; }
  const body = glow ? "#9fe0ff" : "#8a8f99", stripe = glow ? "#6fc0f0" : "#5f646e";
  // Schwanz
  ctx.strokeStyle = body; ctx.lineWidth = 16; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-50, -12); ctx.quadraticCurveTo(-110, -20, -96, -80 + Math.sin(t * 2) * 8); ctx.stroke();
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -60, 58, 64, 0, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = glow ? "#d8f4ff" : "#c8ccd4"; ctx.beginPath(); ctx.ellipse(8, -50, 28, 40, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = stripe; ctx.lineWidth = 6; for (const yy of [-90, -70, -50]) { ctx.beginPath(); ctx.moveTo(-50, yy); ctx.lineTo(-30, yy + 6); ctx.stroke(); }
  // Pfote (stößt die Tasse an)
  ctx.save(); ctx.translate(36, -14); ctx.rotate(-paw * 0.9);
  ctx.fillStyle = body; rr(-10, -6, 50 * (0.6 + paw * 0.6), 18, 9); ctx.fill(); ctx.restore();
  // Kopf
  ctx.fillStyle = body;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 18, -150); ctx.lineTo(s * 40, -190); ctx.lineTo(s * 46, -138); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, -138, 50, 42, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = stripe; ctx.lineWidth = 5; for (const xx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(xx, -178); ctx.lineTo(xx, -164); ctx.stroke(); }
  // mürrische Augen
  ctx.fillStyle = "#d8e86a"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 20, -142, 11, 8, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#2a2a2a"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 20 + 3, -142, 4, 6, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = body; for (const s of [-1, 1]) { ctx.fillRect(s * 20 - 13, -154, 26, 7); }
  ctx.fillStyle = "#e88a9a"; ctx.beginPath(); ctx.moveTo(-6, -126); ctx.lineTo(6, -126); ctx.lineTo(0, -120); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 2; for (const s of [-1, 1]) for (const dy of [-2, 4]) { ctx.beginPath(); ctx.moveTo(s * 14, -122 + dy); ctx.lineTo(s * 48, -126 + dy * 2); ctx.stroke(); }
  ctx.restore();
}
function mug(x, y, rot, glow) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (glow) { ctx.shadowColor = "rgba(140,220,255,0.95)"; ctx.shadowBlur = 30; }
  ctx.fillStyle = glow ? "#d8f4ff" : "#ffffff"; rr(-26, -56, 52, 56, 8); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glow ? "#d8f4ff" : "#ffffff"; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(28, -28, 14, -1.2, 1.2); ctx.stroke();
  ctx.fillStyle = glow ? "#6fc0f0" : "#2f8a8a"; ctx.fillRect(-26, -38, 52, 10);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 2; rr(-26, -56, 52, 56, 8); ctx.stroke();
  ctx.restore();
}

window.renderFrame = function (t) {
  NB.ctx = ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fl = ramp(t, FLASH[0], FLASH[0] + 0.25) * (1 - ramp(t, FLASH[1] - 0.2, FLASH[1]));
  kitchen(t, fl);
  table();
  // Tasse: Ort je nach Zeit
  let mx = MUG_X, my = TABLE_Y, mrot = 0, held = false;
  const push = ramp(t, PUSH, PUSH + 0.25), fall = ramp(t, PUSH + 0.25, CATCH);
  if (t >= PUSH && t < CATCH) { mx = lerp(MUG_X, 790, easeOut(push)); my = TABLE_Y + fall * fall * 80; mrot = fall * 1.2; }
  else if (t >= CATCH && t < PUTBACK[1]) held = true;
  const paw = Math.max(ramp(t, PUSH - 0.2, PUSH) * (1 - ramp(t, PUSH + 0.3, PUSH + 0.6)), ramp(t, 10.4, 10.8) * 0.4);
  cat(CAT_X, TABLE_Y, t, paw, false);
  // Figuren
  const leanL = keys([[0, 0], [4.3, 0], [4.7, 9], [7.4, 9], [7.8, 0]], t)[0];
  const [aLR] = keys([[0, 12], [CATCH - 0.15, 12], [CATCH, 62], [PUTBACK[0], 62], [PUTBACK[0] + 0.25, 70], [PUTBACK[1], 12]], t);
  const L = NB.blob(LX, FEET, { s: 0.95, face: stateAt(FACE_L, t), side: t > 4.4 && t < 7.6 ? 1 : 0.5, t, lean: leanL, aR: 8, aL: 8 });
  const R = NB.blob(RX, FEET, { s: 0.95, face: stateAt(FACE_R, t), side: 0, t, aR: 22, aL: aLR });
  // Handy rechts
  if (R.handR) { ctx.save(); ctx.translate(R.handR[0] - 4, R.handR[1] - 18); ctx.rotate(-0.25); ctx.fillStyle = "#2a2440"; rr(-17, -30, 34, 60, 7); ctx.fill(); ctx.fillStyle = "#8a6bff"; rr(-13, -25, 26, 50, 5); ctx.fill(); ctx.restore(); }
  if (held && R.handL) {
    const back2 = ramp(t, PUTBACK[0] + 0.25, PUTBACK[1]);
    mx = lerp(R.handL[0] + 6, MUG_X, easeIO(back2)); my = lerp(R.handL[1] + 20, TABLE_Y, easeIO(back2));
  }
  if (!(t >= FLASH[0] && t < FLASH[1])) mug(mx, my, mrot, false);
  // Déjà-vu: alles blau, Katze + Tasse leuchten, Geister-Tasse fällt
  if (fl > 0) {
    ctx.save(); ctx.globalAlpha = 0.55 * fl; ctx.fillStyle = "#2a3e66"; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.globalAlpha = fl;
    cat(CAT_X, TABLE_Y, t, ramp(t, 2.3, 2.5) * (1 - ramp(t, 2.6, 2.8)), true);
    const g1 = ramp(t, 2.5, 2.8), g2 = ramp(t, 2.8, 3.2);
    mug(lerp(MUG_X, 790, easeOut(g1)), TABLE_Y + g2 * g2 * 260, g2 * 2.5, true);
    ctx.restore();
  }
  const blink = Math.max(1 - ramp(t, FLASH[0], FLASH[0] + 0.15), 0) * (t >= FLASH[0] ? 1 : 0) + (t >= FLASH[1] ? 1 - ramp(t, FLASH[1], FLASH[1] + 0.15) : 0);
  if (blink > 0 && t > FLASH[0] - 0.01) { ctx.fillStyle = `rgba(255,255,255,${0.5 * blink})`; ctx.fillRect(0, 0, W, H); }
  NB.label("DÉJÀ-VU", LX, LABEL_Y, 22); NB.label("NOCH NIE GEHABT", RX - 40, LABEL_Y, 22);
  const sp = ramp(t, 1.65, 1.85) * (1 - ramp(t, 3.0, 3.2));
  NB.bubble(["DAS HAB ICH", "SCHON MAL GESEHEN."], LX + 100, L.headY - 110, LX, L.headY - 30, sp, 30);
  const hm = ramp(t, 4.6, 4.8) * (1 - ramp(t, 6.0, 6.2));
  NB.bubble(["WUSST' ICH'S", "DOCH!"], LX + 60, L.headY - 110, LX + 20, L.headY - 30, hm, 30);
  NB.title(t, SWITCH, [["KENNST DU", 56, "#ffffff"], ["DÉJÀ-VUS?", 78, "#f4b740"]],
    [["FÜHLT SICH AN WIE EIN SPOILER.", 44, "#ffffff"], ["IST ES ABER NICHT.", 70, "#f4b740"]], TITLE_X, TITLE_Y);
};
window.exportEvents = function () {
  return { duration: window.DURATION, flash: FLASH, ghostFall: [2.5, 2.8, 3.2], push: PUSH, catch: CATCH, putback: PUTBACK, switch: SWITCH, smug: 4.6, speech: 1.65 };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  return true;
};
