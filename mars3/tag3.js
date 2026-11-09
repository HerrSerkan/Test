// ============================================================ Tag 3 (base.js + helpers3.js + tag3.js -> scene.js)
const T = {
  e630: wt(5), land: wt(7), count0: wt(9), count1: wt(13), card: wt(13) + 0.1, unauf: wt(18) - 0.05, top: wt(19), comment: wt(24), keine: wt(25),
  law: wt(27), lawWrite: wt(32), steuern: wt(35), gab: wt(36), sword: wt(39), els: wt(40), suit: wt(42), ente: wt(45), duck: wt(48),
  doner: wt(50), shop: wt(57), shopDone: wt(61), night: wt(62), funk: wt(67), alien: wt(71), alienEnd: wt(83), attack: wt(83), crater: wt(84), stolen: wt(88),
  fleet: wt(90), ufos: wt(95), together: wt(97), z630: wt(100), choose: wt(105), cardA: wt(108), cardB: wt(116), poll: wt(121), vote: wt(125),
  follow: wt(130), end: SPEECH_END,
};
const PASS_LABEL = "RAKETE 3";
const NEW = 611, FOLLOWERS = 629, LIKES = "3.858", FOLLOWING = "7";
const AV = {};

// ------------------------------------------------------------ Menge (630 Einwohner, als Sprites)
const SPR = {};
function makeSprites() {
  for (const acc of ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]) {
    const c = document.createElement("canvas"); c.width = 80; c.height = 150; const g = c.getContext("2d");
    const keep = ctx; ctx = g; ctx.setTransform(1, 0, 0, 1, 0, 0);
    // dunkler Umriss: einmal dick dunkel, dann normal darüber
    astronaut(40, 145, 1, "smile", { t: 0, acc }); ctx = keep;
    const o = document.createElement("canvas"); o.width = 88; o.height = 158; const og = o.getContext("2d");
    for (let i = 0; i < 8; i++) og.drawImage(c, 4 + Math.cos(i * 0.785) * 3, 4 + Math.sin(i * 0.785) * 3);
    og.globalCompositeOperation = "source-in"; og.fillStyle = "#1b1424"; og.fillRect(0, 0, 88, 158);
    og.globalCompositeOperation = "source-over"; og.drawImage(c, 4, 4);
    SPR[acc] = o;
  }
}
const MASS = (() => {
  const r = rng(8), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"];
  for (let i = 0; i < 520; i++) {
    const y = 600 + Math.pow(r(), 1.4) * 110, x = -500 + r() * 1700;
    if (y > 655 && x > 160 && x < 500) continue;           // vor der Kuppel freilassen
    a.push({ x, y, s: 0.22 + (y - 600) / 110 * 0.32, acc: keys[Math.floor(r() * keys.length)], ph: r() * 6 });
  }
  return a.sort((p, q) => p.y - q.y);
})();
function massCrowd(t, cheer) {
  for (const m of MASS) {
    const sp = SPR[m.acc]; if (!sp) continue;
    const hop = cheer ? Math.abs(Math.sin(t * 7 + m.ph)) * 6 * cheer : 0;
    const w = 88 * m.s, h = 158 * m.s;
    ctx.drawImage(sp, m.x - w / 2, m.y - h - hop, w, h);
  }
}
const BGROCKETS = (() => { const r = rng(12), a = []; for (let i = 0; i < 26; i++) a.push([-700 + i * 95 + r() * 40, 598 + r() * 8, 0.28 + r() * 0.12]); return a; })();
// benannte Astronauten vorne
const NAMED = { gab: { x: 560, y: 760, acc: "#3fd3f2" }, els: { x: 250, y: 762, acc: "#ff79c6" }, ente: { x: 620, y: 765, acc: "#ffd23a" } };

// ------------------------------------------------------------ Kamera
const CAM = [
  [0, 330, 560, 0.55], [T.e630 - 0.2, 330, 560, 0.6], [T.land - 0.2, 330, 560, 0.62], [T.land + 0.2, 335, 330, 1.1], [T.card - 0.1, 335, 330, 1.1],
  [T.unauf - 0.1, 335, 360, 1.0], [T.unauf + 0.3, 340, 620, 1.35], [T.top - 0.1, 360, 630, 1.45], [T.top + 0.25, 410, 650, 1.7],
  [T.law - 0.1, 410, 650, 1.7], [T.law + 0.2, 420, 650, 2.0], [T.gab - 0.15, 420, 650, 2.0], [T.gab + 0.25, NAMED.gab.x - 10, 690, 2.3],
  [T.els - 0.15, NAMED.gab.x - 10, 690, 2.3], [T.els + 0.25, NAMED.els.x + 10, 690, 2.3], [T.ente - 0.15, NAMED.els.x + 10, 690, 2.3],
  [T.ente + 0.25, NAMED.ente.x, 692, 2.3], [T.doner - 0.15, NAMED.ente.x, 692, 2.3], [T.doner + 0.3, 140, 640, 1.5], [T.night - 0.15, 140, 640, 1.5],
  [T.night + 0.3, 400, 645, 1.6], [T.attack - 0.1, 400, 645, 1.6], [T.attack + 0.3, 380, 600, 1.3], [T.crater - 0.1, 380, 600, 1.3], [T.crater + 0.35, 840, 800, 2.1], [T.fleet - 0.15, 860, 810, 2.25],
  [T.fleet + 0.4, 330, 260, 0.9], [T.together - 0.15, 330, 260, 0.9], [T.together + 0.3, 400, 650, 1.6], [T.choose - 0.1, 400, 650, 1.6],
  [T.choose + 0.3, 330, 300, 0.9], [T.poll - 0.15, 330, 300, 0.9], [T.poll + 0.3, 410, 650, 1.75], [T.end, 410, 650, 1.8], [DUR, 400, 645, 1.7],
];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) {
    const a = CAM[i - 1], b = CAM[i], k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
    return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k))];
  }
  return CAM.at(-1).slice(1);
}
const toScreen = (x, y, t) => { const [cx, cy, z] = cam(t); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z, z]; };

// ------------------------------------------------------------ Krater mit leerer Fahnenstange
const PAWS3 = (() => { const a = []; for (let i = 0; i < 14; i++) { const k = i / 13; a.push([lerp(590, 840, k) + (i % 2 ? 9 : -9), lerp(785, 830, k) + Math.sin(k * 5) * 6]); } return a; })();
function craterScene(t) {
  ctx.fillStyle = "#4a1c10";
  for (const [x, y] of PAWS3) { ctx.beginPath(); ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); for (const [dx, dy] of [[-6, -6], [-2, -8.5], [2, -8.5], [6, -6]]) { ctx.beginPath(); ctx.ellipse(x + dx, y + dy, 2, 2.4, 0, 0, Math.PI * 2); ctx.fill(); } }
  const x = 885, y = 845;
  ctx.fillStyle = "#7e3218"; ctx.beginPath(); ctx.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a120a"; ctx.beginPath(); ctx.ellipse(x, y + 3, 56, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,160,110,0.45)"; ctx.beginPath(); ctx.ellipse(x, y + 12, 70, 12, 0, 0.1, Math.PI - 0.1); ctx.fill();
  // leere Stange, schief im Krater stehen gelassen, mit Stofffetzen
  ctx.save(); ctx.translate(x + 10, y + 4); ctx.rotate(0.28);
  ctx.fillStyle = "#1b1424"; ctx.fillRect(-4.5, -152, 9, 152); ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -150, 6, 150);
  circle(0, -154, 9, "#1b1424"); circle(0, -154, 7.5, "#ffd23a");
  ctx.fillStyle = "#4a2b9a"; ctx.beginPath(); ctx.moveTo(3, -146); ctx.lineTo(22, -142); ctx.lineTo(12, -134); ctx.lineTo(20, -126); ctx.lineTo(3, -122); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------ Gegenstände
function book(x, y, s, state, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#8a6a3a"; rr(-34, -20, 68, 36, 3); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-32, -18, 31, 32, 2); ctx.fill(); rr(1, -18, 31, 32, 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#333"; ctx.font = "900 6px InterX"; ctx.fillText("GESETZ 1", -16, -11); ctx.fillText("GESETZ 2", 16, -11);
  ctx.fillStyle = RED; ctx.font = "7.5px Comic"; ctx.fillText("KEINE", -16, -1); ctx.fillText("SCHULE", -16, 7);
  const w = ramp(t, T.lawWrite - 0.2, T.lawWrite + 0.3);
  ctx.save(); ctx.beginPath(); ctx.rect(1, -6, 30 * w, 18); ctx.clip();
  ctx.fillStyle = RED; ctx.fillText("KEINE", 16, -1); ctx.fillText("STEUERN", 16, 7); ctx.restore();
  ctx.restore();
}
function sword(x, y, s, t) { // Hand-Position
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.45); ctx.scale(s, s);
  ctx.fillStyle = "#555"; rr(-3, -4, 6, 16, 2); ctx.fill();
  glow(0, -40, 34, "80,220,255", 0.7);
  ctx.strokeStyle = "#bff6ff"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -70); ctx.stroke();
  ctx.strokeStyle = "rgba(63,211,242,0.8)"; ctx.lineWidth = 11; ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 30); ctx.stroke();
  ctx.restore();
}
function dogEars(x, y, s) { // y = Helmmitte
  for (const d of [-1, 1]) {
    ctx.save(); ctx.translate(x + d * 33 * s, y - 6 * s); ctx.rotate(d * 0.25); ctx.scale(s * 0.85, s * 0.85);
    ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 12, 12, 21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c98a5a"; ctx.beginPath(); ctx.ellipse(0, 12, 10, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffb3d1"; ctx.beginPath(); ctx.ellipse(0, 12, 5, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function pinkSuit(x, y, s) { // färbt den Anzug rosa ein (über den weißen Körper)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = 0.55; ctx.fillStyle = "#ff79c6";
  rr(-22, -76, 44, 46, 14); ctx.fill(); rr(-17, -34, 14, 26, 6); ctx.fill(); rr(3, -34, 14, 26, 6); ctx.fill();
  ctx.restore();
}
function duck(x, y, s, t) { // Füße
  ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 6)) * 4); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -16, 22, 16, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -36, 13, "#1b1424");
  ctx.fillStyle = "#ffe14a"; ctx.beginPath(); ctx.ellipse(0, -16, 20, 14, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -36, 11, "#ffe14a");
  ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.moveTo(23, -38); ctx.lineTo(34, -34); ctx.lineTo(23, -31); ctx.fill();
  circle(17, -39, 2.3, "#1b1424");
  // kleiner Helm
  ctx.strokeStyle = "rgba(220,240,255,0.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(14, -36, 16, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function donerShop(x, y, s) { // Unterkante Mitte
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f4e3c4"; ctx.fillRect(-70, -90, 140, 90);
  ctx.fillStyle = "#e5442f"; ctx.beginPath(); ctx.moveTo(-80, -88); ctx.lineTo(80, -88); ctx.lineTo(70, -110); ctx.lineTo(-70, -110); ctx.fill();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#e5442f"; ctx.beginPath(); ctx.moveTo(-80 + i * 20, -88); ctx.lineTo(-60 + i * 20, -88); ctx.lineTo(-62 + i * 20, -74); ctx.lineTo(-78 + i * 20, -74); ctx.fill(); }
  ctx.fillStyle = "#2a2a30"; rr(-58, -150, 116, 36, 6); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.font = "26px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DÖNER", 0, -130);
  ctx.fillStyle = "#9ad3f0"; ctx.fillRect(-58, -62, 60, 40);
  // Spieß im Fenster
  ctx.fillStyle = "#a0522d"; ctx.beginPath(); ctx.moveTo(-36, -60); ctx.lineTo(-20, -60); ctx.lineTo(-24, -26); ctx.lineTo(-32, -26); ctx.fill();
  ctx.fillStyle = "#6b3a1e"; ctx.fillRect(16, -60, 34, 60);
  ctx.restore();
}
function ufo(x, y, s, t, i) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 4); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7c8a9a"; ctx.beginPath(); ctx.ellipse(0, 0, 37, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(140,255,120,0.85)"; ctx.beginPath(); ctx.ellipse(0, -7, 16, 12, 0, Math.PI, 0); ctx.fill();
  for (let k = -2; k <= 2; k++) circle(k * 14, 3, 2.6, (k + Math.floor(t * 6) + i) % 2 ? "#ffd23a" : "#ff4b6e");
  ctx.restore();
}
function phobosBig(x, y, r) {
  circle(x, y, r + 3, "#1b1424"); circle(x, y, r, "#8e7d70");
  for (const [dx, dy, cr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.22], [-0.05, 0.35, 0.12], [0.35, -0.35, 0.1]]) circle(x + dx * r, y + dy * r, cr * r, "#74655a");
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.15, r, 0, Math.PI * 2); ctx.fill();
}
function alienFace(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 46, 54, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5fd35a"; ctx.beginPath(); ctx.ellipse(0, 0, 43, 51, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1b1424"; for (const d of [-1, 1]) { ctx.save(); ctx.translate(d * 18, -4); ctx.rotate(d * -0.4); ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 30, -24); ctx.lineTo(d * 8, -16); ctx.stroke(); }
  const m = 4 + Math.abs(Math.sin(t * 16)) * 6; ctx.beginPath(); ctx.ellipse(0, 26, 12, m * 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = "#1b1424"; ctx.fill();
  ctx.restore();
}
function tvBreaking(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 260); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-236, -150, 472, 300, 14); ctx.fill();
  ctx.fillStyle = "#0b1020"; rr(-228, -112, 456, 196, 6); ctx.fill();
  ctx.fillStyle = "#e5262b"; rr(-228, -142, 456, 30, [8, 8, 0, 0]); ctx.fill();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.fillText("🔴 EILMELDUNG", -216, -126);
  ctx.fillStyle = "#fff"; rr(110, -136, 108, 20, 4); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.font = "900 10px InterX"; ctx.fillText("LIVE · AUS DEM ALL", 116, -126);
  // Sterne + Alien mit unserer Fahne
  for (let i = 0; i < 30; i++) circle(-220 + (i * 61) % 440, -100 + (i * 37) % 180, 1.2, "rgba(255,255,255,0.6)");
  ctx.save(); ctx.beginPath(); ctx.rect(-228, -112, 456, 196); ctx.clip();
  ctx.save(); ctx.translate(70, 60); ctx.rotate(0.15);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -120, 6, 160);
  ctx.fillStyle = "#4a2b9a"; ctx.fillRect(3, -118, 80, 52);
  ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(43, -92, 22, 6, -0.2, 0, Math.PI * 2); ctx.stroke(); circle(43, -92, 12, "#e2552e");
  ctx.restore();
  alienFace(-20, 10, 1.25 + 0.03 * Math.sin(t * 3), t);
  ctx.restore();
  // Bauchbinde + Laufband
  ctx.fillStyle = "#ffd23a"; ctx.fillRect(-228, 84, 456, 30);
  ctx.fillStyle = "#1b1424"; ctx.font = "16px Comic"; ctx.fillText("BOTSCHAFT AN ROTANIEN: „DIESER PLANET GEHÖRT UNS!“", -218, 99.5);
  ctx.fillStyle = "#1b1424"; ctx.fillRect(-228, 114, 456, 26);
  ctx.save(); ctx.beginPath(); ctx.rect(-228, 114, 456, 26); ctx.clip();
  ctx.fillStyle = "#ffd23a"; ctx.font = "15px Comic"; const tick = "+++ ULTIMATUM +++ ANGRIFF IN 24 STUNDEN +++ UNSERE FAHNE GESICHTET +++ ALIEN-FLOTTE HINTER DEM MOND ";
  const off = -((t - T.alien) * 120) % 700; ctx.fillText(tick + tick, -228 + off, 128);
  ctx.restore();
  ctx.restore();
}
function choiceCard(icon, txt, x, y, s, rot) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-90, -80, 180, 160, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 5; ctx.stroke();
  ctx.font = "54px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(icon, 0, -22);
  ctx.fillStyle = "#1b1424"; ctx.font = "28px Comic"; ctx.fillText(txt, 0, 46);
  ctx.restore();
}
function pollCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 230); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-230, -90, 460, 180, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("📊 Abhauen oder kämpfen?", -206, -58);
  const k = ramp(t, T.vote, T.vote + 1.2);
  [["🚀 Abhauen", 0.38], ["⚔️ Kämpfen", 0.62]].forEach(([l, p], i) => {
    const y = -14 + i * 52;
    ctx.fillStyle = "#eef1f5"; rr(-206, y - 19, 412, 38, 10); ctx.fill();
    ctx.fillStyle = i ? "rgba(255,64,64,0.35)" : "rgba(63,211,242,0.4)"; rr(-206, y - 19, 412 * p * k + 0.1, 38, 10); ctx.fill();
    ctx.fillStyle = "#111"; ctx.font = "800 17px InterX, 'Noto Color Emoji'"; ctx.fillText(l, -192, y + 1);
  });
  ctx.fillStyle = "#8a8f9a"; ctx.font = "700 11px InterX"; ctx.fillText("Umfrage · in den Kommentaren", -206, 78);
  ctx.restore();
}
function profileCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16;
  ctx.fillStyle = "#121216"; rr(-245, -105, 490, 210, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.font = "900 24px InterX"; ctx.fillText("Gedacht", -222, -76);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -222, -54);
  const n = Math.round(lerp(18, FOLLOWERS, easeOut(ramp(t, T.card + 0.1, T.card + 0.7))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -222 + i * 110; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -24); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10.5px InterX"; ctx.fillText(l, x, -6); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-118, -40, 104, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-222, 16, 190, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -127, 33);
  ctx.fillStyle = "#2c2c33"; rr(-22, 16, 150, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 33);
  ctx.fillStyle = "#2c2c33"; rr(136, 16, 40, 34, 6); ctx.fill(); ctx.fillText("👤", 156, 33);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea";
  ctx.fillText("1 Follow = 1 Astronaut 🚀", -222, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -222, 88);
  ctx.restore();
  avatarBadge(288 + 190 * s, 250 - 60 * s, 0.9 * s, 0);
  const k = back(ramp(t, T.card + 0.5, T.card + 0.75));
  if (k > 0) { ctx.save(); ctx.translate(205, 290); ctx.rotate(-0.12); ctx.scale(k * s, k * s); ctx.fillStyle = RED; rr(-78, -18, 156, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+611 NEUE", 0, 2); ctx.restore(); }
}
function counterTimer(t, s) {
  if (s <= 0.01) return;
  const left = Math.max(0, 24 * 3600 - 1 - Math.floor((t - T.attack) * 3600 / 8));
  const hh = String(Math.floor(left / 3600)).padStart(2, "0"), mm = String(Math.floor(left / 60) % 60).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-150, -36, 300, 72, 12); ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = RED; ctx.font = "900 48px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`${hh}:${mm}:${ss}`, 0, 2);
  ctx.restore();
}

// ------------------------------------------------------------ Effekte
const IMPACTS = [T.e630, T.card + 0.5, T.lawWrite, T.shopDone, T.alien, T.attack, T.stolen, T.z630, T.cardA, T.cardB];
function shakeAt(t) {
  let dx = 0, dy = 0;
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.35) continue; const a = 7 * Math.exp(-d * 12); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  return [dx, dy];
}
const CUTS = CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05);
function flash(t) {
  let a = 0; for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.22 * (1 - d / 0.14)); }
  for (const t0 of [T.e630, T.alien, T.night]) { const d = t - t0; if (d >= 0 && d < 0.2) a = Math.max(a, 0.5 * (1 - d / 0.2)); }
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
}
const MONEY = (() => { const r = rng(55), a = []; for (let i = 0; i < 26; i++) a.push({ x: r() * W, d: r() * 0.8, v: 260 + r() * 260, rot: r() * 6, sp: (r() - 0.5) * 6, e: r() < 0.6 ? "💸" : "🪙" }); return a; })();
function moneyRain(t, t0) {
  ctx.save(); ctx.font = "34px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const m of MONEY) { const d = t - t0 - m.d; if (d < 0 || d > 1.5) continue; ctx.save(); ctx.globalAlpha = Math.min(1, (1.5 - d) * 3); ctx.translate(m.x, -30 + d * m.v * 1.6); ctx.rotate(m.rot + d * m.sp); ctx.fillText(m.e, 0, 0); ctx.restore(); }
  ctx.restore();
}
function sparkleBurst(x, y, t, t0) {
  const d = t - t0; if (d < 0 || d > 0.7) return;
  ctx.save(); ctx.globalAlpha = 1 - d / 0.7; ctx.fillStyle = "#fff7a8";
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = 20 + d * 120, sz = 7 * (1 - d / 0.7) + 2;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8;
    ctx.beginPath(); ctx.moveTo(px, py - sz * 1.8); ctx.lineTo(px + sz * 0.5, py - sz * 0.5); ctx.lineTo(px + sz * 1.8, py); ctx.lineTo(px + sz * 0.5, py + sz * 0.5);
    ctx.lineTo(px, py + sz * 1.8); ctx.lineTo(px - sz * 0.5, py + sz * 0.5); ctx.lineTo(px - sz * 1.8, py); ctx.lineTo(px - sz * 0.5, py - sz * 0.5); ctx.fill(); }
  ctx.restore();
}
function speedLines(t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.35 * a; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
  const r = rng(Math.floor(t * 20));
  for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H * 0.7, l = 60 + r() * 120; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + l); ctx.stroke(); }
  ctx.restore();
}
function glitch(t, t0) { // RGB-Versatz + Scanlines über dem Alien-TV
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = "#000"; for (let y = 140; y < 400; y += 4) ctx.fillRect(58, y, 460, 2); ctx.restore();
  const d = t - t0, burst = d < 0.35 || (Math.sin(t * 7) > 0.97);
  if (burst) { const r = rng(Math.floor(t * 30)); ctx.save(); ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? "rgba(255,0,80,0.25)" : "rgba(0,255,220,0.25)"; ctx.fillRect(58 + r() * 40 - 20, 120 + r() * 260, 460, 6 + r() * 14); }
    ctx.restore(); }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  let [cx, cy, z] = cam(t);
  cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
  const [shx, shy] = shakeAt(t);
  ctx.translate(shx, shy);
  const night = t >= T.night ? ramp(t, T.night, T.night + 0.6) : 0;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  sky(t); ground();
  // Alien-Flotte hinter Phobos
  if (t >= T.fleet - 0.3) {
    phobosBig(330, 150, 70);
    const k = ramp(t, T.ufos - 0.6, T.ufos + 0.6);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rr2 = 110 + (i % 3) * 45; if (k * 14 > i) ufo(330 + Math.cos(a) * rr2 * 1.4, 150 + Math.sin(a) * rr2 * 0.55, 0.55 + (i % 3) * 0.12, t, i); }
  }
  for (const [x, y, s] of BGROCKETS) rocket(x, y, s, 0);
  craterScene(t);
  massCrowd(t, (t >= T.unauf && t < T.top) || (t >= T.together && t < T.choose) ? 1 : 0);
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  boulders(); dome(330, 690); sign(445, 690);
  rocket(150, 690, 0.95, 0); rocket(-80, 700, 0.95, 0); rocket(720, 700, 0.95, 0);
  // landende Raketen (Anflug)
  for (let i = 0; i < 3; i++) { const k = 1 - Math.pow(1 - clamp(ramp(t, T.land + i * 0.35, T.count1 + i * 0.3)), 2); if (k > 0 && k < 1) rocket(-300 + i * 420, lerp(-500, 640, k), 0.7, 1); }
  // Dönerladen links neben der Kuppel
  if (t >= T.shop) donerShop(30, 705, back(ramp(t, T.shop, T.shop + 0.35)) * 0.95);
  // benannte Astronauten
  const sz = 1.0;
  const g = NAMED.gab, e = NAMED.els, d = NAMED.ente;
  astronaut(g.x, g.y, sz, t >= T.sword ? "happy" : "talk", { t, acc: g.acc, armR: t >= T.sword ? -2.2 : -0.25 });
  astronaut(e.x, e.y, sz, t >= T.suit ? "happy" : "smile", { t: t + 1, acc: "#ff79c6", wave: t >= T.suit && t < T.ente });
  if (t >= T.suit) { pinkSuit(e.x, e.y, sz * clamp((t - T.suit) / 0.2)); dogEars(e.x, e.y - 104 * sz, sz * back(ramp(t, T.suit, T.suit + 0.3))); }
  astronaut(d.x, d.y, sz, t >= T.duck ? "happy" : "smile", { t: t + 2, acc: d.acc });
  if (t >= T.duck) duck(d.x + 52, d.y, 0.9 * back(ramp(t, T.duck, T.duck + 0.3)), t);
  // Hauptfigur
  let face = "talk", o = { t };
  if (t >= T.e630) { face = "happy"; o.armR = -2.5; }
  if (t >= T.land) { face = "talk"; o.armR = -0.25; }
  if (t >= T.unauf) { face = "happy"; o.wave = true; }
  if (t >= T.top) { o.wave = false; face = "talk"; }
  if (t >= T.law) { face = "happy"; o.hold = "law2"; o.armL = -0.5; o.armR = 0.5; }
  if (t >= T.gab) { o.hold = null; face = "smile"; o.armL = 0.25; o.armR = -0.25; }
  if (t >= T.shopDone) { face = "happy"; o.armR = -2.5; }
  if (t >= T.night) { face = "shock"; o.armR = -0.25; }
  if (t >= T.together) { face = "smirk"; o.armL = 2.6; o.armR = -2.6; }
  if (t >= T.choose) { face = "think"; o.armL = 0.25; o.armR = -2.9; }
  if (t >= T.poll) { face = "talk"; o.armR = -0.25; }
  if (t >= T.follow) { face = "happy"; o.wave = true; }
  astronaut(430, 742, 1, face, o);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  if (t >= T.sword) { const [hx, hy] = [g.x + 45, g.y - 87]; sword(hx, hy, back(ramp(t, T.sword, T.sword + 0.3)), t); }
  if (t >= T.shop) puffs(30, 712, t, T.shop);
  ctx.restore();
  dust(t);
  // Nacht + rotes Alarmlicht
  if (night > 0) {
    ctx.fillStyle = `rgba(30,10,40,${0.35 * night})`; ctx.fillRect(0, 0, W, H);
    if (t < T.together) { const pulse = 0.5 + 0.5 * Math.sin(t * 6); const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); rg.addColorStop(0, "rgba(255,0,0,0)"); rg.addColorStop(1, `rgba(220,20,20,${0.45 * night * pulse})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
  }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.45)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  speedLines(t, t >= T.count0 && t < T.card ? 1 : 0);
  if (t >= T.steuern) moneyRain(t, T.steuern - 0.4);
  for (const [c, t0] of [[NAMED.gab, T.sword], [NAMED.els, T.suit], [NAMED.ente, T.duck]]) if (t >= t0 && t < t0 + 0.8) { const [sx, sy] = toScreen(c.x, c.y - 100, t); sparkleBurst(sx, sy, t, t0); }
  if (t >= T.shopDone && t < T.night) { const [sx, sy] = toScreen(30, 600, t); sparkleBurst(sx, sy, t, T.shopDone); }

  // ---- Einblendungen
  const tag = pop(t, 0.12, T.e630 - 0.15);
  if (tag > 0) { ctx.save(); ctx.translate(288, 190); ctx.scale(tag, tag); outlined("TAG 3", 0, 0, 92, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t >= T.e630 && t < T.land) {
    const a = pop(t, T.e630, T.land - 0.12);
    ctx.save(); ctx.globalAlpha = 0.4; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t; ctx.fillStyle = CYAN; ctx.beginPath(); ctx.moveTo(288, 220); ctx.arc(288, 220, 420, an, an + 0.12); ctx.fill(); } ctx.restore();
    ctx.save(); ctx.translate(288, 210); ctx.scale(a, a); outlined("630", 0, 0, 110, CYAN, "#0e1a30", 14); outlined("EINWOHNER! 🎉", 0, 70, 30, "#fff", "#0e1a30", 8); ctx.restore();
    confetti(t, T.e630);
  }
  if (t >= T.count0 - 0.1 && t < T.card) {
    const n = Math.round(NEW * easeIO(ramp(t, T.count0, T.count1)));
    const a = pop(t, T.count0 - 0.1, T.card - 0.1, 0.2);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("+" + n, 0, 0, 92, CYAN, "#0e1a30", 13); outlined("NEUE ASTRONAUTEN", 0, 60, 26, "#fff", "#0e1a30", 7); ctx.restore();
  }
  if (t >= T.card && t < T.unauf) { profileCard(t, pop(t, T.card, T.unauf - 0.12)); confetti(t, T.card + 0.4); }
  pill("UNAUFHALTSAM", 288, 190, pop(t, T.unauf + 0.05, T.top - 0.12), "#fff", "#14223a", "✊ ");
  pill("TOP-KOMMENTAR", 288, 165, pop(t, T.top, T.law - 0.15), "#fff", "#14223a", "👑 ");
  tkComment(pop(t, T.comment - 0.1, T.law - 0.15), "Luca", "Keine Steuern", "Vor 16 Std.", 1, AV.luca, 265);
  if (t >= T.law && t < T.gab) {
    const a = pop(t, T.law, T.gab - 0.15);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("📜 GESETZ NR. 2", 0, 0, 44, "#fff", "#0e1a30", 10); ctx.restore();
    if (t >= T.lawWrite) { const b = pop(t, T.lawWrite, T.gab - 0.15); ctx.save(); ctx.translate(288, 258); ctx.rotate(-0.04); ctx.scale(b, b); outlined("KEINE STEUERN! 💸", 0, 0, 40, RED, "#0e1a30", 10); ctx.restore(); }
    confetti(t, T.steuern);
  }
  tkComment(pop(t, T.gab, T.els - 0.15), "Gabriel Emilijan", "Laserschwert haben", "Vor 15 Std.", 1, AV.gabriel, 215);
  stamp("✓ ERFÜLLT", 420, 262, pop(t, T.sword + 0.15, T.els - 0.15));
  tkComment(pop(t, T.els, T.ente - 0.15), "elster", "Kann ich ein Astronaut sein mit Hundeohren und einen pinken Anzug?", "Vor 10 Std.", 4, AV.elster, 215);
  stamp("✓ ERFÜLLT", 420, 292, pop(t, T.suit + 0.4, T.ente - 0.15));
  tkComment(pop(t, T.ente, T.doner - 0.15), "Entenlover", "Astronaut Nummer 410 wil ein enten Freund", "Vor 5 Std.", 4, AV.ente, 215);
  stamp("✓ ERFÜLLT", 420, 268, pop(t, T.duck + 0.2, T.doner - 0.15));
  if (t >= T.gab && t < T.doner) {
    const c = t < T.els ? g : t < T.ente ? e : d, lab = t < T.els ? "Gabriel" : t < T.ente ? "elster" : "Nr. 410";
    const [sx, sy] = toScreen(c.x, c.y - 150, t);
    pill(lab, sx, sy, pop(t, t < T.els ? T.gab + 0.2 : t < T.ente ? T.els + 0.2 : T.ente + 0.2, t < T.els ? T.els - 0.15 : t < T.ente ? T.ente - 0.15 : T.doner - 0.15), "#fff", "#14223a");
  }
  label("MEISTGEWÜNSCHT: DÖNER 🥙", 288, 210, pop(t, T.doner + 0.1, T.shop - 0.1), "#ff8a2a");
  stamp("✓ ERÖFFNET", 300, 250, pop(t, T.shopDone, T.night - 0.15));
  label("⚠ EINGEHENDER FUNKSPRUCH", 288, 210, pop(t, T.funk - 0.1, T.alien - 0.1));
  if (t >= T.alien && t < T.attack) { tvBreaking(t, pop(t, T.alien, T.attack - 0.12, 0.25)); glitch(t, T.alien); }
  if (t >= T.attack && t < T.together) {
    label("⏳ ANGRIFF IN 24 STUNDEN", 288, 175, pop(t, T.attack, T.together - 0.15));
    counterTimer(t, pop(t, T.attack + 0.1, T.crater + 0.15) * (1 + 0.04 * Math.max(0, Math.sin(t * Math.PI * 4))));
    label("UNSERE FAHNE?! 🚩", 288, 250, pop(t, T.crater + 0.35, T.fleet - 0.1), "#4a2b9a");
    label("GEKLAUT! 👽", 300, 315, pop(t, T.stolen, T.fleet - 0.1));
  }
  if (t >= T.together && t < T.choose) {
    const a = pop(t, T.z630, T.choose - 0.12);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("630", 0, 0, 92, CYAN, "#0e1a30", 13); outlined("✊ ZUSAMMEN", 0, 58, 30, "#fff", "#0e1a30", 8); ctx.restore();
  }
  if (t >= T.choose && t < T.poll) {
    const out = 1 - ramp(t, T.poll - 0.15, T.poll);
    choiceCard("🚀", "ABHAUEN", 160, 300, back(ramp(t, T.cardA, T.cardA + 0.3)) * out, -0.08);
    if (t >= T.cardB) { const b = back(ramp(t, T.cardB, T.cardB + 0.3)) * out; ctx.save(); ctx.translate(288, 300); ctx.scale(b, b); outlined("ODER", 0, 0, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
    choiceCard("⚔️", "KÄMPFEN", 416, 300, back(ramp(t, T.cardB, T.cardB + 0.3)) * out, 0.08);
  }
  if (t >= T.poll && t < T.follow) {
    pollCard(t, pop(t, T.poll, T.follow - 0.12));
    if (t >= T.vote) { const b = pop(t, T.vote, T.follow - 0.12); ctx.save(); ctx.translate(288, 360); ctx.scale(b, b); outlined("STIMM AB! 👇", 0, 0, 40, CYAN, "#0e1a30", 10); ctx.restore(); }
  }
  if (t >= T.follow) {
    avatarBadge(288, 210, pop(t, T.follow, DUR - 0.2), ramp(t, wt(131), wt(131) + 0.25));
    if (t >= wt(133)) { const b = pop(t, wt(133), DUR - 0.2); ctx.save(); ctx.translate(288, 300); ctx.scale(b, b); outlined("JEDER ASTRONAUT", 0, -20, 34, "#fff", "#0e1a30", 9); outlined("ZÄHLT!", 0, 20, 34, CYAN, "#0e1a30", 9); ctx.restore(); }
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  // Untertitel; Alien-Funk in grüner Box
  if (t >= T.alien - 0.05 && t < T.alienEnd - 0.05) {
    ctx.save(); ctx.translate(288, 795);
    ctx.fillStyle = "rgba(10,30,15,0.92)"; rr(-210, -34, 420, 62, 12); ctx.fill(); ctx.strokeStyle = "#5fd35a"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#5fd35a"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("👽 ALIEN-FUNK", 0, -44);
    ctx.restore();
  }
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, land: T.land, count: [T.count0, T.count1], card: T.card, e630: T.e630,
    pops: [T.unauf + 0.1, T.top, T.comment - 0.1, T.law, T.lawWrite, T.gab, T.els, T.ente, T.doner + 0.1, T.shop, T.attack, T.together, T.cardA, T.cardB, T.poll, T.vote, T.follow],
    dings: [T.sword + 0.15, T.suit + 0.4, T.duck + 0.2, T.shopDone], sword: T.sword, duck: T.duck, confetti: [T.e630, T.card + 0.4, T.steuern],
    night: T.night, funk: T.funk, alien: [T.alien, T.alienEnd], ufos: T.ufos, end: T.end, impacts: IMPACTS, steuern: T.steuern, shop: T.shop,
    attack: T.attack, fleet: T.fleet, check: wt(131), vote: T.vote, rockets: [T.land, T.count1],
    whooshes: CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.25) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const n of ["luca", "gabriel", "elster", "ente"]) AV[n] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = n + ".png"; });
  makeSprites();
  return { duration: DUR };
};
