// ============================================================ Tag 9 „Jobs für alle“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js + lib8.js + tag9.js -> scene.js)
// Aufbau Schritt für Schritt wie Tag 2 (BRIEFING_TAG9.md). 834 Follower (+5 seit Tag 8). Keine erfundenen Zahlen.
const FOLLOWERS = 834, NEU = 5, LIKES = "4.390", FOLLOWING = "7";
const T = {
  heute: wt(2), card: wt(5), follow: wt(7), law: wt(16), jobs: wt(20), also: wt(23), stamp: wt(27), pres: wt(31), janic: wt(36), luk: wt(40), sec: wt(43),
  meo: wt(47), phil: wt(52), cat: wt(57), pizza: wt(63), iph: wt(64), wohn: wt(65), goyo: wt(66), done: wt(67), cliff: wt(68), paw: wt(75),
  law2: wt(79), top: wt(83), name: wt(86), loop: SPEECH_END + 0.1,
};
const AV = {};

// ------------------------------------------------------------ Zubehör für die Jobs
function crown(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-22, 6); ctx.lineTo(-24, -22); ctx.lineTo(-11, -8); ctx.lineTo(0, -28); ctx.lineTo(11, -8); ctx.lineTo(24, -22); ctx.lineTo(22, 6); ctx.fill(); ctx.fillStyle = "#ffd23a"; ctx.beginPath(); ctx.moveTo(-19, 3); ctx.lineTo(-20, -15); ctx.lineTo(-10, -3); ctx.lineTo(0, -22); ctx.lineTo(10, -3); ctx.lineTo(20, -15); ctx.lineTo(19, 3); ctx.fill(); circle(0, -4, 4, "#e5262b"); circle(-12, -1, 2.5, "#3fd3f2"); circle(12, -1, 2.5, "#3fd3f2"); ctx.restore(); }
function sash9(x, y, s, txt, col = "#e5262b") { ctx.save(); ctx.translate(x, y - 58 * s); ctx.rotate(-0.55); ctx.scale(s, s); ctx.fillStyle = col; ctx.fillRect(-32, -7, 64, 14); ctx.fillStyle = "#fff"; ctx.font = "7.5px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 1); ctx.restore(); }
function vest(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1b22"; rr(-23, -77, 46, 42, 10); ctx.fill(); ctx.fillStyle = "#ffd23a"; ctx.fillRect(-23, -52, 46, 4); ctx.fillStyle = "#fff"; ctx.font = "900 6.5px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SECURITY", 0, -62); ctx.restore(); }
function videoCam(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-20, -14, 40, 28, 5); ctx.fill(); ctx.fillStyle = "#3a4256"; rr(-17, -11, 34, 22, 4); ctx.fill(); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(18, -8); ctx.lineTo(34, -14); ctx.lineTo(34, 14); ctx.lineTo(18, 8); ctx.fill(); circle(26, 0, 6, "#59d4ff"); if (Math.sin(t * 8) > 0) circle(-10, -5, 3.5, "#ff3b3b"); ctx.restore(); }
function oven(x, y, s, t) { // Pizzaofen (Unterkante Mitte)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -4, 84, 96, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-84, -6, 168, 12);
  ctx.fillStyle = "#c9654a"; ctx.beginPath(); ctx.ellipse(0, -4, 80, 92, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#a84e38"; for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { if (Math.hypot((i - 2) * 32, j * 22 + 10) > 84) continue; rr(-74 + i * 32 + (j % 2) * 14, -30 - j * 22, 26, 3, 1); ctx.fill(); }
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -4, 44, 44, 0, Math.PI, 0); ctx.fill(); glow(0, -18, 50, "255,150,40", 0.7 + 0.2 * Math.sin(t * 9));
  for (const [c, w, h] of [["#ff8a1e", 22, 30], ["#ffd23a", 12, 18]]) { const f = 1 + 0.2 * Math.sin(t * 14); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w, -6); ctx.quadraticCurveTo(0, -6 - h * f * 1.6, w, -6); ctx.fill(); }
  ctx.fillStyle = "#cfd6dc"; ctx.fillRect(-12, -150, 24, 60); ctx.restore();
}
function pizza(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); circle(0, 0, 22, "#1b1424"); circle(0, 0, 20, "#e8b04a"); circle(0, 0, 16, "#e5503a"); for (const [px, py] of [[-6, -4], [6, 5], [2, -9], [-7, 7]]) circle(px, py, 3.2, "#ffe14a"); ctx.restore(); }
function phoneS(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-11, -20, 22, 40, 5); ctx.fill(); ctx.fillStyle = "#59d4ff"; rr(-8, -16, 16, 32, 3); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 7px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("18", 0, 0); ctx.restore(); }
function keyS(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 6) * 0.3); ctx.scale(s, s); glow(0, 0, 40, "255,220,90", 0.5); ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, -12, 9, 0, Math.PI * 2); ctx.moveTo(0, -3); ctx.lineTo(0, 24); ctx.moveTo(0, 14); ctx.lineTo(9, 14); ctx.moveTo(0, 22); ctx.lineTo(8, 22); ctx.stroke(); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
function flat(x, y, s) { // kleine Wohnung (Unterkante Mitte)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-74, -144, 148, 148, 10); ctx.fill(); ctx.fillStyle = "#7bd0ff"; rr(-70, -140, 140, 140, 8); ctx.fill();
  ctx.fillStyle = "#3a7bd5"; ctx.beginPath(); ctx.moveTo(-84, -138); ctx.lineTo(0, -196); ctx.lineTo(84, -138); ctx.fill();
  for (const [wx, wy] of [[-40, -110], [14, -110]]) { ctx.fillStyle = "#fff6cf"; rr(wx, wy, 28, 28, 4); ctx.fill(); }
  ctx.fillStyle = "#5b3a1e"; rr(-14, -56, 28, 56, 4); ctx.fill(); circle(8, -28, 2.5, "#ffd23a");
  ctx.fillStyle = "#fff"; rr(-52, -66, 30, 14, 3); ctx.fill(); ctx.fillStyle = "#14223a"; ctx.font = "900 7px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("MEHMET", -37, -58.5); ctx.restore();
}
function nameTag(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * 0.05); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-96, -34, 192, 68, 12); ctx.fill(); ctx.fillStyle = "#fff"; rr(-90, -28, 180, 56, 9); ctx.fill(); ctx.fillStyle = "#e5262b"; rr(-90, -28, 180, 20, [9, 9, 0, 0]); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("HALLO, ICH HEISSE", 0, -17); ctx.fillStyle = "#14223a"; ctx.font = "30px Comic"; ctx.fillText("???", 0, 10); ctx.restore(); }
function bigPaw(x, y, s, t) { // riesige Pfote aus der Höhle – sieht aus wie die des Monsters
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-160, -40, 190, 86, 40); ctx.fill(); ctx.fillStyle = "#5a4bc4"; rr(-156, -36, 182, 78, 36); ctx.fill();
  ctx.strokeStyle = "rgba(60,45,150,0.6)"; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-140 + i * 26, -20 + (i % 2) * 20); ctx.lineTo(-132 + i * 26, -6 + (i % 2) * 20); ctx.stroke(); }
  for (let k = -1; k <= 1; k++) { ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(18, k * 24 - 12); ctx.lineTo(74, k * 24); ctx.lineTo(18, k * 24 + 12); ctx.fill(); ctx.fillStyle = "#f2f6ff"; ctx.beginPath(); ctx.moveTo(20, k * 24 - 9); ctx.lineTo(68, k * 24); ctx.lineTo(20, k * 24 + 9); ctx.fill(); }
  ctx.restore();
}
function lawStone(x, y, s, t) { // Gesetzestafel mit Zetteln und Stempel
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-116, -276, 232, 280, 40); ctx.fill(); ctx.fillStyle = "#b9b3ab"; rr(-110, -270, 220, 270, 36); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.font = "30px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("GESETZ NR. 1", 0, -232);
  ctx.strokeStyle = "#8a847c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-80, -206); ctx.lineTo(80, -206); ctx.stroke();
  // Zettel „Kann ich … sein?“ fliegen auf die Tafel
  const slips = ["Kann ich President sein", "kann ich polizei sein", "will Security sein", "kann ich youtuber sein", "wann kann ich Goyo sein"];
  slips.forEach((txt, i) => { const t0 = T.law + 0.1 + i * 0.28, k = easeOut(ramp(t, t0, t0 + 0.35)); if (k <= 0 || t >= T.stamp + 0.15) return; const tx = -40 + (i % 2) * 70 - 20, ty = -170 + i * 30, sx = (i % 2 ? 260 : -260), sy = -420; ctx.save(); ctx.translate(lerp(sx, tx, k), lerp(sy, ty, k)); ctx.rotate((i % 2 ? 1 : -1) * (0.12 + (1 - k) * 2)); ctx.fillStyle = "#fffdf4"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 4; rr(-76, -13, 152, 26, 4); ctx.fill(); ctx.shadowColor = "transparent"; ctx.fillStyle = "#14223a"; ctx.font = "800 11px InterX"; ctx.fillText(txt, 0, 1); ctx.restore(); });
  // Stempel
  if (t >= T.stamp) { const k = ramp(t, T.stamp, T.stamp + 0.16), sc = lerp(2.4, 1, easeOut(k)); ctx.save(); ctx.translate(0, -110); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = k; ctx.strokeStyle = "#d21f2a"; ctx.lineWidth = 6; rr(-94, -62, 188, 124, 12); ctx.stroke(); ctx.fillStyle = "#d21f2a"; ctx.font = "30px Comic"; ctx.fillText("JEDER", 0, -30); ctx.fillText("BEKOMMT", 0, 2); ctx.fillText("EINEN JOB.", 0, 34); ctx.restore(); }
  ctx.restore();
}

// ------------------------------------------------------------ Weltlayout (neuer Planet, über Nacht eine Stadt)
const ROCKET = { x: 330, y: 708, s: 1.6, rot: 0.24 };
const STONE = { x: 600, y: 760 }, PRES = { x: 820, y: 792 }, MEO = { x: 1030, y: 792 }, PHIL = { x: 1210, y: 792 };
const OVEN = { x: 1420, y: 716 }, HUT = { x: 1600, y: 716 }, FLAT = { x: 1790, y: 716 }, LEO = { x: 2090, y: 792 }, CAVE = { x: 2900, y: 640 };
const CITY = [ // [Zeitversatz, Zeichenfunktion] – taucht beim Schwenk nach und nach auf
  [0.0, () => house(700, 640, 1.2, "#3fd3f2")], [0.08, () => house(790, 632, 0.9, "#ffb43a")], [0.16, () => dome(960, 690)], [0.24, () => donerShop(1160, 712, 0.95)],
  [0.3, () => house(1290, 636, 1.0, "#7bf27a")], [0.36, () => house(1500, 640, 1.1, "#ff79c6")], [0.42, () => house(1880, 636, 1.0, "#b06bff")],
];
const TOWN = (() => { const r = rng(42), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]; for (let i = 0; i < 150; i++) { const y = 612 + Math.pow(r(), 1.4) * 70; a.push({ x: 520 + r() * 1600, y, s: 0.22 + (y - 600) / 110 * 0.3, acc: keys[i % 7], ph: r() * 6 }); } return a.sort((p, q) => p.y - q.y); })();
function monsterAt(t) { // wo das Monster gerade ist
  if (t >= T.law2 || t < T.law - 0.4) return { x: 190, y: 790, s: 0.5, sit: true };
  if (t < T.cliff) return { x: 430, y: 792, s: 0.46, sit: true };
  return { x: lerp(CAVE.x - 560, CAVE.x - 300, easeIO(ramp(t, T.cliff, T.paw - 0.2))) - (t >= T.paw ? 60 * easeOut(ramp(t, T.paw, T.paw + 0.25)) : 0), y: 742, s: 0.4, sit: false };
}
const CAM = [
  [0, 265, 650, 1.35], [T.heute - 0.1, 268, 650, 1.4], [T.heute + 0.75, 1020, 600, 0.72], [T.law - 0.12, 1040, 600, 0.75], [T.law + 0.1, 520, 640, 1.45], [T.pres - 0.12, 520, 640, 1.5],
  [T.pres + 0.1, PRES.x + 30, 690, 1.75], [T.luk - 0.12, PRES.x + 30, 690, 1.8], [T.luk + 0.1, 430, 690, 1.6], [T.meo - 0.12, 430, 690, 1.65],
  [T.meo + 0.1, MEO.x, 690, 1.85], [T.phil - 0.12, MEO.x, 690, 1.9], [T.phil + 0.1, PHIL.x, 695, 2.0], [T.pizza - 0.12, PHIL.x, 695, 2.15],
  [T.pizza + 0.06, OVEN.x - 30, 680, 1.6], [T.iph - 0.06, OVEN.x - 30, 680, 1.65], [T.iph + 0.06, HUT.x + 40, 680, 1.6], [T.wohn - 0.06, HUT.x + 40, 680, 1.65],
  [T.wohn + 0.06, FLAT.x + 30, 670, 1.5], [T.goyo - 0.06, FLAT.x + 30, 670, 1.55], [T.goyo + 0.06, LEO.x, 690, 1.9], [T.cliff - 0.12, LEO.x, 690, 1.95],
  [T.cliff + 0.12, CAVE.x - 240, 610, 1.05], [T.law2 - 0.12, CAVE.x - 200, 600, 1.3], [T.law2 + 0.1, 20, 705, 2.1], [T.name - 0.12, 20, 705, 2.2],
  [T.name + 0.1, 250, 670, 1.5], [T.loop, 262, 652, 1.37], [DUR, 265, 650, 1.35],
];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) { const a = CAM[i - 1], b = CAM[i], k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k))]; }
  return CAM.at(-1).slice(1);
}
const toScreen = (x, y, t) => { const [cx, cy, z] = cam(t); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z, z]; };

function drawWorld(t, z) {
  sky8(t); ground8();
  for (const [x, y, s] of [[-300, 690, 1.2], [560, 700, 0.8], [1340, 760, 0.8], [2300, 700, 1.1]]) crystal(x, y, s, t);
  cave(CAVE.x, CAVE.y, t, 0);
  for (let i = 0; i < 6; i++) footprint(CAVE.x - 160 - i * 95, CAVE.y + 70 + (i % 2) * 26, 1.5, 0.1 * (i % 2 ? 1 : -1));
  const city = t >= T.heute;
  if (city) for (const m of TOWN) { const sp = SPR[m.acc]; if (!sp) continue; const w = 88 * m.s, h = 158 * m.s; ctx.drawImage(sp, m.x - w / 2, m.y - h - Math.abs(Math.sin(t * 5 + m.ph)) * 3, w, h); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  // Stadt (ploppt beim Schwenk auf)
  if (city) {
    for (const [d, fn] of CITY) { const k = back(ramp(t, T.heute + 0.15 + d, T.heute + 0.45 + d)); if (k <= 0) continue; ctx.save(); ctx.translate(0, 712); ctx.scale(1, k); ctx.translate(0, -712); fn(); ctx.restore(); }
    flag2(700, 720, ramp(t, T.heute + 0.5, T.heute + 1.1), t);
    oven(OVEN.x, OVEN.y, 1, t); appleHut(HUT.x, HUT.y, 1, 1, t); flat(FLAT.x, FLAT.y, 1);
  }
  // Rakete aus Tag 8 schief im Sand
  ctx.save(); ctx.translate(ROCKET.x, ROCKET.y); ctx.rotate(ROCKET.rot); rocket(0, 0, ROCKET.s, 0); ctx.fillStyle = "#2a2230"; rr(-16, -66, 32, 54, 6); ctx.fill(); ctx.restore();
  // Gesetzestafel
  if (t >= T.law - 0.3 && t < T.cliff) lawStone(STONE.x, STONE.y, back(ramp(t, T.law - 0.3, T.law)) , t);
  // Präsident + Vize
  if (t >= T.pres) { const k = back(ramp(t, T.pres + 0.5, T.pres + 0.8)); astronaut(PRES.x, PRES.y, 1.15, "happy", { t, acc: "#ffd23a", armR: -2.4 }); if (k > 0) { sash9(PRES.x, PRES.y, 1.15 * k, "PRÄSIDENT"); crown(PRES.x, PRES.y - 104 * 1.15, 1.15 * k); } }
  if (t >= T.janic - 0.2) { const k = easeOut(ramp(t, T.janic - 0.2, T.janic + 0.2)); astronaut(lerp(PRES.x + 190, PRES.x + 100, k), PRES.y + 4, 0.85, "happy", { t: t + 2, acc: "#3fd3f2" }); if (t >= T.janic) sash9(PRES.x + 100, PRES.y + 4, 0.85, "VIZE", "#3a7bd5"); }
  // Polizei (luk) + Security (einfachso) bewachen das Monster
  if (t >= T.luk && t < T.cliff) { const k = easeOut(ramp(t, T.luk, T.luk + 0.3)); astronaut(lerp(180, 330, k), 796, 0.95, "smirk", { t, acc: "#1c2f6b", armR: -0.9 }); policeCap(lerp(180, 330, k), 796, 0.95); }
  if (t >= T.sec && t < T.cliff) { const k = easeOut(ramp(t, T.sec, T.sec + 0.3)); astronaut(lerp(700, 535, k), 796, 0.95, "smirk", { t: t + 1, acc: "#ffd23a", armL: 0.9 }); vest(lerp(700, 535, k), 796, 0.95); }
  // MEO filmt
  if (t >= T.meo) { astronaut(MEO.x, MEO.y, 1.1, "happy", { t, acc: "#ff4b6e", armL: -1.2, armR: 1.2 }); videoCam(MEO.x + 10, MEO.y - 70 + Math.sin(t * 3) * 2, 1.2, t); }
  // Phillip + orange Katze
  if (t >= T.phil) { const got = t >= T.cat + 0.35; astronaut(PHIL.x, PHIL.y, 1.15, got ? "happy" : "think", { t, acc: "#ffb43a", armL: got ? -0.9 : 0.25, armR: got ? 0.9 : -0.25 });
    if (t >= T.cat) { const k = ramp(t, T.cat, T.cat + 0.35); const cx = lerp(PHIL.x + 200, PHIL.x - 2, k), cy = lerp(PHIL.y - 20, PHIL.y - 62, k) - Math.sin(Math.PI * k) * 90; orangeCat(cx, cy, 1.25, t); } }
  // Montage: Alex, Noam, Mehmet, Leonard
  if (t >= T.pizza - 0.1) { astronaut(OVEN.x - 110, 792, 1.0, "happy", { t, acc: "#7bf27a", armR: -2.3 }); pizza(OVEN.x - 76, 792 - 132 + Math.sin(t * 6) * 4, 1.2, t * 2); }
  if (t >= T.iph - 0.1) { astronaut(HUT.x + 120, 792, 1.0, "happy", { t, acc: "#ff79c6", armL: 2.4, armR: -2.4 }); phoneS(HUT.x + 84, 792 - 128, 1.3, -0.2); phoneS(HUT.x + 156, 792 - 128, 1.3, 0.2); }
  if (t >= T.wohn - 0.1) { astronaut(FLAT.x + 110, 792, 1.0, "happy", { t, acc: "#ff8a2a", armR: -2.4 }); keyS(FLAT.x + 144, 792 - 132, 1.2, t); }
  if (t >= T.goyo - 0.1) { astronaut(LEO.x, LEO.y, 1.1, "happy", { t, acc: "#b06bff", armR: -2.4 }); plakat(LEO.x + 36, LEO.y - 165, 1.1, ["ICH BIN", "GOYO"]); }
  if (t >= T.law2 && t < T.name) { const up = easeOut(ramp(t, T.law2, T.law2 + 0.35)); astronaut(20, 792, 1.0, t >= T.top ? "smirk" : "talk", { t, armL: lerp(0.25, -0.55, up), armR: lerp(-0.25, 0.55, up) }); lawBook9(20, 792 - lerp(36, 50, up), 1.15 * (0.6 + 0.4 * up), t); }
  // Monster
  const m = monsterAt(t);
  if (t >= T.paw) { ctx.save(); ctx.translate(CAVE.x + 40 - 190 * easeOut(ramp(t, T.paw, T.paw + 0.5)), CAVE.y - 44); ctx.scale(-1, 1); bigPaw(0, 0, 1.15, t); ctx.restore(); }
  creature(m.x, m.y, m.s, t, { sit: m.sit, happy: t < T.cliff || t >= T.name, eyes: 1, look: t >= T.cliff && t < T.law2 ? 1 : 0, sniff: (t >= T.cliff && t < T.paw) || t >= T.loop, roar: t >= T.paw && t < T.law2 });
  if (t >= T.name) nameTag(m.x, m.y - 95, 0.72 * back(ramp(t, T.name + 0.1, T.name + 0.4)), t);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  // Höhle dunkel über der Pfote (sie kommt aus dem Schatten)
  if (t >= T.paw) { ctx.fillStyle = "rgba(18,8,28,0.55)"; ctx.beginPath(); ctx.moveTo(CAVE.x + 10, CAVE.y); ctx.bezierCurveTo(CAVE.x + 10, CAVE.y - 160, CAVE.x + 90, CAVE.y - 170, CAVE.x + 90, CAVE.y); ctx.fill(); }
  for (const [d] of CITY) { const t0 = T.heute + 0.15 + d; if (t >= t0 && t < t0 + 0.5) { /* kleine Staubwolke beim Aufploppen */ } }
  if (t >= T.heute + 0.2 && t < T.heute + 1.3) for (const [x] of [[700], [960], [1160], [1290]]) puffs(x, 716, t, T.heute + 0.25 + (x - 700) / 2500, 5);
  if (t >= T.stamp && t < T.stamp + 0.7) sparkleBurst(STONE.x, STONE.y - 120, t, T.stamp);
  if (t >= T.pres + 0.5 && t < T.pres + 1.3) sparkleBurst(PRES.x, PRES.y - 150, t, T.pres + 0.5);
  if (t >= T.cat + 0.35 && t < T.pizza) hearts(PHIL.x + 30, PHIL.y - 150, t);
  if (t >= T.cat + 0.35 && t < T.cat + 1.1) sparkleBurst(PHIL.x, PHIL.y - 80, t, T.cat + 0.35);
  if (t >= T.meo) { const [bx, by] = [MEO.x - 10, MEO.y - 190]; ctx.save(); ctx.fillStyle = "#e5262b"; rr(bx - 34, by - 12, 68, 24, 8); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "15px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText((Math.sin(t * 8) > 0 ? "● " : "○ ") + "LIVE", bx, by + 1); ctx.restore(); }
}

// ------------------------------------------------------------ Karten (sichere Zone)
function profileCard9(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16; ctx.fillStyle = "#121216"; rr(-212, -100, 424, 200, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "900 23px InterX"; ctx.fillText("Gedacht", -190, -70);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -190, -48);
  const n = Math.round(lerp(FOLLOWERS - NEU, FOLLOWERS, easeOut(ramp(t, T.card + 0.2, T.card + 0.8))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -190 + i * 100; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -20); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10px InterX"; ctx.fillText(l, x, -3); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-96, -38, 100, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-190, 18, 170, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -105, 35);
  ctx.fillStyle = "#2c2c33"; rr(-12, 18, 130, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 35);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea"; ctx.fillText("1 Follow = 1 Bewohner 🚀", -190, 70); ctx.fillText("Dein Kommentar kommt ins Video 💬", -190, 87);
  if (AV.me) { circle(160, -58, 36, "#fff"); ctx.save(); ctx.beginPath(); ctx.arc(160, -58, 33, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, 127, -91, 66, 66); ctx.restore(); }
  ctx.restore();
  const k = back(ramp(t, T.card + 0.6, T.card + 0.85)); if (k > 0) { ctx.save(); ctx.translate(SX - 60, 292); ctx.rotate(-0.12); ctx.scale(k * s, k * s); ctx.fillStyle = RED; rr(-70, -18, 140, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+" + NEU + " NEUE", 0, 2); ctx.restore(); }
}
function boardingPass9(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 250); ctx.rotate(-0.02); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-205, -70, 410, 140, 12); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.fillStyle = CYAN; rr(110, -70, 95, 140, [0, 12, 12, 0]); ctx.fill();
  ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, -64); ctx.lineTo(110, 64); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = CYAN; ctx.font = "900 13px InterX"; ctx.letterSpacing = "1.5px"; ctx.fillText("BORDKARTE", -185, -44); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#121a2a"; ctx.font = "900 42px InterX"; ctx.fillText("RAKETE 4", -187, -4);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 12px InterX"; ctx.fillText("Name: DU?  ·  Job: ???  ·  Ziel: ROTANIEN 2.0", -185, 40);
  ctx.restore();
  astronaut(SX + 158 * s, 250 + 34 * s, 0.45 * s, "happy", { t: 0 });
}
function nameCall(t, s) { // leere Kommentarkarte „Wie soll es heißen?“
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 155); ctx.scale(s, s); outlined("🏷 NAME GESUCHT", 0, 0, 40, "#fff", "#0e1a30", 10); ctx.restore();
  ctx.save(); ctx.translate(SX, 240); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-172, -6, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -5);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -142, -22);
  ctx.fillStyle = "#e3f8fd"; rr(-74, -32, 112, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("⭐ Top-Kommentar", -68, -21.5);
  ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("Wie soll es heißen? 🤔", -142, 4);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten  ·  Idee: Jens", -142, 27);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -10 + Math.sin(t * 6) * 2);
  ctx.restore();
}
function lawBook9(x, y, s, t) { // aufgeschlagenes Gesetzbuch: Nr. 1 steht drin, Nr. 2 ist noch offen
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#5a3a1a"; rr(-46, -30, 92, 54, 4); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-43, -27, 42, 48, 3); ctx.fill(); rr(1, -27, 42, 48, 3); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(-1, -27, 2, 48);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#3a2a1a"; ctx.font = "5.5px Comic"; ctx.fillText("GESETZ NR. 1", -22, -19);
  ctx.fillStyle = "#2fa84f"; ctx.font = "4.6px Comic"; ctx.fillText("JEDER BEKOMMT", -22, -9); ctx.fillText("EINEN JOB ✓", -22, -2);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 2; i++) ctx.fillRect(-36, 8 + i * 5, 28, 1.2);
  ctx.fillStyle = "#3a2a1a"; ctx.font = "5.5px Comic"; ctx.fillText("GESETZ NR. 2", 22, -19); ctx.fillStyle = RED; ctx.font = "24px Comic"; ctx.fillText("?", 22, 2 + Math.sin(t * 5) * 1.5);
  ctx.restore();
}
function lawCall9(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 155); ctx.scale(s, s); outlined("📜 GESETZ NR. 2", 0, 0, 40, "#fff", "#0e1a30", 10); ctx.restore();
  ctx.save(); ctx.translate(SX, 240); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-172, -6, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -5);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -142, -22);
  ctx.fillStyle = "#e3f8fd"; rr(-74, -32, 112, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("⭐ Top-Kommentar", -68, -21.5);
  ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("dein Gesetz? 🤔", -142, 4);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten", -142, 27);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -10 + Math.sin(t * 6) * 2);
  ctx.restore();
  ctx.save(); ctx.translate(SX, 310); ctx.scale(s, s); outlined("+ welchen Job willst du? 👇", 0, 0, 20, "#ffd23a", "#0e1a30", 6); ctx.restore();
}
const tk = (t, a, b, name, text, ago, av, y = 240) => card(() => tkComment(pop(t, a, b), name, text, ago, 0, av, y), y);

// ------------------------------------------------------------ Effekte
const IMPACTS = [T.stamp, T.cat + 0.35, T.paw, T.done, T.law2];
function shakeAt(t) { let dx = 0, dy = 0; for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.4) continue; const a = (t0 === T.stamp || t0 === T.paw ? 9 : 5) * Math.exp(-d * 10); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; } return [dx, dy]; }
const CUTS = CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.12 || Math.abs(c[1] - CAM[i][1]) > 120).map(c => c[0] - 0.05).filter(c => c > T.heute + 1);
function flash(t) { let a = 0; for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.22 * (1 - d / 0.14)); } if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); } }

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); drawWorld(t, z); ctx.restore();
  dust(t);
  if (t >= T.cliff && t < T.law2) { ctx.fillStyle = "rgba(20,5,30,0.35)"; ctx.fillRect(0, 0, W, H); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(30,5,30,0.4)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen (sichere Zone)
  const np = (txt, wx, wy, a, b, icon = "") => { const [sx, sy] = toScreen(wx, wy, t); pill(txt, Math.max(70, Math.min(sx, 410)), Math.max(125, sy), pop(t, a, b), "#fff", "#14223a", icon); };
  if (t < T.heute + 0.3 || t >= T.loop) { const a = t >= T.loop ? back(ramp(t, T.loop, T.loop + 0.15)) : 1 - ramp(t, T.heute + 0.1, T.heute + 0.3); ctx.save(); ctx.translate(SX, 175); ctx.scale(a, a); outlined("TAG 9", 0, 0, 86, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t >= T.heute + 0.3 && t < T.card) topLabel("🌙 ÜBER NACHT", pop(t, T.heute + 0.35, T.card - 0.05), "#fff", 160, 36, "#4a2b9a");
  if (t >= T.card && t < T.follow) { profileCard9(t, pop(t, T.card, T.follow - 0.06)); confetti(t, T.card + 0.5); }
  if (t >= T.follow && t < T.law) { boardingPass9(pop(t, T.follow + 0.1, T.law - 0.08)); topLabel("👥 NEUE BEWOHNER GESUCHT", pop(t, T.follow, T.law - 0.08), "#14223a", 140, 26, "#ffd23a"); }
  if (t >= T.law && t < T.pres) { topLabel("📜 KEIN GESETZ?", pop(t, T.law + 0.05, T.jobs - 0.05), "#fff", 150, 36, "#14223a"); topLabel("👷 IHR WOLLTET JOBS", pop(t, T.jobs, T.also - 0.05), "#14223a", 150, 34, "#ffd23a"); topLabel("📜 GESETZ NR. 1", pop(t, T.also, T.pres - 0.08), "#fff", 150, 40, RED); if (t >= T.stamp) confetti(t, T.stamp + 0.1); }
  if (t >= T.pres && t < T.luk) { tk(t, T.pres, T.luk - 0.1, "l.cgln16", "Kann ich President sein", "Vor 17 Std.", AV.lcgln); stamp("✓ ERFÜLLT", 360, 300, pop(t, T.pres + 0.6, T.luk - 0.1)); np("l.cgln16", PRES.x, PRES.y - 210, T.pres + 0.6, T.luk - 0.1, "👑 "); np("Janic", PRES.x + 100, PRES.y - 20, T.janic + 0.1, T.luk - 0.1); }
  if (t >= T.luk && t < T.meo) { tk(t, T.luk, T.meo - 0.1, "luk", "kann ich polizei sein", "Vor 10 Std.", AV.luk, 205); if (t >= T.sec) tk(t, T.sec, T.meo - 0.1, "einfachso", "wo bin ich will Security sein", "Vor 10 Std.", AV.einfachso, 312);
    np("luk", 330, 796 - 150, T.luk + 0.3, T.meo - 0.1, "👮 "); if (t >= T.sec) np("einfachso", 535, 796 - 150, T.sec + 0.3, T.meo - 0.1, "🛡 "); }
  if (t >= T.meo && t < T.phil) { tk(t, T.meo, T.phil - 0.1, "MEO", "kann ich youtuber sein", "Vor 10 Std.", AV.meo); stamp("✓ ERFÜLLT", 360, 300, pop(t, T.meo + 0.5, T.phil - 0.1)); np("MEO", MEO.x - 60, MEO.y - 40, T.meo + 0.3, T.phil - 0.1, "🎥 "); }
  if (t >= T.phil && t < T.pizza) { tk(t, T.phil, T.pizza - 0.1, "Phillip🗿", "Wann bekomme ich meine Orange Katze?", "Vor 19 Std.", AV.phillip); topLabel("🧡 4. ANFRAGE", pop(t, T.phil + 0.3, T.pizza - 0.1), "#fff", 138, 26, "#ff8a2a"); stamp("✓ ERFÜLLT", 360, 310, pop(t, T.cat + 0.4, T.pizza - 0.1)); np("Phillip", PHIL.x - 70, PHIL.y - 30, T.cat + 0.4, T.pizza - 0.1, "🐱 "); }
  if (t >= T.pizza && t < T.cliff) {
    for (const [a, b, txt, wx, wy, ic] of [[T.pizza, T.iph, "Alex", OVEN.x - 110, 792 - 190, "🍕 "], [T.iph, T.wohn, "Noam", HUT.x + 120, 792 - 190, "📱 "], [T.wohn, T.goyo, "Mehmet", FLAT.x + 110, 792 - 190, "🔑 "], [T.goyo, T.cliff, "Leonard", LEO.x - 50, LEO.y - 40, "✨ "]]) if (t >= a && t < b) np(txt, wx, wy, a + 0.05, b - 0.05, ic);
    const lab = t < T.iph ? "🍕 PIZZAOFEN ✓" : t < T.wohn ? "📱 2 IPHONES ✓" : t < T.goyo ? "🏠 WOHNUNG ✓" : t < T.done ? "✨ GOYO ✓" : "✅ ALLES ERLEDIGT";
    const t0 = t < T.iph ? T.pizza : t < T.wohn ? T.iph : t < T.goyo ? T.wohn : t < T.done ? T.goyo : T.done;
    topLabel(lab, pop(t, t0, 99, 0.14), t >= T.done ? "#fff" : "#14223a", 160, 36, t >= T.done ? "#2fa84f" : "#ffd23a");
  }
  if (t >= T.cliff && t < T.law2) topLabel("👀 WER IST DAS?", pop(t, T.paw, T.law2 - 0.05), "#fff", 160, 40, null);
  if (t >= T.law2 && t < T.name) { lawCall9(t, pop(t, T.law2, T.name - 0.08)); }
  if (t >= T.name && t < T.loop) { nameCall(t, pop(t, T.name, 99)); const b = pop(t, T.name + 0.5, 99); if (b > 0) { ctx.save(); ctx.translate(SX, 310); ctx.scale(b, b); outlined("Schreib einen Namen 👇", 0, 0, 20, "#ffd23a", "#0e1a30", 6); ctx.restore(); } }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const k of ["me", "lcgln", "luk", "einfachso", "meo", "phillip"]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = k + ".png"; });
  makeSprites();
  return { duration: DUR };
};
