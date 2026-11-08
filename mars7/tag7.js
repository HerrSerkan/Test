// ============================================================ Tag 7 „Blinder Passagier“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + tag7.js -> scene.js)
// Nach BRIEFING_TAG7.md, Stil wie Tag 6. Echte Umfrage Tag 6: 72 % „Besseren Planeten suchen“ (60 Stimmen).
// Sichere Zone: kein Text unten 20 % (y > 819), rechts 15 % (x > 490), oben 10 % (y < 102) – Raster 576 x 1024.
const FOLLOWERS = 830;
const T = {
  warp: wt(4), weiter: wt(9), eat: wt(12), jens: wt(18), mascot: wt(22), lohn: wt(23), alarm: wt(28), aster: wt(30),
  drive: wt(31), jump: wt(37), crowd: wt(39), follow: wt(44), decide: wt(49), mitten: wt(50), danger: wt(54), aussen: wt(55), noDoner: wt(61), poll: wt(64),
  loop: SPEECH_END + 0.1,
};
const AV = {};
const scene = t => t < T.warp ? "crate" : t < T.eat ? "warp" : t < T.alarm ? "deck" : t < T.drive ? "alarm" : t < T.crowd ? "cockpit" : t < T.decide ? "crowd" : t < T.loop ? "split" : "crate";

// ------------------------------------------------------------ Untertitel (Block 1 ab Frame 1 komplett, danach Wort für Wort)
function captions(t) {
  const C = window.CHUNKS; let c = null;
  for (let i = 0; i < C.length; i++) if (t >= C[i].s - 0.02) c = C[i];
  if (!c || t >= T.loop || (t > c.e + 0.6 && c === C.at(-1))) return;
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
      const k = c === C[0] ? 1 : ramp(t, p.s - 0.02, p.s + 0.1);
      if (k > 0) { ctx.save(); ctx.translate(x + p.ww * fit / 2, y); const sc = (0.6 + 0.4 * back(k)) * fit; ctx.scale(sc, sc);
        outlined(p.w, 0, 0, 40, p.col === 1 ? CYAN : p.col === 2 ? RED : p.col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 10); ctx.restore(); }
      x += (p.ww + sp) * fit;
    }
  });
  ctx.restore();
}
function tagBadge() { ctx.save(); ctx.fillStyle = "rgba(14,26,48,0.75)"; rr(14, 108, 84, 30, 9); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("TAG 7", 56, 124); ctx.restore(); }
function OL(fn, px = 6) { const m = ctx.getTransform(); ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(m); fn(); ctx = MAIN; compositeOutline(px); }

// ------------------------------------------------------------ Raketen-Innenraum (hell)
function asteroid(x, y, r, rot, seed) {
  const g = rng(seed); ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rad = r * (0.78 + 0.3 * g()); pts.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  pts.forEach(([px, py], i) => i ? ctx.lineTo(px * 1.06, py * 1.06) : ctx.moveTo(px * 1.06, py * 1.06)); ctx.fill();
  ctx.fillStyle = "#8a8394"; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.fill();
  for (let i = 0; i < 3; i++) circle((g() - 0.5) * r, (g() - 0.5) * r, r * (0.12 + 0.12 * g()), "#6d6678");
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.35, r * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
const FIELD = (() => { const r = rng(57), a = []; for (let i = 0; i < 26; i++) a.push({ x: r() * 2 - 1, y: r() * 2 - 1, r: 0.3 + r() * 0.9, ph: r(), rot: r() * 6, sp: (r() - 0.5) * 2 }); return a; })();
function spaceView(x, y, w, h, t, alarm, rush = 0) { // Blick nach draußen (Rechteck), optional mit Asteroiden
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.clip();
  ctx.fillStyle = "#06070f"; ctx.fillRect(x, y, w, h);
  for (const [sx, sy, r, p] of STARS) circle(x + ((sx + 900 + t * 40) % 1300 + 1300) % 1300 / 1300 * w, y + ((sy + 700) % 1100) / 1100 * h, r * 0.8, "#fff");
  if (alarm) for (const [i, a] of FIELD.entries()) { const k = ((t * (0.35 + rush * 0.5) + a.ph) % 1); const sc = 0.2 + k * k * 2.2; asteroid(x + w / 2 + a.x * w * 0.5 * (0.4 + k), y + h / 2 + a.y * h * 0.5 * (0.4 + k), 30 * a.r * sc, a.rot + t * a.sp, i + 1); }
  ctx.restore();
}
function interior(t, pan = 0, alarm = 0, window = true) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f3effb"); g.addColorStop(1, "#d9d2ef"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#c4bce2"; ctx.fillRect(0, 0, W, 140);
  for (let i = -1; i < 6; i++) { const lx = ((i * 180 - pan) % 900 + 900) % 900 - 160; glow(lx + 60, 140, 70, "255,240,180", alarm ? 0.15 : 0.55); ctx.fillStyle = alarm ? "#ff6a6a" : "#fff6cf"; rr(lx + 30, 128, 60, 14, 6); ctx.fill(); }
  for (let i = -1; i < 6; i++) { const rx = ((i * 160 - pan * 1.0) % 800 + 800) % 800 - 100; ctx.fillStyle = "#c9c1e6"; ctx.fillRect(rx, 140, 14, 500); }
  if (window) for (let i = -1; i < 3; i++) { const px = ((i * 320 - pan) % 960 + 960) % 960 - 120; circle(px, 270, 84, "#8e86b8"); circle(px, 270, 72, "#06070f"); ctx.save(); ctx.beginPath(); ctx.arc(px, 270, 72, 0, Math.PI * 2); ctx.clip(); spaceView(px - 72, 198, 144, 144, t, alarm); ctx.restore(); circle(px - 28, 242, 14, "rgba(255,255,255,0.25)"); }
  ctx.fillStyle = "#9d96c2"; ctx.fillRect(0, 640, W, 400); ctx.fillStyle = "#8b84b2"; for (let i = 0; i < 8; i++) ctx.fillRect(((i * 90 - pan) % 720 + 720) % 720 - 60, 640, 4, 400);
}
function crate(x, y, s, t) { // Unterkante Mitte
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-124, -164, 248, 168, 10); ctx.fill(); ctx.fillStyle = "#c98a4a"; rr(-120, -160, 240, 160, 8); ctx.fill();
  ctx.fillStyle = "#a96d34"; for (const yy of [-110, -55]) ctx.fillRect(-120, yy, 240, 6); ctx.fillRect(-120, -160, 14, 160); ctx.fillRect(106, -160, 14, 160);
  ctx.fillStyle = "#fff4dc"; rr(-92, -118, 184, 54, 8); ctx.fill(); ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#3a2a1a"; ctx.font = "22px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🥙 DÖNER-VORRAT", 0, -89);
  ctx.restore();
}
function lidOpen(x, y, s, k) { ctx.save(); ctx.translate(x - 120 * s, y - 160 * s); ctx.rotate(-1.2 * k); ctx.fillStyle = "#1b1424"; rr(-4, -10, 248 * s, 16 * s, 4); ctx.fill(); ctx.fillStyle = "#b97a3c"; rr(0, -8, 240 * s, 12 * s, 3); ctx.fill(); ctx.restore(); }
// Fan-Zubehör
function winterJacket(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#ff7a2a"; rr(-28, -80, 56, 46, 14); ctx.fill(); ctx.strokeStyle = "#d8561a"; ctx.lineWidth = 2; for (const yy of [-66, -54, -42]) { ctx.beginPath(); ctx.moveTo(-26, yy); ctx.lineTo(26, yy); ctx.stroke(); } ctx.fillStyle = "#f4efe6"; rr(-24, -84, 48, 10, 5); ctx.fill(); circle(-30, -44, 5, "#e0b43a"); circle(-30, -44, 3, "#2a6a4a"); ctx.restore(); }
function barca(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.save(); ctx.beginPath(); ctx.roundRect(-22, -76, 44, 40, 12); ctx.clip(); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#a50044" : "#004d98"; ctx.fillRect(-22 + i * 8, -76, 8, 40); } ctx.restore(); ctx.fillStyle = "#ffd23a"; ctx.font = "9px Comic"; ctx.textAlign = "center"; ctx.fillText("10", 0, -50); ctx.fillStyle = "#111"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 8, -103, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); } ctx.fillRect(-2, -105, 4, 2); ctx.restore(); }
function policeCap(x, y, s) { const hy = y - 104 * s; ctx.save(); ctx.translate(x, hy - 26 * s); ctx.scale(s, s); ctx.fillStyle = "#1c2f6b"; ctx.beginPath(); ctx.ellipse(0, -2, 30, 12, 0, Math.PI, 0); ctx.fill(); rr(-26, -6, 52, 10, 3); ctx.fill(); ctx.fillStyle = "#111a3a"; ctx.beginPath(); ctx.ellipse(8, 6, 24, 6, 0, 0, Math.PI); ctx.fill(); circle(0, -8, 5, "#ffd23a"); ctx.restore(); }
function worm(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 6; i++) { const yy = -8 - Math.abs(Math.sin(t * 6 + i * 0.7)) * 6; circle(-i * 11, yy, 9, "#1b1424"); circle(-i * 11, yy, 7.5, i % 2 ? "#ff8fa8" : "#ff9db4"); } circle(2, -12, 1.6, "#111"); ctx.strokeStyle = "rgba(200,235,255,0.95)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -12, 13, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
function hamster(x, y, s, t) { ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 7)) * 3); ctx.scale(s, s); circle(0, -10, 12, "#1b1424"); circle(0, -10, 10.5, "#f2a65a"); circle(0, -6, 6, "#fff3e0"); circle(-6, -19, 4, "#f2a65a"); circle(6, -19, 4, "#f2a65a"); circle(-4, -12, 1.5, "#111"); circle(4, -12, 1.5, "#111"); ctx.restore(); }
function phone1(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-15, -28, 30, 56, 6); ctx.fill(); ctx.fillStyle = "#2fa84f"; rr(-12, -24, 24, 48, 4); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(-6, -8, 4, 6); ctx.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 1; i < 4; i++) ctx.fillRect(-6 + i * 5, -8 - i * 3, 4, 6 + i * 3); ctx.fillStyle = "#fff"; ctx.font = "900 5.5px InterX"; ctx.textAlign = "center"; ctx.fillText("EMPFANG:", 0, 6); ctx.fillText("1 BALKEN", 0, 13); ctx.restore(); }
function collar(x, y, s, k, t) { // y = Füße des Monsters (sitzend)
  if (k <= 0) return; const cy = y - 150 * s; ctx.save(); ctx.translate(x, cy); ctx.scale(s * back(k), s * back(k));
  ctx.strokeStyle = "#e5262b"; ctx.lineWidth = 18; ctx.beginPath(); ctx.ellipse(0, 0, 120, 26, 0, 0.1, Math.PI - 0.1); ctx.stroke();
  circle(0, 32, 14, "#ffd23a"); circle(0, 32, 5, "#a07a10");
  ctx.save(); ctx.translate(0, 70); ctx.rotate(Math.sin(t * 4) * 0.15); ctx.fillStyle = "#ffd23a"; rr(-88, -20, 176, 40, 10); ctx.fill(); ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#1b1424"; ctx.font = "24px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("MASKOTTCHEN", 0, 2); ctx.restore();
  ctx.restore();
}
function plakat(x, y, s, txt) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s); ctx.fillStyle = "#6b4a2a"; ctx.fillRect(-3, 0, 6, 70); ctx.fillStyle = "#1b1424"; rr(-74, -50, 148, 60, 8); ctx.fill(); ctx.fillStyle = "#fffdf4"; rr(-70, -46, 140, 52, 6); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.font = "18px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt[0], 0, -30); ctx.fillStyle = "#1b1424"; ctx.fillText(txt[1], 0, -8); ctx.restore(); }
function chefBand(x, y, s) { const hy = y - 104 * s; chefHat(x, hy, s); ctx.save(); ctx.fillStyle = "#e5262b"; ctx.fillRect(x - 17 * s, hy - 37 * s, 34 * s, 8 * s); ctx.fillStyle = "#fff"; ctx.font = `${5.2 * s}px Comic`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DÖNER-CHEF", x, hy - 32.5 * s); ctx.restore(); }

// ------------------------------------------------------------ Szenen
function drawCrate(t) {
  const loop = t >= T.loop; const lk = loop ? ramp(t, T.loop, DUR - 0.05) : 0;
  interior(t, 0, 0, false);
  // großes Fenster hinter der Kiste (im Loop fliegt ein Asteroid heran)
  circle(288, 300, 150, "#8e86b8"); circle(288, 300, 134, "#06070f"); ctx.save(); ctx.beginPath(); ctx.arc(288, 300, 134, 0, Math.PI * 2); ctx.clip(); spaceView(154, 166, 268, 268, t, 0);
  if (loop) asteroid(288, 300, 30 + 230 * lk * lk, t * 0.8, 9); ctx.restore(); circle(238, 250, 22, "rgba(255,255,255,0.22)");
  const pk = 1 - 0.04 * Math.abs(Math.sin(t * 9));   // ab Frame 1 voll sichtbar, wippt beim Kauen
  OL(() => {
    creature(288, 720 - 95 * pk, 0.78, t, { cheeks: !loop || lk < 0.6, munch: !loop, roar: loop && lk >= 0.6, eyes: 1, look: loop ? 0 : -0.5 });
    crate(288, 700, 1.25, t);
    for (const [i, [x, d]] of [[56, -1], [500, 1], [556, 1]].entries()) {
      const hop = loop ? 0 : Math.max(0, Math.sin(Math.min(Math.PI, (t + i * 0.08) * 7))) * 34;
      astronaut(x + d * 22 * easeOut(ramp(t, 0, 0.4)), 712 - hop, 1.1, "shock", { t: t + i, acc: ["#ff79c6", "#3fd3f2", "#7bf27a"][i], armL: 2.6, armR: -2.6 });
    }
    doner(110, 712, 1.6); doner(450, 715, 1.4);
  });
  if (!loop) for (let i = 0; i < 6; i++) { const k = ((t * 1.6 + i / 6) % 1); circle(288 + Math.sin(i * 2.3) * 70 * k, 470 - k * 120, 6 * (1 - k), "#e8c07a"); }   // Krümel
  if (loop && lk > 0.6) { const a = back(ramp(t, T.loop + 0.75, T.loop + 0.95)); ctx.save(); ctx.translate(SX, 220); ctx.rotate(-0.08); ctx.scale(a, a); outlined("BÖÖRP!", 0, 0, 70, "#7bf27a", "#0e1a30", 12); ctx.restore(); }
  if (loop && Math.sin(t * 40) > 0.2 && lk > 0.5) { ctx.fillStyle = "rgba(0,0,10,0.5)"; ctx.fillRect(0, 0, W, H); }
}
const STREAKS = (() => { const r = rng(81), a = []; for (let i = 0; i < 90; i++) a.push([r() * Math.PI * 2, r(), r()]); return a; })();
function drawWarp(t) {
  ctx.fillStyle = "#0a0f2a"; ctx.fillRect(0, 0, W, H);
  const k = ramp(t, T.warp, T.weiter), hy = T.weiter <= t ? 1 : 0, sp = 0.4 + 1.6 * k + 2 * hy;
  ctx.save(); ctx.lineCap = "round";
  for (const [a, ph, w] of STREAKS) { const d = ((t * sp + ph) % 1); const r0 = 40 + d * 700, r1 = r0 + 30 + 260 * d * (0.3 + k + hy); ctx.strokeStyle = `rgba(${200 + 55 * w},${220 + 35 * w},255,${0.3 + 0.7 * d})`; ctx.lineWidth = 1 + 3 * d; ctx.beginPath(); ctx.moveTo(288 + Math.cos(a) * r0, 560 + Math.sin(a) * r0); ctx.lineTo(288 + Math.cos(a) * r1, 560 + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
  glow(288, 560, 220, "120,200,255", 0.35 + 0.3 * hy);
  const pr = lerp(130, 8, easeIO(ramp(t, T.warp, T.eat - 0.2))); plutoPlanet(330, lerp(900, 640, easeIO(ramp(t, T.warp, T.eat))), pr, t);
  ctx.save(); ctx.translate(288 + Math.sin(t * 40) * 2, 640); ctx.rotate(0); rocket(0, 0, 0.9, 1.5 + hy); ctx.restore();
  if (hy) { const d = t - T.weiter; if (d < 0.3) { ctx.fillStyle = `rgba(255,255,255,${0.4 * (1 - d / 0.3)})`; ctx.fillRect(0, 0, W, H); } }
}
function drawDeck(t) { // Döner-Klau + Maskottchen
  interior(t, 40, 0);
  const n = Math.round(lerp(12, 3, easeIO(ramp(t, T.eat + 0.2, T.jens - 0.1))));
  const masc = ramp(t, T.mascot, T.mascot + 0.3);
  OL(() => {
    creature(230, 700, 0.72, t, { sit: true, munch: t < T.mascot, happy: true, cheeks: t < T.jens });
    collar(230, 700, 0.72, masc, t);
    for (let i = 0; i < Math.min(5, n); i++) doner(90 + (i % 3) * 26, 690 - Math.floor(i / 3) * 20, 1.5);
    // Tim rauft sich die Haare
    const timShake = t < T.jens ? Math.sin(t * 30) * 2 : 0;
    astronaut(470 + timShake, 700, 1.2, t < T.jens ? "shock" : "smile", { t, acc: "#7bf27a", armL: t < T.jens ? 2.9 : 0.25, armR: t < T.jens ? -2.9 : -0.25 });
    chefBand(470 + timShake, 700, 1.2);
    // Jens mit Plakat
    if (t >= T.jens) { const k = easeOut(ramp(t, T.jens, T.jens + 0.3)); const jx = lerp(640, 400, k); astronaut(jx, 705, 1.1, "happy", { t, acc: "#ffd23a", armR: -2.4 }); if (t >= T.lohn) plakat(jx + 34, 548, back(ramp(t, T.lohn, T.lohn + 0.25)), ["1 DÖNER", "PRO TAG"]); }
  });
  if (t >= T.mascot && t < T.mascot + 0.7) sparkleBurst(230, 560, t, T.mascot);
  if (t < T.jens) hearts(180, 420, t);
}
function drawAlarm(t) {
  interior(t, 80, 1, false);
  ctx.fillStyle = "#8e86b8"; rr(40, 150, 496, 400, 40); ctx.fill(); spaceView(56, 166, 464, 368, t, 1, ramp(t, T.alarm, T.drive));
  OL(() => { for (const [i, x] of [90, 288, 486].entries()) astronaut(x, 720, 1.1, "shock", { t: t + i, acc: ["#ff79c6", "#3fd3f2", "#7bf27a"][i], armL: 2.5, armR: -2.5 }); });
  for (const lx of [60, 516]) { const a = t * 8; glow(lx, 150, 70, "255,40,40", 0.6 + 0.4 * Math.sin(a)); circle(lx, 150, 14, "#ff3b3b"); }
}
function drawCockpit(t) {
  interior(t, 140, 1, false);
  ctx.fillStyle = "#8e86b8"; rr(30, 140, 516, 250, 40); ctx.fill(); spaceView(44, 154, 488, 222, t, 1, 0.6);
  // Konsole + Anzeige
  ctx.fillStyle = "#5a5480"; rr(20, 395, 536, 110, 18); ctx.fill();
  const blink = t >= T.jump && Math.sin(t * 16) > 0;
  ctx.fillStyle = "#0e1220"; rr(140, 410, 230, 70, 10); ctx.fill(); ctx.strokeStyle = blink ? "#ff4040" : "#3fd3f2"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = t >= T.jump ? (blink ? "#ff5050" : "#ffd23a") : "#3fd3f2"; ctx.font = "19px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(t >= T.jump ? "⚡ NUR NOCH 1 SPRUNG" : "⚡ ANTRIEB: 12 %", 255, 445);
  // Mehmets Aufkleber
  ctx.save(); ctx.translate(470, 450); ctx.rotate(0.08); ctx.fillStyle = "#fff"; rr(-56, -18, 112, 36, 10); ctx.fill(); ctx.fillStyle = "#1b1424"; ctx.font = "10.5px Comic, 'Noto Color Emoji'"; ctx.fillText("🍎 APPLE STORE", 0, -4); ctx.fillText("KOMMT", 0, 9); ctx.restore();
  OL(() => {
    lightDrive(75, 560, 0.5, t, t >= T.jump);
    // jaroslav am Steuer
    ctx.strokeStyle = "#2a2c34"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(330, 520, 26, 0, Math.PI * 2); ctx.stroke();
    astronaut(330, 600, 0.75, "smirk", { t, acc: "#1c2f6b", armL: -1.3, armR: 1.3 }); policeCap(330, 600, 0.75);
    astronaut(190, 605, 0.75, t >= T.jump ? "shock" : "talk", { t: t + 1, acc: "#3fd3f2", armR: -1.6 });   // OGnani
    // Fans im Hintergrund
    const row = [["tick", 38], ["balerz", 112], ["michel", 186], ["leonard", 262], ["noam", 338], ["apfel", 408], ["worm", 470]];
    for (const [id, x] of row) {
      const y = 720, s = id === "apfel" ? 0.62 : 0.8;
      if (id === "worm") { worm(x, y - 2, 1.1, t); continue; }
      const o = { t: t + x, acc: { tick: "#ff7a2a", balerz: "#a50044", michel: "#7bf27a", leonard: "#b06bff", noam: "#ff79c6", apfel: "#ffd23a" }[id] };
      if (id === "leonard") o.wave = true; if (id === "noam") o.armR = -2.6;
      astronaut(x, y, s, id === "leonard" ? "happy" : "smile", o);
      if (id === "tick") winterJacket(x, y, s); if (id === "balerz") barca(x, y, s); if (id === "michel") eggItem("cleats", x, y, s, t);
      if (id === "noam") phone1(x + 26 * s, y - 150 * s, s * 1.1); if (id === "apfel") hamster(x + 18, y - 40, 1, t);
    }
  });
  const [lx, ly] = [262, 585]; pill("Bin noch drin!", lx, ly, pop(t, T.drive + 0.3, T.crowd - 0.05), "#fff", "#14223a", "👋 ");
  pill("Leonard", lx, ly - 34, 0, "#fff", "#14223a");
  if (t >= T.jump) arcs(75, 500, 60, t, "255,120,90");
}
const SEATS = (() => { const r = rng(15), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]; for (let row = 0; row < 4; row++) for (let i = 0; i < 26; i++) a.push({ x: i * 70 + (row % 2) * 35 + (r() - 0.5) * 10, y: 450 + row * 80, s: 0.3 + row * 0.13, acc: keys[(i + row) % 7], ph: r() * 6 }); return a; })();
function drawCrowd(t) {
  const pan = lerp(0, 900, easeIO(ramp(t, T.crowd - 0.1, T.decide)));
  interior(t, pan, 0);
  for (const m of SEATS) { const sp = SPR[m.acc]; if (!sp) continue; const x = m.x - pan; if (x < -60 || x > W + 60) continue; ctx.fillStyle = "#7a72a8"; rr(x - 40 * m.s * 1.4, m.y - 70 * m.s * 1.4, 80 * m.s * 1.4, 70 * m.s * 1.4, 8); ctx.fill(); const w = 88 * m.s * 1.4, h = 158 * m.s * 1.4; ctx.drawImage(sp, x - w / 2, m.y - h - Math.abs(Math.sin(t * 6 + m.ph)) * 4, w, h); }
  for (let i = 0; i < 10; i++) { const t0 = T.crowd + 0.1 + (T.follow - T.crowd) * i / 9, d = t - t0; if (d < 0 || d > 0.7) continue; const r = rng(i + 9); ctx.save(); ctx.globalAlpha = 1 - d / 0.7; ctx.translate(40 + r() * 420, 400 - d * 60); outlined("+1", 0, 0, 30, "#7bf27a", "#0e1a30", 6); ctx.restore(); }
  confetti(t, T.follow);
}
function routePanel(x0, t, through) {
  ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, 288, H); ctx.clip();
  ctx.fillStyle = through ? "#120a1e" : "#071224"; ctx.fillRect(x0, 0, 288, H);
  for (const [sx, sy, r] of STARS) circle(x0 + ((sx + 900 + t * 20) % 600) / 600 * 288, (sy + 700) * 0.95, r, "#fff");
  const cx = x0 + 144, top = 330, bot = 700;
  // Asteroidenfeld in der Mitte
  for (const [i, a] of FIELD.entries()) { if (i > 16) break; asteroid(cx + a.x * 90, 515 + a.y * 120, 14 + 14 * a.r, a.rot + t * a.sp * 0.5, i + 3); }
  ctx.setLineDash([10, 8]); ctx.lineWidth = 5; ctx.strokeStyle = through ? "#ffd23a" : "#3fd3f2"; ctx.beginPath();
  if (through) { ctx.moveTo(cx, bot); ctx.lineTo(cx, top); } else { ctx.moveTo(cx, bot); ctx.bezierCurveTo(cx + 150, bot - 40, cx + 150, top + 40, cx, top); }
  ctx.stroke(); ctx.setLineDash([]);
  circle(cx, top - 6, 16, "#3fbf5a"); circle(cx, top - 6, 12, "#7be08a");                         // Ziel
  const k = ((t - T.decide) * (through ? 0.45 : 0.28)) % 1; let rx, ry;
  if (through) { rx = cx; ry = lerp(bot, top, k); } else { const u = k, v = 1 - u; rx = v * v * v * cx + 3 * v * v * u * (cx + 150) + 3 * v * u * u * (cx + 150) + u * u * u * cx; ry = v * v * v * bot + 3 * v * v * u * (bot - 40) + 3 * v * u * u * (top + 40) + u * u * u * top; }
  ctx.save(); ctx.translate(rx, ry); rocket(0, 10, 0.18, 1); ctx.restore();
  if (through) for (let i = 0; i < 3; i++) { const d = ((t * 2 + i / 3) % 1); if (d < 0.2) { ctx.strokeStyle = "rgba(255,230,90,0.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 40 + i * 30, 470); ctx.lineTo(cx - 30 + i * 30, 500); ctx.lineTo(cx - 44 + i * 30, 510); ctx.lineTo(cx - 34 + i * 30, 540); ctx.stroke(); } }
  else { ctx.font = "26px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("🐢", cx + 118, 520 + Math.sin(t * 3) * 6); }
  ctx.restore();
}
function drawSplit(t) {
  routePanel(0, t, true); routePanel(288, t, false);
  if (t >= T.mitten && t < T.poll) { ctx.fillStyle = "rgba(0,0,0,0.5)"; if (t < T.aussen) ctx.fillRect(288, 0, 288, H); else ctx.fillRect(0, 0, 288, H); }
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(288, 0); for (let y = 0; y <= H; y += 60) ctx.lineTo(288 + (y / 60 % 2 ? 10 : -10), y); ctx.stroke();
  const a = pop(t, T.decide + 0.1, T.poll - 0.05);
  for (const [i, [x, l1, l2, l3, col]] of [[140, "⚡ DURCH", "schnell, aber", "gefährlich", "#ffd23a"], [400, "🐢 AUSSENRUM", "sicher, aber", "🥙 reicht nicht", "#3fd3f2"]].entries()) {
    if (a <= 0) continue; const hi = i === 0 ? (t >= T.mitten && t < T.aussen) : t >= T.aussen;
    ctx.save(); ctx.translate(x, 262); const sc = a * (1 + 0.15 * (hi ? 1 : 0)); ctx.scale(sc, sc); ctx.globalAlpha = t >= T.mitten && !hi ? 0.55 : 1;
    ctx.fillStyle = "#14223a"; rr(-82, -40, 164, 84, 14); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = col; ctx.font = (i ? "19px" : "24px") + " Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(l1, 0, -16);
    ctx.fillStyle = "#fff"; ctx.font = "13px Comic, 'Noto Color Emoji'"; ctx.fillText(l2, 0, 8); ctx.fillText(l3, 0, 25); ctx.restore();
  }
  // links: Einschlag bei „gefährlich“
  if (t >= T.danger && t < T.poll) { const d = t - T.danger; if (d < 0.8) { glow(144, 500, 160 * Math.min(1, d * 5), "255,150,40", 0.9 * (1 - d / 0.8)); const a = back(ramp(t, T.danger, T.danger + 0.2)) * (1 - ramp(t, T.danger + 0.6, T.danger + 0.8)); ctx.save(); ctx.translate(144, 500); ctx.scale(a, a); ctx.font = "60px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("💥", 0, 0); ctx.restore(); } }
  // rechts: Döner geht aus, Monster grummelt
  if (t >= T.noDoner - 0.3 && t < T.poll) { const k = ramp(t, T.noDoner - 0.3, T.noDoner + 0.5), n = Math.round(lerp(3, 0, k)); const a = pop(t, T.noDoner - 0.3, T.poll - 0.05);
    ctx.save(); ctx.translate(430, 520); ctx.scale(a, a); creature(0, 70, 0.22, t, { roar: n === 0, eyes: 1 }); ctx.fillStyle = "#14223a"; rr(-56, 84, 112, 34, 10); ctx.fill(); ctx.strokeStyle = n === 0 ? RED : "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = n === 0 ? RED : "#fff"; ctx.font = "20px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🥙 " + n, 0, 102); ctx.restore(); }
  if (t >= T.poll) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, 0, W, H); }
}
function pollCard7(t, s) { // TikTok-Umfrage zum Abstimmen (Ergebnis noch offen)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 470); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1e1e22"; rr(-210, -96, 420, 192, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-172, -60, 20, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -192, -80, 40, 40); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "800 15px InterX"; ctx.fillText("Gedacht ·", -140, -72); ctx.fillStyle = "#5aa7e6"; ctx.fillText("Creator*in", -64, -72);
  ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("Durch oder außenrum?", -140, -46);
  for (const [i, txt] of ["⚡ Mitten durch", "🐢 Außenrum"].entries()) { const y = -20 + i * 50; ctx.fillStyle = "#2a2a30"; rr(-188, y, 376, 42, 12); ctx.fill(); ctx.strokeStyle = "#45454d"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "800 17px InterX, 'Noto Color Emoji'"; ctx.fillText(txt, -172, y + 22); }
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("🗳 Umfrage · Die Mehrheit entscheidet Tag 8", -188, 84);
  const k = (t - T.poll) % 1.2, fy = k < 0.25 ? -k * 20 : 0; ctx.font = "34px 'Noto Color Emoji'"; ctx.fillText("👆", 120 + Math.sin(t * 3) * 4, 50 + fy + 14 * Math.max(0, Math.sin(t * 5)));
  ctx.restore();
}

// ------------------------------------------------------------ Effekte
const CUTS = [T.warp, T.eat, T.alarm, T.drive, T.crowd, T.decide, T.loop];
const IMPACTS = [0.02, T.weiter, T.alarm, T.aster, T.jump, T.danger, T.loop + 0.75];
function shakeAt(t) {
  let dx = 0, dy = 0;
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.45) continue; const a = 7 * Math.exp(-d * 9); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  if (t >= T.alarm && t < T.crowd) { dx += Math.sin(t * 45) * 2; dy += Math.cos(t * 39) * 2; }
  if (t >= T.warp && t < T.eat) { dx += Math.sin(t * 50) * 1.5; }
  return [dx, dy];
}
function flash(t) {
  let a = 0;
  for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.3 * (1 - d / 0.14)); }
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.alarm && t < T.crowd) { const p = 0.5 + 0.5 * Math.sin(t * 9); ctx.fillStyle = `rgba(255,20,20,${0.12 + 0.18 * p})`; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  const sc = scene(t);
  if (sc === "crate") drawCrate(t); else if (sc === "warp") drawWarp(t); else if (sc === "deck") drawDeck(t);
  else if (sc === "alarm") drawAlarm(t); else if (sc === "cockpit") drawCockpit(t); else if (sc === "crowd") drawCrowd(t); else drawSplit(t);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,10,40,0.35)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen (sichere Zone)
  tagBadge();
  if (t >= T.warp && t < T.eat) {
    const a = pop(t, T.warp + 0.05, T.weiter - 0.05);
    if (a > 0 && AV.poll) { ctx.save(); ctx.translate(SX, 290); ctx.scale(a, a); const w = 430, h = w * AV.poll.height / AV.poll.width; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1f1f22"; rr(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.drawImage(AV.poll, -w / 2, -h / 2, w, h); ctx.restore(); }
    topLabel("🚀 72 % – WEITER!", pop(t, T.weiter, T.eat - 0.05), "#fff", 165, 40, "#2fa84f");
  }
  if (t >= T.eat && t < T.jens) { const n = Math.round(lerp(12, 3, easeIO(ramp(t, T.eat + 0.2, T.jens - 0.1)))); topLabel("🥙 DÖNER: " + n, pop(t, T.eat + 0.1, T.jens - 0.05), n <= 4 ? RED : "#14223a", 160, 38, "#fff"); const [tx] = [470]; pill("Tim", tx, 500, pop(t, T.eat + 0.3, T.jens - 0.05), "#fff", "#14223a"); }
  if (t >= T.jens && t < T.alarm) { pill("Jens", 400, 470, pop(t, T.jens + 0.25, T.alarm - 0.05), "#fff", "#14223a"); topLabel("🔔 MASKOTTCHEN", pop(t, T.mascot, T.alarm - 0.05), "#14223a", 160, 38, "#ffd23a"); }
  if (t >= T.alarm && t < T.drive) { const a = pop(t, T.alarm, T.drive - 0.05) * (1 + 0.06 * Math.max(0, Math.sin(t * 14))); topLabel("🚨 ALARM", a, "#fff", 140, 46, RED); topLabel("⚠ ASTEROIDEN", pop(t, T.aster, T.drive - 0.05), "#fff", 215, 36, "#14223a"); }
  if (t >= T.crowd && t < T.decide) {
    const n = Math.round(FOLLOWERS * easeOut(ramp(t, T.crowd, T.follow - 0.1)));
    topLabel("👥 " + n + " AN BORD", pop(t, T.crowd + 0.05, T.decide - 0.05), "#fff", 150, 38, "#14223a");
    const a = pop(t, T.follow - 0.05, T.decide - 0.05) * (1 + 0.04 * Math.sin(t * 8));
    if (a > 0) { ctx.save(); ctx.translate(SX, 236); ctx.rotate(-0.04); ctx.scale(a, a); ctx.fillStyle = "#ffd23a"; rr(-205, -34, 410, 68, 16); ctx.fill(); ctx.strokeStyle = "#14223a"; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = "#14223a"; ctx.font = "29px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("1 FOLLOW = 1 PLATZ AN BORD", 0, 3); ctx.restore(); }
  }
  if (t >= T.decide && t < T.loop) {
    const a = pop(t, T.decide, 99); ctx.save(); ctx.translate(SX, 160); ctx.scale(a, a); outlined("DURCH ODER", 0, -22, 42, "#ffd23a", "#0e1a30", 10); outlined("AUSSENRUM?", 0, 22, 42, CYAN, "#0e1a30", 10); ctx.restore();
    pollCard7(t, pop(t, T.poll, 99));
    const b = pop(t, T.poll + 0.3, 99); if (b > 0) { ctx.save(); ctx.translate(SX, 600); ctx.scale(b, b); outlined("+ schreib, was du an Bord mitnimmst 👇", 0, 0, 17, "#fff", "#0e1a30", 5); ctx.restore(); }
    if (t >= T.poll) confetti(t, T.poll + 0.05);
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"], ["poll", "umfrage_tag6.jpg"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
