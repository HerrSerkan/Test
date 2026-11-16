// "Gleiche Nachricht. Andere Nacht." – eigenes Video im Stil von fruehaufsteher/ + mensa/ (1080x1920), ohne Sprecher. Aufbau nach kurzvideo-regeln.
// Gezeichnet im Raster 576 x 1024 und auf 1080 x 1920 hochskaliert. Grundformen (Gesichter, Schilder, Blasen) aus mensa/scene.js.
"use strict";
const W = 576, H = 1024, S = 1080 / 576, DUR = 12.6;
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
const CLOCK = [[0, "23:12"], [1.9, "23:48"], [2.6, "00:31"], [3.2, "01:52"], [3.8, "02:40"], [4.4, "03:58"], [5.0, "05:21"], [5.8, "06:30"], [6.6, "07:00"]];
const T = { msg: 0.25, msgEnd: 1.55, ok: 1.6, sleepC: 2.1, sit: 3.6, climax: 6.6, wake: 6.75, msg2: 7.2, read: 7.5, relief: 7.9, crash: 8.3,
  title1: 9.0, title2: 9.5, sticker: 11.1, stickerEnd: 12.0, loop: 12.25 };
const THOUGHTS = [[2.3, "Bin ich gefeuert?"], [2.75, "Was hab ich gemacht?"], [3.15, "Die Mail von Montag?!"], [3.55, "Alle wissen es schon."],
  [3.9, "Soll ich mich melden?"], [4.25, "Nein, zu spät."], [4.6, "Bewerbung schreiben …"], [4.95, "Auswandern?"], [5.3, "Alpaka-Farm?"], [5.65, "Neuer Name??"]];
const LX = 140, RX = 436;             // Betten
const dawnK = t => easeIO(ramp(t, 5.6, 6.8)) * (t < T.loop ? 1 : 0);

// ------------------------------------------------------------ Schlafzimmer
function room(t) {
  const d = dawnK(t);
  let g = ctx.createLinearGradient(0, 280, 0, 760);
  g.addColorStop(0, `rgb(${lerp(26, 70, d)},${lerp(28, 58, d)},${lerp(52, 80, d)})`);
  g.addColorStop(1, `rgb(${lerp(34, 92, d)},${lerp(36, 76, d)},${lerp(66, 96, d)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 280, W, 480);
  // Fenster mit Vorhängen: Nacht -> Morgenrot
  const wx = 226, wy = 300, ww = 124, wh = 150;
  g = ctx.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, `rgb(${lerp(14, 120, d)},${lerp(18, 150, d)},${lerp(48, 220, d)})`);
  g.addColorStop(1, `rgb(${lerp(30, 255, d)},${lerp(34, 180, d)},${lerp(70, 120, d)})`);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
  ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  if (d < 0.6) { ctx.globalAlpha = 1 - d / 0.6; circle(wx + 86, wy + 36, 13, "#f3f0d6"); circle(wx + 92, wy + 32, 11, "#0e1230"); for (let i = 0; i < 8; i++) circle(wx + 10 + (i * 37) % 110, wy + 14 + (i * 23) % 70, 1.2, "#fff"); ctx.globalAlpha = 1; }
  else { circle(wx + 62, wy + wh - 10 - (d - 0.6) * 60, 18, "#ffd36e"); glow(wx + 62, wy + wh - 20, 90, "255,200,110", 0.4 * d); }
  ctx.fillStyle = "rgba(20,24,44,0.75)"; for (let i = 0; i < 6; i++) ctx.fillRect(wx + i * 22, wy + wh - 30 - (i % 3) * 14, 18, 30 + (i % 3) * 14);   // Stadt
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(wx + ww / 2 - 2, wy, 4, wh); ctx.fillRect(wx, wy + wh / 2 - 2, ww, 4);
  ctx.fillStyle = "#5a4a8a"; ctx.fillRect(wx - 30, wy - 14, 30, wh + 30); ctx.fillRect(wx + ww, wy - 14, 30, wh + 30);
  ctx.fillStyle = "#3a3060"; ctx.fillRect(wx - 40, wy - 18, ww + 80, 8);
  // Lichtkegel vom Fenster am Morgen
  if (d > 0) { ctx.fillStyle = `rgba(255,200,120,${0.12 * d})`; ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(wx + ww + 90, 740); ctx.lineTo(wx - 90, 740); ctx.fill(); }
  // Boden
  ctx.fillStyle = "#1c1a2c"; ctx.fillRect(0, 730, W, H - 730);
  g = ctx.createLinearGradient(0, 730, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0.1)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(0, 730, W, H - 730);
}
function bedBack(x) {
  ctx.fillStyle = "#3b2f5e"; rr(x - 104, 520, 208, 90, [16, 16, 0, 0]); ctx.fill();        // Kopfteil
  ctx.fillStyle = "#ece8f4"; rr(x - 70, 560, 140, 34, 14); ctx.fill();                      // Kissen
}
function bedFront(x, col) {
  ctx.fillStyle = col; rr(x - 110, 612, 220, 96, 14); ctx.fill();                           // Decke
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(x - 110, 612, 220, 10);
  ctx.fillStyle = "#2a2348"; ctx.fillRect(x - 102, 708, 12, 22); ctx.fillRect(x + 90, 708, 12, 22);
}
function nightstand(t) {
  ctx.fillStyle = "#4a3c6b"; rr(258, 640, 60, 90, 6); ctx.fill();
  const red = t >= T.climax && t < T.title1;
  const ring = t >= T.climax && t < T.climax + 0.6;
  const sh = ring ? Math.sin(t * 90) * 1.5 : 0;
  ctx.fillStyle = "#14161c"; rr(260 + sh, 606, 56, 34, 6); ctx.fill();
  ctx.fillStyle = red ? "#ff4b4b" : "#ff8a5a"; ctx.font = "900 17px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(stepsAt(CLOCK, t), 288 + sh, 624);
  if (ring) { ctx.strokeStyle = "#ffd36e"; ctx.lineWidth = 2; for (const r of [36, 44]) for (const s of [0, Math.PI]) { ctx.beginPath(); ctx.arc(288, 622, r, s - 0.5, s + 0.5); ctx.stroke(); } }
}
function phone(x, y, on, k = 1) {
  if (on) glow(x, y - 10, 60, "140,190,255", 0.4 * k);
  ctx.fillStyle = "#14161c"; rr(x - 11, y - 18, 22, 36, 4); ctx.fill();
  ctx.fillStyle = on ? "rgba(160,205,255,0.95)" : "#0a0b10"; rr(x - 8, y - 15, 16, 30, 3); ctx.fill();
}
function zzz(x, y, t, a = 1) {
  ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = a * Math.sin(Math.PI * p); ctx.fillStyle = "#cfd8ff"; ctx.font = `900 ${12 + 8 * p}px InterX`; ctx.fillText("z", x + p * 24, y - p * 40); }
  ctx.globalAlpha = 1;
}
function notification(t, t0, t1, from, text, y) {
  const s = popIn(t, t0, t1, 0.25);
  if (s <= 0) return;
  ctx.save(); ctx.translate(288, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
  ctx.fillStyle = "rgba(248,248,252,0.97)"; rr(-190, -30, 380, 60, 16); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#5cc98a"; rr(-176, -18, 16, 16, 4); ctx.fill();
  ctx.fillStyle = "#6b7080"; ctx.font = "700 11px InterX"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.letterSpacing = "1px"; ctx.fillText(from, -152, -10);
  ctx.letterSpacing = "0px"; ctx.fillStyle = "#1d1d22"; ctx.font = "700 15px InterX"; ctx.fillText(text, -176, 13);
  ctx.restore();
}

// ------------------------------------------------------------ Figuren
function people(t) {
  // Overthinker (links): liegt, setzt sich auf, grübelt, schläft am Morgen ein
  const sit = easeIO(ramp(t, T.sit, T.sit + 0.4)) * (1 - easeIO(ramp(t, T.crash, T.crash + 0.3)));
  const of = stateAt([[0, "neutral"], [T.msg + 0.3, "wide"], [2.2, "worried"], [T.sit, "wide"], [4.6, "worried"], [5.6, "wide"], [T.read, "shock"], [T.relief, "happy"], [T.crash, "happy"]], t);
  const crashed = t >= T.crash;
  bedBack(LX);
  person({ col: "sky", x: LX, y: lerp(574, 532, sit), r: 28, face: crashed ? "happy" : of, bodyH: 70 });
  if (crashed) { ctx.fillStyle = "#24283a"; for (const s of [-1, 1]) { ctx.fillRect(LX + s * 10 - 6, lerp(574, 532, sit) - 4, 12, 3); } }
  bedFront(LX, "#4a5d9a");
  if (!crashed) phone(LX + 40, lerp(612, 590, sit), true);
  // Entspannt (rechts): liest, schreibt "ok", schläft, wacht frisch auf
  const wake = easeIO(ramp(t, T.wake, T.wake + 0.4));
  const cf = stateAt([[0, "smile"], [T.msg + 0.3, "neutral"], [T.ok, "smile"], [T.sleepC, "happy"], [T.wake, "smile"], [T.wake + 0.4, "laugh"], [T.read, "happy"]], t);
  bedBack(RX);
  person({ col: "peach", x: RX, y: lerp(574, 530, wake), r: 28, face: cf, bodyH: 70,
    arm: t > T.wake + 0.2 && t < T.wake + 1.0 ? [{ side: -1, ang: 2.8, len: 40 }, { side: 1, ang: -2.8, len: 40 }] : null });
  bedFront(RX, "#a8607a");
  const phoneOn = t < T.sleepC || (t > T.msg2 && t < T.title1);
  phone(RX - 40, lerp(612, 590, wake), phoneOn);
  if (t > T.sleepC && t < T.wake) zzz(RX + 30, 540, t);
  if (crashed) zzz(LX + 30, 548, t);
}

function thoughts(t) {
  const shown = THOUGHTS.filter(([a]) => t >= a);
  const fadeAll = 1 - ramp(t, T.msg2 - 0.1, T.msg2 + 0.15);
  if (fadeAll <= 0) return;
  shown.forEach(([a, txt], i) => {
    const age = shown.length - 1 - i;
    const nxt = i + 1 < shown.length ? shown[i + 1][0] : null;
    const pos = nxt === null ? 0 : age - 1 + easeIO(ramp(t, nxt, nxt + 0.2));
    const y = 500 - pos * 27;
    const a2 = (1 - ramp(pos, 6.5, 7.5)) * fadeAll;
    if (a2 <= 0) return;
    ctx.globalAlpha = a2;
    bubble(txt, LX + (i % 2 ? 14 : -10), y, popIn(t, a, 99, 0.2), "thought");
    ctx.globalAlpha = 1;
  });
  // Pünktchen zur Figur
  if (shown.length && fadeAll > 0) for (const [dx, dy, r] of [[18, 520, 2.5], [24, 530, 3.2]]) circle(LX + dx, dy, r * fadeAll, "#f7f2e6");
}

// ------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  const tt = t >= T.loop ? 0.02 : t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#0b0a14"; ctx.fillRect(0, 0, 1080, 1920);
  cameraAt(tt, T.climax, T.title1 + 0.5);
  room(tt);
  nightstand(tt);
  people(tt);
  thoughts(tt);
  notification(tt, T.msg, T.msgEnd, "CHEF · 23:12", "Hey, können wir morgen kurz reden?", 330);
  notification(tt, T.msg2, T.title1 - 0.1, "CHEF · 07:01", "…wollte nur sagen: super Arbeit! :)", 330);
  bubble("ok", RX - 30, 520, popIn(tt, T.ok, T.sleepC + 0.2), "speech", [-10, 6]);

  label("OVERTHINKER", LX, 752);
  label("ENTSPANNT", RX, 752);

  ctx.setTransform(S, 0, 0, S, 0, 0);
  hookLine(t, ["WENN", "DER", "CHEF", "UM", "23", "UHR", "SCHREIBT", "…"], 2, 0.1, 2.4, 200);
  hookLine(t, ["WARTE", "AUF", "7", "UHR", "…"], 2, 4.3, 6.4, 200);
  titlePair(t, "GLEICHE NACHRICHT.", "ANDERE ", "NACHT.", T.title1, T.title2, T.loop);
  stickerAt(t, ["WER", "BIST DU?"], T.sticker, T.stickerEnd, 820);
  grain(t);
};

window.exportEvents = function () {
  return { duration: DUR, steps: CLOCK.map(c => c[0]).slice(1), thoughts: THOUGHTS.map(x => x[0]), msg: T.msg, ok: T.ok, sleepC: T.sleepC,
    sit: T.sit, climax: T.climax, wake: T.wake, msg2: T.msg2, relief: T.relief, crash: T.crash, title: [T.title1, T.title2],
    sticker: T.sticker, loop: T.loop,
    hookWords: [0, 1, 2, 3, 4, 5, 6, 7].map(i => 0.1 + i * 0.28).concat([0, 1, 2, 3, 4].map(i => 4.3 + i * 0.28)) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  makeGrain(31);
  return { duration: DUR };
};
