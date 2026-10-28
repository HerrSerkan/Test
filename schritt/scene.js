// "Jemand muss den ersten Schritt machen." – deutsche Version (1080x1920)
"use strict";
const W = 1080, H = 1920, DUR = 15.2;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const TOP_GY = 691, BOT_GY = 1321;
const CREAM = "#efeae1", BACK = "#8f8b84";
const RED = "#e2443b";

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ------------------------------------------------------------ Zeitplan
// Tageszähler oben (wie im Original: ungleichmäßig schneller werdend)
const TOP_DAYS = [[0, 1], [0.7, 1], [1.0, 2], [1.5, 3], [2.0, 4], [3.0, 5], [3.5, 6], [4.0, 7], [4.5, 8], [5.0, 9], [5.5, 10],
  [6.0, 11], [6.5, 12], [7.0, 13], [7.4, 15], [8.0, 16], [8.4, 18], [9.0, 19], [9.4, 21], [10.0, 22], [10.4, 24], [10.9, 26],
  [11.4, 29], [11.9, 30]];
function topDay(t) {
  let d = 1;
  for (const [tt, v] of TOP_DAYS) if (t >= tt) d = v;
  return d;
}
const topProgress = t => easeIO(ramp(t, 0.3, 12.0));  // Lücke wird größer
const botDay = t => (t < 1.0 ? 1 : t < 1.5 ? 2 : 3);
const T_WALK0 = 2.5, T_WALK1 = 5.2, T_REACH = 5.3, T_APPROACH0 = 7.0, T_APPROACH1 = 8.6, T_HUG = 9.0, T_TYPE = 12.4;

// ------------------------------------------------------------ Hilfen
function setFont(size, weight = 700, spacing = 0) {
  ctx.font = `${weight} ${size}px Pix`;
  ctx.letterSpacing = `${spacing}px`;
}
function textC(s, x, y, size, spacing, color, weight = 700, glow = 10) {
  setFont(size, weight, spacing);
  const w = ctx.measureText(s).width - spacing;  // letzter Abstand zählt nicht
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = glow;
  ctx.fillText(s, x - w / 2, y);
  ctx.shadowBlur = 0;
  ctx.letterSpacing = "0px";
  return w;
}

// ------------------------------------------------------------ Plattformen
const JAG = (() => { const r = rng(4); return Array.from({ length: 14 }, () => r()); })();
function platform(x0, x1, gy, side) {
  // side: "right" = Kante rechts (linke Plattform), "left" = Kante links
  const depth = 150;
  const g = ctx.createLinearGradient(0, gy, 0, gy + depth);
  g.addColorStop(0, "#2b2b31");
  g.addColorStop(0.35, "#141418");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  if (side === "right") {
    ctx.moveTo(x0, gy);
    ctx.lineTo(x1, gy);
    for (let i = 0; i < JAG.length; i++) {
      const y = gy + (i + 1) * (depth / JAG.length);
      ctx.lineTo(x1 - 2 + (JAG[i] - 0.5) * 12 - i * 0.6, y);
    }
    ctx.lineTo(x0, gy + depth);
  } else {
    ctx.moveTo(x1, gy);
    ctx.lineTo(x0, gy);
    for (let i = 0; i < JAG.length; i++) {
      const y = gy + (i + 1) * (depth / JAG.length);
      ctx.lineTo(x0 + 2 + (JAG[(i + 5) % JAG.length] - 0.5) * 12 + i * 0.6, y);
    }
    ctx.lineTo(x1, gy + depth);
  }
  ctx.closePath();
  ctx.fill();
  // helle Oberkante
  ctx.strokeStyle = "#dcd9d2";
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(x0, gy + 1); ctx.lineTo(x1, gy + 1); ctx.stroke();
  ctx.shadowBlur = 0;
}

// ------------------------------------------------------------ Figur
// Gelenke relativ zum Fußpunkt, für Blickrichtung rechts (dir = 1). Werte werden bei dir = -1 gespiegelt.
function poseStand(t, ph) {
  const b = Math.sin(t * 2.2 + ph) * 1.5;
  return {
    hip: [0, -98], neck: [4, -166 + b], head: [7, -189 + b],
    legF: [[-5, -50], [6, 0]], legB: [[2, -50], [-8, 0]],
    armF: [[-6, -128 + b], [18, -132 + b]], armB: [[8, -124 + b], [24, -130 + b]],
  };
}
function poseWalk(t, ph) {
  const s = Math.sin(t * 9 + ph), c = Math.cos(t * 9 + ph);
  const lift = Math.max(0, c) * 8;
  return {
    hip: [0, -98 + Math.abs(s) * 2], neck: [8, -165], head: [12, -188],
    legF: [[s * 14 + 6, -50 - lift * 0.5], [s * 24, -lift]], legB: [[-s * 14 + 6, -50], [-s * 24, -Math.max(0, -c) * 8]],
    armF: [[-s * 14, -125], [-s * 20 + 6, -102]], armB: [[s * 14, -125], [s * 20 + 6, -102]],
  };
}
function poseReach(k, t, ph) {
  const p = poseStand(t, ph);
  p.armF = [[lerp(-6, 30, k), lerp(-128, -146, k)], [lerp(18, 64, k), lerp(-132, -142, k)]];
  return p;
}
function poseHug(k, t, reachX) {
  // nach vorne gebeugt, beide Hände treffen sich bei reachX (relativ, in Blickrichtung)
  const p = poseStand(t, 0);
  const lean = lerp(0, 1, k);
  p.neck = [lerp(4, 10, lean), lerp(-166, -163, lean)];
  p.head = [lerp(7, 11, lean), lerp(-189, -186, lean)];
  p.hip = [lerp(0, -4, lean), lerp(-98, -96, lean)];
  p.legF = [[lerp(-5, 4, lean), -48], [lerp(6, 10, lean), 0]];
  p.legB = [[lerp(2, -12, lean), -48], [lerp(-8, -26, lean), 0]];
  const hx = lerp(18, reachX, k), hy = lerp(-132, -118, k);
  p.armF = [[lerp(-6, reachX * 0.45 + 6, k), lerp(-128, -112, k)], [hx, hy]];
  p.armB = [[lerp(8, reachX * 0.5 + 10, k), lerp(-124, -110, k)], [hx - 2, hy - 8]];
  return p;
}

function drawFigure(x, gy, dir, p) {
  const P = q => [x + q[0] * dir, gy + q[1]];
  const limb = (from, pts, col, w) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(...P(from)); for (const q of pts) ctx.lineTo(...P(q)); ctx.stroke();
  };
  ctx.shadowColor = "rgba(255,245,230,0.75)";
  ctx.shadowBlur = 16;
  const sh = [p.neck[0], p.neck[1] + 10];
  limb(p.hip, p.legB, BACK, 12);
  limb(sh, p.armB, BACK, 11);
  limb(p.hip, p.legF, CREAM, 13);
  limb(p.neck, [p.hip], CREAM, 13);
  limb(sh, p.armF, CREAM, 11);
  ctx.fillStyle = CREAM;
  const hd = P(p.head);
  ctx.beginPath(); ctx.arc(hd[0], hd[1], 21, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
}

// ------------------------------------------------------------ Staub
const DUST = (() => { const r = rng(9); return Array.from({ length: 40 }, () => ({ x: r() * W, y: r() * H, s: r() * 1.6 + 0.5, v: r() * 6 + 2, ph: r() * 6 })); })();

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W / 2, 760, 0, W / 2, 760, 900);
  bg.addColorStop(0, "rgba(28,28,34,0.55)");
  bg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (const d of DUST) {
    const y = (d.y - t * d.v + H) % H;
    ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.1 * Math.sin(t * 2 + d.ph)})`;
    ctx.beginPath(); ctx.arc(d.x + Math.sin(t * 0.7 + d.ph) * 6, y, d.s, 0, Math.PI * 2); ctx.fill();
  }

  // Titel
  textC("JEMAND MUSS DEN", W / 2, 226, 37, 11, "#f2f0ea");
  textC("ERSTEN SCHRITT MACHEN.", W / 2, 290, 37, 11, "#f2f0ea");

  // ---------------- oben: wartet
  const tp = topProgress(t);
  const eL = lerp(450, 255, tp), eR = lerp(590, 795, tp);
  dayCounter(81, 385, topDay(t), "#f2f0ea");
  platform(-10, eL, TOP_GY, "right");
  platform(eR, W + 10, TOP_GY, "left");
  drawFigure(eL - 106, TOP_GY, 1, poseStand(t, 0));
  drawFigure(eR + 104, TOP_GY, -1, poseStand(t, 1.3));
  textC("WARTET AUF EINE ENTSCHULDIGUNG", W / 2, 826, 23, 6, "#d8d6d0", 400, 4);

  // Trennlinie
  ctx.fillStyle = "#1d1d21";
  ctx.fillRect(40, 914, W - 80, 2);

  // ---------------- unten: macht den ersten Schritt
  const close = easeIO(ramp(t, 6.6, 8.6));
  const bL = lerp(450, 486, close), bR = lerp(590, 554, close);
  const red = t >= T_HUG;
  dayCounter(81, 1015, botDay(t), red ? RED : "#f2f0ea");
  // rotes Leuchten beim Treffen
  if (t > T_HUG - 0.3) {
    const k = ramp(t, T_HUG - 0.3, T_HUG + 0.2);
    const beat = 0.75 + 0.25 * Math.pow(Math.abs(Math.sin((t - T_HUG) * Math.PI * 1.1)), 4);
    const g = ctx.createRadialGradient(520, BOT_GY - 128, 0, 520, BOT_GY - 128, 95);
    g.addColorStop(0, `rgba(210,45,40,${0.5 * k * beat})`);
    g.addColorStop(0.45, `rgba(120,20,20,${0.2 * k * beat})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(320, BOT_GY - 300, 400, 330);
  }
  platform(-10, bL, BOT_GY, "right");
  platform(bR, W + 10, BOT_GY, "left");

  // linke Figur: läuft zur Kante, streckt die Hand aus, umarmt
  let lx, lp;
  if (t < T_WALK0) { lx = 344; lp = poseStand(t, 0); }
  else if (t < T_WALK1) { const u = ramp(t, T_WALK0, T_WALK1); lx = lerp(344, 432, u); lp = poseWalk(t, 0); }
  else if (t < T_APPROACH0 + 0.5) { lx = 432; lp = poseReach(easeOut(ramp(t, T_REACH, T_REACH + 0.8)), t, 0); }
  else if (t < T_APPROACH1) { const u = easeIO(ramp(t, T_APPROACH0 + 0.5, T_APPROACH1)); lx = lerp(432, 462, u); lp = poseHug(u * 0.6, t, 70); }
  else { lx = 462; lp = poseHug(lerp(0.6, 1, easeOut(ramp(t, T_APPROACH1, T_HUG))), t, 58); }
  // rechte Figur: wartet, kommt dann entgegen
  let rx, rp;
  if (t < T_APPROACH0) { rx = 694; rp = poseStand(t, 1.3); }
  else if (t < T_APPROACH1) { const u = ramp(t, T_APPROACH0, T_APPROACH1); rx = lerp(694, 578, easeIO(u)); rp = u < 0.85 ? poseWalk(t, 1) : poseHug(ramp(u, 0.85, 1) * 0.6, t, 58); }
  else { rx = 578; rp = poseHug(lerp(0.6, 1, easeOut(ramp(t, T_APPROACH1, T_HUG))), t, 58); }
  drawFigure(rx, BOT_GY, -1, rp);
  drawFigure(lx, BOT_GY, 1, lp);
  textC("MACHT DEN ERSTEN SCHRITT", W / 2, 1456, 23, 6, "#d8d6d0", 400, 4);

  // Schluss: "SEI DU ES." wird getippt
  if (t >= T_TYPE) {
    const full = "SEI DU ES.";
    const n = Math.min(full.length, Math.floor((t - T_TYPE) / 0.075) + 1);
    setFont(34, 700, 16);
    const wFull = ctx.measureText(full).width - 16;
    const x0 = W / 2 - wFull / 2;
    ctx.fillStyle = "#f2f0ea";
    ctx.shadowColor = "rgba(255,255,255,0.4)"; ctx.shadowBlur = 10;
    const s = full.slice(0, n);
    ctx.fillText(s, x0, 1552);
    ctx.shadowBlur = 0;
    const w = n ? ctx.measureText(s).width : 0;
    const typing = n < full.length;
    if (typing || Math.floor((t - T_TYPE) * 2.2) % 2 === 0) {
      ctx.fillStyle = RED;
      ctx.fillRect(x0 + w + 2, 1552 - 30, 15, 32);
    }
    ctx.letterSpacing = "0px";
  }

  // Ein-/Ausblenden
  const fade = Math.max(1 - ramp(t, 0, 0.25), ramp(t, DUR - 0.5, DUR));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

function dayCounter(x, y, d, col) {
  setFont(21, 400, 5);
  ctx.fillStyle = "#bdbab3";
  ctx.fillText("TAG", x, y);
  const w = ctx.measureText("TAG").width;
  setFont(38, 700, 4);
  ctx.fillStyle = col;
  ctx.shadowColor = col === RED ? "rgba(230,60,50,0.6)" : "rgba(255,255,255,0.35)";
  ctx.shadowBlur = 10;
  ctx.fillText(String(d).padStart(2, "0"), x + w + 14, y);
  ctx.shadowBlur = 0;
  ctx.letterSpacing = "0px";
}

window.exportEvents = function () {
  const ticks = [];
  let prev = 1;
  for (let i = 0; i < DUR * 30; i++) { const t = i / 30; const d = topDay(t); if (d !== prev) { ticks.push(t); prev = d; } }
  return { duration: DUR, dayTicks: ticks, botTicks: [1.0, 1.5], walk: [T_WALK0, T_WALK1], approach: [T_APPROACH0, T_APPROACH1],
    reach: T_REACH, hug: T_HUG, type: T_TYPE, typeChars: "SEI DU ES.".length, typeStep: 0.075 };
};

window.setup = async function () {
  await Promise.all([document.fonts.load("700 40px Pix"), document.fonts.load("400 20px Pix")]);
  return { duration: DUR };
};
