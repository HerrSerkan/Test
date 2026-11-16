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
const DUR = SPEECH_END + 0.6;   // + Loop am Ende

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
// Bausteine aus Tag 6 (Monster, Döner, Antrieb, Labels) – automatisch aus mars6/tag6.js übernommen
const SX = 245;   // Textmitte links der rechten 15 %
function plutoPlanet(x, y, R, t) {
  glow(x, y, R * 1.35, "200,220,255", 0.25);
  circle(x, y, R + 4, "#1b1424"); circle(x, y, R, "#d8c7b0");
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  for (const [dx, dy, rx, ry, c] of [[-0.55, 0.15, 0.45, 0.6, "#8a6d5a"], [-0.2, -0.6, 0.5, 0.25, "#a3876e"], [0.5, 0.65, 0.4, 0.2, "#b29a82"], [-0.75, -0.3, 0.3, 0.3, "#6e5444"]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + dx * R, y + dy * R, rx * R, ry * R, 0.3, 0, Math.PI * 2); ctx.fill(); }
  // das helle Herz
  ctx.fillStyle = "#f8f2e8"; ctx.save(); ctx.translate(x + 0.22 * R, y + 0.05 * R); ctx.scale(R / 100, R / 100);
  ctx.beginPath(); ctx.moveTo(0, 38); ctx.bezierCurveTo(-55, 5, -45, -38, -14, -36); ctx.bezierCurveTo(-4, -35, 0, -26, 0, -20); ctx.bezierCurveTo(0, -26, 8, -38, 22, -36); ctx.bezierCurveTo(50, -32, 50, 8, 0, 38); ctx.fill(); ctx.restore();
  for (let i = 0; i < 9; i++) circle(x + Math.cos(i * 2.1) * R * 0.6, y + Math.sin(i * 1.7) * R * 0.55, R * 0.05, "rgba(90,70,60,0.35)");
  ctx.fillStyle = "rgba(0,0,30,0.3)"; ctx.beginPath(); ctx.arc(x + R * 0.3, y + R * 0.25, R, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
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
function iphone(x, y, s, t, noSignal) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-15, -28, 30, 56, 6); ctx.fill(); ctx.fillStyle = "#cfd6e4"; rr(-13, -26, 26, 52, 5); ctx.fill();
  ctx.fillStyle = noSignal ? "#ff4040" : "#3fd3f2"; rr(-11, -22, 22, 44, 4); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 5.5px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("KEIN", 0, -2); ctx.fillText("EMPFANG", 0, 5);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-6 + i * 4, -10); ctx.lineTo(-6 + i * 4, -12 - i * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -8); ctx.stroke();
  ctx.restore();
}
function chefHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-17, -6, 34, 12, 3); ctx.fill(); circle(-10, -14, 11, "#1b1424"); circle(10, -14, 11, "#1b1424"); circle(0, -20, 12, "#1b1424"); ctx.fillStyle = "#fff"; rr(-15, -4, 30, 9, 3); ctx.fill(); circle(-10, -14, 9, "#fff"); circle(10, -14, 9, "#fff"); circle(0, -20, 10, "#fff"); ctx.restore(); }
function doner(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(3, -22); ctx.lineTo(-3, -22); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-8, -10, 16, 12); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-9, -2, 18, 3); ctx.restore(); }
function glassesRolex(x, hy, y, s) { ctx.save(); ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5 * s; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * 7 * s, hy + 2 * s, 5.5 * s, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - 1.5 * s, hy + 2 * s); ctx.lineTo(x + 1.5 * s, hy + 2 * s); ctx.stroke(); ctx.fillStyle = "#e0b43a"; circle(x - 27 * s, y - 45 * s, 5 * s, "#e0b43a"); circle(x - 27 * s, y - 45 * s, 3 * s, "#2a6a4a"); ctx.restore(); }
function lightDrive(x, y, s, t, hot) { // OGnanis Lichtantrieb auf Rädern
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const c = hot ? (Math.sin(t * 20) > 0 ? "255,60,60" : "120,20,20") : "120,230,255";
  for (const wx of [-60, 60]) { circle(wx, -18, 20, "#1b1424"); circle(wx, -18, 9, "#9aa3ab"); }
  ctx.fillStyle = "#5a6478"; rr(-90, -60, 180, 40, 8); ctx.fill(); ctx.fillStyle = "#3a4256"; rr(-90, -30, 180, 10, 4); ctx.fill();
  glow(0, -120, 120, c, hot ? 0.8 : 0.6 + 0.2 * Math.sin(t * 6));
  ctx.fillStyle = `rgb(${c})`; circle(0, -120, 42, `rgb(${c})`); circle(0, -120, 22, "#fff");
  ctx.strokeStyle = "#c9ced4"; ctx.lineWidth = 6; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 60, -60); ctx.quadraticCurveTo(d * 75, -125, d * 30, -175); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -120, 58, 16, t * (hot ? 4 : 1.5), 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#ffd23a"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("OG-DRIVE", 0, -40);
  ctx.restore();
}
function hearts(x, y, t) { ctx.save(); ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; for (let i = 0; i < 3; i++) { const k = ((t * 0.7 + i / 3) % 1); ctx.globalAlpha = 1 - k; ctx.fillText("❤️", x + Math.sin(t * 3 + i * 2) * 14, y - k * 70); } ctx.restore(); }
function arcs(x, y, r, t, col = "160,240,255") { ctx.save(); const rr_ = rng(Math.floor(t * 24)); ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) { let a = rr_() * Math.PI * 2, px = x + Math.cos(a) * r * 0.4, py = y + Math.sin(a) * r * 0.4; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { a += (rr_() - 0.5) * 1.4; px += Math.cos(a) * r * 0.3; py += Math.sin(a) * r * 0.3; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
function sparks(x, y, t, t0, n = 14, col = "#ffd23a") { const d = t - t0; if (d < 0 || d > 0.8) return; const r = rng(Math.round(t0 * 100)); for (let i = 0; i < n; i++) { const a = -Math.PI * r(), v = 80 + r() * 160; circle(x + Math.cos(a) * v * d, y + Math.sin(a) * v * d + 160 * d * d, 2.5 * (1 - d), col); } }
function exclaim(x, y, s) { if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); outlined("!", 0, 0, 52, RED, "#0e1a30", 9); ctx.restore(); }
function topLabel(txt, s, col = "#fff", y = 150, size = 40, bg = null) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  if (bg) { ctx.font = `${size}px Comic, 'Noto Color Emoji'`; const w = ctx.measureText(txt).width + 34; ctx.fillStyle = bg; rr(-w / 2, -size * 0.62, w, size * 1.24, 12); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); }
  if (bg) { ctx.fillStyle = col; ctx.font = `${size}px Comic, 'Noto Color Emoji'`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 3); } else outlined(txt, 0, 2, size, col, "#0e1a30", 10); ctx.restore();
}
// Bausteine aus Tag 6 + 7 (Fahne, Fan-Zubehör, Innenraum-Hilfen) – automatisch übernommen
function flag2(x, y, k, t) { // „ROTANIEN 2.0“, k = gehisst 0..1
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -300, 6, 300); circle(0, -304, 9, "#ffd23a");
  const fy = lerp(-90, -290, easeOut(k)), wv = Math.sin(t * 5) * 6;
  ctx.fillStyle = "#4a2b9a"; ctx.beginPath(); ctx.moveTo(3, fy); ctx.bezierCurveTo(60, fy + wv, 110, fy - wv, 160, fy); ctx.lineTo(160, fy + 90); ctx.bezierCurveTo(110, fy + 90 - wv, 60, fy + 90 + wv, 3, fy + 90); ctx.fill();
  circle(40, fy + 45, 22, "#e2552e"); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(40, fy + 45, 34, 9, -0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "17px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ROTANIEN", 112, fy + 34); ctx.fillStyle = "#ffd23a"; ctx.font = "26px Comic"; ctx.fillText("2.0", 112, fy + 60);
  ctx.restore();
}
function pizzaHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.rotate(-0.15); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-26, 8); ctx.lineTo(26, 8); ctx.lineTo(0, -36); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#f2b84b"; ctx.beginPath(); ctx.moveTo(-23, 6); ctx.lineTo(23, 6); ctx.lineTo(0, -32); ctx.fill(); ctx.fillStyle = "#c98a2a"; ctx.fillRect(-24, 2, 48, 6); for (const [px, py] of [[-8, -4], [7, -2], [0, -16]]) circle(px, py, 4, "#d93a2a"); ctx.restore(); }
function orangeCat(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 11, "#1b1424"); ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 9, "#ff9a2a"); ctx.beginPath(); ctx.moveTo(8, -16); ctx.lineTo(10, -24); ctx.lineTo(14, -17); ctx.moveTo(15, -17); ctx.lineTo(19, -24); ctx.lineTo(21, -15); ctx.fill(); ctx.strokeStyle = "#c96a1a"; ctx.lineWidth = 2; for (const d of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(d, -9); ctx.lineTo(d + 2, -3); ctx.stroke(); } circle(11, -11, 1.6, "#111"); circle(17, -11, 1.6, "#111"); ctx.restore(); }
function sash(x, y, s) { ctx.save(); ctx.translate(x, y - 58 * s); ctx.rotate(-0.55); ctx.scale(s, s); ctx.fillStyle = "#e5262b"; ctx.fillRect(-30, -6, 60, 12); ctx.fillStyle = "#ffd23a"; ctx.font = "6.5px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("PRÄSIDENT", 0, 1); ctx.restore(); }
function motorbike(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const wx of [-34, 34]) { circle(wx, -14, 16, "#1b1424"); circle(wx, -14, 7, "#9aa3ab"); } ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(-10, -36); ctx.lineTo(20, -36); ctx.lineTo(36, -18); ctx.lineTo(0, -16); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-8, -33); ctx.lineTo(18, -33); ctx.lineTo(30, -20); ctx.fill(); ctx.strokeStyle = "#555"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(22, -34); ctx.lineTo(30, -50); ctx.lineTo(40, -50); ctx.stroke(); ctx.restore(); }
function smallSign(x, y, txt, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#6b6f78"; ctx.fillRect(-2, -60, 4, 60); ctx.fillStyle = "#3a2a1a"; rr(-62, -84, 124, 28, 5); ctx.fill(); ctx.fillStyle = "#f6ecd4"; rr(-59, -81, 118, 22, 4); ctx.fill(); ctx.fillStyle = "#2a2a2a"; ctx.font = "900 10px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, -69); ctx.restore(); }
function captions(t) {
  const C = window.CHUNKS; let c = null;
  for (let i = 0; i < C.length; i++) if (t >= C[i].s - 0.02) c = C[i];
  if (!c || t >= T.loop || (t > c.e + 0.6 && c === C.at(-1))) return;
  ctx.save(); ctx.font = "40px Comic, 'Noto Color Emoji'"; ctx.letterSpacing = "0.5px";
  const sp = ctx.measureText(" ").width, MAXW = 400;
  const parts = c.w.map(([w, s, col]) => ({ w, s, col, ww: ctx.measureText(w).width }));
  const lines = [[]]; let lw = 0;
  for (const p of parts) { if (lines.at(-1).length && lw + sp + p.ww > MAXW) { lines.push([]); lw = 0; } lw += (lines.at(-1).length ? sp : 0) + p.ww; lines.at(-1).push(p); }
  const y0 = lines.length > 1 ? 742 : 772;
  lines.forEach((ln, li) => {
    const tw = ln.reduce((a, p) => a + p.ww + sp, -sp), fit = Math.min(1, MAXW / tw);
    let x = SX - tw * fit / 2; const y = y0 + li * 46;
    for (const p of ln) {
      const k = c === C[0] ? 1 : ramp(t, p.s - 0.02, p.s + 0.1);
      if (k > 0) { ctx.save(); ctx.translate(x + p.ww * fit / 2, y); const sc = (0.6 + 0.4 * back(k)) * fit; ctx.scale(sc, sc);
        outlined(p.w, 0, 0, 40, p.col === 1 ? CYAN : p.col === 2 ? RED : p.col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 10); ctx.restore(); }
      x += (p.ww + sp) * fit;
    }
  });
  ctx.restore();
}
function OL(fn, px = 6) { const m = ctx.getTransform(); ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(m); fn(); ctx = MAIN; compositeOutline(px); }
function asteroid(x, y, r, rot, seed) {
  const g = rng(seed); ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rad = r * (0.78 + 0.3 * g()); pts.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  pts.forEach(([px, py], i) => i ? ctx.lineTo(px * 1.06, py * 1.06) : ctx.moveTo(px * 1.06, py * 1.06)); ctx.fill();
  ctx.fillStyle = "#8a8394"; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.fill();
  for (let i = 0; i < 3; i++) circle((g() - 0.5) * r, (g() - 0.5) * r, r * (0.12 + 0.12 * g()), "#6d6678");
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.35, r * 0.15, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function winterJacket(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#ff7a2a"; rr(-28, -80, 56, 46, 14); ctx.fill(); ctx.strokeStyle = "#d8561a"; ctx.lineWidth = 2; for (const yy of [-66, -54, -42]) { ctx.beginPath(); ctx.moveTo(-26, yy); ctx.lineTo(26, yy); ctx.stroke(); } ctx.fillStyle = "#f4efe6"; rr(-24, -84, 48, 10, 5); ctx.fill(); circle(-30, -44, 5, "#e0b43a"); circle(-30, -44, 3, "#2a6a4a"); ctx.restore(); }
function barca(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.save(); ctx.beginPath(); ctx.roundRect(-22, -76, 44, 40, 12); ctx.clip(); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#a50044" : "#004d98"; ctx.fillRect(-22 + i * 8, -76, 8, 40); } ctx.restore(); ctx.fillStyle = "#ffd23a"; ctx.font = "9px Comic"; ctx.textAlign = "center"; ctx.fillText("10", 0, -50); ctx.fillStyle = "#111"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 8, -103, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); } ctx.fillRect(-2, -105, 4, 2); ctx.restore(); }
function policeCap(x, y, s) { const hy = y - 104 * s; ctx.save(); ctx.translate(x, hy - 26 * s); ctx.scale(s, s); ctx.fillStyle = "#1c2f6b"; ctx.beginPath(); ctx.ellipse(0, -2, 30, 12, 0, Math.PI, 0); ctx.fill(); rr(-26, -6, 52, 10, 3); ctx.fill(); ctx.fillStyle = "#111a3a"; ctx.beginPath(); ctx.ellipse(8, 6, 24, 6, 0, 0, Math.PI); ctx.fill(); circle(0, -8, 5, "#ffd23a"); ctx.restore(); }
function worm(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 6; i++) { const yy = -8 - Math.abs(Math.sin(t * 6 + i * 0.7)) * 6; circle(-i * 11, yy, 9, "#1b1424"); circle(-i * 11, yy, 7.5, i % 2 ? "#ff8fa8" : "#ff9db4"); } circle(2, -12, 1.6, "#111"); ctx.strokeStyle = "rgba(200,235,255,0.95)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -12, 13, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
function hamster(x, y, s, t) { ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 7)) * 3); ctx.scale(s, s); circle(0, -10, 12, "#1b1424"); circle(0, -10, 10.5, "#f2a65a"); circle(0, -6, 6, "#fff3e0"); circle(-6, -19, 4, "#f2a65a"); circle(6, -19, 4, "#f2a65a"); circle(-4, -12, 1.5, "#111"); circle(4, -12, 1.5, "#111"); ctx.restore(); }
function phone1(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-15, -28, 30, 56, 6); ctx.fill(); ctx.fillStyle = "#2fa84f"; rr(-12, -24, 24, 48, 4); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(-6, -8, 4, 6); ctx.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 1; i < 4; i++) ctx.fillRect(-6 + i * 5, -8 - i * 3, 4, 6 + i * 3); ctx.fillStyle = "#fff"; ctx.font = "900 5.5px InterX"; ctx.textAlign = "center"; ctx.fillText("EMPFANG:", 0, 6); ctx.fillText("1 BALKEN", 0, 13); ctx.restore(); }
function chefBand(x, y, s) { const hy = y - 104 * s; chefHat(x, hy, s); ctx.save(); ctx.fillStyle = "#e5262b"; ctx.fillRect(x - 17 * s, hy - 37 * s, 34 * s, 8 * s); ctx.fillStyle = "#fff"; ctx.font = `${5.2 * s}px Comic`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DÖNER-CHEF", x, hy - 32.5 * s); ctx.restore(); }
function plakat(x, y, s, txt) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s); ctx.fillStyle = "#6b4a2a"; ctx.fillRect(-3, 0, 6, 70); ctx.fillStyle = "#1b1424"; rr(-74, -50, 148, 60, 8); ctx.fill(); ctx.fillStyle = "#fffdf4"; rr(-70, -46, 140, 52, 6); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.font = "18px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt[0], 0, -30); ctx.fillStyle = "#1b1424"; ctx.fillText(txt[1], 0, -8); ctx.restore(); }
function sweat(x, y, t, ph = 0) { const k = ((t * 1.4 + ph) % 1); ctx.globalAlpha = 1 - k; ctx.fillStyle = "#7fd0ff"; ctx.beginPath(); ctx.moveTo(x, y + k * 20 - 7); ctx.quadraticCurveTo(x + 5, y + k * 20, x, y + k * 20 + 5); ctx.quadraticCurveTo(x - 5, y + k * 20, x, y + k * 20 - 7); ctx.fill(); ctx.globalAlpha = 1; }
function leanAstro(x, y, s, lean, face, o) { ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.translate(-x, -y); astronaut(x, y, s, face, o); ctx.restore(); }
const walkY = (t, on) => on ? -Math.abs(Math.sin(t * 11)) * 5 : 0;
// Planet aus Tag 8 (pinker Sand, Ringplanet, Kristalle, Höhle, Apple Store) – automatisch aus mars8/tag8.js übernommen
const DUNES = (() => { const r = rng(5), a = []; for (let i = 0; i < 80; i++) { const y = HORIZON + 10 + Math.pow(r(), 1.3) * 900; a.push([r() * 2800 - 1100, y, 10 + r() * 36 * (0.4 + (y - HORIZON) / 500), r()]); } return a; })();
function sky8(t) {
  const g = ctx.createLinearGradient(0, -900, 0, HORIZON); g.addColorStop(0, "#120a2e"); g.addColorStop(1, "#5a2a6e"); ctx.fillStyle = g; ctx.fillRect(-2000, -2500, 5000, HORIZON + 2500);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(x, y, r, "#fff"); } ctx.globalAlpha = 1;
  // Ringplanet
  const px = 470, py = 330, R = 110;
  glow(px, py, R * 1.8, "90,230,220", 0.3);
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35);
  ctx.strokeStyle = "rgba(255,230,160,0.9)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.9, R * 0.45, 0, Math.PI, 2 * Math.PI); ctx.stroke();
  circle(0, 0, R + 4, "#1b1424"); circle(0, 0, R, "#3fd3c8"); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#2bb3a8"; for (const [dy, h] of [[-50, 18], [-10, 26], [35, 16], [70, 20]]) ctx.fillRect(-R, dy, 2 * R, h);
  ctx.fillStyle = "rgba(0,0,30,0.3)"; ctx.beginPath(); ctx.arc(30, 25, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = "rgba(255,230,160,0.95)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.9, R * 0.45, 0, 0, Math.PI); ctx.stroke();
  ctx.restore();
  circle(60, 250, 22, "#1b1424"); circle(60, 250, 19, "#f2c94c"); circle(54, 244, 5, "#e0b03a");          // kleiner Mond
  const h = ctx.createLinearGradient(0, HORIZON - 200, 0, HORIZON); h.addColorStop(0, "rgba(255,140,190,0)"); h.addColorStop(1, "rgba(255,150,200,0.5)"); ctx.fillStyle = h; ctx.fillRect(-2000, HORIZON - 200, 5000, 200);
}
function ground8() {
  ctx.fillStyle = "#c86a9a"; ctx.beginPath(); ctx.moveTo(-2000, HORIZON + 4);
  for (let x = -2000; x <= 3000; x += 60) ctx.lineTo(x, HORIZON - 10 - 16 * Math.abs(Math.sin(x * 0.0045)) - 9 * Math.sin(x * 0.015));
  ctx.lineTo(3000, HORIZON + 4); ctx.fill();
  const g = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 900); g.addColorStop(0, "#e88ab6"); g.addColorStop(0.35, "#f3a2c6"); g.addColorStop(1, "#f8bcd6"); ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON, 5000, 2000);
  for (const [x, y, r, k] of DUNES) {
    ctx.fillStyle = k < 0.5 ? "rgba(170,70,120,0.35)" : "rgba(255,210,230,0.45)"; ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    if (k > 0.8) { ctx.fillStyle = "#8e4fb0"; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y); ctx.lineTo(x - r * 0.2, y - r * 0.6); ctx.lineTo(x + r * 0.4, y - r * 0.5); ctx.lineTo(x + r * 0.6, y); ctx.fill(); }   // lila Kristallsteine
  }
}
function crystal(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); glow(0, -30, 60, "120,240,230", 0.3 + 0.1 * Math.sin(t * 3 + x)); for (const [dx, h, c] of [[-14, 50, "#5fe0d4"], [0, 70, "#8ff2e8"], [14, 44, "#3fc3b8"]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(dx - 8, 0); ctx.lineTo(dx, -h); ctx.lineTo(dx + 8, 0); ctx.fill(); } ctx.restore(); }
function cave(x, y, t, eyes) {
  ctx.fillStyle = "#b45a8a"; ctx.beginPath(); ctx.moveTo(x - 260, y); ctx.bezierCurveTo(x - 220, y - 300, x + 220, y - 320, x + 280, y); ctx.fill();
  ctx.fillStyle = "#9a4878"; ctx.beginPath(); ctx.moveTo(x - 200, y); ctx.bezierCurveTo(x - 160, y - 230, x + 160, y - 240, x + 210, y); ctx.fill();
  ctx.fillStyle = "#12081c"; ctx.beginPath(); ctx.moveTo(x - 90, y); ctx.bezierCurveTo(x - 90, y - 170, x + 90, y - 170, x + 90, y); ctx.fill();
  if (eyes > 0) for (const d of [-1, 1]) { ctx.globalAlpha = eyes; glow(x + d * 30, y - 95, 60, "255,80,60", 0.7); ctx.fillStyle = "#ff5a3a"; ctx.beginPath(); ctx.ellipse(x + d * 30, y - 95, 14, 8 * eyes, d * 0.2, 0, Math.PI * 2); ctx.fill(); circle(x + d * 30, y - 95, 4 * eyes, "#2a0808"); ctx.globalAlpha = 1; }
}
function footprint(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = "rgba(150,50,100,0.55)"; ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2); ctx.fill(); for (const [dx, dy] of [[-22, -16], [-6, -22], [12, -20], [26, -12]]) { ctx.beginPath(); ctx.ellipse(dx, dy, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
function appleHut(x, y, s, open, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f4f6f8"; rr(-90, -130, 180, 130, 14); ctx.fill(); ctx.fillStyle = "#dfe5ea"; ctx.fillRect(-90, -20, 180, 20);
  ctx.fillStyle = "#cfd6dc"; ctx.beginPath(); ctx.moveTo(-104, -128); ctx.lineTo(104, -128); ctx.lineTo(80, -160); ctx.lineTo(-80, -160); ctx.fill();
  // Tür mit Apfel-Logo, gleitet auf
  ctx.fillStyle = "#1b1424"; rr(-40, -100, 80, 100, 8); ctx.fill(); if (open > 0) { glow(0, -50, 80, "255,250,220", 0.7 * open); ctx.fillStyle = "#fff9e0"; rr(-36, -96, 72, 96, 6); ctx.fill(); }
  ctx.fillStyle = "#e9edf0"; rr(-40 - 76 * open, -100, 80, 100, 8); ctx.fill();
  ctx.fillStyle = "#9aa3ab"; ctx.font = "34px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🍎", -76 * open, -52);
  ctx.fillStyle = "#1b1424"; rr(-80, -158, 160, 24, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "15px Comic"; ctx.fillText("APPLE STORE", 0, -145);
  ctx.restore();
}
function card(fn, y) { ctx.save(); ctx.translate(SX, y); ctx.scale(0.88, 0.88); ctx.translate(-288, -y); fn(); ctx.restore(); }
// ============================================================ Tag 9 „Jobs für alle“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js + lib8.js + tag9.js -> scene.js)
// Aufbau Schritt für Schritt wie Tag 2 (BRIEFING_TAG9.md). 834 Follower (+5 seit Tag 8). Keine erfundenen Zahlen.
const FOLLOWERS = 834, NEU = 5, LIKES = "4.390", FOLLOWING = "7";
const T = {
  heute: wt(2), card: wt(5), follow: wt(7), law: wt(16), jobs: wt(20), also: wt(23), stamp: wt(27), pres: wt(31), janic: wt(36), luk: wt(40), sec: wt(43),
  meo: wt(47), phil: wt(52), cat: wt(57), pizza: wt(63), iph: wt(64), wohn: wt(65), goyo: wt(66), done: wt(67), cliff: wt(68), paw: wt(75),
  law2: wt(79), top: wt(83), name: wt(86), loop: SPEECH_END + 0.1,
};
const AV = {};

// ------------------------------------------------------------ Zubehör für die Jobs
function crown(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-22, 6); ctx.lineTo(-24, -22); ctx.lineTo(-11, -8); ctx.lineTo(0, -28); ctx.lineTo(11, -8); ctx.lineTo(24, -22); ctx.lineTo(22, 6); ctx.fill(); ctx.fillStyle = "#ffd23a"; ctx.beginPath(); ctx.moveTo(-19, 3); ctx.lineTo(-20, -15); ctx.lineTo(-10, -3); ctx.lineTo(0, -22); ctx.lineTo(10, -3); ctx.lineTo(20, -15); ctx.lineTo(19, 3); ctx.fill(); circle(0, -4, 4, "#e5262b"); circle(-12, -1, 2.5, "#3fd3f2"); circle(12, -1, 2.5, "#3fd3f2"); ctx.restore(); }
function sash9(x, y, s, txt, col = "#e5262b") { ctx.save(); ctx.translate(x, y - 58 * s); ctx.rotate(-0.55); ctx.scale(s, s); ctx.fillStyle = col; ctx.fillRect(-32, -7, 64, 14); ctx.fillStyle = "#fff"; ctx.font = "7.5px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 1); ctx.restore(); }
function vest(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1b22"; rr(-23, -77, 46, 42, 10); ctx.fill(); ctx.fillStyle = "#ffd23a"; ctx.fillRect(-23, -52, 46, 4); ctx.fillStyle = "#fff"; ctx.font = "900 6.5px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SECURITY", 0, -62); ctx.restore(); }
function videoCam(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-20, -14, 40, 28, 5); ctx.fill(); ctx.fillStyle = "#3a4256"; rr(-17, -11, 34, 22, 4); ctx.fill(); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(18, -8); ctx.lineTo(34, -14); ctx.lineTo(34, 14); ctx.lineTo(18, 8); ctx.fill(); circle(26, 0, 6, "#59d4ff"); if (Math.sin(t * 8) > 0) circle(-10, -5, 3.5, "#ff3b3b"); ctx.restore(); }
function oven(x, y, s, t) { // Pizzaofen (Unterkante Mitte)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -4, 84, 96, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-84, -6, 168, 12);
  ctx.fillStyle = "#c9654a"; ctx.beginPath(); ctx.ellipse(0, -4, 80, 92, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#a84e38"; for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { if (Math.hypot((i - 2) * 32, j * 22 + 10) > 84) continue; rr(-74 + i * 32 + (j % 2) * 14, -30 - j * 22, 26, 3, 1); ctx.fill(); }
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, -4, 44, 44, 0, Math.PI, 0); ctx.fill(); glow(0, -18, 50, "255,150,40", 0.7 + 0.2 * Math.sin(t * 9));
  for (const [c, w, h] of [["#ff8a1e", 22, 30], ["#ffd23a", 12, 18]]) { const f = 1 + 0.2 * Math.sin(t * 14); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w, -6); ctx.quadraticCurveTo(0, -6 - h * f * 1.6, w, -6); ctx.fill(); }
  ctx.fillStyle = "#cfd6dc"; ctx.fillRect(-12, -150, 24, 60); ctx.restore();
}
function pizza(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); circle(0, 0, 22, "#1b1424"); circle(0, 0, 20, "#e8b04a"); circle(0, 0, 16, "#e5503a"); for (const [px, py] of [[-6, -4], [6, 5], [2, -9], [-7, 7]]) circle(px, py, 3.2, "#ffe14a"); ctx.restore(); }
function phoneS(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-11, -20, 22, 40, 5); ctx.fill(); ctx.fillStyle = "#59d4ff"; rr(-8, -16, 16, 32, 3); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 7px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("18", 0, 0); ctx.restore(); }
function keyS(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 6) * 0.3); ctx.scale(s, s); glow(0, 0, 40, "255,220,90", 0.5); ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, -12, 9, 0, Math.PI * 2); ctx.moveTo(0, -3); ctx.lineTo(0, 24); ctx.moveTo(0, 14); ctx.lineTo(9, 14); ctx.moveTo(0, 22); ctx.lineTo(8, 22); ctx.stroke(); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
function flat(x, y, s) { // kleine Wohnung (Unterkante Mitte)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-74, -144, 148, 148, 10); ctx.fill(); ctx.fillStyle = "#7bd0ff"; rr(-70, -140, 140, 140, 8); ctx.fill();
  ctx.fillStyle = "#3a7bd5"; ctx.beginPath(); ctx.moveTo(-84, -138); ctx.lineTo(0, -196); ctx.lineTo(84, -138); ctx.fill();
  for (const [wx, wy] of [[-40, -110], [14, -110]]) { ctx.fillStyle = "#fff6cf"; rr(wx, wy, 28, 28, 4); ctx.fill(); }
  ctx.fillStyle = "#5b3a1e"; rr(-14, -56, 28, 56, 4); ctx.fill(); circle(8, -28, 2.5, "#ffd23a");
  ctx.fillStyle = "#fff"; rr(-52, -66, 30, 14, 3); ctx.fill(); ctx.fillStyle = "#14223a"; ctx.font = "900 7px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("MEHMET", -37, -58.5); ctx.restore();
}
function nameTag(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * 0.05); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-96, -34, 192, 68, 12); ctx.fill(); ctx.fillStyle = "#fff"; rr(-90, -28, 180, 56, 9); ctx.fill(); ctx.fillStyle = "#e5262b"; rr(-90, -28, 180, 20, [9, 9, 0, 0]); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("HALLO, ICH HEISSE", 0, -17); ctx.fillStyle = "#14223a"; ctx.font = "30px Comic"; ctx.fillText("???", 0, 10); ctx.restore(); }
function bigPaw(x, y, s, t) { // riesige Pfote aus der Höhle – sieht aus wie die des Monsters
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-160, -40, 190, 86, 40); ctx.fill(); ctx.fillStyle = "#5a4bc4"; rr(-156, -36, 182, 78, 36); ctx.fill();
  ctx.strokeStyle = "rgba(60,45,150,0.6)"; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-140 + i * 26, -20 + (i % 2) * 20); ctx.lineTo(-132 + i * 26, -6 + (i % 2) * 20); ctx.stroke(); }
  for (let k = -1; k <= 1; k++) { ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(18, k * 24 - 12); ctx.lineTo(74, k * 24); ctx.lineTo(18, k * 24 + 12); ctx.fill(); ctx.fillStyle = "#f2f6ff"; ctx.beginPath(); ctx.moveTo(20, k * 24 - 9); ctx.lineTo(68, k * 24); ctx.lineTo(20, k * 24 + 9); ctx.fill(); }
  ctx.restore();
}
function lawStone(x, y, s, t) { // Gesetzestafel mit Zetteln und Stempel
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-116, -276, 232, 280, 40); ctx.fill(); ctx.fillStyle = "#b9b3ab"; rr(-110, -270, 220, 270, 36); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.font = "30px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("GESETZ NR. 1", 0, -232);
  ctx.strokeStyle = "#8a847c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-80, -206); ctx.lineTo(80, -206); ctx.stroke();
  // Zettel „Kann ich … sein?“ fliegen auf die Tafel
  const slips = ["Kann ich President sein", "kann ich polizei sein", "will Security sein", "kann ich youtuber sein", "wann kann ich Goyo sein"];
  slips.forEach((txt, i) => { const t0 = T.law + 0.1 + i * 0.28, k = easeOut(ramp(t, t0, t0 + 0.35)); if (k <= 0 || t >= T.stamp + 0.15) return; const tx = -40 + (i % 2) * 70 - 20, ty = -170 + i * 30, sx = (i % 2 ? 260 : -260), sy = -420; ctx.save(); ctx.translate(lerp(sx, tx, k), lerp(sy, ty, k)); ctx.rotate((i % 2 ? 1 : -1) * (0.12 + (1 - k) * 2)); ctx.fillStyle = "#fffdf4"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 4; rr(-76, -13, 152, 26, 4); ctx.fill(); ctx.shadowColor = "transparent"; ctx.fillStyle = "#14223a"; ctx.font = "800 11px InterX"; ctx.fillText(txt, 0, 1); ctx.restore(); });
  // Stempel
  if (t >= T.stamp) { const k = ramp(t, T.stamp, T.stamp + 0.16), sc = lerp(2.4, 1, easeOut(k)); ctx.save(); ctx.translate(0, -110); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = k; ctx.strokeStyle = "#d21f2a"; ctx.lineWidth = 6; rr(-94, -62, 188, 124, 12); ctx.stroke(); ctx.fillStyle = "#d21f2a"; ctx.font = "30px Comic"; ctx.fillText("JEDER", 0, -30); ctx.fillText("BEKOMMT", 0, 2); ctx.fillText("EINEN JOB.", 0, 34); ctx.restore(); }
  ctx.restore();
}

// ------------------------------------------------------------ Weltlayout (neuer Planet, über Nacht eine Stadt)
const ROCKET = { x: 330, y: 708, s: 1.6, rot: 0.24 };
const STONE = { x: 600, y: 760 }, PRES = { x: 820, y: 792 }, MEO = { x: 1030, y: 792 }, PHIL = { x: 1210, y: 792 };
const OVEN = { x: 1420, y: 716 }, HUT = { x: 1600, y: 716 }, FLAT = { x: 1790, y: 716 }, LEO = { x: 2090, y: 792 }, CAVE = { x: 2900, y: 640 };
const CITY = [ // [Zeitversatz, Zeichenfunktion] – taucht beim Schwenk nach und nach auf
  [0.0, () => house(700, 640, 1.2, "#3fd3f2")], [0.08, () => house(790, 632, 0.9, "#ffb43a")], [0.16, () => dome(960, 690)], [0.24, () => donerShop(1160, 712, 0.95)],
  [0.3, () => house(1290, 636, 1.0, "#7bf27a")], [0.36, () => house(1500, 640, 1.1, "#ff79c6")], [0.42, () => house(1880, 636, 1.0, "#b06bff")],
];
const TOWN = (() => { const r = rng(42), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]; for (let i = 0; i < 150; i++) { const y = 612 + Math.pow(r(), 1.4) * 70; a.push({ x: 520 + r() * 1600, y, s: 0.22 + (y - 600) / 110 * 0.3, acc: keys[i % 7], ph: r() * 6 }); } return a.sort((p, q) => p.y - q.y); })();
function monsterAt(t) { // wo das Monster gerade ist
  if (t >= T.law2 || t < T.law - 0.4) return { x: 190, y: 790, s: 0.5, sit: true };
  if (t < T.cliff) return { x: 430, y: 792, s: 0.46, sit: true };
  return { x: lerp(CAVE.x - 560, CAVE.x - 300, easeIO(ramp(t, T.cliff, T.paw - 0.2))) - (t >= T.paw ? 60 * easeOut(ramp(t, T.paw, T.paw + 0.25)) : 0), y: 742, s: 0.4, sit: false };
}
const CAM = [
  [0, 265, 650, 1.35], [T.heute - 0.1, 268, 650, 1.4], [T.heute + 0.75, 1020, 600, 0.72], [T.law - 0.12, 1040, 600, 0.75], [T.law + 0.1, 520, 640, 1.45], [T.pres - 0.12, 520, 640, 1.5],
  [T.pres + 0.1, PRES.x + 30, 690, 1.75], [T.luk - 0.12, PRES.x + 30, 690, 1.8], [T.luk + 0.1, 430, 690, 1.6], [T.meo - 0.12, 430, 690, 1.65],
  [T.meo + 0.1, MEO.x, 690, 1.85], [T.phil - 0.12, MEO.x, 690, 1.9], [T.phil + 0.1, PHIL.x, 695, 2.0], [T.pizza - 0.12, PHIL.x, 695, 2.15],
  [T.pizza + 0.06, OVEN.x - 30, 680, 1.6], [T.iph - 0.06, OVEN.x - 30, 680, 1.65], [T.iph + 0.06, HUT.x + 40, 680, 1.6], [T.wohn - 0.06, HUT.x + 40, 680, 1.65],
  [T.wohn + 0.06, FLAT.x + 30, 670, 1.5], [T.goyo - 0.06, FLAT.x + 30, 670, 1.55], [T.goyo + 0.06, LEO.x, 690, 1.9], [T.cliff - 0.12, LEO.x, 690, 1.95],
  [T.cliff + 0.12, CAVE.x - 240, 610, 1.05], [T.law2 - 0.12, CAVE.x - 200, 600, 1.3], [T.law2 + 0.1, 20, 705, 2.1], [T.name - 0.12, 20, 705, 2.2],
  [T.name + 0.1, 250, 670, 1.5], [T.loop, 262, 652, 1.37], [DUR, 265, 650, 1.35],
];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) { const a = CAM[i - 1], b = CAM[i], k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k))]; }
  return CAM.at(-1).slice(1);
}
const toScreen = (x, y, t) => { const [cx, cy, z] = cam(t); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z, z]; };

function drawWorld(t, z) {
  sky8(t); ground8();
  for (const [x, y, s] of [[-300, 690, 1.2], [560, 700, 0.8], [1340, 760, 0.8], [2300, 700, 1.1]]) crystal(x, y, s, t);
  cave(CAVE.x, CAVE.y, t, 0);
  for (let i = 0; i < 6; i++) footprint(CAVE.x - 160 - i * 95, CAVE.y + 70 + (i % 2) * 26, 1.5, 0.1 * (i % 2 ? 1 : -1));
  const city = t >= T.heute;
  if (city) for (const m of TOWN) { const sp = SPR[m.acc]; if (!sp) continue; const w = 88 * m.s, h = 158 * m.s; ctx.drawImage(sp, m.x - w / 2, m.y - h - Math.abs(Math.sin(t * 5 + m.ph)) * 3, w, h); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  // Stadt (ploppt beim Schwenk auf)
  if (city) {
    for (const [d, fn] of CITY) { const k = back(ramp(t, T.heute + 0.15 + d, T.heute + 0.45 + d)); if (k <= 0) continue; ctx.save(); ctx.translate(0, 712); ctx.scale(1, k); ctx.translate(0, -712); fn(); ctx.restore(); }
    flag2(700, 720, ramp(t, T.heute + 0.5, T.heute + 1.1), t);
    oven(OVEN.x, OVEN.y, 1, t); appleHut(HUT.x, HUT.y, 1, 1, t); flat(FLAT.x, FLAT.y, 1);
  }
  // Rakete aus Tag 8 schief im Sand
  ctx.save(); ctx.translate(ROCKET.x, ROCKET.y); ctx.rotate(ROCKET.rot); rocket(0, 0, ROCKET.s, 0); ctx.fillStyle = "#2a2230"; rr(-16, -66, 32, 54, 6); ctx.fill(); ctx.restore();
  // Gesetzestafel
  if (t >= T.law - 0.3 && t < T.cliff) lawStone(STONE.x, STONE.y, back(ramp(t, T.law - 0.3, T.law)) , t);
  // Präsident + Vize
  if (t >= T.pres) { const k = back(ramp(t, T.pres + 0.5, T.pres + 0.8)); astronaut(PRES.x, PRES.y, 1.15, "happy", { t, acc: "#ffd23a", armR: -2.4 }); if (k > 0) { sash9(PRES.x, PRES.y, 1.15 * k, "PRÄSIDENT"); crown(PRES.x, PRES.y - 104 * 1.15, 1.15 * k); } }
  if (t >= T.janic - 0.2) { const k = easeOut(ramp(t, T.janic - 0.2, T.janic + 0.2)); astronaut(lerp(PRES.x + 190, PRES.x + 100, k), PRES.y + 4, 0.85, "happy", { t: t + 2, acc: "#3fd3f2" }); if (t >= T.janic) sash9(PRES.x + 100, PRES.y + 4, 0.85, "VIZE", "#3a7bd5"); }
  // Polizei (luk) + Security (einfachso) bewachen das Monster
  if (t >= T.luk && t < T.cliff) { const k = easeOut(ramp(t, T.luk, T.luk + 0.3)); astronaut(lerp(180, 330, k), 796, 0.95, "smirk", { t, acc: "#1c2f6b", armR: -0.9 }); policeCap(lerp(180, 330, k), 796, 0.95); }
  if (t >= T.sec && t < T.cliff) { const k = easeOut(ramp(t, T.sec, T.sec + 0.3)); astronaut(lerp(700, 535, k), 796, 0.95, "smirk", { t: t + 1, acc: "#ffd23a", armL: 0.9 }); vest(lerp(700, 535, k), 796, 0.95); }
  // MEO filmt
  if (t >= T.meo) { astronaut(MEO.x, MEO.y, 1.1, "happy", { t, acc: "#ff4b6e", armL: -1.2, armR: 1.2 }); videoCam(MEO.x + 10, MEO.y - 70 + Math.sin(t * 3) * 2, 1.2, t); }
  // Phillip + orange Katze
  if (t >= T.phil) { const got = t >= T.cat + 0.35; astronaut(PHIL.x, PHIL.y, 1.15, got ? "happy" : "think", { t, acc: "#ffb43a", armL: got ? -0.9 : 0.25, armR: got ? 0.9 : -0.25 });
    if (t >= T.cat) { const k = ramp(t, T.cat, T.cat + 0.35); const cx = lerp(PHIL.x + 200, PHIL.x - 2, k), cy = lerp(PHIL.y - 20, PHIL.y - 62, k) - Math.sin(Math.PI * k) * 90; orangeCat(cx, cy, 1.25, t); } }
  // Montage: Alex, Noam, Mehmet, Leonard
  if (t >= T.pizza - 0.1) { astronaut(OVEN.x - 110, 792, 1.0, "happy", { t, acc: "#7bf27a", armR: -2.3 }); pizza(OVEN.x - 76, 792 - 132 + Math.sin(t * 6) * 4, 1.2, t * 2); }
  if (t >= T.iph - 0.1) { astronaut(HUT.x + 120, 792, 1.0, "happy", { t, acc: "#ff79c6", armL: 2.4, armR: -2.4 }); phoneS(HUT.x + 84, 792 - 128, 1.3, -0.2); phoneS(HUT.x + 156, 792 - 128, 1.3, 0.2); }
  if (t >= T.wohn - 0.1) { astronaut(FLAT.x + 110, 792, 1.0, "happy", { t, acc: "#ff8a2a", armR: -2.4 }); keyS(FLAT.x + 144, 792 - 132, 1.2, t); }
  if (t >= T.goyo - 0.1) { astronaut(LEO.x, LEO.y, 1.1, "happy", { t, acc: "#b06bff", armR: -2.4 }); plakat(LEO.x + 36, LEO.y - 165, 1.1, ["ICH BIN", "GOYO"]); }
  if (t >= T.law2 && t < T.name) { const up = easeOut(ramp(t, T.law2, T.law2 + 0.35)); astronaut(20, 792, 1.0, t >= T.top ? "smirk" : "talk", { t, armL: lerp(0.25, -0.55, up), armR: lerp(-0.25, 0.55, up) }); lawBook9(20, 792 - lerp(36, 50, up), 1.15 * (0.6 + 0.4 * up), t); }
  // Monster
  const m = monsterAt(t);
  if (t >= T.paw) { ctx.save(); ctx.translate(CAVE.x + 40 - 190 * easeOut(ramp(t, T.paw, T.paw + 0.5)), CAVE.y - 44); ctx.scale(-1, 1); bigPaw(0, 0, 1.15, t); ctx.restore(); }
  creature(m.x, m.y, m.s, t, { sit: m.sit, happy: t < T.cliff || t >= T.name, eyes: 1, look: t >= T.cliff && t < T.law2 ? 1 : 0, sniff: (t >= T.cliff && t < T.paw) || t >= T.loop, roar: t >= T.paw && t < T.law2 });
  if (t >= T.name) nameTag(m.x, m.y - 95, 0.72 * back(ramp(t, T.name + 0.1, T.name + 0.4)), t);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  // Höhle dunkel über der Pfote (sie kommt aus dem Schatten)
  if (t >= T.paw) { ctx.fillStyle = "rgba(18,8,28,0.55)"; ctx.beginPath(); ctx.moveTo(CAVE.x + 10, CAVE.y); ctx.bezierCurveTo(CAVE.x + 10, CAVE.y - 160, CAVE.x + 90, CAVE.y - 170, CAVE.x + 90, CAVE.y); ctx.fill(); }
  for (const [d] of CITY) { const t0 = T.heute + 0.15 + d; if (t >= t0 && t < t0 + 0.5) { /* kleine Staubwolke beim Aufploppen */ } }
  if (t >= T.heute + 0.2 && t < T.heute + 1.3) for (const [x] of [[700], [960], [1160], [1290]]) puffs(x, 716, t, T.heute + 0.25 + (x - 700) / 2500, 5);
  if (t >= T.stamp && t < T.stamp + 0.7) sparkleBurst(STONE.x, STONE.y - 120, t, T.stamp);
  if (t >= T.pres + 0.5 && t < T.pres + 1.3) sparkleBurst(PRES.x, PRES.y - 150, t, T.pres + 0.5);
  if (t >= T.cat + 0.35 && t < T.pizza) hearts(PHIL.x + 30, PHIL.y - 150, t);
  if (t >= T.cat + 0.35 && t < T.cat + 1.1) sparkleBurst(PHIL.x, PHIL.y - 80, t, T.cat + 0.35);
  if (t >= T.meo) { const [bx, by] = [MEO.x - 10, MEO.y - 190]; ctx.save(); ctx.fillStyle = "#e5262b"; rr(bx - 34, by - 12, 68, 24, 8); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "15px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText((Math.sin(t * 8) > 0 ? "● " : "○ ") + "LIVE", bx, by + 1); ctx.restore(); }
}

// ------------------------------------------------------------ Karten (sichere Zone)
function profileCard9(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16; ctx.fillStyle = "#121216"; rr(-212, -100, 424, 200, 16); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "900 23px InterX"; ctx.fillText("Gedacht", -190, -70);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -190, -48);
  const n = Math.round(lerp(FOLLOWERS - NEU, FOLLOWERS, easeOut(ramp(t, T.card + 0.2, T.card + 0.8))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -190 + i * 100; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -20); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10px InterX"; ctx.fillText(l, x, -3); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-96, -38, 100, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-190, 18, 170, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -105, 35);
  ctx.fillStyle = "#2c2c33"; rr(-12, 18, 130, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 35);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea"; ctx.fillText("1 Follow = 1 Bewohner 🚀", -190, 70); ctx.fillText("Dein Kommentar kommt ins Video 💬", -190, 87);
  if (AV.me) { circle(160, -58, 36, "#fff"); ctx.save(); ctx.beginPath(); ctx.arc(160, -58, 33, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, 127, -91, 66, 66); ctx.restore(); }
  ctx.restore();
  const k = back(ramp(t, T.card + 0.6, T.card + 0.85)); if (k > 0) { ctx.save(); ctx.translate(SX - 60, 292); ctx.rotate(-0.12); ctx.scale(k * s, k * s); ctx.fillStyle = RED; rr(-70, -18, 140, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+" + NEU + " NEUE", 0, 2); ctx.restore(); }
}
function boardingPass9(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 250); ctx.rotate(-0.02); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-205, -70, 410, 140, 12); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.fillStyle = CYAN; rr(110, -70, 95, 140, [0, 12, 12, 0]); ctx.fill();
  ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, -64); ctx.lineTo(110, 64); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = CYAN; ctx.font = "900 13px InterX"; ctx.letterSpacing = "1.5px"; ctx.fillText("BORDKARTE", -185, -44); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#121a2a"; ctx.font = "900 42px InterX"; ctx.fillText("RAKETE 4", -187, -4);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 12px InterX"; ctx.fillText("Name: DU?  ·  Job: ???  ·  Ziel: ROTANIEN 2.0", -185, 40);
  ctx.restore();
  astronaut(SX + 158 * s, 250 + 34 * s, 0.45 * s, "happy", { t: 0 });
}
function nameCall(t, s) { // leere Kommentarkarte „Wie soll es heißen?“
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 155); ctx.scale(s, s); outlined("🏷 NAME GESUCHT", 0, 0, 40, "#fff", "#0e1a30", 10); ctx.restore();
  ctx.save(); ctx.translate(SX, 240); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-172, -6, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -5);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -142, -22);
  ctx.fillStyle = "#e3f8fd"; rr(-74, -32, 112, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("⭐ Top-Kommentar", -68, -21.5);
  ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("Wie soll es heißen? 🤔", -142, 4);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten  ·  Idee: Jens", -142, 27);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -10 + Math.sin(t * 6) * 2);
  ctx.restore();
}
function lawBook9(x, y, s, t) { // aufgeschlagenes Gesetzbuch: Nr. 1 steht drin, Nr. 2 ist noch offen
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#5a3a1a"; rr(-46, -30, 92, 54, 4); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-43, -27, 42, 48, 3); ctx.fill(); rr(1, -27, 42, 48, 3); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(-1, -27, 2, 48);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#3a2a1a"; ctx.font = "5.5px Comic"; ctx.fillText("GESETZ NR. 1", -22, -19);
  ctx.fillStyle = "#2fa84f"; ctx.font = "4.6px Comic"; ctx.fillText("JEDER BEKOMMT", -22, -9); ctx.fillText("EINEN JOB ✓", -22, -2);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 2; i++) ctx.fillRect(-36, 8 + i * 5, 28, 1.2);
  ctx.fillStyle = "#3a2a1a"; ctx.font = "5.5px Comic"; ctx.fillText("GESETZ NR. 2", 22, -19); ctx.fillStyle = RED; ctx.font = "24px Comic"; ctx.fillText("?", 22, 2 + Math.sin(t * 5) * 1.5);
  ctx.restore();
}
function lawCall9(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 155); ctx.scale(s, s); outlined("📜 GESETZ NR. 2", 0, 0, 40, "#fff", "#0e1a30", 10); ctx.restore();
  ctx.save(); ctx.translate(SX, 240); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-172, -6, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -5);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -142, -22);
  ctx.fillStyle = "#e3f8fd"; rr(-74, -32, 112, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("⭐ Top-Kommentar", -68, -21.5);
  ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("dein Gesetz? 🤔", -142, 4);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten", -142, 27);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -10 + Math.sin(t * 6) * 2);
  ctx.restore();
  ctx.save(); ctx.translate(SX, 310); ctx.scale(s, s); outlined("+ welchen Job willst du? 👇", 0, 0, 20, "#ffd23a", "#0e1a30", 6); ctx.restore();
}
const tk = (t, a, b, name, text, ago, av, y = 240) => card(() => tkComment(pop(t, a, b), name, text, ago, 0, av, y), y);

// ------------------------------------------------------------ Effekte
const IMPACTS = [T.stamp, T.cat + 0.35, T.paw, T.done, T.law2];
function shakeAt(t) { let dx = 0, dy = 0; for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.4) continue; const a = (t0 === T.stamp || t0 === T.paw ? 9 : 5) * Math.exp(-d * 10); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; } return [dx, dy]; }
const CUTS = CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.12 || Math.abs(c[1] - CAM[i][1]) > 120).map(c => c[0] - 0.05).filter(c => c > T.heute + 1);
function flash(t) { let a = 0; for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.22 * (1 - d / 0.14)); } if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); } }

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); drawWorld(t, z); ctx.restore();
  dust(t);
  if (t >= T.cliff && t < T.law2) { ctx.fillStyle = "rgba(20,5,30,0.35)"; ctx.fillRect(0, 0, W, H); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(30,5,30,0.4)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen (sichere Zone)
  const np = (txt, wx, wy, a, b, icon = "") => { const [sx, sy] = toScreen(wx, wy, t); pill(txt, Math.max(70, Math.min(sx, 410)), Math.max(125, sy), pop(t, a, b), "#fff", "#14223a", icon); };
  if (t < T.heute + 0.3 || t >= T.loop) { const a = t >= T.loop ? back(ramp(t, T.loop, T.loop + 0.15)) : 1 - ramp(t, T.heute + 0.1, T.heute + 0.3); ctx.save(); ctx.translate(SX, 175); ctx.scale(a, a); outlined("TAG 9", 0, 0, 86, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t >= T.heute + 0.3 && t < T.card) topLabel("🌙 ÜBER NACHT", pop(t, T.heute + 0.35, T.card - 0.05), "#fff", 160, 36, "#4a2b9a");
  if (t >= T.card && t < T.follow) { profileCard9(t, pop(t, T.card, T.follow - 0.06)); confetti(t, T.card + 0.5); }
  if (t >= T.follow && t < T.law) { boardingPass9(pop(t, T.follow + 0.1, T.law - 0.08)); topLabel("👥 NEUE BEWOHNER GESUCHT", pop(t, T.follow, T.law - 0.08), "#14223a", 140, 26, "#ffd23a"); }
  if (t >= T.law && t < T.pres) { topLabel("📜 KEIN GESETZ?", pop(t, T.law + 0.05, T.jobs - 0.05), "#fff", 150, 36, "#14223a"); topLabel("👷 IHR WOLLTET JOBS", pop(t, T.jobs, T.also - 0.05), "#14223a", 150, 34, "#ffd23a"); topLabel("📜 GESETZ NR. 1", pop(t, T.also, T.pres - 0.08), "#fff", 150, 40, RED); if (t >= T.stamp) confetti(t, T.stamp + 0.1); }
  if (t >= T.pres && t < T.luk) { tk(t, T.pres, T.luk - 0.1, "l.cgln16", "Kann ich President sein", "Vor 17 Std.", AV.lcgln); stamp("✓ ERFÜLLT", 360, 300, pop(t, T.pres + 0.6, T.luk - 0.1)); np("l.cgln16", PRES.x, PRES.y - 210, T.pres + 0.6, T.luk - 0.1, "👑 "); np("Janic", PRES.x + 100, PRES.y - 20, T.janic + 0.1, T.luk - 0.1); }
  if (t >= T.luk && t < T.meo) { tk(t, T.luk, T.meo - 0.1, "luk", "kann ich polizei sein", "Vor 10 Std.", AV.luk, 205); if (t >= T.sec) tk(t, T.sec, T.meo - 0.1, "einfachso", "wo bin ich will Security sein", "Vor 10 Std.", AV.einfachso, 312);
    np("luk", 330, 796 - 150, T.luk + 0.3, T.meo - 0.1, "👮 "); if (t >= T.sec) np("einfachso", 535, 796 - 150, T.sec + 0.3, T.meo - 0.1, "🛡 "); }
  if (t >= T.meo && t < T.phil) { tk(t, T.meo, T.phil - 0.1, "MEO", "kann ich youtuber sein", "Vor 10 Std.", AV.meo); stamp("✓ ERFÜLLT", 360, 300, pop(t, T.meo + 0.5, T.phil - 0.1)); np("MEO", MEO.x - 60, MEO.y - 40, T.meo + 0.3, T.phil - 0.1, "🎥 "); }
  if (t >= T.phil && t < T.pizza) { tk(t, T.phil, T.pizza - 0.1, "Phillip🗿", "Wann bekomme ich meine Orange Katze?", "Vor 19 Std.", AV.phillip); topLabel("🧡 4. ANFRAGE", pop(t, T.phil + 0.3, T.pizza - 0.1), "#fff", 138, 26, "#ff8a2a"); stamp("✓ ERFÜLLT", 360, 310, pop(t, T.cat + 0.4, T.pizza - 0.1)); np("Phillip", PHIL.x - 70, PHIL.y - 30, T.cat + 0.4, T.pizza - 0.1, "🐱 "); }
  if (t >= T.pizza && t < T.cliff) {
    for (const [a, b, txt, wx, wy, ic] of [[T.pizza, T.iph, "Alex", OVEN.x - 110, 792 - 190, "🍕 "], [T.iph, T.wohn, "Noam", HUT.x + 120, 792 - 190, "📱 "], [T.wohn, T.goyo, "Mehmet", FLAT.x + 110, 792 - 190, "🔑 "], [T.goyo, T.cliff, "Leonard", LEO.x - 50, LEO.y - 40, "✨ "]]) if (t >= a && t < b) np(txt, wx, wy, a + 0.05, b - 0.05, ic);
    const lab = t < T.iph ? "🍕 PIZZAOFEN ✓" : t < T.wohn ? "📱 2 IPHONES ✓" : t < T.goyo ? "🏠 WOHNUNG ✓" : t < T.done ? "✨ GOYO ✓" : "✅ ALLES ERLEDIGT";
    const t0 = t < T.iph ? T.pizza : t < T.wohn ? T.iph : t < T.goyo ? T.wohn : t < T.done ? T.goyo : T.done;
    topLabel(lab, pop(t, t0, 99, 0.14), t >= T.done ? "#fff" : "#14223a", 160, 36, t >= T.done ? "#2fa84f" : "#ffd23a");
  }
  if (t >= T.cliff && t < T.law2) topLabel("👀 WER IST DAS?", pop(t, T.paw, T.law2 - 0.05), "#fff", 160, 40, null);
  if (t >= T.law2 && t < T.name) { lawCall9(t, pop(t, T.law2, T.name - 0.08)); }
  if (t >= T.name && t < T.loop) { nameCall(t, pop(t, T.name, 99)); const b = pop(t, T.name + 0.5, 99); if (b > 0) { ctx.save(); ctx.translate(SX, 310); ctx.scale(b, b); outlined("Schreib einen Namen 👇", 0, 0, 20, "#ffd23a", "#0e1a30", 6); ctx.restore(); } }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const k of ["me", "lcgln", "luk", "einfachso", "meo", "phillip"]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = k + ".png"; });
  makeSprites();
  return { duration: DUR };
};
