// "Gleiche Serie. 47 Minuten später." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Grundformen (Gesichter, Schilder, Blasen) aus mensa/scene.js.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 13.0;
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
const CNT = [[0, 0], [0.5, 5], [1.0, 12], [1.5, 23], [2.0, 35], [2.5, 40], [3.5, 44], [4.0, 59], [4.5, 75], [5.5, 87], [6.0, 106], [6.5, 127],
  [7.0, 149], [7.5, 173], [8.0, 198], [8.5, 224], [9.0, 251], [9.5, 280], [9.9, 284]];
const T = { pickS: 0.3, trailer: 2.5, trailerEnd: 3.2, rating: 4.5, ratingEnd: 5.2, laugh: 3.6, cry: 6.8, ende: 9.0, sleep: 9.4, pickM: 9.9,
  title1: 10.3, title2: 10.8, sticker: 11.8, stickerEnd: 12.65, loop: 12.95 };
const MX = 150, SX = 426;
const THUMB = ["#d9443c", "#3b7dd8", "#2f9d6a", "#e8a33a", "#8a4ad9", "#d94a8a", "#3ab0c8", "#c8743a"];

function clock(t) {
  const m = Math.min(47, Math.floor(t / T.pickM * 46) + 1);
  return "21:" + String(m).padStart(2, "0");
}

// ------------------------------------------------------------ Wohnzimmer
function room(t) {
  let g = ctx.createLinearGradient(0, 280, 0, 760);
  g.addColorStop(0, "#1d1a2e"); g.addColorStop(1, "#28233e");
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, 480);
  // Pflanzen an den Rändern
  for (const x of [22, 554]) {
    ctx.fillStyle = "#3a2a22"; rr(x - 14, 680, 28, 40, 4); ctx.fill();
    ctx.fillStyle = "#2f6b4a"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + (i - 2) * 6, 664 - (i % 2) * 14, 7, 20, (i - 2) * 0.35, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = "#16132a"; ctx.fillRect(0, 728, W, H - 728);
  g = ctx.createLinearGradient(0, 728, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0.1)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, 728, W, H - 728);
}
function armchair(x, col, dark) {
  ctx.fillStyle = dark; rr(x - 92, 548, 184, 150, 26); ctx.fill();               // Lehne
  ctx.fillStyle = col; rr(x - 104, 618, 40, 100, 16); ctx.fill(); rr(x + 64, 618, 40, 100, 16); ctx.fill();   // Armlehnen
}
function armchairFront(x, col) {
  ctx.fillStyle = col; rr(x - 70, 660, 140, 58, 12); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(x - 70, 708, 140, 10);
}

// ------------------------------------------------------------ Bildschirme
function screenFrame(x, y, w, h) {
  ctx.fillStyle = "#0c0d14"; rr(x - w / 2 - 6, y - 6, w + 12, h + 12, 8); ctx.fill();
}
function maxScreen(t) {
  const x = MX, y = 330, w = 200, h = 112;
  screenFrame(x, y, w, h);
  ctx.save(); rr(x - w / 2, y, w, h, 4); ctx.clip();
  ctx.fillStyle = "#141625"; ctx.fillRect(x - w / 2, y, w, h);
  if (t >= T.pickM) {                                                  // endlich gewählt: Folge 1 startet
    const k = ramp(t, T.pickM, T.pickM + 0.4);
    ctx.fillStyle = "#e8a33a"; ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(x - w / 2, y + h - 10, w, 10);
    ctx.fillStyle = "#ff4b4b"; ctx.fillRect(x - w / 2, y + h - 10, w * 0.03 * k, 10);
    ctx.fillStyle = "#1d1d22"; ctx.font = "900 18px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("FOLGE 1", x, y + 48);
    heartShape(x, y + 26, 0.7 * back(k), "#ff4b4b");
  } else if ((t > T.trailer && t < T.trailerEnd)) {                    // Trailer
    ctx.fillStyle = "#1b2140"; ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "900 11px InterX"; ctx.textAlign = "left"; ctx.fillText("TRAILER", x - 90, y + 16);
    circle(x + Math.sin(t * 3) * 20, y + 64, 9, "#e9ebf1");
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(x - 90, y + h - 14, 180, 4);
    ctx.fillStyle = "#fff"; ctx.fillRect(x - 90, y + h - 14, 180 * ramp(t, T.trailer, T.trailerEnd), 4);
  } else {                                                             // Karussell aus Vorschaubildern
    const speed = 30 + 120 * ramp(t, 0, 9);
    const off = (t * speed) % 62;
    for (let i = -1; i < 5; i++) {
      const tx = x - w / 2 + 4 + i * 62 - off;
      const idx = (i + Math.floor(t * speed / 62) + 80) % THUMB.length;
      ctx.fillStyle = THUMB[idx]; rr(tx, y + 18, 56, 76, 6); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(tx + 8, y + 74, 40, 5);
      circle(tx + 28, y + 46, 9, "rgba(255,255,255,0.3)");
    }
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; rr(x - 30, y + 14, 60, 84, 8); ctx.stroke();   // Auswahlrahmen
    if (t > T.rating && t < T.ratingEnd) {
      ctx.fillStyle = "rgba(10,12,20,0.85)"; rr(x - 58, y + 34, 116, 40, 8); ctx.fill();
      ctx.fillStyle = "#ffd36e"; for (let i = 0; i < 5; i++) star(x - 40 + i * 20, y + 50, i < 4 ? 7 : 4);
      ctx.fillStyle = "#e9ebf1"; ctx.font = "700 10px InterX"; ctx.textAlign = "center"; ctx.fillText("8,6 / 10 … hmm", x, y + 66);
    }
  }
  ctx.restore();
}
function satScreen(t) {
  const x = SX, y = 330, w = 200, h = 112;
  screenFrame(x, y, w, h);
  ctx.save(); rr(x - w / 2, y, w, h, 4); ctx.clip();
  if (t >= T.ende) {
    ctx.fillStyle = "#08090e"; ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = "#e9ebf1"; ctx.font = "900 20px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("ENDE", x, y + 40);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 4; i++) ctx.fillRect(x - 40, y + 60 + i * 10 - ((t - T.ende) * 14) % 10, 80, 3);
  } else {
    // eine Szene läuft: Sonnenuntergang mit zwei Figuren
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#f2a35a"); g.addColorStop(1, "#d9607a");
    ctx.fillStyle = g; ctx.fillRect(x - w / 2, y, w, h);
    circle(x, y + 70, 22, "#ffe0a0");
    ctx.fillStyle = "#3a1f2e"; for (const dx of [-20, 20]) { circle(x + dx, y + 70, 7, "#3a1f2e"); rr(x + dx - 7, y + 76, 14, 24, 5); ctx.fill(); }
    heartShape(x, y + 52, 0.45 + 0.05 * Math.sin(t * 6), "#ff5c8a");
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(x - w / 2, y + h - 8, w, 8);
    ctx.fillStyle = "#ff4b4b"; ctx.fillRect(x - w / 2, y + h - 8, w * ramp(t, T.pickS, T.ende), 8);
  }
  ctx.restore();
}
function heartShape(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-22, -4, -12, -22, 0, -10); ctx.bezierCurveTo(12, -22, 22, -4, 0, 12); ctx.fill();
  ctx.restore();
}
function counterSmall(x, n, t, lastT) {
  const pop = 1 + (1 - easeOut(ramp(t, lastT, lastT + 0.15))) * 0.2;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = "700 10px InterX"; ctx.letterSpacing = "2px"; ctx.fillStyle = "rgba(240,240,245,0.6)"; ctx.fillText("GECHECKT", x, 296);
  ctx.translate(x, 322); ctx.scale(pop, pop); ctx.letterSpacing = "-1px";
  ctx.font = "900 26px InterX"; ctx.fillStyle = "#f5f1e8"; ctx.fillText(String(n), 0, 0);
  ctx.restore();
}
function popcorn(x, y, k) {
  ctx.fillStyle = "#f4f1ea"; ctx.beginPath(); ctx.moveTo(x - 20, y - 26); ctx.lineTo(x + 20, y - 26); ctx.lineTo(x + 15, y + 6); ctx.lineTo(x - 15, y + 6); ctx.fill();
  ctx.fillStyle = "#d9443c"; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 17 + i * 10, y - 26); ctx.lineTo(x - 13 + i * 10, y - 26); ctx.lineTo(x - 11 + i * 9, y + 6); ctx.lineTo(x - 14 + i * 9, y + 6); ctx.fill(); }
  const n = Math.round(9 * k);
  for (let i = 0; i < n; i++) circle(x - 14 + (i % 5) * 7, y - 30 - Math.floor(i / 5) * 6, 5, "#fff3c4");
}

// ------------------------------------------------------------ Figuren
function people(t) {
  // Maximierer: klickt sich durch, wird immer genervter, isst dabei alles auf
  const mf = stateAt([[0, "neutral"], [1.5, "worried"], [T.trailer, "wide"], [T.trailerEnd, "worried"], [T.rating, "neutral"], [T.ratingEnd, "worried"], [7.0, "wide"], [8.2, "worried"], [T.pickM, "happy"], [T.title2, "smile"]], t);
  const click = t < T.pickM ? Math.sin(t * 14) * 0.15 : 0;
  armchair(MX, "#3b4f88", "#2e3f72");
  person({ col: "sky", x: MX, y: 566, r: 30, face: mf, bodyH: 100, arm: [{ side: 1, ang: -0.9 + click, len: 44 }] });
  armchairFront(MX, "#3b4f88");
  popcorn(MX - 6, 690, 1 - ramp(t, 0.5, 9.5));
  // Fernbedienung
  ctx.fillStyle = "#1d1d22"; rr(MX + 40, 612, 10, 26, 3); ctx.fill(); circle(MX + 45, 618, 2, "#ff4b4b");
  // Satisficer: wählt sofort, lacht, weint, schläft nach dem Ende ein
  const asleep = t >= T.sleep;
  const sf = stateAt([[0, "smile"], [T.pickS, "happy"], [1.2, "smile"], [T.laugh, "laugh"], [4.6, "smile"], [T.cry, "worried"], [7.6, "smile"], [T.ende, "happy"]], t);
  armchair(SX, "#a8604a", "#8a4e3c");
  const sag = easeIO(ramp(t, T.sleep, T.sleep + 0.4));
  person({ col: asleep ? "white" : "peach", x: SX, y: 566 + sag * 10, r: 30, face: asleep ? "happy" : sf, bodyH: 100, lean: sag * 0.12 });
  if (asleep) { ctx.fillStyle = "#26262a"; for (const s of [-1, 1]) ctx.fillRect(SX + s * 10 - 6 + sag * 4, 562 + sag * 10, 12, 3); }
  armchairFront(SX, "#a8604a");
  popcorn(SX + 6, 690, 1 - ramp(t, 0.6, T.ende));
  if (t > T.cry && t < T.cry + 0.8) { const p = (t - T.cry) / 0.8; circle(SX - 12, 566 + 4 + p * 22, 3.5, "#9cd3ff"); }
  if (asleep) {
    ctx.font = "900 15px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * p); ctx.fillStyle = "#cfd8ff"; ctx.fillText("z", SX + 34 + p * 22, 534 - p * 36); }
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0b0a14"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.pickM, T.title1 + 0.5);
  room(tt);
  maxScreen(tt);
  satScreen(tt);
  counterSmall(MX, stepsAt(CNT, tt), tt, lastStep(CNT, tt));
  counterSmall(SX, tt >= T.pickS ? 1 : 0, tt, T.pickS);
  people(tt);
  // Uhr zwischen den Sesseln
  ctx.fillStyle = "#14161c"; rr(256, 600, 64, 30, 6); ctx.fill();
  ctx.fillStyle = "#ff8a5a"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(clock(tt), 288, 616);

  label("MAXIMIERER", MX, 752);
  label("SATISFICER", SX, 752);
  bubble("die erste passt!", SX, 496, popIn(tt, T.pickS, T.pickS + 1.0), "speech", [10, 6]);
  bubble("nee … nee … vielleicht?", MX, 496, popIn(tt, 5.6, 6.6), "thought");
  bubble("DIE HIER!", MX, 496, popIn(tt, T.pickM, T.title1 + 0.6, 0.15), "robot", [0, 6]);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  hookLine(t, ["DAFÜR", "GIBT", "ES", "SOGAR", "EIN", "WORT."], 5, 0.1, 2.3, 220);
  hookLine(t, ["UND", "WER", "IST", "ZUERST", "FERTIG?"], 3, 6.0, 8.0, 220);
  titlePair(t, "GLEICHE SERIE.", "47 MINUTEN ", "SPÄTER.", T.title1, T.title2, T.loop);
  stickerAt(t, ["WER", "BIST DU?"], T.sticker, T.stickerEnd, 820);
  grain(t);
};

window.exportEvents = function () {
  return { duration: DUR, counts: CNT.map(c => c[0]).slice(1), pickS: T.pickS, trailer: [T.trailer, T.trailerEnd], rating: T.rating,
    laugh: T.laugh, cry: T.cry, ende: T.ende, sleep: T.sleep, pickM: T.pickM, title: [T.title1, T.title2], sticker: T.sticker, loop: T.loop,
    think: 5.6, hookWords: [0, 1, 2, 3, 4, 5].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4].map(i => 6.0 + i * 0.28)) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(37);
  return { duration: DUR };
};
