// ============================================================ Tag 5 „Rotanien zerstört“ (base.js + helpers3.js + lib4.js + lib5.js + tag5.js -> scene.js)
// Ablauf 1:1 wie Tag 5 im Original, alle Zeiten hängen an den gesprochenen Wörtern (build/words.json).
const T = {
  rew: wt(7), night: wt(11) + 0.3, poll: wt(12), polls: wt(20), held: wt(21), whole: wt(25), party: wt(28), won: wt(35),
  four: wt(36), clock: wt(38), msIn: wt(40), msLab: wt(43), bigger: wt(44), still: wt(48), keiner: wt(53), shotPre: wt(56) + 0.45,
  shot: wt(59), bar51: wt(60) + 0.1, bar0: wt(62), shatter: wt(64),
  werft: wt(65), werftX: wt(68), funk: wt(69), funkX: wt(71), wach: wt(72), wachX: wt(74), doner: wt(75), donerX: wt(77),
  houses: wt(78), housesX: wt(80), run: wt(82), last: wt(89), noRoom: wt(98), hatch: wt(101), cd2: wt(106), cd1: wt(110),
  start: wt(114), lift: wt(115), core: wt(118), coreX: wt(120), planet: wt(123), crack: wt(126), days: wt(130), minute: wt(139),
  row: wt(143), rest: wt(156), chase: wt(163), fuel: wt(165), follow: wt(167), seek: wt(178), where: wt(183), loop: SPEECH_END + 0.25,
};
const FOLLOWERS = 822;
const AV = {};
const scene = t => t < T.planet ? "world" : t < T.row ? "space" : t < T.chase ? "row" : "chase";

// ------------------------------------------------------------ Zerstörung: wann ist was kaputt?
const DESTROY = { werft: T.werftX, funk: T.funkX, wach: T.wachX, doner: T.donerX, houses: T.housesX, dome: T.housesX + 0.35, core: T.coreX };
const ruined = (k, t) => t < T.rew + 0.25 || t >= DESTROY[k];
// Explosionen (Welt): [Zeit, x, y, Größe]
const EXPL = [
  [T.werftX, -180, 520, 1.6], [T.werftX + 0.12, -120, 650, 1.0], [T.funkX, 1000, 420, 1.5], [T.funkX + 0.1, 990, 620, 1.0],
  [T.wachX, 790, 520, 1.3], [T.wachX + 0.1, -430, 520, 1.2], [T.donerX, 30, 620, 1.3],
  [T.housesX, 120, 620, 1.2], [T.housesX + 0.1, 330, 600, 1.6], [T.housesX + 0.2, 560, 630, 1.1], [T.housesX + 0.3, -300, 620, 1.1], [T.housesX + 0.35, 760, 620, 1.0],
  [T.coreX, 620, 520, 1.8], [T.coreX + 0.12, 640, 660, 1.2],
];
// rote Strahlen vom Mutterschiff auf die Ziele (kurz vor der Explosion)
const RAYS = EXPL.filter((e, i) => i % 2 === 0 || e[0] === T.housesX + 0.2).filter(e => e[0] < T.coreX).map(e => [e[0] - 0.22, e[1], e[2] + 80]);
// Feuer an den Ruinen
const FIRES = [[-180, 690, 1.3], [-120, 700, 0.9], [1000, 695, 1.2], [790, 708, 0.9], [-430, 708, 0.9], [30, 700, 1.1], [330, 685, 1.6],
  [300, 694, 0.8], [440, 690, 0.9], [560, 640, 0.7], [-300, 640, 0.7], [760, 640, 0.7], [620, 705, 1.2], [-560, 650, 0.7], [900, 650, 0.6]];
const fireOn = (x, t) => t < T.rew + 0.25 || (x < -300 ? t >= T.wachX : x < -60 ? t >= T.werftX : x < 90 ? t >= T.donerX : x > 950 ? t >= T.funkX : x > 700 ? t >= T.wachX : x > 600 && x < 660 ? t >= T.coreX : t >= T.housesX);

// ------------------------------------------------------------ neue Zeichnungen
function flame(x, y, s, t, seed) { // Feuer (Unterkante)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(0, -30, 90, "255,120,30", 0.35 + 0.1 * Math.sin(t * 9 + seed));
  for (const [c, w, h] of [["#e5262b", 30, 70], ["#ff8a1e", 22, 54], ["#ffd23a", 13, 34]]) {
    const f = 1 + 0.18 * Math.sin(t * 13 + seed * 3) + 0.1 * Math.sin(t * 21 + seed);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w, 0);
    ctx.quadraticCurveTo(-w * 1.1, -h * 0.5 * f, Math.sin(t * 7 + seed) * 6, -h * f);
    ctx.quadraticCurveTo(w * 1.1, -h * 0.5 * f, w, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function smoke(x, y, s, t, seed) {
  for (let i = 0; i < 5; i++) {
    const k = ((t * 0.35 + i / 5 + seed * 0.13) % 1);
    ctx.globalAlpha = 0.45 * (1 - k); circle(x + Math.sin(seed + i * 2 + t) * 20 * k, y - 60 * s - k * 260 * s, (18 + 50 * k) * s, "#2b2230");
  }
  ctx.globalAlpha = 1;
}
function rubble(x, y, w) {
  const r = rng(Math.round(x * 7 + y));
  for (let i = 0; i < 9; i++) {
    const px = x + (r() - 0.5) * w * 1.6, sz = (8 + r() * 18) * w / 60;
    ctx.fillStyle = ["#5a4a52", "#7b6b70", "#3e3239", "#c9cfd5"][i % 4];
    ctx.beginPath(); ctx.moveTo(px - sz, y); ctx.lineTo(px - sz * 0.4, y - sz * (0.8 + r())); ctx.lineTo(px + sz * 0.7, y - sz * 0.6); ctx.lineTo(px + sz, y); ctx.fill();
  }
}
function explosion(t, t0, x, y, s) {
  const d = t - t0; if (d < 0 || d > 1.1) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const k = easeOut(d / 0.5), fade = 1 - clamp((d - 0.35) / 0.75);
  glow(0, 0, 260 * k, "255,150,40", 0.9 * fade);
  ctx.globalAlpha = fade; circle(0, 0, 120 * k, "#ff8a1e"); circle(0, 0, 85 * k, "#ffd23a"); circle(0, 0, 45 * k * (1 - d), "#fff7d0");
  ctx.strokeStyle = `rgba(255,240,200,${0.8 * (1 - clamp(d / 0.4))})`; ctx.lineWidth = 10 * (1 - clamp(d / 0.4)); ctx.beginPath(); ctx.arc(0, 0, 60 + 260 * clamp(d / 0.4), 0, Math.PI * 2); ctx.stroke();
  const r = rng(Math.round(x + y));
  for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, v = 160 + r() * 260; ctx.fillStyle = i % 2 ? "#3e3239" : "#ffb43a"; ctx.fillRect(Math.cos(a) * v * d - 5, Math.sin(a) * v * d + 300 * d * d - 5, 10, 10); }
  ctx.restore();
}
function brokenDome(x, y) { // eingestürzte Regierungskuppel
  ctx.save();
  ctx.fillStyle = "rgba(170,215,232,0.55)"; ctx.beginPath(); ctx.moveTo(x - 150, y); ctx.lineTo(x - 140, y - 60); ctx.lineTo(x - 95, y - 105); ctx.lineTo(x - 60, y - 70); ctx.lineTo(x - 20, y - 120); ctx.lineTo(x + 20, y - 60); ctx.lineTo(x + 70, y - 95); ctx.lineTo(x + 110, y - 40); ctx.lineTo(x + 150, y); ctx.fill();
  ctx.strokeStyle = "#cfd6dc"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 150, y); ctx.lineTo(x - 140, y - 60); ctx.lineTo(x - 95, y - 105); ctx.moveTo(x + 70, y - 95); ctx.lineTo(x + 110, y - 40); ctx.lineTo(x + 150, y); ctx.stroke();
  ctx.fillStyle = "#cfd6dc"; rr(x - 156, y - 8, 312, 14, 4); ctx.fill();
  ctx.restore();
  rubble(x, y, 110);
}
function tiltedSign(x, y) { // REGIERUNG-Schild hängt schief
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.35); ctx.translate(-x, -y); sign(x, y); ctx.restore();
}
function donerShop5(x, y, s, t) { // Dönerladen „SAFUAN“ (Wunsch von kazeyaha)
  donerShop(x, y, s);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#2a2a30"; rr(-62, -152, 124, 40, 6); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.font = "27px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SAFUAN", 0, -131);
  if (Math.sin(t * 5) > -0.3) glow(0, -132, 80, "255,210,60", 0.25);
  ctx.restore();
}
function mothership(cx, cy, t, s = 1) { // riesiges Mutterschiff (Welt), Mitte
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  glow(0, 210, 380, "255,40,60", 0.35 + 0.1 * Math.sin(t * 3));
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 1180, 330, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a3e5e"; ctx.beginPath(); ctx.ellipse(0, 0, 1160, 312, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(160,150,190,0.35)"; ctx.beginPath(); ctx.ellipse(-120, -150, 700, 90, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5c4f72"; ctx.beginPath(); ctx.ellipse(0, 40, 900, 230, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#776a8e"; ctx.lineWidth = 8; for (const k of [0.45, 0.7]) { ctx.beginPath(); ctx.ellipse(0, 60, 900 * k, 230 * k, 0, 0, Math.PI * 2); ctx.stroke(); }
  // Lichterkette rot/grün
  for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2; const on = (i + Math.floor(t * 8)) % 3 !== 0; const c = i % 2 ? "#ff3b4e" : "#5fffa0";
    const lx = Math.cos(a) * 1080, ly = Math.sin(a) * 280; circle(lx, ly, 14, on ? c : "#40303a"); if (on) glow(lx, ly, 40, i % 2 ? "255,60,80" : "95,255,160", 0.5); }
  // rotes Auge in der Mitte
  circle(0, 120, 120, "#1b1424"); circle(0, 120, 104, "#5a0f1e");
  const p = 0.6 + 0.4 * Math.sin(t * 6); circle(0, 120, 70 + 10 * p, "#ff2a3c"); circle(0, 120, 36, "#ffd0d0"); glow(0, 140, 260, "255,40,60", 0.5 * p);
  ctx.restore();
}
function burek(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circle(0, 0, 15, "#1b1424"); circle(0, 0, 13, "#e8b04a");
  ctx.strokeStyle = "#a8701e"; ctx.lineWidth = 2.5; ctx.beginPath(); for (let a = 0; a < 12; a += 0.3) { const r = a * 1.0; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
  ctx.restore();
}
function burekLauncher(x, y, s, ang, t, recoil = 0) { // Jimmbos Burek-Launcher (Fuß unten)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#3e3239"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(0, -40); ctx.lineTo(26, 0); ctx.moveTo(0, -40); ctx.lineTo(0, 0); ctx.stroke();
  ctx.translate(0, -44); ctx.rotate(ang); ctx.translate(-recoil * 10, 0);
  ctx.fillStyle = "#4f7a3a"; rr(-40, -15, 100, 30, 8); ctx.fill(); ctx.fillStyle = "#3a5c2a"; rr(52, -19, 18, 38, 5); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.fillRect(-20, -15, 8, 30); ctx.fillRect(10, -15, 8, 30);
  ctx.fillStyle = "#fff"; ctx.font = "11px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BUREK", 30, 1);
  ctx.restore();
}
function laserSword(x, y, ang, len, col, s) { // Griff bei x,y
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.globalAlpha = 0.35; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -len); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#555b66"; rr(-4, -10, 8, 20, 2); ctx.fill(); ctx.fillStyle = "#222"; ctx.fillRect(-4, -4, 8, 3);
  ctx.restore();
}
function sword(x, y, ang, s) { // Jakobs Plan: Schwerter
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = "#dfe5ea"; ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(3, -52); ctx.lineTo(0, -60); ctx.lineTo(-3, -52); ctx.fill();
  ctx.fillStyle = "#c9a227"; ctx.fillRect(-11, -10, 22, 5); ctx.fillStyle = "#5b3a1e"; ctx.fillRect(-3, -5, 6, 12);
  ctx.restore();
}
function bowArc(x, y, s, draw) { // Bogen (Mitte am Griff), zielt nach oben rechts
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.scale(s, s);
  ctx.strokeStyle = "#8a5a2a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 26, -Math.PI * 0.42, Math.PI * 0.42); ctx.stroke();
  ctx.strokeStyle = "#eee"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Math.cos(-1.32) * 26, Math.sin(-1.32) * 26); ctx.lineTo(-draw * 12, 0); ctx.lineTo(Math.cos(1.32) * 26, Math.sin(1.32) * 26); ctx.stroke();
  ctx.restore();
}
function doner(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(3, -22); ctx.lineTo(-3, -22); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-8, -10, 16, 12); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-9, -2, 18, 3); ctx.restore(); }
function donerSpit(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = "#777"; ctx.fillRect(-2, -60, 4, 120);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-26, -44); ctx.lineTo(26, -44); ctx.lineTo(18, 40); ctx.lineTo(-18, 40); ctx.fill();
  ctx.fillStyle = "#b5652d"; ctx.beginPath(); ctx.moveTo(-23, -41); ctx.lineTo(23, -41); ctx.lineTo(16, 37); ctx.lineTo(-16, 37); ctx.fill();
  ctx.strokeStyle = "#7a3a16"; ctx.lineWidth = 3; for (let i = -30; i < 36; i += 12) { ctx.beginPath(); ctx.moveTo(-20, i); ctx.lineTo(20, i + 4); ctx.stroke(); }
  ctx.restore();
}
function lawTablet(x, y, s, rot) { // Gesetzestafel aus Tag 2/3
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-74, -94, 148, 188, 30); ctx.fill(); ctx.fillStyle = "#b9b3ab"; rr(-70, -90, 140, 180, 28); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "20px Comic"; ctx.fillText("GESETZE", 0, -58);
  ctx.font = "900 14px InterX"; ctx.fillText("1. KEINE SCHULE", 0, -18); ctx.fillText("2. KEINE STEUERN", 0, 10);
  ctx.strokeStyle = "#7a746c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.lineTo(-5, 62); ctx.lineTo(20, 46); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------ Fan-Astronauten (Wünsche aus Tag 3/4 + Jimmbo)
const FANS = [
  { name: "elster", acc: "#ff79c6", suit: "#ff9fd2", suit2: "#ffb6dc", suit3: "#e77fb8", item: "ears" },
  { name: "Gabriel", acc: "#3fd3f2", item: "saber" },
  { name: "Bz_Full", acc: "#ffb43a", item: "chicken" },
  { name: "herobrine", acc: "#8a4dff", item: "bag" },
  { name: "Jakob", acc: "#9a8f88", item: "stone" },
  { name: "Jimmbo", acc: "#7bf27a", item: "burek" },
];
function fanAstro(f, x, y, s, t, face = "happy", o = {}) {
  if (f.item === "bag") backpack(x, y, s);
  const opt = { t, acc: f.acc, suit: f.suit, suit2: f.suit2, suit3: f.suit3, ...o };
  if (f.item === "saber") opt.armR = -2.3;
  astronaut(x, y, s, face, opt);
  const hy = y - 104 * s;
  if (f.item === "ears") dogEars(x, hy, s);
  if (f.item === "chicken") chickenHat(x, hy, s, t);
  if (f.item === "saber") laserSword(x + 36 * s, y - 92 * s, 0.5, 70, "#3fd3f2", s);
  if (f.item === "stone") stoneFriend(x + 44 * s, y, 0.75 * s, t);
  if (f.item === "burek") burekLauncher(x - 38 * s, y, 0.55 * s, -0.5, t);
}

// ------------------------------------------------------------ Kamera (Welt-Szenen)
const LAST = { x: 150, y: 700, s: 2.2 };      // die letzte Rakete
const liftY = t => t < T.lift ? 0 : Math.pow(t - T.lift, 2) * 260 + (t - T.lift) * 60;
const CAM = [
  [0, 335, 600, 0.82], [T.rew, 335, 600, 0.95], [T.night - 0.12, 335, 590, 1.2], [T.night, 330, 520, 0.62], [T.held - 0.12, 330, 520, 0.64],
  [T.held + 0.18, 260, 600, 1.05], [T.party - 0.12, 270, 600, 1.08], [T.party + 0.1, 190, 655, 1.55], [T.four - 0.12, 200, 655, 1.6],
  [T.four + 0.12, 330, 470, 0.58], [T.bigger - 0.1, 330, 420, 0.55], [T.still - 0.2, 330, 330, 0.4], [T.still, 430, 690, 2.5],
  [T.shotPre - 0.1, 430, 690, 2.75], [T.shotPre + 0.08, 330, 420, 0.52], [T.shatter + 0.5, 330, 430, 0.5],
  [T.werft - 0.1, 330, 430, 0.5], [T.werft + 0.06, -180, 560, 1.3], [T.funk - 0.1, -180, 560, 1.36], [T.funk + 0.06, 1000, 480, 1.0],
  [T.wach - 0.1, 1000, 480, 1.05], [T.wach + 0.06, 760, 580, 1.25], [T.doner - 0.1, 760, 580, 1.3], [T.doner + 0.06, 40, 650, 1.9],
  [T.houses - 0.1, 40, 650, 1.95], [T.houses + 0.06, 260, 610, 0.85], [T.run - 0.1, 260, 610, 0.9], [T.run + 0.06, 380, 650, 1.45],
  [T.last - 0.1, 300, 650, 1.5], [T.last + 0.06, 170, 560, 1.15], [T.hatch - 0.1, 165, 565, 1.2], [T.hatch + 0.06, 168, 610, 2.7],
  [T.start - 0.1, 168, 610, 2.8], [T.start + 0.06, 150, 540, 1.35], [T.core - 0.1, 150, 520, 1.3], [T.core + 0.06, 520, 470, 0.72], [T.planet, 520, 455, 0.7],
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

// ------------------------------------------------------------ Einblendungen
function pollShield(t, s) { // Creator-Umfrage wie im Original: „Hält unser Schild?“ 87 %
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1e1e22"; rr(-245, -100, 490, 200, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-205, -62, 22, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -227, -84, 44, 44); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "800 16px InterX"; ctx.fillText("Gedacht ·", -170, -74); ctx.fillStyle = "#5aa7e6"; ctx.fillText("Creator*in", -88, -74);
  ctx.fillStyle = "#fff"; ctx.font = "800 22px InterX, 'Noto Color Emoji'"; ctx.fillText("Hält unser Schild? 🛡️", -170, -46);
  const k = easeOut(ramp(t, T.poll + 0.25, T.poll + 1.1));
  ctx.fillStyle = "#2a2a30"; rr(-170, -22, 392, 42, 12); ctx.fill();
  ctx.fillStyle = "#f4f4f6"; rr(-170, -22, 392 * 0.87 * k, 42, 12); ctx.fill();
  ctx.fillStyle = k > 0.35 ? "#111" : "#fff"; ctx.font = "800 18px InterX, 'Noto Color Emoji'"; ctx.fillText("💪 Ja, der hält!", -156, 0);
  ctx.fillStyle = "#111"; ctx.textAlign = "right"; ctx.fillText(Math.round(87 * k) + "%", 208, 0);
  ctx.textAlign = "left"; ctx.fillStyle = "#2a2a30"; rr(-170, 28, 392, 42, 12); ctx.fill(); ctx.strokeStyle = "#45454d"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#4a4a52"; rr(-170, 28, 392 * 0.13 * k + 6, 42, 12); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText("😬 Nein, der bricht!", -156, 50); ctx.fillStyle = "#a9a9b0"; ctx.textAlign = "right"; ctx.fillText(Math.round(13 * k) + "%", 208, 50);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8a92"; ctx.font = "700 13px InterX"; ctx.fillText("Umfrage beendet", -170, 84);
  ctx.restore();
}
function topComment(s) { // eigener Kommentar am Ende (wie im Original, weiß)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 300); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-232, -52, 464, 104, 18); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-188, -4, 32, CYAN); if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-188, -4, 28, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -216, -32, 56, 56); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#8a8f9a"; ctx.font = "700 13px InterX"; ctx.fillText("Gedacht", -144, -30);
  ctx.fillStyle = CYAN; rr(-84, -40, 112, 22, 11); ctx.fill(); ctx.fillStyle = "#06343f"; ctx.font = "900 12px InterX"; ctx.fillText("Top-Kommentar", -76, -29);
  ctx.fillStyle = "#111"; ctx.font = "900 26px InterX, 'Noto Color Emoji'"; ctx.fillText("Unser neuer Planet? 🪐", -144, 2);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 12px InterX"; ctx.fillText("Jetzt · Antworten", -144, 32);
  ctx.fillStyle = "#c0c4cc"; ctx.font = "16px InterX"; ctx.textAlign = "center"; ctx.fillText("♥", 205, -14);
  ctx.restore();
}
function topLabel(txt, sub, s, col = CYAN, y = 190, size = 46) { // großer Titel oben
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, y); ctx.scale(s, s);
  outlined(txt, 0, 0, size, col, "#0e1a30", 11); if (sub) outlined(sub, 0, size * 0.85, size * 0.55, "#fff", "#0e1a30", 7);
  ctx.restore();
}
function shieldBar5(t, s) {
  if (s <= 0.01) return;
  let v = 100; if (t >= T.bar51) v = lerp(100, 51, easeOut(ramp(t, T.bar51, T.bar51 + 0.25))); if (t >= T.bar0) v = lerp(51, 0, easeOut(ramp(t, T.bar0, T.bar0 + 0.35)));
  const col = v > 80 ? "#3fd3f2" : v > 40 ? "#ffb43a" : RED;
  ctx.save(); ctx.translate(288, 170); ctx.scale(s, s);
  ctx.font = "34px Comic, 'Noto Color Emoji'"; const a = "🛡 SCHILD: ", b = Math.round(v) + " %", wa = ctx.measureText(a).width, wb = ctx.measureText(b).width;
  outlined(a, -(wa + wb) / 2, -22, 34, "#fff", "#0e1a30", 8, 900, "left"); outlined(b, -(wa + wb) / 2 + wa, -22, 34, v > 80 ? "#fff" : RED, "#0e1a30", 8, 900, "left");
  ctx.fillStyle = "#1b1424"; rr(-170, 6, 340, 24, 12); ctx.fill(); if (v > 0.5) { ctx.fillStyle = col; rr(-166, 10, 332 * v / 100, 16, 8); ctx.fill(); }
  ctx.restore();
}
function rewindFx(t, a) { // Zurückspulen: Streifen + ⏪
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const r = rng(Math.floor(t * 40));
  for (let i = 0; i < 9; i++) { ctx.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.12})`; ctx.fillRect(0, r() * H, W, 3 + r() * 10); }
  ctx.fillStyle = "rgba(0,0,0,0.12)"; for (let y = 0; y < H; y += 5) ctx.fillRect(0, y, W, 2);
  outlined("⏪", 470, 110, 54, "#fff", "#0e1a30", 8);
  ctx.restore();
}
function sticker(txt, x, y, s, rot = 0.05) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = "19px Comic, 'Noto Color Emoji'"; const w = ctx.measureText(txt).width + 28;
  ctx.fillStyle = "#ffd23a"; rr(-w / 2, -19, w, 38, 10); ctx.fill(); ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#1b1424"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}

// ------------------------------------------------------------ Effekte
const IMPACTS = [0, T.shot, T.shatter, T.werftX, T.funkX, T.wachX, T.donerX, T.housesX, T.housesX + 0.2, T.lift, T.coreX, T.crack, T.loop + 0.9];
function shakeAt(t) {
  let dx = 0, dy = 0;
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.5) continue; const big = t0 === T.shatter || t0 === T.coreX || t0 === T.crack ? 2.4 : t0 === T.lift ? 0.8 : 1.4; const a = 7 * big * Math.exp(-d * 9); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  if (t >= T.msIn && t < T.still) { const a = 1.2 * ramp(t, T.msIn, T.msIn + 1); dx += Math.sin(t * 40) * a; dy += Math.cos(t * 33) * a; }      // Dröhnen des Mutterschiffs
  if (t >= T.lift && t < T.core) { dx += Math.sin(t * 50) * 2.5; dy += Math.cos(t * 43) * 2.5; }
  if (t >= T.crack && t < T.days) { const a = 3 * (1 - ramp(t, T.crack, T.days)); dx += Math.sin(t * 47) * a; dy += Math.cos(t * 39) * a; }
  return [dx, dy];
}
const CUTS = [...CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05), T.planet, T.row, T.chase];
function flash(t) {
  let a = 0, red = 0;
  for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.25 * (1 - d / 0.14)); }
  for (const t0 of [T.shot, T.shatter, T.coreX, T.crack]) { const d = t - t0; if (d >= 0 && d < 0.25) a = Math.max(a, 0.6 * (1 - d / 0.25)); }
  // roter Explosionsblitz: Frame 1 und Ende (nahtloser Loop)
  if (t < 0.35) red = 0.85 * (1 - t / 0.35);
  if (t > DUR - 0.2) red = Math.max(red, ramp(t, DUR - 0.2, DUR - 0.02) * 0.85);
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
  if (red > 0) { ctx.fillStyle = `rgba(255,60,30,${red})`; ctx.fillRect(0, 0, W, H); }
}
function shieldDome(t) { // Kuppel: steht nachts, bricht beim Schuss
  if (t < T.night || t >= T.shatter) return;
  const hitGlow = Math.max(t >= T.shot ? Math.exp(-(t - T.shot) * 2.5) : 0, ...NIGHT_HITS.map(h => t >= h ? Math.exp(-(t - h) * 6) * 0.6 : 0));
  const crackK = t >= T.bar51 ? ramp(t, T.bar51, T.shatter) : 0;
  const flick = t >= T.bar0 && Math.sin(t * 70) > 0.3 ? 0.4 : 1;
  const cx = 330, cy = 760, rx = 1250, ry = 820;
  ctx.save(); ctx.globalAlpha = flick;
  const g = ctx.createRadialGradient(cx, cy - ry * 0.4, ry * 0.2, cx, cy, ry);
  g.addColorStop(0, "rgba(63,211,242,0.05)"); g.addColorStop(0.85, `rgba(63,211,242,${0.14 + 0.25 * hitGlow})`); g.addColorStop(1, `rgba(140,240,255,${0.45 + 0.3 * hitGlow})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = `rgba(160,245,255,${0.7 + 0.3 * hitGlow})`; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = "rgba(160,245,255,0.18)"; ctx.lineWidth = 2;
  for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry * i / 7, 0, Math.PI, 0); ctx.stroke(); }
  for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx * i / 8, ry, 0, Math.PI, 0); ctx.stroke(); }
  if (crackK > 0) { // Risse vom Einschlagpunkt
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 4; const r = rng(77);
    for (let i = 0; i < 14; i++) { let x = cx, y = cy - ry, a = Math.PI * (0.1 + 0.8 * r()); ctx.beginPath(); ctx.moveTo(x, y);
      const n = Math.ceil(8 * crackK); for (let j = 0; j < n; j++) { a += (r() - 0.5) * 0.8; x += Math.cos(a) * 70; y += Math.sin(a) * 70; ctx.lineTo(x, y); } ctx.stroke(); }
  }
  ctx.restore();
}
const SHARDS = (() => { const r = rng(91), a = []; for (let i = 0; i < 150; i++) { const an = Math.PI + r() * Math.PI, rad = 0.3 + r() * 0.7; a.push({ x: 330 + Math.cos(an) * 1250 * rad, y: 760 + Math.sin(an) * 820 * rad, vx: Math.cos(an) * (150 + r() * 350), vy: -60 - r() * 260, rot: r() * 6, vr: (r() - 0.5) * 10, s: 25 + r() * 55 }); } return a; })();
function shards(t) {
  const d = t - T.shatter; if (d < 0 || d > 2.2) return;
  ctx.save(); ctx.globalAlpha = 1 - clamp((d - 1.4) / 0.8);
  for (const p of SHARDS) {
    ctx.save(); ctx.translate(p.x + p.vx * d, p.y + p.vy * d + 380 * d * d); ctx.rotate(p.rot + p.vr * d);
    ctx.fillStyle = "rgba(150,240,255,0.55)"; ctx.strokeStyle = "rgba(230,255,255,0.95)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-p.s * 0.5, p.s * 0.4); ctx.lineTo(p.s * 0.1, -p.s * 0.6); ctx.lineTo(p.s * 0.55, p.s * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// nachts: Aliens schießen, der Schild hält, Jakobs Bogenschützen geben Rückendeckung
const NIGHT_HITS = [T.night + 0.4, T.night + 1.3, T.held + 0.2, T.held + 0.9, T.held + 1.5];
const NIGHT_UFOS = (() => { const r = rng(5), a = []; for (let i = 0; i < 14; i++) a.push({ x: -400 + r() * 1500, y: -170 + r() * 120, s: 0.9 + r() * 0.6 }); return a; })();
const ARCHERS = [[150, 640], [210, 646], [470, 640], [540, 646], [270, 650], [600, 650]];
const SWORDS = [[60, 742], [140, 748], [220, 742], [520, 742], [600, 748], [680, 742]];

// Menge, die zur Rakete rennt
function runCrowd(t) {
  const k = ramp(t, T.run - 0.1, T.hatch);
  for (const [i, m] of MASS.entries()) {
    const sp = SPR[m.acc]; if (!sp) continue;
    const dirx = LAST.x - m.x, dist = Math.abs(dirx);
    const x = m.x + Math.sign(dirx) * Math.min(Math.max(0, dist - 60), 900 * k * (0.6 + 0.4 * ((i * 7) % 10) / 10));
    const hop = Math.abs(Math.sin(t * 14 + m.ph)) * 7;
    const w = 88 * m.s, h = 158 * m.s;
    ctx.drawImage(sp, x - w / 2, m.y - h - hop, w, h);
  }
}

// ------------------------------------------------------------ Welt-Szene (Kolonie)
function drawWorld(t, z) {
  const ruin = k => ruined(k, t);
  const msY = t < T.msIn ? -1400 : lerp(-1400, -430, easeOut(ramp(t, T.msIn, T.msLab + 0.3)));
  sky(t);
  if (t >= T.night && t < T.msIn) for (const [i, u] of NIGHT_UFOS.entries()) ufo(u.x, u.y, u.s, t, i);
  if (t >= T.msIn || t < T.rew + 0.25) mothership(330, t < T.rew + 0.25 ? -430 : msY, t);
  ground();
  // Häuser
  for (const h of HOUSES) { if (ruin("houses")) { rubble(h.x, h.y, 40 * h.s); continue; } house(h.x, h.y, h.s, h.c); }
  for (const [x, y, s] of BGROCKETS) if (!ruin("houses")) rocket(x, y, s, 0);
  if (t >= T.run && t < T.lift + 0.5) runCrowd(t);
  else if (!(t < T.rew + 0.25)) massCrowd(t, t >= T.party && t < T.four ? 1 : 0);
  // Scheinwerfer
  if (!ruin("wach") && t >= T.night) { beam(790, 455, -2.2 + Math.sin(t * 0.8) * 0.5, 520, 70, 1); beam(-430, 470, -1.0 + Math.sin(t * 0.7 + 1) * 0.5, 520, 70, 1); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  if (!ruin("funk")) radioTower(1000, 700, 1, t, 1); else rubble(1000, 700, 70);
  if (!ruin("werft")) shipyard(-180, 705, 1, 1); else rubble(-180, 705, 110);
  if (!ruin("wach")) { watchtower(790, 712, 1, t, 1); watchtower(-430, 712, 1, t, 1); } else { rubble(790, 712, 50); rubble(-430, 712, 50); }
  boulders();
  if (!ruin("dome")) { dome(330, 690); sign(445, 690); } else { brokenDome(330, 690); tiltedSign(445, 690); }
  if (!ruin("core")) shieldCore(620, 712, 1, t, 1); else rubble(620, 712, 80);
  rocket(-80, 700, 0.95, 0); rocket(720, 700, 0.95, 0);
  if (!ruin("doner")) donerShop5(30, 705, 0.95, t); else { rubble(30, 705, 70); }
  // Burek-Launcher von Jimmbo (feuert ein letztes Mal, dann weg)
  if (!ruin("wach")) { const rec = t >= T.wach + 0.35 ? Math.exp(-(t - T.wach - 0.35) * 8) : 0; burekLauncher(700, 740, 1, -0.75, t, rec); }
  // Front-Reihe (Easter Eggs aus Tag 4), nachts mit Jakobs Schwertern
  if (t >= T.rew + 0.25 && t < T.run) {
    for (const [i, e] of EGGS.entries()) {
      const o = { t: t + i * 0.7, acc: e.acc }; let f = ["smile", "happy", "talk"][i % 3];
      if (t >= T.party && t < T.four) { o.armL = 2.6; o.armR = -2.6; f = "happy"; }
      if (t >= T.msIn) f = "shock";
      astronaut(e.x, e.y, e.s, f, o); eggItem(e.k, e.x, e.y, e.s, t);
    }
    if (t < T.party) for (const [i, [x, y]] of SWORDS.entries()) { astronaut(x, y, 0.85, "smirk", { t: t + i, acc: "#c9a227", armR: -2.2 }); sword(x + 30, y - 80, 0.35 + Math.sin(t * 3 + i) * 0.1, 1); }
    if (t < T.party) for (const [i, [x, y]] of ARCHERS.entries()) { astronaut(x, y, 0.55, "smirk", { t: t + i, acc: "#4fbf4a", armL: -1.2 }); bowArc(x - 20, y - 50, 0.7, 0.5 + 0.5 * Math.sin(t * 4 + i)); }
    // jeno: Laserschwert + Döner bei der Feier
    if (t >= T.party - 0.3 && t < T.four) { const jx = 330, jy = 772; astronaut(jx, jy, 1, "happy", { t, acc: "#7bf27a", armL: 2.4, armR: -2.4 }); laserSword(jx + 40, jy - 118, 0.25 + Math.sin(t * 8) * 0.25, 80, "#7bf27a", 1); doner(jx - 44, jy - 122, 1.1); }
  }
  // die letzte Rakete (mit Luke)
  const ly = LAST.y - liftY(t);
  if (t < T.last - 0.1) rocket(LAST.x, LAST.y - 10, 0.95, 0);
  else { const lx = LAST.x + (t >= T.core ? Math.pow(t - T.core, 1.3) * 260 : 0); ctx.save(); ctx.translate(lx, ly); ctx.rotate(t >= T.core ? Math.min(0.5, (t - T.core) * 0.6) : 0); rocket(0, 0, LAST.s, t >= T.lift ? 1.4 : t >= T.start ? 0.5 : 0); ctx.restore(); }
  if (t >= T.last - 0.1 && t < T.lift + 2) { // Luke
    const close = t >= T.start ? easeOut(ramp(t, T.start, T.start + 0.25)) : 0;
    const hx = LAST.x, hb = ly - 12 * LAST.s, hh = 52 * LAST.s, hw = 30 * LAST.s;
    if (t >= T.last) { ctx.fillStyle = "#2a2230"; rr(hx - hw / 2, hb - hh, hw, hh, 8); ctx.fill(); }
    // Hauptfigur in der Luke + Fans werden reingezogen
    if (t >= T.hatch && close < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(hx - hw / 2 - 30, hb - hh - 90, hw + 120, hh + 90); ctx.clip();
      astronaut(hx - 6, hb, 0.72, t >= T.cd1 ? "shock" : "talk", { t, armR: -1.3 + Math.sin(t * 9) * 0.2 });
      ctx.restore();
    }
    if (t >= T.last && close > 0) { ctx.fillStyle = "#e9edf0"; rr(hx - hw / 2, hb - hh, hw, hh * close, 8); ctx.fill(); ctx.strokeStyle = "#b9c0c8"; ctx.lineWidth = 3; ctx.stroke(); }
    if (t >= T.hatch && t < T.start) {
      const step = (T.start - 0.15 - (T.hatch + 0.2)) / FANS.length;
      for (const [i, f] of FANS.entries()) {
        const t0 = T.hatch + 0.2 + i * step, k = ramp(t, t0, t0 + step * 0.9);
        if (k >= 1) continue;
        const qx = hx + 85 + (i - Math.max(0, Math.floor((t - T.hatch - 0.2) / step))) * 80;
        const x = k > 0 ? lerp(hx + 85, hx + 4, easeIO(k)) : qx, y = k > 0 ? lerp(LAST.y + 34, hb - 4, easeIO(k)) : LAST.y + 34;
        const s = k > 0.65 ? 0.8 * (1 - ramp(k, 0.65, 1)) : 0.8;
        if (s > 0.02 && qx < hx + 380) fanAstro(f, x, y, s, t, k > 0 ? "happy" : "shock", k > 0 ? { armL: 2.5, armR: -2.5 } : {});
      }
    }
  }
  // Hauptfigur draußen (vor der Flucht)
  if (t >= T.rew + 0.25 && t < T.run) {
    let face = "talk", o = { t };
    if (t >= T.party) { face = "happy"; o.armL = 2.6; o.armR = -2.6; }
    if (t >= T.four) { face = "shock"; o.armL = 0.25; o.armR = -0.25; }
    if (t >= T.still) face = "shock";
    astronaut(430, 742, 1, face, o);
  }
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  // Feuer + Rauch an Ruinen
  for (const [i, [x, y, s]] of FIRES.entries()) if (fireOn(x, t)) { smoke(x, y, s, t, i); flame(x, y, s, t, i); }
  if (t >= T.lift) puffs(LAST.x, LAST.y + 10, t, T.lift, 10);
  shieldDome(t);
  // Laser der Ufos nachts + Pfeile der Bogenschützen
  if (t >= T.night && t < T.party) {
    for (const [i, h] of NIGHT_HITS.entries()) { const d = t - h + 0.15; if (d < 0 || d > 0.3) continue; const u = NIGHT_UFOS[(i * 5 + 2) % NIGHT_UFOS.length];
      ctx.save(); ctx.globalAlpha = 1 - d / 0.3; ctx.strokeStyle = "#7bff5a"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(u.x, u.y + 10); ctx.lineTo(200 + i * 70, -40); ctx.stroke(); glow(200 + i * 70, -40, 80, "160,255,140", 0.8); ctx.restore(); }
    if (t >= T.held) for (let i = 0; i < 10; i++) { const d = ((t - T.held) * 1.3 + i * 0.37) % 1.2; const [ax, ay] = ARCHERS[i % ARCHERS.length];
      ctx.save(); ctx.translate(ax + d * 180, ay - 60 - d * 620); ctx.rotate(-1.3); ctx.strokeStyle = "#f4e3c4"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke(); ctx.fillStyle = "#ddd"; ctx.beginPath(); ctx.moveTo(16, -4); ctx.lineTo(24, 0); ctx.lineTo(16, 4); ctx.fill(); ctx.restore(); }
  }
  // Der Schuss + Strahlen
  if (t >= T.shotPre && t < T.shatter + 0.3) {
    const charge = ramp(t, T.shotPre, T.shot); glow(330, -310, 200 + 300 * charge, "255,40,60", 0.5 + 0.5 * charge);
    if (t >= T.shot) { const w = 70 * (1 - clamp((t - T.shatter) / 0.3)); ctx.save(); ctx.fillStyle = "rgba(255,60,90,0.85)"; ctx.fillRect(330 - w, -320, 2 * w, 270); ctx.fillStyle = "rgba(255,220,230,0.95)"; ctx.fillRect(330 - w * 0.4, -320, w * 0.8, 270); glow(330, -60, 320, "255,60,90", 0.9); ctx.restore(); }
  }
  for (const [t0, x, y] of RAYS) { const d = t - t0; if (d < 0 || d > 0.35) continue;
    ctx.save(); ctx.globalAlpha = 1 - clamp((d - 0.2) / 0.15); ctx.strokeStyle = "#ff3b5c"; ctx.lineWidth = 26; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(330 + (x - 330) * 0.3, -330); ctx.lineTo(x, y); ctx.stroke();
    ctx.strokeStyle = "#ffe0e6"; ctx.lineWidth = 9; ctx.stroke(); glow(x, y, 120, "255,60,90", 0.8); ctx.restore(); }
  shards(t);
  for (const [t0, x, y, s] of EXPL) explosion(t, t0, x, y, s);
}

// ------------------------------------------------------------ Weltraum: der Mars zerbricht
const CRACKS = (() => { const r = rng(17), a = []; for (let i = 0; i < 26; i++) { const rad = Math.sqrt(r()) * 0.85, a0 = r() * Math.PI * 2; let x = Math.cos(a0) * rad, y = Math.sin(a0) * rad, an = r() * Math.PI * 2; const p = [[x, y]];
  for (let j = 0; j < 7; j++) { an += (r() - 0.5) * 1.6; x += Math.cos(an) * 0.11; y += Math.sin(an) * 0.11; p.push([x, y]); } a.push(p); } return a; })();
const PIECES = 7;
function marsPlanet(x, y, R, t, crackK, split) {
  glow(x, y, R * 1.5, "255,120,40", 0.25 + 0.5 * crackK);
  for (let p = 0; p < PIECES; p++) {
    const a0 = p / PIECES * Math.PI * 2 + 0.3, a1 = (p + 1) / PIECES * Math.PI * 2 + 0.3, am = (a0 + a1) / 2;
    const ox = Math.cos(am) * split * R * (0.35 + 0.1 * (p % 3)), oy = Math.sin(am) * split * R * (0.35 + 0.1 * (p % 3));
    ctx.save(); ctx.translate(x + ox, y + oy); ctx.rotate(split * (p % 2 ? 0.25 : -0.2));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.clip();
    circle(0, 0, R + 4, "#1b1424"); circle(0, 0, R, "#c9653a");
    for (const [dx, dy, cr] of [[-0.3, -0.25, 0.22], [0.3, 0.2, 0.18], [-0.1, 0.45, 0.15], [0.45, -0.35, 0.12], [-0.5, 0.2, 0.1]]) circle(dx * R, dy * R, cr * R, "#a84e2b");
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.arc(R * 0.3, R * 0.25, R, 0, Math.PI * 2); ctx.fill();
    if (split > 0) { ctx.strokeStyle = "#ffb43a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); ctx.stroke(); }
    ctx.restore();
  }
  if (crackK > 0) { // glühende Risse
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip(); ctx.translate(x, y); ctx.scale(R, R);
    for (const [lw, c] of [[0.06, "rgba(255,120,30,0.5)"], [0.025, "#ffb43a"], [0.01, "#fff2b0"]]) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineJoin = "round";
      for (const p of CRACKS) { const n = Math.max(2, Math.ceil(p.length * crackK)); ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let j = 1; j < n; j++) ctx.lineTo(p[j][0], p[j][1]); ctx.stroke(); }
    }
    ctx.restore();
  }
  if (split > 0) { glow(x, y, R * 0.8 * split + 40, "255,200,90", 0.9); }
}
const ROCKS2 = (() => { const r = rng(23), a = []; for (let i = 0; i < 26; i++) a.push({ a: r() * Math.PI * 2, d: 0.9 + r() * 0.8, s: 10 + r() * 30, v: 0.2 + r() * 0.6 }); return a; })();
function spaceBg(t, drift = 0) {
  ctx.fillStyle = "#06050a"; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(((x + 900 + drift) % 1300 + 1300) % 1300 - 300, (y + 700) * 0.95, r, "#fff"); }
  ctx.globalAlpha = 1;
}
function drawSpace(t) {
  spaceBg(t, t * 8);
  // Erde klein oben rechts
  circle(470, 250, 22, "#1b1424"); circle(470, 250, 20, "#2e86de"); ctx.fillStyle = "#4cc36a"; ctx.beginPath(); ctx.ellipse(464, 246, 8, 5, 0.4, 0, Math.PI * 2); ctx.fill();
  const z = lerp(0.82, 1.0, easeIO(ramp(t, T.planet, T.row)));
  const R = 210 * z, cx = 288, cy = 560;
  const crackK = ramp(t, T.planet, T.crack + 0.3), split = t >= T.crack ? easeOut(ramp(t, T.crack, T.row + 2)) * 0.45 : 0;
  marsPlanet(cx, cy, R, t, crackK, split);
  for (const r of ROCKS2) { if (split <= 0) break; const d = R * (r.d + split * r.v * 1.4); ctx.save(); ctx.translate(cx + Math.cos(r.a) * d, cy + Math.sin(r.a) * d); ctx.rotate(t * r.v); ctx.fillStyle = "#1b1424"; ctx.fillRect(-r.s / 2 - 2, -r.s / 2 - 2, r.s + 4, r.s + 4); ctx.fillStyle = "#6e6a80"; ctx.fillRect(-r.s / 2, -r.s / 2, r.s, r.s); ctx.restore(); }
  // kleine Rakete fliegt davon
  const k = ramp(t, T.planet - 0.2, T.days + 0.5);
  ctx.save(); ctx.translate(lerp(250, 300, k), lerp(380, -40, k)); ctx.rotate(0.12); rocket(0, 0, 0.22, 1.2); ctx.restore();
}

// ------------------------------------------------------------ Raketen-Innenraum: Reihe der Überlebenden
const ROW = [
  { x: 40, f: FANS[0] }, { x: 185, f: FANS[1] }, { x: 330, f: null, main: true }, { x: 475, f: FANS[2] },
  { x: 620, f: FANS[3] }, { x: 765, f: FANS[4] }, { x: 910, f: FANS[5] }, { x: 1055, f: null, acc: "#ffd23a" },
];
function drawRow(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#3a3550"); g.addColorStop(1, "#5c566e"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pan = lerp(0, 520, easeIO(ramp(t, T.row, T.chase)));
  ctx.save(); ctx.translate(-pan, 0);
  for (let i = 0; i < 8; i++) { const px = -100 + i * 230; circle(px, 260, 62, "#2b2740"); circle(px, 260, 52, "#0b0a14"); for (let j = 0; j < 6; j++) circle(px - 30 + (j * 23) % 60, 230 + (j * 17) % 60, 1.5, "#fff"); }
  ctx.fillStyle = "#4a4560"; ctx.fillRect(-400, 680, 2400, 400);
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  for (const [i, r] of ROW.entries()) {
    const y = r.main ? 740 : 700, s = r.main ? 2.8 : 2.4, face = t >= T.rest ? "happy" : r.main ? "talk" : ["smile", "think", "smile"][i % 3];
    if (r.f) fanAstro(r.f, r.x, y, s, t + i, face);
    else astronaut(r.x, y, s, face, { t: t + i, acc: r.acc, armL: t >= T.rest ? 2.6 : 0.25, armR: t >= T.rest ? -2.6 : -0.25 });
  }
  ctx = MAIN; compositeOutline(6);
  ctx.restore();
}

// ------------------------------------------------------------ Verfolgung im All + Ende
const CHASERS = (() => { const r = rng(41), a = []; for (let i = 0; i < 9; i++) a.push({ x: -40 + r() * 260, y: 520 + r() * 420, s: 0.8 + r() * 0.9, p: r() * 6 }); return a; })();
function drawChase(t) {
  spaceBg(t, t * 60);
  const fin = ramp(t, T.seek - 0.1, T.seek + 0.2);
  // zerbrochener Mars unten
  if (fin < 1) { ctx.save(); ctx.globalAlpha = 1 - fin; marsPlanet(420, 960, 200, t, 1, 0.5); ctx.restore(); }
  // Verfolger
  if (fin < 1) for (const [i, c] of CHASERS.entries()) { ctx.save(); ctx.globalAlpha = 1 - fin; glow(c.x, c.y, 60 * c.s, "95,255,200", 0.5); ufo(c.x + Math.sin(t * 2 + c.p) * 14, c.y, c.s, t, i); ctx.restore(); }
  // unsere Rakete
  const rx = lerp(lerp(190, 230, ramp(t, T.chase, T.seek)), 288, fin), ry = lerp(470, 600, fin), rot = lerp(0.55, 0, fin), rs = lerp(0.95, 0.6, fin);
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(rot);
  if (fin > 0) { ctx.fillStyle = "#ff8a1e"; ctx.beginPath(); ctx.moveTo(-14 * rs, 0); ctx.lineTo(0, 260 * fin + Math.sin(t * 30) * 10); ctx.lineTo(14 * rs, 0); ctx.fill(); }
  rocket(0, 0, rs, 1.3); ctx.restore();
  // Laser der Verfolger
  if (t < T.seek) for (let i = 0; i < 3; i++) { const d = (t - T.chase + i * 0.6) % 1.8; if (d > 0.25) continue; const c = CHASERS[i * 3];
    ctx.save(); ctx.globalAlpha = 1 - d / 0.25; ctx.strokeStyle = "#7bff5a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(rx + 60 + i * 40, ry - 80 - i * 50); ctx.stroke(); ctx.restore(); }
  // Loop: ein Alien-Schiff füllt das Bild
  if (t >= T.loop) { const k = ramp(t, T.loop + 0.3, DUR - 0.05); if (k > 0) { glow(288, 520, 500 * k, "95,255,160", 0.6 * k); ufo(288, 520, 0.6 + 11 * Math.pow(k, 2.2), t, 3); } }
}

const EMBERS = (() => { const r = rng(61), a = []; for (let i = 0; i < 40; i++) a.push([r() * W, r() * H, 1 + r() * 2.5, 30 + r() * 60, r() * 6]); return a; })();
function embers(t) { for (const [x0, y0, rad, sp, p] of EMBERS) { const y = ((y0 - t * sp) % H + H) % H, x = x0 + Math.sin(t * 1.5 + p) * 14; ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 5 + p); circle(x, y, rad, "#ffb43a"); } ctx.globalAlpha = 1; }
// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  const sc = scene(t);
  if (sc === "world") {
    let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
    if (t >= T.lift && t < T.core) cy -= liftY(t) * 0.85;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    drawWorld(t, z);
    ctx.restore();
    dust(t);
    // Licht-Stimmung
    const burning = t < T.rew + 0.25 || t >= T.werftX;
    if (t >= T.rew + 0.25 && !burning) { ctx.fillStyle = "rgba(20,25,70,0.34)"; ctx.fillRect(0, 0, W, H); }
    if (t >= T.msIn && t < T.werftX) { const p = 0.5 + 0.5 * Math.sin(t * 5); const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); rg.addColorStop(0, "rgba(255,0,0,0)"); rg.addColorStop(1, `rgba(220,20,40,${0.35 + 0.25 * p})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
    if (burning) { ctx.fillStyle = "rgba(120,20,10,0.22)"; ctx.fillRect(0, 0, W, H); embers(t); }
  } else if (sc === "space") drawSpace(t);
  else if (sc === "row") drawRow(t);
  else drawChase(t);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.5)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (t < T.rew + 0.6) rewindFx(t, t >= T.rew ? ramp(t, T.rew, T.rew + 0.1) * (1 - ramp(t, T.night - 0.05, T.night + 0.15)) : 0);
  if (t >= T.run && t < T.last) speedLines(t, 1);

  // ---- Einblendungen
  if (t < T.rew + 0.1) { // Hook: TAG 5 / ROTANIEN ZERSTÖRT
    const a = t < 0.05 ? 1 : 1 - ramp(t, T.rew - 0.05, T.rew + 0.1);
    ctx.save(); ctx.translate(288, 190); ctx.scale(a * (1 + 0.04 * Math.sin(t * 10)), a);
    ctx.fillStyle = "#fff"; rr(-50, -112, 100, 34, 10); ctx.fill(); ctx.fillStyle = "#14223a"; ctx.font = "24px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("TAG 5", 0, -93);
    outlined("ROTANIEN", 0, -36, 70, CYAN, "#0e1a30", 13); outlined("💥 ZERSTÖRT", 0, 34, 66, RED, "#0e1a30", 13);
    ctx.restore();
  }
  pill("HEUTE NACHT", 150, 112, pop(t, T.rew + 0.2, T.held - 0.1), "#14223a", "#fff", "⏪ ");
  if (t >= T.poll && t < T.held) { pollShield(t, pop(t, T.poll, T.held - 0.12)); stamp("87 % 💪 DER HÄLT", 360, 345, pop(t, T.polls, T.held - 0.12), -0.1, "#2fb8e0"); }
  label("✅ ER HÄLT", 288, 175, pop(t, T.held + 0.1, T.whole - 0.1), "#2fa84f");
  pill("DIE GANZE NACHT", 288, 175, pop(t, T.whole, T.party - 0.1), "#fff", "#14223a", "🌙 ");
  if (t >= T.held + 0.2 && t < T.party) { const [sx, sy] = toScreen(380, 560, t); pill("JAKOBS PLAN", sx, sy, pop(t, T.held + 0.3, T.party - 0.15), "#fff", "#14223a", "🏹 "); }
  if (t >= T.party && t < T.four) { confetti(t, T.party); confetti(t, T.party + 0.9); const [sx, sy] = toScreen(330, 620, t); pill("jeno", sx, sy, pop(t, T.party + 0.3, T.four - 0.1), "#fff", "#14223a"); }
  label("GEWONNEN?", 288, 175, pop(t, T.won, T.four - 0.05), "#ffd23a");
  label("🕓 04:00 UHR", 288, 140, pop(t, T.clock, T.msLab - 0.05));
  if (t >= T.msLab && t < T.still) label("⚠ MUTTERSCHIFF", 288, 140, pop(t, T.msLab, T.still - 0.1) * (1 + 0.05 * Math.max(0, Math.sin(t * 12))));
  if (t >= T.shot && t < T.werft) shieldBar5(t, pop(t, T.shot, T.werft - 0.1));
  for (const [t0, t1, txt] of [[T.werftX, T.funk, "RAKETENWERFT"], [T.funkX, T.wach, "FUNKTURM"], [T.wachX, T.doner, "WACHTÜRME"], [T.donerX, T.houses, "DÖNERLADEN"], [T.housesX, T.run, "HÄUSER"]]) {
    const a = pop(t, t0 - 0.05, t1 - 0.08, 0.18); if (a <= 0) continue;
    ctx.save(); ctx.translate(288, 160); ctx.rotate(-0.05); ctx.scale(a, a);
    ctx.fillStyle = RED; ctx.font = "30px Comic"; const w = ctx.measureText(txt).width + 40; rr(-w / 2, -22, w, 52, 10); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px"; ctx.fillText("ZERSTÖRT", 0, -10); ctx.letterSpacing = "0px";
    ctx.font = "30px Comic"; ctx.fillText(txt, 0, 12); ctx.restore();
  }
  if (t >= T.wach + 0.35 && t < T.wachX) { const k = ramp(t, T.wach + 0.35, T.wachX); const [sx, sy] = toScreen(lerp(760, 330, k), lerp(680, -280, k), t); burek(sx, sy, 1.4, t * 12); const [lx, ly] = toScreen(700, 640, t); pill("Jimmbo", lx, ly, pop(t, T.wach + 0.1, T.wachX), "#fff", "#14223a"); }
  if (t >= T.donerX && t < T.donerX + 1.2) { const d = t - T.donerX; donerSpit(lerp(200, 640, d / 1.2), 520 - 380 * d + 260 * d * d, 1.3, d * 9); }
  if (t >= T.housesX && t < T.housesX + 1.3) { const d = t - T.housesX; lawTablet(lerp(-80, 660, d / 1.3), 480 - 300 * d + 200 * d * d, 0.9, -0.4 + d * 4); }
  if (t >= T.run && t < T.last) { const a = pop(t, T.run + 0.05, T.last - 0.1); ctx.save(); ctx.translate(288, 175); ctx.scale(a, a); outlined("ÜBER " + Math.floor(FOLLOWERS / 100) * 100, 0, 0, 64, CYAN, "#0e1a30", 12); outlined("ASTRONAUTEN 🏃", 0, 50, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
  topLabel("🚀 LETZTE RAKETE", null, pop(t, T.last + 0.05, T.hatch - 0.1), CYAN, 165, 46);
  label("⚠ NICHT GENUG PLATZ", 288, 230, pop(t, T.noRoom, T.hatch - 0.1));
  if (t >= T.hatch && t < T.start) {
    const n = t < T.cd2 ? 3 : t < T.cd1 ? 2 : 1;
    label("🚪 LUKE ZU IN " + n, 288, 150, pop(t, T.hatch, T.start - 0.05) * (1 + 0.08 * Math.exp(-((t - (n === 3 ? T.hatch : n === 2 ? T.cd2 : T.cd1)) * 10))));
    sticker("💬 KOMMENTIER = DU FLIEGST MIT", 288, 700, pop(t, T.hatch + 0.4, T.start - 0.05));
    const step = (T.start - 0.15 - (T.hatch + 0.2)) / FANS.length, i = Math.floor((t - T.hatch - 0.2) / step);
    if (i >= 0 && i < FANS.length) { const [sx, sy] = toScreen(LAST.x + 60, LAST.y - 70, t); pill(FANS[i].name, sx, sy, pop(t, T.hatch + 0.2 + i * step, T.hatch + 0.2 + (i + 1) * step - 0.05, 0.12), "#fff", "#14223a"); }
  }
  topLabel("🚀 START!", null, pop(t, T.lift, T.core - 0.1), CYAN, 160, 60);
  if (t >= T.coreX - 0.05 && t < T.planet) { const a = pop(t, T.coreX - 0.05, T.planet - 0.05, 0.2); ctx.save(); ctx.translate(288, 165); ctx.rotate(-0.05); ctx.scale(a, a); ctx.fillStyle = RED; rr(-160, -26, 320, 56, 10); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px"; ctx.fillText("ZERSTÖRT", 0, -12); ctx.letterSpacing = "0px"; ctx.font = "30px Comic"; ctx.fillText("SCHILDZENTRALE", 0, 12); ctx.restore(); }
  topLabel("4 TAGE.", null, pop(t, T.days, T.row - 0.1), "#fff", 150, 60);
  topLabel("1 MINUTE.", null, pop(t, T.minute, T.row - 0.1), RED, 215, 60);
  if (t >= T.rest && t < T.chase) { const a = pop(t, T.rest, T.chase - 0.1); ctx.save(); ctx.translate(288, 165); ctx.scale(a, a); outlined("ALLES, WAS VON", 0, -34, 30, "#fff", "#0e1a30", 8); outlined("ROTANIEN", 0, 6, 52, CYAN, "#0e1a30", 11); outlined("ÜBRIG IST ✊", 0, 48, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
  if (t >= T.fuel && t < T.seek) { const blink = Math.sin(t * 12) > -0.2 ? 1 : 0.35; ctx.save(); ctx.globalAlpha = blink; const a = pop(t, T.fuel, T.seek - 0.1); ctx.translate(288, 150); ctx.scale(a, a);
    ctx.font = "36px Comic, 'Noto Color Emoji'"; const p1 = "⛽ TREIBSTOFF: ", w1 = ctx.measureText(p1).width, w2 = ctx.measureText("9 %").width; outlined(p1, -(w1 + w2) / 2, 0, 36, "#fff", "#0e1a30", 9, 900, "left"); outlined("9 %", -(w1 + w2) / 2 + w1, 0, 36, RED, "#0e1a30", 9, 900, "left"); ctx.restore(); }
  label("👽 VERFOLGT", 288, 215, pop(t, T.follow, T.seek - 0.1));
  if (t >= T.seek && t < T.loop + 0.3) {
    const big = t < T.where;
    topLabel(big ? "🪐 NEUER PLANET" : "WO LANDEN WIR?", big ? "GESUCHT" : null, pop(t, big ? T.seek : T.where, big ? T.where - 0.08 : T.loop + 0.2), CYAN, big ? 175 : 165, big ? 50 : 56);
    if (!big) { topComment(pop(t, T.where + 0.15, T.loop + 0.2)); const a = pop(t, T.where + 0.4, T.loop + 0.2); if (a > 0) { ctx.save(); ctx.translate(288, 392); ctx.scale(a, a); outlined("JUPITER? ERDE? DÖNER-PLANET? 👇", 0, 0, 24, "#fff", "#0e1a30", 7); ctx.restore(); } confetti(t, T.where + 0.1); }
  }
  if (t >= T.loop) { // Cliffhanger: Treibstoff springt auf 8 %
    const a = pop(t, T.loop, DUR); ctx.save(); ctx.translate(288, 150); ctx.scale(a, a); ctx.font = "36px Comic, 'Noto Color Emoji'"; const p1 = "⛽ TREIBSTOFF: ", w1 = ctx.measureText(p1).width, w2 = ctx.measureText("8 %").width;
    outlined(p1, -(w1 + w2) / 2, 0, 36, "#fff", "#0e1a30", 9, 900, "left"); outlined("8 %", -(w1 + w2) / 2 + w1, 0, 36, RED, "#0e1a30", 9, 900, "left"); ctx.restore();
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, T, expl: EXPL.map(e => e[0]), rays: RAYS.map(r => r[0]), nightHits: NIGHT_HITS, impacts: IMPACTS,
    fans: FANS.map((f, i) => T.hatch + 0.2 + i * (T.start - 0.15 - (T.hatch + 0.2)) / FANS.length),
    whooshes: CUTS.map(c => c - 0.2) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
