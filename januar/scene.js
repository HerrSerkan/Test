// "Gleiches Gym. Anderer Vorsatz." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
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
const DAYS = [[0, 1], [0.9, 2], [1.6, 3], [2.2, 5], [2.7, 7], [3.15, 9], [3.55, 11], [3.9, 14], [4.25, 17], [4.6, 20], [4.95, 23], [5.4, 26], [7.0, 29], [9.0, 31]];
const T = { neu: 0.75, slow: 3.15, sit: 3.55, leave: 3.95, gone: 4.7, ask: 6.1, satz: 6.85, tap: 7.5, climax: 9.0, robot: 9.45,
  title1: 9.6, title2: 10.1, sticker: 11.6, stickerEnd: 12.55, loop: 12.95 };
const X = { jeden: 120, wer: 288, vorsatz: 456 };
const GY = 730;

// ------------------------------------------------------------ Studio
function drawGym(t) {
  // Wand
  let g = ctx.createLinearGradient(0, 280, 0, GY);
  g.addColorStop(0, "#23283a"); g.addColorStop(1, "#2e3550");
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, GY - 280);
  // Spiegelwand mit Reflexen
  ctx.fillStyle = "#3d4766"; ctx.fillRect(30, 300, 516, 270);
  g = ctx.createLinearGradient(30, 300, 546, 570);
  g.addColorStop(0, "rgba(200,220,255,0.18)"); g.addColorStop(0.5, "rgba(200,220,255,0.04)"); g.addColorStop(1, "rgba(200,220,255,0.14)");
  ctx.fillStyle = g; ctx.fillRect(30, 300, 516, 270);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (const x of [80, 260, 430]) { ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + 40, 300); ctx.lineTo(x - 20, 570); ctx.lineTo(x - 60, 570); ctx.fill(); }
  ctx.strokeStyle = "#11141f"; ctx.lineWidth = 4; ctx.strokeRect(30, 300, 516, 270);
  for (const x of [202, 374]) { ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 570); ctx.stroke(); }
  // Schriftzug
  ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.font = "900 26px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "6px";
  ctx.fillText("NO PAIN NO GAIN", 288, 330); ctx.letterSpacing = "0px";
  // Hantelablage hinten
  ctx.fillStyle = "#1a1d29"; ctx.fillRect(36, 582, 504, 10);
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 56;
    ctx.fillStyle = "#4a5068"; ctx.fillRect(x - 12, 576, 24, 4);
    circle(x - 14, 578, 6, "#151821"); circle(x + 14, 578, 6, "#151821");
  }
  // Boden (Gummi)
  ctx.fillStyle = "#1b1e28"; ctx.fillRect(0, 592, W, H - 592);
  ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
  for (let y = 610; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  g = ctx.createLinearGradient(0, GY, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.8)");
  ctx.fillStyle = g; ctx.fillRect(0, GY, W, H - GY);
  // Licht von oben
  for (const x of [120, 288, 456]) glow(x, 290, 140, "220,230,255", 0.12);
}

function bench() {
  ctx.fillStyle = "#11131b"; ctx.fillRect(224, 664, 8, 64); ctx.fillRect(344, 664, 8, 64);
  ctx.fillStyle = "#c0392b"; rr(214, 646, 148, 18, 6); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.12)"; rr(220, 648, 136, 4, 2); ctx.fill();
  // Langhantel in der Ablage dahinter (unberührt)
  ctx.fillStyle = "#8d96ab"; ctx.fillRect(196, 532, 184, 5);
  for (const x of [204, 362]) { ctx.fillStyle = "#151821"; rr(x - 6, 512, 12, 44, 3); ctx.fill(); }
  ctx.fillStyle = "#2a2f40"; ctx.fillRect(212, 532, 6, 196); ctx.fillRect(358, 532, 6, 196);
}
function treadmill(t, running) {
  const x0 = 392, x1 = 528;
  ctx.fillStyle = "#2a2f40"; rr(x0, 700, x1 - x0, 22, 6); ctx.fill();
  ctx.fillStyle = "#11131b"; rr(x0 + 6, 702, x1 - x0 - 12, 10, 4); ctx.fill();
  if (running) { ctx.fillStyle = "rgba(255,255,255,0.2)"; for (let i = 0; i < 6; i++) { const x = x0 + 10 + ((i * 22 + t * 220) % (x1 - x0 - 20)); ctx.fillRect(x, 704, 8, 3); } }
  ctx.fillStyle = "#2a2f40"; ctx.fillRect(x1 - 14, 590, 8, 112); ctx.fillRect(x0 + 6, 590, 8, 112);
  ctx.fillStyle = "#3b4258"; rr(x0 + 20, 580, x1 - x0 - 40, 26, 5); ctx.fill();
  ctx.fillStyle = running ? "#5fe08f" : "#2a3a35"; ctx.fillRect(x0 + 34, 586, 36, 12);
}

// ------------------------------------------------------------ Figuren
function legsStand(x, top, col, phase = 0, run = 0) {
  for (const s of [-1, 1]) {
    const lift = run ? Math.max(0, Math.sin(phase + (s > 0 ? 0 : Math.PI))) * 18 : 0;
    ctx.fillStyle = col; rr(x + s * 12 - 8, top - 4, 16, GY - top - 6 - lift, 6); ctx.fill();
    ctx.fillStyle = "#f4f4f2"; rr(x + s * 12 - 10, GY - 14 - lift, 22, 11, 4); ctx.fill();
  }
}
function handPos(o, a) {
  const bw = o.r * (o.wide || 1.85);
  const px = o.x + a.side * bw * 0.42, py = o.y + o.r * 1.25;
  return [px - Math.sin(a.ang) * a.len, py + Math.cos(a.ang) * a.len];
}
function dumbbell(x, y) {
  ctx.fillStyle = "#8d96ab"; ctx.fillRect(x - 12, y - 2, 24, 4);
  ctx.fillStyle = "#151821"; rr(x - 15, y - 7, 7, 14, 2); ctx.fill(); rr(x + 8, y - 7, 7, 14, 2); ctx.fill();
}
function sweatband(x, y, r, c) { ctx.fillStyle = c; rr(x - r, y - r * 0.55, r * 2, 8, 3); ctx.fill(); }
function capBack(x, y, r) {
  ctx.fillStyle = "#2d3a6b"; ctx.beginPath(); ctx.arc(x, y - r * 0.3, r * 0.98, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#24305a"; rr(x - r * 0.5, y - r * 0.42, r, 7, 3); ctx.fill();
}
function priceTag(x, y, t) {
  const sw = Math.sin(t * 6) * 0.3;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
  ctx.strokeStyle = "#e9e4d8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 10); ctx.stroke();
  ctx.fillStyle = "#f6f2e6"; rr(-11, 10, 22, 13, 2); ctx.fill();
  ctx.fillStyle = "#d9443c"; ctx.font = "900 7px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("NEU", 0, 17);
  ctx.restore();
}
function sweat(x, y, t, k) {
  if (k <= 0) return;
  for (let i = 0; i < 2; i++) {
    const p = (t * 2 + i * 0.5) % 1;
    ctx.globalAlpha = k * Math.sin(Math.PI * p);
    circle(x + (i ? 34 : -34), y - 6 + p * 22, 3.5, "#9cd3ff");
  }
  ctx.globalAlpha = 1;
}

function people(t) {
  const look = t > T.ask - 0.2 && t < T.climax + 1.2;
  // Kommt jeden Tag: Curls, die ganze Zeit
  const curl = (Math.sin(t * 6) + 1) / 2;
  const jf = stateAt([[0, "smile"], [T.neu, "happy"], [1.6, "smile"], [T.ask - 0.05, "talk"], [T.ask + 0.6, "neutral"], [T.tap, "worried"], [T.climax, "wide"], [T.robot, "talk"], [T.title1, "neutral"], [T.sticker, "smile"]], t);
  legsStand(X.jeden, 638, "#2b2f45");
  const oJ = { col: "mint", x: X.jeden, y: 474, r: 30, face: jf, bodyH: 140, look: look ? 1 : 0,
    arm: [{ side: -1, ang: lerp(0.2, 2.6, curl), len: 46 }, { side: 1, ang: lerp(-0.2, -2.6, 1 - curl), len: 46 }] };
  if (t > T.ask - 0.1) oJ.arm = [{ side: -1, ang: 0.15, len: 46 }, { side: 1, ang: -0.15, len: 46 }];
  person(oJ);
  for (const a of oJ.arm) { const [hx, hy] = handPos(oJ, a); dumbbell(hx, hy); }
  sweatband(X.jeden, 474, 30, "#f6d23a");
  if (t > T.tap) { const tap = Math.abs(Math.sin(t * 9)) * 5; ctx.fillStyle = "#f4f4f2"; rr(X.jeden + 2, GY - 14 - tap, 22, 11, 4); ctx.fill(); }

  // ??? sitzt auf der Bank am Handy
  const wf = stateAt([[0, "smug"], [T.satz - 0.05, "talk"], [T.satz + 0.6, "smug"], [T.climax, "wide"], [T.climax + 0.6, "smug"], [T.sticker, "smile"]], t);
  for (const s of [-1, 1]) { ctx.fillStyle = "#3a3f5a"; rr(X.wer + s * 14 - 8, 650, 16, 66, 6); ctx.fill(); ctx.fillStyle = "#f4f4f2"; rr(X.wer + s * 14 - 10, GY - 14, 22, 11, 4); ctx.fill(); }
  const oW = { col: "lilac", x: X.wer, y: 520, r: 30, face: wf, bodyH: 110, arm: [{ side: -1, ang: -0.55, len: 40 }, { side: 1, ang: 0.55, len: 40 }] };
  person(oW);
  capBack(X.wer, 520, 30);
  // Handy mit Leuchten, Daumen scrollt
  glow(X.wer, 584, 50, "140,190,255", 0.35);
  ctx.fillStyle = "#14161c"; rr(X.wer - 12, 568, 24, 40, 4); ctx.fill();
  ctx.fillStyle = "rgba(160,205,255,0.9)"; rr(X.wer - 9, 571, 18, 34, 3); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; for (let i = 0; i < 4; i++) ctx.fillRect(X.wer - 6, 574 + ((i * 8 + t * 40) % 30), 12, 3);

  // Neujahrsvorsatz: rennt am Anfang, wird langsamer, geht
  const present = t < T.gone;
  if (present) {
    const run = t < T.slow ? 1 : t < T.sit ? 0.4 : 0;
    const ph = t * (t < T.slow ? 16 : 7);
    let x = X.vorsatz;
    if (t > T.leave + 0.15) x = lerp(X.vorsatz, W + 60, easeIO(ramp(t, T.leave + 0.15, T.gone)));
    const walk = t > T.leave + 0.15;
    const vf = stateAt([[0, "happy"], [T.neu - 0.05, "happyTalk"], [T.neu + 0.8, "laugh"], [1.9, "happy"], [T.slow, "worried"], [T.sit, "neutral"], [T.leave - 0.05, "talk"], [T.leave + 0.6, "smile"]], t);
    legsStand(x, 638, "#e85d8f", walk ? t * 14 : ph, run || walk ? 1 : 0);
    const bob = run ? Math.abs(Math.sin(ph)) * 4 : 0;
    const swing = Math.sin(ph) * 0.6 * (run || walk ? 1 : 0);
    person({ col: "peach", x, y: 474 - bob, r: 30, face: vf, bodyH: 140, arm: [{ side: -1, ang: swing, len: 46 }, { side: 1, ang: -swing, len: 46 }] });
    sweatband(x, 474 - bob, 30, "#e85d8f");
    priceTag(x + 26, 520 - bob, t);
    sweat(x, 474 - bob, t, t < T.sit ? 1 : 0);
  }
  return { present };
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0d0f15"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.climax, T.title1 + 0.6);
  drawGym(tt);
  bench();
  treadmill(tt, tt < T.sit);
  people(tt);

  label("KOMMT JEDEN TAG", X.jeden, 452);
  if (tt < T.gone + 0.2) label("NEUJAHRSVORSATZ", X.vorsatz, 452, 1 - ramp(tt, T.leave + 0.3, T.gone));
  else label("NEUJAHRSVORSATZ", X.vorsatz, 452, 0.35);
  flipLabel(tt, X.wer, 420, "???", "SITZT NUR AM HANDY", T.climax + 0.1);

  bubble("NEUES JAHR, NEUES ICH!", 420, 380, popIn(tt, T.neu, T.neu + 1.0), "speech", [30, 6]);
  bubble("ab morgen wieder!", 440, 380, popIn(tt, T.leave, T.leave + 0.75), "speech", [20, 6]);
  bubble("brauchst du die Bank noch?", 190, 380, popIn(tt, T.ask, T.ask + 0.75), "speech", [-40, -6]);
  bubble("noch ein Satz!", 300, 380, popIn(tt, T.satz, T.satz + 0.7), "speech", [-10, 4]);
  bubble("…", 120, 380, popIn(tt, T.tap, T.climax - 0.2), "thought");
  bubble("SEIT 31 TAGEN?!", 150, 380, popIn(tt, T.robot, T.title1 + 0.9, 0.15), "robot", [-10, 6]);
  puff(120, 380, tt, T.climax - 0.15);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  const d = stepsAt(DAYS, tt);
  const hookOn = (tt > 0.05 && tt < 2.05) || (tt > 5.55 && tt < 7.65);
  bigCounter(tt, "FITNESSSTUDIO", `${d}. JANUAR`, tt >= T.climax, lastStep(DAYS, tt), T.title1, !hookOn);
  hookLine(t, ["JEDES", "GYM", "HAT", "DIESEN", "EINEN."], 4, 0.1, 2.0, 163);
  hookLine(t, ["WARTE", "BIS", "ENDE", "JANUAR", "…"], 3, 5.6, 7.6, 163);
  titlePair(t, "GLEICHES GYM.", "ANDERER ", "VORSATZ.", T.title1, T.title2, T.loop);
  stickerAt(t, ["WER", "BIST DU?"], T.sticker, T.stickerEnd, 800);
  grain(t);
};

window.exportEvents = function () {
  return {
    duration: DUR, steps: DAYS.map(d => d[0]).slice(1), climax: T.climax, title: [T.title1, T.title2],
    hookWords: [0, 1, 2, 3, 4].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4].map(i => 5.6 + i * 0.28)),
    pops: [T.neu, T.leave, T.ask, T.satz, T.tap], puffs: [T.climax - 0.15],
    run: [0, T.slow, T.sit], walkOut: [T.leave + 0.15, T.gone], tap: [T.tap, T.climax], robot: T.robot,
    sticker: T.sticker, loop: T.loop,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(17);
  return { duration: DUR };
};
