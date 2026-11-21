// "Walmart wollte Deutschland erobern …" – Nachbau (deutsch), Spielzeugstadt-Look
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
function txt(s, x, y, size, col = "#fff", w = 800, align = "center") { ctx.fillStyle = col; ctx.font = `${w} ${size}px Pop`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); return `rgb(${f(r)},${f(g)},${f(b)})`; }
let T = 0;
const HOR = 1000;                         // Horizont (Boden beginnt hier)

// ---------------------------------------------------------------- Stadt im Hintergrund
function cloud(x, y, s) { ctx.fillStyle = "#fffdf8"; ctx.strokeStyle = "#c9b9a0"; ctx.lineWidth = 4; ctx.beginPath(); for (const [dx, dy, r] of [[-60, 10, 40], [-20, -16, 52], [34, -6, 46], [70, 14, 34]]) ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); for (const [dx, dy, r] of [[-60, 10, 40], [-20, -16, 52], [34, -6, 46], [70, 14, 34]]) ctx.arc(x + dx * s, y + dy * s, r * s - 3, 0, 7); ctx.fill(); }
function house(x, y, s, roof = "#d8643a") {
  ctx.fillStyle = "#f2e2c8"; ctx.fillRect(x - 60 * s, y - 90 * s, 120 * s, 90 * s); ctx.fillStyle = shade("#f2e2c8", -0.12); ctx.fillRect(x + 60 * s, y - 84 * s, 22 * s, 84 * s);
  ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 72 * s, y - 88 * s); ctx.lineTo(x, y - 150 * s); ctx.lineTo(x + 86 * s, y - 88 * s); ctx.fill();
  ctx.fillStyle = "#7fb0d8"; ctx.fillRect(x - 40 * s, y - 70 * s, 28 * s, 28 * s); ctx.fillRect(x + 12 * s, y - 70 * s, 28 * s, 28 * s);
}
function flag(x, y, s, type) {
  ctx.fillStyle = "#9aa0a8"; ctx.fillRect(x - 3 * s, y, 6 * s, 220 * s);
  const fw = 80 * s, fh = 52 * s, fx = x + 3 * s, fy = y + 4 * s, wave = (i) => Math.sin(T * 4 + i) * 3 * s;
  if (type === "de") ["#1e1e1e", "#d8302a", "#f2c632"].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(fx, fy + i * fh / 3 + wave(i), fw, fh / 3 + 1); });
  else { for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#c8302a"; ctx.fillRect(fx, fy + i * fh / 7 + wave(i), fw, fh / 7 + 1); } ctx.fillStyle = "#2a3a8a"; ctx.fillRect(fx, fy, fw * 0.42, fh * 0.55); }
}
function waterTower(x, y, s) {
  ctx.strokeStyle = "#8a7a6a"; ctx.lineWidth = 6 * s; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 30 * s, y); ctx.lineTo(x + d * 50 * s, y + 200 * s); ctx.stroke(); }
  ctx.fillStyle = "#e8e0d4"; rr(x - 70 * s, y - 70 * s, 140 * s, 80 * s, 16 * s); ctx.fill(); ctx.fillStyle = "#d8643a"; ctx.beginPath(); ctx.moveTo(x - 76 * s, y - 66 * s); ctx.lineTo(x, y - 120 * s); ctx.lineTo(x + 76 * s, y - 66 * s); ctx.fill();
  txt("SEIT 1962", x, y - 30 * s, 20 * s, "#4a3a2a");
}
function church(x, y, s) { ctx.fillStyle = "#f2e2c8"; ctx.fillRect(x - 40 * s, y - 260 * s, 80 * s, 260 * s); ctx.fillStyle = "#6a7a8a"; ctx.beginPath(); ctx.moveTo(x - 46 * s, y - 258 * s); ctx.lineTo(x, y - 420 * s); ctx.lineTo(x + 46 * s, y - 258 * s); ctx.fill(); }
function town(country = "de", o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, HOR); g.addColorStop(0, "#9ccbe8"); g.addColorStop(0.7, "#f2e6cc"); g.addColorStop(1, "#f6e6c4");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  cloud(140 + Math.sin(T * 0.2) * 20, 120, 1.1); cloud(720 + Math.sin(T * 0.25) * 20, 80, 1.3); cloud(980, 300, 0.9);
  ctx.fillStyle = "#b9d38a"; ctx.beginPath(); ctx.ellipse(250, HOR - 30, 520, 120, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.ellipse(900, HOR - 20, 480, 100, 0, Math.PI, 0); ctx.fill();
  if (country === "de") church(930, HOR - 60, 1.0); else waterTower(900, HOR - 300, 1.0);
  for (const [x, r] of [[60, "#d8643a"], [230, "#c8503a"], [430, "#d8643a"], [640, "#e0784a"], [800, "#c8503a"], [1010, "#d8643a"]]) house(x, HOR - 40, 0.9, r);
  for (const x of [330, 760]) { circle(x, HOR - 110, 44, "#5aa84a"); ctx.fillStyle = "#7a5a3a"; ctx.fillRect(x - 6, HOR - 80, 12, 50); }
  flag(country === "de" ? 820 : 870, HOR - 520, 1.0, country);
  ground(o);
}
function ground(o = {}) {
  ctx.fillStyle = "#6a6e78"; ctx.fillRect(0, HOR - 40, W, 70);
  ctx.strokeStyle = "#f4f0e8"; ctx.lineWidth = 6; for (let x = 20; x < W; x += 140) { ctx.beginPath(); ctx.moveTo(x, HOR - 6); ctx.lineTo(x + 70, HOR - 6); ctx.stroke(); }
  const g = ctx.createLinearGradient(0, HOR + 30, 0, H); g.addColorStop(0, "#f2d9a8"); g.addColorStop(1, "#f6e2b8");
  ctx.fillStyle = g; ctx.fillRect(0, HOR + 30, W, H);
  ctx.fillStyle = "#9cc45a"; ctx.beginPath(); ctx.moveTo(0, 1450); ctx.lineTo(W, 1380); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
}
function rays(col = "rgba(255,255,255,0.75)") { ctx.save(); ctx.translate(540, 760); ctx.rotate(T * 0.3); ctx.fillStyle = col; for (let i = 0; i < 20; i++) { ctx.rotate(Math.PI / 10); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1600, -90); ctx.lineTo(1600, 90); ctx.fill(); } ctx.restore(); }

// ---------------------------------------------------------------- Laden-Figuren
const STORES = {
  walmart: { body: "#2f62c4", sign: "#1f4aa0", label: "WALMART", hand: "#f2a830", w: 300, h: 300 },
  aldi: { body: "#f6e8c4", roof: "#1e2f6a", label: "ALDI", hand: "#f08a24", stripes: true, w: 300, h: 230 },
  target: { body: "#d8302a", sign: "#ffffff", signText: "#d8302a", label: "TARGET", hand: "#f2a830", w: 260, h: 260 },
  tj: { body: "#d8643a", sign: "#8a2a1a", label: "TRADER JOE'S", hand: "#f2a830", w: 260, h: 220 },
  winn: { body: "#f4f2ea", sign: "#c8302a", label: "WINN-DIXIE", hand: "#f2a830", w: 260, h: 200 },
};
// o: {face: "happy"|"neutral"|"sad"|"worried"|"shock"|"grin"|"closed", look, arms:[l,r] Grad, shelf: Höhe, cage, sweat, small:true}
function store(type, x, y, s, o = {}) {
  const st = STORES[type], w = st.w * s, h = st.h * s;
  const bob = (o.bob === undefined ? 1 : o.bob) * Math.sin(T * 3 + x) * 3 * s;
  y += bob;
  ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(x, y + 6 * s, w * 0.62, 18 * s, 0, 0, 7); ctx.fill();
  // Regal-Turm auf dem Dach
  if (o.shelf) {
    const sh = o.shelf * s, sw = w * 0.7, top = y - h - (st.roof ? 70 * s : 60 * s) - sh;
    ctx.fillStyle = "#8a8f9a"; rr(x - sw / 2, top, sw, sh, 6 * s); ctx.fill();
    const cols = ["#e84a5f", "#f6c445", "#4ab0e8", "#7ad06a", "#c86ae8", "#f08a24"]; const r = rnd(7);
    for (let yy = top + 10 * s; yy < top + sh - 24 * s; yy += 36 * s) { for (let xx = x - sw / 2 + 10 * s; xx < x + sw / 2 - 18 * s; xx += 22 * s) { ctx.fillStyle = cols[Math.floor(r() * 6)]; ctx.fillRect(xx, yy, 16 * s, 26 * s); } ctx.fillStyle = "#6a6f7a"; ctx.fillRect(x - sw / 2, yy + 26 * s, sw, 6 * s); }
  }
  // Arme (hinter dem Körper)
  const arms = o.arms || [20, 20];
  [-1, 1].forEach((sd, i) => {
    const a = arms[i] * Math.PI / 180, sx = x + sd * w * 0.48, sy = y - h * 0.45;
    const ex = sx + sd * Math.sin(a) * 90 * s, ey = sy + Math.cos(a) * 90 * s;
    ctx.strokeStyle = st.roof || shade(st.body, -0.25); ctx.lineWidth = 26 * s; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    circle(ex, ey, 24 * s, st.hand); circle(ex - 6 * s, ey - 6 * s, 9 * s, "rgba(255,255,255,0.35)");
    if (o.hold && i === o.hold.side) o.hold.fn(ex, ey);
  });
  // Körper mit Seitenfläche
  ctx.fillStyle = shade(st.body, -0.2); ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + 30 * s, y - h + 18 * s); ctx.lineTo(x + w / 2 + 30 * s, y - 10 * s); ctx.lineTo(x + w / 2, y); ctx.fill();
  const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, shade(st.body, 0.12)); g.addColorStop(1, shade(st.body, -0.05));
  ctx.fillStyle = g; rr(x - w / 2, y - h, w, h, 12 * s); ctx.fill();
  if (st.stripes) { ctx.fillStyle = "#f6c632"; ctx.fillRect(x - w / 2, y - h, w, 16 * s); ctx.fillStyle = "#f08a24"; ctx.fillRect(x - w / 2, y - h + 16 * s, w, 12 * s); }
  // Tür
  ctx.fillStyle = st.roof || shade(st.body, -0.3); rr(x - 55 * s, y - 120 * s, 110 * s, 120 * s, 8 * s); ctx.fill();
  ctx.fillStyle = "#a8d4f2"; rr(x - 46 * s, y - 110 * s, 92 * s, 110 * s, 6 * s); ctx.fill(); ctx.fillStyle = st.roof || shade(st.body, -0.3); ctx.fillRect(x - 3 * s, y - 110 * s, 6 * s, 110 * s);
  // Dach / Schild
  if (st.roof) {
    ctx.fillStyle = st.roof; rr(x - w / 2 - 22 * s, y - h - 36 * s, w + 44 * s, 40 * s, 10 * s); ctx.fill();
    rr(x - w * 0.36, y - h - 110 * s, w * 0.72, 80 * s, 12 * s); ctx.fill(); txt(st.label, x, y - h - 70 * s, 48 * s, "#fff");
  } else {
    ctx.fillStyle = st.sign; rr(x - w * 0.42, y - h - 70 * s, w * 0.84, 74 * s, 10 * s); ctx.fill();
    let fs = 44 * s; ctx.font = `800 ${fs}px Pop`; while (ctx.measureText(st.label).width > w * 0.78 && fs > 10) { fs -= 1; ctx.font = `800 ${fs}px Pop`; }
    txt(st.label, x, y - h - 33 * s, fs, st.signText || "#fff");
  }
  // Gesicht
  storeFace(x + (o.look || 0) * 14 * s, y - h * 0.62, s, o.face || "neutral", st.body === "#f6e8c4" || st.body === "#f4f2ea");
  if (o.sweat) { ctx.fillStyle = "#7cc8f2"; ctx.beginPath(); ctx.moveTo(x + 110 * s, y - h * 0.8); ctx.quadraticCurveTo(x + 124 * s, y - h * 0.68, x + 110 * s, y - h * 0.64); ctx.quadraticCurveTo(x + 96 * s, y - h * 0.68, x + 110 * s, y - h * 0.8); ctx.fill(); }
  if (o.cage) { ctx.strokeStyle = "#2a2e38"; ctx.lineWidth = 10 * s; for (let xx = x - w / 2 - 10 * s; xx <= x + w / 2 + 40 * s; xx += 30 * s) { ctx.beginPath(); ctx.moveTo(xx, y - h - 40 * s); ctx.lineTo(xx, y + 6 * s); ctx.stroke(); } rr(x - w / 2 - 20 * s, y - h - 50 * s, w + 70 * s, 16 * s, 4 * s); ctx.fillStyle = "#2a2e38"; ctx.fill(); }
  return { x, top: y - h, w, h };
}
function storeFace(x, y, s, f, light) {
  const ink = "#1e1e24";
  const eye = (ex, open = 1, lookY = 0) => { ctx.fillStyle = "#fff"; ctx.strokeStyle = ink; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.ellipse(ex, y, 28 * s, 34 * s * open, 0, 0, 7); ctx.fill(); ctx.stroke(); circle(ex + 4 * s, y + 6 * s + lookY, 13 * s, ink); circle(ex + 8 * s, y + 1 * s + lookY, 4 * s, "#fff"); };
  const ex = [x - 50 * s, x + 50 * s];
  ctx.strokeStyle = ink; ctx.lineWidth = 6 * s; ctx.lineCap = "round";
  if (f === "closed" || f === "grin") { ex.forEach(e => { ctx.beginPath(); ctx.arc(e, y + 8 * s, 22 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }); }
  else ex.forEach(e => eye(e, f === "shock" ? 1.2 : 1));
  if (f === "worried" || f === "sad") ex.forEach((e, i) => { const sd = i ? 1 : -1; ctx.beginPath(); ctx.moveTo(e - sd * 22 * s, y - 50 * s); ctx.lineTo(e + sd * 16 * s, y - 40 * s); ctx.stroke(); });
  const my = y + 62 * s;
  if (f === "happy" || f === "grin") { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(x, my - 10 * s, 26 * s, 0.1 * Math.PI, 0.9 * Math.PI); ctx.fill(); ctx.fillStyle = "#e86c86"; ctx.beginPath(); ctx.ellipse(x, my + 6 * s, 12 * s, 6 * s, 0, 0, 7); ctx.fill(); }
  else if (f === "sad" || f === "worried") { ctx.beginPath(); ctx.arc(x, my + 14 * s, 20 * s, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (f === "shock") { ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(x, my, 14 * s, 18 * s, 0, 0, 7); ctx.fill(); }
  else if (f === "smirk") { ctx.beginPath(); ctx.moveTo(x - 20 * s, my); ctx.quadraticCurveTo(x + 4 * s, my + 10 * s, x + 26 * s, my - 8 * s); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(x, my - 14 * s, 20 * s, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke(); }
}

// ---------------------------------------------------------------- Kleinkram
function person(x, y, s, col = "#3a6ad8", o = {}) {
  ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.beginPath(); ctx.ellipse(x, y, 30 * s, 8 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#2a2e38"; rr(x - 18 * s, y - 50 * s, 14 * s, 50 * s, 6 * s); ctx.fill(); rr(x + 4 * s, y - 50 * s, 14 * s, 50 * s, 6 * s); ctx.fill();
  ctx.fillStyle = col; rr(x - 28 * s, y - 120 * s, 56 * s, 76 * s, 18 * s); ctx.fill();
  if (o.suit) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 120 * s); ctx.lineTo(x, y - 96 * s); ctx.lineTo(x + 10 * s, y - 120 * s); ctx.fill(); ctx.fillStyle = "#c8302a"; ctx.fillRect(x - 3 * s, y - 112 * s, 6 * s, 20 * s); }
  circle(x, y - 150 * s, 30 * s, o.skin || "#e8b48a");
  if (o.hat) { ctx.fillStyle = "#1e1e24"; ctx.fillRect(x - 24 * s, y - 196 * s, 48 * s, 30 * s); ctx.fillRect(x - 34 * s, y - 170 * s, 68 * s, 8 * s); }
  else { ctx.fillStyle = o.hair || "#4a3020"; ctx.beginPath(); ctx.arc(x, y - 156 * s, 31 * s, Math.PI, 0); ctx.fill(); if (o.long) { ctx.fillRect(x - 31 * s, y - 156 * s, 14 * s, 50 * s); ctx.fillRect(x + 17 * s, y - 156 * s, 14 * s, 50 * s); } }
  circle(x - 10 * s, y - 148 * s, 4.5 * s, "#1e1e24"); circle(x + 10 * s, y - 148 * s, 4.5 * s, "#1e1e24");
  ctx.strokeStyle = "#1e1e24"; ctx.lineWidth = 3 * s; ctx.beginPath();
  if (o.mood === "angry") { ctx.moveTo(x - 9 * s, y - 128 * s); ctx.lineTo(x + 9 * s, y - 128 * s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 18 * s, y - 162 * s); ctx.lineTo(x - 4 * s, y - 156 * s); ctx.moveTo(x + 18 * s, y - 162 * s); ctx.lineTo(x + 4 * s, y - 156 * s); }
  else if (o.mood === "scream") { ctx.fillStyle = "#1e1e24"; ctx.ellipse(x, y - 128 * s, 9 * s, 11 * s, 0, 0, 7); ctx.fill(); }
  else ctx.arc(x, y - 138 * s, 10 * s, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  if (o.sign) { ctx.fillStyle = "#f4f0e8"; rr(x - 34 * s, y - 104 * s, 68 * s, 42 * s, 4 * s); ctx.fill(); ctx.strokeStyle = "#8a7a6a"; ctx.lineWidth = 2 * s; ctx.stroke(); txt("$", x, y - 83 * s, 26 * s, "#2a8a4a"); }
}
function coin(x, y, r, label) { circle(x, y + 4, r, "#c8901a"); circle(x, y, r, "#f6c632"); circle(x, y, r * 0.72, "#f8d65a"); if (label) txt(label, x, y + 2, r * 0.9, "#a86a10"); }
function globe(x, y, r) {
  ctx.fillStyle = "#8a8f9a"; ctx.beginPath(); ctx.moveTo(x - 80, y + r + 120); ctx.lineTo(x + 80, y + r + 120); ctx.lineTo(x + 30, y + r); ctx.lineTo(x - 30, y + r); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 10, x, y, r); g.addColorStop(0, "#6ab8f0"); g.addColorStop(1, "#2a6ab0");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); const off = (T * 40) % (r * 4);
  ctx.fillStyle = "#6ab04a"; for (const [dx, dy, a, b] of [[-0.4, -0.3, 0.35, 0.25], [0.3, -0.1, 0.3, 0.4], [0.1, 0.45, 0.25, 0.18], [-0.7, 0.3, 0.2, 0.3], [0.8, -0.5, 0.25, 0.2]]) for (const k of [0, 1]) { ctx.beginPath(); ctx.ellipse(x + dx * r - off + k * r * 4 + r, y + dy * r, a * r, b * r, 0.3, 0, 7); ctx.fill(); }
  ctx.restore();
}
function germany(x, y, s, o = {}) {
  ctx.fillStyle = "#7cb8e0"; ctx.beginPath(); ctx.ellipse(x, y + 40 * s, 560 * s, 420 * s, 0, 0, 7); ctx.fill();
  const P = [[-120, -330], [-20, -360], [60, -300], [180, -320], [230, -220], [250, -60], [180, 40], [260, 160], [220, 300], [80, 330], [-80, 300], [-200, 320], [-260, 200], [-220, 60], [-300, -40], [-260, -180], [-180, -220]];
  ctx.fillStyle = "#c8b48a"; ctx.beginPath(); P.forEach(([a, b], i) => i ? ctx.lineTo(x + a * s, y + b * s + 20 * s) : ctx.moveTo(x + a * s, y + b * s + 20 * s)); ctx.fill();
  ctx.fillStyle = "#f6ecd2"; ctx.beginPath(); P.forEach(([a, b], i) => i ? ctx.lineTo(x + a * s, y + b * s) : ctx.moveTo(x + a * s, y + b * s)); ctx.fill();
  if (o.line) { ctx.strokeStyle = "#d8302a"; ctx.lineWidth = 8 * s; ctx.setLineDash([22 * s, 16 * s]); ctx.beginPath(); ctx.moveTo(x - 290 * s, y - 20 * s); ctx.lineTo(x + 260 * s * o.line - 30 * s * (1 - o.line), y + 10 * s); ctx.stroke(); ctx.setLineDash([]); }
}
function label(x, y, s, text, bg = "#f6c632", fg = "#3a2a10") { ctx.font = `800 ${s}px Pop`; const w = ctx.measureText(text).width + s; ctx.fillStyle = bg; rr(x - w / 2, y - s * 0.75, w, s * 1.5, 8); ctx.fill(); ctx.strokeStyle = "#3a2a10"; ctx.lineWidth = 3; ctx.stroke(); txt(text, x, y + 2, s, fg); }
function qbox(x, y, s) { ctx.fillStyle = "#c8843a"; rr(x - 40 * s, y - 40 * s, 80 * s, 80 * s, 8 * s); ctx.fill(); ctx.fillStyle = "#e8a050"; rr(x - 40 * s, y - 40 * s, 80 * s, 16 * s, 6 * s); ctx.fill(); txt("?", x, y + 4 * s, 54 * s, "#fff4d0"); }
function ketchup(x, y, s) { ctx.fillStyle = "#d8302a"; rr(x - 20 * s, y - 70 * s, 40 * s, 80 * s, 12 * s); ctx.fill(); ctx.fillStyle = "#f4f0e8"; ctx.fillRect(x - 20 * s, y - 40 * s, 40 * s, 22 * s); ctx.fillStyle = "#f4f0e8"; rr(x - 8 * s, y - 90 * s, 16 * s, 22 * s, 4 * s); ctx.fill(); }
function cart(x, y, s) { ctx.strokeStyle = "#9aa0a8"; ctx.lineWidth = 6 * s; ctx.strokeRect(x - 70 * s, y - 120 * s, 140 * s, 80 * s); for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x - 70 * s + k * 28 * s, y - 120 * s); ctx.lineTo(x - 70 * s + k * 28 * s, y - 40 * s); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x + 70 * s, y - 120 * s); ctx.lineTo(x + 100 * s, y - 150 * s); ctx.stroke(); circle(x - 50 * s, y - 20 * s, 14 * s, "#2a2e38"); circle(x + 50 * s, y - 20 * s, 14 * s, "#2a2e38"); }
function moneyBag(x, y, s) { ctx.fillStyle = "#b8904a"; ctx.beginPath(); ctx.ellipse(x, y, 60 * s, 66 * s, 0, 0, 7); ctx.fill(); ctx.fillRect(x - 22 * s, y - 86 * s, 44 * s, 30 * s); txt("$", x, y + 6 * s, 60 * s, "#2a8a4a"); }
function key(x, y, s) { ctx.strokeStyle = "#f6c632"; ctx.lineWidth = 12 * s; ctx.beginPath(); ctx.arc(x, y, 26 * s, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y + 26 * s); ctx.lineTo(x, y + 100 * s); ctx.moveTo(x, y + 80 * s); ctx.lineTo(x + 22 * s, y + 80 * s); ctx.moveTo(x, y + 96 * s); ctx.lineTo(x + 18 * s, y + 96 * s); ctx.stroke(); }
function choco(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2); ctx.fillStyle = "#3a8ad8"; rr(-70 * s, -30 * s, 140 * s, 60 * s, 8 * s); ctx.fill(); txt("SCHOKO", 0, 2, 26 * s, "#fff"); ctx.restore(); }
function cigs(x, y, s) { ctx.fillStyle = "#f4f0e8"; rr(x - 40 * s, y - 60 * s, 80 * s, 110 * s, 8 * s); ctx.fill(); ctx.fillStyle = "#c8302a"; ctx.fillRect(x - 40 * s, y - 60 * s, 80 * s, 36 * s); for (let k = 0; k < 3; k++) { ctx.fillStyle = "#f4f0e8"; ctx.fillRect(x - 24 * s + k * 18 * s, y - 92 * s, 12 * s, 40 * s); ctx.fillStyle = "#e8a050"; ctx.fillRect(x - 24 * s + k * 18 * s, y - 92 * s, 12 * s, 12 * s); } }

// ---------------------------------------------------------------- Szenen
const Y0 = HOR + 60;
const SC = {
  invade(lt) { town("de"); store("aldi", 790, Y0, 0.8, { face: "neutral" }); store("walmart", 330, Y0 + 20, 1.1, { face: "happy", arms: [100, 40] }); for (let i = 0; i < 4; i++) person(560 + i * 60, Y0 + 60, 0.5, ["#d84040", "#3a6ad8", "#f0a030", "#5aa84a"][i]); },
  fled(lt) { town("de"); rays(); const k = ss(0.4, 1.6, lt); store("walmart", lerp(330, -300, k), Y0 - k * 600, 1.0, { face: "shock", arms: [160, 160], bob: 0 }); store("aldi", 790, Y0, 0.8, { face: "closed" }); },
  aldius(lt) { town("us"); store("walmart", 300, Y0, 1.0, { face: "worried", look: 1 }); store("aldi", 780, Y0 + 20, 0.95, { face: "happy", arms: [130, 30] }); },
  grow(lt) { town("us"); store("walmart", 230, Y0, 0.9, { face: "shock", look: 1 }); const n = Math.min(5, 1 + Math.floor(lt / 0.5)); for (let i = 0; i < n; i++) store("aldi", 560 + (i % 3) * 190, Y0 + 40 + Math.floor(i / 3) * 170, 0.5, { face: "happy" }); },
  globe(lt) { town("us"); globe(330, 720, 220); store("aldi", 820, Y0 + 20, 0.8, { face: "neutral", look: -1 }); },
  globe18(lt) { town("us"); globe(330, 720, 220); for (let i = 0; i < 6; i++) { const a = i * 1.05 + T; store("aldi", 330 + Math.cos(a) * 230, 720 + Math.sin(a) * 120 + 60, 0.18, { face: "happy", bob: 0 }); } store("aldi", 820, Y0 + 20, 0.8, { face: "happy" }); label(330, 400, 70, "18 LÄNDER"); },
  aldibig(lt) { town("us"); store("aldi", 540, Y0 + 260, 1.9, { face: "neutral", arms: [60, 60] }); },
  two(lt) { town("de"); store("aldi", 290, Y0 + 40, 0.95, { face: "sad", look: 1 }); store("aldi", 790, Y0 + 40, 0.95, { face: "sad", look: -1 }); qbox(540, 640 - Math.abs(Math.sin(T * 3)) * 20, 1.0); },
  how(lt) { town("us"); store("aldi", 540, Y0 + 160, 1.5, { face: "smirk", arms: [150, 20] }); },
  wmshelf(lt) { town("us"); store("walmart", 540, Y0 + 300, 1.7, { face: "happy", shelf: lerp(120, 420, ss(0, 1.5, lt)) }); },
  aldishelf(lt) { town("us"); store("aldi", 540, Y0 + 200, 1.4, { face: "happy", shelf: 90 }); },
  ketchup(lt) { town("us"); store("aldi", 540, Y0 + 200, 1.4, { face: "happy", arms: [120, lt > 1.0 ? 120 : 20], hold: { side: 0, fn: (x, y) => ketchup(x, y - 20, 1.3) } }); if (lt > 1.0) ketchup(540 + 1.4 * 150 + 60, Y0 + 200 - 1.4 * 120, 1.3); },
  cart(lt) { town("de"); house(420, Y0 - 40, 3.0); const x = lerp(260, 560, ss(0, 2.5, lt)); cart(x + 130, Y0 + 300, 1.6); person(x, Y0 + 300, 1.4, "#d84040", { hair: "#4a3020" }); coin(x + 240, Y0 + 60, 30); },
  fewer(lt) { town("us"); store("walmart", 300, Y0 + 40, 0.95, { face: "neutral", shelf: 380 }); store("aldi", 790, Y0 + 40, 0.8, { face: "happy", shelf: 60 }); },
  cheap(lt) { town("us"); store("walmart", 300, Y0 + 40, 0.95, { face: "worried", shelf: 380 }); store("aldi", 790, Y0 + 40, 0.8, { face: "happy", shelf: 60, arms: [20, 120] }); for (let i = 0; i < 4; i++) coin(640 + i * 80, Y0 + 120 - Math.abs(Math.sin(T * 4 + i)) * 40, 28); label(790, Y0 + 220, 54, "BILLIGER", "#6ad04a", "#1e3a10"); },
  copy(lt) { town("us"); store("walmart", 540, Y0 + 200, 1.4, { face: "neutral", shelf: 380, look: 1 }); },
  trapped(lt) { town("us"); store("walmart", 540, Y0 + 200, 1.4, { face: "worried", shelf: 380, cage: ss(0.6, 0.9, lt) > 0.5 }); },
  rival(lt) { town("us"); store("walmart", 300, Y0 + 40, 0.95, { face: "worried", shelf: 360, cage: true }); store("target", 790, Y0 + 40, 0.95, { face: "happy", shelf: 360, arms: [20, 120], hold: { side: 1, fn: (x, y) => choco(x, y - 30, 1.0) } }); },
  parent(lt) { town("us"); store("walmart", 300, Y0 - 40, 0.9, { face: "worried", cage: true }); store("target", 800, Y0 - 40, 0.9, { face: "happy" }); person(420, Y0 + 520, 2.0, "#4aa860", { long: true, hair: "#1e1e24", mood: "angry" }); person(640, Y0 + 520, 1.4, "#4aa0e8", { mood: "scream", hair: "#c8843a" }); },
  dilemma(lt) { town("us"); store("walmart", 300, Y0 + 40, 0.95, { face: "worried", shelf: 360, cage: true }); store("target", 790, Y0 + 40, 0.95, { face: "worried", shelf: 360, cage: true }); },
  everything(lt) { town("us"); store("walmart", 300, Y0 + 40, 0.95, { face: "sad", shelf: 520, cage: true }); store("target", 790, Y0 + 40, 0.95, { face: "sad", shelf: 520, cage: true }); rays("rgba(255,255,255,0.18)"); },
  noplay(lt) { town("us"); store("aldi", 540, Y0 + 160, 1.4, { face: "closed", shelf: 70, arms: [100 + 15 * Math.sin(T * 6), 100 - 15 * Math.sin(T * 6)] }); },
  secret(lt) { town("us"); store("walmart", 540, Y0 + 160, 1.3, { face: "neutral", look: -1 }); },
  rent(lt) { town("us"); store("walmart", 540, Y0 + 60, 1.1, { face: "worried" }); for (let i = 0; i < 6; i++) person(260 + i * 112, Y0 + 260, 0.75, "#2a2e38", { suit: true, hat: i % 2 === 0, sign: true, skin: ["#e8b48a", "#a8714f", "#f2c7a5"][i % 3] }); },
  share(lt) { town("us"); store("walmart", 540, Y0 + 60, 1.1, { face: "sweat" in {} ? "worried" : "worried", sweat: true }); for (let i = 0; i < 6; i++) person(260 + i * 112, Y0 + 260 - Math.abs(Math.sin(T * 6 + i)) * 20, 0.75, "#2a2e38", { suit: true, hat: i % 2 === 0, sign: true, mood: "angry", skin: ["#e8b48a", "#a8714f", "#f2c7a5"][i % 3] }); },
  cents(lt) { town("us"); store("walmart", 540, Y0 + 60, 1.1, { face: "happy" }); for (let i = 0; i < 3; i++) coin(760 + (i % 2) * 60, Y0 - 260 + i * 60, 36, "1¢"); for (let i = 0; i < 6; i++) person(260 + i * 112, Y0 + 260, 0.75, "#2a2e38", { suit: true, hat: i % 2 === 0, sign: true }); label(540, 540, 64, "3 CENT"); },
  interest(lt) { town("us"); store("walmart", 540, Y0 + 60, 1.1, { face: "sad", sweat: true }); const k = ss(0.3, 1.2, lt); coin(760, Y0 - 260, 36, "1¢"); coin(820, Y0 - 200, 36, "1¢"); coin(lerp(320, 120, k), lerp(Y0 - 200, Y0 + 300, k), 36, "1¢"); for (let i = 0; i < 6; i++) person(260 + i * 112, Y0 + 260, 0.75, "#2a2e38", { suit: true, hat: i % 2 === 0, sign: true }); },
  noshare(lt) { town("us"); store("aldi", 540, Y0 + 60, 1.0, { face: "happy", shelf: 70 }); const k = ss(0.2, 1.6, lt); for (let i = 0; i < 4; i++) person(240 + i * 70 - k * 500, Y0 + 220, 0.6, "#2a2e38", { suit: true }); },
  owns(lt) { town("us"); store("aldi", 540, Y0 + 60, 1.0, { face: "happy", shelf: 70, arms: [20, 140], hold: { side: 1, fn: (x, y) => key(x, y - 60, 1.2) } }); },
  bill(lt) { town("us"); store("aldi", 600, Y0 + 160, 1.2, { face: "happy", shelf: 70, arms: [120, 20] }); const k = ss(0.3, 1.0, lt); coin(lerp(380, 230, k), lerp(Y0 - 160, Y0 + 60, k) - Math.sin(k * Math.PI) * 120, 32, "1¢"); person(200, Y0 + 300, 1.0, "#f0a030", { hair: "#1e1e24", skin: "#a8714f" }); },
  who(lt) { town("us"); ctx.fillStyle = "#f0d8c8"; rr(60, Y0 - 300, 260, 300, 10); ctx.fill(); txt("?", 190, Y0 - 150, 160, "#8a6a5a"); store("aldi", 640, Y0 + 60, 1.1, { face: "neutral" }); for (let i = 0; i < 3; i++) person(560 + i * 80, Y0 + 60 - 1.1 * 230 - 40, 0.6, "#2a2e38", { suit: true, skin: ["#e8b48a", "#f2c7a5", "#c98e6a"][i], long: i === 1 }); },
  brothers(lt) { town("de"); store("aldi", 540, Y0 + 260, 1.9, { face: "closed" }); person(400, Y0 + 520, 1.6, "#2a2e38", { suit: true, hair: "#9a9aa4" }); person(680, Y0 + 520, 1.6, "#2a2e38", { suit: true, hair: "#6a6a74" }); circle(540, Y0 + 300, 26, "#e8b48a"); },
  cig(lt) { town("de"); store("aldi", 540, Y0 + 60, 1.0, { face: "worried" }); person(380, Y0 + 280, 1.1, "#2a2e38", { suit: true, hair: "#9a9aa4", mood: "angry" }); person(700, Y0 + 280, 1.1, "#2a2e38", { suit: true, hair: "#6a6a74", mood: "angry" }); cigs(540, Y0 + 120 - Math.abs(Math.sin(T * 4)) * 20, 1.0); },
  split(lt) { town("de"); const k = ss(0.1, 0.8, lt); store("aldi", lerp(540, 300, k), Y0 + 40, 0.9, { face: "sad", look: 1 }); store("aldi", lerp(540, 780, k), Y0 + 40, 0.9, { face: "sad", look: -1 }); },
  map(lt) { ctx.fillStyle = "#9cc45a"; ctx.fillRect(0, 0, W, H); germany(540, 820, 1.4); store("aldi", 480, 520, 0.45, { face: "happy", bob: 0 }); store("aldi", 600, 1120, 0.45, { face: "happy", bob: 0 }); },
  equator(lt) { ctx.fillStyle = "#9cc45a"; ctx.fillRect(0, 0, W, H); germany(540, 820, 1.4, { line: ss(0, 1, lt) }); store("aldi", 480, 520, 0.45, { face: "neutral", bob: 0 }); store("aldi", 600, 1120, 0.45, { face: "neutral", bob: 0 }); label(250, 760, 40, "ALDI-ÄQUATOR"); },
  neither(lt) { ctx.fillStyle = "#9cc45a"; ctx.fillRect(0, 0, W, H); germany(540, 820, 1.4, { line: 1 }); store("aldi", 480, 520, 0.45, { face: "worried", bob: 0 }); store("aldi", 600, 1120, 0.45, { face: "worried", bob: 0 }); label(250, 760, 40, "ALDI-ÄQUATOR"); },
  leave(lt) { ctx.fillStyle = "#9cc45a"; ctx.fillRect(0, 0, W, H); rays("rgba(255,255,255,0.6)"); germany(540, 820, 1.4, { line: 1 }); const k = ss(0.3, 1.5, lt); store("aldi", lerp(480, -200, k), lerp(520, 300, k), 0.45, { face: "happy", bob: 0 }); store("aldi", lerp(600, 1300, k), lerp(1120, 900, k), 0.45, { face: "happy", bob: 0 }); },
  fly(lt) { town("us"); const k = ss(0, 1.0, lt); store("aldi", 760, lerp(200, Y0 + 40, k), 0.9, { face: "happy", arms: [150, 150], bob: 0 }); store("walmart", 280, Y0 + 20, 0.85, { face: "shock" }); },
  tj(lt) { town("us"); store("aldi", 210, Y0 + 40, 0.65, { face: "happy" }); store("tj", 540, Y0 + 60, 0.9, { face: "happy" }); store("aldi", 870, Y0 + 40, 0.65, { face: "smirk" }); },
  winn(lt) { town("us"); store("aldi", 280, Y0 + 60, 0.9, { face: "happy", arms: [20, 70], hold: { side: 1, fn: (x, y) => moneyBag(x + 40, y, 0.9) } }); for (let i = 3; i >= 0; i--) store("winn", 640 + i * 120, Y0 - i * 40, 0.55 - i * 0.07, { face: "worried", bob: 0 }); },
  row(lt) { town("us"); for (let i = 6; i >= 0; i--) store("winn", 300 + i * 110, Y0 + 300 - i * 70, 0.85 - i * 0.1, { face: "neutral", bob: 0 }); },
  convert(lt) { town("us"); for (let i = 6; i >= 0; i--) { const done = lt > (6 - i) * 0.2 + 0.2; store(done ? "aldi" : "winn", 300 + i * 110, Y0 + 300 - i * 70, 0.85 - i * 0.1, { face: done ? "happy" : "neutral", bob: 0 }); } },
  end(lt, d) {
    town("us");
    if (lt < d * 0.5) { store("walmart", 540, Y0 + 60, 1.1, { face: "worried", sweat: true }); for (let i = 0; i < 6; i++) person(260 + i * 112, Y0 + 260 - Math.abs(Math.sin(T * 6 + i)) * 20, 0.75, "#2a2e38", { suit: true, hat: i % 2 === 0, sign: true, mood: "angry" }); }
    else { store("walmart", 300, Y0 + 40, 0.95, { face: "worried", sweat: true, look: 1 }); store("aldi", 790, Y0 + 40, 0.85, { face: "smirk", look: -1, arms: [20, 120] }); }
  },
};

const HL = ["#f6c632", "#6ad04a", "#e84a4a", "#f6c632", "#9aa4c4"];
function caption(t) {
  const i = TL.caps.findIndex(c => t >= c.t0 - 0.05 && t < c.t1 + 0.05);
  if (i < 0) return;
  const c = TL.caps[i];
  ctx.font = "800 76px Pop"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.lineJoin = "round";
  const sp = ctx.measureText(" ").width * 1.3;
  const ws = c.w.map(w => ctx.measureText(w).width);
  let lines = [[0, c.w.length]]; const tot = ws.reduce((a, b) => a + b, 0) + sp * (c.w.length - 1);
  if (tot > 980 && c.w.length > 1) lines = [[0, c.w.length - 1], [c.w.length - 1, c.w.length]];
  const maxW = Math.max(...lines.map(([a, b]) => ws.slice(a, b).reduce((p, q) => p + q, 0) + sp * (b - a - 1)));
  const k = easeOutBack((t - c.t0) / 0.16) * Math.min(1, 1000 / maxW);
  ctx.save(); ctx.translate(540, 1440); ctx.scale(k, k); ctx.translate(-540, -1440);
  lines.forEach(([a, b], li) => {
    const lw = ws.slice(a, b).reduce((p, q) => p + q, 0) + sp * (b - a - 1); let x = 540 - lw / 2; const y = 1440 + li * 88 - (lines.length - 1) * 44;
    for (let j = a; j < b; j++) { ctx.lineWidth = 16; ctx.strokeStyle = "#2a1e14"; ctx.strokeText(c.w[j], x, y); ctx.fillStyle = j === c.hl ? HL[i % HL.length] : "#ffffff"; ctx.fillText(c.w[j], x, y); x += ws[j] + sp; }
  });
  ctx.restore();
}

function frame(t) {
  T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sh = TL.shots.find(s => t >= s.t0 && t < s.t1) || TL.shots[TL.shots.length - 1];
  const lt = t - sh.t0, d = sh.t1 - sh.t0;
  const base = ["map", "equator", "neither", "leave"].includes(sh.id) ? 1.0 : ["aldibig", "brothers", "wmshelf", "aldishelf", "ketchup", "how", "copy", "trapped", "noplay"].includes(sh.id) ? 1.15 : 1.45;
  const z = base * (1 + 0.045 * clamp(lt / Math.max(d, 0.5)));
  const cy = base > 1 ? Y0 : 900;
  ctx.save(); ctx.translate(540, cy); ctx.scale(z, z); ctx.translate(-540, -cy);
  SC[sh.id](lt, d);
  ctx.restore();
  caption(t);
}

window.setup = async () => { await Promise.all([700, 800].map(w => document.fonts.load(`${w} 20px Pop`))); return { duration: TL.duration }; };
window.renderFrame = frame;
