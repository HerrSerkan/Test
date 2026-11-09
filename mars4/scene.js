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
// ============================================================ Tag 4 (base.js + helpers3.js + lib4.js + tag4.js -> scene.js)
const T = {
  poll: wt(2), fight: wt(9), count0: wt(10), count1: wt(16), card: wt(18), together: wt(25), ausbau: wt(28), schnell: wt(35),
  werft: wt(36), tower: wt(42), funk: wt(46), shieldc: wt(55), packt: wt(61), jakob: wt(67), stone: wt(70), bz: wt(71), chicken: wt(74),
  hero: wt(78), bag: wt(82), shieldOn: wt(84), shieldTitle: wt(91), speech: wt(98), banner: wt(106), banner2: wt(109), cd: wt(116),
  alarm: wt(121), fleet: wt(122), hundreds: wt(126), laser: wt(133), hit: wt(134), bebt: wt(138), flicker: wt(141), holds: wt(142),
  funkMsg: wt(146), alien: wt(152), alienEnd: wt(156), niemals: wt(156), plan: wt(157), planBook: wt(160), top: wt(171), end: SPEECH_END,
};
const NEW = 159, FOLLOWERS = 788, LIKES = "4.104", FOLLOWING = "7", EINWOHNER = 789;
const AV = {};

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

// ------------------------------------------------------------ Kamera
const CAM = [
  [0, 335, 625, 1.5], [T.count0 - 0.2, 335, 625, 1.5], [T.count0 + 0.2, 335, 330, 1.1], [T.card - 0.1, 335, 330, 1.1],
  [T.together - 0.1, 335, 360, 1.05], [T.together + 0.3, 340, 620, 1.4], [T.ausbau - 0.1, 340, 620, 1.4], [T.ausbau + 0.35, 300, 600, 0.6],
  [T.werft - 0.15, 300, 600, 0.62], [T.werft + 0.3, -180, 520, 1.25], [T.tower - 0.15, -180, 520, 1.25], [T.tower + 0.3, 790, 540, 1.6],
  [T.funk - 0.15, 790, 540, 1.6], [T.funk + 0.3, 1000, 430, 1.05], [T.shieldc - 0.15, 1000, 430, 1.05], [T.shieldc + 0.3, 620, 560, 1.45],
  [T.packt - 0.15, 620, 560, 1.45], [T.packt + 0.3, 380, 590, 0.75], [T.jakob - 0.15, 380, 590, 0.78], [T.jakob + 0.25, WISH.jakob.x, 700, 2.3],
  [T.bz - 0.15, WISH.jakob.x, 700, 2.3], [T.bz + 0.25, WISH.bz.x, 700, 2.3], [T.hero - 0.15, WISH.bz.x, 700, 2.3], [T.hero + 0.25, WISH.hero.x, 702, 2.3],
  [T.shieldOn - 0.15, WISH.hero.x, 702, 2.3], [T.shieldOn + 0.35, 330, 520, 0.5], [T.speech - 0.15, 330, 520, 0.52], [T.speech + 0.3, 430, 660, 1.7],
  [T.cd - 0.1, 430, 660, 1.75], [T.cd + 0.3, 400, 560, 0.85], [T.alarm - 0.1, 400, 560, 0.88], [T.fleet + 0.3, 380, 380, 0.8],
  [T.laser - 0.1, 380, 380, 0.82], [T.laser + 0.3, 360, 470, 0.7], [T.funkMsg - 0.15, 360, 470, 0.72], [T.funkMsg + 0.3, 430, 650, 1.6],
  [T.niemals - 0.1, 430, 650, 1.65], [T.niemals + 0.25, 430, 640, 1.35], [T.plan - 0.1, 430, 640, 1.4], [T.plan + 0.3, 430, 660, 1.8],
  [T.end, 430, 660, 1.85], [DUR, 425, 655, 1.75],
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
function book(x, y, s, state, t) { // Schlachtplan-Buch
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#8a6a3a"; rr(-34, -20, 68, 36, 3); ctx.fill();
  ctx.fillStyle = "#fbf6e6"; rr(-32, -18, 31, 32, 2); ctx.fill(); rr(1, -18, 31, 32, 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#333"; ctx.font = "900 7px InterX"; ctx.fillText("PLAN", -16, -9);
  ctx.fillStyle = RED; ctx.font = "16px Comic"; ctx.fillText("?", -16, 5);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 0; i < 4; i++) ctx.fillRect(6, -10 + i * 6, 20, 1.5);
  ctx.restore();
}
function pollTikTok(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 245); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 14; ctx.fillStyle = "#1e1e22"; rr(-245, -110, 490, 220, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  if (AV.me) { ctx.save(); ctx.beginPath(); ctx.arc(-205, -72, 22, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, -227, -94, 44, 44); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#a9a9b0"; ctx.font = "800 16px InterX"; ctx.fillText("Gedacht ·", -170, -84); ctx.fillStyle = "#5aa7e6"; ctx.fillText("Creator*in", -88, -84);
  ctx.fillStyle = "#fff"; ctx.font = "800 22px InterX"; ctx.fillText("Was machen wir", -170, -56);
  const k = easeOut(ramp(t, T.poll + 0.2, T.poll + 1.0));
  // Abhauen
  ctx.fillStyle = "#2a2a30"; rr(-170, -32, 392, 42, 12); ctx.fill(); ctx.strokeStyle = "#45454d"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#4a4a52"; rr(-170, -32, 392 * 0.04 * k + 6, 42, 12); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "800 18px InterX, 'Noto Color Emoji'"; ctx.fillText("Abhauen 🚀", -156, -10);
  ctx.fillStyle = "#a9a9b0"; ctx.textAlign = "right"; ctx.fillText(Math.round(4 * k) + "%", 208, -10);
  // Kämpfen
  ctx.textAlign = "left"; ctx.fillStyle = "#2a2a30"; rr(-170, 18, 392, 42, 12); ctx.fill();
  ctx.fillStyle = "#f4f4f6"; rr(-170, 18, 392 * 0.96 * k, 42, 12); ctx.fill();
  ctx.fillStyle = k > 0.3 ? "#111" : "#fff"; ctx.font = "800 18px InterX, 'Noto Color Emoji'"; ctx.fillText("Kämpfen ⚔️", -156, 40);
  ctx.textAlign = "right"; ctx.fillText(Math.round(96 * k) + "%", 208, 40);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8a92"; ctx.font = "700 13px InterX"; ctx.fillText("1 T", -170, 86); ctx.textAlign = "right"; ctx.fillText("127 Stimmen · Noch 6 Tage", 222, 86);
  ctx.restore();
}
function profileCard(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 250); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16; ctx.fillStyle = "#121216"; rr(-245, -105, 490, 210, 16); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff"; ctx.font = "900 24px InterX"; ctx.fillText("Gedacht", -222, -76);
  ctx.fillStyle = "#8a8a92"; ctx.font = "700 12px InterX"; ctx.fillText("@einfach..wissen", -222, -54);
  const n = Math.round(lerp(629, FOLLOWERS, easeOut(ramp(t, T.card + 0.1, T.card + 0.7))));
  [[FOLLOWING, "Gefolgt"], [String(n), "Follower*innen"], [LIKES, "Likes"]].forEach(([v, l], i) => { const x = -222 + i * 110; ctx.fillStyle = "#fff"; ctx.font = "900 17px InterX"; ctx.fillText(v, x, -24); ctx.fillStyle = "#8a8a92"; ctx.font = "700 10.5px InterX"; ctx.fillText(l, x, -6); });
  ctx.strokeStyle = RED; ctx.lineWidth = 3; rr(-118, -40, 104, 46, 6); ctx.stroke();
  ctx.fillStyle = "#fe2c55"; rr(-222, 16, 190, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.fillText("Folgen", -127, 33);
  ctx.fillStyle = "#2c2c33"; rr(-22, 16, 150, 34, 6); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText("Nachricht", 53, 33);
  ctx.fillStyle = "#2c2c33"; rr(136, 16, 40, 34, 6); ctx.fill(); ctx.fillText("👤", 156, 33);
  ctx.textAlign = "left"; ctx.font = "700 12px InterX, 'Noto Color Emoji'"; ctx.fillStyle = "#e6e6ea";
  ctx.fillText("1 Follow = 1 Astronaut 🚀", -222, 70); ctx.fillText("Top-Kommentar = neues Gesetz 📜", -222, 88);
  if (AV.me) { circle(190, -60, 38, "#fff"); ctx.save(); ctx.beginPath(); ctx.arc(190, -60, 35, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(AV.me, 155, -95, 70, 70); ctx.restore(); }
  ctx.restore();
  const k = back(ramp(t, T.card + 0.5, T.card + 0.75));
  if (k > 0) { ctx.save(); ctx.translate(205, 290); ctx.rotate(-0.12); ctx.scale(k * s, k * s); ctx.fillStyle = RED; rr(-78, -18, 156, 36, 6); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+159 NEUE", 0, 2); ctx.restore(); }
}
function builtBanner(icon, txt, s) { // „NEU GEBAUT“-Schild
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 205); ctx.rotate(-0.03); ctx.scale(s, s);
  ctx.font = "34px Comic, 'Noto Color Emoji'"; const w = ctx.measureText(icon + " " + txt).width + 40;
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-w / 2, -34, w, 68, 12); ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#1b1424"; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px"; ctx.fillText("NEU GEBAUT", 0, -20); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#1b1424"; ctx.font = "32px Comic, 'Noto Color Emoji'"; ctx.fillText(icon + " " + txt, 0, 8);
  ctx.restore();
}
function shieldBar(t, s) {
  if (s <= 0.01) return;
  let v = 100; if (t >= T.hit) v = lerp(100, 68, easeOut(ramp(t, T.hit, T.hit + 0.4))); if (t >= T.flicker) v = lerp(68, 63, easeOut(ramp(t, T.flicker, T.flicker + 0.3)));
  const col = v > 80 ? "#3fd3f2" : v > 66 ? "#ffb43a" : "#ff6a3d";
  ctx.save(); ctx.translate(288, 185); ctx.scale(s, s);
  outlined("🛡 SCHILD: " + Math.round(v) + " %", 0, -22, 30, "#fff", "#0e1a30", 8);
  ctx.fillStyle = "#1b1424"; rr(-160, 2, 320, 22, 11); ctx.fill(); ctx.fillStyle = col; rr(-156, 6, 312 * v / 100, 14, 7); ctx.fill();
  ctx.restore();
}
function tvBreaking4(t, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 260); ctx.scale(s, s);
  ctx.fillStyle = "#1b1424"; rr(-236, -150, 472, 300, 14); ctx.fill();
  ctx.fillStyle = "#0b1020"; rr(-228, -112, 456, 196, 6); ctx.fill();
  ctx.fillStyle = "#e5262b"; rr(-228, -142, 456, 30, [8, 8, 0, 0]); ctx.fill();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = "20px Comic"; ctx.fillText("🔴 EILMELDUNG", -216, -126);
  ctx.fillStyle = "#fff"; rr(98, -136, 120, 20, 4); ctx.fill(); ctx.fillStyle = "#e5262b"; ctx.font = "900 10px InterX"; ctx.fillText("LIVE · ALIEN-FLOTTE", 104, -126);
  for (let i = 0; i < 30; i++) circle(-220 + (i * 61) % 440, -100 + (i * 37) % 180, 1.2, "rgba(255,255,255,0.6)");
  ctx.save(); ctx.beginPath(); ctx.rect(-228, -112, 456, 196); ctx.clip();
  ctx.save(); ctx.translate(90, 60); ctx.rotate(0.15); ctx.fillStyle = "#e6e9ee"; ctx.fillRect(-3, -120, 6, 160); ctx.fillStyle = "#4a2b9a"; ctx.fillRect(3, -118, 80, 52);
  ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(43, -92, 22, 6, -0.2, 0, Math.PI * 2); ctx.stroke(); circle(43, -92, 12, "#e2552e"); ctx.restore();
  alienFace(-20, 10, 1.25 + 0.03 * Math.sin(t * 3), t);
  ctx.restore();
  ctx.fillStyle = "#ffd23a"; ctx.fillRect(-228, 84, 456, 30); ctx.fillStyle = "#1b1424"; ctx.font = "16px Comic"; ctx.fillText("BOTSCHAFT AN ROTANIEN: „LETZTE CHANCE. GEBT AUF.“", -218, 99.5);
  ctx.fillStyle = "#1b1424"; ctx.fillRect(-228, 114, 456, 26);
  ctx.save(); ctx.beginPath(); ctx.rect(-228, 114, 456, 26); ctx.clip();
  ctx.fillStyle = "#ffd23a"; ctx.font = "15px Comic"; const tick = "+++ LETZTE CHANCE +++ SCHILD UNTER BESCHUSS +++ HUNDERTE RAUMSCHIFFE +++ ROTANIEN GIBT NICHT AUF? ";
  const off = -((t - T.alien) * 120) % 700; ctx.fillText(tick + tick, -228 + off, 128); ctx.restore();
  ctx.restore();
}
function commentPlan(s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(288, 268); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 12; ctx.fillStyle = "#fff"; rr(-225, -46, 450, 92, 14); ctx.fill(); ctx.shadowColor = "transparent";
  circle(-190, -8, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -190, -7);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 12px InterX"; ctx.fillText("dein.name", -158, -24);
  ctx.fillStyle = "#e3f8fd"; rr(-88, -34, 104, 20, 10); ctx.fill(); ctx.fillStyle = "#119ab8"; ctx.font = "900 11px InterX, 'Noto Color Emoji'"; ctx.fillText("🏆 Top-Kommentar", -82, -23.5);
  ctx.fillStyle = "#111"; ctx.font = "800 19px InterX, 'Noto Color Emoji'"; ctx.fillText("Dein Schlachtplan? 🤔⚔️", -158, 2);
  ctx.fillStyle = "#a0a4ad"; ctx.font = "700 10.5px InterX"; ctx.fillText("gerade eben  ·  Antworten", -158, 26);
  ctx.fillStyle = "#fe2c55"; ctx.font = "16px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 195, -12);
  ctx.fillStyle = "#8a8f9a"; ctx.font = "700 10px InterX"; ctx.fillText("999+", 195, 10);
  ctx.restore();
}
function rucksackCard(s) { // Kommentar von herobrine mit Foto
  if (s <= 0.01) return;
  tkComment(s, "herobrine", "leude ich mach mit aber nur wenn ich mein Rucksack mitnehmen darf der Rucksack:", "Vor 21 Std.", 1, AV.herobrine, 205);
  if (AV.ruck) { ctx.save(); ctx.translate(288, 205); ctx.scale(s, s); ctx.save(); ctx.translate(165, 118); ctx.rotate(0.07); ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 8; ctx.fillStyle = "#fff"; ctx.fillRect(-42, -44, 84, 92); ctx.shadowColor = "transparent"; ctx.drawImage(AV.ruck, -38, -40, 76, 80); ctx.restore(); ctx.restore(); }
}
// Effekte
const IMPACTS = [T.fight, T.card + 0.5, T.werft, T.tower, T.funk, T.shieldc, T.shieldOn + 0.2, T.banner, T.alarm, T.hit, T.bebt, T.flicker, T.niemals];
function shakeAt(t) {
  let dx = 0, dy = 0;
  for (const t0 of IMPACTS) { const d = t - t0; if (d < 0 || d > 0.4) continue; const big = t0 === T.hit || t0 === T.bebt ? 2.2 : 1; const a = 7 * big * Math.exp(-d * 11); dx += Math.sin(d * 90) * a; dy += Math.cos(d * 70) * a * 0.6; }
  return [dx, dy];
}
const CUTS = CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.05);
function flash(t) {
  let a = 0; for (const t0 of CUTS) { const d = t - t0; if (d >= 0 && d < 0.14) a = Math.max(a, 0.22 * (1 - d / 0.14)); }
  for (const t0 of [T.shieldOn + 0.2, T.alarm, T.hit, T.niemals]) { const d = t - t0; if (d >= 0 && d < 0.22) a = Math.max(a, 0.55 * (1 - d / 0.22)); }
  if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, W, H); }
}
function shieldDome(t) { // riesige Kuppel über der Stadt (Weltkoordinaten)
  const k = easeOut(ramp(t, T.shieldOn, T.shieldOn + 0.8)); if (k <= 0) return;
  const flick = t >= T.flicker && t < T.flicker + 0.8 ? (Math.sin(t * 60) > 0 ? 0.35 : 1) : 1;
  const hitGlow = t >= T.hit ? Math.exp(-(t - T.hit) * 3) : 0;
  const cx = 330, cy = 760, rx = 1250 * k, ry = 820 * k;
  ctx.save(); ctx.globalAlpha = flick;
  const g = ctx.createRadialGradient(cx, cy - ry * 0.4, ry * 0.2, cx, cy, ry);
  g.addColorStop(0, "rgba(63,211,242,0.05)"); g.addColorStop(0.85, `rgba(63,211,242,${0.14 + 0.25 * hitGlow})`); g.addColorStop(1, `rgba(140,240,255,${0.45 + 0.3 * hitGlow})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = `rgba(160,245,255,${0.7 + 0.3 * hitGlow})`; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = "rgba(160,245,255,0.18)"; ctx.lineWidth = 2;
  for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry * i / 7, 0, Math.PI, 0); ctx.stroke(); }
  for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx * i / 8, ry, 0, Math.PI, 0); ctx.stroke(); }
  ctx.restore();
}
const FLEET = (() => { const r = rng(64), a = []; for (let i = 0; i < 60; i++) { const s = 0.9 + r() * 1.1; a.push({ x: -450 + r() * 1600, y: -230 + r() * 260 - (s - 1) * 40, s, d: r() * 1.2 }); } a.sort((p, q) => p.s - q.s); return a; })();

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  MAIN.fillStyle = "#000"; MAIN.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  let [cx, cy, z] = cam(t);
  cx += Math.sin(t * 0.9) * 3 / z; cy += Math.cos(t * 0.7) * 2 / z;
  const [shx, shy] = shakeAt(t); ctx.translate(shx, shy);
  const night = ramp(t, T.shieldOn, T.shieldOn + 0.8);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  sky(t); ground();
  // Alien-Flotte
  if (t >= T.fleet - 0.2) for (const [i, f] of FLEET.entries()) { const k = clamp((t - T.fleet - f.d * (t < T.hundreds ? 1 : 0.3)) / 0.4); if (k > 0) ufo(f.x, f.y - (1 - k) * 300, f.s, t, i); }
  for (const h of HOUSES) { const k = back(clamp((t - T.ausbau - h.d * 0.8) / 0.3)); if (k > 0) house(h.x, h.y, h.s * k, h.c); }
  for (const [x, y, s] of BGROCKETS) rocket(x, y, s, 0);
  massCrowd(t, (t >= T.together && t < T.ausbau) || (t >= T.niemals && t < T.plan + 0.5) || (t >= T.banner2 && t < T.cd) ? 1 : 0);
  // Scheinwerfer der Wachtürme
  if (t >= T.tower) { const a = ramp(t, T.tower, T.tower + 0.4); beam(790, 455, -2.2 + Math.sin(t * 0.8) * 0.5, 520, 70, a); beam(-430, 470, -1.0 + Math.sin(t * 0.7 + 1) * 0.5, 520, 70, a); }
  const worldM = ctx.getTransform();
  ctx = LCTX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(worldM);
  radioTower(1000, 700, 1, t, ramp(t, T.funk - 0.05, T.funk + 0.5));
  shipyard(-180, 705, 1, back(ramp(t, T.werft - 0.05, T.werft + 0.35)));
  watchtower(790, 712, 1, t, back(ramp(t, T.tower - 0.05, T.tower + 0.3))); watchtower(-430, 712, 1, t, back(ramp(t, T.tower + 0.1, T.tower + 0.4)));
  boulders(); dome(330, 690); sign(445, 690);
  shieldCore(620, 712, 1, t, back(ramp(t, T.shieldc - 0.05, T.shieldc + 0.35)));
  rocket(150, 690, 0.95, 0); rocket(-80, 700, 0.95, 0); rocket(720, 700, 0.95, 0);
  donerShop(30, 705, 0.95);
  lambo(905, 742, 0.75);                                   // Easter Egg: Lambo
  // Front-Reihe mit Easter Eggs
  for (const [i, e] of EGGS.entries()) {
    const o = { t: t + i * 0.7, acc: e.acc };
    let f = ["smile", "happy", "talk"][i % 3];
    if (t >= T.alarm && t < T.niemals) f = "shock";
    if ((t >= T.together && t < T.ausbau) || (t >= T.niemals && t < T.plan + 0.5)) { o.armL = 2.6; o.armR = -2.6; f = "happy"; }
    astronaut(e.x, e.y, e.s, f, o); eggItem(e.k, e.x, e.y, e.s, t);
  }
  // Wunsch-Astronauten
  const J = WISH.jakob, B = WISH.bz, Hh = WISH.hero;
  astronaut(J.x, J.y, 1, t >= T.stone ? "happy" : "smile", { t, acc: J.acc });
  if (t >= T.stone) stoneFriend(J.x + 55, J.y, back(ramp(t, T.stone, T.stone + 0.3)), t);
  if (t >= T.bag) backpack(Hh.x, Hh.y, back(ramp(t, T.bag, T.bag + 0.3)));
  astronaut(Hh.x, Hh.y, 1, t >= T.bag ? "happy" : "smile", { t: t + 2, acc: Hh.acc, wave: t >= T.bag && t < T.shieldOn });
  astronaut(B.x, B.y, 1, t >= T.chicken ? "happy" : "smile", { t: t + 1, acc: B.acc });
  if (t >= T.chicken) chickenHat(B.x, B.y - 104, back(ramp(t, T.chicken, T.chicken + 0.3)), t);
  // Rednerpult + Hauptfigur
  const pod = back(ramp(t, T.speech - 0.1, T.speech + 0.25));
  podium(430, 745, pod);
  let face = "talk", o = { t };
  if (t >= T.fight) { face = "happy"; o.armL = 2.6; o.armR = -2.6; }
  if (t >= T.count0) { face = "talk"; o.armL = 0.25; o.armR = -0.25; }
  if (t >= T.together) { face = "happy"; o.wave = true; }
  if (t >= T.ausbau) { o.wave = false; face = "smirk"; }
  if (t >= T.jakob) face = "smile";
  if (t >= T.shieldOn) { face = "happy"; o.armR = -2.5; }
  if (t >= T.speech) { face = "talk"; o.armR = -0.25; }
  if (t >= T.banner) { face = "happy"; o.armR = -2.6; }
  if (t >= T.cd) { face = "think"; o.armR = -0.25; }
  if (t >= T.alarm) face = "shock";
  if (t >= T.niemals) { face = "smirk"; o.armL = 2.6; o.armR = -2.6; }
  if (t >= T.plan) { face = "think"; o.armL = 0.25; o.armR = -0.25; }
  if (t >= T.planBook) { face = "smirk"; o.hold = "plan"; o.armL = -0.5; o.armR = 0.5; }
  astronaut(430, 742 - 18 * clamp(pod), 1, face, o);
  ctx = MAIN;
  compositeOutline(clamp(2.2 * S * Math.pow(z, 0.75), 2.5, 8));
  if (t >= T.werft && t < T.werft + 1.2) puffs(-180, 712, t, T.werft);
  if (t >= T.shieldc && t < T.shieldc + 1.2) puffs(620, 715, t, T.shieldc);
  shieldDome(t);
  // Laser auf den Schild
  if (t >= T.laser && t < T.flicker + 0.6) {
    for (const [i, t0] of [T.laser, T.hit + 0.5, T.bebt - 0.1, T.flicker - 0.1].entries()) {
      const d = t - t0; if (d < 0 || d > 0.35) continue;
      const f = FLEET[(i * 7 + 3) % FLEET.length], tx = 200 + i * 120, ty = 760 - 640;
      ctx.save(); ctx.globalAlpha = 1 - d / 0.35; ctx.strokeStyle = "#7bff5a"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(f.x, f.y + 12); ctx.lineTo(tx, ty); ctx.stroke(); ctx.strokeStyle = "#e9ffd8"; ctx.lineWidth = 3; ctx.stroke();
      glow(tx, ty, 90, "160,255,140", 0.8); ctx.restore();
    }
  }
  ctx.restore();
  dust(t);
  if (night > 0) { ctx.fillStyle = `rgba(20,25,70,${0.32 * night})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.alarm && t < T.niemals) { const p = 0.5 + 0.5 * Math.sin(t * 7); const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); rg.addColorStop(0, "rgba(255,0,0,0)"); rg.addColorStop(1, `rgba(230,20,20,${0.5 * p})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
  const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,5,5,0.45)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  speedLines(t, t >= T.count0 && t < T.card ? 1 : 0);
  for (const [c, t0] of [[J, T.stone], [B, T.chicken], [Hh, T.bag]]) if (t >= t0 && t < t0 + 0.8) { const [sx, sy] = toScreen(c.x, c.y - 100, t); sparkleBurst(sx, sy, t, t0); }

  // ---- Einblendungen
  const tag = pop(t, 0.12, T.poll - 0.15);
  if (tag > 0) { ctx.save(); ctx.translate(288, 190); ctx.scale(tag, tag); outlined("TAG 4", 0, 0, 92, CYAN, "#0e1a30", 13); ctx.restore(); }
  if (t >= T.poll && t < T.count0) {
    pollTikTok(t, pop(t, T.poll, T.count0 - 0.12));
    stamp("96 % ⚔️ KÄMPFEN", 330, 330, pop(t, T.fight, T.count0 - 0.12), -0.1, "#2fb8e0");
    confetti(t, T.fight);
  }
  if (t >= T.count0 - 0.1 && t < T.card) {
    const n = Math.round(NEW * easeIO(ramp(t, T.count0, T.count1)));
    const a = pop(t, T.count0 - 0.1, T.card - 0.1, 0.2);
    if (t >= T.count1) { ctx.save(); ctx.globalAlpha = 0.4; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t; ctx.fillStyle = CYAN; ctx.beginPath(); ctx.moveTo(288, 210); ctx.arc(288, 210, 420, an, an + 0.12); ctx.fill(); } ctx.restore(); }
    ctx.save(); ctx.translate(288, 200); ctx.scale(a, a); outlined("+" + n, 0, 0, 92, CYAN, "#0e1a30", 13); outlined("NEUE ASTRONAUTEN", 0, 60, 26, "#fff", "#0e1a30", 7); ctx.restore();
  }
  if (t >= T.card && t < T.together) { profileCard(t, pop(t, T.card, T.together - 0.12)); confetti(t, T.card + 0.4); }
  pill("WIR HALTEN ZUSAMMEN", 288, 190, pop(t, T.together, T.ausbau - 0.12), "#fff", "#14223a", "🤝 ");
  if (t >= T.ausbau && t < T.werft) { const a = pop(t, T.ausbau + 0.1, T.werft - 0.12); ctx.save(); ctx.translate(288, 195); ctx.scale(a, a); outlined("🏗️ AUSBAU", 0, 0, 52, CYAN, "#0e1a30", 11); outlined("HÄUSER FÜR ALLE", 0, 46, 26, "#fff", "#0e1a30", 7); ctx.restore(); }
  builtBanner("🚀", "RAKETENWERFT", pop(t, T.werft, T.tower - 0.12));
  builtBanner("🗼", "WACHTÜRME", pop(t, T.tower, T.funk - 0.12));
  builtBanner("📡", "FUNKTURM", pop(t, T.funk, T.shieldc - 0.12));
  builtBanner("🛡️", "SCHILDZENTRALE", pop(t, T.shieldc, T.packt - 0.12));
  pill("ALLE PACKEN MIT AN", 288, 190, pop(t, T.packt, T.jakob - 0.12), "#fff", "#14223a", "💪 ");
  // Wünsche
  tkComment(pop(t, T.jakob, T.bz - 0.15), "Jakob ✝️", "bitttteeeee ich will ein stein freund bitttteeee", "Vor 1 T.", 2, AV.jakob, 210);
  stamp("✓ ERFÜLLT", 420, 262, pop(t, T.stone + 0.15, T.bz - 0.15));
  tkComment(pop(t, T.bz, T.hero - 0.15), "Bz_Full", "ich mag nen Huhn auf meinem kopf", "Vor 1 T.", 1, null, 210);
  stamp("✓ ERFÜLLT", 420, 262, pop(t, T.chicken + 0.15, T.hero - 0.15));
  rucksackCard(pop(t, T.hero, T.shieldOn - 0.15));
  stamp("✓ ERFÜLLT", 400, 150, pop(t, T.bag + 0.15, T.shieldOn - 0.15), 0.1);
  if (t >= T.jakob && t < T.shieldOn) {
    const c = t < T.bz ? J : t < T.hero ? B : Hh, lab = t < T.bz ? "Jakob" : t < T.hero ? "Bz_Full" : "herobrine";
    const t0 = t < T.bz ? T.jakob : t < T.hero ? T.bz : T.hero, t1 = t < T.bz ? T.bz : t < T.hero ? T.hero : T.shieldOn;
    const [sx, sy] = toScreen(c.x, c.y - 150, t); pill(lab, sx, sy, pop(t, t0 + 0.2, t1 - 0.15), "#fff", "#14223a");
  }
  // Schild + Rede
  if (t >= T.shieldTitle && t < T.speech) { const a = pop(t, T.shieldTitle, T.speech - 0.12); ctx.save(); ctx.translate(288, 195); ctx.scale(a, a); outlined("🛡️ SCHUTZSCHILD", 0, 0, 46, CYAN, "#0e1a30", 11); outlined("AKTIV ✅", 0, 44, 30, "#fff", "#0e1a30", 8); ctx.restore(); }
  if (t >= T.banner && t < T.cd) {
    const a = pop(t, T.banner, T.cd - 0.12);
    ctx.save(); ctx.translate(288, 200); ctx.rotate(-0.04); ctx.scale(a, a);
    ctx.fillStyle = "#14223a"; rr(-200, -58, 400, 116, 16); ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.stroke();
    outlined("UNSER PLANET.", 0, -20, 40, "#fff", "#0e1a30", 8); if (t >= T.banner2) outlined("ZUSAMMEN.", 0, 26, 40, CYAN, "#0e1a30", 8);
    ctx.restore(); confetti(t, T.banner2);
  }
  // Countdown, Alarm, Flotte, Schild-Treffer
  if (t >= T.cd && t < T.alarm) {
    const left = Math.max(0, 3 - Math.floor((t - T.cd) / ((T.alarm - T.cd) / 3)));
    label("⏳ 00:00:0" + left, 288, 190, pop(t, T.cd, T.alarm - 0.05));
  }
  if (t >= T.alarm && t < T.laser) {
    const a = pop(t, T.alarm, T.laser - 0.1) * (1 + 0.06 * Math.max(0, Math.sin(t * 14)));
    ctx.save(); ctx.translate(288, 185); ctx.scale(a, a); outlined("⚠️ ALARM", 0, 0, 66, RED, "#0e1a30", 12); ctx.restore();
    label("🛸 HUNDERTE RAUMSCHIFFE", 288, 255, pop(t, T.hundreds, T.laser - 0.1));
  }
  if (t >= T.laser && t < T.funkMsg) shieldBar(t, pop(t, T.laser, T.funkMsg - 0.1));
  label("✅ ER HÄLT NOCH", 288, 260, pop(t, T.holds, T.funkMsg - 0.1), "#2fa84f");
  // Funkspruch + Alien-TV
  label("⚠ EINGEHENDER FUNKSPRUCH", 288, 210, pop(t, T.funkMsg, T.alien - 0.1));
  if (t >= T.alien && t < T.niemals) { tvBreaking4(t, pop(t, T.alien, T.niemals - 0.1, 0.25)); glitch(t, T.alien); }
  if (t >= T.niemals && t < T.plan + 0.1) { const a = pop(t, T.niemals, T.plan); ctx.save(); ctx.translate(288, 215); ctx.rotate(-0.06); ctx.scale(a * 1.1, a * 1.1); outlined("NIEMALS!", 0, 0, 84, "#fff", "#0e1a30", 14); ctx.restore(); confetti(t, T.niemals); }
  pill("WIR BRAUCHEN EINEN PLAN", 288, 185, pop(t, T.plan, T.top - 0.12), "#fff", "#14223a", "🤔 ");
  if (t >= T.top) {
    const a = pop(t, T.top, DUR - 0.2);
    ctx.save(); ctx.translate(288, 175); ctx.scale(a, a); outlined("📜 TOP-KOMMENTAR", 0, -20, 34, "#fff", "#0e1a30", 9); outlined("= SCHLACHTPLAN", 0, 22, 38, CYAN, "#0e1a30", 9); ctx.restore();
    commentPlan(pop(t, T.top + 0.25, DUR - 0.2));
  }
  ctx.save(); ctx.setTransform(S, 0, 0, S, 0, 0); flash(t); ctx.restore();
  if (t >= T.alien - 0.05 && t < T.alienEnd - 0.05) {
    ctx.save(); ctx.translate(288, 795);
    ctx.fillStyle = "rgba(10,30,15,0.92)"; rr(-210, -34, 420, 62, 12); ctx.fill(); ctx.strokeStyle = "#5fd35a"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#5fd35a"; ctx.font = "13px Comic"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("👽 ALIEN-FUNK", 0, -44);
    ctx.restore();
  }
  captions(t);
};
window.exportEvents = function () {
  return { duration: DUR, fight: T.fight, count: [T.count0, T.count1], card: T.card, together: T.together, ausbau: T.ausbau,
    builds: [T.werft, T.tower, T.funk, T.shieldc], wishes: [T.stone, T.chicken, T.bag], comments: [T.jakob, T.bz, T.hero], poll: T.poll,
    shieldOn: T.shieldOn, shieldTitle: T.shieldTitle, banner: [T.banner, T.banner2], cd: [T.cd, T.alarm], alarm: T.alarm, fleet: T.fleet, hundreds: T.hundreds,
    lasers: [T.laser, T.hit + 0.5, T.bebt - 0.1, T.flicker - 0.1], hit: T.hit, bebt: T.bebt, flicker: T.flicker, holds: T.holds, funkMsg: T.funkMsg,
    alien: [T.alien, T.alienEnd], niemals: T.niemals, plan: T.plan, top: T.top, end: T.end, impacts: IMPACTS,
    whooshes: CAM.slice(1).filter((c, i) => Math.abs(Math.log(c[3] / CAM[i][3])) > 0.2).map(c => c[0] - 0.25) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("38px Comic"), document.fonts.load("900 30px InterX"), document.fonts.load("700 12px InterX"), document.fonts.load("16px 'Noto Color Emoji'")]);
  for (const [k, f] of [["me", "me.png"], ["jakob", "jakob.png"], ["herobrine", "herobrine.png"], ["ruck", "rucksack.png"]]) AV[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = f; });
  makeSprites();
  return { duration: DUR };
};
