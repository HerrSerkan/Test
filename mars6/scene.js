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
const DUR = SPEECH_END + 0.85;   // Umfragekarte bleibt kurz stehen

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
// ============================================================ Tag 6 „Absturz auf Pluto“ (base.js + helpers3.js + lib4.js + lib5.js + tag6.js -> scene.js)
// Eigene Folge nach BRIEFING_TAG6.md, Stil wie Tag 5. Alle Zeiten hängen an den gesprochenen Wörtern.
// Sichere Zone: kein Text unten 20 % (y > 819), rechts 15 % (x > 490), oben 10 % (y < 102)  – im Raster 576 x 1024.
const SX = 245;                       // Mitte für Text (links der rechten 15 %)
const FOLLOWERS = 824;
const T = {
  fall: wt(3), impact: wt(7) - 0.62, vote: wt(7), tablet: wt(11), hatch: wt(17), noam: wt(20), horizon: wt(22), eyes: wt(25),
  rehook: wt(27), fast: wt(30), delon: wt(32), twist: wt(37), sniff: wt(40), doner: wt(45), hut: wt(47), stamm: wt(51),
  cta: wt(55), follow: wt(58), og: wt(63), weiter: wt(69), decide: wt(73), stay: wt(74), go: wt(78), vote2: wt(84), loop: SPEECH_END + 0.1,
};
const AV = {};
const scene = t => t < T.fall ? "cockpit" : t < T.impact ? "fall" : t < T.tablet ? "world" : t < T.hatch ? "cabin" : t < T.decide ? "world" : "split";

// ------------------------------------------------------------ Untertitel: Wort für Wort, max. 2 Zeilen, in der sicheren Zone
function captions(t) {
  const C = window.CHUNKS; let c = null;
  for (let i = 0; i < C.length; i++) if (t >= C[i].s - 0.02) c = C[i];
  if (!c || (t > c.e + 0.6 && c === C.at(-1))) return;
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
      const k = ramp(t, p.s - 0.02, p.s + 0.1);
      if (k > 0) { ctx.save(); ctx.translate(x + p.ww * fit / 2, y); const sc = (0.6 + 0.4 * back(k)) * fit; ctx.scale(sc, sc);
        outlined(p.w, 0, 0, 40, p.col === 1 ? CYAN : p.col === 2 ? RED : p.col === 3 ? "#ffd23a" : "#ffffff", "#14223a", 10); ctx.restore(); }
      x += (p.ww + sp) * fit;
    }
  });
  ctx.restore();
}
function topLabel(txt, s, col = "#fff", y = 150, size = 40, bg = null) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  if (bg) { ctx.font = `${size}px Comic, 'Noto Color Emoji'`; const w = ctx.measureText(txt).width + 34; ctx.fillStyle = bg; rr(-w / 2, -size * 0.62, w, size * 1.24, 12); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); }
  if (bg) { ctx.fillStyle = col; ctx.font = `${size}px Comic, 'Noto Color Emoji'`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 3); } else outlined(txt, 0, 2, size, col, "#0e1a30", 10); ctx.restore();
}
function tag6Badge() { ctx.save(); ctx.fillStyle = "rgba(14,26,48,0.75)"; rr(14, 108, 84, 30, 9); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("TAG 6", 56, 124); ctx.restore(); }

// ------------------------------------------------------------ Pluto
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
function plutoSky(t) {
  ctx.fillStyle = "#05060c"; ctx.fillRect(-2000, -2500, 5000, HORIZON + 2500);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + p); circle(x, y, r, "#fff"); }
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, HORIZON - 220, 0, HORIZON); g.addColorStop(0, "rgba(120,150,210,0)"); g.addColorStop(1, "rgba(150,180,230,0.35)"); ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON - 220, 5000, 220);
  // Charon
  circle(80, 330, 62, "#1b1424"); circle(80, 330, 58, "#9a9aa6"); circle(62, 312, 14, "#80808c"); circle(98, 350, 10, "#80808c"); ctx.fillStyle = "rgba(0,0,20,0.3)"; ctx.beginPath(); ctx.arc(96, 342, 58, 0, Math.PI * 2); ctx.fill();
  circle(950, 200, 4, "#fff8d0"); glow(950, 200, 40, "255,250,210", 0.6);   // die Sonne, winzig
}
const ICE = (() => { const r = rng(19), a = []; for (let i = 0; i < 70; i++) { const y = HORIZON + 10 + Math.pow(r(), 1.3) * 900; a.push([r() * 2600 - 1000, y, 10 + r() * 40 * (0.4 + (y - HORIZON) / 500), r()]); } return a; })();
function plutoGround() {
  ctx.fillStyle = "#9fb3cc"; ctx.beginPath(); ctx.moveTo(-2000, HORIZON + 4);
  for (let x = -2000; x <= 3000; x += 60) ctx.lineTo(x, HORIZON - 8 - 14 * Math.abs(Math.sin(x * 0.005)) - 8 * Math.sin(x * 0.017));
  ctx.lineTo(3000, HORIZON + 4); ctx.fill();
  const g = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 900); g.addColorStop(0, "#c4d3e4"); g.addColorStop(0.35, "#dbe6f1"); g.addColorStop(1, "#eef4fa");
  ctx.fillStyle = g; ctx.fillRect(-2000, HORIZON, 5000, 2000);
  for (const [x, y, r, k] of ICE) {
    ctx.fillStyle = k < 0.35 ? "rgba(185,150,120,0.35)" : "rgba(140,170,205,0.35)"; ctx.beginPath(); ctx.ellipse(x, y, r * 1.6, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    if (k > 0.7) { ctx.strokeStyle = "rgba(120,150,190,0.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.2, y + 4); ctx.lineTo(x + r, y - 2); ctx.stroke(); }
  }
}
function iceHill(x, y, w, h) { // Eishügel (Unterkante Mitte)
  ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(x - w - 4, y); ctx.bezierCurveTo(x - w * 0.6, y - h * 1.05, x + w * 0.5, y - h * 1.1, x + w + 4, y); ctx.fill();
  ctx.fillStyle = "#cfdcea"; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.bezierCurveTo(x - w * 0.6, y - h, x + w * 0.5, y - h * 1.05, x + w, y); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(x - w * 0.25, y - h * 0.7, w * 0.25, h * 0.08, -0.15, 0, Math.PI * 2); ctx.fill();
}
function iceRock(x, y, r) { ctx.fillStyle = "#a9c3dc"; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * 0.6, y - r * 0.9); ctx.lineTo(x + r * 0.2, y - r * 1.1); ctx.lineTo(x + r, y - r * 0.3); ctx.lineTo(x + r * 0.9, y); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.8); ctx.lineTo(x + r * 0.15, y - r * 1.0); ctx.lineTo(x - r * 0.1, y - r * 0.5); ctx.fill(); }

// ------------------------------------------------------------ Figuren + Zubehör
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
function tablet(x, y, s) { // „PLUTO = ZWERGPLANET ❌“
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-62, -44, 124, 88, 10); ctx.fill(); ctx.fillStyle = "#f6f8fb"; rr(-56, -38, 112, 76, 7); ctx.fill();
  plutoPlanet(-30, -6, 16, 0);
  ctx.fillStyle = "#14223a"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = "13px Comic"; ctx.fillText("PLUTO =", -8, -18);
  ctx.fillStyle = RED; ctx.font = "11.5px Comic"; ctx.fillText("ZWERG-", -8, -2); ctx.fillText("PLANET", -8, 12);
  ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❌", 40, 24);
  ctx.restore();
}
function laserPistol(x, y, s, charge, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (charge > 0) glow(26, -6, 40 + 40 * charge, "80,200,255", 0.4 + 0.5 * charge);
  ctx.fillStyle = "#3a4256"; rr(-8, -14, 40, 16, 5); ctx.fill(); ctx.fillStyle = "#2a2f3c"; rr(-6, 0, 12, 18, 3); ctx.fill();
  ctx.fillStyle = "#59d4ff"; rr(4, -11, 20 * Math.max(0.15, charge), 10, 3); ctx.fill(); circle(34, -6, 4 + 3 * charge * (0.7 + 0.3 * Math.sin(t * 30)), "#bff2ff");
  ctx.restore();
}
function doner(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#e8c07a"; ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.lineTo(3, -22); ctx.lineTo(-3, -22); ctx.fill(); ctx.fillStyle = "#a0522d"; ctx.fillRect(-8, -10, 16, 12); ctx.fillStyle = "#6fcf5a"; ctx.fillRect(-9, -2, 18, 3); ctx.restore(); }
function pizzaHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.rotate(-0.15); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-26, 8); ctx.lineTo(26, 8); ctx.lineTo(0, -36); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#f2b84b"; ctx.beginPath(); ctx.moveTo(-23, 6); ctx.lineTo(23, 6); ctx.lineTo(0, -32); ctx.fill(); ctx.fillStyle = "#c98a2a"; ctx.fillRect(-24, 2, 48, 6); for (const [px, py] of [[-8, -4], [7, -2], [0, -16]]) circle(px, py, 4, "#d93a2a"); ctx.restore(); }
function orangeCat(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 11, "#1b1424"); ctx.fillStyle = "#ff9a2a"; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); circle(14, -10, 9, "#ff9a2a"); ctx.beginPath(); ctx.moveTo(8, -16); ctx.lineTo(10, -24); ctx.lineTo(14, -17); ctx.moveTo(15, -17); ctx.lineTo(19, -24); ctx.lineTo(21, -15); ctx.fill(); ctx.strokeStyle = "#c96a1a"; ctx.lineWidth = 2; for (const d of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(d, -9); ctx.lineTo(d + 2, -3); ctx.stroke(); } circle(11, -11, 1.6, "#111"); circle(17, -11, 1.6, "#111"); ctx.restore(); }
function glassesRolex(x, hy, y, s) { ctx.save(); ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5 * s; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * 7 * s, hy + 2 * s, 5.5 * s, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - 1.5 * s, hy + 2 * s); ctx.lineTo(x + 1.5 * s, hy + 2 * s); ctx.stroke(); ctx.fillStyle = "#e0b43a"; circle(x - 27 * s, y - 45 * s, 5 * s, "#e0b43a"); circle(x - 27 * s, y - 45 * s, 3 * s, "#2a6a4a"); ctx.restore(); }
function motorbike(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const wx of [-34, 34]) { circle(wx, -14, 16, "#1b1424"); circle(wx, -14, 7, "#9aa3ab"); } ctx.fillStyle = "#1b1424"; ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(-10, -36); ctx.lineTo(20, -36); ctx.lineTo(36, -18); ctx.lineTo(0, -16); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-8, -33); ctx.lineTo(18, -33); ctx.lineTo(30, -20); ctx.fill(); ctx.strokeStyle = "#555"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(22, -34); ctx.lineTo(30, -50); ctx.lineTo(40, -50); ctx.stroke(); ctx.restore(); }
function sash(x, y, s) { ctx.save(); ctx.translate(x, y - 58 * s); ctx.rotate(-0.55); ctx.scale(s, s); ctx.fillStyle = "#e5262b"; ctx.fillRect(-30, -6, 60, 12); ctx.fillStyle = "#ffd23a"; ctx.font = "6.5px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("PRÄSIDENT", 0, 1); ctx.restore(); }
function chefHat(x, hy, s) { ctx.save(); ctx.translate(x, hy - 30 * s); ctx.scale(s, s); ctx.fillStyle = "#1b1424"; rr(-17, -6, 34, 12, 3); ctx.fill(); circle(-10, -14, 11, "#1b1424"); circle(10, -14, 11, "#1b1424"); circle(0, -20, 12, "#1b1424"); ctx.fillStyle = "#fff"; rr(-15, -4, 30, 9, 3); ctx.fill(); circle(-10, -14, 9, "#fff"); circle(10, -14, 9, "#fff"); circle(0, -20, 10, "#fff"); ctx.restore(); }
function hut(x, y, s, t) { // Dönerhütte im Eis
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#eef5fb"; ctx.beginPath(); ctx.ellipse(0, 0, 130, 120, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = "#b9cde0"; ctx.lineWidth = 3; for (const k of [0.33, 0.66]) { ctx.beginPath(); ctx.ellipse(0, 0, 130, 120 * k, 0, Math.PI, 0); ctx.stroke(); }
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 35, -10 - (3 - Math.abs(i)) * 12); ctx.lineTo(i * 35, -40 - (3 - Math.abs(i)) * 14); ctx.stroke(); }
  ctx.fillStyle = "#2c3440"; ctx.beginPath(); ctx.ellipse(0, 0, 44, 62, 0, Math.PI, 0); ctx.fill();
  glow(0, -30, 70, "255,190,80", 0.5); ctx.fillStyle = "#ffcf7a"; ctx.beginPath(); ctx.ellipse(0, 0, 36, 54, 0, Math.PI, 0); ctx.fill();
  donerSpit5(0, -20, 0.55);
  // Schild
  ctx.fillStyle = "#3a2a1a"; rr(-112, -168, 224, 46, 8); ctx.fill(); ctx.fillStyle = "#ffd23a"; rr(-108, -164, 216, 38, 6); ctx.fill();
  ctx.fillStyle = "#14223a"; ctx.font = "19px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🥙 DÖNER · CHEF: TIM", 0, -144);
  ctx.restore();
}
function donerSpit5(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#777"; ctx.fillRect(-2, -60, 4, 110); ctx.fillStyle = "#b5652d"; ctx.beginPath(); ctx.moveTo(-23, -41); ctx.lineTo(23, -41); ctx.lineTo(16, 37); ctx.lineTo(-16, 37); ctx.fill(); ctx.strokeStyle = "#7a3a16"; ctx.lineWidth = 3; for (let i = -30; i < 36; i += 12) { ctx.beginPath(); ctx.moveTo(-20, i); ctx.lineTo(20, i + 4); ctx.stroke(); } ctx.restore(); }
function smallSign(x, y, txt, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#6b6f78"; ctx.fillRect(-2, -60, 4, 60); ctx.fillStyle = "#3a2a1a"; rr(-62, -84, 124, 28, 5); ctx.fill(); ctx.fillStyle = "#f6ecd4"; rr(-59, -81, 118, 22, 4); ctx.fill(); ctx.fillStyle = "#2a2a2a"; ctx.font = "900 10px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, -69); ctx.restore(); }
function flag2(x, y, k, t) { // „ROTANIEN 2.0“, k = gehisst 0..1
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -300, 6, 300); circle(0, -304, 9, "#ffd23a");
  const fy = lerp(-90, -290, easeOut(k)), wv = Math.sin(t * 5) * 6;
  ctx.fillStyle = "#4a2b9a"; ctx.beginPath(); ctx.moveTo(3, fy); ctx.bezierCurveTo(60, fy + wv, 110, fy - wv, 160, fy); ctx.lineTo(160, fy + 90); ctx.bezierCurveTo(110, fy + 90 - wv, 60, fy + 90 + wv, 3, fy + 90); ctx.fill();
  circle(40, fy + 45, 22, "#e2552e"); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(40, fy + 45, 34, 9, -0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "17px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ROTANIEN", 112, fy + 34); ctx.fillStyle = "#ffd23a"; ctx.font = "26px Comic"; ctx.fillText("2.0", 112, fy + 60);
  ctx.restore();
}
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

// ------------------------------------------------------------ Welt-Aufbau
const CRASH = { x: 300, y: 705, s: 1.45, rot: 0.32 };
// Gruppe (Füße), Reihenfolge = Ausstieg aus der Luke
const CREW = [
  { id: "ognani", x: 110, y: 772, acc: "#3fd3f2" }, { id: "noam", x: 190, y: 784, acc: "#ff79c6" }, { id: "phillip", x: 262, y: 806, acc: "#ffb43a" },
  { id: "delon", x: 345, y: 792, acc: "#ff4b6e" }, { id: "tick", x: 418, y: 806, acc: "#ffd23a" }, { id: "tim", x: 486, y: 784, acc: "#7bf27a" }, { id: "elias", x: 558, y: 772, acc: "#b06bff" },
];
const NAMES = { ognani: "OGnani", noam: "Noam", delon: "DELON", tim: "Tim" };
const HIDE = { x: 228, y: 712 };    // hinter der Rakete
function crewPos(c, i, t) {
  const hx = CRASH.x - 20, hy = CRASH.y - 10;
  const out = ramp(t, T.hatch + 0.1 + i * 0.1, T.hatch + 0.6 + i * 0.1);
  let x = lerp(hx, c.x, easeOut(out)), y = lerp(hy, c.y, easeOut(out));
  if (t < T.hatch) return null;
  const hideT = T.rehook + 0.25 + i * 0.05;
  const stays = c.id === "delon";
  const timBack = c.id === "tim" && t >= T.twist + 0.3;
  if (t >= hideT && !stays && !(t >= T.hut)) { const k = easeIO(ramp(t, hideT, hideT + 0.45)); const bk = timBack ? easeIO(ramp(t, T.twist + 0.3, T.twist + 0.8)) : 0;
    x = lerp(lerp(c.x, HIDE.x + (i - 3) * 14, k), 470, bk); y = lerp(lerp(c.y, HIDE.y, k), 780, bk); }
  if (t >= T.hut) { x = c.x; y = c.y; if (c.id === "tim") { x = -150; y = 792; } }
  return [x, y];
}
function drawCrewMember(c, i, t) {
  const p = crewPos(c, i, t); if (!p) return;
  let [x, y] = p; const cold = t < T.horizon + 0.5 ? 1 : 0.3;
  x += Math.sin(t * 55 + i) * 1.4 * cold;
  const o = { t: t + i * 0.7, acc: c.acc };
  let f = t < T.horizon ? (i % 2 ? "shock" : "talk") : t < T.rehook ? "shock" : t < T.doner + 0.4 ? "shock" : "happy";
  const hidden = t >= T.rehook + 0.4 && t < T.hut && c.id !== "delon" && !(c.id === "tim" && t >= T.twist + 0.3);
  if (hidden) f = "shock";
  if (t >= T.og && t < T.decide) { f = "shock"; o.armL = 0.25; o.armR = -0.25; }
  const sc = hidden ? 0.75 : 0.85;
  if (t >= T.hatch && t < T.rehook && !hidden) BREATH.push([x, y - 110 * sc, i]);
  if (c.id === "noam" && t >= T.noam && t < T.rehook) o.armR = -2.6;
  if (c.id === "delon" && t >= T.delon && t < T.doner + 0.3) o.armR = -1.4;
  if (c.id === "tim" && (t >= T.twist + 0.3)) o.armR = -2.5;
  if (c.id === "phillip") o.armL = -0.9, o.armR = 0.9;
  astronaut(x, y, sc, f, o);
  const hy = y - 104 * sc;
  if (c.id === "elias") pizzaHat(x, hy, sc);
  if (c.id === "phillip") orangeCat(x - 2, y - 52 * sc, sc * 0.9, t);
  if (c.id === "tick") glassesRolex(x, hy, y, sc);
  if (c.id === "noam") iphone(x + 30 * sc, y - (t >= T.noam && t < T.rehook ? 150 : 50) * sc, sc * (t >= T.noam && t < T.rehook ? 1.1 : 0.7), t, true);
  if (c.id === "ognani") tablet(x + 30 * sc, y - 60 * sc, 0.45 * sc);
  if (c.id === "delon") { const ch = t >= T.delon ? ramp(t, T.delon + 0.2, T.twist - 0.2) : 0; const low = t >= T.doner ? easeOut(ramp(t, T.doner, T.doner + 0.4)) : 0;
    laserPistol(x + 26 * sc, y - lerp(118, 60, low) * sc, sc * 1.1, ch * (1 - low), t); }
  if (c.id === "tim") { doner(x + 26 * sc, y - (t >= T.twist + 0.3 && t < T.hut ? 150 : 50) * sc, sc * 1.2); if (t >= T.hut) chefHat(x, hy, sc); }
}
const KEANU = { x: -560, y: 652 };
const SNOW = (() => { const r = rng(71), a = []; for (let i = 0; i < 90; i++) a.push([r() * 700 - 60, r() * 500, 1.5 + r() * 3.5, r() * 6]); return a; })();
function creaturePos(t) {
  if (t < T.horizon) return null;
  if (t < T.rehook) return { x: 720, y: 1000, eyes: ramp(t, T.eyes, T.eyes + 0.15), s: 1.15, shadow: true };
  if (t < T.twist) return { x: 700, y: lerp(1000, 640, easeOut(ramp(t, T.rehook, T.rehook + 0.7))), s: 1.15, roar: t < T.rehook + 1.2 };
  if (t < T.hut) return { x: lerp(700, 640, easeIO(ramp(t, T.twist, T.twist + 0.5))), y: lerp(640, 720, easeIO(ramp(t, T.twist, T.twist + 0.5))), s: 1.1, sniff: t >= T.sniff - 0.3 && t < T.doner, point: easeOut(ramp(t, T.doner, T.doner + 0.35)), look: -1 };
  return { x: 15, y: 790, s: 0.5, sit: true, munch: true, happy: true };
}

const CAM = [
  [T.impact, 300, 640, 1.25], [T.vote, 300, 650, 1.35], [T.tablet - 0.01, 300, 650, 1.38],
  [T.hatch, 320, 660, 1.3], [T.noam - 0.12, 320, 660, 1.34], [T.noam + 0.08, 200, 700, 2.1], [T.horizon - 0.12, 200, 700, 2.15],
  [T.horizon + 0.1, 680, 560, 0.95], [T.rehook - 0.12, 690, 560, 1.25], [T.rehook + 0.06, 470, 560, 0.72], [T.delon - 0.12, 460, 560, 0.75],
  [T.delon + 0.08, 345, 700, 2.0], [T.twist - 0.12, 345, 700, 2.15], [T.twist + 0.08, 520, 590, 0.82], [T.doner - 0.12, 520, 590, 0.86],
  [T.doner + 0.15, 480, 640, 1.15], [T.hut - 0.12, 480, 640, 1.2], [T.hut + 0.08, -185, 655, 1.18], [T.cta - 0.12, -180, 655, 1.22],
  [T.cta + 0.6, 120, 560, 0.55], [T.og - 0.12, 140, 560, 0.52], [T.og + 0.08, 400, 670, 1.25], [T.decide, 400, 670, 1.3],
  [T.loop, 480, 660, 2.0], [DUR, 480, 650, 2.4],
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
const MASS6 = (() => { const r = rng(88), a = [], keys = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#ff8a2a", "#ff79c6"]; for (let i = 0; i < 260; i++) { const y = 610 + Math.pow(r(), 1.3) * 90, x = -700 + r() * 1700; if (y > 650 && x > -360 && x < 640) continue; a.push({ x, y, s: 0.22 + (y - 600) / 110 * 0.32, acc: keys[i % 7], ph: r() * 6 }); } return a.sort((p, q) => p.y - q.y); })();

const BREATH = [];
function drawWorld(t, z) {
  BREATH.length = 0;
  plutoSky(t); plutoGround();
  const cr = creaturePos(t);
  // Wesen hinter dem Hügel
  if (cr && t < T.twist) { ctx.save(); ctx.beginPath(); ctx.rect(-3000, -3000, 7000, 3642); ctx.clip(); if (cr.shadow) { creature(cr.x, lerp(880, 790, ramp(t, T.horizon, T.rehook)), 1.15, t, { eyes: cr.eyes, dark: true }); } else creature(cr.x, cr.y, cr.s, t, { roar: cr.roar }); ctx.restore(); }
  iceHill(720, 640, 260, 150); iceHill(-520, 630, 220, 110);
  for (const [x, y, r] of [[560, 700, 26], [-150, 690, 20], [40, 720, 16], [820, 720, 30]]) iceRock(x, y, r);
  if (t >= T.cta) for (const m of MASS6) { const sp = SPR[m.acc]; if (!sp) continue; const w = 88 * m.s, h = 158 * m.s; ctx.drawImage(sp, m.x - w / 2, m.y - h - Math.abs(Math.sin(t * 6 + m.ph)) * 4, w, h); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  // keanu: riesiger blauer Astronaut im Hintergrund
  if (t >= T.hatch) astronaut(KEANU.x, KEANU.y, 1.6, t < T.rehook ? "shock" : t < T.hut ? "shock" : "happy", { t, acc: "#1f4fd6", suit: "#4a7bff", suit2: "#5f8cff", suit3: "#3a62d0" });
  hut(-250, 712, 1, t); smallSign(-95, 742, "🍎 APPLE STORE (BALD)", 0.8);
  if (t >= T.cta) flag2(70, 705, ramp(t, T.cta + 0.2, T.follow), t);
  // versteckte Crew hinter der Rakete
  for (const [i, c] of CREW.entries()) { const p = crewPos(c, i, t); if (p && t >= T.rehook + 0.4 && t < T.hut && c.id !== "delon" && !(c.id === "tim" && t >= T.twist + 0.3)) drawCrewMember(c, i, t); }
  // abgestürzte Rakete
  ctx.save(); ctx.translate(CRASH.x, CRASH.y); ctx.rotate(CRASH.rot); rocket(0, 0, CRASH.s, 0);
  ctx.fillStyle = "#ffcf1a"; rr(-26, -175, 26, 10, 3); ctx.fill(); ctx.fillStyle = "#1b1424"; ctx.font = "7px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("LAMBO", -13, -170);   // Lolel
  const open = ramp(t, T.hatch, T.hatch + 0.25);
  ctx.fillStyle = "#2a2230"; rr(-18, -78, 36, 64, 6); ctx.fill(); if (open < 1) { ctx.fillStyle = "#e9edf0"; rr(-18, -78, 36, 64 * (1 - open), 6); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = "#e6eef6"; ctx.beginPath(); ctx.ellipse(CRASH.x - 10, CRASH.y + 4, 120, 22, 0, 0, Math.PI); ctx.fill();   // Eiswall
  motorbike(150, 748, 0.9);                                                                    // Taylor_
  // Wesen vor dem Hügel (Wendung) / sitzend vor der Hütte
  if (cr && t >= T.twist) creature(cr.x, cr.y, cr.s, t, cr);
  // Janic, der Präsident (an der Hütte)
  if (t >= T.hut) { astronaut(-385, 775, 0.85, "happy", { t, acc: "#ffd23a", armR: -2.4 }); sash(-385, 775, 0.85); doner(-355, 775 - 118 * 0.85, 1); }
  // Crew vorne
  for (const [i, c] of CREW.entries()) { if (t >= T.rehook + 0.4 && t < T.hut && c.id !== "delon" && !(c.id === "tim" && t >= T.twist + 0.3)) continue; drawCrewMember(c, i, t); }
  // Lichtantrieb + OGnani schiebt
  if (t >= T.og) { const k = easeOut(ramp(t, T.og, T.og + 1.0)); const mx = lerp(860, 470, k); lightDrive(mx, 790, 1 + (t >= T.weiter && t < T.decide ? 0.06 * Math.max(0, Math.sin((t - T.weiter) * 9)) : 0), t, t >= T.loop); astronaut(mx + 115, 792, 0.85, "happy", { t, acc: "#3fd3f2", armL: 1.6, armR: 1.4 }); tablet(mx + 145, 735, 0.35); }
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  for (const [bx, by, ph] of BREATH) breath(bx, by, t, ph * 0.37);
  shock(CRASH.x, CRASH.y, t, T.impact, 320); iceShards(CRASH.x, CRASH.y - 30, t, T.impact);
  if (t >= T.impact) { ctx.save(); ctx.strokeStyle = "rgba(90,130,175,0.7)"; ctx.lineWidth = 3; const r = rng(4); for (let i = 0; i < 7; i++) { const k = easeOut(ramp(t, T.impact, T.impact + 0.3)); let a = Math.PI * (0.05 + 0.9 * r()), px = CRASH.x, py = CRASH.y + 8; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { a += (r() - 0.5) * 0.6; px += Math.cos(a) * 40 * k; py += Math.sin(a) * 8 * k + 4; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
  if (t >= T.rehook && t < T.rehook + 1.5) for (let i = 0; i < 8; i++) { const k = ramp(t, T.rehook + 0.3 + i * 0.05, T.rehook + 1.4); if (k <= 0 || k >= 1) continue; ctx.globalAlpha = 0.7 * (1 - k); circle(560 + i * 45, 520 - k * 60 + (i % 2) * 20, 18 + 40 * k, "#eef5fb"); ctx.globalAlpha = 1; }
  if (t >= T.rehook + 0.4 && t < T.delon) for (const [i, c] of CREW.entries()) { if (c.id === "delon") continue; exclaim(HIDE.x + (i - 3) * 14, HIDE.y - 120, pop(t, T.rehook + 0.45 + i * 0.04, T.delon - 0.1, 0.2)); }
  if (cr && t >= T.sniff - 0.3 && t < T.doner) { ctx.save(); ctx.translate(cr.x - 190, cr.y - 470); const s2 = pop(t, T.sniff - 0.2, T.doner - 0.05); ctx.scale(s2, s2); outlined("?", 0, 0, 70, "#fff", "#0e1a30", 10); ctx.restore(); }
  if (cr && t >= T.hut && t < T.decide) hearts(cr.x - 50, cr.y - 150, t);
  if (t >= T.og && t < T.decide) { const k = easeOut(ramp(t, T.og, T.og + 1.0)); arcs(lerp(860, 470, k), 670, 70, t); }
  if (t >= T.loop) { arcs(470, 670, 90, t, "255,120,90"); for (let i = 0; i < 4; i++) sparks(470, 640, t, T.loop + i * 0.2, 12, i % 2 ? "#ffd23a" : "#ff6a3d"); for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); ctx.globalAlpha = 0.5 * (1 - k); circle(470 + Math.sin(t + i) * 15, 600 - k * 160, 15 + 30 * k, "#3a3f4e"); ctx.globalAlpha = 1; } }
  if (t >= T.cta) for (let i = 0; i < 10; i++) { const t0 = T.cta + 0.2 + (T.follow - T.cta - 0.2) * i / 9, d = t - t0; if (d < 0 || d > 0.8) continue; const r = rng(i + 3); ctx.save(); ctx.globalAlpha = 1 - d / 0.8; ctx.translate(-500 + r() * 1400, 560 - d * 60); outlined("+1", 0, 0, 34, "#7bf27a", "#0e1a30", 7); ctx.restore(); }
  // Aufprall: Eisstaub
  if (t >= T.impact && t < T.hatch) { const d = t - T.impact; glow(CRASH.x, CRASH.y - 40, 260 * Math.min(1, d * 4), "230,240,255", 0.7 * (1 - clamp(d / 1.2)));
    for (const [x0, y0, r, p] of SNOW) { ctx.globalAlpha = 0.8 * (1 - clamp((d - 1.5) / 1)); circle(x0 + Math.sin(t + p) * 10, 380 + y0 * 0.6 + d * 40 - 200 * Math.exp(-d * 3), r, "#f4f9ff"); } ctx.globalAlpha = 1; }
  if (t >= T.impact && t < T.hatch) for (let i = 0; i < 3; i++) { const k = ((t * 0.4 + i / 3) % 1); ctx.globalAlpha = 0.4 * (1 - k); circle(CRASH.x + 60 + Math.sin(t + i) * 20, CRASH.y - 220 - k * 200, 20 + 40 * k, "#556070"); ctx.globalAlpha = 1; }
  // Ladestrahl um Delons Pistole
  if (t >= T.hut) { for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1); ctx.globalAlpha = 0.35 * (1 - k); circle(-250 + Math.sin(t + i) * 10, 560 - k * 140, 12 + 22 * k, "#cfd6dc"); ctx.globalAlpha = 1; } }
}

// ------------------------------------------------------------ Cockpit (Frame 1) + Absturz + Kabine + Entscheidung
function drawCockpit(t) {
  ctx.fillStyle = "#05060c"; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) circle(((x + 900 - t * 300) % 1300 + 1300) % 1300 - 300, (y + 700) * 0.95, r, "#fff");
  const k = Math.pow(ramp(t, 0, T.fall + 0.2), 1.6); plutoPlanet(288 + 30 * k, 420 + 40 * k, 60 + 360 * k, t);
  // Alien-Schiff aus Tag 5 dreht im Seitenfenster ab
  // Cockpit-Rahmen
  ctx.fillStyle = "#2b2f3c"; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(60, 600); ctx.quadraticCurveTo(40, 250, 140, 150); ctx.lineTo(436, 150); ctx.quadraticCurveTo(536, 250, 516, 600); ctx.closePath(); ctx.fill("evenodd");
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(60, 600); ctx.quadraticCurveTo(40, 250, 140, 150); ctx.lineTo(436, 150); ctx.quadraticCurveTo(536, 250, 516, 600); ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = "#3d4354"; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(288, 150); ctx.lineTo(288, 600); ctx.stroke();
  // Seitenfenster mit Ufo
  circle(36, 330, 34, "#1b1424"); circle(36, 330, 28, "#0b0d18"); ctx.save(); ctx.beginPath(); ctx.arc(36, 330, 28, 0, Math.PI * 2); ctx.clip(); const u = ramp(t, 0, 1.2); ufo(36 - 40 * u, 330 - 20 * u, 0.6 * (1 - 0.6 * u), t, 2); ctx.restore();
  // Armaturenbrett
  ctx.fillStyle = "#3a3f4e"; ctx.beginPath(); ctx.moveTo(0, 620); ctx.quadraticCurveTo(288, 560, 576, 620); ctx.lineTo(576, 1024); ctx.lineTo(0, 1024); ctx.fill();
  for (let i = 0; i < 8; i++) { const on = (Math.floor(t * 8) + i) % 3 === 0; circle(60 + i * 32, 660, 7, on ? "#ff3b3b" : "#5a2020"); }
  // Tankanzeige
  const fuel = t < 0.12 ? 1 : 0;
  ctx.fillStyle = "#14161e"; rr(330, 690, 170, 70, 10); ctx.fill(); ctx.fillStyle = fuel ? "#ffb43a" : (Math.sin(t * 16) > 0 ? "#ff4040" : "#7a1a1a"); ctx.font = "34px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("⛽ " + fuel + " %", 415, 727);
  // Piloten von hinten
  for (const [px, s] of [[150, 1.25], [430, 1.1]]) { circle(px, 960, 92 * s, "#1b1424"); circle(px, 960, 88 * s, "#e7eaee"); circle(px - 25 * s, 930, 18 * s, "rgba(255,255,255,0.6)"); ctx.strokeStyle = "#c9ced4"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px + 30 * s, 880); ctx.lineTo(px + 40 * s, 840); ctx.stroke(); circle(px + 40 * s, 838, 6, "#ff4b3a"); }
  // rotes Alarmlicht
  const p = 0.5 + 0.5 * Math.sin(t * 14); ctx.fillStyle = `rgba(255,20,20,${0.08 + 0.14 * p})`; ctx.fillRect(0, 0, W, H);
}
const SPARKS = (() => { const r = rng(13), a = []; for (let i = 0; i < 40; i++) a.push([r() - 0.5, r() - 0.5, r()]); return a; })();
function drawFall(t) {
  ctx.fillStyle = "#05060c"; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) circle(((x + 900 + t * 200) % 1300 + 1300) % 1300 - 300, (y + 700) * 0.95 - t * 80, r, "#fff");
  const k = ramp(t, T.fall, T.impact);
  plutoPlanet(330, 1000 - 120 * k, 420 + 220 * k, t);
  const rx = lerp(120, 300, k), ry = lerp(260, 640, easeIO(k)), sc = lerp(0.7, 1.05, k);
  // Feuerschweif
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(2.45);
  for (const [c, w, l] of [["rgba(255,80,30,0.8)", 40, 320], ["rgba(255,170,40,0.9)", 26, 230], ["rgba(255,240,180,0.95)", 12, 140]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-w * sc, -150 * sc); ctx.quadraticCurveTo(0, -(150 + l + 30 * Math.sin(t * 40)) * sc, w * sc, -150 * sc); ctx.fill(); }
  ctx.rotate(Math.PI); rocket(0, 90 * sc, sc, 0); ctx.restore();
  for (const [dx, dy, ph] of SPARKS) { const d = ((t * 1.5 + ph) % 1); const sx = rx + dx * 500 * d, sy = ry + dy * 500 * d - 60 * d; circle(sx, sy, 1 + 7 * d, d < 0.5 ? "#ffd23a" : "#ff8a1e"); }
  ctx.fillStyle = "rgba(255,40,20,0.12)"; ctx.fillRect(0, 0, W, H);
}
function drawCabin(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#3a3550"); g.addColorStop(1, "#5c566e"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const px of [90, 300, 510]) { circle(px, 240, 62, "#2b2740"); circle(px, 240, 52, "#c8d6e6"); ctx.save(); ctx.beginPath(); ctx.arc(px, 240, 52, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "#05060c"; ctx.fillRect(px - 60, 180, 120, 120); for (let j = 0; j < 5; j++) circle(px - 35 + j * 17, 205 + (j * 13) % 25, 1.5, "#fff"); ctx.fillStyle = "#b9cde0"; ctx.beginPath(); ctx.moveTo(px - 60, 262); ctx.quadraticCurveTo(px - 10, 238, px + 60, 258); ctx.lineTo(px + 60, 300); ctx.lineTo(px - 60, 300); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = "#4a4560"; ctx.fillRect(0, 700, W, 400);
  const p = 0.5 + 0.5 * Math.sin(t * 10); circle(288, 140, 16, p > 0.5 ? "#ff3b3b" : "#7a1a1a");
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  const look = t >= T.tablet + 0.5;
  astronaut(95, 780, 2.0, look ? "shock" : "think", { t, acc: "#ff79c6" });
  astronaut(480, 780, 2.0, look ? "smirk" : "think", { t: t + 1, acc: "#7bf27a" });
  const up = easeOut(ramp(t, T.tablet, T.tablet + 0.3));
  astronaut(288, 820, 2.3, "talk", { t, acc: "#3fd3f2", armL: lerp(0.25, 2.2, up), armR: lerp(-0.25, -2.2, up) });
  ctx = MAIN; compositeOutline(6);
  tablet(288, lerp(700, 470, up), 1.75);
  const [nx, ny] = [288, 300]; pill("OGnani", nx, ny + 12, pop(t, T.tablet + 0.35, T.hatch - 0.1), "#fff", "#14223a");
}
function pollCard(t, s) { // TikTok-Umfrage zum Abstimmen (noch ohne Ergebnis)
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(SX, 545); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1e1e22"; rr(-210, -100, 420, 200, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-172, -64, 20, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -192, -84, 40, 40); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "800 15px InterX"; ctx.fillText("Gedacht ·", -140, -76); ctx.fillStyle = "#5aa7e6"; ctx.fillText("Creator*in", -64, -76);
  ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("Bleiben oder weiterfliegen? 🪐", -140, -50);
  for (const [i, txt] of ["🥙 Auf Pluto bleiben", "🚀 Besseren Planeten suchen"].entries()) {
    const y = -22 + i * 50; ctx.fillStyle = "#2a2a30"; rr(-188, y, 376, 42, 12); ctx.fill(); ctx.strokeStyle = "#45454d"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "800 17px InterX, 'Noto Color Emoji'"; ctx.fillText(txt, -172, y + 22);
  }
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("🗳 Umfrage · Die Mehrheit entscheidet Tag 7", -188, 86);
  // tippender Finger
  const k = (t - T.vote2) % 1.2, fy = k < 0.25 ? -k * 20 : 0; ctx.font = "34px 'Noto Color Emoji'"; ctx.fillText("👆", 120 + Math.sin(t * 3) * 4, 48 + fy + 14 * Math.max(0, Math.sin(t * 5)));
  ctx.restore();
}
function drawSplit(t) {
  const beat = 1 + 0.03 * Math.max(0, Math.sin(t * 2 * Math.PI * 1.1)) ** 8;
  // links: Pluto bleiben
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 288, H); ctx.clip();
  ctx.fillStyle = "#05060c"; ctx.fillRect(0, 0, 288, H); for (const [x, y, r] of STARS) circle(((x + 900) % 600), (y + 700) * 0.95, r, "#fff");
  plutoPlanet(70, 420, 60, t);
  const g = ctx.createLinearGradient(0, 600, 0, H); g.addColorStop(0, "#c4d3e4"); g.addColorStop(1, "#eef4fa"); ctx.fillStyle = g; ctx.fillRect(0, 600, 288, H);
  ctx.save(); ctx.translate(120, 860); ctx.scale(0.8 * beat, 0.8 * beat); hut(0, 0, 1, t); ctx.restore();
  creature(232, 880, 0.42, t, { sit: true, munch: true, happy: true });
  ctx.restore();
  // rechts: Kepler-452b
  ctx.save(); ctx.beginPath(); ctx.rect(288, 0, 288, H); ctx.clip();
  ctx.fillStyle = "#070a14"; ctx.fillRect(288, 0, 288, H); for (const [x, y, r, p] of STARS) circle(288 + ((x + 900 + t * 30) % 600), (y + 700) * 0.95, r, "#fff");
  const R = 150 * beat; glow(430, 680, R * 1.5, "120,255,150", 0.35); circle(430, 680, R + 4, "#1b1424"); circle(430, 680, R, "#3fbf5a");
  ctx.save(); ctx.beginPath(); ctx.arc(430, 680, R, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "#2e86de"; for (const [dx, dy, rx, ry] of [[-60, -40, 50, 30], [50, 50, 60, 35], [-20, 90, 40, 20]]) { ctx.beginPath(); ctx.ellipse(430 + dx, 680 + dy, rx, ry, 0.4, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.ellipse(410, 590, 60, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(0,0,30,0.3)"; ctx.beginPath(); ctx.arc(470, 720, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(370 + Math.sin(t * 2) * 6, 600); ctx.rotate(0.6); rocket(0, 0, 0.42, 1.2); ctx.restore();
  ctx.restore();
  if (t >= T.stay && t < T.vote2) { ctx.fillStyle = "rgba(0,0,0,0.45)"; if (t < T.go) ctx.fillRect(288, 0, 288, H); else ctx.fillRect(0, 0, 288, H); }
  if (t >= T.vote2) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0, 0, W, H); }
  // Trennlinie (Blitz)
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(288, 0); for (let y = 0; y <= H; y += 60) ctx.lineTo(288 + (y / 60 % 2 ? 10 : -10), y); ctx.stroke();
  // Badges (innerhalb der sicheren Zone)
  const a = pop(t, T.decide + 0.15, T.vote2 - 0.05);
  for (const [i, [x, l1, l2, col]] of [[140, "🥙 BLEIBEN", "AUF PLUTO", "#ffd23a"], [398, "🚀 WEITER", "BESSERER PLANET", "#3fd3f2"]].entries()) {
    if (a <= 0) continue; const hi = i === 0 ? (t >= T.stay && t < T.go ? 1 : 0) : (t >= T.go ? 1 : 0);
    ctx.save(); ctx.translate(x, 470); const sc = a * beat * (1 + 0.18 * hi); ctx.scale(sc, sc); ctx.globalAlpha = (t >= T.stay && !hi) ? 0.55 : 1;
    ctx.fillStyle = "#14223a"; rr(-82, -34, 164, 68, 14); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = col; ctx.font = "24px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(l1, 0, -10); ctx.fillStyle = "#fff"; ctx.font = "13px Comic"; ctx.fillText(l2, 0, 18);
    ctx.restore();
  }
}

// ------------------------------------------------------------ Zusatz-Effekte
const FLAKES = (() => { const r = rng(33), a = []; for (let i = 0; i < 70; i++) a.push([r() * W, r() * H, 1 + r() * 2.4, 20 + r() * 40, r() * 6]); return a; })();
function snowfall(t, a = 1) { ctx.save(); for (const [x0, y0, rad, sp, p] of FLAKES) { const y = (y0 + t * sp) % H, x = (x0 + Math.sin(t * 0.8 + p) * 18 + W) % W; ctx.globalAlpha = a * (0.45 + 0.3 * Math.sin(t * 2 + p)); circle(x, y, rad, "#f4f9ff"); } ctx.restore(); }
function breath(x, y, t, ph) { for (let i = 0; i < 2; i++) { const k = ((t * 0.9 + ph + i * 0.5) % 1); ctx.globalAlpha = 0.45 * (1 - k); circle(x + 10 + k * 22, y - k * 26, 5 + 12 * k, "#ffffff"); } ctx.globalAlpha = 1; }
function hearts(x, y, t) { ctx.save(); ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; for (let i = 0; i < 3; i++) { const k = ((t * 0.7 + i / 3) % 1); ctx.globalAlpha = 1 - k; ctx.fillText("❤️", x + Math.sin(t * 3 + i * 2) * 14, y - k * 70); } ctx.restore(); }
function arcs(x, y, r, t, col = "160,240,255") { ctx.save(); const rr_ = rng(Math.floor(t * 24)); ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) { let a = rr_() * Math.PI * 2, px = x + Math.cos(a) * r * 0.4, py = y + Math.sin(a) * r * 0.4; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 4; j++) { a += (rr_() - 0.5) * 1.4; px += Math.cos(a) * r * 0.3; py += Math.sin(a) * r * 0.3; ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); }
function sparks(x, y, t, t0, n = 14, col = "#ffd23a") { const d = t - t0; if (d < 0 || d > 0.8) return; const r = rng(Math.round(t0 * 100)); for (let i = 0; i < n; i++) { const a = -Math.PI * r(), v = 80 + r() * 160; circle(x + Math.cos(a) * v * d, y + Math.sin(a) * v * d + 160 * d * d, 2.5 * (1 - d), col); } }
function shock(x, y, t, t0, R = 260) { const d = t - t0; if (d < 0 || d > 0.6) return; ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - d / 0.6)})`; ctx.lineWidth = 10 * (1 - d / 0.6); ctx.beginPath(); ctx.ellipse(x, y, R * easeOut(d / 0.6), R * 0.3 * easeOut(d / 0.6), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
const SHARDS6 = (() => { const r = rng(8), a = []; for (let i = 0; i < 26; i++) a.push([(r() - 0.5) * 2, -r(), 6 + r() * 10, r() * 6]); return a; })();
function iceShards(x, y, t, t0) { const d = t - t0; if (d < 0 || d > 1.2) return; for (const [vx, vy, s, rot] of SHARDS6) { ctx.save(); ctx.translate(x + vx * 300 * d, y + vy * 420 * d + 380 * d * d); ctx.rotate(rot + d * 8); ctx.globalAlpha = 1 - d / 1.2; ctx.fillStyle = "#e6f6ff"; ctx.strokeStyle = "#7fb0dc"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-s, s * 0.5); ctx.lineTo(0, -s); ctx.lineTo(s, s * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } }
function exclaim(x, y, s) { if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); outlined("!", 0, 0, 52, RED, "#0e1a30", 9); ctx.restore(); }
// ------------------------------------------------------------ Effekte
const IMPACTS = [0, T.impact, T.rehook + 0.7, T.og + 1.0];
function shakeAt(t) {
  let dx = 0, dy = 0;
  if (t < T.impact) { const a = t < T.fall ? 6 : 4; dx += Math.sin(t * 61) * a; dy += Math.cos(t * 53) * a; }
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.5) continue; const big = t0 === T.impact ? 3 : 1.4; const a = 7 * big * Math.exp(-d * 9); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  if (t >= T.rehook && t < T.rehook + 1.2) { dx += Math.sin(t * 45) * 2.5; dy += Math.cos(t * 39) * 2.5; }
  return [dx, dy];
}
const CUTS = [...CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05), T.fall, T.tablet, T.hatch, T.decide];
function flash(t) {
  let a = 0, red = 0;
  for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.25 * (1 - d / 0.14)); }
  { const d = t - T.impact; if (d >= 0 && d < 0.4) a = Math.max(a, 1 - d / 0.4); }
  if (t < 0.2) red = 0.5 * (1 - t / 0.2);
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
  if (red > 0) { ctx.fillStyle = `rgba(255,30,30,${red})`; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  const sc = scene(t);
  if (sc === "cockpit") drawCockpit(t);
  else if (sc === "fall") drawFall(t);
  else if (sc === "cabin") drawCabin(t);
  else if (sc === "split") drawSplit(t);
  else {
    let [cx, cy, z] = cam(t); cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    drawWorld(t, z);
    ctx.restore();
    if (t >= T.horizon && t < T.twist) { ctx.fillStyle = "rgba(10,10,40,0.35)"; ctx.fillRect(0, 0, W, H); }       // unheimlich dunkel
    snowfall(t, t >= T.impact && t < T.hatch ? 0.4 : 0.8);
    if (t >= T.loop) { const p = 0.5 + 0.5 * Math.sin(t * 20); ctx.fillStyle = `rgba(255,20,20,${0.15 + 0.2 * p})`; ctx.fillRect(0, 0, W, H); }
  }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,10,25,0.5)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sc === "fall") speedLines(t, 1);
  if (sc === "world" && t >= T.rehook && t < T.rehook + 0.9) speedLines(t, 1);
  if (sc === "split" && t >= T.vote2) confetti(t, T.vote2 + 0.05);

  // ---- Einblendungen (sichere Zone)
  tag6Badge();
  if (t < T.fall) { const fuel = t < 0.12 ? 1 : 0; const a = 1 + 0.1 * Math.exp(-(t - 0.12) * 10) * (t >= 0.12 ? 1 : 0); topLabel("⛽ " + fuel + " %", a, fuel ? "#ffb43a" : RED, 175, 64); }
  if (t >= T.fall && t < T.impact) topLabel("🪐 PLUTO", pop(t, T.fall + 0.25, T.impact - 0.05), "#fff", 175, 52);
  topLabel("🗳 EURE WAHL", pop(t, T.vote, T.tablet - 0.08), "#14223a", 160, 30, "#ffd23a");
  topLabel("🌡 −230 °C", pop(t, T.hatch + 0.1, T.horizon - 0.1), "#fff", 160, 46, "#3a7bd5");
  if (t >= T.noam && t < T.horizon) { const [sx, sy] = toScreen(190, 640, t); pill("Noam", Math.min(sx, 430), sy, pop(t, T.noam + 0.15, T.horizon - 0.1), "#fff", "#14223a"); }
  topLabel("👀 NICHT ALLEIN", pop(t, T.eyes, T.rehook - 0.08), RED, 160, 40);
  if (t >= T.fast && t < T.delon) topLabel("😳 FAST ALLE", pop(t, T.fast, T.delon - 0.08), "#fff", 160, 40);
  if (t >= T.delon && t < T.twist) { const [sx, sy] = toScreen(345, 640, t); pill("DELON", Math.min(sx, 430), Math.max(150, sy), pop(t, T.delon + 0.15, T.twist - 0.1), "#fff", "#14223a"); topLabel("⚡ LÄDT …", pop(t, T.delon + 0.5, T.twist - 0.1), CYAN, 160, 36); }
  if (t >= T.twist && t < T.hut) { const [sx, sy] = toScreen(640, 360, t); if (t >= T.sniff && t < T.doner) topLabel("👃 SCHNUPPER …", pop(t, T.sniff, T.doner - 0.05), "#fff", 160, 36); if (t >= T.doner) topLabel("🥙 ?!", pop(t, T.doner, T.hut - 0.08), "#ffd23a", 160, 60); }
  if (t >= T.hut && t < T.cta) { topLabel("🥙 STAMMKUNDE", pop(t, T.stamm, T.cta - 0.08), "#ffd23a", 160, 40); const [jx, jy] = toScreen(-385, 645, t); pill("Janic", Math.max(60, Math.min(jx, 430)), jy, pop(t, T.hut + 0.2, T.cta - 0.1), "#fff", "#14223a"); }
  if (t >= T.cta && t < T.og) {
    confetti(t, T.follow - 0.05);
    const n = Math.round(FOLLOWERS * easeOut(ramp(t, T.cta + 0.2, T.follow)));
    topLabel("👥 BEWOHNER: " + n, pop(t, T.cta + 0.1, T.og - 0.08), "#fff", 150, 38, "#14223a");
    const a = pop(t, T.follow - 0.05, T.og - 0.08) * (1 + 0.04 * Math.sin(t * 8));
    if (a > 0) { ctx.save(); ctx.translate(SX, 240); ctx.rotate(-0.04); ctx.scale(a, a); ctx.fillStyle = "#ffd23a"; rr(-200, -36, 400, 72, 16); ctx.fill(); ctx.strokeStyle = "#14223a"; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = "#14223a"; ctx.font = "36px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("1 FOLLOW = 1 BEWOHNER", 0, 3); ctx.restore(); }
  }
  if (t >= T.og && t < T.decide) { const a = pop(t, T.og + 0.3, T.decide - 0.08); if (a > 0) { ctx.save(); ctx.translate(SX, 165); ctx.scale(a, a); outlined("⚡ LICHTANTRIEB", 0, 0, 44, CYAN, "#0e1a30", 10); outlined("GEBAUT VON OGNANI", 0, 40, 22, "#fff", "#0e1a30", 6); ctx.restore(); }
    const b = pop(t, T.weiter, T.decide - 0.08); if (b > 0) { ctx.save(); ctx.translate(SX, 262); ctx.rotate(-0.04); ctx.scale(b, b); ctx.fillStyle = "#14223a"; rr(-190, -26, 380, 52, 14); ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "26px Comic, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("= WIR KÖNNEN WEITER 🚀", 0, 3); ctx.restore(); } }
  if (t >= T.decide) {
    const a = pop(t, T.decide, 99); ctx.save(); ctx.translate(SX, 160); ctx.scale(a, a); outlined("DIE WICHTIGSTE FRAGE:", 0, -48, 22, "#fff", "#0e1a30", 6); outlined("BLEIBEN ODER", 0, -12, 40, "#fff", "#0e1a30", 10); outlined("WEITERFLIEGEN?", 0, 32, 40, "#ffd23a", "#0e1a30", 10); ctx.restore();
    pollCard(t, pop(t, T.vote2, 99));
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  captions(t);
};
window.exportEvents = function () { return { duration: DUR, T, cuts: CUTS }; };
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
