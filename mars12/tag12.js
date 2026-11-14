// ============================================================ Tag 12 „1 von 100 Truhen“ (base.js + helpers3.js + lib6c.js + pre12.js + lib11.js + tag12.js -> scene.js)
// Token-Jagd: Ein Piratenschiff (die gelben Augen aus Tag 11 waren seine Fenster) kippt 100 Truhen auf Rotanien. Zähler „GEÖFFNET x/100“,
// 5 Wünsche aus den Kommentaren unter Tag 11 springen aus Truhen, Speed-Montage bis 99, Truhe 100 öffnet sich – Schnitt, bevor man sieht, was drin ist.
// Kein Sprecher. Alles liegt auf dem 130-BPM-Raster (bt(n) = Beat n), jede Öffnung auf einem Beat.
const T = {
  capt: bt(3.25), c1: bt(7), c14: bt(9), c23: bt(12), c31: bt(15), c46: bt(17), c58: bt(19), mont: bt(23), c100: bt(27),
  open: bt(33), black: bt(35), pass: bt(36), cta: bt(42), tipp: bt(46.5), loop: bt(51), end: bt(52),
};
const END = T.end;
const CH = [
  { n: 1, k: "socke", t: T.c1, e: T.c14 },
  { n: 14, k: "bank", t: T.c14, e: T.c23, u: "berat_bulut", av: "berat", txt: "Wie wär's mit einer Bank" },
  { n: 23, k: "flughafen", t: T.c23, e: T.c31, u: "Noam", av: "noam", txt: "Flughafen bitteeee ich bin der Pilot" },
  { n: 31, k: "laden", t: T.c31, e: T.c46, u: "sami&zoe", av: "sami", txt: "können wir ein new Yorker haben" },
  { n: 46, k: "bunker", t: T.c46, e: T.c58, u: "Minimaus", av: "minimaus", txt: "Bunker" },
  { n: 58, k: "soldaten", t: T.c58, e: T.mont, u: "einfachso", av: "einfachso", txt: "Ich brauche Soldaten wer kommt ins Team ?" },
];
const DUDS = ["🥔", "🦆", "🥙", "💨", "🕸️", "👞", "🧦", "🥔"].map((e, k) => ({ e, t: bt(23 + k * 0.5), n: [60, 66, 72, 80, 86, 92, 96, 99][k] }));
const RAIN = (() => { const r = rng(12), a = []; for (let i = 0; i < 30; i++) a.push({ ts: -0.32 + i * 0.058, x: 40 + r() * 440, y: GY - 25 + r() * 95, s: 0.55 + r() * 0.35, rot: (r() - 0.5) * 0.5, sp: r() }); return a.sort((p, q) => p.y - q.y); })();
const ROW = ["stadion", "militaer", "zoo", "tierheim", "burek", "token", "schule", "rampe", "bahn", "wasser", "kuppel", "kino"];

// ------------------------------------------------------------ Zähler „GEÖFFNET x/100“
function count(t) {
  if (t >= T.loop || t < T.c1) return 0;
  if (t >= T.open) return 100;
  if (t >= T.mont) return DUDS.filter(d => t >= d.t).at(-1)?.n ?? 58;
  return CH.filter(c => t >= c.t).at(-1).n;
}
function lastChange(t) { const ts = [...CH.map(c => c.t), ...DUDS.map(d => d.t), T.open, T.loop].filter(x => x <= t); return ts.length ? Math.max(...ts) : -9; }
function counter(t) {
  if (t >= T.black && t < T.pass) return;
  const n = count(t), lc = lastChange(t), hot = t >= T.c100 && t < T.open, won = t >= T.open && t < T.loop;
  const pu = 1 + 0.16 * Math.exp(-(t - lc) * 10) + (hot ? 0.04 * Math.sin(t * 14) : 0);
  ctx.save(); ctx.translate(SX, 230); ctx.scale(pu, pu);
  const bg = won ? "#1fa35a" : hot ? `rgb(${Math.round(150 + 80 * (0.5 + 0.5 * Math.sin(t * 8)))},20,40)` : "#e5262b";
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.fillStyle = bg; rr(-170, -32, 340, 64, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.font = "900 27px InterX, 'Noto Color Emoji'"; ctx.fillText("GEÖFFNET:", -154, 2);
  ctx.fillStyle = "#fff"; rr(18, -22, 140, 44, 12); ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.font = "900 30px InterX"; ctx.fillText(n + "/100", 88, 3);
  ctx.restore();
  const f = n / 100, bw = 340, bh = 16; ctx.save(); ctx.translate(SX - bw / 2, 270);
  ctx.fillStyle = "rgba(20,10,40,0.55)"; rr(0, 0, bw, bh, 8); ctx.fill();
  if (f > 0.004) { const g = ctx.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, "#ffb43a"); g.addColorStop(1, "#ffe27a"); ctx.fillStyle = g; rr(0, 0, Math.max(bh, bw * f), bh, 8); ctx.fill(); if (f < 1) glow(bw * f, bh / 2, 16, "255,240,180", 0.8); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; rr(0, 0, bw, bh, 8); ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------ Truhe, Token, Schiff, Kapitän
function chest(x, y, s, t, o = {}) { // Unterkante Mitte; o.open 0..1, o.num, o.light 0..1, o.q (Fragezeichen), o.gone (Deckel weg)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(60,20,60,0.3)"; ctx.beginPath(); ctx.ellipse(0, 2, 50, 7, 0, 0, Math.PI * 2); ctx.fill();
  const op = o.open || 0, li = o.light || 0;
  if (op > 0.05 || li > 0) { const a = Math.max(op, li); glow(0, -44, 120, "255,215,90", 0.9 * a);
    ctx.save(); ctx.globalAlpha = a * 0.55; for (let i = 0; i < 7; i++) { const an = -Math.PI / 2 + (i - 3) * 0.28 + Math.sin(t * 2 + i) * 0.04; ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.moveTo(-8, -44); ctx.lineTo(8, -44); ctx.lineTo(Math.cos(an + 0.07) * 260, -44 + Math.sin(an + 0.07) * 260); ctx.lineTo(Math.cos(an - 0.07) * 260, -44 + Math.sin(an - 0.07) * 260); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  // Korpus
  ctx.fillStyle = "#a8642c"; rr(-42, -46, 84, 46, 5); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-42, -46, 84, 46, 5); ctx.clip(); ctx.strokeStyle = "rgba(70,30,10,0.45)"; ctx.lineWidth = 2; for (const py of [-31, -16]) { ctx.beginPath(); ctx.moveTo(-42, py); ctx.lineTo(42, py); ctx.stroke(); } ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(14, -46, 30, 46); ctx.restore();
  ctx.fillStyle = "#f2c23a"; for (const bx of [-33, 26]) { rr(bx, -46, 7, 46, 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } ctx.lineWidth = 3;
  if (o.num != null) { ctx.fillStyle = CREAM; rr(-15, -30, 30, 16, 4); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; ctx.fillStyle = INK; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("#" + o.num, 0, -21.5); }
  if (op > 0.05) { ctx.fillStyle = "#3a1a08"; ctx.beginPath(); ctx.ellipse(0, -46, 40, 7 * op, 0, 0, Math.PI * 2); ctx.fill(); glow(0, -48, 50, "255,240,170", op); }
  if (li > 0 && op < 0.05) { ctx.strokeStyle = `rgba(255,236,140,${li})`; ctx.lineWidth = 3 + 2 * li; ctx.beginPath(); ctx.moveTo(-42, -46); ctx.lineTo(42, -46); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3; }
  // Deckel (klappt nach hinten links auf)
  if (!o.gone) { ctx.save(); ctx.translate(-42, -46); ctx.rotate(-2.0 * op); ctx.translate(42, 0);
    ctx.fillStyle = "#b8743a"; ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-42, -12); ctx.quadraticCurveTo(0, -34, 42, -12); ctx.lineTo(42, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f2c23a"; for (const bx of [-33, 26]) { ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, -14 - (bx < 0 ? 4 : 6)); ctx.lineTo(bx + 7, -16 - (bx < 0 ? 4 : 4)); ctx.lineTo(bx + 7, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } ctx.lineWidth = 3;
    ctx.fillStyle = "#f2c23a"; rr(-8, -6, 16, 14, 3); ctx.fill(); ctx.stroke(); circle(0, 0, 2.2, INK);
    ctx.restore(); }
  if (o.q) { const p = 1 + 0.08 * Math.sin(t * 6); ctx.save(); ctx.translate(0, -82); ctx.scale(p, p); glow(0, 0, 50, "255,220,90", 0.7); outlined("?", 0, 0, 58, GOLD, INK, 8); ctx.restore(); }
  ctx.restore();
}
function token(x, y, r, t, spin = true) { if (!(r > 0.5)) return;
  const sx = spin ? Math.max(0.18, Math.abs(Math.cos(t * 3.2))) : 1; glow(x, y, r * 2.6, "255,215,80", 0.7);
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); circle(0, 0, r, INK); circle(0, 0, r * 0.93, "#ffd23a"); circle(0, 0, r * 0.72, "#ffe58a");
  ctx.strokeStyle = "#c8901a"; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();
  outlined("R", 0, r * 0.06, r * 0.95, "#e09a12", "#8a5a08", r * 0.08); ctx.restore();
  if (spin) for (let i = 0; i < 3; i++) { const a = (t * 1.7 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * a); emo("✨", x + Math.cos(i * 2.1) * r * 1.3, y + Math.sin(i * 2.1) * r * 1.3, r * 0.5); ctx.globalAlpha = 1; }
}
function ship(x, y, s, t, o = {}) { // fliegendes Piratenschiff, (x, y) = Deckmitte
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.2) * 4); ctx.rotate(o.tilt || 0); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  // Düsen + Flammen
  for (const dx of [-90, 0, 90]) { ctx.fillStyle = "#4a4f5c"; rr(dx - 14, 52, 28, 22, 4); ctx.fill(); ctx.stroke(); const fl = 26 + 10 * Math.sin(t * 40 + dx); glow(dx, 82, 36, "120,230,255", 0.8); ctx.fillStyle = "#7ff0ff"; ctx.beginPath(); ctx.moveTo(dx - 10, 74); ctx.quadraticCurveTo(dx, 74 + fl * 1.6, dx + 10, 74); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(dx - 5, 74); ctx.quadraticCurveTo(dx, 74 + fl * 0.8, dx + 5, 74); ctx.fill(); }
  // Masten + Segel
  for (const [mx, mh] of [[-55, 230], [75, 200]]) { ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, -mh); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = "#7a4420"; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
    const bl = 6 * Math.sin(t * 3 + mx); ctx.fillStyle = "#5b2a86"; ctx.beginPath(); ctx.moveTo(mx - 62, -mh + 26); ctx.quadraticCurveTo(mx + bl, -mh + 14, mx + 62, -mh + 26); ctx.lineTo(mx + 56, -48); ctx.quadraticCurveTo(mx + bl * 2, -30, mx - 56, -48); ctx.closePath(); ctx.fill(); ctx.stroke();
    circle(mx + bl, -mh / 2 - 14, 20, "#fff6e6"); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(mx + bl, -mh / 2 - 14, 32, 8, -0.3, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(mx, -mh); ctx.lineTo(mx + 34, -mh + 8 + Math.sin(t * 6) * 3); ctx.lineTo(mx, -mh + 18); ctx.fill(); ctx.fillStyle = GOLD; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("R", mx + 12, -mh + 9); }
  // Rumpf
  ctx.fillStyle = "#7a4420"; ctx.beginPath(); ctx.moveTo(-190, -34); ctx.lineTo(-118, -34); ctx.lineTo(-108, -6); ctx.lineTo(150, -6); ctx.lineTo(196, -44); ctx.quadraticCurveTo(160, 66, 10, 66); ctx.quadraticCurveTo(-160, 66, -190, -34); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = "rgba(40,15,5,0.5)"; ctx.lineWidth = 2; for (const py of [12, 30, 48]) { ctx.beginPath(); ctx.moveTo(-200, py); ctx.lineTo(200, py - 4); ctx.stroke(); } ctx.restore();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-186, -28); ctx.lineTo(-114, -28); ctx.lineTo(-104, -1); ctx.lineTo(150, -1); ctx.lineTo(190, -38); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (let px = -96; px <= 140; px += 16) { ctx.beginPath(); ctx.moveTo(px, -6); ctx.lineTo(px, -20); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-104, -20); ctx.lineTo(146, -20); ctx.stroke();
  for (let i = 0; i < 4; i++) { const px = -70 + i * 34; circle(px, 22, 7, INK); circle(px, 22, 5.5, "#ffcf5a"); }
  // die „Augen“ aus Tag 11 = Bugfenster
  const e = o.eyes ?? 1; for (const d of [0, 1]) { const ex = 92 + d * 44, ey = 16; glow(ex, ey, 46, "255,60,30", 0.7 * e); ctx.fillStyle = "#1b0a10"; ctx.beginPath(); ctx.ellipse(ex, ey, 19, 11, d ? 0.28 : -0.28, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#ffdf4a"; ctx.globalAlpha = e; ctx.beginPath(); ctx.ellipse(ex, ey, 16, 8.5, d ? 0.28 : -0.28, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#1a0510"; ctx.beginPath(); ctx.ellipse(ex - 2, ey, 3, 7.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  if (o.hatch) { ctx.fillStyle = "#1b0a10"; rr(-150, 30, 46, 24, 4); ctx.fill(); ctx.stroke(); glow(-127, 42, 40, "255,215,90", 0.6 * o.hatch); }
  ctx.restore();
}
function captain(x, y, s, t, o = {}) { // Alien-Pirat, Füße bei (x, y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (const d of [-1, 1]) { ctx.fillStyle = "#1b1424"; rr(d * 12 - 9, -26, 18, 26, 4); ctx.fill(); }
  // Mantel
  ctx.fillStyle = "#c8323c"; rr(-28, -86, 56, 64, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#1b1424"; ctx.fillRect(-27, -44, 54, 8); ctx.fillStyle = GOLD; rr(-6, -46, 12, 12, 2); ctx.fill(); for (const by of [-74, -62]) circle(0, by, 3, GOLD);
  // Arme: links Haken, rechts hält den Token hoch
  ctx.save(); ctx.translate(-26, -78); ctx.rotate(0.35); ctx.fillStyle = "#c8323c"; rr(-7, 0, 14, 34, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#cfd6dc"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 44, 7, -Math.PI / 2, Math.PI * 0.9); ctx.stroke(); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  const ar = o.armUp ?? 1, ang = lerp(-0.3, -2.7, ar) + Math.sin(t * 6) * 0.06 * ar; ctx.save(); ctx.translate(26, -78); ctx.rotate(ang); ctx.fillStyle = "#c8323c"; rr(-7, 0, 14, 36, 7); ctx.fill(); ctx.stroke(); circle(0, 38, 8, "#7bd36a"); ctx.restore();
  // Kopf
  for (const d of [-1, 1]) { ctx.fillStyle = "#6cc35a"; ctx.beginPath(); ctx.moveTo(d * 22, -122); ctx.lineTo(d * 40, -136); ctx.lineTo(d * 26, -110); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  circle(0, -116, 27, INK); circle(0, -116, 25, "#7bd36a");
  circle(9, -120, 8, "#fff"); circle(10 + Math.sin(t * 2) * 1.5, -119, 4, INK);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(-10, -120, 9, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-26, -128); ctx.lineTo(24, -112); ctx.stroke(); ctx.lineWidth = 3;
  ctx.fillStyle = "#3a1020"; ctx.beginPath(); ctx.arc(0, -106, 11, 0.1, Math.PI - 0.1); ctx.closePath(); ctx.fill(); ctx.fillStyle = GOLD; ctx.fillRect(3, -106, 5, 4);
  // Dreispitz
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-44, -132); ctx.quadraticCurveTo(0, -128, 44, -132); ctx.quadraticCurveTo(30, -176, 0, -170); ctx.quadraticCurveTo(-30, -176, -44, -132); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -134); ctx.quadraticCurveTo(0, -130, 40, -134); ctx.stroke(); ctx.strokeStyle = INK; circle(0, -152, 8, "#fff6e6"); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -152, 13, 3.5, -0.3, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  return [x + (26 + Math.sin(ang) * -38) * s, y + (-78 + Math.cos(ang) * 38) * s];   // Hand (für den Token)
}

// ------------------------------------------------------------ die Wünsche aus den Truhen (Unterkante Mitte, lt = Zeit seit Öffnen)
function wish(k, x, y, s, t, lt = 9) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(70,20,70,0.25)"; ctx.beginPath(); ctx.ellipse(0, 2, 60, 7, 0, 0, Math.PI * 2); ctx.fill();
  switch (k) {
    case "bank": {
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? "#cfd3dc" : "#e3e6ee"; rr(-58 + i * 5, -6 - i * 6, 116 - i * 10, 6, 1); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } ctx.lineWidth = 3;
      ctx.fillStyle = "#eef0f5"; ctx.fillRect(-46, -66, 92, 48); ctx.strokeRect(-46, -66, 92, 48);
      for (let i = 0; i < 4; i++) { const cx = -36 + i * 24; ctx.fillStyle = "#fff"; rr(cx - 6, -64, 12, 46, 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.beginPath(); ctx.moveTo(cx - 2, -62); ctx.lineTo(cx - 2, -20); ctx.moveTo(cx + 2, -62); ctx.lineTo(cx + 2, -20); ctx.stroke(); ctx.strokeStyle = INK; } ctx.lineWidth = 3;
      ctx.fillStyle = "#6b3f1e"; rr(-8, -40, 16, 22, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e3e6ee"; rr(-54, -78, 108, 12, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.font = "900 10px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("B A N K", 0, -71.5);
      ctx.fillStyle = "#eef0f5"; ctx.beginPath(); ctx.moveTo(-58, -78); ctx.lineTo(0, -108); ctx.lineTo(58, -78); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); token(x, y - 90 * s, 10 * s, t, false); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (const [px, n] of [[-66, 4], [66, 5], [56, 3]]) for (let j = 0; j < n; j++) { ctx.fillStyle = j % 2 ? "#ffd23a" : "#ffe27a"; ctx.beginPath(); ctx.ellipse(px, -3 - j * 4.5, 9, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); } ctx.lineWidth = 3;
      break; }
    case "flughafen": {
      ctx.fillStyle = "#4a4f5c"; rr(-70, -6, 150, 10, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; for (let i = 0; i < 6; i++) ctx.fillRect(-62 + i * 24, -2, 12, 2.5);
      box(96, 30, "#bfe6ff", 12, 6, -6); ctx.fillStyle = "#5fb8e8"; for (let i = 0; i < 6; i++) { rr(-26 + i * 14, -28, 10, 16, 2); ctx.fill(); } sgn("FLUGHAFEN", -42, "#1c2f6b", "#fff", 7, 12);
      box(12, 66, "#e9edf5", -52, 3, -6); ctx.fillStyle = "#3a8f5a"; rr(-66, -94, 28, 22, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#9cf0c0"; ctx.fillRect(-62, -90, 20, 8);
      circle(-52, -100, 4, Math.sin(t * 9) > 0 ? "#ff3b3b" : "#7a1a1a"); pole(70, 34, -6); ctx.fillStyle = "#ff7a2a"; ctx.beginPath(); ctx.moveTo(70, -40); ctx.lineTo(90 + Math.sin(t * 6) * 3, -36); ctx.lineTo(70, -32); ctx.fill();
      break; }
    case "laden": {
      box(112, 62, "#ff8fc0"); ctx.fillStyle = "#cfefff"; rr(-48, -46, 54, 32, 3); ctx.fill(); ctx.stroke(); door(30, 18, 34, "#7a3b5a");
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(-30, -36); ctx.moveTo(-40, -30); ctx.lineTo(-30, -36); ctx.lineTo(-20, -30); ctx.stroke(); ctx.fillStyle = "#ffd23a"; rr(-38, -30, 16, 14, 3); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? "#fff" : TEAL; ctx.beginPath(); ctx.moveTo(-60 + i * 17.1, -62); ctx.lineTo(-60 + (i + 1) * 17.1, -62); ctx.lineTo(-60 + (i + 1) * 17.1, -54); ctx.arc(-60 + (i + 0.5) * 17.1, -54, 8.55, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); } ctx.lineWidth = 3;
      ctx.fillStyle = "#1b1424"; rr(-58, -88, 116, 24, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 12px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("NEW ROTANIER", 0, -75.5);
      for (let i = 0; i < 3; i++) { const a = (t * 1.6 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * a); emo("✨", -52 + i * 52, -96 - (i % 2) * 6, 9); ctx.globalAlpha = 1; }
      break; }
    case "bunker": {
      ctx.fillStyle = "#8a8f9a"; ctx.beginPath(); ctx.ellipse(0, 0, 60, 52, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(10, -60, 60, 60); for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#ffd23a" : INK; ctx.beginPath(); ctx.moveTo(-64 + i * 11, 0); ctx.lineTo(-58 + i * 11, -10); ctx.lineTo(-47 + i * 11, -10); ctx.lineTo(-53 + i * 11, 0); ctx.fill(); } ctx.restore(); ctx.beginPath(); ctx.ellipse(0, 0, 60, 52, 0, Math.PI, 0); ctx.stroke();
      circle(0, -34, 15, INK); circle(0, -34, 13, "#5a606c"); ctx.lineWidth = 2.5; ctx.strokeStyle = "#c9ced6"; ctx.beginPath(); ctx.arc(0, -34, 7, 0, Math.PI * 2); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + t; ctx.moveTo(Math.cos(a) * 7, -34 + Math.sin(a) * 7); ctx.lineTo(Math.cos(a) * 12, -34 + Math.sin(a) * 12); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      pole(36, 30, -40); circle(36, -72, 3, Math.sin(t * 8) > 0 ? "#ff3b3b" : "#7a1a1a"); sgn("BUNKER", -58, "#2a2a30", "#ffd23a", 9, -26);
      break; }
  }
  ctx.restore();
}
function plane(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.16); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.globalAlpha = 0.5 - i * 0.08; circle(-96 - i * 22, 6, 10 - i, "#fff"); } ctx.globalAlpha = 1; glow(-86, 6, 22, "255,170,70", 0.9);
  ctx.fillStyle = "#cfd6e0"; ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-36, 40); ctx.lineTo(-16, 40); ctx.lineTo(22, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-70, -2); ctx.lineTo(-92, -38); ctx.lineTo(-76, -38); ctx.lineTo(-52, -4); ctx.closePath(); ctx.fillStyle = PINK; ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 13px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("R", -78, -24);
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(84, 6); ctx.quadraticCurveTo(70, -16, 20, -16); ctx.lineTo(-84, -12); ctx.quadraticCurveTo(-92, 2, -84, 14); ctx.lineTo(30, 20); ctx.quadraticCurveTo(76, 20, 84, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PINK; ctx.fillRect(-82, 4, 150, 5); ctx.fillStyle = "#5fb8e8"; for (let i = 0; i < 6; i++) { circle(-50 + i * 14, -4, 3.5, "#5fb8e8"); }
  ctx.fillStyle = "#1c2a40"; ctx.beginPath(); ctx.moveTo(56, -12); ctx.quadraticCurveTo(76, -10, 80, 0); ctx.lineTo(56, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  const av = AV.noam; circle(64, -4, 8, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(64, -4, 7, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, 57, -11, 14, 14); ctx.restore(); }
  ctx.fillStyle = INK; rr(-30, 10, 68, 13, 4); ctx.fill(); ctx.fillStyle = GOLD; ctx.font = "900 9px InterX"; ctx.fillText("PILOT: NOAM", 4, 17);
  ctx.restore(); }
function noticeBoard(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.04 + Math.sin(t * 3) * 0.02); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (const d of [-1, 1]) { ctx.fillStyle = "#6b4a2a"; rr(d * 44 - 4, -40, 8, 42, 2); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = "#2f5a2a"; rr(-64, -96, 128, 62, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#f6ecd4"; rr(-58, -90, 116, 50, 5); ctx.fill();
  ctx.fillStyle = "#2a3a22"; ctx.font = "900 13px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SOLDATEN", 0, -77); ctx.fillText("GESUCHT", 0, -63); ctx.fillStyle = "#e5262b"; ctx.font = "900 15px InterX"; ctx.fillText("0/10", 0, -48);
  ctx.restore(); }

// ------------------------------------------------------------ Bühne + Effekte
function row(t, a = 1) { ctx.globalAlpha = a; ROW.forEach((k, i) => bld(k, 26 + i * 44, HZ + 4, 0.28, t, 9)); ctx.globalAlpha = 1; }
function burst(x, y, lt, big = 1, col = "255,220,90") { if (lt < 0 || lt > 1.0) return; const k = lt / 1.0;
  glow(x, y, 220 * big * (1 - k * 0.5), col, 0.8 * (1 - k));
  ctx.strokeStyle = `rgba(255,248,200,${0.9 * (1 - ramp(lt, 0, 0.4))})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 30 + 260 * big * easeOut(ramp(lt, 0, 0.4)), 0, Math.PI * 2); ctx.stroke();
  const r = rng(Math.round(x * 7 + y)); for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, v = (120 + r() * 220) * big; ctx.globalAlpha = 1 - k; emo(i % 3 ? "✨" : "⭐", x + Math.cos(a) * v * easeOut(k), y + Math.sin(a) * v * easeOut(k) + 120 * k * k, 14 + r() * 10); } ctx.globalAlpha = 1; }
function coinsArc(x, y, lt, n = 14, seed = 3) { if (lt < 0 || lt > 1.6) return; const r = rng(seed); for (let i = 0; i < n; i++) { const vx = (r() - 0.5) * 520, vy = -380 - r() * 300, d = lt - r() * 0.3; if (d < 0) continue; emo("🪙", x + vx * d, y + vy * d + 900 * d * d, 22); } }
function flying(list, x, y, lt, seed = 5) { if (lt < 0 || lt > 1.4) return; const r = rng(seed); list.forEach((e, i) => { const vx = (r() - 0.5) * 560, vy = -420 - r() * 260, d = lt - i * 0.06; if (d < 0) return; ctx.save(); ctx.translate(x + vx * d, y + vy * d + 820 * d * d); ctx.rotate(d * (r() - 0.5) * 12); emo(e, 0, 0, 34); ctx.restore(); }); }
function skyTear(cx, cy, a, t) { if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = a; glow(cx, cy, 300, "255,180,240", 0.6);
  ctx.fillStyle = "#fff3fb"; ctx.beginPath(); const r = rng(4); ctx.moveTo(cx - 260, cy); for (let i = 0; i <= 12; i++) ctx.lineTo(cx - 260 + i * 43, cy - 18 - r() * 40 - (i % 2) * 20); for (let i = 12; i >= 0; i--) ctx.lineTo(cx - 260 + i * 43, cy + 18 + r() * 40 + (i % 2) * 20); ctx.closePath(); ctx.fill(); ctx.restore(); }
function crowd(t, mood, y0 = 1010, s0 = 1.15) { // Astronauten-Köpfe unten im Bild
  const acc = ["#ff4f8b", "#3fd3f2", "#ffd23a", "#7bf27a", "#b06bff"];
  for (let i = 0; i < 5; i++) { const shake = mood * Math.sin(t * 30 + i) * 3, x = 46 + i * 104 + shake, lean = Math.sin(t * 5 + i) * 0.05 * mood;
    ctx.save(); ctx.translate(x, y0); ctx.rotate(lean); ctx.translate(-x, -y0); astronaut(x, y0 - Math.abs(Math.sin(t * 7 + i)) * 6 * mood, s0, mood > 0.5 ? "shock" : "think", { t, acc: acc[i], armL: mood > 0.6 ? -2.6 : 0.25, armR: mood > 0.6 ? 2.6 : -0.25 }); ctx.restore();
    if (mood > 0.4) { const k = (t * 1.5 + i * 0.3) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = "#7fd0ff"; ctx.beginPath(); ctx.ellipse(x + 30 * s0, y0 - 140 * s0 + k * 26, 4, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } } }
function speech(txt, x, y, s) { if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 70, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-20, 28); ctx.lineTo(-38, 56); ctx.lineTo(-2, 32); ctx.fill(); outlined(txt, 0, 2, 32, "#e5262b", INK, 6); ctx.restore(); }
function captions2(t) {
  const c = window.CHUNKS.find(c => t >= c.s - 0.02 && t <= c.e); if (!c) return;
  ctx.save(); ctx.font = "46px Comic, 'Noto Color Emoji'"; ctx.letterSpacing = "0.5px"; const sp = ctx.measureText(" ").width;
  const lines = []; for (const w of c.w) (lines[w[3]] ||= []).push([...w, ctx.measureText(w[0]).width]);
  const ys = lines.length > 1 ? [744, 800] : [772];
  lines.forEach((ln, li) => { const tw = ln.reduce((a, p) => a + p[4] + sp, -sp), fit = Math.min(1, 450 / tw), cx = 262, y = ys[li];
    ctx.save(); ctx.translate(cx, y); ctx.scale(fit, fit); let x = -tw / 2;
    for (const [w, s, col, , ww] of ln) { const k = ramp(t, s - 0.02, s + 0.1); if (k > 0) { ctx.save(); ctx.translate(x + ww / 2, 0); const sc = 0.55 + 0.45 * back(k); ctx.scale(sc, sc); outlined(w, 0, 0, 46, col === 1 ? CYAN : col === 2 ? RED : col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 11); ctx.restore(); } x += ww + sp; }
    ctx.restore(); });
  ctx.restore();
}

// ------------------------------------------------------------ Szenen
function sceneRain(t, u) { // u = Zeit relativ zum Kippen (Frame 1 = 0; in der Loop-Sekunde negativ)
  stage(t); row(t); skyTear(CX + 20, 390, u < 0 ? 0 : 1 - ramp(u, 0.6, 1.4), t);
  for (const c of RAIN) { const d = u - c.ts; if (d < 0) continue; const fall = 0.42, k = Math.min(1, d / fall), x0 = CX - 110 + c.sp * 60;
    const x = lerp(x0, c.x, k), y = lerp(470, c.y, k * k), lt = d - fall, bounce = lt > 0 ? Math.abs(Math.sin(lt * 14)) * 14 * Math.exp(-lt * 6) : 0;
    if (lt > 0) dustBurst(x, c.y, lt, 0.5 * c.s);
    ctx.save(); ctx.translate(x, y - bounce); ctx.rotate(lt > 0 ? c.rot * Math.exp(-lt * 8) : c.rot + d * 6); chest(0, 0, c.s, t, { num: null }); ctx.restore(); }
  ship(CX + 40, 428, 0.6, t, { tilt: lerp(0.05, 0.22, easeOut(ramp(u, -0.4, 0.2))), hatch: 1 });
}
function sceneCaptain(t) {
  const lt = t - T.capt, z = 1 + 0.07 * easeOut(ramp(lt, 0, 1.7)); ctx.save(); ctx.translate(CX, 560); ctx.scale(z, z); ctx.translate(-CX, -560);
  stage(t, 1000); for (let i = 0; i < 14; i++) { const r = rng(i + 30), d = ((lt * 0.8 + r()) % 1); emo("🪙", 40 + r() * 470, lerp(300, 1000, d), 20 + r() * 10); }
  ship(CX + 100, 724, 1.7, t, { eyes: 1 });
  const hand = captain(CX - 70, 716, 1.9, t, { armUp: easeOut(ramp(lt, 0.05, 0.35)) });
  token(hand[0], hand[1] - 62, 42 * back(ramp(lt, 0.15, 0.45)), t);
  speech("ARRR!", CX + 90, 340, pop(t, T.capt + 0.05, T.capt + 0.9, 0.18));
  ctx.restore();
}
function sceneChest(t, c, i) {
  const lt = t - c.t; stage(t); row(t);
  const settled = c.k === "socke" ? 0 : easeOut(ramp(lt, 0.2, 0.42));
  const cx = lerp(CX, CX + 168, settled), cy = lerp(GY + 40, GY + 150, settled), cs = lerp(2.3, 1.05, settled);
  const drop = lt < 0 ? lerp(-700, 0, Math.pow(ramp(t, c.t - 0.16, c.t - 0.02), 2)) : 0, op = back(ramp(lt, 0, 0.12));
  const grow = back(ramp(lt, 0.04, 0.32)), BX = CX - 10, BY = GY + 70;
  if (c.k === "socke") { chest(CX, GY + 40 + drop, 2.3, t, { open: op, num: c.n }); burst(CX, GY - 70, lt, 0.5, "200,200,210");
    if (lt > 0) { ctx.save(); ctx.translate(CX, lerp(GY - 40, GY - 210, easeOut(ramp(lt, 0, 0.3)))); ctx.rotate(Math.sin(lt * 9) * 0.25); emo("🧦", 0, 0, 110 * back(ramp(lt, 0, 0.25))); ctx.restore(); emo("💨", CX + 90, GY - 120, 60 * pop(t, c.t + 0.05, c.e - 0.2)); }
    return; }
  if (c.k === "soldaten") { bld("militaer", BX + 50, BY - 10, 2.4 * grow, t, lt); }
  else if (c.k === "bunker") { const sink = easeIO(ramp(lt, 0.75, 1.35)) * 95; ctx.save(); ctx.beginPath(); ctx.rect(-50, -50, W + 100, BY + 2 + 50); ctx.clip(); wish("bunker", BX, BY + sink, 2.1 * grow, t, lt); ctx.restore();
    if (lt > 0.75 && lt < 1.6) for (let j = 0; j < 12; j++) { const r = rng(j + 40), d = ((lt - 0.75) * 1.6 + r() * 0.5) % 1; ctx.globalAlpha = 1 - d; circle(BX + (r() - 0.5) * 300 * d, BY - 10 - Math.sin(Math.PI * d) * 90, 8 + r() * 10, "#b8607e"); ctx.globalAlpha = 1; } }
  else wish(c.k, BX, BY, 2.2 * grow, t, lt);
  if (c.k === "bank") coinsArc(cx, cy - 90, lt, 18, 11);
  if (c.k === "laden") flying(["👕", "👖", "🧢", "👟", "👗", "🧥"], BX + 55, BY - 50, lt - 0.3, 8);
  if (c.k === "soldaten") { flying(["🪖", "🪖", "🪖", "🪖", "🪖"], cx, cy - 80, lt, 9); for (let j = 0; j < 5; j++) emo("🪖", 200 + j * 40, BY + 30, 30 * pop(t, c.t + 0.6 + j * 0.06, 99, 0.2));
    astronaut(CX - 200, BY + 40, 0.9, "smirk", { t, acc: "#2f8f4a", suit: "#a9b98f", suit2: "#b8c79e", suit3: "#8a9a72", armR: -2.5 + Math.sin(t * 8) * 0.25 }); noticeBoard(CX - 95, BY + 48, 1.0 * pop(t, c.t + 0.3, 99, 0.25), t); }
  chest(cx, cy + drop, cs, t, { open: op, num: c.n });
  burst(cx, cy - 70 * cs, lt, 1);
  if (c.k === "flughafen" && lt > 0.4) { const u = ramp(lt, 0.4, 1.4); if (u < 1) { plane(lerp(-140, 760, u), lerp(560, 300, u), 1.55, t); speedLines(0.6 * Math.sin(Math.PI * u)); } }
}
function sceneMontage(t) {
  const z = 1 + 0.16 * easeIO(ramp(t, T.mont, T.c100)); ctx.save(); ctx.translate(CX, GY); ctx.scale(z, z); ctx.translate(-CX, -GY);
  stage(t); row(t); speedLines(0.35 + 0.35 * ramp(t, T.mont, T.c100), "255,230,150");
  const d = DUDS.filter(x => t >= x.t - 0.08).at(-1) || DUDS[0], lt = t - d.t, op = back(ramp(lt, 0, 0.07)) * (1 - ramp(lt, 0.17, 0.23));
  chest(CX, GY + 40 - (lt < 0 ? 0 : Math.abs(Math.sin(lt * 12)) * 8 * Math.exp(-lt * 8)), 2.3, t, { open: op, num: d.n });
  for (const x of DUDS) { const l2 = t - x.t; if (l2 < 0 || l2 > 0.7) continue; const fly = ramp(l2, 0.22, 0.7), dir = DUDS.indexOf(x) % 2 ? 1 : -1;
    ctx.save(); ctx.translate(CX + dir * 420 * fly * fly, lerp(GY - 30, GY - 190, easeOut(ramp(l2, 0, 0.16))) - 80 * fly); ctx.rotate(dir * fly * 3); emo(x.e, 0, 0, 92 * back(ramp(l2, 0, 0.12))); ctx.restore();
    if (l2 < 0.22) { ctx.save(); ctx.globalAlpha = 1 - ramp(l2, 0.12, 0.22); outlined("✗", CX + 70, GY - 230, 64, RED, INK, 8); ctx.restore(); } }
  ctx.restore();
  crowd(t, 0.3 + 0.7 * ramp(t, T.mont, T.c100));
}
function sceneC100(t) {
  const lt = t - T.c100, k = ramp(t, T.c100, T.open), beatP = Math.exp(-((lt % BT)) * 7) * 0.025;
  const z = 1 + 0.22 * easeIO(k) + beatP; ctx.save(); ctx.translate(CX, GY); ctx.scale(z, z); ctx.translate(-CX, -GY);
  stage(t); row(t, 0.8);
  ctx.fillStyle = "rgba(12,5,30,0.62)"; ctx.fillRect(-60, -60, W + 120, H + 120);
  const sp = ctx.createRadialGradient(CX, GY, 20, CX, GY, 330); sp.addColorStop(0, "rgba(255,230,160,0.35)"); sp.addColorStop(1, "rgba(255,230,160,0)"); ctx.fillStyle = sp; ctx.fillRect(-60, -60, W + 120, H + 120);
  creature(CX - 175, GY + 10, 0.34, t, { eyes: 1, look: 1 });
  captain(CX + 185, GY + 14, 1.15, t, { armUp: 0 });
  for (const [ax, ay, s, a] of [[CX - 95, GY - 6, 0.72, "#3fd3f2"], [CX + 90, GY - 4, 0.72, "#ffd23a"], [CX - 140, GY + 52, 0.85, "#ff4f8b"], [CX + 140, GY + 56, 0.85, "#7bf27a"]]) astronaut(ax, ay, s, "shock", { t, acc: a });
  const tr = ramp(t, T.c100 + 0.3, T.open), sh = (2 + 9 * tr * tr) * Math.sin(t * 55);
  chest(CX + sh, GY + 70, 2.4, t, { num: 100, light: 0.2 + 0.8 * tr });
  ctx.restore();
}
function sceneOpen(t) {
  const lt = t - T.open;
  if (t >= T.black) { ctx.fillStyle = "#07040f"; ctx.fillRect(-60, -60, W + 120, H + 120); return; }
  const z = 1.22 + 0.5 * easeOut(ramp(lt, 0, 0.6)); ctx.save(); ctx.translate(CX, GY); ctx.scale(z, z); ctx.translate(-CX, -GY);
  stage(t); ctx.fillStyle = "rgba(12,5,30,0.6)"; ctx.fillRect(-60, -60, W + 120, H + 120);
  chest(CX, GY + 70, 2.4, t, { num: 100, open: 1, gone: true });
  const lid = ramp(lt, 0, 0.5); ctx.save(); ctx.translate(CX - 60 * lid, GY - 40 - 700 * easeOut(lid)); ctx.rotate(-lid * 5); ctx.scale(2.4, 2.4); ctx.fillStyle = "#b8743a"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-42, -12); ctx.quadraticCurveTo(0, -34, 42, -12); ctx.lineTo(42, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore();
  const f = easeOut(ramp(lt, 0, 0.4)); const g = ctx.createRadialGradient(CX, 560, 10, CX, 560, 80 + 1100 * f); g.addColorStop(0, "rgba(255,255,245,1)"); g.addColorStop(0.45, `rgba(255,236,150,${0.95 * f})`); g.addColorStop(1, `rgba(255,200,80,${0.75 * f})`); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120);
  ctx.save(); ctx.translate(CX, 560); ctx.rotate(t * 0.6); ctx.globalAlpha = 0.35 * f; for (let i = 0; i < 14; i++) { ctx.rotate(Math.PI * 2 / 14); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1200, -60); ctx.lineTo(1200, 60); ctx.fill(); } ctx.restore();
}
function sceneLater(t) { // Bordkarte + Aufruf
  stage(t); row(t);
  if (t < T.cta) {
    ship(CX + 40, 660, 0.5, t, {}); pass(pop(t, T.pass, T.cta - 0.1), t);
    const a = pop(t, T.pass + 0.2, T.cta - 0.1) * (1 + 0.06 * Math.sin(t * 9)); ctx.save(); ctx.translate(SX, 520); ctx.scale(a, a); ctx.fillStyle = "#fe2c55"; rr(-120, -24, 240, 48, 12); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 22px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("➕ Folgen = einsteigen", 0, 1); ctx.restore();
  } else {
    const lt = t - T.cta, sh = 2.5 * Math.sin(t * 40) * (0.5 + 0.5 * Math.sin(t * 3));
    for (let i = 0; i < 6; i++) { const r = rng(i + 60), d = ((lt * 0.35 + r()) % 1); ctx.globalAlpha = Math.sin(Math.PI * d) * 0.8; outlined("?", 40 + r() * 430, lerp(700, 470, d), 30 + r() * 20, GOLD, INK, 5); ctx.globalAlpha = 1; }
    chest(CX + sh, GY + 70, 2.3, t, { num: 100, light: 0.55 + 0.25 * Math.sin(t * 4), q: true });
    emptyComment(t, pop(t, T.cta + 0.15, 99), 366, "In Truhe 100 ist … 🤔");
    tagLabel("+ dein Bauwunsch 👇", SX, 446, pop(t, T.cta + 0.6, 99) * (1 + 0.03 * Math.sin(t * 8)), PINK, "#fff", -0.03, 20);
  }
}

// ------------------------------------------------------------ Bild
const HITS = [
  ...RAIN.map(c => [c.ts + 0.42, 4]),
  ...CH.map(c => [c.t, 11]), [CH[2].t + 0.4, 3], [CH[4].t + 0.75, 5],
  ...DUDS.map(d => [d.t, 6]), [T.open, 24], [T.pass, 6], [T.end + 0.42 - 0.32, 0],
];
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  let sh = 0, zp = 0, fl = 0;
  const hits = t >= T.loop ? RAIN.map(c => [c.ts + 0.42 + T.end, 4]) : HITS;
  for (const [h, s] of hits) if (t >= h && t - h < 1.2) { const d = t - h; sh += s * Math.exp(-d * 9); zp += s * 0.006 * Math.exp(-d * 9); fl += (s >= 10 ? 0.5 : 0) * Math.exp(-d * 16); }
  if (t < T.capt) for (const c of RAIN) { const d = t - c.ts - 0.42; if (d >= 0 && d < 1) sh += 4 * Math.exp(-d * 9); }
  const r = rng(Math.floor(t * 60) + 1); ctx.save(); ctx.translate(CX + (r() - 0.5) * 2 * sh, 600 + (r() - 0.5) * 2 * sh); ctx.scale(1 + zp, 1 + zp); ctx.translate(-CX, -600);
  if (t < T.capt) sceneRain(t, t);
  else if (t < T.c1 - 0.16) sceneCaptain(t);
  else if (t < T.mont) { let i = CH.findIndex((c, j) => t < (CH[j + 1]?.t ?? 99) - 0.16); if (i < 0) i = CH.length - 1; sceneChest(t, CH[i], i); }
  else if (t < T.c100) sceneMontage(t);
  else if (t < T.open) sceneC100(t);
  else if (t < T.pass) sceneOpen(t);
  else if (t < T.loop) sceneLater(t);
  else sceneRain(t, t - T.end);
  ctx.restore();
  // Kommentarkarten (kurz, klein, oben) – unten springt schon das Gebäude aus der Truhe
  for (const c of CH) if (c.u) card(c, pop(t, c.t - 0.05, Math.min(c.e - 0.25, c.t + 1.2), 0.16));
  if (fl > 0.02) { ctx.fillStyle = `rgba(255,250,225,${Math.min(0.6, fl)})`; ctx.fillRect(0, 0, W, H); }
  if (!(t >= T.black && t < T.pass)) { header(t); counter(t); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.85); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,10,50,0.35)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  captions2(t);
};
window.exportEvents = function () { return { duration: END, T, CH: CH.map(c => c.t), DUDS: DUDS.map(d => d.t), RAIN: RAIN.map(c => c.ts + 0.42), BT }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("46px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const k of ["berat", "noam", "sami", "minimaus", "einfachso"]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = k + ".png"; });
  return { duration: END };
};
