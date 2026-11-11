// Bausteine aus Tag 6 + 7 (Fahne, Fan-Zubehör, Innenraum-Hilfen) – automatisch übernommen
function flag2(x, y, k, t) { // „ROTANIEN 2.0“, k = gehisst 0..1
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -300, 6, 300); circle(0, -304, 9, "#ffd23a");
  const fy = lerp(-90, -290, easeOut(k)), wv = Math.sin(t * 5) * 6;
  ctx.fillStyle = "#4a2b9a"; ctx.beginPath(); ctx.moveTo(3, fy); ctx.bezierCurveTo(60, fy + wv, 110, fy - wv, 160, fy); ctx.lineTo(160, fy + 90); ctx.bezierCurveTo(110, fy + 90 - wv, 60, fy + 90 + wv, 3, fy + 90); ctx.fill();
  circle(40, fy + 45, 22, "#e2552e"); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(40, fy + 45, 34, 9, -0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "17px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ROTANIEN", 112, fy + 34); ctx.fillStyle = "#ffd23a"; ctx.font = "26px Comic"; ctx.fillText("2.0", 112, fy + 60);
  ctx.restore();
}
function pizzaHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.rotate(-0.15); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-26, 8); ctx.lineTo(26, 8); ctx.lineTo(0, -36); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#f2b84b"; ctx.beginPath(); ctx.moveTo(-23, 6); ctx.lineTo(23, 6); ctx.lineTo(0, -32); ctx.fill(); ctx.fillStyle = "#c98a2a"; ctx.fillRect(-24, 2, 48, 6); for (const [px, py] of [[-8, -4], [7, -2], [0, -16]]) circle(px, py, 4, "#d93a2a"); ctx.restore(); }
function orangeCat(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 11, "#1b1424"); ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 9, "#ff9a2a"); ctx.beginPath(); ctx.moveTo(8, -16); ctx.lineTo(10, -24); ctx.lineTo(14, -17); ctx.moveTo(15, -17); ctx.lineTo(19, -24); ctx.lineTo(21, -15); ctx.fill(); ctx.strokeStyle = "#c96a1a"; ctx.lineWidth = 2; for (const d of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(d, -9); ctx.lineTo(d + 2, -3); ctx.stroke(); } circle(11, -11, 1.6, "#111"); circle(17, -11, 1.6, "#111"); ctx.restore(); }
function sash(x, y, s) { ctx.save(); ctx.translate(x, y - 58 * s); ctx.rotate(-0.55); ctx.scale(s, s); ctx.fillStyle = "#e5262b"; ctx.fillRect(-30, -6, 60, 12); ctx.fillStyle = "#ffd23a"; ctx.font = "6.5px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("PRÄSIDENT", 0, 1); ctx.restore(); }
function motorbike(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const wx of [-34, 34]) { circle(wx, -14, 16, "#1b1424"); circle(wx, -14, 7, "#9aa3ab"); } ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(-10, -36); ctx.lineTo(20, -36); ctx.lineTo(36, -18); ctx.lineTo(0, -16); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-8, -33); ctx.lineTo(18, -33); ctx.lineTo(30, -20); ctx.fill(); ctx.strokeStyle = "#555"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(22, -34); ctx.lineTo(30, -50); ctx.lineTo(40, -50); ctx.stroke(); ctx.restore(); }
function smallSign(x, y, txt, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#6b6f78"; ctx.fillRect(-2, -60, 4, 60); ctx.fillStyle = "#3a2a1a"; rr(-62, -84, 124, 28, 5); ctx.fill(); ctx.fillStyle = "#f6ecd4"; rr(-59, -81, 118, 22, 4); ctx.fill(); ctx.fillStyle = "#2a2a2a"; ctx.font = "900 10px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, -69); ctx.restore(); }
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
function OL(fn, px = 6) { const m = ctx.getTransform(); ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(m); fn(); ctx = MAIN; compositeOutline(px); }
function asteroid(x, y, r, rot, seed) {
  const g = rng(seed); ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rad = r * (0.78 + 0.3 * g()); pts.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  pts.forEach(([px, py], i) => i ? ctx.lineTo(px * 1.06, py * 1.06) : ctx.moveTo(px * 1.06, py * 1.06)); ctx.fill();
  ctx.fillStyle = "#8a8394"; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.fill();
  for (let i = 0; i < 3; i++) circle((g() - 0.5) * r, (g() - 0.5) * r, r * (0.12 + 0.12 * g()), "#6d6678");
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.35, r * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function winterJacket(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#ff7a2a"; rr(-28, -80, 56, 46, 14); ctx.fill(); ctx.strokeStyle = "#d8561a"; ctx.lineWidth = 2; for (const yy of [-66, -54, -42]) { ctx.beginPath(); ctx.moveTo(-26, yy); ctx.lineTo(26, yy); ctx.stroke(); } ctx.fillStyle = "#f4efe6"; rr(-24, -84, 48, 10, 5); ctx.fill(); circle(-30, -44, 5, "#e0b43a"); circle(-30, -44, 3, "#2a6a4a"); ctx.restore(); }
function barca(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.save(); ctx.beginPath(); ctx.roundRect(-22, -76, 44, 40, 12); ctx.clip(); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#a50044" : "#004d98"; ctx.fillRect(-22 + i * 8, -76, 8, 40); } ctx.restore(); ctx.fillStyle = "#ffd23a"; ctx.font = "9px Comic"; ctx.textAlign = "center"; ctx.fillText("10", 0, -50); ctx.fillStyle = "#111"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 8, -103, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); } ctx.fillRect(-2, -105, 4, 2); ctx.restore(); }
function policeCap(x, y, s) { const hy = y - 104 * s; ctx.save(); ctx.translate(x, hy - 26 * s); ctx.scale(s, s); ctx.fillStyle = "#1c2f6b"; ctx.beginPath(); ctx.ellipse(0, -2, 30, 12, 0, Math.PI, 0); ctx.fill(); rr(-26, -6, 52, 10, 3); ctx.fill(); ctx.fillStyle = "#111a3a"; ctx.beginPath(); ctx.ellipse(8, 6, 24, 6, 0, 0, Math.PI); ctx.fill(); circle(0, -8, 5, "#ffd23a"); ctx.restore(); }
function worm(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 6; i++) { const yy = -8 - Math.abs(Math.sin(t * 6 + i * 0.7)) * 6; circle(-i * 11, yy, 9, "#1b1424"); circle(-i * 11, yy, 7.5, i % 2 ? "#ff8fa8" : "#ff9db4"); } circle(2, -12, 1.6, "#111"); ctx.strokeStyle = "rgba(200,235,255,0.95)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -12, 13, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
function hamster(x, y, s, t) { ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 7)) * 3); ctx.scale(s, s); circle(0, -10, 12, "#1b1424"); circle(0, -10, 10.5, "#f2a65a"); circle(0, -6, 6, "#fff3e0"); circle(-6, -19, 4, "#f2a65a"); circle(6, -19, 4, "#f2a65a"); circle(-4, -12, 1.5, "#111"); circle(4, -12, 1.5, "#111"); ctx.restore(); }
function phone1(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-15, -28, 30, 56, 6); ctx.fill(); ctx.fillStyle = "#2fa84f"; rr(-12, -24, 24, 48, 4); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(-6, -8, 4, 6); ctx.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 1; i < 4; i++) ctx.fillRect(-6 + i * 5, -8 - i * 3, 4, 6 + i * 3); ctx.fillStyle = "#fff"; ctx.font = "900 5.5px InterX"; ctx.textAlign = "center"; ctx.fillText("EMPFANG:", 0, 6); ctx.fillText("1 BALKEN", 0, 13); ctx.restore(); }
function chefBand(x, y, s) { const hy = y - 104 * s; chefHat(x, hy, s); ctx.save(); ctx.fillStyle = "#e5262b"; ctx.fillRect(x - 17 * s, hy - 37 * s, 34 * s, 8 * s); ctx.fillStyle = "#fff"; ctx.font = `${5.2 * s}px Comic`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DÖNER-CHEF", x, hy - 32.5 * s); ctx.restore(); }
function plakat(x, y, s, txt) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s); ctx.fillStyle = "#6b4a2a"; ctx.fillRect(-3, 0, 6, 70); ctx.fillStyle = "#1b1424"; rr(-74, -50, 148, 60, 8); ctx.fill(); ctx.fillStyle = "#fffdf4"; rr(-70, -46, 140, 52, 6); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.font = "18px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt[0], 0, -30); ctx.fillStyle = "#1b1424"; ctx.fillText(txt[1], 0, -8); ctx.restore(); }
function sweat(x, y, t, ph = 0) { const k = ((t * 1.4 + ph) % 1); ctx.globalAlpha = 1 - k; ctx.fillStyle = "#7fd0ff"; ctx.beginPath(); ctx.moveTo(x, y + k * 20 - 7); ctx.quadraticCurveTo(x + 5, y + k * 20, x, y + k * 20 + 5); ctx.quadraticCurveTo(x - 5, y + k * 20, x, y + k * 20 - 7); ctx.fill(); ctx.globalAlpha = 1; }
function leanAstro(x, y, s, lean, face, o) { ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.translate(-x, -y); astronaut(x, y, s, face, o); ctx.restore(); }
const walkY = (t, on) => on ? -Math.abs(Math.sin(t * 11)) * 5 : 0;
