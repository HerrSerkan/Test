// "Wie viele Stunden noch?" – eigene Geschichte, eigene Zeichnung. Stimme: Edge TTS (de-DE-ConradNeural).
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";
const W = 1080, H = 1920;
const TEXT_TOP = 280, TEXT_CX = 510, TEXT_W = 820;   // Untertitel oben (unter den TikTok-Tabs)
const SC = [300, 1080];                     // Szene
const FL = 960;                             // Boden
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let TL = null, TOK = [], S = [];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function Wt(si, text, nth = 0) {
  const n = norm(text); const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) return S[si] + 0.3;
  return hits[Math.min(nth, hits.length - 1)].s;
}
function sentenceAt(t) { let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k] - 0.15) i = k; return i; }

// ------------------------------------------------------------ Figuren-Rig (eigener Flat-Stil: Gelenke, Kleidung, Blinzeln, Atmen)
// Kompatibel zur alten person(x, fy, o): o.f = Ausdruck, o.arm = [{side, ang}], o.walk = Phase, o.look, o.s
const SKINS = ["#f2c7a5", "#e0a982", "#c98e6a", "#f6d6bd", "#a8714f"];
function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function shade(hex, k) {             // k < 0 dunkler, k > 0 heller
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function limb(a, b, c, w, col) {     // zweiteiliges Glied mit runden Gelenken
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
}
function polar(p, ang, len) { return [p[0] + Math.sin(ang) * len, p[1] + Math.cos(ang) * len]; }
const BLINK = t => { const p = (t % 3.7) / 3.7; return p > 0.965 ? 1 : 0; };

function eyesMouth(x, y, u, f, look, t, seed) {
  const blink = f === "happy" || f === "laugh" ? 0 : BLINK(t + seed);
  const lx = look * 3.2 * u, ey = y - 2 * u;
  ctx.lineCap = "round";
  // Augenbrauen
  ctx.strokeStyle = "#3a2a24"; ctx.lineWidth = 2.6 * u;
  const bro = f === "sad" ? 1 : f === "annoyed" ? -1 : f === "wide" ? -0.6 : 0;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 13 * u - 6 * u + lx, ey - 12 * u - (s * bro > 0 ? 3 * u : 0)); ctx.lineTo(x + s * 13 * u + 6 * u + lx, ey - 12 * u - (s * bro < 0 ? 3 * u : 0)); ctx.stroke(); }
  // Augen
  for (const s of [-1, 1]) {
    const ex = x + s * 12.5 * u + lx;
    if (f === "happy" || f === "laugh") { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(ex, ey + 2 * u, 5 * u, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); continue; }
    if (f === "annoyed" || blink) { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(ex - 5 * u, ey); ctx.lineTo(ex + 5 * u, ey); ctx.stroke(); continue; }
    const big = f === "wide" ? 1.25 : 1;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, 6.2 * u * big, 7 * u * big, 0, 0, Math.PI * 2); ctx.fill();
    circle(ex + look * 1.8 * u, ey + 0.8 * u, 3.6 * u * big, "#2a2226");
    circle(ex + look * 1.8 * u + 1.4 * u, ey - 1 * u, 1.2 * u, "#fff");
  }
  // Nase
  ctx.strokeStyle = "rgba(120,60,40,0.35)"; ctx.lineWidth = 2.2 * u; ctx.beginPath(); ctx.arc(x + lx * 0.6, y + 6 * u, 3 * u, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  // Mund
  const my = y + 15 * u;
  ctx.strokeStyle = "#5a2a2a"; ctx.fillStyle = "#6a2a30"; ctx.lineWidth = 2.6 * u;
  if (f === "laugh") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my - 1 * u, 8 * u, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#f6f2ee"; ctx.fillRect(x + lx * 0.5 - 6 * u, my - 1 * u, 12 * u, 3 * u); }
  else if (f === "smile" || f === "happy") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my - 4 * u, 7 * u, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else if (f === "sad") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my + 5 * u, 6 * u, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (f === "whistle") { ctx.beginPath(); ctx.ellipse(x + lx * 0.5 + 4 * u, my, 3 * u, 3.8 * u, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (f === "wide") { ctx.beginPath(); ctx.ellipse(x + lx * 0.5, my, 3.6 * u, 4.6 * u, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(x + lx * 0.5 - 5 * u, my); ctx.quadraticCurveTo(x + lx * 0.5, my + 1.5 * u, x + lx * 0.5 + 5 * u, my); ctx.stroke(); }
}

function person(x, fy, o) {
  const t = RIG_T;
  const u = (o.s || 1) * 1.45;
  const seed = (o.seed !== undefined ? o.seed : hashStr(JSON.stringify(o.c2 || "") + (o.hair || ""))) % 7;
  const skin = o.skin || SKINS[seed % SKINS.length];
  const top = o.c2 || "#7fa8d8", topD = shade(top, -0.18), topL = shade(top, 0.15);
  const pants = o.legs || "#34405e", shoes = o.shoes || "#f4f2ee";
  const walking = !!o.walk, ph = o.walk || 0;
  const breath = walking ? 0 : Math.sin(t * 2.2 + seed) * 1.2 * u;
  const bob = walking ? Math.abs(Math.sin(ph)) * 4 * u : 0;
  const hipY = fy - 92 * u - bob, shY = hipY - 78 * u - breath, neckY = shY - 6 * u, hy = neckY - 36 * u;
  const tilt = (o.look || 0) * 0.04 + Math.sin(t * 0.9 + seed) * 0.015;
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(x, fy + 2, 44 * u, 8 * u, 0, 0, Math.PI * 2); ctx.fill();
  // Beine (Hüfte -> Knie -> Fuß)
  for (const sd of [-1, 1]) {
    const swing = walking ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.42 : 0;
    const hip = [x + sd * 13 * u, hipY];
    const knee = polar(hip, swing, 46 * u);
    const kneeBend = walking ? Math.max(0, -Math.sin(ph + (sd > 0 ? 0 : Math.PI))) * 0.6 : 0;
    const foot = polar(knee, swing - kneeBend, 44 * u);
    limb(hip, knee, foot, 21 * u, pants);
    ctx.fillStyle = shoes; ctx.beginPath(); ctx.ellipse(foot[0] + sd * 4 * u, foot[1] + 1 * u, 13 * u, 7 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(foot[0] + sd * 4 * u - 12 * u, foot[1] + 4 * u, 24 * u, 2.5 * u);
  }
  // Rumpf (Oberteil)
  const g = ctx.createLinearGradient(x - 40 * u, 0, x + 40 * u, 0);
  g.addColorStop(0, topL); g.addColorStop(0.55, top); g.addColorStop(1, topD);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 36 * u, shY + 10 * u); ctx.quadraticCurveTo(x - 38 * u, shY - 2 * u, x - 22 * u, shY - 2 * u);
  ctx.lineTo(x + 22 * u, shY - 2 * u); ctx.quadraticCurveTo(x + 38 * u, shY - 2 * u, x + 36 * u, shY + 10 * u);
  ctx.lineTo(x + 31 * u, hipY + 6 * u); ctx.quadraticCurveTo(x, hipY + 12 * u, x - 31 * u, hipY + 6 * u); ctx.closePath(); ctx.fill();
  if (o.hood) {                                       // Kapuze, Tasche, Kordeln
    ctx.fillStyle = topD; ctx.beginPath(); ctx.ellipse(x, shY + 2 * u, 26 * u, 9 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(top, -0.1); rr(x - 20 * u, hipY - 30 * u, 40 * u, 24 * u, 8 * u); ctx.fill();
    ctx.strokeStyle = "#f6f2ee"; ctx.lineWidth = 2.4 * u; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sd * 7 * u, shY + 8 * u); ctx.lineTo(x + sd * 8 * u, shY + 30 * u); ctx.stroke(); circle(x + sd * 8 * u, shY + 31 * u, 2.4 * u, "#f6f2ee"); }
  }
  if (o.apron) {
    ctx.fillStyle = "#7a5034"; rr(x - 24 * u, shY + 18 * u, 48 * u, hipY - shY + 20 * u, 6 * u); ctx.fill();
    ctx.fillStyle = "#64412a"; rr(x - 14 * u, hipY - 26 * u, 28 * u, 18 * u, 4 * u); ctx.fill();
    ctx.strokeStyle = "#7a5034"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(x - 20 * u, shY + 20 * u); ctx.lineTo(x - 10 * u, shY - 1 * u); ctx.moveTo(x + 20 * u, shY + 20 * u); ctx.lineTo(x + 10 * u, shY - 1 * u); ctx.stroke();
  }
  if (o.collar) { ctx.fillStyle = "#f6f2ee"; ctx.beginPath(); ctx.moveTo(x - 12 * u, shY - 2 * u); ctx.lineTo(x, shY + 12 * u); ctx.lineTo(x + 12 * u, shY - 2 * u); ctx.fill(); }
  // Hals + Kopf
  ctx.fillStyle = shade(skin, -0.12); rr(x - 7 * u, neckY - 10 * u, 14 * u, 16 * u, 4 * u); ctx.fill();
  ctx.save(); ctx.translate(x, hy + 30 * u); ctx.rotate(tilt); ctx.translate(-x, -(hy + 30 * u));
  for (const sd of [-1, 1]) circle(x + sd * 31 * u, hy + 2 * u, 7 * u, shade(skin, -0.06));        // Ohren
  const hg = ctx.createRadialGradient(x - 10 * u, hy - 12 * u, 4 * u, x, hy, 36 * u);
  hg.addColorStop(0, shade(skin, 0.12)); hg.addColorStop(1, skin);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(x, hy, 31 * u, 34 * u, 0, 0, Math.PI * 2); ctx.fill();
  // Haare
  if (o.white) {                                      // Opa: Glatze, weiße Seiten
    ctx.fillStyle = "#eceef2"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sd * 26 * u, hy - 6 * u, 9 * u, 16 * u, sd * 0.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(x - 8 * u, hy - 24 * u, 10 * u, 5 * u, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (o.hair) {
    ctx.fillStyle = o.hair;
    ctx.beginPath(); ctx.ellipse(x, hy - 16 * u, 33 * u, 22 * u, 0, Math.PI, 0); ctx.lineTo(x + 33 * u, hy - 4 * u);
    ctx.quadraticCurveTo(x + 18 * u, hy - 20 * u, x - 6 * u, hy - 18 * u); ctx.quadraticCurveTo(x - 24 * u, hy - 16 * u, x - 33 * u, hy - 2 * u); ctx.closePath(); ctx.fill();
    if (o.long) { ctx.beginPath(); ctx.ellipse(x - 28 * u, hy + 14 * u, 9 * u, 26 * u, 0.1, 0, Math.PI * 2); ctx.ellipse(x + 28 * u, hy + 14 * u, 9 * u, 26 * u, -0.1, 0, Math.PI * 2); ctx.fill(); }
  }
  eyesMouth(x, hy + 2 * u, u, o.f || "neutral", o.look || 0, t, seed);
  if (o.beard) { ctx.fillStyle = "#eceef2"; ctx.beginPath(); ctx.ellipse(x - 7 * u, hy + 12 * u, 9 * u, 4.5 * u, 0.25, 0, Math.PI * 2); ctx.ellipse(x + 7 * u, hy + 12 * u, 9 * u, 4.5 * u, -0.25, 0, Math.PI * 2); ctx.fill(); }
  if (o.glasses) { ctx.strokeStyle = "#3a3d4a"; ctx.lineWidth = 2.4 * u; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sd * 12.5 * u + (o.look || 0) * 3.2 * u, hy, 9.5 * u, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - 3 * u, hy - 1 * u); ctx.lineTo(x + 3 * u, hy - 1 * u); ctx.stroke(); }
  if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.ellipse(x, hy - 16 * u, 33 * u, 22 * u, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = shade(o.cap, -0.2); rr(x - 4 * u, hy - 20 * u, 46 * u, 9 * u, 4 * u); ctx.fill(); }
  if (o.blush) { ctx.fillStyle = "rgba(240,110,110,0.3)"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sd * 19 * u, hy + 10 * u, 6 * u, 3.6 * u, 0, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
  // Arme (Schulter -> Ellbogen -> Hand), Ärmel in Oberteil-Farbe
  const arms = o.arm || [];
  for (const sd of [-1, 1]) {
    const a = arms.find(q => q.side === sd);
    let ang;
    if (a) ang = -a.ang;                             // alte Konvention: negativer Winkel = Arm nach oben (rechts)
    else ang = walking ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * 0.45 : sd * 0.12 + Math.sin(t * 2.2 + seed) * 0.02;
    const sh = [x + sd * 32 * u, shY + 8 * u];
    const elbow = polar(sh, ang * (sd > 0 ? 1 : 1), 38 * u);
    const bend = a ? (Math.abs(a.ang) > 1.6 ? 0.35 : 0.2) * sd : (walking ? 0.25 : 0.12) * sd;
    const hand = polar(elbow, ang + bend * (a && a.ang < 0 ? -1 : 1), 34 * u);
    limb(sh, elbow, hand, 17 * u, top);
    ctx.strokeStyle = topD; ctx.lineWidth = 3 * u; ctx.beginPath(); const cuff = polar(elbow, ang + bend, 26 * u); ctx.moveTo(cuff[0] - 7 * u, cuff[1]); ctx.lineTo(cuff[0] + 7 * u, cuff[1]); ctx.stroke();
    circle(hand[0], hand[1], 8.5 * u, skin);
  }
  return { hx: x, hy: hy - 6 * u };
}
let RIG_T = 0;

// Hauptfigur DU (gelber Hoodie)
const DU = { c2: "#f2b33d", hair: "#3a2a22", hood: true, skin: "#f2c7a5", legs: "#2f3a5a", seed: 1 };
const OPA = { c2: "#8fb0d8", white: true, beard: true, glasses: true, apron: true, collar: true, skin: "#f0cdb0", legs: "#5a5e6a", shoes: "#6b4a2c", seed: 3 };

// Stunden-Anzeige über dem Kopf
function badge(x, y, val, a = 1, opt = {}) {
  if (a <= 0) return;
  const s = (opt.s || 1) * (0.6 + 0.4 * a);
  ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.translate(x, y); ctx.scale(s, s);
  const txt = typeof val === "number" ? val.toLocaleString("de-DE") : val;
  ctx.font = "900 30px InterX"; const w = ctx.measureText(txt).width + 104;
  ctx.fillStyle = opt.up ? "rgba(36,90,60,0.95)" : "rgba(22,24,36,0.92)"; rr(-w / 2, -26, w, 52, 26); ctx.fill();
  ctx.strokeStyle = opt.up ? "#7fe0a6" : "#f6b23a"; ctx.lineWidth = 2.5; rr(-w / 2, -26, w, 52, 26); ctx.stroke();
  // Sanduhr
  const ix = -w / 2 + 28; ctx.fillStyle = opt.up ? "#7fe0a6" : "#f6b23a";
  ctx.beginPath(); ctx.moveTo(ix - 9, -14); ctx.lineTo(ix + 9, -14); ctx.lineTo(ix, 0); ctx.lineTo(ix + 9, 14); ctx.lineTo(ix - 9, 14); ctx.lineTo(ix, 0); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(txt, ix + 18, 2);
  ctx.font = "700 14px InterX"; ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.fillText("STD", ix + 22 + ctx.measureText(txt).width + (30 - 14) * 0 + 8, 6);
  ctx.restore();
}
const pop = (t, t0) => back(ramp(t, t0, t0 + 0.3));

const TOPW = -280;                          // Hintergründe reichen im Vollbild bis über den oberen Rand
// ------------------------------------------------------------ Hintergründe
function bgStreet(t) {
  let g = ctx.createLinearGradient(0, TOPW, 0, FL); g.addColorStop(0, "#8fc6ec"); g.addColorStop(1, "#d8eef9");
  ctx.fillStyle = g; ctx.fillRect(0, TOPW, W, FL - TOPW);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = ["#c9a98a", "#b8c2d4", "#d9b48a", "#a8b8c8"][i % 4]; const x = i * 140 - 20, h = 300 + (i % 3) * 90; ctx.fillRect(x, FL - h, 130, h); ctx.fillStyle = "rgba(255,255,255,0.55)"; for (let k = 0; k < 6; k++) ctx.fillRect(x + 18 + (k % 2) * 56, FL - h + 30 + Math.floor(k / 2) * 70, 36, 40); }
  ctx.fillStyle = "#8a8f9c"; ctx.fillRect(0, FL, W, 420); ctx.fillStyle = "#6a6f7c"; ctx.fillRect(0, FL, W, 8);
}
function bgOffice() {
  ctx.fillStyle = "#dfe6f0"; ctx.fillRect(0, TOPW, W, FL - TOPW);
  ctx.fillStyle = "#c8d4e4"; ctx.fillRect(60, 380, 420, 260); ctx.fillStyle = "#a8c8ea"; ctx.fillRect(74, 394, 392, 232);
  ctx.fillStyle = "#5a6a82"; ctx.fillRect(0, FL, W, 420);
  ctx.fillStyle = "#7a5a3a"; ctx.fillRect(160, FL - 170, 360, 18); ctx.fillRect(180, FL - 152, 14, 152); ctx.fillRect(490, FL - 152, 14, 152);
  ctx.fillStyle = "#1d1d22"; rr(320, FL - 290, 150, 110, 8); ctx.fill(); ctx.fillStyle = "#7fd0ff"; ctx.fillRect(332, FL - 280, 126, 88);
  circle(560, FL - 200, 30, "#4a9a5a"); ctx.fillStyle = "#c8743a"; rr(540, FL - 180, 40, 50, 6); ctx.fill();
}
function bgElevator(t, open) {
  ctx.fillStyle = "#c8ccd6"; ctx.fillRect(0, TOPW, W, FL - TOPW);
  ctx.fillStyle = "#e9ecf2"; ctx.fillRect(240, 360, 600, FL - 360);
  ctx.fillStyle = "#f6f2e6"; ctx.fillRect(250, 370, 580, FL - 370);
  const o = open * 280;
  ctx.fillStyle = "#9aa3b4"; ctx.fillRect(250, 370, 290 - o, FL - 370); ctx.fillRect(540 + o, 370, 290 - o, FL - 370);
  ctx.fillStyle = "#1d1d22"; rr(870, 560, 50, 90, 8); ctx.fill(); circle(895, 590, 10, "#ffd36e"); circle(895, 620, 10, "#5a6070");
  ctx.fillStyle = "#4a4f5c"; ctx.fillRect(0, FL, W, 420);
}
function bgHome() {
  ctx.fillStyle = "#3a3458"; ctx.fillRect(0, TOPW, W, FL - TOPW);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(700, 380, 220, 220); ctx.fillStyle = "#1a2448"; ctx.fillRect(712, 392, 196, 196); circle(860, 440, 18, "#f3f0d6");
  ctx.fillStyle = "#5a4a8a"; rr(120, FL - 240, 520, 150, 30); ctx.fill(); ctx.fillStyle = "#6a5a9a"; rr(100, FL - 120, 560, 120, 24); ctx.fill();
  ctx.fillStyle = "#2a2340"; ctx.fillRect(0, FL, W, 420);
}
function bgWorkshop(t, outside) {
  if (outside) {
    let g = ctx.createLinearGradient(0, TOPW, 0, FL); g.addColorStop(0, "#9ad0f2"); g.addColorStop(1, "#e2f2fa"); ctx.fillStyle = g; ctx.fillRect(0, TOPW, W, FL - TOPW);
    circle(880, 400, 50, "#ffe27a"); glow(880, 400, 140, "255,226,122", 0.4);
    ctx.fillStyle = "#c86a4a"; ctx.fillRect(140, 470, 640, FL - 470); ctx.fillStyle = "#8a3a2a"; ctx.beginPath(); ctx.moveTo(110, 480); ctx.lineTo(460, 340); ctx.lineTo(810, 480); ctx.fill();
    ctx.fillStyle = "#3a2a22"; rr(340, 640, 240, FL - 640, [16, 16, 0, 0]); ctx.fill(); ctx.fillStyle = "#ffd88a"; rr(352, 652, 216, FL - 652, [12, 12, 0, 0]); ctx.fill();
    ctx.fillStyle = "#f6f2e6"; rr(330, 520, 260, 60, 8); ctx.fill(); ctx.fillStyle = "#3a2a22"; ctx.font = "900 26px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("FAHRRÄDER", 460, 551);
    ctx.fillStyle = "#6aaa5a"; ctx.fillRect(0, FL, W, 420);
  } else {
    ctx.fillStyle = "#6a4a3a"; ctx.fillRect(0, TOPW, W, FL - TOPW);
    ctx.fillStyle = "#5a3e30"; for (let i = 0; i < 12; i++) ctx.fillRect(i * 92, TOPW, 4, FL - TOPW);
    ctx.fillStyle = "#3a2a22"; ctx.fillRect(80, 420, 540, 16);                                         // Werkzeugwand
    for (let i = 0; i < 8; i++) { ctx.strokeStyle = "#c8ccd6"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(110 + i * 64, 444); ctx.lineTo(110 + i * 64, 520 + (i % 3) * 14); ctx.stroke(); }
    ctx.fillStyle = "#e9e4d8"; ctx.fillRect(700, 400, 220, 180); ctx.fillStyle = "#a8d8f0"; ctx.fillRect(712, 412, 196, 156);
    ctx.fillStyle = "#4a3a30"; ctx.fillRect(0, FL, W, 420);
    glow(540, 380, 300, "255,214,150", 0.18);
  }
}
function bike(x, y, s = 1, flatK = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#2a2d38"; ctx.lineWidth = 7;
  for (const wx of [-70, 70]) { ctx.beginPath(); ctx.arc(wx, 0, 46, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(wx, 0); ctx.lineTo(wx + Math.cos(k) * 44, Math.sin(k) * 44); ctx.stroke(); } ctx.lineWidth = 7; }
  ctx.strokeStyle = "#d9443c"; ctx.lineWidth = 8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-10, -70); ctx.lineTo(50, -70); ctx.lineTo(70, 0); ctx.moveTo(-10, -70); ctx.lineTo(0, 0); ctx.lineTo(-70, 0); ctx.moveTo(50, -70); ctx.lineTo(56, -96); ctx.stroke();
  ctx.fillStyle = "#2a2d38"; rr(-30, -84, 44, 12, 5); ctx.fill(); rr(44, -102, 34, 8, 4); ctx.fill();
  ctx.restore();
}
function bgTrain(t) {
  ctx.fillStyle = "#e6e2d8"; ctx.fillRect(0, TOPW, W, FL - TOPW);
  ctx.fillStyle = "#cfd6e2"; rr(120, 380, 840, 300, 40); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(140, 400, 800, 260, 30); ctx.clip();
  let g = ctx.createLinearGradient(0, 400, 0, 660); g.addColorStop(0, "#9ad0f2"); g.addColorStop(1, "#d9f0e0"); ctx.fillStyle = g; ctx.fillRect(140, 400, 800, 260);
  for (let i = 0; i < 6; i++) { const x = 940 - ((t * 260 + i * 170) % 900); ctx.fillStyle = "#6aaa5a"; ctx.fillRect(x, 560, 140, 100); circle(x + 60, 560, 40, "#4a8a4a"); }
  ctx.restore();
  ctx.fillStyle = "#3a5a8a"; rr(80, FL - 260, 260, 260, 26); ctx.fill();
  ctx.fillStyle = "#5a5f6c"; ctx.fillRect(0, FL, W, 420);
}

// ------------------------------------------------------------ Szenen je Satz
function scene(t, si) {
  const st = S[si];
  if (si <= 1) {                                                        // Straße mit Zahlen über den Köpfen
    bgStreet(t);
    const zahl = Wt(0, "ZAHL");
    const ppl = [[225, { c1: "#ffd2b0", c2: "#e8a07a", cap: "#3b7dd8" }, 820], [382, { c1: "#d6e8ff", c2: "#8fb0e0", hair: "#5a3a2a" }, 3100], [540, DU, null], [698, { c1: "#e3d3ff", c2: "#b89ae8", glasses: true }, 46], [855, { c1: "#c8f0d8", c2: "#7fc8a0" }, 2200]];
    ppl.forEach(([x, o, v], i) => {
      const P = person(x + Math.sin(t * 0.8 + i) * 6, FL, { ...o, s: 0.9, f: i === 2 ? (t > zahl ? "wide" : "neutral") : "neutral", look: i === 2 ? Math.sin(t * 1.5) : 0, walk: i % 2 ? t * 6 : 0 });
      if (v) badge(P.hx, P.hy - 80 - (i % 2) * 46, v, pop(t, zahl + i * 0.12), { s: 0.85 });   // gestaffelt, damit nichts überlappt
    });
  } else if (si === 2) {                                                // Büro: Kollegin
    bgOffice();
    const P = person(260, FL, { c1: "#ffd2e0", c2: "#e88aa8", hair: "#3a2a22", f: "smile" });
    person(760, FL, { ...DU, f: "neutral", look: -1 });
    badge(P.hx, P.hy - 84, 3400, pop(t, Wt(2, "3.400") - 0.1));
  } else if (si === 3 || si === 18) {                                   // Aufzug: der Pfeifer
    const op = easeOut(ramp(t, st, st + 0.6));
    bgElevator(t, op);
    const P = person(460, FL, { c1: "#d8f0c8", c2: "#9ad07a", cap: "#c8302c", f: "whistle" });
    for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * p); ctx.fillStyle = "#3a3d4a"; ctx.font = "900 34px InterX"; ctx.fillText("♪", P.hx + 50 + p * 40, P.hy - 30 - p * 60); ctx.globalAlpha = 1; }
    person(680, FL, { ...DU, f: "annoyed", look: -1 });
    badge(P.hx, P.hy - 84, 90, pop(t, Wt(si, "90.") - 0.1));
  } else if (si === 4 || si === 16) {                                   // Sofa + Handy: Bruder
    bgHome();
    const call = si === 16;
    person(380, FL - 40, { ...DU, f: call ? "happy" : "neutral", arm: [{ side: 1, ang: -2.3, len: 1 }] });
    const ring = Math.sin(t * 30) * (call ? 0 : 3);
    ctx.save(); ctx.translate(520 + ring, 560); ctx.rotate(0.1);
    ctx.fillStyle = "#14161c"; rr(-60, -110, 120, 220, 16); ctx.fill();
    ctx.fillStyle = "#2a3048"; rr(-52, -100, 104, 200, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BRUDER", 0, -50);
    circle(0, -10, 22, "#c8d8f0");
    const swipe = call ? 0 : ramp(t, Wt(4, "weg."), Wt(4, "weg.") + 0.4);
    circle(-30 + swipe * 30, 60, 18, swipe > 0.5 ? "#d9443c" : "#d9443c"); circle(30, 60, 18, call ? "#3fbf6a" : "#3fbf6a");
    ctx.restore();
    if (!call) { badge(640, 400, 260, pop(t, Wt(4, "260.") - 0.1)); }
    else { const k = ramp(t, Wt(16, "Plus"), Wt(16, "Plus") + 0.6); badge(640, 400, Math.round(260 + 4 * k), 1, { up: k > 0 }); plusPop(720, 340, "+4", t, Wt(16, "Plus")); }
  } else if (si === 5 || si === 17) {                                   // Hamburg
    if (si === 5) {
      bgHome();
      ctx.fillStyle = "#14161c"; rr(330, 380, 420, 520, 24); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(346, 396, 388, 488, 16); ctx.clip();
      ctx.fillStyle = "#8ab8e0"; ctx.fillRect(346, 396, 388, 488); ctx.fillStyle = "#6aa0c8"; ctx.fillRect(346, 700, 388, 200);
      person(540, 900, { c1: "#ffe0d0", c2: "#e86a5a", hair: "#a8442a", f: "smile", s: 0.9 });
      ctx.restore();
      ctx.fillStyle = "#d9443c"; ctx.beginPath(); ctx.arc(420, 450, 16, Math.PI, 0); ctx.lineTo(420, 480); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "800 18px InterX"; ctx.textAlign = "left"; ctx.fillText("HAMBURG", 444, 454);
      badge(540, 360, 140, pop(t, Wt(5, "140.") - 0.1));
    } else {
      bgTrain(t);
      person(420, FL, { ...DU, f: "laugh", arm: [{ side: 1, ang: -1.2 }] });
      person(640, FL, { c1: "#ffe0d0", c2: "#e86a5a", hair: "#a8442a", f: "laugh", arm: [{ side: -1, ang: 1.2 }] });
      const k = ramp(t, Wt(17, "Plus"), Wt(17, "Plus") + 0.6);
      badge(640, 520, Math.round(140 + 12 * k), 1, { up: k > 0 }); plusPop(760, 460, "+12", t, Wt(17, "Plus"));
    }
  } else if (si === 6 || si === 7) {                                    // Opas Werkstatt
    bgWorkshop(t, false);
    bike(600, FL - 64, 1.4);
    const P = person(300, FL, { ...OPA, f: "smile", arm: [{ side: 1, ang: -1.0 + Math.sin(t * 6) * 0.15 }] });
    if (si === 7) {
      const vis = ramp(t, st, st + 0.4) * (1 - ramp(t, Wt(7, "immer.") - 0.2, Wt(7, "immer.") + 0.3));
      ctx.globalAlpha = vis; person(820, FL, { ...DU, f: "smile" }); ctx.globalAlpha = 1;
      // Osterei + Uhr "1 h"
      ctx.save(); ctx.translate(820, 420); ctx.fillStyle = "#f2c94c"; ctx.beginPath(); ctx.ellipse(0, 0, 26, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#d9443c"; ctx.fillRect(-26, -4, 52, 8); ctx.restore();
      badge(900, 500, "1 h", pop(t, Wt(7, "Stunde,")) * vis);
    }
  } else if (si === 8 || si === 9) {                                    // Opa groß + 23
    bgWorkshop(t, false);
    const z = 1 + 0.25 * easeIO(ramp(t, S[8], S[8] + 1.0));
    ctx.save(); ctx.translate(540, FL); ctx.scale(z, z); ctx.translate(-540, -FL);
    const P = person(540, FL, { ...OPA, f: si === 9 ? "smile" : "neutral" });
    badge(P.hx, P.hy - 84, 23, pop(t, Wt(8, "23.") - 0.1), { s: 1.3 });
    ctx.restore();
    if (si === 9) {                                                     // 23 Sanduhren
      for (let i = 0; i < 23; i++) {
        const k = pop(t, S[9] + 0.2 + i * 0.06); if (k <= 0) continue;
        const x = 190 + (i % 8) * 100, y = 380 + Math.floor(i / 8) * 70;
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = "#f6b23a";
        ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(14, -20); ctx.lineTo(0, 0); ctx.lineTo(14, 20); ctx.lineTo(-14, 20); ctx.lineTo(0, 0); ctx.fill(); ctx.restore();
      }
    }
  } else if (si === 10) {                                               // Zug: rechnen
    bgTrain(t);
    person(220, FL - 20, { ...DU, f: t > Wt(10, "WOCHENENDE.") ? "sad" : "neutral", look: 1 });
    const y0 = 760;
    const years = ramp(t, Wt(10, "Einmal"), Wt(10, "Jahren.") + 0.3);
    const n = Math.round(years * 23);
    const collapse = ramp(t, Wt(10, "Es"), Wt(10, "WOCHENENDE.") + 0.2);
    for (let i = 0; i < n; i++) {
      const x = 420 + (i % 8) * 64, y = y0 + Math.floor(i / 8) * 56;
      const tx = lerp(x, 560, easeIO(collapse)), ty = lerp(y, 800, easeIO(collapse));
      ctx.globalAlpha = 1 - collapse * 0.9; ctx.fillStyle = "#fff"; rr(tx - 24, ty - 20, 48, 40, 6); ctx.fill(); ctx.fillStyle = "#d9443c"; ctx.fillRect(tx - 24, ty - 20, 48, 10); ctx.globalAlpha = 1;
    }
    if (collapse > 0.6) {
      const k = back(ramp(t, Wt(10, "WOCHENENDE."), Wt(10, "WOCHENENDE.") + 0.3));
      ctx.save(); ctx.translate(640, 800); ctx.scale(k, k);
      for (const [dx, lab] of [[-70, "SA"], [70, "SO"]]) { ctx.fillStyle = "#fff"; rr(dx - 60, -60, 120, 120, 12); ctx.fill(); ctx.fillStyle = "#d9443c"; rr(dx - 60, -60, 120, 34, [12, 12, 0, 0]); ctx.fill(); ctx.fillStyle = "#1d1d22"; ctx.font = "900 40px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(lab, dx, 18); }
      ctx.restore();
    }
  } else if (si === 11 || si === 12) {                                  // gemeinsam schrauben
    bgWorkshop(t, false);
    bike(600, FL - 64, 1.4);
    person(260, FL, { ...OPA, f: si === 12 && t > Wt(12, "platt") ? "laugh" : "happy", look: 1, arm: [{ side: 1, ang: -1.1 }] });
    const arrive = easeOut(ramp(t, S[11], S[11] + 0.8));
    person(lerp(1120, 850, arrive), FL, { ...DU, f: si === 12 && t > Wt(12, "platt") ? "laugh" : "smile", look: -1, walk: arrive < 1 ? t * 8 : 0, arm: si === 12 ? [{ side: -1, ang: 1.1 }] : undefined });
    if (si === 12) { const k = pop(t, Wt(12, "Schraubenschlüssel")); ctx.save(); ctx.translate(690, 700); ctx.rotate(0.6); ctx.scale(k, k); ctx.strokeStyle = "#c8ccd6"; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(40, 0); ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(52, 0, 16, -2.2, 2.2); ctx.stroke(); ctx.restore(); }
  } else if (si >= 13 && si <= 15) {                                    // Tür, Blick nach oben: 23 -> 31
    bgWorkshop(t, true);
    const P = person(460, FL, { ...OPA, f: "happy", s: 0.95, arm: [{ side: 1, ang: -2.6 + Math.sin(t * 8) * 0.2 }] });
    person(780, FL, { ...DU, f: si === 13 && t > Wt(13, "31.") ? "wide" : "smile", look: -1 });
    const k = ramp(t, Wt(13, "31.") - 0.3, Wt(13, "31.") + 0.5);
    const v = Math.round(23 + 8 * easeIO(k));
    badge(P.hx, P.hy - 84, v, 1, { s: si >= 14 ? 1.25 : 1, up: k > 0.5 });
    if (si >= 14) { ctx.fillStyle = "#7fe0a6"; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6); ctx.beginPath(); ctx.moveTo(P.hx + 150, P.hy - 70); ctx.lineTo(P.hx + 174, P.hy - 110); ctx.lineTo(P.hx + 198, P.hy - 70); ctx.fill(); ctx.fillRect(P.hx + 166, P.hy - 72, 16, 40); ctx.globalAlpha = 1; }
    if (si === 15) {                                                    // "kein Countdown": Pfeil zeigt die Richtung
      const g = ctx.createLinearGradient(0, 380, 0, 520); g.addColorStop(0, "rgba(20,24,36,0.85)"); g.addColorStop(1, "rgba(20,24,36,0.85)");
      ctx.fillStyle = g; rr(140, 380, 800, 150, 20); ctx.fill();
      ctx.strokeStyle = "#ff6a6a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(200, 420); ctx.lineTo(420, 490); ctx.stroke();
      ctx.strokeStyle = "#7fe0a6"; ctx.beginPath(); ctx.moveTo(560, 490); ctx.lineTo(880, 410); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "800 22px InterX"; ctx.textAlign = "center"; ctx.fillText("nichts ändern", 310, 512); ctx.fillText("vorbeischauen", 720, 512);
    }
  } else if (si === 19) {                                               // zwei Fahrräder vor der Werkstatt
    bgWorkshop(t, true);
    bike(170, FL - 60, 1.0); bike(860, FL - 60, 1.0);
    const P = person(460, FL, { ...OPA, f: "laugh", s: 0.95, arm: [{ side: 1, ang: -2.6 + Math.sin(t * 8) * 0.25 }] });
    const k = ramp(t, S[19] + 0.4, S[19] + 2.5);
    badge(P.hx, P.hy - 84, Math.round(31 + 33 * easeOut(k)), 1, { up: true, s: 1.2 });
  }
}
function plusPop(x, y, txt, t, t0) {
  const k = ramp(t, t0, t0 + 1.2); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * k); ctx.fillStyle = "#7fe0a6"; ctx.font = "900 54px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 8; ctx.fillText(txt, x, y - k * 50); ctx.restore();
}

// ------------------------------------------------------------------ Text
const SIZES = { plain: 64, big: 82, italic: 96, heavy: 120, spaced: 36, counter: 250 };
const LH = { plain: 1.22, big: 1.18, italic: 1.08, heavy: 1.0, spaced: 1.7, counter: 0.98 };
const ASC = { plain: 0.95, big: 0.95, italic: 0.88, heavy: 0.86, spaced: 1.0, counter: 0.86 };

function setFont(style, size) {
  ctx.letterSpacing = "0px";
  if (style === "italic") ctx.font = `italic 400 ${size}px ISerif`;
  else if (style === "heavy" || style === "counter") { ctx.font = `900 ${size}px InterBlk`; ctx.letterSpacing = `${-size * 0.015}px`; }
  else if (style === "spaced") { ctx.font = `600 ${size}px InterSB`; ctx.letterSpacing = `${size * 0.45}px`; }
  else ctx.font = `600 ${size}px InterSB`;
}

const LAYOUT = new Map();
function layoutCard(card) {
  if (LAYOUT.has(card)) return LAYOUT.get(card);
  const lines = [];
  let y = 0;
  for (const line of card.lines) {
    let scale = 1, items, width;
    for (let pass = 0; pass < 2; pass++) {
      items = []; width = 0;
      line.forEach((tok, i) => {
        const size = SIZES[tok.style] * scale;
        setFont(tok.style, size);
        const w = ctx.measureText(tok.text).width;
        const gap = i ? (tok.style === "heavy" ? size * 0.22 : size * 0.27) : 0;
        width += gap;
        items.push({ tok, size, x: width, w });
        width += w;
      });
      if (width <= TEXT_W) break;
      scale *= TEXT_W / width;
    }
    const big = items.reduce((a, b) => (b.size > a.size ? b : a));
    const st = big.tok.style;
    const lh = big.size * LH[st];
    lines.push({ items, width, y: y + big.size * ASC[st], lh });
    y += lh;
  }
  const res = { lines, height: y };
  LAYOUT.set(card, res);
  return res;
}

function drawCard(card, t) {
  const L = layoutCard(card);
  const out = ramp(t, card.end - 0.22, card.end);
  if (out >= 1) return;
  for (const line of L.lines) {
    const x0 = TEXT_CX - line.width / 2;
    for (const it of line.items) {
      const tok = it.tok;
      const p = ramp(t, tok.s - 0.04, tok.s + 0.26);
      if (p <= 0) continue;
      const a = easeOut(p) * (1 - out);
      const blur = (1 - p) * 10 + out * 14;
      const dy = (1 - easeOut(p)) * 18;
      setFont(tok.style, it.size);
      ctx.globalAlpha = a;
      ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      const heavy = tok.style === "heavy";
      ctx.shadowColor = `rgba(255,255,255,${heavy ? 0.5 : 0.3})`;
      ctx.shadowBlur = heavy ? 30 : 14;
      ctx.fillStyle = heavy && card.sentence === 19 ? "#7fe0a6" : "#fff";
      ctx.fillText(tok.text, x0 + it.x, TEXT_TOP + line.y + dy);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}


// ------------------------------------------------------------------ Bild
let GRAIN = [];
window.renderFrame = function (t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#0b0c12"; ctx.fillRect(0, 0, W, H);
  const si = sentenceAt(t);
  const drawSc = (k, dx) => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    ctx.translate(dx, 0);
    const z = 1.32 * (1 + 0.035 * ramp(t, S[k] - 0.15, (S[k + 1] || TL.duration) - 0.15));
    const px = Math.sin((t - S[k]) * 0.35) * 10;                   // langsame Kamerafahrt
    ctx.translate(540 + px, 1530); ctx.scale(z, z); ctx.translate(-540, -FL);   // Boden bei ~1530 px, Szene füllt das ganze Hochformat
    scene(t, k);
    sceneLight();
    ctx.restore();
  };
  // Szenenwechsel als Kameraschwenk (Wisch nach links)
  const tr = si > 0 ? ramp(t, S[si] - 0.15, S[si] + 0.25) : 1;
  if (tr < 1) { const k = easeIO(tr); drawSc(si - 1, -W * k); drawSc(si, W * (1 - k)); }
  else drawSc(si, 0);
  const tg = ctx.createLinearGradient(0, 120, 0, 700);
  tg.addColorStop(0, "rgba(8,9,14,0.75)"); tg.addColorStop(0.6, "rgba(8,9,14,0.45)"); tg.addColorStop(1, "rgba(8,9,14,0)");
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 700);
  ctx.fillStyle = "rgba(8,9,14,0.75)"; ctx.fillRect(0, 0, W, 120);
  for (const card of TL.cards) if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  ctx.globalAlpha = 0.035; ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, TL.duration - 1.4, TL.duration - 0.2));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};
// weiches Licht: oben heller, Ecken und Boden etwas dunkler
function sceneLight() {
  let g = ctx.createRadialGradient(540, 560, 160, 540, 640, 980);
  g.addColorStop(0, "rgba(255,240,220,0.10)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g; ctx.fillRect(-200, TOPW, W + 400, FL - TOPW + 400);
  g = ctx.createLinearGradient(0, FL - 30, 0, FL + 20);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.6, "rgba(0,0,0,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, FL - 30, W, 50);
}
window.exportEvents = function () {
  return { scenes: S, badges: [Wt(0, "ZAHL"), Wt(2, "3.400"), Wt(3, "90."), Wt(4, "260."), Wt(5, "140."), Wt(8, "23."), Wt(13, "31."), Wt(18, "90.")],
    plus: [Wt(16, "Plus"), Wt(17, "Plus")], ring: [S[4], Wt(4, "weg.")], wochenende: Wt(10, "WOCHENENDE."), wrench: Wt(12, "Schraubenschlüssel"),
    whistle: [[S[3], S[4]], [S[18], S[19]]], duration: TL.duration };
};
window.setup = async function (timeline) {
  TL = timeline; S = TL.sentences.map(s => s.start);
  TOK = []; for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX"), document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk")]);
  let seed = 53; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return true;
};
