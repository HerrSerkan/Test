// "Gym-Angst" – Canvas-Animation (deutsche Version).
// Teil 1 "In seinem Kopf" (dunkel, alle starren), Zurückspulen, Teil 2 "In Wirklichkeit".
"use strict";

const W = 1080, H = 1920;
const WALL_TOP = 200, FLOOR_Y = 790, SCENE_BOT = 1105;
const TEXT_CX = 490, TEXT_W = 820;         // Text unter der Szene, frei von den Buttons rechts
window.DURATION = 12.9;

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const buf = document.createElement("canvas");
buf.width = W; buf.height = H;
const bctx = buf.getContext("2d");

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function hex(x, y, r) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) ctx.lineTo(x + r * Math.cos(k * Math.PI / 3 + Math.PI / 6), y + r * Math.sin(k * Math.PI / 3 + Math.PI / 6));
  ctx.closePath();
}

// ------------------------------------------------------------------ Ablauf
const T_REW1 = [6.3, 6.9];       // Zurückspulen Kopf -> Wirklichkeit
const T_REW2 = [12.05, 12.65];   // am Ende zurück zum Anfang
const HEAD = {                    // Teil 1
  dark: [0.45, 0.95], door: 0.6, enter: 0.85, walk: [1.25, 2.85], pick: 3.0,
  cards: [[0, 3.1, "2"], [2, 3.25, "1"], [1, 3.65, "0"]], cardsOff: 4.35,
  alarm: [4.35, 6.3], burst: [4.4, 5.35], faint: 5.3, drop: 5.35, land: 5.58,
};
const REAL = { start: 6.9, walk: [7.15, 8.35], pick: 8.55, smile: 8.95, hearts: [8.3, 9.6], sparkle: 9.45, flashes: [7.05, 8.05, 9.2, 10.6, 11.6] };
const WHISPERS = [
  [0, 1.4, 2.65, "Der Neue …"],
  [2, 1.55, 2.4, "psst"],
  [1, 2.15, 3.0, "Schau dir die Arme an"],
  [2, 2.5, 3.0, "Bro …"],
];
const TITLE = [["JEDER HATTE NUR", "#f4f1ea", 9.9], ["AUGEN FÜR", "#f4f1ea", 10.25], ["SICH SELBST.", "#ffc533", 10.6]];
const TITLE_OUT = 12.0;

// Positionen
const P_PINK = [300, 875], P_ORANGE = [525, 860], P_TEAL = [805, 850];
const DOOR = [65, 470, 140, 320];
const HERO_A = [130, 885], HERO_B = [410, 990];

let SKY = [], NOISE = [], STARS = [];
function buildStatic() {
  const R = rng(11);
  let x = 300;
  while (x < 940) {
    const w = 40 + R() * 60, h = 70 + R() * 170;
    const lights = [];
    for (let yy = 12; yy < h - 10; yy += 18) for (let xx = 8; xx < w - 8; xx += 14) if (R() < 0.35) lights.push([xx, yy]);
    SKY.push({ x, w, h, lights });
    x += w + 4 + R() * 10;
  }
  for (let k = 0; k < 4; k++) {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d"), img = g.createImageData(256, 256), Rn = rng(200 + k);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Rn() * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    NOISE.push(ctx.createPattern(c, "repeat"));
  }
  for (let i = 0; i < 260; i++) STARS.push([R() * W, FLOOR_Y + R() * (SCENE_BOT - FLOOR_Y), R()]);
}

// ------------------------------------------------------------------ Raum
function drawRoom(t, real) {
  // Wand
  const g = ctx.createLinearGradient(0, WALL_TOP, 0, FLOOR_Y);
  g.addColorStop(0, "#3d404b"); g.addColorStop(1, "#30333c");
  ctx.fillStyle = "#16171c"; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
  ctx.fillStyle = g; ctx.fillRect(0, WALL_TOP, W, FLOOR_Y - WALL_TOP);
  // Lichtleiste
  ctx.fillStyle = "#e9ecf3"; ctx.fillRect(20, WALL_TOP - 4, W - 40, 6);
  ctx.fillStyle = "rgba(233,236,243,0.12)"; ctx.fillRect(20, WALL_TOP + 2, W - 40, 30);
  // Fenster mit Skyline
  const wx = 290, wy = 345, ww = 650, wh = 250;
  ctx.fillStyle = "#1b2440"; ctx.fillRect(wx, wy, ww, wh);
  const sk = ctx.createLinearGradient(0, wy, 0, wy + wh);
  sk.addColorStop(0, "#1a2147"); sk.addColorStop(1, "#33366a");
  ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh);
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  for (const b of SKY) {
    ctx.fillStyle = "#14182c"; ctx.fillRect(b.x, wy + wh - b.h, b.w, b.h);
    ctx.fillStyle = "#f3c86a";
    for (const [lx, ly] of b.lights) ctx.fillRect(b.x + lx, wy + wh - b.h + ly, 5, 7);
  }
  ctx.restore();
  ctx.strokeStyle = "#20232b"; ctx.lineWidth = 10;
  ctx.strokeRect(wx, wy, ww, wh);
  for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(wx + k * ww / 4, wy); ctx.lineTo(wx + k * ww / 4, wy + wh); ctx.stroke(); }
  // roter Streifen
  ctx.fillStyle = "#c8343c"; ctx.fillRect(0, 640, W, 5);
  // Uhr, Banner, Lautsprecher
  ctx.fillStyle = "#24262d"; rr(318, 252, 130, 54, 8); ctx.fill();
  ctx.fillStyle = "#ff6a4d"; ctx.font = "900 34px InterBlk"; ctx.textAlign = "center"; ctx.fillText("18:47", 383, 291);
  ctx.fillStyle = "#ec4f4a"; rr(470, 252, 330, 54, 8); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 29px InterBlk"; ctx.letterSpacing = "2px"; ctx.fillText("DU SCHAFFST DAS", 635, 290); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#22242b"; rr(830, 240, 56, 76, 8); ctx.fill();
  ctx.strokeStyle = "#555a66"; ctx.lineWidth = 3;
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(840, 258 + k * 11); ctx.lineTo(876, 258 + k * 11); ctx.stroke(); }
  ctx.textAlign = "left";
  // Alarmlicht (nur im Kopf)
  if (!real) {
    const on = t > HEAD.alarm[0] && t < HEAD.alarm[1] && Math.floor(t * 5) % 2 === 0;
    ctx.fillStyle = on ? "#ff3030" : "#5a1e22";
    ctx.beginPath(); ctx.arc(905, 335, 15, 0, 7); ctx.fill();
    if (on) {
      const gl = ctx.createRadialGradient(905, 335, 0, 905, 335, 140);
      gl.addColorStop(0, "rgba(255,40,40,0.5)"); gl.addColorStop(1, "rgba(255,40,40,0)");
      ctx.fillStyle = gl; ctx.fillRect(765, 195, 280, 280);
    }
  }
  // Tür + Notausgang
  const [dx, dy, dw, dh] = DOOR;
  ctx.fillStyle = "#23252c"; ctx.fillRect(dx - 10, dy - 10, dw + 20, dh + 10);
  ctx.fillStyle = "#7d8494"; ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = "#3b404c"; ctx.fillRect(dx + 30, dy + 30, dw - 60, 95);
  ctx.fillStyle = "#c9ccd4"; ctx.fillRect(dx + dw - 26, dy + 160, 10, 50);
  ctx.fillStyle = "#23a35a"; rr(dx + 18, dy - 62, 104, 40, 5); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 26px InterBlk"; ctx.textAlign = "center"; ctx.fillText("EXIT", dx + 70, dy - 32); ctx.textAlign = "left";
  // Boden
  const fg = ctx.createLinearGradient(0, FLOOR_Y, 0, SCENE_BOT);
  fg.addColorStop(0, "#2b2d35"); fg.addColorStop(1, "#1b1c22");
  ctx.fillStyle = fg; ctx.fillRect(0, FLOOR_Y, W, SCENE_BOT - FLOOR_Y);
  ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 2;
  for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(540 + k * 60, FLOOR_Y); ctx.lineTo(540 + k * 150, SCENE_BOT); ctx.stroke(); }
  for (let y = FLOOR_Y + 30, s = 30; y < SCENE_BOT; s *= 1.25, y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (const [x, y, a] of STARS) { ctx.fillStyle = `rgba(255,255,255,${0.04 + a * 0.06})`; ctx.fillRect(x, y, 2, 2); }
  // Untergrund-Verlauf nach unten
  const fade = ctx.createLinearGradient(0, SCENE_BOT - 60, 0, SCENE_BOT + 40);
  fade.addColorStop(0, "rgba(22,23,28,0)"); fade.addColorStop(1, "#16171c");
  ctx.fillStyle = fade; ctx.fillRect(0, SCENE_BOT - 60, W, 100);
}

function squatRack() {
  ctx.fillStyle = "#4a4e5a";
  ctx.fillRect(705, 470, 14, 390); ctx.fillRect(905, 470, 14, 390);
  ctx.fillRect(700, 465, 224, 12);
}
function kettle(x, y, n) {
  ctx.fillStyle = "#2a2c33";
  ctx.beginPath(); ctx.arc(x, y, 36, 0, 7); ctx.fill();
  ctx.strokeStyle = "#2a2c33"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x, y - 40, 20, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = "#c9ccd4"; ctx.font = "900 22px InterBlk"; ctx.textAlign = "center"; ctx.fillText(n, x, y + 8); ctx.textAlign = "left";
}
const DB_COL = { 2: "#8e6ad8", 4: "#2fb6b0", 6: "#e9b737", 8: "#ef8a3c" };
function dbHex(x, y, r, n, col) {
  ctx.fillStyle = col; hex(x, y, r); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.18)"; hex(x + r * 0.15, y + r * 0.15, r * 0.55); ctx.fill();
  ctx.fillStyle = n === "1" ? "#7a1f3d" : col === "#2a2c33" ? "#d9dce4" : "#1d1e24"; ctx.font = `900 ${Math.round(r * 0.85)}px InterBlk`; ctx.textAlign = "center";
  ctx.fillText(n, x, y + r * 0.3); ctx.textAlign = "left";
}
function rackFront(pickedOne) {
  ctx.fillStyle = "#3d414c";
  ctx.fillRect(575, 900, 320, 12); ctx.fillRect(575, 985, 320, 12);
  ctx.fillRect(590, 900, 12, 150); ctx.fillRect(870, 900, 12, 150);
  [2, 4, 6, 8].forEach((n, i) => dbHex(625 + i * 70, 880, 30, String(n), DB_COL[n]));
  if (!pickedOne) dbHex(600, 884, 18, "1", "#f08aa8");
  [20, 30, 40].forEach((n, i) => dbHex(640 + i * 95, 955, 42, String(n), "#2a2c33"));
  kettle(115, 1030, "16"); kettle(205, 1040, "8");
  ctx.fillStyle = "#2f6fd6"; rr(270, 1040, 170, 42, 21); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(300, 1040, 6, 42); ctx.fillRect(360, 1040, 6, 42);
}

// ------------------------------------------------------------------ Figuren
function eyes(x, y, r, kind, look = 0) {
  ctx.fillStyle = "#24202b"; ctx.strokeStyle = "#24202b"; ctx.lineCap = "round"; ctx.lineWidth = r * 0.09;
  const ex = r * 0.33, ey = y - r * 0.05;
  const lx = look * r * 0.08;
  if (kind === "x") {
    for (const d of [-ex, ex]) { ctx.beginPath(); ctx.moveTo(x + d - r * 0.11, ey - r * 0.11); ctx.lineTo(x + d + r * 0.11, ey + r * 0.11); ctx.moveTo(x + d + r * 0.11, ey - r * 0.11); ctx.lineTo(x + d - r * 0.11, ey + r * 0.11); ctx.stroke(); }
  } else if (kind === "happy") {
    for (const d of [-ex, ex]) { ctx.beginPath(); ctx.arc(x + d, ey + r * 0.06, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  } else if (kind === "wide") {
    for (const d of [-ex, ex]) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + d, ey, r * 0.2, 0, 7); ctx.fill(); ctx.fillStyle = "#24202b"; ctx.beginPath(); ctx.arc(x + d + lx, ey, r * 0.11, 0, 7); ctx.fill(); }
  } else {
    for (const d of [-ex, ex]) { ctx.beginPath(); ctx.ellipse(x + d + lx, ey, r * 0.08, r * 0.11, 0, 0, 7); ctx.fill(); }
  }
}
function mouth(x, y, r, kind) {
  ctx.strokeStyle = "#24202b"; ctx.fillStyle = "#24202b"; ctx.lineWidth = r * 0.08; ctx.lineCap = "round";
  const my = y + r * 0.32;
  if (kind === "smile") { ctx.beginPath(); ctx.arc(x, my - r * 0.1, r * 0.17, 0.2, Math.PI - 0.2); ctx.stroke(); }
  else if (kind === "o") { ctx.beginPath(); ctx.ellipse(x, my, r * 0.08, r * 0.11, 0, 0, 7); ctx.fill(); }
  else if (kind === "sad") { ctx.beginPath(); ctx.arc(x, my + r * 0.12, r * 0.15, Math.PI + 0.4, -0.4); ctx.stroke(); }
  else if (kind === "wavy") { ctx.beginPath(); for (let k = 0; k <= 6; k++) ctx.lineTo(x - r * 0.18 + k * r * 0.06, my + (k % 2 ? -1 : 1) * r * 0.035); ctx.stroke(); }
  else if (kind === "flat") { ctx.beginPath(); ctx.moveTo(x - r * 0.12, my); ctx.lineTo(x + r * 0.12, my); ctx.stroke(); }
}
function brows(x, y, r, kind) {
  if (!kind) return;
  ctx.strokeStyle = "#24202b"; ctx.lineWidth = r * 0.07;
  const ex = r * 0.33, by = y - r * 0.3;
  const s = kind === "worried" ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(x - ex - r * 0.13, by + s * r * 0.05); ctx.lineTo(x - ex + r * 0.11, by - s * r * 0.05);
  ctx.moveTo(x + ex + r * 0.13, by + s * r * 0.05); ctx.lineTo(x + ex - r * 0.11, by - s * r * 0.05);
  ctx.stroke();
}
function body(x, feet, bw, bh, col, shade) {
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath(); ctx.ellipse(x, feet + 4, bw * 0.62, 12, 0, 0, 7); ctx.fill();
  ctx.fillStyle = col; rr(x - bw / 2, feet - bh, bw, bh, bw / 2); ctx.fill();
  ctx.fillStyle = shade; rr(x + bw * 0.1, feet - bh + 12, bw * 0.38, bh - 18, bw * 0.19); ctx.fill();
}
function arm(x1, y1, x2, y2, col, w = 26) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function head(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.35, r * 0.27, 0, 7); ctx.fill();
}
function blush(x, y, r) {
  ctx.fillStyle = "rgba(255,110,140,0.35)";
  ctx.beginPath(); ctx.ellipse(x - r * 0.55, y + r * 0.18, r * 0.15, r * 0.08, 0, 0, 7); ctx.ellipse(x + r * 0.55, y + r * 0.18, r * 0.15, r * 0.08, 0, 0, 7); ctx.fill();
}
function phoneUp(x, y, flash) {
  ctx.fillStyle = "#e9ecf3"; rr(x - 17, y - 30, 34, 60, 7); ctx.fill();
  ctx.fillStyle = "#2a2c33"; ctx.beginPath(); ctx.arc(x - 6, y - 18, 4, 0, 7); ctx.fill();
  if (flash > 0) {
    const g = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 120);
    g.addColorStop(0, `rgba(255,255,255,${flash})`); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(x - 120, y - 130, 240, 240);
  }
}

// Pinke Figur mit Selfie
function pink(t, real, stare) {
  const [x, f] = P_PINK;
  const col = "#e58bc0", sh = "rgba(120,30,80,0.18)";
  arm(x + 34, f - 120, x + 62, f - 210, col);
  body(x, f, 90, 165, col, sh);
  const hx = x + 4, hy = f - 185, r = 46;
  head(hx, hy, r, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx + 6, hy - r - 8, 16, 0, 7); ctx.fill();   // Dutt
  let flash = 0;
  if (real) for (const tf of REAL.flashes) flash = Math.max(flash, 1 - Math.abs(t - tf) / 0.15);
  phoneUp(x + 66, f - 228, clamp(flash));
  if (stare) { eyes(hx, hy, r, "wide", -1); mouth(hx, hy, r, "flat"); }
  else { eyes(hx, hy, r, "happy"); mouth(hx, hy, r, "smile"); blush(hx, hy, r); }
  return [hx, hy, r];
}
// Großer Orangener mit Stirnband
function orange(t, real, stare) {
  const [x, f] = P_ORANGE;
  const col = "#e58e4f", sh = "rgba(110,40,0,0.2)";
  const curl = real ? Math.sin(t * 2.6) * 0.5 + 0.5 : 0;
  body(x, f, 150, 215, col, sh);
  const hx = x - 8, hy = f - 250, r = 58;
  head(hx, hy, r, col);
  ctx.fillStyle = "#e3373f"; ctx.fillRect(hx - r + 4, hy - r * 0.62, 2 * r - 8, 14);
  ctx.beginPath(); ctx.moveTo(hx + r - 6, hy - r * 0.6); ctx.lineTo(hx + r + 26, hy - r * 0.9); ctx.lineTo(hx + r + 22, hy - r * 0.4); ctx.fill();
  // Arm mit 40er-Hantel (Bizeps-Curl in Wirklichkeit)
  const ax = x + 62, ay = f - 150;
  const hxp = ax + 30, hyp = ay + 70 - curl * 110;
  arm(ax, ay, hxp, hyp, col, 34);
  dbHex(hxp, hyp, 30, "40", "#2a2c33");
  if (stare) { eyes(hx, hy, r, "wide", -1.2); brows(hx, hy, r, "angry"); mouth(hx, hy, r, "flat"); }
  else {
    const proud = real && t > REAL.hearts[0];
    eyes(hx, hy, r, proud ? "happy" : "dot", 1); mouth(hx, hy, r, "smile"); if (proud) blush(hx, hy, r);
  }
  return [hx, hy, r];
}
// Türkise Figur beim Drücken
function teal(t, real, stare) {
  const [x, f] = P_TEAL;
  const col = "#5fbfad", sh = "rgba(0,60,50,0.2)";
  const press = real ? Math.sin(t * 2.2) * 0.5 + 0.5 : 0.6;
  const barY = f - 245 - press * 50;
  body(x, f, 108, 170, col, sh);
  arm(x - 44, f - 140, x - 80, barY + 8, col); arm(x + 44, f - 140, x + 80, barY + 8, col);
  ctx.fillStyle = "#c8ccd6"; ctx.fillRect(x - 175, barY - 4, 350, 9);
  ctx.fillStyle = "#e4404a"; rr(x - 150, barY - 42, 22, 84, 5); ctx.fill(); rr(x + 128, barY - 42, 22, 84, 5); ctx.fill();
  ctx.fillStyle = "#3f6fd8"; rr(x - 170, barY - 32, 18, 64, 5); ctx.fill(); rr(x + 152, barY - 32, 18, 64, 5); ctx.fill();
  const hx = x, hy = f - 192, r = 46;
  head(hx, hy, r, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(hx + r * 0.9, hy - r * 0.2, 12, 26, 0.5, 0, 7); ctx.fill(); // Zopf
  if (stare) { eyes(hx, hy, r, "wide", -1.5); mouth(hx, hy, r, "flat"); }
  else { eyes(hx, hy, r, "dot"); brows(hx, hy, r, "angry"); mouth(hx, hy, r, "flat"); }
  return [hx, hy, r];
}

// Hauptfigur
function hero(t, real) {
  let x, f, walkP, picked, face = "worried", alpha = 1;
  if (!real) {
    const p = easeIO(ramp(t, HEAD.walk[0], HEAD.walk[1]));
    x = lerp(HERO_A[0], HERO_B[0], p); f = lerp(HERO_A[1], HERO_B[1], p);
    walkP = t > HEAD.walk[0] && t < HEAD.walk[1];
    picked = t >= HEAD.pick;
    alpha = easeOut(ramp(t, HEAD.enter, HEAD.enter + 0.3));
    if (t >= HEAD.faint && t < HEAD.faint + 0.55) face = "x";
    else if (t >= HEAD.faint + 0.55) face = "sad";
    else if (t > HEAD.alarm[0]) face = "shock";
  } else {
    const p = easeIO(ramp(t, REAL.walk[0], REAL.walk[1]));
    x = lerp(HERO_A[0], HERO_B[0], p); f = lerp(HERO_A[1], HERO_B[1], p);
    walkP = t > REAL.walk[0] && t < REAL.walk[1];
    picked = t >= REAL.pick;
    face = t >= REAL.smile ? "happy" : "neutral";
  }
  const bob = walkP ? -Math.abs(Math.sin(t * 11)) * 12 : 0;
  const sway = walkP ? Math.sin(t * 11) * 0.05 : 0;
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.translate(x, f + bob); ctx.rotate(sway); ctx.translate(-x, -(f + bob));
  const col = real ? "#efebe2" : "#f6a3a0", sh = real ? "rgba(0,0,0,0.1)" : "rgba(160,30,40,0.18)";
  const ff = f + bob;
  if (!real) {   // Glühen im Scheinwerfer
    const g = ctx.createRadialGradient(x, ff - 120, 10, x, ff - 120, 230);
    g.addColorStop(0, "rgba(255,170,170,0.35)"); g.addColorStop(1, "rgba(255,170,170,0)");
    ctx.fillStyle = g; ctx.fillRect(x - 240, ff - 360, 480, 480);
  }
  // Arm mit 1-kg-Hantel
  const dropping = !real && t >= HEAD.drop;
  const ax = x + 46, ay = ff - 135;
  if (picked && !dropping) {
    const reach = real ? 1 : 1;
    arm(ax, ay, ax + 60 * reach, ay + 26, col, 24);
    dbHex(ax + 70, ay + 30, 19, "1", "#f08aa8");
  } else arm(ax, ay, ax + 12, ay + 80, col, 24);
  arm(x - 46, ff - 135, x - 58, ff - 55, col, 24);
  body(x, ff, 112, 190, col, sh);
  ctx.fillStyle = real ? "#c9c4b8" : "#f0f0f0";       // Schuhe
  rr(x - 52, ff - 10, 104, 18, 8); ctx.fill();
  if (!real) {   // Herz
    const beat = 1 + 0.12 * Math.max(0, Math.sin(t * (t > HEAD.alarm[0] ? 22 : 13)));
    ctx.save(); ctx.translate(x - 4, ff - 105); ctx.scale(beat, beat);
    ctx.fillStyle = "#e5232f";
    ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-46, -4, -26, -40, 0, -18); ctx.bezierCurveTo(26, -40, 46, -4, 0, 26); ctx.fill();
    ctx.restore();
  }
  const hx = x, hy = ff - 220, r = 52;
  head(hx, hy, r, col);
  if (face === "x") { eyes(hx, hy, r, "x"); mouth(hx, hy, r, "wavy"); }
  else if (face === "sad") { eyes(hx, hy, r, "dot"); brows(hx, hy, r, "worried"); mouth(hx, hy, r, "sad"); }
  else if (face === "shock") { eyes(hx, hy, r, "wide"); brows(hx, hy, r, "worried"); mouth(hx, hy, r, "o"); }
  else if (face === "happy") { eyes(hx, hy, r, "happy"); mouth(hx, hy, r, "smile"); blush(hx, hy, r); }
  else if (face === "neutral") { eyes(hx, hy, r, "dot", 0.5); mouth(hx, hy, r, "flat"); }
  else { eyes(hx, hy, r, "dot"); brows(hx, hy, r, "worried"); mouth(hx, hy, r, "wavy"); }
  ctx.restore();
  ctx.globalAlpha = 1;
  // fallende Hantel + Aufprall
  if (dropping) {
    const p = ramp(t, HEAD.drop, HEAD.land);
    const sx = ax + 70, sy = ay + 30, ey = HERO_B[1] + 2;
    dbHex(sx + 30 * p, lerp(sy, ey, p * p), 19, "1", "#f08aa8");
    const fl = ramp(t, HEAD.land, HEAD.land + 0.35);
    if (fl > 0 && fl < 1) {
      ctx.save(); ctx.translate(sx + 30, ey);
      ctx.globalAlpha = 1 - fl;
      ctx.fillStyle = "#fff";
      const s = 1 + fl * 1.2;
      ctx.beginPath(); ctx.moveTo(0, -110 * s); ctx.lineTo(16 * s, -16 * s); ctx.lineTo(110 * s, 0); ctx.lineTo(16 * s, 16 * s); ctx.lineTo(0, 110 * s); ctx.lineTo(-16 * s, 16 * s); ctx.lineTo(-110 * s, 0); ctx.lineTo(-16 * s, -16 * s); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 120 * s, 24 * s, 0, 0, 7); ctx.stroke();
      ctx.restore(); ctx.globalAlpha = 1;
    }
    const du = ramp(t, HEAD.land, HEAD.land + 0.8);
    if (du > 0 && du < 1) {
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = `rgba(200,200,210,${0.35 * (1 - du)})`;
        ctx.beginPath(); ctx.arc(sx + 30 + (k - 2.5) * 22 * (1 + du), ey - 10 - du * 30 - (k % 2) * 10, 14 + du * 18, 0, 7); ctx.fill();
      }
    }
  }
  return [hx, hy + bob, r];
}

// Herzen um den Orangenen (er bewundert sich selbst)
function hearts(t) {
  const [a, b] = REAL.hearts;
  if (t < a || t > b + 0.5) return;
  for (let k = 0; k < 3; k++) {
    const p = ramp(t, a + k * 0.25, a + k * 0.25 + 0.9);
    if (p <= 0 || p >= 1) continue;
    const x = P_ORANGE[0] + 60 + k * 26, y = P_ORANGE[1] - 300 - p * 80;
    ctx.globalAlpha = 1 - p; ctx.fillStyle = "#ff5a7a";
    ctx.save(); ctx.translate(x, y); ctx.scale(0.5 + 0.3 * back(p), 0.5 + 0.3 * back(p));
    ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-46, -4, -26, -40, 0, -18); ctx.bezierCurveTo(26, -40, 46, -4, 0, 26); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function sparkle(x, y, t, t0) {
  const p = ramp(t, t0, t0 + 0.7);
  if (p <= 0 || p >= 1) return;
  ctx.fillStyle = `rgba(255,232,150,${1 - p})`;
  for (const [dx, dy, s] of [[0, 0, 1], [30, -24, 0.6], [-22, 20, 0.5]]) {
    const r = 30 * s * Math.sin(p * Math.PI);
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy - r); ctx.lineTo(x + dx + r * 0.25, y + dy); ctx.lineTo(x + dx, y + dy + r); ctx.lineTo(x + dx - r * 0.25, y + dy); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + dx - r, y + dy); ctx.lineTo(x + dx, y + dy + r * 0.25); ctx.lineTo(x + dx + r, y + dy); ctx.lineTo(x + dx, y + dy - r * 0.25); ctx.fill();
  }
}

// Flüster-Blasen
function whisper(x, y, txt, p) {
  const sc = back(p);
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = "600 28px InterSB";
  const w = ctx.measureText(txt).width + 36, h = 50;
  ctx.fillStyle = "rgba(205,210,235,0.92)";
  rr(-w / 2, -h, w, h, 20); ctx.fill();
  ctx.beginPath(); ctx.arc(-6, 10, 6, 0, 7); ctx.arc(-12, 24, 4, 0, 7); ctx.fill();
  ctx.fillStyle = "#2c2f40"; ctx.textAlign = "center"; ctx.fillText(txt, 0, -h / 2 + 10); ctx.textAlign = "left";
  ctx.restore();
}
// Wertungstafeln
function card(x, y, n, p) {
  if (p <= 0) return;
  const k = back(p);
  ctx.save(); ctx.translate(x, y + (1 - k) * 60); ctx.globalAlpha = clamp(p * 3);
  ctx.fillStyle = "#c79a64"; ctx.fillRect(-4, 0, 8, 110);
  ctx.fillStyle = "#fbfbfb"; rr(-40, -90, 80, 96, 8); ctx.fill();
  ctx.strokeStyle = "#222"; ctx.lineWidth = 4; rr(-40, -90, 80, 96, 8); ctx.stroke();
  ctx.fillStyle = n === "0" ? "#e5232f" : "#141414"; ctx.font = "900 70px InterBlk"; ctx.textAlign = "center"; ctx.fillText(n, 0, -18); ctx.textAlign = "left";
  ctx.restore(); ctx.globalAlpha = 1;
}
// Alarm-Sternblase
function burst(t) {
  const [a, b] = HEAD.burst;
  if (t < a || t > b + 0.25) return;
  const p = Math.min(back(ramp(t, a, a + 0.3)), 1 - ramp(t, b, b + 0.25));
  if (p <= 0) return;
  const shake = Math.sin(t * 60) * 4;
  ctx.save(); ctx.translate(690 + shake, 450); ctx.scale(p, p); ctx.rotate(-0.04);
  ctx.beginPath();
  for (let k = 0; k < 26; k++) {
    const ang = k / 26 * Math.PI * 2, r = k % 2 ? 150 : 185;
    ctx.lineTo(Math.cos(ang) * r * 1.45, Math.sin(ang) * r * 0.8);
  }
  ctx.closePath();
  ctx.fillStyle = "#1a1b21"; ctx.fill();
  ctx.strokeStyle = "#ec4f4a"; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "900 44px InterBlk"; ctx.textAlign = "center";
  ctx.fillText("ACHTUNG:", 0, -38); ctx.fillText("ER NIMMT", 0, 12); ctx.fillText("DIE 1 KG.", 0, 62);
  ctx.textAlign = "left";
  ctx.restore();
}

// ------------------------------------------------------------------ Szene
function drawScene(t, real) {
  drawRoom(t, real);
  squatRack();
  const dark = real ? 0 : easeIO(ramp(t, HEAD.dark[0], HEAD.dark[1]));
  const stare = !real && t > HEAD.enter + 0.2;
  const heads = [pink(t, real, stare), orange(t, real, stare), teal(t, real, stare)];
  // Abdunkeln (rot) – alles außer Held im Scheinwerfer
  if (dark > 0) {
    ctx.fillStyle = `rgba(10,4,6,${0.82 * dark})`; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
    ctx.fillStyle = `rgba(120,10,20,${0.16 * dark})`; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
    // starrende Augen leuchten aus dem Dunkel
    for (const [hx, hy, r] of heads) {
      ctx.globalAlpha = dark * ramp(t, HEAD.enter, HEAD.enter + 0.4);
      eyes(hx, hy, r, "wide", -1.2);
      ctx.globalAlpha = 1;
    }
  }
  rackFront(real ? t >= REAL.pick : t >= HEAD.pick);
  if (dark > 0) { ctx.fillStyle = `rgba(10,4,6,${0.78 * dark})`; ctx.fillRect(560, 840, 360, 230); ctx.fillRect(80, 980, 380, 120); }
  // Scheinwerfer
  let hx = HERO_A[0];
  if (!real) {
    const p = easeIO(ramp(t, HEAD.walk[0], HEAD.walk[1]));
    hx = lerp(HERO_A[0], HERO_B[0], p);
    const sp = dark * (0.6 + 0.4 * ramp(t, HEAD.door, HEAD.enter + 0.2));
    const fy = lerp(HERO_A[1], HERO_B[1], p);
    const g = ctx.createLinearGradient(0, 0, 0, fy);
    g.addColorStop(0, `rgba(255,235,235,${0.02 * sp})`); g.addColorStop(1, `rgba(255,235,235,${0.22 * sp})`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(hx - 50, 0); ctx.lineTo(hx + 50, 0); ctx.lineTo(hx + 170, fy + 10); ctx.lineTo(hx - 170, fy + 10); ctx.fill();
    ctx.fillStyle = `rgba(255,235,235,${0.25 * sp})`;
    ctx.beginPath(); ctx.ellipse(hx, fy + 6, 160, 30, 0, 0, 7); ctx.fill();
  }
  const h = (real || t >= HEAD.enter) ? hero(t, real) : null;
  if (real) { hearts(t); sparkle(P_ORANGE[0] + 92, P_ORANGE[1] - 90 - (Math.sin(t * 2.6) * 0.5 + 0.5) * 110, t, REAL.sparkle); }
  if (!real) {
    for (const [who, a, b, txt] of WHISPERS) {
      if (t < a || t > b + 0.25) continue;
      const p = Math.min(ramp(t, a, a + 0.25), 1 - ramp(t, b, b + 0.2));
      const [x, y, r] = heads[who];
      const off = who === 1 ? [10, -r - 70] : who === 2 && txt === "Bro …" ? [-10, -r - 20] : [0, -r - 20];
      ctx.globalAlpha = 0.95;
      whisper(clamp(x + off[0], 190, 880), y + off[1], txt, p);
      ctx.globalAlpha = 1;
    }
    const off = 1 - ramp(t, HEAD.cardsOff, HEAD.cardsOff + 0.2);
    for (const [who, ts, n] of HEAD.cards) {
      const [x, y, r] = heads[who];
      card(x + (who === 1 ? -95 : who === 0 ? -60 : 70), y - r - 40, n, ramp(t, ts, ts + 0.3) * off);
    }
    burst(t);
  }
}

// ------------------------------------------------------------------ Text unter der Szene
const LABEL_Y = 1145;
function drawLabel(real, k) {
  ctx.textAlign = "center";
  ctx.font = "900 26px InterBlk"; ctx.letterSpacing = "4px";
  ctx.fillStyle = "rgba(220,224,235,0.75)";
  ctx.fillText("GYM-ANGST", TEXT_CX, LABEL_Y);
  ctx.letterSpacing = "1px";
  ctx.font = "900 32px InterBlk";
  const txt = real ? "IN WIRKLICHKEIT" : "IN SEINEM KOPF";
  const w = ctx.measureText(txt).width + 70;
  const sc = 0.85 + 0.15 * back(k);
  ctx.save(); ctx.translate(TEXT_CX, LABEL_Y + 52); ctx.scale(sc, sc);
  ctx.fillStyle = real ? "#2fb36b" : "#e5383f";
  rr(-w / 2, -28, w, 56, 28); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-w / 2 + 28, 0, 7, 0, 7); ctx.fill();
  ctx.fillText(txt, 12, 12);
  ctx.restore();
  ctx.letterSpacing = "0px"; ctx.textAlign = "left";
}
function drawTitle(t) {
  if (t < TITLE[0][2] - 0.1 || t > TITLE_OUT + 0.4) return;
  const out = ramp(t, TITLE_OUT, TITLE_OUT + 0.3);
  let size = 84;
  ctx.font = `900 ${size}px InterBlk`;
  const wmax = Math.max(...TITLE.map(l => ctx.measureText(l[0]).width));
  if (wmax > TEXT_W) size *= TEXT_W / wmax;
  ctx.font = `900 ${size}px InterBlk`;
  ctx.letterSpacing = `${-size * 0.02}px`;
  TITLE.forEach(([txt, col, ts], i) => {
    const p = ramp(t, ts, ts + 0.3);
    if (p <= 0) return;
    const w = ctx.measureText(txt).width;
    ctx.globalAlpha = easeOut(p) * (1 - out);
    const bl = (1 - p) * 12 + out * 10;
    ctx.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : "none";
    ctx.fillStyle = col;
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16;
    ctx.fillText(txt, TEXT_CX - w / 2, 1262 + i * size * 1.0 + size * 0.78 + (1 - easeOut(p)) * 16);
  });
  ctx.filter = "none"; ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.letterSpacing = "0px";
}

// ------------------------------------------------------------------ Bild
// Zeit-Abbildung für das Zurückspulen
function sceneTime(t) {
  if (t >= T_REW1[0] && t < T_REW1[1]) { const p = ramp(t, T_REW1[0], T_REW1[1]); return { st: lerp(T_REW1[0], 0.95, easeIO(p)), real: false, rew: p }; }
  if (t >= T_REW2[0]) { const p = ramp(t, T_REW2[0], T_REW2[1]); return { st: p < 1 ? lerp(T_REW2[0], REAL.start, easeIO(p)) : 1.0, real: p < 1, rew: p < 1 ? p : 0, head2: p >= 1 }; }
  return { st: t, real: t >= T_REW1[1], rew: 0 };
}

function glitch(amount, seed) {
  if (amount <= 0) return;
  bctx.clearRect(0, 0, W, H);
  bctx.drawImage(cv, 0, 0);
  const R = rng(seed);
  for (let k = 0; k < 18; k++) {
    const y = Math.floor(R() * (SCENE_BOT + 40)), h = 10 + Math.floor(R() * 60);
    const dx = (R() - 0.5) * 140 * amount;
    ctx.drawImage(buf, 0, y, W, h, dx, y, W, h);
  }
  ctx.fillStyle = `rgba(0,0,0,${0.18 * amount})`;
  for (let y = 0; y < SCENE_BOT + 40; y += 6) ctx.fillRect(0, y, W, 2);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(80,0,40,${0.25 * amount})`; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
  ctx.globalCompositeOperation = "source-over";
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#16171c"; ctx.fillRect(0, 0, W, H);
  const { st, real, rew, head2 } = sceneTime(t);
  // leichtes Heranzoomen im Kopf, Zittern beim Alarm
  let z = 1, sx = 0, sy = 0;
  if (!real) {
    z = 1 + 0.06 * easeIO(ramp(st, HEAD.dark[0], 3.0)) + 0.04 * easeIO(ramp(st, HEAD.alarm[0], HEAD.alarm[0] + 0.4));
    if (st > HEAD.alarm[0] && st < HEAD.faint + 0.3) { sx = Math.sin(st * 70) * 5; sy = Math.cos(st * 53) * 4; }
    if (st > HEAD.land && st < HEAD.land + 0.25) sy += Math.sin(st * 120) * 10 * (1 - ramp(st, HEAD.land, HEAD.land + 0.25));
  } else {
    z = 1 + 0.03 * easeIO(ramp(st, REAL.start, 11.5));
  }
  const cx = real ? 540 : 400, cy = 820;
  ctx.setTransform(z, 0, 0, z, cx - cx * z + sx, cy - cy * z + sy);
  drawScene(st, real);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Szene unten sauber abschließen (Platz für Text)
  const fg = ctx.createLinearGradient(0, SCENE_BOT - 30, 0, SCENE_BOT + 30);
  fg.addColorStop(0, "rgba(22,23,28,0)"); fg.addColorStop(1, "#16171c");
  ctx.fillStyle = fg; ctx.fillRect(0, SCENE_BOT - 30, W, 60);
  ctx.fillStyle = "#16171c"; ctx.fillRect(0, SCENE_BOT + 30, W, H);
  if (!real) {   // rote Ränder im Kopf
    const d = easeIO(ramp(st, HEAD.dark[0], HEAD.dark[1]));
    const vg = ctx.createRadialGradient(W / 2, 760, 300, W / 2, 760, 1100);
    vg.addColorStop(0, "rgba(90,0,10,0)"); vg.addColorStop(1, `rgba(90,0,10,${0.5 * d})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
  glitch(Math.sin(Math.PI * rew), Math.floor(t * 30));
  if (rew > 0) {
    ctx.globalAlpha = Math.sin(Math.PI * rew);
    ctx.fillStyle = "#fff"; ctx.font = "900 34px InterBlk"; ctx.letterSpacing = "3px";
    ctx.beginPath(); ctx.moveTo(110, 260); ctx.lineTo(140, 240); ctx.lineTo(140, 280); ctx.fill();
    ctx.beginPath(); ctx.moveTo(80, 260); ctx.lineTo(110, 240); ctx.lineTo(110, 280); ctx.fill();
    ctx.fillText("ZURÜCKSPULEN", 158, 272);
    ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
  }
  // Beschriftung + Schlusssatz unter der Szene
  const k = real ? ramp(t, T_REW1[1], T_REW1[1] + 0.3) : head2 ? ramp(t, T_REW2[1], T_REW2[1] + 0.3) : 1;
  drawLabel(real, k);
  drawTitle(t);

  ctx.globalAlpha = 0.035;
  ctx.fillStyle = NOISE[Math.floor(t * 8) % NOISE.length];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.2), ramp(t, window.DURATION - 0.25, window.DURATION));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return { head: HEAD, real: REAL, whispers: WHISPERS.map(w => ({ t: w[1], who: w[0] })), rew: [T_REW1, T_REW2], title: TITLE.map(l => l[2]), titleOut: TITLE_OUT, duration: window.DURATION };
};

window.setup = async function () {
  await Promise.all([document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk"), document.fonts.load("500 30px InterMed")]);
  buildStatic();
  return true;
};
