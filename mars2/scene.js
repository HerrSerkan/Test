// "Tag 2 auf dem Mars: Rotanien" – Fortsetzung, 1:1 nach dem Mond-Video „Tag 2“, angepasst auf @einfach..wissen (1080x1920).
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
  ctx.fillStyle = "#f2f2f0"; rr(-17, -34, 14, 30, 6); ctx.fill(); rr(3, -34, 14, 30, 6); ctx.fill();
  ctx.fillStyle = (o.acc || "#ff8a2a"); rr(-19, -8, 18, 9, 4); ctx.fill(); rr(1, -8, 18, 9, 4); ctx.fill();
  // Rucksack + Körper
  ctx.fillStyle = "#d9dbe0"; rr(-26, -78, 52, 48, 12); ctx.fill();
  ctx.fillStyle = "#f7f7f5"; rr(-22, -76, 44, 46, 14); ctx.fill();
  ctx.fillStyle = (o.acc || "#ff8a2a"); ctx.fillRect(-22, -40, 44, 5);
  ctx.fillStyle = "#2c3a58"; rr(-11, -66, 22, 15, 3); ctx.fill();
  ctx.fillStyle = "#5fd0ff"; for (let i = 0; i < 3; i++) circle(-5 + i * 5, -58.5, 1.8, i === 1 ? "#ffd23a" : "#5fd0ff");
  // Arme
  const armL = o.armL ?? 0.25, armR = wave ? -2.4 + Math.sin(o.t * 14) * 0.45 : (o.armR ?? -0.25);
  for (const [sx, a] of [[-22, armL], [22, armR]]) {
    ctx.save(); ctx.translate(sx, -70); ctx.rotate(a);
    ctx.fillStyle = "#f2f2f0"; rr(-6, -2, 12, 30, 6); ctx.fill(); circle(0, 29, 6.5, (o.acc || "#ff8a2a")); ctx.restore();
  }
  // Helm
  const hy = -104;
  circle(0, hy, 30, "#dfe3e8"); circle(0, hy, 27, "#f8f8f6");
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

// ============================================================ Tag 2 (wird an base.js angehängt -> scene.js)
// Zeitpunkte aus den Wortzeiten (Index = gesprochenes Wort, siehe build/words.json)
const T = {
  rockets: wt(2), sky: wt(9), count0: wt(10), count1: wt(13), card: wt(13) + 0.1, problem: wt(14), nur1: wt(17), fleet: wt(20), drei: wt(23),
  top: wt(24), comment: wt(29), keine: wt(30), law: wt(32), lawWrite: wt(43), confetti: wt(43), safe: wt(50), school: wt(57), launch: wt(60),
  bye: wt(62), n7: wt(64), hat: wt(69), done7: wt(70), n12: wt(72), bag: wt(77), back: wt(79), gone: wt(84), weg: wt(85), tracks: wt(86),
  crater: wt(94), follow: wt(95), pass: wt(101), law2: wt(108), comment2: wt(111), end: SPEECH_END,
};
const PASS_LABEL = "RAKETE 2";
const NEW = 18, FOLLOWERS = 18, LIKES = "214";

// Neue Einwohner: 18 Astronauten mit eigener Akzentfarbe
const ACC = ["#3fd3f2", "#7bf27a", "#ff4b6e", "#b06bff", "#ffd23a", "#4aa3ff", "#ff8a2a", "#2fe0b0", "#ff79c6"];
const CROWD2 = (() => {
  const r = rng(77), a = [], xs = [40, 95, 150, 205, 255, 300, 520, 575, 630, 690, 745, 800];
  for (let i = 0; i < 12; i++) a.push({ x: xs[i] + (r() - 0.5) * 10, y: 716 + (i % 2) * 8, s: 0.78, acc: ACC[i % ACC.length] });
  for (let i = 0; i < 6; i++) a.push({ x: [70, 180, 280, 560, 660, 760][i], y: 760 + (i % 2) * 10, s: 0.92, acc: ACC[(i + 3) % ACC.length] });
  return a.map((c, i) => ({ ...c, d: r() * 0.5, f: ["smile", "happy", "talk"][i % 3] }));
})();
const N7 = CROWD2[16], N12 = CROWD2[15];   // die beiden Wunsch-Astronauten (vorne)
const ROCKETS = [[150, 690], [-80, 700], [720, 700]];   // gelandete Raketen

// ------------------------------------------------------------ Kamera
const CAM = [ // t, cx, cy, zoom
  [0, 335, 625, 1.5], [T.sky - 0.25, 335, 625, 1.5], [T.sky + 0.15, 335, 300, 1.15], [T.card - 0.2, 335, 330, 1.1],
  [T.problem - 0.1, 335, 330, 1.1], [T.problem + 0.25, 190, 600, 1.9], [T.fleet - 0.15, 200, 610, 1.85], [T.fleet + 0.35, 330, 600, 0.55],
  [T.top - 0.15, 330, 600, 0.6], [T.top + 0.25, 400, 650, 1.6], [T.law - 0.1, 400, 650, 1.6], [T.law + 0.2, 420, 650, 2.0],
  [T.safe - 0.15, 430, 650, 1.95], [T.safe + 0.25, 560, 640, 1.45], [T.launch - 0.1, 590, 640, 1.45], [T.launch + 0.9, 600, 380, 1.0],
  [T.n7 - 0.15, 600, 380, 1.0], [T.n7 + 0.2, N7.x + 20, 690, 2.3], [T.n12 - 0.15, N7.x + 20, 690, 2.3], [T.n12 + 0.25, N12.x - 10, 690, 2.3],
  [T.back - 0.15, N12.x - 10, 690, 2.3], [T.back + 0.25, 470, 650, 1.55], [T.tracks - 0.1, 490, 650, 1.55], [T.tracks + 0.3, 650, 790, 2.0],
  [T.crater - 0.2, 800, 815, 2.0], [T.crater + 0.15, 880, 840, 2.4], [T.follow - 0.1, 880, 840, 2.4], [T.follow + 0.25, 335, 625, 1.5],
  [T.law2 - 0.1, 335, 625, 1.5], [T.law2 + 0.25, 420, 650, 2.0], [T.end, 415, 650, 2.05], [DUR, 400, 645, 1.9],
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

// ------------------------------------------------------------ Neue Objekte
function school(x, y, s, fire) { // Unterkante Mitte
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (fire > 0) for (const fx of [-38, 0, 38]) {
    ctx.fillStyle = "#ffb43a"; ctx.beginPath(); ctx.moveTo(fx - 12, 0); ctx.quadraticCurveTo(fx, 70 * fire * (0.9 + 0.2 * Math.random()), fx + 12, 0); ctx.fill();
    ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.moveTo(fx - 6, 0); ctx.quadraticCurveTo(fx, 36 * fire, fx + 6, 0); ctx.fill();
  }
  ctx.fillStyle = "#f2d8a8"; ctx.fillRect(-62, -78, 124, 78);
  ctx.fillStyle = "#c9433a"; ctx.beginPath(); ctx.moveTo(-72, -76); ctx.lineTo(0, -124); ctx.lineTo(72, -76); ctx.fill();
  ctx.fillStyle = "#4a90d9"; for (const wx of [-46, 24]) { ctx.fillRect(wx, -62, 22, 18); ctx.fillRect(wx, -36, 22, 18); }
  ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-10, -34, 20, 34);
  ctx.fillStyle = "#fff"; rr(-30, -100, 60, 16, 3); ctx.fill();
  ctx.fillStyle = "#2a2a2a"; ctx.font = "11px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SCHULE", 0, -91);
  circle(0, -112, 7, "#fff"); ctx.fillStyle = RED; ctx.font = "12px Comic"; ctx.fillText("!", 0, -111);
  ctx.restore();
}
function topHat(x, y, s) { // y = Helmmitte
  ctx.save(); ctx.translate(x, y - 26 * s); ctx.rotate(-0.12); ctx.scale(s, s);
  ctx.fillStyle = "#1b1b22"; rr(-24, -4, 48, 8, 4); ctx.fill(); rr(-15, -34, 30, 32, 3); ctx.fill();
  ctx.fillStyle = "#b06bff"; ctx.fillRect(-15, -10, 30, 6);
  ctx.restore();
}
function handbag(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#d63384"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, -10, 10, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = "#ff79c6"; rr(-15, -10, 30, 22, 5); ctx.fill();
  ctx.fillStyle = "#ffd23a"; circle(0, -2, 3, "#ffd23a");
  ctx.restore();
}
function hole(x, y, a) { if (a <= 0) return; ctx.globalAlpha = a; ctx.fillStyle = "#5a2414"; ctx.beginPath(); ctx.ellipse(x, y, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
const PAWS = (() => { const a = []; for (let i = 0; i < 14; i++) { const k = i / 13; a.push([lerp(585, 860, k) + (i % 2 ? 9 : -9), lerp(790, 835, k) + Math.sin(k * 5) * 6, i]); } return a; })();
function paws(t) {
  for (const [x, y, i] of PAWS) {
    const a = clamp((t - T.tracks + 0.4 - i * 0.07) / 0.15); if (a <= 0) continue;
    ctx.globalAlpha = a; ctx.fillStyle = "#4a1c10";
    ctx.beginPath(); ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    for (const [dx, dy] of [[-6, -6], [-2, -8.5], [2, -8.5], [6, -6]]) { ctx.beginPath(); ctx.ellipse(x + dx, y + dy, 2, 2.4, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
function crater(t) {
  const x = 885, y = 845;
  ctx.fillStyle = "#7e3218"; ctx.beginPath(); ctx.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a120a"; ctx.beginPath(); ctx.ellipse(x, y + 3, 56, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,160,110,0.45)"; ctx.beginPath(); ctx.ellipse(x, y + 12, 70, 12, 0, 0.1, Math.PI - 0.1); ctx.fill();
  const e = t >= T.crater ? ramp(t, T.crater, T.crater + 0.25) * (Math.sin(t * 3) > -0.92 ? 1 : 0.1) : 0;
  if (e > 0) for (const dx of [-12, 12]) { glow(x + dx, y + 2, 16, "120,255,90", 0.7 * e); ctx.globalAlpha = e; ctx.fillStyle = "#c8ff5a"; ctx.beginPath(); ctx.ellipse(x + dx, y + 2, 5, 2.4, dx < 0 ? 0.25 : -0.25, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
}
// Buch mit Gesetz 1 bzw. Gesetz 2
function book(x, y, s, state, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#8a6a3a"; rr(-34, -20, 68, 36, 3); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-32, -18, 31, 32, 2); ctx.fill(); rr(1, -18, 31, 32, 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#333"; ctx.font = "900 6px InterX"; ctx.fillText("GESETZ 1", -16, -11); ctx.fillText("GESETZ 2", 16, -11);
  const w = state === "law1" ? ramp(t, T.lawWrite - 0.2, T.lawWrite + 0.3) : 1;
  ctx.save(); ctx.beginPath(); ctx.rect(-31, -6, 30 * w, 18); ctx.clip();
  ctx.fillStyle = RED; ctx.font = "7.5px Comic"; ctx.fillText("KEINE", -16, -1); ctx.fillText("SCHULE", -16, 7);
  ctx.restore();
  if (state === "law2") { ctx.fillStyle = RED; ctx.font = "16px Comic"; ctx.fillText("?", 16, 4); }
  ctx.restore();
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
  const n = Math.round(FOLLOWERS * easeOut(ramp(t, T.card + 0.1, T.card + 0.6)));
  const stats = [["1", "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]];
  stats.forEach(([v, l], i) => { const x = -222 + i * 110; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -24); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10.5px InterX"; ctx.fillText(l, x, -6); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-118, -40, 104, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-222, 16, 190, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -127, 33);
  ctx.fillStyle = "#2c2c33"; rr(-22, 16, 150, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 33);
  ctx.fillStyle = "#2c2c33"; rr(136, 16, 40, 34, 6); ctx.fill(); ctx.fillText("👤", 156, 33);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea";
  ctx.fillText("1 Follow = 1 Astronaut 🚀", -222, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -222, 88);
  ctx.restore();
  avatarBadge(288 + 190 * s, 250 - 60 * s, 0.9 * s, 0);
  const k = back(ramp(t, T.card + 0.45, T.card + 0.7));
  if (k > 0) {
    ctx.save(); ctx.translate(205, 290); ctx.rotate(-0.12); ctx.scale(k * s, k * s);
    ctx.fillStyle = RED; rr(-70, -18, 140, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+18 NEUE", 0, 2);
    ctx.restore();
  }
}
// TikTok-Kommentar (dunkel, wie im Original)
let ROMY = null;
function tkComment(s, name, text, ago, likes, avatar, y = 235) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14;
  ctx.fillStyle = "#1e1e22"; rr(-240, -58, 480, 116, 14); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2; ctx.stroke();
  // Profilbild mit Story-Ring
  const g = ctx.createLinearGradient(-230, -40, -170, 20); g.addColorStop(0, "#3a8bff"); g.addColorStop(1, "#3ff2b0");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-196, -10, 31, 0, Math.PI * 2); ctx.fill();
  circle(-196, -10, 28, "#1e1e22");
  if (avatar) { ctx.save(); ctx.beginPath(); ctx.arc(-196, -10, 25, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(avatar, -221, -35, 50, 50); ctx.restore(); }
  else { circle(-196, -10, 25, "#3a4256"); astronaut(-196, 12, 0.32, "happy", { t: 0, acc: name.includes("12") ? "#ff79c6" : "#b06bff" }); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "700 15px InterX, 'Noto Color Emoji'"; ctx.fillText(name, -152, -32);
  ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX, 'Noto Color Emoji'";
  // Zeilenumbruch bei langem Text
  const words = text.split(" "), lines = [""];
  for (const w of words) { const tl = lines.at(-1) ? lines.at(-1) + " " + w : w; if (ctx.measureText(tl).width > 330 && lines.at(-1)) lines.push(w); else lines[lines.length - 1] = tl; }
  lines.forEach((l, i) => ctx.fillText(l, -152, -6 + i * 23));
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 13px InterX"; ctx.fillText(`${ago}    Antworten`, -152, 40);
  ctx.strokeStyle = "#cfcfd4"; ctx.lineWidth = 2;
  ctx.beginPath(); const hx = 165, hy = 34; ctx.moveTo(hx, hy + 7); ctx.bezierCurveTo(hx - 13, hy - 2, hx - 7, hy - 12, hx, hy - 5); ctx.bezierCurveTo(hx + 7, hy - 12, hx + 13, hy - 2, hx, hy + 7); ctx.stroke();
  ctx.fillStyle = "#cfcfd4"; ctx.font = "700 14px InterX"; ctx.fillText(String(likes), 182, 35);
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
// fliegende Raketen am Himmel (beim Anflug)
function skyRockets(t) {
  const L = [[0, 470, 0.55], [0.35, 250, 0.6], [0.7, 380, 0.5]];
  for (const [d, x, s] of L) {
    const k = ramp(t, T.rockets + d, T.fleet - 0.4 + d * 0.2); if (k <= 0 || k >= 1) continue;
    rocket(lerp(x + 120, x, k), lerp(-500, 520, k), s, 1);
  }
}
const pop = (t, a, b = 99, d = 0.28) => (t < a || t > b + 0.2 ? 0 : back(ramp(t, a, a + d)) * (1 - ramp(t, b, b + 0.18)));

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [cx, cy, z] = cam(t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  sky(t); ground();
  hole(575, 700, t >= T.gone ? ramp(t, T.gone, T.gone + 0.2) : 0);
  if (t >= T.tracks - 0.5) paws(t);
  crater(t);
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  boulders();
  dome(330, 690);
  sign(445, 690);
  // Fahne: steht, bis sie über Nacht verschwunden ist
  if (t < T.gone) flag(575, 700, 1, t);
  // Raketen: eine steht schon, zwei landen dazu
  const landK = ramp(t, T.fleet - 0.4, T.fleet + 0.2);
  rocket(ROCKETS[0][0], ROCKETS[0][1], 0.95, 0);
  for (const [i, [x, y]] of ROCKETS.slice(1).entries()) {
    const k = 1 - Math.pow(1 - clamp(landK * 1.2 - i * 0.2), 2);
    if (k > 0) rocket(x, lerp(-300, y, k), 0.95, k < 1 ? 1 : 0);
  }
  // Schule: wird gebaut und ins All geschossen
  if (t >= T.school && t < T.n7) {
    const up = t >= T.launch ? Math.pow(ramp(t, T.launch, T.launch + 1.6), 2) : 0;
    school(640, 700 - up * 900, back(ramp(t, T.school, T.school + 0.3)) * 1.35, t >= T.launch ? 1 : 0);
  }
  // Einwohner (ab der Landung)
  const crowdA = t >= T.fleet ? 1 : 0;
  if (crowdA) for (const [i, c] of CROWD2.entries()) {
    const a = clamp((t - T.fleet - 0.2 - c.d) / 0.3); if (a <= 0) continue;
    let f = c.f; const o = { t: t + i, acc: c.acc };
    if (t >= T.gone && t < T.follow) f = "shock";
    if (c === N7 && t >= T.n7 && t < T.n12) { f = t >= T.hat ? "happy" : "talk"; o.wave = t >= T.hat; }
    if (c === N12 && t >= T.n12 && t < T.back) { f = t >= T.bag ? "happy" : "talk"; o.armR = t >= T.bag ? -1.2 : -0.25; }
    if (t >= T.law && t < T.safe && i % 3 === 0) o.bob = Math.abs(Math.sin(t * 8 + i)) * 4;
    astronaut(c.x, c.y, c.s * back(a), f, o);
    if (c === N7 && t >= T.hat) topHat(c.x, c.y - 104 * c.s, c.s * back(ramp(t, T.hat, T.hat + 0.3)));
    if (c === N12 && t >= T.bag) handbag(c.x + 30 * c.s, c.y - 38 * c.s, c.s * back(ramp(t, T.bag, T.bag + 0.3)));
  }
  // Hauptfigur
  let face = "smile", o = { t };
  if (t < T.sky) face = "talk";
  if (t >= T.problem) face = "shock";
  if (t >= T.fleet) { face = "happy"; o.armR = -2.5; }
  if (t >= T.top) { face = "talk"; o.armR = -0.25; o.hold = null; }
  if (t >= T.law) { face = "happy"; o.hold = "law1"; o.armL = -0.5; o.armR = 0.5; }
  if (t >= T.safe) { o.hold = null; face = "smirk"; o.armL = 0.25; o.armR = -0.25; }
  if (t >= T.bye) { face = "happy"; o.wave = true; }
  if (t >= T.back) { o.wave = false; face = "talk"; }
  if (t >= T.gone) face = "shock";
  if (t >= T.follow) { face = "happy"; o.wave = true; }
  if (t >= T.law2) { o.wave = false; face = "smirk"; o.hold = "law2"; o.armL = -0.5; o.armR = 0.5; }
  if (t >= T.end) face = "smile";
  astronaut(430, 742, 1, face, o);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  if (t >= T.fleet - 0.2) for (const [x] of ROCKETS.slice(1)) puffs(x, 704, t, T.fleet + 0.05);
  if (t >= T.school && t < T.n7) puffs(640, 708, t, T.launch);
  ctx.restore();
  // Anflug am Himmel (Bildschirm über der Welt, damit die Raketen groß wirken)
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); skyRockets(t); ctx.restore();
  dust(t);
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.45)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen
  const tag = pop(t, 0.12, T.sky - 0.3);
  if (tag > 0) { ctx.save(); ctx.translate(288, 190); ctx.scale(tag, tag); outlined("TAG 2", 0, 0, 92, CYAN, "#0e1a30", 13); ctx.restore(); }
  // Zähler +0 … +18
  if (t >= T.count0 - 0.1 && t < T.card) {
    const n = Math.round(NEW * easeIO(ramp(t, T.count0, T.count1)));
    const a = pop(t, T.count0 - 0.1, T.card - 0.1, 0.2), big = 1 + 0.25 * Math.exp(-Math.max(0, t - T.count1) * 8) * (t >= T.count1 ? 1 : 0);
    if (t >= T.count1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - ramp(t, T.count1, T.card)); for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t; ctx.fillStyle = "#3fd3f2"; ctx.beginPath(); ctx.moveTo(288, 230); ctx.arc(288, 230, 400, an, an + 0.12); ctx.fill(); } ctx.restore(); }
    ctx.save(); ctx.translate(288, 215); ctx.scale(a * big, a * big); outlined("+" + n, 0, 0, 96, CYAN, "#0e1a30", 13);
    outlined("NEUE ASTRONAUTEN", 0, 62, 26, "#fff", "#0e1a30", 7); ctx.restore();
  }
  if (t >= T.card && t < T.problem) { profileCard(t, pop(t, T.card, T.problem - 0.15)); confetti(t, T.card + 0.4); }
  label("NUR 1 RAKETE?!", 300, 230, pop(t, T.nur1, T.fleet - 0.1));
  if (t >= T.drei - 0.05 && t < T.top) {
    const a = pop(t, T.drei - 0.05, T.top - 0.15);
    pill("DREI RAKETEN", 288, 200, a, "#fff", "#14223a", "🚀 ");
    ctx.save(); ctx.translate(288, 245); ctx.scale(a, a); ctx.font = "24px Comic";
    const w1 = ctx.measureText("EINWOHNER: ").width, w2 = ctx.measureText("19").width;
    outlined("EINWOHNER: ", -(w1 + w2) / 2, 0, 24, "#fff", "#0e1a30", 7, 900, "left"); outlined("19", -(w1 + w2) / 2 + w1, 0, 24, CYAN, "#0e1a30", 7, 900, "left");
    ctx.restore();
  }
  // Top-Kommentar von Romy
  pill("TOP-KOMMENTAR", 288, 170, pop(t, T.top, T.law - 0.15), "#fff", "#14223a", "👑 ");
  tkComment(pop(t, T.comment, T.law - 0.15), "•°Romy☆", "Es gibt keine schule", "5 Std", 1, ROMY, 270);
  // Gesetz Nr. 1
  if (t >= T.law && t < T.safe) {
    const a = pop(t, T.law, T.safe - 0.15);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("📜 GESETZ NR. 1", 0, 0, 44, "#fff", "#0e1a30", 10); ctx.restore();
    if (t >= T.lawWrite) { const b = pop(t, T.lawWrite, T.safe - 0.15); ctx.save(); ctx.translate(288, 258); ctx.rotate(-0.04); ctx.scale(b, b); outlined("KEINE SCHULE!", 0, 0, 40, RED, "#0e1a30", 10); ctx.restore(); }
    confetti(t, T.confetti);
  }
  pill("SICHER IST SICHER", 288, 190, pop(t, T.safe, T.launch - 0.1), "#fff", "#14223a", "🏫 ");
  if (t >= T.bye && t < T.n7) { const a = pop(t, T.bye, T.n7 - 0.15); ctx.save(); ctx.translate(288, 210); ctx.rotate(-0.06); ctx.scale(a, a); outlined("TSCHÜSS", 0, -30, 54, CYAN, "#0e1a30", 11); outlined("SCHULE! 🚀", 0, 30, 54, CYAN, "#0e1a30", 11); ctx.restore(); confetti(t, T.bye); }
  // Wünsche
  tkComment(pop(t, T.n7, T.n12 - 0.15), "astronaut_07", "Kann ich bitte einen Hut haben? 🥺", "3 Std", 4, null, 215);
  stamp("✓ ERFÜLLT", 420, 260, pop(t, T.done7, T.n12 - 0.15));
  tkComment(pop(t, T.n12, T.back - 0.15), "astronautin_12", "Kann ich eine pinke Handtasche haben? 👜", "2 Std", 6, null, 215);
  stamp("✓ ERFÜLLT", 420, 260, pop(t, T.bag + 0.15, T.back - 0.15));
  if (t >= T.n7 && t < T.back) {
    const c = t < T.n12 ? N7 : N12, [sx, sy] = toScreen(c.x, c.y - 140 * c.s, t);
    pill(t < T.n12 ? "NR. 7" : "NR. 12", sx, sy, pop(t, t < T.n12 ? T.n7 + 0.2 : T.n12 + 0.2, t < T.n12 ? T.n12 - 0.15 : T.back - 0.15), "#fff", "#14223a");
  }
  label("FAHNE WEG?!", 300, 230, pop(t, T.weg, T.tracks + 0.4));
  // Bordkarte Rakete 2
  if (t >= T.follow && t < T.law2) {
    const out = 1 - ramp(t, T.law2 - 0.2, T.law2);
    if (t < T.pass) avatarBadge(288, 250, pop(t, T.follow, T.pass - 0.15), ramp(t, wt(96), wt(96) + 0.25));
    else boardingPass(back(ramp(t, T.pass, T.pass + 0.3)) * out);
  }
  // Gesetz Nr. 2
  if (t >= T.law2) {
    const a = pop(t, T.law2, DUR - 0.25);
    ctx.save(); ctx.translate(288, 175); ctx.scale(a, a); outlined("📜 GESETZ NR. 2", 0, 0, 44, "#fff", "#0e1a30", 10); ctx.restore();
    if (t >= T.comment2) commentCard(pop(t, T.comment2, DUR - 0.25));
  }
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, rockets: T.rockets, count: [T.count0, T.count1], card: T.card, nur1: T.nur1, land: T.fleet + 0.05, drei: T.drei,
    pops: [T.top, T.comment, T.law, T.lawWrite, T.safe, T.school, T.n7, T.done7, T.n12, T.bag + 0.15, T.weg, T.follow, T.pass, T.law2, T.comment2],
    confetti: [T.card + 0.4, T.confetti, T.bye], launch: T.launch, hat: T.hat, bag: T.bag, gone: T.gone, tracks: T.tracks, crater: T.crater,
    whooshes: CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.25), end: T.end };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  ROMY = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "romy.png"; });
  return { duration: DUR };
};
