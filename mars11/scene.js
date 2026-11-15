// Rotanien – Grundbausteine (seit Tag 2) – Fortsetzung, 1:1 nach dem Mond-Video „Tag 2“, angepasst auf @einfach..wissen (1080x1920).
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Welt-Koordinaten + Kamera (Mitte, Zoom).
"use strict";
const W = 576, H = 1024, S = 1080 / 576;
const cv = document.getElementById("c");
const MAIN = cv.getContext("2d");
let ctx = MAIN;
// Ebene für Objekte mit Comic-Umriss (Kuppel, Rakete, Astronaut …)
const lc = document.createElement("canvas"); lc.width = 1080; lc.height = 1920; const LCTX = lc.getContext("2d");
const oc = document.createElement("canvas"); oc.width = 1080; oc.height = 1920; const OCTX = oc.getContext("2d");
function compositeOutline(px) {
  OCTX.setTransform(1, 0, 0, 1, 0, 0); OCTX.globalCompositeOperation = "source-over"; OCTX.clearRect(0, 0, 1080, 1920);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; OCTX.drawImage(lc, Math.cos(a) * px, Math.sin(a) * px); }
  OCTX.globalCompositeOperation = "source-in"; OCTX.fillStyle = "#1b1424"; OCTX.fillRect(0, 0, 1080, 1920);
  OCTX.globalCompositeOperation = "destination-out"; OCTX.drawImage(lc, 0, 0); OCTX.drawImage(lc, 0, 0);
  OCTX.globalCompositeOperation = "source-over";
  MAIN.save(); MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.drawImage(oc, 0, 0); MAIN.drawImage(lc, 0, 0); MAIN.restore();
}
const WT = window.WORDS.map(w => w[1]);            // Startzeit je gesprochenem Wort
const wt = i => WT[i];
const SPEECH_END = window.CHUNKS.at(-1).e;
const DUR = SPEECH_END + 0.9;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function circle(x, y, r, c) { if (!(r > 0)) return; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function glow(x, y, r, c, a) {
  if (a <= 0.003 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function outlined(txt, x, y, size, fill, line = "#14223a", lw = 6, weight = 900, align = "center") {
  ctx.font = `${size}px Comic, 'Noto Color Emoji'`; ctx.textAlign = align; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
const CYAN = "#3fd3f2", RED = "#ff4040";

// TAG2_TIMING
// ------------------------------------------------------------ Welt
const HORIZON = 600;
const STARS = (() => { const r = rng(3), a = []; for (let i = 0; i < 260; i++) a.push([r() * 2400 - 900, r() * 1100 - 700, 0.6 + r() * 1.4, r() * 6]); return a; })();
const CRATERS = (() => { const r = rng(9), a = []; for (let i = 0; i < 90; i++) { const y = HORIZON + 10 + Math.pow(r(), 1.3) * 900; a.push([r() * 2600 - 1000, y, 8 + r() * 40 * (0.4 + (y - HORIZON) / 500)]); } return a; })();
const ROCKS = (() => { const r = rng(14), a = []; for (let i = 0; i < 160; i++) { const y = HORIZON + 5 + r() * 900; a.push([r() * 2600 - 1000, y, 2 + r() * 7 * (0.4 + (y - HORIZON) / 400), r()]); } return a; })();
function sky(t) {
  ctx.fillStyle = "#07060b"; ctx.fillRect(-2000, -2500, 5000, HORIZON + 2500);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(x, y, r, "#fff"); }
  ctx.globalAlpha = 1;
  // roter Staubschleier am Horizont
  const g = ctx.createLinearGradient(0, HORIZON - 260, 0, HORIZON);
  g.addColorStop(0, "rgba(160,60,40,0)"); g.addColorStop(1, "rgba(200,90,55,0.55)");
  ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON - 260, 5000, 260);
  // Erde (klein, blau) und Mond Phobos
  const ex = 365, ey = 440;
  glow(ex, ey, 120, "120,190,255", 0.4);
  ctx.save(); ctx.translate(ex, ey); ctx.scale(1.75, 1.75); ctx.translate(-ex, -ey);
  circle(ex, ey, 36, "#1b1424"); circle(ex, ey, 34, "#2e86de");
  ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, 34, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#4cc36a"; for (const [dx, dy, rx, ry] of [[-12, -10, 14, 9], [10, 8, 12, 10], [-4, 18, 9, 5], [16, -16, 7, 5]]) { ctx.beginPath(); ctx.ellipse(ex + dx, ey + dy, rx, ry, 0.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.ellipse(ex - 6, ey - 26, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,30,0.25)"; ctx.beginPath(); ctx.arc(ex + 12, ey + 10, 34, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); ctx.restore();
  circle(40, 300, 9, "#9b8b7e"); circle(37, 298, 3, "#7d6e62");
}
function ground() {
  // ferne Hügel
  ctx.fillStyle = "#8f3a22";
  ctx.beginPath(); ctx.moveTo(-2000, HORIZON + 4);
  for (let x = -2000; x <= 3000; x += 60) ctx.lineTo(x, HORIZON - 10 - 18 * Math.abs(Math.sin(x * 0.004)) - 10 * Math.sin(x * 0.013));
  ctx.lineTo(3000, HORIZON + 4); ctx.fill();
  const g = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 900);
  g.addColorStop(0, "#b4512e"); g.addColorStop(0.3, "#c9653a"); g.addColorStop(1, "#d77446");
  ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON, 5000, 2000);
  for (const [x, y, r] of CRATERS) {
    ctx.fillStyle = "rgba(120,45,25,0.45)"; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(240,150,100,0.35)"; ctx.beginPath(); ctx.ellipse(x + r * 0.08, y + r * 0.08, r * 0.8, r * 0.25, 0, 0, Math.PI); ctx.fill();
  }
  for (const [x, y, r, k] of ROCKS) { ctx.fillStyle = k < 0.5 ? "#7e3720" : "#9a4528"; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.65, 0, Math.PI, 0); ctx.fill(); }
}

const BOULDERS = [[525, 708, 24], [612, 716, 16], [80, 716, 20], [262, 706, 12], [690, 742, 30], [-30, 748, 30], [205, 760, 14], [560, 790, 20]];
function boulders() {
  for (const [x, y, r] of BOULDERS) {
    ctx.fillStyle = "#8c3c22"; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.quadraticCurveTo(x - r * 1.05, y - r * 0.9, x - r * 0.2, y - r * 0.95);
    ctx.quadraticCurveTo(x + r * 0.9, y - r * 1.0, x + r, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,170,120,0.35)"; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.6, r * 0.35, r * 0.18, -0.3, 0, Math.PI * 2); ctx.fill();
  }
}
const DUST = (() => { const r = rng(44), a = []; for (let i = 0; i < 45; i++) a.push([r() * W, r() * H, 0.6 + r() * 1.6, 8 + r() * 18, r() * 6]); return a; })();
function dust(t) {
  for (const [x0, y0, rad, sp, p] of DUST) { const x = (x0 + t * sp) % (W + 20) - 10, y = y0 + Math.sin(t * 0.8 + p) * 8; ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 2 + p); circle(x, y, rad, "#f2b48a"); }
  ctx.globalAlpha = 1;
}
// ------------------------------------------------------------ Objekte
function shadow(x, y, w, a = 0.3) { if (!(w > 0)) return; const m = ctx.getTransform(); MAIN.save(); MAIN.setTransform(m); MAIN.fillStyle = `rgba(70,20,10,${a})`; MAIN.beginPath(); MAIN.ellipse(x, y, w, w * 0.16, 0, 0, Math.PI * 2); MAIN.fill(); MAIN.restore(); }
function rocket(x, y, s, fire) { // y = Unterkante
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (fire > 0) {
    const f = 1 + 0.2 * Math.sin(performance.now ? fire * 50 : 0);
    ctx.fillStyle = "#ffb43a"; ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(0, 60 * fire * f, 14, -6); ctx.fill();
    ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.moveTo(-7, -6); ctx.quadraticCurveTo(0, 32 * fire * f, 7, -6); ctx.fill();
  }
  ctx.fillStyle = "#d9262b"; // Flossen
  ctx.beginPath(); ctx.moveTo(-26, -20); ctx.lineTo(-48, 0); ctx.lineTo(-44, 6); ctx.lineTo(-24, -4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(26, -20); ctx.lineTo(48, 0); ctx.lineTo(44, 6); ctx.lineTo(24, -4); ctx.fill();
  ctx.fillStyle = "#3a3f4a"; ctx.fillRect(-12, -10, 24, 10);
  ctx.fillStyle = "#f6f6f4"; ctx.beginPath(); ctx.moveTo(-28, -10); ctx.bezierCurveTo(-34, -90, -20, -150, 0, -190); ctx.bezierCurveTo(20, -150, 34, -90, 28, -10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.beginPath(); ctx.moveTo(6, -12); ctx.bezierCurveTo(24, -90, 18, -150, 0, -190); ctx.bezierCurveTo(20, -150, 34, -90, 28, -10); ctx.fill();
  ctx.fillStyle = "#e0292e"; ctx.beginPath(); ctx.moveTo(-17, -148); ctx.bezierCurveTo(-12, -165, -6, -180, 0, -190); ctx.bezierCurveTo(6, -180, 12, -165, 17, -148); ctx.closePath(); ctx.fill();
  circle(0, -100, 14, "#2b3a55"); circle(0, -100, 10, "#cfeaf7"); circle(-3, -103, 3, "#fff");
  ctx.fillStyle = "#e0292e"; ctx.fillRect(-3, -60, 6, 48);
  ctx.restore();
}
function dome(x, y) { // Mitte unten
  shadow(x, y + 4, 160, 0.3);
  // Glas
  const g = ctx.createRadialGradient(x - 50, y - 120, 10, x, y - 60, 170);
  g.addColorStop(0, "rgba(232,250,255,0.92)"); g.addColorStop(1, "rgba(170,215,232,0.8)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 150, 140, 0, Math.PI, 0); ctx.fill();
  // innen: Möbel angedeutet
  ctx.fillStyle = "rgba(120,140,160,0.35)"; ctx.fillRect(x - 90, y - 50, 50, 50); ctx.fillRect(x + 50, y - 40, 40, 40);
  ctx.fillStyle = "rgba(220,60,60,0.55)"; ctx.fillRect(x - 20, y - 105, 40, 10);
  // Rahmen
  ctx.strokeStyle = "#e8eef2"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(x, y, 150, 140, 0, Math.PI, 0); ctx.stroke();
  for (const k of [0.33, 0.66]) { ctx.beginPath(); ctx.ellipse(x, y, 150, 140 * k, 0, Math.PI, 0); ctx.stroke(); }
  for (const k of [-0.6, -0.2, 0.2, 0.6]) { ctx.beginPath(); ctx.ellipse(x, y, 150 * Math.abs(k), 140, 0, k < 0 ? Math.PI : 1.5 * Math.PI, k < 0 ? 1.5 * Math.PI : 2 * Math.PI); ctx.stroke(); }
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(x - 70, y - 95, 22, 40, -0.6, 0, Math.PI * 2); ctx.fill();
  // Sockel
  ctx.fillStyle = "#cfd6dc"; rr(x - 156, y - 8, 312, 14, 4); ctx.fill();
  // Schüssel oben
  ctx.strokeStyle = "#c8ced4"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 10, y - 140); ctx.lineTo(x + 10, y - 160); ctx.stroke();
  ctx.fillStyle = "#eef2f5"; ctx.beginPath(); ctx.ellipse(x + 10, y - 166, 22, 9, -0.3, 0, Math.PI * 2); ctx.fill();
  circle(x + 10, y - 166, 3, "#9aa3ab");
  // Schleuse vorne links
  ctx.fillStyle = "#e9edf0"; rr(x - 120, y - 92, 110, 88, 30); ctx.fill();
  ctx.fillStyle = "#c9cfd5"; rr(x - 120, y - 92, 26, 88, 12); ctx.fill();
  circle(x - 55, y - 48, 30, "#5b6470"); circle(x - 55, y - 48, 24, "#2c3440"); circle(x - 63, y - 56, 7, "rgba(255,255,255,0.4)");
}
function sign(x, y, txt = "REGIERUNG") { // Pfosten-Unterkante
  ctx.fillStyle = "#6b6f78"; ctx.fillRect(x - 3, y - 110, 6, 110);
  ctx.save(); ctx.translate(x + 30, y - 120); ctx.rotate(-0.03);
  ctx.fillStyle = "#3a2a1a"; rr(-64, -18, 128, 36, 5); ctx.fill();
  ctx.fillStyle = "#f6ecd4"; rr(-61, -15, 122, 30, 4); ctx.fill();
  ctx.fillStyle = "#2a2a2a"; ctx.font = "900 15px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "1px"; ctx.fillText(txt, 0, 1); ctx.letterSpacing = "0px";
  ctx.restore();
}
function flag(x, y, k, t) { // Mast-Unterkante, k = aufgestellt 0..1
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate((1 - k) * 0.6); ctx.globalAlpha = clamp(k * 3);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -250, 6, 250); circle(0, -254, 9, "#ffd23a");
  const wv = Math.sin(t * 4) * 6;
  ctx.fillStyle = "#4a2b9a";
  ctx.beginPath(); ctx.moveTo(3, -244); ctx.bezierCurveTo(50, -244 + wv, 90, -250 - wv, 130, -244); ctx.lineTo(130, -160); ctx.bezierCurveTo(90, -166 - wv, 50, -160 + wv, 3, -160); ctx.fill();
  // Emblem: roter Planet mit Ring
  ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(66, -202, 34, 9, -0.2, 0, Math.PI * 2); ctx.stroke();
  circle(66, -202, 20, "#e2552e"); circle(60, -208, 6, "#f08a5a");
  ctx.beginPath(); ctx.ellipse(66, -202, 34, 9, -0.2, 0, Math.PI); ctx.stroke();
  for (const [sx, sy] of [[20, -230], [112, -230], [110, -176]]) { ctx.fillStyle = "#fff"; ctx.font = "12px InterX"; ctx.fillText("★", sx, sy); }
  ctx.restore();
}

// Astronaut (Füße bei x, y), s = Größe, f = Gesicht, arm = Winken 0..1, hold = Buch-Zustand
function astronaut(x, y, s, f, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shadow(0, 2, 30, 0.35);
  const wave = o.wave || 0, bob = o.bob || 0;
  ctx.translate(0, -bob);
  // Beine
  const SU = o.suit || "#f2f2f0", SU2 = o.suit2 || "#f7f7f5", SU3 = o.suit3 || "#d9dbe0";
  ctx.fillStyle = SU; rr(-17, -34, 14, 30, 6); ctx.fill(); rr(3, -34, 14, 30, 6); ctx.fill();
  ctx.fillStyle = (o.acc || "#ff8a2a"); rr(-19, -8, 18, 9, 4); ctx.fill(); rr(1, -8, 18, 9, 4); ctx.fill();
  // Rucksack + Körper
  ctx.fillStyle = SU3; rr(-26, -78, 52, 48, 12); ctx.fill();
  ctx.fillStyle = SU2; rr(-22, -76, 44, 46, 14); ctx.fill();
  ctx.fillStyle = (o.acc || "#ff8a2a"); ctx.fillRect(-22, -40, 44, 5);
  ctx.fillStyle = "#2c3a58"; rr(-11, -66, 22, 15, 3); ctx.fill();
  ctx.fillStyle = "#5fd0ff"; for (let i = 0; i < 3; i++) circle(-5 + i * 5, -58.5, 1.8, i === 1 ? "#ffd23a" : "#5fd0ff");
  // Arme
  const armL = o.armL ?? 0.25, armR = wave ? -2.4 + Math.sin(o.t * 14) * 0.45 : (o.armR ?? -0.25);
  for (const [sx, a] of [[-22, armL], [22, armR]]) {
    ctx.save(); ctx.translate(sx, -70); ctx.rotate(a);
    ctx.fillStyle = SU; rr(-6, -2, 12, 30, 6); ctx.fill(); circle(0, 29, 6.5, (o.acc || "#ff8a2a")); ctx.restore();
  }
  // Helm
  const hy = -104;
  circle(0, hy, 30, SU3); circle(0, hy, 27, o.suit ? SU2 : "#f8f8f6");
  ctx.fillStyle = "#1c2a40"; ctx.beginPath(); ctx.ellipse(0, hy + 2, 21, 19, 0, 0, Math.PI * 2); ctx.fill();
  // Gesicht
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, hy + 2, 21, 19, 0, 0, Math.PI * 2); ctx.clip();
  circle(0, hy + 6, 18, "#f2c39b");
  ctx.fillStyle = "#6b3b1e"; ctx.beginPath(); ctx.ellipse(0, hy - 10, 20, 11, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.ellipse(-8, hy - 6, 9, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  faceA(0, hy + 4, f, o.t || 0);
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(-10, hy - 8, 6, 3.5, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#c9ced4"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, hy - 24); ctx.lineTo(18, hy - 38); ctx.stroke(); circle(18, hy - 39, 3, "#ff4b3a");
  ctx.restore();
  if (o.hold) book(x, y - 52 * s, s, o.hold, o.t);
}
function faceA(x, y, f, t) {
  ctx.fillStyle = "#1d1d22"; ctx.strokeStyle = "#1d1d22"; ctx.lineWidth = 1.8; ctx.lineCap = "round";
  const blink = (t % 3.1) < 0.12 && f !== "happy";
  const eyes = (big) => { for (const s of [-1, 1]) { if (blink) { ctx.beginPath(); ctx.moveTo(x + s * 6.5 - 3, y - 3); ctx.lineTo(x + s * 6.5 + 3, y - 3); ctx.stroke(); continue; } circle(x + s * 6.5, y - 3, big ? 4.6 : 3.8, "#fff"); circle(x + s * 6.5 + 0.6, y - 2.6, big ? 2.6 : 2.1, "#1d1d22"); } };
  switch (f) {
    case "happy": for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 6.5, y - 1.5, 3.5, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } ctx.beginPath(); ctx.arc(x, y + 5, 5, 0, Math.PI); ctx.closePath(); ctx.fill(); break;
    case "talk": eyes(false); ctx.beginPath(); ctx.ellipse(x, y + 7, 3.2, 2.4 + 1.6 * Math.abs(Math.sin(t * 18)), 0, 0, Math.PI * 2); ctx.fill(); break;
    case "shock": eyes(true); ctx.beginPath(); ctx.ellipse(x, y + 8, 2.6, 3.4, 0, 0, Math.PI * 2); ctx.fill(); break;
    case "smirk": eyes(false); ctx.beginPath(); ctx.moveTo(x - 4, y + 7); ctx.quadraticCurveTo(x + 1, y + 10, x + 6, y + 5); ctx.stroke(); break;
    case "think": eyes(false); ctx.beginPath(); ctx.moveTo(x - 3, y + 8); ctx.lineTo(x + 3, y + 7); ctx.stroke(); break;
    default: eyes(false); ctx.beginPath(); ctx.arc(x, y + 5, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
}
function book(x, y, s, state, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (state === "closed") {
    ctx.fillStyle = "#2a1f5e"; rr(-24, -18, 48, 34, 3); ctx.fill();
    ctx.fillStyle = "#3d2d86"; rr(-22, -16, 44, 30, 2); ctx.fill();
    ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 1; ctx.strokeRect(-18, -12, 36, 22);
    ctx.fillStyle = "#ffd23a"; ctx.font = "900 7.5px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("GESETZE", 0, -1);
  } else {
    ctx.fillStyle = "#8a6a3a"; rr(-34, -20, 68, 36, 3); ctx.fill();
    ctx.fillStyle = "#fbf6e6"; rr(-32, -18, 31, 32, 2); ctx.fill(); rr(1, -18, 31, 32, 2); ctx.fill();
    ctx.fillStyle = "#333"; ctx.font = "900 6px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("GESETZ 1", -16, -10);
    ctx.fillStyle = RED; ctx.font = "900 15px InterX"; ctx.fillText("?", -16, 3);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 4; i++) ctx.fillRect(6, -10 + i * 6, 20, 1.5);
  }
  ctx.restore();
}
function ghost(x, y, s, a) { // gestrichelter Astronaut mit „?“
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  rr(-20, -76, 40, 72, 14); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -102, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#fff"; ctx.font = "900 22px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", 0, -100);
  ctx.restore();
}
const CROWD = (() => { const r = rng(21), a = []; for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) a.push({ x: 20 + i * 78 + (row % 2) * 39 + (r() - 0.5) * 14, y: 740 + row * 70, s: 0.8 + row * 0.15, d: r() * 0.9 + row * 0.25 }); return a; })();
const PLATZ = 13; // der Geist, auf den „DEIN PLATZ“ zeigt

// ------------------------------------------------------------ Einblendungen (Bildschirm-Koordinaten)
function pill(txt, x, y, s, bg = "#14223a", fg = "#fff", icon = "") {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = "19px Comic, 'Noto Color Emoji'"; ctx.letterSpacing = "1px";
  const w = ctx.measureText(icon + txt).width + 30;
  ctx.fillStyle = bg; rr(-w / 2, -17, w, 34, 17); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(icon + txt, 1, 1);
  ctx.restore();
}
function avatarBadge(x, y, s, checked) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(0, 0, 36, "#fff"); circle(0, 0, 32, "#1b2b48");
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.clip(); ctx.restore();
  ctx.restore();
  astronaut(x, y + 30 * s, 0.42 * s, "happy", { t: 0 });
  if (checked > 0) { ctx.save(); ctx.translate(x + 0, y + 34 * s); ctx.scale(back(checked) * s, back(checked) * s); circle(0, 0, 11, "#fff"); circle(0, 0, 9, "#ff3b5c"); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-1, 3); ctx.lineTo(5, -4); ctx.stroke(); ctx.restore(); }
}
function profileCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16;
  ctx.fillStyle = "#121216"; rr(-245, -105, 490, 210, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.font = "900 24px InterX"; ctx.fillText("Einfach Wissen", -222, -76);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -222, -54);
  const stats = [["1", "Gefolgt"], ["0", "Follower*innen"], ["0", "Likes"]];
  stats.forEach(([n, l], i) => { const x = -222 + i * 110; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(n, x, -24); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10.5px InterX"; ctx.fillText(l, x, -6); });
  if (t >= T.nul) { const k = back(ramp(t, T.nul, T.nul + 0.2)); ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-118, -40, 104 * k, 46, 6); ctx.stroke(); }
  ctx.fillStyle = "#fe2c55"; rr(-222, 16, 190, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -127, 33);
  ctx.fillStyle = "#2c2c33"; rr(-22, 16, 150, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 33);
  ctx.fillStyle = "#2c2c33"; rr(136, 16, 40, 34, 6); ctx.fill(); ctx.fillText("👤", 156, 33);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea";
  ctx.fillText("1 Follow = 1 Astronaut 🚀", -222, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -222, 88);
  ctx.restore();
  avatarBadge(288 + 190 * s, 250 - 60 * s, 0.9 * s, 0);
  if (t >= T.nul + 0.1) { // Stempel „+0 NEUE“
    const k = back(ramp(t, T.nul + 0.1, T.nul + 0.35));
    ctx.save(); ctx.translate(200, 290); ctx.rotate(-0.12); ctx.scale(k * s, k * s);
    ctx.fillStyle = RED; rr(-62, -18, 124, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "900 20px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+0 NEUE", 0, 1);
    ctx.restore();
  }
}
function boardingPass(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 245); ctx.rotate(-0.02); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14;
  ctx.fillStyle = "#fff"; rr(-190, -66, 380, 132, 10); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.fillStyle = CYAN; rr(100, -66, 90, 132, [0, 10, 10, 0]); ctx.fill();
  ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(100, -60); ctx.lineTo(100, 60); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = CYAN; ctx.font = "900 13px InterX"; ctx.letterSpacing = "1.5px"; ctx.fillText("OG-BORDKARTE", -170, -40); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#121a2a"; ctx.font = "900 40px InterX"; ctx.fillText(PASS_LABEL, -172, -2);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 12px InterX"; ctx.fillText("Name: DU?  ·  Sitz: ???  ·  Ziel: MARS", -170, 38);
  ctx.restore();
  astronaut(288 + 145 * s, 245 + 30 * s, 0.45 * s, "happy", { t: 0 });
  ctx.save(); ctx.translate(288 + 150 * s, 245 + 42 * s); ctx.rotate(-0.2); ctx.scale(s, s);
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-22, -13, 44, 26, 5); ctx.stroke(); ctx.fillStyle = RED; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("OG", 0, 1);
  ctx.restore();
}
function commentCard(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 230); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12;
  ctx.fillStyle = "#fff"; rr(-225, -46, 450, 92, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-190, -8, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -190, -7);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -158, -24);
  ctx.fillStyle = "#e3f8fd"; rr(-88, -34, 104, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX"; ctx.fillText("🏆 Top-Kommentar", -82, -23.5);
  ctx.fillStyle = "#111"; ctx.font = "800 19px InterX, 'Noto Color Emoji'"; ctx.fillText("dein Gesetz? 🤔", -158, 2);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten", -158, 26);
  ctx.fillStyle = "#fe2c55"; ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 195, -12);
  ctx.fillStyle = "#8a8f9a"; ctx.font = "700 10px InterX"; ctx.fillText("999+", 195, 10);
  ctx.restore();
}
function calendar(t, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  // Hintergrund: Marshimmel
  ctx.fillStyle = "#1a0f14"; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 500, 0, H); g.addColorStop(0, "#5a2418"); g.addColorStop(1, "#c9653a"); ctx.fillStyle = g; ctx.fillRect(0, 560, W, H);
  ctx.fillStyle = "#5e646e"; ctx.fillRect(130, 600, 12, 260); ctx.fillRect(434, 600, 12, 260);
  ctx.save(); ctx.translate(288, 500); const s = 0.9 + 0.1 * back(ramp(t, T.cal, T.cal + 0.3)); ctx.scale(s, s);
  ctx.fillStyle = "#fff"; rr(-220, -170, 440, 300, 14); ctx.fill();
  ctx.fillStyle = "#e53935"; rr(-220, -170, 440, 60, [14, 14, 0, 0]); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 26px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px"; ctx.fillText("NOVEMBER", 0, -140); ctx.letterSpacing = "0px";
  const days = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
  days.forEach((d, i) => { ctx.fillStyle = i >= 5 ? "#e53935" : "#222"; ctx.font = "900 15px InterX"; ctx.fillText(d, -180 + i * 60, -88); });
  let n = 1;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    const day = r * 7 + c - 5; if (day < 1 || day > 30) continue;
    ctx.fillStyle = c >= 5 ? "#e53935" : "#333"; ctx.font = "700 17px InterX"; ctx.fillText(String(day), -180 + c * 60, -52 + r * 38);
  }
  const x = ramp(t, T.cross, T.cross + 0.25);
  if (x > 0) { ctx.strokeStyle = "#e53935"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-205, -105); ctx.lineTo(lerp(-205, -155, x), lerp(-105, 120, x)); ctx.stroke(); if (x > 0.5) { ctx.beginPath(); ctx.moveTo(-155, -105); ctx.lineTo(lerp(-155, -205, (x - 0.5) * 2), lerp(-105, 120, (x - 0.5) * 2)); ctx.stroke(); } }
  ctx.restore();
  const a = back(ramp(t, T.cal, T.cal + 0.25));
  ctx.save(); ctx.translate(288, 270); ctx.scale(a, a);
  ctx.font = "44px Comic"; const w1 = ctx.measureText("KEIN ").width, w2 = ctx.measureText("MONTAG").width;
  outlined("KEIN ", -(w1 + w2) / 2, 0, 44, "#fff", "#14223a", 8, 900, "left");
  outlined("MONTAG", -(w1 + w2) / 2 + w1, 0, 44, RED, "#14223a", 8, 900, "left");
  if (t >= wt(71)) outlined("MEHR?", 0, 50, 44, "#fff", "#14223a", 8);
  ctx.restore();
  ctx.restore();
}
const CONF = (() => { const r = rng(31), a = []; for (let i = 0; i < 70; i++) a.push({ x: r() * W, vx: (r() - 0.5) * 80, vy: 80 + r() * 120, c: ["#ff4b6e", "#3fd3f2", "#ffd23a", "#7bf27a", "#b06bff"][i % 5], r: r() * 6, d: r() * 0.4 }); return a; })();
function confetti(t, t0) {
  for (const p of CONF) {
    const dt = t - t0 - p.d; if (dt < 0 || dt > 2.2) continue;
    ctx.save(); ctx.globalAlpha = 1 - dt / 2.2; ctx.translate(p.x + p.vx * dt, 60 + p.vy * dt); ctx.rotate(p.r + dt * 6);
    ctx.fillStyle = p.c; ctx.fillRect(-4, -2.5, 8, 5); ctx.restore();
  }
}
function puffs(x, y, t, t0, n = 7) {
  for (let i = 0; i < n; i++) { const k = ramp(t, t0 + i * 0.05, t0 + 1.2 + i * 0.05); if (k <= 0 || k >= 1) continue; const d = i % 2 ? 1 : -1; ctx.globalAlpha = 0.8 * (1 - k); circle(x + d * (20 + i * 12) * easeOut(k), y - 10 - k * 25, 16 + 22 * k, "#e8b79a"); }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Untertitel (Wort für Wort, Block für Block)
function captions(t) {
  const C = window.CHUNKS; let c = null;
  for (let i = 0; i < C.length; i++) if (t >= C[i].s - 0.02) c = C[i];
  if (!c || t > c.e + 0.6 && c === C.at(-1)) return;
  ctx.save(); ctx.font = "38px Comic"; ctx.letterSpacing = "0.5px";
  const sp = ctx.measureText(" ").width;
  const parts = c.w.map(([w, s, col]) => [w, s, col, ctx.measureText(w).width]);
  const tw = parts.reduce((a, p) => a + p[3] + sp, -sp);
  const fit = Math.min(1, 500 / tw); ctx.translate(W / 2, 795); ctx.scale(fit, fit); ctx.translate(-W / 2, -795);
  let x = W / 2 - tw / 2;
  for (const [w, s, col, ww] of parts) {
    const k = ramp(t, s - 0.02, s + 0.1);
    if (k > 0) {
      ctx.save(); ctx.translate(x + ww / 2, 795); const sc = 0.6 + 0.4 * back(k); ctx.scale(sc, sc);
      outlined(w, 0, 0, 38, col === 1 ? CYAN : col === 2 ? RED : col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 10);
      ctx.restore();
    }
    x += ww + sp;
  }
  ctx.restore();
}

// TikTok-Kommentar (dunkel, wie im Original)
function tkComment(s, name, text, ago, likes, avatar, y = 235) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, y); ctx.scale(s, s);
  ctx.font = "800 20px InterX, 'Noto Color Emoji'";
  const words = text.split(" "), lines = [""];
  for (const w of words) { const tl = lines.at(-1) ? lines.at(-1) + " " + w : w; if (ctx.measureText(tl).width > 340 && lines.at(-1)) lines.push(w); else lines[lines.length - 1] = tl; }
  const extra = Math.max(0, lines.length - 2) * 23, top = -58, h = 116 + extra;
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14;
  ctx.fillStyle = "#1e1e22"; rr(-240, top, 480, h, 14); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2; ctx.stroke();
  const g = ctx.createLinearGradient(-230, -40, -170, 20); g.addColorStop(0, "#3a8bff"); g.addColorStop(1, "#3ff2b0");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-196, -10, 31, 0, Math.PI * 2); ctx.fill();
  circle(-196, -10, 28, "#1e1e22");
  if (avatar) { ctx.save(); ctx.beginPath(); ctx.arc(-196, -10, 25, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(avatar, -221, -35, 50, 50); ctx.restore(); }
  else { circle(-196, -10, 25, "#3a4256"); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "700 15px InterX, 'Noto Color Emoji'"; ctx.fillText(name, -152, -32);
  ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX, 'Noto Color Emoji'";
  lines.forEach((l, i) => ctx.fillText(l, -152, -6 + i * 23));
  const by = 40 + extra;
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 13px InterX"; ctx.fillText(`${ago}    Antworten`, -152, by);
  ctx.strokeStyle = "#cfcfd4"; ctx.lineWidth = 2;
  ctx.beginPath(); const hx = 165, hy = by - 6; ctx.moveTo(hx, hy + 7); ctx.bezierCurveTo(hx - 13, hy - 2, hx - 7, hy - 12, hx, hy - 5); ctx.bezierCurveTo(hx + 7, hy - 12, hx + 13, hy - 2, hx, hy + 7); ctx.stroke();
  ctx.fillStyle = "#cfcfd4"; ctx.font = "700 14px InterX"; ctx.fillText(String(likes), 182, by + 1);
  ctx.restore();
}
function stamp(txt, x, y, s, rot = -0.12, col = "#2fd06b") {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = "22px Comic"; const w = ctx.measureText(txt).width + 28;
  ctx.strokeStyle = col; ctx.lineWidth = 4; rr(-w / 2, -20, w, 40, 6); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function label(txt, x, y, s, bg = RED) { // roter, schräger Hinweis („NUR 1 RAKETE?!“)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s);
  ctx.font = "24px Comic"; const w = ctx.measureText(txt).width + 30;
  ctx.fillStyle = bg; rr(-w / 2, -20, w, 40, 10); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
const pop = (t, a, b = 99, d = 0.28) => (t < a || t > b + 0.2 ? 0 : back(ramp(t, a, a + d)) * (1 - ramp(t, b, b + 0.18)));
// ============================================================ Tag 11 „12 Gebäude in 15 Sekunden“ (base.js + helpers3.js + tag11.js -> scene.js)
// Bau-Speedrun: Timer läuft ab Frame 1, jedes Gebäude kracht vom Himmel (Staub, Wackler, Blitz). 7 echte Wünsche aus den Kommentaren
// unter Tag 10 + 5 Extras, dann Alarm-Cliffhanger, Bordkarte Rakete 4 und Aufruf „Was bauen wir als Nächstes?“.
const FOLLOWERS = 837, TALER = 4443;
const INK = "#2b1a3a", CREAM = "#fff6e6", PINK = "#ff4f8b", TEAL = "#19b8a6", GOLD = "#ffd23a";
const SX = 245, CX = 288, GY = 640, HZ = 575;
const T = {
  komm: wt(7), nun: wt(16), start: wt(21), los: wt(25), card0: wt(26), jets: wt(28), sami: wt(35), wo: wt(40), hier: wt(43), lehr: wt(44), plus: wt(47),
  done: wt(56), alarm: wt(57), kommt: wt(58), sich: wt(60), was: wt(61), dein: wt(66),
};
const END = SPEECH_END + 0.8;   // Stimme klingt nach dem letzten Wort noch aus – nie abschneiden
const B = [ // t = Einschlag
  { k: "stadion", t: T.start + 0.14, c: wt(26), u: "voltron_e", av: "voltron", txt: "Ich Bau ein Fußball Stadion" },
  { k: "militaer", t: wt(27), u: "einfachso", av: "einfachso", txt: "Militär base mit Jets zu verteidigung" },
  { k: "zoo", t: wt(30), u: "Mehmet_brb", av: "mehmet", txt: "Bitte ein ZOO" },
  { k: "tierheim", t: wt(31), u: "Aulara44", av: "aulara", txt: "Ein tierheim für mich bitte" },
  { k: "burek", t: wt(32), u: "Jimmbo", av: "jimmbo", txt: "wo ist mein burek haus mit burek kanone" },
  { k: "token", t: wt(34), u: "DerRaul", av: "raul", txt: "ich will ein token haus" },
  { k: "schule", t: wt(43), c: wt(35), u: "sami&zoe", av: "sami", txt: "Wo bin ich" },
  { k: "rampe", t: wt(50) }, { k: "bahn", t: wt(52) }, { k: "wasser", t: wt(53) }, { k: "kuppel", t: wt(54) }, { k: "kino", t: wt(55) },
];
B.forEach((b, i) => { b.out = i < B.length - 1 ? (i === 5 ? T.sami - 0.05 : B[i + 1].t - 0.2) : T.done - 0.12; });
const AV = {};
const BIG = k => ({ stadion: 2.2, schule: 2.15, rampe: 2.3, kino: 2.45 }[k] || 2.6);
T.b = B.map(b => b.t);
const STEPS = []; for (let k = T.alarm + 0.7; k < T.was - 0.1; k += 0.8) STEPS.push(k);

// ------------------------------------------------------------ Bausteine
function box(w, h, c, x0 = 0, r = 5, yb = 0) { ctx.fillStyle = c; rr(x0 - w / 2, yb - h, w, h, r); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(x0 - w / 2, yb - h, w, h, r); ctx.clip(); ctx.fillStyle = "rgba(0,0,0,0.10)"; ctx.fillRect(x0 + w * 0.2, yb - h, w, h); ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(x0 - w / 2, yb - h, w, 5); ctx.restore(); rr(x0 - w / 2, yb - h, w, h, r); ctx.stroke(); }
function tri(w, yb, h, c, x0 = 0) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0 - w / 2, yb); ctx.lineTo(x0, yb - h); ctx.lineTo(x0 + w / 2, yb); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function flat(w, yb, c = "#3a3f4e", h = 12, x0 = 0) { ctx.fillStyle = c; rr(x0 - w / 2, yb - h, w, h, 4); ctx.fill(); ctx.stroke(); }
function win(wx, wy, t, w = 16, h = 14) { const g = 0.75 + 0.25 * Math.sin(t * 2 + wx); ctx.fillStyle = `rgb(255,${Math.round(225 * g + 20)},140)`; rr(wx - w / 2, wy - h / 2, w, h, 3); ctx.fill(); ctx.stroke(); }
function door(dx, w = 14, h = 24, c = "#6b3f1e") { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(dx - w / 2, 0); ctx.lineTo(dx - w / 2, -h + w / 2); ctx.arc(dx, -h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(dx + w / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function sgn(txt, sy, bg = "#2a2a30", fg = GOLD, sz = 9, x0 = 0) { ctx.font = `900 ${sz}px InterX`; const w = ctx.measureText(txt).width + 10; ctx.fillStyle = bg; rr(x0 - w / 2, sy - sz * 0.8, w, sz * 1.6, 3); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 3; ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x0, sy + 0.5); }
function emo(e, ex, ey, sz = 18) { ctx.font = `${sz}px 'Noto Color Emoji'`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, ex, ey); }
function pole(x, h, yb = 0) { ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x, yb - h); ctx.stroke(); }
function wave(x, y, c = "#e5262b", t = 0, w = 14) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 5 + Math.sin(t * 5) * 2); ctx.lineTo(x, y + 10); ctx.fill(); }
function eye(x, y, r = 3) { circle(x, y, r, "#fff"); circle(x + r * 0.2, y + r * 0.1, r * 0.5, INK); }

// ------------------------------------------------------------ die 12 Gebäude (+ Höhle); Unterkante Mitte, lt = Zeit seit Einschlag
function bld(k, x, y, s, t, lt = 9) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(70,20,70,0.25)"; ctx.beginPath(); ctx.ellipse(0, 2, k === "stadion" || k === "schule" ? 64 : 46, 6, 0, 0, Math.PI * 2); ctx.fill();
  switch (k) {
    case "stadion": {
      ctx.fillStyle = "#e9edf5"; ctx.beginPath(); ctx.moveTo(-62, 0); ctx.lineTo(-68, -34); ctx.quadraticCurveTo(0, -56, 68, -34); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let i = -3; i <= 3; i++) { ctx.fillStyle = i % 2 ? "#ff4f8b" : "#3fd3f2"; ctx.fillRect(i * 17 - 6, -30 - (9 - i * i) * 0.9, 12, 5); }
      ctx.fillStyle = "#3bb273"; ctx.beginPath(); ctx.ellipse(0, -14, 50, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(0, -1); ctx.moveTo(8, -14); ctx.arc(0, -14, 8, 0, Math.PI * 2); ctx.stroke(); ctx.strokeRect(34, -20, 10, 12); ctx.strokeRect(-44, -20, 10, 12); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (const d of [-1, 1]) { pole(d * 58, 84); ctx.fillStyle = "#3a3f4e"; rr(d * 58 - 9, -92, 18, 10, 3); ctx.fill(); ctx.stroke(); if (lt > 0.3) { const a = 0.55 + 0.15 * Math.sin(t * 20); ctx.fillStyle = `rgba(255,250,190,${a * 0.5})`; ctx.beginPath(); ctx.moveTo(d * 58, -84); ctx.lineTo(d * 10, -8); ctx.lineTo(d * -30, -8); ctx.closePath(); ctx.fill(); circle(d * 58, -86, 4, "#fffbd0"); } }
      if (lt > 0.35) { const u = ((lt - 0.35) / 0.7) % 1; emo("⚽", lerp(-36, 38, u), -18 - Math.sin(Math.PI * u) * 38, 11); }
      sgn("STADION", -46, "#1c2f6b", "#fff", 8);
      break; }
    case "militaer": {
      box(92, 34, "#6f8f5a"); for (const [bx, by, br] of [[-30, -20, 9], [5, -12, 11], [30, -24, 8], [-8, -28, 6]]) { ctx.fillStyle = "#4f6b40"; ctx.beginPath(); ctx.ellipse(bx, by, br, br * 0.6, 0.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = "#1c2416"; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(4, -14); ctx.arc(22, -14, 18, Math.PI, 0); ctx.lineTo(40, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      box(22, 62, "#7d9c66", -32, 4); win(-32, -44, t, 14, 8); ctx.save(); ctx.translate(-32, -64); ctx.rotate(Math.sin(t * 3) * 0.6); ctx.fillStyle = "#cfd6dc"; ctx.beginPath(); ctx.arc(0, -6, 11, 0.15, Math.PI - 0.15); ctx.closePath(); ctx.fill(); ctx.stroke(); pole(0, 6, 0); ctx.restore();
      circle(-32, -76, 3, Math.sin(t * 10) > 0 ? "#ff3b3b" : "#7a1a1a"); emo("⭐", 22, -44, 12); pole(44, 56); wave(44, -56, "#2f8f4a", t);
      sgn("BASIS", -8, "#2a3a22", "#d9f2c4", 7, -32);
      break; }
    case "zoo": {
      for (let i = -4; i <= 4; i++) pole(i * 11, 16); ctx.beginPath(); ctx.moveTo(-46, -10); ctx.lineTo(46, -10); ctx.stroke();
      // Alien-Giraffe
      ctx.fillStyle = "#b06bff"; ctx.beginPath(); ctx.ellipse(-20, -22, 14, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.save(); ctx.translate(-12, -26); ctx.rotate(Math.sin(t * 3) * 0.08); ctx.fillStyle = "#b06bff"; rr(-4, -44, 8, 46, 4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(2, -48, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); for (const sy of [-34, -22, -10]) circle(0, sy, 2, "#ffe14a"); eye(-2, -50, 2.4); eye(5, -50, 2.4); ctx.lineWidth = 1.5; pole(-2, 8, -53); pole(5, 8, -53); circle(-2, -62, 2, "#5ffff0"); circle(5, -62, 2, "#5ffff0"); ctx.restore(); ctx.lineWidth = 3; pole(-28, 12, 0); pole(-14, 12, 0);
      // dreiäugiger Elefant
      const ey = -18 - Math.abs(Math.sin(t * 5)) * 2; circle(24, ey, 15, INK); circle(24, ey, 13.5, "#7bd0c4"); ctx.fillStyle = "#5fb8ac"; ctx.beginPath(); ctx.ellipse(38, ey - 4, 6, 9, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(14, ey + 3); ctx.quadraticCurveTo(4, ey + 8, 6, ey + 16); ctx.stroke(); ctx.strokeStyle = "#7bd0c4"; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = INK; for (const ex of [17, 23, 29]) eye(ex, ey - 4, 2.2);
      for (const d of [-1, 1]) box(12, 58, "#ffb43a", d * 50, 3); flat(120, -58, "#3bb273", 18); sgn("ZOO", -67, "#fff", "#1f7a48", 11);
      break; }
    case "tierheim": {
      box(74, 42, "#8fd3ff"); tri(88, -42, 28, "#ff8f6b"); win(-22, -24, t); ctx.fillStyle = "#3a2a1a"; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(4, -20); ctx.arc(16, -20, 12, Math.PI, 0); ctx.lineTo(28, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      sgn("TIERHEIM", -48, "#fff", "#d2553a", 7); emo("🐾", 0, -60, 10);
      ctx.restore(); astronaut(x + 16 * s, y, 0.24 * s, "happy", { t, acc: "#ff79c6" });
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      const py = -13 - Math.abs(Math.sin(t * 7)) * 2; for (const d of [-1, 1]) { ctx.fillStyle = "#4fd67a"; ctx.beginPath(); ctx.ellipse(31 + d * 5, py - 5, 2.5, 4.5, d * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } circle(31, py, 7, INK); circle(31, py, 5.8, "#6ff29a"); eye(28.5, py - 1, 1.8); eye(33.5, py - 1, 1.8); circle(31, py + 2.5, 1, INK); pole(31, 5, py - 6); circle(31, py - 12, 1.8, "#ffe14a");
      emo("❤️", 42, -40 - ((t * 20) % 16), 8);
      break; }
    case "burek": {
      box(66, 40, "#f2c27a"); win(-18, -22, t); door(10);
      circle(0, -58, 27, INK); circle(0, -58, 25.5, "#e8a84a"); ctx.strokeStyle = "#a8641e"; ctx.lineWidth = 3.5; ctx.beginPath(); for (let a = 0; a < 15; a += 0.2) { const r = 1.5 * a + 1; const px = Math.cos(a) * r, py = -58 + Math.sin(a) * r; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      sgn("BUREK", -38, "#7a3b12", "#ffe7b8", 8);
      const rc = lt > 0.3 && lt < 0.5 ? -6 * (1 - (lt - 0.3) / 0.2) : 0; ctx.save(); ctx.translate(44 + rc * 0.4, -14 - rc * 0.2); ctx.rotate(-0.55); ctx.fillStyle = "#4a4f5c"; rr(-6, -8, 40, 16, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#2b2f3c"; rr(30, -10, 8, 20, 3); ctx.fill(); ctx.stroke(); ctx.restore(); circle(44, -6, 9, INK); circle(44, -6, 7.5, "#8a5a3a"); circle(44, -6, 2.5, INK);
      if (lt > 0.3 && lt < 0.48) { glow(74, -34, 30, "255,200,80", 0.9); emo("💥", 74, -34, 22); }
      break; }
    case "token": {
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { const cx = -25.5 + c * 17 + (r % 2) * 0, cy = -5 - r * 9; ctx.fillStyle = "#b8860b"; ctx.beginPath(); ctx.ellipse(cx, cy + 2.5, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = (r + c) % 2 ? "#ffd23a" : "#ffe27a"; ctx.beginPath(); ctx.ellipse(cx, cy, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3; }
      door(0, 14, 22, "#7a4a12");
      ctx.save(); ctx.translate(0, -68); ctx.scale(Math.cos(t * 3) * 0.6 + 0.4 > 0 ? Math.max(0.25, Math.abs(Math.cos(t * 3))) : 1, 1); circle(0, 0, 25, INK); circle(0, 0, 23.5, "#ffd23a"); circle(0, 0, 18, "#ffe27a"); ctx.fillStyle = "#b8860b"; ctx.font = "900 24px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("T", 0, 1.5); ctx.restore();
      for (let i = 0; i < 4; i++) { const a = (t * 2 + i * 1.7) % 1; ctx.globalAlpha = Math.sin(Math.PI * a); emo("✨", -40 + i * 27, -30 - i * 13 % 50, 9); ctx.globalAlpha = 1; }
      break; }
    case "schule": {
      box(124, 66, "#ff8f6b"); tri(138, -66, 24, "#b3402e"); ctx.fillStyle = "#fff6e6"; rr(-9, -108, 18, 26, 3); ctx.fill(); ctx.stroke(); circle(0, -96, 6, "#fff"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -96, 6, 0, Math.PI * 2); ctx.moveTo(0, -96); ctx.lineTo(0, -100); ctx.moveTo(0, -96); ctx.lineTo(3, -95); ctx.stroke(); ctx.lineWidth = 3;
      sgn("SCHULE", -73, "#fff", INK, 8);
      const op = easeOut(ramp(lt, 0.15, 0.5));
      ctx.fillStyle = "#fff3d6"; rr(-54, -58, 108, 58, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#c98f5a"; ctx.fillRect(-53, -9, 106, 8);
      ctx.fillStyle = "#1f6b4a"; rr(-48, -53, 70, 36, 3); ctx.fill(); ctx.strokeStyle = "#8a5a3a"; ctx.stroke(); ctx.strokeStyle = INK;
      ctx.fillStyle = "#fff"; ctx.font = "900 9px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("HIER BIST", -13, -41); ctx.fillStyle = GOLD; ctx.fillText("DU! 👋", -13, -28);
      ctx.restore(); astronaut(x + 37 * s, y - 2 * s, 0.4 * s, "happy", { t, acc: "#ff4f8b", armR: -2.4 + Math.sin(t * 5) * 0.3 });
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      if (op < 1) for (const d of [-1, 1]) { ctx.fillStyle = "#8a4a2a"; rr(d > 0 ? 54 - 54 * (1 - op) : -54, -58, 54 * (1 - op), 58, 2); ctx.fill(); ctx.stroke(); }
      break; }
    case "rampe": {
      flat(96, 0, "#8a8f9a", 9); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#ffd23a" : INK; ctx.fillRect(-46 + i * 15.5, -8, 15.5, 3); }
      ctx.lineWidth = 2.5; for (const px of [-40, -26]) pole(px, 96, -9); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-40, -9 - i * 16); ctx.lineTo(-26, -25 - i * 16); ctx.moveTo(-26, -9 - i * 16); ctx.lineTo(-40, -25 - i * 16); ctx.stroke(); } ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(-6, -70); ctx.stroke(); ctx.lineWidth = 3;
      ctx.restore(); rocket(x + 10 * s, y - 9 * s, 0.62 * s, 0); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) { const d = (t * 0.9 + i / 4) % 1; ctx.globalAlpha = 0.6 * (1 - d); circle(10 + (i % 2 ? 1 : -1) * (10 + d * 26), -10 - d * 8, 6 + d * 8, "#fff"); ctx.globalAlpha = 1; }
      sgn("RAKETE 4", -104, "#e5262b", "#fff", 7, -33);
      break; }
    case "bahn": {
      const f = px => -34 - 24 * Math.sin(px * 0.075 + 0.6);
      ctx.lineWidth = 2; for (let px = -54; px <= 54; px += 12) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, f(px)); ctx.stroke(); if (px < 54) { ctx.beginPath(); ctx.moveTo(px, f(px) * 0.5); ctx.lineTo(px + 12, 0); ctx.stroke(); } }
      for (const [lw, c] of [[8, INK], [4.5, "#ff3b5c"]]) { ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath(); for (let px = -58; px <= 58; px += 3) { px === -58 ? ctx.moveTo(px, f(px)) : ctx.lineTo(px, f(px)); } ctx.stroke(); ctx.beginPath(); ctx.arc(8, -42, 17, 0, Math.PI * 2); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 2;
      const u = (t * 0.9) % 1, px = lerp(-56, 56, u), ang = Math.atan2(f(px + 2) - f(px - 2), 4); for (let c = 0; c < 2; c++) { const qx = px - c * 13, qy = f(qx); ctx.save(); ctx.translate(qx, qy - 4); ctx.rotate(ang); ctx.fillStyle = c ? "#3fd3f2" : "#ffd23a"; rr(-6, -5, 12, 9, 3); ctx.fill(); ctx.stroke(); circle(0, -8, 3.2, "#ffd7b0"); ctx.restore(); }
      break; }
    case "wasser": {
      ctx.fillStyle = "#3fb8f2"; ctx.beginPath(); ctx.ellipse(10, -5, 50, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#d9f6ff"; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-10 + i * 22 + Math.sin(t * 3 + i) * 3, -5, 6, 3.6, 5.8); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 3;
      box(16, 78, "#ffb43a", -40, 3); flat(26, -78, "#ff4f8b", 8, -40);
      for (const [lw, c] of [[12, INK], [8, "#5ffff0"]]) { ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(-34, -70); ctx.bezierCurveTo(30, -76, 40, -50, 0, -44); ctx.bezierCurveTo(-30, -38, -10, -16, 28, -10); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const d = (t * 1.6 + i / 5) % 1; circle(30 + (i - 2) * 6 * d * 2, -10 - Math.sin(Math.PI * d) * 22, 2.5 * (1 - d) + 1, "#d9f6ff"); }
      emo("🛟", 44, -8 + Math.sin(t * 4) * 1.5, 11);
      break; }
    case "kuppel": {
      for (const [hx, hc] of [[-24, "#ff6b6b"], [-4, "#ffe14a"], [14, "#7bf27a"]]) { ctx.lineWidth = 2; ctx.fillStyle = hc; rr(hx - 7, -14, 14, 14, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#5a3a6b"; ctx.beginPath(); ctx.moveTo(hx - 9, -14); ctx.lineTo(hx, -23); ctx.lineTo(hx + 9, -14); ctx.closePath(); ctx.fill(); ctx.stroke(); } ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(140,225,255,0.38)"; ctx.beginPath(); ctx.arc(-5, 0, 44, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.ellipse(-5, 0, 22, 44, 0, Math.PI, 0); ctx.moveTo(-43, -22); ctx.quadraticCurveTo(-5, -32, 33, -22); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(-26, -28, 5, 10, 0.7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      box(12, 72, "#4a4f5c", 50, 3); circle(50, -78, 8, INK); circle(50, -78, 6.5, Math.sin(t * 14) > 0 ? "#ff3b3b" : "#ff9a9a");
      if (lt > 0.15) { const a = 0.6 + 0.4 * Math.sin(t * 30); for (const [lw, c] of [[7, `rgba(255,60,60,${0.45 * a})`], [2.5, "#fff"]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(50, -78); ctx.lineTo(150, -150); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 3; }
      break; }
    case "kino": {
      for (const d of [-1, 1]) pole(d * 40, 80); ctx.fillStyle = "#1a1030"; rr(-50, -86, 100, 56, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; rr(-45, -81, 90, 46, 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.rect(-45, -81, 90, 46); ctx.clip(); ctx.fillStyle = "#2a1a55"; ctx.fillRect(-45, -81, 90, 46); circle(-14 + Math.sin(t * 2) * 6, -56, 13, "#ffb43a"); ctx.strokeStyle = "#ffe7b8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-14 + Math.sin(t * 2) * 6, -56, 20, 5, -0.3, 0, Math.PI * 2); ctx.stroke(); emo("🚀", 22, -60 + Math.sin(t * 5) * 3, 13); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(255,255,220,0.22)"; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-45, -35); ctx.lineTo(45, -35); ctx.closePath(); ctx.fill();
      for (let i = -2; i <= 2; i++) { ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.arc(i * 17, 0, 7, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; } emo("🍿", 52, -10, 12); emo("⭐", -40, -98 + Math.sin(t * 4) * 2, 8); emo("⭐", 30, -100 - Math.sin(t * 4) * 2, 8);
      break; }
    case "hoehle": {
      ctx.fillStyle = "#6b5bd6"; ctx.beginPath(); for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI, r = i % 2 ? 44 : 40; const px = Math.cos(a) * r, py = Math.sin(a) * r * 1.15; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1a1030"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 28, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (const d of [-1, 1]) { glow(d * 8, -14, 14, "255,60,60", 0.7); ctx.fillStyle = "#ff4040"; ctx.beginPath(); ctx.ellipse(d * 8, -14, 5, 3, d * 0.4, 0, Math.PI * 2); ctx.fill(); }
      break; }
  }
  ctx.restore();
}

// ------------------------------------------------------------ Bühne (Seitenansicht: fremder Planet)
const STG = (() => { const r = rng(7), st = [], cr = []; for (let i = 0; i < 70; i++) st.push([r() * W, r() * HZ * 0.9, 0.6 + r() * 1.4, r() * 6]); for (let i = 0; i < 22; i++) cr.push([r() * W, HZ + 20 + r() * 430, 10 + r() * 26]); return { st, cr }; })();
function stage(t, hz = HZ) {
  const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, "#160d2e"); g.addColorStop(0.55, "#4a2470"); g.addColorStop(1, "#f08ab8"); ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, hz + 40);
  for (const [x, y, r, p] of STG.st) { if (y > hz - 30) continue; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + p); circle(x, y, r, "#fff"); } ctx.globalAlpha = 1;
  circle(96, Math.min(410, hz - 70), 34, "#19b8a6"); ctx.strokeStyle = "#b8fff6"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(96, Math.min(410, hz - 70), 52, 12, -0.3, 0, Math.PI * 2); ctx.stroke(); circle(500, Math.min(300, hz - 40), 14, "#ffd7ec");
  ctx.fillStyle = "#c66aa0"; ctx.beginPath(); ctx.moveTo(-40, hz); for (let x = -40; x <= W + 40; x += 40) ctx.lineTo(x, hz - 14 - 12 * Math.sin(x * 0.02) - 8 * Math.sin(x * 0.05 + 1)); ctx.lineTo(W + 40, hz + 4); ctx.lineTo(-40, hz + 4); ctx.fill();
  const g2 = ctx.createLinearGradient(0, hz, 0, H); g2.addColorStop(0, "#f7b3d2"); g2.addColorStop(1, "#e88bb8"); ctx.fillStyle = g2; ctx.fillRect(-40, hz, W + 80, H - hz + 40);
  for (const [x, y, r] of STG.cr) { if (y < hz + 14) continue; ctx.fillStyle = "rgba(190,90,140,0.35)"; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(255,225,240,0.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, 3.4, 6.0); ctx.stroke(); }
  for (const [lw, c] of [[26, "rgba(63,211,200,0.35)"], [14, "#3fd3c8"], [4, "#b8fff6"]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.beginPath(); for (let x = -40; x <= W + 40; x += 20) { const y = 905 + Math.sin(x * 0.012 + t * 0.4) * 18; x === -40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
}
function plot(a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(CX, GY + 4, 150, 22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
function dustBurst(x, y, lt, big = 1) { if (lt < 0 || lt > 0.9) return; const k = lt / 0.9; for (let i = 0; i < 10; i++) { const d = i % 2 ? 1 : -1, r = rng(i + 3); ctx.globalAlpha = 0.85 * (1 - k); circle(x + d * (30 + i * 16) * easeOut(k) * big, y - 6 - r() * 40 * k, (14 + 22 * k) * big, "#ffe1ee"); } ctx.globalAlpha = 1;
  ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - ramp(lt, 0, 0.35))})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y, 60 + 380 * easeOut(ramp(lt, 0, 0.35)), 10 + 40 * easeOut(ramp(lt, 0, 0.35)), 0, 0, Math.PI * 2); ctx.stroke(); }
function speedLines(a, col = "255,255,255") { if (a <= 0.01) return; ctx.save(); ctx.translate(CX, 520); for (let i = 0; i < 26; i++) { const r = rng(i + 77), an = i / 26 * Math.PI * 2 + r() * 0.2, r0 = 250 + r() * 90; ctx.strokeStyle = `rgba(${col},${a * (0.4 + r() * 0.5)})`; ctx.lineWidth = 2 + r() * 5; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0 * 1.5); ctx.lineTo(Math.cos(an) * 700, Math.sin(an) * 700 * 1.5); ctx.stroke(); } ctx.restore(); }
function jet(x, y, s, dir = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.5 - i * 0.09; circle(-52 - i * 22, 2, 9 - i, "#fff"); } ctx.globalAlpha = 1; glow(-44, 2, 16, "255,160,60", 0.9);
  ctx.fillStyle = "#7d8a99"; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.lineTo(-30, 26); ctx.lineTo(-14, 26); ctx.lineTo(14, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-34, -2); ctx.lineTo(-44, -20); ctx.lineTo(-34, -20); ctx.lineTo(-22, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#aab6c4"; ctx.beginPath(); ctx.moveTo(48, 2); ctx.quadraticCurveTo(20, -12, -40, -6); ctx.lineTo(-44, 8); ctx.quadraticCurveTo(10, 12, 48, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#5ffff0"; ctx.beginPath(); ctx.ellipse(18, -4, 10, 4.5, -0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); emo("⭐", -12, 1, 9);
  ctx.restore(); }
function fireworks(t, t0) { for (let i = 0; i < 9; i++) { const r = rng(i + 50), st = t0 + i * 0.13, lt = (t - st) % 1.0; if (t < st) continue; const fx = 50 + r() * 470, fy = 250 + r() * 300, col = ["#ffd23a", "#ff4f8b", "#5ffff0", "#fff", "#7bf27a"][i % 5], k = lt / 1.0; for (let j = 0; j < 14; j++) { const a = j / 14 * Math.PI * 2, d = 75 * easeOut(k); ctx.globalAlpha = 1 - k; circle(fx + Math.cos(a) * d, fy + Math.sin(a) * d + 30 * k * k, 4 - 2 * k, col); } } ctx.globalAlpha = 1; }

// ------------------------------------------------------------ HUD
function header(t) {
  ctx.save(); ctx.translate(SX, 146);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-215, -36, 430, 68, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = "900 20px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🪐 ROTANIEN 2.0", 0, -17);
  const chips = [["TAG 11", "#e5262b", "#fff"], [FOLLOWERS + " Bewohner", "#fff", INK], [TALER.toLocaleString("de-DE") + " Taler", GOLD, INK]];
  ctx.font = "900 12.5px InterX"; let wsum = chips.reduce((a, c) => a + ctx.measureText(c[0]).width + 22 + 8, -8), x = -wsum / 2;
  for (const [txt, bg, fg] of chips) { const w = ctx.measureText(txt).width + 22; ctx.fillStyle = bg; rr(x, 0, w, 22, 11); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.fillText(txt, x + w / 2, 11.5); x += w + 8; }
  ctx.restore();
}
function timer(t) {
  const loop = t > END - 0.14; if (t >= T.was && !loop) return;
  const rem = loop ? 15 : Math.max(0, 15 * (1 - Math.max(0, t - T.start) / (T.done - T.start))), done = t >= T.done && !loop, alarm = t >= T.alarm && !loop;
  const n = loop ? 0 : B.filter(b => t >= b.t).length, last = Math.max(...B.filter(b => t >= b.t).map(b => b.t), -9);
  const pu = 1 + 0.12 * Math.exp(-(t - last) * 9) + (done ? 0.1 * Math.exp(-(t - T.done) * 5) : 0) + (rem < 5 && !done ? 0.04 * Math.sin(t * 16) : 0);
  ctx.save(); ctx.translate(SX, 228); ctx.scale(pu, pu);
  const bg = alarm ? `rgb(${Math.round(120 + 60 * (0.5 + 0.5 * Math.sin((t - T.alarm) * 3.2)))},16,34)` : done ? "#1fa35a" : "#e5262b";
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.fillStyle = bg; rr(-150, -30, 300, 60, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  if (alarm) { ctx.textAlign = "center"; ctx.font = "900 34px InterX, 'Noto Color Emoji'"; ctx.globalAlpha = 0.75 + 0.25 * Math.sin((t - T.alarm) * 3.2); ctx.fillText("⚠️ ACHTUNG ⚠️", 0, 2); ctx.globalAlpha = 1; }
  else { ctx.font = "900 44px InterX"; const s = Math.floor(rem), txt = "0:" + String(s).padStart(2, "0"); ctx.fillText(txt, -132, 3); const w = ctx.measureText(txt).width; ctx.font = "900 22px InterX"; ctx.globalAlpha = 0.85; ctx.fillText("." + Math.floor((rem - s) * 10), -132 + w + 2, 11); ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff"; rr(42, -19, 96, 38, 12); ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = INK; ctx.font = "900 24px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText(done ? "12/12" : n + "/12", 90, 2); if (done) { ctx.font = "900 15px InterX, 'Noto Color Emoji'"; } }
  ctx.restore();
  if (!alarm) { // Ladebalken: am Anfang schnell, zum Ende hin immer langsamer (Ease-out)
    const p = loop ? 0 : done ? 1 : clamp((t - T.start) / (T.done - T.start)), f = 1 - Math.pow(1 - p, 2.6), bw = 300, bh = 18;
    ctx.save(); ctx.translate(SX - bw / 2, 264);
    ctx.fillStyle = "rgba(20,10,40,0.55)"; rr(0, 0, bw, bh, 9); ctx.fill();
    if (f > 0.005) { const g = ctx.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, "#3fe08a"); g.addColorStop(0.7, "#9cf05a"); g.addColorStop(1, "#ffd23a"); ctx.fillStyle = g; rr(0, 0, Math.max(bh, bw * f), bh, 9); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, Math.max(bh, bw * f), bh, 9); ctx.clip(); ctx.fillStyle = "rgba(255,255,255,0.28)"; for (let x = -40 + ((t * 60) % 20); x < bw; x += 20) { ctx.beginPath(); ctx.moveTo(x, bh); ctx.lineTo(x + 9, 0); ctx.lineTo(x + 16, 0); ctx.lineTo(x + 7, bh); ctx.fill(); } ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(0, 2, bw, 4); ctx.restore();
      if (!done) glow(bw * f, bh / 2, 16, "255,255,200", 0.8); }
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; rr(0, 0, bw, bh, 9); ctx.stroke();
    ctx.font = "900 13px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 4; const pt = Math.round(f * 100) + " %"; ctx.strokeText(pt, bw / 2, bh / 2 + 1); ctx.fillStyle = "#fff"; ctx.fillText(pt, bw / 2, bh / 2 + 1);
    ctx.restore(); }
}
function card(b, s, hot = 0) { // kleine Kommentarkarte oben
  if (s <= 0.01) return; ctx.save(); ctx.translate(SX, 322); ctx.rotate(-0.015); ctx.scale(s * (1 + 0.06 * hot), s * (1 + 0.06 * hot));
  ctx.font = "800 16px InterX"; const tw = Math.max(150, ctx.measureText(b.txt).width), w = Math.min(430, tw + 78);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-w / 2, -28, w, 56, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = hot ? PINK : INK; ctx.lineWidth = hot ? 5 : 3; ctx.stroke();
  const av = AV[b.av], ax = -w / 2 + 30; circle(ax, 0, 20, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(ax, 0, 19, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, ax - 19, -19, 38, 38); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX"; ctx.fillText("@" + b.u, ax + 28, -13);
  ctx.fillStyle = INK; ctx.font = "800 16px InterX"; const fit = Math.min(1, (w - 74) / tw); ctx.save(); ctx.translate(ax + 28, 8); ctx.scale(fit, 1); ctx.fillText(b.txt, 0, 0); ctx.restore();
  ctx.restore();
}
function tagLabel(txt, x, y, s, bg = PINK, fg = "#fff", rot = -0.04, size = 22) {
  if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.font = `900 ${size}px InterX, 'Noto Color Emoji'`; const w = ctx.measureText(txt).width + 26;
  ctx.fillStyle = bg; rr(-w / 2, -size * 0.8, w, size * 1.6, 9); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 1); ctx.restore();
}
function emptyComment(t, s, y, q) { if (s <= 0.01) return; ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-215, -42, 430, 84, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  circle(-182, -4, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -182, -3);
  ctx.textAlign = "left"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX, 'Noto Color Emoji'"; ctx.fillText("@dein.name  ⭐", -152, -20); ctx.fillStyle = INK; ctx.font = "800 18px InterX, 'Noto Color Emoji'"; ctx.fillText(q, -152, 6);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 190, -4 + Math.sin(t * 6) * 2); ctx.restore(); }
function pass(s, t) { if (s <= 0.01) return; ctx.save(); ctx.translate(SX, 412); ctx.rotate(-0.03); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-205, -70, 410, 140, 12); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#e5262b"; rr(105, -70, 100, 140, [0, 12, 12, 0]); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(105, -62); ctx.lineTo(105, 62); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e5262b"; ctx.font = "900 13px InterX"; ctx.fillText("B O R D K A R T E", -186, -44);
  ctx.fillStyle = "#121a2a"; ctx.font = "900 42px InterX"; ctx.fillText("RAKETE 4", -188, -6);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 13px InterX"; ctx.fillText("Name: DU?   ·   Ziel: ROTANIEN 2.0", -186, 38);
  emo("🚀", 155, -8 + Math.sin(t * 5) * 3, 44); ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.fillText("1 FOLLOW", 155, 36); ctx.fillText("= 1 PLATZ", 155, 50);
  ctx.restore(); }

// ------------------------------------------------------------ Weitwinkel: die ganze Stadt (12 Gebäude + Höhle)
const WIDE = [[86, 478, 0.6, 2], [215, 470, 0.56, 8], [350, 474, 0.6, 10], [84, 592, 0.74, 5], [226, 596, 0.74, 1], [372, 590, 0.74, 3], [506, 600, 0.7, 7], [100, 724, 0.85, 4], [262, 730, 0.82, 0], [420, 724, 0.8, 6], [500, 484, 0.52, 11], [540, 724, 0.62, 9]];
function wide(t, quake = 0, behind = null) {
  stage(t, 400); if (behind) behind();
  ctx.save(); ctx.translate((Math.random() - 0.5) * quake, 0); bld("hoehle", 480, 418, 0.62, t); ctx.restore();
  for (const [x, y, s, i] of WIDE) bld(B[i].k, x, y, s, t, 9);
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // Wackler + Zoom-Punch bei jedem Einschlag
  let sh = 0, zp = 0, fl = 0; const hits = [...T.b, T.jets + 0.25, B[4].t + 0.75, T.done];
  for (const h of hits) if (t >= h) { const d = t - h; sh += 13 * Math.exp(-d * 8); zp += 0.07 * Math.exp(-d * 9); fl += 0.55 * Math.exp(-d * 16); }
  for (const st of STEPS) if (t >= st && t < T.was) sh += (2 + 7 * ramp(st, T.alarm, T.was)) * Math.exp(-(t - st) * 9);   // schwere Schritte, immer näher
  if (t >= T.jets && t < T.jets + 0.9) sh += 4;
  const r = rng(Math.floor(t * 60) + 1); ctx.save(); ctx.translate(CX + (r() - 0.5) * 2 * sh, 600 + (r() - 0.5) * 2 * sh); ctx.scale(1 + zp, 1 + zp); ctx.translate(-CX, -600);

  if (t < T.done) { // ---------- Speedrun
    stage(t); plot(1);
    if (t < T.start) { // ---------- Einstieg: Folgen + Kommentieren, dann „Nun bauen wir unsere Stadt“
      const out = 1 - ramp(t, T.start - 0.15, T.start);
      for (let i = 0; i < 5; i++) { const t0 = -0.12 + i * 0.16, lt = t - t0, fall = lt < 0.12 ? lerp(-500, 0, Math.pow(clamp(lt / 0.12), 2)) : 0, jump = t >= T.nun ? Math.abs(Math.sin((t - T.nun) * 9 + i)) * 26 : 0, ax = 96 + i * 96;
        if (lt >= 0) { astronaut(ax + (1 - out) * (i < 2.5 ? -400 : 400), GY + 14 + fall - jump, 1.15, "happy", { t, acc: ["#ff4f8b", "#3fd3f2", "#ffd23a", "#7bf27a", "#b06bff"][i], armR: t >= T.nun ? -2.6 : undefined }); if (lt < 0.8) dustBurst(ax, GY + 10, lt - 0.12, 0.45); } }
      const fb = pop(t, -1, T.nun - 0.1) * (1 + 0.06 * Math.sin(t * 10)); ctx.save(); ctx.translate(SX, 334); ctx.scale(fb * 1.25, fb * 1.25); ctx.fillStyle = "#fe2c55"; rr(-150, -28, 300, 56, 14); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 26px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("➕ Folgen = dabei sein", 0, 1); ctx.restore();
      emptyComment(t, pop(t, T.komm, T.nun - 0.1), 432, "Was willst du in der Stadt? 👇");
      tagLabel("🏗️ JETZT WIRD GEBAUT!", SX, 340, pop(t, T.nun, T.start - 0.12), GOLD, INK, -0.04, 28);
    }
    const built = B.filter(b => t >= b.out);
    built.forEach(b => { const i = B.indexOf(b), k = easeOut(ramp(t, b.out, b.out + 0.22)); bld(b.k, lerp(CX, 34 + i * 46, k), lerp(GY, HZ + 4, k), lerp(BIG(b.k), 0.3, k), t, 9); });
    const cur = B.filter(b => t >= b.t - 0.2 && t < b.out).at(-1);
    if (cur) { const lt = t - cur.t, big = BIG(cur.k), fall = lt < 0 ? lerp(-620, 0, Math.pow(ramp(t, cur.t - 0.2, cur.t), 2)) : 0, sq = lt >= 0 ? 0.22 * Math.exp(-lt * 10) * Math.cos(lt * 22) : -0.1;
      ctx.save(); ctx.translate(CX, GY + fall); ctx.scale(1 + sq, 1 - sq); bld(cur.k, 0, 0, big, t, lt); ctx.restore();
      dustBurst(CX, GY, lt, 1.2);
      if (cur.k === "militaer" && t >= T.jets) { const u = (t - T.jets) / 0.9; jet(lerp(-140, 760, u), 430 - 60 * u, 1.5); jet(lerp(-320, 640, u), 520 - 80 * u, 1.15); speedLines(0.7 * Math.sin(Math.PI * clamp(u))); tagLabel("CHEF: EINFACHSO 🫡", CX, 690, pop(t, T.jets + 0.3, cur.out - 0.1), "#2f8f4a", "#fff", -0.03, 22); }
      if (cur.k === "token") for (let i = 0; i < 12; i++) { const rr2 = rng(i + 9), d = ((lt * 1.3 + rr2()) % 1); emo("🪙", 60 + rr2() * 460, lerp(300, 660, d), 20); }
      if (cur.k === "schule") { speedLines(0.6 * (1 - ramp(lt, 0.1, 0.7)), "255,240,150"); tagLabel("LEHRERIN: SAMI&ZOE 👩‍🏫", CX, 690, pop(t, T.lehr, cur.out - 0.1), PINK, "#fff", -0.03, 22); }
      if (cur.k === "burek" && lt > 0.34) { const u = ramp(lt, 0.34, 0.75), bs = lerp(0.3, 13, u * u); if (u < 1) { ctx.save(); ctx.translate(lerp(CX + 170, CX, u), lerp(GY - 80, 520, u)); ctx.rotate(u * 7); ctx.scale(bs, bs); circle(0, 0, 27, INK); circle(0, 0, 25.5, "#e8a84a"); ctx.strokeStyle = "#a8641e"; ctx.lineWidth = 3.5; ctx.beginPath(); for (let a = 0; a < 15; a += 0.2) { const q = 1.5 * a + 1; a ? ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q) : ctx.moveTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.stroke(); ctx.restore(); speedLines(u, "255,220,150"); }
        else { const d = lt - 0.75; ctx.fillStyle = `rgba(232,168,74,${0.9 * (1 - ramp(d, 0.05, 0.45))})`; ctx.fillRect(-40, -40, W + 80, H + 80); if (d < 0.45) { ctx.globalAlpha = 1 - ramp(d, 0.15, 0.45); emo("💥", CX, 520, 260); ctx.globalAlpha = 1; } } }
      if (lt >= 0 && cur.k !== "schule" && !(cur.k === "militaer" && t >= T.jets + 0.3)) tagLabel(B.indexOf(cur) < 7 ? "✅ GEBAUT!" : "✅ EXTRA " + (B.indexOf(cur) - 6) + "/5", CX, 690, pop(t, cur.t + 0.12, cur.out - 0.08, 0.2), B.indexOf(cur) < 7 ? "#1fa35a" : GOLD, B.indexOf(cur) < 7 ? "#fff" : INK, -0.04, 24);
    }
    if (t >= T.sami - 0.05 && t < T.hier - 0.2) { // „Wo bin ich?“ – leerer Bauplatz, Suchscheinwerfer
      const u = t - T.sami; ghost(CX, GY, 1.5, 0.9); const sx = CX + Math.sin(u * 4) * 150; ctx.fillStyle = "rgba(255,250,200,0.22)"; ctx.beginPath(); ctx.moveTo(sx - 20, 290); ctx.lineTo(sx + 20, 290); ctx.lineTo(sx + 90, GY + 10); ctx.lineTo(sx - 90, GY + 10); ctx.closePath(); ctx.fill();
      if (t >= T.wo + 0.25) { ctx.fillStyle = `rgba(10,5,25,${0.55 * ramp(t, T.wo + 0.25, T.wo + 0.5)})`; ctx.fillRect(-40, -40, W + 80, H + 80); emo("❓", CX, 520, 120 * pop(t, T.wo + 0.3, T.hier - 0.25)); }
    }
  } else if (t < T.was) { // ---------- Geschafft! -> „Achtung … etwas nähert sich …“ (langsam, unheimlich)
    const dk = easeIO(ramp(t, T.alarm - 0.1, T.alarm + 1.4)), k = easeIO(ramp(t, T.alarm + 0.3, T.was - 0.15)), open = easeOut(ramp(t, T.sich + 0.15, T.sich + 0.9));
    const z = lerp(1.35, 1, easeOut(ramp(t, T.done, T.done + 1.1))) + 0.14 * easeIO(ramp(t, T.alarm, T.was)); ctx.save(); ctx.translate(CX, 560); ctx.scale(z, z); ctx.translate(-CX + lerp(-60, 0, easeOut(ramp(t, T.done, T.done + 1.1))), -560);
    wide(t, 0, () => { if (k <= 0) return; // riesiger Schatten steigt langsam hinter dem Horizont auf
      const cy = 400 + 250 * (1 - k) - 40, br = 0.5 + 0.5 * Math.sin(t * 2.2); ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, W + 400, 200 + 388 - 8 * Math.sin(CX * 0.02)); ctx.clip();   // nur im Himmel: steigt hinter dem Horizont auf
      ctx.fillStyle = `rgba(12,4,22,${0.96 * Math.min(1, k * 1.6)})`; ctx.beginPath(); ctx.ellipse(CX + 10, cy, 245, 150 + 4 * br, 0, Math.PI, 0); ctx.lineTo(CX + 255, 410); ctx.lineTo(CX - 235, 410); ctx.closePath(); ctx.fill();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(CX + 10 + d * 120, cy - 110); ctx.quadraticCurveTo(CX + 10 + d * 200, cy - 190, CX + 10 + d * 230, cy - 250); ctx.quadraticCurveTo(CX + 10 + d * 160, cy - 170, CX + 10 + d * 60, cy - 140); ctx.fill(); }
      if (open > 0) for (const d of [-1, 1]) { const ex = CX + 10 + d * 72, ey = cy - 22; glow(ex, ey, 70, "255,50,30", 0.85 * open); ctx.fillStyle = "#ffdf4a"; ctx.beginPath(); ctx.ellipse(ex, ey, 38, 17 * open, d * 0.28, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#1a0510"; ctx.beginPath(); ctx.ellipse(ex + d * -4, ey, 6, 15 * open, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); });
    if (t >= T.alarm) { const u = t - T.alarm; for (let i = 0; i < 2; i++) { const d = (u * 0.6 + i / 2) % 1; ctx.strokeStyle = `rgba(255,50,50,${0.8 * (1 - d)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(202, 540, 10 + d * 110, 0, Math.PI * 2); ctx.stroke(); } }   // Radar pingt langsam
    ctx.restore();
    if (t < T.alarm) { fireworks(t, T.done); speedLines(0.6 * (1 - ramp(t, T.done, T.done + 0.5)), "255,230,120"); tagLabel("12 / 12 GEBAUT! 🏆", CX, 330, pop(t, T.done + 0.05, T.alarm - 0.08), GOLD, INK, -0.04, 30); }
    if (dk > 0) { ctx.fillStyle = `rgba(10,5,30,${0.6 * dk})`; ctx.fillRect(-40, -40, W + 80, H + 80);                        // es wird Nacht
      ctx.fillStyle = `rgba(150,20,40,${dk * (0.08 + 0.07 * Math.sin((t - T.alarm) * 3.2))})`; ctx.fillRect(-40, -40, W + 80, H + 80);   // langsames rotes Pulsieren
      for (let i = 0; i < 5; i++) { const fx = ((i * 170 + (t - T.alarm) * (18 + i * 6)) % (W + 400)) - 200, fy = 470 + i * 70; ctx.fillStyle = `rgba(190,170,230,${0.13 * dk})`; ctx.beginPath(); ctx.ellipse(fx, fy, 230, 34, 0, 0, Math.PI * 2); ctx.fill(); }   // Nebel
      const vg2 = ctx.createRadialGradient(CX, 520, 120, CX, 520, 620); vg2.addColorStop(0, "rgba(0,0,0,0)"); vg2.addColorStop(1, `rgba(0,0,0,${0.55 * dk})`); ctx.fillStyle = vg2; ctx.fillRect(-40, -40, W + 80, H + 80); }
  } else { // ---------- Bordkarte + Aufruf
    stage(t);
    for (let i = 0; i < 12; i++) if (i !== 7) bld(B[i].k, 34 + i * 46, HZ + 4, 0.3, t, 9);
    if (t < T.was) { bld("rampe", CX, GY, 2.2, t, 9); pass(pop(t, T.follow, T.was - 0.1), t);
      const a = pop(t, T.follow + 0.25, T.was - 0.1) * (1 + 0.06 * Math.sin(t * 9)); ctx.save(); ctx.translate(SX, 296); ctx.scale(a, a); ctx.fillStyle = "#fe2c55"; rr(-105, -22, 210, 44, 12); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 20px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("➕ Folgen = einsteigen", 0, 1); ctx.restore(); }
    else { bld("rampe", 34 + 7 * 46, HZ + 4, 0.3, t, 9); plot(0.6 + 0.4 * Math.sin(t * 8));
      const a = pop(t, T.was, 99); ctx.save(); ctx.translate(CX, GY); ctx.rotate(Math.sin(t * 4) * 0.03); ctx.scale(a, a); ctx.strokeStyle = INK; ctx.lineWidth = 4; for (const d of [-1, 1]) { ctx.fillStyle = "#8a5a3a"; rr(d * 90 - 7, -70, 14, 74, 3); ctx.fill(); ctx.stroke(); } ctx.fillStyle = "#ffd23a"; rr(-150, -150, 300, 92, 10); ctx.fill(); ctx.stroke(); for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? INK : "#ffd23a"; ctx.fillRect(-146 + i * 29.2, -150 + 80, 29.2, 8); }
      ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 24px InterX, 'Noto Color Emoji'"; ctx.fillText("🚧 BAUPLATZ FREI 🚧", 0, -126); ctx.font = "900 34px InterX"; ctx.fillStyle = "#e5262b"; ctx.fillText(["?", "? ?", "? ? ?"][Math.floor(t * 3) % 3], 0, -92); ctx.restore();
      emptyComment(t, pop(t, T.was + 0.15, 99), 360, "Was bauen wir als Nächstes? 👇");
      tagLabel("🏆 MEISTE LIKES = WIRD GEBAUT", SX, 445, pop(t, T.dein, 99) * (1 + 0.04 * Math.sin(t * 8)), PINK, "#fff", -0.03, 19); }
  }
  ctx.restore();
  // Kommentarkarten (kurz, klein, oben)
  for (const b of B) if (b.u) { const c0 = b.c ?? b.t - 0.12, c1 = b.k === "schule" ? T.lehr + 0.6 : Math.min(b.out - 0.1, c0 + 1.5); card(b, pop(t, c0, c1, 0.18), b.k === "schule" && t >= T.wo && t < T.hier ? 1 : 0); }
  if (t >= T.plus - 0.05 && t < T.done) tagLabel("+ 5 EXTRAS!", SX, 322, pop(t, T.plus, T.done - 0.1), GOLD, INK, -0.04, 28);
  if (fl > 0.02) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.6, fl)})`; ctx.fillRect(0, 0, W, H); }
  header(t); timer(t);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.85); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,10,50,0.35)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  captions(t);
};
window.exportEvents = function () { return { duration: END, T }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const k of new Set(B.map(b => b.av).filter(Boolean))) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = k + ".png"; });
  return { duration: END };
};
