// „Bin gleich da.“ – eigenes Video im Stil von fruehaufsteher/ und mensa/ (1080x1920), ohne Sprecher.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Ende = Anfang (Endlosschleife).
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 14.0;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  if (a <= 0.004) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgb(c, a)); g.addColorStop(1, rgb(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function shadow(x, y, w, a = 0.22) { ctx.fillStyle = `rgba(20,10,30,${a})`; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.18, 0, 0, Math.PI * 2); ctx.fill(); }

// ------------------------------------------------------------ Figuren, Blasen (aus wecker/)
const SKIN = "#f6efe2", LINE = "#d4cab8";
const CHAR = { blau: { body: "#5aa7ff", dark: "#3f8ef0" }, gelb: { body: "#ffcf33", dark: "#e9b416" }, grau: { body: "#a3abb8", dark: "#8c94a3" } };
function face(x, y, f) {
  ctx.strokeStyle = "#2a2a2e"; ctx.fillStyle = "#2a2a2e"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  const E = 5.5, ey = y - 2;
  const arcs = down => { for (const s of [-1, 1]) { ctx.beginPath(); down ? ctx.arc(x + s * E, ey - 1, 3, 0.15 * Math.PI, 0.85 * Math.PI) : ctx.arc(x + s * E, ey + 1.5, 3, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  const dots = (r = 1.7) => { circle(x - E, ey, r, "#2a2a2e"); circle(x + E, ey, r, "#2a2a2e"); };
  const big = () => { for (const s of [-1, 1]) { circle(x + s * E, ey, 3.6, "#fff"); circle(x + s * E, ey, 1.9, "#2a2a2e"); } };
  const lids = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * E - 3.5, ey - 1); ctx.lineTo(x + s * E + 3.5, ey - 1); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * E, ey - 1, 2, 0, Math.PI); ctx.fill(); } };
  const mouth = k => {
    ctx.beginPath();
    if (k === "smile") ctx.arc(x, y + 4, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    else if (k === "grin") { ctx.arc(x, y + 4, 5.5, 0, Math.PI); ctx.closePath(); ctx.fill(); return; }
    else if (k === "flat") { ctx.moveTo(x - 3, y + 7); ctx.lineTo(x + 3, y + 7); }
    else if (k === "frown") ctx.arc(x, y + 10, 4, 1.2 * Math.PI, 1.8 * Math.PI);
    else if (k === "o") { ctx.ellipse(x, y + 7, 2.2, 2.8, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (k === "O") { ctx.ellipse(x, y + 7, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (k === "wavy") { ctx.moveTo(x - 5, y + 7); ctx.quadraticCurveTo(x - 2.5, y + 4, x, y + 7); ctx.quadraticCurveTo(x + 2.5, y + 10, x + 5, y + 7); }
    ctx.stroke();
  };
  switch (f) {
    case "happy": arcs(false); mouth("grin"); break;
    case "smile": dots(); mouth("smile"); break;
    case "sleep": arcs(true); mouth("flat"); break;
    case "snore": arcs(true); mouth("o"); break;
    case "grumpy": for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * E - 3, ey + (s < 0 ? -1 : 1)); ctx.lineTo(x + s * E + 3, ey + (s < 0 ? 1 : -1)); ctx.stroke(); } mouth("frown"); break;
    case "tired": lids(); mouth("flat"); break;
    case "tiredO": lids(); mouth("o"); break;
    case "yawn": arcs(true); mouth("O"); break;
    case "shock": big(); mouth("O"); break;
    case "panic": big(); mouth("wavy"); break;
    case "wide": big(); mouth("flat"); break;
    case "read": arcs(true); mouth("smile"); break;
    case "annoyed": lids(); mouth("frown"); break;
    case "sorry": arcs(true); mouth("wavy"); break;
    case "type": dots(1.5); mouth("smile"); break;
  }
}
function eyebags(x, y) {
  ctx.strokeStyle = "rgba(90,60,120,0.75)"; ctx.lineWidth = 1.6;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 5.5, y + 1, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 5.5, y + 3, 3.4, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
}
function arm(sx, sy, ang, len, col) {
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
  ctx.fillStyle = col; rr(-3.6, -2, 7.2, len, 3.6); ctx.fill();
  ctx.restore();
  return [sx - Math.sin(ang) * (len - 3), sy + Math.cos(ang) * (len - 3)];
}
function holdItem(x, y, kind, t) {
  if (kind === "tickets") {
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(x, y - 4); ctx.rotate(-0.5 + i * 0.35); ctx.fillStyle = ["#ffb03a", "#ff8a3a", "#ffc84a"][i]; rr(-4, -18, 9, 18, 1.5); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-4, -10, 9, 1); ctx.restore(); }
    return;
  }
  if (kind === "mug") {
    ctx.fillStyle = "#f6f4ef"; rr(x - 6, y - 10, 12, 12, 2); ctx.fill();
    ctx.strokeStyle = "#f6f4ef"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 7, y - 4, 3.2, -1.4, 1.4); ctx.stroke();
    ctx.fillStyle = "#e5533b"; ctx.fillRect(x - 6, y - 6, 12, 3);
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1;
    for (const d of [-2, 2]) { ctx.beginPath(); ctx.moveTo(x + d, y - 13); ctx.quadraticCurveTo(x + d + 2 * Math.sin(t * 5), y - 17, x + d, y - 21); ctx.stroke(); }
  } else if (kind === "book") {
    ctx.fillStyle = "#2f6fd6"; rr(x - 13, y - 13, 26, 18, 2); ctx.fill();
    ctx.fillStyle = "#f6f2e6"; ctx.fillRect(x - 11, y - 11, 10, 14); ctx.fillRect(x + 1, y - 11, 10, 14);
  } else if (kind === "phone") {
    ctx.fillStyle = "#1d2230"; rr(x - 5, y - 9, 10, 16, 2); ctx.fill();
    ctx.fillStyle = "#9fd2ff"; rr(x - 3.6, y - 7.5, 7.2, 13, 1.2); ctx.fill();
  } else if (kind === "pants") {
    ctx.fillStyle = "#2f5fb0"; rr(x - 14, y - 4, 28, 14, 3); ctx.fill();
  }
}
// Merkmal am Kopf
function feature(kind, x, y, t) {
  if (kind === "glasses") { ctx.strokeStyle = "#1e2a44"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x - 5.5, y - 2, 4.6, 0, Math.PI * 2); ctx.moveTo(x + 10.1, y - 2); ctx.arc(x + 5.5, y - 2, 4.6, 0, Math.PI * 2); ctx.moveTo(x - 0.9, y - 2.5); ctx.lineTo(x + 0.9, y - 2.5); ctx.stroke(); }
  if (kind === "cap") { ctx.fillStyle = "#ef4a3b"; ctx.beginPath(); ctx.arc(x, y - 4, 17.5, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); rr(x - 26, y - 9, 16, 5, 2.5); ctx.fill(); }
  if (kind === "towel") { ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x, y - 15, 19, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 6, y - 24, 11, 7, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#d9dde6"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 15, y - 12); ctx.quadraticCurveTo(x, y - 20, x + 16, y - 12); ctx.stroke(); }
  if (kind === "band") { ctx.fillStyle = "#ef3b4a"; rr(x - 17.5, y - 10, 35, 6, 3); ctx.fill(); ctx.fillRect(x + 14, y - 8, 9, 3); ctx.fillRect(x + 15, y - 5, 7, 3); }
  if (kind === "mask") { ctx.fillStyle = "#5b2fb8"; rr(x - 17, y - 15, 34, 7, 3.5); ctx.fill(); circle(x - 6, y - 11.5, 5, "#5b2fb8"); circle(x + 6, y - 11.5, 5, "#5b2fb8"); }
  if (kind === "hood") { ctx.strokeStyle = "#5e6676"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y + 1, 19.5, Math.PI * 0.82, Math.PI * 2.18); ctx.stroke(); }
}
// o: {who, x, y (Unterkante Körper), arms:[l,r], face, hold, lean, extra}
function figure(o, t) {
  const C = CHAR[o.who];
  ctx.save();
  if (!o.noShadow) shadow(o.x, o.y + 2, 24 * (o.s || 1), 0.22);
  ctx.translate(o.x, o.y); ctx.scale(o.s || 1, o.s || 1); if (o.flipX) ctx.scale(-1, 1); ctx.rotate(o.lean || 0);
  const hy = -86;
  ctx.fillStyle = C.body; rr(-21, -72, 42, 74, 21); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)"; rr(-17, -68, 12, 60, 8); ctx.fill();
  if (o.dressed) { // Hemd + Krawatte
    ctx.fillStyle = "#f4f6fa"; ctx.beginPath(); ctx.moveTo(-10, -72); ctx.lineTo(10, -72); ctx.lineTo(0, -60); ctx.fill();
    ctx.fillStyle = "#2f6fd6"; ctx.beginPath(); ctx.moveTo(-2.5, -64); ctx.lineTo(2.5, -64); ctx.lineTo(4, -44); ctx.lineTo(0, -40); ctx.lineTo(-4, -44); ctx.fill();
  }
  if (o.robe) { // Bademantel
    ctx.fillStyle = "#ffffff"; rr(-22, -73, 44, 76, 21); ctx.fill();
    ctx.strokeStyle = "#d9dde6"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-12, -70); ctx.lineTo(4, -38); ctx.moveTo(12, -70); ctx.lineTo(-4, -38); ctx.stroke();
    ctx.fillStyle = "#8fc6ff"; ctx.fillRect(-21, -36, 42, 5);
  }
  if (o.pants) { // Hose verkehrt herum: Taschen und Etikett vorne
    ctx.fillStyle = "#2f5fb0"; rr(-22, -26, 44, 28, [4, 4, 10, 10]); ctx.fill();
    ctx.fillStyle = "#264f94"; rr(-15, -21, 10, 9, 2); ctx.fill(); rr(5, -21, 10, 9, 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(-2, -28, 5, 6);
  }
  const [la, ra] = o.arms || [0.15, -0.15];
  const ac = o.robe ? "#eef1f6" : C.dark;
  const handL = arm(-17, -58, la, 32, ac);
  const hand = arm(17, -58, ra, 32, ac);
  circle(0, hy, 17.5, LINE); circle(0, hy, 16.6, SKIN);
  face(0 + (o.look || 0) * 2.5, hy - (o.up ? 3 : 0), o.face);
  if (o.bags) eyebags(0, hy);
  feature(o.feat, 0, hy, t);
  if (o.hold) holdItem(hand[0], hand[1], o.hold, t);
  if (o.holdL) holdItem(handL[0], handL[1], o.holdL, t);
  ctx.restore();
}
function sleeper(p, who, f, feat) {
  const x = p.x0 + 50, y = p.y0 + 146, C = CHAR[who];
  circle(x - 20, y + 14, 12, C.body); circle(x + 20, y + 14, 12, C.body);
  circle(x, y, 17.5, LINE); circle(x, y, 16.6, SKIN);
  if (f) face(x, y, f);
  if (feat) feature(feat, x, y);
  return { x, y };
}

// ------------------------------------------------------------ Blasen, Zzz, Effekte
function bubble(text, cx, cy, s, kind, tail) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.font = "900 14.5px InterX"; ctx.letterSpacing = "0.8px";
  const w = ctx.measureText(text).width + 28, h = 32;
  ctx.fillStyle = "#fbf6ea"; ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.beginPath();
  if (kind === "thought") {
    const n = Math.max(3, Math.round(w / 22));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + 6 + i * (w - 12) / n; ctx.moveTo(x + 11, -h / 2 + 5); ctx.arc(x, -h / 2 + 5, 10, 0, Math.PI * 2); ctx.moveTo(x + 11, h / 2 - 5); ctx.arc(x, h / 2 - 5, 10, 0, Math.PI * 2); }
    ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 14);
    ctx.fill();
    if (tail) { ctx.shadowColor = "transparent"; for (const [i, r] of [[1, 4], [2, 2.6]]) circle(tail[0] * i * 0.5, h / 2 + 4 + i * 7, r, "#fbf6ea"); }
  } else {
    ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    if (tail) { ctx.moveTo(tail[0] - 7, h / 2 - 2); ctx.lineTo(tail[0] + tail[1], h / 2 + 12); ctx.lineTo(tail[0] + 7, h / 2 - 2); }
    ctx.fill();
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0.4, 1);
  ctx.restore();
}
function popIn(t, a, b = 99, dur = 0.22) { if (t < a || t > b + 0.2) return 0; return back(ramp(t, a, a + dur)) * (1 - easeIO(ramp(t, b, b + 0.18))); }
function puff(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  for (let i = 0; i < 8; i++) { const a = i * 0.785; circle(x + Math.cos(a) * 28 * k, y + Math.sin(a) * 15 * k, 7 * (1 - k * 0.6), "#fbf6ea"); }
  ctx.restore();
}
function zzz(x, y, t, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.9 + i / 3) % 1;
    ctx.globalAlpha = a * Math.sin(ph * Math.PI); ctx.font = `900 ${10 + ph * 6}px InterX`;
    ctx.fillText("Z", x + Math.sin(ph * 6) * 2, y + 26 - ph * 30);
  }
  ctx.restore();
}
function stars(x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#ffe066";
  for (let i = 0; i < 3; i++) { const ang = t * 7 + i * 2.1, px = x + Math.cos(ang) * 18, py = y + Math.sin(ang) * 6; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.fillText("✦", px, py); }
  ctx.restore();
}
function sweat(x, y, t) { const k = (t * 2.5) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = "#8fd3ff"; ctx.beginPath(); ctx.ellipse(x, y + k * 10, 2.2, 3.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }

function label(text, cx, y, color = "#f3f3f3", flip = 0, text2 = "", color2 = "#ffd84a") {
  ctx.save();
  const show2 = flip > 0.5, sx = Math.abs(Math.cos(flip * Math.PI));
  const tx = show2 ? text2 : text;
  ctx.font = "700 13px InterX"; ctx.letterSpacing = "1.3px";
  const w = ctx.measureText(tx).width + 20;
  ctx.translate(cx, y); ctx.scale(Math.max(0.02, sx), 1);
  ctx.fillStyle = "rgba(26,28,38,0.94)"; rr(-w / 2, -12, w, 24, 12); ctx.fill();
  ctx.fillStyle = show2 ? color2 : color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(tx, 0.7, 1);
  ctx.restore();
}
const grain = (() => {
  const c = document.createElement("canvas"); c.width = 540; c.height = 960;
  const g = c.getContext("2d"), d = g.createImageData(540, 960), r = rng(99);
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 140; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
})();


// ------------------------------------------------------------ Zeitplan
const CLOCK = (() => {
  const L = []; let t = 0;
  for (let m = 0; m <= 30; m++) { L.push([t, m]); t += 0.2; }          // 19:50 -> 20:20, eine Minute alle 0,2 s
  t = 6.0; for (let m = 32; m <= 50; m += 2) { t += 0.27; L.push([t, m]); } // rast: 5 Min. pro Sekunde bis 20:40
  for (const [tt, m] of [[9.0, 51], [9.3, 52], [9.55, 53], [9.8, 54], [10.0, 55]]) L.push([tt, m]); // langsam vor dem Höhepunkt
  L.push([13.92, 0]);
  return L.map(([tt, m]) => { const mm = 1190 + m, h = Math.floor(mm / 60), mi = mm % 60; return [tt, `${h}:${String(mi).padStart(2, "0")}`, m]; });
})();
const T = {
  msgs: [[1.0, "BIN UNTERWEGS!"], [4.0, "BIN GLEICH DA"], [6.0, "NOCH 5 MIN"], [8.0, "SEHE EUCH SCHON 👀"]],
  tap: [2.0, 2.95], run: [3.0, 3.4], stumble: 3.42, bow: 3.78, sorry: [3.8, 4.75], look: [5.0, 5.9], film: 7.0, search: [8.1, 9.6],
  climax: 10.0, flip: 11.0, wave: 12.0, zoomOut: 12.7, title1: 13.0, title2: 13.22, sticker: 13.05, curtainClose: 13.55, out: 13.85,
};
const lightsOut = t => ramp(t, T.out - 0.05, T.out + 0.08);
const minsAt = t => stateAt(CLOCK.map(c => [c[0], c[2]]), t);

// ------------------------------------------------------------ Himmel + Häuser
const STARS = (() => { const r = rng(5), a = []; for (let i = 0; i < 70; i++) a.push([r() * W, r() * 330, 0.5 + r() * 0.9, r() * 6]); return a; })();
function drawSky(t) {
  const k = clamp(minsAt(t) / 55);
  const top = mix(hex("#3a3a86"), hex("#121638"), k), bot = mix(hex("#f39a7c"), hex("#3b2f6e"), k);
  const g = ctx.createLinearGradient(0, 0, 0, 840);
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 840);
  for (const [x, y, r, p] of STARS) { ctx.globalAlpha = (0.25 + 0.75 * k) * (0.5 + 0.4 * Math.sin(t * 2 + p)); circle(x, y, r, "#fff"); }
  ctx.globalAlpha = 1;
  // Mond
  glow(470, 150 - k * 20, 60, [230, 230, 255], 0.25);
  circle(470, 150 - k * 20, 16, "#f4f1e2"); circle(477, 145 - k * 20, 14, rgb(top));
}
const BULBS = 22;
function drawCinema(t) {
  shadow(191, 820, 190, 0.25);
  // Fassade
  ctx.fillStyle = "#7f2436"; ctx.fillRect(16, 228, 350, 590);
  ctx.fillStyle = "#952c42"; for (let x = 30; x < 360; x += 40) ctx.fillRect(x, 380, 14, 250);
  ctx.fillStyle = "#5e1a28"; ctx.fillRect(10, 220, 362, 12); ctx.fillRect(16, 630, 350, 8);
  // Uhrtafel
  ctx.fillStyle = "#1b1426"; rr(66, 238, 250, 76, 12); ctx.fill();
  ctx.strokeStyle = "#e9b949"; ctx.lineWidth = 3; ctx.stroke();
  // Leuchtschrift-Band
  const film = t >= T.film && t < T.out;
  ctx.fillStyle = "#231a2e"; rr(36, 326, 310, 46, 6); ctx.fill();
  for (let i = 0; i < BULBS; i++) {
    const x = 42 + i * (298 / (BULBS - 1)), on = (i + Math.floor(t * (film ? 10 : 4))) % 3 !== 0;
    for (const y of [330, 368]) { circle(x, y, 2.4, on ? "#ffe39a" : "#6b5a3a"); if (on) glow(x, y, 7, [255, 220, 140], 0.35); }
  }
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 21px InterX"; ctx.letterSpacing = "2px";
  if (film) { const blink = Math.floor((t - T.film) * 4) % 2 === 0; ctx.fillStyle = blink ? "#ff4a4a" : "#5a2026"; if (blink) { ctx.shadowColor = "#ff3030"; ctx.shadowBlur = 12; } ctx.fillText("FILM LÄUFT", 192, 350); ctx.shadowBlur = 0; }
  else { ctx.fillStyle = "#ffd76a"; ctx.fillText("HEUTE 20:00", 192, 350); }
  ctx.letterSpacing = "0px";
  // KINO-Schild
  ctx.font = "900 46px InterX"; ctx.letterSpacing = "8px"; ctx.fillStyle = "#ffe9b0"; ctx.shadowColor = "#ffb84a"; ctx.shadowBlur = 16;
  ctx.fillText("KINO", 196, 445); ctx.shadowBlur = 0; ctx.letterSpacing = "0px";
  // Plakate
  for (const [x, c1, c2] of [[34, "#2e5fa8", "#f2c14e"], [292, "#3a8a6a", "#f07a5a"]]) {
    ctx.fillStyle = "#e9b949"; ctx.fillRect(x - 3, 652, 62, 96);
    ctx.fillStyle = c1; ctx.fillRect(x, 655, 56, 90); circle(x + 28, 688, 14, c2);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillRect(x + 8, 720, 40, 4); ctx.fillRect(x + 14, 729, 28, 3);
  }
  // Eingang
  ctx.fillStyle = "#3a1622"; ctx.fillRect(104, 640, 174, 178);
  const g = ctx.createLinearGradient(0, 650, 0, 818); g.addColorStop(0, "#ffd99a"); g.addColorStop(1, "#d98a4a");
  ctx.fillStyle = g; ctx.fillRect(112, 650, 158, 168);
  ctx.fillStyle = "#3a1622"; ctx.fillRect(188, 650, 6, 168);
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.moveTo(130, 650); ctx.lineTo(150, 650); ctx.lineTo(120, 818); ctx.lineTo(112, 818); ctx.fill();
  circle(182, 740, 2.5, "#e9b949"); circle(200, 740, 2.5, "#e9b949");
}
function drawHouse(t) {
  shadow(470, 820, 100, 0.22);
  ctx.fillStyle = "#d9a46c"; ctx.fillRect(372, 300, 194, 518);
  ctx.fillStyle = "#c48e58"; for (let y = 312; y < 818; y += 22) ctx.fillRect(372, y, 194, 2);
  ctx.fillStyle = "#6e4a3a"; ctx.fillRect(366, 290, 206, 14);
  // Haustür
  ctx.fillStyle = "#5a3a2b"; ctx.fillRect(482, 730, 50, 88); circle(524, 776, 2, "#e9b949");
  ctx.fillStyle = "#ffe0a0"; ctx.fillRect(492, 740, 30, 14);
  // kleines zweites Fenster (dunkel)
  ctx.fillStyle = "#2a2f4a"; ctx.fillRect(400, 650, 46, 56); ctx.fillStyle = "#efe6d8"; ctx.fillRect(421, 650, 4, 56); ctx.fillRect(400, 676, 46, 4);
}
// Fenster mit ??? (Bad)
const WIN = { x0: 400, x1: 516, y0: 470, y1: 596 };
const STEAM = (() => { const r = rng(12), a = []; for (let i = 0; i < 14; i++) a.push([r(), r(), 0.5 + r() * 0.8]); return a; })();
function drawWindow(t) {
  const { x0, x1, y0, y1 } = WIN, w = x1 - x0, h = y1 - y0;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  // Bad: Fliesen
  ctx.fillStyle = "#bfe6f2"; ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1;
  for (let x = x0; x < x1; x += 14) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  for (let y = y0; y < y1; y += 14) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  ctx.fillStyle = "#e8f6fb"; rr(x0 + 8, y0 + 10, 26, 34, 10); ctx.fill(); ctx.strokeStyle = "#9cc9d8"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#9cc9d8"; ctx.fillRect(x1 - 26, y0 + 8, 3, 30); circle(x1 - 24.5, y0 + 8, 6, "#9cc9d8");
  // ??? im Bademantel
  const wave = t >= T.wave;
  const o = { who: "grau", feat: "towel", robe: true, x: (x0 + x1) / 2, y: y1 + 34, s: 0.95, face: "type", noShadow: true,
    arms: [0.35, -1.25], hold: "phone" };
  if (t >= T.flip && t < T.wave) o.face = "smile";
  if (wave) { const s = Math.sin((t - T.wave) * 16); o.arms = [0.35, -(Math.PI - 0.5) + s * 0.4]; o.hold = null; o.holdL = "phone"; o.face = "happy"; }
  figure(o, t);
  if (!wave) glow(o.x + 14, o.y - 70, 26, [140, 190, 255], 0.35);
  // Dampf
  for (const [a, b, sp] of STEAM) {
    const k = (t * 0.25 * sp + a) % 1;
    ctx.globalAlpha = 0.55 * Math.sin(k * Math.PI); circle(x0 + b * w, y1 - k * h * 1.1, 8 + k * 10, "#ffffff");
  }
  ctx.globalAlpha = 1;
  // Vorhang (zu bis zum Höhepunkt, am Ende wieder zu)
  const open = easeOut(ramp(t, T.climax, T.climax + 0.2)) * (1 - easeIO(ramp(t, T.curtainClose, T.out)));
  const half = (w / 2) * (1 - open) + 7;
  for (const sgn of [0, 1]) {
    const cx0 = sgn ? x1 - half : x0;
    const g = ctx.createLinearGradient(cx0, 0, cx0 + half, 0);
    g.addColorStop(0, "#f4b860"); g.addColorStop(1, "#ffd48a"); ctx.fillStyle = g; ctx.fillRect(cx0, y0, half, h);
    ctx.fillStyle = "rgba(170,90,30,0.25)"; for (let k = 1; k < 4; k++) ctx.fillRect(cx0 + (k * half) / 4, y0, 2, h);
  }
  ctx.restore();
  // Rahmen + Sims
  ctx.strokeStyle = "#f3ece0"; ctx.lineWidth = 6; ctx.strokeRect(x0, y0, w, h);
  ctx.fillStyle = "#f3ece0"; ctx.fillRect(x0 - 8, y1 + 2, w + 16, 8); ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x0 - 8, y1 + 10, w + 16, 3);
  // Dampf kringelt oben raus (Hinweis vor dem Höhepunkt)
  if (t < T.climax) for (let i = 0; i < 3; i++) {
    const k = (t * 0.4 + i / 3) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * Math.sin(k * Math.PI)})`; ctx.lineWidth = 2;
    const x = x0 + 30 + i * 28, y = y0 - 4 - k * 26;
    ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.quadraticCurveTo(x + 6, y + 5, x, y); ctx.quadraticCurveTo(x - 6, y - 5, x, y - 10); ctx.stroke();
  }
}
function drawStreet() {
  ctx.fillStyle = "#6f7279"; ctx.fillRect(0, 818, W, 14); ctx.fillStyle = "#8a8d93"; ctx.fillRect(0, 832, W, 26);
  ctx.fillStyle = "#b9bbbf"; ctx.fillRect(0, 858, W, 7); ctx.fillStyle = "#24262c"; ctx.fillRect(0, 865, W, H - 865);
  ctx.fillStyle = "#cfd0d3"; for (let x = 15; x < W; x += 76) ctx.fillRect(x, 950, 44, 4);
  // Laterne
  ctx.fillStyle = "#2a2c34"; ctx.fillRect(367, 560, 5, 258); rr(358, 548, 23, 14, 4); ctx.fill();
  glow(369, 566, 70, [255, 220, 150], 0.35);
}

// ------------------------------------------------------------ Figuren vorne
function punctual(t) {
  const o = { who: "blau", feat: "glasses", x: 130, y: 812, s: 1.35, face: "smile", arms: [0.2, -0.75], hold: "tickets" };
  if (t >= T.tap[0] && t < T.tap[1]) { o.face = "annoyed"; o.y -= Math.max(0, Math.sin((t - T.tap[0]) * 2 * Math.PI * 2.2)) * 3; }
  if (t >= 4.0 && t < 5.0) o.face = "tired";
  if (t >= T.look[0] && t < T.look[1]) { o.up = true; o.face = "wide"; }
  if (t >= 6.0 && t < T.search[0]) o.face = "annoyed";
  if (t >= T.search[0] && t < T.search[1]) { const ph = Math.floor((t - T.search[0]) / 0.45) % 2; o.flipX = ph === 1; o.face = "wide"; o.look = 1; }
  if (t >= T.climax && t < T.title1) { o.face = t < 10.6 ? "shock" : "annoyed"; o.look = 1; }
  if (t >= T.title1) o.face = "annoyed";
  return o;
}
function late(t) {
  if (t < T.run[0]) return null;
  const k = easeOut(ramp(t, T.run[0], T.run[1]));
  const o = { who: "gelb", feat: "cap", x: lerp(-50, 270, k), y: 812, s: 1.35, face: "panic", arms: [0.9, -0.9] };
  if (t < T.run[1]) { o.y -= Math.abs(Math.sin(t * 26)) * 8; o.lean = 0.25; }
  else if (t < T.bow) { const s = Math.sin(clamp((t - T.stumble) / 0.35) * Math.PI); o.lean = 0.5 * s; o.face = "shock"; }
  else if (t < 4.4) { o.lean = 0.45 * Math.sin(clamp((t - T.bow) / 0.6) * Math.PI); o.face = "sorry"; o.arms = [0.4, -0.4]; }
  else o.face = "smile";
  if (t >= T.look[0] && t < T.look[1]) { o.up = true; o.face = "wide"; }
  if (t >= T.search[0] && t < T.search[1]) { const ph = Math.floor((t - T.search[0] + 0.2) / 0.45) % 2; o.flipX = ph === 0; o.face = "wide"; o.look = 1; }
  if (t >= T.climax && t < T.title1) { o.face = t < 10.6 ? "shock" : "sorry"; }
  return o;
}

// ------------------------------------------------------------ Nachrichten von ???
function message(text, t0, t1, t) {
  const s = popIn(t, t0, t1, 0.2); if (s <= 0) return;
  const shake = t - t0 < 0.25 ? Math.sin((t - t0) * 90) * 2 : 0;
  ctx.save(); ctx.translate(205 + shake, 548); ctx.scale(s, s);
  ctx.font = "900 15px InterX, 'Noto Color Emoji'"; ctx.letterSpacing = "0.6px";
  const w = Math.max(150, ctx.measureText(text).width + 58), h = 44;
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
  ctx.fillStyle = "#fbf6ea"; rr(-w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w / 2 + 26, h / 2 - 2); ctx.lineTo(-w / 2 + 16, h / 2 + 11); ctx.lineTo(-w / 2 + 40, h / 2 - 2); ctx.fill();
  ctx.shadowColor = "transparent";
  circle(-w / 2 + 20, 0, 12, "#a3abb8");
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 13px InterX"; ctx.fillText("?", -w / 2 + 20, 1);
  ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9a"; ctx.font = "700 9px InterX"; ctx.letterSpacing = "1px"; ctx.fillText("??? · JETZT", -w / 2 + 38, -10);
  ctx.fillStyle = "#1d1d22"; ctx.font = "900 15px InterX, 'Noto Color Emoji'"; ctx.letterSpacing = "0.6px"; ctx.fillText(text, -w / 2 + 38, 7);
  ctx.restore();
}

// ------------------------------------------------------------ Uhr, Titel, Sticker
function drawClock(t) {
  const s = stateAt(CLOCK.map(c => [c[0], c[1]]), t);
  const red = t >= T.climax && t < 13.92 ? 1 - ramp(t, 12.6, 13.0) : 0;
  const pop = t >= T.climax && t < 12 ? 1 + 0.16 * Math.exp(-(t - T.climax) * 6) * Math.cos((t - T.climax) * 16) : 1;
  ctx.save(); ctx.translate(191, 278); ctx.scale(pop, pop);
  ctx.font = "900 60px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const col = mix([255, 236, 190], [255, 64, 58], red);
  ctx.shadowColor = rgb(col, 0.8); ctx.shadowBlur = 14; ctx.fillStyle = rgb(col); ctx.fillText(s, 0, 2);
  ctx.restore();
}
function drawTitle(t) {
  if (t < T.title1 || t >= T.out) return;
  const a1 = back(ramp(t, T.title1, T.title1 + 0.28)), a2 = back(ramp(t, T.title2, T.title2 + 0.28));
  const g = ctx.createLinearGradient(0, 0, 0, 240);
  g.addColorStop(0, "rgba(10,8,25,0.85)"); g.addColorStop(0.75, "rgba(10,8,25,0.55)"); g.addColorStop(1, "rgba(10,8,25,0)");
  ctx.globalAlpha = ramp(t, T.title1, T.title1 + 0.15); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 240); ctx.globalAlpha = 1;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 33px InterX"; ctx.letterSpacing = "-1px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  if (a1 > 0) { ctx.save(); ctx.translate(288, 168); ctx.scale(a1, a1); ctx.fillStyle = "#fbf7ee"; ctx.fillText("„BIN GLEICH DA.“", 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.save(); ctx.translate(288, 207); ctx.scale(a2, a2);
    const w1 = ctx.measureText("GLEICH = ").width, w2 = ctx.measureText("1 STUNDE.").width, x0 = -(w1 + w2) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#fbf7ee"; ctx.fillText("GLEICH = ", x0, 0);
    ctx.fillStyle = "#ff4a4a"; ctx.fillText("1 STUNDE.", x0 + w1, 0); ctx.restore();
  }
  ctx.restore();
}
function sticker(t) {
  const s = popIn(t, T.sticker, T.out - 0.18, 0.25); if (s <= 0) return;
  ctx.save(); ctx.translate(410, 712); ctx.rotate(-0.12); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 8;
  circle(0, 0, 47, "#ffffff"); ctx.shadowColor = "transparent"; circle(0, 0, 42, "#5aa7ff");
  ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 14px InterX"; ctx.letterSpacing = "0.5px";
  ctx.fillText("WELCHER", 0, -9); ctx.fillText("BIST DU?", 0, 9);
  ctx.restore();
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // Kamera: Ruck + Zoom ins Fenster, später zurück
  const zin = easeIO(ramp(t, T.climax, T.climax + 0.45)) * (1 - easeIO(ramp(t, T.zoomOut, T.zoomOut + 0.35)));
  const z = 1 + 0.9 * zin, half = W / (2 * z), cx = clamp(lerp(288, 458, zin), half, W - half), cy = lerp(560, 528, zin);
  const sh = t >= T.climax && t < 10.6 ? Math.sin(t * 75) * 3 * Math.exp(-(t - T.climax) * 6) : 0;
  ctx.translate(288 + sh, 560 + sh * 0.4); ctx.scale(z, z); ctx.translate(-cx, -cy);
  drawSky(t);
  drawCinema(t);
  drawHouse(t);
  drawWindow(t);
  drawStreet();
  const p = punctual(t), l = late(t);
  figure(p, t);
  if (l) { figure(l, t); if (t >= T.run[1] && t < 4.6) sweat(l.x + 26, 650, t); if (t >= T.stumble && t < T.bow) stars(l.x, 655, t, 1); }
  if (t >= T.tap[0] && t < T.tap[1] && Math.sin((t - T.tap[0]) * 2 * Math.PI * 2.2) > 0.8) { ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(130 + d * 26, 812); ctx.lineTo(130 + d * 34, 806); ctx.stroke(); } }
  // Schilder
  label("IMMER PÜNKTLICH", 130, 642);
  if (l) { ctx.save(); ctx.globalAlpha = ramp(t, T.run[1], T.run[1] + 0.2); label("5 MIN ZU SPÄT", 282, 642); ctx.restore(); }
  label("???", 458, 450, "#f3f3f3", easeIO(ramp(t, T.flip, T.flip + 0.35)) * (t < T.out ? 1 : 0), "NOCH UNTER DER DUSCHE");
  // Blasen + Nachrichten
  bubble("SORRY, STAU!", 300, 585, popIn(t, T.sorry[0], T.sorry[1]), "speech", [-10, -8]);
  puff(300, 585, t, T.sorry[1] + 0.05);
  T.msgs.forEach(([t0, txt], i) => { const t1 = (T.msgs[i + 1] ? T.msgs[i + 1][0] : T.climax) - 0.12; message(txt, t0, t1, t); puff(205, 548, t, t1 + 0.05); });
  sticker(t);
  drawClock(t);
  ctx.setTransform(S, 0, 0, S, 0, 0);
  drawTitle(t);
  const lo = lightsOut(t);
  if (lo > 0) { ctx.fillStyle = `rgba(10,8,25,${0.4 * lo})`; ctx.fillRect(0, 0, W, H); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.055; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(grain, 0, 0, 1080, 1920);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
};

window.exportEvents = function () {
  return {
    duration: DUR,
    clock: CLOCK.slice(1).map(c => c[0]),
    msgs: T.msgs.map(m => m[0]), puffs: [...T.msgs.slice(1).map(m => m[0] - 0.07), T.climax - 0.07, T.sorry[1] + 0.05],
    tap: T.tap, run: T.run, stumble: T.stumble, bow: T.bow, sorry: T.sorry[0], look: T.look[0], film: T.film,
    search: T.search, climax: T.climax, shower: [T.climax, T.zoomOut + 0.3], flip: T.flip, wave: T.wave,
    title: [T.title1, T.title2], sticker: T.sticker, curtainClose: T.curtainClose, out: T.out,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 60px InterX"), document.fonts.load("700 13px InterX"), document.fonts.load("15px 'Noto Color Emoji'")]);
  return { duration: DUR };
};
