// "Unterschied zwischen ICH MUSS GEWINNEN und ICH WILL GEWINNEN" – deutsche Version (1080x1920), ohne Sprecher.
// Pseudo-3D: Laufbahn, Tribüne, Regen; Strichmännchen werden über eine einfache Kamera projiziert.
// Gezeichnet im Raster des Originals (576 x 1024) und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 12.0;
const out = document.getElementById("c").getContext("2d");
const sc = document.createElement("canvas"); sc.width = 1080; sc.height = 1920;
let ctx = sc.getContext("2d");
const cc = document.createElement("canvas"); cc.width = 1080; cc.height = 1920;
const cctx = cc.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function keys(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => Array.isArray(v) ? lerp3(v, b[j + 1], k) : lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}

// ------------------------------------------------------------ Kamera
const LANE = 1.22, LANES = 8, TRACK_Z = LANE * LANES;
let CAM = null;
function setCam(pos, tgt, focal, cy = 470) {
  const f = norm(sub(tgt, pos)), up = [0, 1, 0];
  const r = norm(cross(up, f)), u = cross(f, r);
  CAM = { pos, f, r, u, focal, cy };
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
function camSpace(p) { const d = sub(p, CAM.pos); return [dot(d, CAM.r), dot(d, CAM.u), dot(d, CAM.f)]; }
function toScreen(c) { return [W / 2 + CAM.focal * c[0] / c[2], CAM.cy - CAM.focal * c[1] / c[2], CAM.focal / c[2]]; }
function proj(p) { const c = camSpace(p); if (c[2] < 0.05) return null; return toScreen(c); }
const NEAR = 0.3;
function clipPoly(pts) {
  const cs = pts.map(camSpace), res = [];
  for (let i = 0; i < cs.length; i++) {
    const a = cs[i], b = cs[(i + 1) % cs.length];
    const ia = a[2] >= NEAR, ib = b[2] >= NEAR;
    if (ia) res.push(a);
    if (ia !== ib) { const k = (NEAR - a[2]) / (b[2] - a[2]); res.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k), NEAR]); }
  }
  return res.map(toScreen);
}
function fillPoly(pts, color) {
  const s = clipPoly(pts); if (s.length < 3) return;
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]); for (const p of s.slice(1)) ctx.lineTo(p[0], p[1]); ctx.fill();
}
function line3(a, b, color, w) {
  let ca = camSpace(a), cb = camSpace(b);
  if (ca[2] < NEAR && cb[2] < NEAR) return;
  if (ca[2] < NEAR) { const k = (NEAR - ca[2]) / (cb[2] - ca[2]); ca = [lerp(ca[0], cb[0], k), lerp(ca[1], cb[1], k), NEAR]; }
  if (cb[2] < NEAR) { const k = (NEAR - cb[2]) / (ca[2] - cb[2]); cb = [lerp(cb[0], ca[0], k), lerp(cb[1], ca[1], k), NEAR]; }
  const p = toScreen(ca), q = toScreen(cb);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
}
// Band auf dem Boden (Linie mit Breite in Metern)
function groundStrip(x0, z0, x1, z1, wid, color) {
  const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz), nx = -dz / l * wid / 2, nz = dx / l * wid / 2;
  fillPoly([[x0 + nx, 0, z0 + nz], [x1 + nx, 0, z1 + nz], [x1 - nx, 0, z1 - nz], [x0 - nx, 0, z0 - nz]], color);
}

// ------------------------------------------------------------ Ablauf (Rennzeit τ)
const T_DIVE = 5.85, T_LAND = 6.55, T_SLIDE = 7.3, T_BREAK = 6.22, T_GREY_LINE = 6.5;
const WHITE_Z = LANE * 2.5, GREY_Z = LANE * 4.5;
function whiteState(tau) {
  if (tau < T_DIVE) return { x: 2.2 + 6.9 * (T_DIVE - tau), mode: "run", ph: (T_DIVE - tau) * 6.9 / 2.1 };
  if (tau < T_LAND) { const k = (tau - T_DIVE) / (T_LAND - T_DIVE); return { x: lerp(2.2, -1.4, k), mode: "dive", k }; }
  const k = easeOut(ramp(tau, T_LAND, T_SLIDE));
  return { x: lerp(-1.4, -3.3, k), mode: "lie", k, slide: tau < T_SLIDE };
}
// grau: wird langsamer und jubelt zu früh
const GREY_X = (() => {
  const a = [], dt = 1 / 120; let x = 9;
  for (let tau = 4.5; tau <= 12.5; tau += dt) {
    a.push(x);
    let v;
    if (tau < 6.0) v = lerp(7, 3, (tau - 4.5) / 1.5);
    else if (tau < 7.6) v = lerp(3, 0, (tau - 6.0) / 1.6);
    else if (tau < 8.2) v = 0;
    else if (tau < 9.6) v = 0.9 * Math.sin(Math.PI * (tau - 8.2) / 1.4);
    else v = 0;
    x -= v * dt;
  }
  return a;
})();
function greyState(tau) {
  let x, mode;
  if (tau < 4.5) { x = 9 + 7 * (4.5 - tau); mode = "run"; }
  else x = GREY_X[Math.min(GREY_X.length - 1, Math.round((tau - 4.5) * 120))];
  const ph = (30 - x) / 2.1;
  if (tau < 4.6) mode = "run";
  else if (tau < 7.3) mode = "cheer";
  else mode = "head";
  return { x, mode, ph, walking: tau > 8.2 && tau < 9.6 };
}

// ------------------------------------------------------------ Strichmännchen
// Punkte in Körperebene: [vorwärts, hoch] in Metern; vorwärts = -x in der Welt
function polar(p, ang, len) { return [p[0] + Math.sin(ang) * len, p[1] - Math.cos(ang) * len]; }
function skeleton(o) {
  // Winkel: 0 = nach unten, positiv = nach vorn
  const hip = [0, o.hipH ?? 0.95];
  const neck = polar(hip, Math.PI + (o.lean || 0), 0.55);
  const head = polar(hip, Math.PI + (o.lean || 0), 0.73);
  const kL = polar(hip, o.thL, 0.46), fL = polar(kL, o.thL - o.knL, 0.46);
  const kR = polar(hip, o.thR, 0.46), fR = polar(kR, o.thR - o.knR, 0.46);
  const eL = polar(neck, o.arL, 0.3), hL = polar(eL, o.arL + o.elL, 0.28);
  const eR = polar(neck, o.arR, 0.3), hR = polar(eR, o.arR + o.elR, 0.28);
  let P = { hip, neck, head, kL, fL, kR, fR, eL, hL, eR, hR };
  if (o.rot) { // ganzen Körper um die Hüfte drehen (nach vorn kippen)
    const c = Math.cos(o.rot), s = Math.sin(o.rot);
    for (const k in P) { const d = [P[k][0] - hip[0], P[k][1] - hip[1]]; P[k] = [hip[0] + d[0] * c + d[1] * s, hip[1] - d[0] * s + d[1] * c]; }
  }
  return P;
}
function pose(kind, ph, extra = {}) {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  if (kind === "run") return { lean: 0.22, thL: 0.75 * s, thR: -0.75 * s, knL: 0.5 + 0.7 * Math.max(0, -c), knR: 0.5 + 0.7 * Math.max(0, c), arL: -0.9 * s, arR: 0.9 * s, elL: 1.4, elR: 1.4, hipH: 0.9 + 0.05 * Math.abs(c) };
  if (kind === "cheer") { const w = Math.sin(ph * 6) * 0.15; return { lean: -0.05, thL: 0.5 * s, thR: -0.5 * s, knL: 0.35 + 0.4 * Math.max(0, -c), knR: 0.35 + 0.4 * Math.max(0, c), arL: Math.PI - 0.35 + w, arR: Math.PI + 0.25 - w, elL: 0.15, elR: -0.15, hipH: 0.93 }; }
  if (kind === "head") { const sw = extra.walk ? 0.35 * s : 0; return { lean: -0.08, thL: sw, thR: -sw, knL: extra.walk ? 0.3 * Math.max(0, -c) : 0.05, knR: extra.walk ? 0.3 * Math.max(0, c) : 0.05, arL: Math.PI - 0.6, arR: Math.PI - 0.45, elL: 2.2, elR: 2.4, hipH: 0.95 }; }
  if (kind === "dive") { const k = extra.k; return { rot: lerp(0.6, 1.5, easeOut(k * 1.6)), lean: 0, thL: -0.15, thR: lerp(-0.6, -0.1, k), knL: lerp(0.9, 0.2, k), knR: lerp(0.4, 0.1, k), arL: Math.PI - 0.15, arR: Math.PI - 0.05, elL: 0, elR: 0, hipH: 0.95 }; }
  if (kind === "lie") return { rot: 1.57, lean: 0, thL: -0.05, thR: 0.1, knL: 0.4, knR: 0.1, arL: Math.PI - 0.1 + (extra.armUp || 0) * (Math.PI / 2 + 0.1), arR: Math.PI - 0.25, elL: 0.25 * (extra.armUp || 0), elR: 0.3, hipH: 0.14 };
}
function drawFigure(x, z, p, color, alpha = 1, yOff = 0) {
  const P = skeleton(p);
  const world = q => [x - q[0], q[1] + yOff, z];
  for (const mirror of [true, false]) {
    const map = q => { const w = world(q); return mirror ? [w[0], -w[1] * 0.9, w[2]] : w; };
    const hp = proj(map(P.hip)); if (!hp) return;
    const sc = hp[2];
    ctx.globalAlpha = alpha * (mirror ? 0.13 : 1);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1.2, 0.085 * sc);
    const seg = (...ks) => { ctx.beginPath(); ks.forEach((k, i) => { const q = proj(map(P[k])); if (!q) return; i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); };
    seg("fL", "kL", "hip", "kR", "fR"); seg("hip", "neck"); seg("hL", "eL", "neck", "eR", "hR");
    const h = proj(map(P.head));
    if (h) { ctx.beginPath(); ctx.arc(h[0], h[1], 0.135 * sc, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Umgebung
const CROWD = (() => {
  const r = rng(3), a = [];
  for (let row = 11; row >= 0; row--) for (let x = -45; x < 80; x += 0.95 + r() * 0.3)
    a.push({ x: x + r() * 0.3, z: 13 + row * 1.15, y: 0.9 + row * 0.8, row, um: r() < 0.75, ph: r() * 6, shade: 62 + Math.floor(r() * 28) - row * 3, cheer: r() < 0.7 });
  return a;
})();
function drawCrowd(tau, t) {
  const cheer = ramp(tau, 6.35, 6.8);
  for (const s of CROWD) {
    const b = proj([s.x, s.y, s.z]); if (!b || b[0] < -30 || b[0] > W + 30) continue;
    const k = b[2]; if (k < 1.5) continue;
    const g = Math.max(30, s.shade);
    const col = `rgb(${g},${g},${g + 3})`;
    const hy = b[1] - 1.35 * k, hx = b[0];
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = "round"; ctx.lineWidth = Math.max(0.8, 0.12 * k);
    ctx.beginPath(); ctx.moveTo(hx, b[1]); ctx.lineTo(hx, hy + 0.25 * k); ctx.stroke();
    const up = s.cheer ? cheer * (0.75 + 0.25 * Math.sin(t * 9 + s.ph)) : 0;
    for (const sd of [-1, 1]) {
      const ang = lerp(0.35, 2.6, up) * sd;
      ctx.beginPath(); ctx.moveTo(hx, hy + 0.42 * k); ctx.lineTo(hx + Math.sin(ang) * 0.55 * k, hy + 0.42 * k + Math.cos(ang) * 0.55 * k); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(hx, hy, 0.17 * k, 0, Math.PI * 2); ctx.fill();
    if (s.um) {
      ctx.fillStyle = `rgb(${g * 0.45},${g * 0.45},${g * 0.47})`;
      ctx.beginPath(); ctx.ellipse(hx + 0.1 * k, hy - 0.4 * k, 0.75 * k, 0.3 * k, 0, Math.PI, 0); ctx.fill();
    }
  }
}
const LIGHTS = [[-14, 20, 40], [12, 22, 44], [38, 21, 42], [-40, 19, 38], [64, 20, 40]];
const RAIN = (() => { const r = rng(9), a = []; for (let i = 0; i < 170; i++) a.push([r() * 700 - 60, r() * 1100, 0.6 + r() * 0.8, r()]); return a; })();
function drawRain(t) {
  ctx.strokeStyle = "rgba(220,225,235,0.28)"; ctx.lineCap = "round";
  for (const [x0, y0, sp, br] of RAIN) {
    const y = (y0 + t * 900 * sp) % 1100 - 40, x = x0 - (y + 40) * 0.12;
    ctx.globalAlpha = 0.25 + br * 0.5; ctx.lineWidth = 0.6 + br * 0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2.2 * sp, y + 16 * sp); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function drawNumber(n, x, z) {
  const c = proj([x, 0, z]); if (!c || c[2] > 600 || c[0] < -60 || c[0] > W + 60 || c[1] < 0 || c[1] > H + 60) return;
  const a = proj([x + 0.01, 0, z]), b = proj([x, 0, z - 0.01]); if (!a || !b) return;
  // von hinten gesehen wäre die Zahl gespiegelt -> dann nicht zeichnen
  if (Math.abs(Math.atan2(a[1] - c[1], a[0] - c[0])) > 0.9) return;   // stark gedreht: nicht mehr lesbar
  if ((a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]) <= 0) return;
  ctx.save();
  ctx.setTransform(S * (a[0] - c[0]), S * (a[1] - c[1]), S * (b[0] - c[0]), S * (b[1] - c[1]), S * c[0], S * c[1]);
  ctx.font = "700 62px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(215,215,220,0.8)";
  ctx.fillText(String(n), 0, 0);
  ctx.restore();
}

// Spritzer bei der Landung
const SPRAY = (() => { const r = rng(17), a = []; for (let i = 0; i < 160; i++) a.push({ t0: T_LAND + r() * 0.75, vx: -1 - r() * 3.5, vy: 0.8 + r() * 2.2, vz: (r() - 0.5) * 3, l: 0.35 + r() * 0.5 }); return a; })();
function drawSpray(tau) {
  ctx.fillStyle = "#f2f4f8";
  for (const s of SPRAY) {
    const dt = tau - s.t0; if (dt < 0 || dt > s.l) continue;
    const w = whiteState(s.t0);
    const p = proj([w.x - 0.4 + s.vx * dt, Math.max(0, s.vy * dt - 4.9 * dt * dt) + 0.05, WHITE_Z + s.vz * dt]); if (!p) continue;
    ctx.globalAlpha = 1 - dt / s.l;
    const r = Math.max(0.6, 0.03 * p[2]);
    ctx.fillRect(p[0] - r, p[1] - r * 0.6, r * 2.4, r * 1.2);
  }
  ctx.globalAlpha = 1;
}

function drawTape(tau, t) {
  const hand = [0.25, 1.25, TRACK_Z + 0.7];
  const red = "#d8262b";
  if (tau < T_BREAK) { line3(hand, [0.0, 1.15, -1.2], red, 2.4); return; }
  const w = whiteState(tau);
  const k = easeOut(ramp(tau, T_BREAK, T_BREAK + 0.5));
  const pts = [hand];
  for (let i = 1; i <= 6; i++) {
    const z = lerp(hand[2], WHITE_Z + 0.5, i / 6);
    const y = lerp(1.2, 0.02, Math.min(1, (i / 6) * 1.6 * k + (1 - k) * 0));
    pts.push([lerp(0.2, w.x + 0.8, (i / 6) * k) + Math.sin(i * 2.1 + tau) * 0.25 * k, lerp(1.15, y, k), z]);
  }
  pts.push([w.x + 0.2, 0.15, WHITE_Z]);
  for (let i = 1; i <= 6; i++) pts.push([w.x + 0.4 + Math.sin(i * 1.7) * 0.5 * k + i * 0.15, lerp(1.0, 0.02, k), lerp(WHITE_Z, -0.6, i / 6)]);
  for (let i = 0; i < pts.length - 1; i++) line3(pts[i], pts[i + 1], red, 2.4);
}

// ------------------------------------------------------------ Kamerafahrt
function camera(t, tau) {
  if (t >= 2.6 && t < 4.4) {
    // Totale während des Rennens
    const xm = (whiteState(tau).x + greyState(tau).x) / 2;
    const k = ramp(t, 2.6, 4.4);
    setCam([xm - 5 + k * 2, 3.0 - k * 0.9, -5.5 + k * 1.5], [xm + 4, 0.6, 6], 640, 560);
    return;
  }
  const xm = clamp((whiteState(tau).x + greyState(tau).x) / 2, -1.2, 40);
  const K = [[4.4, [xm + 0.6, 1.25, -2.6], [xm - 0.3, 0.85, 4.5], 820], [5.6, [xm + 0.6, 1.25, -2.6], [xm - 0.3, 0.85, 4.5], 820],
    [6.6, [-0.3, 1.35, -2.4], [-1.0, 0.8, 4.4], 820], [6.95, [-0.9, 1.5, -2.5], [-2.3, 0.7, 4.3], 780], [7.6, [0.4, 1.8, -2.6], [-2.2, 0.55, 4.2], 760],
    [8.6, [2.2, 2.4, -2.2], [-3.0, 0.35, 4.3], 700], [11.0, [0.6, 2.6, -3.2], [-3.4, 0.45, 4.4], 700], [12.5, [0.2, 2.7, -3.6], [-3.4, 0.45, 4.4], 700]];
  const [pos, tgt, f] = keys(K, tau);
  setCam(pos, tgt, f, 560);
}

// ------------------------------------------------------------ Bild
function renderScene(t) {
  const tau = t < 2.6 ? t + 5.35 : t;
  camera(t, tau);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // Himmel
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#060708"); g.addColorStop(0.45, "#16181c"); g.addColorStop(1, "#0d0e10");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const L of LIGHTS) {
    const p = proj(L); if (!p) continue;
    const gl = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 46);
    gl.addColorStop(0, "rgba(255,255,255,0.75)"); gl.addColorStop(0.15, "rgba(230,232,240,0.35)"); gl.addColorStop(1, "rgba(200,205,215,0)");
    ctx.fillStyle = gl; ctx.fillRect(p[0] - 46, p[1] - 46, 92, 92);
  }
  // Tribüne (dunkle Fläche) + Zuschauer
  fillPoly([[-80, 0, 12], [120, 0, 12], [120, 11, 26], [-80, 11, 26]], "#1b1c20");
  const main = ctx; ctx = cctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920); ctx.setTransform(S, 0, 0, S, 0, 0);
  drawCrowd(tau, t);
  ctx = main; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = "blur(2.5px)"; ctx.globalAlpha = 0.72; ctx.drawImage(cc, 0, 0); ctx.restore();
  // Bande
  fillPoly([[-80, 0, TRACK_Z + 1.4], [120, 0, TRACK_Z + 1.4], [120, 1.1, TRACK_Z + 1.4], [-80, 1.1, TRACK_Z + 1.4]], "#1e2024");
  line3([-80, 1.1, TRACK_Z + 1.4], [120, 1.1, TRACK_Z + 1.4], "rgba(140,140,150,0.6)", 1.2);
  // Boden + Bahn
  fillPoly([[-80, 0, -12], [120, 0, -12], [120, 0, TRACK_Z + 1.4], [-80, 0, TRACK_Z + 1.4]], "#2a2c31");
  fillPoly([[-80, 0, 0], [120, 0, 0], [120, 0, TRACK_Z], [-80, 0, TRACK_Z]], "#3a3c43");
  // nasser Glanz unter den Lichtern
  for (const x of [-14, 12, 38]) {
    const p = proj([x, 0, 5]); if (!p) continue;
    const gl = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 60);
    gl.addColorStop(0, "rgba(200,205,215,0.10)"); gl.addColorStop(1, "rgba(200,205,215,0)");
    ctx.fillStyle = gl; ctx.fillRect(p[0] - 60, p[1] - 60, 120, 120);
  }
  for (let i = 0; i <= LANES; i++) groundStrip(-80, i * LANE, 120, i * LANE, 0.06, "rgba(225,226,230,0.85)");
  groundStrip(0, -0.1, 0, TRACK_Z + 0.1, 0.12, "#e8e8ec");
  groundStrip(-6, -0.1, -6, TRACK_Z + 0.1, 0.07, "rgba(225,226,230,0.7)");
  for (let i = 0; i < LANES - 1; i++) drawNumber(i + 1, 1.3, i * LANE + LANE / 2);
  // Kampfrichter mit Zielband
  const ref = { lean: 0, thL: 0.05, thR: -0.05, knL: 0, knR: 0, arL: 0.4, arR: -0.2, elL: 1.1, elR: 0.3, hipH: 0.95 };
  drawFigure(0.3, TRACK_Z + 0.8, ref, "#8d8d92");
  // Läufer (weiter hinten zuerst)
  const gs = greyState(tau), ws = whiteState(tau);
  const gp = gs.mode === "head" ? pose("head", gs.ph, { walk: gs.walking }) : pose(gs.mode, gs.ph);
  drawFigure(gs.x, GREY_Z, gp, "#a9a9ad");
  drawTape(tau, t);
  let wp, yOff = 0;
  if (ws.mode === "run") wp = pose("run", ws.ph);
  else if (ws.mode === "dive") { wp = pose("dive", 0, { k: ws.k }); yOff = Math.sin(Math.PI * ws.k) * 0.35 - ws.k * 0.75; }
  else wp = pose("lie", 0, { armUp: easeOut(ramp(t, 9.9, 10.4)) * (t > 4 ? 1 : 0) });
  drawFigure(ws.x, WHITE_Z, wp, "#f6f6f8", 1, yOff);
  drawSpray(tau);
  drawRain(t);
  // Vignette
  const v = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.2, W / 2, H * 0.5, H * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

function drawTitle() {
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const lines = [[["UNTERSCHIED ZWISCHEN ", "#a3a3a8"], ["ICH MUSS GEWINNEN", "#f2f2f4"]], [["UND ", "#a3a3a8"], ["ICH WILL GEWINNEN", "#f2f2f4"]]];
  ctx.font = "400 12.5px Pix"; ctx.letterSpacing = "1.6px"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 4;
  lines.forEach((parts, i) => {
    const w = parts.reduce((s, [txt]) => s + ctx.measureText(txt).width, 0);
    let x = W / 2 - w / 2; const y = 160 + i * 24;
    for (const [txt, col] of parts) { ctx.fillStyle = col; ctx.fillText(txt, x, y); x += ctx.measureText(txt).width; }
  });
  ctx.shadowColor = "transparent"; ctx.letterSpacing = "0px";
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  renderScene(t);
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.fillStyle = "#000"; out.fillRect(0, 0, 1080, 1920);
  // Schneller Schwenk mit Unschärfe zwischen den Einstellungen
  const blur = Math.max(0, 1 - Math.abs(t - 2.6) / 0.17);
  if (blur > 0) {
    out.filter = `blur(${Math.round(blur * 26)}px)`;
    out.drawImage(sc, (t < 2.6 ? -1 : 1) * blur * 120, 0);
    out.filter = "none";
  } else out.drawImage(sc, 0, 0);
  // Titel (scharf, über allem)
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920);
  drawTitle();
  out.drawImage(sc, 0, 0);
  const fade = ramp(t, 11.55, 11.95);
  if (fade > 0) { out.fillStyle = `rgba(0,0,0,${fade * 0.92})`; out.fillRect(0, 0, 1080, 1920); }
};

window.exportEvents = function () {
  // Zeitpunkte im Video
  const steps = { white: [], grey: [] };
  for (let t = 0; t < DUR; t += 1 / 60) {
    const tau = t < 2.6 ? t + 5.35 : t;
    const w = whiteState(tau), g = greyState(tau);
    if (w.mode === "run") steps.white.push(w.ph);
    if (g.mode !== "head") steps.grey.push(g.ph);
  }
  return {
    duration: DUR,
    dive: [T_DIVE - 5.35, T_DIVE], land: [T_LAND - 5.35, T_LAND], tape: [T_BREAK - 5.35, T_BREAK],
    cheer: [6.4], whip: 2.6, armUp: 9.9, fade: 11.55,
    runWhite: [[0, T_DIVE - 5.35, 6.9], [2.6, T_DIVE, 6.9]],
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("400 13px Pix"), document.fonts.load("700 60px InterX")]);
  return { duration: DUR };
};
