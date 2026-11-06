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
const DUR = SPEECH_END + 1.5;   // + Cliffhanger/Loop am Ende

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
      outlined(w, 0, 0, 38, col === 1 ? CYAN : col === 2 ? RED : "#ffffff", "#14223a", 10);
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
// ============================================================ Bausteine aus Tag 3 (lib4.js)
// ------------------------------------------------------------ Menge (630 Einwohner, als Sprites)
const SPR = {};
function makeSprites() {
  for (const acc of ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]) {
    const c = document.createElement("canvas"); c.width = 80; c.height = 150; const g = c.getContext("2d");
    const keep = ctx; ctx = g; ctx.setTransform(1, 0, 0, 1, 0, 0);
    // dunkler Umriss: einmal dick dunkel, dann normal darüber
    astronaut(40, 145, 1, "smile", { t: 0, acc }); ctx = keep;
    const o = document.createElement("canvas"); o.width = 88; o.height = 158; const og = o.getContext("2d");
    for (let i = 0; i < 8; i++) og.drawImage(c, 4 + Math.cos(i * 0.785) * 3, 4 + Math.sin(i * 0.785) * 3);
    og.globalCompositeOperation = "source-in"; og.fillStyle = "#1b1424"; og.fillRect(0, 0, 88, 158);
    og.globalCompositeOperation = "source-over"; og.drawImage(c, 4, 4);
    SPR[acc] = o;
  }
}
const MASS = (() => {
  const r = rng(8), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"];
  for (let i = 0; i < 620; i++) {
    const y = 600 + Math.pow(r(), 1.4) * 110, x = -500 + r() * 1700;
    if (y > 655 && x > 160 && x < 500) continue;           // vor der Kuppel freilassen
    a.push({ x, y, s: 0.22 + (y - 600) / 110 * 0.32, acc: keys[Math.floor(r() * keys.length)], ph: r() * 6 });
  }
  return a.sort((p, q) => p.y - q.y);
})();
function massCrowd(t, cheer) {
  for (const m of MASS) {
    const sp = SPR[m.acc]; if (!sp) continue;
    const hop = cheer ? Math.abs(Math.sin(t * 7 + m.ph)) * 6 * cheer : 0;
    const w = 88 * m.s, h = 158 * m.s;
    ctx.drawImage(sp, m.x - w / 2, m.y - h - hop, w, h);
  }
}
const BGROCKETS = (() => { const r = rng(12), a = []; for (let i = 0; i < 26; i++) a.push([-700 + i * 95 + r() * 40, 598 + r() * 8, 0.28 + r() * 0.12]); return a; })();
function ufo(x, y, s, t, i) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 4); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7c8a9a"; ctx.beginPath(); ctx.ellipse(0, 0, 37, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(140,255,120,0.85)"; ctx.beginPath(); ctx.ellipse(0, -7, 16, 12, 0, Math.PI, 0); ctx.fill();
  for (let k = -2; k <= 2; k++) circle(k * 14, 3, 2.6, (k + Math.floor(t * 6) + i) % 2 ? "#ffd23a" : "#ff4b6e");
  ctx.restore();
}
function phobosBig(x, y, r) {
  circle(x, y, r + 3, "#1b1424"); circle(x, y, r, "#8e7d70");
  for (const [dx, dy, cr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.22], [-0.05, 0.35, 0.12], [0.35, -0.35, 0.1]]) circle(x + dx * r, y + dy * r, cr * r, "#74655a");
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.15, r, 0, Math.PI * 2); ctx.fill();
}
function alienFace(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 46, 54, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5fd35a"; ctx.beginPath(); ctx.ellipse(0, 0, 43, 51, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1b1424"; for (const d of [-1, 1]) { ctx.save(); ctx.translate(d * 18, -4); ctx.rotate(d * -0.4); ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 30, -24); ctx.lineTo(d * 8, -16); ctx.stroke(); }
  const m = 4 + Math.abs(Math.sin(t * 16)) * 6; ctx.beginPath(); ctx.ellipse(0, 26, 12, m * 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = "#1b1424"; ctx.fill();
  ctx.restore();
}
function donerShop(x, y, s) { // Unterkante Mitte
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f4e3c4"; ctx.fillRect(-70, -90, 140, 90);
  ctx.fillStyle = "#e5442f"; ctx.beginPath(); ctx.moveTo(-80, -88); ctx.lineTo(80, -88); ctx.lineTo(70, -110); ctx.lineTo(-70, -110); ctx.fill();
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#e5442f"; ctx.beginPath(); ctx.moveTo(-80 + i * 20, -88); ctx.lineTo(-60 + i * 20, -88); ctx.lineTo(-62 + i * 20, -74); ctx.lineTo(-78 + i * 20, -74); ctx.fill(); }
  ctx.fillStyle = "#2a2a30"; rr(-58, -150, 116, 36, 6); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.font = "26px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DÖNER", 0, -130);
  ctx.fillStyle = "#9ad3f0"; ctx.fillRect(-58, -62, 60, 40);
  // Spieß im Fenster
  ctx.fillStyle = "#a0522d"; ctx.beginPath(); ctx.moveTo(-36, -60); ctx.lineTo(-20, -60); ctx.lineTo(-24, -26); ctx.lineTo(-32, -26); ctx.fill();
  ctx.fillStyle = "#6b3a1e"; ctx.fillRect(16, -60, 34, 60);
  ctx.restore();
}
function dogEars(x, y, s) { // y = Helmmitte
  for (const d of [-1, 1]) {
    ctx.save(); ctx.translate(x + d * 33 * s, y - 6 * s); ctx.rotate(d * 0.25); ctx.scale(s * 0.85, s * 0.85);
    ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 12, 12, 21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c98a5a"; ctx.beginPath(); ctx.ellipse(0, 12, 10, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffb3d1"; ctx.beginPath(); ctx.ellipse(0, 12, 5, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function sparkleBurst(x, y, t, t0) {
  const d = t - t0; if (d < 0 || d > 0.7) return;
  ctx.save(); ctx.globalAlpha = 1 - d / 0.7; ctx.fillStyle = "#fff7a8";
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = 20 + d * 120, sz = 7 * (1 - d / 0.7) + 2;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8;
    ctx.beginPath(); ctx.moveTo(px, py - sz * 1.8); ctx.lineTo(px + sz * 0.5, py - sz * 0.5); ctx.lineTo(px + sz * 1.8, py); ctx.lineTo(px + sz * 0.5, py + sz * 0.5);
    ctx.lineTo(px, py + sz * 1.8); ctx.lineTo(px - sz * 0.5, py + sz * 0.5); ctx.lineTo(px - sz * 1.8, py); ctx.lineTo(px - sz * 0.5, py - sz * 0.5); ctx.fill(); }
  ctx.restore();
}
function speedLines(t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.35 * a; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
  const r = rng(Math.floor(t * 20));
  for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H * 0.7, l = 60 + r() * 120; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + l); ctx.stroke(); }
  ctx.restore();
}
function glitch(t, t0) { // RGB-Versatz + Scanlines über dem Alien-TV
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = "#000"; for (let y = 140; y < 400; y += 4) ctx.fillRect(58, y, 460, 2); ctx.restore();
  const d = t - t0, burst = d < 0.35 || (Math.sin(t * 7) > 0.97);
  if (burst) { const r = rng(Math.floor(t * 30)); ctx.save(); ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? "rgba(255,0,80,0.25)" : "rgba(0,255,220,0.25)"; ctx.fillRect(58 + r() * 40 - 20, 120 + r() * 260, 460, 6 + r() * 14); }
    ctx.restore(); }
}
function duck(x, y, s, t) { // Füße
  ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 6)) * 4); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -16, 22, 16, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -36, 13, "#1b1424");
  ctx.fillStyle = "#ffe14a"; ctx.beginPath(); ctx.ellipse(0, -16, 20, 14, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -36, 11, "#ffe14a");
  ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.moveTo(23, -38); ctx.lineTo(34, -34); ctx.lineTo(23, -31); ctx.fill();
  circle(17, -39, 2.3, "#1b1424");
  // kleiner Helm
  ctx.strokeStyle = "rgba(220,240,255,0.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(14, -36, 16, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
// Welt-Objekte aus Tag 4 (Häuser, Werft, Türme, Schildzentrale, Zubehör)
// ------------------------------------------------------------ Welt-Objekte
const HOUSES = (() => { const r = rng(31), a = [], cols = ["#ff6b6b", "#ffb43a", "#ffe14a", "#7bf27a", "#3fd3f2", "#b06bff", "#ff79c6"];
  for (let i = 0; i < 34; i++) a.push({ x: -650 + i * 58 + r() * 30, y: 606 + r() * 40, s: 0.5 + r() * 0.35, c: cols[i % cols.length], d: r() * 0.9 });
  return a.sort((p, q) => p.y - q.y); })();
function house(x, y, s, c) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 42, 46, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-42, -2, 84, 8);
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, 39, 43, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(-14, -26, 8, 12, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8eef2"; ctx.fillRect(-40, -4, 80, 8); ctx.fillStyle = "#2c3440"; rr(-9, -26, 18, 22, 8); ctx.fill();
  ctx.restore();
}
function shipyard(x, y, s, k) { // Raketenwerft: Gerüst + große Rakete
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.fillStyle = "#cfd6dc"; rr(-150, -40, 300, 40, 6); ctx.fill();
  ctx.strokeStyle = "#ffcf33"; ctx.lineWidth = 9;
  for (const gx of [-105, 105]) { ctx.beginPath(); ctx.moveTo(gx, -40); ctx.lineTo(gx, -330); ctx.stroke(); for (let yy = -80; yy > -330; yy -= 50) { ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + (gx < 0 ? 40 : -40), yy); ctx.stroke(); } }
  ctx.beginPath(); ctx.moveTo(-120, -330); ctx.lineTo(120, -330); ctx.stroke();
  ctx.restore();
  rocket(x, y - 40 * s * k, 1.55 * s * k, 0);
}
function watchtower(x, y, s, t, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.fillStyle = "#e9edf0"; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(12, -200); ctx.lineTo(-12, -200); ctx.fill();
  ctx.fillStyle = "#cfd6dc"; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(22, 0); ctx.lineTo(12, -200); ctx.lineTo(4, -200); ctx.fill();
  ctx.fillStyle = "#f4f6f8"; rr(-48, -250, 96, 56, 6); ctx.fill(); ctx.fillStyle = "#2c3440"; rr(-38, -238, 76, 22, 4); ctx.fill();
  ctx.fillStyle = "#e5262b"; circle(0, -262, 7, "#e5262b");
  ctx.restore();
}
function beam(x, y, ang, len, w, a) { // Scheinwerferkegel
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(255,250,200,${0.45 * a})`); g.addColorStop(1, "rgba(255,250,200,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(len, -w); ctx.lineTo(len, w); ctx.lineTo(0, 6); ctx.fill(); ctx.restore();
}
function radioTower(x, y, s, t, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * k);
  ctx.strokeStyle = "#dfe5ea"; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-8, -440); ctx.moveTo(40, 0); ctx.lineTo(8, -440); ctx.stroke();
  ctx.lineWidth = 5; for (let i = 0; i < 10; i++) { const y0 = -i * 44, y1 = y0 - 44, w0 = 40 - i * 3.2, w1 = 40 - (i + 1) * 3.2; ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w1, y1); ctx.moveTo(w0, y0); ctx.lineTo(-w1, y1); ctx.moveTo(-w1, y1); ctx.lineTo(w1, y1); ctx.stroke(); }
  ctx.restore();
  if (k >= 1) {
    circle(x + 6 * s, y - 330 * s, 22 * s, "#f4f6f8"); circle(x, y - 450 * s, 7 * s, Math.sin(t * 6) > 0 ? "#ff3b3b" : "#6a1a1a");
    if (Math.sin(t * 6) > 0) glow(x, y - 450 * s, 30 * s, "255,60,60", 0.6);
  }
}
function shieldCore(x, y, s, t, k) { // Schildzentrale: Sockel + leuchtende Säule mit Ringen
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  ctx.fillStyle = "#dfe5ea"; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.lineTo(70, -90); ctx.lineTo(-70, -90); ctx.fill();
  ctx.fillStyle = "#c3ccd4"; ctx.fillRect(-90, -12, 180, 12);
  glow(0, -220, 90, "63,211,242", 0.5 + 0.2 * Math.sin(t * 5));
  ctx.fillStyle = "#3fd3f2"; rr(-20, -330, 40, 245, 14); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)"; rr(-12, -320, 8, 225, 4); ctx.fill();
  ctx.fillStyle = "#4a5260"; for (const ry of [-150, -230]) { ctx.beginPath(); ctx.ellipse(0, ry + Math.sin(t * 3 + ry) * 4, 46, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  circle(0, -338, 24, "#3fd3f2");
  ctx.restore();
}
function podium(x, y, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, k);
  ctx.fillStyle = "#3fa9f5"; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.lineTo(80, 18); ctx.lineTo(-80, 18); ctx.fill();
  ctx.fillStyle = "#cfd6e4"; ctx.fillRect(-80, 18, 160, 80); ctx.fillStyle = "#b6bfcf"; ctx.fillRect(-80, 18, 160, 10);
  ctx.restore();
  ctx.fillStyle = "#2a2c34"; ctx.fillRect(x + 66, y - 120, 5, 120); circle(x + 68, y - 124, 8, "#2a2c34");   // Mikrofon
}
// ------------------------------------------------------------ Easter Eggs + Wünsche (Zubehör)
function stoneFriend(x, y, s, t) {
  ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 5)) * 3); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -20, 30, 23, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9a8f88"; ctx.beginPath(); ctx.ellipse(0, -20, 27, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7d736c"; circle(-12, -10, 4, "#7d736c"); circle(14, -28, 3, "#7d736c");
  for (const d of [-9, 9]) { circle(d, -24, 6.5, "#fff"); circle(d + 1.5, -23, 3, "#111"); }
  ctx.strokeStyle = "#111"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, -15, 7, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.restore();
}
function chickenHat(x, y, s, t) { // y = Helmmitte
  ctx.save(); ctx.translate(x, y - 34 * s + Math.sin(t * 9) * 1.5); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2); ctx.fill(); circle(15, -14, 11, "#1b1424");
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(0, 0, 20, 13, 0, 0, Math.PI * 2); ctx.fill(); circle(15, -14, 9, "#fff");
  ctx.fillStyle = "#e5262b"; circle(13, -24, 4, "#e5262b"); circle(18, -23, 3.5, "#e5262b"); ctx.fillStyle = "#ffb43a"; ctx.beginPath(); ctx.moveTo(23, -15); ctx.lineTo(31, -12); ctx.lineTo(23, -10); ctx.fill();
  circle(17, -16, 1.8, "#111"); ctx.fillStyle = "#e9e9e9"; ctx.beginPath(); ctx.ellipse(-8, 0, 9, 6, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function backpack(x, y, s) { // hinter dem Körper, mit Minecraft-Schwert
  ctx.save(); ctx.translate(x - 30 * s, y - 70 * s); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-14, -4, 30, 44, 8); ctx.fill(); ctx.fillStyle = "#2c2f36"; rr(-12, -2, 26, 40, 7); ctx.fill();
  ctx.fillStyle = "#8a4dff"; for (let i = 0; i < 6; i++) ctx.fillRect(-2 + i * 4, -6 - i * 5, 5, 5);
  ctx.fillStyle = "#5b3a1e"; ctx.fillRect(-6, -2, 6, 5);
  ctx.restore();
}
function eggItem(kind, x, y, s, t) { // x,y = Füße des Astronauten
  const hy = y - 104 * s;
  ctx.save();
  if (kind === "cleats") for (const d of [-10, 10]) { ctx.fillStyle = "#111"; rr(x + d * s - 9 * s, y - 9 * s, 18 * s, 9 * s, 3 * s); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.fillRect(x + d * s - 6 * s, y - 7 * s, 12 * s, 2 * s); }
  if (kind === "dino") { ctx.fillStyle = "#4fbf4a"; ctx.beginPath(); ctx.arc(x, hy - 2 * s, 30 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.fillStyle = "#ffe14a"; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 10 * s - 5 * s, hy - 26 * s + Math.abs(i) * 4 * s); ctx.lineTo(x + i * 10 * s, hy - 38 * s + Math.abs(i) * 4 * s); ctx.lineTo(x + i * 10 * s + 5 * s, hy - 26 * s + Math.abs(i) * 4 * s); ctx.fill(); } }
  if (kind === "doner") { ctx.translate(x, hy - 34 * s); ctx.rotate(0.15); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-14 * s, 8 * s); ctx.lineTo(14 * s, 8 * s); ctx.lineTo(4 * s, -26 * s); ctx.lineTo(-4 * s, -26 * s); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-9 * s, -12 * s, 18 * s, 14 * s); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-10 * s, -2 * s, 20 * s, 4 * s); }
  if (kind === "bow") { ctx.fillStyle = "#ff79c6"; ctx.translate(x + 14 * s, hy - 24 * s); for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(d * 14 * s, -8 * s); ctx.lineTo(d * 14 * s, 8 * s); ctx.fill(); } circle(0, 0, 4 * s, "#d63384"); }
  if (kind === "gamer") { ctx.strokeStyle = "#111"; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(x, hy, 31 * s, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); for (const d of [-1, 1]) { ctx.fillStyle = "#111"; rr(x + d * 31 * s - 6 * s, hy - 10 * s, 12 * s, 20 * s, 5 * s); ctx.fill(); ctx.fillStyle = "#3fd3f2"; ctx.fillRect(x + d * 31 * s - 2 * s, hy - 6 * s, 4 * s, 12 * s); }
    ctx.fillStyle = "#222"; rr(x - 16 * s, y - 50 * s, 32 * s, 14 * s, 6 * s); ctx.fill(); circle(x + 8 * s, y - 43 * s, 2.5 * s, "#e5262b"); circle(x - 8 * s, y - 43 * s, 2.5 * s, "#3fd3f2"); }
  if (kind === "cola") { ctx.fillStyle = "#d61f26"; rr(x + 26 * s, y - 52 * s, 11 * s, 18 * s, 2 * s); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(x + 27 * s, y - 45 * s, 9 * s, 2.5 * s); }
  if (kind === "melon") { ctx.fillStyle = "#2f8a3a"; ctx.beginPath(); ctx.ellipse(x - 30 * s, y - 42 * s, 14 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#7bd36f"; ctx.lineWidth = 2 * s; for (const d of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(x - 30 * s + d * s, y - 52 * s); ctx.lineTo(x - 30 * s + d * s, y - 32 * s); ctx.stroke(); } }
  if (kind === "cat") { const cx = x + 34 * s, cy = y; ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(cx, cy - 10 * s, 12 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill(); circle(cx + 6 * s, cy - 22 * s, 8 * s, "#1b1424");
    ctx.fillStyle = "#8a8f99"; ctx.beginPath(); ctx.ellipse(cx, cy - 10 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill(); circle(cx + 6 * s, cy - 22 * s, 6.5 * s, "#8a8f99");
    ctx.beginPath(); ctx.moveTo(cx + 1 * s, cy - 26 * s); ctx.lineTo(cx + 3 * s, cy - 33 * s); ctx.lineTo(cx + 6 * s, cy - 27 * s); ctx.moveTo(cx + 7 * s, cy - 27 * s); ctx.lineTo(cx + 10 * s, cy - 33 * s); ctx.lineTo(cx + 12 * s, cy - 26 * s); ctx.fill();
    ctx.strokeStyle = "#8a8f99"; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(cx - 10 * s, cy - 8 * s); ctx.quadraticCurveTo(cx - 22 * s, cy - 14 * s + Math.sin(t * 4) * 4 * s, cx - 16 * s, cy - 26 * s); ctx.stroke(); }
  if (kind === "dog") { const cx = x - 36 * s, cy = y; ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(cx, cy - 12 * s, 15 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill(); circle(cx - 12 * s, cy - 22 * s, 9 * s, "#1b1424");
    ctx.fillStyle = "#c98a5a"; ctx.beginPath(); ctx.ellipse(cx, cy - 12 * s, 13 * s, 8.5 * s, 0, 0, Math.PI * 2); ctx.fill(); circle(cx - 12 * s, cy - 22 * s, 7.5 * s, "#c98a5a");
    ctx.fillStyle = "#8a5a3a"; ctx.beginPath(); ctx.ellipse(cx - 17 * s, cy - 20 * s, 3 * s, 6 * s, 0.3, 0, Math.PI * 2); ctx.fill(); circle(cx - 18 * s, cy - 23 * s, 1.5 * s, "#111");
    ctx.strokeStyle = "#c98a5a"; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(cx + 12 * s, cy - 14 * s); ctx.lineTo(cx + 20 * s, cy - 22 * s + Math.sin(t * 12) * 3 * s); ctx.stroke(); }
  ctx.restore();
}
function lambo(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-62, -2); ctx.lineTo(-52, -18); ctx.lineTo(-10, -30); ctx.lineTo(30, -28); ctx.lineTo(62, -14); ctx.lineTo(64, -2); ctx.fill();
  ctx.fillStyle = "#ffcf1a"; ctx.beginPath(); ctx.moveTo(-58, -4); ctx.lineTo(-50, -16); ctx.lineTo(-10, -27); ctx.lineTo(28, -25); ctx.lineTo(58, -13); ctx.lineTo(60, -4); ctx.fill();
  ctx.fillStyle = "#2c3440"; ctx.beginPath(); ctx.moveTo(-18, -25); ctx.lineTo(16, -24); ctx.lineTo(28, -17); ctx.lineTo(-28, -17); ctx.fill();
  for (const wx of [-36, 38]) { circle(wx, -2, 11, "#1b1424"); circle(wx, -2, 5, "#c9ccd2"); }
  ctx.restore();
}
// Front-Reihe: Easter-Egg-Astronauten (ohne Namen) + Wunsch-Astronauten
const EGGS = [
  { k: "cleats", x: 40, y: 732 }, { k: "dino", x: 110, y: 728 }, { k: "doner", x: 180, y: 734 }, { k: "cat", x: 250, y: 730 }, { k: "dog", x: 560, y: 732 },
  { k: "melon", x: 640, y: 728 }, { k: "bow", x: 710, y: 734 }, { k: "cola", x: 780, y: 729 }, { k: "gamer", x: 850, y: 733 }, { k: "cleats", x: -40, y: 731, skip: true },
].filter(e => !e.skip).map((e, i) => ({ ...e, s: 0.8, acc: ["#3fd3f2", "#7bf27a", "#ffb43a", "#b06bff", "#ff79c6", "#ffd23a", "#ff4b6e", "#3fd3f2", "#7bf27a"][i] }));
const WISH = { jakob: { x: 255, y: 768, acc: "#9a8f88" }, bz: { x: 590, y: 768, acc: "#ffb43a" }, hero: { x: 680, y: 770, acc: "#8a4dff" } };
// ============================================================ Tag 5 „Rotanien zerstört“ (base.js + helpers3.js + lib4.js + lib5.js + tag5.js -> scene.js)
// Ablauf 1:1 wie Tag 5 im Original, alle Zeiten hängen an den gesprochenen Wörtern (build/words.json).
const T = {
  rew: wt(7), night: wt(11) + 0.3, poll: wt(12), polls: wt(20), held: wt(21), whole: wt(25), party: wt(28), won: wt(35),
  four: wt(36), clock: wt(38), msIn: wt(40), msLab: wt(43), bigger: wt(44), still: wt(48), keiner: wt(53), shotPre: wt(56) + 0.45,
  shot: wt(59), bar51: wt(60) + 0.1, bar0: wt(62), shatter: wt(64),
  werft: wt(65), werftX: wt(68), funk: wt(69), funkX: wt(71), wach: wt(72), wachX: wt(74), doner: wt(75), donerX: wt(77),
  houses: wt(78), housesX: wt(80), run: wt(82), last: wt(89), noRoom: wt(98), hatch: wt(101), cd2: wt(106), cd1: wt(110),
  start: wt(114), lift: wt(115), core: wt(118), coreX: wt(120), planet: wt(123), crack: wt(126), days: wt(130), minute: wt(139),
  row: wt(143), rest: wt(156), chase: wt(163), fuel: wt(165), follow: wt(167), seek: wt(178), where: wt(183), loop: SPEECH_END + 0.25,
};
const FOLLOWERS = 822;
const AV = {};
const scene = t => t < T.planet ? "world" : t < T.row ? "space" : t < T.chase ? "row" : "chase";

// ------------------------------------------------------------ Zerstörung: wann ist was kaputt?
const DESTROY = { werft: T.werftX, funk: T.funkX, wach: T.wachX, doner: T.donerX, houses: T.housesX, dome: T.housesX + 0.35, core: T.coreX };
const ruined = (k, t) => t < T.rew + 0.25 || t >= DESTROY[k];
// Explosionen (Welt): [Zeit, x, y, Größe]
const EXPL = [
  [T.werftX, -180, 520, 1.6], [T.werftX + 0.12, -120, 650, 1.0], [T.funkX, 1000, 420, 1.5], [T.funkX + 0.1, 990, 620, 1.0],
  [T.wachX, 790, 520, 1.3], [T.wachX + 0.1, -430, 520, 1.2], [T.donerX, 30, 620, 1.3],
  [T.housesX, 120, 620, 1.2], [T.housesX + 0.1, 330, 600, 1.6], [T.housesX + 0.2, 560, 630, 1.1], [T.housesX + 0.3, -300, 620, 1.1], [T.housesX + 0.35, 760, 620, 1.0],
  [T.coreX, 620, 520, 1.8], [T.coreX + 0.12, 640, 660, 1.2],
];
// rote Strahlen vom Mutterschiff auf die Ziele (kurz vor der Explosion)
const RAYS = EXPL.filter((e, i) => i % 2 === 0 || e[0] === T.housesX + 0.2).filter(e => e[0] < T.coreX).map(e => [e[0] - 0.22, e[1], e[2] + 80]);
// Feuer an den Ruinen
const FIRES = [[-180, 690, 1.3], [-120, 700, 0.9], [1000, 695, 1.2], [790, 708, 0.9], [-430, 708, 0.9], [30, 700, 1.1], [330, 685, 1.6],
  [300, 694, 0.8], [440, 690, 0.9], [560, 640, 0.7], [-300, 640, 0.7], [760, 640, 0.7], [620, 705, 1.2], [-560, 650, 0.7], [900, 650, 0.6]];
const fireOn = (x, t) => t < T.rew + 0.25 || (x < -300 ? t >= T.wachX : x < -60 ? t >= T.werftX : x < 90 ? t >= T.donerX : x > 950 ? t >= T.funkX : x > 700 ? t >= T.wachX : x > 600 && x < 660 ? t >= T.coreX : t >= T.housesX);

// ------------------------------------------------------------ neue Zeichnungen
function flame(x, y, s, t, seed) { // Feuer (Unterkante)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(0, -30, 90, "255,120,30", 0.35 + 0.1 * Math.sin(t * 9 + seed));
  for (const [c, w, h] of [["#e5262b", 30, 70], ["#ff8a1e", 22, 54], ["#ffd23a", 13, 34]]) {
    const f = 1 + 0.18 * Math.sin(t * 13 + seed * 3) + 0.1 * Math.sin(t * 21 + seed);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w, 0);
    ctx.quadraticCurveTo(-w * 1.1, -h * 0.5 * f, Math.sin(t * 7 + seed) * 6, -h * f);
    ctx.quadraticCurveTo(w * 1.1, -h * 0.5 * f, w, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function smoke(x, y, s, t, seed) {
  for (let i = 0; i < 5; i++) {
    const k = ((t * 0.35 + i / 5 + seed * 0.13) % 1);
    ctx.globalAlpha = 0.45 * (1 - k); circle(x + Math.sin(seed + i * 2 + t) * 20 * k, y - 60 * s - k * 260 * s, (18 + 50 * k) * s, "#2b2230");
  }
  ctx.globalAlpha = 1;
}
function rubble(x, y, w) {
  const r = rng(Math.round(x * 7 + y));
  for (let i = 0; i < 9; i++) {
    const px = x + (r() - 0.5) * w * 1.6, sz = (8 + r() * 18) * w / 60;
    ctx.fillStyle = ["#5a4a52", "#7b6b70", "#3e3239", "#c9cfd5"][i % 4];
    ctx.beginPath(); ctx.moveTo(px - sz, y); ctx.lineTo(px - sz * 0.4, y - sz * (0.8 + r())); ctx.lineTo(px + sz * 0.7, y - sz * 0.6); ctx.lineTo(px + sz, y); ctx.fill();
  }
}
function explosion(t, t0, x, y, s) {
  const d = t - t0; if (d < 0 || d > 1.1) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const k = easeOut(d / 0.5), fade = 1 - clamp((d - 0.35) / 0.75);
  glow(0, 0, 260 * k, "255,150,40", 0.9 * fade);
  ctx.globalAlpha = fade; circle(0, 0, 120 * k, "#ff8a1e"); circle(0, 0, 85 * k, "#ffd23a"); circle(0, 0, 45 * k * (1 - d), "#fff7d0");
  ctx.strokeStyle = `rgba(255,240,200,${0.8 * (1 - clamp(d / 0.4))})`; ctx.lineWidth = 10 * (1 - clamp(d / 0.4)); ctx.beginPath(); ctx.arc(0, 0, 60 + 260 * clamp(d / 0.4), 0, Math.PI * 2); ctx.stroke();
  const r = rng(Math.round(x + y));
  for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, v = 160 + r() * 260; ctx.fillStyle = i % 2 ? "#3e3239" : "#ffb43a"; ctx.fillRect(Math.cos(a) * v * d - 5, Math.sin(a) * v * d + 300 * d * d - 5, 10, 10); }
  ctx.restore();
}
function brokenDome(x, y) { // eingestürzte Regierungskuppel
  ctx.save();
  ctx.fillStyle = "rgba(170,215,232,0.55)"; ctx.beginPath(); ctx.moveTo(x - 150, y); ctx.lineTo(x - 140, y - 60); ctx.lineTo(x - 95, y - 105); ctx.lineTo(x - 60, y - 70); ctx.lineTo(x - 20, y - 120); ctx.lineTo(x + 20, y - 60); ctx.lineTo(x + 70, y - 95); ctx.lineTo(x + 110, y - 40); ctx.lineTo(x + 150, y); ctx.fill();
  ctx.strokeStyle = "#cfd6dc"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 150, y); ctx.lineTo(x - 140, y - 60); ctx.lineTo(x - 95, y - 105); ctx.moveTo(x + 70, y - 95); ctx.lineTo(x + 110, y - 40); ctx.lineTo(x + 150, y); ctx.stroke();
  ctx.fillStyle = "#cfd6dc"; rr(x - 156, y - 8, 312, 14, 4); ctx.fill();
  ctx.restore();
  rubble(x, y, 110);
}
function tiltedSign(x, y) { // REGIERUNG-Schild hängt schief
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.35); ctx.translate(-x, -y); sign(x, y); ctx.restore();
}
function donerShop5(x, y, s, t) { // Dönerladen „SAFUAN“ (Wunsch von kazeyaha)
  donerShop(x, y, s);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#2a2a30"; rr(-62, -152, 124, 40, 6); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.font = "27px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SAFUAN", 0, -131);
  if (Math.sin(t * 5) > -0.3) glow(0, -132, 80, "255,210,60", 0.25);
  ctx.restore();
}
function mothership(cx, cy, t, s = 1) { // riesiges Mutterschiff (Welt), Mitte
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  glow(0, 210, 380, "255,40,60", 0.35 + 0.1 * Math.sin(t * 3));
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 1180, 330, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a3e5e"; ctx.beginPath(); ctx.ellipse(0, 0, 1160, 312, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(160,150,190,0.35)"; ctx.beginPath(); ctx.ellipse(-120, -150, 700, 90, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5c4f72"; ctx.beginPath(); ctx.ellipse(0, 40, 900, 230, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#776a8e"; ctx.lineWidth = 8; for (const k of [0.45, 0.7]) { ctx.beginPath(); ctx.ellipse(0, 60, 900 * k, 230 * k, 0, 0, Math.PI * 2); ctx.stroke(); }
  // Lichterkette rot/grün
  for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2; const on = (i + Math.floor(t * 8)) % 3 !== 0; const c = i % 2 ? "#ff3b4e" : "#5fffa0";
    const lx = Math.cos(a) * 1080, ly = Math.sin(a) * 280; circle(lx, ly, 14, on ? c : "#40303a"); if (on) glow(lx, ly, 40, i % 2 ? "255,60,80" : "95,255,160", 0.5); }
  // rotes Auge in der Mitte
  circle(0, 120, 120, "#1b1424"); circle(0, 120, 104, "#5a0f1e");
  const p = 0.6 + 0.4 * Math.sin(t * 6); circle(0, 120, 70 + 10 * p, "#ff2a3c"); circle(0, 120, 36, "#ffd0d0"); glow(0, 140, 260, "255,40,60", 0.5 * p);
  ctx.restore();
}
function burek(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circle(0, 0, 15, "#1b1424"); circle(0, 0, 13, "#e8b04a");
  ctx.strokeStyle = "#a8701e"; ctx.lineWidth = 2.5; ctx.beginPath(); for (let a = 0; a < 12; a += 0.3) { const r = a * 1.0; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
  ctx.restore();
}
function burekLauncher(x, y, s, ang, t, recoil = 0) { // Jimmbos Burek-Launcher (Fuß unten)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#3e3239"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(0, -40); ctx.lineTo(26, 0); ctx.moveTo(0, -40); ctx.lineTo(0, 0); ctx.stroke();
  ctx.translate(0, -44); ctx.rotate(ang); ctx.translate(-recoil * 10, 0);
  ctx.fillStyle = "#4f7a3a"; rr(-40, -15, 100, 30, 8); ctx.fill(); ctx.fillStyle = "#3a5c2a"; rr(52, -19, 18, 38, 5); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.fillRect(-20, -15, 8, 30); ctx.fillRect(10, -15, 8, 30);
  ctx.fillStyle = "#fff"; ctx.font = "11px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BUREK", 30, 1);
  ctx.restore();
}
function laserSword(x, y, ang, len, col, s) { // Griff bei x,y
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.globalAlpha = 0.35; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -len); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#555b66"; rr(-4, -10, 8, 20, 2); ctx.fill(); ctx.fillStyle = "#222"; ctx.fillRect(-4, -4, 8, 3);
  ctx.restore();
}
function sword(x, y, ang, s) { // Jakobs Plan: Schwerter
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = "#dfe5ea"; ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(3, -52); ctx.lineTo(0, -60); ctx.lineTo(-3, -52); ctx.fill();
  ctx.fillStyle = "#c9a227"; ctx.fillRect(-11, -10, 22, 5); ctx.fillStyle = "#5b3a1e"; ctx.fillRect(-3, -5, 6, 12);
  ctx.restore();
}
function bowArc(x, y, s, draw) { // Bogen (Mitte am Griff), zielt nach oben rechts
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.scale(s, s);
  ctx.strokeStyle = "#8a5a2a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 26, -Math.PI * 0.42, Math.PI * 0.42); ctx.stroke();
  ctx.strokeStyle = "#eee"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(Math.cos(-1.32) * 26, Math.sin(-1.32) * 26); ctx.lineTo(-draw * 12, 0); ctx.lineTo(Math.cos(1.32) * 26, Math.sin(1.32) * 26); ctx.stroke();
  ctx.restore();
}
function doner(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(3, -22); ctx.lineTo(-3, -22); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-8, -10, 16, 12); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-9, -2, 18, 3); ctx.restore(); }
function donerSpit(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = "#777"; ctx.fillRect(-2, -60, 4, 120);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-26, -44); ctx.lineTo(26, -44); ctx.lineTo(18, 40); ctx.lineTo(-18, 40); ctx.fill();
  ctx.fillStyle = "#b5652d"; ctx.beginPath(); ctx.moveTo(-23, -41); ctx.lineTo(23, -41); ctx.lineTo(16, 37); ctx.lineTo(-16, 37); ctx.fill();
  ctx.strokeStyle = "#7a3a16"; ctx.lineWidth = 3; for (let i = -30; i < 36; i += 12) { ctx.beginPath(); ctx.moveTo(-20, i); ctx.lineTo(20, i + 4); ctx.stroke(); }
  ctx.restore();
}
function lawTablet(x, y, s, rot) { // Gesetzestafel aus Tag 2/3
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-74, -94, 148, 188, 30); ctx.fill(); ctx.fillStyle = "#b9b3ab"; rr(-70, -90, 140, 180, 28); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "20px Comic"; ctx.fillText("GESETZE", 0, -58);
  ctx.font = "900 14px InterX"; ctx.fillText("1. KEINE SCHULE", 0, -18); ctx.fillText("2. KEINE STEUERN", 0, 10);
  ctx.strokeStyle = "#7a746c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.lineTo(-5, 62); ctx.lineTo(20, 46); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------ Fan-Astronauten (Wünsche aus Tag 3/4 + Jimmbo)
const FANS = [
  { name: "elster", acc: "#ff79c6", suit: "#ff9fd2", suit2: "#ffb6dc", suit3: "#e77fb8", item: "ears" },
  { name: "Gabriel", acc: "#3fd3f2", item: "saber" },
  { name: "Bz_Full", acc: "#ffb43a", item: "chicken" },
  { name: "herobrine", acc: "#8a4dff", item: "bag" },
  { name: "Jakob", acc: "#9a8f88", item: "stone" },
  { name: "Jimmbo", acc: "#7bf27a", item: "burek" },
];
function fanAstro(f, x, y, s, t, face = "happy", o = {}) {
  if (f.item === "bag") backpack(x, y, s);
  const opt = { t, acc: f.acc, suit: f.suit, suit2: f.suit2, suit3: f.suit3, ...o };
  if (f.item === "saber") opt.armR = -2.3;
  astronaut(x, y, s, face, opt);
  const hy = y - 104 * s;
  if (f.item === "ears") dogEars(x, hy, s);
  if (f.item === "chicken") chickenHat(x, hy, s, t);
  if (f.item === "saber") laserSword(x + 36 * s, y - 92 * s, 0.5, 70, "#3fd3f2", s);
  if (f.item === "stone") stoneFriend(x + 44 * s, y, 0.75 * s, t);
  if (f.item === "burek") burekLauncher(x - 38 * s, y, 0.55 * s, -0.5, t);
}

// ------------------------------------------------------------ Kamera (Welt-Szenen)
const LAST = { x: 150, y: 700, s: 2.2 };      // die letzte Rakete
const liftY = t => t < T.lift ? 0 : Math.pow(t - T.lift, 2) * 260 + (t - T.lift) * 60;
const CAM = [
  [0, 335, 600, 0.82], [T.rew, 335, 600, 0.95], [T.night - 0.12, 335, 590, 1.2], [T.night, 330, 520, 0.62], [T.held - 0.12, 330, 520, 0.64],
  [T.held + 0.18, 260, 600, 1.05], [T.party - 0.12, 270, 600, 1.08], [T.party + 0.1, 190, 655, 1.55], [T.four - 0.12, 200, 655, 1.6],
  [T.four + 0.12, 330, 470, 0.58], [T.bigger - 0.1, 330, 420, 0.55], [T.still - 0.2, 330, 330, 0.4], [T.still, 430, 690, 2.5],
  [T.shotPre - 0.1, 430, 690, 2.75], [T.shotPre + 0.08, 330, 420, 0.52], [T.shatter + 0.5, 330, 430, 0.5],
  [T.werft - 0.1, 330, 430, 0.5], [T.werft + 0.06, -180, 560, 1.3], [T.funk - 0.1, -180, 560, 1.36], [T.funk + 0.06, 1000, 480, 1.0],
  [T.wach - 0.1, 1000, 480, 1.05], [T.wach + 0.06, 760, 580, 1.25], [T.doner - 0.1, 760, 580, 1.3], [T.doner + 0.06, 40, 650, 1.9],
  [T.houses - 0.1, 40, 650, 1.95], [T.houses + 0.06, 260, 610, 0.85], [T.run - 0.1, 260, 610, 0.9], [T.run + 0.06, 380, 650, 1.45],
  [T.last - 0.1, 300, 650, 1.5], [T.last + 0.06, 170, 560, 1.15], [T.hatch - 0.1, 165, 565, 1.2], [T.hatch + 0.06, 168, 610, 2.7],
  [T.start - 0.1, 168, 610, 2.8], [T.start + 0.06, 150, 540, 1.35], [T.core - 0.1, 150, 520, 1.3], [T.core + 0.06, 520, 470, 0.72], [T.planet, 520, 455, 0.7],
];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) {
    const a = CAM[i - 1], b = CAM[i], k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
    return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k))];
  }
  return CAM.at(-1).slice(1);
}
const toScreen = (x, y, t) => { const [cx, cy, z] = cam(t); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z, z]; };

// ------------------------------------------------------------ Einblendungen
function pollShield(t, s) { // Creator-Umfrage wie im Original: „Hält unser Schild?“ 87 %
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1e1e22"; rr(-245, -100, 490, 200, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-205, -62, 22, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -227, -84, 44, 44); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "800 16px InterX"; ctx.fillText("Gedacht ·", -170, -74); ctx.fillStyle = "#5aa7e6"; ctx.fillText("Creator*in", -88, -74);
  ctx.fillStyle = "#fff"; ctx.font = "800 22px InterX, 'Noto Color Emoji'"; ctx.fillText("Hält unser Schild? 🛡️", -170, -46);
  const k = easeOut(ramp(t, T.poll + 0.25, T.poll + 1.1));
  ctx.fillStyle = "#2a2a30"; rr(-170, -22, 392, 42, 12); ctx.fill();
  ctx.fillStyle = "#f4f4f6"; rr(-170, -22, 392 * 0.87 * k, 42, 12); ctx.fill();
  ctx.fillStyle = k > 0.35 ? "#111" : "#fff"; ctx.font = "800 18px InterX, 'Noto Color Emoji'"; ctx.fillText("💪 Ja, der hält!", -156, 0);
  ctx.fillStyle = "#111"; ctx.textAlign = "right"; ctx.fillText(Math.round(87 * k) + "%", 208, 0);
  ctx.textAlign = "left"; ctx.fillStyle = "#2a2a30"; rr(-170, 28, 392, 42, 12); ctx.fill(); ctx.strokeStyle = "#45454d"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#4a4a52"; rr(-170, 28, 392 * 0.13 * k + 6, 42, 12); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText("😬 Nein, der bricht!", -156, 50); ctx.fillStyle = "#a9a9b0"; ctx.textAlign = "right"; ctx.fillText(Math.round(13 * k) + "%", 208, 50);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8a92"; ctx.font = "700 13px InterX"; ctx.fillText("Umfrage beendet", -170, 84);
  ctx.restore();
}
function topComment(s) { // eigener Kommentar am Ende (wie im Original, weiß)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 300); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-232, -52, 464, 104, 18); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-188, -4, 32, CYAN); if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-188, -4, 28, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -216, -32, 56, 56); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#8a8f9a"; ctx.font = "700 13px InterX"; ctx.fillText("Gedacht", -144, -30);
  ctx.fillStyle = CYAN; rr(-84, -40, 112, 22, 11); ctx.fill(); ctx.fillStyle = "#06343f"; ctx.font = "900 12px InterX"; ctx.fillText("Top-Kommentar", -76, -29);
  ctx.fillStyle = "#111"; ctx.font = "900 26px InterX, 'Noto Color Emoji'"; ctx.fillText("Unser neuer Planet? 🪐", -144, 2);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 12px InterX"; ctx.fillText("Jetzt · Antworten", -144, 32);
  ctx.fillStyle = "#c0c4cc"; ctx.font = "16px InterX"; ctx.textAlign = "center"; ctx.fillText("♥", 205, -14);
  ctx.restore();
}
function topLabel(txt, sub, s, col = CYAN, y = 190, size = 46) { // großer Titel oben
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, y); ctx.scale(s, s);
  outlined(txt, 0, 0, size, col, "#0e1a30", 11); if (sub) outlined(sub, 0, size * 0.85, size * 0.55, "#fff", "#0e1a30", 7);
  ctx.restore();
}
function shieldBar5(t, s) {
  if (s <= 0.01) return;
  let v = 100; if (t >= T.bar51) v = lerp(100, 51, easeOut(ramp(t, T.bar51, T.bar51 + 0.25))); if (t >= T.bar0) v = lerp(51, 0, easeOut(ramp(t, T.bar0, T.bar0 + 0.35)));
  const col = v > 80 ? "#3fd3f2" : v > 40 ? "#ffb43a" : RED;
  ctx.save(); ctx.translate(288, 170); ctx.scale(s, s);
  ctx.font = "34px Comic, 'Noto Color Emoji'"; const a = "🛡 SCHILD: ", b = Math.round(v) + " %", wa = ctx.measureText(a).width, wb = ctx.measureText(b).width;
  outlined(a, -(wa + wb) / 2, -22, 34, "#fff", "#0e1a30", 8, 900, "left"); outlined(b, -(wa + wb) / 2 + wa, -22, 34, v > 80 ? "#fff" : RED, "#0e1a30", 8, 900, "left");
  ctx.fillStyle = "#1b1424"; rr(-170, 6, 340, 24, 12); ctx.fill(); if (v > 0.5) { ctx.fillStyle = col; rr(-166, 10, 332 * v / 100, 16, 8); ctx.fill(); }
  ctx.restore();
}
function rewindFx(t, a) { // Zurückspulen: Streifen + ⏪
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const r = rng(Math.floor(t * 40));
  for (let i = 0; i < 9; i++) { ctx.fillStyle = `rgba(255,255,255,${0.08 + r() * 0.12})`; ctx.fillRect(0, r() * H, W, 3 + r() * 10); }
  ctx.fillStyle = "rgba(0,0,0,0.12)"; for (let y = 0; y < H; y += 5) ctx.fillRect(0, y, W, 2);
  outlined("⏪", 470, 110, 54, "#fff", "#0e1a30", 8);
  ctx.restore();
}
function sticker(txt, x, y, s, rot = 0.05) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = "19px Comic, 'Noto Color Emoji'"; const w = ctx.measureText(txt).width + 28;
  ctx.fillStyle = "#ffd23a"; rr(-w / 2, -19, w, 38, 10); ctx.fill(); ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#1b1424"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}

// ------------------------------------------------------------ Effekte
const IMPACTS = [0, T.shot, T.shatter, T.werftX, T.funkX, T.wachX, T.donerX, T.housesX, T.housesX + 0.2, T.lift, T.coreX, T.crack, T.loop + 0.9];
function shakeAt(t) {
  let dx = 0, dy = 0;
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.5) continue; const big = t0 === T.shatter || t0 === T.coreX || t0 === T.crack ? 2.4 : t0 === T.lift ? 0.8 : 1.4; const a = 7 * big * Math.exp(-d * 9); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  if (t >= T.msIn && t < T.still) { const a = 1.2 * ramp(t, T.msIn, T.msIn + 1); dx += Math.sin(t * 40) * a; dy += Math.cos(t * 33) * a; }      // Dröhnen des Mutterschiffs
  if (t >= T.lift && t < T.core) { dx += Math.sin(t * 50) * 2.5; dy += Math.cos(t * 43) * 2.5; }
  if (t >= T.crack && t < T.days) { const a = 3 * (1 - ramp(t, T.crack, T.days)); dx += Math.sin(t * 47) * a; dy += Math.cos(t * 39) * a; }
  return [dx, dy];
}
const CUTS = [...CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05), T.planet, T.row, T.chase];
function flash(t) {
  let a = 0, red = 0;
  for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.25 * (1 - d / 0.14)); }
  for (const t0 of [T.shot, T.shatter, T.coreX, T.crack]) { const d = t - t0; if (d >= 0 && d < 0.25) a = Math.max(a, 0.6 * (1 - d / 0.25)); }
  // roter Explosionsblitz: Frame 1 und Ende (nahtloser Loop)
  if (t < 0.35) red = 0.85 * (1 - t / 0.35);
  if (t > DUR - 0.2) red = Math.max(red, ramp(t, DUR - 0.2, DUR - 0.02) * 0.85);
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
  if (red > 0) { ctx.fillStyle = `rgba(255,60,30,${red})`; ctx.fillRect(0, 0, W, H); }
}
function shieldDome(t) { // Kuppel: steht nachts, bricht beim Schuss
  if (t < T.night || t >= T.shatter) return;
  const hitGlow = Math.max(t >= T.shot ? Math.exp(-(t - T.shot) * 2.5) : 0, ...NIGHT_HITS.map(h => t >= h ? Math.exp(-(t - h) * 6) * 0.6 : 0));
  const crackK = t >= T.bar51 ? ramp(t, T.bar51, T.shatter) : 0;
  const flick = t >= T.bar0 && Math.sin(t * 70) > 0.3 ? 0.4 : 1;
  const cx = 330, cy = 760, rx = 1250, ry = 820;
  ctx.save(); ctx.globalAlpha = flick;
  const g = ctx.createRadialGradient(cx, cy - ry * 0.4, ry * 0.2, cx, cy, ry);
  g.addColorStop(0, "rgba(63,211,242,0.05)"); g.addColorStop(0.85, `rgba(63,211,242,${0.14 + 0.25 * hitGlow})`); g.addColorStop(1, `rgba(140,240,255,${0.45 + 0.3 * hitGlow})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = `rgba(160,245,255,${0.7 + 0.3 * hitGlow})`; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = "rgba(160,245,255,0.18)"; ctx.lineWidth = 2;
  for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry * i / 7, 0, Math.PI, 0); ctx.stroke(); }
  for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx * i / 8, ry, 0, Math.PI, 0); ctx.stroke(); }
  if (crackK > 0) { // Risse vom Einschlagpunkt
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 4; const r = rng(77);
    for (let i = 0; i < 14; i++) { let x = cx, y = cy - ry, a = Math.PI * (0.1 + 0.8 * r()); ctx.beginPath(); ctx.moveTo(x, y);
      const n = Math.ceil(8 * crackK); for (let j = 0; j < n; j++) { a += (r() - 0.5) * 0.8; x += Math.cos(a) * 70; y += Math.sin(a) * 70; ctx.lineTo(x, y); } ctx.stroke(); }
  }
  ctx.restore();
}
const SHARDS = (() => { const r = rng(91), a = []; for (let i = 0; i < 150; i++) { const an = Math.PI + r() * Math.PI, rad = 0.3 + r() * 0.7; a.push({ x: 330 + Math.cos(an) * 1250 * rad, y: 760 + Math.sin(an) * 820 * rad, vx: Math.cos(an) * (150 + r() * 350), vy: -60 - r() * 260, rot: r() * 6, vr: (r() - 0.5) * 10, s: 25 + r() * 55 }); } return a; })();
function shards(t) {
  const d = t - T.shatter; if (d < 0 || d > 2.2) return;
  ctx.save(); ctx.globalAlpha = 1 - clamp((d - 1.4) / 0.8);
  for (const p of SHARDS) {
    ctx.save(); ctx.translate(p.x + p.vx * d, p.y + p.vy * d + 380 * d * d); ctx.rotate(p.rot + p.vr * d);
    ctx.fillStyle = "rgba(150,240,255,0.55)"; ctx.strokeStyle = "rgba(230,255,255,0.95)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-p.s * 0.5, p.s * 0.4); ctx.lineTo(p.s * 0.1, -p.s * 0.6); ctx.lineTo(p.s * 0.55, p.s * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// nachts: Aliens schießen, der Schild hält, Jakobs Bogenschützen geben Rückendeckung
const NIGHT_HITS = [T.night + 0.4, T.night + 1.3, T.held + 0.2, T.held + 0.9, T.held + 1.5];
const NIGHT_UFOS = (() => { const r = rng(5), a = []; for (let i = 0; i < 14; i++) a.push({ x: -400 + r() * 1500, y: -170 + r() * 120, s: 0.9 + r() * 0.6 }); return a; })();
const ARCHERS = [[150, 640], [210, 646], [470, 640], [540, 646], [270, 650], [600, 650]];
const SWORDS = [[60, 742], [140, 748], [220, 742], [520, 742], [600, 748], [680, 742]];

// Menge, die zur Rakete rennt
function runCrowd(t) {
  const k = ramp(t, T.run - 0.1, T.hatch);
  for (const [i, m] of MASS.entries()) {
    const sp = SPR[m.acc]; if (!sp) continue;
    const dirx = LAST.x - m.x, dist = Math.abs(dirx);
    const x = m.x + Math.sign(dirx) * Math.min(Math.max(0, dist - 60), 900 * k * (0.6 + 0.4 * ((i * 7) % 10) / 10));
    const hop = Math.abs(Math.sin(t * 14 + m.ph)) * 7;
    const w = 88 * m.s, h = 158 * m.s;
    ctx.drawImage(sp, x - w / 2, m.y - h - hop, w, h);
  }
}

// ------------------------------------------------------------ Welt-Szene (Kolonie)
function drawWorld(t, z) {
  const ruin = k => ruined(k, t);
  const msY = t < T.msIn ? -1400 : lerp(-1400, -430, easeOut(ramp(t, T.msIn, T.msLab + 0.3)));
  sky(t);
  if (t >= T.night && t < T.msIn) for (const [i, u] of NIGHT_UFOS.entries()) ufo(u.x, u.y, u.s, t, i);
  if (t >= T.msIn || t < T.rew + 0.25) mothership(330, t < T.rew + 0.25 ? -430 : msY, t);
  ground();
  // Häuser
  for (const h of HOUSES) { if (ruin("houses")) { rubble(h.x, h.y, 40 * h.s); continue; } house(h.x, h.y, h.s, h.c); }
  for (const [x, y, s] of BGROCKETS) if (!ruin("houses")) rocket(x, y, s, 0);
  if (t >= T.run && t < T.lift + 0.5) runCrowd(t);
  else if (!(t < T.rew + 0.25)) massCrowd(t, t >= T.party && t < T.four ? 1 : 0);
  // Scheinwerfer
  if (!ruin("wach") && t >= T.night) { beam(790, 455, -2.2 + Math.sin(t * 0.8) * 0.5, 520, 70, 1); beam(-430, 470, -1.0 + Math.sin(t * 0.7 + 1) * 0.5, 520, 70, 1); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  if (!ruin("funk")) radioTower(1000, 700, 1, t, 1); else rubble(1000, 700, 70);
  if (!ruin("werft")) shipyard(-180, 705, 1, 1); else rubble(-180, 705, 110);
  if (!ruin("wach")) { watchtower(790, 712, 1, t, 1); watchtower(-430, 712, 1, t, 1); } else { rubble(790, 712, 50); rubble(-430, 712, 50); }
  boulders();
  if (!ruin("dome")) { dome(330, 690); sign(445, 690); } else { brokenDome(330, 690); tiltedSign(445, 690); }
  if (!ruin("core")) shieldCore(620, 712, 1, t, 1); else rubble(620, 712, 80);
  rocket(-80, 700, 0.95, 0); rocket(720, 700, 0.95, 0);
  if (!ruin("doner")) donerShop5(30, 705, 0.95, t); else { rubble(30, 705, 70); }
  // Burek-Launcher von Jimmbo (feuert ein letztes Mal, dann weg)
  if (!ruin("wach")) { const rec = t >= T.wach + 0.35 ? Math.exp(-(t - T.wach - 0.35) * 8) : 0; burekLauncher(700, 740, 1, -0.75, t, rec); }
  // Front-Reihe (Easter Eggs aus Tag 4), nachts mit Jakobs Schwertern
  if (t >= T.rew + 0.25 && t < T.run) {
    for (const [i, e] of EGGS.entries()) {
      const o = { t: t + i * 0.7, acc: e.acc }; let f = ["smile", "happy", "talk"][i % 3];
      if (t >= T.party && t < T.four) { o.armL = 2.6; o.armR = -2.6; f = "happy"; }
      if (t >= T.msIn) f = "shock";
      astronaut(e.x, e.y, e.s, f, o); eggItem(e.k, e.x, e.y, e.s, t);
    }
    if (t < T.party) for (const [i, [x, y]] of SWORDS.entries()) { astronaut(x, y, 0.85, "smirk", { t: t + i, acc: "#c9a227", armR: -2.2 }); sword(x + 30, y - 80, 0.35 + Math.sin(t * 3 + i) * 0.1, 1); }
    if (t < T.party) for (const [i, [x, y]] of ARCHERS.entries()) { astronaut(x, y, 0.55, "smirk", { t: t + i, acc: "#4fbf4a", armL: -1.2 }); bowArc(x - 20, y - 50, 0.7, 0.5 + 0.5 * Math.sin(t * 4 + i)); }
    // jeno: Laserschwert + Döner bei der Feier
    if (t >= T.party - 0.3 && t < T.four) { const jx = 330, jy = 772; astronaut(jx, jy, 1, "happy", { t, acc: "#7bf27a", armL: 2.4, armR: -2.4 }); laserSword(jx + 40, jy - 118, 0.25 + Math.sin(t * 8) * 0.25, 80, "#7bf27a", 1); doner(jx - 44, jy - 122, 1.1); }
  }
  // die letzte Rakete (mit Luke)
  const ly = LAST.y - liftY(t);
  if (t < T.last - 0.1) rocket(LAST.x, LAST.y - 10, 0.95, 0);
  else { const lx = LAST.x + (t >= T.core ? Math.pow(t - T.core, 1.3) * 260 : 0); ctx.save(); ctx.translate(lx, ly); ctx.rotate(t >= T.core ? Math.min(0.5, (t - T.core) * 0.6) : 0); rocket(0, 0, LAST.s, t >= T.lift ? 1.4 : t >= T.start ? 0.5 : 0); ctx.restore(); }
  if (t >= T.last - 0.1 && t < T.lift + 2) { // Luke
    const close = t >= T.start ? easeOut(ramp(t, T.start, T.start + 0.25)) : 0;
    const hx = LAST.x, hb = ly - 12 * LAST.s, hh = 52 * LAST.s, hw = 30 * LAST.s;
    if (t >= T.last) { ctx.fillStyle = "#2a2230"; rr(hx - hw / 2, hb - hh, hw, hh, 8); ctx.fill(); }
    // Hauptfigur in der Luke + Fans werden reingezogen
    if (t >= T.hatch && close < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(hx - hw / 2 - 30, hb - hh - 90, hw + 120, hh + 90); ctx.clip();
      astronaut(hx - 6, hb, 0.72, t >= T.cd1 ? "shock" : "talk", { t, armR: -1.3 + Math.sin(t * 9) * 0.2 });
      ctx.restore();
    }
    if (t >= T.last && close > 0) { ctx.fillStyle = "#e9edf0"; rr(hx - hw / 2, hb - hh, hw, hh * close, 8); ctx.fill(); ctx.strokeStyle = "#b9c0c8"; ctx.lineWidth = 3; ctx.stroke(); }
    if (t >= T.hatch && t < T.start) {
      const step = (T.start - 0.15 - (T.hatch + 0.2)) / FANS.length;
      for (const [i, f] of FANS.entries()) {
        const t0 = T.hatch + 0.2 + i * step, k = ramp(t, t0, t0 + step * 0.9);
        if (k >= 1) continue;
        const qx = hx + 85 + (i - Math.max(0, Math.floor((t - T.hatch - 0.2) / step))) * 80;
        const x = k > 0 ? lerp(hx + 85, hx + 4, easeIO(k)) : qx, y = k > 0 ? lerp(LAST.y + 34, hb - 4, easeIO(k)) : LAST.y + 34;
        const s = k > 0.65 ? 0.8 * (1 - ramp(k, 0.65, 1)) : 0.8;
        if (s > 0.02 && qx < hx + 380) fanAstro(f, x, y, s, t, k > 0 ? "happy" : "shock", k > 0 ? { armL: 2.5, armR: -2.5 } : {});
      }
    }
  }
  // Hauptfigur draußen (vor der Flucht)
  if (t >= T.rew + 0.25 && t < T.run) {
    let face = "talk", o = { t };
    if (t >= T.party) { face = "happy"; o.armL = 2.6; o.armR = -2.6; }
    if (t >= T.four) { face = "shock"; o.armL = 0.25; o.armR = -0.25; }
    if (t >= T.still) face = "shock";
    astronaut(430, 742, 1, face, o);
  }
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  // Feuer + Rauch an Ruinen
  for (const [i, [x, y, s]] of FIRES.entries()) if (fireOn(x, t)) { smoke(x, y, s, t, i); flame(x, y, s, t, i); }
  if (t >= T.lift) puffs(LAST.x, LAST.y + 10, t, T.lift, 10);
  shieldDome(t);
  // Laser der Ufos nachts + Pfeile der Bogenschützen
  if (t >= T.night && t < T.party) {
    for (const [i, h] of NIGHT_HITS.entries()) { const d = t - h + 0.15; if (d < 0 || d > 0.3) continue; const u = NIGHT_UFOS[(i * 5 + 2) % NIGHT_UFOS.length];
      ctx.save(); ctx.globalAlpha = 1 - d / 0.3; ctx.strokeStyle = "#7bff5a"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(u.x, u.y + 10); ctx.lineTo(200 + i * 70, -40); ctx.stroke(); glow(200 + i * 70, -40, 80, "160,255,140", 0.8); ctx.restore(); }
    if (t >= T.held) for (let i = 0; i < 10; i++) { const d = ((t - T.held) * 1.3 + i * 0.37) % 1.2; const [ax, ay] = ARCHERS[i % ARCHERS.length];
      ctx.save(); ctx.translate(ax + d * 180, ay - 60 - d * 620); ctx.rotate(-1.3); ctx.strokeStyle = "#f4e3c4"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke(); ctx.fillStyle = "#ddd"; ctx.beginPath(); ctx.moveTo(16, -4); ctx.lineTo(24, 0); ctx.lineTo(16, 4); ctx.fill(); ctx.restore(); }
  }
  // Der Schuss + Strahlen
  if (t >= T.shotPre && t < T.shatter + 0.3) {
    const charge = ramp(t, T.shotPre, T.shot); glow(330, -310, 200 + 300 * charge, "255,40,60", 0.5 + 0.5 * charge);
    if (t >= T.shot) { const w = 70 * (1 - clamp((t - T.shatter) / 0.3)); ctx.save(); ctx.fillStyle = "rgba(255,60,90,0.85)"; ctx.fillRect(330 - w, -320, 2 * w, 270); ctx.fillStyle = "rgba(255,220,230,0.95)"; ctx.fillRect(330 - w * 0.4, -320, w * 0.8, 270); glow(330, -60, 320, "255,60,90", 0.9); ctx.restore(); }
  }
  for (const [t0, x, y] of RAYS) { const d = t - t0; if (d < 0 || d > 0.35) continue;
    ctx.save(); ctx.globalAlpha = 1 - clamp((d - 0.2) / 0.15); ctx.strokeStyle = "#ff3b5c"; ctx.lineWidth = 26; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(330 + (x - 330) * 0.3, -330); ctx.lineTo(x, y); ctx.stroke();
    ctx.strokeStyle = "#ffe0e6"; ctx.lineWidth = 9; ctx.stroke(); glow(x, y, 120, "255,60,90", 0.8); ctx.restore(); }
  shards(t);
  for (const [t0, x, y, s] of EXPL) explosion(t, t0, x, y, s);
}

// ------------------------------------------------------------ Weltraum: der Mars zerbricht
const CRACKS = (() => { const r = rng(17), a = []; for (let i = 0; i < 26; i++) { const rad = Math.sqrt(r()) * 0.85, a0 = r() * Math.PI * 2; let x = Math.cos(a0) * rad, y = Math.sin(a0) * rad, an = r() * Math.PI * 2; const p = [[x, y]];
  for (let j = 0; j < 7; j++) { an += (r() - 0.5) * 1.6; x += Math.cos(an) * 0.11; y += Math.sin(an) * 0.11; p.push([x, y]); } a.push(p); } return a; })();
const PIECES = 7;
function marsPlanet(x, y, R, t, crackK, split) {
  glow(x, y, R * 1.5, "255,120,40", 0.25 + 0.5 * crackK);
  for (let p = 0; p < PIECES; p++) {
    const a0 = p / PIECES * Math.PI * 2 + 0.3, a1 = (p + 1) / PIECES * Math.PI * 2 + 0.3, am = (a0 + a1) / 2;
    const ox = Math.cos(am) * split * R * (0.35 + 0.1 * (p % 3)), oy = Math.sin(am) * split * R * (0.35 + 0.1 * (p % 3));
    ctx.save(); ctx.translate(x + ox, y + oy); ctx.rotate(split * (p % 2 ? 0.25 : -0.2));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.clip();
    circle(0, 0, R + 4, "#1b1424"); circle(0, 0, R, "#c9653a");
    for (const [dx, dy, cr] of [[-0.3, -0.25, 0.22], [0.3, 0.2, 0.18], [-0.1, 0.45, 0.15], [0.45, -0.35, 0.12], [-0.5, 0.2, 0.1]]) circle(dx * R, dy * R, cr * R, "#a84e2b");
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.arc(R * 0.3, R * 0.25, R, 0, Math.PI * 2); ctx.fill();
    if (split > 0) { ctx.strokeStyle = "#ffb43a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); ctx.stroke(); }
    ctx.restore();
  }
  if (crackK > 0) { // glühende Risse
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip(); ctx.translate(x, y); ctx.scale(R, R);
    for (const [lw, c] of [[0.06, "rgba(255,120,30,0.5)"], [0.025, "#ffb43a"], [0.01, "#fff2b0"]]) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineJoin = "round";
      for (const p of CRACKS) { const n = Math.max(2, Math.ceil(p.length * crackK)); ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let j = 1; j < n; j++) ctx.lineTo(p[j][0], p[j][1]); ctx.stroke(); }
    }
    ctx.restore();
  }
  if (split > 0) { glow(x, y, R * 0.8 * split + 40, "255,200,90", 0.9); }
}
const ROCKS2 = (() => { const r = rng(23), a = []; for (let i = 0; i < 26; i++) a.push({ a: r() * Math.PI * 2, d: 0.9 + r() * 0.8, s: 10 + r() * 30, v: 0.2 + r() * 0.6 }); return a; })();
function spaceBg(t, drift = 0) {
  ctx.fillStyle = "#06050a"; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(((x + 900 + drift) % 1300 + 1300) % 1300 - 300, (y + 700) * 0.95, r, "#fff"); }
  ctx.globalAlpha = 1;
}
function drawSpace(t) {
  spaceBg(t, t * 8);
  // Erde klein oben rechts
  circle(470, 250, 22, "#1b1424"); circle(470, 250, 20, "#2e86de"); ctx.fillStyle = "#4cc36a"; ctx.beginPath(); ctx.ellipse(464, 246, 8, 5, 0.4, 0, Math.PI * 2); ctx.fill();
  const z = lerp(0.82, 1.0, easeIO(ramp(t, T.planet, T.row)));
  const R = 210 * z, cx = 288, cy = 560;
  const crackK = ramp(t, T.planet, T.crack + 0.3), split = t >= T.crack ? easeOut(ramp(t, T.crack, T.row + 2)) * 0.45 : 0;
  marsPlanet(cx, cy, R, t, crackK, split);
  for (const r of ROCKS2) { if (split <= 0) break; const d = R * (r.d + split * r.v * 1.4); ctx.save(); ctx.translate(cx + Math.cos(r.a) * d, cy + Math.sin(r.a) * d); ctx.rotate(t * r.v); ctx.fillStyle = "#1b1424"; ctx.fillRect(-r.s / 2 - 2, -r.s / 2 - 2, r.s + 4, r.s + 4); ctx.fillStyle = "#6e6a80"; ctx.fillRect(-r.s / 2, -r.s / 2, r.s, r.s); ctx.restore(); }
  // kleine Rakete fliegt davon
  const k = ramp(t, T.planet - 0.2, T.days + 0.5);
  ctx.save(); ctx.translate(lerp(250, 300, k), lerp(380, -40, k)); ctx.rotate(0.12); rocket(0, 0, 0.22, 1.2); ctx.restore();
}

// ------------------------------------------------------------ Raketen-Innenraum: Reihe der Überlebenden
const ROW = [
  { x: 40, f: FANS[0] }, { x: 185, f: FANS[1] }, { x: 330, f: null, main: true }, { x: 475, f: FANS[2] },
  { x: 620, f: FANS[3] }, { x: 765, f: FANS[4] }, { x: 910, f: FANS[5] }, { x: 1055, f: null, acc: "#ffd23a" },
];
function drawRow(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#3a3550"); g.addColorStop(1, "#5c566e"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pan = lerp(0, 520, easeIO(ramp(t, T.row, T.chase)));
  ctx.save(); ctx.translate(-pan, 0);
  for (let i = 0; i < 8; i++) { const px = -100 + i * 230; circle(px, 260, 62, "#2b2740"); circle(px, 260, 52, "#0b0a14"); for (let j = 0; j < 6; j++) circle(px - 30 + (j * 23) % 60, 230 + (j * 17) % 60, 1.5, "#fff"); }
  ctx.fillStyle = "#4a4560"; ctx.fillRect(-400, 680, 2400, 400);
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  for (const [i, r] of ROW.entries()) {
    const y = r.main ? 740 : 700, s = r.main ? 2.8 : 2.4, face = t >= T.rest ? "happy" : r.main ? "talk" : ["smile", "think", "smile"][i % 3];
    if (r.f) fanAstro(r.f, r.x, y, s, t + i, face);
    else astronaut(r.x, y, s, face, { t: t + i, acc: r.acc, armL: t >= T.rest ? 2.6 : 0.25, armR: t >= T.rest ? -2.6 : -0.25 });
  }
  ctx = MAIN; compositeOutline(6);
  ctx.restore();
}

// ------------------------------------------------------------ Verfolgung im All + Ende
const CHASERS = (() => { const r = rng(41), a = []; for (let i = 0; i < 9; i++) a.push({ x: -40 + r() * 260, y: 520 + r() * 420, s: 0.8 + r() * 0.9, p: r() * 6 }); return a; })();
function drawChase(t) {
  spaceBg(t, t * 60);
  const fin = ramp(t, T.seek - 0.1, T.seek + 0.2);
  // zerbrochener Mars unten
  if (fin < 1) { ctx.save(); ctx.globalAlpha = 1 - fin; marsPlanet(420, 960, 200, t, 1, 0.5); ctx.restore(); }
  // Verfolger
  if (fin < 1) for (const [i, c] of CHASERS.entries()) { ctx.save(); ctx.globalAlpha = 1 - fin; glow(c.x, c.y, 60 * c.s, "95,255,200", 0.5); ufo(c.x + Math.sin(t * 2 + c.p) * 14, c.y, c.s, t, i); ctx.restore(); }
  // unsere Rakete
  const rx = lerp(lerp(190, 230, ramp(t, T.chase, T.seek)), 288, fin), ry = lerp(470, 600, fin), rot = lerp(0.55, 0, fin), rs = lerp(0.95, 0.6, fin);
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(rot);
  if (fin > 0) { ctx.fillStyle = "#ff8a1e"; ctx.beginPath(); ctx.moveTo(-14 * rs, 0); ctx.lineTo(0, 260 * fin + Math.sin(t * 30) * 10); ctx.lineTo(14 * rs, 0); ctx.fill(); }
  rocket(0, 0, rs, 1.3); ctx.restore();
  // Laser der Verfolger
  if (t < T.seek) for (let i = 0; i < 3; i++) { const d = (t - T.chase + i * 0.6) % 1.8; if (d > 0.25) continue; const c = CHASERS[i * 3];
    ctx.save(); ctx.globalAlpha = 1 - d / 0.25; ctx.strokeStyle = "#7bff5a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(rx + 60 + i * 40, ry - 80 - i * 50); ctx.stroke(); ctx.restore(); }
  // Loop: ein Alien-Schiff füllt das Bild
  if (t >= T.loop) { const k = ramp(t, T.loop + 0.3, DUR - 0.05); if (k > 0) { glow(288, 520, 500 * k, "95,255,160", 0.6 * k); ufo(288, 520, 0.6 + 11 * Math.pow(k, 2.2), t, 3); } }
}

const EMBERS = (() => { const r = rng(61), a = []; for (let i = 0; i < 40; i++) a.push([r() * W, r() * H, 1 + r() * 2.5, 30 + r() * 60, r() * 6]); return a; })();
function embers(t) { for (const [x0, y0, rad, sp, p] of EMBERS) { const y = ((y0 - t * sp) % H + H) % H, x = x0 + Math.sin(t * 1.5 + p) * 14; ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 5 + p); circle(x, y, rad, "#ffb43a"); } ctx.globalAlpha = 1; }
// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  const sc = scene(t);
  if (sc === "world") {
    let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
    if (t >= T.lift && t < T.core) cy -= liftY(t) * 0.85;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    drawWorld(t, z);
    ctx.restore();
    dust(t);
    // Licht-Stimmung
    const burning = t < T.rew + 0.25 || t >= T.werftX;
    if (t >= T.rew + 0.25 && !burning) { ctx.fillStyle = "rgba(20,25,70,0.34)"; ctx.fillRect(0, 0, W, H); }
    if (t >= T.msIn && t < T.werftX) { const p = 0.5 + 0.5 * Math.sin(t * 5); const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); rg.addColorStop(0, "rgba(255,0,0,0)"); rg.addColorStop(1, `rgba(220,20,40,${0.35 + 0.25 * p})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
    if (burning) { ctx.fillStyle = "rgba(120,20,10,0.22)"; ctx.fillRect(0, 0, W, H); embers(t); }
  } else if (sc === "space") drawSpace(t);
  else if (sc === "row") drawRow(t);
  else drawChase(t);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.5)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (t < T.rew + 0.6) rewindFx(t, t >= T.rew ? ramp(t, T.rew, T.rew + 0.1) * (1 - ramp(t, T.night - 0.05, T.night + 0.15)) : 0);
  if (t >= T.run && t < T.last) speedLines(t, 1);

  // ---- Einblendungen
  if (t < T.rew + 0.1) { // Hook: TAG 5 / ROTANIEN ZERSTÖRT
    const a = t < 0.05 ? 1 : 1 - ramp(t, T.rew - 0.05, T.rew + 0.1);
    ctx.save(); ctx.translate(288, 190); ctx.scale(a * (1 + 0.04 * Math.sin(t * 10)), a);
    ctx.fillStyle = "#fff"; rr(-50, -112, 100, 34, 10); ctx.fill(); ctx.fillStyle = "#14223a"; ctx.font = "24px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("TAG 5", 0, -93);
    outlined("ROTANIEN", 0, -36, 70, CYAN, "#0e1a30", 13); outlined("💥 ZERSTÖRT", 0, 34, 66, RED, "#0e1a30", 13);
    ctx.restore();
  }
  pill("HEUTE NACHT", 150, 112, pop(t, T.rew + 0.2, T.held - 0.1), "#14223a", "#fff", "⏪ ");
  if (t >= T.poll && t < T.held) { pollShield(t, pop(t, T.poll, T.held - 0.12)); stamp("87 % 💪 DER HÄLT", 360, 345, pop(t, T.polls, T.held - 0.12), -0.1, "#2fb8e0"); }
  label("✅ ER HÄLT", 288, 175, pop(t, T.held + 0.1, T.whole - 0.1), "#2fa84f");
  pill("DIE GANZE NACHT", 288, 175, pop(t, T.whole, T.party - 0.1), "#fff", "#14223a", "🌙 ");
  if (t >= T.held + 0.2 && t < T.party) { const [sx, sy] = toScreen(380, 560, t); pill("JAKOBS PLAN", sx, sy, pop(t, T.held + 0.3, T.party - 0.15), "#fff", "#14223a", "🏹 "); }
  if (t >= T.party && t < T.four) { confetti(t, T.party); confetti(t, T.party + 0.9); const [sx, sy] = toScreen(330, 620, t); pill("jeno", sx, sy, pop(t, T.party + 0.3, T.four - 0.1), "#fff", "#14223a"); }
  label("GEWONNEN?", 288, 175, pop(t, T.won, T.four - 0.05), "#ffd23a");
  label("🕓 04:00 UHR", 288, 140, pop(t, T.clock, T.msLab - 0.05));
  if (t >= T.msLab && t < T.still) label("⚠ MUTTERSCHIFF", 288, 140, pop(t, T.msLab, T.still - 0.1) * (1 + 0.05 * Math.max(0, Math.sin(t * 12))));
  if (t >= T.shot && t < T.werft) shieldBar5(t, pop(t, T.shot, T.werft - 0.1));
  for (const [t0, t1, txt] of [[T.werftX, T.funk, "RAKETENWERFT"], [T.funkX, T.wach, "FUNKTURM"], [T.wachX, T.doner, "WACHTÜRME"], [T.donerX, T.houses, "DÖNERLADEN"], [T.housesX, T.run, "HÄUSER"]]) {
    const a = pop(t, t0 - 0.05, t1 - 0.08, 0.18); if (a <= 0) continue;
    ctx.save(); ctx.translate(288, 160); ctx.rotate(-0.05); ctx.scale(a, a);
    ctx.fillStyle = RED; ctx.font = "30px Comic"; const w = ctx.measureText(txt).width + 40; rr(-w / 2, -22, w, 52, 10); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px"; ctx.fillText("ZERSTÖRT", 0, -10); ctx.letterSpacing = "0px";
    ctx.font = "30px Comic"; ctx.fillText(txt, 0, 12); ctx.restore();
  }
  if (t >= T.wach + 0.35 && t < T.wachX) { const k = ramp(t, T.wach + 0.35, T.wachX); const [sx, sy] = toScreen(lerp(760, 330, k), lerp(680, -280, k), t); burek(sx, sy, 1.4, t * 12); const [lx, ly] = toScreen(700, 640, t); pill("Jimmbo", lx, ly, pop(t, T.wach + 0.1, T.wachX), "#fff", "#14223a"); }
  if (t >= T.donerX && t < T.donerX + 1.2) { const d = t - T.donerX; donerSpit(lerp(200, 640, d / 1.2), 520 - 380 * d + 260 * d * d, 1.3, d * 9); }
  if (t >= T.housesX && t < T.housesX + 1.3) { const d = t - T.housesX; lawTablet(lerp(-80, 660, d / 1.3), 480 - 300 * d + 200 * d * d, 0.9, -0.4 + d * 4); }
  if (t >= T.run && t < T.last) { const a = pop(t, T.run + 0.05, T.last - 0.1); ctx.save(); ctx.translate(288, 175); ctx.scale(a, a); outlined("ÜBER " + Math.floor(FOLLOWERS / 100) * 100, 0, 0, 64, CYAN, "#0e1a30", 12); outlined("ASTRONAUTEN 🏃", 0, 50, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
  topLabel("🚀 LETZTE RAKETE", null, pop(t, T.last + 0.05, T.hatch - 0.1), CYAN, 165, 46);
  label("⚠ NICHT GENUG PLATZ", 288, 230, pop(t, T.noRoom, T.hatch - 0.1));
  if (t >= T.hatch && t < T.start) {
    const n = t < T.cd2 ? 3 : t < T.cd1 ? 2 : 1;
    label("🚪 LUKE ZU IN " + n, 288, 150, pop(t, T.hatch, T.start - 0.05) * (1 + 0.08 * Math.exp(-((t - (n === 3 ? T.hatch : n === 2 ? T.cd2 : T.cd1)) * 10))));
    sticker("💬 KOMMENTIER = DU FLIEGST MIT", 288, 700, pop(t, T.hatch + 0.4, T.start - 0.05));
    const step = (T.start - 0.15 - (T.hatch + 0.2)) / FANS.length, i = Math.floor((t - T.hatch - 0.2) / step);
    if (i >= 0 && i < FANS.length) { const [sx, sy] = toScreen(LAST.x + 60, LAST.y - 70, t); pill(FANS[i].name, sx, sy, pop(t, T.hatch + 0.2 + i * step, T.hatch + 0.2 + (i + 1) * step - 0.05, 0.12), "#fff", "#14223a"); }
  }
  topLabel("🚀 START!", null, pop(t, T.lift, T.core - 0.1), CYAN, 160, 60);
  if (t >= T.coreX - 0.05 && t < T.planet) { const a = pop(t, T.coreX - 0.05, T.planet - 0.05, 0.2); ctx.save(); ctx.translate(288, 165); ctx.rotate(-0.05); ctx.scale(a, a); ctx.fillStyle = RED; rr(-160, -26, 320, 56, 10); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px"; ctx.fillText("ZERSTÖRT", 0, -12); ctx.letterSpacing = "0px"; ctx.font = "30px Comic"; ctx.fillText("SCHILDZENTRALE", 0, 12); ctx.restore(); }
  topLabel("4 TAGE.", null, pop(t, T.days, T.row - 0.1), "#fff", 150, 60);
  topLabel("1 MINUTE.", null, pop(t, T.minute, T.row - 0.1), RED, 215, 60);
  if (t >= T.rest && t < T.chase) { const a = pop(t, T.rest, T.chase - 0.1); ctx.save(); ctx.translate(288, 165); ctx.scale(a, a); outlined("ALLES, WAS VON", 0, -34, 30, "#fff", "#0e1a30", 8); outlined("ROTANIEN", 0, 6, 52, CYAN, "#0e1a30", 11); outlined("ÜBRIG IST ✊", 0, 48, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
  if (t >= T.fuel && t < T.seek) { const blink = Math.sin(t * 12) > -0.2 ? 1 : 0.35; ctx.save(); ctx.globalAlpha = blink; const a = pop(t, T.fuel, T.seek - 0.1); ctx.translate(288, 150); ctx.scale(a, a);
    ctx.font = "36px Comic, 'Noto Color Emoji'"; const p1 = "⛽ TREIBSTOFF: ", w1 = ctx.measureText(p1).width, w2 = ctx.measureText("9 %").width; outlined(p1, -(w1 + w2) / 2, 0, 36, "#fff", "#0e1a30", 9, 900, "left"); outlined("9 %", -(w1 + w2) / 2 + w1, 0, 36, RED, "#0e1a30", 9, 900, "left"); ctx.restore(); }
  label("👽 VERFOLGT", 288, 215, pop(t, T.follow, T.seek - 0.1));
  if (t >= T.seek && t < T.loop + 0.3) {
    const big = t < T.where;
    topLabel(big ? "🪐 NEUER PLANET" : "WO LANDEN WIR?", big ? "GESUCHT" : null, pop(t, big ? T.seek : T.where, big ? T.where - 0.08 : T.loop + 0.2), CYAN, big ? 175 : 165, big ? 50 : 56);
    if (!big) { topComment(pop(t, T.where + 0.15, T.loop + 0.2)); const a = pop(t, T.where + 0.4, T.loop + 0.2); if (a > 0) { ctx.save(); ctx.translate(288, 392); ctx.scale(a, a); outlined("JUPITER? ERDE? DÖNER-PLANET? 👇", 0, 0, 24, "#fff", "#0e1a30", 7); ctx.restore(); } confetti(t, T.where + 0.1); }
  }
  if (t >= T.loop) { // Cliffhanger: Treibstoff springt auf 8 %
    const a = pop(t, T.loop, DUR); ctx.save(); ctx.translate(288, 150); ctx.scale(a, a); ctx.font = "36px Comic, 'Noto Color Emoji'"; const p1 = "⛽ TREIBSTOFF: ", w1 = ctx.measureText(p1).width, w2 = ctx.measureText("8 %").width;
    outlined(p1, -(w1 + w2) / 2, 0, 36, "#fff", "#0e1a30", 9, 900, "left"); outlined("8 %", -(w1 + w2) / 2 + w1, 0, 36, RED, "#0e1a30", 9, 900, "left"); ctx.restore();
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, T, expl: EXPL.map(e => e[0]), rays: RAYS.map(r => r[0]), nightHits: NIGHT_HITS, impacts: IMPACTS,
    fans: FANS.map((f, i) => T.hatch + 0.2 + i * (T.start - 0.15 - (T.hatch + 0.2)) / FANS.length),
    whooshes: CUTS.map(c => c - 0.2) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
