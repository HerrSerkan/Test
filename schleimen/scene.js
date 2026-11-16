// "Kampf, Flucht, Erstarren – oder Schleimen." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Grundformen (Gesichter, Schilder, Blasen) aus mensa/scene.js.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 11.4;
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
  // passt die Zeile nicht in die Breite, Schrift verkleinern
  const full = ctx.measureText(words.join(" ")).width;
  if (full > 500) ctx.font = `900 ${25 * 500 / full}px InterX`;
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
const T = { door: 0.8, eyes: 1.4, buh: 2.0, flee: 2.15, gone: 2.8, ice: 2.35, punch: 3.0, bonk: 3.2, dizzyEnd: 4.0,
  compliment: 4.35, blush: 4.8, reveal: 6.4, candy: 7.4, peek: 8.5, sticker: 9.6, stickerEnd: 10.6, loop: 11.0 };
const X = { flucht: 74, kampf: 192, wer: 312, eis: 440 };
const FY = 718;                          // Füße / Veranda
const GX = 300;                          // Gespenst

// ------------------------------------------------------------ Spukhaus
function house(t) {
  // Himmel + Mond
  let g = ctx.createLinearGradient(0, 270, 0, 420);
  g.addColorStop(0, "#1a1030"); g.addColorStop(1, "#2c1a48");
  ctx.fillStyle = g; ctx.fillRect(0, 270, W, 150);
  circle(450, 318, 30, "#f4ecc8"); glow(450, 318, 80, "244,236,200", 0.3);
  // Fledermäuse am Himmel
  for (let i = 0; i < 2; i++) {
    const x = (t * 60 + i * 260) % 640 - 40, y = 300 + i * 22 + Math.sin(t * 3 + i) * 6, w = Math.sin(t * 30 + i) * 5;
    ctx.fillStyle = "#0b0a14"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y - 4 + w); ctx.lineTo(x - 5, y + 2); ctx.lineTo(x + 5, y + 2); ctx.lineTo(x + 12, y - 4 + w); ctx.fill();
  }
  // Fassade (Holzbretter)
  ctx.fillStyle = "#3a2852"; ctx.fillRect(0, 380, W, FY - 380);
  ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 1;
  for (let y = 392; y < FY; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Dachkante mit Spinnweben
  ctx.fillStyle = "#24183a"; ctx.fillRect(0, 372, W, 14);
  ctx.strokeStyle = "rgba(230,230,240,0.35)"; ctx.lineWidth = 1;
  for (const [x, dir] of [[0, 1], [W, -1]]) for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.arc(x, 386, k * 14, dir > 0 ? 0 : Math.PI / 2, dir > 0 ? Math.PI / 2 : Math.PI); ctx.stroke(); }
  // Fenster mit warmem Licht
  for (const x of [70, 470]) {
    ctx.fillStyle = "#2a1b3e"; ctx.fillRect(x - 40, 420, 80, 96);
    ctx.fillStyle = "#f2a640"; ctx.fillRect(x - 34, 426, 68, 84);
    glow(x, 468, 80, "242,166,64", 0.25);
    ctx.fillStyle = "#2a1b3e"; ctx.fillRect(x - 2, 426, 4, 84); ctx.fillRect(x - 34, 466, 68, 4);
  }
  // Tür (geht auf, Augen im Dunkeln)
  const open = easeIO(ramp(t, T.door, T.door + 0.5)) * (t < T.loop ? 1 : 0);
  ctx.fillStyle = "#0a0712"; rr(GX - 46, 470, 92, FY - 470, [46, 46, 0, 0]); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(GX - 46, 470, 92, FY - 470, [46, 46, 0, 0]); ctx.clip();
  ctx.fillStyle = "#7a2e2e"; ctx.fillRect(GX - 46, 470, 92 * (1 - open * 0.85), FY - 470);
  ctx.restore();
  const eyes = ramp(t, T.eyes, T.eyes + 0.2) * (1 - ramp(t, T.buh - 0.1, T.buh));
  if (eyes > 0) for (const ex of [GX - 9, GX + 9]) { circle(ex, 540, 3.5 * eyes, "#fff"); glow(ex, 540, 10, "255,255,255", 0.5 * eyes); }
  // Lampe neben der Tür
  ctx.fillStyle = "#2a1b3e"; ctx.fillRect(GX + 64, 492, 16, 22); circle(GX + 72, 503, 6, "#ffe9a0"); glow(GX + 72, 503, 40, "255,233,160", 0.4);
  // Veranda + Grabsteine + Kürbisse
  ctx.fillStyle = "#2a1f3a"; ctx.fillRect(0, FY, W, H - FY);
  ctx.fillStyle = "#4a3a62"; ctx.fillRect(0, FY, W, 5);
  g = ctx.createLinearGradient(0, FY, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, FY, W, H - FY);
  for (const x of [120, 470]) { ctx.fillStyle = "#3d3550"; rr(x - 16, 790, 32, 40, [16, 16, 2, 2]); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.font = "900 9px InterX"; ctx.textAlign = "center"; ctx.fillText("RIP", x, 812); }
  jack(18, 750, t); jack(552, 752, t);
}
function jack(x, y, t) {
  ctx.fillStyle = "#e8792e"; ctx.beginPath(); ctx.ellipse(x, y, 18, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4b6b2f"; ctx.fillRect(x - 2, y - 17, 4, 6);
  const f = 0.75 + 0.25 * Math.sin(t * 17 + x);
  ctx.fillStyle = `rgba(255,220,90,${f})`;
  ctx.beginPath(); ctx.moveTo(x - 9, y - 3); ctx.lineTo(x - 4, y - 8); ctx.lineTo(x - 1, y - 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 9, y - 3); ctx.lineTo(x + 4, y - 8); ctx.lineTo(x + 1, y - 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 9, y + 3); ctx.lineTo(x + 9, y + 3); ctx.lineTo(x + 5, y + 7); ctx.lineTo(x - 5, y + 7); ctx.fill();
}

// ------------------------------------------------------------ Gespenst (eigene Form)
function ghost(t) {
  const up = back(ramp(t, T.buh, T.buh + 0.3));
  if (up <= 0) return;
  const dizzy = t > T.bonk && t < T.dizzyEnd;
  const blush = t > T.blush;
  const x = GX + (dizzy ? Math.sin(t * 12) * 6 : 0), y = lerp(560, 500, up) + Math.sin(t * 3) * 5;
  ctx.save(); ctx.translate(x, y); ctx.scale(up, up);
  ctx.fillStyle = "#f2f0fa";
  ctx.beginPath(); ctx.moveTo(-34, 50); ctx.lineTo(-34, 0); ctx.arc(0, 0, 34, Math.PI, 0); ctx.lineTo(34, 50);
  for (let j = 0; j < 4; j++) ctx.quadraticCurveTo(34 - j * 17 - 8.5, 50 + (j % 2 ? -10 : 10), 34 - (j + 1) * 17, 50);
  ctx.fill();
  // Arme
  ctx.beginPath(); ctx.ellipse(-36, 18, 10, 6, -0.6, 0, Math.PI * 2); ctx.ellipse(36, 18, 10, 6, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a2440"; ctx.strokeStyle = "#2a2440"; ctx.lineWidth = 3; ctx.lineCap = "round";
  if (dizzy) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 12 - 5, -9); ctx.lineTo(s * 12 + 5, 1); ctx.moveTo(s * 12 + 5, -9); ctx.lineTo(s * 12 - 5, 1); ctx.stroke(); } }
  else if (blush) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 12, -2, 5, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } }
  else { ctx.beginPath(); ctx.ellipse(-12, -4, 5, 8, 0, 0, Math.PI * 2); ctx.ellipse(12, -4, 5, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  if (t < T.compliment) { ctx.beginPath(); ctx.ellipse(0, 18, 8, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, 12, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  if (blush) { ctx.fillStyle = "rgba(255,120,150,0.6)"; circle(-22, 8, 6, "rgba(255,120,150,0.6)"); circle(22, 8, 6, "rgba(255,120,150,0.6)"); }
  ctx.restore();
  // Schwindel-Sterne
  if (dizzy) { ctx.fillStyle = "#ffd36e"; for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; star(x + Math.cos(a) * 30, y - 44 + Math.sin(a) * 8, 6); } }
}

// ------------------------------------------------------------ Kinder in Kostümen
function bucket(x, y, n) {
  ctx.fillStyle = "#e8792e"; ctx.beginPath(); ctx.ellipse(x, y, 13, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1d1d22"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - 6, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  for (let i = 0; i < n; i++) circle(x - 8 + (i % 5) * 4, y - 9 - Math.floor(i / 5) * 4, 2.6, ["#ff5c8a", "#5cc98a", "#ffd36e", "#7fb0f2"][i % 4]);
}
function catEars(x, y, r) { ctx.fillStyle = "#1d1d22"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * r * 0.3, y - r * 0.85); ctx.lineTo(x + s * r * 0.8, y - r * 1.35); ctx.lineTo(x + s * r * 0.9, y - r * 0.5); ctx.fill(); } }
function horns(x, y, r) { ctx.fillStyle = "#d9443c"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * r * 0.35, y - r * 0.8); ctx.quadraticCurveTo(x + s * r * 0.9, y - r * 1.3, x + s * r * 0.75, y - r * 1.5); ctx.lineTo(x + s * r * 0.6, y - r * 0.7); ctx.fill(); } }
function witchHat(x, y, r) {
  ctx.fillStyle = "#2a1b3e"; ctx.beginPath(); ctx.ellipse(x, y - r * 0.75, r * 1.25, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - r * 0.6, y - r * 0.8); ctx.lineTo(x + r * 0.2, y - r * 2.0); ctx.lineTo(x + r * 0.6, y - r * 0.8); ctx.fill();
  ctx.fillStyle = "#9a6af0"; ctx.fillRect(x - r * 0.58, y - r * 0.98, r * 1.16, 5);
}
function iceBlock(x, k, t) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.65 * k;
  ctx.fillStyle = "#bfe6ff"; rr(x - 42, FY - 168 * k, 84, 168 * k, 8); ctx.fill();
  ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = "#e9f7ff"; ctx.lineWidth = 2; rr(x - 42, FY - 168 * k, 84, 168 * k, 8); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(x - 32, FY - 160 * k, 8, 60 * k);
  ctx.restore();
}

function kids(t) {
  const r = 26, hy = 590;
  const scared = t > T.buh && t < T.buh + 0.6;
  // Flucht: rennt nach links weg, lugt später zurück
  if (t < T.gone || t > T.peek) {
    let x = X.flucht, face = "smile";
    if (t > T.buh) face = "shock";
    if (t > T.flee && t < T.gone) x = lerp(X.flucht, -80, easeIO(ramp(t, T.flee, T.gone)));
    if (t > T.peek) { x = lerp(-40, 4, easeOut(ramp(t, T.peek, T.peek + 0.3))); face = "wide"; }
    const bob = t > T.flee && t < T.gone ? Math.abs(Math.sin(t * 20)) * 6 : 0;
    person({ col: "peach", x, y: hy - bob, r, face, bodyH: 98, look: t > T.peek ? 1 : 0 });
    catEars(x, hy - bob, r);
    if (t < T.flee) bucket(x + 26, 690, 4);
  }
  // fliegende Bonbons beim Wegrennen
  const fk = ramp(t, T.flee, T.flee + 0.7);
  if (fk > 0 && fk < 1) for (let i = 0; i < 6; i++) circle(X.flucht + 20 + i * 8, 670 - Math.sin(fk * Math.PI) * (40 + i * 6) + fk * 40, 3, ["#ff5c8a", "#5cc98a", "#ffd36e"][i % 3]);
  // Kampf: boxt das Gespenst
  const punch = t > T.punch && t < T.punch + 0.5;
  const kf = stateAt([[0, "smile"], [T.buh, "shock"], [T.buh + 0.5, "worried"], [T.punch - 0.1, "talk"], [T.punch + 0.5, "smug"], [T.candy, "worried"], [T.candy + 0.6, "neutral"]], t);
  person({ col: "coral", x: X.kampf, y: hy, r, face: kf, bodyH: 98,
    arm: punch ? [{ side: 1, ang: -1.75, len: 58 * (0.6 + 0.4 * Math.sin(Math.PI * ramp(t, T.punch, T.punch + 0.5))) }] : null });
  horns(X.kampf, hy, r);
  bucket(X.kampf - 26, 690, 4);
  // ??? (Hexenhut): macht Komplimente, bekommt Extra-Süßes
  const wf = stateAt([[0, "smile"], [T.buh, "shock"], [T.buh + 0.6, "neutral"], [T.compliment - 0.05, "happyTalk"], [T.compliment + 1.0, "happy"], [T.candy, "laugh"], [T.candy + 1.2, "happy"]], t);
  person({ col: "lilac", x: X.wer, y: hy, r, face: wf, bodyH: 98, blush: t > T.compliment ? 0.6 : 0,
    arm: t > T.compliment && t < T.compliment + 1.2 ? [{ side: -1, ang: 2.5 + Math.sin(t * 10) * 0.2, len: 44 }] : null });
  witchHat(X.wer, hy, r);
  const extra = Math.round(4 + 10 * ramp(t, T.candy, T.candy + 1.0));
  bucket(X.wer + 26, 690, extra);
  // Bonbonregen ins Eimerchen
  const ck = ramp(t, T.candy, T.candy + 1.0);
  if (ck > 0 && ck < 1) for (let i = 0; i < 8; i++) { const p = (ck * 2 + i / 8) % 1; circle(lerp(GX, X.wer + 26, p), lerp(540, 680, p) - Math.sin(p * Math.PI) * 40, 3, ["#ff5c8a", "#5cc98a", "#ffd36e", "#7fb0f2"][i % 4]); }
  // Erstarren: wird zum Eisblock
  const ice = easeOut(ramp(t, T.ice, T.ice + 0.45));
  const ef = stateAt([[0, "smile"], [T.buh, "shock"], [T.ice + 0.3, "wide"]], t);
  person({ col: "sky", x: X.eis + (ice > 0.9 ? Math.sin(t * 40) * 1.2 : 0), y: hy, r, face: ef, bodyH: 98 });
  bucket(X.eis - 26, 690, 4);
  iceBlock(X.eis, ice, t);
  // BONK-Stern
  const b = popIn(t, T.bonk, T.bonk + 0.45, 0.12);
  if (b > 0) {
    ctx.save(); ctx.translate(GX - 30, 500); ctx.scale(b, b); ctx.rotate(-0.2);
    ctx.fillStyle = "#ffd36e"; star(0, 0, 30);
    ctx.fillStyle = "#1d1d22"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BONK!", 0, 1);
    ctx.restore();
  }
  // Herzchen beim Gespenst
  for (const h0 of [T.blush, T.blush + 0.4, T.candy + 0.2]) heart(GX + 30, 470, t, h0);
}

// ------------------------------------------------------------ Titel (Hook): Zeile 1 Wort für Wort, Zeile 2 wechselt
function hookTitle(t) {
  const fade = 1 - ramp(t, T.loop - 0.3, T.loop);
  ctx.save(); ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.font = "900 33px InterX"; ctx.letterSpacing = "-1px";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  const words = ["KAMPF,", "FLUCHT,", "ERSTARREN"];
  const sp = ctx.measureText(" ").width, ws = words.map(w => ctx.measureText(w).width);
  let x = 288 - (ws.reduce((a, b) => a + b, 0) + sp * 2) / 2;
  words.forEach((w, i) => {
    const p = ramp(t, 0.05 + i * 0.28, 0.23 + i * 0.28);
    if (p > 0) { ctx.globalAlpha = easeOut(p) * fade; ctx.fillStyle = "#f5f1e8"; ctx.fillText(w, x, 196 + (1 - easeOut(p)) * 8); }
    x += ws[i] + sp;
  });
  const sw = ramp(t, T.reveal, T.reveal + 0.25);
  const a1 = back(ramp(t, 0.9, 1.2)) * (1 - sw), a2 = back(ramp(t, T.reveal + 0.1, T.reveal + 0.4));
  ctx.textAlign = "center"; ctx.fillStyle = "#f6b23a";
  if (a1 > 0) { ctx.globalAlpha = clamp(a1) * fade; ctx.save(); ctx.translate(288, 238); ctx.scale(a1, a1); ctx.fillText("ODER …?", 0, 0); ctx.restore(); }
  if (a2 > 0) {
    ctx.globalAlpha = clamp(a2) * fade; ctx.save(); ctx.translate(288, 238); ctx.scale(a2, a2); ctx.fillText("ODER SCHLEIMEN.", 0, 0); ctx.restore();
    const sp2 = ramp(t, T.reveal + 0.1, T.reveal + 0.9);
    if (sp2 < 1) { ctx.globalAlpha = Math.sin(Math.PI * sp2) * fade; ctx.fillStyle = "#ffe9a0"; for (const [dx, dy] of [[-150, -30], [150, -24], [-120, 6], [140, 8]]) star(288 + dx, 230 + dy, 6); }
  }
  ctx.restore();
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0d0a16"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.buh, T.buh + 0.5);
  house(tt);
  ghost(tt);
  kids(tt);

  label("FLUCHT", X.flucht < 0 ? 40 : X.flucht, 746, 1);
  label("KAMPF", X.kampf, 746);
  flipLabel(tt, X.wer, 746, "???", "SCHLEIMEN", T.reveal);
  label("ERSTARREN", X.eis, 746);

  bubble("BUH!", GX, 446, popIn(tt, T.buh, T.buh + 0.9, 0.12), "robot", [0, 6]);
  bubble("Tolles Kostüm!", 330, 446, popIn(tt, T.compliment, T.compliment + 1.4), "speech", [-10, 6]);
  bubble("Danke!! Nimm mehr!", 300, 446, popIn(tt, T.candy, T.candy + 1.1), "speech", [0, 6]);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  hookTitle(t);
  stickerAt(t, ["WER", "BIST DU?"], T.sticker, T.stickerEnd, 820);
  grain(t);
};

window.exportEvents = function () {
  return { duration: DUR, door: T.door, eyes: T.eyes, buh: T.buh, flee: [T.flee, T.gone], ice: T.ice, punch: T.punch, bonk: T.bonk,
    compliment: T.compliment, blush: T.blush, reveal: T.reveal, candy: T.candy, peek: T.peek, sticker: T.sticker, loop: T.loop,
    titleWords: [0.05, 0.33, 0.61, 0.9] };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(29);
  return { duration: DUR };
};
