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
// ============================================================ Tag 3 (base.js + helpers3.js + tag3.js -> scene.js)
const T = {
  e630: wt(5), land: wt(7), count0: wt(9), count1: wt(13), card: wt(13) + 0.1, unauf: wt(14), top: wt(19), comment: wt(24), keine: wt(25),
  law: wt(27), lawWrite: wt(32), steuern: wt(35), gab: wt(36), sword: wt(39), els: wt(40), suit: wt(42), ente: wt(45), duck: wt(48),
  doner: wt(50), shop: wt(57), shopDone: wt(61), night: wt(62), funk: wt(67), alien: wt(71), alienEnd: wt(83), attack: wt(83), scout: wt(88),
  fleet: wt(91), ufos: wt(95), together: wt(97), z630: wt(100), choose: wt(105), cardA: wt(108), cardB: wt(116), poll: wt(121), vote: wt(125),
  follow: wt(130), end: SPEECH_END,
};
const PASS_LABEL = "RAKETE 3";
const NEW = 611, FOLLOWERS = 629, LIKES = "3.858", FOLLOWING = "7";
const AV = {};

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
  for (let i = 0; i < 520; i++) {
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
// benannte Astronauten vorne
const NAMED = { gab: { x: 560, y: 760, acc: "#3fd3f2" }, els: { x: 250, y: 762, acc: "#ff79c6" }, ente: { x: 620, y: 765, acc: "#ffd23a" } };

// ------------------------------------------------------------ Kamera
const CAM = [
  [0, 330, 560, 0.55], [T.e630 - 0.2, 330, 560, 0.6], [T.land - 0.2, 330, 560, 0.62], [T.land + 0.2, 335, 330, 1.1], [T.card - 0.1, 335, 330, 1.1],
  [T.unauf - 0.1, 335, 360, 1.0], [T.unauf + 0.3, 340, 620, 1.35], [T.top - 0.1, 360, 630, 1.45], [T.top + 0.25, 410, 650, 1.7],
  [T.law - 0.1, 410, 650, 1.7], [T.law + 0.2, 420, 650, 2.0], [T.gab - 0.15, 420, 650, 2.0], [T.gab + 0.25, NAMED.gab.x - 10, 690, 2.3],
  [T.els - 0.15, NAMED.gab.x - 10, 690, 2.3], [T.els + 0.25, NAMED.els.x + 10, 690, 2.3], [T.ente - 0.15, NAMED.els.x + 10, 690, 2.3],
  [T.ente + 0.25, NAMED.ente.x, 692, 2.3], [T.doner - 0.15, NAMED.ente.x, 692, 2.3], [T.doner + 0.3, 140, 640, 1.5], [T.night - 0.15, 140, 640, 1.5],
  [T.night + 0.3, 400, 645, 1.6], [T.attack - 0.1, 400, 645, 1.6], [T.attack + 0.3, 380, 600, 1.3], [T.fleet - 0.15, 380, 600, 1.3],
  [T.fleet + 0.4, 330, 260, 0.9], [T.together - 0.15, 330, 260, 0.9], [T.together + 0.3, 400, 650, 1.6], [T.choose - 0.1, 400, 650, 1.6],
  [T.choose + 0.3, 330, 300, 0.9], [T.poll - 0.15, 330, 300, 0.9], [T.poll + 0.3, 410, 650, 1.75], [T.end, 410, 650, 1.8], [DUR, 400, 645, 1.7],
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

// ------------------------------------------------------------ Gegenstände
function book(x, y, s, state, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#8a6a3a"; rr(-34, -20, 68, 36, 3); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-32, -18, 31, 32, 2); ctx.fill(); rr(1, -18, 31, 32, 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#333"; ctx.font = "900 6px InterX"; ctx.fillText("GESETZ 1", -16, -11); ctx.fillText("GESETZ 2", 16, -11);
  ctx.fillStyle = RED; ctx.font = "7.5px Comic"; ctx.fillText("KEINE", -16, -1); ctx.fillText("SCHULE", -16, 7);
  const w = ramp(t, T.lawWrite - 0.2, T.lawWrite + 0.3);
  ctx.save(); ctx.beginPath(); ctx.rect(1, -6, 30 * w, 18); ctx.clip();
  ctx.fillStyle = RED; ctx.fillText("KEINE", 16, -1); ctx.fillText("STEUERN", 16, 7); ctx.restore();
  ctx.restore();
}
function sword(x, y, s, t) { // Hand-Position
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.45); ctx.scale(s, s);
  ctx.fillStyle = "#555"; rr(-3, -4, 6, 16, 2); ctx.fill();
  glow(0, -40, 34, "80,220,255", 0.7);
  ctx.strokeStyle = "#bff6ff"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -70); ctx.stroke();
  ctx.strokeStyle = "rgba(63,211,242,0.8)"; ctx.lineWidth = 11; ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 30); ctx.stroke();
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
function pinkSuit(x, y, s) { // färbt den Anzug rosa ein (über den weißen Körper)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = 0.55; ctx.fillStyle = "#ff79c6";
  rr(-22, -76, 44, 46, 14); ctx.fill(); rr(-17, -34, 14, 26, 6); ctx.fill(); rr(3, -34, 14, 26, 6); ctx.fill();
  ctx.restore();
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
function tvBreaking(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 260); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-236, -150, 472, 300, 14); ctx.fill();
  ctx.fillStyle = "#0b1020"; rr(-228, -112, 456, 196, 6); ctx.fill();
  ctx.fillStyle = "#e5262b"; rr(-228, -142, 456, 30, [8, 8, 0, 0]); ctx.fill();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.fillText("🔴 EILMELDUNG", -216, -126);
  ctx.fillStyle = "#fff"; rr(110, -136, 108, 20, 4); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.font = "900 10px InterX"; ctx.fillText("LIVE · AUS DEM ALL", 116, -126);
  // Sterne + Alien mit unserer Fahne
  for (let i = 0; i < 30; i++) circle(-220 + (i * 61) % 440, -100 + (i * 37) % 180, 1.2, "rgba(255,255,255,0.6)");
  ctx.save(); ctx.beginPath(); ctx.rect(-228, -112, 456, 196); ctx.clip();
  ctx.save(); ctx.translate(70, 60); ctx.rotate(0.15);
  ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -120, 6, 160);
  ctx.fillStyle = "#4a2b9a"; ctx.fillRect(3, -118, 80, 52);
  ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(43, -92, 22, 6, -0.2, 0, Math.PI * 2); ctx.stroke(); circle(43, -92, 12, "#e2552e");
  ctx.restore();
  alienFace(-20, 10, 1.25 + 0.03 * Math.sin(t * 3), t);
  ctx.restore();
  // Bauchbinde + Laufband
  ctx.fillStyle = "#ffd23a"; ctx.fillRect(-228, 84, 456, 30);
  ctx.fillStyle = "#1b1424"; ctx.font = "16px Comic"; ctx.fillText("BOTSCHAFT AN ROTANIEN: „DIESER PLANET GEHÖRT UNS!“", -218, 99.5);
  ctx.fillStyle = "#1b1424"; ctx.fillRect(-228, 114, 456, 26);
  ctx.save(); ctx.beginPath(); ctx.rect(-228, 114, 456, 26); ctx.clip();
  ctx.fillStyle = "#ffd23a"; ctx.font = "15px Comic"; const tick = "+++ ULTIMATUM +++ ANGRIFF IN 24 STUNDEN +++ UNSERE FAHNE GESICHTET +++ ALIEN-FLOTTE HINTER PHOBOS ";
  const off = -((t - T.alien) * 120) % 700; ctx.fillText(tick + tick, -228 + off, 128);
  ctx.restore();
  ctx.restore();
}
function choiceCard(icon, txt, x, y, s, rot) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-90, -80, 180, 160, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 5; ctx.stroke();
  ctx.font = "54px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(icon, 0, -22);
  ctx.fillStyle = "#1b1424"; ctx.font = "28px Comic"; ctx.fillText(txt, 0, 46);
  ctx.restore();
}
function pollCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 230); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-230, -90, 460, 180, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#111"; ctx.font = "800 20px InterX, 'Noto Color Emoji'"; ctx.fillText("📊 Abhauen oder kämpfen?", -206, -58);
  const k = ramp(t, T.vote, T.vote + 1.2);
  [["🚀 Abhauen", 0.38], ["⚔️ Kämpfen", 0.62]].forEach(([l, p], i) => {
    const y = -14 + i * 52;
    ctx.fillStyle = "#eef1f5"; rr(-206, y - 19, 412, 38, 10); ctx.fill();
    ctx.fillStyle = i ? "rgba(255,64,64,0.35)" : "rgba(63,211,242,0.4)"; rr(-206, y - 19, 412 * p * k + 0.1, 38, 10); ctx.fill();
    ctx.fillStyle = "#111"; ctx.font = "800 17px InterX, 'Noto Color Emoji'"; ctx.fillText(l, -192, y + 1);
  });
  ctx.fillStyle = "#8a8f9a"; ctx.font = "700 11px InterX"; ctx.fillText("Umfrage · in den Kommentaren", -206, 78);
  ctx.restore();
}
function profileCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16;
  ctx.fillStyle = "#121216"; rr(-245, -105, 490, 210, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.font = "900 24px InterX"; ctx.fillText("Gedacht", -222, -76);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -222, -54);
  const n = Math.round(lerp(18, FOLLOWERS, easeOut(ramp(t, T.card + 0.1, T.card + 0.7))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -222 + i * 110; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -24); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10.5px InterX"; ctx.fillText(l, x, -6); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-118, -40, 104, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-222, 16, 190, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -127, 33);
  ctx.fillStyle = "#2c2c33"; rr(-22, 16, 150, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 33);
  ctx.fillStyle = "#2c2c33"; rr(136, 16, 40, 34, 6); ctx.fill(); ctx.fillText("👤", 156, 33);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea";
  ctx.fillText("1 Follow = 1 Astronaut 🚀", -222, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -222, 88);
  ctx.restore();
  avatarBadge(288 + 190 * s, 250 - 60 * s, 0.9 * s, 0);
  const k = back(ramp(t, T.card + 0.5, T.card + 0.75));
  if (k > 0) { ctx.save(); ctx.translate(205, 290); ctx.rotate(-0.12); ctx.scale(k * s, k * s); ctx.fillStyle = RED; rr(-78, -18, 156, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+611 NEUE", 0, 2); ctx.restore(); }
}
function counterTimer(t, s) {
  if (s <= 0.01) return;
  const left = Math.max(0, 24 * 3600 - 1 - Math.floor((t - T.attack) * 3600 / 8));
  const hh = String(Math.floor(left / 3600)).padStart(2, "0"), mm = String(Math.floor(left / 60) % 60).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-150, -36, 300, 72, 12); ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = RED; ctx.font = "900 48px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(`${hh}:${mm}:${ss}`, 0, 2);
  ctx.restore();
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const [cx, cy, z] = cam(t);
  const night = t >= T.night ? ramp(t, T.night, T.night + 0.6) : 0;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  sky(t); ground();
  // Alien-Flotte hinter Phobos
  if (t >= T.fleet - 0.3) {
    phobosBig(330, 150, 70);
    const k = ramp(t, T.ufos - 0.6, T.ufos + 0.6);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rr2 = 110 + (i % 3) * 45; if (k * 14 > i) ufo(330 + Math.cos(a) * rr2 * 1.4, 150 + Math.sin(a) * rr2 * 0.55, 0.55 + (i % 3) * 0.12, t, i); }
  }
  for (const [x, y, s] of BGROCKETS) rocket(x, y, s, 0);
  massCrowd(t, (t >= T.unauf && t < T.top) || (t >= T.together && t < T.choose) ? 1 : 0);
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  boulders(); dome(330, 690); sign(445, 690);
  rocket(150, 690, 0.95, 0); rocket(-80, 700, 0.95, 0); rocket(720, 700, 0.95, 0);
  // landende Raketen (Anflug)
  for (let i = 0; i < 3; i++) { const k = 1 - Math.pow(1 - clamp(ramp(t, T.land + i * 0.35, T.count1 + i * 0.3)), 2); if (k > 0 && k < 1) rocket(-300 + i * 420, lerp(-500, 640, k), 0.7, 1); }
  // Dönerladen links neben der Kuppel
  if (t >= T.shop) donerShop(30, 705, back(ramp(t, T.shop, T.shop + 0.35)) * 0.95);
  // benannte Astronauten
  const sz = 1.0;
  const g = NAMED.gab, e = NAMED.els, d = NAMED.ente;
  astronaut(g.x, g.y, sz, t >= T.sword ? "happy" : "talk", { t, acc: g.acc, armR: t >= T.sword ? -2.2 : -0.25 });
  astronaut(e.x, e.y, sz, t >= T.suit ? "happy" : "smile", { t: t + 1, acc: "#ff79c6", wave: t >= T.suit && t < T.ente });
  if (t >= T.suit) { pinkSuit(e.x, e.y, sz * clamp((t - T.suit) / 0.2)); dogEars(e.x, e.y - 104 * sz, sz * back(ramp(t, T.suit, T.suit + 0.3))); }
  astronaut(d.x, d.y, sz, t >= T.duck ? "happy" : "smile", { t: t + 2, acc: d.acc });
  if (t >= T.duck) duck(d.x + 52, d.y, 0.9 * back(ramp(t, T.duck, T.duck + 0.3)), t);
  // Hauptfigur
  let face = "talk", o = { t };
  if (t >= T.e630) { face = "happy"; o.armR = -2.5; }
  if (t >= T.land) { face = "talk"; o.armR = -0.25; }
  if (t >= T.unauf) { face = "happy"; o.wave = true; }
  if (t >= T.top) { o.wave = false; face = "talk"; }
  if (t >= T.law) { face = "happy"; o.hold = "law2"; o.armL = -0.5; o.armR = 0.5; }
  if (t >= T.gab) { o.hold = null; face = "smile"; o.armL = 0.25; o.armR = -0.25; }
  if (t >= T.shopDone) { face = "happy"; o.armR = -2.5; }
  if (t >= T.night) { face = "shock"; o.armR = -0.25; }
  if (t >= T.together) { face = "smirk"; o.armL = 2.6; o.armR = -2.6; }
  if (t >= T.choose) { face = "think"; o.armL = 0.25; o.armR = -2.9; }
  if (t >= T.poll) { face = "talk"; o.armR = -0.25; }
  if (t >= T.follow) { face = "happy"; o.wave = true; }
  astronaut(430, 742, 1, face, o);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  if (t >= T.sword) { const [hx, hy] = [g.x + 45, g.y - 87]; sword(hx, hy, back(ramp(t, T.sword, T.sword + 0.3)), t); }
  if (t >= T.shop) puffs(30, 712, t, T.shop);
  ctx.restore();
  dust(t);
  // Nacht + rotes Alarmlicht
  if (night > 0) {
    ctx.fillStyle = `rgba(30,10,40,${0.35 * night})`; ctx.fillRect(0, 0, W, H);
    if (t < T.together) { const pulse = 0.5 + 0.5 * Math.sin(t * 6); const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); rg.addColorStop(0, "rgba(255,0,0,0)"); rg.addColorStop(1, `rgba(220,20,20,${0.45 * night * pulse})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
  }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.45)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- Einblendungen
  const tag = pop(t, 0.12, T.e630 - 0.15);
  if (tag > 0) { ctx.save(); ctx.translate(288, 190); ctx.scale(tag, tag); outlined("TAG 3", 0, 0, 92, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t >= T.e630 && t < T.land) {
    const a = pop(t, T.e630, T.land - 0.12);
    ctx.save(); ctx.globalAlpha = 0.4; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t; ctx.fillStyle = CYAN; ctx.beginPath(); ctx.moveTo(288, 220); ctx.arc(288, 220, 420, an, an + 0.12); ctx.fill(); } ctx.restore();
    ctx.save(); ctx.translate(288, 210); ctx.scale(a, a); outlined("630", 0, 0, 110, CYAN, "#0e1a30", 14); outlined("EINWOHNER! 🎉", 0, 70, 30, "#fff", "#0e1a30", 8); ctx.restore();
    confetti(t, T.e630);
  }
  if (t >= T.count0 - 0.1 && t < T.card) {
    const n = Math.round(NEW * easeIO(ramp(t, T.count0, T.count1)));
    const a = pop(t, T.count0 - 0.1, T.card - 0.1, 0.2);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("+" + n, 0, 0, 92, CYAN, "#0e1a30", 13); outlined("NEUE ASTRONAUTEN", 0, 60, 26, "#fff", "#0e1a30", 7); ctx.restore();
  }
  if (t >= T.card && t < T.unauf) { profileCard(t, pop(t, T.card, T.unauf - 0.12)); confetti(t, T.card + 0.4); }
  pill("UNAUFHALTSAM", 288, 190, pop(t, T.unauf + 0.1, T.top - 0.12), "#fff", "#14223a", "✊ ");
  pill("TOP-KOMMENTAR", 288, 165, pop(t, T.top, T.law - 0.15), "#fff", "#14223a", "👑 ");
  tkComment(pop(t, T.comment - 0.1, T.law - 0.15), "Luca", "Keine Steuern", "Vor 16 Std.", 1, AV.luca, 265);
  if (t >= T.law && t < T.gab) {
    const a = pop(t, T.law, T.gab - 0.15);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("📜 GESETZ NR. 2", 0, 0, 44, "#fff", "#0e1a30", 10); ctx.restore();
    if (t >= T.lawWrite) { const b = pop(t, T.lawWrite, T.gab - 0.15); ctx.save(); ctx.translate(288, 258); ctx.rotate(-0.04); ctx.scale(b, b); outlined("KEINE STEUERN! 💸", 0, 0, 40, RED, "#0e1a30", 10); ctx.restore(); }
    confetti(t, T.steuern);
  }
  tkComment(pop(t, T.gab, T.els - 0.15), "Gabriel Emilijan", "Laserschwert haben", "Vor 15 Std.", 1, AV.gabriel, 215);
  stamp("✓ ERFÜLLT", 420, 262, pop(t, T.sword + 0.15, T.els - 0.15));
  tkComment(pop(t, T.els, T.ente - 0.15), "elster", "Kann ich ein Astronaut sein mit Hundeohren und einen pinken Anzug?", "Vor 10 Std.", 4, AV.elster, 215);
  stamp("✓ ERFÜLLT", 420, 292, pop(t, T.suit + 0.4, T.ente - 0.15));
  tkComment(pop(t, T.ente, T.doner - 0.15), "Entenlover", "Astronaut Nummer 410 wil ein enten Freund", "Vor 5 Std.", 4, AV.ente, 215);
  stamp("✓ ERFÜLLT", 420, 268, pop(t, T.duck + 0.2, T.doner - 0.15));
  if (t >= T.gab && t < T.doner) {
    const c = t < T.els ? g : t < T.ente ? e : d, lab = t < T.els ? "Gabriel" : t < T.ente ? "elster" : "Nr. 410";
    const [sx, sy] = toScreen(c.x, c.y - 150, t);
    pill(lab, sx, sy, pop(t, t < T.els ? T.gab + 0.2 : t < T.ente ? T.els + 0.2 : T.ente + 0.2, t < T.els ? T.els - 0.15 : t < T.ente ? T.ente - 0.15 : T.doner - 0.15), "#fff", "#14223a");
  }
  label("MEISTGEWÜNSCHT: DÖNER 🥙", 288, 210, pop(t, T.doner + 0.1, T.shop - 0.1), "#ff8a2a");
  stamp("✓ ERÖFFNET", 300, 250, pop(t, T.shopDone, T.night - 0.15));
  label("⚠ EINGEHENDER FUNKSPRUCH", 288, 210, pop(t, T.funk - 0.1, T.alien - 0.1));
  if (t >= T.alien && t < T.attack) tvBreaking(t, pop(t, T.alien, T.attack - 0.12, 0.25));
  if (t >= T.attack && t < T.together) {
    label("⏳ ANGRIFF IN 24 STUNDEN", 288, 175, pop(t, T.attack, T.together - 0.15));
    counterTimer(t, pop(t, T.attack + 0.15, T.fleet - 0.1));
    label("SPÄHER 👀", 288, 330, pop(t, T.scout + 0.15, T.fleet - 0.1), "#2fa84f");
  }
  if (t >= T.together && t < T.choose) {
    const a = pop(t, T.z630, T.choose - 0.12);
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("630", 0, 0, 92, CYAN, "#0e1a30", 13); outlined("✊ ZUSAMMEN", 0, 58, 30, "#fff", "#0e1a30", 8); ctx.restore();
  }
  if (t >= T.choose && t < T.poll) {
    const out = 1 - ramp(t, T.poll - 0.15, T.poll);
    choiceCard("🚀", "ABHAUEN", 160, 300, back(ramp(t, T.cardA, T.cardA + 0.3)) * out, -0.08);
    if (t >= T.cardB) { const b = back(ramp(t, T.cardB, T.cardB + 0.3)) * out; ctx.save(); ctx.translate(288, 300); ctx.scale(b, b); outlined("ODER", 0, 0, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
    choiceCard("⚔️", "KÄMPFEN", 416, 300, back(ramp(t, T.cardB, T.cardB + 0.3)) * out, 0.08);
  }
  if (t >= T.poll && t < T.follow) {
    pollCard(t, pop(t, T.poll, T.follow - 0.12));
    if (t >= T.vote) { const b = pop(t, T.vote, T.follow - 0.12); ctx.save(); ctx.translate(288, 360); ctx.scale(b, b); outlined("STIMM AB! 👇", 0, 0, 40, CYAN, "#0e1a30", 10); ctx.restore(); }
  }
  if (t >= T.follow) {
    avatarBadge(288, 210, pop(t, T.follow, DUR - 0.2), ramp(t, wt(131), wt(131) + 0.25));
    if (t >= wt(133)) { const b = pop(t, wt(133), DUR - 0.2); ctx.save(); ctx.translate(288, 300); ctx.scale(b, b); outlined("JEDER ASTRONAUT", 0, -20, 34, "#fff", "#0e1a30", 9); outlined("ZÄHLT!", 0, 20, 34, CYAN, "#0e1a30", 9); ctx.restore(); }
  }
  // Untertitel; Alien-Funk in grüner Box
  if (t >= T.alien - 0.05 && t < T.alienEnd - 0.05) {
    ctx.save(); ctx.translate(288, 795);
    ctx.fillStyle = "rgba(10,30,15,0.92)"; rr(-210, -34, 420, 62, 12); ctx.fill(); ctx.strokeStyle = "#5fd35a"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#5fd35a"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("👽 ALIEN-FUNK", 0, -44);
    ctx.restore();
  }
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, land: T.land, count: [T.count0, T.count1], card: T.card, e630: T.e630,
    pops: [T.unauf + 0.1, T.top, T.comment - 0.1, T.law, T.lawWrite, T.gab, T.els, T.ente, T.doner + 0.1, T.shop, T.attack, T.together, T.cardA, T.cardB, T.poll, T.vote, T.follow],
    dings: [T.sword + 0.15, T.suit + 0.4, T.duck + 0.2, T.shopDone], sword: T.sword, duck: T.duck, confetti: [T.e630, T.card + 0.4, T.steuern],
    night: T.night, funk: T.funk, alien: [T.alien, T.alienEnd], ufos: T.ufos, end: T.end,
    whooshes: CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.25) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const n of ["luca", "gabriel", "elster", "ente"]) AV[n] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = n + ".png"; });
  makeSprites();
  return { duration: DUR };
};
