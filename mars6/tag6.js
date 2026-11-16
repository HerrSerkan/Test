// ============================================================ Tag 6 „Absturz auf Pluto“ (base.js + helpers3.js + lib4.js + lib5.js + tag6.js -> scene.js)
// Eigene Folge nach BRIEFING_TAG6.md, Stil wie Tag 5. Alle Zeiten hängen an den gesprochenen Wörtern.
// Sichere Zone: kein Text unten 20 % (y > 819), rechts 15 % (x > 490), oben 10 % (y < 102)  – im Raster 576 x 1024.
const SX = 245;                       // Mitte für Text (links der rechten 15 %)
const FOLLOWERS = 824;
const T = {
  fall: wt(3), impact: wt(7) - 0.62, vote: wt(7), tablet: wt(11), hatch: wt(17), noam: wt(20), horizon: wt(22), eyes: wt(25),
  rehook: wt(27), fast: wt(30), delon: wt(32), twist: wt(37), sniff: wt(40), doner: wt(45), hut: wt(47), stamm: wt(51),
  cta: wt(55), follow: wt(58), og: wt(63), weiter: wt(69), decide: wt(73), stay: wt(74), go: wt(78), vote2: wt(84), loop: SPEECH_END + 0.1,
};
const AV = {};
const scene = t => t < T.fall ? "cockpit" : t < T.impact ? "fall" : t < T.tablet ? "world" : t < T.hatch ? "cabin" : t < T.decide ? "world" : "split";

// ------------------------------------------------------------ Untertitel: Wort für Wort, max. 2 Zeilen, in der sicheren Zone
function captions(t) {
  const C = window.CHUNKS; let c = null;
  for (let i = 0; i < C.length; i++) if (t >= C[i].s - 0.02) c = C[i];
  if (!c || (t > c.e + 0.6 && c === C.at(-1))) return;
  ctx.save(); ctx.font = "40px Comic, 'Noto Color Emoji'"; ctx.letterSpacing = "0.5px";
  const sp = ctx.measureText(" ").width, MAXW = 400;
  const parts = c.w.map(([w, s, col]) => ({ w, s, col, ww: ctx.measureText(w).width }));
  const lines = [[]]; let lw = 0;
  for (const p of parts) { if (lines.at(-1).length && lw + sp + p.ww > MAXW) { lines.push([]); lw = 0; } lw += (lines.at(-1).length ? sp : 0) + p.ww; lines.at(-1).push(p); }
  const y0 = lines.length > 1 ? 742 : 772;
  lines.forEach((ln, li) => {
    const tw = ln.reduce((a, p) => a + p.ww + sp, -sp), fit = Math.min(1, MAXW / tw);
    let x = SX - tw * fit / 2; const y = y0 + li * 46;
    for (const p of ln) {
      const k = ramp(t, p.s - 0.02, p.s + 0.1);
      if (k > 0) { ctx.save(); ctx.translate(x + p.ww * fit / 2, y); const sc = (0.6 + 0.4 * back(k)) * fit; ctx.scale(sc, sc);
        outlined(p.w, 0, 0, 40, p.col === 1 ? CYAN : p.col === 2 ? RED : p.col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 10); ctx.restore(); }
      x += (p.ww + sp) * fit;
    }
  });
  ctx.restore();
}
function topLabel(txt, s, col = "#fff", y = 150, size = 40, bg = null) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  if (bg) { ctx.font = `${size}px Comic, 'Noto Color Emoji'`; const w = ctx.measureText(txt).width + 34; ctx.fillStyle = bg; rr(-w / 2, -size * 0.62, w, size * 1.24, 12); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); }
  if (bg) { ctx.fillStyle = col; ctx.font = `${size}px Comic, 'Noto Color Emoji'`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 3); } else outlined(txt, 0, 2, size, col, "#0e1a30", 10); ctx.restore();
}
function tag6Badge() { ctx.save(); ctx.fillStyle = "rgba(14,26,48,0.75)"; rr(14, 108, 84, 30, 9); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("TAG 6", 56, 124); ctx.restore(); }

// ------------------------------------------------------------ Pluto
function plutoPlanet(x, y, R, t) {
  glow(x, y, R * 1.35, "200,220,255", 0.25);
  circle(x, y, R + 4, "#1b1424"); circle(x, y, R, "#d8c7b0");
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  for (const [dx, dy, rx, ry, c] of [[-0.55, 0.15, 0.45, 0.6, "#8a6d5a"], [-0.2, -0.6, 0.5, 0.25, "#a3876e"], [0.5, 0.65, 0.4, 0.2, "#b29a82"], [-0.75, -0.3, 0.3, 0.3, "#6e5444"]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + dx * R, y + dy * R, rx * R, ry * R, 0.3, 0, Math.PI * 2); ctx.fill(); }
  // das helle Herz
  ctx.fillStyle = "#f8f2e8"; ctx.save(); ctx.translate(x + 0.22 * R, y + 0.05 * R); ctx.scale(R / 100, R / 100);
  ctx.beginPath(); ctx.moveTo(0, 38); ctx.bezierCurveTo(-55, 5, -45, -38, -14, -36); ctx.bezierCurveTo(-4, -35, 0, -26, 0, -20); ctx.bezierCurveTo(0, -26, 8, -38, 22, -36); ctx.bezierCurveTo(50, -32, 50, 8, 0, 38); ctx.fill(); ctx.restore();
  for (let i = 0; i < 9; i++) circle(x + Math.cos(i * 2.1) * R * 0.6, y + Math.sin(i * 1.7) * R * 0.55, R * 0.05, "rgba(90,70,60,0.35)");
  ctx.fillStyle = "rgba(0,0,30,0.3)"; ctx.beginPath(); ctx.arc(x + R * 0.3, y + R * 0.25, R, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function plutoSky(t) {
  ctx.fillStyle = "#05060c"; ctx.fillRect(-2000, -2500, 5000, HORIZON + 2500);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(x, y, r, "#fff"); }
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, HORIZON - 220, 0, HORIZON); g.addColorStop(0, "rgba(120,150,210,0)"); g.addColorStop(1, "rgba(150,180,230,0.35)"); ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON - 220, 5000, 220);
  // Charon
  circle(80, 330, 62, "#1b1424"); circle(80, 330, 58, "#9a9aa6"); circle(62, 312, 14, "#80808c"); circle(98, 350, 10, "#80808c"); ctx.fillStyle = "rgba(0,0,20,0.3)"; ctx.beginPath(); ctx.arc(96, 342, 58, 0, Math.PI * 2); ctx.fill();
  circle(950, 200, 4, "#fff8d0"); glow(950, 200, 40, "255,250,210", 0.6);   // die Sonne, winzig
}
const ICE = (() => { const r = rng(19), a = []; for (let i = 0; i < 70; i++) { const y = HORIZON + 10 + Math.pow(r(), 1.3) * 900; a.push([r() * 2600 - 1000, y, 10 + r() * 40 * (0.4 + (y - HORIZON) / 500), r()]); } return a; })();
function plutoGround() {
  ctx.fillStyle = "#9fb3cc"; ctx.beginPath(); ctx.moveTo(-2000, HORIZON + 4);
  for (let x = -2000; x <= 3000; x += 60) ctx.lineTo(x, HORIZON - 8 - 14 * Math.abs(Math.sin(x * 0.005)) - 8 * Math.sin(x * 0.017));
  ctx.lineTo(3000, HORIZON + 4); ctx.fill();
  const g = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 900); g.addColorStop(0, "#c4d3e4"); g.addColorStop(0.35, "#dbe6f1"); g.addColorStop(1, "#eef4fa");
  ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON, 5000, 2000);
  for (const [x, y, r, k] of ICE) {
    ctx.fillStyle = k < 0.35 ? "rgba(185,150,120,0.35)" : "rgba(140,170,205,0.35)"; ctx.beginPath(); ctx.ellipse(x, y, r * 1.6, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    if (k > 0.7) { ctx.strokeStyle = "rgba(120,150,190,0.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.2, y + 4); ctx.lineTo(x + r, y - 2); ctx.stroke(); }
  }
}
function iceHill(x, y, w, h) { // Eishügel (Unterkante Mitte)
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(x - w - 4, y); ctx.bezierCurveTo(x - w * 0.6, y - h * 1.05, x + w * 0.5, y - h * 1.1, x + w + 4, y); ctx.fill();
  ctx.fillStyle = "#cfdcea"; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.bezierCurveTo(x - w * 0.6, y - h, x + w * 0.5, y - h * 1.05, x + w, y); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(x - w * 0.25, y - h * 0.7, w * 0.25, h * 0.08, -0.15, 0, Math.PI * 2); ctx.fill();
}
function iceRock(x, y, r) { ctx.fillStyle = "#a9c3dc"; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.6, y - r * 0.9); ctx.lineTo(x + r * 0.2, y - r * 1.1); ctx.lineTo(x + r, y - r * 0.3); ctx.lineTo(x + r * 0.9, y); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.8); ctx.lineTo(x + r * 0.15, y - r * 1.0); ctx.lineTo(x - r * 0.1, y - r * 0.5); ctx.fill(); }

// ------------------------------------------------------------ Figuren + Zubehör
function creature(x, y, s, t, o = {}) { // das Pluto-Wesen (Füße unten). o.eyes 0..1, o.point 0..1, o.sniff, o.munch, o.sit
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const breath = 1 + 0.015 * Math.sin(t * 2.5);
  const bodyH = o.sit ? 150 : 190;
  // Füße
  if (!o.sit) for (const d of [-1, 1]) { ctx.fillStyle = "#4b3fa8"; ctx.beginPath(); ctx.ellipse(d * 70, -10, 48, 22, 0, 0, Math.PI * 2); ctx.fill(); for (let k = -1; k <= 1; k++) { ctx.fillStyle = "#f2f6ff"; ctx.beginPath(); ctx.moveTo(d * 70 + k * 18 - 6, 4); ctx.lineTo(d * 70 + k * 18, 16); ctx.lineTo(d * 70 + k * 18 + 6, 4); ctx.fill(); } }
  // Körper mit Fell
  ctx.save(); ctx.translate(0, -bodyH - 10); ctx.scale(breath, breath);
  ctx.fillStyle = o.dark ? "#141226" : "#6b5bd6"; ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, r = 1 + (i % 2 ? 0.07 : 0), rx = 165 * r, ry = bodyH * r; const px = Math.cos(a) * rx, py = Math.sin(a) * ry; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fill();
  if (o.dark) { for (const d of [-1, 1]) { ctx.fillStyle = "#141226"; ctx.beginPath(); ctx.moveTo(d * 70, -bodyH * 0.85); ctx.lineTo(d * 110, -bodyH * 1.25); ctx.lineTo(d * 105, -bodyH * 0.8); ctx.fill(); }
    const e = o.eyes ?? 1; if (e > 0) for (const d of [-1, 1]) { ctx.globalAlpha = e; glow(d * 55, -bodyH * 0.35, 90, "255,230,80", 0.6); circle(d * 55, -bodyH * 0.35, 26, "#ffe14a"); circle(d * 55, -bodyH * 0.33, 11, "#1b1424"); ctx.globalAlpha = 1; }
    ctx.restore(); ctx.restore(); return; }
  ctx.fillStyle = "#9d92ee"; ctx.beginPath(); ctx.ellipse(0, bodyH * 0.35, 100, bodyH * 0.55, 0, 0, Math.PI * 2); ctx.fill();   // Bauch
  ctx.strokeStyle = "rgba(60,45,150,0.5)"; ctx.lineWidth = 4; for (let i = 0; i < 14; i++) { const a = i * 0.9, px = Math.cos(a) * 120, py = Math.sin(a) * bodyH * 0.7; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 8, py + 16); ctx.stroke(); }
  // Hörner (Eis)
  for (const d of [-1, 1]) { ctx.fillStyle = "#cfeaff"; ctx.beginPath(); ctx.moveTo(d * 70, -bodyH * 0.85); ctx.lineTo(d * 110, -bodyH * 1.25); ctx.lineTo(d * 105, -bodyH * 0.8); ctx.fill(); }
  // Augen
  const e = o.eyes ?? 1;
  for (const d of [-1, 1]) { circle(d * 55, -bodyH * 0.35, 34, "#2a2060"); if (e > 0) { ctx.globalAlpha = e; glow(d * 55, -bodyH * 0.35, 80, "255,230,80", 0.5); circle(d * 55, -bodyH * 0.35, 30, "#ffe14a"); const lk = o.look || 0; circle(d * 55 + lk * 10, -bodyH * 0.33, 13, "#1b1424"); circle(d * 55 + lk * 10 - 5, -bodyH * 0.38, 5, "#fff"); ctx.globalAlpha = 1; } }
  // Nase (schnuppert)
  const sn = o.sniff ? Math.sin(t * 30) * 4 : 0;
  ctx.fillStyle = "#ff8fb8"; ctx.beginPath(); ctx.ellipse(0, -bodyH * 0.12 + sn * 0.3, 20 + sn, 13, 0, 0, Math.PI * 2); ctx.fill();
  // Maul
  const mo = o.munch ? 6 + Math.abs(Math.sin(t * 9)) * 22 : o.roar ? 40 : 8;
  ctx.fillStyle = "#2a1040"; ctx.beginPath(); ctx.ellipse(0, bodyH * 0.12, o.happy ? 60 : 50, mo, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 30 - 8, bodyH * 0.12 - mo + 2); ctx.lineTo(d * 30, bodyH * 0.12 - mo + 18); ctx.lineTo(d * 30 + 8, bodyH * 0.12 - mo + 2); ctx.fill(); }
  // Arme
  const pt = o.point || 0;
  for (const d of [-1, 1]) {
    ctx.save(); ctx.translate(d * 150, 0); const raise = o.roar ? -1.2 : 0;
    ctx.rotate(d === 1 ? lerp(0.5 + raise, -1.15, pt) : -0.5 - raise);
    ctx.fillStyle = "#5a4bc4"; rr(-28, -10, 56, 140 + (d === 1 ? 40 * pt : 0), 26); ctx.fill();
    const cl = 130 + (d === 1 ? 40 * pt : 0); ctx.fillStyle = "#f2f6ff";
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 14 - 6, cl); ctx.lineTo(k * 14 + (d === 1 && pt > 0.5 && k === 0 ? 0 : 0), cl + (d === 1 && k === 0 ? 30 + 30 * pt : 26)); ctx.lineTo(k * 14 + 6, cl); ctx.fill(); }
    if (o.munch && d === 1) doner(0, cl - 10, 2.2);
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}
function iphone(x, y, s, t, noSignal) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-15, -28, 30, 56, 6); ctx.fill(); ctx.fillStyle = "#cfd6e4"; rr(-13, -26, 26, 52, 5); ctx.fill();
  ctx.fillStyle = noSignal ? "#ff4040" : "#3fd3f2"; rr(-11, -22, 22, 44, 4); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 5.5px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("KEIN", 0, -2); ctx.fillText("EMPFANG", 0, 5);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-6 + i * 4, -10); ctx.lineTo(-6 + i * 4, -12 - i * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -8); ctx.stroke();
  ctx.restore();
}
function tablet(x, y, s) { // „PLUTO = ZWERGPLANET ❌“
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-62, -44, 124, 88, 10); ctx.fill(); ctx.fillStyle = "#f6f8fb"; rr(-56, -38, 112, 76, 7); ctx.fill();
  plutoPlanet(-30, -6, 16, 0);
  ctx.fillStyle = "#14223a"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = "13px Comic"; ctx.fillText("PLUTO =", -8, -18);
  ctx.fillStyle = RED; ctx.font = "11.5px Comic"; ctx.fillText("ZWERG-", -8, -2); ctx.fillText("PLANET", -8, 12);
  ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❌", 40, 24);
  ctx.restore();
}
function laserPistol(x, y, s, charge, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (charge > 0) glow(26, -6, 40 + 40 * charge, "80,200,255", 0.4 + 0.5 * charge);
  ctx.fillStyle = "#3a4256"; rr(-8, -14, 40, 16, 5); ctx.fill(); ctx.fillStyle = "#2a2f3c"; rr(-6, 0, 12, 18, 3); ctx.fill();
  ctx.fillStyle = "#59d4ff"; rr(4, -11, 20 * Math.max(0.15, charge), 10, 3); ctx.fill(); circle(34, -6, 4 + 3 * charge * (0.7 + 0.3 * Math.sin(t * 30)), "#bff2ff");
  ctx.restore();
}
function doner(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(3, -22); ctx.lineTo(-3, -22); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-8, -10, 16, 12); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-9, -2, 18, 3); ctx.restore(); }
function pizzaHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.rotate(-0.15); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-26, 8); ctx.lineTo(26, 8); ctx.lineTo(0, -36); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#f2b84b"; ctx.beginPath(); ctx.moveTo(-23, 6); ctx.lineTo(23, 6); ctx.lineTo(0, -32); ctx.fill(); ctx.fillStyle = "#c98a2a"; ctx.fillRect(-24, 2, 48, 6); for (const [px, py] of [[-8, -4], [7, -2], [0, -16]]) circle(px, py, 4, "#d93a2a"); ctx.restore(); }
function orangeCat(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 11, "#1b1424"); ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 9, "#ff9a2a"); ctx.beginPath(); ctx.moveTo(8, -16); ctx.lineTo(10, -24); ctx.lineTo(14, -17); ctx.moveTo(15, -17); ctx.lineTo(19, -24); ctx.lineTo(21, -15); ctx.fill(); ctx.strokeStyle = "#c96a1a"; ctx.lineWidth = 2; for (const d of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(d, -9); ctx.lineTo(d + 2, -3); ctx.stroke(); } circle(11, -11, 1.6, "#111"); circle(17, -11, 1.6, "#111"); ctx.restore(); }
function glassesRolex(x, hy, y, s) { ctx.save(); ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5 * s; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * 7 * s, hy + 2 * s, 5.5 * s, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - 1.5 * s, hy + 2 * s); ctx.lineTo(x + 1.5 * s, hy + 2 * s); ctx.stroke(); ctx.fillStyle = "#e0b43a"; circle(x - 27 * s, y - 45 * s, 5 * s, "#e0b43a"); circle(x - 27 * s, y - 45 * s, 3 * s, "#2a6a4a"); ctx.restore(); }
function motorbike(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const wx of [-34, 34]) { circle(wx, -14, 16, "#1b1424"); circle(wx, -14, 7, "#9aa3ab"); } ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(-10, -36); ctx.lineTo(20, -36); ctx.lineTo(36, -18); ctx.lineTo(0, -16); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-8, -33); ctx.lineTo(18, -33); ctx.lineTo(30, -20); ctx.fill(); ctx.strokeStyle = "#555"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(22, -34); ctx.lineTo(30, -50); ctx.lineTo(40, -50); ctx.stroke(); ctx.restore(); }
function sash(x, y, s) { ctx.save(); ctx.translate(x, y - 58 * s); ctx.rotate(-0.55); ctx.scale(s, s); ctx.fillStyle = "#e5262b"; ctx.fillRect(-30, -6, 60, 12); ctx.fillStyle = "#ffd23a"; ctx.font = "6.5px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("PRÄSIDENT", 0, 1); ctx.restore(); }
function chefHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-17, -6, 34, 12, 3); ctx.fill(); circle(-10, -14, 11, "#1b1424"); circle(10, -14, 11, "#1b1424"); circle(0, -20, 12, "#1b1424"); ctx.fillStyle = "#fff"; rr(-15, -4, 30, 9, 3); ctx.fill(); circle(-10, -14, 9, "#fff"); circle(10, -14, 9, "#fff"); circle(0, -20, 10, "#fff"); ctx.restore(); }
function hut(x, y, s, t) { // Dönerhütte im Eis
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#eef5fb"; ctx.beginPath(); ctx.ellipse(0, 0, 130, 120, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = "#b9cde0"; ctx.lineWidth = 3; for (const k of [0.33, 0.66]) { ctx.beginPath(); ctx.ellipse(0, 0, 130, 120 * k, 0, Math.PI, 0); ctx.stroke(); }
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 35, -10 - (3 - Math.abs(i)) * 12); ctx.lineTo(i * 35, -40 - (3 - Math.abs(i)) * 14); ctx.stroke(); }
  ctx.fillStyle = "#2c3440"; ctx.beginPath(); ctx.ellipse(0, 0, 44, 62, 0, Math.PI, 0); ctx.fill();
  glow(0, -30, 70, "255,190,80", 0.5); ctx.fillStyle = "#ffcf7a"; ctx.beginPath(); ctx.ellipse(0, 0, 36, 54, 0, Math.PI, 0); ctx.fill();
  donerSpit5(0, -20, 0.55);
  // Schild
  ctx.fillStyle = "#3a2a1a"; rr(-112, -168, 224, 46, 8); ctx.fill(); ctx.fillStyle = "#ffd23a"; rr(-108, -164, 216, 38, 6); ctx.fill();
  ctx.fillStyle = "#14223a"; ctx.font = "19px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🥙 DÖNER · CHEF: TIM", 0, -144);
  ctx.restore();
}
function donerSpit5(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#777"; ctx.fillRect(-2, -60, 4, 110); ctx.fillStyle = "#b5652d"; ctx.beginPath(); ctx.moveTo(-23, -41); ctx.lineTo(23, -41); ctx.lineTo(16, 37); ctx.lineTo(-16, 37); ctx.fill(); ctx.strokeStyle = "#7a3a16"; ctx.lineWidth = 3; for (let i = -30; i < 36; i += 12) { ctx.beginPath(); ctx.moveTo(-20, i); ctx.lineTo(20, i + 4); ctx.stroke(); } ctx.restore(); }
function smallSign(x, y, txt, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#6b6f78"; ctx.fillRect(-2, -60, 4, 60); ctx.fillStyle = "#3a2a1a"; rr(-62, -84, 124, 28, 5); ctx.fill(); ctx.fillStyle = "#f6ecd4"; rr(-59, -81, 118, 22, 4); ctx.fill(); ctx.fillStyle = "#2a2a2a"; ctx.font = "900 10px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, -69); ctx.restore(); }
function flag2(x, y, k, t) { // „ROTANIEN 2.0“, k = gehisst 0..1
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -300, 6, 300); circle(0, -304, 9, "#ffd23a");
  const fy = lerp(-90, -290, easeOut(k)), wv = Math.sin(t * 5) * 6;
  ctx.fillStyle = "#4a2b9a"; ctx.beginPath(); ctx.moveTo(3, fy); ctx.bezierCurveTo(60, fy + wv, 110, fy - wv, 160, fy); ctx.lineTo(160, fy + 90); ctx.bezierCurveTo(110, fy + 90 - wv, 60, fy + 90 + wv, 3, fy + 90); ctx.fill();
  circle(40, fy + 45, 22, "#e2552e"); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(40, fy + 45, 34, 9, -0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "17px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ROTANIEN", 112, fy + 34); ctx.fillStyle = "#ffd23a"; ctx.font = "26px Comic"; ctx.fillText("2.0", 112, fy + 60);
  ctx.restore();
}
function lightDrive(x, y, s, t, hot) { // OGnanis Lichtantrieb auf Rädern
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const c = hot ? (Math.sin(t * 20) > 0 ? "255,60,60" : "120,20,20") : "120,230,255";
  for (const wx of [-60, 60]) { circle(wx, -18, 20, "#1b1424"); circle(wx, -18, 9, "#9aa3ab"); }
  ctx.fillStyle = "#5a6478"; rr(-90, -60, 180, 40, 8); ctx.fill(); ctx.fillStyle = "#3a4256"; rr(-90, -30, 180, 10, 4); ctx.fill();
  glow(0, -120, 120, c, hot ? 0.8 : 0.6 + 0.2 * Math.sin(t * 6));
  ctx.fillStyle = `rgb(${c})`; circle(0, -120, 42, `rgb(${c})`); circle(0, -120, 22, "#fff");
  ctx.strokeStyle = "#c9ced4"; ctx.lineWidth = 6; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 60, -60); ctx.quadraticCurveTo(d * 75, -125, d * 30, -175); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -120, 58, 16, t * (hot ? 4 : 1.5), 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#ffd23a"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("OG-DRIVE", 0, -40);
  ctx.restore();
}

// ------------------------------------------------------------ Welt-Aufbau
const CRASH = { x: 300, y: 705, s: 1.45, rot: 0.32 };
// Gruppe (Füße), Reihenfolge = Ausstieg aus der Luke
const CREW = [
  { id: "ognani", x: 110, y: 772, acc: "#3fd3f2" }, { id: "noam", x: 190, y: 784, acc: "#ff79c6" }, { id: "phillip", x: 262, y: 806, acc: "#ffb43a" },
  { id: "delon", x: 345, y: 792, acc: "#ff4b6e" }, { id: "tick", x: 418, y: 806, acc: "#ffd23a" }, { id: "tim", x: 486, y: 784, acc: "#7bf27a" }, { id: "elias", x: 558, y: 772, acc: "#b06bff" },
];
const NAMES = { ognani: "OGnani", noam: "Noam", delon: "DELON", tim: "Tim" };
const HIDE = { x: 228, y: 712 };    // hinter der Rakete
function crewPos(c, i, t) {
  const hx = CRASH.x - 20, hy = CRASH.y - 10;
  const out = ramp(t, T.hatch + 0.1 + i * 0.1, T.hatch + 0.6 + i * 0.1);
  let x = lerp(hx, c.x, easeOut(out)), y = lerp(hy, c.y, easeOut(out));
  if (t < T.hatch) return null;
  const hideT = T.rehook + 0.25 + i * 0.05;
  const stays = c.id === "delon";
  const timBack = c.id === "tim" && t >= T.twist + 0.3;
  if (t >= hideT && !stays && !(t >= T.hut)) { const k = easeIO(ramp(t, hideT, hideT + 0.45)); const bk = timBack ? easeIO(ramp(t, T.twist + 0.3, T.twist + 0.8)) : 0;
    x = lerp(lerp(c.x, HIDE.x + (i - 3) * 14, k), 470, bk); y = lerp(lerp(c.y, HIDE.y, k), 780, bk); }
  if (t >= T.hut) { x = c.x; y = c.y; if (c.id === "tim") { x = -150; y = 792; } }
  return [x, y];
}
function drawCrewMember(c, i, t) {
  const p = crewPos(c, i, t); if (!p) return;
  let [x, y] = p; const cold = t < T.horizon + 0.5 ? 1 : 0.3;
  x += Math.sin(t * 55 + i) * 1.4 * cold;
  const o = { t: t + i * 0.7, acc: c.acc };
  let f = t < T.horizon ? (i % 2 ? "shock" : "talk") : t < T.rehook ? "shock" : t < T.doner + 0.4 ? "shock" : "happy";
  const hidden = t >= T.rehook + 0.4 && t < T.hut && c.id !== "delon" && !(c.id === "tim" && t >= T.twist + 0.3);
  if (hidden) f = "shock";
  if (t >= T.og && t < T.decide) { f = "shock"; o.armL = 0.25; o.armR = -0.25; }
  const sc = hidden ? 0.75 : 0.85;
  if (t >= T.hatch && t < T.rehook && !hidden) BREATH.push([x, y - 110 * sc, i]);
  if (c.id === "noam" && t >= T.noam && t < T.rehook) o.armR = -2.6;
  if (c.id === "delon" && t >= T.delon && t < T.doner + 0.3) o.armR = -1.4;
  if (c.id === "tim" && (t >= T.twist + 0.3)) o.armR = -2.5;
  if (c.id === "phillip") o.armL = -0.9, o.armR = 0.9;
  astronaut(x, y, sc, f, o);
  const hy = y - 104 * sc;
  if (c.id === "elias") pizzaHat(x, hy, sc);
  if (c.id === "phillip") orangeCat(x - 2, y - 52 * sc, sc * 0.9, t);
  if (c.id === "tick") glassesRolex(x, hy, y, sc);
  if (c.id === "noam") iphone(x + 30 * sc, y - (t >= T.noam && t < T.rehook ? 150 : 50) * sc, sc * (t >= T.noam && t < T.rehook ? 1.1 : 0.7), t, true);
  if (c.id === "ognani") tablet(x + 30 * sc, y - 60 * sc, 0.45 * sc);
  if (c.id === "delon") { const ch = t >= T.delon ? ramp(t, T.delon + 0.2, T.twist - 0.2) : 0; const low = t >= T.doner ? easeOut(ramp(t, T.doner, T.doner + 0.4)) : 0;
    laserPistol(x + 26 * sc, y - lerp(118, 60, low) * sc, sc * 1.1, ch * (1 - low), t); }
  if (c.id === "tim") { doner(x + 26 * sc, y - (t >= T.twist + 0.3 && t < T.hut ? 150 : 50) * sc, sc * 1.2); if (t >= T.hut) chefHat(x, hy, sc); }
}
const KEANU = { x: -560, y: 652 };
const SNOW = (() => { const r = rng(71), a = []; for (let i = 0; i < 90; i++) a.push([r() * 700 - 60, r() * 500, 1.5 + r() * 3.5, r() * 6]); return a; })();
function creaturePos(t) {
  if (t < T.horizon) return null;
  if (t < T.rehook) return { x: 720, y: 1000, eyes: ramp(t, T.eyes, T.eyes + 0.15), s: 1.15, shadow: true };
  if (t < T.twist) return { x: 700, y: lerp(1000, 640, easeOut(ramp(t, T.rehook, T.rehook + 0.7))), s: 1.15, roar: t < T.rehook + 1.2 };
  if (t < T.hut) return { x: lerp(700, 640, easeIO(ramp(t, T.twist, T.twist + 0.5))), y: lerp(640, 720, easeIO(ramp(t, T.twist, T.twist + 0.5))), s: 1.1, sniff: t >= T.sniff - 0.3 && t < T.doner, point: easeOut(ramp(t, T.doner, T.doner + 0.35)), look: -1 };
  return { x: 15, y: 790, s: 0.5, sit: true, munch: true, happy: true };
}

const CAM = [
  [T.impact, 300, 640, 1.25], [T.vote, 300, 650, 1.35], [T.tablet - 0.01, 300, 650, 1.38],
  [T.hatch, 320, 660, 1.3], [T.noam - 0.12, 320, 660, 1.34], [T.noam + 0.08, 200, 700, 2.1], [T.horizon - 0.12, 200, 700, 2.15],
  [T.horizon + 0.1, 680, 560, 0.95], [T.rehook - 0.12, 690, 560, 1.25], [T.rehook + 0.06, 470, 560, 0.72], [T.delon - 0.12, 460, 560, 0.75],
  [T.delon + 0.08, 345, 700, 2.0], [T.twist - 0.12, 345, 700, 2.15], [T.twist + 0.08, 520, 590, 0.82], [T.doner - 0.12, 520, 590, 0.86],
  [T.doner + 0.15, 480, 640, 1.15], [T.hut - 0.12, 480, 640, 1.2], [T.hut + 0.08, -185, 655, 1.18], [T.cta - 0.12, -180, 655, 1.22],
  [T.cta + 0.6, 120, 560, 0.55], [T.og - 0.12, 140, 560, 0.52], [T.og + 0.08, 400, 670, 1.25], [T.decide, 400, 670, 1.3],
  [T.loop, 480, 660, 2.0], [DUR, 480, 650, 2.4],
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
const MASS6 = (() => { const r = rng(88), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]; for (let i = 0; i < 260; i++) { const y = 610 + Math.pow(r(), 1.3) * 90, x = -700 + r() * 1700; if (y > 650 && x > -360 && x < 640) continue; a.push({ x, y, s: 0.22 + (y - 600) / 110 * 0.32, acc: keys[i % 7], ph: r() * 6 }); } return a.sort((p, q) => p.y - q.y); })();

const BREATH = [];
function drawWorld(t, z) {
  BREATH.length = 0;
  plutoSky(t); plutoGround();
  const cr = creaturePos(t);
  // Wesen hinter dem Hügel
  if (cr && t < T.twist) { ctx.save(); ctx.beginPath(); ctx.rect(-3000, -3000, 7000, 3642); ctx.clip(); if (cr.shadow) { creature(cr.x, lerp(880, 790, ramp(t, T.horizon, T.rehook)), 1.15, t, { eyes: cr.eyes, dark: true }); } else creature(cr.x, cr.y, cr.s, t, { roar: cr.roar }); ctx.restore(); }
  iceHill(720, 640, 260, 150); iceHill(-520, 630, 220, 110);
  for (const [x, y, r] of [[560, 700, 26], [-150, 690, 20], [40, 720, 16], [820, 720, 30]]) iceRock(x, y, r);
  if (t >= T.cta) for (const m of MASS6) { const sp = SPR[m.acc]; if (!sp) continue; const w = 88 * m.s, h = 158 * m.s; ctx.drawImage(sp, m.x - w / 2, m.y - h - Math.abs(Math.sin(t * 6 + m.ph)) * 4, w, h); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  // keanu: riesiger blauer Astronaut im Hintergrund
  if (t >= T.hatch) astronaut(KEANU.x, KEANU.y, 1.6, t < T.rehook ? "shock" : t < T.hut ? "shock" : "happy", { t, acc: "#1f4fd6", suit: "#4a7bff", suit2: "#5f8cff", suit3: "#3a62d0" });
  hut(-250, 712, 1, t); smallSign(-95, 742, "🍎 APPLE STORE (BALD)", 0.8);
  if (t >= T.cta) flag2(70, 705, ramp(t, T.cta + 0.2, T.follow), t);
  // versteckte Crew hinter der Rakete
  for (const [i, c] of CREW.entries()) { const p = crewPos(c, i, t); if (p && t >= T.rehook + 0.4 && t < T.hut && c.id !== "delon" && !(c.id === "tim" && t >= T.twist + 0.3)) drawCrewMember(c, i, t); }
  // abgestürzte Rakete
  ctx.save(); ctx.translate(CRASH.x, CRASH.y); ctx.rotate(CRASH.rot); rocket(0, 0, CRASH.s, 0);
  ctx.fillStyle = "#ffcf1a"; rr(-26, -175, 26, 10, 3); ctx.fill(); ctx.fillStyle = "#1b1424"; ctx.font = "7px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("LAMBO", -13, -170);   // Lolel
  const open = ramp(t, T.hatch, T.hatch + 0.25);
  ctx.fillStyle = "#2a2230"; rr(-18, -78, 36, 64, 6); ctx.fill(); if (open < 1) { ctx.fillStyle = "#e9edf0"; rr(-18, -78, 36, 64 * (1 - open), 6); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = "#e6eef6"; ctx.beginPath(); ctx.ellipse(CRASH.x - 10, CRASH.y + 4, 120, 22, 0, 0, Math.PI); ctx.fill();   // Eiswall
  motorbike(150, 748, 0.9);                                                                    // Taylor_
  // Wesen vor dem Hügel (Wendung) / sitzend vor der Hütte
  if (cr && t >= T.twist) creature(cr.x, cr.y, cr.s, t, cr);
  // Janic, der Präsident (an der Hütte)
  if (t >= T.hut) { astronaut(-385, 775, 0.85, "happy", { t, acc: "#ffd23a", armR: -2.4 }); sash(-385, 775, 0.85); doner(-355, 775 - 118 * 0.85, 1); }
  // Crew vorne
  for (const [i, c] of CREW.entries()) { if (t >= T.rehook + 0.4 && t < T.hut && c.id !== "delon" && !(c.id === "tim" && t >= T.twist + 0.3)) continue; drawCrewMember(c, i, t); }
  // Lichtantrieb + OGnani schiebt
  if (t >= T.og) { const k = easeOut(ramp(t, T.og, T.og + 1.0)); const mx = lerp(860, 470, k); lightDrive(mx, 790, 1 + (t >= T.weiter && t < T.decide ? 0.06 * Math.max(0, Math.sin((t - T.weiter) * 9)) : 0), t, t >= T.loop); astronaut(mx + 115, 792, 0.85, "happy", { t, acc: "#3fd3f2", armL: 1.6, armR: 1.4 }); tablet(mx + 145, 735, 0.35); }
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  for (const [bx, by, ph] of BREATH) breath(bx, by, t, ph * 0.37);
  shock(CRASH.x, CRASH.y, t, T.impact, 320); iceShards(CRASH.x, CRASH.y - 30, t, T.impact);
  if (t >= T.impact) { ctx.save(); ctx.strokeStyle = "rgba(90,130,175,0.7)"; ctx.lineWidth = 3; const r = rng(4); for (let i = 0; i < 7; i++) { const k = easeOut(ramp(t, T.impact, T.impact + 0.3)); let a = Math.PI * (0.05 + 0.9 * r()), px = CRASH.x, py = CRASH.y + 8; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { a += (r() - 0.5) * 0.6; px += Math.cos(a) * 40 * k; py += Math.sin(a) * 8 * k + 4; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
  if (t >= T.rehook && t < T.rehook + 1.5) for (let i = 0; i < 8; i++) { const k = ramp(t, T.rehook + 0.3 + i * 0.05, T.rehook + 1.4); if (k <= 0 || k >= 1) continue; ctx.globalAlpha = 0.7 * (1 - k); circle(560 + i * 45, 520 - k * 60 + (i % 2) * 20, 18 + 40 * k, "#eef5fb"); ctx.globalAlpha = 1; }
  if (t >= T.rehook + 0.4 && t < T.delon) for (const [i, c] of CREW.entries()) { if (c.id === "delon") continue; exclaim(HIDE.x + (i - 3) * 14, HIDE.y - 120, pop(t, T.rehook + 0.45 + i * 0.04, T.delon - 0.1, 0.2)); }
  if (cr && t >= T.sniff - 0.3 && t < T.doner) { ctx.save(); ctx.translate(cr.x - 190, cr.y - 470); const s2 = pop(t, T.sniff - 0.2, T.doner - 0.05); ctx.scale(s2, s2); outlined("?", 0, 0, 70, "#fff", "#0e1a30", 10); ctx.restore(); }
  if (cr && t >= T.hut && t < T.decide) hearts(cr.x - 50, cr.y - 150, t);
  if (t >= T.og && t < T.decide) { const k = easeOut(ramp(t, T.og, T.og + 1.0)); arcs(lerp(860, 470, k), 670, 70, t); }
  if (t >= T.loop) { arcs(470, 670, 90, t, "255,120,90"); for (let i = 0; i < 4; i++) sparks(470, 640, t, T.loop + i * 0.2, 12, i % 2 ? "#ffd23a" : "#ff6a3d"); for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); ctx.globalAlpha = 0.5 * (1 - k); circle(470 + Math.sin(t + i) * 15, 600 - k * 160, 15 + 30 * k, "#3a3f4e"); ctx.globalAlpha = 1; } }
  if (t >= T.cta) for (let i = 0; i < 10; i++) { const t0 = T.cta + 0.2 + (T.follow - T.cta - 0.2) * i / 9, d = t - t0; if (d < 0 || d > 0.8) continue; const r = rng(i + 3); ctx.save(); ctx.globalAlpha = 1 - d / 0.8; ctx.translate(-500 + r() * 1400, 560 - d * 60); outlined("+1", 0, 0, 34, "#7bf27a", "#0e1a30", 7); ctx.restore(); }
  // Aufprall: Eisstaub
  if (t >= T.impact && t < T.hatch) { const d = t - T.impact; glow(CRASH.x, CRASH.y - 40, 260 * Math.min(1, d * 4), "230,240,255", 0.7 * (1 - clamp(d / 1.2)));
    for (const [x0, y0, r, p] of SNOW) { ctx.globalAlpha = 0.8 * (1 - clamp((d - 1.5) / 1)); circle(x0 + Math.sin(t + p) * 10, 380 + y0 * 0.6 + d * 40 - 200 * Math.exp(-d * 3), r, "#f4f9ff"); } ctx.globalAlpha = 1; }
  if (t >= T.impact && t < T.hatch) for (let i = 0; i < 3; i++) { const k = ((t * 0.4 + i / 3) % 1); ctx.globalAlpha = 0.4 * (1 - k); circle(CRASH.x + 60 + Math.sin(t + i) * 20, CRASH.y - 220 - k * 200, 20 + 40 * k, "#556070"); ctx.globalAlpha = 1; }
  // Ladestrahl um Delons Pistole
  if (t >= T.hut) { for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1); ctx.globalAlpha = 0.35 * (1 - k); circle(-250 + Math.sin(t + i) * 10, 560 - k * 140, 12 + 22 * k, "#cfd6dc"); ctx.globalAlpha = 1; } }
}

// ------------------------------------------------------------ Cockpit (Frame 1) + Absturz + Kabine + Entscheidung
function drawCockpit(t) {
  ctx.fillStyle = "#05060c"; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) circle(((x + 900 - t * 300) % 1300 + 1300) % 1300 - 300, (y + 700) * 0.95, r, "#fff");
  const k = Math.pow(ramp(t, 0, T.fall + 0.2), 1.6); plutoPlanet(288 + 30 * k, 420 + 40 * k, 60 + 360 * k, t);
  // Alien-Schiff aus Tag 5 dreht im Seitenfenster ab
  // Cockpit-Rahmen
  ctx.fillStyle = "#2b2f3c"; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(60, 600); ctx.quadraticCurveTo(40, 250, 140, 150); ctx.lineTo(436, 150); ctx.quadraticCurveTo(536, 250, 516, 600); ctx.closePath(); ctx.fill("evenodd");
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(60, 600); ctx.quadraticCurveTo(40, 250, 140, 150); ctx.lineTo(436, 150); ctx.quadraticCurveTo(536, 250, 516, 600); ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = "#3d4354"; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(288, 150); ctx.lineTo(288, 600); ctx.stroke();
  // Seitenfenster mit Ufo
  circle(36, 330, 34, "#1b1424"); circle(36, 330, 28, "#0b0d18"); ctx.save(); ctx.beginPath(); ctx.arc(36, 330, 28, 0, Math.PI * 2); ctx.clip(); const u = ramp(t, 0, 1.2); ufo(36 - 40 * u, 330 - 20 * u, 0.6 * (1 - 0.6 * u), t, 2); ctx.restore();
  // Armaturenbrett
  ctx.fillStyle = "#3a3f4e"; ctx.beginPath(); ctx.moveTo(0, 620); ctx.quadraticCurveTo(288, 560, 576, 620); ctx.lineTo(576, 1024); ctx.lineTo(0, 1024); ctx.fill();
  for (let i = 0; i < 8; i++) { const on = (Math.floor(t * 8) + i) % 3 === 0; circle(60 + i * 32, 660, 7, on ? "#ff3b3b" : "#5a2020"); }
  // Tankanzeige
  const fuel = t < 0.12 ? 1 : 0;
  ctx.fillStyle = "#14161e"; rr(330, 690, 170, 70, 10); ctx.fill(); ctx.fillStyle = fuel ? "#ffb43a" : (Math.sin(t * 16) > 0 ? "#ff4040" : "#7a1a1a"); ctx.font = "34px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("⛽ " + fuel + " %", 415, 727);
  // Piloten von hinten
  for (const [px, s] of [[150, 1.25], [430, 1.1]]) { circle(px, 960, 92 * s, "#1b1424"); circle(px, 960, 88 * s, "#e7eaee"); circle(px - 25 * s, 930, 18 * s, "rgba(255,255,255,0.6)"); ctx.strokeStyle = "#c9ced4"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px + 30 * s, 880); ctx.lineTo(px + 40 * s, 840); ctx.stroke(); circle(px + 40 * s, 838, 6, "#ff4b3a"); }
  // rotes Alarmlicht
  const p = 0.5 + 0.5 * Math.sin(t * 14); ctx.fillStyle = `rgba(255,20,20,${0.08 + 0.14 * p})`; ctx.fillRect(0, 0, W, H);
}
const SPARKS = (() => { const r = rng(13), a = []; for (let i = 0; i < 40; i++) a.push([r() - 0.5, r() - 0.5, r()]); return a; })();
function drawFall(t) {
  ctx.fillStyle = "#05060c"; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) circle(((x + 900 + t * 200) % 1300 + 1300) % 1300 - 300, (y + 700) * 0.95 - t * 80, r, "#fff");
  const k = ramp(t, T.fall, T.impact);
  plutoPlanet(330, 1000 - 120 * k, 420 + 220 * k, t);
  const rx = lerp(120, 300, k), ry = lerp(260, 640, easeIO(k)), sc = lerp(0.7, 1.05, k);
  // Feuerschweif
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(2.45);
  for (const [c, w, l] of [["rgba(255,80,30,0.8)", 40, 320], ["rgba(255,170,40,0.9)", 26, 230], ["rgba(255,240,180,0.95)", 12, 140]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w * sc, -150 * sc); ctx.quadraticCurveTo(0, -(150 + l + 30 * Math.sin(t * 40)) * sc, w * sc, -150 * sc); ctx.fill(); }
  ctx.rotate(Math.PI); rocket(0, 90 * sc, sc, 0); ctx.restore();
  for (const [dx, dy, ph] of SPARKS) { const d = ((t * 1.5 + ph) % 1); const sx = rx + dx * 500 * d, sy = ry + dy * 500 * d - 60 * d; circle(sx, sy, 1 + 7 * d, d < 0.5 ? "#ffd23a" : "#ff8a1e"); }
  ctx.fillStyle = "rgba(255,40,20,0.12)"; ctx.fillRect(0, 0, W, H);
}
function drawCabin(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#3a3550"); g.addColorStop(1, "#5c566e"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const px of [90, 300, 510]) { circle(px, 240, 62, "#2b2740"); circle(px, 240, 52, "#c8d6e6"); ctx.save(); ctx.beginPath(); ctx.arc(px, 240, 52, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "#05060c"; ctx.fillRect(px - 60, 180, 120, 120); for (let j = 0; j < 5; j++) circle(px - 35 + j * 17, 205 + (j * 13) % 25, 1.5, "#fff"); ctx.fillStyle = "#b9cde0"; ctx.beginPath(); ctx.moveTo(px - 60, 262); ctx.quadraticCurveTo(px - 10, 238, px + 60, 258); ctx.lineTo(px + 60, 300); ctx.lineTo(px - 60, 300); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = "#4a4560"; ctx.fillRect(0, 700, W, 400);
  const p = 0.5 + 0.5 * Math.sin(t * 10); circle(288, 140, 16, p > 0.5 ? "#ff3b3b" : "#7a1a1a");
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  const look = t >= T.tablet + 0.5;
  astronaut(95, 780, 2.0, look ? "shock" : "think", { t, acc: "#ff79c6" });
  astronaut(480, 780, 2.0, look ? "smirk" : "think", { t: t + 1, acc: "#7bf27a" });
  const up = easeOut(ramp(t, T.tablet, T.tablet + 0.3));
  astronaut(288, 820, 2.3, "talk", { t, acc: "#3fd3f2", armL: lerp(0.25, 2.2, up), armR: lerp(-0.25, -2.2, up) });
  ctx = MAIN; compositeOutline(6);
  tablet(288, lerp(700, 470, up), 1.75);
  const [nx, ny] = [288, 300]; pill("OGnani", nx, ny + 12, pop(t, T.tablet + 0.35, T.hatch - 0.1), "#fff", "#14223a");
}
function pollCard(t, s) { // TikTok-Umfrage zum Abstimmen (noch ohne Ergebnis)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 545); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1e1e22"; rr(-210, -100, 420, 200, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-172, -64, 20, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -192, -84, 40, 40); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "800 15px InterX"; ctx.fillText("Gedacht ·", -140, -76); ctx.fillStyle = "#5aa7e6"; ctx.fillText("Creator*in", -64, -76);
  ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("Bleiben oder weiterfliegen? 🪐", -140, -50);
  for (const [i, txt] of ["🥙 Auf Pluto bleiben", "🚀 Besseren Planeten suchen"].entries()) {
    const y = -22 + i * 50; ctx.fillStyle = "#2a2a30"; rr(-188, y, 376, 42, 12); ctx.fill(); ctx.strokeStyle = "#45454d"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "800 17px InterX, 'Noto Color Emoji'"; ctx.fillText(txt, -172, y + 22);
  }
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("🗳 Umfrage · Die Mehrheit entscheidet Tag 7", -188, 86);
  // tippender Finger
  const k = (t - T.vote2) % 1.2, fy = k < 0.25 ? -k * 20 : 0; ctx.font = "34px 'Noto Color Emoji'"; ctx.fillText("👆", 120 + Math.sin(t * 3) * 4, 48 + fy + 14 * Math.max(0, Math.sin(t * 5)));
  ctx.restore();
}
function drawSplit(t) {
  const beat = 1 + 0.03 * Math.max(0, Math.sin(t * 2 * Math.PI * 1.1)) ** 8;
  // links: Pluto bleiben
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 288, H); ctx.clip();
  ctx.fillStyle = "#05060c"; ctx.fillRect(0, 0, 288, H); for (const [x, y, r] of STARS) circle(((x + 900) % 600), (y + 700) * 0.95, r, "#fff");
  plutoPlanet(70, 420, 60, t);
  const g = ctx.createLinearGradient(0, 600, 0, H); g.addColorStop(0, "#c4d3e4"); g.addColorStop(1, "#eef4fa"); ctx.fillStyle = g; ctx.fillRect(0, 600, 288, H);
  ctx.save(); ctx.translate(120, 860); ctx.scale(0.8 * beat, 0.8 * beat); hut(0, 0, 1, t); ctx.restore();
  creature(232, 880, 0.42, t, { sit: true, munch: true, happy: true });
  ctx.restore();
  // rechts: Kepler-452b
  ctx.save(); ctx.beginPath(); ctx.rect(288, 0, 288, H); ctx.clip();
  ctx.fillStyle = "#070a14"; ctx.fillRect(288, 0, 288, H); for (const [x, y, r, p] of STARS) circle(288 + ((x + 900 + t * 30) % 600), (y + 700) * 0.95, r, "#fff");
  const R = 150 * beat; glow(430, 680, R * 1.5, "120,255,150", 0.35); circle(430, 680, R + 4, "#1b1424"); circle(430, 680, R, "#3fbf5a");
  ctx.save(); ctx.beginPath(); ctx.arc(430, 680, R, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "#2e86de"; for (const [dx, dy, rx, ry] of [[-60, -40, 50, 30], [50, 50, 60, 35], [-20, 90, 40, 20]]) { ctx.beginPath(); ctx.ellipse(430 + dx, 680 + dy, rx, ry, 0.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.ellipse(410, 590, 60, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(0,0,30,0.3)"; ctx.beginPath(); ctx.arc(470, 720, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(370 + Math.sin(t * 2) * 6, 600); ctx.rotate(0.6); rocket(0, 0, 0.42, 1.2); ctx.restore();
  ctx.restore();
  if (t >= T.stay && t < T.vote2) { ctx.fillStyle = "rgba(0,0,0,0.45)"; if (t < T.go) ctx.fillRect(288, 0, 288, H); else ctx.fillRect(0, 0, 288, H); }
  if (t >= T.vote2) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, 0, W, H); }
  // Trennlinie (Blitz)
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(288, 0); for (let y = 0; y <= H; y += 60) ctx.lineTo(288 + (y / 60 % 2 ? 10 : -10), y); ctx.stroke();
  // Badges (innerhalb der sicheren Zone)
  const a = pop(t, T.decide + 0.15, T.vote2 - 0.05);
  for (const [i, [x, l1, l2, col]] of [[140, "🥙 BLEIBEN", "AUF PLUTO", "#ffd23a"], [398, "🚀 WEITER", "BESSERER PLANET", "#3fd3f2"]].entries()) {
    if (a <= 0) continue; const hi = i === 0 ? (t >= T.stay && t < T.go ? 1 : 0) : (t >= T.go ? 1 : 0);
    ctx.save(); ctx.translate(x, 470); const sc = a * beat * (1 + 0.18 * hi); ctx.scale(sc, sc); ctx.globalAlpha = (t >= T.stay && !hi) ? 0.55 : 1;
    ctx.fillStyle = "#14223a"; rr(-82, -34, 164, 68, 14); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = col; ctx.font = "24px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(l1, 0, -10); ctx.fillStyle = "#fff"; ctx.font = "13px Comic"; ctx.fillText(l2, 0, 18);
    ctx.restore();
  }
}

// ------------------------------------------------------------ Zusatz-Effekte
const FLAKES = (() => { const r = rng(33), a = []; for (let i = 0; i < 70; i++) a.push([r() * W, r() * H, 1 + r() * 2.4, 20 + r() * 40, r() * 6]); return a; })();
function snowfall(t, a = 1) { ctx.save(); for (const [x0, y0, rad, sp, p] of FLAKES) { const y = (y0 + t * sp) % H, x = (x0 + Math.sin(t * 0.8 + p) * 18 + W) % W; ctx.globalAlpha = a * (0.45 + 0.3 * Math.sin(t * 2 + p)); circle(x, y, rad, "#f4f9ff"); } ctx.restore(); }
function breath(x, y, t, ph) { for (let i = 0; i < 2; i++) { const k = ((t * 0.9 + ph + i * 0.5) % 1); ctx.globalAlpha = 0.45 * (1 - k); circle(x + 10 + k * 22, y - k * 26, 5 + 12 * k, "#ffffff"); } ctx.globalAlpha = 1; }
function hearts(x, y, t) { ctx.save(); ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; for (let i = 0; i < 3; i++) { const k = ((t * 0.7 + i / 3) % 1); ctx.globalAlpha = 1 - k; ctx.fillText("❤️", x + Math.sin(t * 3 + i * 2) * 14, y - k * 70); } ctx.restore(); }
function arcs(x, y, r, t, col = "160,240,255") { ctx.save(); const rr_ = rng(Math.floor(t * 24)); ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) { let a = rr_() * Math.PI * 2, px = x + Math.cos(a) * r * 0.4, py = y + Math.sin(a) * r * 0.4; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { a += (rr_() - 0.5) * 1.4; px += Math.cos(a) * r * 0.3; py += Math.sin(a) * r * 0.3; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
function sparks(x, y, t, t0, n = 14, col = "#ffd23a") { const d = t - t0; if (d < 0 || d > 0.8) return; const r = rng(Math.round(t0 * 100)); for (let i = 0; i < n; i++) { const a = -Math.PI * r(), v = 80 + r() * 160; circle(x + Math.cos(a) * v * d, y + Math.sin(a) * v * d + 160 * d * d, 2.5 * (1 - d), col); } }
function shock(x, y, t, t0, R = 260) { const d = t - t0; if (d < 0 || d > 0.6) return; ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - d / 0.6)})`; ctx.lineWidth = 10 * (1 - d / 0.6); ctx.beginPath(); ctx.ellipse(x, y, R * easeOut(d / 0.6), R * 0.3 * easeOut(d / 0.6), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
const SHARDS6 = (() => { const r = rng(8), a = []; for (let i = 0; i < 26; i++) a.push([(r() - 0.5) * 2, -r(), 6 + r() * 10, r() * 6]); return a; })();
function iceShards(x, y, t, t0) { const d = t - t0; if (d < 0 || d > 1.2) return; for (const [vx, vy, s, rot] of SHARDS6) { ctx.save(); ctx.translate(x + vx * 300 * d, y + vy * 420 * d + 380 * d * d); ctx.rotate(rot + d * 8); ctx.globalAlpha = 1 - d / 1.2; ctx.fillStyle = "#e6f6ff"; ctx.strokeStyle = "#7fb0dc"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-s, s * 0.5); ctx.lineTo(0, -s); ctx.lineTo(s, s * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
function exclaim(x, y, s) { if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); outlined("!", 0, 0, 52, RED, "#0e1a30", 9); ctx.restore(); }
// ------------------------------------------------------------ Effekte
const IMPACTS = [0, T.impact, T.rehook + 0.7, T.og + 1.0];
function shakeAt(t) {
  let dx = 0, dy = 0;
  if (t < T.impact) { const a = t < T.fall ? 6 : 4; dx += Math.sin(t * 61) * a; dy += Math.cos(t * 53) * a; }
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.5) continue; const big = t0 === T.impact ? 3 : 1.4; const a = 7 * big * Math.exp(-d * 9); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  if (t >= T.rehook && t < T.rehook + 1.2) { dx += Math.sin(t * 45) * 2.5; dy += Math.cos(t * 39) * 2.5; }
  return [dx, dy];
}
const CUTS = [...CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05), T.fall, T.tablet, T.hatch, T.decide];
function flash(t) {
  let a = 0, red = 0;
  for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.25 * (1 - d / 0.14)); }
  { const d = t - T.impact; if (d >= 0 && d < 0.4) a = Math.max(a, 1 - d / 0.4); }
  if (t < 0.2) red = 0.5 * (1 - t / 0.2);
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
  if (red > 0) { ctx.fillStyle = `rgba(255,30,30,${red})`; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  const sc = scene(t);
  if (sc === "cockpit") drawCockpit(t);
  else if (sc === "fall") drawFall(t);
  else if (sc === "cabin") drawCabin(t);
  else if (sc === "split") drawSplit(t);
  else {
    let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    drawWorld(t, z);
    ctx.restore();
    if (t >= T.horizon && t < T.twist) { ctx.fillStyle = "rgba(10,10,40,0.35)"; ctx.fillRect(0, 0, W, H); }       // unheimlich dunkel
    snowfall(t, t >= T.impact && t < T.hatch ? 0.4 : 0.8);
    if (t >= T.loop) { const p = 0.5 + 0.5 * Math.sin(t * 20); ctx.fillStyle = `rgba(255,20,20,${0.15 + 0.2 * p})`; ctx.fillRect(0, 0, W, H); }
  }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,10,25,0.5)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sc === "fall") speedLines(t, 1);
  if (sc === "world" && t >= T.rehook && t < T.rehook + 0.9) speedLines(t, 1);
  if (sc === "split" && t >= T.vote2) confetti(t, T.vote2 + 0.05);

  // ---- Einblendungen (sichere Zone)
  tag6Badge();
  if (t < T.fall) { const fuel = t < 0.12 ? 1 : 0; const a = 1 + 0.1 * Math.exp(-(t - 0.12) * 10) * (t >= 0.12 ? 1 : 0); topLabel("⛽ " + fuel + " %", a, fuel ? "#ffb43a" : RED, 175, 64); }
  if (t >= T.fall && t < T.impact) topLabel("🪐 PLUTO", pop(t, T.fall + 0.25, T.impact - 0.05), "#fff", 175, 52);
  topLabel("🗳 EURE WAHL", pop(t, T.vote, T.tablet - 0.08), "#14223a", 160, 30, "#ffd23a");
  topLabel("🌡 −230 °C", pop(t, T.hatch + 0.1, T.horizon - 0.1), "#fff", 160, 46, "#3a7bd5");
  if (t >= T.noam && t < T.horizon) { const [sx, sy] = toScreen(190, 640, t); pill("Noam", Math.min(sx, 430), sy, pop(t, T.noam + 0.15, T.horizon - 0.1), "#fff", "#14223a"); }
  topLabel("👀 NICHT ALLEIN", pop(t, T.eyes, T.rehook - 0.08), RED, 160, 40);
  if (t >= T.fast && t < T.delon) topLabel("😳 FAST ALLE", pop(t, T.fast, T.delon - 0.08), "#fff", 160, 40);
  if (t >= T.delon && t < T.twist) { const [sx, sy] = toScreen(345, 640, t); pill("DELON", Math.min(sx, 430), Math.max(150, sy), pop(t, T.delon + 0.15, T.twist - 0.1), "#fff", "#14223a"); topLabel("⚡ LÄDT …", pop(t, T.delon + 0.5, T.twist - 0.1), CYAN, 160, 36); }
  if (t >= T.twist && t < T.hut) { const [sx, sy] = toScreen(640, 360, t); if (t >= T.sniff && t < T.doner) topLabel("👃 SCHNUPPER …", pop(t, T.sniff, T.doner - 0.05), "#fff", 160, 36); if (t >= T.doner) topLabel("🥙 ?!", pop(t, T.doner, T.hut - 0.08), "#ffd23a", 160, 60); }
  if (t >= T.hut && t < T.cta) { topLabel("🥙 STAMMKUNDE", pop(t, T.stamm, T.cta - 0.08), "#ffd23a", 160, 40); const [jx, jy] = toScreen(-385, 645, t); pill("Janic", Math.max(60, Math.min(jx, 430)), jy, pop(t, T.hut + 0.2, T.cta - 0.1), "#fff", "#14223a"); }
  if (t >= T.cta && t < T.og) {
    confetti(t, T.follow - 0.05);
    const n = Math.round(FOLLOWERS * easeOut(ramp(t, T.cta + 0.2, T.follow)));
    topLabel("👥 BEWOHNER: " + n, pop(t, T.cta + 0.1, T.og - 0.08), "#fff", 150, 38, "#14223a");
    const a = pop(t, T.follow - 0.05, T.og - 0.08) * (1 + 0.04 * Math.sin(t * 8));
    if (a > 0) { ctx.save(); ctx.translate(SX, 240); ctx.rotate(-0.04); ctx.scale(a, a); ctx.fillStyle = "#ffd23a"; rr(-200, -36, 400, 72, 16); ctx.fill(); ctx.strokeStyle = "#14223a"; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = "#14223a"; ctx.font = "36px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("1 FOLLOW = 1 BEWOHNER", 0, 3); ctx.restore(); }
  }
  if (t >= T.og && t < T.decide) { const a = pop(t, T.og + 0.3, T.decide - 0.08); if (a > 0) { ctx.save(); ctx.translate(SX, 165); ctx.scale(a, a); outlined("⚡ LICHTANTRIEB", 0, 0, 44, CYAN, "#0e1a30", 10); outlined("GEBAUT VON OGNANI", 0, 40, 22, "#fff", "#0e1a30", 6); ctx.restore(); }
    const b = pop(t, T.weiter, T.decide - 0.08); if (b > 0) { ctx.save(); ctx.translate(SX, 262); ctx.rotate(-0.04); ctx.scale(b, b); ctx.fillStyle = "#14223a"; rr(-190, -26, 380, 52, 14); ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "26px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("= WIR KÖNNEN WEITER 🚀", 0, 3); ctx.restore(); } }
  if (t >= T.decide) {
    const a = pop(t, T.decide, 99); ctx.save(); ctx.translate(SX, 160); ctx.scale(a, a); outlined("DIE WICHTIGSTE FRAGE:", 0, -48, 22, "#fff", "#0e1a30", 6); outlined("BLEIBEN ODER", 0, -12, 40, "#fff", "#0e1a30", 10); outlined("WEITERFLIEGEN?", 0, 32, 40, "#ffd23a", "#0e1a30", 10); ctx.restore();
    pollCard(t, pop(t, T.vote2, 99));
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
