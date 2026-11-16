// "Homo Erectus vs. Homo Sapiens" – Canvas-Animation ohne Worte (deutsche Version).
// Oben Homo Erectus (blaue Köpfe): Feuer geht aus, Panik, Frieren, Blitz, Fackel holen, leichter Schlaf.
// Unten Homo Sapiens (grüne Köpfe): Feuer geht aus, Feuerstein, Feuer brennt wieder, Tiefschlaf mit Wache.
"use strict";

const W = 1080, H = 1920;
window.DURATION = 16.8;
const F1 = 850;                 // Boden oben
const LAB1 = 884, DIV = 912, LAB2 = 942;
const P2TOP = 962, F2 = 1440;   // unteres Feld
const PH1 = F1, PH2 = F2 - P2TOP;

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let g = ctx;

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function piece(t, pts) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) {
    const [a, va] = pts[i - 1], [b, vb] = pts[i];
    return lerp(va, vb, (t - a) / (b - a));
  }
  return pts[pts.length - 1][1];
}
const hex2 = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, k) => { const A = hex2(a), B = hex2(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; };

// ------------------------------------------------------------------ Ablauf
const FIRE_TOP = [[0, 1], [1.85, 1], [2.3, 0], [8.7, 0], [8.95, 1.15], [9.6, 1], [30, 1]];
const FIRE_BOT = [[0, 1], [1.85, 1], [2.3, 0], [4.35, 0], [4.6, 1.15], [5.2, 1], [30, 1]];
const LIGHTNING = 6.0;
const TREE_FIRE = [[0, 0], [6.02, 0], [6.4, 1], [30, 1]];
const STRIKES = [2.55, 2.85, 3.15, 3.45, 3.75, 4.05, 4.3];
const JOLTS = [11.0, 12.2];
const ALARM = 13.15;
const FINAL = 14.9;
const FX_TOP = 470, FX_BOT = 300, TREE_X = 860;

// Himmel: Abend -> Nacht -> Morgen
function sky(t) {
  const n = ramp(t, 1.4, 3.0) * (1 - ramp(t, 13.9, 15.4));
  const d = ramp(t, 13.9, 15.4);
  const top = d > 0 ? mixc("#05070d", "#33405e", d) : mixc("#2b2440", "#05070d", n);
  const hor = d > 0 ? mixc("#141a2a", "#e3a868", d) : mixc("#b4724e", "#141a2a", n);
  return { top, hor, night: n, dawn: d };
}

// ------------------------------------------------------------------ Strichmännchen
const L = { tor: 110, neck: 8, head: 21, ua: 66, fa: 62, th: 82, sh: 82 };
const dir = (a, f) => { const r = a * Math.PI / 180; return [f * Math.sin(r), Math.cos(r)]; };
const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
function joints(p, f) {
  const P = [0, 0];
  const S = add(P, dir(p.tor, f), L.tor);
  const Hd = add(S, dir(p.head, f), L.neck + L.head);
  const arm = a => { const e = add(S, dir(a[0], f), L.ua); return [e, add(e, dir(a[1], f), L.fa)]; };
  const leg = l => { const k = add(P, dir(l[0], f), L.th); return [k, add(k, dir(l[1], f), L.sh)]; };
  return { P, S, Hd, aN: arm(p.aN), aF: arm(p.aF), lN: leg(p.lN), lF: leg(p.lF) };
}
function placeFig(p, f, x, surf) {
  const J = joints(p, f);
  let dy;
  if (p.anchor === "pelvis") dy = surf - 12;
  else {
    let low = -1e9;
    for (const q of [J.lN[0], J.lN[1], J.lF[0], J.lF[1]]) low = Math.max(low, q[1]);
    dy = surf - low - 7;
  }
  const mv = q => [q[0] + x, q[1] + dy];
  return { f, P: mv(J.P), S: mv(J.S), Hd: mv(J.Hd), aN: J.aN.map(mv), aF: J.aF.map(mv), lN: J.lN.map(mv), lF: J.lF.map(mv) };
}
function seg(a, b, w, fill) {
  g.lineCap = "round";
  g.strokeStyle = "#141414"; g.lineWidth = w + 6;
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = fill; g.lineWidth = w;
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
}
function drawFig(F, head, extra = {}) {
  g.save();
  g.shadowColor = "rgba(255,255,255,0.35)"; g.shadowBlur = 10;
  const FAR = "#cfcfcf", NEAR = "#f6f6f6";
  seg(F.P, F.lF[0], 12, FAR); seg(F.lF[0], F.lF[1], 12, FAR);
  seg(F.S, F.aF[0], 11, FAR); seg(F.aF[0], F.aF[1], 11, FAR);
  if (extra.behind) extra.behind();
  seg(F.P, F.S, 15, NEAR);
  seg(F.P, F.lN[0], 12, NEAR); seg(F.lN[0], F.lN[1], 12, NEAR);
  seg(F.S, F.aN[0], 11, NEAR); seg(F.aN[0], F.aN[1], 11, NEAR);
  g.shadowColor = head === "b" ? "rgba(70,140,255,0.9)" : "rgba(60,220,110,0.9)"; g.shadowBlur = 18;
  g.fillStyle = head === "b" ? "#3d82ff" : "#33c45a";
  g.beginPath(); g.arc(F.Hd[0], F.Hd[1], L.head, 0, 7); g.fill();
  g.shadowBlur = 0; g.strokeStyle = "#141414"; g.lineWidth = 3; g.stroke();
  g.restore();
  if (extra.front) extra.front();
}
function mixPose(a, b, k) {
  const o = {};
  for (const key of ["tor", "head"]) o[key] = lerp(a[key], b[key], k);
  for (const key of ["aN", "aF", "lN", "lF"]) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)];
  o.anchor = k < 0.5 ? a.anchor : b.anchor;
  o.tool = k < 0.5 ? a.tool : b.tool;
  return o;
}
function track(keys, t) {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
  const A = keys[i], B = keys[Math.min(i + 1, keys.length - 1)];
  const k = B === A ? 0 : easeIO(ramp(t, A.t, B.t));
  return { p: mixPose(A.p, B.p, k), x: lerp(A.x, B.x, k), f: k < 0.5 ? A.f : B.f, v: B === A ? 0 : (B.x - A.x) / (B.t - A.t) };
}

const POSE = {
  sit: { tor: 172, head: 176, aN: [35, 100], aF: [40, 105], lN: [118, 52], lF: [112, 50], anchor: "pelvis" },
  sitTend: { tor: 160, head: 150, aN: [72, 82], aF: [40, 100], lN: [118, 52], lF: [112, 50], anchor: "pelvis" },
  think: { tor: 168, head: 184, aN: [30, 168], aF: [40, 100], lN: [118, 52], lF: [112, 50], anchor: "pelvis" },
  panicA: { tor: 180, head: 188, aN: [160, 140], aF: [-150, -170], lN: [18, 6], lF: [-14, -4] },
  panicB: { tor: 175, head: 170, aN: [120, 170], aF: [-120, -160], lN: [10, 0], lF: [-20, -10] },
  huddle: { tor: 122, head: 112, aN: [70, 150], aF: [60, 140], lN: [100, -30], lF: [92, -40] },
  stand: { tor: 180, head: 180, aN: [-5, 5], aF: [8, 12], lN: [4, -2], lF: [-6, -8] },
  look: { tor: 176, head: 168, aN: [20, 160], aF: [8, 12], lN: [4, -2], lF: [-6, -8] },
  runA: { tor: 160, head: 165, aN: [-40, -10], aF: [50, 100], lN: [45, -20], lF: [-35, -70] },
  runB: { tor: 160, head: 165, aN: [50, 100], aF: [-40, -10], lN: [-35, -70], lF: [45, -20] },
  torchA: { tor: 160, head: 165, aN: [120, 150], aF: [50, 100], lN: [45, -20], lF: [-35, -70], tool: "torch" },
  torchB: { tor: 160, head: 165, aN: [120, 150], aF: [-40, -10], lN: [-35, -70], lF: [45, -20], tool: "torch" },
  grab: { tor: 175, head: 190, aN: [150, 160], aF: [8, 12], lN: [4, -2], lF: [-6, -8], tool: "torch" },
  light: { tor: 120, head: 110, aN: [70, 40], aF: [40, 30], lN: [100, -10], lF: [20, -90], tool: "torch" },
  cheer: { tor: 178, head: 186, aN: [165, 178], aF: [150, 170], lN: [92, 0], lF: [8, -88] },
  lie: { tor: 92, head: 94, aN: [-80, -88], aF: [-84, -90], lN: [-88, -90], lF: [-86, -92], anchor: "pelvis" },
  lieUp: { tor: 140, head: 160, aN: [-40, -20], aF: [-50, -30], lN: [-88, -90], lF: [-86, -92], anchor: "pelvis" },
  guard: { tor: 178, head: 178, aN: [50, 120], aF: [40, 110], lN: [12, 4], lF: [-12, -6], tool: "stick" },
  sitGuard: { tor: 172, head: 178, aN: [50, 120], aF: [40, 105], lN: [118, 52], lF: [112, 50], anchor: "pelvis", tool: "stick" },
  spearStand: { tor: 180, head: 180, aN: [10, 40], aF: [6, 10], lN: [4, -2], lF: [-6, -8], tool: "spearV" },
  spearAim: { tor: 172, head: 176, aN: [80, 92], aF: [72, 88], lN: [20, 6], lF: [-20, -10], tool: "spearH" },
  strikeA: { tor: 125, head: 112, aN: [40, 30], aF: [30, 20], lN: [100, -10], lF: [20, -90] },
  strikeB: { tor: 128, head: 115, aN: [62, 8], aF: [12, 40], lN: [100, -10], lF: [20, -90] },
  kneel: { tor: 170, head: 160, aN: [20, 40], aF: [25, 45], lN: [92, 0], lF: [8, -88] },
};
const K = (t, p, x, f = 1) => ({ t, p: POSE[p], x, f });

// Homo Erectus (oben)
function panicKeys(x, f, t0, t1, ph) {
  const out = [];
  for (let t = t0, i = ph; t < t1; t += 0.24, i++) out.push(K(t, i % 2 ? "panicA" : "panicB", x + (i % 2 ? 8 : -8) * f, f));
  return out;
}
function sleepKeys(x, f, jolt) {
  const k = [K(10.0, "lie", x, f)];
  if (jolt != null) k.push(K(jolt, "lie", x, f), K(jolt + 0.15, "lieUp", x, f), K(jolt + 0.55, "lieUp", x, f), K(jolt + 0.8, "lie", x, f));
  k.push(K(ALARM, "lie", x, f), K(ALARM + 0.3, "guard", x, -f), K(14.35, "guard", x, -f), K(14.75, "sit", x, f), K(30, "sit", x, f));
  return k;
}
const E = [
  { x0: 150, f: 1, hud: 330, lie: 150, jolt: JOLTS[0] },
  { x0: 240, f: 1, hud: 380, scout: true },
  { x0: 320, f: 1, hud: 430, lie: 300, jolt: JOLTS[1] },
  { x0: 620, f: -1, hud: 480, lie: 640, jolt: JOLTS[0] + 0.1 },
  { x0: 710, f: -1, hud: 530, lie: 790, jolt: null },
].map((e, i) => {
  const k = [K(0, "sit", e.x0, e.f), K(2.2, "sit", e.x0, e.f), ...panicKeys(e.x0, e.f, 2.4, 3.6, i),
    K(3.95, "huddle", e.hud, e.f)];
  if (e.scout) {
    k.push(K(6.35, "huddle", e.hud, e.f), K(6.6, "look", e.hud, 1), K(6.95, "look", e.hud, 1));
    let x = e.hud, j = 0;
    for (let t = 7.05; t < 7.75; t += 0.14, j++) { x = lerp(e.hud, TREE_X - 70, (t - 7.05) / 0.7); k.push(K(t, j % 2 ? "runA" : "runB", x, 1)); }
    k.push(K(7.8, "grab", TREE_X - 70, 1), K(7.95, "grab", TREE_X - 70, -1));
    j = 0;
    for (let t = 8.05; t < 8.6; t += 0.13, j++) k.push(K(t, j % 2 ? "torchA" : "torchB", lerp(TREE_X - 70, FX_TOP + 90, (t - 8.05) / 0.55), -1));
    k.push(K(8.65, "light", FX_TOP + 80, -1), K(8.95, "light", FX_TOP + 80, -1), K(9.1, "cheer", FX_TOP + 80, -1), K(9.85, "cheer", FX_TOP + 80, -1),
      K(10.1, "sitGuard", 230, 1), K(ALARM, "sitGuard", 230, 1), K(ALARM + 0.3, "guard", 230, -1), K(14.35, "guard", 230, -1), K(14.75, "sit", 240, 1), K(30, "sit", 240, 1));
  } else {
    k.push(K(8.95, "huddle", e.hud, e.f), K(9.15, "cheer", lerp(e.hud, e.x0, 0.5), e.f), K(9.85, "cheer", lerp(e.hud, e.x0, 0.5), e.f), ...sleepKeys(e.lie, e.f, e.jolt));
  }
  return { keys: k, head: "b" };
});
// Homo Sapiens (unten)
const S = [
  { keys: [K(0, "sitTend", 160), K(2.2, "sitTend", 160), K(2.45, "kneel", 170), K(4.4, "kneel", 170), K(4.7, "sitTend", 160), K(30, "sitTend", 160)] },
  { keys: [K(0, "think", 430, -1), K(1.9, "think", 430, -1), K(2.35, "strikeA", 370, -1),
    ...STRIKES.map((s, i) => K(s, i % 2 ? "strikeA" : "strikeB", 370, -1)), K(4.45, "kneel", 380, -1), K(4.8, "lie", 500, -1), K(30, "lie", 500, -1)] },
  { keys: [K(0, "kneel", 540, -1), K(4.5, "kneel", 540, -1), K(4.95, "lie", 620, -1), K(30, "lie", 620, -1)] },
  { keys: [K(0, "stand", 640, 1), K(2.2, "stand", 640, 1), K(2.5, "kneel", 660, -1), K(4.6, "kneel", 660, -1), K(5.1, "lie", 740, -1), K(30, "lie", 740, -1)] },
  { keys: [K(0, "spearStand", 800, 1), K(2.2, "spearStand", 800, 1), K(2.45, "spearAim", 790, 1), K(4.5, "spearAim", 790, 1), K(4.8, "spearStand", 800, -1), K(30, "spearStand", 800, -1)] },
].map(s => ({ ...s, head: "g" }));

// ------------------------------------------------------------------ Szenerie
let STARS = [];
function buildStatic() {
  const R = rng(9);
  for (let i = 0; i < 140; i++) STARS.push([R() * W, -60 - R() * 800, R()]);
}
function drawSky(t, ph) {
  const s = sky(t);
  const gr = g.createLinearGradient(0, -ph, 0, 0);
  gr.addColorStop(0, s.top); gr.addColorStop(1, s.hor);
  g.fillStyle = gr; g.fillRect(0, -ph - 10, W, ph + 10);
  for (const [x, y, k] of STARS) {
    if (y < -ph) continue;
    g.fillStyle = `rgba(255,255,255,${s.night * (0.3 + 0.6 * k) * (0.7 + 0.3 * Math.sin(t * 3 + k * 20))})`;
    g.fillRect(x, y, 2, 2);
  }
  // Sonne geht unter / Mond / Sonne geht auf
  const sunA = 1 - ramp(t, 1.0, 2.6);
  if (sunA > 0) { glowDisc(830, lerp(-300, -90, ramp(t, 0, 2.6)), 34, "#ffe6c0", sunA); }
  const moonA = s.night;
  if (moonA > 0) glowDisc(840, -ph + 110, 22, "#f4f4ee", moonA * 0.95);
  if (s.dawn > 0) glowDisc(830, lerp(-40, -210, ramp(t, 14.0, 16.8)), 38, "#fff1c8", s.dawn);
  // Berge
  g.fillStyle = mixc("#3a2a36", "#0c101a", s.night * (1 - s.dawn) + 0.0) ;
  g.beginPath(); g.moveTo(0, 0);
  for (const [x, y] of [[0, -70], [140, -110], [260, -80], [420, -150], [560, -95], [700, -130], [860, -85], [1000, -125], [1080, -100]]) g.lineTo(x, y);
  g.lineTo(W, 0); g.closePath(); g.fill();
}
function glowDisc(x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r * 4);
  gr.addColorStop(0, `rgba(255,240,210,${0.35 * a})`); gr.addColorStop(1, "rgba(255,240,210,0)");
  g.fillStyle = gr; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = 1;
}
function drawCave(ph) {
  const k = ph / 850;
  g.fillStyle = "#18191d";
  g.beginPath(); g.moveTo(0, 2);
  for (const [x, y] of [[150, 0], [175, -120], [225, -250], [205, -360], [250, -500], [228, -620], [262, -760], [300, -850]]) g.lineTo(x, y * k);
  g.lineTo(W, -ph); g.lineTo(W, -ph + 60 * k);
  for (const [x, y] of [[900, -805], [720, -830], [520, -790], [330, -770]]) g.lineTo(x, Math.max(y * k, -ph + 40));
  g.lineTo(0, -ph); g.closePath(); g.fill();
  g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 2; g.stroke();
}
function drawTree(t, fireK) {
  g.save();
  g.strokeStyle = "#0b0b0b"; g.lineCap = "round";
  const x = TREE_X;
  g.lineWidth = 9; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -150); g.stroke();
  g.lineWidth = 5;
  for (const [a, b, c, d] of [[x, -110, x - 40, -160], [x, -130, x + 38, -175], [x, -150, x - 14, -200], [x - 40, -160, x - 55, -185], [x + 38, -175, x + 52, -195]]) {
    g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke();
  }
  g.restore();
  if (fireK > 0) flames(x, -150, 0.85 * fireK, t, 5, true);
}
function flames(x, y, k, t, seed, tree) {
  if (k <= 0.01) return;
  const gl = g.createRadialGradient(x, y - 30, 5, x, y - 30, (tree ? 220 : 420) * k);
  gl.addColorStop(0, `rgba(255,150,50,${(tree ? 0.4 : 0.5) * Math.min(1, k)})`); gl.addColorStop(1, "rgba(255,120,40,0)");
  g.fillStyle = gl; g.fillRect(x - 450, y - 470, 900, 900);
  const layers = [["#ff6a1a", 1], ["#ffa52e", 0.72], ["#ffe7a3", 0.42]];
  for (const [col, s] of layers) {
    for (let j = -1; j <= 1; j++) {
      const hgt = (tree ? 70 : 110) * k * s * (j === 0 ? 1 : 0.7) * (0.85 + 0.15 * Math.sin(t * 13 + j * 2 + seed));
      const w = (tree ? 34 : 46) * s * (j === 0 ? 1 : 0.75);
      const xx = x + j * w * 0.75 + Math.sin(t * 9 + j + seed) * 3;
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(xx - w / 2, y);
      g.quadraticCurveTo(xx - w / 2, y - hgt * 0.55, xx + Math.sin(t * 11 + j) * 6, y - hgt);
      g.quadraticCurveTo(xx + w / 2, y - hgt * 0.55, xx + w / 2, y);
      g.closePath(); g.fill();
    }
  }
}
function campfire(x, k, t, seed, smokeT) {
  // Steine + Holz
  g.fillStyle = "#3a3a3e";
  for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x - 60 + i * 20, -5, 13, 8, 0, 0, 7); g.fill(); }
  g.strokeStyle = "#2a2018"; g.lineWidth = 9; g.lineCap = "round";
  g.beginPath(); g.moveTo(x - 40, -6); g.lineTo(x + 30, -18); g.moveTo(x + 40, -6); g.lineTo(x - 30, -18); g.stroke();
  flames(x, -12, k, t, seed);
  // Rauch nach dem Ausgehen
  const sm = ramp(t, smokeT, smokeT + 0.3) * (1 - ramp(t, smokeT + 1.4, smokeT + 2.2));
  if (sm > 0) {
    g.strokeStyle = `rgba(190,190,195,${0.55 * sm})`; g.lineWidth = 6;
    for (let j = 0; j < 2; j++) {
      g.beginPath();
      for (let y = 0; y < 170; y += 8) {
        const xx = x - 10 + j * 22 + Math.sin(y * 0.05 + t * 3 + j * 2) * 14;
        if (y === 0) g.moveTo(xx, -20 - y); else g.lineTo(xx, -20 - y);
      }
      g.stroke();
    }
  }
}
function sparks(x, t) {
  for (const s of STRIKES) {
    if (t < s || t > s + 0.35) continue;
    const u = (t - s) / 0.35, R = rng(Math.round(s * 100));
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (R() - 0.5) * 2.4, sp = 120 + R() * 160;
      const px = x + Math.cos(a) * sp * u, py = -14 + Math.sin(a) * sp * u + 200 * u * u;
      g.fillStyle = `rgba(255,${150 + R() * 80},60,${1 - u})`;
      g.beginPath(); g.arc(px, py, 3.5, 0, 7); g.fill();
    }
  }
}
function tool(F, kind, t) {
  if (!kind) return;
  const h = F.aN[1], f = F.f;
  g.save(); g.lineCap = "round";
  if (kind === "spearV") {
    g.strokeStyle = "#e9e3d6"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(h[0] + 6 * f, h[1] + 70); g.lineTo(h[0] + 6 * f, h[1] - 175); g.stroke();
    g.fillStyle = "#dcdcdc"; g.beginPath(); g.moveTo(h[0] + 6 * f - 9, h[1] - 170); g.lineTo(h[0] + 6 * f, h[1] - 205); g.lineTo(h[0] + 6 * f + 9, h[1] - 170); g.closePath(); g.fill();
  } else if (kind === "spearH") {
    g.strokeStyle = "#e9e3d6"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(h[0] - 90 * f, h[1] + 4); g.lineTo(h[0] + 170 * f, h[1] - 6); g.stroke();
    g.fillStyle = "#dcdcdc"; g.beginPath(); g.moveTo(h[0] + 165 * f, h[1] - 15); g.lineTo(h[0] + 200 * f, h[1] - 7); g.lineTo(h[0] + 165 * f, h[1] + 3); g.closePath(); g.fill();
  } else if (kind === "stick") {
    g.strokeStyle = "#9c8a72"; g.lineWidth = 6;
    g.beginPath(); g.moveTo(h[0] - 10 * f, h[1] + 50); g.lineTo(h[0] + 40 * f, h[1] - 110); g.stroke();
  } else if (kind === "torch") {
    g.strokeStyle = "#5a4430"; g.lineWidth = 7;
    const tip = [h[0] + 30 * f, h[1] - 50];
    g.beginPath(); g.moveTo(h[0] - 8 * f, h[1] + 20); g.lineTo(tip[0], tip[1]); g.stroke();
    g.restore();
    flames(tip[0], tip[1] + 6, 0.45, t, 3, true);
    return;
  }
  g.restore();
}
function icons(F, t) {
  const list = [["fire", 0.3], ["plan", 0.65], ["stone", 1.0], ["spear", 1.35]];
  let cur = null;
  for (const [k, s] of list) if (t >= s && t < s + 0.42) cur = [k, s];
  if (!cur || t > 1.8) return;
  const [kind, s] = cur;
  const x = F.Hd[0] + 10, y = F.Hd[1] - 70, p = back(ramp(t, s, s + 0.14));
  g.save(); g.translate(x, y); g.scale(p, p);
  g.fillStyle = "#151515"; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill();
  g.strokeStyle = "#f2f2f2"; g.lineWidth = 3; g.stroke();
  g.beginPath(); g.moveTo(-6, 24); g.lineTo(-14, 40); g.lineTo(4, 25); g.fill();
  if (kind === "fire") { g.fillStyle = "#ff8a2a"; g.beginPath(); g.moveTo(-8, 10); g.quadraticCurveTo(-10, -6, 0, -14); g.quadraticCurveTo(10, -6, 8, 10); g.closePath(); g.fill(); }
  if (kind === "plan") { g.strokeStyle = "#f2f2f2"; g.lineWidth = 3; for (const yy of [-8, 0, 8]) { g.beginPath(); g.moveTo(-10, yy); g.lineTo(10, yy); g.stroke(); } }
  if (kind === "stone") { g.fillStyle = "#bdbdbd"; g.beginPath(); g.ellipse(-5, 3, 9, 7, 0, 0, 7); g.fill(); g.fillStyle = "#ffb03a"; g.beginPath(); g.arc(8, -7, 3, 0, 7); g.fill(); }
  if (kind === "spear") { g.strokeStyle = "#f2f2f2"; g.lineWidth = 3; g.beginPath(); g.moveTo(-11, 11); g.lineTo(10, -10); g.stroke(); g.beginPath(); g.moveTo(2, -11); g.lineTo(11, -11); g.lineTo(11, -2); g.stroke(); }
  g.restore();
}
function note(txt, x, y, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.font = "italic 900 28px InterBlk"; g.fillStyle = "#f2f2f2"; g.textBaseline = "middle";
  g.fillText(txt, x, y); g.restore();
}

// ------------------------------------------------------------------ Felder
function panel(t, top) {
  const ph = top ? PH1 : PH2;
  drawSky(t, ph);
  drawCave(ph);
  drawTree(t, piece(t, TREE_FIRE));
  // Blitz
  const lf = 1 - ramp(t, LIGHTNING, LIGHTNING + 0.25);
  if (t >= LIGHTNING && lf > 0) {
    if (top) {
      g.save(); g.strokeStyle = `rgba(235,240,255,${lf})`; g.lineWidth = 4; g.shadowColor = "#cfe0ff"; g.shadowBlur = 20;
      g.beginPath(); let x = TREE_X + 60, y = -ph;
      g.moveTo(x, y); const R = rng(4);
      while (y < -160) { y += 40 + R() * 40; x += (R() - 0.5) * 60; g.lineTo(Math.min(x, 1000), Math.min(y, -160)); }
      g.lineTo(TREE_X, -160); g.stroke(); g.restore();
    }
  }
  // Boden
  const fx = top ? FX_TOP : FX_BOT;
  campfire(fx, piece(t, top ? FIRE_TOP : FIRE_BOT), t, top ? 1 : 2, 2.0);
  if (!top) sparks(fx, t);
  const figs = top ? E : S;
  const placed = figs.map(fg => {
    const tr = track(fg.keys, t);
    let x = tr.x;
    if (top && t > 3.95 && t < 6.4 && !(fg.keys.some(k => k.p === POSE.look) && t > 6.3)) x += Math.sin(t * 40 + tr.x) * 2.5;   // Zittern
    return { fg, tr, F: placeFig(tr.p, tr.f, x, 0) };
  });
  for (const { fg, tr, F } of placed) {
    drawFig(F, fg.head, { front: () => { tool(F, tr.p.tool, t); } });
    if (!top && fg === S[1]) icons(F, t);
  }
  // Boden-Linie
  const ln = g.createLinearGradient(0, 0, W, 0);
  ln.addColorStop(0, "rgba(255,255,255,0.15)"); ln.addColorStop(0.4, "rgba(255,255,255,0.9)"); ln.addColorStop(1, "rgba(255,255,255,0.2)");
  g.fillStyle = ln; g.fillRect(0, -1, W, 3);
  // Blitz-Licht über das ganze Feld
  if (t >= LIGHTNING && lf > 0) { g.fillStyle = `rgba(220,230,255,${0.35 * lf * (top ? 1 : 0.6)})`; g.fillRect(0, -ph, W, ph); }
  // Hinweise
  if (top) {
    const fa = ramp(t, 0.15, 0.4) * (1 - ramp(t, 1.5, 1.8));
    if (fa > 0) {
      g.save(); g.globalAlpha = fa; g.strokeStyle = "#f2f2f2"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(fx + 40, -280); g.lineTo(fx + 150, -280); g.moveTo(fx + 60, -276); g.lineTo(fx + 10, -150); g.stroke();
      g.font = "900 38px InterBlk"; g.fillStyle = "#f2f2f2"; g.textBaseline = "bottom"; g.fillText("FEUER", fx + 40, -286);
      g.restore();
    }
    note("*leichter Schlaf", 40, -ph + 460, ramp(t, 10.3, 10.6) * (1 - ramp(t, 14.2, 14.5)));
  } else {
    note("*Tiefschlaf", 40, -ph + 50, ramp(t, 10.3, 10.6) * (1 - ramp(t, 14.2, 14.5)));
  }
}

function labels(t) {
  const fin = ramp(t, FINAL, FINAL + 0.3);
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (fin < 1) {
    ctx.globalAlpha = 1 - fin;
    ctx.font = "900 30px InterBlk"; ctx.letterSpacing = "6px"; ctx.fillStyle = "#f2f2f2";
    ctx.fillText("HOMO ERECTUS", 543, LAB1); ctx.fillText("HOMO SAPIENS", 543, LAB2);
  }
  ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(70, DIV, W - 140, 2);
  if (fin > 0) {
    const s = back(fin);
    ctx.font = "900 44px InterBlk";
    for (const [y, a, b] of [[LAB1, "HOMO ERECTUS: ", "BEWAHRT FEUER."], [LAB2 + 4, "HOMO SAPIENS: ", "MACHT FEUER."]]) {
      ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ctx.globalAlpha = clamp(fin * 2);
      const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, x0 = -(wa + wb) / 2;
      ctx.textAlign = "left";
      ctx.fillStyle = "#f6f6f6"; ctx.fillText(a, x0, 0);
      ctx.fillStyle = b.startsWith("MACHT") ? "#ff8a2a" : "#f6f6f6";
      if (b.startsWith("MACHT")) { ctx.shadowColor = "rgba(255,140,40,0.8)"; ctx.shadowBlur = 16; }
      ctx.fillText(b, x0 + wa, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#0b0b0d"; ctx.fillRect(0, 0, W, H);
  // oberes Feld (Himmel reicht bis zum oberen Rand)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, F1 + 2); ctx.clip(); ctx.translate(0, F1); g = ctx; panel(t, true); ctx.restore();
  // unteres Feld
  ctx.save(); ctx.beginPath(); ctx.rect(0, P2TOP, W, F2 - P2TOP + 2); ctx.clip(); ctx.translate(0, F2); panel(t, false); ctx.restore();
  // Boden unten: Feuerschein auf dem Boden, läuft ohne Kante bis zum Rand
  const fk = piece(t, FIRE_BOT);
  const gb = ctx.createRadialGradient(FX_BOT, F2, 10, FX_BOT, F2, 520);
  gb.addColorStop(0, `rgba(255,130,40,${0.22 * fk})`); gb.addColorStop(1, "rgba(255,130,40,0)");
  ctx.fillStyle = gb; ctx.fillRect(0, F2 + 2, W, 520);
  const gt = ctx.createRadialGradient(FX_TOP, F1, 10, FX_TOP, F1, 300);
  gt.addColorStop(0, `rgba(255,130,40,${0.18 * piece(t, FIRE_TOP)})`); gt.addColorStop(1, "rgba(255,130,40,0)");
  ctx.fillStyle = gt; ctx.fillRect(0, F1 + 2, W, P2TOP - F1 - 2);
  labels(t);
  const fo = ramp(t, window.DURATION - 0.5, window.DURATION);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return {
    duration: window.DURATION, fireTop: FIRE_TOP, fireBot: FIRE_BOT, fireOut: 1.95, panic: [2.4, 3.6], cold: [3.8, 6.3],
    lightning: LIGHTNING, treeFire: 6.05, run: [[7.05, 7.75], [8.05, 8.6]], grab: 7.8, relightTop: 8.75, cheer: 9.1,
    strikes: STRIKES, relightBot: 4.45, lieDown: [4.8, 4.95, 5.1], spearAim: 2.45, icons: [0.3, 0.65, 1.0, 1.35],
    jolts: JOLTS, alarm: ALARM, dawn: 14.0, final: FINAL,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 30px InterBlk"), document.fonts.load("italic 900 28px InterBlk")]);
  buildStatic();
  return true;
};
