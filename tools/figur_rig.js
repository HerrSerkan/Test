// Wiederverwendbares Figuren-Rig im Flat-Stil (aus opa/scene.js). Braucht im Szenen-Code: ctx, circle(), rr().
// Aufruf: RIG_T = t; person(x, fussY, {c2: Oberteil, hair, skin, legs, shoes, hood, apron, collar, glasses, beard, white, cap, long, f: Ausdruck, look, walk: Phase, arm: [{side, ang}], s})
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
