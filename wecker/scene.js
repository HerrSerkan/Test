// "Gleicher Wecker. Andere Nacht." – eigenes Video im Stil von fruehaufsteher/ und mensa/ (1080x1920), ohne Sprecher.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Ende = Anfang (Endlosschleife).
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 14.0;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  if (a <= 0.004) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgb(c, a)); g.addColorStop(1, rgb(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function shadow(x, y, w, a = 0.22) { ctx.fillStyle = `rgba(20,10,30,${a})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.18, 0, 0, Math.PI * 2); ctx.fill(); }

// ------------------------------------------------------------ Zeitplan
const CLOCK = [[0, "6:00"], [1.0, "6:05"], [2.0, "6:10"], [3.0, "6:20"], [4.0, "6:30"], [4.5, "6:35"], [5.0, "6:40"], [5.5, "6:45"],
  [6.0, "6:52"], [6.2, "6:58"], [6.4, "7:05"], [6.6, "7:12"], [6.8, "7:18"], [7.0, "7:24"], [7.2, "7:30"], [7.4, "7:35"], [7.6, "7:39"],
  [7.8, "7:42"], [8.0, "7:45"], [8.45, "7:48"], [8.9, "7:51"], [9.3, "7:54"], [9.6, "7:56"], [9.85, "7:57"], [10.0, "7:58"], [13.92, "6:00"]];
const T = {
  w1Off: 0.85, w1Up: 1.0, jackEnd: 3.85, coffee: 3.95, dressed: 6.0,
  hits: [2.0, 3.2, 4.0, 4.6, 5.0, 5.8, 6.3, 6.7, 7.0, 7.27, 7.52, 7.77],
  pillow: 5.0, fly: 7.0, panic: 8.0, stumble: 9.05, exit: 9.55, door: 9.95,
  w3Off: 0.9, w3Bubble: 3.0, climax: 10.0, flip: 11.0, lieDown: 12.0, alarm3: 12.25, ohNo: 12.5,
  title1: 13.0, title2: 13.22, sticker: 13.05, out: 13.85,
};
function minutesAt(t) {
  let m = 360;
  for (let i = 0; i < CLOCK.length - 1; i++) {
    const [a, s] = CLOCK[i], [b, s2] = CLOCK[i + 1];
    const ma = +s.split(":")[0] * 60 + +s.split(":")[1], mb = +s2.split(":")[0] * 60 + +s2.split(":")[1];
    if (t >= a && t < b) m = mb < ma ? ma : lerp(ma, mb, (t - a) / (b - a));
  }
  if (t >= CLOCK[CLOCK.length - 1][0]) m = 360;
  return m;
}
const snoozeCount = t => T.hits.filter(h => t >= h).length;
const lightsOut = t => ramp(t, T.out - 0.05, T.out + 0.08);

// ------------------------------------------------------------ Himmel (Dämmerung -> Morgen)
function skyAt(t) {
  const k = clamp((minutesAt(t) - 360) / 118);
  const top = k < 0.4 ? mix(hex("#3b3277"), hex("#7c7fd0"), k / 0.4) : mix(hex("#7c7fd0"), hex("#4f9fe8"), (k - 0.4) / 0.6);
  const bot = k < 0.4 ? mix(hex("#f39a7a"), hex("#ffc9a0"), k / 0.4) : mix(hex("#ffc9a0"), hex("#c4e3f7"), (k - 0.4) / 0.6);
  return { top, bot, k };
}
const STARS = (() => { const r = rng(4), a = []; for (let i = 0; i < 50; i++) a.push([r() * W, r() * 300, 0.5 + r() * 0.8, r() * 6]); return a; })();
function drawSky(t) {
  const { top, bot, k } = skyAt(t);
  const g = ctx.createLinearGradient(0, 0, 0, 840);
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 840);
  if (k < 0.3) for (const [x, y, r, p] of STARS) { ctx.globalAlpha = (1 - k / 0.3) * (0.5 + 0.4 * Math.sin(t * 2 + p)); circle(x, y, r, "#fff"); }
  ctx.globalAlpha = 1;
  // Sonne geht auf
  const sx = 70 + k * 120, sy = 380 - k * 260;
  glow(sx, sy, 110, [255, 230, 170], 0.5);
  circle(sx, sy, 30, "#fff1c2"); circle(sx, sy, 26, "#ffd978");
  // Wolken
  ctx.fillStyle = rgb(mix([255, 214, 220], [255, 255, 255], k));
  for (const [x0, y, s, sp] of [[360, 95, 1, 7], [40, 170, 1.2, 5], [470, 205, 0.8, 9]]) {
    const x = ((x0 + t * sp * 4) % (W + 220)) - 110;
    ctx.beginPath(); ctx.arc(x, y, 18 * s, 0, Math.PI * 2); ctx.arc(x + 22 * s, y - 10 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 46 * s, y, 18 * s, 0, Math.PI * 2); ctx.rect(x, y, 46 * s, 18 * s); ctx.fill();
  }
}

// ------------------------------------------------------------ Gebäude
const PANES = [{ x0: 38, x1: 202 }, { x0: 208, x1: 371 }, { x0: 377, x1: 540 }];
const PY0 = 462, PY1 = 699;
PANES.forEach(p => { p.y0 = PY0; p.y1 = PY1; p.w = p.x1 - p.x0; p.h = PY1 - PY0; p.cx = (p.x0 + p.x1) / 2; });
function drawBuilding(t) {
  ctx.strokeStyle = "#2c2a33"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(105, 383); ctx.lineTo(105, 330); ctx.moveTo(92, 336); ctx.lineTo(118, 336); ctx.stroke();
  ctx.fillStyle = "#8b3b2e"; ctx.fillRect(437, 337, 33, 47); ctx.fillStyle = "#73302a"; ctx.fillRect(434, 333, 39, 6);
  ctx.fillStyle = "#b05a45"; ctx.fillRect(10, 397, 556, 422);
  ctx.strokeStyle = "rgba(125,55,40,0.5)"; ctx.lineWidth = 1;
  for (let y = 402, row = 0; y < 818; y += 9.5, row++) {
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(566, y); ctx.stroke();
    for (let x = 10 + (row % 2) * 14; x < 566; x += 28) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 9.5); ctx.stroke(); }
  }
  ctx.fillStyle = "#e2d6c6"; ctx.fillRect(4, 383, 568, 15); ctx.fillStyle = "#c4b8a8"; ctx.fillRect(4, 395, 568, 3);
  // Tür
  const doorOpen = Math.sin(clamp((t - 9.75) / 0.25) * Math.PI);
  ctx.fillStyle = "#24160f"; ctx.fillRect(260, 740, 56, 78);
  ctx.fillStyle = "#4b2f27"; ctx.fillRect(260, 740, 56 * (1 - 0.7 * doorOpen), 78);
  if (doorOpen < 0.2) { ctx.fillStyle = "#2a1b17"; ctx.fillRect(266, 747, 44, 24); circle(307, 786, 2.2, "#e2b04a"); }
  // Gehweg + Straße
  ctx.fillStyle = "#83868c"; ctx.fillRect(0, 818, W, 14); ctx.fillStyle = "#9da0a5"; ctx.fillRect(0, 832, W, 26);
  ctx.fillStyle = "#c6c8cb"; ctx.fillRect(0, 858, W, 7); ctx.fillStyle = "#2c2e34"; ctx.fillRect(0, 865, W, H - 865);
  ctx.fillStyle = "#d9dadc"; for (let x = 15; x < W; x += 76) ctx.fillRect(x, 950, 44, 4);
  // Dämmerung über der Fassade
  const n = 1 - skyAt(t).k;
  ctx.fillStyle = `rgba(40,25,70,${0.4 * n * n})`; ctx.fillRect(0, 383, W, H - 383);
}

// ------------------------------------------------------------ Möbel
const ROOM = [
  { wall: "#ffe7a3", curtain: "#ffb547", blanket: "#ffbe3b" },
  { wall: "#cdb8ff", curtain: "#8d63e8", blanket: "#9b6cf0" },
  { wall: "#9ba8c2", curtain: "#5d6a86", blanket: "#61759f" },
];
function drawLamp(p, on) {
  const x = p.cx, y = p.y0;
  ctx.strokeStyle = "#2b2b31"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 24); ctx.stroke();
  ctx.fillStyle = on > 0.5 ? "#fff1b8" : "#3a3a42";
  ctx.beginPath(); ctx.moveTo(x - 7, y + 24); ctx.lineTo(x + 7, y + 24); ctx.lineTo(x + 17, y + 36); ctx.lineTo(x - 17, y + 36); ctx.closePath(); ctx.fill();
  if (on > 0) {
    ctx.save(); ctx.globalAlpha = on;
    const g = ctx.createLinearGradient(0, y + 36, 0, y + 200);
    g.addColorStop(0, "rgba(255,240,190,0.5)"); g.addColorStop(1, "rgba(255,240,190,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 17, y + 36); ctx.lineTo(x + 17, y + 36); ctx.lineTo(x + 75, y + 210); ctx.lineTo(x - 75, y + 210); ctx.closePath(); ctx.fill();
    circle(x, y + 38, 6, "#fffbe6"); ctx.restore();
  }
}
function drawBed(p) {
  const x = p.x0 + 2, y = p.y0;
  shadow(x + 56, y + 216, 60, 0.18);
  ctx.fillStyle = "#7a4a33"; rr(x + 2, y + 120, 98, 44, [12, 12, 0, 0]); ctx.fill();
  ctx.fillStyle = "#8c573d"; rr(x + 8, y + 126, 86, 34, 8); ctx.fill();
  ctx.fillStyle = "#6a3f2c"; ctx.fillRect(x, y + 186, 108, 30);
}
function drawPillow(p, fluffy = 0) {
  const x = p.x0 + 2, y = p.y0;
  ctx.fillStyle = "#f7f5f1"; rr(x + 12 - fluffy * 3, y + 143 - fluffy * 4, 72 + fluffy * 6, 18 + fluffy * 6, 9); ctx.fill();
  if (fluffy) { ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 20, y + 150); ctx.quadraticCurveTo(x + 48, y + 144, x + 76, y + 150); ctx.stroke(); }
}
function drawBlanket(p, color) {
  const x = p.x0 + 2, y = p.y0;
  ctx.fillStyle = "#f7f5f1"; ctx.fillRect(x, y + 158, 108, 6);
  ctx.fillStyle = color; rr(x, y + 162, 108, 26, [3, 3, 0, 0]); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(x, y + 182, 108, 6);
}
function drawNightstand(p) {
  const x = p.x1 - 44, y = p.y0 + 150;
  shadow(x + 17, y + 66, 22, 0.18);
  ctx.fillStyle = "#5a3a2b"; ctx.fillRect(x, y, 34, 66); ctx.fillStyle = "#4a2f22"; ctx.fillRect(x + 3, y + 6, 28, 24); circle(x + 26, y + 18, 1.6, "#d6b25a");
}
function drawAlarm(x, y, t, ringing, rot = 0) {
  const sh = ringing ? Math.sin(t * 80) * 1.6 : 0;
  ctx.save(); ctx.translate(x + sh, y); ctx.rotate(rot + (ringing ? Math.sin(t * 60) * 0.08 : 0));
  circle(-7, -10, 4.5, "#d63a32"); circle(7, -10, 4.5, "#d63a32");
  circle(0, 0, 11, "#e2463c"); circle(0, 0, 7.8, "#fbfbf6");
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -5); ctx.moveTo(0, 0); ctx.lineTo(4, 1); ctx.stroke();
  ctx.restore();
  if (ringing) {
    ctx.strokeStyle = "rgba(255,90,70,0.95)"; ctx.lineWidth = 1.6;
    for (const s of [0, Math.PI]) for (const r of [15, 20]) { ctx.beginPath(); ctx.arc(x, y, r, s - 0.6, s + 0.6); ctx.stroke(); }
  }
}

// ------------------------------------------------------------ Figuren
const SKIN = "#f6efe2", LINE = "#d4cab8";
const CHAR = { gelb: { body: "#ffcf33", dark: "#e9b416" }, lila: { body: "#b28bff", dark: "#9a72ee" }, grau: { body: "#a3abb8", dark: "#8c94a3" } };
function face(x, y, f) {
  ctx.strokeStyle = "#2a2a2e"; ctx.fillStyle = "#2a2a2e"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  const E = 5.5, ey = y - 2;
  const arcs = down => { for (const s of [-1, 1]) { ctx.beginPath(); down ? ctx.arc(x + s * E, ey - 1, 3, 0.15 * Math.PI, 0.85 * Math.PI) : ctx.arc(x + s * E, ey + 1.5, 3, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  const dots = (r = 1.7) => { circle(x - E, ey, r, "#2a2a2e"); circle(x + E, ey, r, "#2a2a2e"); };
  const big = () => { for (const s of [-1, 1]) { circle(x + s * E, ey, 3.6, "#fff"); circle(x + s * E, ey, 1.9, "#2a2a2e"); } };
  const lids = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * E - 3.5, ey - 1); ctx.lineTo(x + s * E + 3.5, ey - 1); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * E, ey - 1, 2, 0, Math.PI); ctx.fill(); } };
  const mouth = k => {
    ctx.beginPath();
    if (k === "smile") ctx.arc(x, y + 4, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    else if (k === "grin") { ctx.arc(x, y + 4, 5.5, 0, Math.PI); ctx.closePath(); ctx.fill(); return; }
    else if (k === "flat") { ctx.moveTo(x - 3, y + 7); ctx.lineTo(x + 3, y + 7); }
    else if (k === "frown") ctx.arc(x, y + 10, 4, 1.2 * Math.PI, 1.8 * Math.PI);
    else if (k === "o") { ctx.ellipse(x, y + 7, 2.2, 2.8, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (k === "O") { ctx.ellipse(x, y + 7, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (k === "wavy") { ctx.moveTo(x - 5, y + 7); ctx.quadraticCurveTo(x - 2.5, y + 4, x, y + 7); ctx.quadraticCurveTo(x + 2.5, y + 10, x + 5, y + 7); }
    ctx.stroke();
  };
  switch (f) {
    case "happy": arcs(false); mouth("grin"); break;
    case "smile": dots(); mouth("smile"); break;
    case "sleep": arcs(true); mouth("flat"); break;
    case "snore": arcs(true); mouth("o"); break;
    case "grumpy": for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * E - 3, ey + (s < 0 ? -1 : 1)); ctx.lineTo(x + s * E + 3, ey + (s < 0 ? 1 : -1)); ctx.stroke(); } mouth("frown"); break;
    case "tired": lids(); mouth("flat"); break;
    case "tiredO": lids(); mouth("o"); break;
    case "yawn": arcs(true); mouth("O"); break;
    case "shock": big(); mouth("O"); break;
    case "panic": big(); mouth("wavy"); break;
    case "wide": big(); mouth("flat"); break;
    case "read": arcs(true); mouth("smile"); break;
  }
}
function eyebags(x, y) {
  ctx.strokeStyle = "rgba(90,60,120,0.75)"; ctx.lineWidth = 1.6;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 5.5, y + 1, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 5.5, y + 3, 3.4, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
}
function arm(sx, sy, ang, len, col) {
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
  ctx.fillStyle = col; rr(-3.6, -2, 7.2, len, 3.6); ctx.fill();
  ctx.restore();
  return [sx - Math.sin(ang) * (len - 3), sy + Math.cos(ang) * (len - 3)];
}
function holdItem(x, y, kind, t) {
  if (kind === "mug") {
    ctx.fillStyle = "#f6f4ef"; rr(x - 6, y - 10, 12, 12, 2); ctx.fill();
    ctx.strokeStyle = "#f6f4ef"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 7, y - 4, 3.2, -1.4, 1.4); ctx.stroke();
    ctx.fillStyle = "#e5533b"; ctx.fillRect(x - 6, y - 6, 12, 3);
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1;
    for (const d of [-2, 2]) { ctx.beginPath(); ctx.moveTo(x + d, y - 13); ctx.quadraticCurveTo(x + d + 2 * Math.sin(t * 5), y - 17, x + d, y - 21); ctx.stroke(); }
  } else if (kind === "book") {
    ctx.fillStyle = "#2f6fd6"; rr(x - 13, y - 13, 26, 18, 2); ctx.fill();
    ctx.fillStyle = "#f6f2e6"; ctx.fillRect(x - 11, y - 11, 10, 14); ctx.fillRect(x + 1, y - 11, 10, 14);
  } else if (kind === "phone") {
    ctx.fillStyle = "#1d2230"; rr(x - 5, y - 9, 10, 16, 2); ctx.fill();
    ctx.fillStyle = "#9fd2ff"; rr(x - 3.6, y - 7.5, 7.2, 13, 1.2); ctx.fill();
  } else if (kind === "pants") {
    ctx.fillStyle = "#2f5fb0"; rr(x - 14, y - 4, 28, 14, 3); ctx.fill();
  }
}
// Merkmal am Kopf
function feature(kind, x, y, t) {
  if (kind === "band") { ctx.fillStyle = "#ef3b4a"; rr(x - 17.5, y - 10, 35, 6, 3); ctx.fill(); ctx.fillRect(x + 14, y - 8, 9, 3); ctx.fillRect(x + 15, y - 5, 7, 3); }
  if (kind === "mask") { ctx.fillStyle = "#5b2fb8"; rr(x - 17, y - 15, 34, 7, 3.5); ctx.fill(); circle(x - 6, y - 11.5, 5, "#5b2fb8"); circle(x + 6, y - 11.5, 5, "#5b2fb8"); }
  if (kind === "hood") { ctx.strokeStyle = "#5e6676"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y + 1, 19.5, Math.PI * 0.82, Math.PI * 2.18); ctx.stroke(); }
}
// o: {who, x, y (Unterkante Körper), arms:[l,r], face, hold, lean, extra}
function figure(o, t) {
  const C = CHAR[o.who];
  ctx.save();
  shadow(o.x, o.y + 2, 24, 0.2);
  ctx.translate(o.x, o.y); ctx.rotate(o.lean || 0);
  const hy = -86;
  ctx.fillStyle = C.body; rr(-21, -72, 42, 74, 21); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)"; rr(-17, -68, 12, 60, 8); ctx.fill();
  if (o.dressed) { // Hemd + Krawatte
    ctx.fillStyle = "#f4f6fa"; ctx.beginPath(); ctx.moveTo(-10, -72); ctx.lineTo(10, -72); ctx.lineTo(0, -60); ctx.fill();
    ctx.fillStyle = "#2f6fd6"; ctx.beginPath(); ctx.moveTo(-2.5, -64); ctx.lineTo(2.5, -64); ctx.lineTo(4, -44); ctx.lineTo(0, -40); ctx.lineTo(-4, -44); ctx.fill();
  }
  if (o.pants) { // Hose verkehrt herum: Taschen und Etikett vorne
    ctx.fillStyle = "#2f5fb0"; rr(-22, -26, 44, 28, [4, 4, 10, 10]); ctx.fill();
    ctx.fillStyle = "#264f94"; rr(-15, -21, 10, 9, 2); ctx.fill(); rr(5, -21, 10, 9, 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(-2, -28, 5, 6);
  }
  const [la, ra] = o.arms || [0.15, -0.15];
  arm(-17, -58, la, 32, C.dark);
  const hand = arm(17, -58, ra, 32, C.dark);
  circle(0, hy, 17.5, LINE); circle(0, hy, 16.6, SKIN);
  face(0, hy, o.face);
  if (o.bags) eyebags(0, hy);
  feature(o.feat, 0, hy, t);
  if (o.hold) holdItem(hand[0], hand[1], o.hold, t);
  ctx.restore();
}
function sleeper(p, who, f, feat) {
  const x = p.x0 + 50, y = p.y0 + 146, C = CHAR[who];
  circle(x - 20, y + 14, 12, C.body); circle(x + 20, y + 14, 12, C.body);
  circle(x, y, 17.5, LINE); circle(x, y, 16.6, SKIN);
  if (f) face(x, y, f);
  if (feat) feature(feat, x, y);
  return { x, y };
}

// ------------------------------------------------------------ Blasen, Zzz, Effekte
function bubble(text, cx, cy, s, kind, tail) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.font = "900 14.5px InterX"; ctx.letterSpacing = "0.8px";
  const w = ctx.measureText(text).width + 28, h = 32;
  ctx.fillStyle = "#fbf6ea"; ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.beginPath();
  if (kind === "thought") {
    const n = Math.max(3, Math.round(w / 22));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + 6 + i * (w - 12) / n; ctx.moveTo(x + 11, -h / 2 + 5); ctx.arc(x, -h / 2 + 5, 10, 0, Math.PI * 2); ctx.moveTo(x + 11, h / 2 - 5); ctx.arc(x, h / 2 - 5, 10, 0, Math.PI * 2); }
    ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 14);
    ctx.fill();
    if (tail) { ctx.shadowColor = "transparent"; for (const [i, r] of [[1, 4], [2, 2.6]]) circle(tail[0] * i * 0.5, h / 2 + 4 + i * 7, r, "#fbf6ea"); }
  } else {
    ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    if (tail) { ctx.moveTo(tail[0] - 7, h / 2 - 2); ctx.lineTo(tail[0] + tail[1], h / 2 + 12); ctx.lineTo(tail[0] + 7, h / 2 - 2); }
    ctx.fill();
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0.4, 1);
  ctx.restore();
}
function popIn(t, a, b = 99, dur = 0.22) { if (t < a || t > b + 0.2) return 0; return back(ramp(t, a, a + dur)) * (1 - easeIO(ramp(t, b, b + 0.18))); }
function puff(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  for (let i = 0; i < 8; i++) { const a = i * 0.785; circle(x + Math.cos(a) * 28 * k, y + Math.sin(a) * 15 * k, 7 * (1 - k * 0.6), "#fbf6ea"); }
  ctx.restore();
}
function zzz(x, y, t, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.9 + i / 3) % 1;
    ctx.globalAlpha = a * Math.sin(ph * Math.PI); ctx.font = `900 ${10 + ph * 6}px InterX`;
    ctx.fillText("Z", x + Math.sin(ph * 6) * 2, y + 26 - ph * 30);
  }
  ctx.restore();
}
function stars(x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#ffe066";
  for (let i = 0; i < 3; i++) { const ang = t * 7 + i * 2.1, px = x + Math.cos(ang) * 18, py = y + Math.sin(ang) * 6; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.fillText("✦", px, py); }
  ctx.restore();
}
function sweat(x, y, t) { const k = (t * 2.5) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = "#8fd3ff"; ctx.beginPath(); ctx.ellipse(x, y + k * 10, 2.2, 3.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }

// ------------------------------------------------------------ Fenster 1: steht sofort auf
function pane1(t, p) {
  const awake = t >= T.w1Up && t < T.out;
  const lamp = t >= T.w1Off && t < 4.0 ? 1 : 0;
  ctx.fillStyle = ROOM[0].wall; ctx.fillRect(p.x0, p.y0, p.w, p.h);
  drawCurtains(p, 0);
  drawPoster(p, "sun");
  drawLamp(p, lamp);
  drawBed(p); drawPillow(p); drawNightstand(p);
  if (!awake) {
    sleeper(p, "gelb", t < 0.2 ? "sleep" : "grumpy", "band");
    drawBlanket(p, ROOM[0].blanket);
  } else {
    drawBlanket(p, ROOM[0].blanket);
    const x = p.x0 + 84;
    let o = { who: "gelb", feat: "band", x, y: p.y0 + 214, face: "happy", arms: [0.2, -0.2] };
    if (t < 1.15) { o.face = "yawn"; o.y += (1 - easeOut(ramp(t, 1.0, 1.15))) * 30; }
    else if (t < T.jackEnd) { // Hampelmänner
      const ph = ((t - 1.15) / 0.42) % 1, up = Math.sin(ph * Math.PI);
      o.y -= up * 12; o.arms = [lerp(0.25, Math.PI - 0.3, up), -lerp(0.25, Math.PI - 0.3, up)];
    } else if (t < T.dressed) {
      o.hold = "mug"; o.arms = [0.2, -1.0]; o.face = "smile";
      if ((t > 4.3 && t < 4.65) || (t > 5.2 && t < 5.55)) { o.arms = [0.2, -2.2]; o.face = "read"; }
    } else { // fertig angezogen, liest
      o.dressed = true; o.hold = "book"; o.arms = [0.3, -0.75]; o.face = stateAt([[0, "read"], [7.8, "smile"], [8.4, "read"], [10.05, "shock"], [10.6, "read"], [12.3, "smile"], [12.8, "read"]], t); o.y = p.y0 + 206;
      if (t < 6.2) { o.y += (1 - ramp(t, 6.0, 6.2)) * 8; }
    }
    figure(o, t);
    if (t >= T.w1Up && t < T.jackEnd) sweat(x + 22, p.y0 + 118, t);
  }
  drawAlarm(p.x1 - 27, p.y0 + 136, t, t < T.w1Off);
  if (t < 0.85) zzz(p.x0 + 100, p.y0 + 28, t, 1 - ramp(t, 0.6, 0.85));
  return t < T.w1Off ? 0.55 : 0;
}
// ------------------------------------------------------------ Fenster 2: Snooze-Profi
const L_ALARM_FLOOR = (p) => [p.x1 - 20, p.y1 - 14];
function alarm2Pos(t, p) {
  if (t < T.fly) return [p.x1 - 27, p.y0 + 136, 0];
  const k = ramp(t, T.fly, T.fly + 0.45);
  const [fx, fy] = L_ALARM_FLOOR(p);
  return [lerp(p.x1 - 27, fx, k), lerp(p.y0 + 136, fy, k) - Math.sin(k * Math.PI) * 40, k * 6.5];
}
function ringing2(t) {
  if (t >= T.panic) return t < T.panic + 0.1;
  if (t < T.hits[0]) return true;
  for (let i = 1; i < T.hits.length; i++) { const h = T.hits[i]; if (t >= h - Math.min(0.45, (h - T.hits[i - 1]) * 0.6) && t < h) return true; }
  return t > 7.95 && t < T.panic;
}
function pane2(t, p) {
  ctx.fillStyle = ROOM[1].wall; ctx.fillRect(p.x0, p.y0, p.w, p.h);
  drawCurtains(p, 1);
  drawPoster(p, "moon");
  const lamp = t >= T.panic && t < T.out ? 1 : 0;
  drawLamp(p, lamp);
  drawBed(p); drawNightstand(p);
  const inBed = t < T.panic;
  const pillowOver = t >= T.pillow && t < T.panic;
  if (!pillowOver) drawPillow(p);
  if (inBed) {
    const ring = ringing2(t);
    const lastHit = T.hits.filter(h => t >= h).pop() ?? -9;
    const f = ring ? "grumpy" : (t - lastHit < 0.3 ? "grumpy" : (Math.floor(t * 1.4) % 2 ? "snore" : "sleep"));
    const h = sleeper(p, "lila", pillowOver ? null : f, pillowOver ? null : "mask");
    if (pillowOver) { ctx.fillStyle = "#f7f5f1"; rr(h.x - 32, h.y - 16, 64, 24, 11); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.beginPath(); ctx.moveTo(h.x - 24, h.y - 4); ctx.quadraticCurveTo(h.x, h.y - 10, h.x + 24, h.y - 4); ctx.stroke(); }
    drawBlanket(p, ROOM[1].blanket);
    // Schlag auf den Wecker
    const dt = t - lastHit;
    if (dt >= 0 && dt < 0.28) {
      const floor = t >= T.fly + 0.4;
      const [ax, ay] = alarm2Pos(t, p);
      const sx = h.x + 26, sy = h.y + 16, ang = Math.atan2(ay - sy, ax - sx) - Math.PI / 2, len = Math.hypot(ax - sx, ay - sy) + 4;
      arm(sx, sy, ang, Math.min(len, floor ? 90 : 70) * (0.6 + 0.4 * Math.sin(Math.min(1, dt / 0.12) * Math.PI / 2)), CHAR.lila.dark);
    }
  } else if (t < T.exit + 0.45) {
    drawBlanket(p, ROOM[1].blanket);
    const k = ramp(t, T.panic, T.panic + 0.15);
    let x = p.x0 + 80, y = p.y0 + 214 - 25 * (1 - k);
    let o = { who: "lila", feat: "mask", x, y, face: "shock", arms: [2.6, -2.6] };
    if (t > T.panic + 0.3) { // Hose verkehrt anziehen, hüpfen
      const ph = (t - T.panic) * 7;
      o.y -= Math.abs(Math.sin(ph)) * 9; o.x = x + Math.sin(ph * 0.5) * 10; o.face = "panic"; o.pants = true; o.arms = [0.5, -0.5];
    }
    if (t >= T.stumble && t < T.exit) { const s = Math.sin(clamp((t - T.stumble) / 0.45) * Math.PI); o.lean = 0.55 * s; o.y += 6 * s; o.face = "shock"; }
    if (t >= T.exit) { o.x = lerp(x, p.x1 + 40, easeIO(ramp(t, T.exit, T.exit + 0.4))); o.face = "panic"; o.arms = [1.1, -1.1]; o.lean = -0.2; o.y -= Math.abs(Math.sin(t * 22)) * 6; }
    figure(o, t);
    if (t >= T.stumble && t < T.exit + 0.1) stars(o.x, o.y - 112, t, 1);
  } else {
    drawBlanket(p, ROOM[1].blanket);
  }
  // Wecker
  const [ax, ay, ar] = alarm2Pos(t, p);
  drawAlarm(ax, ay, t, ringing2(t), ar);
  if (inBed && !ringing2(t)) zzz(p.x0 + 100, p.y0 + 28, t + 0.4, 0.9);
  return inBed ? 0.4 : 0;
}
// ------------------------------------------------------------ Fenster 3: ???
function pane3(t, p) {
  ctx.fillStyle = ROOM[2].wall; ctx.fillRect(p.x0, p.y0, p.w, p.h);
  drawCurtains(p, 2);
  drawPoster(p, "pic");
  drawLamp(p, 0);
  drawBed(p); drawNightstand(p);
  const sitting = t >= T.climax && t < T.lieDown + 0.15;
  drawPillow(p, sitting ? 1 : 0);
  let phone = 0, faceXY = null;
  if (!sitting) {
    const asleep = t >= T.lieDown + 0.15 || t < T.w3Off;
    const f = t < T.w3Off ? "tired" : (t >= T.alarm3 ? "shock" : (t >= T.lieDown ? "sleep" : "tired"));
    const h = sleeper(p, "grau", f, "hood");
    if (t >= T.lieDown) eyebags(h.x, h.y);
    drawBlanket(p, ROOM[2].blanket);
    faceXY = h;
    phone = t >= T.w3Off && t < T.climax ? 1 : 0;
    if (phone) { circle(h.x - 8, h.y + 22, 5, CHAR.grau.body); circle(h.x + 8, h.y + 22, 5, CHAR.grau.body); holdItem(h.x, h.y + 24, "phone", t); }
  } else {
    drawBlanket(p, ROOM[2].blanket);
    const o = { who: "grau", feat: "hood", x: p.x0 + 76, y: p.y0 + 192, face: t < T.climax + 0.5 ? "wide" : "tired", bags: true, arms: [0.4, -1.3], hold: "phone" };
    if (t >= T.lieDown - 0.25) { o.hold = null; o.arms = [0.2, -0.2]; o.y += ramp(t, T.lieDown - 0.1, T.lieDown + 0.15) * 25; o.face = "tired"; }
    figure(o, t);
    faceXY = { x: o.x, y: o.y - 86 };
    phone = t < T.lieDown - 0.25 ? 1 : 0;
  }
  drawAlarm(p.x1 - 27, p.y0 + 136, t, t < T.w3Off || (t >= T.alarm3 && t < T.out));
  return { phone, faceXY };
}

const sittingPhone = t => t >= T.climax;
function drawCurtains(p, i) {
  ctx.fillStyle = ROOM[i].curtain;
  ctx.fillRect(p.x0, p.y0, 12, p.h); ctx.fillRect(p.x1 - 12, p.y0, 12, p.h);
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(p.x0 + 6, p.y0, 2, p.h); ctx.fillRect(p.x1 - 7, p.y0, 2, p.h);
}
function drawPoster(p, kind) {
  const x = p.x0 + 18, y = p.y0 + 18;
  if (kind === "sun") {
    ctx.fillStyle = "#fff4c9"; ctx.fillRect(x, y, 34, 44);
    ctx.strokeStyle = "#f0a020"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x + 17 + Math.cos(a) * 11, y + 22 + Math.sin(a) * 11); ctx.lineTo(x + 17 + Math.cos(a) * 15, y + 22 + Math.sin(a) * 15); ctx.stroke(); }
    circle(x + 17, y + 22, 8.5, "#f4a422");
  } else if (kind === "moon") {
    ctx.fillStyle = "#3a2a72"; ctx.fillRect(x, y, 30, 42);
    ctx.fillStyle = "#f6f0d8"; ctx.font = "900 20px InterX"; ctx.textAlign = "center"; ctx.fillText("Z", x + 15, y + 29);
  } else {
    ctx.save(); ctx.translate(x + 18, y + 22); ctx.rotate(-0.12);
    ctx.fillStyle = "#e9eef3"; ctx.fillRect(-15, -12, 30, 24); ctx.fillStyle = "#a9c7de"; ctx.fillRect(-12, -9, 24, 18);
    ctx.fillStyle = "#6d9a6a"; ctx.beginPath(); ctx.moveTo(-12, 9); ctx.lineTo(-3, -2); ctx.lineTo(3, 4); ctx.lineTo(7, 0); ctx.lineTo(12, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

function drawPane(t, i) {
  const p = PANES[i];
  ctx.save(); ctx.beginPath(); ctx.rect(p.x0, p.y0, p.w, p.h); ctx.clip();
  let dark = 0, info = null;
  if (i === 0) dark = pane1(t, p);
  if (i === 1) dark = pane2(t, p);
  if (i === 2) { info = pane3(t, p); dark = 0.7; }
  // Fenster 3: Vorhang zu bis zum Höhepunkt, dann fliegt er auf
  if (i === 2) {
    const open = easeOut(ramp(t, T.climax, T.climax + 0.22));
    if (open > 0) dark = 0.7 * (1 - open);
    if (dark > 0) { ctx.fillStyle = `rgba(12,14,38,${dark})`; ctx.fillRect(p.x0, p.y0, p.w, p.h); }
    if (info.phone && info.faceXY) {
      const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      glow(info.faceXY.x, info.faceXY.y + 12, 50, [90, 140, 255], (sittingPhone(t) ? 0.16 : 0.45) * flick);
      ctx.restore();
    }
    if (open < 1) {
      const half = (p.w / 2) * (1 - open);
      for (const s of [0, 1]) {
        const x0 = s ? p.x1 - half - 2 : p.x0, w = half + 2;
        ctx.fillStyle = "#23264d"; ctx.fillRect(x0, p.y0, w, p.h);
        ctx.fillStyle = "rgba(255,255,255,0.05)"; for (let k = 0; k < 4; k++) ctx.fillRect(x0 + (k + 0.5) * w / 4, p.y0, 3, p.h);
      }
      // bläuliches Handy-Leuchten durch den Vorhang
      if (info.phone) {
        const flick = 0.7 + 0.3 * Math.sin(t * 23) * Math.sin(t * 7);
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        glow(p.x0 + 52, p.y0 + 165, 75, [70, 120, 255], 0.38 * flick * (1 - open));
        ctx.fillStyle = `rgba(120,170,255,${0.35 * flick * (1 - open)})`; ctx.fillRect(p.cx - 1.5, p.y0, 3, p.h);
        ctx.restore();
      }
    }
  } else if (dark > 0) { ctx.fillStyle = `rgba(12,14,38,${dark})`; ctx.fillRect(p.x0, p.y0, p.w, p.h); }
  // Licht aus am Ende
  const lo = lightsOut(t);
  if (lo > 0) { ctx.fillStyle = `rgba(12,14,38,${0.6 * lo})`; ctx.fillRect(p.x0, p.y0, p.w, p.h); }
  // Glasreflex
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.beginPath(); ctx.moveTo(p.x0 + p.w * 0.55, p.y0); ctx.lineTo(p.x0 + p.w * 0.75, p.y0); ctx.lineTo(p.x0 + p.w * 0.25, p.y1); ctx.lineTo(p.x0 + p.w * 0.05, p.y1); ctx.fill();
  ctx.restore();
}
function drawWindowFrame() {
  ctx.fillStyle = "#efeae0";
  ctx.fillRect(32, 456, 514, 6); ctx.fillRect(32, 456, 6, 246); ctx.fillRect(540, 456, 6, 246);
  ctx.fillRect(202, 456, 6, 246); ctx.fillRect(371, 456, 6, 246);
  ctx.fillRect(26, 698, 526, 11);
  ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(26, 709, 526, 4);
}
// Schild; flip: 0..1 dreht das Schild um (Rückseite = text2)
function label(text, cx, y, color = "#f3f3f3", flip = 0, text2 = "", color2 = "#ffd84a") {
  ctx.save();
  const show2 = flip > 0.5, sx = Math.abs(Math.cos(flip * Math.PI));
  const tx = show2 ? text2 : text;
  ctx.font = "700 13px InterX"; ctx.letterSpacing = "1.3px";
  const w = ctx.measureText(tx).width + 20;
  ctx.translate(cx, y); ctx.scale(Math.max(0.02, sx), 1);
  ctx.fillStyle = "rgba(26,28,38,0.94)"; rr(-w / 2, -12, w, 24, 12); ctx.fill();
  ctx.fillStyle = show2 ? color2 : color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(tx, 0.7, 1);
  ctx.restore();
}
function snoozeBadge(t) {
  const n = snoozeCount(t); if (n === 0 || t >= T.out) return;
  const last = T.hits[n - 1], s = 1 + 0.35 * Math.exp(-(t - last) * 9);
  ctx.save(); ctx.translate(PANES[1].cx, 412); ctx.scale(s, s); ctx.rotate(-0.04);
  const txt = `SNOOZE ×${n}`;
  ctx.font = "900 13px InterX"; ctx.letterSpacing = "0.8px";
  const w = ctx.measureText(txt).width + 18;
  ctx.fillStyle = n >= 9 ? "#ff3b3b" : "#ff6a3d"; rr(-w / 2, -11, w, 22, 6); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0.4, 1);
  ctx.restore();
}
function drawClock(t) {
  const s = stateAt(CLOCK, t);
  const red = t >= T.climax && t < CLOCK[CLOCK.length - 1][0] ? 1 - ramp(t, 12.6, 13.0) : 0;
  const pop = t >= T.climax && t < 12 ? 1 + 0.16 * Math.exp(-(t - T.climax) * 6) * Math.cos((t - T.climax) * 16) : 1;
  ctx.save(); ctx.translate(288, 262); ctx.scale(pop, pop);
  ctx.font = "900 66px InterX"; ctx.letterSpacing = "0px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(40,20,60,0.22)"; ctx.fillText(s, 1.5, 3);
  ctx.fillStyle = rgb(mix([255, 255, 255], [255, 64, 58], red)); ctx.fillText(s, 0, 0);
  ctx.restore();
}
function drawTitle(t) {
  if (t < T.title1 || t >= T.out) return;
  const a1 = back(ramp(t, T.title1, T.title1 + 0.28)), a2 = back(ramp(t, T.title2, T.title2 + 0.28));
  // dunkler Bereich oben für den Titel
  const g = ctx.createLinearGradient(0, 0, 0, 330);
  g.addColorStop(0, "rgba(20,12,40,0.85)"); g.addColorStop(0.75, "rgba(20,12,40,0.6)"); g.addColorStop(1, "rgba(20,12,40,0)");
  ctx.globalAlpha = ramp(t, T.title1, T.title1 + 0.15); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 330); ctx.globalAlpha = 1;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 35px InterX"; ctx.letterSpacing = "-1px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  if (a1 > 0) { ctx.save(); ctx.translate(288, 168); ctx.scale(a1, a1); ctx.fillStyle = "#fbf7ee"; ctx.fillText("GLEICHER WECKER.", 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.save(); ctx.translate(288, 208); ctx.scale(a2, a2);
    const w1 = ctx.measureText("ANDERE ").width, w2 = ctx.measureText("NACHT.").width, x0 = -(w1 + w2) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#fbf7ee"; ctx.fillText("ANDERE ", x0, 0);
    ctx.fillStyle = "#b98bff"; ctx.fillText("NACHT.", x0 + w1, 0); ctx.restore();
  }
  ctx.restore();
}
function sticker(t) {
  const s = popIn(t, T.sticker, T.out - 0.18, 0.25); if (s <= 0) return;
  ctx.save(); ctx.translate(288, 772); ctx.rotate(-0.12); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 8;
  circle(0, 0, 47, "#ffffff"); ctx.shadowColor = "transparent"; circle(0, 0, 42, "#ffcf33");
  ctx.fillStyle = "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 14px InterX"; ctx.letterSpacing = "0.5px";
  ctx.fillText("WELCHER", 0, -9); ctx.fillText("BIST DU?", 0, 9);
  ctx.restore();
}
// Papier-Körnung (einmal erzeugt)
const grain = (() => {
  const c = document.createElement("canvas"); c.width = 540; c.height = 960;
  const g = c.getContext("2d"), d = g.createImageData(540, 960), r = rng(99);
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 140; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
})();

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // Kamera: langsam ran bis zum Höhepunkt, Ruckeln, zurück
  const z = 1 + 0.04 * easeIO(ramp(t, 8.6, 10.0)) - 0.04 * easeIO(ramp(t, 10.6, 11.4));
  const sh = t >= T.climax && t < 10.5 ? Math.sin(t * 75) * 2.6 * Math.exp(-(t - T.climax) * 7) : 0;
  ctx.translate(288 + sh, 580 + sh * 0.4); ctx.scale(z, z); ctx.translate(-288, -580);
  drawSky(t);
  drawBuilding(t);
  for (let i = 0; i < 3; i++) drawPane(t, i);
  drawWindowFrame();
  snoozeBadge(t);
  label("STEHT SOFORT AUF", PANES[0].cx + 2, 444);
  label("SNOOZE-PROFI", PANES[1].cx, 444);
  label("???", PANES[2].cx, 444, "#f3f3f3", easeIO(ramp(t, T.flip, T.flip + 0.35)) * (t < T.out ? 1 : 0), "SCHLÄFT JETZT ERST");
  // Blasen
  bubble("NUR NOCH 5 MIN …", PANES[1].cx, 508, popIn(t, T.hits[0] + 0.05, 3.1), "speech", [-20, -10]);
  puff(PANES[1].cx, 508, t, 3.15);
  bubble("NUR NOCH EIN VIDEO.", 436, 508, popIn(t, T.w3Bubble, 4.4), "thought", [-18]);
  puff(436, 508, t, 4.45);
  bubble("ZU SPÄT!!", PANES[1].cx - 6, 506, popIn(t, T.panic + 0.05, 9.25, 0.16), "speech", [-12, -6]);
  puff(PANES[1].cx - 6, 506, t, 9.3);
  bubble("OH NEIN.", 454, 510, popIn(t, T.ohNo, T.out - 0.2), "thought", [-22]);
  sticker(t);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  drawClock(t);
  drawTitle(t);
  // Licht aus (Übergang zur Schleife)
  const lo = lightsOut(t);
  if (lo > 0) { ctx.fillStyle = `rgba(10,8,25,${0.35 * lo})`; ctx.fillRect(0, 0, W, H); }
  // Körnung
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.055; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(grain, 0, 0, 1080, 1920);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
};

window.exportEvents = function () {
  const ring2 = [];
  let on = false, start = 0;
  for (let t = 0; t <= DUR; t += 1 / 100) { const r = ringing2(t); if (r && !on) { on = true; start = t; } if (!r && on) { on = false; ring2.push([start, t]); } }
  return {
    duration: DUR,
    clock: CLOCK.slice(1).map(c => c[0]),
    ring1: [0, T.w1Off], ring2, ring3: [[0, T.w3Off], [T.alarm3, T.out]],
    hits: T.hits, lightOn: [T.w1Off, T.panic], jacks: [1.15, T.jackEnd], sips: [4.3, 5.2], pillow: T.pillow, fly: T.fly,
    panic: T.panic, run: [T.panic + 0.3, T.exit + 0.4], stumble: T.stumble, door: T.door, curtain: T.climax, flip: T.flip,
    climax: T.climax, lieDown: T.lieDown, yawn: [1.0, 11.6], snore: [0.3, 7.9], scroll: [T.w1Off, T.climax],
    bubbles: [T.hits[0] + 0.05, T.w3Bubble, T.panic + 0.05, T.ohNo], puffs: [3.15, 4.45, 9.3],
    title: [T.title1, T.title2], sticker: T.sticker, out: T.out,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 66px InterX"), document.fonts.load("700 13px InterX")]);
  return { duration: DUR };
};
