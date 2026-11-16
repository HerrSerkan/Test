// "Wartet auf Klarheit vs. geht einfach los" – Canvas-Animation (eigene Zeichnung), ohne Sprecher.
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const TOP = [260, 760], BOT = [790, 1290];     // Panels (Bildschirm-y)
const FULL = [260, 1290];
const T_EXP = 7.35, T_BACK = 10.6, T_END = 13.5;
const SLOGAN_Y = 1370, TEXT_CX = 500;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let TL = null;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;

function glowAt(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

function line(pts, w) {
  ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
}

// Figur: Füße auf (x, fy). o = {col, look, mouth(-1..1), walk(phase), moving(0..1), arms: 'down'|'watch'|'shrug'|'up', slump, sit}
function figure(x, fy, o) {
  const S = 1.32;
  ctx.save(); ctx.translate(x, fy); ctx.scale(S, S); ctx.translate(-x, -fy);
  const r = figureRaw(x, fy, o);
  ctx.restore();
  return { head: [x + (r.head[0] - x) * S, fy + (r.head[1] - fy) * S] };
}
function figureRaw(x, fy, o) {
  const s = 1.0;
  const sit = o.sit || 0, slump = o.slump || 0;
  const hip = [x, fy - 92 * s + sit * 52];
  const neck = [x + slump * 6, hip[1] - 96 * s + slump * 10];
  const head = [neck[0] + slump * 8, neck[1] - 42 * s + slump * 6];
  ctx.strokeStyle = o.col; ctx.fillStyle = o.col;
  // Beine
  const ph = o.walk || 0, mv = o.moving || 0;
  const sw = Math.sin(ph) * 30 * mv;
  if (sit > 0.5) {
    line([hip, [x + 52, hip[1] + 6], [x + 70, fy]], 17);
    line([hip, [x + 40, hip[1] + 12], [x + 54, fy]], 17);
  } else {
    line([hip, [x + sw * 0.6, hip[1] + 46], [x + sw, fy - Math.max(0, Math.cos(ph)) * 10 * mv]], 17);
    line([hip, [x - sw * 0.6, hip[1] + 46], [x - sw, fy - Math.max(0, -Math.cos(ph)) * 10 * mv]], 17);
  }
  line([hip, neck], 19);
  // Arme
  const a = o.arms || "down", k = o.armK === undefined ? 1 : o.armK;
  const sh = [neck[0], neck[1] + 8];
  const base = { lE: [-22, 46], lH: [-28 - sw * 0.4, 92], rE: [22, 46], rH: [28 + sw * 0.4, 92] };
  const poses = {
    down: base,
    watch: { lE: [-22, 46], lH: [-28, 92], rE: [30, 34], rH: [-4, 20] },
    shrug: { lE: [-44, 26], lH: [-78, 6], rE: [44, 26], rH: [78, 6] },
    up: { lE: [-38, -26], lH: [-58, -76], rE: [38, -26], rH: [58, -76] },
  };
  const P = poses[a];
  const pt = key => [sh[0] + lerp(base[key][0], P[key][0], k), sh[1] + lerp(base[key][1], P[key][1], k)];
  line([sh, pt("lE"), pt("lH")], 15);
  line([sh, pt("rE"), pt("rH")], 15);
  // Kopf + Gesicht
  ctx.beginPath(); ctx.arc(head[0], head[1], 36, 0, 7); ctx.fill();
  const lk = (o.look || 0) * 9;
  ctx.fillStyle = o.face || "#1b1f2a";
  for (const dx of [-12, 12]) { ctx.beginPath(); ctx.arc(head[0] + dx + lk, head[1] - 4 + slump * 3, 4.5, 0, 7); ctx.fill(); }
  ctx.strokeStyle = o.face || "#1b1f2a"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
  const m = o.mouth || 0;
  ctx.beginPath();
  ctx.moveTo(head[0] - 10 + lk, head[1] + 14 - m * 2);
  ctx.quadraticCurveTo(head[0] + lk, head[1] + 14 + m * 7, head[0] + 10 + lk, head[1] + 14 - m * 2);
  ctx.stroke();
  // Uhr am Handgelenk beim Draufschauen
  if (a === "watch" && k > 0.5) {
    const h = pt("rH");
    ctx.fillStyle = "#9aa3b8"; ctx.beginPath(); ctx.arc(h[0], h[1], 7, 0, 7); ctx.fill();
  }
  return { head };
}

function label(txt, y, a, col) {
  ctx.globalAlpha = a;
  ctx.font = "700 27px InterSB"; ctx.letterSpacing = "7px";
  const w = ctx.measureText(txt).width - 7;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath(); ctx.roundRect(TEXT_CX - w / 2 - 22, y - 32, w + 44, 46, 23); ctx.fill();
  ctx.fillStyle = col;
  ctx.fillText(txt, TEXT_CX - w / 2, y);
  ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ oberes Panel: wartet
function waitingPanel(t, y0, y1) {
  const h = y1 - y0;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "#0d1018"); g.addColorStop(1, "#141925");
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, h);
  const fy = y1 - 70;
  // Boden
  ctx.fillStyle = "#0a0c12"; ctx.fillRect(0, fy, W, y1 - fy);
  ctx.strokeStyle = "rgba(160,170,200,0.12)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke();
  // ausgeschaltete Lampen
  for (let i = 0; i < 7; i++) {
    const lx = 150 + i * 110;
    ctx.fillStyle = "#232836"; ctx.fillRect(lx - 16, y0, 32, 14);
    ctx.beginPath(); ctx.arc(lx, y0 + 16, 9, 0, Math.PI); ctx.fill();
  }
  // Wanduhr
  const cx = 840, cy = y0 + 150;
  ctx.strokeStyle = "#3a4152"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, 38, 0, 7); ctx.stroke();
  const sec = Math.floor(t * 2) / 2;
  ctx.strokeStyle = "#596176"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(sec * 1.2) * 30, cy - Math.cos(sec * 1.2) * 30); ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 14, cy - 16); ctx.stroke();

  // Figur wartet: schaut links/rechts, Uhr, Schulterzucken, setzt sich
  const look = t < 1 ? 0 : t < 2.1 ? -easeIO(ramp(t, 1, 1.3)) : t < 3.1 ? lerp(-1, 1, easeIO(ramp(t, 2.1, 2.4))) : 1 - easeIO(ramp(t, 3.1, 3.4));
  let arms = "down", armK = 0;
  if (t > 3.3 && t < 4.7) { arms = "watch"; armK = easeIO(ramp(t, 3.3, 3.6)) * (1 - easeIO(ramp(t, 4.4, 4.7))); }
  if (t > 4.8 && t < 6.2) { arms = "shrug"; armK = easeIO(ramp(t, 4.8, 5.1)) * (1 - easeIO(ramp(t, 5.9, 6.2))); }
  const sit = easeIO(ramp(t, 9.6, 10.2));
  const slump = Math.max(easeIO(ramp(t, 6.3, 7.0)), sit) * 0.9;
  const P = figure(540, fy, { col: "#596078", face: "#232838", look, arms, armK, slump, sit, mouth: t > 4.8 ? -0.8 : -0.3 });
  // Fragezeichen
  const q = Math.sin(Math.PI * ramp(t, 1.4, 3.2));
  if (q > 0) {
    ctx.globalAlpha = q; ctx.fillStyle = "#7c86a3";
    ctx.font = "900 46px InterBlk"; ctx.fillText("?", P.head[0] + 40, P.head[1] - 34 - q * 8);
    ctx.globalAlpha = 1;
  }
  // "..." beim Warten später
  const d = ramp(t, 7.0, 7.3);
  if (d > 0 && t < 10.4) {
    ctx.fillStyle = "#4b5266";
    for (let i = 0; i < 3; i++) {
      const on = (Math.floor(t * 3) % 4) > i;
      if (on) { ctx.beginPath(); ctx.arc(P.head[0] + 46 + i * 16, P.head[1] - 44, 5, 0, 7); ctx.fill(); }
    }
  }
  label("WARTET AUF KLARHEIT", y0 + 70, 1, "rgba(150,160,190,0.75)");
}

// ------------------------------------------------------------------ unteres Panel: geht los
const STEPS = [0.45, 1.4, 2.35, 3.3, 4.25, 5.2, 6.15];     // Start jedes Schritts
const STEP_DUR = 0.55, STEP_W = 110, X0 = 150;
function walkerX(t) {
  let x = X0, moving = 0;
  for (const s of STEPS) {
    if (t >= s + STEP_DUR) x += STEP_W;
    else if (t > s) { x += STEP_W * easeIO(ramp(t, s, s + STEP_DUR)); moving = 1; }
  }
  // weiterlaufen am Ende
  if (t > T_BACK + 0.6) { const p = t - (T_BACK + 0.6); x += p * 190; moving = 1; }
  return { x, moving };
}

function lampOn(i, t) {
  if (i === 0) return 0.25;                               // Startlicht
  if (i <= STEPS.length) return STEPS[i - 1] + STEP_DUR * 0.7;
  if (t < T_BACK) return T_EXP + 0.25 + (i - STEPS.length) * 0.07;   // Kaskade beim Aufziehen
  return T_EXP + 0.25 + (i - STEPS.length) * 0.07;
}

function movingPanel(t, y0, y1, pan) {
  const h = y1 - y0;
  ctx.fillStyle = "#0a0b10"; ctx.fillRect(0, y0, W, h);
  const fy = y1 - 70;
  const { x: wx, moving } = walkerX(t);
  const nL = 16;
  // Lichtkegel
  for (let i = -2; i < nL; i++) {
    const lx = X0 + i * STEP_W - pan;
    if (lx < -150 || lx > W + 150) continue;
    const on = i < 0 ? T_EXP + 0.4 + (-i) * 0.07 : lampOn(i, t);
    const k = easeOut(ramp(t, on, on + 0.18));
    const flick = k > 0 && t < on + 0.35 ? 0.75 + 0.25 * Math.sin((t - on) * 90) : 1;
    ctx.fillStyle = "#2b2a2a"; ctx.fillRect(lx - 16, y0, 32, 14);
    ctx.fillStyle = k > 0 ? `rgba(255,230,180,${0.4 + 0.6 * k})` : "#2b2a2a";
    ctx.beginPath(); ctx.arc(lx, y0 + 16, 9, 0, Math.PI); ctx.fill();
    if (k <= 0) continue;
    const a = k * flick;
    const g = ctx.createLinearGradient(0, y0 + 16, 0, fy);
    g.addColorStop(0, `rgba(255,222,165,${0.42 * a})`);
    g.addColorStop(1, `rgba(255,222,165,${0.07 * a})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(lx - 10, y0 + 18); ctx.lineTo(lx + 10, y0 + 18);
    ctx.lineTo(lx + 62, fy); ctx.lineTo(lx - 62, fy); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(lx, fy); ctx.scale(1, 0.18);
    glowAt(0, 0, 90, "255,215,150", 0.5 * a); ctx.restore();
  }
  // Boden
  ctx.strokeStyle = "rgba(255,220,170,0.22)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke();
  const fg = ctx.createLinearGradient(0, fy, 0, y1);
  fg.addColorStop(0, "rgba(255,210,150,0.06)"); fg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = fg; ctx.fillRect(0, fy, W, y1 - fy);

  // Figur
  const x = wx - pan;
  const joy = easeIO(ramp(t, T_EXP + 0.5, T_EXP + 0.8)) * (1 - easeIO(ramp(t, T_EXP + 1.6, T_EXP + 1.9)));
  const conf = ramp(t, 0.5, 6.5);
  figure(x, fy, {
    col: "#f4ead6", face: "#2a2218", walk: t * 11.4, moving,
    arms: joy > 0 ? "up" : "down", armK: joy, mouth: lerp(0.2, 1, conf), look: 0.4,
  });
  label("GEHT EINFACH LOS", y0 + 70, 1 - ramp(t, T_EXP, T_EXP + 0.3) + ramp(t, T_BACK + 0.2, T_BACK + 0.5), "rgba(255,230,190,0.85)");
}

// ------------------------------------------------------------------ Slogan unter der Szene
const SLOGAN = [
  { words: ["ERST", "DER", "SCHRITT."], t0: T_EXP + 0.45, font: "900 92px InterBlk", y: SLOGAN_Y, gold: [] },
  { words: ["DANN", "KOMMT", "DAS", "LICHT."], t0: T_EXP + 1.25, font: "700 58px InterSB", y: SLOGAN_Y + 82, gold: [3] },
];
function slogan(t) {
  const out = ramp(t, T_BACK - 0.25, T_BACK + 0.05);
  if (out >= 1) return;
  for (const L of SLOGAN) {
    ctx.font = L.font; ctx.letterSpacing = "1px";
    const sp = ctx.measureText(" ").width;
    const ws = L.words.map(w => ctx.measureText(w).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = TEXT_CX - total / 2;
    L.words.forEach((w, i) => {
      const p = ramp(t, L.t0 + i * 0.16, L.t0 + i * 0.16 + 0.3);
      if (p > 0) {
        ctx.globalAlpha = easeOut(p) * (1 - out);
        ctx.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : "none";
        const gold = L.gold.includes(i);
        ctx.fillStyle = gold ? "#ffd27a" : "#ffffff";
        ctx.shadowColor = gold ? "rgba(255,200,110,0.8)" : "rgba(255,255,255,0.35)";
        ctx.shadowBlur = gold ? 34 : 18;
        ctx.fillText(w, x, L.y + (1 - easeOut(p)) * 16);
        ctx.filter = "none"; ctx.shadowBlur = 0;
      }
      x += ws[i] + sp;
    });
  }
  ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);

  // Aufteilung: k = 0 geteilt, 1 = unten groß
  const k = easeIO(ramp(t, T_EXP, T_EXP + 0.5)) * (1 - easeIO(ramp(t, T_BACK, T_BACK + 0.5)));
  const topY1 = lerp(TOP[1], TOP[0], k);
  const botY0 = lerp(BOT[0], FULL[0], k);
  const pan = 310 * easeIO(ramp(t, T_EXP, T_EXP + 1.2));

  if (topY1 - TOP[0] > 2) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, TOP[0], W, topY1 - TOP[0]); ctx.clip();
    waitingPanel(t, TOP[0] - (TOP[1] - topY1), topY1);
    ctx.restore();
  }
  ctx.save(); ctx.beginPath(); ctx.rect(0, botY0, W, BOT[1] - botY0); ctx.clip();
  movingPanel(t, botY0, BOT[1], pan);
  ctx.restore();
  // Trennfuge
  if (k < 0.99) { ctx.fillStyle = "#000"; ctx.fillRect(0, topY1, W, botY0 - topY1); }
  // Kanten weich
  let g = ctx.createLinearGradient(0, TOP[0] - 30, 0, TOP[0] + 40);
  g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, TOP[0] - 30, W, 70);
  g = ctx.createLinearGradient(0, BOT[1] - 50, 0, BOT[1] + 10);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "#000");
  ctx.fillStyle = g; ctx.fillRect(0, BOT[1] - 50, W, 60);

  slogan(t);

  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, T_END - 0.9, T_END - 0.1));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  const lamps = [];
  for (let i = 0; i <= STEPS.length; i++) lamps.push(lampOn(i, 0));
  return { steps: STEPS, stepDur: STEP_DUR, lamps, expand: T_EXP, back: T_BACK, slogan: [SLOGAN[0].t0, SLOGAN[1].t0 + 0.48],
           watch: 3.3, shrug: 4.8, sit: 9.6, walkOn: T_BACK + 0.6, end: T_END };
};

window.setup = async function (timeline) {
  TL = timeline;
  await Promise.all([document.fonts.load("700 50px InterSB"), document.fonts.load("900 50px InterBlk")]);
  return true;
};
