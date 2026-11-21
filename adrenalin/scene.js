// "Was wäre, wenn dein Adrenalin zehnmal stärker wäre?" – Nachbau (deutsch)
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const easeOutBack = k => { const c = 1.9; k = clamp(k) - 1; return 1 + (c + 1) * k * k * k + c * k * k; };
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function txt(s, x, y, size, col = "#1e1e24", w = 800, align = "center") { ctx.fillStyle = col; ctx.font = `${w} ${size}px Pop`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); }
const OUT = "#3b2316";
let T = 0;

// ---------------------------------------------------------------- Figur im Comic-Stil
const HERO = { body: "#27a6a3", hood: true, hair: "#8a5a34" };
const MAJA = { body: "#7b4bc4", vneck: true, hair: "#6a3e24" };
const KID = { body: "#d84040", hair: "#8a5a34", cap: "#d84040" };
const KID2 = { body: "#f0a030", hair: "#8a5a34" };
const DRIVER = { body: "#6a6f7a", hood: true, hair: "#2a1e18" };
const SPORT = { body: "#d84040", hair: "#8a5a34" };

function heartShape(x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9); ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); ctx.fill();
}
function line(pts, w, col = OUT) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }

// o: {face, look, arms:[angL, angR] in Grad (0 = unten, 90 = seitlich, 180 = oben), heart, sweat, shake, sit, jump, legs:"run"}
function guy(x, fy, s, base, o = {}) {
  const sh = o.shake ? Math.sin(T * 70) * 2.5 * s : 0;
  x += sh; fy -= (o.jump || 0);
  const bodyY = fy - (o.sit ? 120 : 190) * s, headY = bodyY - 175 * s, R = 66 * s;
  // Beine
  if (o.sit) { line([[x - 22 * s, bodyY + 70 * s], [x - 40 * s, fy - 30 * s], [x - 90 * s, fy]], 7 * s); line([[x + 22 * s, bodyY + 70 * s], [x + 50 * s, fy - 30 * s], [x + 100 * s, fy]], 7 * s); }
  else if (o.legs === "run") { const p = Math.sin(T * 18); line([[x - 16 * s, bodyY + 70 * s], [x - 16 * s + p * 40 * s, fy - 50 * s], [x - 20 * s + p * 60 * s, fy]], 7 * s); line([[x + 16 * s, bodyY + 70 * s], [x + 16 * s - p * 40 * s, fy - 50 * s], [x + 20 * s - p * 60 * s, fy]], 7 * s); }
  else { line([[x - 18 * s, bodyY + 70 * s], [x - 22 * s, fy]], 7 * s); line([[x + 18 * s, bodyY + 70 * s], [x + 22 * s, fy]], 7 * s); line([[x - 22 * s, fy], [x - 40 * s, fy]], 8 * s); line([[x + 22 * s, fy], [x + 40 * s, fy]], 8 * s); }
  // Arme
  const arms = o.arms || [12, 12];
  [-1, 1].forEach((sd, i) => {
    const a = arms[i] * Math.PI / 180, shx = x + sd * 50 * s, shy = bodyY - 40 * s;
    const ex = shx + sd * Math.sin(a) * 70 * s, ey = shy + Math.cos(a) * 70 * s;
    const hx = ex + sd * Math.sin(a + (o.bend ? o.bend[i] : 0.15)) * 60 * s, hy = ey + Math.cos(a + (o.bend ? o.bend[i] : 0.15)) * 60 * s;
    line([[shx, shy], [ex, ey], [hx, hy]], 7 * s);
  });
  // Körper (Bohnenform)
  ctx.fillStyle = base.body; ctx.strokeStyle = OUT; ctx.lineWidth = 6 * s;
  ctx.beginPath(); ctx.ellipse(x, bodyY, 62 * s, 95 * s, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.ellipse(x - 22 * s, bodyY - 20 * s, 18 * s, 50 * s, 0, 0, 7); ctx.fill();
  if (base.hood) {
    ctx.strokeStyle = "rgba(20,60,60,0.55)"; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.ellipse(x, bodyY - 80 * s, 40 * s, 14 * s, 0, 0, Math.PI); ctx.stroke();
    line([[x - 10 * s, bodyY - 66 * s], [x - 12 * s, bodyY - 24 * s]], 4 * s, "#f4f0ea"); line([[x + 10 * s, bodyY - 66 * s], [x + 12 * s, bodyY - 24 * s]], 4 * s, "#f4f0ea");
    ctx.strokeStyle = "rgba(20,60,60,0.55)"; ctx.lineWidth = 4 * s; rr(x - 32 * s, bodyY + 20 * s, 64 * s, 36 * s, 10 * s); ctx.stroke();
  }
  if (base.vneck) line([[x - 22 * s, bodyY - 86 * s], [x, bodyY - 50 * s], [x + 22 * s, bodyY - 86 * s]], 5 * s, "#f4f0ea");
  if (o.heart) { const b = 1 + 0.18 * Math.max(0, Math.sin(T * (o.heartRate || 9))); heartShape(x, bodyY - 30 * s, 22 * s * b, "#e8323a"); }
  // Kopf
  ctx.fillStyle = "#fbf6ef"; ctx.strokeStyle = OUT; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(x, headY, R, 0, 7); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(x, headY, R - 3 * s, 0, 7); ctx.clip();
  ctx.fillStyle = base.hair; ctx.beginPath(); ctx.moveTo(x - R, headY - 10 * s); ctx.quadraticCurveTo(x - 30 * s, headY - 34 * s, x + 6 * s, headY - 30 * s);
  ctx.quadraticCurveTo(x + 40 * s, headY - 40 * s, x + R, headY - 18 * s); ctx.lineTo(x + R, headY - R); ctx.lineTo(x - R, headY - R); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = OUT; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(x, headY, R, 0, 7); ctx.stroke();
  if (base.cap) { ctx.fillStyle = base.cap; ctx.beginPath(); ctx.arc(x, headY - 8 * s, R * 0.98, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); rr(x - 10 * s, headY - 30 * s, 90 * s, 14 * s, 6 * s); ctx.fill(); }
  face(x + (o.look || 0) * 10 * s, headY + 6 * s, s, o.face || "neutral");
  if (o.sweat) { ctx.fillStyle = "#7cc8f2"; ctx.beginPath(); ctx.moveTo(x + 40 * s, headY - 46 * s); ctx.quadraticCurveTo(x + 52 * s, headY - 26 * s, x + 40 * s, headY - 22 * s); ctx.quadraticCurveTo(x + 28 * s, headY - 26 * s, x + 40 * s, headY - 46 * s); ctx.fill(); }
  if (o.shake) for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { ctx.strokeStyle = OUT; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(x + sd * (R + 18 * s + k * 14 * s), headY, 16 * s, sd > 0 ? -0.6 : Math.PI - 0.6, sd > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke(); }
  return { x, headY, bodyY, R };
}

function face(x, y, s, f) {
  ctx.strokeStyle = OUT; ctx.fillStyle = OUT; ctx.lineCap = "round"; ctx.lineWidth = 5 * s;
  const ex = [x - 22 * s, x + 22 * s];
  const brows = (k) => { for (const [i, e] of ex.entries()) { const sd = i ? 1 : -1; ctx.beginPath(); ctx.moveTo(e - 10 * s, y - 24 * s + sd * k * s); ctx.lineTo(e + 10 * s, y - 24 * s - sd * k * s); ctx.stroke(); } };
  const dots = (r = 5) => ex.forEach(e => circle(e, y - 4 * s, r * s, OUT));
  if (f === "neutral") { dots(); line([[x - 10 * s, y + 24 * s], [x + 10 * s, y + 24 * s]], 5 * s); }
  else if (f === "happy") { ex.forEach(e => { ctx.beginPath(); ctx.arc(e, y + 2 * s, 11 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }); ctx.beginPath(); ctx.arc(x, y + 12 * s, 16 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fill(); }
  else if (f === "smile") { dots(); ctx.beginPath(); ctx.arc(x, y + 10 * s, 15 * s, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else if (f === "sleep") { ex.forEach(e => { ctx.beginPath(); ctx.arc(e, y - 8 * s, 10 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }); ctx.beginPath(); ctx.arc(x, y + 12 * s, 10 * s, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else if (f === "wide") { ex.forEach(e => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(e, y - 6 * s, 14 * s, 0, 7); ctx.fill(); ctx.stroke(); circle(e, y - 6 * s, 5 * s, OUT); }); ctx.beginPath(); ctx.ellipse(x, y + 28 * s, 10 * s, 13 * s, 0, 0, 7); ctx.fillStyle = OUT; ctx.fill(); brows(-3); }
  else if (f === "worried") { dots(4.5); brows(5); ctx.beginPath(); for (let i = 0; i <= 8; i++) { const xx = x - 14 * s + i * 3.5 * s, yy = y + 26 * s + Math.sin(i * 1.7) * 3 * s; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  else if (f === "determined") { dots(); brows(-6); line([[x - 12 * s, y + 26 * s], [x + 12 * s, y + 24 * s]], 5 * s); }
  else if (f === "strain") {
    ex.forEach((e, i) => { const sd = i ? -1 : 1; line([[e - sd * 10 * s, y - 14 * s], [e + sd * 8 * s, y - 4 * s], [e - sd * 10 * s, y + 6 * s]], 5 * s); });
    ctx.fillStyle = "#fff"; rr(x - 20 * s, y + 16 * s, 40 * s, 20 * s, 5 * s); ctx.fill(); ctx.lineWidth = 4 * s; ctx.stroke();
    for (const k of [-10, 0, 10]) line([[x + k * s, y + 16 * s], [x + k * s, y + 36 * s]], 3 * s); line([[x - 20 * s, y + 26 * s], [x + 20 * s, y + 26 * s]], 3 * s);
  }
  else if (f === "shock") { ex.forEach(e => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(e, y - 6 * s, 16 * s, 0, 7); ctx.fill(); ctx.stroke(); circle(e, y - 6 * s, 4 * s, OUT); }); ctx.fillStyle = "#c83030"; ctx.beginPath(); ctx.ellipse(x, y + 30 * s, 14 * s, 18 * s, 0, 0, 7); ctx.fill(); ctx.stroke(); }
}

// ---------------------------------------------------------------- Hintergründe
function bricks(x0, y0, w, h, col) {
  ctx.fillStyle = col; ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = "rgba(90,40,20,0.25)"; ctx.lineWidth = 2;
  for (let y = y0, r = 0; y < y0 + h; y += 22, r++) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); for (let x = x0 + (r % 2) * 30; x < x0 + w; x += 60) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); } }
}
function windowBox(x, y, w, h) {
  ctx.fillStyle = "#2a6a4a"; ctx.fillRect(x - 26, y, 22, h); ctx.fillRect(x + w + 4, y, 22, h);
  ctx.fillStyle = "#f4f0ea"; ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "#9cc6ea"); g.addColorStop(1, "#5b86c4");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = "#f4f0ea"; ctx.fillRect(x + w / 2 - 3, y, 6, h); ctx.fillRect(x, y + h / 2 - 3, w, 6);
}
function road(y) {
  ctx.fillStyle = "#d9d0c2"; ctx.fillRect(0, y - 260, W, 260);
  ctx.strokeStyle = "rgba(120,100,80,0.25)"; ctx.lineWidth = 3; for (let x = 0; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, y - 260); ctx.lineTo(x - 40, y); ctx.stroke(); }
  ctx.fillStyle = "#b9b0a2"; ctx.fillRect(0, y - 8, W, 20);
  const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, "#5f74a2"); g.addColorStop(1, "#4a5d8a");
  ctx.fillStyle = g; ctx.fillRect(0, y + 12, W, H - y);
  ctx.fillStyle = "#f2c632"; ctx.fillRect(0, y + 40, W, 10); ctx.fillRect(0, y + 62, W, 10);
}
function bgStreet(o = {}) {
  ctx.fillStyle = "#a9d3f0"; ctx.fillRect(0, 0, W, H);
  bricks(0, 0, W, 1120, "#c8704a");
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) windowBox(70 + c * 260, 90 + r * 250, 130, 170);
  // Ladenfront
  ctx.fillStyle = "#2e5a8a"; ctx.fillRect(0, 860, W, 260);
  const cols = ["#e84a5f", "#f6c445", "#4ab0e8", "#7ad06a", "#c86ae8"];
  for (let i = 0; i < 9; i++) { ctx.fillStyle = cols[i % 5]; ctx.fillRect(40 + i * 112, 930, 70, 160); }
  ctx.fillStyle = "#3a8ad8"; ctx.beginPath(); ctx.moveTo(0, 830); ctx.lineTo(W, 830); ctx.lineTo(W - 20, 900); ctx.lineTo(20, 900); ctx.fill();
  if (o.bunting) { const bc = ["#e84a5f", "#f6c445", "#4ab0e8", "#7ad06a", "#c86ae8"]; ctx.strokeStyle = "#555"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 360); ctx.quadraticCurveTo(540, 430, W, 360); ctx.stroke(); for (let i = 0; i < 16; i++) { const x = 10 + i * 68, y = 360 + Math.sin(i / 15 * Math.PI) * 34; ctx.fillStyle = bc[i % 5]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50, y); ctx.lineTo(x + 25, y + 56); ctx.fill(); } }
  road(1380);
  if (o.post) { ctx.fillStyle = "#2a3a5a"; ctx.fillRect(o.post - 9, 300, 18, 1080); }
  if (o.dusk) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(255,150,60,0.35)"); g.addColorStop(1, "rgba(120,60,140,0.35)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
}
function bgBedroom(night = false) {
  ctx.fillStyle = "#6f92cc"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#7d9fd6"; for (let x = 0; x < W; x += 80) ctx.fillRect(x, 0, 40, 1300);
  // Poster
  ctx.fillStyle = "#8a4ac8"; ctx.fillRect(90, 360, 180, 240); ctx.fillStyle = "#f6c445"; ctx.beginPath(); ctx.moveTo(190, 390); ctx.lineTo(140, 490); ctx.lineTo(185, 490); ctx.lineTo(160, 570); ctx.lineTo(230, 460); ctx.lineTo(185, 460); ctx.lineTo(215, 390); ctx.fill();
  windowBox(720, 260, 230, 300);
  ctx.strokeStyle = "#3b4a6a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 0); ctx.lineTo(540, 160); ctx.stroke();
  ctx.fillStyle = "#2f8a8a"; ctx.beginPath(); ctx.moveTo(470, 220); ctx.lineTo(610, 220); ctx.lineTo(570, 160); ctx.lineTo(510, 160); ctx.fill();
  ctx.fillStyle = "#a8683e"; ctx.fillRect(0, 1300, W, H - 1300);
  ctx.strokeStyle = "rgba(80,40,20,0.3)"; ctx.lineWidth = 3; for (let y = 1360; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = "#e86a4a"; ctx.beginPath(); ctx.ellipse(540, 1700, 460, 120, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#f6c445"; ctx.beginPath(); ctx.ellipse(540, 1700, 360, 80, 0, 0, 7); ctx.fill();
  if (night) { ctx.fillStyle = "rgba(20,30,90,0.45)"; ctx.fillRect(0, 0, W, H); }
}
function wardrobe(x, y, w, h) {
  ctx.fillStyle = "#7a4a32"; ctx.strokeStyle = OUT; ctx.lineWidth = 6; rr(x, y, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 20); ctx.lineTo(x + w / 2, y + h - 20); ctx.stroke();
  for (const d of [-1, 1]) { ctx.strokeStyle = "rgba(40,20,10,0.4)"; ctx.lineWidth = 4; rr(x + w / 2 + (d < 0 ? -w / 2 + 24 : 24), y + 40, w / 2 - 48, h - 80, 8); ctx.stroke(); circle(x + w / 2 + d * 18, y + h / 2, 7, "#e8c070"); }
}
function bed(x, y, w, starsK = 1) {
  ctx.fillStyle = "#7a4a32"; rr(x - 30, y - 220, 40, 360, 10); ctx.fill();
  ctx.fillStyle = "#f4f0ea"; rr(x, y - 140, 220, 90, 40); ctx.fill();
  ctx.fillStyle = "#2f55b8"; rr(x + 120, y - 90, w, 230, 40); ctx.fill();
  const r = rnd(3); ctx.fillStyle = "#f6d45a"; for (let i = 0; i < 40; i++) { const sx = x + 140 + r() * (w - 40), sy = y - 70 + r() * 190; ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = k * 2.513 - 1.57; ctx.lineTo(sx + Math.cos(a) * 7, sy + Math.sin(a) * 7); const b = a + 1.256; ctx.lineTo(sx + Math.cos(b) * 3, sy + Math.sin(b) * 3); } ctx.fill(); }
}
function bgPitch() {
  ctx.fillStyle = "#9fd3f0"; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) circle(i * 140, 760, 110, i % 2 ? "#4f9d4a" : "#5aae55");
  ctx.fillStyle = "#2e6ab8"; ctx.fillRect(0, 760, W, 120);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#6fc25a" : "#7ccd66"; ctx.fillRect(0, 880 + i * 130, W, 130); }
  ctx.strokeStyle = "#f4f4f4"; ctx.lineWidth = 8; ctx.strokeRect(700, 640, 330, 240);
  ctx.lineWidth = 2; for (let x = 710; x < 1030; x += 24) { ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 880); ctx.stroke(); }
}
function truck(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#3d74c4"; ctx.strokeStyle = OUT; ctx.lineWidth = 6;
  rr(-420, -260, 420, 200, 20); ctx.fill(); ctx.stroke();                        // Ladefläche
  rr(0, -400, 330, 340, 30); ctx.fill(); ctx.stroke();                          // Kabine
  ctx.fillStyle = "#8fc0ea"; rr(40, -370, 250, 140, 16); ctx.fill(); ctx.stroke();
  if (o.crack) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; for (const [a, l] of [[0.4, 70], [2.2, 60], [3.6, 50], [5.2, 66]]) { ctx.beginPath(); ctx.moveTo(200, -320); ctx.lineTo(200 + Math.cos(a) * l, -320 + Math.sin(a) * l); ctx.stroke(); } }
  if (o.door !== undefined) { ctx.save(); ctx.translate(320, -230); ctx.rotate(o.door); ctx.fillStyle = "#3d74c4"; ctx.strokeStyle = OUT; ctx.lineWidth = 6; rr(-280, -10, 280, 170, 14); ctx.fill(); ctx.stroke(); ctx.restore(); }
  else { ctx.strokeStyle = OUT; ctx.lineWidth = 4; rr(40, -220, 250, 150, 10); ctx.stroke(); }
  for (const wx of [-300, 200]) { circle(wx, -60, 78, "#1e1e24"); circle(wx, -60, 36, "#9aa0aa"); }
  ctx.fillStyle = "#f6e08a"; rr(316, -150, 20, 40, 6); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- Info-Karten (oben rechts)
function card(t0, lt, w, h, fn, x = 1040 - w, y = 70) {
  const k = easeOutBack(clamp((lt - t0) / 0.3));
  if (k <= 0) return;
  ctx.save(); ctx.translate(1040 - w * 0.8, 60); ctx.rotate(0.03 * Math.sin(T * 1.5)); ctx.scale(k * 1.6, k * 1.6);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; rr(-w / 2 + 10, 14, w, h, 22); ctx.fill();
  ctx.fillStyle = "#fbf8f2"; ctx.strokeStyle = "#5a4a3a"; ctx.lineWidth = 4; rr(-w / 2, 0, w, h, 22); ctx.fill(); ctx.stroke();
  circle(0, 6, 9, "#c84040");
  fn(w, h); ctx.restore();
}
function ecg(x, y, w, col = "#3aa860") { ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60; const xx = x + u * w; const ph = (u * 3) % 1; const yy = y - (ph > 0.45 && ph < 0.5 ? 30 : ph > 0.5 && ph < 0.55 ? -18 : 0); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
const heartCard = (n, foot) => (w, h) => { heartShape(-w / 2 + 70, 75, 32, "#e8323a"); txt(String(n), 40, 62, 64, "#1e1e24"); txt("SCHLÄGE / MIN", 40, 108, 18); ecg(-w / 2 + 30, 160, w - 60); txt(foot, 0, 200, 18, "#7a6a5a", 700); };
function checkbox(x, y, state) { ctx.strokeStyle = "#333"; ctx.lineWidth = 4; ctx.strokeRect(x - 16, y - 16, 32, 32); if (state === 1) line([[x - 10, y], [x - 2, y + 9], [x + 12, y - 10]], 6, "#2a9a4a"); if (state === -1) { line([[x - 10, y - 10], [x + 10, y + 10]], 6, "#d83030"); line([[x + 10, y - 10], [x - 10, y + 10]], 6, "#d83030"); } }
const sprintCard = (second) => (w, h) => {
  ctx.strokeStyle = "#333"; ctx.lineWidth = 5; circle(-w / 2 + 50, 50, 9, "#333"); line([[-w / 2 + 50, 60], [-w / 2 + 44, 90], [-w / 2 + 30, 110]], 5, "#333"); line([[-w / 2 + 44, 90], [-w / 2 + 62, 110]], 5, "#333"); line([[-w / 2 + 34, 72], [-w / 2 + 66, 70]], 5, "#333");
  txt("SPRINT", -w / 2 + 90, 80, 30, "#1e1e24", 800, "left"); checkbox(w / 2 - 40, 80, 1);
  ctx.beginPath(); ctx.arc(-w / 2 + 50, 160, 20, 0, 7); ctx.stroke(); line([[-w / 2 + 50, 160], [-w / 2 + 50, 148], [-w / 2 + 60, 160]], 4, "#333");
  txt("DAUERZUSTAND", -w / 2 + 90, 160, 30, "#1e1e24", 800, "left"); checkbox(w / 2 - 40, 160, second ? -1 : 0);
};
function gauge(val, max) {
  return (w, h) => {
    const cx = 0, cy = 150, R = 90;
    [["#3aa860", Math.PI, Math.PI * 1.4], ["#f2c632", Math.PI * 1.4, Math.PI * 1.7], ["#e8323a", Math.PI * 1.7, Math.PI * 2]].forEach(([c, a, b]) => { ctx.strokeStyle = c; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(cx, cy, R, a, b); ctx.stroke(); });
    const a = Math.PI + clamp(val / 210) * Math.PI + (max ? Math.sin(T * 40) * 0.03 : 0);
    line([[cx, cy], [cx + Math.cos(a) * 80, cy + Math.sin(a) * 80]], 7, "#333"); circle(cx, cy, 12, "#333");
    txt(`${Math.round(val)} BPM`, 0, 205, 46, max ? "#d83030" : "#1e1e24"); txt("HERZEN HABEN EIN LIMIT", 0, 245, 16, "#7a6a5a", 700);
    if (max) { ctx.fillStyle = "#d83030"; rr(-55, 22, 110, 38, 8); ctx.fill(); txt("MAX", 0, 42, 26, "#fff"); }
  };
}
function stars(cx, cy, r) { for (let i = 0; i < 3; i++) { const a = T * 2 + i * 2.1; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.4; ctx.fillStyle = "#f6d45a"; ctx.beginPath(); for (let k = 0; k < 10; k++) { const q = k * Math.PI / 5 - 1.57, rr2 = k % 2 ? 12 : 28; ctx.lineTo(x + Math.cos(q) * rr2, y + Math.sin(q) * rr2); } ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke(); } }
function button(x, y, w, h, col, label, dim) { ctx.globalAlpha = dim ? 0.35 : 1; ctx.fillStyle = col; rr(x - w / 2, y - h / 2, w, h, 14); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.2)"; rr(x - w / 2, y + h / 2 - 8, w, 8, 4); ctx.fill(); txt(label, x, y - 2, 28, "#fff"); ctx.globalAlpha = 1; }
function burst(x, y, r, t0, lt, word) {
  const k = easeOutBack(clamp((lt - t0) / 0.25)); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); ctx.scale(k, k);
  ctx.fillStyle = "#f6a030"; ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, q = i % 2 ? r * 0.7 : r; ctx.lineTo(Math.cos(a) * q * 1.4, Math.sin(a) * q * 0.8); } ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.font = "800 66px Pop"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 10; ctx.strokeStyle = OUT; ctx.strokeText(word, 0, 4); ctx.fillStyle = "#fff4d0"; ctx.fillText(word, 0, 4);
  ctx.restore();
}
function zzz(x, y) { for (let k = 0; k < 3; k++) { const ph = (T * 0.7 + k / 3) % 1; ctx.globalAlpha = Math.sin(ph * Math.PI); txt("Z", x + ph * 40, y - ph * 160, 46 + ph * 30, "#fbf6ef"); ctx.font = `800 ${46 + ph * 30}px Pop`; ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.strokeText("Z", x + ph * 40, y - ph * 160); ctx.fillText("Z", x + ph * 40, y - ph * 160); } ctx.globalAlpha = 1; }
function scooter(x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); line([[-60, 0], [60, 0]], 12, "#e84a5f"); line([[50, 0], [70, -130]], 10, "#e84a5f"); line([[50, -130], [90, -130]], 10, OUT); circle(-55, 14, 18, OUT); circle(60, 14, 18, OUT); ctx.restore(); }
function mug(x, y, s) { ctx.fillStyle = "#f4f0ea"; ctx.strokeStyle = OUT; ctx.lineWidth = 4 * s; rr(x - 22 * s, y - 26 * s, 44 * s, 52 * s, 8 * s); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 24 * s, y, 12 * s, -1.4, 1.4); ctx.stroke(); heartShape(x, y, 10 * s, "#e8323a"); }

// ---------------------------------------------------------------- Szenen
const SC = {
  title(lt) { bgStreet(); truck(330, 1560, 1.0); guy(560, 2350, 2.7, HERO, { face: "strain", sweat: true, shake: true });
    const k = ss(0, 0.3, lt); ctx.globalAlpha = k;
    for (const [s, y, col] of [["Was wäre, wenn dein", 150, "#fff"], ["Adrenalin", 230, "#fff"], ["10x stärker wäre?", 320, "#f6c632"]]) { ctx.font = `800 ${y > 300 ? 76 : 66}px Pop`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.lineWidth = 14; ctx.strokeStyle = OUT; ctx.strokeText(s, 70, y); ctx.fillStyle = col; ctx.fillText(s, 70, y); }
    ctx.globalAlpha = 1; },
  bed(lt) { bgBedroom(); bed(60, 1500, 900);
    const R = 120; ctx.fillStyle = "#fbf6ef"; ctx.strokeStyle = OUT; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(200, 1320, R, 0, 7); ctx.fill(); ctx.stroke(); face(200, 1326, 1.8, "sleep");
    ctx.fillStyle = "#7a4a32"; ctx.fillRect(700, 1120, 300, 40); const sh = Math.sin(T * 60) * 6; circle(850 + sh, 1050, 60, "#d83030"); circle(850 + sh, 1050, 44, "#fbf6ef"); line([[850 + sh, 1050], [850 + sh, 1022]], 5); line([[850 + sh, 1050], [870 + sh, 1050]], 5);
    for (const d of [-1, 1]) { ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(850, 1050, 90, d > 0 ? -0.5 : Math.PI - 0.5, d > 0 ? 0.5 : Math.PI + 0.5); ctx.stroke(); }
    zzz(360, 1180); },
  wardrobe(lt) { bgBedroom(); wardrobe(330, 900, 420, 560); guy(540, 900, 0.85, HERO, { face: "sleep" }); zzz(620, 560); },
  awake(lt) { bgBedroom(); wardrobe(150, 1200, 780, 900); guy(540, 1200, 1.6, HERO, { face: "wide", shake: true, arms: [40, 40] }); },
  glands(lt) { bgBedroom(); guy(430, 1900, 2.0, HERO, { face: "worried", sweat: true });
    card(0.2, lt, 380, 240, (w, h) => { txt("2 WINZIGE DRÜSEN", 0, 44, 24); for (const d of [-1, 1]) { ctx.fillStyle = "#c8604a"; ctx.beginPath(); ctx.ellipse(d * 70, 150, 38, 58, d * 0.2, 0, 7); ctx.fill(); ctx.fillStyle = "#f6c632"; ctx.beginPath(); ctx.moveTo(d * 70 - 26, 98); ctx.lineTo(d * 70 + 26, 98); ctx.lineTo(d * 70, 70); ctx.fill(); } }); },
  pump(lt) { bgBedroom(); guy(430, 1900, 2.0, HERO, { face: "shock", heart: true, heartRate: 14, shake: true });
    card(0, lt, 380, 280, (w, h) => { txt("AUF DEINEN NIEREN", 0, 44, 22); for (const d of [-1, 1]) { ctx.fillStyle = "#c8604a"; ctx.beginPath(); ctx.ellipse(d * 70, 150, 38, 58, d * 0.2, 0, 7); ctx.fill(); ctx.fillStyle = "#f6c632"; ctx.beginPath(); ctx.moveTo(d * 70 - 26, 98); ctx.lineTo(d * 70 + 26, 98); ctx.lineTo(d * 70, 70); ctx.fill(); line([[d * 70, 66], [d * 70, 40 - 10 * Math.sin(T * 12)]], 5, "#f6c632"); } ctx.fillStyle = "#e8323a"; rr(-90, 222, 180, 40, 10); ctx.fill(); txt("ADRENALIN", 0, 242, 22, "#fff"); }); },
  heart77(lt) { bgStreet({ post: 760 }); guy(560, 1500, 0.9, MAJA, { face: "neutral" }); card(0, lt, 360, 230, heartCard(Math.round(lerp(70, 77, ss(0.2, 1.5, lt))), "NORMALES HERZ")); },
  heart106(lt) { bgStreet({ post: 820 }); guy(520, 1700, 1.4, MAJA, { face: "wide", jump: Math.max(0, Math.sin(clamp(lt / 0.5) * Math.PI)) * 60 }); card(0, lt, 360, 230, heartCard(Math.round(lerp(77, 106, ss(0, 0.6, lt))), "NORMALES HERZ")); },
  heart72(lt) { bgStreet(); const g = guy(520, 2250, 2.4, MAJA, { face: "happy", arms: [12, 60], bend: [0.15, 1.6] }); mug(700, 1600, 2.2); card(0, lt, 360, 230, heartCard(Math.round(lerp(106, 72, ss(0, 1.5, lt))), "KLINGT IN MINUTEN AB")); },
  always(lt) { bgStreet(); guy(520, 2300, 2.6, HERO, { face: "happy", heart: true, heartRate: 12, shake: true });
    card(0, lt, 300, 190, (w, h) => { heartShape(-70, 80, 30, "#e8323a"); ctx.fillStyle = "#3aa860"; rr(-10, 56, 110, 50, 25); ctx.fill(); circle(74, 81, 20, "#fff"); txt("IMMER AN", 20, 150, 26, "#2a8a4a"); }); },
  pitch(lt) { bgPitch(); for (const [x, c] of [[300, "#4a6ad8"], [520, "#4a6ad8"], [180, "#4a6ad8"]]) guy(x - lt * 120, 1500, 0.8, { body: c, hair: "#3a2a20" }, { face: "wide", look: 1 });
    guy(lerp(200, 900, clamp(lt / 2)), 1600, 1.0, SPORT, { face: "determined", legs: "run", arms: [60, 60], bend: [1.2, 1.2] }); circle(lerp(260, 960, clamp(lt / 2)), 1590, 26, "#fff"); },
  street(lt) { bgStreet({ bunting: true }); guy(260, 1330, 0.55, MAJA, { face: "smile" }); guy(800, 1330, 0.55, DRIVER, { face: "neutral" }); guy(540, 1340, 0.6, HERO, { face: "neutral" }); },
  scooter(lt) { bgStreet({ bunting: true }); guy(260, 1330, 0.6, HERO, { face: lt > 1.2 ? "wide" : "neutral", look: 1 }); guy(860, 1330, 0.45, KID, { face: "wide" }); scooter(lerp(760, 560, ss(0.3, 2.4, lt)), lerp(1320, 1500, ss(0.6, 2.4, lt)), 0.9); },
  catch(lt) { bgStreet({ bunting: true }); const k = ss(0, 0.6, lt); const j = Math.sin(clamp(lt / 1.1) * Math.PI) * 300; const g = guy(lerp(300, 560, k), 1600, 1.1, HERO, { face: "determined", jump: j, arms: [150, 150] });
    scooter(g.x + 20, g.headY - 120, 0.9, -0.3); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(g.x - 160 - i * 20, g.bodyY - 60 + i * 50); ctx.lineTo(g.x - 280 - i * 20, g.bodyY - 60 + i * 50); ctx.stroke(); } },
  shakebed(lt) { bgBedroom(true); bed(60, 1500, 900); const sh = Math.sin(T * 60) * 4;
    ctx.fillStyle = "#fbf6ef"; ctx.strokeStyle = OUT; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(200 + sh, 1320, 120, 0, 7); ctx.fill(); ctx.stroke(); face(200 + sh, 1326, 1.8, "worried"); heartShape(700, 1500, 50 * (1 + 0.2 * Math.max(0, Math.sin(T * 14))), "#e8323a");
    card(0.1, lt, 360, 200, (w, h) => { heartShape(-110, 80, 30, "#e8323a"); txt("140", 30, 70, 58); txt("BPM IM BETT", 30, 116, 20); ctx.strokeStyle = "#333"; ctx.lineWidth = 4; ctx.strokeRect(-60, 140, 120, 40); ctx.fillStyle = "#d83030"; ctx.fillRect(-56, 144, 26, 32); ctx.fillStyle = "#333"; ctx.fillRect(60, 150, 10, 20); }); },
  neverslow(lt) { bgBedroom(true); ctx.fillStyle = "#2f55b8"; ctx.fillRect(0, 1100, W, H); ctx.fillStyle = "#f4f0ea"; rr(100, 760, 900, 360, 120); ctx.fill(); const sh = Math.sin(T * 60) * 4;
    ctx.save(); ctx.translate(560 + sh, 920); ctx.rotate(-0.3); ctx.fillStyle = "#fbf6ef"; ctx.strokeStyle = OUT; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 260, 0, 7); ctx.fill(); ctx.stroke(); face(0, 10, 3.8, "worried"); ctx.restore();
    card(0, lt, 360, 200, (w, h) => { heartShape(-110, 80, 30, "#e8323a"); txt("140", 30, 70, 58); txt("BPM IM BETT", 30, 116, 20); ctx.strokeStyle = "#333"; ctx.lineWidth = 4; ctx.strokeRect(-60, 140, 120, 40); ctx.fillStyle = "#d83030"; ctx.fillRect(-56, 144, 14, 32); ctx.fillStyle = "#333"; ctx.fillRect(60, 150, 10, 20); }); },
  sprint1(lt) { bgStreet({ dusk: true, post: 300 }); guy(560, 1400, 1.1, KID, { face: "worried" }); card(0.2, lt, 400, 220, sprintCard(lt > 1.6)); },
  crash(lt) { bgStreet(); ctx.save(); ctx.translate(160, 1750); ctx.scale(2.2, 2.2); truck(0, 0, 1, { crack: true }); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(160 + 40 * 2.2, 1750 - 370 * 2.2, 250 * 2.2, 140 * 2.2); ctx.clip(); guy(160 + 150 * 2.2, 1750 - 125 * 2.2, 1.3, KID, { face: "worried", arms: [150, 30] }); ctx.restore();
    ctx.save(); ctx.translate(160, 1750); ctx.scale(2.2, 2.2); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; for (const [a, l] of [[0.4, 70], [2.2, 60], [3.6, 50], [5.2, 66]]) { ctx.beginPath(); ctx.moveTo(200, -320); ctx.lineTo(200 + Math.cos(a) * l, -320 + Math.sin(a) * l); ctx.stroke(); } ctx.restore(); },
  kid(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true }); guy(880, 1740, 1.25, HERO, { face: "determined" }); },
  rip(lt) { bgStreet(); const k = ss(0.2, 0.6, lt); truck(-320, 1720, 1.2, { crack: true, door: -k * 0.9 }); guy(880, 1750, 1.25, HERO, { face: "strain", arms: [100, 70], shake: lt < 0.6 }); burst(520, 700, 160, 0.25, lt, "RIIIP!"); },
  gauge(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); guy(560, 2350, 2.6, HERO, { face: "strain", heart: true, heartRate: 18, sweat: true, shake: true }); card(0, lt, 340, 270, gauge(lerp(150, 186, ss(0, 1.6, lt)), false)); },
  max(lt) { bgStreet(); guy(540, 2700, 3.6, HERO, { face: "strain", heart: true, heartRate: 22, sweat: true, shake: true }); card(0, lt, 340, 270, gauge(lerp(186, 200, ss(0, 0.8, lt)), true)); stars(870, 220, 190); },
  driver(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); guy(lerp(700, 1300, ss(0, 1.4, lt)), 1640, 0.9, DRIVER, { face: "wide", legs: "run", arms: [60, 60], bend: [1.2, 1.2] }); guy(860, 1760, 1.1, HERO, { face: "wide", look: 1 }); },
  chase(lt) { bgStreet(); guy(520, 2300, 2.6, HERO, { face: "worried", heart: true, heartRate: 14, sweat: true }); card(0, lt, 420, 150, (w, h) => { button(-100, 80, 180, 70, "#3a7ad8", "HINTERHER", false); button(100, 80, 160, 70, "#2a9a5a", "BLEIBEN", false); }); },
  stay(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); guy(880, 1760, 1.2, HERO, { face: "determined", heart: true }); card(0, lt, 420, 150, (w, h) => { button(-100, 80, 180, 70, "#3a7ad8", "HINTERHER", true); button(100, 80, 160, 70, "#2a9a5a", "BLEIBEN", false); }); },
  lift(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); const up = ss(0, 0.6, lt); const g = guy(880, 1760, 1.2, HERO, { face: "strain", arms: [150, 150], heart: true }); guy(880, g.headY - 40 - up * 60, 0.6, KID2, { face: "worried", arms: [160, 160] }); },
  curb(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); guy(860, 1600, 1.15, HERO, { face: "worried", sit: true, heart: true, heartRate: 14, sweat: true, arms: [30, 30] }); },
  maja(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); guy(380, 2000, 1.9, MAJA, { face: "worried", sit: true, arms: [40, 80], look: 1 }); guy(760, 2000, 1.9, HERO, { face: "worried", sit: true, heart: true, heartRate: 12, sweat: true }); },
  breath(lt) { bgStreet(); guy(330, 2400, 2.7, MAJA, { face: "smile", sit: true, look: 1 }); guy(790, 2400, 2.7, HERO, { face: "sleep", sit: true, heart: true, heartRate: 7 });
    const ph = Math.floor(lt / 1.4) % 2; card(0, lt, 300, 260, (w, h) => { txt("VIER SEKUNDEN", 0, 40, 20, "#7a6a5a", 700); ctx.strokeStyle = "#3a7ad8"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 130, 66, -1.57, -1.57 + 6.28 * ((lt % 1.4) / 1.4)); ctx.stroke(); txt(ph ? "AUS" : "EIN", 0, 132, 44, "#3a7ad8"); for (let i = 0; i < 4; i++) circle(-45 + i * 30, 225, 9, i <= Math.floor((lt % 1.4) / 0.35) ? "#333" : "#ccc"); }); },
  sprint2(lt) { bgStreet(); guy(330, 2200, 2.2, MAJA, { face: "happy", sit: true }); guy(790, 2200, 2.2, HERO, { face: "happy", sit: true, heart: true, heartRate: 6 }); card(0, lt, 400, 220, sprintCard(lt > 0.8)); },
  fear(lt) { bgStreet(); guy(560, 2350, 2.7, HERO, { face: "wide", heart: true }); guy(-60, 2350, 2.7, MAJA, { face: "smile", look: 1 });
    card(0, lt, 400, 250, (w, h) => { ctx.font = "800 40px Pop"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; const a = "NULL ", b = "ANGST?"; const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width; ctx.fillStyle = "#1e1e24"; ctx.fillText(a, -(wa + wb) / 2, 56); ctx.fillStyle = "#7b4bc4"; ctx.fillText(b, -(wa + wb) / 2 + wa, 56); button(-80, 135, 120, 64, "#2a9a5a", "JA"); button(80, 135, 140, 64, "#d83030", "NEIN"); txt("SCHREIB'S IN DIE KOMMENTARE", 0, 210, 15, "#7a6a5a", 700); }); },
  ask(lt) { bgStreet(); truck(400, 1720, 1.0, { crack: true, door: -0.9 }); guy(640, 1900, 1.1, MAJA, { face: "smile", sit: true }); guy(900, 1900, 1.1, HERO, { face: "happy", sit: true, heart: true, heartRate: 6 });
    card(-1, lt, 400, 250, (w, h) => { ctx.font = "800 40px Pop"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; const a = "NULL ", b = "ANGST?"; const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width; ctx.fillStyle = "#1e1e24"; ctx.fillText(a, -(wa + wb) / 2, 56); ctx.fillStyle = "#7b4bc4"; ctx.fillText(b, -(wa + wb) / 2 + wa, 56); button(-80, 135, 120, 64, "#2a9a5a", "JA"); button(80, 135, 140, 64, "#d83030", "NEIN"); txt("SCHREIB'S IN DIE KOMMENTARE", 0, 210, 15, "#7a6a5a", 700); }); },
};

function caption(t) {
  const c = TL.caps.find(c => t >= c.t0 - 0.05 && t < c.t1 + 0.05);
  if (!c || t < 3.0) return;
  const s = c.w.join(" ").toLowerCase().replace(/^./, m => m.toUpperCase());
  const raw = TL.caps.indexOf(c);
  ctx.font = "800 58px Pop"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  const k = easeOutBack((t - c.t0) / 0.15);
  ctx.save(); ctx.translate(540, 1350); ctx.scale(k, k);
  ctx.lineWidth = 12; ctx.strokeStyle = "#1a1210"; ctx.strokeText(c.text || s, 0, 0); ctx.fillStyle = "#ffffff"; ctx.fillText(c.text || s, 0, 0);
  ctx.restore();
}

function frame(t) {
  T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sh = TL.shots.find(s => t >= s.t0 && t < s.t1) || TL.shots[TL.shots.length - 1];
  const lt = t - sh.t0, d = sh.t1 - sh.t0;
  const z = 1 + 0.04 * clamp(lt / Math.max(d, 0.5));
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  SC[sh.id](lt, d);
  ctx.restore();
  // leichte Vignette
  const v = ctx.createRadialGradient(540, 960, 600, 540, 960, 1250); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.35)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  caption(t);
}

window.setup = async () => { await Promise.all([700, 800].map(w => document.fonts.load(`${w} 20px Pop`))); return { duration: TL.duration }; };
window.renderFrame = frame;
