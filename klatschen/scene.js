// "Wenn du klatschst, weil das Flugzeug landet" – deutsche Version (eigene Zeichnung), ohne Sprecher.
"use strict";
const W = 1080, H = 1920, DUR = 18.2;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function keys(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], easeIO((t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]))); return K[K.length - 1][1]; }
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };

// ------------------------------------------------------------ Zeitplan
const T = { clap: 0.15, clapEnd: 1.1, anyone: 1.25, rub: 2.6, sweetie: 3.9, turb: 5.4, more: 6.6, hands: 8.0, later: 9.9, goOn: 10.7,
  tiny: 12.4, bravo: 14.6, end: DUR };
const METER = [[0, 45], [1.0, 65], [2.6, 76], [3.4, 78], [3.9, 90], [5.4, 150], [7.6, 150], [8.0, 55], [10.0, 55], [10.6, 82], [12.0, 83], [12.4, 150], [18.2, 150]];
const SX = [300, 540, 780];                    // Sitze: Nachbar, DU, Oma
const SEAT_Y = 860;                            // Kopfhöhe

// ------------------------------------------------------------ Kabine
function cabin(t) {
  // Gepäckfächer
  ctx.fillStyle = "#cfd6e6"; ctx.fillRect(0, 520, W, 120);
  ctx.fillStyle = "#b8c2d6"; ctx.fillRect(0, 630, W, 10);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = "#aeb8cc"; ctx.fillRect(30 + i * 270, 545, 4, 80); }
  for (const x of [240, 540, 840]) { circle(x, 652, 5, "#ffe9a0"); glow(x, 652, 30, "255,233,160", 0.4); }
  // Wand mit Fenstern
  ctx.fillStyle = "#e6eaf3"; ctx.fillRect(0, 640, W, 360);
  for (const x of [100, 980]) {
    ctx.fillStyle = "#d4dae8"; rr(x - 50, 680, 100, 150, 46); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.roundRect(x - 40, 690, 80, 130, 38); ctx.clip();
    const late = t >= T.later;
    const g = ctx.createLinearGradient(0, 690, 0, 820);
    g.addColorStop(0, late ? "#f2a35a" : "#6fb3f0"); g.addColorStop(1, late ? "#f2d6a0" : "#cbe6fa");
    ctx.fillStyle = g; ctx.fillRect(x - 40, 690, 80, 130);
    for (let i = 0; i < 3; i++) { const cx = x - 60 + ((i * 50 + t * 90) % 140); circle(cx, 730 + i * 26, 16, "rgba(255,255,255,0.9)"); circle(cx + 14, 730 + i * 26, 12, "rgba(255,255,255,0.9)"); }
    ctx.restore();
  }
  // Gang-Boden
  ctx.fillStyle = "#3a4466"; ctx.fillRect(0, 1000, W, 400);
}
function seat(x, y) {
  ctx.fillStyle = "#2f3f7a"; rr(x - 100, y - 80, 200, 300, 34); ctx.fill();               // Lehne
  ctx.fillStyle = "#e9eef8"; rr(x - 60, y - 74, 120, 30, 10); ctx.fill();                   // Kopfschoner
  ctx.fillStyle = "#26336a"; rr(x - 116, y + 120, 40, 120, 14); ctx.fill(); rr(x + 76, y + 120, 40, 120, 14); ctx.fill();
}
function seatFrontRow() {
  for (const x of SX) { ctx.fillStyle = "#2f3f7a"; rr(x - 100, 1150, 200, 300, 34); ctx.fill(); ctx.fillStyle = "#e9eef8"; rr(x - 60, 1158, 120, 26, 10); ctx.fill(); }
}

// ------------------------------------------------------------ Figuren (eigene Bohnen-Form mit Gesicht)
function face(x, y, r, f, look = 0) {
  const k = r / 40; ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = "#24262e"; ctx.strokeStyle = "#24262e"; ctx.lineWidth = 3.4; ctx.lineCap = "round";
  const lx = look * 6;
  const eye = (big) => { for (const s of [-1, 1]) { circle(s * 13 + lx, -4, big ? 6 : 4.4, "#24262e"); if (big) circle(s * 13 + lx + 2, -6, 2, "#fff"); } };
  const happyEyes = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 13, -1, 6, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  ctx.fillStyle = "#24262e";
  switch (f) {
    case "joy": happyEyes(); ctx.beginPath(); ctx.arc(0, 8, 11, 0, Math.PI); ctx.closePath(); ctx.fill(); break;
    case "smile": eye(false); ctx.beginPath(); ctx.arc(0, 8, 9, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); break;
    case "stare": eye(true); ctx.beginPath(); ctx.moveTo(-7, 16); ctx.lineTo(7, 16); ctx.stroke(); break;
    case "shock": eye(true); ctx.beginPath(); ctx.ellipse(0, 16, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); break;
    case "awk": eye(false); ctx.beginPath(); ctx.moveTo(-10, 16); ctx.quadraticCurveTo(-5, 11, 0, 16); ctx.quadraticCurveTo(5, 21, 10, 16); ctx.stroke(); break;
    case "teeth": eye(true); ctx.fillStyle = "#fff"; rr(-12, 9, 24, 12, 3); ctx.fill(); ctx.strokeStyle = "#24262e"; ctx.lineWidth = 2; rr(-12, 9, 24, 12, 3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 21); ctx.moveTo(-12, 15); ctx.lineTo(12, 15); ctx.stroke(); break;
    case "kind": happyEyes(); ctx.beginPath(); ctx.arc(0, 8, 8, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); break;
    case "sleep": for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 13 - 6, -2); ctx.lineTo(s * 13 + 6, -2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-5, 15); ctx.lineTo(5, 15); ctx.stroke(); break;
    default: eye(false); ctx.beginPath(); ctx.moveTo(-6, 15); ctx.lineTo(6, 15); ctx.stroke();
  }
  ctx.restore();
}
function bean(x, y, r, c1, c2, f, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.lean) ctx.rotate(o.lean); ctx.translate(-x, -y);
  ctx.fillStyle = c2; rr(x - r * 1.05, y + r * 0.8, r * 2.1, r * 2.6, [r, r, 10, 10]); ctx.fill();          // Körper
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  if (o.bun) { circle(x, y - r * 1.02, r * 0.38, "#d7d9e0"); ctx.fillStyle = "#d7d9e0"; ctx.beginPath(); ctx.arc(x, y - r * 0.2, r * 1.02, Math.PI, 0); ctx.fill(); }
  face(x, y + (o.bun ? 6 : 0), r, f, o.look || 0);
  if (o.glasses) { ctx.strokeStyle = "#3a3d4a"; ctx.lineWidth = 2.6; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 13 * r / 40, y + 2, 9 * r / 40 + 2, 0, Math.PI * 2); ctx.stroke(); } }
  if (o.blush) { ctx.fillStyle = `rgba(255,110,130,${0.55 * o.blush})`; circle(x - r * 0.55, y + r * 0.3, r * 0.18, ctx.fillStyle); circle(x + r * 0.55, y + r * 0.3, r * 0.18, ctx.fillStyle); }
  if (o.sweat) { const p = (o.t * 1.5) % 1; ctx.globalAlpha = Math.sin(Math.PI * p); circle(x + r * 0.95, y - r * 0.2 + p * 20, 6, "#9cd3ff"); ctx.globalAlpha = 1; }
  ctx.restore();
}
// Hände vor dem Körper: Klatschen, Reiben, auf den Händen sitzen
function hands(x, y, r, mode, t, col) {
  const hy = y + r * 1.9;
  if (mode === "sit") return;
  let gap = 34;
  if (mode === "clap") gap = 6 + Math.abs(Math.sin(t * 16)) * 40;
  if (mode === "tiny") gap = 6 + Math.abs(Math.sin(ramp(t, T.tiny, T.tiny + 0.35) * Math.PI)) * 14;
  if (mode === "rub") gap = 8 + Math.sin(t * 22) * 6;
  ctx.lineCap = "round";
  for (const s of [-1, 1]) {
    for (const [w, c] of [[22, "rgba(255,255,255,0.85)"], [15, col]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x + s * r * 0.95, y + r * 1.2); ctx.quadraticCurveTo(x + s * r * 1.1, hy + 20, x + s * gap / 2, hy); ctx.stroke();
    }
    const hyy = hy + (mode === "rub" ? Math.sin(t * 22) * 4 * s : 0);
    circle(x + s * gap / 2, hyy, 16, "rgba(255,255,255,0.85)"); circle(x + s * gap / 2, hyy, 13, col);
  }
  if (mode === "clap" && Math.abs(Math.sin(t * 16)) < 0.15) { ctx.strokeStyle = "#ffd36e"; ctx.lineWidth = 3; for (const a of [-0.6, 0, 0.6]) { ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * 24, hy - 26 - Math.cos(a) * 4); ctx.lineTo(x + Math.sin(a) * 40, hy - 44); ctx.stroke(); } }
}

// ------------------------------------------------------------ Texte
function caption(t, t0, t1, txt, x, y, kind) {
  const s = t < t0 || t > t1 + 0.2 ? 0 : back(ramp(t, t0, t0 + 0.22)) * (1 - easeIO(ramp(t, t1, t1 + 0.2)));
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = kind === "act" ? "italic 700 28px InterX" : "700 28px InterX";
  const ico = kind === "pa" ? 40 : 0;
  const w = ctx.measureText(txt).width + 44 + ico, h = 52;
  ctx.fillStyle = kind === "pa" ? "rgba(32,40,70,0.95)" : "rgba(250,248,242,0.97)";
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = "transparent";
  if (kind === "pa") {                                      // Lautsprecher-Symbol
    const ix = -w / 2 + 30;
    ctx.fillStyle = "#ffd36e"; ctx.beginPath(); ctx.moveTo(ix - 10, -6); ctx.lineTo(ix - 4, -6); ctx.lineTo(ix + 4, -13); ctx.lineTo(ix + 4, 13); ctx.lineTo(ix - 4, 6); ctx.lineTo(ix - 10, 6); ctx.fill();
    ctx.strokeStyle = "#ffd36e"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ix + 6, 0, 9, -0.8, 0.8); ctx.stroke();
  }
  ctx.fillStyle = kind === "pa" ? "#f5f1e8" : "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(txt, ico / 2, 1);
  ctx.restore();
}
function plane(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.5); ctx.fillStyle = "#cfe2ff";
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-10, -18); ctx.lineTo(-4, -18); ctx.lineTo(8, 0); ctx.lineTo(-4, 18); ctx.lineTo(-10, 18); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-22, -8); ctx.lineTo(-18, -8); ctx.lineTo(-12, 0); ctx.lineTo(-18, 8); ctx.lineTo(-22, 8); ctx.fill();
  ctx.restore();
}
function title(t) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 44px InterX"; ctx.letterSpacing = "1px";
  ctx.fillStyle = "#f5f1e8"; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  const words = ["WENN", "DU", "KLATSCHST,", "WEIL", "DAS", "FLUGZEUG", "LANDET"];
  const lines = [words.slice(0, 3), words.slice(3)];
  let k = 0;
  lines.forEach((ln, li) => {
    const txt = ln.join(" "); const full = ctx.measureText(txt).width + (li === 1 ? 54 : 0);
    let x = 540 - full / 2;
    ctx.textAlign = "left";
    for (const w of ln) {
      const p = ramp(t, 0.05 + k * 0.12, 0.2 + k * 0.12);
      ctx.globalAlpha = easeOut(p); ctx.fillText(w, x, 300 + li * 56 + (1 - easeOut(p)) * 8);
      x += ctx.measureText(w + " ").width; k++;
    }
    if (li === 1) { ctx.globalAlpha = easeOut(ramp(t, 0.9, 1.1)); plane(x + 20, 340, 1); }
  });
  ctx.restore();
}
function meter(t) {
  const v = keys(METER, t);
  const shake = v > 120 ? Math.sin(t * 60) * 3 : 0;
  ctx.save(); ctx.translate(shake, 0); ctx.textAlign = "center";
  ctx.font = "700 20px InterX"; ctx.letterSpacing = "4px"; ctx.fillStyle = "#f6b23a"; ctx.fillText("PEINLICHKEIT", 540, 430);
  ctx.fillStyle = "#1c2033"; rr(320, 446, 440, 26, 13); ctx.fill();
  const col = v < 60 ? "#f2d06a" : v < 85 ? "#f2a35a" : "#f2566a";
  const w = Math.min(440, 440 * v / 100);
  ctx.fillStyle = col; rr(320, 446, w, 26, 13); ctx.fill();
  if (v > 100) { ctx.fillStyle = "#ff3b54"; rr(760, 446, Math.min(120, (v - 100) * 2.4), 26, 13); ctx.fill(); for (let i = 0; i < 4; i++) { const p = (t * 2 + i / 4) % 1; ctx.globalAlpha = 1 - p; circle(780 + p * 80, 459 - p * 30 + Math.sin(i) * 10, 4, "#ff8a5a"); } ctx.globalAlpha = 1; }
  ctx.letterSpacing = "0px"; ctx.font = "900 34px InterX"; ctx.fillStyle = col; ctx.fillText(Math.round(v) + " %", 540, 512);
  ctx.restore();
}
function laterBadge(t) {
  const s = t < T.later || t > T.goOn + 0.9 ? 0 : back(ramp(t, T.later, T.later + 0.25)) * (1 - easeIO(ramp(t, T.goOn + 0.7, T.goOn + 0.9)));
  if (s <= 0) return;
  ctx.save(); ctx.translate(540, 590); ctx.rotate(-0.05); ctx.scale(s, s);
  ctx.fillStyle = "#ffd23a"; rr(-150, -26, 300, 52, 26); ctx.fill();
  ctx.fillStyle = "#1d1d22"; ctx.font = "900 26px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("20 MIN SPÄTER", 0, 1);
  ctx.restore();
}

// ------------------------------------------------------------ Bild
let GRAIN = [];
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0e1020"; ctx.fillRect(0, 0, W, H);
  // leichtes Wackeln des Fliegers
  const bump = t > T.turb - 0.2 && t < T.turb + 0.4 ? Math.sin(t * 50) * 6 : Math.sin(t * 1.3) * 1.5;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 520, W, 880); ctx.clip(); ctx.translate(0, bump);
  cabin(t);
  for (const x of SX) seat(x, SEAT_Y);
  // Nachbar links
  const nf = stateAt([[0, "smile"], [T.clap + 0.3, "stare"], [T.rub, "awk"], [T.sweetie, "stare"], [T.hands, "neutral"], [T.later, "sleep"], [T.tiny, "stare"], [T.bravo, "awk"]], t);
  bean(SX[0], SEAT_Y, 54, "#ffd2b0", "#f5b98f", nf, { look: (t > T.clap + 0.3 && t < T.later) || t > T.tiny ? 1 : 0 });
  hands(SX[0], SEAT_Y, 54, "rest", t, "#d99a6c");
  // DU in der Mitte
  const yf = stateAt([[0, "joy"], [T.clapEnd, "smile"], [T.anyone, "awk"], [T.rub, "teeth"], [T.sweetie, "shock"], [T.turb, "teeth"], [T.more, "shock"], [T.hands, "awk"], [T.later, "neutral"], [T.goOn, "smile"], [T.tiny, "joy"], [T.tiny + 0.5, "teeth"], [T.bravo, "awk"]], t);
  const sink = t > T.hands && t < T.later + 0.6 ? 14 : 0;
  const blushK = t > T.sweetie ? 1 : t > T.anyone ? 0.5 : 0;
  bean(SX[1], SEAT_Y + sink, 56, "#e3d3ff", "#c9b2f2", yf, { blush: blushK, sweat: t > T.turb && t < T.hands + 1, t });
  const hm = t < T.clapEnd ? "clap" : t > T.rub && t < T.sweetie ? "rub" : t > T.hands && t < T.tiny ? "sit" : t > T.tiny && t < T.tiny + 0.4 ? "tiny" : "rest";
  hands(SX[1], SEAT_Y + sink, 56, hm, t, "#9f84d6");
  // Oma rechts (Dutt, Brille)
  const of = stateAt([[0, "sleep"], [T.clap + 0.4, "stare"], [T.sweetie - 0.05, "kind"], [T.sweetie + 1.0, "smile"], [T.later, "sleep"], [T.goOn - 0.1, "kind"], [T.tiny, "stare"], [T.bravo, "kind"]], t);
  bean(SX[2], SEAT_Y, 52, "#eef0f4", "#d6d9e2", of, { bun: true, glasses: true, look: t > T.clap + 0.4 ? -1 : 0 });
  hands(SX[2], SEAT_Y, 52, "rest", t, "#a9adba");
  // Oma tätschelt beim "Schätzchen"
  if ((t > T.sweetie && t < T.sweetie + 1.2) || t > T.bravo) { ctx.strokeStyle = "#d6d9e2"; ctx.lineWidth = 16; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(SX[2] - 50, SEAT_Y + 80); ctx.quadraticCurveTo(SX[2] - 120, SEAT_Y + 70, SX[1] + 40, SEAT_Y + 60 + Math.sin(t * 10) * 4); ctx.stroke(); }
  // Vorderreihe: Köpfe drehen sich um
  const turn = ramp(t, T.turb, T.turb + 0.3) * (1 - ramp(t, T.hands, T.hands + 0.3)) + ramp(t, T.tiny, T.tiny + 0.25);
  seatFrontRow();
  for (let i = 0; i < 3; i++) {
    const x = SX[i], up = turn > 0.5;
    const hy = 1140 - (up ? 40 * easeOut(turn) : 0);
    const cols = [["#d9c1a6", "#c8a988"], ["#bfe3d0", "#9fcfb6"], ["#f2c4c4", "#e0a6a6"]][i];
    if (up) bean(x, hy, 50, cols[0], cols[1], "stare", { look: i === 0 ? 1 : i === 2 ? -1 : 0 });
    else { const g = ctx.createRadialGradient(x, hy, 5, x, hy, 50); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, hy, 50, Math.PI, 0); ctx.fill(); }
  }
  ctx.fillStyle = "#2f3f7a"; for (const x of SX) { rr(x - 100, 1150, 200, 300, 34); ctx.fill(); }
  ctx.fillStyle = "#e9eef8"; for (const x of SX) { rr(x - 60, 1158, 120, 26, 10); ctx.fill(); }
  // Namensschild DU
  ctx.font = "800 22px InterX"; ctx.letterSpacing = "3px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(28,32,52,0.92)"; rr(SX[1] - 40, SEAT_Y - 138, 80, 36, 18); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("DU", SX[1] + 2, SEAT_Y - 119);
  ctx.letterSpacing = "0px";
  ctx.restore();

  title(t);
  meter(t);
  laterBadge(t);
  caption(t, T.anyone, T.rub - 0.15, "…irgendwer?", SX[1], 740, "say");
  caption(t, T.rub, T.sweetie - 0.15, "*reibt Hände* Ziemlich kalt hier.", 560, 740, "act");
  caption(t, T.sweetie, T.turb - 0.15, "Schätzchen … wir fliegen noch.", 640, 740, "say");
  caption(t, T.turb, T.more - 0.15, "Das war nur eine Turbulenz.", 540, 600, "pa");
  caption(t, T.more, T.hands - 0.15, "Noch 20 Minuten.", 540, 600, "pa");
  caption(t, T.hands, T.later - 0.15, "*setzt sich auf die Hände*", SX[1], 740, "act");
  caption(t, T.goOn, T.tiny - 0.15, "… nur zu.", SX[2] - 20, 740, "say");
  caption(t, T.tiny, T.bravo - 0.15, "*ein winziger Klatscher*", SX[1], 740, "act");
  caption(t, T.bravo, DUR, "Bravo, Schätzchen.", SX[2] - 40, 740, "say");

  ctx.globalAlpha = 0.04; ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.25), ramp(t, DUR - 0.7, DUR - 0.05));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return { duration: DUR, clap: [T.clap, T.clapEnd], anyone: T.anyone, rub: T.rub, sweetie: T.sweetie, turb: T.turb, more: T.more,
    hands: T.hands, later: T.later, goOn: T.goOn, tiny: T.tiny, bravo: T.bravo, meterUp: [T.anyone, T.sweetie, T.turb, T.goOn, T.tiny] };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX"), document.fonts.load("italic 700 28px InterX")]);
  let seed = 47; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return { duration: DUR };
};
