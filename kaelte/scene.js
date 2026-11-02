// "Gleiche Kälte. Andere Hose." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
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
const TEMP = [[0, 16], [0.9, 14], [1.6, 12], [2.2, 10], [2.7, 8], [3.15, 7], [3.55, 6], [3.9, 5], [4.25, 4], [4.6, 3], [4.95, 2], [5.4, 1], [7.0, 0], [9.0, -1]];
const T = { brrr: 0.9, schicht: 2.75, warm: 3.7, look: 6.0, hum: 7.3, climax: 9.0, robot: 9.45,
  title1: 9.6, title2: 10.1, sticker: 11.6, stickerEnd: 12.55, loop: 12.95 };
const X = { jacke: 122, wer: 288, zwiebel: 458 };
const GY = 730;                                   // Boden
const coldK = t => clamp((16 - stepsAt(TEMP, t)) / 17);

// ------------------------------------------------------------ Haltestelle
const LEAVES = Array.from({ length: 26 }, (_, i) => ({ x: (i * 97) % 576, sp: 38 + (i * 13) % 30, ph: i * 0.77, c: ["#e8833a", "#d9533a", "#f2b33d", "#b8642c"][i % 4], d: (i * 0.37) % 1 }));
const FLAKES = Array.from({ length: 60 }, (_, i) => ({ x: (i * 53) % 576, sp: 30 + (i * 7) % 25, ph: i * 1.3, r: 1.6 + (i % 3) * 0.8, d: (i * 0.61) % 1 }));

function drawStop(t) {
  const k = coldK(t);
  // Himmel hinter der Glaswand
  let g = ctx.createLinearGradient(0, 280, 0, GY);
  g.addColorStop(0, `rgb(${lerp(92, 70, k)},${lerp(110, 98, k)},${lerp(140, 140, k)})`);
  g.addColorStop(1, `rgb(${lerp(170, 150, k)},${lerp(160, 170, k)},${lerp(150, 190, k)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, GY - 280);
  // Häuser in der Ferne
  ctx.fillStyle = "rgba(60,62,80,0.55)";
  for (const [x, w, h] of [[0, 90, 150], [80, 70, 110], [170, 110, 170], [330, 80, 130], [420, 156, 160]]) ctx.fillRect(x, 600 - h, w, h + 40);
  ctx.fillStyle = "rgba(255,225,150,0.5)";
  for (const [x, y] of [[20, 470], [50, 500], [190, 450], [230, 490], [350, 500], [450, 470], [500, 510]]) ctx.fillRect(x, y, 10, 12);
  // Bäume: Laub wird mit der Kälte weniger
  for (const [x, s] of [[70, 1], [250, 1.2], [470, 1.05]]) {
    ctx.fillStyle = "#4a3426"; ctx.fillRect(x - 5 * s, 470, 10 * s, 170);
    const n = Math.round(lerp(9, 2, k));
    for (let i = 0; i < 9; i++) {
      if (i >= n) continue;
      const a = i * 0.7;
      circle(x + Math.cos(a * 2.3) * 34 * s, 440 + Math.sin(a * 1.7) * 24 * s, 22 * s, ["#e07a33", "#c94f30", "#eaa93a"][i % 3]);
    }
  }
  // Gehweg + Bordstein
  ctx.fillStyle = "#3b3f4d"; ctx.fillRect(0, GY - 10, W, 12);
  ctx.fillStyle = "#4a4f60"; ctx.fillRect(0, GY + 2, W, H - GY);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, GY + 2); ctx.lineTo(x - 14, H); ctx.stroke(); }
  g = ctx.createLinearGradient(0, GY, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0.15)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, GY + 2, W, H - GY);
  // Laub am Boden
  for (let i = 0; i < 18; i++) { ctx.fillStyle = LEAVES[i % LEAVES.length].c; ctx.beginPath(); ctx.ellipse((i * 61) % 576, GY + 8 + (i % 3) * 5, 7, 3, i, 0, Math.PI * 2); ctx.fill(); }
  // Unterstand: Glaswand, Dach, Pfosten
  ctx.fillStyle = "rgba(200,225,240,0.12)"; ctx.fillRect(40, 376, 496, 300);
  ctx.strokeStyle = "rgba(220,235,245,0.35)"; ctx.lineWidth = 2; ctx.strokeRect(40, 376, 496, 300);
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.moveTo(60, 376); ctx.lineTo(110, 376); ctx.lineTo(70, 676); ctx.lineTo(40, 676); ctx.fill();
  ctx.fillStyle = "#2d3140"; ctx.fillRect(30, 352, 516, 24);
  ctx.fillStyle = "#3a3f52"; ctx.fillRect(30, 352, 516, 5);
  ctx.fillStyle = "#2d3140"; ctx.fillRect(36, 376, 8, GY - 376); ctx.fillRect(532, 376, 8, GY - 376);
  // Haltestellenschild
  ctx.fillStyle = "#f2c94c"; circle(500, 330, 18, "#f2c94c");
  ctx.fillStyle = "#1f6b3a"; ctx.font = "900 15px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("H", 500, 331);
  ctx.fillStyle = "#2d3140"; ctx.fillRect(498, 348, 4, 6);
  // Bank
  ctx.fillStyle = "#7a5233"; rr(70, 640, 436, 12, 3); ctx.fill();
  ctx.fillStyle = "#2d3140"; ctx.fillRect(90, 652, 6, 78); ctx.fillRect(480, 652, 6, 78);
}
function pumpkin(t) {
  const x = 512, y = 626;
  ctx.fillStyle = "#e8792e"; ctx.beginPath(); ctx.ellipse(x, y, 20, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d0631f"; ctx.beginPath(); ctx.ellipse(x, y, 9, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4b6b2f"; ctx.fillRect(x - 2, y - 20, 4, 7);
  const fl = 0.75 + 0.25 * Math.sin(t * 17);
  ctx.fillStyle = `rgba(255,220,90,${fl})`;
  ctx.beginPath(); ctx.moveTo(x - 10, y - 4); ctx.lineTo(x - 5, y - 9); ctx.lineTo(x - 2, y - 3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 10, y - 4); ctx.lineTo(x + 5, y - 9); ctx.lineTo(x + 2, y - 3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 10, y + 4); ctx.lineTo(x + 10, y + 4); ctx.lineTo(x + 6, y + 8); ctx.lineTo(x, y + 6); ctx.lineTo(x - 6, y + 8); ctx.fill();
  glow(x, y, 30, "255,190,80", 0.25 * fl);
}
function weather(t) {
  const k = coldK(t);
  // Blätter (weniger, je kälter)
  const nl = Math.round(lerp(18, 6, k)) * (t < T.climax ? 1 : 1 - ramp(t, T.climax, T.climax + 0.6));
  for (let i = 0; i < nl; i++) {
    const L = LEAVES[i];
    const y = 280 + ((t * L.sp + L.d * 450) % 450);
    const x = L.x + Math.sin(t * 1.5 + L.ph) * 18;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2 + L.ph) * 1.2);
    ctx.fillStyle = L.c; ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Schnee ab dem Höhepunkt
  const sn = ramp(t, T.climax, T.climax + 0.8);
  if (sn > 0) {
    for (let i = 0; i < Math.round(60 * sn); i++) {
      const F = FLAKES[i];
      const y = 280 + ((t * F.sp + F.d * 460) % 460);
      circle(F.x + Math.sin(t * 1.2 + F.ph) * 10, y, F.r, "rgba(255,255,255,0.9)");
    }
  }
}

// ------------------------------------------------------------ Figuren stehend (mit Beinen)
function legs(x, top, col, kind) {
  const L = GY - top;
  for (const s of [-1, 1]) {
    const lx = x + s * 12;
    if (kind === "shorts") {
      ctx.fillStyle = "#c9b27a"; rr(lx - 10, top - 4, 20, 26, 4); ctx.fill();         // kurze Hose
      ctx.fillStyle = col; rr(lx - 6, top + 20, 12, L - 30, 5); ctx.fill();            // nackte Beine
      ctx.fillStyle = "#f4f4f2"; rr(lx - 9, GY - 12, 22, 10, 4); ctx.fill();           // Sneaker
    } else {
      ctx.fillStyle = kind === "jeans" ? "#3d5a8a" : "#2b2f45"; rr(lx - 9, top - 4, 18, L - 6, 5); ctx.fill();
      ctx.fillStyle = kind === "jeans" ? "#6b4a2c" : "#3a2a22"; rr(lx - 11, GY - 14, 24, 13, 4); ctx.fill();   // Stiefel
    }
  }
}
function beanie(x, y, r, c1 = "#c94f3a", c2 = "#a63d2c") {
  ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(x, y - r * 0.25, r * 1.02, Math.PI, 0); ctx.fill();
  ctx.fillStyle = c2; rr(x - r * 1.05, y - r * 0.38, r * 2.1, 9, 4); ctx.fill();
  circle(x, y - r * 1.22, 6, "#f4ecd8");
}
function scarf(x, y, r, c) {
  ctx.fillStyle = c; rr(x - r * 0.95, y + r * 0.7, r * 1.9, 12, 6); ctx.fill();
  rr(x + r * 0.35, y + r * 0.8, 10, 30, 4); ctx.fill();
}
function earmuffs(x, y, r) {
  ctx.strokeStyle = "#7a4ad9"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r + 2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  circle(x - r - 1, y + 2, 9, "#f4b8e0"); circle(x + r + 1, y + 2, 9, "#f4b8e0");
}
function breath(x, y, t, ph, dir) {
  const p = ((t + ph) % 1.4) / 1.4;
  if (p > 0.6) return;
  const q = p / 0.6;
  ctx.globalAlpha = (1 - q) * 0.75;
  circle(x + dir * (8 + q * 26), y - q * 8, 5 + q * 9, "#f1f4f8");
  ctx.globalAlpha = 1;
}
function snowCap(x, y, r, k) {
  if (k <= 0) return;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath(); ctx.ellipse(x, y - r * 0.92, r * 0.62 * k, 7 * k, 0, Math.PI, 0); ctx.fill();
}

function people(t) {
  const look = t > T.look && t < T.climax + 1.2;
  const temp = stepsAt(TEMP, t);
  const cold = temp <= 5;
  const snowK = ramp(t, T.climax + 0.4, T.climax + 1.4);
  // Jacke ab September
  const jf = stateAt([[0, "worried"], [T.brrr + 0.8, "neutral"], [2.4, "smile"], [T.look, "neutral"], [T.hum, "wide"], [T.climax, "shock"], [T.title1, "neutral"], [T.sticker, "smile"]], t);
  legs(X.jacke, 642, "", "dark");
  person({ col: "sky", x: X.jacke, y: 476, r: 30, face: jf, bodyH: 142, wide: 2.35, look: look ? 1 : 0, lean: t < 1.8 ? Math.sin(t * 40) * 0.025 : 0 });
  ctx.fillStyle = "rgba(255,255,255,0.18)"; for (let i = 0; i < 4; i++) ctx.fillRect(X.jacke - 34, 530 + i * 26, 68, 3);   // Steppjacke
  scarf(X.jacke, 476, 30, "#d9533a"); beanie(X.jacke, 476, 30);
  snowCap(X.jacke, 476 - 6, 30, snowK * 0.6);
  // ??? T-Shirt + kurze Hose
  const wf = stateAt([[0, "happy"], [0.6, "smile"], [T.warm - 0.05, "happyTalk"], [T.warm + 0.7, "smile"], [T.hum, "happy"], [T.climax, "laugh"], [T.climax + 0.9, "happy"], [T.sticker, "laugh"]], t);
  legs(X.wer, 640, "#9edc72", "shorts");
  person({ col: "lime", x: X.wer, y: 470, r: 30, face: wf, bodyH: 140, lean: t > T.hum && t < T.climax ? Math.sin(t * 4) * 0.05 : 0 });
  ctx.fillStyle = "#f4f4f2"; rr(X.wer - 29, 548, 58, 24, 6); ctx.fill();                  // T-Shirt-Aufdruck
  ctx.fillStyle = "#e8792e"; ctx.font = "900 11px InterX"; ctx.letterSpacing = "0px"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SUMMER", X.wer, 561);
  snowCap(X.wer, 470, 30, snowK);
  // Zwiebellook: mit jeder Stufe eine Schicht mehr
  const layers = Math.min(7, Math.floor((16 - temp) / 2.3));
  const zf = stateAt([[0, "neutral"], [T.schicht - 0.05, "talk"], [T.schicht + 0.6, "worried"], [T.look, "neutral"], [T.hum, "wide"], [T.climax, "shock"], [T.title1, "worried"], [T.sticker, "worried"]], t);
  const LC = ["#ffb98a", "#7fb0f2", "#f2c94c", "#8ccf5e", "#e57aa8", "#9a7af0", "#5ac8c8", "#f08a5d"];
  legs(X.zwiebel, 642, "", "jeans");
  for (let i = layers; i >= 1; i--) {                                                        // äußere Schichten zuerst
    const w = 60 + i * 11, h = 142 + i * 4;
    ctx.fillStyle = LC[i % LC.length]; rr(X.zwiebel - w / 2, 500 - i * 2, w, h, [w / 2, w / 2, 8, 8]); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(X.zwiebel - w / 2 + 4, 500 - i * 2 + h - 10, w - 8, 3);
  }
  const shiver = layers >= 4 ? Math.sin(t * 50) * 0.03 : 0;
  person({ col: "peach", x: X.zwiebel, y: 476, r: 30, face: zf, bodyH: 142, look: look ? -1 : 0, lean: shiver });
  if (layers >= 3) scarf(X.zwiebel, 476, 30, "#5ac8c8");
  if (layers >= 5) earmuffs(X.zwiebel, 476, 30);
  snowCap(X.zwiebel, 476, 30, snowK * 0.8);
  // Atemwolken bei Kälte (nicht bei ???)
  if (cold) { breath(X.jacke + 18, 486, t, 0, 1); breath(X.zwiebel - 18, 486, t, 0.7, -1); }
  return layers;
}

function humNotes(t) {
  if (t < T.hum || t > T.climax + 2.2) return;
  for (let i = 0; i < 3; i++) {
    const p = ((t - T.hum) * 0.8 + i / 3) % 1;
    ctx.globalAlpha = Math.sin(Math.PI * p);
    note(X.wer + 26 + p * 26 + i * 4, 462 - p * 44, 1);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0d0f15"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.climax, T.title1 + 0.6);
  drawStop(tt);
  pumpkin(tt);
  people(tt);
  weather(tt);
  humNotes(tt);

  label("SCHON WINTERJACKE", X.jacke, 452);
  label("ZWIEBELLOOK", X.zwiebel, 452);
  flipLabel(tt, X.wer, 422, "???", "IMMER KURZE HOSE", T.climax + 0.1);

  bubble("brrr …", 116, 380, popIn(tt, T.brrr, T.brrr + 0.75), "thought");
  bubble("noch 'ne Schicht!", 452, 380, popIn(tt, T.schicht, T.schicht + 0.7), "speech", [20, 6]);
  bubble("ist doch warm!", 288, 380, popIn(tt, T.warm, T.warm + 0.8), "speech", [0, 4]);
  bubble("…", 120, 380, popIn(tt, T.look + 0.2, T.hum + 0.6), "thought");
  bubble("…", 456, 380, popIn(tt, T.look + 0.5, T.hum + 0.8), "thought");
  bubble("MIR IST WARM!", 288, 380, popIn(tt, T.robot, T.title1 + 0.9, 0.15), "robot", [0, 6]);
  puff(116, 380, tt, T.brrr + 0.8); puff(120, 380, tt, T.hum + 0.65); puff(456, 380, tt, T.hum + 0.85);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  const tv = stepsAt(TEMP, tt);
  const hookOn = (tt > 0.05 && tt < 2.05) || (tt > 5.55 && tt < 7.65);
  bigCounter(tt, "BUSHALTESTELLE", (tv < 0 ? "–" + Math.abs(tv) : tv) + " °C", tt >= T.climax, lastStep(TEMP, tt), T.title1, !hookOn);
  hookLine(t, ["JEDER", "KENNT", "DIESEN", "EINEN."], 3, 0.1, 2.0, 163);
  hookLine(t, ["WARTE", "BIS", "MINUS", "1", "GRAD", "…"], 2, 5.6, 7.6, 163);
  titlePair(t, "GLEICHE KÄLTE.", "ANDERE ", "HOSE.", T.title1, T.title2, T.loop);
  stickerAt(t, ["WER", "BIST DU?"], T.sticker, T.stickerEnd, 790);
  grain(t);
};

window.exportEvents = function () {
  return {
    duration: DUR, steps: TEMP.map(d => d[0]).slice(1), climax: T.climax, title: [T.title1, T.title2],
    hookWords: [0, 1, 2, 3].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4, 5].map(i => 5.6 + i * 0.28)),
    pops: [T.brrr, T.schicht, T.warm, T.look + 0.2, T.look + 0.5], puffs: [T.brrr + 0.8, T.hum + 0.65, T.hum + 0.85],
    layers: TEMP.filter(([a, v], i) => i > 0 && Math.floor((16 - v) / 2.3) > Math.floor((16 - TEMP[i - 1][1]) / 2.3) && Math.floor((16 - v) / 2.3) <= 7).map(d => d[0]),
    hum: [T.hum, T.climax + 2.2], robot: T.robot, sticker: T.sticker, loop: T.loop,
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(13);
  return { duration: DUR };
};
