// "Aufschieber vs. Planer" – deutsche Version (1080x1920)
"use strict";
const W = 1080, H = 1920, DUR = 13.4;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const PX = 270, QX = 798;            // Mitte Aufschieber / Planer
const HEAD_Y = 980, HEAD_R = 47;
const DESK_TOP = 1180, DESK_FRONT = 1256, DESK_PANEL = 1400, DESK_BOTTOM = 1478;
const CAL = { x0: 360, x1: 588, y0: 594, y1: 846 };
const WIN = { x0: 720, x1: 924, y0: 598, y1: 884 };
const RED = "#e53935";

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ------------------------------------------------------------ Zeitplan
// Kalenderblätter: [Zeit, Inhalt]
const PAGES = [[0, 30], [0.45, 28], [0.9, 26], [1.35, 23], [1.8, 20], [2.25, 18], [2.7, 15], [3.15, 12], [3.45, 9], [3.75, 6],
  [4.0, 3], [4.4, 2], [4.9, 1], [6.95, "DUE"], [9.9, 30]];
const T_PANIC = 4.9, T_DUE = 6.95, T_GRADE = 7.3, T_THROW = 8.0, T_COLLAPSE = 8.7, T_RESET = 9.9, T_PHONE2 = 10.9;
const T_PLAN_DONE = 3.45, T_PLAN_HOLD = 7.3, T_PLAN_SIT = 8.25, T_PLAN_WRITE2 = 11.0;

function pageAt(t) {
  let i = 0;
  for (let k = 0; k < PAGES.length; k++) if (t >= PAGES[k][0]) i = k;
  return i;
}

// ------------------------------------------------------------ Hilfen
function setFont(size, weight = 700, spacing = 0) {
  ctx.font = `${weight} ${size}px Pix`;
  ctx.letterSpacing = `${spacing}px`;
}
function textC(s, x, y, size, spacing, color, weight = 700) {
  setFont(size, weight, spacing);
  const w = ctx.measureText(s).width - spacing;
  ctx.fillStyle = color;
  ctx.fillText(s, x - w / 2, y);
  ctx.letterSpacing = "0px";
}
function glow(x, y, r, color, a) {
  if (a <= 0.003) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ------------------------------------------------------------ Kalender
function calendarPage(content, x0, y0, w, h) {
  const red = content === 1 || content === "DUE";
  ctx.fillStyle = red ? RED : "#f1f1ef";
  ctx.fillRect(x0, y0, w, h);
  const fg = red ? "#ffffff" : "#1b1b1d";
  if (content === "DUE") {
    textC("ABGABE", x0 + w / 2, y0 + h * 0.58, 56, 0, fg);
    textC("HEUTE", x0 + w / 2, y0 + h * 0.82, 27, 4, fg);
  } else {
    textC(String(content), x0 + w / 2, y0 + h * 0.64, 128, -14, fg);
    textC(content === 1 ? "TAG ÜBRIG" : "TAGE ÜBRIG", x0 + w / 2, y0 + h * 0.87, 25, 2, fg);
  }
}

function drawCalendar(t) {
  const { x0, x1, y0, y1 } = CAL;
  const w = x1 - x0;
  // Rahmen + Ringe
  ctx.fillStyle = "#26262a";
  ctx.fillRect(x0 - 8, y0, w + 16, y1 - y0 + 8);
  ctx.fillStyle = "#3a3a3f";
  ctx.fillRect(x0 - 8, y0, w + 16, 44);
  textC("0", x0 + 50, y0 + 34, 24, 0, "#bdbdbd", 400);
  textC("0", x1 - 50, y0 + 34, 24, 0, "#bdbdbd", 400);
  const py0 = y0 + 46, ph = y1 - py0;
  const i = pageAt(t);
  calendarPage(PAGES[i][1], x0, py0, w, ph);
  // gerade abgerissene Blätter fallen nach unten
  for (let k = Math.max(1, i - 3); k <= i; k++) {
    const dt = t - PAGES[k][0];
    if (dt < 0 || dt > 0.9) continue;
    const u = dt / 0.9;
    const prev = PAGES[k - 1][1];
    ctx.save();
    const side = k % 2 ? 1 : -1;
    ctx.translate(x0 + w / 2 + side * 40 * u, py0 + ph / 2 + 380 * u * u);
    ctx.rotate(side * (0.15 + 0.6 * u) * (k === PAGES.length - 1 ? 1.6 : 1));
    ctx.globalAlpha = 1 - u * 0.8;
    calendarPage(prev, -w / 2, -ph / 2, w, ph);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------ Fenster
function skyColor(t) {
  // Tag (blau) / Abend (rosa) / Nacht (dunkel) – im Wechsel, Nachtschicht 5.0–6.4, danach Tag
  const day = [140, 178, 230], dusk = [222, 190, 205], night = [16, 22, 44], dawn = [236, 182, 150];
  if (t >= 4.95 && t < 6.4) return { c: night, moon: 1 };
  if (t >= 6.4 && t < 7.2) { const k = ramp(t, 6.4, 7.2); return { c: k < 0.5 ? mix(night, dawn, k * 2) : mix(dawn, day, k * 2 - 1), moon: 0 }; }
  if (t >= 7.2 && t < 10.5) return { c: day, moon: 0 };
  const ph = ((t + 0.25) / 0.9) % 1;     // ein Tag ≈ 0,9 s
  if (ph < 0.45) return { c: day, moon: 0 };
  if (ph < 0.6) return { c: mix(day, dusk, (ph - 0.45) / 0.15), moon: 0 };
  if (ph < 0.68) return { c: mix(dusk, night, (ph - 0.6) / 0.08), moon: 0 };
  if (ph < 0.92) return { c: night, moon: 1 };
  return { c: mix(night, day, (ph - 0.92) / 0.08), moon: 0 };
}

function drawWindow(t) {
  const { x0, x1, y0, y1 } = WIN;
  const s = skyColor(t);
  const bright = (s.c[0] + s.c[1] + s.c[2]) / 765;
  glow((x0 + x1) / 2, (y0 + y1) / 2 + 120, 360, "170,195,235", 0.22 * bright);
  ctx.fillStyle = "#3b3b40";
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const g = ctx.createRadialGradient(x0 + 150, y0 + 70, 5, x0 + 120, y0 + 140, 230);
  g.addColorStop(0, rgb(mix(s.c, [255, 255, 255], 0.55 * bright)));
  g.addColorStop(1, rgb(s.c));
  ctx.fillStyle = g;
  ctx.fillRect(x0 + 14, y0 + 14, x1 - x0 - 28, y1 - y0 - 28);
  if (s.moon) {
    ctx.fillStyle = "#f4f4f4";
    ctx.beginPath(); ctx.arc(x0 + 62, y0 + 64, 11, 0, Math.PI * 2); ctx.fill();
  }
  // Fensterkreuz
  ctx.fillStyle = "#3b3b40";
  ctx.fillRect((x0 + x1) / 2 - 6, y0, 12, y1 - y0);
  ctx.fillRect(x0, (y0 + y1) / 2 - 6, x1 - x0, 12);
  ctx.strokeStyle = "#2a2a2e"; ctx.lineWidth = 3;
  ctx.strokeRect(x0 + 1.5, y0 + 1.5, x1 - x0 - 3, y1 - y0 - 3);
  return bright;
}

// ------------------------------------------------------------ Möbel
function chair(cx) {
  const g = ctx.createLinearGradient(0, 1010, 0, 1180);
  g.addColorStop(0, "#4a4a4f"); g.addColorStop(1, "#303034");
  ctx.fillStyle = g;
  rrect(cx - 84, 1010, 168, 175, 6); ctx.fill();
}

function desk(x0, x1) {
  const inset = 22;
  // Oberseite (leichte Perspektive)
  const gt = ctx.createLinearGradient(0, DESK_TOP, 0, DESK_FRONT);
  gt.addColorStop(0, "#5f5f64"); gt.addColorStop(1, "#77777c");
  ctx.fillStyle = gt;
  ctx.beginPath();
  ctx.moveTo(x0 + inset, DESK_TOP); ctx.lineTo(x1 - inset, DESK_TOP); ctx.lineTo(x1, DESK_FRONT); ctx.lineTo(x0, DESK_FRONT);
  ctx.closePath(); ctx.fill();
  // Vorderseite
  const gf = ctx.createLinearGradient(0, DESK_FRONT, 0, DESK_BOTTOM);
  gf.addColorStop(0, "#4a4a4f"); gf.addColorStop(1, "#38383c");
  ctx.fillStyle = gf;
  ctx.fillRect(x0, DESK_FRONT, x1 - x0, DESK_PANEL - DESK_FRONT);
  ctx.fillStyle = "#2b2b2f";
  ctx.fillRect(x0, DESK_FRONT, x1 - x0, 10);
  // Beine
  ctx.fillStyle = "#3a3a3e";
  ctx.fillRect(x0, DESK_PANEL, 16, DESK_BOTTOM - DESK_PANEL);
  ctx.fillRect(x1 - 16, DESK_PANEL, 16, DESK_BOTTOM - DESK_PANEL);
}

function feet(cx) {
  ctx.fillStyle = "#f2f2f2";
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(cx + s * 44, DESK_PANEL + 36, 24, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3d3d41"; ctx.fillRect(cx + s * 44 - 9, DESK_PANEL, 18, 24); ctx.fillStyle = "#f2f2f2";
  }
}

function floorReflection() {
  const g = ctx.createLinearGradient(0, DESK_BOTTOM, 0, DESK_BOTTOM + 220);
  g.addColorStop(0, "rgba(40,40,44,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(PX - 172, DESK_BOTTOM, 344, 220);
  ctx.fillRect(QX - 178, DESK_BOTTOM, 356, 220);
}

// ------------------------------------------------------------ Figur
// pose: { head:[dx,y], sh:[y], arms:[[elbow,hand],[elbow,hand]] } – x relativ zur Figurmitte
function torso(cx, pose) {
  const top = pose.sh, lean = pose.lean || 0;
  const g = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
  g.addColorStop(0, "#d9d9d9"); g.addColorStop(0.5, "#ffffff"); g.addColorStop(1, "#d4d4d4");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - 40 + lean, top);
  ctx.lineTo(cx + 40 + lean, top);
  ctx.lineTo(cx + 34, DESK_TOP + 10);
  ctx.lineTo(cx - 34, DESK_TOP + 10);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + lean, top + 4, 42, 18, 0, Math.PI, 0); ctx.fill();
}

function head(cx, pose, lit) {
  const [dx, y] = pose.head;
  const g = ctx.createRadialGradient(cx + dx - 12, y - 14, 4, cx + dx, y, HEAD_R + 4);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.75, "#f0f0f0"); g.addColorStop(1, "#c9c9c9");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx + dx, y, HEAD_R, 0, Math.PI * 2); ctx.fill();
  if (lit > 0) glow(cx + dx, y + 20, 90, "190,215,255", 0.45 * lit);
}

function arms(cx, pose) {
  for (const [side, [el, hd]] of [[-1, pose.arms[0]], [1, pose.arms[1]]]) {
    const s = [cx + side * 34 + (pose.lean || 0), pose.sh + 14];
    const e = [cx + el[0], el[1]], h = [cx + hd[0], hd[1]];
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "#a9a9a9"; ctx.lineWidth = 36;
    ctx.beginPath(); ctx.moveTo(...s); ctx.lineTo(...e); ctx.lineTo(...h); ctx.stroke();
    ctx.strokeStyle = "#fafafa"; ctx.lineWidth = 30;
    ctx.beginPath(); ctx.moveTo(...s); ctx.lineTo(...e); ctx.lineTo(...h); ctx.stroke();
  }
}

const POSES = {
  phone: t => ({ head: [0, HEAD_Y + 2 * Math.sin(t * 2)], sh: 1048, arms: [[[-50, 1112], [-14, 1058]], [[50, 1112], [14, 1058]]] }),
  phoneOut: t => ({ head: [6, HEAD_Y], sh: 1048, arms: [[[-50, 1112], [-20, 1120]], [[78, 1080], [112, 1062]]] }),
  write: (t, ph = 0) => {
    const w = Math.sin(t * 22 + ph) * 12;
    return { head: [10, 1018], sh: 1068, lean: 6, arms: [[[-58, 1128], [-22, 1170]], [[60, 1120], [44 + w, 1168 + Math.cos(t * 22) * 3]]] };
  },
  panic: t => {
    const w = Math.sin(t * 34) * 16;
    return { head: [6 + Math.sin(t * 17) * 3, 1030], sh: 1074, lean: 4, arms: [[[-60, 1130], [-30 + w * 0.4, 1170]], [[62, 1122], [42 + w, 1168]]] };
  },
  relax: t => ({ head: [-4, HEAD_Y - 6], sh: 1046, arms: [[[-92, 960], [-26, 950]], [[92, 960], [26, 950]]] }),
  sit: t => ({ head: [0, HEAD_Y + 1.5 * Math.sin(t * 2)], sh: 1048, arms: [[[-56, 1110], [-46, 1168]], [[56, 1110], [46, 1168]]] }),
  holdUp: (t, k) => ({ head: [0, HEAD_Y], sh: 1048, arms: [[[-56, 1110], [-46, 1168]], [[lerp(56, 96, k), lerp(1110, 1070, k)], [lerp(46, 104, k), lerp(1168, 1010, k)]]] }),
  holdLeft: (t, k) => ({ head: [6, HEAD_Y], sh: 1048, arms: [[[lerp(-56, -96, k), lerp(1110, 1070, k)], [lerp(-46, -100, k), lerp(1168, 1000, k)]], [[56, 1110], [46, 1168]]] }),
  throwUp: (t, k) => ({ head: [-4, HEAD_Y - 8], sh: 1044, arms: [[[-56, 1110], [-46, 1168]], [[lerp(96, 84, k), lerp(1070, 990, k)], [lerp(104, 112, k), lerp(1010, 900, k)]]] }),
  collapse: t => ({ head: [-34, 1150 + Math.sin(t * 1.6) * 2], sh: 1120, lean: -12, arms: [[[-88, 1168], [-8, 1178]], [[56, 1170], [100, 1176]]] }),
  lyingPhone: t => ({ head: [-34, 1150], sh: 1120, lean: -12, arms: [[[-88, 1168], [-8, 1178]], [[70, 1150], [34, 1128]]] }),
};

function blend(a, b, k) {
  const L = (x, y) => (Array.isArray(x) ? x.map((v, i) => L(v, y[i])) : lerp(x, y, k));
  return { head: L(a.head, b.head), sh: L(a.sh, b.sh), lean: L(a.lean || 0, b.lean || 0), arms: L(a.arms, b.arms) };
}

function procPose(t) {
  const tr = (a, b, t0, d = 0.25) => blend(a, b, easeIO(ramp(t, t0, t0 + d)));
  if (t < 1.9) return { p: POSES.phone(t), phone: "hand" };
  if (t < 2.5) return { p: tr(POSES.phone(t), POSES.phoneOut(t), 1.9), phone: "out" };
  if (t < T_PANIC) return { p: tr(POSES.phoneOut(t), POSES.phone(t), 2.5), phone: "hand" };
  if (t < T_GRADE) return { p: tr(POSES.phone(t), POSES.panic(t), T_PANIC, 0.2), phone: "none" };
  if (t < T_THROW) return { p: blend(POSES.panic(t), POSES.holdUp(t, 1), easeIO(ramp(t, T_GRADE, T_GRADE + 0.25))), paper: "held" };
  if (t < T_COLLAPSE) return { p: blend(POSES.holdUp(t, 1), POSES.throwUp(t, 1), easeIO(ramp(t, T_THROW, T_THROW + 0.2))), paper: "thrown" };
  if (t < T_PHONE2) return { p: tr(POSES.throwUp(t, 1), POSES.collapse(t), T_COLLAPSE, 0.35), phone: "none" };
  return { p: tr(POSES.collapse(t), POSES.lyingPhone(t), T_PHONE2, 0.4), phone: "lying" };
}

function planPose(t) {
  const tr = (a, b, t0, d = 0.3) => blend(a, b, easeIO(ramp(t, t0, t0 + d)));
  if (t < T_PLAN_DONE) return { p: POSES.write(t, 1), writing: true };
  if (t < T_PLAN_HOLD) return { p: tr(POSES.write(t, 1), POSES.relax(t), T_PLAN_DONE) };
  if (t < T_PLAN_SIT) return { p: blend(POSES.relax(t), POSES.holdLeft(t, 1), easeIO(ramp(t, T_PLAN_HOLD, T_PLAN_HOLD + 0.3))), paper: true };
  if (t < T_PLAN_WRITE2) return { p: tr(POSES.holdLeft(t, 1), POSES.sit(t), T_PLAN_SIT) };
  return { p: tr(POSES.sit(t), POSES.write(t, 1), T_PLAN_WRITE2), writing: true };
}

// ------------------------------------------------------------ Gegenstände
function phoneAt(x, y, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = "#1c1c22"; rrect(-15, -26, 30, 52, 6); ctx.fill();
  ctx.fillStyle = "#cfe0ff"; rrect(-11, -21, 22, 42, 3); ctx.fill();
  ctx.restore();
  glow(x, y, 120, "185,210,255", 0.5);
}

function gradePaper(x, y, s = 1, a = 0, blur = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = "#f7f7f5"; ctx.fillRect(-46, -60, 92, 120);
  ctx.strokeStyle = RED; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(-4, -26, 30, 22, -0.1, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = RED;
  ctx.font = "700 30px Pix"; ctx.fillText("1+", -24, -15);
  ctx.strokeStyle = "#9a9a9a"; ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    for (let x2 = -34; x2 <= 30; x2 += 4) ctx.lineTo(x2, 14 + i * 11 + Math.sin(x2 * 0.5 + i) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function paperStackNeat(x, y, n) {
  if (n <= 0) return;
  const h = n * 6, w = 84, d = 14;
  ctx.fillStyle = "#b9b9bb"; ctx.fillRect(x - w / 2, y - h, w, h);          // Vorderseite
  ctx.fillStyle = "#e6e6e6";                                                  // Oberseite
  ctx.beginPath(); ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x - w / 2 + 8, y - h - d); ctx.lineTo(x + w / 2 + 8, y - h - d); ctx.lineTo(x + w / 2, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#9a9a9c";                                                  // Seite
  ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 + 8, y - h - d); ctx.lineTo(x + w / 2 + 8, y - d); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
  for (let i = 1; i < n; i++) { ctx.beginPath(); ctx.moveTo(x - w / 2, y - i * 6); ctx.lineTo(x + w / 2, y - i * 6); ctx.stroke(); }
}

function paperTower(x, h, t) {
  // hoher, wackliger Stapel aus Blättern (mit braunen Kanten)
  const n = Math.floor(h / 9);
  for (let i = 0; i < n; i++) {
    const off = Math.sin(i * 1.7) * 5 + (i > n - 4 ? Math.sin(t * 8 + i) * 1.5 : 0);
    ctx.fillStyle = i % 3 === 0 ? "#8a6a4e" : "#efefef";
    ctx.fillRect(x - 20 + off, DESK_TOP + 8 - (i + 1) * 9, 40, 8);
  }
}

function messyPapers(cx, k) {
  if (k <= 0) return;
  const r = rng(12);
  for (let i = 0; i < 9; i++) {
    const a = (r() - 0.5) * 0.8, x = cx + 30 + r() * 70, y = DESK_TOP + 18 + r() * 40;
    if (r() > k) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = i % 2 ? "#f4f4f4" : "#e2e2e2"; ctx.fillRect(-36, -9, 72, 18);
    ctx.restore();
  }
}

function cup(x) {
  ctx.fillStyle = "#e9e3da"; ctx.fillRect(x - 13, DESK_TOP + 4, 26, 32);
  ctx.fillStyle = "#8a6a4e"; ctx.fillRect(x - 13, DESK_TOP + 12, 26, 9);
}

function cloud(x, y, s, dark, flash) {
  if (s <= 0.02) return;
  const parts = [[-70, 10, 48], [-20, -18, 62], [42, -4, 54], [84, 18, 40], [0, 22, 56], [-90, 28, 34]];
  const base = mix([92, 92, 98], [252, 252, 255], flash);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (flash > 0) { ctx.shadowColor = `rgba(255,255,255,${flash})`; ctx.shadowBlur = 60; }
  for (const [dx, dy, r] of parts) {
    const g = ctx.createRadialGradient(dx - r * 0.3, dy - r * 0.5, r * 0.1, dx, dy, r);
    g.addColorStop(0, rgb(mix(base, [255, 255, 255], 0.25 * dark)));
    g.addColorStop(1, rgb(mix(base, [40, 40, 44], 0.45 * dark)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

function rain(x, y, w, h, t, a) {
  if (a <= 0.01) return;
  ctx.strokeStyle = `rgba(200,205,220,${0.55 * a})`;
  ctx.lineWidth = 2.2;
  const r = rng(3);
  for (let i = 0; i < 26; i++) {
    const rx = x - w / 2 + r() * w, sp = 900 + r() * 400, off = r();
    const ry = y + ((t * sp / h + off) % 1) * h;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 22); ctx.stroke();
  }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  // weiche Grundbeleuchtung über den Tischen
  glow(PX, 1150, 430, "60,60,68", 0.5);
  glow(QX, 1150, 430, "60,60,68", 0.5);

  textC("AUFSCHIEBER", PX + 30, 528, 40, 4, "#f2f2f2");
  textC("PLANER", QX - 36, 528, 40, 4, "#f2f2f2");

  const bright = drawWindow(t);
  drawCalendar(t);

  // Blitz bei "1 Tag übrig"
  const flash = Math.max(0, 1 - Math.abs(t - (T_PANIC + 0.15)) / 0.25) + 0.5 * Math.max(0, 1 - Math.abs(t - (T_PANIC + 0.55)) / 0.15);
  if (flash > 0) glow(PX, 900, 520, "255,255,255", 0.35 * flash);

  // Stühle, Körper
  chair(PX); chair(QX);
  const pp = procPose(t), qp = planPose(t);
  torso(PX, pp.p); torso(QX, qp.p);

  // Schreibtische
  floorReflection();
  desk(98, 442); desk(620, 976);
  feet(PX); feet(QX);

  // Gegenstände auf den Tischen
  const stackN = t < T_PLAN_DONE ? Math.floor(ramp(t, 0.2, T_PLAN_DONE) * 9) : 9;
  if (t < T_PLAN_HOLD || t > T_PLAN_SIT + 0.2) paperStackNeat(QX + 104, DESK_TOP + 32, t > T_RESET ? Math.floor(ramp(t, T_PLAN_WRITE2, DUR) * 4) : stackN);
  else paperStackNeat(QX + 104, DESK_TOP + 32, 2);
  if (t > T_PLAN_SIT + 0.2 && t < T_RESET + 0.6) gradePaper(QX + 60, DESK_TOP + 30, 0.55, 1.45);
  const towerH = t < T_PANIC ? 0 : lerp(60, 330, easeOut(ramp(t, T_PANIC, T_GRADE)));
  if (towerH > 0) paperTower(PX - 122, towerH, t);
  if (t > T_PANIC) cup(PX - 84);
  messyPapers(PX, t < T_PANIC ? 0 : ramp(t, T_PANIC, T_DUE));

  // Köpfe + Arme
  const lit = pp.phone && pp.phone !== "none" ? 1 : 0;
  head(PX, pp.p, lit); arms(PX, pp.p);
  head(QX, qp.p, 0); arms(QX, qp.p);

  // Handy
  if (pp.phone === "hand") phoneAt(PX + pp.p.arms[1][1][0] - 14, pp.p.arms[1][1][1] - 8);
  if (pp.phone === "out") phoneAt(PX + pp.p.arms[1][1][0] + 8, pp.p.arms[1][1][1] - 10, 0.3);
  if (pp.phone === "lying") phoneAt(PX + 30, 1112, -0.4);

  // Noten-Blätter
  if (pp.paper === "held") { const h = pp.p.arms[1][1]; gradePaper(PX + h[0] + 10, h[1] - 40, easeOut(ramp(t, T_GRADE, T_GRADE + 0.2))); }
  if (pp.paper === "thrown") {
    const u = ramp(t, T_THROW, T_COLLAPSE);
    const h = pp.p.arms[1][1];
    gradePaper(PX + h[0] + 10 + 60 * u, h[1] - 40 - 150 * u, 1, u * 1.2, u * 10);
  }
  if (qp.paper) {
    const h = qp.p.arms[0][1];
    gradePaper(QX + h[0] - 4, h[1] - 40, easeOut(ramp(t, T_PLAN_HOLD, T_PLAN_HOLD + 0.25)));
    if (t > T_THROW - 0.3) {
      ctx.globalAlpha = ramp(t, T_THROW - 0.3, T_THROW - 0.1);
      textC("?", QX + h[0] + 66, h[1] - 64, 44, 0, "#f2f2f2");
      ctx.globalAlpha = 1;
    }
  }

  // Gewitterwolke über dem Aufschieber
  let cs = 0;
  if (t < T_COLLAPSE) cs = lerp(0, 1.15, easeOut(ramp(t, 1.4, 4.6)));
  if (t >= T_GRADE) cs *= 1 - ramp(t, T_GRADE + 0.4, T_COLLAPSE);
  if (t >= T_PHONE2) cs = lerp(0, 0.8, easeOut(ramp(t, T_PHONE2 + 0.3, DUR)));
  const cx = PX - 20 + Math.sin(t * 0.8) * 6, cy = 860 - 40 * cs;
  rain(cx, cy + 50, 170 * cs, 260, t, ramp(t, 3.9, 4.3) * (1 - ramp(t, T_DUE, T_DUE + 0.4)));
  cloud(cx, cy, cs, 1, clamp(flash));
  if (flash > 0.2) {   // Blitz
    ctx.strokeStyle = `rgba(255,255,230,${flash})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx + 10, cy + 40); ctx.lineTo(cx - 8, cy + 90); ctx.lineTo(cx + 10, cy + 92); ctx.lineTo(cx - 6, cy + 140); ctx.stroke();
  }
  // "!" bei Panik
  if (t > T_PANIC && t < T_PANIC + 0.9) {
    ctx.globalAlpha = 1 - ramp(t, T_PANIC + 0.6, T_PANIC + 0.9);
    textC("!", PX + 10, 965, 54, 0, "#f2f2f2");
    ctx.globalAlpha = 1;
  }

  const fade = Math.max(1 - ramp(t, 0, 0.2), ramp(t, DUR - 0.35, DUR));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return { duration: DUR, pages: PAGES.map(p => p[0]).slice(1), panic: T_PANIC, due: T_DUE, grade: T_GRADE, throwT: T_THROW,
    collapse: T_COLLAPSE, reset: T_RESET, phone2: T_PHONE2, planWrite: [[0.1, T_PLAN_DONE], [T_PLAN_WRITE2 + 0.2, DUR]],
    panicWrite: [T_PANIC + 0.15, T_GRADE] };
};

window.setup = async function () {
  await Promise.all([document.fonts.load("700 40px Pix"), document.fonts.load("400 20px Pix")]);
  return { duration: DUR };
};
