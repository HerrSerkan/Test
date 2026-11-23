// "Wie groß wirst du?" – Erklär-Animation (deutsche Version nach @neuronvisuals).
// render.js: await window.setup(timeline) -> window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const FY = 1110;                    // Boden der Familien-Szene
const PXCM = 3.2;                   // Pixel pro Zentimeter
const CAP_X = 520, CAP_Y = 1255;    // Untertitel unter der Szene
const RED = "#ff3b3b";
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

let TL = null, S = [], E = [], TOK = [], SC = [];

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
function Wt(si, text, nth = 0) {
  const n = norm(text);
  const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) throw new Error("Wort nicht gefunden: " + si + " " + text);
  return hits[Math.min(nth, hits.length - 1)].s;
}
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function halo(x, y, r, a, rgb = "255,255,255") {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function label(txt, x, y, size = 22, col = "rgba(240,240,240,0.9)", align = "center") {
  ctx.save(); ctx.font = `900 ${size}px InterBlk`; ctx.letterSpacing = `${size * 0.12}px`;
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(txt, x, y); ctx.restore();
}
const cmY = cm => FY - cm * PXCM;

// ------------------------------------------------------------------ Hintergründe
function studio() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1c1c1c"); g.addColorStop(0.5, "#333333"); g.addColorStop(0.58, "#2a2a2a"); g.addColorStop(1, "#141414");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sp = ctx.createRadialGradient(W / 2, 640, 50, W / 2, 700, 700);
  sp.addColorStop(0, "rgba(255,255,255,0.10)"); sp.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#202020"; ctx.fillRect(0, FY, W, H - FY);
  const fl = ctx.createLinearGradient(0, FY, 0, FY + 260);
  fl.addColorStop(0, "rgba(255,255,255,0.10)"); fl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = fl; ctx.fillRect(0, FY, W, 260);
}
function blackBg(rgb = "0,0,0") { ctx.fillStyle = `rgb(${rgb})`; ctx.fillRect(0, 0, W, H); }
function ruler(x, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const top = cmY(205);
  const g = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
  g.addColorStop(0, "#8a6a42"); g.addColorStop(0.5, "#c49a62"); g.addColorStop(1, "#7a5a36");
  ctx.fillStyle = g; ctx.fillRect(x - 18, top, 36, FY - top);
  ctx.fillStyle = "rgba(40,25,10,0.7)";
  for (let cm = 0; cm <= 200; cm += 10) ctx.fillRect(x + 4, cmY(cm) - 1, cm % 50 ? 10 : 16, 2);
  ctx.restore();
}

// ------------------------------------------------------------------ Figuren
function capsule(a, b, w, col, hi) {
  ctx.lineCap = "round";
  ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  if (hi) { ctx.strokeStyle = hi; ctx.lineWidth = w * 0.35; ctx.beginPath(); ctx.moveTo(a[0] - w * 0.18, a[1]); ctx.lineTo(b[0] - w * 0.18, b[1]); ctx.stroke(); }
}
// Stehende Figur, Höhe in cm; pose: "stand" | "run"
function person(x, cm, o = {}) {
  const h = cm * PXCM, fy = o.fy ?? FY;
  const bright = o.bright, a = o.a ?? 1;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const body = bright ? "#f4f4f4" : "#8f8f8f", hi = bright ? "rgba(255,255,255,0.9)" : "rgba(220,220,220,0.35)";
  if (bright) { ctx.shadowColor = "rgba(255,255,255,0.45)"; ctx.shadowBlur = 24; }
  const r = h * 0.105, hip = fy - h * 0.47, sh = fy - h * 0.77, lw = h * 0.055;
  const t = o.t || 0;
  let lA = [x - h * 0.04, fy], lB = [x + h * 0.04, fy], aA = [x - h * 0.1, hip + h * 0.02], aB = [x + h * 0.1, hip + h * 0.02];
  if (o.pose === "run") {
    const s = Math.sin(t * 12);
    lA = [x + s * h * 0.18, fy - Math.max(0, s) * h * 0.12]; lB = [x - s * h * 0.18, fy - Math.max(0, -s) * h * 0.12];
    aA = [x - s * h * 0.16, sh + h * 0.2]; aB = [x + s * h * 0.16, sh + h * 0.2];
  }
  capsule([x - h * 0.04, hip], lA, lw, body, hi); capsule([x + h * 0.04, hip], lB, lw, body, hi);
  capsule([x - h * 0.075, sh], aA, lw * 0.85, body, hi); capsule([x + h * 0.075, sh], aB, lw * 0.85, body, hi);
  capsule([x, sh], [x, hip], h * 0.13, body, hi);
  const hy = fy - h + r;
  const hg = ctx.createRadialGradient(x - r * 0.35, hy - r * 0.35, r * 0.1, x, hy, r);
  hg.addColorStop(0, bright ? "#ffffff" : "#d6d6d6"); hg.addColorStop(1, bright ? "#d8d8d8" : "#5e5e5e");
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, hy, r, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath(); ctx.arc(x - r * 0.32, hy - r * 0.05, r * 0.09, 0, 7); ctx.arc(x + r * 0.32, hy - r * 0.05, r * 0.09, 0, 7); ctx.fill();
  ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, hy + r * 0.25, r * 0.22, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.restore();
}
function heightLine(x, cm, txt, col = "rgba(255,255,255,0.85)", a = 1, w = 70) {
  if (a <= 0) return;
  const y = cmY(cm);
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = col; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x + w, y); ctx.stroke();
  if (txt) label(txt, x, y - 22, 24, col);
  ctx.restore();
}
const MOM = { x: 330, cm: 168 }, SON = { x: 540, cm: 185 }, DAD = { x: 750, cm: 178 };

// ------------------------------------------------------------------ Szenen
function sFamily(t, sc) {
  studio(); ruler(170);
  const a = [ramp(t, sc.t0, sc.t0 + 0.5), ramp(t, sc.k1 - 0.3, sc.k1 + 0.2), ramp(t, sc.k2 - 0.3, sc.k2 + 0.2)];
  person(MOM.x, MOM.cm, { a: lerp(0.4, 1, a[0]) });
  person(DAD.x, DAD.cm, { a: lerp(0.4, 1, a[1]) });
  person(SON.x, SON.cm, { a: lerp(0.4, 1, a[2]), bright: a[2] > 0.5 });
  heightLine(MOM.x, MOM.cm, "168 CM", undefined, ramp(t, sc.k0, sc.k0 + 0.3));
  heightLine(DAD.x, DAD.cm, "178 CM", undefined, ramp(t, sc.k1, sc.k1 + 0.3));
  heightLine(SON.x, SON.cm, "185 CM", RED, ramp(t, sc.k2, sc.k2 + 0.3));
}
function helix(cx, cy, hgt, t, a) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.shadowColor = "rgba(255,255,255,0.6)"; ctx.shadowBlur = 14;
  for (let k = 0; k < 28; k++) {
    const y = cy - hgt / 2 + k * hgt / 27, ph = k * 0.45 + t * 2;
    const x1 = cx + Math.sin(ph) * 80, x2 = cx - Math.sin(ph) * 80;
    ctx.strokeStyle = `rgba(230,230,230,${0.35 + 0.3 * Math.abs(Math.cos(ph))})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }
  for (const s of [1, -1]) {
    ctx.strokeStyle = "#f2f2f2"; ctx.lineWidth = 7; ctx.beginPath();
    for (let k = 0; k <= 80; k++) { const y = cy - hgt / 2 + k * hgt / 80, ph = k * 27 / 80 * 0.45 + t * 2; const x = cx + s * Math.sin(ph) * 80; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}
function sGenes(t, sc) {
  blackBg();
  const sh = easeIO(ramp(t, sc.k1, sc.k1 + 0.5));
  halo(lerp(540, 380, sh), 800, 360, 0.12);
  helix(lerp(540, 380, sh), 800, 560, t, 1);
  if (sh > 0) {
    ctx.save(); ctx.globalAlpha = sh;
    label("+", 560, 800, 70, "#f2f2f2");
    ctx.setLineDash([10, 10]); ctx.strokeStyle = "rgba(240,240,240,0.7)"; ctx.lineWidth = 3;
    rr(640, 560, 200, 480, 26); ctx.stroke(); ctx.setLineDash([]);
    label("?", 740, 800, 110, "rgba(240,240,240,0.8)");
    ctx.restore();
  }
  label("GENE", lerp(540, 380, sh), 1130, 30, RED);
}
function sFormula(t, sc) {
  studio(); ruler(170);
  person(MOM.x, MOM.cm); person(DAD.x, DAD.cm);
  person(SON.x, SON.cm, { bright: true, a: 0.85 });
  heightLine(MOM.x, MOM.cm, "168", undefined, 1, 60);
  heightLine(DAD.x, DAD.cm, "178", undefined, 1, 60);
  // Fragezeichen über dem Sohn
  const q = 1 - ramp(t, sc.k3, sc.k3 + 0.3);
  if (q > 0) label("?", SON.x, cmY(SON.cm) - 60, 64, `rgba(255,255,255,${q})`);
  ctx.setLineDash([8, 8]); ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
  const lp = ramp(t, sc.k0, sc.k0 + 0.5);
  if (lp > 0 && q > 0) for (const p of [MOM, DAD]) { ctx.globalAlpha = lp * q; ctx.beginPath(); ctx.moveTo(p.x, cmY(p.cm) - 10); ctx.lineTo(SON.x, cmY(SON.cm) - 30); ctx.stroke(); }
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  // +13 cm zur Mutter
  const p13 = easeOut(ramp(t, sc.k1, sc.k1 + 0.6));
  if (p13 > 0) {
    const y0 = cmY(MOM.cm), y1 = cmY(MOM.cm + 13 * p13);
    ctx.strokeStyle = RED; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(MOM.x - 80, y0); ctx.lineTo(MOM.x - 92, y0); ctx.lineTo(MOM.x - 92, y1); ctx.lineTo(MOM.x - 80, y1); ctx.stroke();
    heightLine(MOM.x, MOM.cm + 13 * p13, null, RED, 1, 60);
    label("+13", MOM.x - 140, (y0 + y1) / 2, 26, RED);
  }
  // Mittelwert mit dem Vater
  const av = easeOut(ramp(t, sc.k2, sc.k2 + 0.6));
  if (av > 0) {
    const y = cmY(lerp(MOM.cm + 13, 179.5, av));
    ctx.save(); ctx.globalAlpha = av; ctx.setLineDash([12, 8]); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(MOM.x, cmY(181)); ctx.lineTo(DAD.x, cmY(178)); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(SON.x, y, 7, 0, 7); ctx.fill();
  }
  const res = ramp(t, sc.k3, sc.k3 + 0.3);
  if (res > 0) { heightLine(SON.x, 179.5, "≈ 180 CM", RED, res, 90); }
}
function sRange(t, sc) {
  studio(); ruler(170);
  const z = 1 + 0.45 * easeIO(ramp(t, sc.k1 - 0.3, sc.k1 + 0.4));
  ctx.save();
  const fx = SON.x, fyy = cmY(180);
  ctx.translate(fx, fyy); ctx.scale(z, z); ctx.translate(-fx, -fyy);
  person(MOM.x, MOM.cm); person(DAD.x, DAD.cm); person(SON.x, SON.cm, { bright: true });
  const b = easeOut(ramp(t, sc.t0 + 0.1, sc.t0 + 0.6));
  const yT = cmY(lerp(180, 190, b)), yB = cmY(lerp(180, 170, b));
  ctx.fillStyle = `rgba(255,255,255,${0.16 + 0.12 * ramp(t, sc.k1, sc.k1 + 0.3)})`; ctx.fillRect(MOM.x - 120, yT, DAD.x - MOM.x + 240, yB - yT);
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(MOM.x - 120, yT); ctx.lineTo(DAD.x + 120, yT); ctx.moveTo(MOM.x - 120, yB); ctx.lineTo(DAD.x + 120, yB); ctx.stroke();
  heightLine(SON.x, 180, null, "rgba(255,255,255,0.6)", 1, 120);
  if (b > 0.5) { label("+10", DAD.x + 150, (yT + cmY(180)) / 2, 20, "#fff"); label("−10", DAD.x + 150, (yB + cmY(180)) / 2, 20, "#fff"); }
  // Wo landest du? (Marker wandert im Bereich)
  const m = ramp(t, sc.k2, sc.k2 + 0.3);
  if (m > 0) {
    const cm = 180 + Math.sin((t - sc.k2) * 2.4) * 8;
    ctx.globalAlpha = m; heightLine(SON.x, cm, null, RED, m, 60);
    label("DU?", SON.x + 95, cmY(cm), 20, RED); ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function sSleep(t, sc) {
  blackBg("14,20,40");
  // Fenster mit Mond
  ctx.strokeStyle = "rgba(200,210,255,0.5)"; ctx.lineWidth = 4; rr(700, 720, 200, 170, 8); ctx.stroke();
  halo(800, 805, 90, 0.25, "220,230,255");
  ctx.fillStyle = "#e9eeff"; ctx.beginPath(); ctx.arc(800, 805, 26, 0, 7); ctx.fill();
  ctx.fillStyle = "rgb(14,20,40)"; ctx.beginPath(); ctx.arc(812, 797, 22, 0, 7); ctx.fill();
  // Bett
  ctx.fillStyle = "#b08a5a"; ctx.fillRect(130, 960, 24, 170); ctx.fillRect(900, 1010, 24, 120); ctx.fillRect(130, 1060, 794, 26);
  ctx.fillStyle = "#e8e8f0"; rr(150, 1010, 760, 52, 10); ctx.fill();
  ctx.fillStyle = "#ffffff"; rr(170, 975, 150, 50, 22); ctx.fill();
  ctx.fillStyle = "#e9e9e9"; ctx.beginPath(); ctx.arc(250, 960, 42, 0, 7); ctx.fill();
  ctx.fillStyle = "#2a2a2a"; ctx.fillRect(232, 956, 12, 3); ctx.fillRect(258, 956, 12, 3);
  ctx.fillStyle = "#7a86b8"; rr(290, 990, 610, 70, 26); ctx.fill();
  for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1); label("z", 300 + u * 40 + i * 6, 900 - u * 90, 26 + i * 4, `rgba(255,255,255,${1 - u})`); }
  // Wachstumshormon-Kurve
  const gx = 140, gy = 640, gw = 800, gh = 220;
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gx, gy - gh - 10); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
  label("WACHSTUMSHORMON", gx + 230, gy - gh - 30, 22, "#ffffff");
  const draw = easeOut(ramp(t, sc.t0 + 0.2, sc.k1 + 0.4));
  const cut = sc.k3 ? easeOut(ramp(t, sc.k3, sc.k3 + 0.4)) : 0;
  const cutX = gx + gw * 0.42;
  const f = x => { const u = (x - gx) / gw; return gh * (0.95 * Math.exp(-((u - 0.12) ** 2) / 0.004) + 0.5 * Math.exp(-((u - 0.34) ** 2) / 0.004) + 0.32 * Math.exp(-((u - 0.56) ** 2) / 0.004) + 0.22 * Math.exp(-((u - 0.78) ** 2) / 0.004)); };
  // Tiefschlaf-Phasen
  const ds = ramp(t, sc.k2, sc.k2 + 0.4);
  if (ds > 0) {
    for (const [u0, u1] of [[0.06, 0.2], [0.29, 0.4], [0.52, 0.6]]) {
      ctx.fillStyle = `rgba(110,150,255,${0.45 * ds * (u0 > 0.4 && cut > 0 ? 1 - cut : 1)})`; ctx.fillRect(gx + gw * u0, gy - 26, gw * (u1 - u0), 26);
    }
    label("TIEFSCHLAF", gx + gw * 0.13, gy + 30, 18, `rgba(150,180,255,${ds})`);
  }
  ctx.save(); ctx.shadowColor = "rgba(255,255,255,0.5)"; ctx.shadowBlur = 10;
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.beginPath();
  for (let x = gx; x <= gx + gw * draw; x += 4) { let y = gy - f(x); if (cut > 0 && x > cutX) y = lerp(y, gy - 4, cut); x === gx ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
  if (cut > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cutX, gy - gh - 10); ctx.lineTo(cutX, gy + 10); ctx.stroke(); }
}
function bone(cx, cy, hgt, dens, glow) {
  ctx.save();
  const w = hgt * 0.13, cap = hgt * 0.12;
  const g = ctx.createLinearGradient(cx - w * 2, 0, cx + w * 2, 0);
  g.addColorStop(0, "rgba(150,170,190,0.55)"); g.addColorStop(0.5, `rgba(235,242,250,${0.75 + 0.25 * dens})`); g.addColorStop(1, "rgba(150,170,190,0.55)");
  ctx.shadowColor = `rgba(190,215,255,${0.6 * glow})`; ctx.shadowBlur = 40;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - hgt / 2 + cap);
  ctx.bezierCurveTo(cx - w * 2.4, cy - hgt / 2 + cap * 0.6, cx - w * 1.6, cy - hgt / 2 - cap * 0.4, cx - w * 0.3, cy - hgt / 2 - cap * 0.2);
  ctx.bezierCurveTo(cx + w * 0.4, cy - hgt / 2 - cap * 0.9, cx + w * 2.2, cy - hgt / 2 - cap * 0.4, cx + w, cy - hgt / 2 + cap);
  ctx.lineTo(cx + w, cy + hgt / 2 - cap);
  ctx.bezierCurveTo(cx + w * 2.3, cy + hgt / 2 - cap * 0.5, cx + w * 2.0, cy + hgt / 2 + cap * 0.5, cx + w * 0.4, cy + hgt / 2 + cap * 0.3);
  ctx.bezierCurveTo(cx - w * 0.4, cy + hgt / 2 + cap * 0.6, cx - w * 2.2, cy + hgt / 2 + cap * 0.4, cx - w, cy + hgt / 2 - cap);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  // Markraum (wird mit der Dichte enger und heller)
  ctx.fillStyle = `rgba(60,75,95,${0.55 * (1 - dens)})`;
  rr(cx - w * 0.45, cy - hgt / 2 + cap * 1.4, w * 0.9, hgt - cap * 2.8, w * 0.45); ctx.fill();
  ctx.restore();
}
function food(x, y, kind) {
  ctx.save(); ctx.strokeStyle = "#f2f2f2"; ctx.fillStyle = "#f2f2f2"; ctx.lineWidth = 4; ctx.lineCap = "round";
  if (kind === "egg") { ctx.beginPath(); ctx.ellipse(x, y, 18, 24, 0, 0, 7); ctx.stroke(); }
  if (kind === "fish") { ctx.beginPath(); ctx.ellipse(x, y, 26, 13, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 24, y); ctx.lineTo(x + 40, y - 12); ctx.lineTo(x + 40, y + 12); ctx.closePath(); ctx.stroke(); }
  if (kind === "leg") { ctx.beginPath(); ctx.ellipse(x - 6, y - 6, 18, 14, -0.6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + 22, y + 22); ctx.stroke(); }
  if (kind === "milk") { ctx.beginPath(); ctx.moveTo(x - 14, y + 24); ctx.lineTo(x - 14, y - 8); ctx.lineTo(x, y - 24); ctx.lineTo(x + 14, y - 8); ctx.lineTo(x + 14, y + 24); ctx.closePath(); ctx.stroke(); }
  ctx.restore();
}
function sBones(t, sc) {
  blackBg();
  const p = ramp(t, sc.t0, sc.t0 + 0.5);
  halo(720, 800, 380, 0.15 * p);
  bone(720, 800, 640, ramp(t, sc.k1, sc.k1 + 1.5) * 0.6, p);
  const kinds = ["egg", "fish", "leg", "milk"];
  kinds.forEach((k, i) => {
    const x = 180 + i * 95, y = 1010, a = ramp(t, sc.t0 + 0.4 + i * 0.12, sc.t0 + 0.7 + i * 0.12);
    ctx.globalAlpha = a; food(x, y, k); ctx.globalAlpha = 1;
  });
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(320, 1050, 230, 30, 0, 0, 7); ctx.stroke();
  const pf = ramp(t, sc.k1, sc.k1 + 0.2);
  if (pf > 0) for (let i = 0; i < 26; i++) {
    const u = ((t - sc.k1) * 0.55 + i / 26) % 1;
    const x = lerp(200 + (i % 4) * 95, 700, u), y = lerp(1000, 820 - (i % 7) * 50, u) - Math.sin(u * Math.PI) * 120;
    ctx.fillStyle = `rgba(255,255,255,${pf * (1 - u)})`; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
  }
  if (pf > 0) label("EIWEISS", 320, 1120, 26, RED);
}
function sSprint(t, sc) {
  studio(); ruler(240);
  const run = t < sc.k1 + 0.3;
  person(540, 165, { bright: true, pose: run ? "run" : "stand", t });
  const x = ramp(t, sc.k1, sc.k1 + 0.3);
  if (x > 0) {
    const y = cmY(165) - 70;
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(540, y + 30); ctx.lineTo(540, y - 50); ctx.moveTo(522, y - 30); ctx.lineTo(540, y - 50); ctx.lineTo(558, y - 30); ctx.stroke();
    ctx.save(); ctx.translate(540, y - 10); ctx.scale(back(x), back(x)); ctx.strokeStyle = RED; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(30, 30); ctx.moveTo(30, -30); ctx.lineTo(-30, 30); ctx.stroke(); ctx.restore();
  }
}
function sDense(t, sc) {
  blackBg();
  const d = easeOut(ramp(t, sc.k1, sc.k1 + 1.4));
  halo(520, 800, 380, 0.12 + 0.15 * d);
  bone(500, 800, 680, d, 0.5 + 0.5 * d);
  ctx.save(); ctx.globalAlpha = 0.7;
  bone(650, 820, 600, d * 0.5, 0.3);
  ctx.restore();
  if (d > 0) {
    ctx.save(); ctx.globalAlpha = d;
    for (let i = 0; i < 40; i++) { const y = 520 + (i * 53) % 560, x = 470 + ((i * 37) % 60); ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, y, 6, 2); }
    ctx.restore();
  }
}
function spine(cx, top, n, comp, glow, big) {
  // seitliche Wirbelsäule: Wirbel + Bandscheiben (blau)
  const vh = big ? 120 : 36, dh = (big ? 36 : 11) * (1 - 0.45 * comp), vw = big ? 230 : 70;
  let y = top;
  for (let i = 0; i < n; i++) {
    const off = big ? 0 : Math.sin(i / n * Math.PI * 1.6 - 0.4) * 60;
    const x = cx + off;
    ctx.fillStyle = "rgba(225,232,240,0.92)"; rr(x - vw / 2, y, vw, vh, big ? 18 : 6); ctx.fill();
    ctx.fillStyle = "rgba(200,210,225,0.5)"; ctx.beginPath(); ctx.moveTo(x + vw / 2, y + vh * 0.2); ctx.lineTo(x + vw / 2 + vw * 0.55, y + vh * 0.55); ctx.lineTo(x + vw / 2, y + vh * 0.8); ctx.fill();
    y += vh;
    if (i < n - 1) {
      ctx.save(); ctx.shadowColor = `rgba(120,170,255,${glow})`; ctx.shadowBlur = big ? 30 : 12;
      ctx.fillStyle = "rgba(120,170,255,0.85)"; rr(x - vw * 0.42, y + 1, vw * 0.84, dh - 2, dh / 2); ctx.fill(); ctx.restore();
      y += dh;
    }
  }
  return y;
}
function sSpine(t, sc) {
  blackBg();
  const zoom = easeIO(ramp(t, sc.k2 - 0.2, sc.k2 + 0.5));
  ctx.save(); ctx.globalAlpha = 1 - zoom;
  spine(520, 470, 24, 0, ramp(t, sc.k1, sc.k1 + 0.4), false);
  const la = ramp(t, sc.k1, sc.k1 + 0.4);
  if (la > 0) { ctx.strokeStyle = `rgba(255,255,255,${la})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(620, 760); ctx.lineTo(760, 700); ctx.stroke(); label("23 BANDSCHEIBEN", 790, 680, 22, `rgba(255,255,255,${la})`, "left"); }
  ctx.restore();
  if (zoom > 0) { ctx.save(); ctx.globalAlpha = zoom; spine(500, 520, 4, 0, 0.8, true); label("KISSEN", 500, 1130, 26, RED); ctx.restore(); }
}
function sSquash(t, sc) {
  const night = ramp(t, sc.k2 - 0.3, sc.k2 + 0.3);
  blackBg(`${Math.round(lerp(0, 14, night))},${Math.round(lerp(0, 20, night))},${Math.round(lerp(0, 40, night))}`);
  const comp = sc.k2 ? easeIO(ramp(t, sc.t0 + 0.2, sc.k1 + 0.5)) * (1 - easeIO(ramp(t, sc.k2, sc.k2 + 1.2))) : 0;
  const end = spine(500, 520, 4, comp, 0.8, true);
  // Sonne wandert / Mond
  const su = ramp(t, sc.t0, sc.k1 + 0.6);
  if (night < 1) { ctx.globalAlpha = 1 - night; halo(lerp(780, 900, su), lerp(560, 480, su), 90, 0.35, "255,220,120"); ctx.fillStyle = "#ffd76a"; ctx.beginPath(); ctx.arc(lerp(780, 900, su), lerp(560, 480, su), 26, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  if (night > 0) { ctx.globalAlpha = night; ctx.fillStyle = "#e9eeff"; ctx.beginPath(); ctx.arc(880, 500, 26, 0, 7); ctx.fill(); ctx.fillStyle = "rgb(14,20,40)"; ctx.beginPath(); ctx.arc(892, 492, 22, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  // −2 cm Maßlinie
  const m = ramp(t, sc.k1, sc.k1 + 0.3) * (1 - night);
  if (m > 0) {
    const full = 520 + 4 * 120 + 3 * 36;
    ctx.strokeStyle = `rgba(255,59,59,${m})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(660, full); ctx.lineTo(700, full); ctx.lineTo(700, end); ctx.lineTo(660, end); ctx.stroke();
    label("−2 CM", 770, (full + end) / 2, 28, `rgba(255,59,59,${m})`);
  }
}
function sPlates(t, sc) {
  blackBg();
  const close = easeIO(ramp(t, sc.k2, sc.k3));
  halo(540, 830, 380, 0.12);
  // Kniegelenk: Oberschenkel unten, Schienbein oben
  ctx.save(); ctx.shadowColor = "rgba(190,215,255,0.5)"; ctx.shadowBlur = 30; ctx.fillStyle = "rgba(225,232,242,0.9)";
  rr(470, 470, 140, 260, 50); ctx.fill(); rr(430, 690, 220, 100, 50); ctx.fill();
  rr(440, 850, 200, 90, 40); ctx.fill(); rr(475, 900, 130, 260, 40); ctx.fill();
  rr(650, 880, 34, 260, 17); ctx.fill();
  ctx.restore();
  // Wachstumsfugen
  ctx.strokeStyle = `rgba(30,40,55,${0.9 * (1 - close)})`; ctx.lineWidth = 9;
  for (const y of [690, 940]) { ctx.beginPath(); for (let x = 440; x <= 640; x += 10) { const yy = y + Math.sin(x * 0.07) * 6; x === 440 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
  const la = ramp(t, sc.k1, sc.k1 + 0.3) * (1 - close * 0.5);
  if (la > 0) { ctx.strokeStyle = `rgba(255,255,255,${la})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(420, 690); ctx.lineTo(300, 800); ctx.lineTo(420, 940); ctx.stroke(); label("WACHSTUMS-", 230, 790, 20, `rgba(255,255,255,${la})`); label("FUGEN", 230, 816, 20, `rgba(255,255,255,${la})`); }
  // Zeitstrahl 0 -> 18
  const tl = clamp(ramp(t, sc.t0, sc.k3));
  const x0 = 200, x1 = 880, y = 420;
  ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, tl), y); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(lerp(x0, x1, tl), y, 9, 0, 7); ctx.fill();
  label(String(Math.round(18 * tl)), lerp(x0, x1, tl), y - 34, 26, "#fff");
  ctx.fillStyle = RED; ctx.fillRect(x1 - 2, y - 16, 4, 32); label("18", x1, y + 34, 22, RED);
  if (close > 0.95) label("FEST", 540, 1230 - 60, 34, RED);
}
function sFinal(t, sc) {
  studio(); ruler(170);
  person(MOM.x, MOM.cm); person(DAD.x, DAD.cm); person(SON.x, SON.cm, { bright: true });
  const yT = cmY(190), yB = cmY(170);
  const b = ramp(t, sc.k1, sc.k1 + 0.4);
  ctx.fillStyle = `rgba(255,255,255,${0.16 * b})`; ctx.fillRect(MOM.x - 120, yT, DAD.x - MOM.x + 240, yB - yT);
  ctx.strokeStyle = `rgba(255,255,255,${0.8 * b})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(MOM.x - 120, yT); ctx.lineTo(DAD.x + 120, yT); ctx.moveTo(MOM.x - 120, yB); ctx.lineTo(DAD.x + 120, yB); ctx.stroke();
  // Gewohnheiten: Mond, Teller, Schuh
  const ic = ramp(t, sc.k2, sc.k2 + 0.4);
  if (ic > 0) {
    ctx.save(); ctx.globalAlpha = ic; ctx.strokeStyle = "#fff"; ctx.fillStyle = "#fff"; ctx.lineWidth = 4;
    const y = yT - 110;
    ctx.beginPath(); ctx.arc(440, y, 22, 0.3, Math.PI * 2 - 0.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(540, y, 24, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(540, y, 12, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(612, y + 14); ctx.lineTo(612, y - 10); ctx.lineTo(640, y - 4); ctx.lineTo(668, y + 8); ctx.lineTo(668, y + 14); ctx.closePath(); ctx.stroke();
    ctx.restore();
    const cm = lerp(180, 187, easeOut(ramp(t, sc.k2, sc.k2 + 1.0)));
    heightLine(SON.x, cm, null, RED, ic, 70);
  }
}

// ------------------------------------------------------------------ Untertitel (Wort für Wort, unter der Szene)
function caption(t) {
  const card = TL.cards.find(c => t >= c.start - 0.05 && t < c.end);
  if (!card) return;
  ctx.save(); ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round";
  const size = 58, lh = 74;
  const lines = card.lines;
  const y0 = CAP_Y + (3 - lines.length) * lh * 0.5;
  lines.forEach((line, li) => {
    ctx.font = `900 ${size}px InterBlk`;
    const words = line.map(k => k.text.toUpperCase());
    const ws = words.map(w => ctx.measureText(w).width), gap = size * 0.28;
    const tot = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    const scale = Math.min(1, 860 / tot);
    let x = CAP_X - tot * scale / 2;
    const y = y0 + li * lh;
    line.forEach((k, i) => {
      const p = ramp(t, k.s - 0.04, k.s + 0.18);
      if (p > 0) {
        ctx.save(); ctx.translate(x + ws[i] * scale / 2, y + (1 - easeOut(p)) * 14); ctx.scale(scale, scale);
        ctx.globalAlpha = easeOut(p);
        ctx.font = `900 ${size}px InterBlk`; ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 16;
        const hot = k.style === "heavy";
        ctx.fillStyle = hot ? RED : "#ffffff";
        ctx.fillText(words[i], 0, 0);
        ctx.restore();
      }
      x += (ws[i] + gap) * scale;
    });
  });
  ctx.restore();
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  let cur = SC.findIndex((s, i) => t >= s.t0 && (i === SC.length - 1 || t < SC[i + 1].t0));
  if (cur < 0) cur = 0;
  const sc = SC[cur];
  sc.f(t, sc);
  // Überblendung vom vorherigen Bild
  const fi = ramp(t, sc.t0, sc.t0 + 0.25);
  if (cur > 0 && fi < 1) { ctx.save(); ctx.globalAlpha = 1 - fi; SC[cur - 1].f(t, SC[cur - 1]); ctx.restore(); }
  // dunkler Verlauf unter dem Text (ohne Kante)
  const vg = ctx.createLinearGradient(0, 1150, 0, H);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(0.4, "rgba(0,0,0,0.35)"); vg.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vg; ctx.fillRect(0, 1150, W, H - 1150);
  caption(t);
  const fade = Math.max(1 - ramp(t, 0, 0.2), ramp(t, TL.duration - 0.6, TL.duration));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

function buildScenes() {
  const w = (si, x, n) => Wt(si, x, n);
  SC = [
    { f: sFamily, t0: 0, k0: w(0, "168"), k1: w(0, "178"), k2: w(0, "185") },
    { f: sGenes, t0: S[1], k1: w(1, "halbe") },
    { f: sFormula, t0: S[2], k0: w(2, "Eltern"), k1: w(3, "13"), k2: w(3, "Mittelwert"), k3: w(4, "180") },
    { f: sRange, t0: S[5], k1: w(6, "Bereich"), k2: S[7] },
    { f: sSleep, t0: S[8], k1: w(8, "Wachstumshormon"), k2: w(8, "Tiefschlaf"), k3: w(9, "kosten") },
    { f: sBones, t0: S[10], k1: w(10, "Eiweiß") },
    { f: sSprint, t0: S[11], k1: w(11, "nicht") },
    { f: sDense, t0: S[12], k1: w(12, "dichtere") },
    { f: sSpine, t0: S[13], k1: w(13, "23"), k2: w(13, "Kissen") },
    { f: sSquash, t0: S[14], k1: w(15, "2"), k2: S[16] },
    { f: sPlates, t0: S[17], k1: w(18, "Wachstumsfugen"), k2: w(18, "18"), k3: w(18, "fest") },
    { f: sFinal, t0: S[19], k1: w(19, "Bereich"), k2: w(19, "Platz") },
  ];
}

window.exportEvents = function () {
  return {
    duration: TL.duration, cuts: SC.slice(1).map(s => s.t0),
    heights: [SC[0].k0, SC[0].k1, SC[0].k2], half: SC[1].k1, plus13: SC[2].k1, avg: SC[2].k2, result: SC[2].k3,
    range: S[5] + 0.1, zoom: SC[3].k1, marker: SC[3].k2, graph: S[8] + 0.2, deep: SC[4].k2, cut: SC[4].k3,
    protein: SC[5].k1, run: [S[11], SC[6].k1], cross: SC[6].k1, dense: SC[7].k1, discs: SC[8].k1, cushion: SC[8].k2,
    squash: S[14], shorter: SC[9].k1, night: S[16], plates: [SC[10].t0, SC[10].k3], fest: SC[10].k3, final: SC[11].k2,
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  S = TL.sentences.map(s => s.start);
  E = TL.sentences.map(s => s.end);
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  TL.duration = Math.round((E[E.length - 1] + 1.2) * 100) / 100;
  window.DURATION = TL.duration;
  await document.fonts.load("900 50px InterBlk");
  buildScenes();
  return true;
};
