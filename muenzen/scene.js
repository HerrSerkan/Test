// "Deine Arbeit baut ihren Berg." – deutsche Version (eigene Zeichnung), TikTok-Vollbild 1080x1920, ohne Sprecher.
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

// ------------------------------------------------------------ "Deine Arbeit baut ihren Berg." (eigene Zeichnung)
const DUR = 21.0;
const T = { ask: 8.6, askEnd: 10.2, keep: 12.6, sit: 15.6, text1: 17.0, text2: 18.2 };
const WX = 280, MX = 420, PX = 760, HOLE = 120, FY = 1480;
// Münzen: [Startzeit, Ziel] – "boss", "kosten" oder "selbst"
const COINS = [];
for (let t = 0.6, i = 0; t < 16.6; t += 0.62, i++) {
  let dest = i % 4 === 3 ? "kosten" : "boss";
  if (t > T.keep - 0.1 && (i % 3 === 0)) dest = "selbst";
  COINS.push([t, dest]);
}
const selfCount = t => COINS.filter(([s, d]) => d === "selbst" && t >= s + 0.7).length;
const bossCount = t => COINS.filter(([s, d]) => d === "boss" && t >= s + 0.7).length;
const pileH = t => 140 + bossCount(t) * 14;

function backdrop(t) {
  ctx.fillStyle = "#0a0a0d"; ctx.fillRect(0, 0, W, H);
  // Deckenlampe + Lichtkegel
  const lx = 430;
  const g = ctx.createLinearGradient(0, 560, 0, FY);
  g.addColorStop(0, "rgba(255,236,190,0.10)"); g.addColorStop(1, "rgba(255,236,190,0.22)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx - 30, 560); ctx.lineTo(lx + 30, 560); ctx.lineTo(lx + 560, FY); ctx.lineTo(lx - 480, FY); ctx.fill();
  circle(lx, 556, 14, "#fff6dc"); glow(lx, 556, 120, "255,240,200", 0.6);
  // Boden mit Spiegelung
  ctx.fillStyle = "#121216"; ctx.fillRect(0, FY, W, H - FY);
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(0, FY, W, 3);
  const g2 = ctx.createLinearGradient(0, FY, 0, H); g2.addColorStop(0, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = g2; ctx.fillRect(0, FY, W, H - FY);
}
function costHole(t) {
  ctx.save(); ctx.translate(HOLE, FY + 8); ctx.scale(1, 0.24);
  glow(0, 0, 110, "255,40,60", 0.35 + 0.1 * Math.sin(t * 4));
  ctx.fillStyle = "#050505"; ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#d9203a"; ctx.lineWidth = 8; ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#e8344a"; ctx.font = "800 24px InterX"; ctx.letterSpacing = "4px"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("KOSTEN", HOLE + 2, FY + 56); ctx.letterSpacing = "0px";
}
function machine(t) {
  ctx.fillStyle = "#2a2c34"; rr(MX - 50, FY - 260, 140, 260, 14); ctx.fill();
  ctx.fillStyle = "#3a3d48"; rr(MX - 40, FY - 250, 120, 40, 8); ctx.fill();
  ctx.fillStyle = "#1a1b20"; rr(MX + 20, FY - 300, 34, 60, 6); ctx.fill();                         // Schornstein/Ausgabe
  // Kurbelrad
  const a = t * 5;
  ctx.strokeStyle = "#8a8f9c"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(MX - 50, FY - 150, 44, 0, Math.PI * 2); ctx.stroke();
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(MX - 50, FY - 150); ctx.lineTo(MX - 50 + Math.cos(a + k * Math.PI / 2) * 44, FY - 150 + Math.sin(a + k * Math.PI / 2) * 44); ctx.stroke(); }
  circle(MX - 50 + Math.cos(a) * 44, FY - 150 + Math.sin(a) * 44, 9, "#c8ccd6");
  return [MX - 50 + Math.cos(a) * 44, FY - 150 + Math.sin(a) * 44];
}
function goldPile(t) {
  const h = pileH(t), base = 380;
  ctx.save();
  for (let r = 0; r * 26 < h; r++) {
    const y = FY - r * 26 - 26, w = base * (1 - (r * 26) / (h + 60));
    for (let x = -w / 2; x < w / 2 - 40; x += 58) {
      ctx.fillStyle = (r + Math.round(x / 58)) % 2 ? "#c89a3a" : "#d8ab48"; rr(PX + x, y, 54, 24, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,240,180,0.35)"; ctx.fillRect(PX + x + 4, y + 3, 46, 4);
    }
  }
  ctx.restore();
  return FY - h;
}
function coin(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(0, 0, 16, "#f2c24c"); circle(0, 0, 11, "#e0aa30");
  ctx.fillStyle = "#fff2b0"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("€", 0, 1);
  ctx.restore();
}
function flyingCoins(t, topY) {
  for (const [s, d] of COINS) {
    const k = ramp(t, s, s + 0.7);
    if (k <= 0 || k >= 1) continue;
    const x0 = MX + 37, y0 = FY - 300;
    let x1, y1, hgt;
    if (d === "boss") { x1 = PX + 30; y1 = topY - 20; hgt = 260; }
    else if (d === "kosten") { x1 = HOLE; y1 = FY + 10; hgt = 200; }
    else { x1 = WX - 60; y1 = FY - 20 - selfCount(t) * 12; hgt = 160; }
    const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(Math.PI * k) * hgt;
    coin(x, y, d === "kosten" ? 1 - k * 0.5 : 1);
  }
}
function selfStack(t) {
  const n = selfCount(t);
  for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? "#e0aa30" : "#f2c24c"; ctx.beginPath(); ctx.ellipse(WX - 60, FY - 8 - i * 12, 22, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  return n;
}

window.renderFrame = function (t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  backdrop(t);
  costHole(t);
  const topY = goldPile(t);
  // Chef oben auf dem Berg
  const bossF = stateAt([[0, "smile"], [T.ask, "annoyed"], [T.askEnd, "smile"], [T.keep, "neutral"], [T.keep + 1, "smile"]], t);
  const clap = Math.abs(Math.sin(t * 6)) < 0.3;
  person(PX, topY, { s: 1.0, c2: "#3a3f52", collar: true, hair: "#2a2a2e", skin: "#e8c2a4", legs: "#2a2c38", shoes: "#141416", f: bossF, seed: 4, look: -1,
    arm: t > T.ask && t < T.askEnd ? [{ side: -1, ang: 0.6 }] : [{ side: -1, ang: clap ? 0.9 : 0.6 }, { side: 1, ang: clap ? -0.9 : -0.6 }] });
  const crank = machine(t);
  const n = selfStack(t);
  // Arbeiter: kurbelt, hält die Hand auf, behält dann Münzen, setzt sich am Ende auf seinen kleinen Stapel
  const cranking = t < T.ask || (t > T.askEnd && t < T.sit);
  const wf = stateAt([[0, "neutral"], [T.ask, "wide"], [T.ask + 0.8, "sad"], [T.askEnd, "neutral"], [T.keep, "wide"], [T.keep + 0.6, "smile"], [T.sit, "happy"]], t);
  const sitK = easeIO(ramp(t, T.sit, T.sit + 0.6));
  const wy = FY - sitK * (36 + n * 12) * 0;
  const ang = Math.atan2(crank[0] - (WX + 40), crank[1] - (FY - 230));
  person(WX, wy, { s: 1.15, c2: "#e9e4d8", hair: "#3a2a22", skin: "#e0a982", legs: "#3a3f5a", f: wf, seed: 2, look: t > T.ask && t < T.askEnd ? 1 : 0,
    arm: cranking ? [{ side: 1, ang: -(Math.PI - ang) * 0.9 }] : t > T.ask && t < T.askEnd ? [{ side: 1, ang: -1.5 }] : [{ side: -1, ang: 0.5 }] });
  flyingCoins(t, topY);
  // Schilder
  ctx.font = "800 24px InterX"; ctx.letterSpacing = "4px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fillText("ARBEITER", WX, FY - 430); ctx.fillText("CHEF", PX, topY - 380);
  ctx.letterSpacing = "0px";
  if (t > T.ask && t < T.askEnd) { ctx.globalAlpha = Math.sin(Math.PI * ramp(t, T.ask, T.askEnd)); bubble("… und ich?", WX + 30, FY - 500, 1, "speech", [-20, 8], 28); ctx.globalAlpha = 1; }
  // Schlusstext
  for (const [txt, y, t0, hi] of [["DEINE ARBEIT BAUT IHREN BERG.", 1640, T.text1, false], ["BEHALTE EINE MÜNZE. BAU DEINEN.", 1700, T.text2, true]]) {
    const p = ramp(t, t0, t0 + 1.0);
    if (p <= 0) continue;
    const n2 = Math.floor(txt.length * p);
    ctx.font = "800 34px InterX"; ctx.letterSpacing = "4px"; ctx.textAlign = "left";
    const full = ctx.measureText(txt).width; const x0 = 540 - full / 2;
    const part = txt.slice(0, n2);
    ctx.fillStyle = "#ffffff"; ctx.fillText(part, x0, y);
    if (hi && n2 > 26) { const pre = ctx.measureText("BEHALTE EINE MÜNZE. BAU ").width; ctx.fillStyle = "#f6c24c"; ctx.fillText(txt.slice(24, n2), x0 + pre, y); }
    ctx.letterSpacing = "0px";
  }
  grain(t); fadeEdges(t, DUR);
};
window.exportEvents = function () { return { duration: DUR, coins: COINS, ...T }; };
window.setup = async function () { await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("800 16px InterX")]); makeGrain(83); return { duration: DUR }; };
