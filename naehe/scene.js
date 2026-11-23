// "Wenn ängstlich vermeidend liebt" – Canvas-Animation ohne Worte (deutsche Version nach @nobodytoldme_1).
// Zwei Figuren laufen durch ein Museum: "Ängstlich" sucht Nähe, "Vermeidend" weicht aus. Pointe: Nähe-Distanz-Falle.
"use strict";

const W = 1080, H = 1920;
window.DURATION = 11.5;
const FLOOR_Y = 1120, FEET = 1215, LABEL_Y = 1258;
const TITLE_X = 520, TITLE_Y = 1345;
const SWITCH = 7.5;
const SPEED = 140;               // Galerie scrollt (Figuren laufen nach rechts)

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function keys(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ------------------------------------------------------------------ Ablauf
// [t, x, Neigung(Grad), Arm rechts (Grad, 0 = unten, 90 = zur Seite), Arm links]
const A_K = [[0, 380, 0, 8, 8], [1.9, 380, 0, 8, 8], [2.4, 412, 6, 8, 8], [2.9, 418, 7, 8, 8], [3.25, 425, 9, 82, 8], [3.7, 425, 9, 82, 8],
  [3.95, 420, 6, 10, 8], [4.15, 438, 11, 128, 128], [4.85, 440, 11, 128, 128], [5.1, 415, 2, 10, 10], [6.9, 405, 0, 8, 8],
  [8.0, 412, 6, 8, 8], [8.9, 425, 9, 70, 8], [9.3, 425, 9, 70, 8], [9.6, 412, 4, 10, 8], [10.8, 380, 0, 8, 8], [11.5, 380, 0, 8, 8]];
const B_K = [[0, 640, 0, 8, 8], [2.9, 640, 0, 8, 8], [3.3, 668, -8, 8, -30], [3.9, 670, -8, 8, -30], [4.15, 694, -15, 8, 60], [4.85, 694, -15, 8, 60],
  [5.1, 672, -2, -24, -24], [6.9, 662, 0, -24, -24], [7.1, 650, 0, 8, 8], [8.9, 650, 0, 8, 8], [9.25, 676, -9, 8, -25], [9.7, 676, -9, 8, -25],
  [10.3, 650, 0, 8, 8], [11.5, 640, 0, 8, 8]];
const A_FACE = [[0, "smile"], [1.1, "happy"], [2.2, "hope"], [4.1, "love"], [4.95, "worried"], [6.0, "annoyed"], [6.85, "happy"], [7.9, "hope"], [9.8, "happy"], [10.9, "smile"]];
const B_FACE = [[0, "neutral"], [2.1, "side"], [4.1, "shock"], [4.95, "whistle"], [7.0, "neutral"], [8.3, "side"], [10.2, "neutral"]];
const HEARTS = [[1.2, "a"], [4.25, "a"], [4.45, "a"], [7.0, "a"], [9.9, "a"]];
const QUESTION = 5.1;
const NOTES = [5.15, 5.6, 6.05, 6.5];

// ------------------------------------------------------------------ Museum
function drawWall(scroll) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
  g.addColorStop(0, "#3b0f1c"); g.addColorStop(0.35, "#5f1c2f"); g.addColorStop(1, "#742a3c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR_Y);
  // Stoffbahnen (laufen mit)
  const off = scroll % 90;
  for (let x = -off - 90; x < W + 90; x += 90) {
    const gr = ctx.createLinearGradient(x, 0, x + 90, 0);
    gr.addColorStop(0, "rgba(0,0,0,0.12)"); gr.addColorStop(0.5, "rgba(255,255,255,0.03)"); gr.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = gr; ctx.fillRect(x, 0, 90, FLOOR_Y);
  }
  // Leiste und Sockel
  ctx.fillStyle = "#2a0b14"; ctx.fillRect(0, FLOOR_Y - 26, W, 26);
  ctx.fillStyle = "rgba(255,210,150,0.12)"; ctx.fillRect(0, FLOOR_Y - 26, W, 3);
}
const ART = [{ k: "dots", x: 0, w: 150, h: 210 }, { k: "rothko", x: 250, w: 250, h: 175 }, { k: "portrait", x: 560, w: 150, h: 200 }];
const PERIOD = 800, ART_Y = 600;
function drawArt(scroll) {
  for (let base = -PERIOD; base < W + PERIOD; base += PERIOD) {
    for (const a of ART) {
      const x = base + a.x - (scroll % PERIOD) + 60;
      if (x > W + 50 || x + a.w < -50) continue;
      const cx = x + a.w / 2;
      // Spot von oben
      const sp = ctx.createRadialGradient(cx, ART_Y - 160, 10, cx, ART_Y - 40, 260);
      sp.addColorStop(0, "rgba(255,225,170,0.22)"); sp.addColorStop(1, "rgba(255,225,170,0)");
      ctx.fillStyle = sp; ctx.fillRect(cx - 270, ART_Y - 420, 540, 560);
      ctx.fillStyle = "#1c1c1c"; ctx.fillRect(cx - 10, 230, 20, 26);
      ctx.fillStyle = "#f6e7b8"; ctx.beginPath(); ctx.arc(cx, 262, 9, 0, 7); ctx.fill();
      const y = ART_Y - a.h / 2;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
      if (a.k === "dots") {
        ctx.fillStyle = "#c9a35a"; ctx.fillRect(x - 8, y - 8, a.w + 16, a.h + 16);
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#f2e6cf"; ctx.fillRect(x, y, a.w, a.h);
        ctx.fillStyle = "#d8463b"; ctx.beginPath(); ctx.arc(x + 42, y + 52, 15, 0, 7); ctx.fill();
        ctx.fillStyle = "#2d58a8"; ctx.beginPath(); ctx.arc(x + a.w - 38, y + a.h - 44, 18, 0, 7); ctx.fill();
      } else if (a.k === "rothko") {
        ctx.fillStyle = "#1b1b1b"; ctx.fillRect(x - 10, y - 10, a.w + 20, a.h + 20);
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#e9e0cc"; ctx.fillRect(x, y, a.w, a.h);
        ctx.fillStyle = "#8f2a2a"; ctx.fillRect(x + 10, y + 10, a.w - 20, a.h - 20);
        ctx.fillStyle = "#e9853a"; ctx.fillRect(x + 22, y + 22, a.w - 44, (a.h - 44) * 0.48);
        ctx.fillStyle = "#2c4a8f"; ctx.fillRect(x + 22, y + 22 + (a.h - 44) * 0.55, a.w - 44, (a.h - 44) * 0.45);
      } else {
        ctx.fillStyle = "#c79a3b"; ctx.beginPath(); ctx.ellipse(cx, ART_Y, a.w / 2 + 12, a.h / 2 + 12, 0, 0, 7); ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#2d1e14"; ctx.beginPath(); ctx.ellipse(cx, ART_Y, a.w / 2, a.h / 2, 0, 0, 7); ctx.fill();
        // bärtiger Herr mit Halskrause
        ctx.fillStyle = "#efe6d6"; ctx.beginPath();
        for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2, r = i % 2 ? 34 : 42; ctx.lineTo(cx + Math.cos(an) * r, ART_Y + 40 + Math.sin(an) * r * 0.5); }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#e8d9c0"; ctx.beginPath(); ctx.arc(cx, ART_Y - 18, 30, 0, 7); ctx.fill();
        ctx.fillStyle = "#f4f0e8"; ctx.beginPath(); ctx.moveTo(cx - 24, ART_Y - 8); ctx.quadraticCurveTo(cx, ART_Y + 40, cx + 24, ART_Y - 8); ctx.fill();
        ctx.fillStyle = "#2b2b2b"; ctx.fillRect(cx - 12, ART_Y - 24, 5, 5); ctx.fillRect(cx + 7, ART_Y - 24, 5, 5);
      }
      ctx.restore();
      ctx.fillStyle = "#c9a35a"; ctx.fillRect(cx - 26, ART_Y + a.h / 2 + 34, 52, 13);
    }
  }
}
function drawFloor(scroll) {
  const g = ctx.createLinearGradient(0, FLOOR_Y, 0, H);
  g.addColorStop(0, "#8a5a33"); g.addColorStop(0.35, "#6f4627"); g.addColorStop(1, "#3f2716");
  ctx.fillStyle = g; ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  let y = FLOOR_Y, h = 26, row = 0;
  while (y < H) {
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(0, y, W, 2);
    const off = (scroll * (0.9 + row * 0.06) + row * 137) % 300;
    for (let x = -off; x < W; x += 300) { ctx.fillStyle = "rgba(0,0,0,0.14)"; ctx.fillRect(x, y, 2, h); }
    y += h; h *= 1.12; row++;
  }
  const sh = ctx.createLinearGradient(0, FLOOR_Y, 0, FLOOR_Y + 120);
  sh.addColorStop(0, "rgba(0,0,0,0.35)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh; ctx.fillRect(0, FLOOR_Y, W, 120);
}

// ------------------------------------------------------------------ Figuren
const BODY = "#efe8dd", SHADE = "#d6ccbd", ARM = "#cfc8bd", INK = "#3a3230";
function eyes(kind, side) {
  const lx = -22, rx = 22, y = -6;
  ctx.lineCap = "round"; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4;
  if (kind === "happy" || kind === "love") {
    for (const x of [lx, rx]) { ctx.beginPath(); ctx.arc(x, y + 6, 10, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
    return;
  }
  const big = kind === "hope" || kind === "shock" || kind === "worried";
  for (const x of [lx, rx]) {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, y, big ? 12 : 11, big ? 14 : 11, 0, 0, 7); ctx.fill();
    ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + side * 4, y + 1, 5, 0, 7); ctx.fill();
    if (kind === "neutral" || kind === "side" || kind === "whistle") {        // halb geschlossene Lider
      ctx.fillStyle = BODY; ctx.beginPath(); ctx.ellipse(x, y - 4, 13, 9, 0, Math.PI, 0); ctx.fill();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 12, y - 3); ctx.lineTo(x + 12, y - 3); ctx.stroke();
    }
  }
}
function face(kind, side) {
  eyes(kind, side);
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4; ctx.lineCap = "round";
  const my = 24;
  if (kind === "worried") { ctx.beginPath(); ctx.moveTo(-34, -30); ctx.lineTo(-12, -36); ctx.moveTo(34, -30); ctx.lineTo(12, -36); ctx.stroke(); }
  if (kind === "annoyed") { ctx.beginPath(); ctx.moveTo(-34, -32); ctx.lineTo(-12, -24); ctx.moveTo(34, -32); ctx.lineTo(12, -24); ctx.stroke(); }
  switch (kind) {
    case "smile": ctx.beginPath(); ctx.arc(0, my - 10, 13, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); break;
    case "happy": case "love": ctx.beginPath(); ctx.arc(0, my - 12, 15, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.fillStyle = "rgba(240,120,140,0.35)"; for (const x of [-34, 34]) { ctx.beginPath(); ctx.ellipse(x, 10, 10, 6, 0, 0, 7); ctx.fill(); } break;
    case "hope": ctx.beginPath(); ctx.ellipse(0, my, 6, 7, 0, 0, 7); ctx.fill(); break;
    case "worried": ctx.beginPath(); ctx.moveTo(-14, my); ctx.quadraticCurveTo(-7, my - 6, 0, my); ctx.quadraticCurveTo(7, my + 6, 14, my); ctx.stroke(); break;
    case "annoyed": ctx.beginPath(); ctx.moveTo(-13, my + 2); ctx.lineTo(13, my - 2); ctx.stroke(); break;
    case "neutral": case "side": ctx.beginPath(); ctx.moveTo(-11, my); ctx.lineTo(11, my); ctx.stroke(); break;
    case "shock": ctx.beginPath(); ctx.ellipse(0, my + 2, 8, 10, 0, 0, 7); ctx.fill(); break;
    case "whistle": ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(10, my, 6, 0, 7); ctx.stroke(); break;
  }
}
function arm(sx, sy, ang, side) {
  // ang: 0 = hängt, positiv = nach außen/oben; side -1 links, +1 rechts
  const a = ang * Math.PI / 180;
  const ex = sx + Math.sin(a) * 105 * side, ey = sy + Math.cos(a) * 105;
  ctx.strokeStyle = ARM; ctx.lineWidth = 24; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 3; ctx.stroke();
}
function blob(x, lean, aR, aL, kind, side, t, phase) {
  const step = Math.sin(t * 8 + phase);
  ctx.save();
  ctx.translate(x, FEET);
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.ellipse(0, 4, 78, 12, 0, 0, 7); ctx.fill();
  // Füße
  ctx.fillStyle = "#bdb4a8";
  rr(-42, -16 - Math.max(0, step) * 12, 38, 18, 9); ctx.fill();
  rr(4, -16 - Math.max(0, -step) * 12, 38, 18, 9); ctx.fill();
  ctx.translate(0, -Math.abs(Math.cos(t * 8 + phase)) * 7);
  ctx.rotate(lean * Math.PI / 180);
  const bh = 220, bw = 74, by = -14;
  // Arme hinter dem Körper (nach hinten verschränkt)
  if (aR < 0) arm(bw - 14, by - bh * 0.62, -aR, -1);
  if (aL < 0) arm(-bw + 14, by - bh * 0.62, -aL, 1);
  ctx.beginPath();
  ctx.moveTo(0, by - bh);
  ctx.bezierCurveTo(bw * 0.95, by - bh, bw * 1.1, by - bh * 0.35, bw, by - bh * 0.1);
  ctx.bezierCurveTo(bw * 0.9, by, -bw * 0.9, by, -bw, by - bh * 0.1);
  ctx.bezierCurveTo(-bw * 1.1, by - bh * 0.35, -bw * 0.95, by - bh, 0, by - bh);
  ctx.closePath();
  ctx.fillStyle = BODY; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = SHADE; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(bw * 0.95, by - bh * 0.45, 38, bh * 0.75, 0, 0, 7); ctx.fill(); ctx.restore();
  if (aR >= 0) arm(bw - 10, by - bh * 0.66, aR, 1);
  if (aL >= 0) arm(-bw + 10, by - bh * 0.66, aL, -1);
  const hy = by - bh - 50;
  ctx.fillStyle = BODY; ctx.beginPath(); ctx.arc(0, hy, 56, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, hy, 56, 0, 7); ctx.clip(); ctx.fillStyle = SHADE; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(28, hy + 10, 48, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(0, hy); face(kind, side); ctx.restore();
  ctx.restore();
  return { headX: x + Math.sin(lean * Math.PI / 180) * (bh + 50), headY: FEET - 14 - bh - 50 };
}
function heart(x, y, s, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f2557a";
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-26, -8, -14, -30, 0, -16); ctx.bezierCurveTo(14, -30, 26, -8, 0, 10); ctx.fill();
  ctx.restore();
}
function note(x, y, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#f6e7b8"; ctx.strokeStyle = "#f6e7b8"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(x, y, 9, 7, -0.4, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 8, y - 2); ctx.lineTo(x + 8, y - 34); ctx.quadraticCurveTo(x + 20, y - 26, x + 22, y - 16); ctx.stroke();
  ctx.restore();
}
function label(txt, x) {
  ctx.save(); ctx.font = "900 26px InterBlk"; ctx.letterSpacing = "3px";
  const w = ctx.measureText(txt).width + 30;
  ctx.fillStyle = "rgba(20,14,16,0.85)"; rr(x - w / 2, LABEL_Y - 20, w, 40, 10); ctx.fill();
  ctx.fillStyle = "#f2ece2"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x + 1.5, LABEL_Y + 1);
  ctx.restore();
}
function title(t) {
  const sw = ramp(t, SWITCH - 0.12, SWITCH + 0.12);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round";
  const lines = t < SWITCH ? [["WENN ÄNGSTLICH", 64, "#ffffff"], ["VERMEIDEND LIEBT", 74, "#f4b740"]]
    : [["DAS NENNT MAN DIE", 52, "#ffffff"], ["NÄHE-DISTANZ-FALLE.", 74, "#f4b740"]];
  const p = t < SWITCH ? 1 - ramp(t, SWITCH - 0.12, SWITCH) : back(ramp(t, SWITCH, SWITCH + 0.25));
  ctx.globalAlpha = t < SWITCH ? 1 - sw : clamp(ramp(t, SWITCH, SWITCH + 0.15));
  let y = TITLE_Y;
  for (const [txt, size, col] of lines) {
    ctx.save(); ctx.translate(TITLE_X, y); ctx.scale(p, p);
    ctx.font = `900 ${size}px InterBlk`;
    ctx.lineWidth = 10; ctx.strokeStyle = "rgba(30,8,14,0.9)"; ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
    ctx.restore();
    y += size * 1.12;
  }
  // Funken beim Wechsel
  if (t > SWITCH && t < SWITCH + 0.6) {
    const u = (t - SWITCH) / 0.6;
    for (let i = 0; i < 12; i++) {
      const an = i / 12 * Math.PI * 2;
      ctx.fillStyle = `rgba(244,183,64,${1 - u})`;
      ctx.beginPath(); ctx.arc(TITLE_X + Math.cos(an) * (200 + 160 * u), TITLE_Y + 30 + Math.sin(an) * (40 + 60 * u), 4, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const scroll = t * SPEED;
  drawWall(scroll);
  drawArt(scroll);
  drawFloor(scroll);
  const [ax, al, aR, aL] = keys(A_K, t), [bx, bl, bR, bL] = keys(B_K, t);
  const A = blob(ax, al, aR, aL, stateAt(A_FACE, t), 1, t, 0);
  const B = blob(bx, bl, bR, bL, stateAt(B_FACE, t), stateAt(B_FACE, t) === "side" ? 1 : -0.4, t, 1.6);
  label("ÄNGSTLICH", ax); label("VERMEIDEND", bx);
  for (const [t0] of HEARTS) {
    const u = ramp(t, t0, t0 + 1.0);
    if (u > 0 && u < 1) heart(A.headX + 50 + Math.sin(u * 6) * 8, A.headY - 70 - u * 90, 1.1 * back(ramp(t, t0, t0 + 0.2)), 1 - ramp(u, 0.6, 1));
  }
  const q = ramp(t, QUESTION, QUESTION + 0.2) * (1 - ramp(t, QUESTION + 1.0, QUESTION + 1.2));
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q; ctx.font = "900 64px InterBlk"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
    ctx.lineWidth = 8; ctx.strokeStyle = "rgba(30,8,14,0.8)"; ctx.strokeText("?", A.headX - 60, A.headY - 70); ctx.fillText("?", A.headX - 60, A.headY - 70); ctx.restore();
  }
  for (const n0 of NOTES) {
    const u = ramp(t, n0, n0 + 1.1);
    if (u > 0 && u < 1) note(B.headX + 60 + u * 40, B.headY - 40 - u * 110, 1 - ramp(u, 0.6, 1));
  }
  title(t);
};

window.exportEvents = function () {
  return { duration: window.DURATION, hearts: HEARTS.map(h => h[0]), question: QUESTION, notes: NOTES, switch: SWITCH,
    reach: [3.25, 8.9], dodge: [3.3, 9.25], hug: 4.15, shock: 4.15 };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  return true;
};
