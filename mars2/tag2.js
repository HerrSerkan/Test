// ============================================================ Tag 2 (wird an base.js angehängt -> scene.js)
// Zeitpunkte aus den Wortzeiten (Index = gesprochenes Wort, siehe build/words.json)
const T = {
  rockets: wt(2), sky: wt(9), count0: wt(10), count1: wt(13), card: wt(13) + 0.1, problem: wt(14), nur1: wt(17), fleet: wt(20), drei: wt(23),
  top: wt(24), comment: wt(29), keine: wt(30), law: wt(32), lawWrite: wt(43), confetti: wt(43), safe: wt(50), school: wt(57), launch: wt(60),
  bye: wt(62), n7: wt(64), hat: wt(69), done7: wt(70), n12: wt(72), bag: wt(77), back: wt(79), gone: wt(84), weg: wt(85), tracks: wt(86),
  crater: wt(94), follow: wt(95), pass: wt(101), law2: wt(108), comment2: wt(111), end: SPEECH_END,
};
const PASS_LABEL = "RAKETE 2";
const NEW = 18, FOLLOWERS = 18, LIKES = "214";

// Neue Einwohner: 18 Astronauten mit eigener Akzentfarbe
const ACC = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#4aa3ff", "#ff8a2a", "#2fe0b0", "#ff79c6"];
const CROWD2 = (() => {
  const r = rng(77), a = [], xs = [40, 95, 150, 205, 255, 300, 520, 575, 630, 690, 745, 800];
  for (let i = 0; i < 12; i++) a.push({ x: xs[i] + (r() - 0.5) * 10, y: 716 + (i % 2) * 8, s: 0.78, acc: ACC[i % ACC.length] });
  for (let i = 0; i < 6; i++) a.push({ x: [70, 180, 280, 560, 660, 760][i], y: 760 + (i % 2) * 10, s: 0.92, acc: ACC[(i + 3) % ACC.length] });
  return a.map((c, i) => ({ ...c, d: r() * 0.5, f: ["smile", "happy", "talk"][i % 3] }));
})();
const N7 = CROWD2[16], N12 = CROWD2[15];   // die beiden Wunsch-Astronauten (vorne)
const ROCKETS = [[150, 690], [-80, 700], [720, 700]];   // gelandete Raketen

// ------------------------------------------------------------ Kamera
const CAM = [ // t, cx, cy, zoom
  [0, 335, 625, 1.5], [T.sky - 0.25, 335, 625, 1.5], [T.sky + 0.15, 335, 300, 1.15], [T.card - 0.2, 335, 330, 1.1],
  [T.problem - 0.1, 335, 330, 1.1], [T.problem + 0.25, 190, 600, 1.9], [T.fleet - 0.15, 200, 610, 1.85], [T.fleet + 0.35, 330, 600, 0.55],
  [T.top - 0.15, 330, 600, 0.6], [T.top + 0.25, 400, 650, 1.6], [T.law - 0.1, 400, 650, 1.6], [T.law + 0.2, 420, 650, 2.0],
  [T.safe - 0.15, 430, 650, 1.95], [T.safe + 0.25, 560, 640, 1.45], [T.launch - 0.1, 590, 640, 1.45], [T.launch + 0.9, 600, 380, 1.0],
  [T.n7 - 0.15, 600, 380, 1.0], [T.n7 + 0.2, N7.x + 20, 690, 2.3], [T.n12 - 0.15, N7.x + 20, 690, 2.3], [T.n12 + 0.25, N12.x - 10, 690, 2.3],
  [T.back - 0.15, N12.x - 10, 690, 2.3], [T.back + 0.25, 470, 650, 1.55], [T.tracks - 0.1, 490, 650, 1.55], [T.tracks + 0.3, 650, 790, 2.0],
  [T.crater - 0.2, 800, 815, 2.0], [T.crater + 0.15, 880, 840, 2.4], [T.follow - 0.1, 880, 840, 2.4], [T.follow + 0.25, 335, 625, 1.5],
  [T.law2 - 0.1, 335, 625, 1.5], [T.law2 + 0.25, 420, 650, 2.0], [T.end, 415, 650, 2.05], [DUR, 400, 645, 1.9],
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

// ------------------------------------------------------------ Neue Objekte
function school(x, y, s, fire) { // Unterkante Mitte
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (fire > 0) for (const fx of [-38, 0, 38]) {
    ctx.fillStyle = "#ffb43a"; ctx.beginPath(); ctx.moveTo(fx - 12, 0); ctx.quadraticCurveTo(fx, 70 * fire * (0.9 + 0.2 * Math.random()), fx + 12, 0); ctx.fill();
    ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.moveTo(fx - 6, 0); ctx.quadraticCurveTo(fx, 36 * fire, fx + 6, 0); ctx.fill();
  }
  ctx.fillStyle = "#f2d8a8"; ctx.fillRect(-62, -78, 124, 78);
  ctx.fillStyle = "#c9433a"; ctx.beginPath(); ctx.moveTo(-72, -76); ctx.lineTo(0, -124); ctx.lineTo(72, -76); ctx.fill();
  ctx.fillStyle = "#4a90d9"; for (const wx of [-46, 24]) { ctx.fillRect(wx, -62, 22, 18); ctx.fillRect(wx, -36, 22, 18); }
  ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-10, -34, 20, 34);
  ctx.fillStyle = "#fff"; rr(-30, -100, 60, 16, 3); ctx.fill();
  ctx.fillStyle = "#2a2a2a"; ctx.font = "11px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SCHULE", 0, -91);
  circle(0, -112, 7, "#fff"); ctx.fillStyle = RED; ctx.font = "12px Comic"; ctx.fillText("!", 0, -111);
  ctx.restore();
}
function topHat(x, y, s) { // y = Helmmitte
  ctx.save(); ctx.translate(x, y - 26 * s); ctx.rotate(-0.12); ctx.scale(s, s);
  ctx.fillStyle = "#1b1b22"; rr(-24, -4, 48, 8, 4); ctx.fill(); rr(-15, -34, 30, 32, 3); ctx.fill();
  ctx.fillStyle = "#b06bff"; ctx.fillRect(-15, -10, 30, 6);
  ctx.restore();
}
function handbag(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#d63384"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, -10, 10, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = "#ff79c6"; rr(-15, -10, 30, 22, 5); ctx.fill();
  ctx.fillStyle = "#ffd23a"; circle(0, -2, 3, "#ffd23a");
  ctx.restore();
}
function hole(x, y, a) { if (a <= 0) return; ctx.globalAlpha = a; ctx.fillStyle = "#5a2414"; ctx.beginPath(); ctx.ellipse(x, y, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
const PAWS = (() => { const a = []; for (let i = 0; i < 14; i++) { const k = i / 13; a.push([lerp(585, 860, k) + (i % 2 ? 9 : -9), lerp(790, 835, k) + Math.sin(k * 5) * 6, i]); } return a; })();
function paws(t) {
  for (const [x, y, i] of PAWS) {
    const a = clamp((t - T.tracks + 0.4 - i * 0.07) / 0.15); if (a <= 0) continue;
    ctx.globalAlpha = a; ctx.fillStyle = "#4a1c10";
    ctx.beginPath(); ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    for (const [dx, dy] of [[-6, -6], [-2, -8.5], [2, -8.5], [6, -6]]) { ctx.beginPath(); ctx.ellipse(x + dx, y + dy, 2, 2.4, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
function crater(t) {
  const x = 885, y = 845;
  ctx.fillStyle = "#7e3218"; ctx.beginPath(); ctx.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a120a"; ctx.beginPath(); ctx.ellipse(x, y + 3, 56, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,160,110,0.45)"; ctx.beginPath(); ctx.ellipse(x, y + 12, 70, 12, 0, 0.1, Math.PI - 0.1); ctx.fill();
  const e = t >= T.crater ? ramp(t, T.crater, T.crater + 0.25) * (Math.sin(t * 3) > -0.92 ? 1 : 0.1) : 0;
  if (e > 0) for (const dx of [-12, 12]) { glow(x + dx, y + 2, 16, "120,255,90", 0.7 * e); ctx.globalAlpha = e; ctx.fillStyle = "#c8ff5a"; ctx.beginPath(); ctx.ellipse(x + dx, y + 2, 5, 2.4, dx < 0 ? 0.25 : -0.25, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
}
// Buch mit Gesetz 1 bzw. Gesetz 2
function book(x, y, s, state, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#8a6a3a"; rr(-34, -20, 68, 36, 3); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-32, -18, 31, 32, 2); ctx.fill(); rr(1, -18, 31, 32, 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#333"; ctx.font = "900 6px InterX"; ctx.fillText("GESETZ 1", -16, -11); ctx.fillText("GESETZ 2", 16, -11);
  const w = state === "law1" ? ramp(t, T.lawWrite - 0.2, T.lawWrite + 0.3) : 1;
  ctx.save(); ctx.beginPath(); ctx.rect(-31, -6, 30 * w, 18); ctx.clip();
  ctx.fillStyle = RED; ctx.font = "7.5px Comic"; ctx.fillText("KEINE", -16, -1); ctx.fillText("SCHULE", -16, 7);
  ctx.restore();
  if (state === "law2") { ctx.fillStyle = RED; ctx.font = "16px Comic"; ctx.fillText("?", 16, 4); }
  ctx.restore();
}
function profileCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16;
  ctx.fillStyle = "#121216"; rr(-245, -105, 490, 210, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.font = "900 24px InterX"; ctx.fillText("Einfach Wissen", -222, -76);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -222, -54);
  const n = Math.round(FOLLOWERS * easeOut(ramp(t, T.card + 0.1, T.card + 0.6)));
  const stats = [["1", "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]];
  stats.forEach(([v, l], i) => { const x = -222 + i * 110; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -24); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10.5px InterX"; ctx.fillText(l, x, -6); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-118, -40, 104, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-222, 16, 190, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -127, 33);
  ctx.fillStyle = "#2c2c33"; rr(-22, 16, 150, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 33);
  ctx.fillStyle = "#2c2c33"; rr(136, 16, 40, 34, 6); ctx.fill(); ctx.fillText("👤", 156, 33);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea";
  ctx.fillText("1 Follow = 1 Astronaut 🚀", -222, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -222, 88);
  ctx.restore();
  avatarBadge(288 + 190 * s, 250 - 60 * s, 0.9 * s, 0);
  const k = back(ramp(t, T.card + 0.45, T.card + 0.7));
  if (k > 0) {
    ctx.save(); ctx.translate(205, 290); ctx.rotate(-0.12); ctx.scale(k * s, k * s);
    ctx.fillStyle = RED; rr(-70, -18, 140, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+18 NEUE", 0, 2);
    ctx.restore();
  }
}
// TikTok-Kommentar (dunkel, wie im Original)
let ROMY = null;
function tkComment(s, name, text, ago, likes, avatar, y = 235) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14;
  ctx.fillStyle = "#1e1e22"; rr(-240, -58, 480, 116, 14); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2; ctx.stroke();
  // Profilbild mit Story-Ring
  const g = ctx.createLinearGradient(-230, -40, -170, 20); g.addColorStop(0, "#3a8bff"); g.addColorStop(1, "#3ff2b0");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-196, -10, 31, 0, Math.PI * 2); ctx.fill();
  circle(-196, -10, 28, "#1e1e22");
  if (avatar) { ctx.save(); ctx.beginPath(); ctx.arc(-196, -10, 25, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(avatar, -221, -35, 50, 50); ctx.restore(); }
  else { circle(-196, -10, 25, "#3a4256"); astronaut(-196, 12, 0.32, "happy", { t: 0, acc: name.includes("12") ? "#ff79c6" : "#b06bff" }); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "700 15px InterX, 'Noto Color Emoji'"; ctx.fillText(name, -152, -32);
  ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX, 'Noto Color Emoji'";
  // Zeilenumbruch bei langem Text
  const words = text.split(" "), lines = [""];
  for (const w of words) { const tl = lines.at(-1) ? lines.at(-1) + " " + w : w; if (ctx.measureText(tl).width > 330 && lines.at(-1)) lines.push(w); else lines[lines.length - 1] = tl; }
  lines.forEach((l, i) => ctx.fillText(l, -152, -6 + i * 23));
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 13px InterX"; ctx.fillText(`${ago}    Antworten`, -152, 40);
  ctx.strokeStyle = "#cfcfd4"; ctx.lineWidth = 2;
  ctx.beginPath(); const hx = 165, hy = 34; ctx.moveTo(hx, hy + 7); ctx.bezierCurveTo(hx - 13, hy - 2, hx - 7, hy - 12, hx, hy - 5); ctx.bezierCurveTo(hx + 7, hy - 12, hx + 13, hy - 2, hx, hy + 7); ctx.stroke();
  ctx.fillStyle = "#cfcfd4"; ctx.font = "700 14px InterX"; ctx.fillText(String(likes), 182, 35);
  ctx.restore();
}
function stamp(txt, x, y, s, rot = -0.12, col = "#2fd06b") {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = "22px Comic"; const w = ctx.measureText(txt).width + 28;
  ctx.strokeStyle = col; ctx.lineWidth = 4; rr(-w / 2, -20, w, 40, 6); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function label(txt, x, y, s, bg = RED) { // roter, schräger Hinweis („NUR 1 RAKETE?!“)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s);
  ctx.font = "24px Comic"; const w = ctx.measureText(txt).width + 30;
  ctx.fillStyle = bg; rr(-w / 2, -20, w, 40, 10); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
// fliegende Raketen am Himmel (beim Anflug)
function skyRockets(t) {
  const L = [[0, 470, 0.55], [0.35, 250, 0.6], [0.7, 380, 0.5]];
  for (const [d, x, s] of L) {
    const k = ramp(t, T.rockets + d, T.fleet - 0.4 + d * 0.2); if (k <= 0 || k >= 1) continue;
    rocket(lerp(x + 120, x, k), lerp(-500, 520, k), s, 1);
  }
}
const pop = (t, a, b = 99, d = 0.28) => (t < a || t > b + 0.2 ? 0 : back(ramp(t, a, a + d)) * (1 - ramp(t, b, b + 0.18)));

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [cx, cy, z] = cam(t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  sky(t); ground();
  hole(575, 700, t >= T.gone ? ramp(t, T.gone, T.gone + 0.2) : 0);
  if (t >= T.tracks - 0.5) paws(t);
  crater(t);
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  boulders();
  dome(330, 690);
  sign(445, 690);
  // Fahne: steht, bis sie über Nacht verschwunden ist
  if (t < T.gone) flag(575, 700, 1, t);
  // Raketen: eine steht schon, zwei landen dazu
  const landK = ramp(t, T.fleet - 0.4, T.fleet + 0.2);
  rocket(ROCKETS[0][0], ROCKETS[0][1], 0.95, 0);
  for (const [i, [x, y]] of ROCKETS.slice(1).entries()) {
    const k = 1 - Math.pow(1 - clamp(landK * 1.2 - i * 0.2), 2);
    if (k > 0) rocket(x, lerp(-300, y, k), 0.95, k < 1 ? 1 : 0);
  }
  // Schule: wird gebaut und ins All geschossen
  if (t >= T.school && t < T.n7) {
    const up = t >= T.launch ? Math.pow(ramp(t, T.launch, T.launch + 1.6), 2) : 0;
    school(640, 700 - up * 900, back(ramp(t, T.school, T.school + 0.3)) * 1.35, t >= T.launch ? 1 : 0);
  }
  // Einwohner (ab der Landung)
  const crowdA = t >= T.fleet ? 1 : 0;
  if (crowdA) for (const [i, c] of CROWD2.entries()) {
    const a = clamp((t - T.fleet - 0.2 - c.d) / 0.3); if (a <= 0) continue;
    let f = c.f; const o = { t: t + i, acc: c.acc };
    if (t >= T.gone && t < T.follow) f = "shock";
    if (c === N7 && t >= T.n7 && t < T.n12) { f = t >= T.hat ? "happy" : "talk"; o.wave = t >= T.hat; }
    if (c === N12 && t >= T.n12 && t < T.back) { f = t >= T.bag ? "happy" : "talk"; o.armR = t >= T.bag ? -1.2 : -0.25; }
    if (t >= T.law && t < T.safe && i % 3 === 0) o.bob = Math.abs(Math.sin(t * 8 + i)) * 4;
    astronaut(c.x, c.y, c.s * back(a), f, o);
    if (c === N7 && t >= T.hat) topHat(c.x, c.y - 104 * c.s, c.s * back(ramp(t, T.hat, T.hat + 0.3)));
    if (c === N12 && t >= T.bag) handbag(c.x + 30 * c.s, c.y - 38 * c.s, c.s * back(ramp(t, T.bag, T.bag + 0.3)));
  }
  // Hauptfigur
  let face = "smile", o = { t };
  if (t < T.sky) face = "talk";
  if (t >= T.problem) face = "shock";
  if (t >= T.fleet) { face = "happy"; o.armR = -2.5; }
  if (t >= T.top) { face = "talk"; o.armR = -0.25; o.hold = null; }
  if (t >= T.law) { face = "happy"; o.hold = "law1"; o.armL = -0.5; o.armR = 0.5; }
  if (t >= T.safe) { o.hold = null; face = "smirk"; o.armL = 0.25; o.armR = -0.25; }
  if (t >= T.bye) { face = "happy"; o.wave = true; }
  if (t >= T.back) { o.wave = false; face = "talk"; }
  if (t >= T.gone) face = "shock";
  if (t >= T.follow) { face = "happy"; o.wave = true; }
  if (t >= T.law2) { o.wave = false; face = "smirk"; o.hold = "law2"; o.armL = -0.5; o.armR = 0.5; }
  if (t >= T.end) face = "smile";
  astronaut(430, 742, 1, face, o);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  if (t >= T.fleet - 0.2) for (const [x] of ROCKETS.slice(1)) puffs(x, 704, t, T.fleet + 0.05);
  if (t >= T.school && t < T.n7) puffs(640, 708, t, T.launch);
  ctx.restore();
  // Anflug am Himmel (Bildschirm über der Welt, damit die Raketen groß wirken)
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); skyRockets(t); ctx.restore();
  dust(t);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.45)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen
  const tag = pop(t, 0.12, T.sky - 0.3);
  if (tag > 0) { ctx.save(); ctx.translate(288, 190); ctx.scale(tag, tag); outlined("TAG 2", 0, 0, 92, CYAN, "#0e1a30", 13); ctx.restore(); }
  // Zähler +0 … +18
  if (t >= T.count0 - 0.1 && t < T.card) {
    const n = Math.round(NEW * easeIO(ramp(t, T.count0, T.count1)));
    const a = pop(t, T.count0 - 0.1, T.card - 0.1, 0.2), big = 1 + 0.25 * Math.exp(-Math.max(0, t - T.count1) * 8) * (t >= T.count1 ? 1 : 0);
    if (t >= T.count1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - ramp(t, T.count1, T.card)); for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t; ctx.fillStyle = "#3fd3f2"; ctx.beginPath(); ctx.moveTo(288, 230); ctx.arc(288, 230, 400, an, an + 0.12); ctx.fill(); } ctx.restore(); }
    ctx.save(); ctx.translate(288, 215); ctx.scale(a * big, a * big); outlined("+" + n, 0, 0, 96, CYAN, "#0e1a30", 13);
    outlined("NEUE ASTRONAUTEN", 0, 62, 26, "#fff", "#0e1a30", 7); ctx.restore();
  }
  if (t >= T.card && t < T.problem) { profileCard(t, pop(t, T.card, T.problem - 0.15)); confetti(t, T.card + 0.4); }
  label("NUR 1 RAKETE?!", 300, 230, pop(t, T.nur1, T.fleet - 0.1));
  if (t >= T.drei - 0.05 && t < T.top) {
    const a = pop(t, T.drei - 0.05, T.top - 0.15);
    pill("DREI RAKETEN", 288, 200, a, "#fff", "#14223a", "🚀 ");
    ctx.save(); ctx.translate(288, 245); ctx.scale(a, a); ctx.font = "24px Comic";
    const w1 = ctx.measureText("EINWOHNER: ").width, w2 = ctx.measureText("19").width;
    outlined("EINWOHNER: ", -(w1 + w2) / 2, 0, 24, "#fff", "#0e1a30", 7, 900, "left"); outlined("19", -(w1 + w2) / 2 + w1, 0, 24, CYAN, "#0e1a30", 7, 900, "left");
    ctx.restore();
  }
  // Top-Kommentar von Romy
  pill("TOP-KOMMENTAR", 288, 170, pop(t, T.top, T.law - 0.15), "#fff", "#14223a", "👑 ");
  tkComment(pop(t, T.comment, T.law - 0.15), "•°Romy☆", "Es gibt keine schule", "5 Std", 1, ROMY, 270);
  // Gesetz Nr. 1
  if (t >= T.law && t < T.safe) {
    const a = pop(t, T.law, T.safe - 0.15);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("📜 GESETZ NR. 1", 0, 0, 44, "#fff", "#0e1a30", 10); ctx.restore();
    if (t >= T.lawWrite) { const b = pop(t, T.lawWrite, T.safe - 0.15); ctx.save(); ctx.translate(288, 258); ctx.rotate(-0.04); ctx.scale(b, b); outlined("KEINE SCHULE!", 0, 0, 40, RED, "#0e1a30", 10); ctx.restore(); }
    confetti(t, T.confetti);
  }
  pill("SICHER IST SICHER", 288, 190, pop(t, T.safe, T.launch - 0.1), "#fff", "#14223a", "🏫 ");
  if (t >= T.bye && t < T.n7) { const a = pop(t, T.bye, T.n7 - 0.15); ctx.save(); ctx.translate(288, 210); ctx.rotate(-0.06); ctx.scale(a, a); outlined("TSCHÜSS", 0, -30, 54, CYAN, "#0e1a30", 11); outlined("SCHULE! 🚀", 0, 30, 54, CYAN, "#0e1a30", 11); ctx.restore(); confetti(t, T.bye); }
  // Wünsche
  tkComment(pop(t, T.n7, T.n12 - 0.15), "astronaut_07", "Kann ich bitte einen Hut haben? 🥺", "3 Std", 4, null, 215);
  stamp("✓ ERFÜLLT", 420, 260, pop(t, T.done7, T.n12 - 0.15));
  tkComment(pop(t, T.n12, T.back - 0.15), "astronautin_12", "Kann ich eine pinke Handtasche haben? 👜", "2 Std", 6, null, 215);
  stamp("✓ ERFÜLLT", 420, 260, pop(t, T.bag + 0.15, T.back - 0.15));
  if (t >= T.n7 && t < T.back) {
    const c = t < T.n12 ? N7 : N12, [sx, sy] = toScreen(c.x, c.y - 140 * c.s, t);
    pill(t < T.n12 ? "NR. 7" : "NR. 12", sx, sy, pop(t, t < T.n12 ? T.n7 + 0.2 : T.n12 + 0.2, t < T.n12 ? T.n12 - 0.15 : T.back - 0.15), "#fff", "#14223a");
  }
  label("FAHNE WEG?!", 300, 230, pop(t, T.weg, T.tracks + 0.4));
  // Bordkarte Rakete 2
  if (t >= T.follow && t < T.law2) {
    const out = 1 - ramp(t, T.law2 - 0.2, T.law2);
    if (t < T.pass) avatarBadge(288, 250, pop(t, T.follow, T.pass - 0.15), ramp(t, wt(96), wt(96) + 0.25));
    else boardingPass(back(ramp(t, T.pass, T.pass + 0.3)) * out);
  }
  // Gesetz Nr. 2
  if (t >= T.law2) {
    const a = pop(t, T.law2, DUR - 0.25);
    ctx.save(); ctx.translate(288, 175); ctx.scale(a, a); outlined("📜 GESETZ NR. 2", 0, 0, 44, "#fff", "#0e1a30", 10); ctx.restore();
    if (t >= T.comment2) commentCard(pop(t, T.comment2, DUR - 0.25));
  }
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, rockets: T.rockets, count: [T.count0, T.count1], card: T.card, nur1: T.nur1, land: T.fleet + 0.05, drei: T.drei,
    pops: [T.top, T.comment, T.law, T.lawWrite, T.safe, T.school, T.n7, T.done7, T.n12, T.bag + 0.15, T.weg, T.follow, T.pass, T.law2, T.comment2],
    confetti: [T.card + 0.4, T.confetti, T.bye], launch: T.launch, hat: T.hat, bag: T.bag, gone: T.gone, tracks: T.tracks, crater: T.crater,
    whooshes: CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.25), end: T.end };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  ROMY = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "romy.png"; });
  return { duration: DUR };
};
