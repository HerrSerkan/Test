// "Echter Horror." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
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
const T = { flash: 1.95, door: 2.8, eyes: 3.2, bat: 4.0, ghost: 4.9, buh: 5.15, jaja: 5.75, wave: 6.4, hand: 6.9, yawn: 7.25,
  zoomIn: 7.8, b3: 8.0, b2: 8.35, b1: 8.65, zoomOut: 8.85, climax: 9.0, scream: 9.05, kabel: 9.7, dead: 10.1,
  title1: 10.3, title2: 10.8, sticker: 11.7, stickerEnd: 12.6, loop: 12.95 };
const PX = 330, PY = 524;                 // Figur (Kopf)
const GHOST_X = 214;

// Puls: ruhig, am Höhepunkt Sprung auf 180
function pulse(t) {
  if (t >= T.climax) return Math.round(lerp(62, 180, easeOut(ramp(t, T.climax, T.climax + 0.35))));
  return 62 + Math.round(Math.sin(t * 1.3) * 1.2);
}

// ------------------------------------------------------------ Zimmer
function room(t, dark) {
  let g = ctx.createLinearGradient(0, 280, 0, 760);
  g.addColorStop(0, "#1c1530"); g.addColorStop(1, "#2a1f44");
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, 480);
  // Fenster mit Vollmond, kahler Ast, Blitz
  const fl = ramp(t, T.flash, T.flash + 0.05) * (1 - ramp(t, T.flash + 0.12, T.flash + 0.4)) + (t > T.flash + 0.22 && t < T.flash + 0.3 ? 0.6 : 0);
  const wx = 392, wy = 316, ww = 150, wh = 170;
  ctx.fillStyle = "#3a2e55"; ctx.fillRect(wx - 8, wy - 8, ww + 16, wh + 16);
  ctx.fillStyle = fl > 0 ? `rgb(${lerp(18, 220, fl)},${lerp(22, 225, fl)},${lerp(52, 255, fl)})` : "#121636"; ctx.fillRect(wx, wy, ww, wh);
  circle(wx + 100, wy + 52, 26, "#f4ecc8"); glow(wx + 100, wy + 52, 70, "244,236,200", 0.3);
  ctx.strokeStyle = "#0b0a14"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(wx, wy + 120); ctx.lineTo(wx + 60, wy + 96); ctx.lineTo(wx + 96, wy + 110); ctx.moveTo(wx + 60, wy + 96); ctx.lineTo(wx + 80, wy + 70); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 96, wy + 110); ctx.lineTo(wx + 120, wy + 100); ctx.moveTo(wx + 80, wy + 70); ctx.lineTo(wx + 74, wy + 52); ctx.stroke();
  if (fl > 0.5) { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 40, wy); ctx.lineTo(wx + 30, wy + 40); ctx.lineTo(wx + 48, wy + 46); ctx.lineTo(wx + 34, wy + 96); ctx.stroke(); }
  ctx.fillStyle = "#3a2e55"; ctx.fillRect(wx + ww / 2 - 3, wy, 6, wh); ctx.fillRect(wx, wy + wh / 2 - 3, ww, 6);
  ctx.fillStyle = "#4a3c6b"; ctx.fillRect(wx - 14, wy + wh + 6, ww + 28, 10);
  // Kürbis auf der Fensterbank
  jackO(wx + 30, wy + wh - 6, t, 1);
  // Tür links (knarrt auf, Augen im Spalt)
  const dx = 40, dy = 404, dw = 96, dh = 326;
  ctx.fillStyle = "#08060f"; ctx.fillRect(dx, dy, dw, dh);
  const open = easeIO(ramp(t, T.door, T.door + 0.9)) * (t < T.loop ? 1 : 0);
  ctx.save(); ctx.translate(dx, dy);
  ctx.fillStyle = "#5a3e2c"; ctx.fillRect(0, 0, dw * (1 - open * 0.6), dh);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(dw * (1 - open * 0.6) - 6, 0, 6, dh);
  circle(dw * (1 - open * 0.6) - 16, dh * 0.52, 5, "#d9b44a");
  ctx.restore();
  const eyes = ramp(t, T.eyes, T.eyes + 0.2) * (1 - ramp(t, T.climax, T.climax + 0.2));
  if (eyes > 0 && Math.sin(t * 2.2) > -0.95) {
    for (const ex of [dx + dw - 26, dx + dw - 12]) { circle(ex, dy + 140, 4.5 * eyes, "#ffe14a"); glow(ex, dy + 140, 14, "255,225,74", 0.5 * eyes); }
  }
  // Poster
  ctx.fillStyle = "#c84a6a"; ctx.fillRect(176, 330, 90, 120);
  ctx.fillStyle = "#f2e6cf"; ctx.font = "900 14px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BOO!", 221, 390);
  // Boden
  ctx.fillStyle = "#16112a"; ctx.fillRect(0, 730, W, H - 730);
  g = ctx.createLinearGradient(0, 730, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0.1)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, 730, W, H - 730);
  if (dark > 0) { ctx.fillStyle = `rgba(4,3,10,${0.7 * dark})`; ctx.fillRect(0, 280, W, H - 280); }
}
function jackO(x, y, t, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#e8792e"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d0631f"; ctx.beginPath(); ctx.ellipse(0, 0, 9, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4b6b2f"; ctx.fillRect(-2, -22, 4, 8);
  const f = 0.75 + 0.25 * Math.sin(t * 17);
  ctx.fillStyle = `rgba(255,220,90,${f})`;
  ctx.beginPath(); ctx.moveTo(-11, -4); ctx.lineTo(-5, -10); ctx.lineTo(-2, -3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11, -4); ctx.lineTo(5, -10); ctx.lineTo(2, -3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-11, 4); ctx.lineTo(11, 4); ctx.lineTo(6, 9); ctx.lineTo(0, 6); ctx.lineTo(-6, 9); ctx.fill();
  ctx.restore();
  glow(x, y, 40 * s, "255,190,80", 0.25);
}
function bed() {
  ctx.fillStyle = "#3b2a5e"; rr(170, 560, 22, 170, 4); ctx.fill();                    // Kopfteil
  ctx.fillStyle = "#e9e4f2"; rr(196, 596, 70, 30, 12); ctx.fill();                   // Kissen
  ctx.fillStyle = "#6a4fb0"; rr(176, 640, 330, 64, 10); ctx.fill();                  // Decke
  ctx.fillStyle = "#5a42a0"; for (let i = 0; i < 4; i++) ctx.fillRect(200 + i * 76, 648, 4, 50);
  ctx.fillStyle = "#2a1f44"; ctx.fillRect(184, 704, 10, 26); ctx.fillRect(490, 704, 10, 26);
}

// Gespenst (eigene Form)
function ghost(x, y, t, a, scared) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const fl = Math.sin(t * 3) * 5;
  ctx.translate(x, y + fl);
  ctx.fillStyle = "#f2f0fa";
  ctx.beginPath(); ctx.moveTo(-40, 70); ctx.lineTo(-40, 0); ctx.arc(0, 0, 40, Math.PI, 0); ctx.lineTo(40, 70);
  for (let j = 0; j < 4; j++) ctx.quadraticCurveTo(40 - j * 20 - 10, 70 + (j % 2 ? -12 : 12) + Math.sin(t * 6 + j) * 3, 40 - (j + 1) * 20, 70);
  ctx.fill();
  ctx.fillStyle = "#2a2440";
  if (scared) { circle(-13, -4, 9, "#2a2440"); circle(13, -4, 9, "#2a2440"); circle(-11, -6, 3, "#fff"); circle(15, -6, 3, "#fff"); ctx.fillStyle = "#2a2440"; ctx.beginPath(); ctx.ellipse(0, 22, 7, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(-13, -4, 6, 9, 0, 0, Math.PI * 2); ctx.ellipse(13, -4, 6, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 20, 9, 7, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function bat(t) {
  const k = ramp(t, T.bat, T.bat + 1.1);
  if (k <= 0 || k >= 1) return;
  const x = lerp(600, -40, k), y = 360 + Math.sin(k * 12) * 20;
  const w = Math.sin(t * 40) * 10;
  ctx.fillStyle = "#0b0a14";
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 22, y - 8 + w); ctx.lineTo(x - 12, y + 2); ctx.lineTo(x - 4, y + 4);
  ctx.lineTo(x + 4, y + 4); ctx.lineTo(x + 12, y + 2); ctx.lineTo(x + 22, y - 8 + w); ctx.closePath(); ctx.fill();
  circle(x, y, 6, "#0b0a14");
}
function skeletonHand(t) {
  const k = easeOut(ramp(t, T.hand, T.hand + 0.4)) * (1 - ramp(t, T.climax, T.climax + 0.25));
  if (k <= 0) return;
  ctx.save(); ctx.translate(430, 712 - 26 * k);
  ctx.strokeStyle = "#ece6d6"; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) { const a = -1.9 + i * 0.28 + Math.sin(t * 6 + i) * 0.08; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke();
  ctx.restore();
}

// Figur im Bett mit Handy
function sleeper(t) {
  const sc = t >= T.climax && t < T.dead + 0.6;
  const searching = t > T.kabel && t < T.dead;
  let face = stateAt([[0, "neutral"], [T.flash, "neutral"], [T.buh, "smug"], [T.jaja - 0.05, "talk"], [T.jaja + 0.5, "neutral"], [T.yawn, "o"], [T.yawn + 0.5, "neutral"], [T.b1, "wide"], [T.climax, "shock"], [T.dead + 0.3, "worried"], [T.sticker, "worried"]], t);
  if (face === "o") face = "talk";
  const jump = sc ? Math.abs(Math.sin((t - T.climax) * 14)) * 10 * (1 - ramp(t, T.climax + 0.8, T.climax + 1.2)) : 0;
  const shake = searching ? Math.sin(t * 30) * 4 : 0;
  const arm = sc && !searching ? [{ side: -1, ang: 2.7, len: 44 }, { side: 1, ang: -2.7, len: 44 }]
    : searching ? [{ side: -1, ang: 1.2 + Math.sin(t * 18) * 0.6, len: 44 }, { side: 1, ang: -1.2 - Math.sin(t * 18) * 0.6, len: 44 }]
    : [{ side: -1, ang: -0.6, len: 38 }, { side: 1, ang: 0.6, len: 38 }];
  person({ col: "mint", x: PX + shake, y: PY - jump, r: 30, face, bodyH: 110, arm });
  // Haare stehen zu Berge beim Schrei
  if (sc) { ctx.strokeStyle = "#6fcca8"; ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(PX + shake + i * 8, PY - jump - 28); ctx.lineTo(PX + shake + i * 12, PY - jump - 48); ctx.stroke(); } }
  // Handy (leuchtet bis es ausgeht)
  const on = t < T.dead;
  if (!sc || searching) {
    const hx = PX + shake, hy = PY + 62;
    if (on) glow(hx, hy - 20, 70, "140,190,255", 0.4);
    ctx.fillStyle = "#14161c"; rr(hx - 13, hy - 20, 26, 42, 4); ctx.fill();
    ctx.fillStyle = on ? "rgba(160,205,255,0.95)" : "#0a0b10"; rr(hx - 10, hy - 17, 20, 36, 3); ctx.fill();
  }
  if (t > T.yawn && t < T.yawn + 0.6) { ctx.fillStyle = "#f6f2e6"; ctx.font = "900 12px InterX"; ctx.textAlign = "center"; ctx.fillText("gääähn", PX + 44, PY - 40); }
}

// Nahaufnahme: das Handy füllt das Bild
function phoneClose(t, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.fillStyle = "rgba(6,5,12,0.92)"; ctx.fillRect(0, 280, W, 480);
  const s = lerp(0.25, 1, easeOut(k));
  ctx.translate(288, 520); ctx.scale(s, s);
  ctx.fillStyle = "#14161c"; rr(-118, -230, 236, 460, 34); ctx.fill();
  ctx.fillStyle = "#0e1220"; rr(-106, -218, 212, 436, 26); ctx.fill();
  // Feed
  ctx.save(); rr(-106, -218, 212, 436, 26); ctx.clip();
  const off = (t * 160) % 150;
  for (let i = -1; i < 4; i++) {
    const y = -170 + i * 150 - off;
    ctx.fillStyle = ["#3b2f78", "#7a2e4a", "#2e5a7a", "#5a4a2e"][(i + 4 + Math.floor(t * 160 / 150)) % 4];
    rr(-92, y, 184, 120, 12); ctx.fill();
    circle(-72, y + 104, 8, "#ff5c8a"); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(-56, y + 100, 60, 7);
  }
  ctx.restore();
  // Statuszeile: Uhrzeit + Akku
  const pct = t >= T.b1 ? 1 : t >= T.b2 ? 2 : 3;
  const red = pct === 1;
  ctx.fillStyle = "rgba(14,18,32,0.9)"; ctx.fillRect(-106, -218, 212, 34);
  ctx.fillStyle = "#e9ebf1"; ctx.font = "700 15px InterX"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("23:59", -88, -200);
  const blink = red ? (Math.floor(t * 8) % 2 ? 1 : 0.3) : 1;
  ctx.globalAlpha = Math.min(1, k * 1.5) * blink;
  ctx.strokeStyle = red ? "#ff4b4b" : "#e9ebf1"; ctx.lineWidth = 2; rr(40, -208, 34, 16, 4); ctx.stroke();
  ctx.fillStyle = red ? "#ff4b4b" : "#e9ebf1"; ctx.fillRect(75, -203, 3, 6); ctx.fillRect(43, -205, Math.max(2, 28 * pct / 100 * 8), 10);
  ctx.font = "900 14px InterX"; ctx.textAlign = "right"; ctx.fillText(pct + " %", 36, -199);
  ctx.globalAlpha = Math.min(1, k * 1.5);
  // Warnung bei 1 %
  const w = back(ramp(t, T.b1, T.b1 + 0.2));
  if (w > 0) {
    ctx.save(); ctx.scale(w, w);
    ctx.fillStyle = "rgba(245,245,250,0.97)"; rr(-92, -60, 184, 110, 18); ctx.fill();
    ctx.fillStyle = "#ff3b3b"; ctx.font = "900 34px InterX"; ctx.textAlign = "center"; ctx.fillText("1 %", 0, -20);
    ctx.fillStyle = "#1d1d22"; ctx.font = "700 14px InterX"; ctx.fillText("Akku fast leer", 0, 14);
    ctx.fillStyle = "#7a7f8c"; ctx.font = "700 11px InterX"; ctx.fillText("Ladekabel anschließen", 0, 34);
    ctx.restore();
  }
  ctx.restore();
}
// rote Herz-Anzeige neben dem Puls
function heartIcon(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-14, -2, -8, -14, 0, -6); ctx.bezierCurveTo(8, -14, 14, -2, 0, 8); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#07060c"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.climax, T.title1 + 0.6);
  const dark = ramp(tt, T.dead, T.dead + 0.15);
  room(tt, 0);
  bat(tt);
  // Gespenst steigt hinter dem Bett auf, flieht beim Schrei
  const gUp = easeOut(ramp(tt, T.ghost, T.ghost + 0.5));
  let gx = GHOST_X + (tt > T.wave && tt < T.climax ? lerp(0, 70, easeIO(ramp(tt, T.wave, T.wave + 0.4))) : 0), gy = lerp(690, 470, gUp);
  if (tt >= T.climax) { const f = easeIO(ramp(tt, T.climax + 0.15, T.climax + 0.8)); gx = lerp(GHOST_X + 70, 640, f); gy = lerp(470, 300, f); }
  ghost(gx, gy, tt, gUp * (tt < T.climax + 0.8 ? 1 : 0), tt >= T.climax);
  bed();
  sleeper(tt);
  skeletonHand(tt);
  if (dark > 0) { ctx.fillStyle = `rgba(4,3,10,${0.72 * dark})`; ctx.fillRect(0, 280, W, H - 280); jackO(422, 480, tt, 1); }
  // Nahaufnahme Handy
  const zk = ramp(tt, T.zoomIn, T.zoomIn + 0.25) * (1 - ramp(tt, T.zoomOut, T.zoomOut + 0.12));
  phoneClose(tt, zk);

  bubble("BUUUH!", 222, 420, popIn(tt, T.buh, T.buh + 0.7, 0.12), "robot", [0, 6]);
  bubble("ja ja.", 360, 440, popIn(tt, T.jaja, T.jaja + 0.6), "speech", [-10, 6]);
  bubble("hallooo?", 250, 420, popIn(tt, T.wave + 0.1, T.wave + 0.8), "speech", [10, 6]);
  bubble("NEEEEIN!!", 330, 430, popIn(tt, T.scream, T.kabel, 0.1), "robot", [0, 6]);
  bubble("WO IST DAS LADEKABEL?!", 300, 430, popIn(tt, T.kabel, T.dead + 0.5, 0.15), "speech", [20, 6]);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  const hookOn = (tt > 0.05 && tt < 2.15) || (tt > 5.5 && tt < 7.75);
  const p = pulse(tt);
  bigCounter(tt, "PULS", `${p}`, tt >= T.climax, tt >= T.climax ? T.climax : -9, T.title1, !hookOn);
  if (tt < T.title1) {
    const beat = 1 + 0.18 * Math.max(0, Math.sin(tt * (p / 60) * Math.PI * 2)) ** 8;
    const fade = 1 - ramp(tt, T.title1 - 0.2, T.title1 + 0.1);
    ctx.globalAlpha = fade; heartIcon(366 + (p >= 100 ? 14 : 0), 206, 1.3 * beat, tt >= T.climax ? "#ff4b4b" : "#ff6b81"); ctx.globalAlpha = 1;
  }
  hookLine(t, ["WAS", "IST", "DAS", "GRUSELIGSTE", "AN", "HALLOWEEN?"], 3, 0.1, 2.1, 163);
  hookLine(t, ["NICHT", "DER", "GEIST,", "SONDERN", "…"], 3, 5.6, 7.7, 163);
  titlePair(t, "ECHTER HORROR.", "", "1 % AKKU.", T.title1, T.title2, T.loop);
  stickerAt(t, ["KENNST", "DU'S?"], T.sticker, T.stickerEnd, 800);
  grain(t);
};

window.exportEvents = function () {
  return {
    duration: DUR, flash: T.flash, door: T.door, eyes: T.eyes, bat: T.bat, ghost: T.ghost, buh: T.buh, jaja: T.jaja, wave: T.wave,
    hand: T.hand, yawn: T.yawn, zoomIn: T.zoomIn, battery: [T.b3, T.b2, T.b1], zoomOut: T.zoomOut, climax: T.climax, kabel: T.kabel,
    dead: T.dead, title: [T.title1, T.title2], sticker: T.sticker, loop: T.loop,
    hookWords: [0, 1, 2, 3, 4, 5].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4].map(i => 5.6 + i * 0.28)),
  };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(23);
  return { duration: DUR };
};
