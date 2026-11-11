// ============================================================ Tag 10 „24 Wünsche – alle gebaut“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js + tag10.js -> scene.js)
// 1:1 nach dem Aufbau des Vorbild-Videos (Stadtkarte von oben, Wunsch-Häuser, Rätsel, Hausliste, Auflösung, Like = Taler),
// angepasst auf Rotanien 2.0: fremder Planet (pinker Sand, Krater, türkiser Leuchtfluss, Kristalle), echte Kommentare, echte Zahlen.
const FOLLOWERS = 835, TALER = 4422;
const T = {
  triple: wt(5), count: wt(7), built: wt(13), range: wt(14), edeka: wt(18), crazy: wt(23), halt: wt(29), tipp: wt(38), end: wt(44),
  list: wt(49), such: wt(55), wieder: wt(62), oben: wt(69), f: [wt(73), wt(75), wt(77), wt(79), wt(81), wt(83), wt(85)], law: wt(91),
  reso: wt(97), wunsch: wt(101), reveal: wt(104), higher: wt(108), recht: wt(112), stadt: wt(115), moeglich: wt(119), grow: wt(123),
  comm: wt(127), denk: wt(131), like: wt(134), folg: wt(141), wish: wt(143), loop: 1e9,
};
const AV = {};
const INK = "#2b1a3a", CREAM = "#fff6e6", PINK = "#ff4f8b", TEAL = "#19b8a6", GOLD = "#ffd23a";

// ------------------------------------------------------------ die 24 Wünsche (alle aus echten Kommentaren, Tag 2–9)
const HAUS = [
  { u: "Jens", w: "Dönerladen", e: "🥙", c: "#ffcf7a", roof: "awning", av: "jens" },
  { u: "Safuan", w: "Döner „SAFUAN“", e: "🥙", c: "#ffb347", roof: "awning", av: "safuan" },
  { u: "Fabi 2.", w: "Dönermann-Stand", e: "🥙", c: "#ffe0a3", roof: "awning", av: "fabi" },
  { u: "Mehmet_brb", w: "Edeka", e: "🛒", c: "#ffe14a", roof: "flat", av: "mehmet", txt: "Bitte einen Edeka" },
  { u: "Janic-Energy", w: "Villa", e: "🏛️", c: "#fff3d6", roof: "villa", av: "janicenergy", txt: "Alle haben eine Villa" },
  { u: "berat_bulut", w: "Schwertschmiede", e: "⚔️", c: "#b9c0cc", roof: "tri", av: "berat", txt: "Kriege ich jetzt endlich ein Schwert" },
  { u: "sami&zoe", w: "Schule", e: "🏫", c: "#ff9d7a", roof: "tri", av: "sami", txt: "Kann ich Lehrerin sein" },
  { u: "Phillip", w: "Katzencafé", e: "🐱", c: "#ffb26b", roof: "dome", av: "phillip", txt: "Wann bekomme ich meine Orange Katze?" },
  { u: "Fire.Nico", w: "Gaming-Halle", e: "🎮", c: "#8a6bff", roof: "flat", av: "nico", txt: "möchte endlich Gamer Astronaut sein bitte bitte" },
  { u: "roader", w: "Wurmhaus", e: "🪱", c: "#ff9db4", roof: "dome", av: "roader", txt: "man bitteeeee mein wurm" },
  { u: "Mehmet_brb", w: "Apple Store", e: "🍎", c: "#f4f6f8", roof: "flat", av: "mehmet" },
  { u: "MEO", w: "Haus für alle", e: "🏠", c: "#7bd0ff", roof: "tri", av: "meo" },
  { u: "Alex", w: "Pizzeria", e: "🍕", c: "#e57a5a", roof: "dome", av: "alex" },
  { u: "Noam", w: "iPhone-Turm", e: "📱", c: "#cfd6e4", roof: "tower", av: "noam" },
  { u: "l.cgln16", w: "Palast", e: "👑", c: "#ffd76b", roof: "villa", av: "lcgln" },
  { u: "luk", w: "Polizeiwache", e: "🚓", c: "#5a8bff", roof: "flat", av: "luk" },
  { u: "einfachso", w: "Security-Turm", e: "🛡️", c: "#4a4f5c", roof: "tower", av: "einfachso" },
  { u: "MEO", w: "YouTube-Studio", e: "🎥", c: "#ff5a5a", roof: "flat", av: "meo" },
  { u: "Leonard", w: "Goyo-Haus", e: "✨", c: "#b06bff", roof: "tri", av: "leonard" },
  { u: "Arda", w: "Monster-Höhle", e: "👾", c: "#6b5bd6", roof: "dome", av: "arda" },
  { u: "Bz_Full", w: "Hühnerstall", e: "🐔", c: "#f0e2c0", roof: "tri" },
  { u: "Jakob", w: "Stein-Haus", e: "🪨", c: "#9a8f88", roof: "dome" },
  { u: "elster", w: "Hundehütte", e: "🐶", c: "#ff9fd2", roof: "tri" },
  { u: "keanu", w: "???", e: "❓", c: "#4a7bff", roof: "statue", av: "keanu", txt: "ich frage seit Tag 2 darf ich ein riesen Astronaut werden in Blau" },
];
const N = HAUS.length, MYST = N - 1;
const FEAT = [3, 5, 6, 7, 8, 9, 4];       // Edeka, Schwertschmiede, Schule, Katzencafé, Gaming-Halle, Wurmhaus, Villa
const FTAG = ["EDEKA!", "SCHMIEDE!", "SCHULE!", "KATZENCAFÉ!", "GAMING!", "WURMHAUS!", "VILLA FÜR ALLE!"];

// ------------------------------------------------------------ Gebäude-Icons (flach, mit dunklem Rand)
function bld(i, x, y, s, sil = false) { // Unterkante Mitte
  const b = HAUS[i]; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  const body = (w, h, c) => { ctx.fillStyle = c; rr(-w / 2, -h, w, h, 5); ctx.fill(); ctx.stroke(); };
  const dark = c => c;
  if (b.roof === "statue") { // riesiger blauer Astronaut auf Sockel
    ctx.fillStyle = "#9aa3ab"; rr(-26, -12, 52, 12, 3); ctx.fill(); ctx.stroke();
    ctx.restore(); astronaut(x, y - 12 * s, 0.62 * s, "happy", { t: 0, acc: "#1f4fd6", suit: "#4a7bff", suit2: "#5f8cff", suit3: "#3a62d0", armR: -2.5 }); return;
  }
  if (b.roof === "tower") { body(30, 78, b.c); for (let k = 0; k < 4; k++) { ctx.fillStyle = "#cfeaf7"; ctx.fillRect(-8, -70 + k * 16, 16, 8); } ctx.fillStyle = dark("#e5262b"); ctx.beginPath(); ctx.moveTo(-18, -78); ctx.lineTo(0, -98); ctx.lineTo(18, -78); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (b.roof === "villa") { body(78, 44, b.c); for (const cx of [-28, -10, 10, 28]) { ctx.fillStyle = "#fff"; ctx.fillRect(cx - 3, -40, 6, 36); ctx.strokeRect(cx - 3, -40, 6, 36); } ctx.fillStyle = "#e0c27a"; ctx.beginPath(); ctx.moveTo(-46, -44); ctx.lineTo(0, -70); ctx.lineTo(46, -44); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else { body(64, 46, b.c);
    if (b.roof === "tri") { ctx.fillStyle = "#e5503a"; ctx.beginPath(); ctx.moveTo(-40, -44); ctx.lineTo(0, -76); ctx.lineTo(40, -44); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (b.roof === "flat") { ctx.fillStyle = "#3a3f4e"; rr(-36, -58, 72, 14, 4); ctx.fill(); ctx.stroke(); }
    if (b.roof === "dome") { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(0, -46, 32, 24, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = "#ffe9f2"; ctx.fill(); ctx.stroke(); }
    if (b.roof === "awning") { for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? "#fff" : "#e5442f"; ctx.fillRect(-36 + k * 12, -58, 12, 14); } ctx.strokeRect(-36, -58, 72, 14); }
    ctx.fillStyle = "#5b3a1e"; rr(8, -24, 16, 24, 3); ctx.fill(); ctx.fillStyle = "#cfeaf7"; rr(-26, -34, 22, 18, 3); ctx.fill(); ctx.stroke();
  }
  if (!sil) { ctx.font = "30px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(b.e, 0, b.roof === "tower" ? -108 : b.roof === "villa" ? -84 : -88); }
  ctx.restore();
}
function silhouette(fn, col = "#161020") { // zeichnet fn als einfarbige Silhouette
  const m = ctx.getTransform(); const keep = ctx; ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(m); fn();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-in"; ctx.fillStyle = col; ctx.fillRect(0, 0, 1080, 1920); ctx.globalCompositeOperation = "source-over"; ctx = keep;
  MAIN.save(); MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.drawImage(lc, 0, 0); MAIN.restore();
}
function statueBig(x, y, s, t, wave = true) { // der Riesen-Astronaut mit Rakete daneben (Größenvergleich)
  ctx.save(); ctx.fillStyle = "#9aa3ab"; ctx.strokeStyle = INK; ctx.lineWidth = 3; rr(x - 60 * s, y - 20 * s, 120 * s, 20 * s, 5); ctx.fill(); ctx.stroke(); ctx.restore();
  astronaut(x, y - 20 * s, 1.5 * s, "happy", { t, acc: "#1f4fd6", suit: "#4a7bff", suit2: "#5f8cff", suit3: "#3a62d0", armR: wave ? -2.5 + Math.sin(t * 4) * 0.25 : -0.25 });
  rocket(x + 118 * s, y, 0.42 * s, 0);
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
  ctx.fillStyle = PINK; ctx.font = "900 9.5px InterX"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("@" + b.u, 7, 11); ctx.fillStyle = INK; ctx.font = "800 9.5px InterX"; ctx.fillText(i === MYST ? "???" : b.w, 7, 24);
  ctx.fillStyle = "rgba(243,162,198,0.6)"; rr(4, h - 22, w - 8, 18, 6); ctx.fill();
  if (i === MYST) { ctx.fillStyle = INK; ctx.font = "32px Comic"; ctx.textAlign = "center"; ctx.fillText("?", w / 2, h - 34); } else bld(i, w / 2 + 26, h - 8, 0.5);
  ctx.restore();
}
function iconGrid(t, s, n, y = 470) { // Sammelkarte mit allen Wunschhäusern
  if (s <= 0.01) return; ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-212, -150, 424, 300, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < Math.min(n, N); i++) { const cx = -175 + (i % 6) * 70, cy = -78 + Math.floor(i / 6) * 72; if (i === MYST) { ctx.fillStyle = INK; ctx.font = "34px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", cx, cy - 22); } else bld(i, cx, cy, 0.52); }
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
  ctx.save(); ctx.translate(SX, 400); ctx.scale(s, s); silhouette(() => statueBig(-20, 128, 0.95, 0, false)); ctx.restore();
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
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const dark = (t >= T.crazy && t < T.list) || (t >= T.reso && t < T.reveal);
  const dk = t >= T.crazy && t < T.list ? ramp(t, T.crazy + 0.5, T.crazy + 0.9) * (1 - ramp(t, T.list - 0.15, T.list)) : t >= T.reso && t < T.reveal ? ramp(t, T.reso, T.reso + 0.3) : 0;
  cityMap(t, 1 - dk);
  header(t);

  // 1) Hook: „Ihr wolltet einen Dönerladen? Gleich dreimal!“
  if (t < T.count) {
    title("IHR WOLLTET EINEN", "DÖNERLADEN?", 232, 1);
    const a = t < T.triple ? 1 : 0;
    houseCard(0, t < T.triple ? SX : lerp(SX, SX - 145, easeOut(ramp(t, T.triple, T.triple + 0.25))), 400, 1 * (t < 0.05 ? 1 : 1), 138, 180);
    if (t >= T.triple) { houseCard(1, SX, 400, back(ramp(t, T.triple + 0.05, T.triple + 0.3)), 138, 180); houseCard(2, SX + 145, 400, back(ramp(t, T.triple + 0.15, T.triple + 0.4)), 138, 180); tagLabel("GLEICH DREIMAL!", SX, 520, pop(t, T.triple + 0.2, T.count - 0.05), PINK, "#fff", -0.04, 22); }
  }
  // 2) „24 Wünsche. Und wir haben alle gebaut.“
  if (t >= T.count && t < T.range) {
    const n = Math.round(lerp(1, N, easeOut(ramp(t, T.count, T.built - 0.1))));
    title(n + " NEUE", "WUNSCHHÄUSER", 232, pop(t, T.count, T.range - 0.05), "#fff");
    iconGrid(t, pop(t, T.count + 0.05, T.range - 0.05), n, 450);
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
    ctx.save(); ctx.translate(SX, 0); silhouette(() => statueBig(-20, 560, 1.05 + 0.03 * Math.sin(t * 5), 0, false), "#fff0c9"); ctx.restore();
    tagLabel("DER VERRÜCKTESTE?", SX, 620, pop(t, T.wunsch, T.reveal - 0.05), GOLD, INK, 0, 22);
  }
  if (t >= T.reveal && t < T.stadt) {
    const a = back(ramp(t, T.reveal, T.reveal + 0.3)) * (1 - ramp(t, T.stadt - 0.15, T.stadt));
    ctx.save(); ctx.translate(SX, 430); ctx.scale(a, a); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-205, -170, 410, 340, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.roundRect(-199, -164, 398, 270, 12); ctx.clip(); ctx.fillStyle = "#1a1030"; ctx.fillRect(-199, -164, 398, 200); for (let j = 0; j < 20; j++) circle(-190 + (j * 53) % 380, -160 + (j * 37) % 180, 1.4, "#fff"); circle(140, -110, 26, "#3fd3c8"); ctx.strokeStyle = "rgba(255,230,160,0.9)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(140, -110, 46, 11, -0.35, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#f3a2c6"; ctx.fillRect(-199, 36, 398, 80); ctx.restore();
    ctx.restore();
    if (a > 0.5) { ctx.save(); ctx.translate(SX, 430); ctx.scale(a, a); OL(() => { statueBig(-30, 96, 1.0, t, true); for (const [hx, i] of [[-150, 11], [150, 0]]) bld(i, hx, 96, 0.55); }, 5); ctx.restore(); }
    ctx.save(); ctx.translate(SX, 430); ctx.scale(a, a); const av = AV.keanu; circle(-170, 136, 16, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(-170, 136, 15, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, -185, 121, 30, 30); ctx.restore(); }
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX"; ctx.fillText("@keanu", -148, 128); ctx.fillStyle = INK; ctx.font = "800 12px InterX"; ctx.fillText("„darf ich ein riesen Astronaut werden in Blau“", -148, 145); ctx.restore();
    tagLabel("RIESEN-ASTRONAUT!", SX, 262, pop(t, T.reveal + 0.1, T.stadt - 0.1), PINK, "#fff", -0.05, 26);
    tagLabel("HÖHER ALS JEDE RAKETE!", SX + 40, 315, pop(t, T.higher, T.stadt - 0.1), GOLD, INK, 0.04, 16);
    tagLabel("GEWÜNSCHT SEIT TAG 2", SX - 70, 500, pop(t, T.reveal + 0.6, T.stadt - 0.1), TEAL, "#fff", -0.05, 14);
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
