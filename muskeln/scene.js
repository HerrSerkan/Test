// "Was wäre, wenn du mit doppelt so vielen Muskeln geboren wärst?" – Nachbau (deutsch, eigene Figuren)
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const easeOutBack = k => { const c = 1.9; k = clamp(k) - 1; return 1 + (c + 1) * k * k * k + c * k * k; };
function circle(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
const A = (side, deg) => ({ side, ang: -side * deg * Math.PI / 180 });   // Arm: 0° = unten, 90° = seitlich, 180° = oben
const Y = "#f5c53a";

// ---------------------------------------------------------------- Figuren (eigene Hautfarben, Kleidung wie im Original)
const C = {
  hero: { skin: "#c98e6a", hair: "#3a2a20", c2: "#d6403f", hood: true, legs: "#2f3a55" },
  baby: { skin: "#c98e6a", hair: "#3a2a20", c2: "#9cc8ea", legs: "#9cc8ea", shoes: "#9cc8ea" },
  baby2: { skin: "#f2c7a5", hair: "#c8442a", c2: "#9cc8ea", legs: "#9cc8ea", shoes: "#9cc8ea" },
  boy: { skin: "#f2c7a5", hair: "#6a4630", c2: "#f2b632", hood: true },
  dad: { skin: "#c98e6a", hair: "#2a1e18", c2: "#4f6380", hood: true },
  mom: { skin: "#e0a982", hair: "#5a3a26", long: true, c2: "#2a9d8f", hood: true },
  midwife: { skin: "#f6d6bd", hair: "#c8442a", c2: "#7fb0dc", collar: true },
  doc: { skin: "#a8714f", hair: "#1e1a1a", c2: "#f4f4f4", collar: true, glasses: true, legs: "#5a6070" },
  doc2: { skin: "#f2c7a5", hair: "#7a4a2a", long: true, c2: "#f4f4f4", collar: true, legs: "#5a6070" },
  teach: { skin: "#f6d6bd", hair: "#b9b9c4", long: true, c2: "#3f6db3", glasses: true },
  teach2: { skin: "#a8714f", hair: "#2a1e18", long: true, c2: "#d8608a" },
  krause: { skin: "#f2c7a5", hair: "#c0c0c8", c2: "#6e8a5a", glasses: true, collar: true },
  oma: { skin: "#f6d6bd", hair: "#e6e6ee", long: true, c2: "#9a78c8", glasses: true },
  bmom: { skin: "#f2c7a5", hair: "#e6c060", long: true, c2: "#d8404a" },
  res: { skin: "#e0a982", hair: "#5a3a26", long: true, c2: "#f4f4f4", collar: true, glasses: true },
  opa: { skin: "#e0a982", white: true, c2: "#6a7a4a", collar: true },
};
const P = (x, fy, s, base, extra = {}) => person(x, fy, Object.assign({}, base, { s }, extra));

// ---------------------------------------------------------------- Hintergründe
function stripes(c1, c2, w) { ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H); ctx.fillStyle = c2; for (let x = 0; x < W; x += w * 2) ctx.fillRect(x, 0, w, H); }
function floorWood(y) {
  ctx.fillStyle = "#b9824f"; ctx.fillRect(0, y, W, H - y);
  ctx.strokeStyle = "rgba(90,50,20,0.25)"; ctx.lineWidth = 4;
  for (let yy = y + 60; yy < H; yy += 80) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
  ctx.fillStyle = "#8f5f36"; ctx.fillRect(0, y - 14, W, 18);
}
function frameBox(x, y, w, h, col) { ctx.fillStyle = "#f4f0e8"; rr(x - 10, y - 10, w + 20, h + 20, 6); ctx.fill(); ctx.fillStyle = col; rr(x, y, w, h, 4); ctx.fill(); }
function bgHome() {
  stripes("#f3c35b", "#e9b24c", 60);
  frameBox(70, 430, 110, 110, "#5f8fd8"); frameBox(900, 390, 110, 110, "#d8648f");
  floorWood(1560);
}
function bgKita() {
  bgHome();
  const cols = ["#d84a4a", "#3f7bd8", "#f0c040", "#4aa860", "#9a5ad0"];
  for (const yy of [240, 330]) {
    ctx.strokeStyle = "#7a5a40"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, yy); ctx.quadraticCurveTo(540, yy + 40, W, yy); ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const x = 20 + i * 78, y0 = yy + Math.sin(i / 13 * Math.PI) * 30;
      ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 56, y0); ctx.lineTo(x + 28, y0 + 60); ctx.fill();
    }
  }
}
function bgNursery() {
  stripes("#b9e6d4", "#c9eedf", 46);
  ctx.fillStyle = "#2c5148"; ctx.fillRect(0, 150, W, 330); ctx.fillStyle = "#24443c"; ctx.fillRect(0, 470, W, 14);
  ctx.fillStyle = "#eef2f2"; ctx.fillRect(0, 1240, W, H - 1240);
  ctx.strokeStyle = "#d4dcdc"; ctx.lineWidth = 4; for (let x = 0; x < W; x += 130) { ctx.beginPath(); ctx.moveTo(x, 1240); ctx.lineTo(x, H); ctx.stroke(); }
  ctx.fillStyle = "#c9d4d4"; ctx.fillRect(0, 1236, W, 10);
}
function eyeChart(x, y) {
  ctx.fillStyle = "#ffffff"; rr(x - 60, y - 70, 120, 150, 6); ctx.fill();
  ctx.fillStyle = "#1e1e24";
  const rows = [[1, 22], [2, 16], [3, 12], [4, 9], [5, 7]];
  rows.forEach(([n, s], r) => { for (let i = 0; i < n; i++) ctx.fillRect(x - (n * s * 1.6) / 2 + i * s * 1.6, y - 55 + r * 26, s, s); });
}
function redCross(x, y, s) { ctx.fillStyle = "#e0453f"; ctx.fillRect(x - s / 6, y - s / 2, s / 3, s); ctx.fillRect(x - s / 2, y - s / 6, s, s / 3); }
function bgHospital() {
  ctx.fillStyle = "#cfe6f2"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f4f6f8"; ctx.fillRect(0, 1240, W, H - 1240);
  ctx.fillStyle = "#b8ccd8"; ctx.fillRect(0, 1232, W, 10);
  eyeChart(130, 600); redCross(960, 590, 110);
}
function bgStreet() {
  const g = ctx.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#9fd0f0"); g.addColorStop(1, "#d9eef8");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Fernsehturm
  ctx.fillStyle = "#9aa4b0"; ctx.fillRect(748, 300, 26, 1000); circle(761, 560, 58, "#a8b2be"); ctx.fillStyle = "#c04a4a"; ctx.fillRect(756, 230, 10, 80);
  ctx.fillStyle = "#8a94a0"; ctx.fillRect(712, 545, 98, 14);
  const bld = [[0, 860, 330, "#e89aa0"], [300, 1040, 190, "#7aa6d8"], [470, 980, 210, "#f2cc6a"], [680, 1100, 180, "#a8d08a"], [850, 920, 230, "#e8b07a"]];
  for (const [x, y, w, c] of bld) {
    ctx.fillStyle = c; ctx.fillRect(x, y, w, 1500 - y);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let yy = y + 50; yy < 1440; yy += 110) for (let xx = x + 30; xx < x + w - 40; xx += 80) ctx.fillRect(xx, yy, 44, 58);
  }
  ctx.fillStyle = "#c8c8cc"; ctx.fillRect(0, 1500, W, H - 1500);
  ctx.strokeStyle = "#b0b0b6"; ctx.lineWidth = 4; for (let x = 0; x < W; x += 180) { ctx.beginPath(); ctx.moveTo(x, 1500); ctx.lineTo(x - 80, H); ctx.stroke(); }
}
function bgKitchen() {
  ctx.fillStyle = "#cdeee0"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#b0dccb"; ctx.lineWidth = 4;
  for (let x = 0; x < W; x += 92) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1500); ctx.stroke(); }
  for (let y = 0; y < 1500; y += 92) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  fridge(800, 330, 280, 1060);
  for (let y = 1500, r = 0; y < H; y += 105, r++) for (let x = 0, c = 0; x < W; x += 105, c++) { ctx.fillStyle = (r + c) % 2 ? "#f4f2ee" : "#d9534f"; ctx.fillRect(x, y, 105, 105); }
}
function fridge(x, y, w, h) {
  ctx.fillStyle = "#e6eaee"; rr(x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = "#c4ccd4"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y + h * 0.36); ctx.lineTo(x + w, y + h * 0.36); ctx.stroke();
  ctx.fillStyle = "#a8b2bc"; rr(x + 24, y + h * 0.12, 14, h * 0.16, 7); ctx.fill(); rr(x + 24, y + h * 0.44, 14, h * 0.2, 7); ctx.fill();
}
function bgClass() {
  stripes("#f3c35b", "#e9b24c", 60);
  ctx.fillStyle = "#8a5a34"; rr(70, 300, 940, 560, 10); ctx.fill();
  ctx.fillStyle = "#2f6a4f"; ctx.fillRect(90, 320, 900, 520);
  floorWood(1560);
}
function bgSports() {
  ctx.fillStyle = "#9fd3f0"; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) circle(i * 140 + 20, 1040, 120, i % 2 ? "#4f9d4a" : "#5aae55");
  ctx.fillStyle = "#73c35c"; ctx.fillRect(0, 1060, W, H - 1060);
  ctx.fillStyle = "#c95a48"; ctx.fillRect(0, 1520, W, 260);
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 5; for (const y of [1585, 1650, 1715]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = "#73c35c"; ctx.fillRect(0, 1780, W, 140);
}
function bgMeadow() {
  ctx.fillStyle = "#a6d8f2"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#a6d97f"; ctx.beginPath(); ctx.ellipse(300, 1180, 700, 260, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#93cc6c"; ctx.beginPath(); ctx.ellipse(900, 1200, 600, 220, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#7cc05f"; ctx.fillRect(0, 1180, W, H - 1180);
  ctx.fillStyle = "#9a6a3e";
  for (let x = 30; x < W; x += 170) rr(x, 1060, 22, 230, 6), ctx.fill();
  ctx.fillRect(0, 1100, W, 18); ctx.fillRect(0, 1190, W, 18);
}
function topBand() {
  const g = ctx.createLinearGradient(0, 0, 0, 380);
  g.addColorStop(0, "rgba(28,29,40,1)"); g.addColorStop(0.45, "rgba(28,29,40,0.92)"); g.addColorStop(1, "rgba(28,29,40,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 380);
}

// ---------------------------------------------------------------- Requisiten
function dumbbell(x, y, s, rot = 0, label) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = "#8a8f9a"; rr(-34, -6, 68, 12, 6); ctx.fill();
  ctx.fillStyle = "#3a3d48"; for (const d of [-1, 1]) { rr(d * 30 - 12, -26, 24, 52, 6); ctx.fill(); rr(d * 44 - 7, -18, 14, 36, 5); ctx.fill(); }
  if (label) { ctx.fillStyle = "#fff"; ctx.font = "800 18px Pop"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; for (const d of [-1, 1]) ctx.fillText(label, d * 30, 0); }
  ctx.restore();
}
function barbell(x1, y1, x2, y2) {
  ctx.strokeStyle = "#8a8f9a"; ctx.lineWidth = 16; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x1 - 60, y1); ctx.lineTo(x2 + 60, y2); ctx.stroke();
  for (const [x, y, d] of [[x1 - 40, y1, -1], [x2 + 40, y2, 1]]) { ctx.fillStyle = "#3a3d48"; rr(x - 22, y - 70, 44, 140, 10); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "800 36px Pop"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("3", x, y); }
}
function stopSign(x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = "#6a6f78"; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, r * 0.6); ctx.lineTo(0, r * 2.6); ctx.stroke();
  const oct = (rad, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.fill(); };
  oct(r, "#ffffff"); oct(r * 0.88, "#e0453f");
  ctx.fillStyle = "#fff"; ctx.font = `800 ${r * 0.42}px Pop`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("STOPP", 0, 2);
  ctx.restore();
}
function monitor(x, y, w, h, fn) {
  ctx.fillStyle = "#5a5f6a"; ctx.fillRect(x + w / 2 - 14, y + h, 28, 90); rr(x + w / 2 - 80, y + h + 80, 160, 20, 8); ctx.fill();
  ctx.fillStyle = "#2b2f38"; rr(x - 18, y - 18, w + 36, h + 36, 16); ctx.fill();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(x, y, w, h); ctx.restore();
}
function muscle(cx, cy, rx, ry) {
  ctx.fillStyle = "#d9433f"; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,180,170,0.6)"; ctx.lineWidth = 4;
  for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.ellipse(cx, cy + k * ry * 0.22, rx * 0.92, ry * 0.12, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
}
function jar(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "rgba(230,240,250,0.85)"; rr(-34, -40, 68, 86, 12); ctx.fill();
  ctx.fillStyle = "#c8343e"; rr(-30, -18, 60, 60, 10); ctx.fill();
  ctx.fillStyle = "#f4f0e8"; ctx.fillRect(-30, -6, 60, 18);
  ctx.fillStyle = "#d84a4a"; rr(-38, -56, 76, 20, 6); ctx.fill();
  ctx.restore();
}
function football(x, y, r) {
  circle(x, y, r, "#ffffff"); ctx.strokeStyle = "#222"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  circle(x, y, r * 0.3, "#222"); for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; circle(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, r * 0.2, "#222"); }
}
function table(y, label) {
  ctx.fillStyle = "#a8743f"; ctx.fillRect(140, y, 800, 30); ctx.fillStyle = "#93622f"; ctx.fillRect(160, y + 30, 760, H - y);
  ctx.strokeStyle = "rgba(60,30,10,0.2)"; ctx.lineWidth = 4; for (let yy = y + 90; yy < H; yy += 90) { ctx.beginPath(); ctx.moveTo(160, yy); ctx.lineTo(920, yy); ctx.stroke(); }
}
function clasp(x1, y1, x2, y2, mx, my, col1, col2, skin1, skin2) {
  ctx.lineCap = "round"; ctx.lineWidth = 46;
  ctx.strokeStyle = col1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx - 10, my + 70); ctx.stroke();
  ctx.strokeStyle = col2; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(mx + 10, my + 70); ctx.stroke();
  ctx.lineWidth = 30; ctx.strokeStyle = skin1; ctx.beginPath(); ctx.moveTo(mx - 10, my + 70); ctx.lineTo(mx - 8, my + 6); ctx.stroke();
  ctx.strokeStyle = skin2; ctx.beginPath(); ctx.moveTo(mx + 10, my + 70); ctx.lineTo(mx + 8, my + 6); ctx.stroke();
  circle(mx, my, 30, skin1); circle(mx + 6, my - 4, 22, skin2);
}
function cow(x, y, s, flip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  ctx.fillStyle = "#f2f2f6";
  for (const lx of [-95, -55, 60, 100]) rr(lx - 16, 40, 32, 120, 10), ctx.fill();
  ctx.fillStyle = "#333"; for (const lx of [-95, -55, 60, 100]) ctx.fillRect(lx - 16, 150, 32, 14);
  ctx.fillStyle = "#f2f2f6"; ctx.beginPath(); ctx.ellipse(0, 0, 160, 95, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e6e6ee"; for (const [mx, my, r] of [[-70, -30, 52], [10, -40, 56], [85, -20, 54], [-30, 30, 50], [60, 34, 46]]) { ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#9aa2c0"; for (const [mx, my, r] of [[-40, -20, 30], [70, 10, 34]]) { ctx.beginPath(); ctx.ellipse(mx, my, r, r * 0.8, 0.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#f2f2f6"; ctx.beginPath(); ctx.ellipse(-170, -40, 55, 46, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2b8c0"; ctx.beginPath(); ctx.ellipse(-205, -24, 30, 22, -0.2, 0, Math.PI * 2); ctx.fill();
  circle(-178, -56, 7, "#222"); ctx.fillStyle = "#e6e0d0"; ctx.beginPath(); ctx.ellipse(-150, -84, 16, 8, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function hound(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#c8a070"; ctx.lineWidth = 16; ctx.lineCap = "round";
  for (const [a, b] of [[-60, -40], [-30, -20], [60, 70], [85, 95]]) { ctx.beginPath(); ctx.moveTo(a, 10); ctx.lineTo(b, 120); ctx.stroke(); }
  ctx.fillStyle = "#c8a070"; ctx.beginPath(); ctx.ellipse(10, 0, 110, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b88e5e"; for (const [mx, my, r] of [[-50, 5, 38], [60, 0, 40]]) { ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#c8a070"; ctx.beginPath(); ctx.moveTo(-90, -20); ctx.lineTo(-130, -90); ctx.lineTo(-100, -100); ctx.lineTo(-60, -30); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-140, -100, 40, 22, -0.3, 0, Math.PI * 2); ctx.fill();
  circle(-150, -106, 5, "#222"); circle(-176, -94, 6, "#333");
  ctx.strokeStyle = "#c8a070"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(115, -10); ctx.quadraticCurveTo(160, -40, 170, 20); ctx.stroke();
  ctx.restore();
}
function balu(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#d9a066"; ctx.beginPath(); ctx.ellipse(0, 40, 70, 80, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f6efe4"; ctx.beginPath(); ctx.ellipse(0, 60, 38, 60, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d9a066"; for (const d of [-1, 1]) { rr(d * 34 - 14, 70, 28, 60, 12); ctx.fill(); }
  ctx.fillStyle = "#f6efe4"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 34, 128, 20, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#d84040"; rr(-46, -22, 92, 14, 6); ctx.fill(); circle(0, -6, 8, "#f0c040");
  const hy = -70 + (o.down ? 16 : 0);
  ctx.fillStyle = "#d9a066"; ctx.beginPath(); ctx.ellipse(0, hy, 58, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a5a32"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 56, hy + 16, 20, 44, d * 0.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#f6efe4"; ctx.beginPath(); ctx.ellipse(0, hy + 24, 30, 24, 0, 0, Math.PI * 2); ctx.fill();
  circle(0, hy + 10, 9, "#2a2226");
  const ey = hy - 12 + (o.down ? 8 : 0);
  if (o.angry) { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 4; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 30, ey - 14); ctx.lineTo(d * 10, ey - 8); ctx.stroke(); } }
  for (const d of [-1, 1]) { circle(d * 20, ey, 9, "#fff"); circle(d * 20, ey + (o.down ? 4 : 1), 5, "#2a2226"); }
  if (o.dumbbell) dumbbell(-70, 40, 0.8, 0.3);
  ctx.restore();
}
function popWord(txt, x, y, size, rot, t, t0, style = "y") {
  if (t < t0) return;
  const k = easeOutBack((t - t0) / 0.25);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `800 ${size}px Pop`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = "#3a2a18"; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = style === "y" ? Y : "#f6eedd"; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
function speech(lines, x, y, w, h, tx, ty) {
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#222"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 20, y + h / 2 - 8); ctx.lineTo(tx, ty); ctx.lineTo(x + 24, y + h / 2 - 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, y, w / 2 - 4, h / 2 - 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1e1e24"; ctx.font = "800 46px Pop"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * 56));
}
function card(x, y, w, h, fn, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.15)"; rr(-w / 2 + 8, -h / 2 + 10, w, h, 10); ctx.fill();
  ctx.fillStyle = "#fffdf6"; rr(-w / 2, -h / 2, w, h, 10); ctx.fill(); fn(w, h); ctx.restore();
}
function txt(s, x, y, size, col = "#1e1e24", w = 800) { ctx.fillStyle = col; ctx.font = `${w} ${size}px Pop`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); }
function bib(x, y, u) { ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x, y, 26 * u, 18 * u, 0, 0, Math.PI * 2); ctx.fill(); circle(x, y + 2 * u, 6 * u, "#f0c040"); }

// ---------------------------------------------------------------- Szenen (lt = Zeit seit Szenenbeginn, d = Szenenlänge)
const SC = {
  flex(lt) { bgNursery(); const r = P(560, 2040, 2.7, C.baby, { f: "smile", arm: [A(-1, 20), A(1, 150)] }); bib(r.hx, r.hy + 50 * r.u, r.u); dumbbell(r.hands[1][0], r.hands[1][1] - 10, 1.4, 0.2); P(900, 1980, 1.5, C.baby2, { f: "wide", look: -1, arm: [A(1, 160), A(-1, 20)] }); },
  lift(lt) { bgNursery(); const up = ss(0, 0.5, lt); const r = P(540, 2040, 2.9, C.baby, { f: "smile", arm: [A(-1, lerp(120, 165, up)), A(1, lerp(120, 165, up))] }); bib(r.hx, r.hy + 50 * r.u, r.u); barbell(r.hands[-1][0], r.hands[-1][1], r.hands[1][0], r.hands[1][1]); },
  rings(lt) { bgNursery(); const sw = Math.sin(lt * 2.4) * 18; const r = P(540 + sw, 2000, 2.8, C.baby, { f: "happy", arm: [A(-1, 158), A(1, 158)] }); bib(r.hx, r.hy + 50 * r.u, r.u);
    ctx.strokeStyle = "#c79a5a"; ctx.lineWidth = 8; for (const d of [-1, 1]) { const h = r.hands[d]; ctx.beginPath(); ctx.moveTo(h[0] - sw * 0.4, 150); ctx.lineTo(h[0], h[1] - 34); ctx.stroke(); ctx.strokeStyle = "#5a4630"; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(h[0], h[1], 34, 0, 7); ctx.stroke(); ctx.strokeStyle = "#c79a5a"; ctx.lineWidth = 8; } },
  midwife(lt) { bgNursery(); P(540, 2050, 3.2, C.midwife, { f: "wide", arm: [A(-1, 168), A(1, 168)] }); },
  berlin(lt) { bgStreet(); const r = P(400, 2080, 3.0, C.baby, { f: "smile", look: 1 }); bib(r.hx, r.hy + 50 * r.u, r.u); },
  docs(lt) { bgHospital(); P(220, 1980, 2.0, C.doc, { f: "wide", look: 1 }); P(860, 1980, 2.0, C.doc2, { f: "wide", look: -1 });
    const k = ss(0, 0.6, lt); ctx.save(); ctx.globalAlpha = 0.9; const r = P(540, 1880, 2.3, C.baby, { f: "smile", legs: "#7fb0dc" }); ctx.restore();
    ctx.fillStyle = "rgba(240,248,255,0.6)"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(540 + d * 34 * r.u, 1880 - 60 * r.u, 22 * r.u * (1 + 0.3 * k), 50 * r.u, 0, 0, Math.PI * 2); ctx.fill(); } },
  ultra(lt) { bgHospital(); monitor(300, 520, 480, 380, (x, y, w, h) => { ctx.fillStyle = "#14161c"; ctx.fillRect(x, y, w, h); ctx.fillStyle = "#3a404c"; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 30); ctx.lineTo(x + w - 60, y + h - 30); ctx.lineTo(x + 60, y + h - 30); ctx.fill(); ctx.strokeStyle = "#e6ecf4"; ctx.lineWidth = 10; for (let i = 0; i < 5; i++) { const yy = y + 150 + i * 36; ctx.beginPath(); ctx.moveTo(x + w / 2 - 50 - i * 26, yy); ctx.lineTo(x + w / 2 + 50 + i * 26, yy); ctx.stroke(); } });
    P(300, 2040, 2.0, C.doc, { f: "wide", look: 1, arm: [A(1, 100)] }); },
  compare(lt) { bgHospital(); card(540, 700, 760, 520, (w, h) => {
      ctx.strokeStyle = "#2b2f38"; ctx.lineWidth = 10; rr(-w / 2, -h / 2, w, h, 10); ctx.stroke();
      const k = ss(0.3, 1.2, lt);
      for (const [x, r, l] of [[-190, 80, "ANDERE BABYS"], [190, 80 + 70 * k, "DIESES BABY"]]) { circle(x, -20, r + 20, "#f2b8a8"); circle(x, -20, r, "#e0453f"); circle(x, -20, r * 0.35, "#f2b8a8"); txt(l, x, 200, 30); }
    }); P(540, 2080, 1.9, C.baby, { f: "wide" }); },
  boy45(lt) { bgHospital(); const r = P(540, 2060, 3.0, C.boy, { f: "smile", arm: [A(-1, 25), A(1, 25)] }); dumbbell(r.hands[-1][0], r.hands[-1][1] + 20, 1.3, 1.5708, "3"); dumbbell(r.hands[1][0], r.hands[1][1] + 20, 1.3, 1.5708, "3"); },
  arms(lt) { bgHospital(); const k = ss(0, 0.5, lt); const r = P(540, 2060, 3.0, C.boy, { f: "smile", arm: [A(-1, lerp(25, 92, k)), A(1, lerp(25, 92, k))] }); dumbbell(r.hands[-1][0], r.hands[-1][1], 1.3, 1.5708, "3"); dumbbell(r.hands[1][0], r.hands[1][1], 1.3, 1.5708, "3"); },
  myo(lt) { bgHospital(); monitor(170, 480, 740, 470, (x, y, w, h) => { muscle(x + w / 2, y + h / 2, 210, 70); ctx.fillStyle = "#e0a982"; for (const d of [-1, 1]) { rr(x + w / 2 + d * 260 - 40, y + h / 2 - 22, 80, 44, 22); ctx.fill(); } ctx.fillStyle = "#c9c9d2"; for (const d of [-1, 1]) { rr(x + w / 2 + d * 330 - 40, y + h / 2 - 30, 80, 60, 20); ctx.fill(); } });
    P(560, 2160, 1.7, C.doc, { f: "neutral" }); },
  stopdoc(lt) { bgHospital(); const r = P(460, 2080, 3.1, C.doc, { f: "smile", arm: [A(-1, 15), A(1, 140)] }); stopSign(r.hands[1][0] + 30, r.hands[1][1] - 80, 95, 0.05); },
  nobrake(lt) { bgHome(); const r = P(540, 2060, 3.1, C.hero, { f: "wide", arm: [A(-1, 20), A(1, 70)] }); const k = ss(0.1, 0.8, lt); stopSign(r.hands[1][0] + 60 + 260 * k, r.hands[1][1] + 300 * k * k, 70, 0.4 + k * 1.6); },
  ball(lt) { bgHospital(); const k = ss(0, 1.8, lt); monitor(170, 480, 740, 480, (x, y, w, h) => { circle(x + w / 2, y + h / 2, 120 + 110 * k, "#d9433f"); ctx.strokeStyle = "rgba(255,180,170,0.55)"; ctx.lineWidth = 5; const R = 120 + 110 * k; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2 + i * R * 0.22, R * 0.95, R * 0.12, 0, 0.2, Math.PI - 0.2); ctx.stroke(); } ctx.fillStyle = "#e0a982"; for (const d of [-1, 1]) { rr(x + w / 2 + d * (R + 40) - 40, y + h / 2 - 22, 80, 44, 22); ctx.fill(); } });
    P(540, 2160, 1.8, C.hero, { f: "wide" }); },
  kita(lt) { bgKita(); P(800, 2000, 2.3, C.teach, { f: lt > 1.0 ? "wide" : "smile", look: -1 }); const r = P(330, 2040, 2.5, C.hero, { f: "smile", arm: [A(-1, 20), A(1, 60)] }); jar(r.hands[1][0] + 10, r.hands[1][1] - 40, 1.5); },
  jars(lt) { bgKita(); P(330, 1880, 2.1, C.teach, { f: "smile" }); P(800, 1880, 2.1, C.teach2, { f: "smile" }); table(1500); for (let i = 0; i < 9; i++) jar(190 + i * 88, 1440, 1.0); },
  dad(lt) { bgKitchen(); const r = P(480, 2040, 3.0, C.dad, { f: "smile", arm: [A(-1, 20), A(1, 130)] }); football(150, 1640, 70); },
  wrestle1(lt) { bgKitchen(); P(300, 1720, 2.3, C.hero, { f: "smile" }); P(800, 1720, 2.3, C.dad, { f: lt > 0.4 ? "wide" : "smile" }); table(1450); const k = ss(0.15, 0.4, lt);
    clasp(400, 1250, 680, 1250, 540 + 120 * k, 1320 + 60 * k, C.hero.c2, C.dad.c2, C.hero.skin, C.dad.skin); },
  dadmad(lt) { bgKitchen(); P(540, 2080, 3.3, C.dad, { f: "annoyed", arm: [A(-1, 20), A(1, 150)] }); },
  wrestle2(lt) { bgKitchen(); P(300, 1720, 2.3, C.hero, { f: "smile" }); P(800, 1720, 2.3, C.dad, { f: "wide" }); table(1450); const k = ss(0.05, 0.25, lt);
    clasp(400, 1250, 680, 1250, 540 + 120 * k, 1320 + 60 * k, C.hero.c2, C.dad.c2, C.hero.skin, C.dad.skin); },
  price(lt) { bgHome(); P(540, 2060, 3.2, C.hero, { f: "sad" }); },
  pencil(lt) { bgClass(); const r = P(520, 2060, 3.0, C.hero, { f: lt > 1.3 ? "wide" : "smile", blush: true, arm: [A(-1, 20), A(1, 60)] }); const h = r.hands[1];
    const broke = lt > 1.25; ctx.save(); ctx.translate(h[0], h[1]); ctx.strokeStyle = "#f0c040"; ctx.lineWidth = 20; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-150, broke ? 60 : 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(150, broke ? 60 : 0); ctx.stroke(); ctx.restore(); },
  shake(lt) { bgClass(); const a = P(300, 1980, 2.4, C.hero, { f: "smile", arm: [A(-1, 15), A(1, 75)] }); const b = P(780, 1980, 2.4, C.krause, { f: lt > 0.8 ? "wide" : "smile", arm: [A(-1, 75), A(1, 15)] }); circle((a.hands[1][0] + b.hands[-1][0]) / 2, (a.hands[1][1] + b.hands[-1][1]) / 2, 30, C.hero.skin); },
  sling(lt) { bgClass(); ctx.strokeStyle = "#f4f4f4"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(300, 560); ctx.lineTo(350, 620); ctx.lineTo(440, 480); ctx.stroke();
    const r = P(620, 2040, 2.8, C.krause, { f: "sad", arm: [A(-1, 150), A(1, 40)] }); ctx.fillStyle = "#f4f4f4"; ctx.beginPath(); ctx.moveTo(r.hands[1][0] - 80, r.hands[1][1] - 120); ctx.lineTo(r.hands[1][0] + 60, r.hands[1][1] + 10); ctx.lineTo(r.hands[1][0] - 90, r.hands[1][1] + 40); ctx.fill();
    ctx.fillStyle = "#f4f4f4"; rr(r.hands[-1][0] - 6, r.hands[-1][1] - 40, 12, 40, 4); ctx.fill(); },
  hug(lt) { bgHome(); P(700, 2020, 2.7, C.oma, { f: "happy", look: -1 }); P(380, 2020, 2.7, C.hero, { f: "sad", look: 1, arm: [A(1, 75)] }); },
  careful(lt) { bgHome(); P(540, 2060, 3.2, C.hero, { f: "sad", blush: true }); ctx.fillStyle = "rgba(255,255,255,0.8)"; for (const [x, y] of [[260, 1000], [830, 960], [300, 760]]) { const s = 10 + 4 * Math.sin(lt * 6 + x); ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.3, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.3, y); ctx.fill(); } },
  bjs(lt) { bgSports(); card(330, 470, 420, 90, (w, h) => txt("BUNDESJUGENDSPIELE", 0, 4, 30, "#d84040")); const r = P(540, 2060, 3.0, C.hero, { f: "smile", arm: [A(-1, 20), A(1, 140)] }); circle(r.hands[1][0], r.hands[1][1] - 30, 34, "#e8743a"); },
  throw(lt) { bgSports(); const k = ss(0, 0.35, lt); const r = P(460, 2060, 3.0, C.hero, { f: "laugh", arm: [A(-1, 20), A(1, lerp(150, 60, k))] }); const bx = lerp(r.hands[1][0], 1200, ss(0.3, 1.1, lt)), by = lerp(r.hands[1][1], 300, ss(0.3, 1.1, lt)); circle(bx, by, 30, "#e8743a"); },
  arc(lt) { bgSports(); ctx.fillStyle = "#9a6a3e"; rr(560, 820, 300, 260, 10); ctx.fill(); ctx.fillStyle = "#7a4f2c"; ctx.fillRect(540, 800, 340, 40); txt("TURNHALLE", 710, 960, 30, "#f4ead8");
    ctx.strokeStyle = "#9aa0a8"; ctx.lineWidth = 4; for (let x = 240; x < 420; x += 18) { ctx.beginPath(); ctx.moveTo(x, 1000); ctx.lineTo(x, 1090); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(240, 1010); ctx.lineTo(420, 1010); ctx.stroke();
    const k = ss(0, 1.6, lt); ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 5; ctx.setLineDash([16, 14]); ctx.beginPath(); for (let i = 0; i <= 40 * k; i++) { const u = i / 40; const x = -40 + u * 1200, y = 1200 - Math.sin(u * Math.PI) * 820; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    { const u = k; circle(-40 + u * 1200, 1200 - Math.sin(u * Math.PI) * 820, 22, "#e8743a"); }
    P(330, 1900, 1.5, C.krause, { f: "wide", look: 1 }); },
  weite(lt) { bgSports(); card(330, 760, 330, 330, (w, h) => { txt("WEITE:", 0, -70, 46); txt("? m", 0, 50, 90, "#d84040"); }, -0.04); P(800, 1950, 1.7, C.krause, { f: "sad", look: -1 }); },
  urkunde(lt) { bgSports(); card(740, 800, 380, 500, (w, h) => { ctx.strokeStyle = "#e8b84a"; ctx.lineWidth = 10; rr(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 8); ctx.stroke(); txt("URKUNDE", 0, -170, 42); ctx.fillStyle = "#9aa0a8"; for (let i = 0; i < 4; i++) ctx.fillRect(-120, -80 + i * 50, 240, 8); circle(0, 170, 36, "#d84040"); }, 0.05);
    ctx.strokeStyle = "#d84040"; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(580, 580); ctx.lineTo(900, 1020); ctx.moveTo(900, 580); ctx.lineTo(580, 1020); ctx.globalAlpha = ss(0.4, 0.7, lt); ctx.stroke(); ctx.globalAlpha = 1;
    P(320, 2060, 2.8, C.hero, { f: "sad" }); },
  meadow(lt) { bgMeadow(); P(540, 2060, 3.1, C.hero, { f: "smile" }); },
  cow(lt) { bgMeadow(); cow(560 - lt * 20, 1250, 1.9); },
  dogs(lt) { bgMeadow(); cow(700, 1120, 1.1); hound(520, 1450, 1.6); },
  photos(lt) { bgHome(); frameBox(110, 600, 340, 260, "#a6d97f"); ctx.save(); ctx.beginPath(); ctx.rect(110, 600, 340, 260); ctx.clip(); cow(280, 760, 0.7); ctx.restore();
    frameBox(630, 600, 340, 260, "#a6d97f"); ctx.save(); ctx.beginPath(); ctx.rect(630, 600, 340, 260); ctx.clip(); hound(800, 750, 0.75); ctx.restore();
    balu(540, 1560, 1.7, { }); },
  baludown(lt) { bgHome(); balu(540, 1440, 2.6, { down: true }); },
  bmom(lt) { bgStreet(); P(330, 2060, 2.4, C.boy, { f: "smile" }); P(760, 2060, 3.0, C.bmom, { f: "smile" }); },
  dna(lt) { bgStreet(); card(540, 640, 220, 420, (w, h) => { for (let i = 0; i < 14; i++) { const y = -180 + i * 27; const a = Math.sin(i * 0.55 + lt * 2) * 60; ctx.strokeStyle = "#c9c9d2"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-a, y); ctx.lineTo(a, y); ctx.stroke(); circle(-a, y, 9, "#e0453f"); circle(a, y, 9, "#3f7bd8"); } });
    P(330, 2100, 2.4, C.boy, { f: "smile" }); P(760, 2100, 3.0, C.bmom, { f: "smile" }); },
  athlete(lt) { bgSports(); P(560, 2080, 3.2, C.bmom, { f: "laugh", arm: [A(-1, 150), A(1, 150)] }); },
  fridge(lt) { bgHome(); const k = ss(0, 0.6, lt); const r = P(560, 2080, 2.7, C.mom, { f: "smile", arm: [A(-1, 168), A(1, 168)] }); fridge(r.hands[-1][0] - 20, r.hands[-1][1] - 560 * k - 40 + 560 * k - 520, 300, 520); },
  fridgesay(lt) { bgHome(); const r = P(560, 2080, 2.7, C.mom, { f: "smile", arm: [A(-1, 168), A(1, 168)] }); fridge(r.hands[-1][0] - 20, r.hands[-1][1] - 560, 300, 520); if (lt > 0.9) speech(["Der stand", "im Weg."], 330, 700, 470, 250, 470, 930); },
  kdad(lt) { bgKitchen(); P(480, 2060, 3.1, C.dad, { f: "laugh", arm: [A(-1, 20), A(1, 150)] }); },
  wrestle3(lt) { bgKitchen(); P(300, 1720, 2.3, C.mom, { f: "smile" }); P(800, 1720, 2.3, C.dad, { f: "smile" }); table(1450); clasp(400, 1250, 680, 1250, 540 + Math.sin(lt * 20) * 6, 1300, C.mom.c2, C.dad.c2, C.mom.skin, C.dad.skin); },
  momwins(lt) { bgKitchen(); P(300, 1720, 2.3, C.mom, { f: "smile" }); P(800, 1720, 2.3, C.dad, { f: lt > 0.25 ? "wide" : "smile" }); table(1450); const k = ss(0.0, 0.15, lt);
    clasp(400, 1250, 680, 1250, 540 + 120 * k, 1320 + 60 * k, C.mom.c2, C.dad.c2, C.mom.skin, C.dad.skin); },
  research(lt) { bgHospital(); P(420, 2080, 3.0, C.res, { f: "smile", look: 1 }); for (const [x, y, r] of [[700, 1080, 14], [740, 1000, 22]]) circle(x, y, r, "#fff"); circle(820, 820, 130, "#fff"); stopSign(820, 820, 70, 0); txt("?", 820, 820, 70, "#fff"); },
  opa(lt) { bgHome(); const up = 0.5 + 0.5 * Math.sin(lt * 3); const r = P(540, 2060, 3.0, C.opa, { f: "smile", arm: [A(-1, 20), A(1, lerp(40, 140, up))] }); dumbbell(r.hands[1][0], r.hands[1][1], 1.0, 1.5708); },
  train(lt) { bgHome(); const up = 0.5 + 0.5 * Math.sin(lt * 5); const r = P(540, 2060, 3.1, C.dad, { f: "annoyed", arm: [A(-1, lerp(40, 140, 1 - up)), A(1, lerp(40, 140, up))] }); dumbbell(r.hands[-1][0], r.hands[-1][1], 1.2, 1.5708); dumbbell(r.hands[1][0], r.hands[1][1], 1.2, 1.5708); },
  balu(lt) { bgHome(); P(330, 1720, 2.3, C.dad, { f: "annoyed" }); table(1450); balu(780, 1300, 1.3, { angry: true }); clasp(420, 1250, 720, 1330, 560 + Math.sin(lt * 18) * 8, 1300, C.dad.c2, "#d9a066", C.dad.skin, "#d9a066"); },
  score(lt) { bgHome(); P(330, 1720, 2.3, C.dad, { f: "annoyed" }); table(1450); balu(780, 1300, 1.3, { angry: true }); clasp(420, 1250, 720, 1330, 560 + Math.sin(lt * 18) * 8, 1300, C.dad.c2, "#d9a066", C.dad.skin, "#d9a066");
    ctx.fillStyle = "#23232c"; rr(240, 420, 600, 120, 16); ctx.fill(); ctx.strokeStyle = "#5a5a66"; ctx.lineWidth = 6; ctx.stroke(); txt("PAPA 0 : 0 BALU", 540, 484, 56, Y); },
};

// Wo die Comic-Wörter stehen
const POPPOS = {
  "DOPPELTE MUSKELN": [330, 1700, 62, 0.12, "y"], "DOKTOR!": [720, 560, 84, 0.1, "c"], "4,5 JAHRE": [560, 560, 72, 0.06, "y"],
  "2 x 3 KG": [560, 1620, 64, 0.1, "y"], "PLOPP": [600, 560, 66, 0.05, "c"], "ZACK!": [560, 560, 84, 0.08, "c"],
  "2 SEKUNDEN": [540, 1680, 62, 0.03, "y"], "1 SEKUNDE": [540, 1680, 62, 0.03, "y"], "KRACKS": [600, 640, 70, -0.06, "c"],
  "ZISCH!": [680, 560, 70, 0.25, "c"], "HMPF.": [760, 760, 64, -0.06, "c"],
};

function caption(t) {
  const c = TL.caps.find(c => t >= c.t0 - 0.05 && t < c.t1 + 0.05);
  if (!c) return;
  ctx.font = "800 70px Pop"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  const sp = ctx.measureText(" ").width * 1.5;
  const widths = c.w.map(w => ctx.measureText(w).width);
  let lines = [[0, c.w.length]];
  const total = widths.reduce((a, b) => a + b, 0) + sp * (c.w.length - 1);
  if (total > 980 && c.w.length > 1) lines = [[0, c.w.length - 1], [c.w.length - 1, c.w.length]];
  const k = easeOutBack((t - c.t0) / 0.18);
  ctx.save(); ctx.translate(540, 132); ctx.scale(k, k); ctx.translate(-540, -132);
  lines.forEach(([a, b], li) => {
    const lw = widths.slice(a, b).reduce((p, q) => p + q, 0) + sp * (b - a - 1);
    let x = 540 - lw / 2; const y = 132 + li * 80 - (lines.length - 1) * 40;
    for (let i = a; i < b; i++) {
      ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillText(c.w[i], x + 3, y + 4);
      ctx.fillStyle = i === c.hl ? Y : "#ffffff"; ctx.fillText(c.w[i], x, y);
      x += widths[i] + sp;
    }
  });
  ctx.restore();
}

function frame(t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sh = TL.shots.find(s => t >= s.t0 && t < s.t1) || TL.shots[TL.shots.length - 1];
  const lt = t - sh.t0, d = sh.t1 - sh.t0;
  const z = 1 + 0.035 * clamp(lt / Math.max(d, 0.5));
  ctx.save(); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100);
  SC[sh.id](lt, d);
  for (const p of TL.pops) {
    if (t < p.t || p.t < sh.t0 - 0.05 || p.t >= sh.t1) continue;
    const [x, y, s, r, st] = POPPOS[p.text]; popWord(p.text, x, y, s, r, t, p.t, st);
  }
  ctx.restore();
  topBand();
  caption(t);
}

window.setup = async () => {
  await Promise.all([600, 700, 800].map(w => document.fonts.load(`${w} 20px Pop`)));
  return { duration: TL.duration };
};
window.renderFrame = frame;
