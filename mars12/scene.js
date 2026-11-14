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
function creature(x, y, s, t, o = {}) { // das Pluto-Wesen (Füße unten). o.eyes 0..1, o.point 0..1, o.sniff, o.munch, o.sit
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const breath = 1 + 0.015 * Math.sin(t * 2.5);
  const bodyH = o.sit ? 150 : 190;
  // Füße
  if (!o.sit) for (const d of [-1, 1]) { ctx.fillStyle = "#4b3fa8"; ctx.beginPath(); ctx.ellipse(d * 70, -10, 48, 22, 0, 0, Math.PI * 2); ctx.fill(); for (let k = -1; k <= 1; k++) { ctx.fillStyle = "#f2f6ff"; ctx.beginPath(); ctx.moveTo(d * 70 + k * 18 - 6, 4); ctx.lineTo(d * 70 + k * 18, 16); ctx.lineTo(d * 70 + k * 18 + 6, 4); ctx.fill(); } }
  // Körper mit Fell
  ctx.save(); ctx.translate(0, -bodyH - 10); ctx.scale(breath, breath);
  ctx.fillStyle = o.dark ? "#141226" : "#6b5bd6"; ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, r = 1 + (i % 2 ? 0.07 : 0), rx = 165 * r, ry = bodyH * r; const px = Math.cos(a) * rx, py = Math.sin(a) * ry; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fill();
  if (o.dark) { for (const d of [-1, 1]) { ctx.fillStyle = "#141226"; ctx.beginPath(); ctx.moveTo(d * 70, -bodyH * 0.85); ctx.lineTo(d * 110, -bodyH * 1.25); ctx.lineTo(d * 105, -bodyH * 0.8); ctx.fill(); }
    const e = o.eyes ?? 1; if (e > 0) for (const d of [-1, 1]) { ctx.globalAlpha = e; glow(d * 55, -bodyH * 0.35, 90, "255,230,80", 0.6); circle(d * 55, -bodyH * 0.35, 26, "#ffe14a"); circle(d * 55, -bodyH * 0.33, 11, "#1b1424"); ctx.globalAlpha = 1; }
    ctx.restore(); ctx.restore(); return; }
  ctx.fillStyle = "#9d92ee"; ctx.beginPath(); ctx.ellipse(0, bodyH * 0.35, 100, bodyH * 0.55, 0, 0, Math.PI * 2); ctx.fill();   // Bauch
  ctx.strokeStyle = "rgba(60,45,150,0.5)"; ctx.lineWidth = 4; for (let i = 0; i < 14; i++) { const a = i * 0.9, px = Math.cos(a) * 120, py = Math.sin(a) * bodyH * 0.7; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 8, py + 16); ctx.stroke(); }
  // Hörner (Eis)
  for (const d of [-1, 1]) { ctx.fillStyle = "#cfeaff"; ctx.beginPath(); ctx.moveTo(d * 70, -bodyH * 0.85); ctx.lineTo(d * 110, -bodyH * 1.25); ctx.lineTo(d * 105, -bodyH * 0.8); ctx.fill(); }
  // Augen
  const e = o.eyes ?? 1;
  for (const d of [-1, 1]) { circle(d * 55, -bodyH * 0.35, 34, "#2a2060"); if (e > 0) { ctx.globalAlpha = e; glow(d * 55, -bodyH * 0.35, 80, "255,230,80", 0.5); circle(d * 55, -bodyH * 0.35, 30, "#ffe14a"); const lk = o.look || 0; circle(d * 55 + lk * 10, -bodyH * 0.33, 13, "#1b1424"); circle(d * 55 + lk * 10 - 5, -bodyH * 0.38, 5, "#fff"); ctx.globalAlpha = 1; } }
  // Nase (schnuppert)
  const sn = o.sniff ? Math.sin(t * 30) * 4 : 0;
  ctx.fillStyle = "#ff8fb8"; ctx.beginPath(); ctx.ellipse(0, -bodyH * 0.12 + sn * 0.3, 20 + sn, 13, 0, 0, Math.PI * 2); ctx.fill();
  // Maul
  const mo = o.munch ? 6 + Math.abs(Math.sin(t * 9)) * 22 : o.roar ? 40 : 8;
  ctx.fillStyle = "#2a1040"; ctx.beginPath(); ctx.ellipse(0, bodyH * 0.12, o.happy ? 60 : 50, mo, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 30 - 8, bodyH * 0.12 - mo + 2); ctx.lineTo(d * 30, bodyH * 0.12 - mo + 18); ctx.lineTo(d * 30 + 8, bodyH * 0.12 - mo + 2); ctx.fill(); }
  if (o.cheeks) for (const d of [-1, 1]) { ctx.fillStyle = "#8a7ce6"; ctx.beginPath(); ctx.ellipse(d * 70, bodyH * 0.05, 38, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(255,150,190,0.55)"; ctx.beginPath(); ctx.ellipse(d * 74, bodyH * 0.08, 18, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  // Arme
  const pt = o.point || 0;
  for (const d of [-1, 1]) {
    ctx.save(); ctx.translate(d * 150, 0); const raise = o.roar ? -1.2 : 0;
    ctx.rotate(d === 1 ? lerp(0.5 + raise, -1.15, pt) : -0.5 - raise);
    ctx.fillStyle = "#5a4bc4"; rr(-28, -10, 56, 140 + (d === 1 ? 40 * pt : 0), 26); ctx.fill();
    const cl = 130 + (d === 1 ? 40 * pt : 0); ctx.fillStyle = "#f2f6ff";
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 14 - 6, cl); ctx.lineTo(k * 14 + (d === 1 && pt > 0.5 && k === 0 ? 0 : 0), cl + (d === 1 && k === 0 ? 30 + 30 * pt : 26)); ctx.lineTo(k * 14 + 6, cl); ctx.fill(); }
    if (o.munch && d === 1) doner(0, cl - 10, 2.2);
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}
function doner(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(3, -22); ctx.lineTo(-3, -22); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-8, -10, 16, 12); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-9, -2, 18, 3); ctx.restore(); }
// ============================================================ Tag 12 „1 von 100 Truhen“ – Konstanten (vor lib11.js geladen)
const FOLLOWERS = 835, TALER = 4474;
const INK = "#2b1a3a", CREAM = "#fff6e6", PINK = "#ff4f8b", TEAL = "#19b8a6", GOLD = "#ffd23a";
const SX = 245, CX = 268, GY = 640, HZ = 575;
const AV = {};
const BT = 60 / 130, bt = n => n * BT;   // Beat-Raster 130 BPM: alles Wichtige liegt auf einem Beat
// Bausteine aus Tag 11 (mars11/tag11.js), unverändert übernommen bis auf TAG-Nummer und Bordkarten-Abriss
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
function header(t) {
  ctx.save(); ctx.translate(SX, 146);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-215, -36, 430, 68, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = "900 20px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🪐 ROTANIEN 2.0", 0, -17);
  const chips = [["TAG 12", "#e5262b", "#fff"], [FOLLOWERS + " Bewohner", "#fff", INK], [TALER.toLocaleString("de-DE") + " Taler", window.talerCol ? talerCol(t) : GOLD, window.talerCol && talerCol(t) !== GOLD ? "#fff" : INK]];
  ctx.font = "900 12.5px InterX"; let wsum = chips.reduce((a, c) => a + ctx.measureText(c[0]).width + 22 + 8, -8), x = -wsum / 2;
  for (const [txt, bg, fg] of chips) { const w = ctx.measureText(txt).width + 22; ctx.fillStyle = bg; rr(x, 0, w, 22, 11); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.fillText(txt, x + w / 2, 11.5); x += w + 8; }
  ctx.restore();
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
  emo("🚀", 155, -8 + Math.sin(t * 5) * 3, 44); ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.fillText("EIN-", 155, 36); ctx.fillText("STEIGEN", 155, 50);
  ctx.restore(); }
// ============================================================ Tag 12 „1 von 100 Truhen“ (base.js + helpers3.js + lib6c.js + pre12.js + lib11.js + tag12.js -> scene.js)
// Token-Jagd: Ein Piratenschiff (die gelben Augen aus Tag 11 waren seine Fenster) kippt 100 Truhen auf Rotanien. Zähler „GEÖFFNET x/100“,
// 5 Wünsche aus den Kommentaren unter Tag 11 springen aus Truhen, Speed-Montage bis 99, Truhe 100 öffnet sich – Schnitt, bevor man sieht, was drin ist.
// Story: Die gelben Augen aus Tag 11 sind die Fenster eines Weltraumpiraten-Schiffs. Deal der Piraten: Findet Rotanien den Token, ist alles gratis,
// wenn nicht, nehmen sie die Stadtkasse (die Taler oben). Die Truhen sind Piratenbeute – was gefunden wird, darf Rotanien behalten.
// Stimme ElevenLabs „Chris“ (Satz für Satz, voice12.py), Zeiten aus timeline12.py (timeline.js): jedes Schlüsselwort liegt auf dem Beat, auf dem die Truhe aufspringt.
const T = window.TL.T;
const END = T.end;
const CHX = {
  bank: { u: "berat_bulut", av: "berat", txt: "Wie wär's mit einer Bank" }, flughafen: { u: "Noam", av: "noam", txt: "Flughafen bitteeee ich bin der Pilot" },
  laden: { u: "sami&zoe", av: "sami", txt: "können wir ein new Yorker haben" }, bunker: { u: "Minimaus", av: "minimaus", txt: "Bunker" },
  soldaten: { u: "einfachso", av: "einfachso", txt: "Ich brauche Soldaten wer kommt ins Team ?" },
};
const CH = window.TL.CH.map(c => ({ ...c, ...(CHX[c.k] || {}) }));
const DUDS = ["🥔", "🦆", "🥙", "💨", "🕸️", "👞", "🧦", "🥔"].map((e, k) => ({ e, t: window.TL.DUDS[k], n: [60, 66, 72, 80, 86, 92, 96, 99][k] }));
function talerCol(t) { // Stadtkasse in Gefahr: Taler-Chip blinkt rot
  const hot = (t >= T.kasse && t < CH[0].s) || (t >= T.c100 && t < T.open);
  return hot && Math.sin(t * 14) > -0.2 ? "#e5262b" : GOLD; }
const RAIN = (() => { const r = rng(12), a = []; for (let i = 0; i < 30; i++) a.push({ ts: -0.32 + i * 0.058, x: 40 + r() * 440, y: GY - 25 + r() * 95, s: 0.55 + r() * 0.35, rot: (r() - 0.5) * 0.5, sp: r() }); return a.sort((p, q) => p.y - q.y); })();
const ROW = ["stadion", "militaer", "zoo", "tierheim", "burek", "token", "schule", "rampe", "bahn", "wasser", "kuppel", "kino"];

// ------------------------------------------------------------ Zähler „GEÖFFNET x/100“
function count(t) {
  if (t >= T.loop || t < CH[0].t) return 0;
  if (t >= T.open) return 100;
  if (t >= T.mont) return DUDS.filter(d => t >= d.t).at(-1)?.n ?? 58;
  return CH.filter(c => t >= c.t).at(-1).n;
}
function lastChange(t) { const ts = [...CH.map(c => c.t), ...DUDS.map(d => d.t), T.open, T.loop].filter(x => x <= t); return ts.length ? Math.max(...ts) : -9; }
function counter(t) {
  if (t >= T.black && t < T.pass) return;
  const n = count(t), lc = lastChange(t), hot = t >= T.c100 && t < T.open, won = t >= T.open && t < T.loop;
  const pu = 1 + 0.16 * Math.exp(-(t - lc) * 10) + (hot ? 0.04 * Math.sin(t * 14) : 0);
  ctx.save(); ctx.translate(SX, 230); ctx.scale(pu, pu);
  const bg = won ? "#1fa35a" : hot ? `rgb(${Math.round(150 + 80 * (0.5 + 0.5 * Math.sin(t * 8)))},20,40)` : "#e5262b";
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.fillStyle = bg; rr(-170, -32, 340, 64, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.font = "900 27px InterX, 'Noto Color Emoji'"; ctx.fillText("GEÖFFNET:", -154, 2);
  ctx.fillStyle = "#fff"; rr(18, -22, 140, 44, 12); ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.font = "900 30px InterX"; ctx.fillText(n + "/100", 88, 3);
  ctx.restore();
  const f = n / 100, bw = 340, bh = 16; ctx.save(); ctx.translate(SX - bw / 2, 270);
  ctx.fillStyle = "rgba(20,10,40,0.55)"; rr(0, 0, bw, bh, 8); ctx.fill();
  if (f > 0.004) { const g = ctx.createLinearGradient(0, 0, bw, 0); g.addColorStop(0, "#ffb43a"); g.addColorStop(1, "#ffe27a"); ctx.fillStyle = g; rr(0, 0, Math.max(bh, bw * f), bh, 8); ctx.fill(); if (f < 1) glow(bw * f, bh / 2, 16, "255,240,180", 0.8); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; rr(0, 0, bw, bh, 8); ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------ Truhe, Token, Schiff, Kapitän
function chest(x, y, s, t, o = {}) { // Unterkante Mitte; o.open 0..1, o.num, o.light 0..1, o.q (Fragezeichen), o.gone (Deckel weg)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(60,20,60,0.3)"; ctx.beginPath(); ctx.ellipse(0, 2, 50, 7, 0, 0, Math.PI * 2); ctx.fill();
  const op = o.open || 0, li = o.light || 0;
  if (op > 0.05 || li > 0) { const a = Math.max(op, li); glow(0, -44, 120, "255,215,90", 0.9 * a);
    ctx.save(); ctx.globalAlpha = a * 0.55; for (let i = 0; i < 7; i++) { const an = -Math.PI / 2 + (i - 3) * 0.28 + Math.sin(t * 2 + i) * 0.04; ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.moveTo(-8, -44); ctx.lineTo(8, -44); ctx.lineTo(Math.cos(an + 0.07) * 260, -44 + Math.sin(an + 0.07) * 260); ctx.lineTo(Math.cos(an - 0.07) * 260, -44 + Math.sin(an - 0.07) * 260); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  // Korpus
  ctx.fillStyle = "#a8642c"; rr(-42, -46, 84, 46, 5); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-42, -46, 84, 46, 5); ctx.clip(); ctx.strokeStyle = "rgba(70,30,10,0.45)"; ctx.lineWidth = 2; for (const py of [-31, -16]) { ctx.beginPath(); ctx.moveTo(-42, py); ctx.lineTo(42, py); ctx.stroke(); } ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(14, -46, 30, 46); ctx.restore();
  ctx.fillStyle = "#f2c23a"; for (const bx of [-33, 26]) { rr(bx, -46, 7, 46, 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } ctx.lineWidth = 3;
  if (o.num != null) { ctx.fillStyle = CREAM; rr(-15, -30, 30, 16, 4); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; ctx.fillStyle = INK; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("#" + o.num, 0, -21.5); }
  if (op > 0.05) { ctx.fillStyle = "#3a1a08"; ctx.beginPath(); ctx.ellipse(0, -46, 40, 7 * op, 0, 0, Math.PI * 2); ctx.fill(); glow(0, -48, 50, "255,240,170", op); }
  if (li > 0 && op < 0.05) { ctx.strokeStyle = `rgba(255,236,140,${li})`; ctx.lineWidth = 3 + 2 * li; ctx.beginPath(); ctx.moveTo(-42, -46); ctx.lineTo(42, -46); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3; }
  // Deckel (klappt nach hinten links auf)
  if (!o.gone) { ctx.save(); ctx.translate(-42, -46); ctx.rotate(-2.0 * op); ctx.translate(42, 0);
    ctx.fillStyle = "#b8743a"; ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-42, -12); ctx.quadraticCurveTo(0, -34, 42, -12); ctx.lineTo(42, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f2c23a"; for (const bx of [-33, 26]) { ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, -14 - (bx < 0 ? 4 : 6)); ctx.lineTo(bx + 7, -16 - (bx < 0 ? 4 : 4)); ctx.lineTo(bx + 7, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } ctx.lineWidth = 3;
    ctx.fillStyle = "#f2c23a"; rr(-8, -6, 16, 14, 3); ctx.fill(); ctx.stroke(); circle(0, 0, 2.2, INK);
    ctx.restore(); }
  if (o.q) { const p = 1 + 0.08 * Math.sin(t * 6); ctx.save(); ctx.translate(0, -82); ctx.scale(p, p); glow(0, 0, 50, "255,220,90", 0.7); outlined("?", 0, 0, 58, GOLD, INK, 8); ctx.restore(); }
  ctx.restore();
}
function token(x, y, r, t, spin = true) { if (!(r > 0.5)) return;
  const sx = spin ? Math.max(0.18, Math.abs(Math.cos(t * 3.2))) : 1; glow(x, y, r * 2.6, "255,215,80", 0.7);
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); circle(0, 0, r, INK); circle(0, 0, r * 0.93, "#ffd23a"); circle(0, 0, r * 0.72, "#ffe58a");
  ctx.strokeStyle = "#c8901a"; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();
  outlined("R", 0, r * 0.06, r * 0.95, "#e09a12", "#8a5a08", r * 0.08); ctx.restore();
  if (spin) for (let i = 0; i < 3; i++) { const a = (t * 1.7 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * a); emo("✨", x + Math.cos(i * 2.1) * r * 1.3, y + Math.sin(i * 2.1) * r * 1.3, r * 0.5); ctx.globalAlpha = 1; }
}
function ship(x, y, s, t, o = {}) { // fliegendes Piratenschiff, (x, y) = Deckmitte
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.2) * 4); ctx.rotate(o.tilt || 0); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  // Düsen + Flammen
  for (const dx of [-90, 0, 90]) { ctx.fillStyle = "#4a4f5c"; rr(dx - 14, 52, 28, 22, 4); ctx.fill(); ctx.stroke(); const fl = 26 + 10 * Math.sin(t * 40 + dx); glow(dx, 82, 36, "120,230,255", 0.8); ctx.fillStyle = "#7ff0ff"; ctx.beginPath(); ctx.moveTo(dx - 10, 74); ctx.quadraticCurveTo(dx, 74 + fl * 1.6, dx + 10, 74); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(dx - 5, 74); ctx.quadraticCurveTo(dx, 74 + fl * 0.8, dx + 5, 74); ctx.fill(); }
  // Masten + Segel
  for (const [mx, mh] of [[-55, 230], [75, 200]]) { ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, -mh); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = "#7a4420"; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
    const bl = 6 * Math.sin(t * 3 + mx); ctx.fillStyle = "#5b2a86"; ctx.beginPath(); ctx.moveTo(mx - 62, -mh + 26); ctx.quadraticCurveTo(mx + bl, -mh + 14, mx + 62, -mh + 26); ctx.lineTo(mx + 56, -48); ctx.quadraticCurveTo(mx + bl * 2, -30, mx - 56, -48); ctx.closePath(); ctx.fill(); ctx.stroke();
    circle(mx + bl, -mh / 2 - 14, 20, "#fff6e6"); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(mx + bl, -mh / 2 - 14, 32, 8, -0.3, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(mx, -mh); ctx.lineTo(mx + 34, -mh + 8 + Math.sin(t * 6) * 3); ctx.lineTo(mx, -mh + 18); ctx.fill(); ctx.fillStyle = GOLD; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("R", mx + 12, -mh + 9); }
  // Rumpf
  ctx.fillStyle = "#7a4420"; ctx.beginPath(); ctx.moveTo(-190, -34); ctx.lineTo(-118, -34); ctx.lineTo(-108, -6); ctx.lineTo(150, -6); ctx.lineTo(196, -44); ctx.quadraticCurveTo(160, 66, 10, 66); ctx.quadraticCurveTo(-160, 66, -190, -34); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = "rgba(40,15,5,0.5)"; ctx.lineWidth = 2; for (const py of [12, 30, 48]) { ctx.beginPath(); ctx.moveTo(-200, py); ctx.lineTo(200, py - 4); ctx.stroke(); } ctx.restore();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-186, -28); ctx.lineTo(-114, -28); ctx.lineTo(-104, -1); ctx.lineTo(150, -1); ctx.lineTo(190, -38); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (let px = -96; px <= 140; px += 16) { ctx.beginPath(); ctx.moveTo(px, -6); ctx.lineTo(px, -20); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-104, -20); ctx.lineTo(146, -20); ctx.stroke();
  for (let i = 0; i < 4; i++) { const px = -70 + i * 34; circle(px, 22, 7, INK); circle(px, 22, 5.5, "#ffcf5a"); }
  // die „Augen“ aus Tag 11 = Bugfenster
  const e = o.eyes ?? 1; for (const d of [0, 1]) { const ex = 92 + d * 44, ey = 16; glow(ex, ey, 46, "255,60,30", 0.7 * e); ctx.fillStyle = "#1b0a10"; ctx.beginPath(); ctx.ellipse(ex, ey, 19, 11, d ? 0.28 : -0.28, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#ffdf4a"; ctx.globalAlpha = e; ctx.beginPath(); ctx.ellipse(ex, ey, 16, 8.5, d ? 0.28 : -0.28, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#1a0510"; ctx.beginPath(); ctx.ellipse(ex - 2, ey, 3, 7.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  if (o.hatch) { ctx.fillStyle = "#1b0a10"; rr(-150, 30, 46, 24, 4); ctx.fill(); ctx.stroke(); glow(-127, 42, 40, "255,215,90", 0.6 * o.hatch); }
  ctx.restore();
}
function captain(x, y, s, t, o = {}) { // Alien-Pirat, Füße bei (x, y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (const d of [-1, 1]) { ctx.fillStyle = "#1b1424"; rr(d * 12 - 9, -26, 18, 26, 4); ctx.fill(); }
  // Mantel
  ctx.fillStyle = "#c8323c"; rr(-28, -86, 56, 64, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#1b1424"; ctx.fillRect(-27, -44, 54, 8); ctx.fillStyle = GOLD; rr(-6, -46, 12, 12, 2); ctx.fill(); for (const by of [-74, -62]) circle(0, by, 3, GOLD);
  // Arme: links Haken, rechts hält den Token hoch
  ctx.save(); ctx.translate(-26, -78); ctx.rotate(0.35); ctx.fillStyle = "#c8323c"; rr(-7, 0, 14, 34, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#cfd6dc"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 44, 7, -Math.PI / 2, Math.PI * 0.9); ctx.stroke(); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  const ar = o.armUp ?? 1, ang = lerp(-0.3, -2.7, ar) + Math.sin(t * 6) * 0.06 * ar; ctx.save(); ctx.translate(26, -78); ctx.rotate(ang); ctx.fillStyle = "#c8323c"; rr(-7, 0, 14, 36, 7); ctx.fill(); ctx.stroke(); circle(0, 38, 8, "#7bd36a"); ctx.restore();
  // Kopf
  for (const d of [-1, 1]) { ctx.fillStyle = "#6cc35a"; ctx.beginPath(); ctx.moveTo(d * 22, -122); ctx.lineTo(d * 40, -136); ctx.lineTo(d * 26, -110); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  circle(0, -116, 27, INK); circle(0, -116, 25, "#7bd36a");
  circle(9, -120, 8, "#fff"); circle(10 + Math.sin(t * 2) * 1.5, -119, 4, INK);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(-10, -120, 9, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-26, -128); ctx.lineTo(24, -112); ctx.stroke(); ctx.lineWidth = 3;
  ctx.fillStyle = "#3a1020"; ctx.beginPath(); ctx.arc(0, -106, 11, 0.1, Math.PI - 0.1); ctx.closePath(); ctx.fill(); ctx.fillStyle = GOLD; ctx.fillRect(3, -106, 5, 4);
  // Dreispitz
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-44, -132); ctx.quadraticCurveTo(0, -128, 44, -132); ctx.quadraticCurveTo(30, -176, 0, -170); ctx.quadraticCurveTo(-30, -176, -44, -132); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -134); ctx.quadraticCurveTo(0, -130, 40, -134); ctx.stroke(); ctx.strokeStyle = INK; circle(0, -152, 8, "#fff6e6"); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -152, 13, 3.5, -0.3, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  return [x + (26 + Math.sin(ang) * -38) * s, y + (-78 + Math.cos(ang) * 38) * s];   // Hand (für den Token)
}

// ------------------------------------------------------------ die Wünsche aus den Truhen (Unterkante Mitte, lt = Zeit seit Öffnen)
function wish(k, x, y, s, t, lt = 9) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(70,20,70,0.25)"; ctx.beginPath(); ctx.ellipse(0, 2, 60, 7, 0, 0, Math.PI * 2); ctx.fill();
  switch (k) {
    case "bank": {
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? "#cfd3dc" : "#e3e6ee"; rr(-58 + i * 5, -6 - i * 6, 116 - i * 10, 6, 1); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); } ctx.lineWidth = 3;
      ctx.fillStyle = "#eef0f5"; ctx.fillRect(-46, -66, 92, 48); ctx.strokeRect(-46, -66, 92, 48);
      for (let i = 0; i < 4; i++) { const cx = -36 + i * 24; ctx.fillStyle = "#fff"; rr(cx - 6, -64, 12, 46, 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.beginPath(); ctx.moveTo(cx - 2, -62); ctx.lineTo(cx - 2, -20); ctx.moveTo(cx + 2, -62); ctx.lineTo(cx + 2, -20); ctx.stroke(); ctx.strokeStyle = INK; } ctx.lineWidth = 3;
      ctx.fillStyle = "#6b3f1e"; rr(-8, -40, 16, 22, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e3e6ee"; rr(-54, -78, 108, 12, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.font = "900 10px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("B A N K", 0, -71.5);
      ctx.fillStyle = "#eef0f5"; ctx.beginPath(); ctx.moveTo(-58, -78); ctx.lineTo(0, -108); ctx.lineTo(58, -78); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); token(x, y - 90 * s, 10 * s, t, false); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (const [px, n] of [[-66, 4], [66, 5], [56, 3]]) for (let j = 0; j < n; j++) { ctx.fillStyle = j % 2 ? "#ffd23a" : "#ffe27a"; ctx.beginPath(); ctx.ellipse(px, -3 - j * 4.5, 9, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); } ctx.lineWidth = 3;
      break; }
    case "flughafen": {
      ctx.fillStyle = "#4a4f5c"; rr(-70, -6, 150, 10, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; for (let i = 0; i < 6; i++) ctx.fillRect(-62 + i * 24, -2, 12, 2.5);
      box(96, 30, "#bfe6ff", 12, 6, -6); ctx.fillStyle = "#5fb8e8"; for (let i = 0; i < 6; i++) { rr(-26 + i * 14, -28, 10, 16, 2); ctx.fill(); } sgn("FLUGHAFEN", -42, "#1c2f6b", "#fff", 7, 12);
      box(12, 66, "#e9edf5", -52, 3, -6); ctx.fillStyle = "#3a8f5a"; rr(-66, -94, 28, 22, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#9cf0c0"; ctx.fillRect(-62, -90, 20, 8);
      circle(-52, -100, 4, Math.sin(t * 9) > 0 ? "#ff3b3b" : "#7a1a1a"); pole(70, 34, -6); ctx.fillStyle = "#ff7a2a"; ctx.beginPath(); ctx.moveTo(70, -40); ctx.lineTo(90 + Math.sin(t * 6) * 3, -36); ctx.lineTo(70, -32); ctx.fill();
      break; }
    case "laden": {
      box(112, 62, "#ff8fc0"); ctx.fillStyle = "#cfefff"; rr(-48, -46, 54, 32, 3); ctx.fill(); ctx.stroke(); door(30, 18, 34, "#7a3b5a");
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(-30, -36); ctx.moveTo(-40, -30); ctx.lineTo(-30, -36); ctx.lineTo(-20, -30); ctx.stroke(); ctx.fillStyle = "#ffd23a"; rr(-38, -30, 16, 14, 3); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? "#fff" : TEAL; ctx.beginPath(); ctx.moveTo(-60 + i * 17.1, -62); ctx.lineTo(-60 + (i + 1) * 17.1, -62); ctx.lineTo(-60 + (i + 1) * 17.1, -54); ctx.arc(-60 + (i + 0.5) * 17.1, -54, 8.55, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); } ctx.lineWidth = 3;
      ctx.fillStyle = "#1b1424"; rr(-58, -88, 116, 24, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 12px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("NEW ROTANIER", 0, -75.5);
      for (let i = 0; i < 3; i++) { const a = (t * 1.6 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * a); emo("✨", -52 + i * 52, -96 - (i % 2) * 6, 9); ctx.globalAlpha = 1; }
      break; }
    case "bunker": {
      ctx.fillStyle = "#8a8f9a"; ctx.beginPath(); ctx.ellipse(0, 0, 60, 52, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(10, -60, 60, 60); for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#ffd23a" : INK; ctx.beginPath(); ctx.moveTo(-64 + i * 11, 0); ctx.lineTo(-58 + i * 11, -10); ctx.lineTo(-47 + i * 11, -10); ctx.lineTo(-53 + i * 11, 0); ctx.fill(); } ctx.restore(); ctx.beginPath(); ctx.ellipse(0, 0, 60, 52, 0, Math.PI, 0); ctx.stroke();
      circle(0, -34, 15, INK); circle(0, -34, 13, "#5a606c"); ctx.lineWidth = 2.5; ctx.strokeStyle = "#c9ced6"; ctx.beginPath(); ctx.arc(0, -34, 7, 0, Math.PI * 2); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + t; ctx.moveTo(Math.cos(a) * 7, -34 + Math.sin(a) * 7); ctx.lineTo(Math.cos(a) * 12, -34 + Math.sin(a) * 12); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      pole(36, 30, -40); circle(36, -72, 3, Math.sin(t * 8) > 0 ? "#ff3b3b" : "#7a1a1a"); sgn("BUNKER", -58, "#2a2a30", "#ffd23a", 9, -26);
      break; }
  }
  ctx.restore();
}
function plane(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.16); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.globalAlpha = 0.5 - i * 0.08; circle(-96 - i * 22, 6, 10 - i, "#fff"); } ctx.globalAlpha = 1; glow(-86, 6, 22, "255,170,70", 0.9);
  ctx.fillStyle = "#cfd6e0"; ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-36, 40); ctx.lineTo(-16, 40); ctx.lineTo(22, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-70, -2); ctx.lineTo(-92, -38); ctx.lineTo(-76, -38); ctx.lineTo(-52, -4); ctx.closePath(); ctx.fillStyle = PINK; ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 13px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("R", -78, -24);
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(84, 6); ctx.quadraticCurveTo(70, -16, 20, -16); ctx.lineTo(-84, -12); ctx.quadraticCurveTo(-92, 2, -84, 14); ctx.lineTo(30, 20); ctx.quadraticCurveTo(76, 20, 84, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PINK; ctx.fillRect(-82, 4, 150, 5); ctx.fillStyle = "#5fb8e8"; for (let i = 0; i < 6; i++) { circle(-50 + i * 14, -4, 3.5, "#5fb8e8"); }
  ctx.fillStyle = "#1c2a40"; ctx.beginPath(); ctx.moveTo(56, -12); ctx.quadraticCurveTo(76, -10, 80, 0); ctx.lineTo(56, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  const av = AV.noam; circle(64, -4, 8, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(64, -4, 7, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, 57, -11, 14, 14); ctx.restore(); }
  ctx.fillStyle = INK; rr(-30, 10, 68, 13, 4); ctx.fill(); ctx.fillStyle = GOLD; ctx.font = "900 9px InterX"; ctx.fillText("PILOT: NOAM", 4, 17);
  ctx.restore(); }
function noticeBoard(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.04 + Math.sin(t * 3) * 0.02); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (const d of [-1, 1]) { ctx.fillStyle = "#6b4a2a"; rr(d * 44 - 4, -40, 8, 42, 2); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = "#2f5a2a"; rr(-64, -96, 128, 62, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#f6ecd4"; rr(-58, -90, 116, 50, 5); ctx.fill();
  ctx.fillStyle = "#2a3a22"; ctx.font = "900 13px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SOLDATEN", 0, -77); ctx.fillText("GESUCHT", 0, -63); ctx.fillStyle = "#e5262b"; ctx.font = "900 15px InterX"; ctx.fillText("0/10", 0, -48);
  ctx.restore(); }

// ------------------------------------------------------------ Bühne + Effekte
function row(t, a = 1) { ctx.globalAlpha = a; ROW.forEach((k, i) => bld(k, 26 + i * 44, HZ + 4, 0.28, t, 9)); ctx.globalAlpha = 1; }
function burst(x, y, lt, big = 1, col = "255,220,90") { if (lt < 0 || lt > 1.0) return; const k = lt / 1.0;
  glow(x, y, 220 * big * (1 - k * 0.5), col, 0.8 * (1 - k));
  ctx.strokeStyle = `rgba(255,248,200,${0.9 * (1 - ramp(lt, 0, 0.4))})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 30 + 260 * big * easeOut(ramp(lt, 0, 0.4)), 0, Math.PI * 2); ctx.stroke();
  const r = rng(Math.round(x * 7 + y)); for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, v = (120 + r() * 220) * big; ctx.globalAlpha = 1 - k; emo(i % 3 ? "✨" : "⭐", x + Math.cos(a) * v * easeOut(k), y + Math.sin(a) * v * easeOut(k) + 120 * k * k, 14 + r() * 10); } ctx.globalAlpha = 1; }
function coinsArc(x, y, lt, n = 14, seed = 3) { if (lt < 0 || lt > 1.6) return; const r = rng(seed); for (let i = 0; i < n; i++) { const vx = (r() - 0.5) * 520, vy = -380 - r() * 300, d = lt - r() * 0.3; if (d < 0) continue; emo("🪙", x + vx * d, y + vy * d + 900 * d * d, 22); } }
function flying(list, x, y, lt, seed = 5) { if (lt < 0 || lt > 1.4) return; const r = rng(seed); list.forEach((e, i) => { const vx = (r() - 0.5) * 560, vy = -420 - r() * 260, d = lt - i * 0.06; if (d < 0) return; ctx.save(); ctx.translate(x + vx * d, y + vy * d + 820 * d * d); ctx.rotate(d * (r() - 0.5) * 12); emo(e, 0, 0, 34); ctx.restore(); }); }
function skyTear(cx, cy, a, t) { if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = a; glow(cx, cy, 300, "255,180,240", 0.6);
  ctx.fillStyle = "#fff3fb"; ctx.beginPath(); const r = rng(4); ctx.moveTo(cx - 260, cy); for (let i = 0; i <= 12; i++) ctx.lineTo(cx - 260 + i * 43, cy - 18 - r() * 40 - (i % 2) * 20); for (let i = 12; i >= 0; i--) ctx.lineTo(cx - 260 + i * 43, cy + 18 + r() * 40 + (i % 2) * 20); ctx.closePath(); ctx.fill(); ctx.restore(); }
function crowd(t, mood, y0 = 1010, s0 = 1.15) { // Astronauten-Köpfe unten im Bild
  const acc = ["#ff4f8b", "#3fd3f2", "#ffd23a", "#7bf27a", "#b06bff"];
  for (let i = 0; i < 5; i++) { const shake = mood * Math.sin(t * 30 + i) * 3, x = 46 + i * 104 + shake, lean = Math.sin(t * 5 + i) * 0.05 * mood;
    ctx.save(); ctx.translate(x, y0); ctx.rotate(lean); ctx.translate(-x, -y0); astronaut(x, y0 - Math.abs(Math.sin(t * 7 + i)) * 6 * mood, s0, mood > 0.5 ? "shock" : "think", { t, acc: acc[i], armL: mood > 0.6 ? -2.6 : 0.25, armR: mood > 0.6 ? 2.6 : -0.25 }); ctx.restore();
    if (mood > 0.4) { const k = (t * 1.5 + i * 0.3) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = "#7fd0ff"; ctx.beginPath(); ctx.ellipse(x + 30 * s0, y0 - 140 * s0 + k * 26, 4, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } } }
function speech(txt, x, y, s) { if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 70, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-20, 28); ctx.lineTo(-38, 56); ctx.lineTo(-2, 32); ctx.fill(); outlined(txt, 0, 2, 32, "#e5262b", INK, 6); ctx.restore(); }
function captions2(t) {
  const c = window.CHUNKS.find(c => t >= c.s - 0.02 && t <= c.e); if (!c) return;
  ctx.save(); ctx.font = "46px Comic, 'Noto Color Emoji'"; ctx.letterSpacing = "0.5px"; const sp = ctx.measureText(" ").width;
  const lines = []; for (const w of c.w) (lines[w[3]] ||= []).push([...w, ctx.measureText(w[0]).width]);
  const ys = lines.length > 1 ? [744, 800] : [772];
  lines.forEach((ln, li) => { const tw = ln.reduce((a, p) => a + p[4] + sp, -sp), fit = Math.min(1, 450 / tw), cx = 262, y = ys[li];
    ctx.save(); ctx.translate(cx, y); ctx.scale(fit, fit); let x = -tw / 2;
    for (const [w, s, col, , ww] of ln) { const k = ramp(t, s - 0.02, s + 0.1); if (k > 0) { ctx.save(); ctx.translate(x + ww / 2, 0); const sc = 0.55 + 0.45 * back(k); ctx.scale(sc, sc); outlined(w, 0, 0, 46, col === 1 ? CYAN : col === 2 ? RED : col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 11); ctx.restore(); } x += ww + sp; }
    ctx.restore(); });
  ctx.restore();
}

// ------------------------------------------------------------ Szenen
function sceneRain(t, u) { // u = Zeit relativ zum Kippen (Frame 1 = 0; in der Loop-Sekunde negativ)
  stage(t); row(t); skyTear(CX + 20, 390, u < 0 ? 0 : 1 - ramp(u, 0.6, 1.4), t);
  for (const c of RAIN) { const d = u - c.ts; if (d < 0) continue; const fall = 0.42, k = Math.min(1, d / fall), x0 = CX - 110 + c.sp * 60;
    const x = lerp(x0, c.x, k), y = lerp(470, c.y, k * k), lt = d - fall, bounce = lt > 0 ? Math.abs(Math.sin(lt * 14)) * 14 * Math.exp(-lt * 6) : 0;
    if (lt > 0) dustBurst(x, c.y, lt, 0.5 * c.s);
    ctx.save(); ctx.translate(x, y - bounce); ctx.rotate(lt > 0 ? c.rot * Math.exp(-lt * 8) : c.rot + d * 6); chest(0, 0, c.s, t, { num: null }); ctx.restore(); }
  ship(CX + 40, 428, 0.6, t, { tilt: lerp(0.05, 0.22, easeOut(ramp(u, -0.4, 0.2))) * (1 - easeOut(ramp(t, T.reveal, T.reveal + 0.4))), hatch: 1 });
  if (u >= 0 && t >= T.reveal) { const k = t - T.reveal; for (const d of [0, 1]) { const ex = CX + 40 + (92 + d * 44) * 0.6, ey = 428 + 16 * 0.6 + Math.sin(t * 2.2) * 4;   // Ringe um die Augen aus Tag 11
      for (let i = 0; i < 2; i++) { const q = (k * 1.4 + i / 2) % 1; ctx.strokeStyle = `rgba(255,223,74,${0.9 * (1 - q)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ex, ey, 14 + q * 40, 9 + q * 26, 0, 0, Math.PI * 2); ctx.stroke(); } }
    emo("👀", CX - 60, 400 + Math.sin(t * 6) * 4, 46 * pop(t, T.reveal + 0.1, 99, 0.25)); outlined("➜", CX - 10, 410, 40 * pop(t, T.reveal + 0.2, 99, 0.25), GOLD, INK, 6);
    if (t >= T.reveal + 0.9) { const fl = pop(t, T.reveal + 0.9, 99, 0.2); ctx.save(); ctx.translate(CX + 160, 338); ctx.rotate(-0.05); ctx.scale(fl, fl); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-40, -26); ctx.lineTo(44, -18 + Math.sin(t * 6) * 4); ctx.lineTo(-40, 26); ctx.closePath(); ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke(); emo("🏴‍☠️", -8, 0, 30); ctx.restore(); } }
}
function sack(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 4) * 0.12); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineJoin = "round";
  ctx.fillStyle = "#c8a064"; ctx.beginPath(); ctx.moveTo(-14, -58); ctx.quadraticCurveTo(-58, -40, -52, -6); ctx.quadraticCurveTo(-46, 22, 0, 22); ctx.quadraticCurveTo(46, 22, 52, -6); ctx.quadraticCurveTo(58, -40, 14, -58); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#a07840"; rr(-18, -66, 36, 10, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#c8a064"; ctx.beginPath(); ctx.moveTo(-12, -66); ctx.lineTo(-22, -84); ctx.lineTo(0, -74); ctx.lineTo(22, -84); ctx.lineTo(12, -66); ctx.fill(); ctx.stroke();
  ctx.fillStyle = CREAM; rr(-44, -30, 88, 36, 6); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = INK; ctx.font = "900 10px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("STADTKASSE", 0, -20); ctx.fillStyle = "#b8860b"; ctx.font = "900 13px InterX"; ctx.fillText(TALER.toLocaleString("de-DE") + " 🪙", 0, -4);
  ctx.restore(); }
function sceneKasse(t) { // „Wenn nicht, ist unsere Stadtkasse weg!“ – Traktorstrahl zieht die Kasse Richtung Schiff
  const lt = t - T.kasse; stage(t); row(t);
  const sx = CX + 40, sy = 400; ship(sx, sy, 0.55, t, { eyes: 1 });
  const up = easeIO(ramp(lt, 0.1, 1.3)), ky = lerp(GY + 50, GY - 70, up);
  ctx.save(); ctx.globalAlpha = 0.35 + 0.1 * Math.sin(t * 20); const g = ctx.createLinearGradient(0, sy + 40, 0, ky + 30); g.addColorStop(0, "rgba(120,255,170,0.9)"); g.addColorStop(1, "rgba(120,255,170,0.25)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 18, sy + 40); ctx.lineTo(sx + 18, sy + 40); ctx.lineTo(CX + 95, ky + 34); ctx.lineTo(CX - 95, ky + 34); ctx.closePath(); ctx.fill(); ctx.restore();
  for (let i = 0; i < 8; i++) { const r = rng(i + 80), d = ((lt * 1.2 + r()) % 1); ctx.globalAlpha = 1 - d; emo("🪙", CX + (r() - 0.5) * 120 * (1 - d), lerp(ky, sy + 50, d), 18); ctx.globalAlpha = 1; }
  sack(CX, ky, 1.9, t);
  astronaut(CX - 150, GY + 90, 0.95, "shock", { t, acc: "#3fd3f2", armR: -2.6, armL: -0.4 }); astronaut(CX + 150, GY + 92, 0.95, "shock", { t, acc: "#ff4f8b", armL: 2.6, armR: 0.4 });
  outlined("!", CX - 150, GY - 90, 52 * pop(t, T.kasse + 0.3, 99, 0.2), RED, INK, 8); outlined("!", CX + 150, GY - 90, 52 * pop(t, T.kasse + 0.4, 99, 0.2), RED, INK, 8);
}
function sceneCaptain(t) {
  const lt = t - T.capt, z = 1 + 0.07 * easeOut(ramp(lt, 0, 1.7)); ctx.save(); ctx.translate(CX, 560); ctx.scale(z, z); ctx.translate(-CX, -560);
  stage(t, 1000); for (let i = 0; i < 14; i++) { const r = rng(i + 30), d = ((lt * 0.8 + r()) % 1); emo("🪙", 40 + r() * 470, lerp(300, 1000, d), 20 + r() * 10); }
  ship(CX + 100, 724, 1.7, t, { eyes: 1 });
  const hand = captain(CX - 70, 716, 1.9, t, { armUp: easeOut(ramp(lt, 0.05, 0.35)) });
  token(hand[0], hand[1] - 62, 42 * back(ramp(lt, 0.15, 0.45)), t);
  speech("ARRR!", CX + 90, 340, pop(t, T.capt + 0.05, T.capt + 0.9, 0.18));
  ctx.restore();
}
function sceneChest(t, c, i) {
  const lt = t - c.t; stage(t); row(t);
  const settled = c.k === "socke" ? 0 : easeOut(ramp(lt, 0.2, 0.42));
  const cx = lerp(CX, CX + 168, settled), cy = lerp(GY + 40, GY + 150, settled), cs = lerp(2.3, 1.05, settled);
  const drop = lt < 0 ? lerp(-700, 0, Math.pow(ramp(t, c.s, c.s + 0.14), 2)) + (t > c.s + 0.14 ? Math.abs(Math.sin((t - c.s) * 18)) * -6 : 0) : 0, op = back(ramp(lt, 0, 0.12));
  const grow = back(ramp(lt, 0.04, 0.32)), BX = CX - 10, BY = GY + 70;
  if (c.k === "socke") { chest(CX, GY + 40 + drop, 2.3, t, { open: op, num: c.n }); burst(CX, GY - 70, lt, 0.5, "200,200,210");
    if (lt > 0) { ctx.save(); ctx.translate(CX, lerp(GY - 40, GY - 210, easeOut(ramp(lt, 0, 0.3)))); ctx.rotate(Math.sin(lt * 9) * 0.25); emo("🧦", 0, 0, 110 * back(ramp(lt, 0, 0.25))); ctx.restore(); emo("💨", CX + 90, GY - 120, 60 * pop(t, c.t + 0.05, c.e - 0.2)); }
    return; }
  if (c.k === "soldaten") { bld("militaer", BX + 50, BY - 10, 2.4 * grow, t, lt); }
  else if (c.k === "bunker") { const sink = easeIO(ramp(lt, 0.75, 1.35)) * 95; ctx.save(); ctx.beginPath(); ctx.rect(-50, -50, W + 100, BY + 2 + 50); ctx.clip(); wish("bunker", BX, BY + sink, 2.1 * grow, t, lt); ctx.restore();
    if (lt > 0.75 && lt < 1.6) for (let j = 0; j < 12; j++) { const r = rng(j + 40), d = ((lt - 0.75) * 1.6 + r() * 0.5) % 1; ctx.globalAlpha = 1 - d; circle(BX + (r() - 0.5) * 300 * d, BY - 10 - Math.sin(Math.PI * d) * 90, 8 + r() * 10, "#b8607e"); ctx.globalAlpha = 1; } }
  else wish(c.k, BX, BY, 2.2 * grow, t, lt);
  if (c.k === "bank") coinsArc(cx, cy - 90, lt, 18, 11);
  if (c.k === "laden") flying(["👕", "👖", "🧢", "👟", "👗", "🧥"], BX + 55, BY - 50, lt - 0.3, 8);
  if (c.k === "soldaten") { flying(["🪖", "🪖", "🪖", "🪖", "🪖"], cx, cy - 80, lt, 9); for (let j = 0; j < 5; j++) emo("🪖", 200 + j * 40, BY + 30, 30 * pop(t, c.t + 0.6 + j * 0.06, 99, 0.2));
    astronaut(CX - 200, BY + 40, 0.9, "smirk", { t, acc: "#2f8f4a", suit: "#a9b98f", suit2: "#b8c79e", suit3: "#8a9a72", armR: -2.5 + Math.sin(t * 8) * 0.25 }); noticeBoard(CX - 95, BY + 48, 1.0 * pop(t, c.t + 0.3, 99, 0.25), t); }
  chest(cx, cy + drop, cs, t, { open: op, num: c.n });
  burst(cx, cy - 70 * cs, lt, 1);
  if (c.k === "flughafen" && lt > 0.4) { const u = ramp(lt, 0.4, 1.4); if (u < 1) { plane(lerp(-140, 760, u), lerp(560, 300, u), 1.55, t); speedLines(0.6 * Math.sin(Math.PI * u)); } }
}
function sceneMontage(t) {
  const z = 1 + 0.16 * easeIO(ramp(t, T.mont, T.c100)); ctx.save(); ctx.translate(CX, GY); ctx.scale(z, z); ctx.translate(-CX, -GY);
  stage(t); row(t); speedLines(0.35 + 0.35 * ramp(t, T.mont, T.c100), "255,230,150");
  const d = DUDS.filter(x => t >= x.t - 0.08).at(-1) || DUDS[0], lt = t - d.t, op = back(ramp(lt, 0, 0.07)) * (1 - ramp(lt, 0.17, 0.23));
  chest(CX, GY + 40 - (lt < 0 ? 0 : Math.abs(Math.sin(lt * 12)) * 8 * Math.exp(-lt * 8)), 2.3, t, { open: op, num: d.n });
  for (const x of DUDS) { const l2 = t - x.t; if (l2 < 0 || l2 > 0.7) continue; const fly = ramp(l2, 0.22, 0.7), dir = DUDS.indexOf(x) % 2 ? 1 : -1;
    ctx.save(); ctx.translate(CX + dir * 420 * fly * fly, lerp(GY - 30, GY - 190, easeOut(ramp(l2, 0, 0.16))) - 80 * fly); ctx.rotate(dir * fly * 3); emo(x.e, 0, 0, 92 * back(ramp(l2, 0, 0.12))); ctx.restore();
    if (l2 < 0.22) { ctx.save(); ctx.globalAlpha = 1 - ramp(l2, 0.12, 0.22); outlined("✗", CX + 70, GY - 230, 64, RED, INK, 8); ctx.restore(); } }
  ctx.restore();
  crowd(t, 0.3 + 0.7 * ramp(t, T.mont, T.c100));
}
function sceneC100(t) {
  const lt = t - T.c100, k = ramp(t, T.c100, T.open), beatP = Math.exp(-((lt % BT)) * 7) * 0.025;
  const z = 1 + 0.22 * easeIO(k) + beatP; ctx.save(); ctx.translate(CX, GY); ctx.scale(z, z); ctx.translate(-CX, -GY);
  stage(t); row(t, 0.8);
  ctx.fillStyle = "rgba(12,5,30,0.62)"; ctx.fillRect(-60, -60, W + 120, H + 120);
  const sp = ctx.createRadialGradient(CX, GY, 20, CX, GY, 330); sp.addColorStop(0, "rgba(255,230,160,0.35)"); sp.addColorStop(1, "rgba(255,230,160,0)"); ctx.fillStyle = sp; ctx.fillRect(-60, -60, W + 120, H + 120);
  creature(CX - 175, GY + 10, 0.34, t, { eyes: 1, look: 1 });
  captain(CX + 185, GY + 14, 1.15, t, { armUp: 0 });
  for (const [ax, ay, s, a] of [[CX - 95, GY - 6, 0.72, "#3fd3f2"], [CX + 90, GY - 4, 0.72, "#ffd23a"], [CX - 140, GY + 52, 0.85, "#ff4f8b"], [CX + 140, GY + 56, 0.85, "#7bf27a"]]) astronaut(ax, ay, s, "shock", { t, acc: a });
  const tr = ramp(t, T.c100 + 0.3, T.open), sh = (2 + 9 * tr * tr) * Math.sin(t * 55);
  chest(CX + sh, GY + 70, 2.4, t, { num: 100, light: 0.2 + 0.8 * tr });
  ctx.restore();
}
function sceneOpen(t) {
  const lt = t - T.open;
  if (t >= T.black) { ctx.fillStyle = "#07040f"; ctx.fillRect(-60, -60, W + 120, H + 120); return; }
  const z = 1.22 + 0.5 * easeOut(ramp(lt, 0, 0.6)); ctx.save(); ctx.translate(CX, GY); ctx.scale(z, z); ctx.translate(-CX, -GY);
  stage(t); ctx.fillStyle = "rgba(12,5,30,0.6)"; ctx.fillRect(-60, -60, W + 120, H + 120);
  chest(CX, GY + 70, 2.4, t, { num: 100, open: 1, gone: true });
  const lid = ramp(lt, 0, 0.5); ctx.save(); ctx.translate(CX - 60 * lid, GY - 40 - 700 * easeOut(lid)); ctx.rotate(-lid * 5); ctx.scale(2.4, 2.4); ctx.fillStyle = "#b8743a"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-42, -12); ctx.quadraticCurveTo(0, -34, 42, -12); ctx.lineTo(42, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore();
  const f = easeOut(ramp(lt, 0, 0.4)); const g = ctx.createRadialGradient(CX, 560, 10, CX, 560, 80 + 1100 * f); g.addColorStop(0, "rgba(255,255,245,1)"); g.addColorStop(0.45, `rgba(255,236,150,${0.95 * f})`); g.addColorStop(1, `rgba(255,200,80,${0.75 * f})`); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120);
  ctx.save(); ctx.translate(CX, 560); ctx.rotate(t * 0.6); ctx.globalAlpha = 0.35 * f; for (let i = 0; i < 14; i++) { ctx.rotate(Math.PI * 2 / 14); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1200, -60); ctx.lineTo(1200, 60); ctx.fill(); } ctx.restore();
}
function sceneLater(t) { // Bordkarte + Aufruf
  stage(t); row(t);
  if (t < T.cta) {
    ship(CX + 40, 660, 0.5, t, {}); pass(pop(t, T.pass, T.cta - 0.1), t);
    const a = pop(t, T.pass + 0.2, T.cta - 0.1) * (1 + 0.06 * Math.sin(t * 9)); ctx.save(); ctx.translate(SX, 520); ctx.scale(a, a); ctx.fillStyle = "#fe2c55"; rr(-120, -24, 240, 48, 12); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "900 22px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("➕ Folgen = einsteigen", 0, 1); ctx.restore();
  } else {
    const lt = t - T.cta, sh = 2.5 * Math.sin(t * 40) * (0.5 + 0.5 * Math.sin(t * 3));
    for (let i = 0; i < 6; i++) { const r = rng(i + 60), d = ((lt * 0.35 + r()) % 1); ctx.globalAlpha = Math.sin(Math.PI * d) * 0.8; outlined("?", 40 + r() * 430, lerp(700, 470, d), 30 + r() * 20, GOLD, INK, 5); ctx.globalAlpha = 1; }
    bld("token", 100, GY + 74, 1.35, t, 9); tagLabel("TOKEN-HAUS: LEER", 100, GY - 92, pop(t, T.cta + 0.9, 99), GOLD, INK, -0.04, 14);
    chest(CX + 60 + sh, GY + 70, 2.3, t, { num: 100, light: 0.55 + 0.25 * Math.sin(t * 4), q: true });
    emptyComment(t, pop(t, T.cta + 0.15, 99), 366, "In Truhe 100 ist … 🤔");
    tagLabel("+ dein Bauwunsch 👇", SX, 446, pop(t, T.cta + 0.6, 99) * (1 + 0.03 * Math.sin(t * 8)), PINK, "#fff", -0.03, 20);
  }
}

// ------------------------------------------------------------ Bild
const HITS = [
  ...RAIN.map(c => [c.ts + 0.42, 4]),
  ...CH.map(c => [c.t, 11]), [CH[2].t + 0.4, 3], [CH[4].t + 0.75, 5],
  ...DUDS.map(d => [d.t, 6]), [T.open, 24], [T.pass, 6], [T.end + 0.42 - 0.32, 0],
];
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  let sh = 0, zp = 0, fl = 0;
  const hits = t >= T.loop ? RAIN.map(c => [c.ts + 0.42 + T.end, 4]) : HITS;
  for (const [h, s] of hits) if (t >= h && t - h < 1.2) { const d = t - h; sh += s * Math.exp(-d * 9); zp += s * 0.006 * Math.exp(-d * 9); fl += (s >= 10 ? 0.5 : 0) * Math.exp(-d * 16); }
  if (t < T.capt) for (const c of RAIN) { const d = t - c.ts - 0.42; if (d >= 0 && d < 1) sh += 4 * Math.exp(-d * 9); }
  const r = rng(Math.floor(t * 60) + 1); ctx.save(); ctx.translate(CX + (r() - 0.5) * 2 * sh, 600 + (r() - 0.5) * 2 * sh); ctx.scale(1 + zp, 1 + zp); ctx.translate(-CX, -600);
  if (t < T.capt) sceneRain(t, t);
  else if (t < T.kasse) sceneCaptain(t);
  else if (t < CH[0].s) sceneKasse(t);
  else if (t < T.mont) { let i = CH.findIndex((c, j) => t < (CH[j + 1]?.s ?? 99)); if (i < 0) i = CH.length - 1; sceneChest(t, CH[i], i); }
  else if (t < T.c100) sceneMontage(t);
  else if (t < T.open) sceneC100(t);
  else if (t < T.pass) sceneOpen(t);
  else if (t < T.loop) sceneLater(t);
  else sceneRain(t, t - T.end);
  ctx.restore();
  // Kommentarkarten (kurz, klein, oben) – unten springt schon das Gebäude aus der Truhe
  for (const c of CH) if (c.u) card(c, pop(t, c.t - 0.05, Math.min(c.e - 0.25, c.t + 1.2), 0.16));
  if (fl > 0.02) { ctx.fillStyle = `rgba(255,250,225,${Math.min(0.6, fl)})`; ctx.fillRect(0, 0, W, H); }
  if (!(t >= T.black && t < T.pass)) { header(t); counter(t); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.85); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,10,50,0.35)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  captions2(t);
};
window.exportEvents = function () { return { duration: END, T, CH: CH.map(c => c.t), DUDS: DUDS.map(d => d.t), RAIN: RAIN.map(c => c.ts + 0.42), BT, beats: window.TL.beats }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("46px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const k of ["berat", "noam", "sami", "minimaus", "einfachso"]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = k + ".png"; });
  return { duration: END };
};
