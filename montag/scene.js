// "Wartet auf Montag vs. fängt heute an" – Canvas-Animation ohne Worte (Stil wie perfektionist/).
// Links sitzt einer am Handy und legt nur montags einen Stein, rechts baut einer jeden Tag eine Stufe.
// Dazwischen blättert ein neongrüner Kalender die Tage durch.
"use strict";

const W = 1080, H = 1920;
const GY = 1255;                       // Bodenlinie
window.DURATION = 14.0;
const FADE = [13.3, 13.9];

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const sc = document.createElement("canvas");      // Szene ohne Spiegelung
sc.width = W; sc.height = H;
const g = sc.getContext("2d");

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

// ------------------------------------------------------------------ Tage
const DAY = 1.15;
const DAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
const dayAt = t => Math.max(0, Math.floor(t / DAY));

// ------------------------------------------------------------------ Steine
const BW = 75, BH = 37;
const SW = 46, SH = 34, STEPS = 9, X0 = 500;           // Treppe des Machers
const colTop = k => GY - (k + 1) * SH;
const colX = k => X0 + k * SW + SW / 2;
const A_BRICKS = [{ x: 178, y: GY - BH, t: 0.5 }, { x: 178, y: GY - 2 * BH, t: 8.95 }];
let STAIR = [];                                        // {x, y, t, k}
function buildStairs() {
  const R = rng(5);
  for (let k = 0; k < STEPS; k++) {
    const t0 = k * DAY + 0.18;
    for (let j = 0; j <= k; j++) STAIR.push({ x: X0 + k * SW, y: GY - (j + 1) * SH, t: t0 + j * (0.36 / (k + 1)), k, tone: R(), seed: 100 + STAIR.length });
  }
}
const GLOW = STEPS * DAY - DAY + 1.25;                 // Treppe fertig: grünes Aufleuchten

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
function chips(x, y, t, t0, seed) {
  if (t < t0 || t > t0 + 0.45) return;
  const R = rng(seed), u = (t - t0) / 0.45;
  for (let k = 0; k < 4; k++) {
    const vx = (R() - 0.5) * 160, vy = -90 - R() * 120;
    const px = x + vx * u * 0.45, py = y + vy * u * 0.45 + 500 * (u * 0.45) ** 2;
    g.fillStyle = `rgba(190,190,190,${1 - u})`;
    g.beginPath(); g.arc(px, py, 3 + R() * 2.5, 0, 7); g.fill();
  }
}
function drawStairs(t) {
  for (const b of STAIR) {
    if (t < b.t) continue;
    const k = easeOut(ramp(t, b.t, b.t + 0.08));
    const top = b.y === colTop(b.k);
    const green = t > GLOW + 0.1 * b.k / STEPS && top;
    brick(b.x, b.y - (1 - k) * 18, SW, SH, b.tone, green, 0.3 + 0.7 * k);
    chips(b.x + SW / 2, b.y, t, b.t, b.seed);
  }
  // grünes Aufleuchten über die ganze Treppe (von links nach rechts)
  if (t > GLOW && t < GLOW + 1.4) {
    const front = X0 + STEPS * SW * easeOut(ramp(t, GLOW, GLOW + 0.5));
    const a = 0.65 * (1 - ramp(t, GLOW + 0.6, GLOW + 1.4));
    g.save();
    g.beginPath();
    for (let k = 0; k < STEPS; k++) g.rect(X0 + k * SW, colTop(k), SW, (k + 1) * SH);
    g.clip();
    const gr = g.createLinearGradient(X0, 0, front + 1, 0);
    gr.addColorStop(0, `rgba(90,235,80,${a})`); gr.addColorStop(0.8, `rgba(90,235,80,${a * 0.8})`); gr.addColorStop(1, "rgba(90,235,80,0)");
    g.fillStyle = gr; g.fillRect(X0, colTop(STEPS - 1), front - X0, GY);
    g.restore();
  }
}
function drawABricks(t) {
  A_BRICKS.forEach((b, i) => {
    if (t < b.t) return;
    const k = easeOut(ramp(t, b.t, b.t + 0.09));
    brick(b.x, b.y - (1 - k) * 20, BW, BH, 0.3 + i * 0.3, false, 0.3 + 0.7 * k);
    chips(b.x + BW / 2, b.y, t, b.t, 40 + i);
  });
}

// ------------------------------------------------------------------ Kalender (neongrün)
const CAL = { x: 356, w: 96, h: 126 };
function drawCalendar(t) {
  const d = dayAt(t), u = t / DAY - d;
  const flip = ramp(u, 0, 0.16);
  const cx = CAL.x, top = GY - CAL.h - 34;
  g.save();
  // Ständer
  g.strokeStyle = "#3d3d3d"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(cx - 30, GY); g.lineTo(cx, top + CAL.h - 4); g.lineTo(cx + 30, GY); g.stroke();
  // Blatt
  g.shadowColor = "rgba(90,235,80,0.55)"; g.shadowBlur = 22;
  g.fillStyle = "#101410"; g.fillRect(cx - CAL.w / 2, top, CAL.w, CAL.h);
  g.shadowBlur = 0;
  g.strokeStyle = "#59e04f"; g.lineWidth = 4; g.strokeRect(cx - CAL.w / 2, top, CAL.w, CAL.h);
  g.fillStyle = "#59e04f"; g.fillRect(cx - CAL.w / 2, top, CAL.w, 26);
  for (const rx of [-26, 0, 26]) { g.fillStyle = "#e9e9e9"; g.beginPath(); g.arc(cx + rx, top, 5, 0, 7); g.fill(); }
  const mon = DAYS[d % 7] === "MO";
  g.font = "900 52px InterBlk"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = mon ? "#8ef585" : "#f2f2f2";
  if (mon) { g.shadowColor = "rgba(120,255,110,0.9)"; g.shadowBlur = 18; }
  g.fillText(DAYS[d % 7], cx, top + 26 + (CAL.h - 26) / 2 + 3);
  g.shadowBlur = 0;
  // altes Blatt klappt nach oben weg
  if (d > 0 && flip < 1) {
    const hh = (CAL.h - 26) * (1 - flip);
    g.fillStyle = "#1a201a"; g.fillRect(cx - CAL.w / 2 + 2, top + 26, CAL.w - 4, hh);
    g.save(); g.beginPath(); g.rect(cx - CAL.w / 2, top + 26, CAL.w, hh); g.clip();
    g.fillStyle = "#cfcfcf"; g.font = "900 52px InterBlk";
    g.fillText(DAYS[(d - 1) % 7], cx, top + 26 + hh / 2 + 3);
    g.restore();
  }
  g.restore();
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
  const n = [-d[1] / l * f, d[0] / l * f];
  seg(a, [a[0] - n[0] * 26, a[1] - n[1] * 26], 17, fill);
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
function drawFig(F, extra = {}) {
  seg(F.P, F.lF[0], 27, FAR); seg(F.lF[0], F.lF[1], 25, FAR); foot(F.lF[0], F.lF[1], F.f, FAR);
  seg(F.S, F.aF[0], 23, FAR); seg(F.aF[0], F.aF[1], 21, FAR);
  torso(F.P, F.S, NEAR);
  g.beginPath(); g.arc(F.Hd[0], F.Hd[1], L.head, 0, 7);
  g.fillStyle = NEAR; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  seg(F.P, F.lN[0], 27, NEAR); seg(F.lN[0], F.lN[1], 25, NEAR); foot(F.lN[0], F.lN[1], F.f, NEAR);
  if (extra.mid) extra.mid();
  seg(F.S, F.aN[0], 23, NEAR); seg(F.aN[0], F.aN[1], 21, NEAR);
  if (extra.front) extra.front();
}
function mixPose(a, b, k) {
  const o = {};
  for (const key of ["tor", "head"]) o[key] = lerp(a[key], b[key], k);
  for (const key of ["aN", "aF", "lN", "lF"]) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)];
  o.anchor = k < 0.5 ? a.anchor : b.anchor;
  o.brick = k < 0.5 ? a.brick : b.brick;
  o.phone = lerp(a.phone ?? 0, b.phone ?? 0, k);
  return o;
}
function track(keys, t) {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
  const A = keys[i], B = keys[Math.min(i + 1, keys.length - 1)];
  const k = B === A ? 0 : easeIO(ramp(t, A.t, B.t));
  return { p: mixPose(A.p, B.p, k), x: lerp(A.x, B.x, k), s: lerp(A.s, B.s, k), f: k < 0.5 ? A.f : B.f };
}

// ------------------------------------------------------------------ Posen (Blickrichtung rechts = f 1)
const POSE = {
  stand: { tor: 180, head: 180, aN: [-4, 4], aF: [6, 10], lN: [3, -2], lF: [-5, -8] },
  proud: { tor: 184, head: 188, aN: [-14, -6], aF: [-8, -4], lN: [5, -2], lF: [-7, -8] },
  lookDown: { tor: 178, head: 150, aN: [-4, 4], aF: [6, 10], lN: [3, -2], lF: [-5, -8] },
  carry: { tor: 150, head: 140, aN: [70, 100], aF: [60, 92], lN: [20, -20], lF: [-6, -26], brick: true },
  place: { tor: 108, head: 96, aN: [24, 34], aF: [14, 24], lN: [40, -24], lF: [10, -36] },
  stepUp: { tor: 172, head: 176, aN: [-24, -10], aF: [26, 40], lN: [62, -12], lF: [-18, -30] },
  // Handy auf dem Stein (sitzend, Knie hoch)
  sitPhone: { tor: 170, head: 146, aN: [22, 140], aF: [30, 150], lN: [118, 14], lF: [112, 8], anchor: "pelvis", phone: 1 },
  sitLook: { tor: 176, head: 188, aN: [24, 110], aF: [30, 120], lN: [118, 14], lF: [112, 8], anchor: "pelvis", phone: 0.6 },
  sitHigh: { tor: 170, head: 146, aN: [22, 140], aF: [30, 150], lN: [100, 6], lF: [96, 0], anchor: "pelvis", phone: 1 },
  sitHighLook: { tor: 176, head: 192, aN: [24, 110], aF: [30, 120], lN: [100, 6], lF: [96, 0], anchor: "pelvis", phone: 0.6 },
  jumpPrep: { tor: 128, head: 140, aN: [-60, -40], aF: [-50, -30], lN: [96, -30], lF: [86, -36] },
  jumpUp: { tor: 168, head: 160, aN: [130, 128], aF: [120, 120], lN: [-12, -30], lF: [-20, -44] },
  jumpFly: { tor: 160, head: 150, aN: [120, 110], aF: [110, 104], lN: [60, -30], lF: [30, -50] },
};

// Wartet auf Montag (links)
const SEAT1 = GY - BH, SEAT2 = GY - 2 * BH, AX = 216;
const KA = (t, p, x, s = GY, f = 1) => ({ t, p: POSE[p], x, s, f });
const A_KEYS = [
  KA(0, "stand", 120), KA(0.12, "carry", 128), KA(0.42, "place", 150), KA(0.62, "place", 150), KA(0.85, "stand", 135),
  KA(1.2, "stand", 135), KA(1.55, "sitPhone", AX, SEAT1), KA(8.05, "sitPhone", AX, SEAT1), KA(8.25, "sitLook", AX, SEAT1),
  KA(8.55, "stand", 125), KA(8.65, "carry", 128), KA(8.88, "place", 145), KA(9.05, "place", 145), KA(9.25, "stand", 130),
  KA(9.45, "stand", 130), KA(9.8, "sitHigh", AX, SEAT2), KA(10.45, "sitHigh", AX, SEAT2), KA(10.75, "sitHighLook", AX, SEAT2),
  KA(12.6, "sitHighLook", AX, SEAT2), KA(12.95, "sitHigh", AX, SEAT2), KA(30, "sitHigh", AX, SEAT2),
];

// Fängt heute an (rechts): pro Tag eine Stufe bauen und hochsteigen
const KB = (t, p, x, s, f = 1) => ({ t, p: POSE[p], x, s, f });
const B_KEYS = [];
(function () {
  let x = X0 - 40, s = GY;
  for (let k = 0; k < STEPS; k++) {
    const t0 = k * DAY;
    B_KEYS.push(KB(t0 + 0.02, "stand", x, s), KB(t0 + 0.16, "carry", x, s), KB(t0 + 0.32, "place", x + 4, s),
      KB(t0 + 0.52, "place", x + 4, s), KB(t0 + 0.64, "stand", x, s),
      KB(t0 + 0.8, "stepUp", lerp(x, colX(k), 0.5), Math.min(s, colTop(k)) - 8), KB(t0 + 0.96, "stand", colX(k), colTop(k)));
    x = colX(k); s = colTop(k);
  }
  B_KEYS.push(KB(GLOW + 0.05, "stand", x, s), KB(GLOW + 0.35, "proud", x, s), KB(GLOW + 0.85, "proud", x, s),
    KB(GLOW + 1.1, "lookDown", x, s, -1), KB(GLOW + 1.75, "lookDown", x, s, -1),
    KB(GLOW + 1.95, "stand", x, s, 1), KB(GLOW + 2.15, "jumpPrep", x, s, 1), KB(GLOW + 2.25, "jumpPrep", x, s, 1));
})();
const JUMP = [GLOW + 2.25, GLOW + 2.7];
const LAND = GLOW + 2.95;

function macher(t) {
  if (t < JUMP[0]) return track(B_KEYS, t);
  const u = ramp(t, JUMP[0], JUMP[1]);
  const x0 = colX(STEPS - 1), s0 = colTop(STEPS - 1);
  const x = lerp(x0, 1300, Math.pow(u, 0.85));
  const s = s0 - 120 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 260 * Math.max(0, u - 0.7);
  const p = u < 0.35 ? mixPose(POSE.jumpPrep, POSE.jumpUp, easeOut(u / 0.35)) : mixPose(POSE.jumpUp, POSE.jumpFly, easeIO((u - 0.35) / 0.65));
  return { p, x, s, f: 1 };
}

// ------------------------------------------------------------------ Handy
function phone(hx, hy, a, t) {
  if (a <= 0.02) return;
  g.save(); g.globalAlpha = clamp(a); g.translate(hx + 4, hy - 10); g.rotate(-0.35);
  g.fillStyle = "#1b1b1b"; g.fillRect(-11, -19, 22, 38);
  const flick = 0.75 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.1);
  g.fillStyle = `rgba(170,205,255,${0.85 * flick})`; g.fillRect(-8, -15, 16, 30);
  g.restore();
  // Bildschirmlicht im Gesicht
  const gr = g.createRadialGradient(hx, hy - 30, 2, hx, hy - 30, 90);
  gr.addColorStop(0, `rgba(160,200,255,${0.22 * a})`); gr.addColorStop(1, "rgba(160,200,255,0)");
  g.fillStyle = gr; g.fillRect(hx - 90, hy - 120, 180, 180);
}

// ------------------------------------------------------------------ Bild
const LABEL_A = { text: "WARTET AUF MONTAG", x: 64, y: 780 };
const LABEL_B = { text: "FÄNGT HEUTE AN", x: 706, y: 420 };
function label(L0) {
  g.save();
  g.font = "900 30px InterBlk"; g.letterSpacing = "4px";
  g.fillStyle = "#f2f2f2";
  g.textAlign = L0.x > 500 ? "center" : "left"; g.textBaseline = "middle";
  g.fillText(L0.text, L0.x, L0.y);
  g.restore();
}
function dust(t) {
  if (t < LAND || t > LAND + 1.0) return;
  const u = (t - LAND) / 1.0, R = rng(77);
  for (let k = 0; k < 9; k++) {
    const vx = -40 - R() * 160, vy = -60 - R() * 150, tt = u * 0.9;
    const px = 1085 + vx * tt, py = GY - 6 + vy * tt + 420 * tt * tt;
    if (py > GY - 3) continue;
    g.fillStyle = `rgba(185,185,185,${1 - u})`;
    g.beginPath(); g.arc(px, py, 3 + R() * 4, 0, 7); g.fill();
  }
}

function renderScene(t) {
  g.clearRect(0, 0, W, H);
  drawCalendar(t);
  drawABricks(t);
  drawStairs(t);
  // links
  const A = track(A_KEYS, t);
  const scroll = A.p.phone > 0.9 ? Math.sin(t * 7) * 3 : 0;
  const pa = { ...A.p, aN: [A.p.aN[0], A.p.aN[1] + scroll] };
  const FA = placeFig(pa, A.f, A.x, A.s);
  drawFig(FA, {
    front: () => {
      if (A.p.brick) { const h = FA.aN[1]; brick(h[0] - BW / 2 + 10, h[1] - BH / 2, BW, BH, 0.5, false); }
      phone(FA.aN[1][0], FA.aN[1][1], A.p.phone, t);
    },
  });
  // rechts
  const B = macher(t);
  if (B.x < 1300) {
    const FB = placeFig(B.p, B.f, B.x, B.s);
    drawFig(FB, { front: () => { if (B.p.brick) { const h = FB.aN[1]; brick(h[0] - SW / 2 + 8, h[1] - SH / 2, SW, SH, 0.5, false); } } });
  }
  dust(t);
  label(LABEL_A);
  label(LABEL_B);
}

const OFF = 55;     // vertikale Verschiebung: Inhalt mittig
function drawFrame(t) {
  renderScene(t);
  const sp = ctx.createRadialGradient(W / 2, GY, 20, W / 2, GY, 620);
  sp.addColorStop(0, "rgba(70,70,70,0.55)"); sp.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sp; ctx.fillRect(0, GY - 400, W, 800);
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
  const ln = ctx.createLinearGradient(0, 0, W, 0);
  ln.addColorStop(0, "rgba(255,255,255,0)"); ln.addColorStop(0.5, "rgba(255,255,255,0.12)"); ln.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = ln; ctx.fillRect(0, GY, W, 2);
}
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(0, OFF);
  drawFrame(t);
  ctx.restore();
  const fo = ramp(t, FADE[0], FADE[1]);
  if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  const flips = [];
  for (let d = 1; d * DAY < window.DURATION; d++) flips.push({ t: +(d * DAY).toFixed(3), mon: DAYS[d % 7] === "MO" });
  return {
    duration: window.DURATION, fade: FADE, flips,
    stair: STAIR.map(b => +b.t.toFixed(3)), aBricks: A_BRICKS.map(b => b.t),
    steps: Array.from({ length: STEPS }, (_, k) => +(k * DAY + 0.8).toFixed(3)),
    aSit: [1.25, 9.5], aStand: [8.3], aLook: [8.05, 10.5], phone: [[1.55, 8.05], [9.8, 30]],
    glow: GLOW, turn: [GLOW + 1.0, GLOW + 1.85], jump: JUMP, land: LAND,
  };
};
window.setup = async function () {
  await document.fonts.load("900 30px InterBlk");
  buildStairs();
  return true;
};
