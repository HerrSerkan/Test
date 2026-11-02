// "Gleiches Spiel. Anderes Timing." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Grundformen (Gesichter, Schilder, Blasen) aus mensa/scene.js.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 13.3;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
function keys(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
    const a = K[i - 1], b = K[i], k = easeIO((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return K[K.length - 1].slice(1);
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

// ------------------------------------------------------------ Figuren
const COL = { pink: ["#e7aeb0", "#d99a9d"], blue: ["#a6b8e6", "#91a6da"], green: ["#93c4b0", "#80b29e"], white: ["#f3efe6", "#ddd7cb"] };
function face(x, y, r, f, look = 0) {
  ctx.save(); ctx.translate(x, y); const k = r / 30; ctx.scale(k, k);
  ctx.strokeStyle = "#26262a"; ctx.fillStyle = "#26262a"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
  const E = 10, ey = -3, lx = look * 3;
  const dots = (r = 3.4) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * E + lx, ey, r * 0.85, r * 1.2, 0, 0, Math.PI * 2); ctx.fill(); } };
  const big = () => { for (const s of [-1, 1]) { circle(s * E + lx, ey, 4.6, "#26262a"); circle(s * E + lx + 1.3, ey - 1.5, 1.4, "#fff"); } ctx.fillStyle = "#26262a"; };
  const happy = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * E, ey + 2.5, 5, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  const smug = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * E - 6, ey - 1); ctx.lineTo(s * E + 6, ey - 1); ctx.stroke(); ctx.beginPath(); ctx.arc(s * E + 1, ey - 1, 3.2, 0, Math.PI); ctx.fill(); } };
  const m = (kind) => {
    ctx.beginPath();
    if (kind === "smile") ctx.arc(0, 6, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    else if (kind === "grin") { ctx.arc(0, 7, 8.5, 0, Math.PI); ctx.closePath(); ctx.fill(); return; }
    else if (kind === "flat") { ctx.moveTo(-5, 12); ctx.lineTo(5, 12); }
    else if (kind === "o") { ctx.ellipse(0, 12, 3.4, 4.3, 0, 0, Math.PI * 2); ctx.fill(); return; }
    else if (kind === "wavy") { ctx.moveTo(-7, 12); ctx.quadraticCurveTo(-3.5, 8, 0, 12); ctx.quadraticCurveTo(3.5, 16, 7, 12); }
    else if (kind === "small") ctx.arc(0, 8, 5, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
  };
  switch (f) {
    case "neutral": dots(); m("flat"); break;
    case "smile": dots(); m("smile"); break;
    case "happy": happy(); m("smile"); break;
    case "laugh": happy(); m("grin"); break;
    case "smug": smug(); m("small"); break;
    case "talk": dots(); m("o"); break;
    case "happyTalk": happy(); m("o"); break;
    case "worried": dots(); m("wavy"); break;
    case "wide": big(); m("flat"); break;
    case "shock": big(); m("o"); break;
  }
  ctx.restore();
}
function blush(x, y, r, a) {
  if (a <= 0) return;
  ctx.globalAlpha = a * 0.6;
  circle(x - r * 0.52, y + r * 0.25, r * 0.17, "#f08a8a"); circle(x + r * 0.52, y + r * 0.25, r * 0.17, "#f08a8a");
  ctx.globalAlpha = 1;
}
// Kopf + Körper; Körper oben bei y + r*0.85
function person(o) {
  const [c1, c2] = COL[o.col];
  const r = o.r, bw = r * (o.wide || 1.85), bh = o.bodyH || r * 3;
  ctx.save();
  ctx.translate(o.x, o.y); ctx.rotate(o.lean || 0); ctx.translate(-o.x, -o.y);
  // Körper
  ctx.fillStyle = c2; rr(o.x - bw / 2, o.y + r * 0.82, bw, bh, [bw / 2, bw / 2, 4, 4]); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)"; rr(o.x - bw / 2 + 3, o.y + r * 0.9, bw * 0.4, bh - 6, bw / 4); ctx.fill();
  // Arme
  if (o.arm) for (const a of o.arm) {
    ctx.save(); ctx.translate(o.x + a.side * bw * 0.42, o.y + r * 1.25); ctx.rotate(a.ang);
    ctx.fillStyle = c2; ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
    rr(-r * 0.15, -r * 0.1, r * 0.3, a.len || r * 1.6, r * 0.15); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // Kopf
  const g = ctx.createRadialGradient(o.x - r * 0.35, o.y - r * 0.4, r * 0.1, o.x, o.y, r);
  g.addColorStop(0, o.col === "white" ? "#fbf9f4" : c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.fill();
  face(o.x, o.y, r, o.face, o.look || 0);
  blush(o.x, o.y, r, o.blush || 0);
  ctx.restore();
}

function tray(x, y, w, food = true) {
  ctx.fillStyle = "#6f8f96"; rr(x - w / 2, y - 7, w, 14, 3); ctx.fill();
  ctx.fillStyle = "#88a9af"; rr(x - w / 2 + 2, y - 6, w - 4, 9, 2); ctx.fill();
  if (food) {
    ctx.fillStyle = "#f5f2ea"; ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - 2, w * 0.28, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ec8a3a"; ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - 2.5, w * 0.19, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function juice(x, y) {
  ctx.fillStyle = "#f6b928"; ctx.fillRect(x - 4, y - 12, 8, 12);
  ctx.strokeStyle = "#e44"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 1, y - 12); ctx.lineTo(x + 3, y - 19); ctx.stroke();
}
function apple(x, y) { circle(x, y, 4.5, "#d63b34"); ctx.fillStyle = "#4b8a3c"; ctx.fillRect(x - 0.5, y - 7, 1.2, 3); }

function drawBackTable() {
  ctx.fillStyle = "#c08a55"; ctx.beginPath(); ctx.moveTo(220, 572); ctx.lineTo(456, 572); ctx.lineTo(460, 584); ctx.lineTo(214, 584); ctx.fill();
  ctx.fillStyle = "#a5723f"; ctx.fillRect(214, 584, 246, 4);
  ctx.fillStyle = "#151a24"; ctx.fillRect(218, 588, 238, 22);
  ctx.fillStyle = "#b98450"; rr(210, 606, 254, 9, 2); ctx.fill();
  ctx.fillStyle = "#8c5f35"; ctx.fillRect(210, 615, 254, 4);
}
function drawFrontTable() {
  ctx.fillStyle = "#c69259"; ctx.beginPath(); ctx.moveTo(48, 667); ctx.lineTo(530, 667); ctx.lineTo(540, 692); ctx.lineTo(38, 692); ctx.fill();
  ctx.fillStyle = "#a8743f"; ctx.fillRect(38, 692, 502, 7);
  ctx.fillStyle = "#151a24"; ctx.fillRect(44, 699, 490, 22);
  ctx.fillStyle = "#c08a55"; rr(30, 718, 516, 26, 3); ctx.fill();
  ctx.fillStyle = "#99683b"; ctx.fillRect(30, 740, 516, 12);
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1;
  for (const x of [150, 300, 430]) { ctx.beginPath(); ctx.moveTo(x, 720); ctx.lineTo(x - 4, 744); ctx.stroke(); }
}
function drawBook(x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = "#3b2f78"; rr(-48, -32, 96, 64, 3); ctx.fill();
  ctx.fillStyle = "#4b3c94"; rr(-46, -30, 44, 60, 2); ctx.fill(); rr(2, -30, 44, 60, 2); ctx.fill();
  ctx.fillStyle = "#2b2358"; ctx.fillRect(-1.5, -32, 3, 64);
  ctx.fillStyle = "#f2c85a"; ctx.beginPath(); const sx = 24, sy = -6;
  ctx.moveTo(sx, sy - 7); ctx.lineTo(sx + 2, sy - 2); ctx.lineTo(sx + 7, sy); ctx.lineTo(sx + 2, sy + 2); ctx.lineTo(sx, sy + 7); ctx.lineTo(sx - 2, sy + 2); ctx.lineTo(sx - 7, sy); ctx.lineTo(sx - 2, sy - 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(10, 12, 28, 2.5); ctx.fillRect(-38, 12, 22, 2.5);
  ctx.restore();
}

// ------------------------------------------------------------ Schilder + Blasen
function label(text, cx, cy, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = "700 14px InterX"; ctx.letterSpacing = "1.6px";
  const w = ctx.measureText(text).width + 20;
  ctx.fillStyle = "rgba(38,44,56,0.95)"; rr(cx - w / 2, cy - 12, w, 24, 12); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#eef0f2"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, cx + 0.8, cy + 1);
  ctx.restore();
}
// Sprechblase: kind "speech" (mit Spitze), "thought" (Wolke), "robot" (Kasten)
function bubble(text, cx, cy, s, kind, tail) {
  if (s <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s);
  const robot = kind === "robot";
  ctx.font = robot ? "900 16.5px InterX" : "700 16.5px InterX";
  ctx.letterSpacing = robot ? "1.4px" : "0px";
  const w = ctx.measureText(text).width + (robot ? 26 : 30), h = robot ? 32 : 34;
  ctx.fillStyle = "#f7f2e6";
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  if (kind === "thought") {
    ctx.beginPath();
    const n = Math.max(3, Math.round(w / 22));
    for (let i = 0; i <= n; i++) { const x = -w / 2 + 6 + i * (w - 12) / n; ctx.moveTo(x + 12, -h / 2 + 4); ctx.arc(x, -h / 2 + 6, 11, 0, Math.PI * 2); ctx.moveTo(x + 12, h / 2 - 4); ctx.arc(x, h / 2 - 6, 11, 0, Math.PI * 2); }
    ctx.roundRect(-w / 2, -h / 2 + 2, w, h - 4, 14);
    ctx.fill();
  } else if (robot) {
    ctx.fillStyle = "#eef3fa"; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#7d9cc4"; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
    if (tail) { ctx.fillStyle = "#eef3fa"; ctx.beginPath(); ctx.moveTo(tail[0] - 6, h / 2 - 1); ctx.lineTo(tail[0] + 6, h / 2 - 1); ctx.lineTo(tail[0] + tail[1], h / 2 + 12); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    if (tail) { ctx.moveTo(tail[0] - 7, h / 2 - 2); ctx.lineTo(tail[0] + tail[1], h / 2 + 13); ctx.lineTo(tail[0] + 7, h / 2 - 2); }
    ctx.fill();
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = robot ? "#22324a" : "#1d1d22";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, robot ? 0.7 : 0, 1);
  ctx.restore();
}
// Auftauchen (federnd) und Verschwinden
function popIn(t, a, b = 99, dur = 0.25) { if (t < a || t > b + 0.2) return 0; return back(ramp(t, a, a + dur)) * (1 - easeIO(ramp(t, b, b + 0.2))); }
function puff(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = "#f7f2e6";
  for (let i = 0; i < 8; i++) { const a = i * 0.785; circle(x + Math.cos(a) * 26 * k, y + Math.sin(a) * 16 * k, 7 * (1 - k * 0.6), "#f7f2e6"); }
  ctx.restore();
}
function heart(x, y, t, t0) {
  const k = ramp(t, t0, t0 + 0.9); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.translate(x, y - k * 16); ctx.scale(0.5 + back(ramp(t, t0, t0 + 0.25)) * 0.5, 0.5 + back(ramp(t, t0, t0 + 0.25)) * 0.5);
  ctx.fillStyle = "#f27a9a"; ctx.beginPath(); ctx.moveTo(0, 5); ctx.bezierCurveTo(-9, -2, -5, -9, 0, -4); ctx.bezierCurveTo(5, -9, 9, -2, 0, 5); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------ gemeinsame Teile (wie wgkueche/ und rechnung/)
COL.mint = ["#8fe0bf", "#6fcca8"]; COL.peach = ["#ffb98a", "#f59f6c"]; COL.lilac = ["#c7a8ff", "#ad8cf2"];
COL.gold = ["#ffd36e", "#f2bc45"]; COL.sky = ["#9cc7ff", "#7fb0f2"]; COL.lime = ["#a8e57a", "#8ccf5e"];
COL.coral = ["#ff9c8f", "#f2806f"];

function stepsAt(L, t) { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; }
function lastStep(L, t) { let a0 = -9; for (const [a] of L) if (t >= a) a0 = a; return a0; }

function hookLine(t, words, key, t0, t1, y) {
  const out = ramp(t, t1 - 0.2, t1);
  if (t < t0 || out >= 1) return;
  ctx.save(); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.font = "900 25px InterX"; ctx.letterSpacing = "0.5px";
  const sp = ctx.measureText(" ").width;
  const ws = words.map(w => ctx.measureText(w).width);
  let x = 288 - (ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2;
  words.forEach((w, i) => {
    const p = ramp(t, t0 + i * 0.28, t0 + i * 0.28 + 0.18);
    if (p > 0) {
      ctx.globalAlpha = easeOut(p) * (1 - out);
      const dy = (1 - easeOut(p)) * 8;
      if (i === key) {
        const s = back(p);
        ctx.save(); ctx.translate(x + ws[i] / 2, y - 9 + dy); ctx.scale(s, s);
        ctx.fillStyle = "#f6b23a"; rr(-ws[i] / 2 - 7, -18, ws[i] + 14, 32, 7); ctx.fill();
        ctx.fillStyle = "#1d1d22"; ctx.fillText(w, -ws[i] / 2, 9);
        ctx.restore();
      } else {
        ctx.fillStyle = "#d9dae2"; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 6;
        ctx.fillText(w, x, y + dy); ctx.shadowBlur = 0;
      }
    }
    x += ws[i] + sp;
  });
  ctx.restore();
}

// großer Zähler oben (unter den TikTok-Tabs)
function bigCounter(t, label, text, red, popT, fadeAt, showLabel) {
  const popK = 1 + (1 - easeOut(ramp(t, popT, popT + 0.2))) * (red ? 0.45 : 0.14);
  const fade = 1 - ramp(t, fadeAt - 0.2, fadeAt + 0.1);
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha = fade; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  if (showLabel) { ctx.font = "700 13px InterX"; ctx.letterSpacing = "3px"; ctx.fillStyle = "rgba(240,240,245,0.65)"; ctx.fillText(label, 288, 168); }
  ctx.translate(288, 222); ctx.scale(popK, popK);
  ctx.font = "900 50px InterX"; ctx.letterSpacing = "-1px";
  ctx.shadowColor = red ? "rgba(255,60,60,0.7)" : "rgba(0,0,0,0.5)"; ctx.shadowBlur = red ? 18 : 8;
  ctx.fillStyle = red ? "#ff4b4b" : "#f5f1e8";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function titlePair(t, l1, l2a, l2b, t1, t2, loop) {
  const a1 = back(ramp(t, t1, t1 + 0.3)), a2 = back(ramp(t, t2, t2 + 0.3));
  const fade = 1 - ramp(t, loop - 0.3, loop);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "900 37px InterX"; ctx.letterSpacing = "-1.2px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  if (a1 > 0) { ctx.globalAlpha = clamp(a1) * fade; ctx.save(); ctx.translate(288, 197); ctx.scale(a1, a1); ctx.fillStyle = "#f5f1e8"; ctx.fillText(l1, 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.globalAlpha = clamp(a2) * fade; ctx.save(); ctx.translate(288, 241); ctx.scale(a2, a2);
    const w1 = ctx.measureText(l2a).width, w2 = ctx.measureText(l2b).width, x0 = -(w1 + w2) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = "#f5f1e8"; ctx.fillText(l2a, x0, 0);
    ctx.fillStyle = "#f6b23a"; ctx.fillText(l2b, x0 + w1, 0);
    ctx.restore();
  }
  ctx.restore();
}

function stickerAt(t, text, t0, t1, y = 708) {
  const s = popIn(t, t0, t1, 0.3);
  if (s <= 0) return;
  ctx.save(); ctx.translate(288, y); ctx.rotate(-0.08); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  circle(0, 0, 52, "#f6b23a");
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#fff4d6"; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#1d1d22"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 14px InterX"; ctx.letterSpacing = "0.5px";
  ctx.fillText(text[0], 0, -8); ctx.fillText(text[1], 0, 10);
  ctx.restore();
}

// Schild, das sich am Höhepunkt umdreht
function flipLabel(t, x, y, before, after, t0) {
  if (t < t0) { label(before, x, y); return; }
  const f = ramp(t, t0, t0 + 0.25);
  ctx.save(); ctx.translate(x, y); ctx.scale(1, Math.max(0.02, Math.abs(Math.cos(f * Math.PI)))); ctx.translate(-x, -y);
  label(f < 0.5 ? before : after, x, y);
  ctx.restore();
}

let GRAIN = [];
function grain(t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.045;
  ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}
function makeGrain(seed0) {
  let seed = seed0; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
}
// Kamera: am Höhepunkt leicht ran + Ruckeln
function cameraAt(tt, climax, back1) {
  const z = 1 + 0.07 * easeIO(ramp(tt, climax, climax + 0.3)) * (1 - easeIO(ramp(tt, back1, back1 + 0.7)));
  const sh = tt > climax && tt < climax + 0.4 ? Math.sin(tt * 95) * 3 * (1 - ramp(tt, climax, climax + 0.4)) : 0;
  ctx.setTransform(S * z, 0, 0, S * z, S * (288 - 288 * z + sh), S * (560 - 560 * z));
}
function note(x, y, s, col = "#f6f2e6") {
  circle(x, y, 4.2 * s, col);
  ctx.fillStyle = col; ctx.fillRect(x + 3.2 * s, y - 16 * s, 1.8 * s, 16 * s);
  ctx.beginPath(); ctx.moveTo(x + 5 * s, y - 16 * s); ctx.quadraticCurveTo(x + 13 * s, y - 12 * s, x + 10 * s, y - 6 * s); ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke();
}
function star(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? r * 0.35 : r; ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  ctx.fill();
}

// ------------------------------------------------------------ Zeitplan
const MIN = [[0, "1."], [0.9, "9."], [1.6, "17."], [2.2, "24."], [2.7, "31."], [3.15, "38."], [3.55, "45."], [3.9, "52."], [4.25, "60."],
  [4.6, "67."], [4.95, "74."], [5.4, "81."], [7.0, "89."], [8.2, "90.+3"], [9.0, "TOR!"]];
const T = { schiri: 0.9, abseits: 2.2, erkl: 3.1, ohh: 4.6, ohhEnd: 5.3, chips: 7.0, leave: 7.25, gone: 7.85, tense: 8.2,
  climax: 9.0, back: 9.35, robot: 9.6, title1: 9.75, title2: 10.25, sticker: 11.6, stickerEnd: 12.55, loop: 12.95 };
const X = { brüllt: 122, wer: 288, erkl: 456 };
const GY = 730;

// ------------------------------------------------------------ Wohnzimmer
function drawRoom(t) {
  let g = ctx.createLinearGradient(0, 280, 0, GY);
  g.addColorStop(0, "#2a2438"); g.addColorStop(1, "#352d47");
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, GY - 280);
  // Fenster (Nacht, Flutlicht in der Ferne)
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(36, 316, 120, 130);
  ctx.fillStyle = "#121a33"; ctx.fillRect(42, 322, 108, 118);
  for (let i = 0; i < 9; i++) circle(48 + (i * 37) % 100, 330 + (i * 23) % 60, 1.2, "#fff");
  glow(120, 420, 30, "230,240,255", 0.5);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(94, 322, 4, 118); ctx.fillRect(42, 379, 108, 4);
  // Schal an der Wand (neutrale Farben)
  ctx.save(); ctx.translate(288, 340);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? "#f2f2f2" : "#2f8f5b"; ctx.fillRect(-120 + i * 26.6, -14, 26.6, 28); }
  ctx.fillStyle = "#2f8f5b"; ctx.font = "900 12px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px";
  ctx.fillStyle = "#1d1d22"; ctx.fillText("ALLEZ!", 0, 1); ctx.letterSpacing = "0px";
  ctx.strokeStyle = "#f2f2f2"; ctx.lineWidth = 2;
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(s * 120 + s * 2, -12 + k * 6); ctx.lineTo(s * 132, -12 + k * 6); ctx.stroke(); }
  ctx.restore();
  // Stehlampe rechts
  ctx.fillStyle = "#1c1824"; ctx.fillRect(520, 380, 4, 300);
  ctx.fillStyle = "#e9c46a"; ctx.beginPath(); ctx.moveTo(500, 400); ctx.lineTo(544, 400); ctx.lineTo(536, 370); ctx.lineTo(508, 370); ctx.fill();
  glow(522, 400, 90, "255,210,140", 0.25);
  // Boden + Teppich
  ctx.fillStyle = "#2a1f1a"; ctx.fillRect(0, 700, W, H - 700);
  ctx.fillStyle = "#6b3a4a"; ctx.beginPath(); ctx.ellipse(288, 760, 260, 50, 0, 0, Math.PI * 2); ctx.fill();
  g = ctx.createLinearGradient(0, 760, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, 760, W, H - 760);
}
function sofaBack() {
  ctx.fillStyle = "#4a5d8a"; rr(30, 540, 516, 110, 26); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)"; for (const x of [200, 376]) ctx.fillRect(x, 552, 3, 90);
}
function sofaFront() {
  ctx.fillStyle = "#3d4f78"; rr(30, 640, 516, 30, 10); ctx.fill();
  ctx.fillStyle = "#334366"; rr(30, 668, 516, 34, 6); ctx.fill();
  ctx.fillStyle = "#4a5d8a"; rr(14, 600, 44, 102, 16); ctx.fill(); rr(518, 600, 44, 102, 16); ctx.fill();
}
function coffeeTable(t) {
  ctx.fillStyle = "#7a5233"; rr(150, 704, 276, 14, 4); ctx.fill();
  ctx.fillStyle = "#5a3a22"; ctx.fillRect(166, 718, 8, 36); ctx.fillRect(402, 718, 8, 36);
  // Getränke
  for (const x of [196, 384]) { ctx.fillStyle = "#c8902f"; rr(x - 6, 682, 12, 22, 2); ctx.fill(); ctx.fillStyle = "#f6f2e6"; ctx.fillRect(x - 6, 682, 12, 4); }
  // Chipsschale (leer, solange ??? Chips holt)
  const full = t <= T.chips;   // danach leer, er bringt eine volle Schale mit
  if (full) chipsBowl(288, 702, 1);
}
function chipsBowl(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#f2c447";
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-18 + i * 6, -10 - (i % 3) * 3, 7, 4, i, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#d9443c"; ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(30, -8); ctx.quadraticCurveTo(26, 4, 0, 4); ctx.quadraticCurveTo(-26, 4, -30, -8); ctx.fill();
  ctx.restore();
}
// Fernsehlicht von vorne
function tvLight(t) {
  const goal = ramp(t, T.climax, T.climax + 0.1) * (1 - ramp(t, T.climax + 0.4, T.climax + 1.2));
  const f = 0.10 + 0.04 * Math.sin(t * 7.3) + 0.03 * Math.sin(t * 13.1);
  ctx.fillStyle = `rgba(120,170,255,${f})`; ctx.fillRect(0, 280, W, GY - 280);
  if (goal > 0) { ctx.fillStyle = `rgba(200,255,210,${0.35 * goal})`; ctx.fillRect(0, 280, W, H - 280); }
}
function confetti(t) {
  const k = ramp(t, T.climax, T.climax + 2.6);
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 46; i++) {
    const x = (i * 41) % 576 + Math.sin(t * 3 + i) * 12;
    const y = 300 + ((i * 29) % 80) + k * 520 * (0.6 + (i % 5) * 0.12);
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 5 + i);
    ctx.fillStyle = ["#2f8f5b", "#f2f2f2", "#f6b23a", "#e8665a"][i % 4]; ctx.globalAlpha = 1 - k * 0.6;
    ctx.fillRect(-4, -2, 8, 4); ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Figuren
function scarfNeck(x, y, r) {
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? "#f2f2f2" : "#2f8f5b"; ctx.fillRect(x - r * 0.95 + i * r * 0.38, y + r * 0.72, r * 0.38, 11); }
  ctx.fillStyle = "#2f8f5b"; ctx.fillRect(x + r * 0.4, y + r * 0.8, 9, 30);
}
function glassesOn(x, y) {
  ctx.strokeStyle = "#1f2838"; ctx.lineWidth = 2.4;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * 10, y - 3, 7.5, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - 2.5, y - 3); ctx.lineTo(x + 2.5, y - 3); ctx.stroke();
}
function jersey(x, y) {
  ctx.fillStyle = "#f2f2f2"; ctx.fillRect(x - 26, y + 50, 52, 6);
  ctx.fillStyle = "#1d1d22"; ctx.font = "900 22px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("10", x, y + 82);
}
function legsSit(x, col) {
  for (const s of [-1, 1]) { ctx.fillStyle = col; rr(x + s * 13 - 8, 650, 16, 66, 6); ctx.fill(); ctx.fillStyle = "#f4f4f2"; rr(x + s * 13 - 10, GY - 14, 22, 11, 4); ctx.fill(); }
}

function people(t) {
  const goal = t >= T.climax;
  const jump = s => goal && t < T.climax + 2.4 ? Math.abs(Math.sin((t - T.climax) * 8 + s)) * 26 : 0;
  const ohh = t > T.ohh && t < T.ohhEnd;
  const tense = t > T.tense && t < T.climax;
  const armsUp = [{ side: -1, ang: 2.75, len: 48 }, { side: 1, ang: -2.75, len: 48 }];
  const handsHead = [{ side: -1, ang: 2.3, len: 42 }, { side: 1, ang: -2.3, len: 42 }];
  // Brüllt den Schiri an
  const bf = stateAt([[0, "neutral"], [T.schiri - 0.05, "shock"], [T.schiri + 0.6, "worried"], [T.abseits - 0.05, "shock"], [T.abseits + 0.6, "neutral"], [T.ohh, "shock"], [T.ohhEnd, "worried"], [T.tense, "wide"], [T.climax, "laugh"], [T.title2 + 0.8, "happy"]], t);
  const bArm = goal && t < T.climax + 2.4 ? armsUp : ohh ? handsHead : (t > T.schiri && t < T.schiri + 0.6) || (t > T.abseits && t < T.abseits + 0.6) ? [{ side: 1, ang: -2.2 + Math.sin(t * 20) * 0.25, len: 46 }] : null;
  legsSit(X.brüllt, "#2b2f45");
  person({ col: "coral", x: X.brüllt, y: 528 - jump(0), r: 30, face: bf, bodyH: 108, arm: bArm, lean: tense ? 0.08 : 0 });
  scarfNeck(X.brüllt, 528 - jump(0), 30);
  // Erklärt Abseits
  const ef = stateAt([[0, "smug"], [T.erkl - 0.05, "talk"], [T.erkl + 1.0, "smug"], [T.ohh, "shock"], [T.ohhEnd, "neutral"], [T.tense, "wide"], [T.climax, "laugh"], [T.title2 + 0.8, "happy"]], t);
  const eArm = goal && t < T.climax + 2.4 ? armsUp : ohh ? handsHead : t > T.erkl && t < T.erkl + 1.0 ? [{ side: -1, ang: 1.6 + Math.sin(t * 9) * 0.3, len: 46 }] : null;
  legsSit(X.erkl, "#3d5a8a");
  person({ col: "sky", x: X.erkl, y: 528 - jump(1.3), r: 30, face: ef, bodyH: 108, arm: eArm, lean: tense ? -0.08 : 0 });
  glassesOn(X.erkl, 528 - jump(1.3));
  // ??? – sitzt, geht in der 89. Chips holen, kommt nach dem Tor zurück
  let wx = X.wer, wy = 528, show = true, standing = false;
  if (t > T.chips + 0.1 && t < T.gone) { standing = true; wy = 528 - 34 * easeOut(ramp(t, T.chips + 0.1, T.leave)); wx = lerp(X.wer, -60, easeIO(ramp(t, T.leave, T.gone))); }
  if (t >= T.gone && t < T.back) show = false;
  if (t >= T.back) { standing = true; wy = 494; wx = lerp(-60, X.wer, easeOut(ramp(t, T.back, T.back + 0.55))); }
  if (show) {
    const wf = stateAt([[0, "worried"], [0.6, "neutral"], [T.ohh, "shock"], [T.ohhEnd, "worried"], [T.chips - 0.05, "talk"], [T.chips + 0.6, "smile"], [T.back, "smile"], [T.climax + 0.75, "shock"], [T.title2 + 0.8, "wide"]], t);
    const walk = (t > T.leave && t < T.gone) || (t > T.back && t < T.back + 0.55);
    const bob = walk ? Math.abs(Math.sin(t * 16)) * 4 : 0;
    if (!standing) legsSit(wx, "#2b2f45");
    else for (const s of [-1, 1]) { ctx.fillStyle = "#2b2f45"; rr(wx + s * 12 - 8, wy + 110, 16, GY - wy - 116, 6); ctx.fill(); }
    const eat = !standing && !ohh && t < T.chips ? (Math.sin(t * 3) > 0.6 ? [{ side: 1, ang: -2.6, len: 40 }] : null) : null;
    person({ col: "lime", x: wx, y: wy - bob, r: 30, face: wf, bodyH: standing ? 140 : 108, arm: ohh ? handsHead : eat, look: t > T.back ? 1 : 0 });
    jersey(wx, wy - bob);
    if (t >= T.back) chipsBowl(wx + 34, wy + 70, 0.8);   // mit voller Schale zurück
  }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0d0f15"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.climax, T.title1 + 0.6);
  drawRoom(tt);
  sofaBack();
  people(tt);
  sofaFront();
  // ??? läuft vor dem Sofa: nochmal oben drauf, wenn er steht
  coffeeTable(tt);
  tvLight(tt);
  confetti(tt);

  label("BRÜLLT DEN SCHIRI AN", X.brüllt, 476);
  label("ERKLÄRT ABSEITS", X.erkl, 476);
  flipLabel(tt, X.wer, 444, "???", "VERPASST JEDES TOR", T.climax + 0.1);

  bubble("SCHIRI!!", 150, 406, popIn(tt, T.schiri, T.schiri + 0.7), "speech", [-20, -6]);
  bubble("ABSEITS!!", 150, 406, popIn(tt, T.abseits, T.abseits + 0.7), "speech", [-20, -6]);
  bubble("war kein Abseits, weil …", 420, 406, popIn(tt, T.erkl, T.erkl + 1.05), "speech", [30, 6]);
  bubble("OHHH!", 288, 400, popIn(tt, T.ohh + 0.05, T.ohhEnd, 0.15), "robot", [0, 6]);
  bubble("hol nur kurz Chips!", 250, 406, popIn(tt, T.chips, T.gone - 0.05), "speech", [0, 6]);
  bubble("TOOOR!!", 410, 406, popIn(tt, T.climax + 0.05, T.robot + 0.6, 0.12), "speech", [20, 6]);
  bubble("WAS HAB ICH VERPASST?", 260, 406, popIn(tt, T.robot, T.title2 + 1.4, 0.15), "robot", [-60, 6]);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  const m = stepsAt(MIN, tt);
  const hookOn = (tt > 0.05 && tt < 2.05) || (tt > 5.55 && tt < 7.65);
  const goal = tt >= T.climax;
  bigCounter(tt, goal ? "HEIM 1 : 0 GAST" : "HEIM 0 : 0 GAST", goal ? "TOR! 1:0" : `${m} MINUTE`, goal, lastStep(MIN, tt), T.title1, !hookOn);
  hookLine(t, ["JEDER", "HAT", "DIESEN", "EINEN", "KUMPEL."], 3, 0.1, 2.0, 163);
  hookLine(t, ["WARTE", "AUF", "DIE", "90.", "MINUTE", "…"], 3, 5.6, 7.6, 163);
  titlePair(t, "GLEICHES SPIEL.", "ANDERES ", "TIMING.", T.title1, T.title2, T.loop);
  stickerAt(t, ["WER", "BIST DU?"], T.sticker, T.stickerEnd, 830);
  grain(t);
};

window.exportEvents = function () {
  return {
    duration: DUR, steps: MIN.map(d => d[0]).slice(1), climax: T.climax, title: [T.title1, T.title2],
    hookWords: [0, 1, 2, 3, 4].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4, 5].map(i => 5.6 + i * 0.28)),
    pops: [T.schiri, T.abseits, T.erkl, T.chips], ohh: T.ohh, leave: [T.leave, T.gone], back: T.back, robot: T.robot,
    sticker: T.sticker, loop: T.loop, tense: T.tense,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(19);
  return { duration: DUR };
};
