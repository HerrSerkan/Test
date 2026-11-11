// ============================================================ Tag 10 „24 Wünsche – alle gebaut“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js + tag10.js -> scene.js)
// 1:1 nach dem Aufbau des Vorbild-Videos (Stadtkarte von oben, Wunsch-Häuser, Rätsel, Hausliste, Auflösung, Like = Taler),
// angepasst auf Rotanien 2.0: fremder Planet (pinker Sand, Krater, türkiser Leuchtfluss, Kristalle), echte Kommentare, echte Zahlen.
const FOLLOWERS = 835, TALER = 4422;
const T = {
  expl: wt(6), wish2: wt(11), hook: wt(15), triple: wt(20), count: wt(22), built: wt(28), range: wt(29), edeka: wt(33), crazy: wt(38), halt: wt(44), tipp: wt(53), end: wt(59),
  list: wt(64), such: wt(70), wieder: wt(77), oben: wt(84), f: [wt(88), wt(90), wt(92), wt(94), wt(96), wt(99), wt(101)], law: wt(107),
  reso: wt(113), wunsch: wt(117), reveal: wt(120), higher: wt(127), recht: wt(130), stadt: wt(133), moeglich: wt(137), grow: wt(141),
  comm: wt(145), denk: wt(149), like: wt(152), folg: wt(159), wish: wt(161), loop: 1e9,
};
const AV = {};
const INK = "#2b1a3a", CREAM = "#fff6e6", PINK = "#ff4f8b", TEAL = "#19b8a6", GOLD = "#ffd23a";

// ------------------------------------------------------------ die 24 Wünsche (alle aus echten Kommentaren, Tag 2–9)
const HAUS = [
  { u: "Jens", w: "Dönerladen", k: "doner", c: "#ffe7b8", sign: "DÖNER", av: "jens" },
  { u: "Safuan", w: "Döner „SAFUAN“", k: "doner", c: "#ffd08a", sign: "SAFUAN", av: "safuan" },
  { u: "Fabi 2.", w: "Dönermann-Stand", k: "doner", c: "#fff1cf", sign: "DÖNER", av: "fabi" },
  { u: "Mehmet_brb", w: "Edeka", k: "markt", c: "#ffe14a", av: "mehmet", txt: "Bitte einen Edeka" },
  { u: "Janic-Energy", w: "Villa", k: "villa", c: "#fff3d6", av: "janicenergy", txt: "Alle haben eine Villa" },
  { u: "berat_bulut", w: "Schwertschmiede", k: "schmiede", c: "#aab2c0", av: "berat", txt: "Kriege ich jetzt endlich ein Schwert" },
  { u: "sami&zoe", w: "Schule", k: "schule", c: "#ff8f6b", av: "sami", txt: "Kann ich Lehrerin sein" },
  { u: "Phillip", w: "Katzencafé", k: "katze", c: "#ffae5e", av: "phillip", txt: "Wann bekomme ich meine Orange Katze?" },
  { u: "Fire.Nico", w: "Gaming-Halle", k: "gaming", c: "#7a5cff", av: "nico", txt: "möchte endlich Gamer Astronaut sein bitte bitte" },
  { u: "roader", w: "Wurmhaus", k: "wurm", c: "#ff9db4", av: "roader", txt: "man bitteeeee mein wurm" },
  { u: "Mehmet_brb", w: "Apple Store", k: "apple", c: "#dff3ff", av: "mehmet" },
  { u: "MEO", w: "Haus für alle", k: "haus", c: "#7bd0ff", av: "meo" },
  { u: "Alex", w: "Pizzeria", k: "pizza", c: "#e57a5a", av: "alex" },
  { u: "Noam", w: "iPhone-Turm", k: "iphone", c: "#2b2f3c", av: "noam" },
  { u: "l.cgln16", w: "Palast", k: "palast", c: "#ffd76b", av: "lcgln" },
  { u: "luk", w: "Polizeiwache", k: "polizei", c: "#5a8bff", av: "luk" },
  { u: "einfachso", w: "Security-Turm", k: "security", c: "#4a4f5c", av: "einfachso" },
  { u: "MEO", w: "YouTube-Studio", k: "youtube", c: "#ff4b4b", av: "meo" },
  { u: "Leonard", w: "Goyo-Haus", k: "goyo", c: "#b06bff", av: "leonard" },
  { u: "Arda", w: "Monster-Höhle", k: "monster", c: "#6b5bd6", av: "arda" },
  { u: "Bz_Full", w: "Hühnerstall", k: "huhn", c: "#f6e8c6" },
  { u: "Jakob", w: "Stein-Haus", k: "stein", c: "#9a8f88" },
  { u: "elster", w: "Hundehütte", k: "hund", c: "#ff9fd2" },
  { u: "keanu", w: "Riesenhaus", k: "riesen", c: "#4a7bff", av: "keanu", txt: "ich frage seit Tag 2 darf ich ein riesen Astronaut werden in Blau" },
];
const N = HAUS.length, MYST = N - 1;
const FEAT = [3, 5, 6, 7, 8, 9, 4];       // Edeka, Schwertschmiede, Schule, Katzencafé, Gaming-Halle, Wurmhaus, Villa
const FTAG = ["EDEKA!", "SCHMIEDE!", "SCHULE!", "KATZENCAFÉ!", "GAMING!", "WURMHAUS!", "VILLA FÜR ALLE!"];
let TNOW = 0;

// ------------------------------------------------------------ Gebäude (jedes mit eigener Form, Schatten, Licht, kleinen Bewegungen)
function bld(i, x, y, s, sil = false) { // Unterkante Mitte
  const b = HAUS[i], t = TNOW, ph = i * 1.7;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * (1 + 0.012 * Math.sin(t * 3 + ph))); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(70,20,70,0.22)"; ctx.beginPath(); ctx.ellipse(0, 2, 44, 6, 0, 0, Math.PI * 2); ctx.fill();
  const box = (w, h, c, x0 = 0, r = 5) => { ctx.fillStyle = c; rr(x0 - w / 2, -h, w, h, r); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(x0 - w / 2, -h, w, h, r); ctx.clip(); ctx.fillStyle = "rgba(0,0,0,0.10)"; ctx.fillRect(x0 + w * 0.2, -h, w, h); ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(x0 - w / 2, -h, w, 5); ctx.restore(); rr(x0 - w / 2, -h, w, h, r); ctx.stroke(); };
  const tri = (w, yb, h, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w / 2, yb); ctx.lineTo(0, yb - h); ctx.lineTo(w / 2, yb); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * 0.3, yb - h * 0.28); ctx.lineTo(-w * 0.06, yb - h * 0.8); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3; };
  const flat = (w, yb, c = "#3a3f4e", h = 12) => { ctx.fillStyle = c; rr(-w / 2, yb - h, w, h, 4); ctx.fill(); ctx.stroke(); };
  const win = (wx, wy, w = 16, h = 14) => { const g = 0.75 + 0.25 * Math.sin(t * 2 + ph + wx); ctx.fillStyle = sil ? "#000" : `rgba(255,${Math.round(225 * g + 20)},140,1)`; rr(wx - w / 2, wy - h / 2, w, h, 3); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(wx, wy - h / 2); ctx.lineTo(wx, wy + h / 2); ctx.moveTo(wx - w / 2, wy); ctx.lineTo(wx + w / 2, wy); ctx.stroke(); ctx.lineWidth = 3; };
  const door = (dx, w = 14, h = 24, c = "#6b3f1e") => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(dx - w / 2, 0); ctx.lineTo(dx - w / 2, -h + w / 2); ctx.arc(dx, -h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(dx + w / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); circle(dx + w * 0.22, -h * 0.42, 1.6, GOLD); };
  const sign = (txt, sy, bg = "#2a2a30", fg = GOLD, sz = 9) => { if (sil) return; ctx.font = `900 ${sz}px InterX`; const w = ctx.measureText(txt).width + 10; ctx.fillStyle = bg; rr(-w / 2, sy - sz * 0.8, w, sz * 1.6, 3); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 3; ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, sy + 0.5); };
  const emo = (e, ex, ey, sz = 18) => { if (sil) return; ctx.font = `${sz}px 'Noto Color Emoji'`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, ex, ey); };
  const smoke = (sx, sy) => { if (sil) return; for (let k = 0; k < 3; k++) { const d = ((t * 0.5 + k / 3 + ph) % 1); ctx.globalAlpha = 0.5 * (1 - d); circle(sx + Math.sin(t + k) * 4 * d, sy - d * 30, 4 + 6 * d, "#fff"); ctx.globalAlpha = 1; } };
  const chimney = (cx, cy) => { ctx.fillStyle = "#8a5a4a"; rr(cx - 5, cy - 16, 10, 18, 2); ctx.fill(); ctx.stroke(); smoke(cx, cy - 18); };
  switch (b.k) {
    case "doner": box(64, 42, b.c); for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? "#fff" : "#e5442f"; ctx.beginPath(); ctx.moveTo(-36 + k * 12, -52); ctx.lineTo(-24 + k * 12, -52); ctx.lineTo(-25 + k * 12, -40); ctx.lineTo(-35 + k * 12, -40); ctx.fill(); } ctx.strokeRect(-36, -52, 72, 12);
      ctx.fillStyle = "#cfeaf7"; rr(-26, -34, 26, 22, 3); ctx.fill(); ctx.stroke(); if (!sil) { ctx.fillStyle = "#a0522d"; ctx.beginPath(); ctx.moveTo(-19, -32); ctx.lineTo(-7, -32); ctx.lineTo(-10, -14); ctx.lineTo(-16, -14); ctx.fill(); ctx.fillStyle = "#777"; ctx.fillRect(-13.6, -34, 1.2, 22); } door(16); sign(b.sign, -62); break;
    case "markt": box(78, 44, b.c); flat(84, -44, "#1c4fa0", 14); sign("EDEKA", -51, "#ffe14a", "#1c4fa0", 9); ctx.fillStyle = "#cfeaf7"; rr(-32, -32, 38, 24, 3); ctx.fill(); ctx.stroke(); door(22, 16, 26, "#2a6fd0"); emo("🛒", -13, -20, 15); break;
    case "villa": box(82, 42, b.c); for (const cx of [-30, -11, 11, 30]) { ctx.fillStyle = "#fff"; rr(cx - 3.5, -40, 7, 38, 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; } tri(96, -42, 26, "#e9cf8a"); door(0, 12, 22, GOLD); if (!sil) { ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(14, -75 + Math.sin(t * 5) * 2); ctx.lineTo(0, -70); ctx.fill(); } ctx.beginPath(); ctx.moveTo(0, -68); ctx.lineTo(0, -82); ctx.stroke(); break;
    case "schmiede": box(64, 42, b.c); for (let k = 0; k < 5; k++) { ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(60,60,70,0.5)"; ctx.strokeRect(-30 + (k % 3) * 20, -36 + Math.floor(k / 3) * 16, 16, 10); ctx.strokeStyle = INK; ctx.lineWidth = 3; } tri(76, -42, 28, "#4a4f5c"); chimney(20, -56); door(-14, 16, 24, "#3a2a1a"); if (!sil) { glow(-14, -10, 22, "255,120,30", 0.5 + 0.3 * Math.sin(t * 9)); emo("⚔️", 14, -20, 16); } break;
    case "schule": box(72, 44, b.c); tri(84, -44, 22, "#b3402e"); ctx.fillStyle = "#fff6e6"; rr(-9, -84, 18, 26, 3); ctx.fill(); ctx.stroke(); circle(0, -72, 6, "#fff"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -72, 6, 0, Math.PI * 2); ctx.moveTo(0, -72); ctx.lineTo(0, -76); ctx.moveTo(0, -72); ctx.lineTo(3, -71); ctx.stroke(); ctx.lineWidth = 3; win(-22, -24); win(22, -24); door(0, 14, 24); sign("SCHULE", -40, "#fff", INK, 7); break;
    case "katze": box(64, 40, b.c); ctx.fillStyle = b.c; ctx.beginPath(); ctx.ellipse(0, -40, 32, 24, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); for (const d of [-1, 1]) { ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(d * 28, -52); ctx.lineTo(d * 24, -78); ctx.lineTo(d * 8, -60); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#ff8fb8"; ctx.beginPath(); ctx.moveTo(d * 23, -58); ctx.lineTo(d * 22, -70); ctx.lineTo(d * 14, -61); ctx.fill(); }
      if (!sil) { for (const d of [-1, 1]) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(d * 12, -46, 6, (t + ph) % 3.2 < 0.15 ? 1 : 6, 0, 0, Math.PI * 2); ctx.fill(); circle(d * 12, -46, 2.6, INK); } ctx.fillStyle = "#ff6b8b"; ctx.beginPath(); ctx.moveTo(-3, -38); ctx.lineTo(3, -38); ctx.lineTo(0, -34); ctx.fill(); ctx.lineWidth = 1.2; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 6, -35); ctx.lineTo(d * 22, -37); ctx.moveTo(d * 6, -33); ctx.lineTo(d * 22, -31); ctx.stroke(); } ctx.lineWidth = 3; } door(0, 14, 22); break;
    case "gaming": box(72, 46, b.c); flat(78, -46, "#1b1b2a", 12); if (!sil) { const on = Math.sin(t * 6 + ph) > -0.3; glow(0, -30, 34, "120,255,240", on ? 0.5 : 0.15); ctx.fillStyle = on ? "#5ffff0" : "#2a8a84"; rr(-20, -38, 40, 16, 8); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; circle(10, -30, 2.5, "#ff4b6e"); circle(15, -33, 2.5, "#ffd23a"); ctx.fillStyle = INK; ctx.fillRect(-14, -31.2, 8, 2.4); ctx.fillRect(-11.2, -34, 2.4, 8); } ctx.beginPath(); ctx.moveTo(26, -58); ctx.lineTo(26, -74); ctx.stroke(); circle(26, -76, 3, Math.sin(t * 8) > 0 ? "#ff3b3b" : "#7a1a1a"); door(0, 14, 16, "#2a2140"); break;
    case "wurm": ctx.fillStyle = b.c; ctx.beginPath(); ctx.ellipse(0, 0, 38, 50, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.ellipse(-14, -30, 8, 12, -0.5, 0, Math.PI * 2); ctx.fill(); circle(0, -16, 12, "#5b2a3a"); ctx.beginPath(); ctx.arc(0, -16, 12, 0, Math.PI * 2); ctx.stroke(); win(-22, -26, 10, 10); if (!sil) { const wy = -54 - Math.abs(Math.sin(t * 3 + ph)) * 6; for (let k = 0; k < 3; k++) { circle(14 + k * 5, wy + k * 6, 6, INK); circle(14 + k * 5, wy + k * 6, 4.6, "#ff7a9c"); } circle(12.5, wy - 1, 1.2, INK); circle(16, wy - 1, 1.2, INK); } break;
    case "apple": ctx.fillStyle = "rgba(190,235,255,0.9)"; rr(-34, -50, 68, 50, 6); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, 0); ctx.moveTo(-34, -25); ctx.lineTo(34, -25); ctx.stroke(); ctx.lineWidth = 3; ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.moveTo(-28, -44); ctx.lineTo(-10, -44); ctx.lineTo(-28, -18); ctx.fill(); emo("🍎", 0, -27, 22); break;
    case "haus": box(60, 40, b.c); tri(74, -40, 30, "#e5503a"); chimney(18, -54); win(-14, -22); door(14); break;
    case "pizza": ctx.fillStyle = b.c; ctx.beginPath(); ctx.ellipse(0, 0, 38, 48, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-30 + k * 12, -6 - (k % 2) * 14); ctx.lineTo(-22 + k * 12, -6 - (k % 2) * 14); ctx.stroke(); } ctx.lineWidth = 3; ctx.fillStyle = "#2a1a1a"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 22, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); if (!sil) { glow(0, -8, 22, "255,150,40", 0.6 + 0.3 * Math.sin(t * 10)); emo("🍕", 0, -62 - Math.sin(t * 3) * 2, 18); } chimney(22, -38); break;
    case "iphone": ctx.fillStyle = b.c; rr(-20, -92, 40, 92, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = sil ? "#000" : "#59d4ff"; rr(-15, -84, 30, 70, 5); ctx.fill(); if (!sil) { ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.moveTo(-15, -84); ctx.lineTo(3, -84); ctx.lineTo(-15, -52); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("18", 0, -48); } circle(0, -7, 3, "#555"); break;
    case "palast": box(56, 46, b.c); for (const d of [-1, 1]) { box(18, 64, "#ffe29a", d * 34, 4); ctx.fillStyle = "#e5503a"; ctx.beginPath(); ctx.moveTo(d * 34 - 12, -64); ctx.lineTo(d * 34, -84); ctx.lineTo(d * 34 + 12, -64); ctx.closePath(); ctx.fill(); ctx.stroke(); } door(0, 16, 26, "#8a2be2"); win(0, -36, 14, 10); emo("👑", 0, -60 + Math.sin(t * 3) * 1.5, 20); break;
    case "polizei": box(72, 44, b.c); flat(78, -44, "#1c2f6b", 12); sign("POLIZEI", -50, "#fff", "#1c2f6b", 7); win(-22, -24); win(22, -24); door(0, 14, 24, "#1c2f6b"); { const on = Math.sin(t * 9) > 0; if (!sil) glow(0, -66, 26, on ? "255,60,60" : "80,140,255", 0.7); ctx.fillStyle = on ? "#ff3b3b" : "#5a8bff"; rr(-6, -72, 12, 12, 4); ctx.fill(); ctx.stroke(); } break;
    case "security": ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-9, -50); ctx.moveTo(16, 0); ctx.lineTo(9, -50); ctx.moveTo(-13, -22); ctx.lineTo(13, -30); ctx.stroke(); box(44, 30, b.c, 0, 4); ctx.save(); ctx.translate(0, -50); box(46, 30, b.c, 0, 4); ctx.fillStyle = sil ? "#000" : "#ffe9a0"; rr(-17, -22, 34, 12, 3); ctx.fill(); ctx.stroke(); tri(56, -30, 16, "#2b2f3c"); ctx.restore(); ctx.fillStyle = "#f3a2c6"; emo("🛡️", 0, -14, 14); break;
    case "youtube": box(72, 46, b.c, 0, 10); if (!sil) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(-9, -36); ctx.lineTo(13, -24); ctx.lineTo(-9, -12); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; } ctx.beginPath(); ctx.moveTo(-20, -46); ctx.lineTo(-28, -64); ctx.moveTo(20, -46); ctx.lineTo(28, -64); ctx.stroke(); if (!sil) { circle(28, -66, 4, Math.sin(t * 6) > 0 ? "#ff3b3b" : "#fff"); emo("🎥", -30, -70, 14); } break;
    case "goyo": box(60, 40, b.c); tri(74, -40, 30, "#7a3bd6"); win(-14, -22); door(14, 14, 24, "#3a1a6b"); if (!sil) { glow(0, -78, 22, "255,240,150", 0.5 + 0.4 * Math.sin(t * 5)); emo("✨", 0, -78, 18); } break;
    case "monster": ctx.fillStyle = b.c; ctx.beginPath(); for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI, r = k % 2 ? 44 : 40; const px = Math.cos(a) * r, py = Math.sin(a) * r * 1.15; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#1a1030"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 28, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); if (!sil) for (const d of [-1, 1]) { const bl = (t + ph) % 2.8 < 0.12; glow(d * 8, -14, 12, "255,230,80", 0.6); ctx.fillStyle = "#ffe14a"; ctx.beginPath(); ctx.ellipse(d * 8, -14, 5, bl ? 0.8 : 5, 0, 0, Math.PI * 2); ctx.fill(); circle(d * 8, -14, bl ? 0 : 2, INK); } for (const d of [-1, 1]) { ctx.fillStyle = "#cfeaff"; ctx.beginPath(); ctx.moveTo(d * 20, -42); ctx.lineTo(d * 30, -60); ctx.lineTo(d * 30, -38); ctx.closePath(); ctx.fill(); ctx.stroke(); } break;
    case "huhn": box(56, 34, b.c); tri(70, -34, 26, "#d9463a"); ctx.fillStyle = "#3a2a1a"; ctx.beginPath(); ctx.arc(0, -10, 9, Math.PI, 0); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); emo("🐔", 20, -8 - Math.abs(Math.sin(t * 6 + ph)) * 3, 15); break;
    case "stein": ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(-38, 0); ctx.lineTo(-34, -30); ctx.lineTo(-14, -52); ctx.lineTo(16, -50); ctx.lineTo(36, -26); ctx.lineTo(38, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.moveTo(-28, -28); ctx.lineTo(-12, -46); ctx.lineTo(-6, -34); ctx.fill(); door(0, 14, 22, "#4a3a34"); if (!sil) for (const d of [-1, 1]) { circle(d * 16, -30, 4.5, "#fff"); circle(d * 16 + 1, -29.5, 2, INK); } break;
    case "hund": box(50, 32, b.c); tri(64, -32, 28, "#e75fa8"); ctx.fillStyle = "#5a2a4a"; ctx.beginPath(); ctx.arc(0, -12, 11, Math.PI, 0); ctx.lineTo(11, 0); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); emo("🦴", 0, -44, 12); emo("🐶", 0, -9 - Math.abs(Math.sin(t * 5 + ph)) * 2, 13); break;
    case "riesen": // Riesenhaus mit Raketen-Anlegeplatz
      box(74, 112, b.c, 0, 6); tri(90, -112, 34, "#2a4fd0"); ctx.fillStyle = sil ? "#000" : "#bfe6ff"; ctx.beginPath(); ctx.arc(0, -84, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-13, -84); ctx.lineTo(13, -84); ctx.moveTo(0, -97); ctx.lineTo(0, -71); ctx.stroke(); ctx.lineWidth = 3;
      ctx.fillStyle = "#1c2f6b"; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-20, -44); ctx.arc(0, -44, 20, Math.PI, 0); ctx.lineTo(20, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); circle(12, -26, 2.5, GOLD);
      for (const wx of [-24, 24]) win(wx, -84 + 0, 0.01, 0.01);
      ctx.beginPath(); ctx.moveTo(37, -70); ctx.lineTo(52, -70); ctx.stroke(); ctx.restore(); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rocket(62, 0, 0.42, 0);
      if (!sil) { ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.moveTo(0, -162); ctx.lineTo(18, -156 + Math.sin(t * 5) * 2); ctx.lineTo(0, -150); ctx.fill(); } ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -146); ctx.lineTo(0, -164); ctx.stroke(); break;
  }
  ctx.restore();
}
function silhouette(fn, col = "#161020") { // zeichnet fn als einfarbige Silhouette
  const m = ctx.getTransform(); const keep = ctx; ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(m); fn();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-in"; ctx.fillStyle = col; ctx.fillRect(0, 0, 1080, 1920); ctx.globalCompositeOperation = "source-over"; ctx = keep;
  MAIN.save(); MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.drawImage(lc, 0, 0); MAIN.restore();
}
function giantScene(x, y, s, t, sil = false) { // Riesenhaus (mit Rakete) + ein normales Haus zum Größenvergleich; bei der Auflösung winkt der Riesen-Astronaut
  bld(MYST, x - 20 * s, y, 1.55 * s, sil); bld(11, x - 150 * s, y, 0.5 * s, sil);
  if (!sil) astronaut(x + 152 * s, y, 1.42 * s, "happy", { t, acc: "#1f4fd6", suit: "#4a7bff", suit2: "#5f8cff", suit3: "#3a62d0", armR: -2.5 + Math.sin(t * 4) * 0.25 });
}

// ------------------------------------------------------------ Stadtkarte von oben (fremder Planet), einmal vorgezeichnet
let MAPC = null; const MAPH = 1500;
function buildMap() {
  MAPC = document.createElement("canvas"); MAPC.width = 1080; MAPC.height = Math.round(MAPH * S); const g = MAPC.getContext("2d"); const keep = ctx; ctx = g; ctx.setTransform(S, 0, 0, S, 0, 0);
  const r = rng(101);
  ctx.fillStyle = "#f3a2c6"; ctx.fillRect(0, 0, W, MAPH);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = i % 2 ? "rgba(255,205,225,0.5)" : "rgba(214,110,160,0.28)"; ctx.beginPath(); ctx.ellipse(r() * W, r() * MAPH, 30 + r() * 70, 14 + r() * 30, r() * 3, 0, Math.PI * 2); ctx.fill(); }
  // Straßen
  ctx.fillStyle = "#fbd6e6"; for (let y = 60; y < MAPH; y += 150) ctx.fillRect(0, y, W, 16); for (let x = 30; x < W; x += 132) ctx.fillRect(x, 0, 14, MAPH);
  ctx.strokeStyle = "rgba(180,90,150,0.5)"; ctx.setLineDash([8, 8]); ctx.lineWidth = 1.5; for (let y = 68; y < MAPH; y += 150) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.setLineDash([]);
  // Häuser in den Blöcken
  const cols = ["#ff6b6b", "#ffb43a", "#ffe14a", "#7bf27a", "#3fd3f2", "#b06bff", "#ff79c6", "#f4f6f8", "#8a6bff"];
  for (let by = 0; by < 11; by++) for (let bx = 0; bx < 5; bx++) { const x0 = 50 + bx * 132, y0 = 84 + by * 150 - 150;
    for (let k = 0; k < 9; k++) { if (r() < 0.22) continue; const hx = x0 + (k % 3) * 34 + r() * 4, hy = y0 + Math.floor(k / 3) * 40 + r() * 4, w = 22 + r() * 6;
      if (r() < 0.12) { ctx.fillStyle = "rgba(190,90,140,0.5)"; ctx.beginPath(); ctx.arc(hx + 12, hy + 14, 12, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(255,225,240,0.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx + 12, hy + 14, 12, 3.4, 5.6); ctx.stroke(); continue; }   // Krater
      if (r() < 0.1) { ctx.fillStyle = "#5fe0d4"; ctx.beginPath(); ctx.moveTo(hx + 4, hy + 26); ctx.lineTo(hx + 12, hy + 2); ctx.lineTo(hx + 20, hy + 26); ctx.fill(); continue; }                                   // Kristall
      ctx.fillStyle = INK; rr(hx - 1.5, hy - 1.5, w + 3, w + 3, 5); ctx.fill(); ctx.fillStyle = cols[Math.floor(r() * cols.length)]; rr(hx, hy, w, w, 4); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(hx + 3, hy + 3, w - 6, 4); } }
  // türkiser Leuchtfluss
  for (const [lw, c] of [[34, "rgba(63,211,200,0.35)"], [20, "#3fd3c8"], [6, "#b8fff6"]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.beginPath(); for (let x = -20; x <= W + 20; x += 20) { const y = 560 + Math.sin(x * 0.012) * 46 + Math.sin(x * 0.03) * 12; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.fillStyle = "rgba(250,205,228,0.5)"; ctx.fillRect(0, 0, W, MAPH);   // Karte dämpfen, damit Karten und Text klar davor stehen
  // Landeplatz mit Rakete (von oben) + Kuppel
  circle(300, 980, 46, INK); circle(300, 980, 43, "#cfd6dc"); circle(300, 980, 30, "#e9edf0"); circle(300, 980, 12, "#e5262b");
  circle(150, 300, 40, INK); circle(150, 300, 37, "rgba(200,235,250,0.9)"); circle(138, 288, 10, "#fff");
  ctx = keep;
}
function cityMap(t, bright = 1) {
  if (!MAPC) buildMap();
  const off = (t * 9) % 300;
  MAIN.save(); MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.drawImage(MAPC, 0, -off * S - 60 * S); MAIN.restore();
  for (let i = 0; i < 14; i++) { const r = rng(i + 5); const x = r() * W, y = (r() * 1200 - off * 1.0) % 1100; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i); circle(x, y, 2.5, "#b8fff6"); ctx.globalAlpha = 1; }   // Glitzern
  if (bright < 1) { ctx.fillStyle = `rgba(30,10,40,${0.7 * (1 - bright)})`; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------ Karten
function header(t) { // Stadt-Infokarte oben
  ctx.save(); ctx.translate(SX, 150);
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-215, -42, 430, 84, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = "900 22px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🪐 ROTANIEN 2.0", 0, -22);
  const chips = [["TAG 10", "#e5262b", "#fff"], [FOLLOWERS + " Bewohner", "#fff", INK], [Math.round(lerp(TALER, TALER + 38, ramp(t, T.like, DUR))).toLocaleString("de-DE") + " Taler", GOLD, INK]];
  ctx.font = "900 12.5px InterX"; let wsum = chips.reduce((a, c) => a + ctx.measureText(c[0]).width + 22 + 8, -8), x = -wsum / 2;
  for (const [txt, bg, fg] of chips) { const w = ctx.measureText(txt).width + 22; ctx.fillStyle = bg; rr(x, -8, w, 22, 11); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.fillText(txt, x + w / 2, 3.5); x += w + 8; }
  ctx.fillStyle = "#7a6a80"; ctx.font = "700 9.5px InterX"; ctx.fillText("Bewohner = Follower  ·  Taler = Likes  ·  1 Follow = 1 Bewohner", 0, 28);
  ctx.restore();
}
function tagLabel(txt, x, y, s, bg = PINK, fg = "#fff", rot = -0.04, size = 22) {
  if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.font = `900 ${size}px InterX, 'Noto Color Emoji'`; const w = ctx.measureText(txt).width + 26;
  ctx.fillStyle = bg; rr(-w / 2, -size * 0.8, w, size * 1.6, 9); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 1); ctx.restore();
}
function title(l1, l2, y, s, c2 = GOLD) { if (s <= 0.01) return; ctx.save(); ctx.translate(SX, y); ctx.scale(s, s); ctx.font = "900 30px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  for (const [txt, yy, col, sz] of [[l1, 0, "#fff", 28], [l2, 36, c2, 34]]) { if (!txt) continue; ctx.font = `900 ${sz}px InterX`; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeText(txt, 0, yy); ctx.fillStyle = col; ctx.fillText(txt, 0, yy); } ctx.restore(); }
function houseCard(i, x, y, s, w = 140, h = 180) { // große Karte: Haus + @name
  if (s <= 0.01) return; const b = HAUS[i]; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = "#fff"; rr(-w / 2, -h / 2, w, h, 12); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 10); ctx.clip(); ctx.fillStyle = "#1a1030"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.62); for (let k = 0; k < 8; k++) circle(-w / 2 + ((k * 37 + i * 13) % w), -h / 2 + ((k * 23) % (h * 0.5)), 1.2, "#fff");
  ctx.fillStyle = "#f3a2c6"; ctx.fillRect(-w / 2, h * 0.12, w, h); ctx.fillStyle = "rgba(190,90,140,0.4)"; ctx.beginPath(); ctx.ellipse(-w * 0.25, h * 0.3, 14, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  bld(i, 0, h * 0.2, w / 120);
  ctx.fillStyle = "#fff"; rr(-w / 2 + 6, h / 2 - 36, w - 12, 30, 8); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = PINK; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("@" + b.u, 0, h / 2 - 27); ctx.fillStyle = INK; ctx.font = "900 11.5px InterX"; ctx.fillText(b.w, 0, h / 2 - 14);
  ctx.restore();
}
function miniCard(i, x, y, w = 132, h = 96) { // kleine Karte in der Hausliste
  const b = HAUS[i]; ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#fff"; rr(0, 0, w, h, 9); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = PINK; ctx.font = "900 9.5px InterX"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("@" + b.u, 7, 11); ctx.fillStyle = INK; ctx.font = "800 9.5px InterX"; ctx.fillText(i === MYST && TNOW < T.reveal ? "???" : b.w, 7, 24);
  ctx.fillStyle = "rgba(243,162,198,0.6)"; rr(4, h - 22, w - 8, 18, 6); ctx.fill();
  if (i === MYST && TNOW < T.reveal) { ctx.fillStyle = INK; ctx.font = "32px Comic"; ctx.textAlign = "center"; ctx.fillText("?", w / 2, h - 34); } else bld(i, w / 2 + 26, h - 8, i === MYST ? 0.3 : 0.5);
  ctx.restore();
}
function iconGrid(t, s, n, y = 470) { // Sammelkarte mit allen Wunschhäusern
  if (s <= 0.01) return; ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-212, -150, 424, 300, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < Math.min(Math.floor(n), N); i++) { const cx = -175 + (i % 6) * 70, cy = -78 + Math.floor(i / 6) * 72, pk = back(clamp((n - i) / 1.2)); if (i === MYST && TNOW < T.reveal) { ctx.fillStyle = INK; ctx.font = "34px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", cx, cy - 22); } else bld(i, cx, cy, (i === MYST ? 0.34 : 0.52) * pk); }
  ctx.restore();
}
function featureCard(k, t, s) { // große Kommentarkarte oben („die verrücktesten“)
  if (s <= 0.01) return; const i = FEAT[k], b = HAUS[i]; ctx.save(); ctx.translate(SX, 300); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-212, -84, 424, 168, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-204, -76, 150, 152, 10); ctx.clip(); ctx.fillStyle = "#1a1030"; ctx.fillRect(-204, -76, 150, 100); for (let j = 0; j < 8; j++) circle(-200 + (j * 41) % 140, -70 + (j * 29) % 80, 1.2, "#fff"); ctx.fillStyle = "#f3a2c6"; ctx.fillRect(-204, 24, 150, 60); ctx.restore();
  bld(i, -129, 52, 1.25);
  const av = AV[b.av]; circle(-28, -52, 15, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(-28, -52, 14, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, -42, -66, 28, 28); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = PINK; ctx.font = "900 13px InterX"; ctx.fillText("@" + b.u, -8, -52);
  ctx.fillStyle = INK; ctx.font = "800 15px InterX, 'Noto Color Emoji'"; const words = (b.txt || b.w).split(" "), lines = [""]; for (const w of words) { const tl = lines.at(-1) ? lines.at(-1) + " " + w : w; if (ctx.measureText(tl).width > 235 && lines.at(-1)) lines.push(w); else lines[lines.length - 1] = tl; }
  lines.slice(0, 4).forEach((l, j) => ctx.fillText(l, -42, -22 + j * 19));
  ctx.fillStyle = "#c0c4cc"; ctx.font = "16px InterX"; ctx.fillText("♥", 186, -52);
  ctx.restore();
  tagLabel(FTAG[k], SX + 80, 210, s, PINK, "#fff", 0.05, 20);
}
function mysteryCard(t, s, lit = false) {
  if (s <= 0.01) return; ctx.save(); ctx.translate(SX, 400); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff0c9"; rr(-205, -150, 410, 300, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-201, -146, 402, 292, 13); ctx.clip(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * 0.3; ctx.fillStyle = "rgba(255,214,120,0.55)"; ctx.beginPath(); ctx.moveTo(0, 20); ctx.arc(0, 20, 420, a, a + 0.22); ctx.fill(); } ctx.restore();
  ctx.restore();
  ctx.save(); ctx.translate(SX, 400); ctx.scale(s, s); silhouette(() => giantScene(0, 128, 0.95, 0, true)); ctx.restore();
  ctx.save(); ctx.translate(SX, 400); ctx.scale(s, s); for (const [qx, qy, ph] of [[-160, -90, 0], [165, -100, 1], [-165, 80, 2], [160, 70, 3]]) { ctx.save(); ctx.translate(qx, qy + Math.sin(t * 3 + ph) * 5); circle(0, 0, 15, PINK); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 18px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", 0, 1); ctx.restore(); } ctx.restore();
  tagLabel("TOP SECRET", SX, 400 - 150 * s, s, INK, "#fff", -0.03, 18);
}
function emptyComment(t, s, y, q) { if (s <= 0.01) return; ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-205, -42, 410, 84, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  circle(-172, -4, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -3);
  ctx.textAlign = "left"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX"; ctx.fillText("@dein.name", -142, -20); ctx.fillStyle = INK; ctx.font = "800 19px InterX, 'Noto Color Emoji'"; ctx.fillText(q, -142, 6);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -4 + Math.sin(t * 6) * 2); ctx.restore(); }

// ------------------------------------------------------------ Hausliste unten (blättert seitenweise)
const PAGE = 1.15;
function houseList(t, s) {
  if (s <= 0.01) return; const t0 = T.list, pg = Math.max(0, (t - t0) / PAGE), p = Math.floor(pg), k = easeIO(clamp((pg - p - 0.78) / 0.22));
  ctx.save(); ctx.translate(SX, 560); ctx.scale(s, s);
  tagLabel("SUCHEN & SPEICHERN  ·  " + Math.min(N, ((p % 4) + 1) * 6) + "/" + N, 0, -118, 1, PINK, "#fff", 0, 11);
  ctx.save(); ctx.beginPath(); ctx.rect(-214, -104, 428, 216); ctx.clip();
  for (const [page, off] of [[p, -k * 440], [p + 1, 440 - k * 440]]) for (let j = 0; j < 6; j++) { const i = ((page % 4) * 6 + j) % N; miniCard(i, -208 + (j % 3) * 140 + off, -100 + Math.floor(j / 3) * 106); }
  ctx.restore(); ctx.restore();
}
function bookmark(t, s) { if (s <= 0.01) return; ctx.save(); ctx.translate(440, 700); ctx.scale(s * (1 + 0.08 * Math.sin(t * 6)), s * (1 + 0.08 * Math.sin(t * 6))); glow(0, 0, 50, "255,210,60", 0.6); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(10, -14); ctx.lineTo(10, 14); ctx.lineTo(0, 6); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fill(); ctx.restore(); }

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0); TNOW = t;
  const dark = (t >= T.crazy && t < T.list) || (t >= T.reso && t < T.reveal);
  const dk = t >= T.crazy && t < T.list ? ramp(t, T.crazy + 0.5, T.crazy + 0.9) * (1 - ramp(t, T.list - 0.15, T.list)) : t >= T.reso && t < T.reveal ? ramp(t, T.reso, T.reso + 0.3) : 0;
  cityMap(t, 1 - dk);
  header(t);

  // 1) Hook: „Ihr wolltet einen Dönerladen? Gleich dreimal!“
  if (t < T.hook) { // Einstieg: „Heute bauen wir unsere Stadt auf!“
    const a = 1 - ramp(t, T.hook - 0.12, T.hook);
    if (t < T.expl) title("HEUTE BAUEN WIR", "UNSERE STADT AUF! 🏗️", 232, a, GOLD);
    else { title("JEDER FOLLOWER", "= 1 BEWOHNER 🧑‍🚀", 232, a * pop(t, T.expl, 1e9), GOLD); tagLabel("💬 IHR WÜNSCHT – ICH BAUE! 🏠", SX, 560, a * pop(t, T.wish2, 1e9), PINK, "#fff", -0.03, 17); }
    for (const [k, i, hx] of [[0, 4, -150], [1, 6, -50], [2, 7, 50], [3, 8, 150]]) { const up = t < 0.02 ? 1 : back(ramp(t, 0.02 + k * 0.12, 0.3 + k * 0.12)); if (k && up <= 0) continue; ctx.save(); ctx.translate(SX + hx, 470); ctx.scale(a, a); OL(() => { ctx.save(); ctx.scale(1, k ? up : 1); bld(i, 0, 0, 0.98); ctx.restore(); }, 4); ctx.restore(); if (k) puffs(SX + hx, 470, t, 0.02 + k * 0.12, 4); }
  }
  if (t >= T.hook && t < T.count) {
    title("IHR WOLLTET EINEN", "DÖNERLADEN?", 232, pop(t, T.hook, T.count));
    houseCard(0, t < T.triple ? SX : lerp(SX, SX - 145, easeOut(ramp(t, T.triple, T.triple + 0.25))), 400, back(ramp(t, T.hook, T.hook + 0.22)), 138, 180);
    if (t >= T.triple) { houseCard(1, SX, 400, back(ramp(t, T.triple + 0.05, T.triple + 0.3)), 138, 180); houseCard(2, SX + 145, 400, back(ramp(t, T.triple + 0.15, T.triple + 0.4)), 138, 180); tagLabel("GLEICH DREIMAL!", SX, 520, pop(t, T.triple + 0.2, T.count - 0.05), PINK, "#fff", -0.04, 22); }
  }
  // 2) „24 Wünsche. Und wir haben alle gebaut.“
  if (t >= T.count && t < T.range) {
    const nf = lerp(1, N + 0.99, easeOut(ramp(t, T.count, T.built - 0.1))), n = Math.min(N, Math.floor(nf));
    title(n + " NEUE", "WUNSCHHÄUSER", 232, pop(t, T.count, T.range - 0.05), "#fff");
    iconGrid(t, pop(t, T.count + 0.05, T.range - 0.05), nf, 450);
    tagLabel("ALLE GEBAUT!", SX + 90, 615, pop(t, T.built, T.range - 0.05), TEAL, "#fff", -0.05, 22); if (t >= T.built) confetti(t, T.built);
  }
  // 3) „Von der Villa bis zum Edeka ist alles dabei.“
  if (t >= T.range && t < T.crazy + 0.5) {
    const out = 1 - ramp(t, T.crazy + 0.3, T.crazy + 0.5);
    title("VON DER VILLA", "BIS ZUM EDEKA", 232, pop(t, T.range, T.crazy + 0.45));
    houseCard(4, SX - 108, 410, back(ramp(t, T.range + 0.1, T.range + 0.35)) * out, 190, 220); houseCard(3, SX + 108, 410, back(ramp(t, T.edeka - 0.1, T.edeka + 0.15)) * out, 190, 220);
    tagLabel("EINER IST VERRÜCKT!", SX, 555, pop(t, T.crazy, T.crazy + 0.45), GOLD, INK, -0.04, 22);
  }
  // 4) Rätsel: „Halt das Video an und rate“
  if (t >= T.crazy + 0.45 && t < T.list) {
    mysteryCard(t, pop(t, T.crazy + 0.5, T.list - 0.08));
    tagLabel("⏸ HALT AN & RATE!", SX, 585, pop(t, T.halt, T.list - 0.08) * (1 + 0.04 * Math.sin(t * 8)), PINK, "#fff", 0, 24);
    tagLabel("💬 DEIN TIPP IN DIE KOMMENTARE", SX, 632, pop(t, T.tipp, T.list - 0.08), GOLD, INK, 0, 15);
    tagLabel("AUFLÖSUNG AM ENDE!", SX + 80, 262, pop(t, T.end, T.list - 0.08), TEAL, "#fff", 0.06, 16);
  }
  // 5) Hausliste + 6) die verrücktesten
  if (t >= T.list && t < T.reso) {
    houseList(t, pop(t, T.list, T.reso - 0.08));
    if (t < T.oben) { const lab = t < T.such ? "ALLE HÄUSER HIER UNTEN" : t < T.wieder ? "SUCH DEINS & SPEICHERN!" : "JEDERZEIT WIEDERFINDEN"; const t0 = t < T.such ? T.list : t < T.wieder ? T.such : T.wieder; tagLabel(lab, SX, 330, pop(t, t0, t < T.such ? T.such - 0.05 : t < T.wieder ? T.wieder - 0.05 : T.oben - 0.05), t < T.such ? GOLD : t < T.wieder ? "#fff" : GOLD, INK, -0.03, 21);
      for (let i = 0; i < 2; i++) { const yy = 380 + i * 14 + Math.sin(t * 6) * 4; ctx.strokeStyle = PINK; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(SX - 14, yy); ctx.lineTo(SX, yy + 10); ctx.lineTo(SX + 14, yy); ctx.stroke(); }
      bookmark(t, pop(t, T.such, T.oben - 0.05)); }
    if (t >= T.oben && t < T.f[0]) { const a = pop(t, T.oben, T.f[0] - 0.05); ctx.save(); ctx.translate(SX, 300); ctx.scale(a, a); ctx.fillStyle = INK; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 20px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("UND OBEN:", 0, -16); ctx.fillStyle = GOLD; ctx.font = "900 26px InterX"; ctx.fillText("DIE VERRÜCKTESTEN!", 0, 14); ctx.restore(); }
    for (let k = 0; k < 7; k++) { const a = T.f[k], b = k < 6 ? T.f[k + 1] : T.reso; if (t >= a - 0.05 && t < b) { const slide = easeOut(ramp(t, a - 0.05, a + 0.2)); ctx.save(); ctx.translate((1 - slide) * 500, 0); ctx.rotate((1 - slide) * 0.1); featureCard(k, t, 1); ctx.restore(); } }
    if (t >= T.law) { stamp("📜 GESETZ NR. 2 ✓", SX + 40, 400, pop(t, T.law + 0.2, T.reso - 0.08), -0.08, "#2fa84f"); confetti(t, T.law + 0.2); }
  }
  // 7) Auflösung
  if (t >= T.reso && t < T.reveal) {
    for (const d of [-1, 1]) { ctx.save(); ctx.translate(SX + d * 200, 760); ctx.rotate(d * (-0.45 + Math.sin(t * 2) * 0.08)); const g = ctx.createLinearGradient(0, 0, 0, -600); g.addColorStop(0, "rgba(255,245,200,0.35)"); g.addColorStop(1, "rgba(255,245,200,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-110, -600); ctx.lineTo(110, -600); ctx.lineTo(14, 0); ctx.fill(); ctx.restore(); }
    title("DIE AUFLÖSUNG", null, 250, pop(t, T.reso, T.reveal - 0.05), "#fff");
    ctx.save(); ctx.translate(SX, 0); silhouette(() => giantScene(0, 590, 1.0 + 0.03 * Math.sin(t * 5), 0, true), "#fff0c9"); ctx.restore();
    tagLabel("DER VERRÜCKTESTE?", SX, 620, pop(t, T.wunsch, T.reveal - 0.05), GOLD, INK, 0, 22);
  }
  if (t >= T.reveal && t < T.stadt) {
    const a = back(ramp(t, T.reveal, T.reveal + 0.3)) * (1 - ramp(t, T.stadt - 0.15, T.stadt));
    ctx.save(); ctx.translate(SX, 430); ctx.scale(a, a); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-205, -170, 410, 340, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.roundRect(-199, -164, 398, 270, 12); ctx.clip(); ctx.fillStyle = "#1a1030"; ctx.fillRect(-199, -164, 398, 200); for (let j = 0; j < 20; j++) circle(-190 + (j * 53) % 380, -160 + (j * 37) % 180, 1.4, "#fff"); circle(140, -110, 26, "#3fd3c8"); ctx.strokeStyle = "rgba(255,230,160,0.9)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(140, -110, 46, 11, -0.35, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#f3a2c6"; ctx.fillRect(-199, 36, 398, 80); ctx.restore();
    ctx.restore();
    if (a > 0.5) { ctx.save(); ctx.translate(SX, 430); ctx.scale(a, a); OL(() => giantScene(-38, 100, 1.0, t, false), 5); ctx.restore(); }
    ctx.save(); ctx.translate(SX, 430); ctx.scale(a, a); const av = AV.keanu; circle(-170, 136, 16, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(-170, 136, 15, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, -185, 121, 30, 30); ctx.restore(); }
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX"; ctx.fillText("@keanu", -148, 128); ctx.fillStyle = INK; ctx.font = "800 10px InterX"; ctx.fillText("„ich frage seit Tag 2: darf ich ein riesen Astronaut werden in Blau“", -148, 145); ctx.restore();
    tagLabel("RIESENHAUS!", SX, 262, pop(t, T.reveal + 0.1, T.stadt - 0.1), PINK, "#fff", -0.05, 26);
    tagLabel("FÜR DEN RIESEN-ASTRONAUTEN", SX + 20, 315, pop(t, T.reveal + 0.7, T.stadt - 0.1), GOLD, INK, 0.04, 15);
    tagLabel("🚀 MIT EIGENER RAKETE!", SX - 62, 452, pop(t, T.higher, T.stadt - 0.1), PINK, "#fff", 0.05, 15);
    
    tagLabel("HATTEST DU RECHT?", SX, 640, pop(t, T.recht, T.stadt - 0.1), TEAL, "#fff", 0, 22);
    confetti(t, T.reveal + 0.05); if (t >= T.recht) confetti(t, T.recht);
  }
  // 8) „Das ist unsere Stadt. Hier ist alles möglich.“ + Wachstums-Frage
  if (t >= T.stadt && t < T.denk) {
    iconGrid(t, pop(t, T.stadt, T.grow - 0.08), N, 440);
    tagLabel("HIER IST ALLES MÖGLICH!", SX, 440, pop(t, T.moeglich, T.grow - 0.08), PINK, "#fff", -0.04, 24);
    if (t >= T.grow) { title("WIE SOLL DIE STADT", "WEITERWACHSEN?", 250, pop(t, T.grow, T.denk - 0.08)); emptyComment(t, pop(t, T.grow + 0.2, T.denk - 0.08), 380, "Dein Wunsch für die Stadt? 🏗️");
      tagLabel("💬 SCHREIB'S IN DIE KOMMENTARE", SX, 470, pop(t, T.comm, T.denk - 0.08), GOLD, INK, -0.03, 17);
      for (const [k, i] of [[0, 3], [1, 6], [2, 8]]) { const a2 = pop(t, T.grow + 0.4 + k * 0.15, T.denk - 0.08); if (a2 > 0) { ctx.save(); ctx.translate(SX - 140 + k * 140, 620); ctx.scale(a2, a2); OL(() => bld(i, 0, 0, 1.0), 4); ctx.restore(); } } }
  }
  // 9) „Jedes Like bringt Taler in die Stadtkasse. Folg mir …“
  if (t >= T.denk) {
    tagLabel("JEDES LIKE = TALER!", SX, 270, pop(t, T.like - 0.2, T.folg - 0.05), PINK, "#fff", -0.04, 26);
    // Stadtkasse
    const ka = pop(t, T.denk, 99); ctx.save(); ctx.translate(SX, 430); ctx.scale(ka, ka); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-120, -44, 240, 88, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = INK; ctx.font = "900 13px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🏦 STADTKASSE", 0, -22); ctx.fillStyle = "#c98a00"; ctx.font = "900 30px InterX"; ctx.fillText(Math.round(lerp(TALER, TALER + 38, ramp(t, T.like, DUR))).toLocaleString("de-DE") + " Taler", 0, 12); ctx.restore();
    if (t >= T.like - 0.2) for (let i = 0; i < 9; i++) { const d = ((t - T.like + 0.2) * 0.9 + i / 9) % 1, r = rng(i + 31), sx = 30 + r() * 430, sy = 620 + r() * 120; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * d); ctx.font = "22px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText(d < 0.75 ? "❤️" : "🪙", lerp(sx, SX + (i % 3 - 1) * 90, easeIO(d)), lerp(sy, 372, easeIO(d)) - Math.sin(Math.PI * d) * 40); ctx.restore(); }
    if (t >= T.folg) { tagLabel("DEIN WUNSCH IST DER NÄCHSTE!", SX, 270, pop(t, T.folg, 99), TEAL, "#fff", -0.03, 20);
      const a = pop(t, T.folg + 0.1, 99) * (1 + 0.05 * Math.sin(t * 8)); ctx.save(); ctx.translate(SX, 560); ctx.scale(a, a); ctx.fillStyle = "#fe2c55"; rr(-130, -26, 260, 52, 12); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 22px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("➕ Folgen & einziehen", 0, 1); ctx.restore();
      for (const [k, i] of [[0, 12], [1, 15], [2, 18]]) { const a2 = pop(t, T.wish + k * 0.12, 99); if (a2 > 0) { ctx.save(); ctx.translate(SX - 140 + k * 140, 690); ctx.scale(a2, a2); OL(() => bld(i, 0, 0, 0.9), 4); ctx.restore(); } } }
  }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.85); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,10,50,0.3)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const k of ["me", ...new Set(HAUS.map(b => b.av).filter(Boolean))]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = k + ".png"; });
  buildMap();
  return { duration: DUR };
};
