// ============================================================ Tag 8 „Neuer Planet, neues Land“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js + tag8.js -> scene.js)
// Aufbau wie Tag 2. Echte Umfrage Tag 7: 67 % „Mitten durch“ (27 Stimmen). 829 Follower (−1 → kein „+NEU“-Badge).
const FOLLOWERS = 829, LIKES = "4.352", FOLLOWING = "7";
const T = {
  monster: wt(6), crash: wt(9), card: wt(14), neu: wt(16), jens: wt(20), build: wt(27), mehmet: wt(29), apple: wt(39),
  roader: wt(40), worm: wt(46), nico: wt(51), wish: wt(56), cliff: wt(59), eyes: wt(64), follow: wt(66), like: wt(73),
  law: wt(79), top: wt(87), loop: SPEECH_END + 0.1,
};
const AV = {};

// ------------------------------------------------------------ Neuer Planet: pinker Sand, türkiser Ringplanet
const DUNES = (() => { const r = rng(5), a = []; for (let i = 0; i < 80; i++) { const y = HORIZON + 10 + Math.pow(r(), 1.3) * 900; a.push([r() * 2800 - 1100, y, 10 + r() * 36 * (0.4 + (y - HORIZON) / 500), r()]); } return a; })();
function sky8(t) {
  const g = ctx.createLinearGradient(0, -900, 0, HORIZON); g.addColorStop(0, "#120a2e"); g.addColorStop(1, "#5a2a6e"); ctx.fillStyle = g; ctx.fillRect(-2000, -2500, 5000, HORIZON + 2500);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(x, y, r, "#fff"); } ctx.globalAlpha = 1;
  // Ringplanet
  const px = 470, py = 330, R = 110;
  glow(px, py, R * 1.8, "90,230,220", 0.3);
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35);
  ctx.strokeStyle = "rgba(255,230,160,0.9)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.9, R * 0.45, 0, Math.PI, 2 * Math.PI); ctx.stroke();
  circle(0, 0, R + 4, "#1b1424"); circle(0, 0, R, "#3fd3c8"); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#2bb3a8"; for (const [dy, h] of [[-50, 18], [-10, 26], [35, 16], [70, 20]]) ctx.fillRect(-R, dy, 2 * R, h);
  ctx.fillStyle = "rgba(0,0,30,0.3)"; ctx.beginPath(); ctx.arc(30, 25, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = "rgba(255,230,160,0.95)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.9, R * 0.45, 0, 0, Math.PI); ctx.stroke();
  ctx.restore();
  circle(60, 250, 22, "#1b1424"); circle(60, 250, 19, "#f2c94c"); circle(54, 244, 5, "#e0b03a");          // kleiner Mond
  const h = ctx.createLinearGradient(0, HORIZON - 200, 0, HORIZON); h.addColorStop(0, "rgba(255,140,190,0)"); h.addColorStop(1, "rgba(255,150,200,0.5)"); ctx.fillStyle = h; ctx.fillRect(-2000, HORIZON - 200, 5000, 200);
}
function ground8() {
  ctx.fillStyle = "#c86a9a"; ctx.beginPath(); ctx.moveTo(-2000, HORIZON + 4);
  for (let x = -2000; x <= 3000; x += 60) ctx.lineTo(x, HORIZON - 10 - 16 * Math.abs(Math.sin(x * 0.0045)) - 9 * Math.sin(x * 0.015));
  ctx.lineTo(3000, HORIZON + 4); ctx.fill();
  const g = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 900); g.addColorStop(0, "#e88ab6"); g.addColorStop(0.35, "#f3a2c6"); g.addColorStop(1, "#f8bcd6"); ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON, 5000, 2000);
  for (const [x, y, r, k] of DUNES) {
    ctx.fillStyle = k < 0.5 ? "rgba(170,70,120,0.35)" : "rgba(255,210,230,0.45)"; ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    if (k > 0.8) { ctx.fillStyle = "#8e4fb0"; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y); ctx.lineTo(x - r * 0.2, y - r * 0.6); ctx.lineTo(x + r * 0.4, y - r * 0.5); ctx.lineTo(x + r * 0.6, y); ctx.fill(); }   // lila Kristallsteine
  }
}
function crystal(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); glow(0, -30, 60, "120,240,230", 0.3 + 0.1 * Math.sin(t * 3 + x)); for (const [dx, h, c] of [[-14, 50, "#5fe0d4"], [0, 70, "#8ff2e8"], [14, 44, "#3fc3b8"]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(dx - 8, 0); ctx.lineTo(dx, -h); ctx.lineTo(dx + 8, 0); ctx.fill(); } ctx.restore(); }
function cave(x, y, t, eyes) {
  ctx.fillStyle = "#b45a8a"; ctx.beginPath(); ctx.moveTo(x - 260, y); ctx.bezierCurveTo(x - 220, y - 300, x + 220, y - 320, x + 280, y); ctx.fill();
  ctx.fillStyle = "#9a4878"; ctx.beginPath(); ctx.moveTo(x - 200, y); ctx.bezierCurveTo(x - 160, y - 230, x + 160, y - 240, x + 210, y); ctx.fill();
  ctx.fillStyle = "#12081c"; ctx.beginPath(); ctx.moveTo(x - 90, y); ctx.bezierCurveTo(x - 90, y - 170, x + 90, y - 170, x + 90, y); ctx.fill();
  if (eyes > 0) for (const d of [-1, 1]) { ctx.globalAlpha = eyes; glow(x + d * 30, y - 95, 60, "255,80,60", 0.7); ctx.fillStyle = "#ff5a3a"; ctx.beginPath(); ctx.ellipse(x + d * 30, y - 95, 14, 8 * eyes, d * 0.2, 0, Math.PI * 2); ctx.fill(); circle(x + d * 30, y - 95, 4 * eyes, "#2a0808"); ctx.globalAlpha = 1; }
}
function footprint(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = "rgba(150,50,100,0.55)"; ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2); ctx.fill(); for (const [dx, dy] of [[-22, -16], [-6, -22], [12, -20], [26, -12]]) { ctx.beginPath(); ctx.ellipse(dx, dy, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
function appleHut(x, y, s, open, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f4f6f8"; rr(-90, -130, 180, 130, 14); ctx.fill(); ctx.fillStyle = "#dfe5ea"; ctx.fillRect(-90, -20, 180, 20);
  ctx.fillStyle = "#cfd6dc"; ctx.beginPath(); ctx.moveTo(-104, -128); ctx.lineTo(104, -128); ctx.lineTo(80, -160); ctx.lineTo(-80, -160); ctx.fill();
  // Tür mit Apfel-Logo, gleitet auf
  ctx.fillStyle = "#1b1424"; rr(-40, -100, 80, 100, 8); ctx.fill(); if (open > 0) { glow(0, -50, 80, "255,250,220", 0.7 * open); ctx.fillStyle = "#fff9e0"; rr(-36, -96, 72, 96, 6); ctx.fill(); }
  ctx.fillStyle = "#e9edf0"; rr(-40 - 76 * open, -100, 80, 100, 8); ctx.fill();
  ctx.fillStyle = "#9aa3ab"; ctx.font = "34px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🍎", -76 * open, -52);
  ctx.fillStyle = "#1b1424"; rr(-80, -158, 160, 24, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "15px Comic"; ctx.fillText("APPLE STORE", 0, -145);
  ctx.restore();
}
function bigWorm(x, y, s, t) { // roaders Wurm, groß mit Helm + Namensschild
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 7; i >= 0; i--) { const yy = -12 - Math.max(0, Math.sin(t * 6 + i * 0.8)) * 10, xx = i * 14; circle(xx, yy, 12, "#1b1424"); circle(xx, yy, 10.5, i % 2 ? "#ff8fa8" : "#ff9db4"); }
  circle(-4, -18, 13, "#1b1424"); circle(-4, -18, 11.5, "#ff9db4"); circle(-9, -21, 2, "#111"); circle(-1, -21, 2, "#111"); ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-5, -15, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.strokeStyle = "rgba(200,235,255,0.95)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-4, -18, 19, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "rgba(200,235,255,0.25)"; ctx.fill(); circle(-12, -27, 3, "rgba(255,255,255,0.8)");
  ctx.restore();
}
function hornWheel(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2.5) * 0.4); ctx.scale(s, s); ctx.strokeStyle = "#2a2c34"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.stroke(); } circle(0, 0, 9, "#e5262b"); ctx.restore(); }

// ------------------------------------------------------------ Weltlayout
const ROCKET = { x: 330, y: 708, s: 1.6, rot: 0.24 };
const WIN = (() => { const c = Math.cos(ROCKET.rot), s = Math.sin(ROCKET.rot), lx = 0, ly = -100 * ROCKET.s; return { x: ROCKET.x + lx * c - ly * s, y: ROCKET.y + lx * s + ly * c, r: 30 * ROCKET.s }; })();
const STAND = { x: -260, y: 712 }, HUT = { x: -620, y: 712 }, FLAG = { x: 600, y: 720 }, CAVE = { x: 1300, y: 640 };
const EGGS8 = [ // Fans aus den letzten Tagen (Easter Eggs)
  { id: "nico", x: 120, acc: "#3fd3f2" }, { id: "elster", x: 40, acc: "#ff79c6" }, { id: "bz", x: 200, acc: "#ffb43a" }, { id: "elias", x: 470, acc: "#b06bff" },
  { id: "balerz", x: 545, acc: "#a50044" }, { id: "jaroslav", x: 620, acc: "#1c2f6b" }, { id: "tick", x: 695, acc: "#ff7a2a" }, { id: "jakob", x: 770, acc: "#9a8f88" }, { id: "phillip", x: 860, acc: "#ffb43a" },
];
function egg8(e, t, y = 770) {
  const s = 0.82, o = { t: t + e.x, acc: e.acc };
  if (e.id === "elster") Object.assign(o, { suit: "#ff9fd2", suit2: "#ffb6dc", suit3: "#e77fb8" });
  if (e.id === "phillip") Object.assign(o, { armL: -0.9, armR: 0.9 });
  astronaut(e.x, y, s, t >= T.cliff && t < T.follow ? "shock" : "happy", o);
  const hy = y - 104 * s;
  if (e.id === "nico") eggItem("gamer", e.x, y, s, t);
  if (e.id === "elster") dogEars(e.x, hy, s);
  if (e.id === "bz") chickenHat(e.x, hy, s, t);
  if (e.id === "elias") pizzaHat(e.x, hy, s);
  if (e.id === "balerz") barca(e.x, y, s);
  if (e.id === "jaroslav") policeCap(e.x, y, s);
  if (e.id === "tick") winterJacket(e.x, y, s);
  if (e.id === "jakob") stoneFriend(e.x + 40 * s, y, 0.7 * s, t);
  if (e.id === "phillip") orangeCat(e.x - 2, y - 52 * s, s * 0.9, t);
}
const CREW8 = [[300, 0], [250, 1], [360, 2], [410, 3]];   // Astronauten, die aus der Luke taumeln

// ------------------------------------------------------------ Kamera
const CAM = [
  [0, WIN.x - 10, WIN.y + 70, 2.6], [T.monster, WIN.x - 10, WIN.y + 75, 2.75], [T.crash - 0.1, WIN.x - 10, WIN.y + 80, 2.8], [T.crash + 0.25, 330, 600, 1.15],
  [T.card - 0.1, 330, 600, 1.15], [T.card + 0.2, 330, 560, 0.85], [T.neu - 0.1, 330, 560, 0.85], [T.neu + 0.3, 400, 590, 0.8], [T.jens - 0.1, 400, 590, 0.82],
  [T.jens + 0.2, STAND.x + 60, 640, 1.35], [T.mehmet - 0.1, STAND.x + 60, 640, 1.4], [T.mehmet + 0.2, HUT.x + 40, 640, 1.4], [T.roader - 0.1, HUT.x + 40, 640, 1.45],
  [T.roader + 0.2, 760, 650, 1.35], [T.nico - 0.1, 760, 650, 1.4], [T.nico + 0.2, 380, 640, 0.95], [T.cliff - 0.1, 380, 640, 0.95],
  [T.cliff + 0.25, CAVE.x - 220, 600, 1.05], [T.follow - 0.1, CAVE.x - 180, 590, 1.25], [T.follow + 0.2, 330, 600, 0.9], [T.like - 0.1, 330, 600, 0.92],
  [T.like + 0.2, STAND.x + 120, 640, 1.2], [T.law - 0.1, STAND.x + 120, 640, 1.25], [T.law + 0.2, 300, 610, 0.95], [T.loop - 0.02, 300, 610, 1.0],
  [T.loop, WIN.x - 10, WIN.y + 70, 2.6], [DUR, WIN.x - 10, WIN.y + 70, 2.6],
];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) { const a = CAM[i - 1], b = CAM[i], k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k))]; }
  return CAM.at(-1).slice(1);
}
const toScreen = (x, y, t) => { const [cx, cy, z] = cam(t); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z, z]; };
const looped = t => t >= T.loop ? t - T.loop : t;           // im Loop wieder wie am Anfang

// ------------------------------------------------------------ Welt zeichnen
function drawWorld(t, z) {
  const lt = looped(t), inLoop = t >= T.loop;
  sky8(t); ground8();
  for (const [x, y, s] of [[-900, 690, 1.2], [-40, 700, 0.9], [1000, 700, 1.1], [180, 760, 0.7]]) crystal(x, y, s, t);
  // Höhle + Fußspuren
  cave(CAVE.x, CAVE.y, t, t >= T.eyes ? ramp(t, T.eyes, T.eyes + 0.2) : 0);
  for (let i = 0; i < 6; i++) footprint(CAVE.x - 160 - i * 95, CAVE.y + 70 + (i % 2) * 26, 1.5, 0.1 * (i % 2 ? 1 : -1));
  // Menge (ab „Wir fangen neu an“ aus der Rakete heraus)
  if (t >= T.neu && !inLoop) for (const [i, m] of MASS.entries()) { if (i % 3) continue; const sp = SPR[m.acc]; if (!sp) continue; const k = easeOut(ramp(t, T.neu + (i % 40) * 0.012, T.neu + 0.6 + (i % 40) * 0.012)); if (k <= 0) continue; const x = lerp(ROCKET.x, m.x, k), y = lerp(ROCKET.y, m.y, k), w = 88 * m.s, h = 158 * m.s; ctx.drawImage(sp, x - w / 2, y - h - Math.abs(Math.sin(t * 6 + m.ph)) * 3, w, h); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  // Apple Store (Mehmet), Dönerstand (Jens + Tim)
  if (!inLoop) {
    if (t >= T.mehmet - 0.2) appleHut(HUT.x, HUT.y, 1, easeOut(ramp(t, T.apple, T.apple + 0.4)), t);
    if (t >= T.build) { const k = back(ramp(t, T.build, T.build + 0.35)); ctx.save(); ctx.translate(STAND.x, STAND.y); ctx.scale(1, k); ctx.translate(-STAND.x, -STAND.y); donerShop(STAND.x, STAND.y, 1.0); ctx.restore(); }
    if (t >= T.jens - 0.2) { const jx = STAND.x + 120, bt = t >= T.jens && t < T.build; astronaut(jx, 768, 0.9, "happy", { t, acc: "#ffd23a", armR: bt ? -1.2 - Math.abs(Math.sin(t * 12)) * 1.2 : -2.4 }); if (bt) { ctx.save(); ctx.translate(jx + 28, 768 - 112 + Math.sin(t * 12) * 8); ctx.rotate(-0.8 + Math.sin(t * 12) * 0.6); ctx.fillStyle = "#6b4a2a"; ctx.fillRect(-2, 0, 4, 26); ctx.fillStyle = "#7a7f88"; rr(-9, -6, 18, 9, 2); ctx.fill(); ctx.restore(); } }
    if (t >= T.build) { const tx = STAND.x - 40; astronaut(tx, 770, 0.85, "happy", { t: t + 3, acc: "#7bf27a", armR: -1.4 + Math.sin(t * 6) * 0.4 }); chefBand(tx, 770, 0.85); }
    if (t >= T.mehmet - 0.2) { const mx = HUT.x + 130, cheer = t >= T.apple; astronaut(mx, 772 - (cheer ? Math.abs(Math.sin(t * 9)) * 18 : 0), 0.9, cheer ? "happy" : "think", { t, acc: "#ff8a2a", armL: cheer ? 2.6 : 0.25, armR: cheer ? -2.6 : -0.25 }); }
  }
  // Fahne
  if (t >= T.neu && !inLoop) flag2(FLAG.x, FLAG.y, ramp(t, T.neu + 0.3, T.neu + 0.9), t);
  // Rakete schief im Sand + Monster am Steuer
  ctx.save(); ctx.translate(ROCKET.x, ROCKET.y); ctx.rotate(ROCKET.rot); rocket(0, 0, ROCKET.s, 0);
  ctx.fillStyle = "#2a2230"; rr(-16, -66, 32, 54, 6); ctx.fill();                  // offene Luke
  const wr = ROCKET.s; circle(0, -100 * wr, 32 * wr, "#1b1424"); circle(0, -100 * wr, 29 * wr, "#9aa3ab"); circle(0, -100 * wr, 25 * wr, "#cfeaf7");   // großes Cockpitfenster
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(WIN.x, WIN.y, 25 * ROCKET.s, 0, Math.PI * 2); ctx.clip();
  const honk = (lt > T.monster - 0.05 && lt < T.monster + 0.4 && !inLoop) || (inLoop && lt > 0.15);
  creature(WIN.x, WIN.y + 78, 0.3, t, { happy: true, cheeks: false, eyes: 1, look: 0, munch: false });
  ctx.restore();
  hornWheel(WIN.x - 2, WIN.y + 42, 0.75 * (honk ? 1.08 : 1), t);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(WIN.x - 8, WIN.y - 6, 30, 3.6, 4.4); ctx.stroke();
  // Astronauten taumeln aus der Luke (benommen)
  if (t >= T.crash && !inLoop) for (const [x, i] of CREW8) { const k = easeOut(ramp(t, T.crash + i * 0.12, T.crash + 0.7 + i * 0.12)); const xx = lerp(ROCKET.x - 10, x - 140 + i * 30, k); const wob = Math.sin(t * 5 + i) * 0.12 * (t < T.neu ? 1 : 0.2); leanAstro(xx, 776 + i * 4, 0.85, wob, t < T.neu ? "shock" : "happy", { t: t + i, acc: ["#3fd3f2", "#ff79c6", "#7bf27a", "#ffd23a"][i], armL: 0.6, armR: -0.6 }); }
  // Wurm, Fans, Monster draußen
  if (t >= T.worm && !inLoop) bigWorm(lerp(980, 700, easeOut(ramp(t, T.worm, T.worm + 0.8))), 790, 3.0, t);
  if (t >= T.nico && !inLoop) for (const e of EGGS8) egg8(e, t, 772);
  if (t >= T.cliff && t < T.follow) { const sx = lerp(CAVE.x - 600, CAVE.x - 330, easeIO(ramp(t, T.cliff, T.eyes))); creature(sx, 740, 0.38, t, { sniff: true, eyes: 1, look: 1 }); }
  if (t >= T.like && t < T.loop) creature(STAND.x + 230, 770, 0.42, t, { sit: true, munch: t >= T.like + 0.6, happy: true });
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  // Effekte in der Welt
  if (lt < T.crash + 0.6 || inLoop) for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); ctx.globalAlpha = 0.5 * (1 - k); circle(ROCKET.x + 60 + Math.sin(t + i) * 14, ROCKET.y - 240 - k * 180, 16 + 36 * k, "#cfc4d8"); ctx.globalAlpha = 1; }
  if (t >= T.crash && t < T.neu) for (const [x, i] of CREW8) { const k = easeOut(ramp(t, T.crash + i * 0.12, T.crash + 0.7 + i * 0.12)), xx = lerp(ROCKET.x - 10, x - 140 + i * 30, k); for (let j = 0; j < 3; j++) { const a = t * 4 + j * 2.1; ctx.save(); ctx.font = "14px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("⭐", xx + Math.cos(a) * 26, 776 + i * 4 - 128 + Math.sin(a) * 8); ctx.restore(); } }
  if (t >= T.build && t < T.build + 1.0) puffs(STAND.x, STAND.y, t, T.build, 8);
  if (t >= T.apple && t < T.apple + 0.8) sparkleBurst(HUT.x, HUT.y - 80, t, T.apple);
  if (t >= T.worm + 0.6 && t < T.worm + 1.4) sparkleBurst(700, 700, t, T.worm + 0.6);
}

// ------------------------------------------------------------ Karten (sichere Zone: Mitte SX, Breite ≤ 420)
function card(fn, y) { ctx.save(); ctx.translate(SX, y); ctx.scale(0.88, 0.88); ctx.translate(-288, -y); fn(); ctx.restore(); }
function profileCard8(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16; ctx.fillStyle = "#121216"; rr(-212, -100, 424, 200, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "900 23px InterX"; ctx.fillText("Gedacht", -190, -70);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -190, -48);
  const n = Math.round(lerp(780, FOLLOWERS, easeOut(ramp(t, T.card + 0.1, T.card + 0.8))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -190 + i * 100; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -20); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10px InterX"; ctx.fillText(l, x, -3); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-96, -38, 100, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-190, 18, 170, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -105, 35);
  ctx.fillStyle = "#2c2c33"; rr(-12, 18, 130, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 35);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea"; ctx.fillText("1 Follow = 1 Bewohner 🚀", -190, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -190, 87);
  if (AV.me) { circle(160, -58, 36, "#fff"); ctx.save(); ctx.beginPath(); ctx.arc(160, -58, 33, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, 127, -91, 66, 66); ctx.restore(); }
  ctx.restore();
}
function boardingPass8(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 250); ctx.rotate(-0.02); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-205, -70, 410, 140, 12); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.fillStyle = CYAN; rr(110, -70, 95, 140, [0, 12, 12, 0]); ctx.fill();
  ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, -64); ctx.lineTo(110, 64); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = CYAN; ctx.font = "900 13px InterX"; ctx.letterSpacing = "1.5px"; ctx.fillText("BORDKARTE", -185, -44); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#121a2a"; ctx.font = "900 42px InterX"; ctx.fillText("RAKETE 3", -187, -4);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 12px InterX"; ctx.fillText("Name: DU?  ·  Sitz: ???  ·  Ziel: ROTANIEN 2.0", -185, 40);
  ctx.restore();
  astronaut(SX + 158 * s, 250 + 34 * s, 0.45 * s, "happy", { t: 0 });
}
function lawCall(t, s) { // Gesetzestafel + leere Kommentarkarte wie in Tag 2
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 160); ctx.scale(s, s); outlined("📜 GESETZ NR. 1", 0, 0, 40, "#fff", "#0e1a30", 10); ctx.restore();
  ctx.save(); ctx.translate(SX, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-172, -6, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -5);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -142, -22);
  ctx.fillStyle = "#e3f8fd"; rr(-74, -32, 112, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("⭐ Top-Kommentar", -68, -21.5);
  ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("dein Gesetz? 🤔", -142, 4);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten", -142, 27);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -10 + Math.sin(t * 6) * 2);
  ctx.restore();
  // Gesetzestafel „GESETZ NR. 1 | ?“
  ctx.save(); ctx.translate(SX, 380); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-96, -54, 192, 108, 12); ctx.fill(); ctx.fillStyle = "#b9b3ab"; rr(-90, -48, 180, 96, 10); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.font = "18px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("GESETZ NR. 1", 0, -24); ctx.fillStyle = RED; ctx.font = "44px Comic"; ctx.fillText("?", 0, 16); ctx.restore();
}
function likeButton(t, s) { // TikTok-Herz wird angetippt, ein Döner fliegt zum Monster
  if (s <= 0.01) return;
  const tap = (t - T.like) % 0.9, k = tap < 0.15 ? 1 + tap * 2 : 1;
  ctx.save(); ctx.translate(SX, 300); ctx.scale(s * k, s * k);
  circle(0, 0, 54, "rgba(0,0,0,0.55)"); ctx.font = "62px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("❤️", 0, 4);
  ctx.restore();
  ctx.save(); ctx.translate(SX, 380); ctx.scale(s, s); outlined("❤️ = 🥙", 0, 0, 36, "#fff", "#0e1a30", 8); ctx.restore();
}

// ------------------------------------------------------------ Effekte
const IMPACTS = [T.monster, T.crash, T.build, T.apple, T.eyes, T.loop + 0.15];
function shakeAt(t) { let dx = 0, dy = 0; for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.4) continue; const a = 6 * Math.exp(-d * 10); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; } return [dx, dy]; }
const CUTS = CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05);
function flash(t) { let a = 0; for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.25 * (1 - d / 0.14)); } if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); } }

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); drawWorld(t, z); ctx.restore();
  dust(t);
  if (t >= T.cliff && t < T.follow) { ctx.fillStyle = "rgba(20,5,30,0.35)"; ctx.fillRect(0, 0, W, H); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(30,5,30,0.4)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen (sichere Zone)
  const lt = looped(t);
  if (lt < T.crash || t >= T.loop) { const a = t >= T.loop ? 1 : 1 - ramp(t, T.crash - 0.1, T.crash + 0.05); ctx.save(); ctx.translate(SX, 175); ctx.scale(a, a); outlined("TAG 8", 0, 0, 86, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t >= T.monster - 0.05 && t < T.crash || (t >= T.loop + 0.15)) { const d = t >= T.loop ? t - T.loop - 0.15 : t - T.monster + 0.05; const a = back(clamp(d / 0.15)) * (t >= T.loop ? 1 : 1 - ramp(t, T.monster + 0.45, T.monster + 0.6)); const [sx, sy] = toScreen(WIN.x + 70, WIN.y - 40, t); ctx.save(); ctx.translate(Math.min(sx, 420), sy); ctx.rotate(-0.15); ctx.scale(a, a); outlined("HUP! HUP!", 0, 0, 34, "#ffd23a", "#0e1a30", 8); ctx.restore(); }
  if (t >= T.crash && t < T.card) topLabel("💥 BRUCHLANDUNG", pop(t, T.crash + 0.05, T.card - 0.05), "#fff", 160, 40, RED);
  if (t >= T.card && t < T.neu + 0.2) { profileCard8(t, pop(t, T.card, T.neu + 0.1)); confetti(t, T.card + 0.2); }
  if (t >= T.neu + 0.2 && t < T.jens) topLabel("🚩 ROTANIEN 2.0", pop(t, T.neu + 0.3, T.jens - 0.05), "#fff", 160, 40, "#4a2b9a");
  if (t >= T.jens && t < T.mehmet) { card(() => tkComment(pop(t, T.jens, T.mehmet - 0.1), "Jens", "ich Stelle döner wieder her", "Vor 22 Std.", 0, AV.jens, 240), 240); topLabel("⭐ ERSTE AMTSHANDLUNG", pop(t, T.jens + 0.2, T.mehmet - 0.1), "#14223a", 138, 24, "#ffd23a"); if (t >= T.build) stamp("✓ ERFÜLLT", 360, 300, pop(t, T.build + 0.15, T.mehmet - 0.1)); }
  if (t >= T.mehmet && t < T.roader) { card(() => tkComment(pop(t, T.mehmet, T.roader - 0.1), "Mehmet_brb", "Apple Store auf dem nächsten Planeten 😂?", "Vor 17 Std.", 0, AV.mehmet, 240), 240); topLabel("📅 FRAGT SEIT TAG 3", pop(t, T.mehmet + 0.4, T.roader - 0.1), "#fff", 138, 24, "#14223a"); if (t >= T.apple) stamp("✓ ERFÜLLT", 360, 310, pop(t, T.apple + 0.1, T.roader - 0.1)); }
  if (t >= T.roader && t < T.nico) { card(() => tkComment(pop(t, T.roader, T.nico - 0.1), "roader", "man bitteeeee mein wurm", "Vor 14 Std.", 0, AV.roader, 240), 240); if (t >= T.worm) { stamp("✓ ERFÜLLT", 360, 300, pop(t, T.worm + 0.1, T.nico - 0.1)); const [wx, wy] = toScreen(720, 690, t); pill("ROADERS WURM", Math.min(wx, 400), wy, pop(t, T.worm + 0.5, T.nico - 0.1), "#fff", "#14223a", "🪱 "); } }
  if (t >= T.nico && t < T.cliff) { const [nx, ny] = toScreen(120, 640, t); pill("FIRE.NICO", Math.max(70, Math.min(nx, 420)), ny, pop(t, T.nico + 0.2, T.cliff - 0.1), "#fff", "#14223a", "🎮 "); topLabel("💬 JEDER WUNSCH ZÄHLT", pop(t, T.wish, T.cliff - 0.05), "#14223a", 160, 32, "#ffd23a"); }
  if (t >= T.cliff && t < T.follow) { topLabel("👣 NICHT DIE ERSTEN …", pop(t, T.cliff + 0.2, T.follow - 0.05), "#fff", 160, 36, null); }
  if (t >= T.follow && t < T.like) { boardingPass8(pop(t, T.follow, T.like - 0.08)); topLabel("1 FOLLOW = 1 PLATZ", pop(t, T.follow + 0.2, T.like - 0.08), "#14223a", 140, 28, "#ffd23a"); }
  if (t >= T.like && t < T.law) { likeButton(t, pop(t, T.like, T.law - 0.08)); topLabel("1 LIKE = 1 DÖNER", pop(t, T.like + 0.1, T.law - 0.08), "#14223a", 140, 28, "#ffd23a");
    for (let i = 0; i < 3; i++) { const t0 = T.like + 0.3 + i * 0.5, d = (t - t0) / 0.45; if (d < 0 || d > 1) continue; const [mx, my] = toScreen(STAND.x + 230, 700, t); ctx.save(); ctx.translate(lerp(SX, mx, d), lerp(300, my, d) - Math.sin(Math.PI * d) * 80); ctx.rotate(d * 6); doner(0, 0, 1.6); ctx.restore(); } }
  if (t >= T.law && t < T.loop) { lawCall(t, pop(t, T.law, 99)); const b = pop(t, T.top + 0.1, 99); if (b > 0) { ctx.save(); ctx.translate(SX, 470); ctx.scale(b, b); outlined("+ dein Wunsch kommt vielleicht ins nächste Video 👇", 0, 0, 15, "#fff", "#0e1a30", 5); ctx.restore(); } }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"], ["jens", "jens.png"], ["mehmet", "mehmet.png"], ["roader", "roader.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
