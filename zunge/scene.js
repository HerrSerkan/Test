// "Probier's jetzt. Kannst du die Zunge rollen?" – deutsche Version (eigene Zeichnung), TikTok-Vollbild 1080x1920, ohne Sprecher.
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

// ------------------------------------------------------------ "Probier's jetzt. Kannst du die Zunge rollen?" (eigene Zeichnung)
const DUR = 11.8;
const T = { tryA: 0.7, tryEnd: 2.4, gen: 2.6, twinIn: 3.9, aber: 4.05, twinRoll: 4.9, rollEnd: 6.4, q: 5.2, cross: 6.6, noe: 7.1, fact: 8.0, try2: 8.6, try2End: 10.2, back: 11.2 };
const LX = 230, RX = 540, TX = 840, FY = 1600, DESK = 1385;

function room() {
  let g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#cfe6d6"); g.addColorStop(0.62, "#b8d8c4"); g.addColorStop(1, "#9cc4ac");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e6d9b8"; ctx.fillRect(0, 1180, W, 30);                       // Wandleiste
  // Tafel
  ctx.fillStyle = "#7a5a3a"; rr(150, 520, 780, 380, 14); ctx.fill();
  ctx.fillStyle = "#2f5a44"; rr(168, 538, 744, 344, 8); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(168, 538, 744, 120);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(400, 892, 280, 10);                     // Kreideablage
}
function boardText(t) {
  ctx.save(); ctx.fillStyle = "#f2f0e6"; ctx.strokeStyle = "#f2f0e6"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 34px InterX"; ctx.letterSpacing = "3px"; ctx.fillText("ZUNGE ROLLEN", 540, 590);
  // kleines Kreuzungsquadrat (eigene Zeichnung)
  ctx.lineWidth = 3; ctx.font = "800 22px InterX"; ctx.letterSpacing = "0px";
  const x0 = 230, y0 = 650;
  ctx.strokeRect(x0, y0, 180, 160); ctx.beginPath(); ctx.moveTo(x0 + 90, y0); ctx.lineTo(x0 + 90, y0 + 160); ctx.moveTo(x0, y0 + 80); ctx.lineTo(x0 + 180, y0 + 80); ctx.stroke();
  [["ZZ", 45, 40], ["Zz", 135, 40], ["Zz", 45, 120], ["zz", 135, 120]].forEach(([s, dx, dy]) => ctx.fillText(s, x0 + dx, y0 + dy));
  ctx.fillText("Z", x0 + 45, y0 - 18); ctx.fillText("z", x0 + 135, y0 - 18); ctx.fillText("Z", x0 - 18, y0 + 40); ctx.fillText("z", x0 - 18, y0 + 120);
  // "= GENETISCH" – wird durchgestrichen, dann "NÖ."
  ctx.font = "900 50px InterX"; ctx.fillText("= GENETISCH", 670, 720);
  const c = easeOut(ramp(t, T.cross, T.cross + 0.35)) * (t < T.back ? 1 : 1 - ramp(t, T.back, T.back + 0.3));
  if (c > 0) { ctx.strokeStyle = "#ff5a6e"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(500, 722); ctx.lineTo(500 + 340 * c, 714); ctx.stroke(); }
  const n = back(ramp(t, T.noe, T.noe + 0.3)) * (t < T.back ? 1 : 1 - ramp(t, T.back, T.back + 0.3));
  if (n > 0) { ctx.save(); ctx.translate(760, 810); ctx.rotate(-0.06); ctx.scale(n, n); ctx.fillStyle = "#ffd23a"; ctx.font = "900 60px InterX"; ctx.fillText("NÖ.", 0, 0); ctx.restore(); }
  ctx.restore();
}
function desk(x) {
  ctx.fillStyle = "#a8743f"; rr(x - 140, DESK, 280, 26, 6); ctx.fill();
  ctx.fillStyle = "#8a5a2e"; ctx.fillRect(x - 130, DESK + 26, 260, 200);
  ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(x - 130, DESK + 26, 260, 12);
}
// Zunge: gerollt (U-Form) oder flach
function tongue(P, s, rolled, k) {
  if (k <= 0) return;
  const u = s * 1.45, x = P.hx, y = P.hy + 26 * u;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = "#e86a7a";
  if (rolled) {
    rr(-9 * u, -2 * u, 18 * u, 20 * u, 8 * u); ctx.fill();
    ctx.fillStyle = "#c84a5a"; rr(-3 * u, 0, 6 * u, 16 * u, 3 * u); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(0, 8 * u, 12 * u, 11 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c84a5a"; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(0, 2 * u); ctx.lineTo(0, 14 * u); ctx.stroke();
  }
  ctx.restore();
}
function strain(P, s, t, k) {                    // Anstrengungs-Striche
  if (k <= 0) return;
  ctx.strokeStyle = `rgba(80,60,60,${0.7 * k})`; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const a = -0.6 + i * 0.6; const r0 = 60 * s, r1 = 78 * s + Math.sin(t * 20 + i) * 4; ctx.beginPath(); ctx.moveTo(P.hx + sd * Math.cos(a) * r0, P.hy + Math.sin(a) * r0); ctx.lineTo(P.hx + sd * Math.cos(a) * r1, P.hy + Math.sin(a) * r1); ctx.stroke(); }
}

window.renderFrame = function (t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  room(); boardText(t);
  const S = 1.5;
  const tryK = ramp(t, T.tryA, T.tryA + 0.2) * (1 - ramp(t, T.tryEnd, T.tryEnd + 0.2));
  const try2 = ramp(t, T.try2, T.try2 + 0.2) * (1 - ramp(t, T.try2End, T.try2End + 0.2));
  // links: die meisten – rollt locker
  const lf = stateAt([[0, "smile"], [T.tryA, "closed"], [T.tryEnd, "smile"], [T.q, "wide"], [T.rollEnd, "neutral"], [T.fact, "smile"]], t);
  const PL = person(LX, FY, { s: S, c2: "#e9e4d8", hair: "#3a2a22", skin: "#f2c7a5", f: lf, seed: 2, look: t > T.twinIn && t < T.rollEnd ? 1 : 0 });
  tongue(PL, S, true, tryK);
  // rechts: kann's nicht – strengt sich an
  const rf = stateAt([[0, "smile"], [T.tryA, "annoyed"], [T.tryEnd, "sad"], [T.gen, "neutral"], [T.aber, "smile"], [T.fact, "neutral"], [T.try2, "annoyed"], [T.try2End, "sad"], [T.back, "smile"]], t);
  const PR = person(RX, FY, { s: S, c2: "#f2e0c0", hair: "#7a4a2a", skin: "#e0a982", f: rf, seed: 5,
    arm: t > T.gen && t < T.gen + 1.0 ? [{ side: -1, ang: 2.4 }] : t > T.aber && t < T.aber + 1.0 ? [{ side: 1, ang: -1.3 }] : undefined });
  tongue(PR, S, false, Math.max(tryK, try2));
  strain(PR, S, t, Math.max(tryK, try2));
  // eineiiger Zwilling gleitet herein
  const tin = easeOut(ramp(t, T.twinIn, T.twinIn + 0.5)) * (1 - easeIO(ramp(t, T.back, T.back + 0.45)));
  if (tin > 0) {
    const tx = lerp(1200, TX, tin);
    const tf = stateAt([[0, "smile"], [T.twinRoll, "closed"], [T.rollEnd, "happy"], [T.try2, "closed"], [T.try2End, "happy"]], t);
    const PT = person(tx, FY, { s: S, c2: "#f2e0c0", hair: "#7a4a2a", skin: "#e0a982", f: tf, seed: 6, walk: tin < 1 ? t * 9 : 0 });
    const tr = ramp(t, T.twinRoll, T.twinRoll + 0.2) * (1 - ramp(t, T.rollEnd, T.rollEnd + 0.2));
    tongue(PT, S, true, Math.max(tr, try2));
    desk(tx); nameTag("EINEIIGER ZWILLING", tx, DESK + 90, tin);
  }
  desk(LX); desk(RX);
  bubble("ist halt genetisch.", RX, 900, popIn(t, T.gen, T.gen + 1.05), "speech", [0, 8], 30);
  bubble("aber mein Zwilling kann's.", RX + 40, 900, popIn(t, T.aber, T.aber + 1.1), "speech", [-20, 8], 30);
  bubble("?", LX, 880, popIn(t, T.q, T.rollEnd - 0.1), "thought", [0, 8], 40);
  puff(LX, 880, t, T.rollEnd - 0.05);
  nameTag("DIE MEISTEN", LX, DESK + 90);
  nameTag("KANN'S NICHT", RX, DESK + 90, 1, ramp(t, T.fact, T.fact + 0.3) * (1 - ramp(t, T.back, T.back + 0.3)));
  topShade();
  titleSwap(t, [["PROBIER'S JETZT."], ["KANNST DU DIE ZUNGE ROLLEN?", "#ffffff", 58]], [["1 VON 4 KANN'S NICHT.", "#ffffff", 60], ["UND ES IST KEIN EINFACHES GEN.", "#f6b23a", 52]], T.fact, T.back);
  grain(t); fadeEdges(t, DUR);
};
window.exportEvents = function () { return { duration: DUR, ...T }; };
window.setup = async function () { await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("800 16px InterX")]); makeGrain(67); return { duration: DUR }; };
