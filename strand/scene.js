// "Stell dir einen Strand vor." – 1:1-Nachbau (deutsche Version, eigene Zeichnung), ohne Sprecher.
// Drei Figuren meditieren: HYPERPHANTASIE sieht den Strand in 4K, DIE MEISTEN sehen ihn verschwommen,
// APHANTASIE sieht nur das Wort. Pointe: „1 von 25 Menschen sieht fast nichts.“ Endlosschleife.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 11.9;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const off = document.createElement("canvas"); off.width = 300; off.height = 380;   // Strandbild (2x)
const og = off.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function circle(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function glow(x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}

// ---------------- Zeitplan ----------------
const T = {
  t1: 0, t2: 1.15, clouds: 1.2, sky: 1.35, sea: 1.6, sand: 1.75, sun: 1.95, palm: 2.2, cloud: 2.5, crab: 2.8, k4: 3.05,
  shades: 2.35, type1: 2.05, t3: 5.65, waves: 5.85, type2: 6.3, t4: 8.25, shrug: 8.4, vanish: 10.55, t5: 11.25,
};
const TITLES = [
  [T.t1, ["SCHLIESS DIE AUGEN."]],
  [T.t2, ["STELL DIR EINEN STRAND VOR."]],
  [T.t3, ["JETZT NOCH DIE WELLEN."]],
  [T.t4, ["1 VON 25 MENSCHEN", "SIEHT FAST NICHTS."]],
  [T.t5, ["SCHLIESS DIE AUGEN."]],
];
const TYPE = [[T.type1, "Strand."], [T.type2, "\nWellen."]];
const CPS = 0.16;   // Sekunden pro Buchstabe
const COLS = [100, 288, 476];
const R0 = rng(3);
const STARS = Array.from({ length: 26 }, () => [150 + R0() * 276, 60 + R0() * 200, 0.6 + R0() * 1.2, R0() * 6]);
const SPARKS = Array.from({ length: 40 }, () => [(R0() - 0.5) * 150, (R0() - 0.5) * 190, R0() * 6, 1 + R0() * 2]);

// ---------------- Strandbild (auf og, 150 x 190 Einheiten) ----------------
function beach(t, full) {
  const g = og; g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 150, 190);
  const st = k => (full ? 1 : ramp(t, k, k + 0.25));
  const sk = g.createLinearGradient(0, 0, 0, 100);
  sk.addColorStop(0, "#4fa8e8"); sk.addColorStop(1, "#bfe6f7");
  g.globalAlpha = st(T.sky); g.fillStyle = sk; g.fillRect(0, 0, 150, 190); g.globalAlpha = 1;
  if (st(T.sun) > 0) { const k = back(st(T.sun)); circle(g, 108, 34, 16 * k + 6 * k, "rgba(255,230,120,0.35)"); circle(g, 108, 34, 13 * k, "#ffd84a"); }
  if (st(T.cloud) > 0) { g.globalAlpha = st(T.cloud); const x = 30 + Math.sin(t * 0.6) * 3;
    for (const [dx, dy, r] of [[0, 0, 9], [10, -5, 11], [21, 0, 9], [10, 3, 9]]) circle(g, x + dx, 26 + dy, r, "#ffffff"); g.globalAlpha = 1; }
  const sea = st(T.sea);
  if (sea > 0) {
    const sg = g.createLinearGradient(0, 92, 0, 140);
    sg.addColorStop(0, "#1f8fd0"); sg.addColorStop(1, "#38c6d9");
    g.fillStyle = sg; g.fillRect(0, 140 - 48 * easeOut(sea), 150, 48 * easeOut(sea));
    const wv = ramp(t, T.waves, T.waves + 0.5) * (full ? 1 : 1);
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 1.6;
    for (let r = 0; r < 4; r++) {
      const y = 100 + r * 10, amp = 1 + wv * 2.2, ph = t * (1 + wv * 3) + r;
      g.globalAlpha = 0.35 + wv * 0.6;
      g.beginPath();
      for (let x = 0; x <= 150; x += 3) g.lineTo(x, y + Math.sin(x * 0.18 + ph * 2) * amp);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  const sand = st(T.sand);
  if (sand > 0) {
    const y0 = 190 - 52 * easeOut(sand);
    g.fillStyle = "#f3d58e"; g.beginPath(); g.moveTo(0, y0 + 4);
    for (let x = 0; x <= 150; x += 5) g.lineTo(x, y0 + Math.sin(x * 0.09 + t * 1.5 * ramp(t, T.waves, T.waves + 0.5)) * 2.5);
    g.lineTo(150, 190); g.lineTo(0, 190); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2; g.beginPath();
    for (let x = 0; x <= 150; x += 5) g.lineTo(x, y0 + Math.sin(x * 0.09 + t * 1.5 * ramp(t, T.waves, T.waves + 0.5)) * 2.5);
    g.stroke();
  }
  const palm = st(T.palm);
  if (palm > 0) {
    g.save(); g.translate(46, 182); g.rotate(-0.05 + Math.sin(t * 1.3) * 0.02); g.scale(1, easeOut(palm));
    g.strokeStyle = "#8a5a2b"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-4, -50, 14, -110); g.stroke();
    g.strokeStyle = "#6e441f"; g.lineWidth = 1.5;
    for (let k = 1; k < 9; k++) { const u = k / 9, x = lerp(0, 14, u * u) - 4 * u * (1 - u) * 2, y = -110 * u; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y + 2); g.stroke(); }
    g.translate(14, -110);
    const wob = Math.sin(t * 2) * 0.05;
    for (const a of [-2.7, -2.1, -1.0, -0.4, 0.3, -1.6]) {
      g.save(); g.rotate(a + wob); g.fillStyle = "#2e9e4a";
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20, -14, 42, 4); g.quadraticCurveTo(20, -2, 0, 0); g.fill();
      g.strokeStyle = "#1f7a37"; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -1); g.quadraticCurveTo(20, -9, 40, 3); g.stroke();
      g.restore();
    }
    circle(g, 2, 4, 3.5, "#6e441f"); circle(g, -3, 6, 3.5, "#6e441f");
    g.restore();
  }
  const crab = st(T.crab);
  if (crab > 0) {
    const k = back(crab), x = 112 + Math.sin(t * 2.5) * 4, y = 172;
    g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = "#e0453a"; g.beginPath(); g.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) { circle(g, s * 11, -5, 3, "#e0453a"); g.strokeStyle = "#e0453a"; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(s * 6, -2); g.lineTo(s * 10, -4); g.stroke();
      for (let l = 0; l < 3; l++) { g.beginPath(); g.moveTo(s * 5, 2); g.lineTo(s * (9 + l), 5 + l); g.stroke(); } }
    circle(g, -2.5, -5, 1.6, "#fff"); circle(g, 2.5, -5, 1.6, "#fff"); circle(g, -2.5, -5, 0.8, "#222"); circle(g, 2.5, -5, 0.8, "#222");
    g.restore();
  }
  if (st(T.k4) > 0) {
    const k = back(st(T.k4));
    g.save(); g.translate(18, 14); g.scale(k, k);
    g.fillStyle = "#1d1d26"; g.beginPath(); g.roundRect(-11, -7, 22, 14, 3); g.fill();
    g.fillStyle = "#fff"; g.font = "900 9px InterX"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("4K", 0, 0.5);
    g.restore();
  }
}

// ---------------- Raum ----------------
function room(t) {
  ctx.fillStyle = "#281d31"; ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 24) { ctx.fillStyle = (x / 24) % 2 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.08)"; ctx.fillRect(x, 0, 24, 740); }
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 740); ctx.stroke(); }
  // Bogenfenster
  ctx.save();
  ctx.beginPath(); ctx.moveTo(142, 305); ctx.lineTo(142, 205); ctx.arc(288, 205, 146, Math.PI, 0); ctx.lineTo(434, 305); ctx.closePath();
  ctx.clip();
  const sg = ctx.createLinearGradient(0, 60, 0, 305);
  sg.addColorStop(0, "#2c2350"); sg.addColorStop(0.5, "#5a3f84"); sg.addColorStop(0.85, "#b05f8c"); sg.addColorStop(1, "#d77d8a");
  ctx.fillStyle = sg; ctx.fillRect(140, 50, 300, 260);
  for (const [x, y, r, ph] of STARS) circle(ctx, x, y, r, `rgba(255,255,255,${0.4 + 0.5 * Math.abs(Math.sin(t * 1.3 + ph))})`);
  circle(ctx, 352, 104, 11, "#f6efcf"); circle(ctx, 358, 99, 10, "#3a2c62");
  ctx.fillStyle = "#3a2650"; ctx.beginPath(); ctx.moveTo(140, 305); ctx.lineTo(140, 270); ctx.lineTo(200, 248); ctx.lineTo(250, 268); ctx.lineTo(310, 240); ctx.lineTo(380, 266); ctx.lineTo(440, 250); ctx.lineTo(440, 305); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#1c1424"; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(142, 305); ctx.lineTo(142, 205); ctx.arc(288, 205, 146, Math.PI, 0); ctx.lineTo(434, 305); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(288, 59); ctx.lineTo(288, 305); ctx.stroke();
  ctx.fillStyle = "#3b2d44"; ctx.fillRect(122, 300, 332, 10); ctx.fillStyle = "#1c1424"; ctx.fillRect(122, 310, 332, 4);
  // Boden
  const fg = ctx.createLinearGradient(0, 735, 0, H);
  fg.addColorStop(0, "#4a3029"); fg.addColorStop(1, "#1f1514");
  ctx.fillStyle = fg; ctx.fillRect(0, 735, W, H - 735);
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
  for (const y of [760, 795, 845, 915]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = "#5b3b32"; ctx.fillRect(0, 733, W, 5);
  // Pflanzen
  for (const [x, s] of [[30, 1], [546, -1]]) {
    ctx.save(); ctx.translate(x, 735); ctx.scale(s, 1);
    for (const [a, l, c] of [[-0.9, 120, "#22472f"], [-0.4, 150, "#2b5a3a"], [0.15, 135, "#22472f"], [0.6, 110, "#2f6340"], [-0.15, 95, "#357048"]]) {
      ctx.save(); ctx.rotate(a + Math.sin(t * 0.8 + a * 3) * 0.02); ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -l * 0.6, 0, -l); ctx.quadraticCurveTo(30, -l * 0.6, 0, 0); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -l * 0.95); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // Kerzen links, Klangschale rechts
  for (const [x, h] of [[24, 26], [40, 34], [56, 22]]) {
    ctx.fillStyle = "#f2ead8"; ctx.beginPath(); ctx.roundRect(x - 6, 790 - h, 12, h, 2); ctx.fill();
    const fl = 1 + Math.sin(t * 17 + x) * 0.12;
    glow(x, 782 - h, 26, "rgba(255,190,90,0.9)", 0.5);
    ctx.fillStyle = "#ffc24a"; ctx.beginPath(); ctx.ellipse(x, 782 - h, 3, 6 * fl, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#c79a3a"; ctx.beginPath(); ctx.ellipse(540, 772, 24, 7, 0, 0, Math.PI); ctx.fill();
  ctx.beginPath(); ctx.moveTo(516, 772); ctx.quadraticCurveTo(540, 800, 564, 772); ctx.fill();
  ctx.fillStyle = "#e3b955"; ctx.beginPath(); ctx.ellipse(540, 772, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
}

// ---------------- Figuren ----------------
const MATS = ["#2c8c80", "#df6458", "#8a6bd2"];
function person(i, t) {
  const x = COLS[i], br = Math.sin(t * 1.6 + i) * 1.5;
  const shrug = i === 2 ? easeOut(ramp(t, T.shrug, T.shrug + 0.35)) * (1 - ramp(t, T.t5 - 0.1, T.t5 + 0.2)) : 0;
  // Matte + Spiegelung
  ctx.fillStyle = MATS[i]; ctx.beginPath(); ctx.roundRect(x - 78, 763, 156, 12, 6); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(x - 74, 773, 148, 3);
  ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = "#e9e3d6"; ctx.beginPath(); ctx.ellipse(x, 805, 34, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const body = "#ebe5d8", shade = "#cfc7b6";
  // Beine (Schneidersitz, angedeutet)
  ctx.fillStyle = shade; ctx.beginPath(); ctx.roundRect(x - 40, 748, 80, 16, 8); ctx.fill();
  // Arme
  ctx.lineCap = "round"; ctx.strokeStyle = shade; ctx.lineWidth = 13;
  for (const s of [-1, 1]) {
    const sx = x + s * 26, sy = 676 - br;
    const a = lerp(0.55, 1.35, shrug), ex = sx + s * Math.sin(a) * 34, ey = sy + Math.cos(a) * 34;
    const hx = ex + s * lerp(10, 22, shrug), hy = ey + lerp(14, -8, shrug);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  }
  // Körper
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x, 712 - br * 0.5, 32, 52 + br * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.06)"; ctx.beginPath(); ctx.ellipse(x + 10, 720, 20, 42, 0, 0, Math.PI * 2); ctx.fill();
  // Kopf
  const hy = 618 - br;
  circle(ctx, x, hy, 28, body);
  ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.beginPath(); ctx.arc(x, hy, 28, -0.6, 1.6); ctx.fill();
  face(i, x, hy, t);
}
function face(i, x, y, t) {
  ctx.strokeStyle = "#2a2230"; ctx.fillStyle = "#2a2230"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
  const open = i === 2 && t > T.t3 + 0.3 && t < T.t5 + 0.1;
  const shades = i === 0 && t >= T.shades && t < T.t5;
  if (shades) {
    const k = back(ramp(t, T.shades, T.shades + 0.25)), yy = lerp(y - 40, y - 4, k);
    ctx.fillStyle = "#16141b";
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(x + s * 11 - 9, yy - 5, 18, 10, 4); ctx.fill(); }
    ctx.fillRect(x - 3, yy - 3, 6, 2); ctx.fillRect(x - 26, yy - 3, 6, 2); ctx.fillRect(x + 20, yy - 3, 6, 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(x - 17, yy - 3, 5, 2); ctx.fillRect(x + 5, yy - 3, 5, 2);
    ctx.beginPath(); ctx.arc(x + 3, y + 8, 8, 0.25, Math.PI - 0.6); ctx.stroke();
    return;
  }
  for (const s of [-1, 1]) {
    const ex = x + s * 10, ey = y - 3;
    ctx.beginPath();
    if (open) {                       // offen, gelangweilt: Lid + Pupille
      ctx.moveTo(ex - 6, ey - 2); ctx.lineTo(ex + 6, ey - 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, Math.PI); ctx.fill();
    } else { ctx.arc(ex, ey - 2, 5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
  }
  ctx.beginPath();
  if (open) { ctx.moveTo(x - 5, y + 11); ctx.lineTo(x + 5, y + 11); }
  else ctx.arc(x, y + 6, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
}

// ---------------- Gedankenwolken ----------------
function cloudShape(x, y, w, h) {
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 18);
  const n = 7, m = 9;
  for (let k = 0; k <= n; k++) { const cx = x - w / 2 + (w * k) / n; ctx.moveTo(cx + 12, y - h / 2); ctx.arc(cx, y - h / 2, 12, 0, Math.PI * 2);
    ctx.moveTo(cx + 12, y + h / 2); ctx.arc(cx, y + h / 2, 12, 0, Math.PI * 2); }
  for (let k = 0; k <= m; k++) { const cy = y - h / 2 + (h * k) / m; ctx.moveTo(x - w / 2 + 12, cy); ctx.arc(x - w / 2, cy, 12, 0, Math.PI * 2);
    ctx.moveTo(x + w / 2 + 12, cy); ctx.arc(x + w / 2, cy, 12, 0, Math.PI * 2); }
}
function thought(i, t) {
  const x = COLS[i], y = 412;
  const app = back(ramp(t, T.clouds + i * 0.06, T.clouds + i * 0.06 + 0.3));
  let vanish = ramp(t, T.vanish + (2 - i) * 0.08, T.vanish + (2 - i) * 0.08 + 0.45);
  if (app <= 0 || vanish >= 1) { if (i === 2 && vanish > 0 && vanish < 1.6) sparks(x, y, t); return; }
  ctx.save();
  ctx.globalAlpha = 1 - easeOut(vanish);
  // Bläschen zum Kopf
  for (const [dy, r] of [[118, 9], [135, 6.5], [148, 4.5]]) circle(ctx, x + 0, y + dy, r * app, "#f2ede2");
  ctx.translate(x, y); ctx.scale(app * (1 - easeOut(vanish) * 0.5), app * (1 - easeOut(vanish) * 0.5)); ctx.translate(-x, -y);
  ctx.fillStyle = "#f2ede2"; cloudShape(x, y, 152, 196); ctx.fill();
  ctx.fillStyle = "#ebe5d8"; ctx.beginPath(); ctx.roundRect(x - 70, y - 92, 140, 184, 12); ctx.fill();
  const ix = x - 66, iy = y - 88, iw = 132, ih = 176;
  if (i < 2) {
    beach(t, false);
    ctx.save(); ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 10); ctx.clip();
    if (i === 0) ctx.drawImage(off, ix, iy, iw, ih);
    else {
      ctx.fillStyle = "#d4d2d4"; ctx.fillRect(ix, iy, iw, ih);
      ctx.globalAlpha *= 0.75 * ramp(t, T.sky, T.k4);
      ctx.filter = `blur(${7 * S}px) saturate(0.45) brightness(1.08)`;
      ctx.drawImage(off, ix, iy, iw, ih);
      ctx.filter = "none";
    }
    ctx.restore();
  } else {
    let txt = "";
    for (const [t0, s] of TYPE) txt += s.slice(0, Math.max(0, Math.floor((t - t0) / CPS) + 1) * (t >= t0 ? 1 : 0));
    ctx.fillStyle = "#3b3640"; ctx.font = "400 17px InterX"; ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.letterSpacing = "0px";
    const lines = txt.split("\n"); let cx = ix + 16, cy = iy + 22;
    lines.forEach((l, k) => { ctx.fillText(l, ix + 16, iy + 22 + k * 24); cx = ix + 16 + ctx.measureText(l).width; cy = iy + 22 + k * 24; });
    if (t > T.clouds + 0.5 && Math.floor(t * 2.2) % 2 === 0) ctx.fillRect(cx + 1.5, cy - 1, 1.6, 20);
  }
  ctx.restore();
}
function sparks(x, y, t) {
  const k = ramp(t, T.vanish, T.vanish + 0.9);
  for (const [dx, dy, ph, r] of SPARKS) {
    const a = Math.sin(k * Math.PI) * (0.5 + 0.5 * Math.sin(t * 20 + ph));
    circle(ctx, x + dx * (1 + k * 0.3), y + dy * (1 + k * 0.3) + k * 20, r, `rgba(255,255,255,${a})`);
  }
}

// ---------------- Titel + Schilder ----------------
function title(t) {
  let idx = 0; for (let k = 0; k < TITLES.length; k++) if (t >= TITLES[k][0]) idx = k;
  const [t0, lines] = TITLES[idx];
  const next = TITLES[idx + 1] ? TITLES[idx + 1][0] : 99;
  const sq = Math.min(easeOut(ramp(t, t0, t0 + 0.18)), 1 - ramp(t, next - 0.12, next));   // Stauchen beim Wechsel
  if (idx === 0) { /* erster Titel steht sofort */ }
  const k = idx === 0 ? 1 - ramp(t, next - 0.12, next) : sq;
  ctx.save(); ctx.translate(288, 168); ctx.scale(lerp(1.25, 1, k), Math.max(0.02, k)); ctx.translate(-288, -168);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 29px InterX"; ctx.letterSpacing = "-0.5px";
  const two = lines.length === 2;
  lines.forEach((l, j) => {
    const y = two ? 150 + j * 36 : 168;
    const col = two && j === 1 ? "#f6b941" : "#ffffff";
    ctx.shadowColor = two && j === 1 ? "rgba(246,185,65,0.55)" : "rgba(0,0,0,0.35)"; ctx.shadowBlur = two && j === 1 ? 14 : 6;
    ctx.fillStyle = col; ctx.fillText(l, 288, y);
  });
  ctx.restore();
  if (idx === 3 && t < t0 + 0.6) {        // Funkeln bei der Pointe
    const r = rng(9), a = Math.sin(ramp(t, t0, t0 + 0.6) * Math.PI);
    for (let n = 0; n < 14; n++) { const sx = 90 + r() * 400, sy = 140 + r() * 70; ctx.fillStyle = `rgba(255,230,150,${a})`; star(sx, sy, 2 + r() * 3); }
  }
}
function star(x, y, r) { ctx.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * 0.35 : r, a = (k * Math.PI) / 4; ctx.lineTo(x + Math.sin(a) * rr, y - Math.cos(a) * rr); } ctx.fill(); }
const LABELS = ["HYPERPHANTASIE", "DIE MEISTEN", "APHANTASIE"];
function labels(t) {
  const hi = ramp(t, T.t4, T.t4 + 0.2) * (1 - ramp(t, T.t5, T.t5 + 0.2));
  ctx.font = "700 10.5px InterX"; ctx.letterSpacing = "1.2px"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  LABELS.forEach((l, i) => {
    const w = ctx.measureText(l).width + 22, x = COLS[i];
    ctx.fillStyle = "#1d1726"; ctx.strokeStyle = i === 2 && hi > 0 ? `rgba(246,185,65,${0.3 + 0.5 * hi})` : "#3b3350"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(x - w / 2, 255, w, 22, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = i === 2 && hi > 0 ? `rgb(${lerp(236, 246, hi)},${lerp(232, 185, hi)},${lerp(240, 65, hi)})` : "#ece8f0";
    ctx.fillText(l, x, 266.5);
  });
}

window.setup = async () => {
  await Promise.all(["900 29px InterX", "700 10px InterX", "400 17px InterX"].map(f => document.fonts.load(f)));
  return { duration: DUR };
};
window.renderFrame = t => {
  const z = 1 + 0.025 * Math.sin((t / DUR) * Math.PI);          // leichter Zoom, Anfang = Ende
  ctx.setTransform(S * z, 0, 0, S * z, (1080 - 1080 * z) / 2, (1920 - 1920 * z) * 0.4);
  room(t);
  for (let i = 0; i < 3; i++) person(i, t);
  for (let i = 0; i < 3; i++) thought(i, t);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  title(t);
  labels(t);
};
window.exportEvents = () => {
  const keys = [];
  for (const [t0, s] of TYPE) for (let k = 0; k < s.length; k++) if (s[k] !== "\n") keys.push(t0 + k * CPS);
  return { duration: DUR, T, keys, titles: TITLES.map(x => x[0]).slice(1) };
};
