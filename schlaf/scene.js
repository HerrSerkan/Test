// "1760 vs. 2026" – deutsche Version (eigene Zeichnung), TikTok-Vollbild 1080x1920, ohne Sprecher.
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

// ------------------------------------------------------------ "1760 vs. 2026" – Schlafen (eigene Zeichnung)
const DUR = 17.0;
const T = { bed: 0.9, blow: 2.0, dawn: 5.0, wake: 6.0, roll: 7.1, modern: 7.9, put: 9.4, buzz1: 10.1, close: 10.9, buzz2: 11.5, alarm: 12.6, groggy: 13.0, painting: 13.8, paintEnd: 15.3, facepalm: 15.5 };
const BX = 330, PILLOW_Y = 1300;

function yearAt(t) {
  if (t < T.roll) return "1760";
  if (t > T.roll + 0.7) return "2026";
  const k = ramp(t, T.roll, T.roll + 0.7);
  return String(Math.round(lerp(1760, 2026, easeIO(k))));
}
function room1760(t) {
  const dawn = ramp(t, T.dawn, T.wake + 0.5), candle = t < T.blow;
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(28, 120, dawn)},${lerp(22, 92, dawn)},${lerp(30, 80, dawn)})`); g.addColorStop(1, `rgb(${lerp(16, 70, dawn)},${lerp(12, 52, dawn)},${lerp(14, 44, dawn)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(60,40,24,0.5)"; for (let i = 0; i < 12; i++) ctx.fillRect(i * 92, 0, 6, 1500);                      // Holzwand
  // Fenster
  const wx = 690, wy = 640;
  ctx.fillStyle = "#4a3422"; ctx.fillRect(wx - 12, wy - 12, 264, 304);
  const sky = ctx.createLinearGradient(0, wy, 0, wy + 280); sky.addColorStop(0, `rgb(${lerp(14, 250, dawn)},${lerp(20, 170, dawn)},${lerp(50, 120, dawn)})`); sky.addColorStop(1, `rgb(${lerp(30, 255, dawn)},${lerp(30, 210, dawn)},${lerp(60, 150, dawn)})`);
  ctx.fillStyle = sky; ctx.fillRect(wx, wy, 240, 280);
  if (dawn < 0.5) circle(wx + 170, wy + 70, 22, "#f3f0d6"); else { circle(wx + 120, wy + 250 - dawn * 80, 34, "#ffd36e"); glow(wx + 120, wy + 220, 180, "255,200,120", 0.4 * dawn); }
  ctx.fillStyle = "#4a3422"; ctx.fillRect(wx + 116, wy, 8, 280); ctx.fillRect(wx, wy + 136, 240, 8);
  if (dawn > 0) { ctx.fillStyle = `rgba(255,200,130,${0.15 * dawn})`; ctx.beginPath(); ctx.moveTo(wx, wy + 280); ctx.lineTo(wx + 240, wy + 280); ctx.lineTo(wx + 100, 1560); ctx.lineTo(wx - 300, 1560); ctx.fill(); }
  // Boden
  ctx.fillStyle = "#2a1c12"; ctx.fillRect(0, 1500, W, H - 1500);
  // Hocker mit Kerze
  ctx.fillStyle = "#5a3a22"; ctx.fillRect(110, 1260, 140, 20); ctx.fillRect(122, 1280, 14, 220); ctx.fillRect(224, 1280, 14, 220);
  ctx.fillStyle = "#c8943a"; ctx.beginPath(); ctx.ellipse(180, 1258, 46, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f4ecd8"; ctx.fillRect(168, 1170, 24, 88);
  if (candle) { const f = 1 + Math.sin(t * 14) * 0.08; glow(180, 1150, 420, "255,170,80", 0.4); ctx.fillStyle = "#ffd070"; ctx.beginPath(); ctx.ellipse(180, 1150, 9 * f, 20 * f, 0, 0, Math.PI * 2); ctx.fill(); }
  const sm = ramp(t, T.blow, T.blow + 1.4);
  if (sm > 0 && sm < 1) { ctx.strokeStyle = `rgba(220,220,230,${1 - sm})`; ctx.lineWidth = 4; ctx.beginPath(); for (let k = 0; k <= 12; k++) { const yy = 1160 - k * 10 * (0.4 + sm); const xx = 180 + Math.sin(k * 0.8 + t * 4) * 8 * sm; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  return dawn;
}
function room2026(t) {
  let g = ctx.createLinearGradient(0, 0, 0, H);
  const morning = ramp(t, T.alarm, T.alarm + 1.0);
  g.addColorStop(0, `rgb(${lerp(18, 60, morning)},${lerp(22, 64, morning)},${lerp(48, 96, morning)})`); g.addColorStop(1, `rgb(${lerp(10, 36, morning)},${lerp(12, 38, morning)},${lerp(28, 60, morning)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Fenster mit Jalousie
  const wx = 700, wy = 640;
  ctx.fillStyle = "#c8ccd6"; ctx.fillRect(wx - 10, wy - 10, 260, 300);
  ctx.fillStyle = morning > 0.3 ? "#e8b8c8" : "#1a2244"; ctx.fillRect(wx, wy, 240, 280);
  ctx.fillStyle = "rgba(200,205,215,0.85)"; for (let i = 0; i < 12; i++) ctx.fillRect(wx, wy + i * 23, 240, 12);
  // Bild an der Wand: der Schläfer von 1760 (eigene Zeichnung)
  painting(400, 860, 1);
  ctx.fillStyle = "#14141e"; ctx.fillRect(0, 1500, W, H - 1500);
  // Nachttisch mit Lampe
  ctx.fillStyle = "#3a3448"; rr(90, 1300, 170, 200, 10); ctx.fill();
  ctx.fillStyle = "#5a5470"; ctx.fillRect(170, 1210, 8, 90); ctx.fillStyle = "#8a84a0"; ctx.beginPath(); ctx.moveTo(130, 1220); ctx.lineTo(220, 1220); ctx.lineTo(200, 1170); ctx.lineTo(150, 1170); ctx.fill();
}
function painting(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#b8862e"; rr(-120, -150, 240, 300, 8); ctx.fill();
  ctx.fillStyle = "#d8a84a"; rr(-108, -138, 216, 276, 4); ctx.fill();
  ctx.fillStyle = "#3a2618"; ctx.fillRect(-98, -128, 196, 256);
  glow(-30, 30, 120, "255,170,80", 0.4);
  ctx.fillStyle = "#f4ecd8"; ctx.fillRect(-40, 10, 14, 50); ctx.fillStyle = "#ffd070"; ctx.beginPath(); ctx.ellipse(-33, 2, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Gesicht mit Schlafmütze, zufrieden
  circle(30, -20, 46, "#f0cdb0");
  ctx.fillStyle = "#e9e4d8"; ctx.beginPath(); ctx.moveTo(-14, -40); ctx.quadraticCurveTo(30, -110, 90, -90); ctx.lineTo(76, -40); ctx.fill(); circle(92, -92, 10, "#f2c24c");
  ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 4; for (const dx of [16, 44]) { ctx.beginPath(); ctx.arc(dx, -22, 7, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(30, -8, 14, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.fillStyle = "#e9e4d8"; rr(-20, 26, 100, 110, 30); ctx.fill();
  ctx.fillStyle = "#e9d8a8"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.fillText("1760", 0, 122);
  ctx.restore();
}
function bed(col, cover) {
  ctx.fillStyle = col; rr(BX - 260, PILLOW_Y - 120, 30, 320, 6); ctx.fill();                          // Kopfteil
  ctx.fillStyle = "#ece8f0"; rr(BX - 230, PILLOW_Y - 40, 150, 60, 24); ctx.fill();                      // Kissen
  ctx.fillStyle = col; rr(BX - 240, PILLOW_Y + 80, 620, 120, 14); ctx.fill();                           // Rahmen
  if (cover) { ctx.fillStyle = cover; rr(BX - 120, PILLOW_Y - 10, 500, 120, 30); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(BX - 120, PILLOW_Y + 4, 500, 10); }
}
// liegende Figur: Kopf auf dem Kissen (gedrehte Figur, Decke darüber)
function lying(face, spec, armUp) {
  ctx.save(); ctx.translate(BX - 150, PILLOW_Y - 6); ctx.rotate(-Math.PI / 2);
  person(0, 380, { ...spec, s: 0.95, f: face, arm: armUp ? [{ side: 1, ang: -2.0 }] : undefined });
  ctx.restore();
}
function nightcap(x, y, u) {
  ctx.fillStyle = "#e9e4d8"; ctx.beginPath(); ctx.moveTo(x - 32 * u, y - 10 * u); ctx.quadraticCurveTo(x + 10 * u, y - 80 * u, x + 70 * u, y - 60 * u); ctx.lineTo(x + 34 * u, y - 4 * u); ctx.fill();
  circle(x + 72 * u, y - 62 * u, 10 * u, "#f2c24c");
}
function zzz(x, y, t, col = "#cfd8ff") {
  for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * p); ctx.fillStyle = col; ctx.font = `900 ${32 + 22 * p}px InterX`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("z", x + p * 60, y - p * 110); }
  ctx.globalAlpha = 1;
}
function phoneGlow(x, y, k) { glow(x, y, 220, "120,170,255", 0.45 * k); ctx.fillStyle = "#14161c"; rr(x - 26, y - 44, 52, 88, 8); ctx.fill(); ctx.fillStyle = `rgba(150,200,255,${0.5 + 0.5 * k})`; rr(x - 21, y - 38, 42, 76, 5); ctx.fill(); }

window.renderFrame = function (t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0a0a10"; ctx.fillRect(0, 0, W, H);
  const Z = 1.35;                                          // Kamera näher dran, Szene füllt das Hochformat
  ctx.setTransform(Z, 0, 0, Z, 540 - 470 * Z, 1560 - 1560 * Z);
  const SPEC1760 = { c2: "#e9e4d8", skin: "#f0cdb0", white: false, hair: "#5a3a22", legs: "#e9e4d8", shoes: "#c8b8a0", seed: 3 };
  const SPEC2026 = { c2: "#5a7ad0", skin: "#e0a982", hair: "#2a2226", legs: "#2a2f45", seed: 5 };
  if (t < T.modern) {
    const dawn = room1760(t);
    bed("#6a4628", null);
    if (t < T.bed) {                                       // steht neben dem Bett mit Kerze
      const P = person(BX + 120, 1500, { ...SPEC1760, s: 1.3, f: "smile" });
      nightcap(P.hx, P.hy, 1.3 * 1.45);
    } else if (t < T.wake) {
      lying(t < T.blow ? "smile" : "closed", SPEC1760, false);
      nightcap(BX - 150, PILLOW_Y - 6, 0.95 * 1.45);
      ctx.fillStyle = "#c8b896"; rr(BX - 120, PILLOW_Y - 10, 500, 120, 30); ctx.fill();
      if (t > T.blow + 0.4) zzz(BX - 60, PILLOW_Y - 130, t);
    } else {                                               // wacht frisch auf, streckt sich
      const P = person(BX + 40, PILLOW_Y + 140, { ...SPEC1760, s: 1.0, f: "happy", arm: [{ side: -1, ang: 2.8 }, { side: 1, ang: -2.8 }] });
      nightcap(P.hx, P.hy, 1.45);
      ctx.fillStyle = "#c8b896"; rr(BX - 120, PILLOW_Y + 30, 500, 90, 30); ctx.fill();
    }
    // Hand am Kerzenlicht beim Auspusten
    if (t > T.blow - 0.25 && t < T.blow + 0.2) { ctx.fillStyle = "rgba(240,240,250,0.5)"; ctx.beginPath(); ctx.ellipse(205, 1150, 18 * ramp(t, T.blow - 0.25, T.blow), 8, 0, 0, Math.PI * 2); ctx.fill(); }
  } else {
    room2026(t);
    bed("#3a3458", null);
    const awake = t >= T.alarm + 0.4;
    if (!awake) {
      const scrolling = t < T.put || (t > T.buzz1 && t < T.close);
      lying(scrolling ? "neutral" : "closed", SPEC2026, scrolling);
      ctx.fillStyle = "#4a5aa8"; rr(BX - 120, PILLOW_Y - 10, 500, 120, 30); ctx.fill();
      if (scrolling) phoneGlow(BX - 20, PILLOW_Y - 120, 1);
      else {
        phoneGlow(170, 1290, (t > T.buzz2 && t < T.buzz2 + 0.8) || (t > T.alarm && t < T.alarm + 0.5) ? 1 : 0.1);
        zzz(BX - 60, PILLOW_Y - 130, t, "#8a96c8");
      }
      for (const b of [T.buzz1, T.buzz2, T.alarm]) {
        const k = ramp(t, b, b + 0.6); if (k <= 0 || k >= 1) continue;
        ctx.strokeStyle = `rgba(255,120,160,${1 - k})`; ctx.lineWidth = 5; for (const r of [40, 60, 80]) { ctx.beginPath(); ctx.arc(170, 1290, r * (0.6 + k), -0.7, 0.7); ctx.stroke(); ctx.beginPath(); ctx.arc(170, 1290, r * (0.6 + k), Math.PI - 0.7, Math.PI + 0.7); ctx.stroke(); }
      }
    } else {                                               // müde aufgewacht, später Hand vors Gesicht
      const P = person(BX + 40, PILLOW_Y + 140, { ...SPEC2026, s: 1.0, f: t > T.facepalm ? "annoyed" : "sad", arm: t > T.facepalm ? [{ side: 1, ang: -2.7 }] : undefined });
      ctx.fillStyle = "#4a5aa8"; rr(BX - 120, PILLOW_Y + 30, 500, 90, 30); ctx.fill();
      // Augenringe
      ctx.fillStyle = "rgba(90,70,120,0.4)"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(P.hx + sd * 18, P.hy + 14, 10, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Jahreszahl oben
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 92px InterX"; ctx.letterSpacing = "6px";
  const rollK = t > T.roll && t < T.roll + 0.7 ? 1 : 0;
  ctx.fillStyle = "#f6f2e6"; ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16;
  ctx.fillText(yearAt(t), 540 + rollK * Math.sin(t * 60) * 3, 380);
  ctx.restore();
  // Kamerafahrt aufs Bild am Ende
  const pk = easeIO(ramp(t, T.painting, T.painting + 0.6)) * (1 - easeIO(ramp(t, T.paintEnd, T.paintEnd + 0.4)));
  if (pk > 0) {
    ctx.fillStyle = `rgba(10,10,18,${0.75 * pk})`; ctx.fillRect(0, 0, W, H);
    painting(lerp(380, 540, pk), lerp(600, 1000, pk), lerp(1, 2.6, pk));
  }
  // Übergang 1760 -> 2026
  const tk = ramp(t, T.roll + 0.2, T.modern) * (1 - ramp(t, T.modern, T.modern + 0.35));
  if (tk > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, tk * 1.4)})`; ctx.fillRect(0, 420, W, H - 420); }
  grain(t); fadeEdges(t, DUR);
};
window.exportEvents = function () { return { duration: DUR, ...T }; };
window.setup = async function () { await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("800 16px InterX")]); makeGrain(89); return { duration: DUR }; };
