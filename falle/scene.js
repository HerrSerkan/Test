// "Die Intelligenzfalle" – Canvas-Animation. Wird von render.js Bild für Bild aufgerufen:
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const GY = 1400;                 // Boden (Welt-Koordinaten)
const SCY = 680;                 // Bildschirm-Höhe der Kameramitte (Szene oben, Text darunter)
const TEXT_TOP = 1095;           // Text unter der Szene – frei von TikTok-Tabs oben und Beschriftung unten
const TEXT_CX = 500;             // leicht links, damit die Buttons rechts nichts verdecken
const TEXT_W = 840;
const TX = 200, MX0 = 285;       // Denker / Macher (Startposition)
const PEAK = [662, 708];
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

let TL = null, S = [], E = [], TOK = [];

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");

function rng(seed) {             // mulberry32
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Startzeit eines gesprochenen Wortes in Satz si
function Wt(si, text, nth = 0) {
  const n = norm(text);
  const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) throw new Error("Wort nicht gefunden: " + si + " " + text);
  return hits[Math.min(nth, hits.length - 1)].s;
}

// ------------------------------------------------------------------ Welt
const MOUNTAIN = [
  [335, 1400], [380, 1330], [430, 1235], [470, 1170], [520, 1080], [560, 1000], [600, 900],
  [625, 840], [640, 790], [652, 760], [662, 708], [674, 742], [684, 735], [694, 760], [720, 805],
  [760, 880], [820, 980], [880, 1060], [960, 1150], [1060, 1260], [1180, 1400],
];
const RIDGE = [[662, 708], [700, 820], [738, 960], [768, 1100], [790, 1260], [800, 1400]];
const SNOW = [[634, 800], [646, 782], [656, 803], [668, 776], [680, 800], [694, 786], [706, 806]];

// Weg des Machers (inkl. Fehlversuche, * = Fehlschlag)
const N = {
  N0: [372, 1393], A1: [560, 1330], A2: [905, 1262], M1: [470, 1215], M2: [560, 1180],
  M3: [500, 1082], B1: [720, 1128], B2: [792, 1175], M4: [610, 1012], C1: [770, 975],
  M5: [576, 922], M6: [642, 852], M7: [622, 782], TOP: [662, 712],
};
const FAILS = ["A2", "M3", "B2", "C1"];
const PENNANTS = ["A2", "B2", "C1"];
let JOURNEY = [];     // [{n, t}]

// Wahrscheinlichkeits-Netz des Denkers
let WEB = [], WEBB = [], XMARKS = [], PCTS = [], HATCH = [], SWARM = [], NOISE = [];

function bez(p0, p1, p2, p3, u) {
  const v = 1 - u;
  return [
    v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
    v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1],
  ];
}

function insideMountain(x, y) {
  let c = false;
  for (let i = 0, j = MOUNTAIN.length - 1; i < MOUNTAIN.length; j = i++) {
    const [xi, yi] = MOUNTAIN[i], [xj, yj] = MOUNTAIN[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function buildWorld() {
  const r = rng(7);
  const head = [TX, GY - 62];
  for (let i = 0; i < 30; i++) {
    const end = [lerp(340, 1100, r()), lerp(690, 1370, r())];
    const c1 = [head[0] + lerp(40, 230, r()), head[1] - lerp(30, 230, r())];
    const c2 = [lerp(head[0], end[0], 0.4 + 0.4 * r()), end[1] - lerp(-80, 200, r())];
    WEB.push({ p: [head, c1, c2, end], kind: r() < 0.45 ? "node" : "x", delay: r() * 0.5, ph: r() * 10 });
  }
  const pctVals = ["22%", "19%", "50%", "38%", "65%", "48%", "81%", "73%", "26%", "16%", "31%", "69%", "8%", "44%"];
  for (let i = 0; i < pctVals.length; i++) {
    const w = WEB[(i * 2 + 1) % WEB.length];
    const q = bez(...w.p, 0.55 + 0.4 * r());
    PCTS.push({ x: q[0] + 8, y: q[1] - 6, s: pctVals[i], d: r() * 0.6 });
  }
  // Kreuze auf dem Berg (geplante Szenarien)
  for (let i = 0; i < 900 && XMARKS.length < 170; i++) {
    const x = lerp(340, 1170, r()), y = lerp(720, 1395, r());
    if (insideMountain(x, y)) XMARKS.push({ x, y, d: r() });
  }
  // feine Schraffur des Berges
  for (let i = 0; i < 46; i++) {
    const y0 = lerp(760, 1400, r()), x0 = lerp(380, 1100, r());
    HATCH.push([[x0, y0], [x0 - 60 - 80 * r(), y0 + 40 + 60 * r()], [x0 - 160 - 100 * r(), y0 + 70 + 80 * r()]]);
  }
  // Netz B (Glaube): dichte Linien aus dem Käfig
  const cageHead = [TX, GY - 70];
  for (let i = 0; i < 46; i++) {
    const end = [lerp(360, 1100, r()), lerp(740, 1380, r())];
    const c1 = [cageHead[0] + lerp(60, 260, r()), cageHead[1] - lerp(20, 220, r())];
    const c2 = [lerp(cageHead[0], end[0], 0.45 + 0.35 * r()), end[1] - lerp(-60, 180, r())];
    WEBB.push({ p: [cageHead, c1, c2, end], delay: r() * 0.6 });
  }
  // Schwarm aus 100 Kreuzen -> 10x10 Raster über dem Denker
  for (let i = 0; i < 100; i++) {
    const gx = TX + 10 + ((i % 10) - 4.5) * 11, gy = 1190 + (Math.floor(i / 10) - 4.5) * 11;
    SWARM.push({ sx: lerp(90, 360, r()), sy: lerp(1090, 1270, r()), gx, gy, d: r() });
  }
  // Filmkorn
  for (let k = 0; k < 4; k++) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const im = g.createImageData(256, 256);
    const rr = rng(100 + k);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = rr() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    NOISE.push(ctx.createPattern(c, "repeat"));
  }
}

// ------------------------------------------------------------------ Kamera
let KEYS = [];
function buildCamera() {
  const s = S, e = E;
  const k = (t, x, y, z) => KEYS.push({ t, x, y, z });
  k(0, 285, 1290, 3.0);
  k(s[1] - 0.1, 285, 1290, 3.35);
  k(s[1] + 1.7, 560, 1060, 1.0);
  k(s[2] - 0.2, 560, 1060, 1.0);
  k(s[2] + 0.9, 300, 1290, 2.6);
  k(Wt(2, "jedes") - 0.1, 300, 1290, 2.7);
  k(Wt(2, "jedes") + 1.3, 580, 1100, 1.12);
  k(s[3] - 0.1, 600, 1080, 1.06);
  k(s[3] + 1.0, 360, 1250, 1.95);
  k(s[4] - 0.1, 380, 1250, 2.0);
  k(s[4] + 1.4, 420, 1300, 2.1);
  k(Wt(4, "mit") + 0.1, 430, 1300, 2.0);
  k(Wt(4, "Plan.") + 0.6, 580, 1260, 1.6);
  k(s[5], 600, 1250, 1.62);
  k(Wt(5, "IMMER") + 0.3, 610, 1180, 1.58);
  k(s[6] + 0.5, 600, 1110, 1.5);
  k(Wt(6, "das") + 0.2, 590, 1010, 1.18);
  k(s[7] - 0.1, 585, 1020, 1.12);
  k(s[7] + 1.0, 560, 1010, 0.96);
  k(s[8] - 0.1, 560, 1010, 0.95);
  k(s[8] + 0.9, 240, 1215, 2.3);
  k(s[9] + 0.1, 240, 1215, 2.4);
  k(s[9] + 1.4, 470, 1040, 1.15);
  k(s[10] - 0.1, 470, 1040, 1.15);
  k(s[10] + 1.0, 210, 1300, 2.6);
  k(s[11] - 0.1, 210, 1300, 2.8);
  k(s[11] + 1.2, 520, 1065, 1.22);
  k(s[12] - 0.1, 540, 1065, 1.15);
  k(s[12] + 1.0, 560, 1060, 1.05);
  k(s[14] - 0.2, 560, 1060, 1.05);
  k(s[14] + 2.0, 660, 790, 2.3);
  k(Wt(15, "sondern") - 0.1, 660, 780, 2.45);
  k(Wt(15, "ANZUFANGEN,") - 0.25, 360, 1310, 2.2);
  k(Wt(15, "bevor"), 350, 1300, 2.25);
  k(e[15] + 0.8, 560, 1080, 1.0);
  k(TL.duration, 560, 1060, 0.97);
  KEYS.sort((a, b) => a.t - b.t);
}

function camera(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const u = easeIO(ramp(t, a.t, b.t));
  return {
    x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u),
    z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)),
  };
}

// ------------------------------------------------------------------ Weg des Machers
function buildJourney() {
  const seq = [];
  const add = (n, t) => {
    const prev = seq.length ? seq[seq.length - 1].t : -1;
    seq.push({ n, t: Math.max(t, prev + 0.16) });
  };
  const s = S;
  add("START", s[4] + 0.05);
  add("N0", s[4] + 1.35);
  add("A1", s[5] + 0.25);
  add("A2", Wt(5, "Fehler,") + 0.35);
  add("A1", Wt(5, "Fehler,") + 0.8);
  add("M1", Wt(5, "stößt") + 0.1);
  add("M2", Wt(5, "Hindernisse,") - 0.1);
  add("M3", Wt(5, "Hindernisse,") + 0.3);
  add("M2", Wt(5, "mit") + 0.1);
  add("B1", Wt(5, "denen") + 0.15);
  add("B2", Wt(5, "gerechnet") + 0.2);
  add("B1", Wt(5, "hat,") + 0.1);
  add("M4", Wt(5, "scheitert") + 0.1);
  add("C1", Wt(5, "IMMER") + 0.2);
  add("M4", Wt(5, "WIEDER.") + 0.35);
  add("M5", s[6] + 0.6);
  add("M6", Wt(6, "zeigt") + 0.2);
  add("M7", Wt(6, "das") + 0.1);
  add("TOP", Wt(6, "vorstellt.") + 0.3);
  JOURNEY = seq;
}

function nodePos(n) { return n === "START" ? [MX0, GY] : N[n]; }

// Position des Machers + bisher gegangene Segmente
function climber(t) {
  const J = JOURNEY;
  if (t <= J[0].t) return { pos: [MX0, GY], segs: [], walking: false };
  const segs = [];
  for (let i = 0; i < J.length - 1; i++) {
    const a = J[i], b = J[i + 1];
    const pa = nodePos(a.n), pb = nodePos(b.n);
    if (t >= b.t) {
      if (a.n !== "START") segs.push([pa, pb, 1]);
      continue;
    }
    const u = easeIO(ramp(t, a.t, b.t));
    const p = [lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u)];
    if (a.n !== "START") segs.push([pa, pb, u]);
    return { pos: p, segs, walking: a.n === "START" };
  }
  return { pos: nodePos(J[J.length - 1].n), segs, walking: false };
}

function reachedAt(n) {
  const hit = JOURNEY.find(j => j.n === n);
  return hit ? hit.t : 1e9;
}

// ------------------------------------------------------------------ Zeichnen (Welt)
let Z = 1;
const LW = b => (b * Math.pow(Z, 0.55)) / Z;   // Linienstärke: wächst nur leicht mit dem Zoom

function glow(x, y, r, a) {
  if (a <= 0.003) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
  g.addColorStop(0.25, `rgba(255,255,255,${0.35 * a})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function poly(pts, close = false) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

function drawBackground(t) {
  // ferne Hügel
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = LW(1.2);
  ctx.beginPath();
  for (let x = -600; x <= 1700; x += 20) {
    const y = 1215 + 28 * Math.sin(x / 160) + 16 * Math.sin(x / 57 + 1);
    x === -600 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  // Boden
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = LW(1.6);
  ctx.beginPath(); ctx.moveTo(-1500, GY); ctx.lineTo(2600, GY); ctx.stroke();
}

function drawMountain(t, st) {
  const g = ctx.createLinearGradient(0, PEAK[1], 0, GY);
  g.addColorStop(0, "#1c1c1c");
  g.addColorStop(1, "#080808");
  ctx.fillStyle = g;
  poly(MOUNTAIN, true); ctx.fill();
  ctx.save();
  poly(MOUNTAIN, true); ctx.clip();
  // Schraffur
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = LW(1);
  ctx.setLineDash([LW(5), LW(6)]);
  for (const h of HATCH) {
    ctx.beginPath(); ctx.moveTo(...h[0]); ctx.quadraticCurveTo(...h[1], ...h[2]); ctx.stroke();
  }
  ctx.setLineDash([]);
  // Kreuze (geplante Szenarien)
  if (st.planX > 0.01) {
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = LW(1.1);
    const s = 3.2;
    for (const m of XMARKS) {
      const a = clamp(st.planX * 1.6 - m.d * 0.6) * 0.5 * st.planA;
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(m.x - s, m.y - s); ctx.lineTo(m.x + s, m.y + s);
      ctx.moveTo(m.x + s, m.y - s); ctx.lineTo(m.x - s, m.y + s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // Umriss, Grat, Schnee
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = LW(1.8);
  ctx.lineJoin = "round";
  poly(MOUNTAIN); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = LW(1.2);
  poly(RIDGE); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  poly(SNOW); ctx.stroke();
  // Gipfel-Licht und Fahne
  glow(PEAK[0], PEAK[1] - 6, 70, 0.35 + st.peakGlow);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = LW(1.6);
  ctx.beginPath(); ctx.moveTo(PEAK[0], PEAK[1]); ctx.lineTo(PEAK[0], PEAK[1] - 30); ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(PEAK[0], PEAK[1] - 30); ctx.lineTo(PEAK[0] + 20, PEAK[1] - 25 + 1.5 * Math.sin(t * 4));
  ctx.lineTo(PEAK[0], PEAK[1] - 19); ctx.fill();
}

function pennant(x, y, a) {
  ctx.globalAlpha = a;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = LW(1.3);
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 16); ctx.lineTo(x + 7, y - 13); ctx.lineTo(x - 1, y - 6); ctx.closePath();
  ctx.moveTo(x - 6, y - 16); ctx.lineTo(x - 2, y + 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawWeb(t, list, reveal, alpha, dashMove) {
  if (alpha <= 0.01 || reveal <= 0) return;
  ctx.lineWidth = LW(1.15);
  ctx.setLineDash([LW(4), LW(5)]);
  ctx.lineDashOffset = -t * 18 * dashMove;
  for (const w of list) {
    const u = clamp((reveal - w.delay * 0.6) / 0.6);
    if (u <= 0) continue;
    ctx.strokeStyle = `rgba(255,255,255,${0.42 * alpha})`;
    ctx.beginPath();
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
      const q = bez(...w.p, (i / steps) * u);
      i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // Endpunkte: Leuchtpunkte und Kreuze
  for (const w of list) {
    if (!w.kind) continue;
    const u = clamp((reveal - w.delay * 0.6) / 0.6);
    if (u < 0.98) continue;
    const e = w.p[3];
    if (w.kind === "node") {
      glow(e[0], e[1], 16, alpha * (0.5 + 0.3 * Math.sin(t * 3 + w.ph)));
    } else {
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * alpha})`;
      ctx.lineWidth = LW(1.2);
      const s = 4;
      ctx.beginPath();
      ctx.moveTo(e[0] - s, e[1] - s); ctx.lineTo(e[0] + s, e[1] + s);
      ctx.moveTo(e[0] + s, e[1] - s); ctx.lineTo(e[0] - s, e[1] + s);
      ctx.stroke();
    }
  }
}

function drawPcts(t, a) {
  if (a <= 0.01) return;
  ctx.font = `600 ${Math.max(7, 11 / Math.pow(Z, 0.25))}px InterSB`;
  ctx.fillStyle = "#fff";
  for (const p of PCTS) {
    ctx.globalAlpha = clamp(a * 2 - p.d) * 0.75;
    ctx.fillText(p.s, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function figureShape(x, y, s) {
  // Körper: Bogen oben, gerade unten
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, y);
  ctx.lineTo(x - 18 * s, y - 28 * s);
  ctx.arc(x, y - 28 * s, 18 * s, Math.PI, 0);
  ctx.lineTo(x + 18 * s, y);
  ctx.closePath();
}

function thinker(x, y, t, a = 1) {
  ctx.globalAlpha = a;
  glow(x, y - 62, 34, 0.55);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = LW(1.7);
  figureShape(x, y, 1);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y - 62, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x, y - 62, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function doer(x, y, t, bob = 0, arm = 0, g = 0) {
  if (g > 0) glow(x, y - 40, 160 * g + 40, 0.45 * g + 0.1);
  ctx.fillStyle = "#f4f4f4";
  figureShape(x, y - bob, 1);
  ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 62 - bob, 11.5, 0, Math.PI * 2); ctx.fill();
  if (arm > 0) {   // Arm nach vorne (am Gipfel)
    ctx.strokeStyle = "#f4f4f4";
    ctx.lineCap = "round";
    ctx.lineWidth = 6.5;
    ctx.beginPath(); ctx.moveTo(x + 12, y - 34); ctx.lineTo(x + 12 + 20 * arm, y - 36 - 3 * arm); ctx.stroke();
    ctx.lineCap = "butt";
  }
}

function cage(x, y, p, lift, spot) {
  if (p <= 0) return;
  if (spot > 0) glow(x, y - 40, 260, spot * 0.55);
  const a = 1 - lift;
  if (a <= 0) return;
  ctx.strokeStyle = `rgba(255,255,255,${0.92 * a})`;
  ctx.lineWidth = LW(1.7);
  const n = 9, w = 66, h = 100;
  for (let i = 0; i < n; i++) {
    const bp = easeOut(clamp(p * 1.6 - (i / n) * 0.6));
    const dy = (1 - bp) * -260 - lift * 120;
    const bx = x - w / 2 + (i * w) / (n - 1);
    ctx.globalAlpha = bp;
    ctx.beginPath(); ctx.moveTo(bx, y - h + dy); ctx.lineTo(bx, y + dy); ctx.stroke();
  }
  const tp = easeOut(clamp(p * 1.6 - 0.6));
  ctx.globalAlpha = tp;
  const dy = (1 - tp) * -260 - lift * 120;
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 4, y - h + dy); ctx.lineTo(x + w / 2 + 4, y - h + dy); ctx.stroke();
  ctx.globalAlpha = 1;
}

function gauge(x, y, val, a) {
  if (a <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = LW(1.2);
  ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = LW(1.8);
  ctx.beginPath(); ctx.arc(x, y, 17, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * val) / 100); ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "600 10px InterSB";
  ctx.textAlign = "center";
  ctx.fillText(Math.round(val) + "%", x, y + 3.5);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

function cloudIcon(x, y, a, dashed) {
  if (a <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = LW(1.1);
  if (dashed) ctx.setLineDash([LW(3), LW(3)]);
  for (const [dx, dy, r] of [[-9, 0, 8], [0, -6, 10], [10, 0, 8]]) {
    ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 9); ctx.lineTo(x - 3, y + 18); ctx.lineTo(x + 2, y + 18); ctx.lineTo(x - 2, y + 27);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function boulder(x, y, a) {
  if (a <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = "#151515";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = LW(1.4);
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 4);
  ctx.bezierCurveTo(x - 20, y - 14, x - 2, y - 22, x + 12, y - 16);
  ctx.bezierCurveTo(x + 24, y - 8, x + 18, y + 14, x + 2, y + 16);
  ctx.bezierCurveTo(x - 8, y + 16, x - 14, y + 12, x - 16, y + 4);
  ctx.fill(); ctx.stroke();
  ctx.lineWidth = LW(0.8);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath(); ctx.moveTo(x - 8, y + 8); ctx.lineTo(x + 10, y - 10); ctx.moveTo(x - 2, y + 10); ctx.lineTo(x + 13, y - 3); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Zustand zur Zeit t
function state(t) {
  const s = S, st = {};
  // Netz A (Denker)
  const hookFade = 1 - ramp(t, s[1] + 0.3, s[1] + 1.4);
  const sec2 = ramp(t, s[2] + 0.3, Wt(2, "jedes")) * 0.35 + ramp(t, Wt(2, "jedes"), Wt(2, "durchzuspielen,") + 0.6) * 0.65;
  st.webReveal = t < s[2] ? 1 : sec2;
  st.webA = t < s[2] ? hookFade : 1 - 0.8 * ramp(t, s[4], s[4] + 1.2) - 0.1 * ramp(t, s[10], s[10] + 1);
  st.planX = ramp(t, Wt(2, "jedes"), Wt(2, "RISIKEN") + 0.6);
  st.planA = 1 - 0.65 * ramp(t, s[4], s[4] + 1.2);
  st.pcts = t < s[2] ? hookFade : ramp(t, Wt(2, "RISIKEN"), Wt(2, "RISIKEN") + 0.8) * (1 - ramp(t, s[4], s[4] + 1));
  st.clouds = ramp(t, Wt(2, "Probleme"), Wt(2, "Probleme") + 0.6) * (1 - 0.6 * ramp(t, s[4], s[4] + 1));
  // Prozent-Anzeige
  if (t < s[2]) { st.gaugeA = hookFade; st.gauge = 89; }
  else {
    st.gaugeA = ramp(t, s[3], s[3] + 0.5) * (1 - ramp(t, s[4] + 0.2, s[4] + 0.8));
    st.gauge = 12 + 77 * easeIO(ramp(t, s[3] + 0.3, Wt(3, "schaffen.") + 0.4));
  }
  // Käfig
  const c0 = ramp(t, Wt(0, "DUMM") - 0.05, Wt(0, "DUMM") + 0.45);
  const lift0 = ramp(t, s[1] + 0.1, s[1] + 0.8);
  const c1 = ramp(t, Wt(10, "DIE") - 0.05, Wt(10, "DIE") + 0.55);
  if (t < s[10] - 0.2) { st.cage = c0; st.cageLift = lift0; }
  else { st.cage = c1; st.cageLift = 0; }
  st.spot = t < s[10] - 0.2 ? 0.25 * c0 * (1 - lift0)
    : ramp(t, Wt(10, "INTELLIGENZFALLE.") - 0.1, Wt(10, "INTELLIGENZFALLE.") + 0.3) * (1 - 0.65 * ramp(t, s[11], s[11] + 1.2));
  // Plan-Linie (gestrichelt) vom Start zum ersten Wimpel
  st.plan = ramp(t, Wt(4, "mit"), Wt(4, "Plan.") + 0.4) * (1 - ramp(t, reachedAt("A2"), reachedAt("A2") + 0.6));
  st.boulder = ramp(t, Wt(5, "Hindernisse,") - 0.4, Wt(5, "Hindernisse,"));
  st.storm = ramp(t, Wt(5, "Hindernisse,"), Wt(5, "Hindernisse,") + 0.4);
  // Jahr: Höhenmarke
  st.bracket = ramp(t, Wt(7, "NICHT"), Wt(7, "NICHT") + 0.5) * (1 - ramp(t, s[8], s[8] + 0.6));
  // 100 Gründe
  st.swarm = ramp(t, Wt(8, "100") - 0.2, Wt(8, "100") + 0.3);
  st.grid = ramp(t, Wt(8, "100") + 0.2, Wt(8, "SCHEITERN") + 0.2);
  st.swarmA = st.swarm * (1 - ramp(t, s[10] + 0.2, s[10] + 0.9));
  st.links = ramp(t, Wt(9, "welche"), Wt(9, "ZÄHLEN.") + 0.2) * (1 - ramp(t, s[10] + 0.1, s[10] + 0.8));
  st.linksHot = ramp(t, Wt(9, "ZÄHLEN.") - 0.1, Wt(9, "ZÄHLEN.") + 0.3);
  // Glaube: dichtes Netz aus dem Käfig
  st.webB = ramp(t, s[11] + 0.2, s[11] + 2.6);
  st.webBA = ramp(t, s[11], s[11] + 0.4) * (1 - ramp(t, s[12] + 0.4, s[12] + 1.4));
  // Vorstellung (Bogen) und Erfahrung (Lichtpunkt entlang des Weges)
  st.arc = ramp(t, Wt(12, "was") - 0.3, Wt(12, "könnte,") + 0.4);
  st.arcA = ramp(t, Wt(12, "was") - 0.3, Wt(12, "was")) * (1 - 0.5 * ramp(t, s[14] + 1, s[14] + 2));
  st.comet = ramp(t, Wt(13, "Erfahrung") - 0.1, Wt(13, "PASSIERT.") + 0.25);
  st.cometA = ramp(t, Wt(13, "Erfahrung") - 0.2, Wt(13, "Erfahrung")) * (1 - ramp(t, Wt(13, "PASSIERT.") + 0.4, Wt(13, "PASSIERT.") + 1.2));
  st.pathGlow = 0.35 * ramp(t, Wt(13, "Erfahrung"), Wt(13, "PASSIERT.") + 0.4) + 0.3 * ramp(t, s[14], s[14] + 2);
  // Gipfel / Anfang
  st.top = 0.15 + 0.85 * ramp(t, Wt(14, "MEHR") - 0.1, Wt(14, "MEHR") + 0.5);
  st.top *= 1 - 0.6 * ramp(t, Wt(15, "ANZUFANGEN,") - 0.6, Wt(15, "ANZUFANGEN,"));
  if (t < s[14]) st.top = 0;
  st.arm = ramp(t, Wt(14, "der", 2) - 0.2, Wt(14, "der", 2) + 0.3);
  st.peakGlow = 0.4 * ramp(t, s[14], s[14] + 1.5) * (1 - 0.5 * ramp(t, Wt(15, "ANZUFANGEN,") - 0.5, Wt(15, "ANZUFANGEN,")));
  st.begin = ramp(t, Wt(15, "ANZUFANGEN,") - 0.2, Wt(15, "ANZUFANGEN,") + 0.25) * (1 - 0.5 * ramp(t, Wt(15, "bevor"), E[15] + 1));
  return st;
}

// ------------------------------------------------------------------ Szene
function drawWorld(t, st) {
  drawBackground(t);
  drawMountain(t, st);

  // Wolken: vorgestellte Probleme (gestrichelt) / echte Hindernisse
  cloudIcon(250, 1100, st.clouds * 0.8, true);
  cloudIcon(305, 1040, st.clouds * 0.6, true);
  cloudIcon(410, 1035, st.storm * (1 - 0.6 * ramp(t, S[7], S[7] + 1)), false);

  drawWeb(t, WEB, st.webReveal, st.webA, 1);
  drawPcts(t, st.pcts);
  drawWeb(t, WEBB, st.webB, st.webBA * 0.9, 1.5);

  // Wimpel (Ziele am Hang)
  for (const n of PENNANTS) {
    const a = n === "A2" ? Math.max(st.plan, ramp(t, reachedAt("A2") - 0.6, reachedAt("A2"))) : ramp(t, reachedAt(n) - 0.6, reachedAt(n));
    pennant(N[n][0] + 6, N[n][1], a);
  }
  boulder(488, 1066, st.boulder);

  // Plan-Linie
  if (st.plan > 0.01) {
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = LW(1.3);
    ctx.setLineDash([LW(2), LW(5)]);
    const a = N.N0, b = N.A2, u = clamp(st.plan * 1.2);
    ctx.globalAlpha = clamp(st.plan * 3);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }

  // gegangener Weg + Lektionen (Leuchtpunkte an Fehlschlägen)
  const cl = climber(t);
  ctx.strokeStyle = `rgba(255,255,255,${0.75 + st.pathGlow * 0.25})`;
  ctx.lineWidth = LW(1.7 + st.pathGlow * 1.5);
  if (st.pathGlow > 0) { ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 12 * st.pathGlow; }
  for (const [a, b, u] of cl.segs) {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); ctx.stroke();
  }
  ctx.shadowBlur = 0;
  for (const n of FAILS) {
    const tr = reachedAt(n);
    if (t < tr) continue;
    const k = t - tr;
    const flash = Math.exp(-k * 2.2);
    glow(N[n][0], N[n][1], 26 + 40 * flash, 0.55 + 0.45 * flash + st.linksHot * 0.4);
    ctx.strokeStyle = `rgba(255,255,255,${0.6 * flash})`;
    ctx.lineWidth = LW(1.2);
    ctx.beginPath(); ctx.arc(N[n][0], N[n][1], 8 + k * 40, 0, Math.PI * 2); ctx.stroke();
  }

  // Höhen-Klammer ("nicht mehr zu übersehen")
  if (st.bracket > 0.01) {
    const x = 140, top = N.TOP[1] - 70;
    const u = easeOut(st.bracket);
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * st.bracket})`;
    ctx.lineWidth = LW(1.3);
    ctx.beginPath();
    ctx.moveTo(x, GY); ctx.lineTo(x, lerp(GY, top, u));
    ctx.moveTo(x - 8, lerp(GY, top, u)); ctx.lineTo(lerp(x, N.TOP[0] - 20, u), lerp(GY, top, u));
    ctx.stroke();
  }

  // Denker + Käfig
  cage(TX, GY, st.cage, st.cageLift, st.spot);
  thinker(TX, GY, t);
  gauge(TX - 42, GY - 135, st.gauge, st.gaugeA);

  // 100 Kreuze -> Raster
  if (st.swarmA > 0.01) {
    const hot = [17, 52, 76];
    for (let i = 0; i < SWARM.length; i++) {
      const p = SWARM[i];
      const u = easeIO(clamp(st.grid * 1.3 - p.d * 0.3));
      const jitter = (1 - u) * 6 * Math.sin(t * 5 + i);
      const x = lerp(p.sx, p.gx, u) + jitter, y = lerp(p.sy, p.gy, u);
      const a = clamp(st.swarm * 1.5 - p.d * 0.5) * st.swarmA;
      const isHot = hot.includes(i) && st.links > 0;
      ctx.strokeStyle = `rgba(255,255,255,${a * (isHot ? 1 : 0.75)})`;
      ctx.lineWidth = LW(isHot ? 1.6 : 1.1);
      const s = 3.3;
      ctx.beginPath();
      ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);
      ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
      ctx.stroke();
      if (isHot) {
        glow(x, y, 18, st.links * (0.5 + 0.5 * st.linksHot));
        const target = N[["A2", "M3", "B2"][hot.indexOf(i)]];
        const u2 = easeOut(clamp(st.links * 1.4 - hot.indexOf(i) * 0.15));
        ctx.strokeStyle = `rgba(255,255,255,${0.75 * st.links})`;
        ctx.lineWidth = LW(1.2 + st.linksHot);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, target[0], u2), lerp(y, target[1], u2)); ctx.stroke();
      }
    }
  }

  // Bogen: was passieren könnte
  if (st.arc > 0.01) {
    ctx.strokeStyle = `rgba(255,255,255,${0.6 * st.arcA})`;
    ctx.lineWidth = LW(1.2);
    ctx.setLineDash([LW(4), LW(5)]);
    ctx.beginPath();
    const a = [TX + 10, GY - 105], c = [230, 660], b = [N.TOP[0] - 14, N.TOP[1] - 40];
    for (let i = 0; i <= 40; i++) {
      const u = (i / 40) * easeIO(st.arc), v = 1 - u;
      const x = v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], y = v * v * a[1] + 2 * v * u * c[1] + u * u * b[1];
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Erfahrung: Licht wandert den Weg hinauf
  if (st.cometA > 0.01) {
    const route = ["N0", "A1", "M1", "M2", "B1", "M4", "M5", "M6", "M7", "TOP"].map(n => N[n]);
    let L = 0; const seg = [];
    for (let i = 0; i < route.length - 1; i++) { const d = Math.hypot(route[i + 1][0] - route[i][0], route[i + 1][1] - route[i][1]); seg.push(d); L += d; }
    let d = easeIO(st.comet) * L, i = 0;
    while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
    const u = clamp(d / seg[i]);
    const p = [lerp(route[i][0], route[i + 1][0], u), lerp(route[i][1], route[i + 1][1], u)];
    glow(p[0], p[1], 70, st.cometA);
  }
  // Licht am Anfang des Weges ("anzufangen")
  glow(N.N0[0], N.N0[1] - 4, 120, st.begin * 0.9);

  // Macher
  const bob = cl.walking ? Math.abs(Math.sin(t * 9)) * 4 : 0;
  doer(cl.pos[0], cl.pos[1], t, bob, st.arm, st.top);
}

// ------------------------------------------------------------------ Text
const SIZES = { plain: 64, big: 82, italic: 96, heavy: 128, spaced: 36, counter: 250 };
const LH = { plain: 1.22, big: 1.18, italic: 1.08, heavy: 1.0, spaced: 1.7, counter: 0.98 };
const ASC = { plain: 0.95, big: 0.95, italic: 0.88, heavy: 0.86, spaced: 1.0, counter: 0.86 };

function setFont(style, size) {
  ctx.letterSpacing = "0px";
  if (style === "italic") ctx.font = `italic 400 ${size}px ISerif`;
  else if (style === "heavy" || style === "counter") { ctx.font = `900 ${size}px InterBlk`; ctx.letterSpacing = `${-size * 0.015}px`; }
  else if (style === "spaced") { ctx.font = `600 ${size}px InterSB`; ctx.letterSpacing = `${size * 0.45}px`; }
  else ctx.font = `600 ${size}px InterSB`;
}

const LAYOUT = new Map();
function layoutCard(card) {
  if (LAYOUT.has(card)) return LAYOUT.get(card);
  const lines = [];
  let y = 0;
  for (const line of card.lines) {
    let scale = 1, items, width;
    for (let pass = 0; pass < 2; pass++) {
      items = []; width = 0;
      line.forEach((tok, i) => {
        const size = SIZES[tok.style] * scale;
        setFont(tok.style, size);
        const txt = tok.style === "counter" ? "100" : tok.text;
        const w = ctx.measureText(txt).width;
        const gap = i ? (["heavy", "counter"].includes(tok.style) ? size * 0.22 : size * 0.27) : 0;
        width += gap;
        items.push({ tok, size, x: width, w });
        width += w;
      });
      if (width <= TEXT_W) break;
      scale *= TEXT_W / width;
    }
    const big = items.reduce((a, b) => (b.size > a.size ? b : a));
    const st = big.tok.style;
    const lh = big.size * LH[st];
    lines.push({ items, width, y: y + big.size * ASC[st], lh });
    y += lh;
  }
  const res = { lines, height: y };
  LAYOUT.set(card, res);
  return res;
}

function drawCard(card, t, si) {
  const L = layoutCard(card);
  const out = ramp(t, card.end - 0.22, card.end);
  if (out >= 1) return;
  const top = TEXT_TOP;
  for (const line of L.lines) {
    const x0 = TEXT_CX - line.width / 2;
    for (const it of line.items) {
      const tok = it.tok;
      const p = ramp(t, tok.s - 0.04, tok.s + 0.26);
      if (p <= 0) continue;
      const a = easeOut(p) * (1 - out);
      const blur = (1 - p) * 10 + out * 14;
      const dy = (1 - easeOut(p)) * 18;
      setFont(tok.style, it.size);
      ctx.globalAlpha = a;
      ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      const heavy = tok.style === "heavy" || tok.style === "counter";
      ctx.shadowColor = `rgba(255,255,255,${heavy ? 0.55 : 0.35})`;
      ctx.shadowBlur = heavy ? 34 : 16;
      ctx.fillStyle = "#fff";
      let txt = tok.text;
      if (tok.style === "counter") {
        const c = easeOut(ramp(t, tok.s - 0.05, tok.s + 0.75));
        txt = String(Math.max(1, Math.round(1 + 99 * c)));
        const fw = ctx.measureText(txt).width;
        ctx.fillText(txt, x0 + it.x + (it.w - fw) / 2, top + line.y + dy);
      } else {
        ctx.fillText(txt, x0 + it.x, top + line.y + dy);
      }
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
  // Tageszähler unter "Und nach einem Jahr"
  if (si === 7 && card.lines[0][0].text === "Und") {
    const p = ramp(t, card.start + 0.1, card.end - 0.1);
    const day = String(Math.max(1, Math.round(1 + 364 * easeIO(p)))).padStart(3, "0");
    ctx.font = "500 30px 'JetBrains Mono'";
    ctx.letterSpacing = "10px";
    ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - out) * ramp(t, card.start, card.start + 0.3)})`;
    const s = `TAG ${day}`;
    const w = ctx.measureText(s).width;
    ctx.fillText(s, TEXT_CX - w / 2, top + L.height + 46);
    ctx.letterSpacing = "0px";
  }
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  const bg = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, H * 0.75);
  bg.addColorStop(0, "#0b0b0b");
  bg.addColorStop(1, "#000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cam = camera(t);
  Z = cam.z;
  const st = state(t);
  ctx.setTransform(Z, 0, 0, Z, W / 2 - cam.x * Z, SCY - cam.y * Z);
  drawWorld(t, st);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // dunkler Verlauf hinter dem Text (Lesbarkeit über dem Berg)
  const band = ctx.createLinearGradient(0, TEXT_TOP - 120, 0, TEXT_TOP + 120);
  band.addColorStop(0, "rgba(0,0,0,0)");
  band.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = band;
  ctx.fillRect(0, TEXT_TOP - 120, W, H - TEXT_TOP + 120);

  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Text
  for (const card of TL.cards) {
    if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t, card.sentence);
  }

  // Filmkorn
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = NOISE[Math.floor(t * 8) % NOISE.length];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Ein- und Ausblenden
  const fade = Math.max(1 - ramp(t, 0, 0.35), ramp(t, TL.duration - 1.4, TL.duration - 0.2));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

// Zeitpunkte für die Tonspur
window.exportEvents = function () {
  return {
    journey: JOURNEY.map(j => ({ n: j.n, t: j.t, fail: FAILS.includes(j.n) })),
    cageDrops: [Wt(0, "DUMM"), Wt(10, "DIE")],
    cameraMoves: KEYS.map(k => k.t),
    counter100: Wt(8, "100"),
    days: [TL.cards.find(c => c.sentence === 7).start, TL.cards.find(c => c.sentence === 7).end],
    peakGlow: Wt(14, "MEHR"),
    begin: Wt(15, "ANZUFANGEN,"),
    comet: [Wt(13, "Erfahrung"), Wt(13, "PASSIERT.")],
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  S = TL.sentences.map(s => s.start);
  E = TL.sentences.map(s => s.end);
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([
    document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"),
    document.fonts.load("900 50px InterBlk"), document.fonts.load("500 30px 'JetBrains Mono'"),
  ]);
  buildWorld();
  buildJourney();
  buildCamera();
  return true;
};
