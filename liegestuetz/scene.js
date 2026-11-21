// Liegestütze: MOTIVATION / DISZIPLIN / EGO / OBSESSION – Nachbau (deutsch)
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const S = 1080 / 576;
const DUR = 46.0;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const START = 1.3;

// Vier Figuren: Position, Farbe, Ablauf
const F = [
  { name: "MOTIVATION", x: 144, g: 374, col: [242, 196, 40],
    glow: t => t < START ? 0 : lerp(1, 0, ss(START, 11, t)),
    rate: t => t < START ? 0 : lerp(1.15, 0.3, ss(START, 11, t)),
    lie: [11.4, 14.2], face: t => t < 4 ? "eager" : t < 8.5 ? "tired" : "sad" },
  { name: "DISZIPLIN", x: 432, g: 374, col: [52, 108, 230],
    glow: t => t < START ? 0 : 0.85 * (1 - ss(25, 30, t)),
    rate: t => t < START ? 0 : t < 26 ? 0.72 : 0.45,
    lie: [30.3, 32.6], face: t => t < 26 ? "calm" : "tired" },
  { name: "EGO", x: 144, g: 887, col: [228, 40, 40],
    glow: t => t < START ? 0 : lerp(0.55, 1, ss(START, 8, t)) * (1 - ss(44.6, 45.8, t)),
    rate: t => t < START ? 0 : t < 38 ? 0.8 : 0.62,
    lie: null, face: t => t < 30 ? "angry" : "strain" },
  { name: "OBSESSION", x: 432, g: 887, col: [146, 64, 230],
    glow: t => t < START ? 0 : lerp(0.35, 1, ss(START, 15, t)) * (1 - ss(32.5, 36, t)),
    rate: t => t < START ? 0 : t < 34 ? lerp(1.0, 1.3, ss(START, 20, t)) : 0.5,
    lie: [36.1, 37.4], face: t => t < 33 ? "angry" : "tired" },
];

// Wiederholungs-Phase = Integral der Rate
function phase(f, t) {
  let ph = 0; const dt = 0.04;
  for (let x = 0; x < t; x += dt) ph += f.rate(x) * Math.min(dt, t - x);
  return ph;
}
function state(f, t) {
  if (t < START) return { pose: "sit", face: "idle" };
  if (f.lie && t >= f.lie[0]) {
    if (t < f.lie[1]) return { pose: "lie", k: ss(f.lie[0], f.lie[0] + 0.35, t), face: "sad" };
    return { pose: "sit", k: ss(f.lie[1], f.lie[1] + 0.5, t), face: "sad", from: "lie" };
  }
  const ph = phase(f, t);
  const p = 0.5 - 0.5 * Math.cos(ph * 2 * Math.PI);
  return { pose: "push", p, face: f.face(t), k: ss(START, START + 0.4, t) };
}

// Gelenkpunkte (lokal: x nach rechts, y nach oben negativ)
const POSES = {
  sit: { foot: [44, 0], knee: [12, -44], hip: [-28, 0], sh: [-22, -50], elbow: [-4, -46], hand: [12, -42], head: [-18, -74] },
  pushUp: { foot: [-92, 0], knee: [-46, -14], hip: [-12, -24], sh: [36, -36], elbow: [36, 0], hand: [62, 0], head: [50, -58] },
  pushDown: { foot: [-92, 0], knee: [-46, -8], hip: [-12, -12], sh: [36, -18], elbow: [32, 0], hand: [62, 0], head: [54, -38] },
  lie: { foot: [-92, 0], knee: [-46, -2], hip: [-12, -3], sh: [36, -5], elbow: [50, -2], hand: [72, -2], head: [60, -17] },
};
function mixP(a, b, k) { const o = {}; for (const key in a) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return o; }

function stick(f, t) {
  const st = state(f, t);
  let P;
  if (st.pose === "sit") P = st.from === "lie" ? mixP(POSES.lie, POSES.sit, st.k) : POSES.sit;
  else if (st.pose === "lie") P = mixP(mixP(POSES.pushUp, POSES.pushDown, 0.6), POSES.lie, st.k);
  else { const push = mixP(POSES.pushUp, POSES.pushDown, st.p); P = st.k < 1 ? mixP(POSES.sit, push, st.k) : push; }
  const shake = st.face === "strain" ? Math.sin(t * 60) * 1.2 : 0;
  ctx.save(); ctx.translate(f.x + shake, f.g); ctx.scale(1.3, 1.3);
  const line = (pts, w) => {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const [lw, col] of [[w + 5, "#05060c"], [w, "#f6f6f8"]]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
    }
  };
  line([P.foot, P.knee, P.hip, P.sh], 6.5);
  line([P.sh, P.elbow, P.hand], 6.5);
  // Kopf
  const [hx, hy] = P.head;
  ctx.fillStyle = "#05060c"; ctx.beginPath(); ctx.arc(hx, hy, 21.5, 0, 6.29); ctx.fill();
  ctx.fillStyle = "#f6f6f8"; ctx.beginPath(); ctx.arc(hx, hy, 18.5, 0, 6.29); ctx.fill();
  face(hx, hy, st.face, t, f);
  ctx.restore();
}

function face(x, y, mode, t, f) {
  ctx.strokeStyle = "#111"; ctx.fillStyle = "#111"; ctx.lineCap = "round"; ctx.lineWidth = 2;
  const ex = [x - 2, x + 8], ey = y - 2;
  const brow = (a) => { for (const e of ex) { ctx.beginPath(); ctx.moveTo(e - 4, ey - 7 - (e < x + 3 ? a : -a)); ctx.lineTo(e + 4, ey - 7 + (e < x + 3 ? a : -a)); ctx.stroke(); } };
  const dots = (r = 2.2) => { for (const e of ex) { ctx.beginPath(); ctx.arc(e, ey, r, 0, 6.29); ctx.fill(); } };
  if (mode === "idle") { dots(); ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + 7, y + 8); ctx.stroke(); }
  else if (mode === "eager") { for (const e of ex) { ctx.beginPath(); ctx.arc(e, ey, 3.6, 0, 6.29); ctx.stroke(); ctx.beginPath(); ctx.arc(e + 0.6, ey, 1.6, 0, 6.29); ctx.fill(); } ctx.beginPath(); ctx.ellipse(x + 4, y + 9, 3, 3.5, 0, 0, 6.29); ctx.fill(); }
  else if (mode === "calm") { brow(-1); for (const e of ex) { ctx.beginPath(); ctx.moveTo(e - 3, ey); ctx.lineTo(e + 3, ey); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + 8, y + 8); ctx.stroke(); }
  else if (mode === "tired") { brow(1.5); dots(1.8); ctx.beginPath(); ctx.arc(x + 4, y + 12, 4, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (mode === "sad") { brow(2); dots(1.8); ctx.beginPath(); ctx.arc(x + 4, y + 12, 5, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (mode === "angry") { brow(-2.5); dots(2); ctx.beginPath(); ctx.moveTo(x, y + 9); ctx.lineTo(x + 8, y + 8); ctx.stroke(); }
  else if (mode === "strain") {
    brow(-2.5); for (const e of ex) { ctx.beginPath(); ctx.moveTo(e - 3, ey - 2); ctx.lineTo(e + 2, ey); ctx.lineTo(e - 3, ey + 2); ctx.stroke(); }
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.rect(x - 1, y + 6, 10, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 6); ctx.lineTo(x + 4, y + 12); ctx.stroke();
    ctx.strokeStyle = `rgba(${f.col.join(",")},0.9)`; ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const a = -0.6 + k * 0.6, r = 26 + 3 * Math.sin(t * 20 + k); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7)); ctx.stroke(); }
  }
}

// Funken
const sparks = F.map((f, i) => { const r = rnd(10 + i); return Array.from({ length: 46 }, () => ({ x: (r() - 0.5) * 330, y: -r() * 260 + 40, sp: 6 + r() * 16, s: 0.8 + r() * 1.6, ph: r() * 6.28 })); });

function glowArea(f, i, t) {
  const g = f.glow(t);
  if (g <= 0.01) return;
  const [r, gg, b] = f.col;
  const cx = f.x - 10, cy = f.g - 50;
  const pulse = 1 + 0.04 * Math.sin(t * 5 + i);
  const rad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 215 * pulse);
  rad.addColorStop(0, `rgba(${r},${gg},${b},${0.85 * g})`);
  rad.addColorStop(0.45, `rgba(${r},${gg},${b},${0.55 * g})`);
  rad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  ctx.fillStyle = rad; ctx.fillRect(cx - 240, cy - 240, 480, 480);
  for (const p of sparks[i]) {
    const y = cy + ((p.y - t * p.sp) % 260 + 260) % 260 - 160;
    const x = cx + p.x + Math.sin(t * 1.5 + p.ph) * 6;
    const a = g * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + p.ph)));
    ctx.fillStyle = `rgba(${Math.min(255, r + 90)},${Math.min(255, gg + 90)},${Math.min(255, b + 90)},${a})`;
    ctx.beginPath(); ctx.arc(x, y, p.s, 0, 6.29); ctx.fill();
  }
}

function label(f, t) {
  const on = t >= START ? ss(START, START + 0.3, t) : 0;
  const g = f.glow(t);
  ctx.font = "800 26px Pop"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2.5px";
  const y = f.g - 150;
  if (on > 0) { ctx.shadowColor = `rgba(${f.col.join(",")},${0.4 + 0.6 * g})`; ctx.shadowBlur = 14; }
  ctx.fillStyle = on > 0 ? `rgba(246,244,240,${lerp(0.3, 1, on)})` : "rgba(130,130,140,0.35)";
  ctx.fillText(f.name, f.x - 6, y);
  ctx.shadowBlur = 0; ctx.letterSpacing = "0px";
}

function frame(t) {
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const bg = ctx.createRadialGradient(288, 520, 50, 288, 520, 700);
  bg.addColorStop(0, "#111727"); bg.addColorStop(1, "#06080f");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 576, 1024);
  ctx.globalCompositeOperation = "lighter";
  F.forEach((f, i) => glowArea(f, i, t));
  ctx.globalCompositeOperation = "source-over";
  // Bodenlinien
  ctx.fillStyle = "rgba(160,170,200,0.10)"; ctx.fillRect(0, 375, 576, 1.5); ctx.fillRect(0, 888, 576, 1.5);
  F.forEach(f => { label(f, t); stick(f, t); });
  // Abblenden am Ende
  const fo = ss(44.8, 45.9, t);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, 576, 1024); }
}

window.setup = async () => { await Promise.all([700, 800].map(w => document.fonts.load(`${w} 20px Pop`))); return { duration: DUR }; };
window.renderFrame = frame;
window.exportEvents = () => {
  // Zeitpunkte der unteren Umkehrpunkte (für Ton) je Figur
  const ev = { duration: DUR, reps: F.map(() => []), lie: F.map(f => f.lie ? f.lie[0] : null) };
  F.forEach((f, i) => { let last = 0; for (let t = START; t < DUR; t += 0.02) { const ph = phase(f, t); const n = Math.floor(ph + 0.5); if (n > last && state(f, t).pose === "push") { ev.reps[i].push(+t.toFixed(2)); } last = Math.max(last, n); } });
  return ev;
};
