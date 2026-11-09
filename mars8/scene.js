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
const DUR = SPEECH_END + 0.55;   // + Hup-Loop am Ende

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
// ============================================================ Tag 8 „Neuer Planet, neues Land“ (base.js + helpers3.js + lib4.js + lib5.js + lib6.js + lib7.js + tag8.js -> scene.js)
// Aufbau wie Tag 2. Echte Umfrage Tag 7: 67 % „Mitten durch“ (27 Stimmen). 829 Follower (−1 → kein „+NEU“-Badge).
const FOLLOWERS = 829, LIKES = "4.352", FOLLOWING = "7";
// Zeitpunkte über die Wörter selbst suchen (robust, falls Whisper anders trennt)
const WL = window.WORDS.map(w => w[0].toLowerCase().replace(/[.,!?„“:\-]/g, ""));
const wf = (w, from = 0) => { for (let i = from; i < WL.length; i++) if (WL[i].startsWith(w)) return i; throw new Error("Wort fehlt: " + w); };
const iM = wf("mehmet"), iJ = wf("jeder");
const T = {
  monster: wt(wf("monster")), fall: wt(wf("bruchlandung")), card: wt(wf("829")), neu: wt(wf("wir", wf("829"))), jens: wt(wf("jens")), build: wt(wf("gesagt")),
  mehmet: wt(iM), apple: wt(wf("bitte", iM)), roader: wt(wf("roder") - 1), worm: wt(wf("hier")), nico: wt(wf("sogar")), wish: wt(iJ),
  cliff: wt(wf("aber", iJ)), eyes: wt(wf("ersten")), follow: wt(wf("follow") - 1), like: wt(wf("like") - 1), law: wt(wf("gesetz") - 1), top: wt(wf("top") - 1),
  loop: SPEECH_END + 0.1,
};
T.crash = T.card - 0.75;          // Aufprall (in der Pause nach „Planeten“)
const AV = {};

// ------------------------------------------------------------ Neuer Planet: pinker Sand, türkiser Ringplanet
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
function bigWorm(x, y, s, t) { // roaders Wurm, groß mit Helm + Namensschild
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 7; i >= 0; i--) { const yy = -12 - Math.max(0, Math.sin(t * 6 + i * 0.8)) * 10, xx = i * 14; circle(xx, yy, 12, "#1b1424"); circle(xx, yy, 10.5, i % 2 ? "#ff8fa8" : "#ff9db4"); }
  circle(-4, -18, 13, "#1b1424"); circle(-4, -18, 11.5, "#ff9db4"); circle(-9, -21, 2, "#111"); circle(-1, -21, 2, "#111"); ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-5, -15, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.strokeStyle = "rgba(200,235,255,0.95)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-4, -18, 19, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "rgba(200,235,255,0.25)"; ctx.fill(); circle(-12, -27, 3, "rgba(255,255,255,0.8)");
  ctx.restore();
}
function hornWheel(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2.5) * 0.4); ctx.scale(s, s); ctx.strokeStyle = "#2a2c34"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.stroke(); } circle(0, 0, 9, "#e5262b"); ctx.restore(); }

// ------------------------------------------------------------ Weltlayout
const ROCKET = { x: 330, y: 708, s: 1.6, rot: 0.24 };
const WIN = (() => { const c = Math.cos(ROCKET.rot), s = Math.sin(ROCKET.rot), lx = 0, ly = -100 * ROCKET.s; return { x: ROCKET.x + lx * c - ly * s, y: ROCKET.y + lx * s + ly * c, r: 30 * ROCKET.s }; })();
const STAND = { x: -260, y: 712 }, HUT = { x: -620, y: 712 }, FLAG = { x: 600, y: 720 }, CAVE = { x: 1300, y: 640 };
const EGGS8 = [ // Fans aus den letzten Tagen (Easter Eggs)
  { id: "nico", x: 120, acc: "#3fd3f2" }, { id: "elster", x: 40, acc: "#ff79c6" }, { id: "bz", x: 200, acc: "#ffb43a" }, { id: "elias", x: 470, acc: "#b06bff" },
  { id: "balerz", x: 545, acc: "#a50044" }, { id: "jaroslav", x: 620, acc: "#1c2f6b" }, { id: "tick", x: 695, acc: "#ff7a2a" }, { id: "jakob", x: 770, acc: "#9a8f88" }, { id: "phillip", x: 860, acc: "#ffb43a" },
];
function egg8(e, t, y = 770) {
  const s = 0.82, o = { t: t + e.x, acc: e.acc };
  if (e.id === "elster") Object.assign(o, { suit: "#ff9fd2", suit2: "#ffb6dc", suit3: "#e77fb8" });
  if (e.id === "phillip") Object.assign(o, { armL: -0.9, armR: 0.9 });
  astronaut(e.x, y, s, t >= T.cliff && t < T.follow ? "shock" : "happy", o);
  const hy = y - 104 * s;
  if (e.id === "nico") eggItem("gamer", e.x, y, s, t);
  if (e.id === "elster") dogEars(e.x, hy, s);
  if (e.id === "bz") chickenHat(e.x, hy, s, t);
  if (e.id === "elias") pizzaHat(e.x, hy, s);
  if (e.id === "balerz") barca(e.x, y, s);
  if (e.id === "jaroslav") policeCap(e.x, y, s);
  if (e.id === "tick") winterJacket(e.x, y, s);
  if (e.id === "jakob") stoneFriend(e.x + 40 * s, y, 0.7 * s, t);
  if (e.id === "phillip") orangeCat(e.x - 2, y - 52 * s, s * 0.9, t);
}
const CREW8 = [[300, 0], [250, 1], [360, 2], [410, 3]];   // Astronauten, die aus der Luke taumeln

// ------------------------------------------------------------ Kamera
const CAM = [
  [0, 330, 640, 1.45], [T.crash, 330, 640, 1.45], [T.crash + 0.6, 330, 600, 1.15],
  [T.card - 0.1, 330, 600, 1.15], [T.card + 0.2, 330, 560, 0.85], [T.neu - 0.1, 330, 560, 0.85], [T.neu + 0.3, 400, 590, 0.8], [T.jens - 0.1, 400, 590, 0.82],
  [T.jens + 0.2, STAND.x + 60, 640, 1.35], [T.mehmet - 0.1, STAND.x + 60, 640, 1.4], [T.mehmet + 0.2, HUT.x + 40, 640, 1.4], [T.roader - 0.1, HUT.x + 40, 640, 1.45],
  [T.roader + 0.2, 760, 650, 1.35], [T.nico - 0.1, 760, 650, 1.4], [T.nico + 0.2, 380, 640, 0.95], [T.cliff - 0.1, 380, 640, 0.95],
  [T.cliff + 0.25, CAVE.x - 220, 600, 1.05], [T.follow - 0.1, CAVE.x - 180, 590, 1.25], [T.follow + 0.2, 330, 600, 0.9], [T.like - 0.1, 330, 600, 0.92],
  [T.like + 0.2, STAND.x + 120, 640, 1.2], [T.law - 0.1, STAND.x + 120, 640, 1.25], [T.law + 0.2, 300, 610, 0.95], [T.loop - 0.02, 300, 610, 1.0],
  [T.loop, WIN.x - 10, WIN.y + 70, 2.6], [DUR, WIN.x - 10, WIN.y + 70, 2.6],
];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) { const a = CAM[i - 1], b = CAM[i], k = easeIO((t - a[0]) / Math.max(1e-6, b[0] - a[0])); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k))]; }
  return CAM.at(-1).slice(1);
}
const toScreen = (x, y, t) => { const [cx, cy, z] = cam(t); return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z, z]; };
const looped = t => t >= T.loop ? t - T.loop : t;           // im Loop wieder wie am Anfang

// ------------------------------------------------------------ Welt zeichnen
function drawWorld(t, z) {
  const lt = looped(t), inLoop = t >= T.loop;
  sky8(t); ground8();
  for (const [x, y, s] of [[-900, 690, 1.2], [-40, 700, 0.9], [1000, 700, 1.1], [180, 760, 0.7]]) crystal(x, y, s, t);
  // Höhle + Fußspuren
  cave(CAVE.x, CAVE.y, t, t >= T.eyes ? ramp(t, T.eyes, T.eyes + 0.2) : 0);
  for (let i = 0; i < 6; i++) footprint(CAVE.x - 160 - i * 95, CAVE.y + 70 + (i % 2) * 26, 1.5, 0.1 * (i % 2 ? 1 : -1));
  // Menge (ab „Wir fangen neu an“ aus der Rakete heraus)
  if (t >= T.neu && !inLoop) for (const [i, m] of MASS.entries()) { if (i % 3) continue; const sp = SPR[m.acc]; if (!sp) continue; const k = easeOut(ramp(t, T.neu + (i % 40) * 0.012, T.neu + 0.6 + (i % 40) * 0.012)); if (k <= 0) continue; const x = lerp(ROCKET.x, m.x, k), y = lerp(ROCKET.y, m.y, k), w = 88 * m.s, h = 158 * m.s; ctx.drawImage(sp, x - w / 2, y - h - Math.abs(Math.sin(t * 6 + m.ph)) * 3, w, h); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  // Apple Store (Mehmet), Dönerstand (Jens + Tim)
  if (!inLoop) {
    if (t >= T.mehmet - 0.2) appleHut(HUT.x, HUT.y, 1, easeOut(ramp(t, T.apple, T.apple + 0.4)), t);
    if (t >= T.build) { const k = back(ramp(t, T.build, T.build + 0.35)); ctx.save(); ctx.translate(STAND.x, STAND.y); ctx.scale(1, k); ctx.translate(-STAND.x, -STAND.y); donerShop(STAND.x, STAND.y, 1.0); ctx.restore(); }
    if (t >= T.jens - 0.2) { const jx = STAND.x + 120, bt = t >= T.jens && t < T.build; astronaut(jx, 768, 0.9, "happy", { t, acc: "#ffd23a", armR: bt ? -1.2 - Math.abs(Math.sin(t * 12)) * 1.2 : -2.4 }); if (bt) { ctx.save(); ctx.translate(jx + 28, 768 - 112 + Math.sin(t * 12) * 8); ctx.rotate(-0.8 + Math.sin(t * 12) * 0.6); ctx.fillStyle = "#6b4a2a"; ctx.fillRect(-2, 0, 4, 26); ctx.fillStyle = "#7a7f88"; rr(-9, -6, 18, 9, 2); ctx.fill(); ctx.restore(); } }
    if (t >= T.build) { const tx = STAND.x - 40; astronaut(tx, 770, 0.85, "happy", { t: t + 3, acc: "#7bf27a", armR: -1.4 + Math.sin(t * 6) * 0.4 }); chefBand(tx, 770, 0.85); }
    if (t >= T.mehmet - 0.2) { const mx = HUT.x + 130, cheer = t >= T.apple; astronaut(mx, 772 - (cheer ? Math.abs(Math.sin(t * 9)) * 18 : 0), 0.9, cheer ? "happy" : "think", { t, acc: "#ff8a2a", armL: cheer ? 2.6 : 0.25, armR: cheer ? -2.6 : -0.25 }); }
  }
  // Fahne
  if (t >= T.neu && !inLoop) flag2(FLAG.x, FLAG.y, ramp(t, T.neu + 0.3, T.neu + 0.9), t);
  // Rakete schief im Sand + Monster am Steuer
  const bounce = t >= T.crash && t < T.crash + 0.6 ? Math.sin((t - T.crash) * 18) * 14 * Math.exp(-(t - T.crash) * 6) : 0;
  ctx.save(); ctx.translate(ROCKET.x, ROCKET.y - bounce); ctx.rotate(ROCKET.rot + bounce * 0.004); rocket(0, 0, ROCKET.s, 0);
  ctx.fillStyle = "#2a2230"; rr(-16, -66, 32, 54, 6); ctx.fill();                  // offene Luke
  const wr = ROCKET.s; circle(0, -100 * wr, 32 * wr, "#1b1424"); circle(0, -100 * wr, 29 * wr, "#9aa3ab"); circle(0, -100 * wr, 25 * wr, "#cfeaf7");   // großes Cockpitfenster
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(WIN.x, WIN.y, 25 * ROCKET.s, 0, Math.PI * 2); ctx.clip();
  const honk = (lt > T.monster - 0.05 && lt < T.monster + 0.4 && !inLoop) || (inLoop && lt > 0.15);
  creature(WIN.x, WIN.y + 78, 0.3, t, { happy: true, cheeks: false, eyes: 1, look: 0, munch: false });
  ctx.restore();
  hornWheel(WIN.x - 2, WIN.y + 42, 0.75 * (honk ? 1.08 : 1), t);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(WIN.x - 8, WIN.y - 6, 30, 3.6, 4.4); ctx.stroke();
  // Astronauten taumeln aus der Luke (benommen)
  if (t >= T.crash && !inLoop) for (const [x, i] of CREW8) { const k = easeOut(ramp(t, T.crash + i * 0.12, T.crash + 0.7 + i * 0.12)); const xx = lerp(ROCKET.x - 10, x - 140 + i * 30, k); const wob = Math.sin(t * 5 + i) * 0.12 * (t < T.neu ? 1 : 0.2); leanAstro(xx, 776 + i * 4, 0.85, wob, t < T.neu ? "shock" : "happy", { t: t + i, acc: ["#3fd3f2", "#ff79c6", "#7bf27a", "#ffd23a"][i], armL: 0.6, armR: -0.6 }); }
  // Wurm, Fans, Monster draußen
  if (t >= T.worm && !inLoop) bigWorm(lerp(980, 700, easeOut(ramp(t, T.worm, T.worm + 0.8))), 790, 3.0, t);
  if (t >= T.nico && !inLoop) for (const e of EGGS8) egg8(e, t, 772);
  if (t >= T.cliff && t < T.follow) { const sx = lerp(CAVE.x - 600, CAVE.x - 330, easeIO(ramp(t, T.cliff, T.eyes))); creature(sx, 740, 0.38, t, { sniff: true, eyes: 1, look: 1 }); }
  if (t >= T.like && t < T.loop) creature(STAND.x + 230, 770, 0.42, t, { sit: true, munch: t >= T.like + 0.6, happy: true });
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  // Effekte in der Welt
  if ((t >= T.crash && t < T.neu + 1) || inLoop) for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i / 4) % 1); ctx.globalAlpha = 0.5 * (1 - k); circle(ROCKET.x + 60 + Math.sin(t + i) * 14, ROCKET.y - 240 - k * 180, 16 + 36 * k, "#cfc4d8"); ctx.globalAlpha = 1; }
  if (t >= T.crash && t < T.neu) for (const [x, i] of CREW8) { const k = easeOut(ramp(t, T.crash + i * 0.12, T.crash + 0.7 + i * 0.12)), xx = lerp(ROCKET.x - 10, x - 140 + i * 30, k); for (let j = 0; j < 3; j++) { const a = t * 4 + j * 2.1; ctx.save(); ctx.font = "14px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("⭐", xx + Math.cos(a) * 26, 776 + i * 4 - 128 + Math.sin(a) * 8); ctx.restore(); } }
  if (t >= T.crash && t < T.crash + 1.4) { const d = t - T.crash; glow(ROCKET.x, ROCKET.y - 40, 300 * Math.min(1, d * 5), "255,200,220", 0.8 * (1 - d / 1.4));
    ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - clamp(d / 0.6))})`; ctx.lineWidth = 10 * (1 - clamp(d / 0.6)); ctx.beginPath(); ctx.ellipse(ROCKET.x, ROCKET.y + 4, 420 * easeOut(clamp(d / 0.6)), 90 * easeOut(clamp(d / 0.6)), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 16; i++) { const a = Math.PI + (i / 15) * Math.PI, v = 160 + (i % 4) * 70, k = easeOut(clamp(d / 1.2)); ctx.globalAlpha = 0.85 * (1 - d / 1.4); circle(ROCKET.x + Math.cos(a) * v * k, ROCKET.y + Math.sin(a) * v * 0.55 * k - 30 * k, 26 + 40 * k, i % 2 ? "#f8bcd6" : "#e88ab6"); ctx.globalAlpha = 1; }
    for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.1 + 0.8 * (i / 13)), v = 260 + (i % 3) * 90; circle(ROCKET.x + Math.cos(a) * v * d, ROCKET.y - 60 + Math.sin(a) * v * d + 420 * d * d, 5, "#8e4fb0"); } }
  if (t >= T.build && t < T.build + 1.0) puffs(STAND.x, STAND.y, t, T.build, 8);
  if (t >= T.apple && t < T.apple + 0.8) sparkleBurst(HUT.x, HUT.y - 80, t, T.apple);
  if (t >= T.worm + 0.6 && t < T.worm + 1.4) sparkleBurst(700, 700, t, T.worm + 0.6);
}

// ------------------------------------------------------------ Karten (sichere Zone: Mitte SX, Breite ≤ 420)
function card(fn, y) { ctx.save(); ctx.translate(SX, y); ctx.scale(0.88, 0.88); ctx.translate(-288, -y); fn(); ctx.restore(); }
function profileCard8(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16; ctx.fillStyle = "#121216"; rr(-212, -100, 424, 200, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "900 23px InterX"; ctx.fillText("Gedacht", -190, -70);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -190, -48);
  const n = Math.round(lerp(780, FOLLOWERS, easeOut(ramp(t, T.card + 0.1, T.card + 0.8))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -190 + i * 100; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -20); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10px InterX"; ctx.fillText(l, x, -3); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-96, -38, 100, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-190, 18, 170, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -105, 35);
  ctx.fillStyle = "#2c2c33"; rr(-12, 18, 130, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 35);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea"; ctx.fillText("1 Follow = 1 Bewohner 🚀", -190, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -190, 87);
  if (AV.me) { circle(160, -58, 36, "#fff"); ctx.save(); ctx.beginPath(); ctx.arc(160, -58, 33, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, 127, -91, 66, 66); ctx.restore(); }
  ctx.restore();
}
function boardingPass8(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 250); ctx.rotate(-0.02); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-205, -70, 410, 140, 12); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.fillStyle = CYAN; rr(110, -70, 95, 140, [0, 12, 12, 0]); ctx.fill();
  ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, -64); ctx.lineTo(110, 64); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = CYAN; ctx.font = "900 13px InterX"; ctx.letterSpacing = "1.5px"; ctx.fillText("BORDKARTE", -185, -44); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#121a2a"; ctx.font = "900 42px InterX"; ctx.fillText("RAKETE 3", -187, -4);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 12px InterX"; ctx.fillText("Name: DU?  ·  Sitz: ???  ·  Ziel: ROTANIEN 2.0", -185, 40);
  ctx.restore();
  astronaut(SX + 158 * s, 250 + 34 * s, 0.45 * s, "happy", { t: 0 });
}
function lawCall(t, s) { // Gesetzestafel + leere Kommentarkarte wie in Tag 2
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 160); ctx.scale(s, s); outlined("📜 GESETZ NR. 1", 0, 0, 40, "#fff", "#0e1a30", 10); ctx.restore();
  ctx.save(); ctx.translate(SX, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-205, -44, 410, 88, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-172, -6, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -172, -5);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -142, -22);
  ctx.fillStyle = "#e3f8fd"; rr(-74, -32, 112, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("⭐ Top-Kommentar", -68, -21.5);
  ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("dein Gesetz? 🤔", -142, 4);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten", -142, 27);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 178, -10 + Math.sin(t * 6) * 2);
  ctx.restore();
  // Gesetzestafel „GESETZ NR. 1 | ?“
  ctx.save(); ctx.translate(SX, 380); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-96, -54, 192, 108, 12); ctx.fill(); ctx.fillStyle = "#b9b3ab"; rr(-90, -48, 180, 96, 10); ctx.fill();
  ctx.fillStyle = "#2a2a30"; ctx.font = "18px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("GESETZ NR. 1", 0, -24); ctx.fillStyle = RED; ctx.font = "44px Comic"; ctx.fillText("?", 0, 16); ctx.restore();
}
function likeButton(t, s) { // TikTok-Herz wird angetippt, ein Döner fliegt zum Monster
  if (s <= 0.01) return;
  const tap = (t - T.like) % 0.9, k = tap < 0.15 ? 1 + tap * 2 : 1;
  ctx.save(); ctx.translate(SX, 300); ctx.scale(s * k, s * k);
  circle(0, 0, 54, "rgba(0,0,0,0.55)"); ctx.font = "62px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("❤️", 0, 4);
  ctx.restore();
  ctx.save(); ctx.translate(SX, 380); ctx.scale(s, s); outlined("❤️ = 🥙", 0, 0, 36, "#fff", "#0e1a30", 8); ctx.restore();
}

// ------------------------------------------------------------ Flug durchs Asteroidenfeld + Absturz (Bildschirm-Koordinaten)
const ROCKS8 = (() => { const r = rng(77), a = []; for (let i = 0; i < 26; i++) a.push({ a: r() * Math.PI * 2, ph: r(), s: 0.5 + r() * 1.1, rot: r() * 6, sp: (r() - 0.5) * 3 }); return a; })();
const RADIAL = (() => { const r = rng(12), a = []; for (let i = 0; i < 80; i++) a.push([r() * Math.PI * 2, r(), r()]); return a; })();
let FWIN = [288, 400];
function rocketMonster(x, y, s, rot, t, fire, honk, steer) { // Rakete mit Monster am Lenkrad im Cockpitfenster
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (fire > 0) for (const [c, w, l] of [["rgba(255,90,30,0.8)", 16, 120], ["rgba(255,180,40,0.9)", 10, 85], ["rgba(255,245,200,0.95)", 5, 50]]) { const f = l * fire * (1 + 0.15 * Math.sin(t * 45)); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w * s, -4 * s); ctx.quadraticCurveTo(0, f * s, w * s, -4 * s); ctx.fill(); }
  rocket(0, 0, s, 0);
  circle(0, -100 * s, 32 * s, "#1b1424"); circle(0, -100 * s, 29 * s, "#9aa3ab"); circle(0, -100 * s, 25 * s, "#cfeaf7");
  ctx.save(); ctx.beginPath(); ctx.arc(0, -100 * s, 25 * s, 0, Math.PI * 2); ctx.clip(); creature(0, -100 * s + 78 * s / 1.6, 0.3 * s / 1.6, t, { happy: true, eyes: 1, look: Math.sin(t * 3) }); ctx.restore();
  ctx.save(); ctx.translate(0, -100 * s + 42 * s / 1.6); ctx.rotate(steer); ctx.scale(0.75 * s / 1.6 * (honk ? 1.08 : 1), 0.75 * s / 1.6 * (honk ? 1.08 : 1)); ctx.strokeStyle = "#2a2c34"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.stroke(); } circle(0, 0, 9, "#e5262b"); ctx.restore();
  const m = ctx.getTransform(); FWIN = [(m.e + m.c * (-100 * s)) / S, (m.f + m.d * (-100 * s)) / S];
  ctx.restore();
}
function drawFlight(t) {
  const fall = ramp(t, T.fall, T.crash), F = easeIO(fall);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b0820"); g.addColorStop(1, lerp(0, 1, F) > 0.5 ? "#4a1f50" : "#1a1240"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Sterne rasen vorbei (Flug nach vorn)
  ctx.save(); ctx.lineCap = "round"; for (const [a, ph, w] of RADIAL) { const d = ((t * (0.9 + w) + ph) % 1), r0 = 30 + d * 650, r1 = r0 + 20 + 120 * d; ctx.strokeStyle = `rgba(220,230,255,${0.25 + 0.6 * d})`; ctx.lineWidth = 1 + 2 * d; ctx.beginPath(); ctx.moveTo(288 + Math.cos(a) * r0, 470 + Math.sin(a) * r0); ctx.lineTo(288 + Math.cos(a) * r1, 470 + Math.sin(a) * r1); ctx.stroke(); } ctx.restore();
  // Asteroiden fliegen auf die Kamera zu (verschwinden beim Absturz)
  for (const [i, r] of ROCKS8.entries()) { const d = ((t * 0.45 + r.ph) % 1), sc = (0.15 + d * d * 2.4) * r.s; ctx.globalAlpha = 1 - F; asteroid(288 + Math.cos(r.a) * (40 + d * 420), 470 + Math.sin(r.a) * (40 + d * 520), 34 * sc, r.rot + t * r.sp, i + 2); ctx.globalAlpha = 1; }
  // Planet kommt beim Absturz von unten
  if (fall > 0) { const hy = lerp(1250, 640, F); ctx.fillStyle = "#c86a9a"; ctx.beginPath(); ctx.ellipse(288, hy + 900, 1200, 900, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#f3a2c6"; ctx.beginPath(); ctx.ellipse(288, hy + 920, 1180, 880, 0, Math.PI, 0); ctx.fill(); glow(288, hy, 400, "255,160,200", 0.35 * F); }
  // Rakete: weicht aus, dann Sturzflug
  const swerve = Math.sin(t * 2.6), zoomIn = ramp(t, T.monster - 0.4, T.monster + 0.2) * (1 - ramp(t, T.fall - 0.4, T.fall));
  let x = 288 + swerve * 85 * (1 - F), y = lerp(610, 570, zoomIn), s = 1.3 + 0.4 * zoomIn, rot = Math.cos(t * 2.6) * 0.42 * (1 - F);
  if (fall > 0) { x = lerp(x, 300, F); y = lerp(570, 640, Math.pow(fall, 1.6)); rot = lerp(rot, 2.5, F); s = lerp(1.3, 1.0, F); }
  if (fall > 0) for (let i = 1; i < 9; i++) { const k = Math.max(0, fall - i * 0.05); if (k <= 0) continue; const px = lerp(288, 300, easeIO(k)), py = lerp(570, 640, Math.pow(k, 1.6)); ctx.globalAlpha = 0.5 - i * 0.05; circle(px - 30 + i * 2, py - 60, 18 + i * 4, "#4a3a55"); ctx.globalAlpha = 1; }
  const honk = (t > T.monster - 0.05 && t < T.monster + 0.4) || t < 0.5;
  rocketMonster(x, y, s, rot, t, 1.1 + fall, honk, -Math.cos(t * 2.6) * 0.9 * (1 - F) + (fall > 0 ? Math.sin(t * 25) * 0.6 : 0));
  // Streifschuss mit Funken
  for (const t0 of [1.25, 2.55]) if (t >= t0 && t < t0 + 0.6) { const d = t - t0; for (let i = 0; i < 12; i++) { const a = -0.5 - i * 0.25; circle(x + 40 + Math.cos(a) * 200 * d, y - 120 + Math.sin(a) * 160 * d + 200 * d * d, 3 * (1 - d / 0.6), i % 2 ? "#ffd23a" : "#ff8a1e"); } }
  if (fall > 0) { const p = 0.5 + 0.5 * Math.sin(t * 14); ctx.fillStyle = `rgba(255,30,30,${0.12 + 0.15 * p})`; ctx.fillRect(0, 0, W, H); speedLines(t, 1); }
}

// ------------------------------------------------------------ Effekte
const IMPACTS = [T.monster, 1.25, 2.55, T.crash, T.build, T.apple, T.eyes, T.loop + 0.15];
function shakeAt(t) { let dx = 0, dy = 0; if (t < T.crash) { const a = t >= T.fall ? 4 : 1.5; dx += Math.sin(t * 50) * a; dy += Math.cos(t * 43) * a; } for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.5) continue; const a = (t0 === T.crash ? 16 : 6) * Math.exp(-d * 9); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; } return [dx, dy]; }
const CUTS = CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05);
function flash(t) { let a = 0; { const d = t - T.crash; if (d >= 0 && d < 0.35) a = Math.max(a, 0.9 * (1 - d / 0.35)); } for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.25 * (1 - d / 0.14)); } if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); } }

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
  if (t < T.crash || t >= T.loop) drawFlight(t >= T.loop ? t - T.loop : t);
  else { ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); drawWorld(t, z); ctx.restore(); dust(t); }
  if (t >= T.cliff && t < T.follow) { ctx.fillStyle = "rgba(20,5,30,0.35)"; ctx.fillRect(0, 0, W, H); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(30,5,30,0.4)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen (sichere Zone)
  const lt = looped(t);
  if (lt < T.monster || t >= T.loop) { const a = t >= T.loop ? 1 : 1 - ramp(t, T.monster - 0.05, T.monster + 0.1); ctx.save(); ctx.translate(SX, 175); ctx.scale(a, a); outlined("TAG 8", 0, 0, 86, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t < 0.45 || (t >= T.monster - 0.05 && t < T.fall) || (t >= T.loop + 0.15)) { const d = t >= T.loop ? t - T.loop - 0.15 : t < 0.45 ? 1 : t - T.monster + 0.05; const a = t < 0.45 ? 1 - ramp(t, 0.3, 0.45) : back(clamp(d / 0.15)) * (t >= T.loop ? 1 : 1 - ramp(t, T.monster + 0.45, T.monster + 0.6)); const [sx, sy] = t < T.crash || t >= T.loop ? [FWIN[0] + 80, FWIN[1] - 50] : toScreen(WIN.x + 70, WIN.y - 40, t); ctx.save(); ctx.translate(Math.min(sx, 420), Math.max(130, sy)); ctx.rotate(-0.15); ctx.scale(a, a); outlined("HUP! HUP!", 0, 0, 34, "#ffd23a", "#0e1a30", 8); ctx.restore(); }
  if (t >= T.fall && t < T.crash) topLabel("⚠ ABSTURZ!", pop(t, T.fall + 0.05, T.crash) * (1 + 0.06 * Math.max(0, Math.sin(t * 14))), "#fff", 160, 42, RED);
  if (t >= T.monster && t < T.fall) topLabel("🕹 MONSTER AM STEUER", pop(t, T.monster + 0.1, T.fall - 0.05), "#14223a", 160, 30, "#ffd23a");
  if (t >= T.crash && t < T.card) topLabel("💥 BRUCHLANDUNG", pop(t, T.crash + 0.05, T.card - 0.05), "#fff", 160, 40, RED);
  if (t >= T.card && t < T.neu + 0.2) { profileCard8(t, pop(t, T.card, T.neu + 0.1)); confetti(t, T.card + 0.2); }
  if (t >= T.neu + 0.2 && t < T.jens) topLabel("🚩 ROTANIEN 2.0", pop(t, T.neu + 0.3, T.jens - 0.05), "#fff", 160, 40, "#4a2b9a");
  if (t >= T.jens && t < T.mehmet) { card(() => tkComment(pop(t, T.jens, T.mehmet - 0.1), "Jens", "ich Stelle döner wieder her", "Vor 22 Std.", 0, AV.jens, 240), 240); topLabel("⭐ ERSTE AMTSHANDLUNG", pop(t, T.jens + 0.2, T.mehmet - 0.1), "#14223a", 138, 24, "#ffd23a"); if (t >= T.build) stamp("✓ ERFÜLLT", 360, 300, pop(t, T.build + 0.15, T.mehmet - 0.1)); }
  if (t >= T.mehmet && t < T.roader) { card(() => tkComment(pop(t, T.mehmet, T.roader - 0.1), "Mehmet_brb", "Apple Store auf dem nächsten Planeten 😂?", "Vor 17 Std.", 0, AV.mehmet, 240), 240); topLabel("📅 FRAGT SEIT TAG 3", pop(t, T.mehmet + 0.4, T.roader - 0.1), "#fff", 138, 24, "#14223a"); if (t >= T.apple) stamp("✓ ERFÜLLT", 360, 310, pop(t, T.apple + 0.1, T.roader - 0.1)); }
  if (t >= T.roader && t < T.nico) { card(() => tkComment(pop(t, T.roader, T.nico - 0.1), "roader", "man bitteeeee mein wurm", "Vor 14 Std.", 0, AV.roader, 240), 240); if (t >= T.worm) { stamp("✓ ERFÜLLT", 360, 300, pop(t, T.worm + 0.1, T.nico - 0.1)); const [wx, wy] = toScreen(720, 690, t); pill("ROADERS WURM", Math.min(wx, 400), wy, pop(t, T.worm + 0.5, T.nico - 0.1), "#fff", "#14223a", "🪱 "); } }
  if (t >= T.nico && t < T.cliff) { const [nx, ny] = toScreen(120, 640, t); pill("FIRE.NICO", Math.max(70, Math.min(nx, 420)), ny, pop(t, T.nico + 0.2, T.cliff - 0.1), "#fff", "#14223a", "🎮 "); topLabel("💬 JEDER WUNSCH ZÄHLT", pop(t, T.wish, T.cliff - 0.05), "#14223a", 160, 32, "#ffd23a"); }
  if (t >= T.cliff && t < T.follow) { topLabel("👣 NICHT DIE ERSTEN …", pop(t, T.cliff + 0.2, T.follow - 0.05), "#fff", 160, 36, null); }
  if (t >= T.follow && t < T.like) { boardingPass8(pop(t, T.follow, T.like - 0.08)); topLabel("1 FOLLOW = 1 PLATZ", pop(t, T.follow + 0.2, T.like - 0.08), "#14223a", 140, 28, "#ffd23a"); }
  if (t >= T.like && t < T.law) { likeButton(t, pop(t, T.like, T.law - 0.08)); topLabel("1 LIKE = 1 DÖNER", pop(t, T.like + 0.1, T.law - 0.08), "#14223a", 140, 28, "#ffd23a");
    for (let i = 0; i < 3; i++) { const t0 = T.like + 0.3 + i * 0.5, d = (t - t0) / 0.45; if (d < 0 || d > 1) continue; const [mx, my] = toScreen(STAND.x + 230, 700, t); ctx.save(); ctx.translate(lerp(SX, mx, d), lerp(300, my, d) - Math.sin(Math.PI * d) * 80); ctx.rotate(d * 6); doner(0, 0, 1.6); ctx.restore(); } }
  if (t >= T.law && t < T.loop) { lawCall(t, pop(t, T.law, 99)); const b = pop(t, T.top + 0.1, 99); if (b > 0) { ctx.save(); ctx.translate(SX, 470); ctx.scale(b, b); outlined("+ dein Wunsch kommt vielleicht ins nächste Video 👇", 0, 0, 15, "#fff", "#0e1a30", 5); ctx.restore(); } }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"], ["jens", "jens.png"], ["mehmet", "mehmet.png"], ["roader", "roader.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
