// "Gleicher Film." – deutsche Version (eigene Zeichnung), TikTok-Vollbild 1080x1920, ohne Sprecher.
// Figuren aus tools/figur_rig.js, Grundgerüst gemeinsam mit den anderen Vollbild-Videos.
// Gemeinsames Grundgerüst für die Vollbild-Videos (1080x1920): Hilfen, Figuren-Rig (tools/figur_rig.js),
// Sprech-/Gedankenblasen, Namensschilder, Titel oben mit Wechsel, Körnung.
"use strict";
const W = 1080, H = 1920;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function popIn(t, a, b = 99, dur = 0.25) { if (t < a || t > b + 0.2) return 0; return back(ramp(t, a, a + dur)) * (1 - easeIO(ramp(t, b, b + 0.2))); }

// Sprechblase (hell, Spitze) / Gedankenwolke / Kasten
function bubble(text, cx, cy, s, kind = "speech", tail = [0, 8], size = 30) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.font = `800 ${size}px InterX`; ctx.letterSpacing = "0.5px";
  const w = ctx.measureText(text).width + 44, h = size + 30;
  ctx.fillStyle = "#f8f4ea"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  if (kind === "thought") {
    ctx.beginPath();
    const n = Math.max(3, Math.round(w / 34));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + 10 + i * (w - 20) / n; ctx.moveTo(x + 18, -h / 2 + 6); ctx.arc(x, -h / 2 + 8, 18, 0, 7); ctx.moveTo(x + 18, h / 2 - 6); ctx.arc(x, h / 2 - 8, 18, 0, 7); }
    ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 20); ctx.fill();
    ctx.shadowColor = "transparent";
    circle(tail[0] * 0.5, h / 2 + 20, 9, "#f8f4ea"); circle(tail[0], h / 2 + 40, 6, "#f8f4ea");
  } else {
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    ctx.moveTo(tail[0] - 12, h / 2 - 3); ctx.lineTo(tail[0] + tail[1], h / 2 + 20); ctx.lineTo(tail[0] + 12, h / 2 - 3); ctx.fill();
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 1);
  ctx.restore();
}
function puff(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  for (let i = 0; i < 8; i++) { const a = i * 0.785; circle(x + Math.cos(a) * 50 * k, y + Math.sin(a) * 30 * k, 13 * (1 - k * 0.6), "#f8f4ea"); }
  ctx.restore();
}
// Namensschild unter einer Figur
function nameTag(text, cx, cy, a = 1, hi = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = "800 24px InterX"; ctx.letterSpacing = "3px";
  const w = ctx.measureText(text).width + 34;
  ctx.fillStyle = hi > 0 ? `rgba(246,178,58,${0.25 + 0.7 * hi})` : "rgba(20,22,32,0.88)"; rr(cx - w / 2, cy - 22, w, 44, 22); ctx.fill();
  ctx.strokeStyle = hi > 0 ? "#f6b23a" : "rgba(255,255,255,0.15)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = hi > 0.5 ? "#1d1d22" : "#eef0f4"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, cx + 1.5, cy + 1);
  ctx.restore();
}
// Titel oben: Zeilen A (weiß) wechseln zu Zeilen B (weiß + orange), danach wieder A
function titleSwap(t, A, B, tB, tBack, y0 = 290) {
  const kB = easeIO(ramp(t, tB, tB + 0.35)) * (1 - easeIO(ramp(t, tBack, tBack + 0.35)));
  const draw = (lines, a, dy) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 14;
    lines.forEach(([txt, col, size], i) => {
      ctx.font = `900 ${size || 66}px InterX`; ctx.letterSpacing = "-1px";
      let s = size || 66; const w = ctx.measureText(txt).width; if (w > 960) { s *= 960 / w; ctx.font = `900 ${s}px InterX`; }
      ctx.fillStyle = col || "#ffffff"; ctx.fillText(txt, 540, y0 + i * 78 + dy);
    });
    ctx.restore();
  };
  draw(A, (1 - kB) * easeOut(ramp(t, 0.05, 0.35)), -kB * 14);
  draw(B, kB, (1 - kB) * 14);
}
let GRAIN = [];
function grain(t) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.035; ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function makeGrain(seed0) {
  let seed = seed0; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
}
function fadeEdges(t, dur) {
  const f = Math.max(1 - ramp(t, 0, 0.25), ramp(t, dur - 0.5, dur - 0.05));
  if (f > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
}
function topShade() {
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, "rgba(6,7,12,0.7)"); g.addColorStop(1, "rgba(6,7,12,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 560);
}

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
  const blink = f === "happy" || f === "laugh" || f === "closed" ? 0 : BLINK(t + seed);
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
    if (f === "closed") { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(ex, ey - 2 * u, 5 * u, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); continue; }
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
  else if (f === "smile" || f === "happy" || f === "closed") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my - 4 * u, 7 * u, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
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

// ------------------------------------------------------------ "Gleicher Film." – Misophonie (eigene Zeichnung)
const DUR = 11.8;
const CRUNCH = [1.0, 1.7, 2.6, 3.4, 4.3, 5.2];
const T = { offer: 6.0, nein: 6.8, fact: 7.6, big: 8.2, calm: 9.0, rip: 10.4, back: 11.2 };
const LX = 300, RX = 760, FY = 1600;

function cinema(t) {
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#14060c"); g.addColorStop(0.55, "#2a0c16"); g.addColorStop(1, "#160608");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Leinwand-Licht von vorne (flackert leicht)
  const f = 0.18 + 0.05 * Math.sin(t * 5.3) + 0.03 * Math.sin(t * 11);
  glow(540, 560, 900, "160,180,255", f * 0.6);
  ctx.fillStyle = "rgba(220,230,255,0.9)"; rr(470, 470, 140, 14, 7); ctx.fill();               // Projektor
  ctx.fillStyle = "#2a8a4a"; rr(40, 520, 70, 30, 4); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("EXIT", 75, 536);
  // hintere Sitzreihen
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) {
    const x = i * 160 + (r % 2) * 80 - 20, y = 700 + r * 150;
    ctx.fillStyle = `rgb(${110 - r * 10},${20},${34})`; rr(x, y, 130, 160, 30); ctx.fill();
  }
}
function seat(x, front) {
  if (!front) { ctx.fillStyle = "#8a1a2e"; rr(x - 170, 1050, 340, 520, 70); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.15)"; rr(x - 130, 1090, 260, 420, 50); ctx.fill(); return; }
  ctx.fillStyle = "#7a1428"; rr(x - 200, 1380, 64, 260, 24); ctx.fill(); rr(x + 136, 1380, 64, 260, 24); ctx.fill();
  ctx.fillStyle = "#9a2238"; rr(x - 150, 1480, 300, 160, 26); ctx.fill();
}
function chips(x, y, k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.1);
  ctx.fillStyle = "#e8443c"; ctx.beginPath(); ctx.moveTo(-44, -70); ctx.lineTo(44, -70); ctx.lineTo(40, 70); ctx.lineTo(-40, 70); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#c8302c"; for (const yy of [-70, 62]) { ctx.beginPath(); for (let i = 0; i <= 8; i++) ctx.lineTo(-44 + i * 11, yy + (i % 2 ? 8 : 0)); ctx.lineTo(44, yy); ctx.fill(); }
  ctx.fillStyle = "#ffd23a"; ctx.beginPath(); ctx.ellipse(0, 0, 30, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8302c"; ctx.font = "900 18px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("CHIPS", 0, 1);
  ctx.restore();
}
function drink(x, y) { ctx.fillStyle = "#e8443c"; rr(x - 18, y - 60, 36, 60, 5); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(x - 18, y - 46, 36, 10); ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 4, y - 60); ctx.lineTo(x + 10, y - 86); ctx.stroke(); }
// Wut 0..1 aus den Knusper-Momenten
function anger(t) {
  let a = 0; for (const c of CRUNCH) a += 0.17 * ramp(t, c, c + 0.15);
  a = Math.min(1, a);
  if (t > T.big) a = 1;
  if (t > T.calm) a = 1 - 0.85 * ramp(t, T.calm, T.calm + 0.8);
  if (t > T.rip) a = Math.max(a, 0.6 * ramp(t, T.rip, T.rip + 0.2));
  if (t > T.back) a *= 1 - ramp(t, T.back, T.back + 0.4);
  return a;
}
function crunchWord(x, y, t, t0, big) {
  const k = popIn(t, t0, t0 + (big ? 0.7 : 0.45), 0.12);
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.08);
  ctx.fillStyle = "#1d0a0e"; ctx.beginPath();
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = (i % 2 ? 0.8 : 1) * (big ? 130 : 96); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.5); }
  ctx.fill();
  ctx.fillStyle = "#ff4b4b"; ctx.font = `900 ${big ? 46 : 34}px InterX`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(big ? "CRUNCH!!!" : "CRUNCH!", 0, 2);
  ctx.restore();
}

window.renderFrame = function (t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const shake = t > T.big && t < T.big + 0.5 ? Math.sin(t * 80) * 6 : 0;
  ctx.translate(shake, 0);
  cinema(t);
  seat(LX, false); seat(RX, false);
  const S = 1.45;
  // links: die meisten – isst Chips
  const eat = CRUNCH.some(c => t > c - 0.25 && t < c + 0.1) || (t > T.big - 0.25 && t < T.big + 0.1);
  const lf = stateAt([[0, "smile"], [T.offer, "happy"], [T.nein, "smile"], [T.big - 0.2, "wide"], [T.big + 0.4, "smile"], [T.rip, "happy"]], t);
  const PL = person(LX, FY, { s: S, c2: "#e9e4d8", hair: "#3a2a22", skin: "#f2c7a5", f: lf, seed: 2, look: t > T.offer && t < T.nein + 0.6 ? 1 : 0,
    arm: t > T.offer && t < T.nein + 0.4 ? [{ side: 1, ang: -1.45 }] : eat ? [{ side: 1, ang: -2.7 }] : [{ side: 1, ang: -0.7 }] });
  // rechts: Misophonie – wird rot
  const a = anger(t);
  const rf = a > 0.75 ? "annoyed" : a > 0.35 ? "sad" : t > T.nein - 0.1 && t < T.nein + 0.7 ? "smile" : "neutral";
  const PR = person(RX, FY, { s: S, c2: "#f2e0c0", hair: "#3a2a22", skin: "#e0a982", f: rf, seed: 5, look: a > 0.3 ? -0.6 : 0 });
  if (a > 0) {                                      // Kopf + Körper rot einfärben
    ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.fillStyle = "#ff3a3a";
    ctx.beginPath(); ctx.ellipse(PR.hx, PR.hy + 9, 46, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (a > 0.7) { ctx.strokeStyle = `rgba(255,255,255,${(a - 0.7) * 2})`; ctx.lineWidth = 6; for (const sd of [-1, 1]) { const p = (t * 1.6 + (sd > 0 ? 0.5 : 0)) % 1; ctx.beginPath(); ctx.moveTo(PR.hx + sd * 30, PR.hy - 60 - p * 50); ctx.quadraticCurveTo(PR.hx + sd * 50, PR.hy - 80 - p * 50, PR.hx + sd * 30, PR.hy - 100 - p * 50); ctx.stroke(); } }
  }
  seat(LX, true); seat(RX, true);
  chips(LX + 120, 1440, 1);
  drink(540, 1460);
  // Knusper-Wörter beim Wütenden
  CRUNCH.forEach((c, i) => crunchWord(RX, 820, t, c, false));
  crunchWord(RX, 800, t, T.big, true);
  ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "700 22px InterX"; ctx.textAlign = "center";
  CRUNCH.forEach(c => { const k = ramp(t, c, c + 0.5); if (k > 0 && k < 1) { ctx.globalAlpha = 1 - k; ctx.fillText("knusper", LX + 150, 1230 - k * 30); } });
  ctx.restore();
  bubble("Willst du was?", LX + 40, 880, popIn(t, T.offer, T.nein + 0.4), "speech", [40, 8], 30);
  bubble("Nein danke :)", RX, 880, popIn(t, T.nein, T.fact - 0.1), "speech", [0, 8], 30);
  const rk = popIn(t, T.rip, T.back, 0.12);
  if (rk > 0) { ctx.save(); ctx.translate(LX + 120, 1250); ctx.scale(rk, rk); ctx.fillStyle = "#fff"; ctx.font = "900 44px InterX"; ctx.textAlign = "center"; ctx.fillText("RIIIPP!", 0, 0); ctx.restore(); }
  nameTag("DIE MEISTEN", LX, 1720);
  nameTag("MISOPHONIE", RX, 1720, 1, ramp(t, T.fact, T.fact + 0.3) * (1 - ramp(t, T.back, T.back + 0.3)));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  topShade();
  titleSwap(t, [["GLEICHER FILM."]], [["FAST 1 VON 5 MENSCHEN", "#ffffff", 58], ["HABEN MISOPHONIE.", "#f6b23a", 60]], T.fact, T.back);
  grain(t); fadeEdges(t, DUR);
};
window.exportEvents = function () { return { duration: DUR, crunch: CRUNCH, ...T }; };
window.setup = async function () { await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("800 16px InterX")]); makeGrain(79); return { duration: DUR }; };
