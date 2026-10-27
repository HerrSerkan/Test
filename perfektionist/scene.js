// "Perfektionist vs. Macher" – Canvas-Animation (deutsche Version), ohne Sprecher.
// Links prüft der Perfektionist seine niedrige Mauer immer wieder mit der Wasserwaage,
// rechts baut der Macher eine hohe Mauer fertig, sitzt oben, langweilt sich und springt weiter.
"use strict";

const W = 1080, H = 1920;
const GY = 1255;                       // Bodenlinie
window.DURATION = 13.8;
const FADE = [13.05, 13.6];

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const sc = document.createElement("canvas");      // Szene ohne Spiegelung
sc.width = W; sc.height = H;
let g = sc.getContext("2d");

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function piece(t, pts) {                 // stückweise linear
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) {
    const [a, va] = pts[i - 1], [b, vb] = pts[i];
    return lerp(va, vb, (t - a) / (b - a));
  }
  return pts[pts.length - 1][1];
}

// ------------------------------------------------------------------ Mauern
const BW = 75, BH = 37, CAP = 28;
const LOW = { x0: 90, rows: 2 };                    // Mauer des Perfektionisten
const LOW_TOP = GY - 2 * BH;
const TALL = { x0: 515, x1: 890, rows: 10 };        // Mauer des Machers
const TALL_TOP = GY - TALL.rows * BH - CAP;
const LEVEL = { x: 318, y: LOW_TOP - 8, len: 128 };   // Wasserwaage auf der Mauer (Mitte)

// Bauplan: wie viele Reihen stehen zur Zeit t
const ROWS = [[0, 1.15], [1.8, 1.9], [2.3, 2.2], [2.7, 3.0], [3.0, 3.5], [3.7, 4.0],
              [4.0, 6.0], [4.35, 8.0], [4.7, 9.0], [5.05, 10.0]];
const CAP_T = [5.86, 5.95, 6.04, 6.12, 6.2];
const FLASH = 6.45;
let BRICKS = [];
function buildBricks() {
  const R = rng(5);
  for (let r = 0; r < TALL.rows; r++) {
    const xs = [];
    if (r % 2 === 0) for (let i = 0; i < 5; i++) xs.push([TALL.x0 + i * BW, BW]);
    else {
      xs.push([TALL.x0, BW / 2]);
      for (let i = 0; i < 4; i++) xs.push([TALL.x0 + BW / 2 + i * BW, BW]);
      xs.push([TALL.x1 - BW / 2, BW / 2]);
    }
    const order = r % 2 === 0 ? xs : xs.slice().reverse();
    order.forEach(([x, w], j) => {
      const frac = r + (j + 1) / order.length;
      let tb = -1;
      if (frac > ROWS[0][1]) for (let tt = 0; tt <= 5.2; tt += 0.004) if (piece(tt, ROWS) >= frac - 1e-6) { tb = tt; break; }
      BRICKS.push({ x, y: GY - (r + 1) * BH, w, h: BH, t: tb, tone: R(), seed: 100 + BRICKS.length });
    });
  }
  CAP_T.forEach((tb, i) => BRICKS.push({ x: TALL.x0 + i * BW, y: TALL_TOP, w: BW, h: CAP, t: tb, tone: R(), cap: true, seed: 300 + i }));
}
function wallTop(t) {
  let top = GY;
  for (const b of BRICKS) if (b.t <= t && b.y < top) top = b.y;
  return top;
}
function nextSlot(t) {
  for (const b of BRICKS) if (b.t > t && !b.cap) return b.x + b.w / 2;
  return TALL.x0 + 80;
}

function brick(x, y, w, h, tone, green, a = 1) {
  g.globalAlpha = a;
  if (green) {
    g.fillStyle = "#59e04f"; g.fillRect(x, y, w, h);
    g.fillStyle = "#86f27a"; g.fillRect(x, y, w, 5);
  } else {
    const v = Math.round(200 + tone * 26);
    g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x, y, w, 4);
    g.fillStyle = "rgba(0,0,0,0.10)"; g.fillRect(x, y + h - 5, w, 5);
  }
  g.strokeStyle = green ? "#2f8a2a" : "#6f6f6f"; g.lineWidth = 2.5;
  g.strokeRect(x + 1, y + 1, w - 2, h - 2);
  g.globalAlpha = 1;
}

function drawLowWall() {
  const R = rng(2);
  for (let i = 0; i < 4; i++) brick(LOW.x0 + i * BW, GY - BH, BW, BH, R(), false);
  brick(LOW.x0 + 8, GY - 2 * BH + 9, BW / 2 - 6, BH - 9, R(), false);      // lose Stufe links
  for (let i = 0; i < 3; i++) brick(LOW.x0 + BW / 2 + i * BW, GY - 2 * BH, BW, BH, R(), false);
  brick(LOW.x0 + BW / 2 + 3 * BW, GY - 2 * BH, BW / 2, BH, R(), false);
}

function drawTallWall(t) {
  for (const b of BRICKS) {
    if (b.t > t) continue;
    const k = b.t < 0 ? 1 : easeOut(ramp(t, b.t, b.t + 0.09));
    brick(b.x, b.y - (1 - k) * 22, b.w, b.h, b.tone, !!b.cap, 0.3 + 0.7 * k);
  }
  // grünes Aufleuchten der fertigen Mauer (von oben nach unten)
  if (t > FLASH && t < FLASH + 1.3) {
    const front = TALL_TOP + (GY - TALL_TOP) * easeOut(ramp(t, FLASH, FLASH + 0.45));
    const a = 0.7 * (1 - ramp(t, FLASH + 0.55, FLASH + 1.3));
    const gr = g.createLinearGradient(0, TALL_TOP, 0, front + 1);
    gr.addColorStop(0, `rgba(90,235,80,${a})`);
    gr.addColorStop(0.75, `rgba(90,235,80,${a * 0.8})`);
    gr.addColorStop(1, "rgba(90,235,80,0)");
    g.fillStyle = gr; g.fillRect(TALL.x0, TALL_TOP + CAP, TALL.x1 - TALL.x0, front - TALL_TOP - CAP);
  }
  // Steinchen beim Setzen
  for (const b of BRICKS) {
    if (b.t < 0 || t < b.t || t > b.t + 0.45) continue;
    const R = rng(b.seed), u = (t - b.t) / 0.45;
    for (let k = 0; k < 4; k++) {
      const vx = (R() - 0.5) * 160, vy = -90 - R() * 120;
      const px = b.x + (R() < 0.5 ? 4 : b.w - 4) + vx * u * 0.45, py = b.y + vy * u * 0.45 + 500 * (u * 0.45) ** 2;
      g.fillStyle = `rgba(190,190,190,${1 - u})`;
      g.beginPath(); g.arc(px, py, 3 + R() * 2.5, 0, 7); g.fill();
    }
  }
}

// ------------------------------------------------------------------ Gliederpuppe
const L = { tor: 132, neck: 12, head: 27, ua: 82, fa: 78, th: 100, sh: 100 };
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
  if (p.anchor === "pelvis") dy = surf - 22;
  else {
    let low = -1e9;
    for (const q of [J.lN[0], J.lN[1], J.lF[0], J.lF[1]]) low = Math.max(low, q[1]);
    if (p.anchor === "body") low = Math.max(low, J.S[1] + 20, 10);
    dy = surf - low - 12;
  }
  const mv = q => [q[0] + x, q[1] + dy];
  return { f, P: mv(J.P), S: mv(J.S), Hd: mv(J.Hd), aN: J.aN.map(mv), aF: J.aF.map(mv), lN: J.lN.map(mv), lF: J.lF.map(mv) };
}

const INK = "#262626";
function seg(a, b, w, fill) {
  g.lineCap = "round";
  g.strokeStyle = INK; g.lineWidth = w + 5;
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = fill; g.lineWidth = w;
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
}
function foot(k, a, f, fill) {
  const d = [a[0] - k[0], a[1] - k[1]], l = Math.hypot(d[0], d[1]) || 1;
  // Fuß zeigt nach vorn, quer zum Schienbein
  const n = [-d[1] / l * f, d[0] / l * f];
  const tip = [a[0] - n[0] * 26, a[1] - n[1] * 26];
  seg(a, tip, 17, fill);
}
function torso(P, S, fill) {
  const ux = S[0] - P[0], uy = S[1] - P[1], l = Math.hypot(ux, uy);
  const u = [ux / l, uy / l], n = [-u[1], u[0]];
  const an = Math.atan2(n[1], n[0]);
  const rS = 25, rP = 21;
  const S2 = [S[0] - u[0] * 14, S[1] - u[1] * 14], P2 = [P[0] + u[0] * 6, P[1] + u[1] * 6];
  g.beginPath();
  g.moveTo(P2[0] + n[0] * rP, P2[1] + n[1] * rP);
  g.lineTo(S2[0] + n[0] * rS, S2[1] + n[1] * rS);
  g.arc(S2[0], S2[1], rS, an, an + Math.PI, true);
  g.lineTo(P2[0] - n[0] * rP, P2[1] - n[1] * rP);
  g.arc(P2[0], P2[1], rP, an + Math.PI, an + 2 * Math.PI, true);
  g.closePath();
  g.fillStyle = fill; g.fill();
  g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
}
const NEAR = "#f3f3f3", FAR = "#9a9a9a";
function drawFig(F, extra) {
  // ferne Seite
  seg(F.P, F.lF[0], 27, FAR); seg(F.lF[0], F.lF[1], 25, FAR); foot(F.lF[0], F.lF[1], F.f, FAR);
  seg(F.S, F.aF[0], 23, FAR); seg(F.aF[0], F.aF[1], 21, FAR);
  if (extra && extra.behind) extra.behind();
  // Rumpf + Kopf
  torso(F.P, F.S, NEAR);
  g.beginPath(); g.arc(F.Hd[0], F.Hd[1], L.head, 0, 7);
  g.fillStyle = NEAR; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  // nahe Seite
  seg(F.P, F.lN[0], 27, NEAR); seg(F.lN[0], F.lN[1], 25, NEAR); foot(F.lN[0], F.lN[1], F.f, NEAR);
  if (extra && extra.mid) extra.mid();
  seg(F.S, F.aN[0], 23, NEAR); seg(F.aN[0], F.aN[1], 21, NEAR);
  if (extra && extra.front) extra.front();
}

function mixPose(a, b, k) {
  const o = {};
  for (const key of ["tor", "head"]) o[key] = lerp(a[key], b[key], k);
  for (const key of ["aN", "aF", "lN", "lF"]) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)];
  o.anchor = k < 0.5 ? a.anchor : b.anchor;
  o.lv = lerp(a.lv ?? 0, b.lv ?? 0, k);              // 0 = Waage liegt, 1 = in der Hand
  o.lvAng = lerp(a.lvAng ?? 0, b.lvAng ?? 0, k);
  o.brick = k < 0.5 ? a.brick : b.brick;
  return o;
}
function track(keys, t) {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
  const A = keys[i], B = keys[Math.min(i + 1, keys.length - 1)];
  const k = B === A ? 0 : easeIO(ramp(t, A.t, B.t));
  return { p: mixPose(A.p, B.p, k), x: lerp(A.x, B.x, k), s: lerp(A.s, B.s, k), f: k < 0.5 ? A.f : B.f, k };
}

// ------------------------------------------------------------------ Posen
const POSE = {
  // Perfektionist (schaut nach rechts)
  crouch: { tor: 118, head: 112, aN: [30, 4], aF: [42, 12], lN: [96, -16], lF: [32, -94] },
  kneelVert: { tor: 176, head: 168, aN: [60, 193], aF: [50, 188], lN: [92, 0], lF: [8, -88], lv: 1, lvAng: -82 },
  kneelSight: { tor: 172, head: 162, aN: [80, 208], aF: [70, 200], lN: [92, 0], lF: [8, -88], lv: 1, lvAng: -38 },
  kneelLow: { tor: 160, head: 150, aN: [50, 120], aF: [42, 112], lN: [92, 0], lF: [8, -88], lv: 1, lvAng: -12 },
  standWatch: { tor: 176, head: 174, aN: [-6, 4], aF: [6, 12], lN: [4, -4], lF: [-6, -10] },
  standLook: { tor: 178, head: 186, aN: [-4, 6], aF: [8, 14], lN: [4, -4], lF: [-6, -10] },
  bend: { tor: 140, head: 128, aN: [30, 20], aF: [36, 24], lN: [50, -30], lF: [26, -50] },
  // Macher
  placeUp: { tor: 118, head: 116, aN: [70, 110], aF: [60, 100], lN: [24, -12], lF: [-4, -24], brick: true },
  placeDown: { tor: 84, head: 76, aN: [10, 30], aF: [4, 22], lN: [34, -16], lF: [6, -30] },
  topUp: { tor: 120, head: 116, aN: [70, 100], aF: [60, 92], lN: [100, -14], lF: [36, -92], brick: true },
  topDown: { tor: 96, head: 90, aN: [20, 26], aF: [12, 18], lN: [100, -14], lF: [36, -92] },
  prone: { tor: 93, head: 100, aN: [96, 100], aF: [88, 96], lN: [-90, -92], lF: [-87, -90], anchor: "pelvis" },
  kneelCap: { tor: 128, head: 118, aN: [44, 26], aF: [34, 18], lN: [94, -6], lF: [10, -92] },
  stand: { tor: 180, head: 180, aN: [-4, 4], aF: [6, 10], lN: [3, -2], lF: [-5, -8] },
  proud: { tor: 184, head: 188, aN: [-14, -6], aF: [-8, -4], lN: [5, -2], lF: [-7, -8] },
  walkA: { tor: 176, head: 178, aN: [-22, -8], aF: [24, 40], lN: [24, -6], lF: [-20, -40] },
  walkB: { tor: 176, head: 178, aN: [24, 40], aF: [-22, -8], lN: [-20, -40], lF: [24, -6] },
  sit: { tor: 176, head: 166, aN: [18, 62], aF: [24, 70], lN: [90, 6], lF: [94, -4], anchor: "pelvis" },
  think: { tor: 156, head: 162, aN: [16, 177], aF: [26, 64], lN: [90, 6], lF: [94, -4], anchor: "pelvis" },
  despair: { tor: 150, head: 130, aN: [18, 168], aF: [24, 160], lN: [90, 6], lF: [94, -4], anchor: "pelvis" },
  jumpPrep: { tor: 128, head: 140, aN: [-60, -40], aF: [-50, -30], lN: [96, -30], lF: [86, -36] },
  jumpUp: { tor: 168, head: 160, aN: [130, 128], aF: [120, 120], lN: [-12, -30], lF: [-20, -44] },
  jumpFly: { tor: 160, head: 150, aN: [120, 110], aF: [110, 104], lN: [60, -30], lF: [30, -50] },
};

// Perfektionist: x = Becken, s = Standfläche
const PS = LOW_TOP, PX = 168;
const KP = (t, p, x = PX, s = PS, f = 1) => ({ t, p: POSE[p], x, s, f });
const P_KEYS = [
  KP(0, "crouch"), KP(1.62, "crouch"), KP(1.95, "kneelVert"), KP(2.25, "kneelVert"), KP(2.55, "kneelSight"),
  KP(3.3, "kneelSight"), KP(3.68, "kneelLow"), KP(4.0, "crouch"),
  KP(6.15, "crouch"), KP(6.5, "kneelSight"), KP(7.35, "kneelSight"), KP(7.7, "crouch"),
  KP(9.5, "crouch"), KP(9.95, "standWatch"), KP(10.3, "standLook"), KP(11.15, "standWatch"),
  KP(11.55, "bend"), KP(11.95, "crouch"), KP(20, "crouch"),
];
const P_JIG = [[0, 1.6], [4.05, 6.1], [7.75, 9.45], [12.0, 20]];   // kleine Korrekturen an der Waage

// Macher: Bau-Phase prozedural, danach Keyframes
const M_TOP = TALL_TOP;
const KM = (t, p, x, s = M_TOP, f = -1) => ({ t, p: POSE[p], x, s, f });
const M_KEYS = [
  KM(5.1, "topDown", 700), KM(5.3, "prone", 760), KM(5.8, "prone", 760), KM(5.95, "kneelCap", 700),
  KM(6.22, "kneelCap", 780), KM(6.45, "stand", 760), KM(6.6, "proud", 760), KM(6.95, "proud", 760),
  KM(7.1, "walkA", 720), KM(7.25, "walkB", 660), KM(7.4, "walkA", 600), KM(7.55, "stand", 565),
  KM(7.85, "sit", 552), KM(8.05, "sit", 552), KM(8.3, "think", 552), KM(8.6, "think", 552),
  KM(8.85, "despair", 552), KM(9.4, "despair", 552), KM(9.6, "sit", 552),
  KM(9.78, "stand", 572, M_TOP, 1), KM(9.98, "jumpPrep", 585, M_TOP, 1), KM(10.06, "jumpPrep", 585, M_TOP, 1),
];
const JUMP = [10.06, 10.55];
const LAND = 10.78;

function macher(t) {
  if (t < 5.1) {
    const onTop = easeIO(ramp(t, 3.62, 4.05));
    let sx = 0;
    for (let k = 0; k < 6; k++) sx += nextSlot(t - k * 0.04);
    sx /= 6;
    const xg = Math.min(915, sx + 88), xt = clamp(sx + 40, 600, 830);
    const x = lerp(xg, xt, onTop);
    const s = lerp(GY, wallTop(t), onTop);
    const c = 0.5 - 0.5 * Math.cos(2 * Math.PI * t * 2.7);
    const rowsNow = clamp(piece(t, ROWS) / 4);
    const up = POSE.placeUp, dn = { ...POSE.placeDown, tor: lerp(84, 118, rowsNow), head: lerp(76, 110, rowsNow) };
    const ground = mixPose(dn, up, c);
    const top = mixPose(POSE.topDown, POSE.topUp, c);
    return { p: mixPose(ground, top, onTop), x, s, f: -1 };
  }
  if (t < JUMP[0]) { const r = track(M_KEYS, t); r.s = wallTop(t); return r; }
  // Sprung: hoch und nach rechts aus dem Bild
  const u = ramp(t, JUMP[0], JUMP[1]);
  const x = lerp(585, 1260, Math.pow(u, 0.85));
  const s = M_TOP - 140 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 260 * Math.max(0, u - 0.7);
  const p = u < 0.35 ? mixPose(POSE.jumpPrep, POSE.jumpUp, easeOut(u / 0.35)) : mixPose(POSE.jumpUp, POSE.jumpFly, easeIO((u - 0.35) / 0.65));
  return { p, x, s, f: 1 };
}

// ------------------------------------------------------------------ Wasserwaage
function drawLevel(cx, cy, ang) {
  g.save(); g.translate(cx, cy); g.rotate(ang * Math.PI / 180);
  const l = LEVEL.len, h = 15;
  g.fillStyle = "#4fe047"; g.fillRect(-l / 2, -h / 2, l, h);
  g.fillStyle = "#8ef585"; g.fillRect(-l / 2, -h / 2, l, 4);
  g.strokeStyle = "#1f6a1b"; g.lineWidth = 2.5; g.strokeRect(-l / 2, -h / 2, l, h);
  g.fillStyle = "#1c1c1c"; g.fillRect(-10, -4.5, 20, 9);
  g.fillStyle = "#f4f4f4"; g.beginPath(); g.arc(-1 + 2 * Math.sin(ang), 0, 3, 0, 7); g.fill();
  g.restore();
}

// ------------------------------------------------------------------ Bild
const LABEL_P = { text: "PERFEKTIONIST", x: 92, y: 725 };
const LABEL_M = { text: "DER MACHER", x: 702, y: 335 };
function label(L0, a) {
  g.save();
  g.globalAlpha = a;
  g.font = "900 30px InterBlk";
  g.letterSpacing = "4px";
  g.fillStyle = "#f2f2f2";
  g.textAlign = L0.x > 500 ? "center" : "left";
  g.textBaseline = "middle";
  g.fillText(L0.text, L0.x, L0.y);
  g.restore();
}

function dust(t) {
  if (t < LAND || t > LAND + 1.0) return;
  const u = (t - LAND) / 1.0, R = rng(77);
  for (let k = 0; k < 9; k++) {
    const vx = -40 - R() * 160, vy = -60 - R() * 150;
    const tt = u * 0.9;
    const px = 1085 + vx * tt, py = GY - 6 + vy * tt + 420 * tt * tt;
    if (py > GY - 3) continue;
    g.fillStyle = `rgba(185,185,185,${1 - u})`;
    g.beginPath(); g.arc(px, py, 3 + R() * 4, 0, 7); g.fill();
  }
}

function renderScene(t) {
  g.clearRect(0, 0, W, H);
  // Perfektionist
  const P = track(P_KEYS, t);
  let jig = 0;
  for (const [a, b] of P_JIG) if (t > a && t < b) jig = Math.sin(t * 15) * 5 * ramp(t, a, a + 0.2) * (1 - ramp(t, b - 0.2, b));
  const pp = { ...P.p, aN: [P.p.aN[0] + jig, P.p.aN[1] - jig * 1.4], aF: [P.p.aF[0] - jig * 0.6, P.p.aF[1]] };
  const FP = placeFig(pp, P.f, P.x, P.s);
  const hand = FP.aN[1];
  const lvW = [LEVEL.x + jig * 0.6, LEVEL.y], lvH = [hand[0] + 6, hand[1] - 4];
  const lv = P.p.lv;
  const lx = lerp(lvW[0], lvH[0], lv), ly = lerp(lvW[1], lvH[1], lv);
  const lang = lerp(jig * 0.25, P.p.lvAng, lv);

  drawLowWall();
  drawTallWall(t);
  drawFig(FP, {
    mid: () => { if (lv > 0.02) drawLevel(lx, ly, lang); },
    behind: () => { if (lv <= 0.02) drawLevel(lx, ly, lang); },
  });

  // Macher
  const M = macher(t);
  if (M.x < 1300) {
    const FM = placeFig(M.p, M.f, M.x, M.s);
    drawFig(FM, {
      front: () => {
        if (M.p.brick) {
          const hN = FM.aN[1], hF = FM.aF[1];
          const cx = (hN[0] + hF[0]) / 2, cy = (hN[1] + hF[1]) / 2 + 8;
          brick(cx - BW / 2, cy - BH / 2, BW, BH, 0.5, false);
        }
      },
    });
  }
  dust(t);
  const la = 1;
  label(LABEL_P, la);
  label(LABEL_M, la);
}

window.renderFrame = function (t) {
  renderScene(t);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  // weiches Licht auf dem Boden
  const sp = ctx.createRadialGradient(W / 2, GY, 20, W / 2, GY, 620);
  sp.addColorStop(0, "rgba(70,70,70,0.55)"); sp.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sp; ctx.fillRect(0, GY - 400, W, 800);
  // Spiegelung
  const RH = 300;
  ctx.save();
  ctx.translate(0, 2 * GY); ctx.scale(1, -1);
  ctx.globalAlpha = 0.28;
  ctx.drawImage(sc, 0, GY - RH, W, RH, 0, GY - RH, W, RH);
  ctx.restore();
  const fg = ctx.createLinearGradient(0, GY, 0, GY + 210);
  fg.addColorStop(0, "rgba(0,0,0,0.1)"); fg.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = fg; ctx.fillRect(0, GY, W, RH + 10);
  ctx.drawImage(sc, 0, 0);
  // Bodenkante
  const ln = ctx.createLinearGradient(0, 0, W, 0);
  ln.addColorStop(0, "rgba(255,255,255,0)"); ln.addColorStop(0.5, "rgba(255,255,255,0.12)"); ln.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = ln; ctx.fillRect(0, GY, W, 2);
  // Ausblenden am Ende
  const fo = ramp(t, FADE[0], FADE[1]);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  const bricks = BRICKS.filter(b => b.t >= 0 && !b.cap).map(b => +b.t.toFixed(3));
  return {
    duration: window.DURATION, bricks, cap: CAP_T, flash: FLASH,
    levelUp: [1.62, 6.15], levelDown: [3.68, 7.35], jig: P_JIG,
    climb: 3.62, prone: 5.3, stand: 6.45, steps: [7.1, 7.25, 7.4, 7.55], sit: 7.85, despair: 8.85,
    standUp: 9.6, jump: JUMP, land: LAND, pStand: 9.5, pDown: 11.55, fade: FADE,
  };
};

window.setup = async function () {
  await document.fonts.load("900 34px InterBlk");
  buildBricks();
  return true;
};
