// Planet aus Tag 8 (pinker Sand, Ringplanet, Kristalle, Höhle, Apple Store) – automatisch aus mars8/tag8.js übernommen
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
function card(fn, y) { ctx.save(); ctx.translate(SX, y); ctx.scale(0.88, 0.88); ctx.translate(-288, -y); fn(); ctx.restore(); }
