// "Referat-Angst" – Canvas-Animation im Stil von "Gym-Angst".
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
// ------------------------------------------------------------------ Ablauf
const T_REW1 = [6.3, 6.9];       // Zurückspulen Kopf -> Wirklichkeit
const T_REW2 = [12.05, 12.65];   // am Ende zurück zum Anfang
const HEAD = {                    // Teil 1: in seinem Kopf
  dark: [0.45, 0.95], door: 0.6, enter: 0.85, walk: [1.25, 2.85], pick: 3.0,
  say: [[3.0, 3.7, "Also, die Römer …"], [3.75, 4.35, "… äh …"]],
  cards: [[0, 3.1, "5"], [2, 3.25, "6"], [1, 3.65, "6-"]], cardsOff: 4.35,
  alarm: [4.35, 6.3], burst: [4.4, 5.35], faint: 5.3, drop: 5.35, land: 5.58,
};
const REAL = {                    // Teil 2: in Wirklichkeit
  start: 6.9, walk: [7.15, 8.35], pick: 8.45, smile: 9.4,
  say: [[8.5, 9.35, "Also, die Römer … äh …"], [9.4, 9.95, "… bauten Straßen!"]],
  flashes: [7.05, 8.05, 9.2, 10.6, 11.6], snore: [7.3, 12.0], sip: [7.9, 10.3],
  hearts: [9.6, 10.4], sparkle: 9.45,
};
const WHISPERS = [
  [0, 1.4, 2.65, "Was will der?"],
  [2, 1.55, 2.4, "psst"],
  [1, 2.15, 3.0, "Der blamiert sich gleich"],
  [2, 2.5, 3.0, "cringe …"],
];
const TITLE = [["KEINER HAT DAS", "#f4f1ea", 9.9], ["ÜBERHAUPT", "#f4f1ea", 10.25], ["BEMERKT.", "#ffc533", 10.6]];
const TITLE_OUT = 12.0;
const LABEL = "REFERAT-ANGST";

// Positionen
const STUD = [175, 590, 865];              // Mitschüler (von hinten, vorne im Bild)
const DESK_Y = 1012;
const TEACH = [885, 700];                  // Lehrerin hinter dem Pult (Mitte Kopf / Pultoberkante)
const DOOR = [65, 470, 140, 320];
const HERO_A = [130, 885], HERO_B = [400, 905];

let NOISE = [], STARS = [];
function buildStatic() {
  const R = rng(11);
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
  ctx.fillStyle = "#16171c"; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
  const g = ctx.createLinearGradient(0, WALL_TOP, 0, FLOOR_Y);
  g.addColorStop(0, "#3d404b"); g.addColorStop(1, "#30333c");
  ctx.fillStyle = g; ctx.fillRect(0, WALL_TOP, W, FLOOR_Y - WALL_TOP);
  // Lichtleiste
  ctx.fillStyle = "#e9ecf3"; ctx.fillRect(20, WALL_TOP - 4, W - 40, 6);
  ctx.fillStyle = "rgba(233,236,243,0.12)"; ctx.fillRect(20, WALL_TOP + 2, W - 40, 30);
  // Holzleiste unten an der Wand
  ctx.fillStyle = "#4a3b2e"; ctx.fillRect(0, 700, W, 90);
  ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(0, 700, W, 5);
  // Tafel
  const bx = 300, by = 330, bw = 600, bh = 275;
  ctx.fillStyle = "#6e4a2a"; rr(bx - 14, by - 14, bw + 28, bh + 28, 8); ctx.fill();
  const bg = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  bg.addColorStop(0, "#2f5d48"); bg.addColorStop(1, "#264c3b");
  ctx.fillStyle = bg; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = "rgba(255,255,255,0.05)";            // Kreidestaub
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(bx + 80 + k * 90, by + 200 + (k % 2) * 30, 70, 20, 0.2, 0, 7); ctx.fill(); }
  ctx.fillStyle = "rgba(245,245,235,0.9)";
  ctx.font = "900 40px InterBlk"; ctx.letterSpacing = "4px";
  ctx.fillText("REFERAT", bx + 300, by + 70); ctx.letterSpacing = "0px";
  ctx.font = "italic 400 64px ISerif"; ctx.fillText("Die Römer", bx + 300, by + 140);
  // kleine Kreidezeichnung: Tempel
  ctx.strokeStyle = "rgba(245,245,235,0.8)"; ctx.lineWidth = 4;
  const tx = bx + 330, ty = by + 175;
  ctx.beginPath(); ctx.moveTo(tx, ty + 20); ctx.lineTo(tx + 90, ty); ctx.lineTo(tx + 180, ty + 20); ctx.closePath(); ctx.stroke();
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(tx + 15 + k * 37, ty + 26); ctx.lineTo(tx + 15 + k * 37, ty + 72); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(tx - 5, ty + 78); ctx.lineTo(tx + 185, ty + 78); ctx.stroke();
  ctx.fillStyle = "#5a3c22"; ctx.fillRect(bx, by + bh + 6, bw, 12);  // Kreideablage
  ctx.fillStyle = "#f2f2ea"; ctx.fillRect(bx + 60, by + bh + 2, 30, 7); ctx.fillRect(bx + 110, by + bh + 2, 22, 7);
  // Uhr, Plakat, Lautsprecher
  ctx.fillStyle = "#24262d"; rr(318, 252, 130, 54, 8); ctx.fill();
  ctx.fillStyle = "#ff6a4d"; ctx.font = "900 34px InterBlk"; ctx.textAlign = "center"; ctx.fillText("08:15", 383, 291);
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
    ctx.beginPath(); ctx.arc(955, 335, 15, 0, 7); ctx.fill();
    if (on) {
      const gl = ctx.createRadialGradient(955, 335, 0, 955, 335, 140);
      gl.addColorStop(0, "rgba(255,40,40,0.5)"); gl.addColorStop(1, "rgba(255,40,40,0)");
      ctx.fillStyle = gl; ctx.fillRect(815, 195, 280, 280);
    }
  }
  // Tür + Ausgang
  const [dx, dy, dw, dh] = DOOR;
  ctx.fillStyle = "#23252c"; ctx.fillRect(dx - 10, dy - 10, dw + 20, dh + 10);
  ctx.fillStyle = "#7d8494"; ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = "#3b404c"; ctx.fillRect(dx + 30, dy + 30, dw - 60, 95);
  ctx.fillStyle = "#c9ccd4"; ctx.fillRect(dx + dw - 26, dy + 160, 10, 50);
  ctx.fillStyle = "#23a35a"; rr(dx + 4, dy - 62, 132, 40, 5); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "900 22px InterBlk"; ctx.textAlign = "center"; ctx.fillText("AUSGANG", dx + 70, dy - 34); ctx.textAlign = "left";
  // Boden
  const fg = ctx.createLinearGradient(0, FLOOR_Y, 0, SCENE_BOT);
  fg.addColorStop(0, "#2b2d35"); fg.addColorStop(1, "#1b1c22");
  ctx.fillStyle = fg; ctx.fillRect(0, FLOOR_Y, W, SCENE_BOT - FLOOR_Y);
  ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 2;
  for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(540 + k * 60, FLOOR_Y); ctx.lineTo(540 + k * 150, SCENE_BOT); ctx.stroke(); }
  for (let y = FLOOR_Y + 30, s = 30; y < SCENE_BOT; s *= 1.25, y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (const [x, y, a] of STARS) { ctx.fillStyle = `rgba(255,255,255,${0.04 + a * 0.06})`; ctx.fillRect(x, y, 2, 2); }
}

// ------------------------------------------------------------------ Lehrerin am Pult
function teacher(t, real, stare) {
  const [x, top] = TEACH;
  const col = "#b7a2e0", sh = "rgba(50,20,90,0.2)";
  body(x, top + 40, 120, 150, col, sh);
  const hx = x, hy = top - 128, r = 50;
  // Haare (Dutt)
  ctx.fillStyle = "#5a3a2a"; ctx.beginPath(); ctx.arc(hx + 2, hy - r - 6, 20, 0, 7); ctx.fill();
  head(hx, hy, r, col);
  ctx.fillStyle = "#5a3a2a"; ctx.beginPath(); ctx.arc(hx, hy - 10, r, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  // Brille
  ctx.strokeStyle = "#24202b"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(hx - 17, hy - 3, 13, 0, 7); ctx.moveTo(hx + 30, hy - 3); ctx.arc(hx + 17, hy - 3, 13, 0, 7); ctx.moveTo(hx - 4, hy - 3); ctx.lineTo(hx + 4, hy - 3); ctx.stroke();
  if (stare) { eyes(hx, hy, r, "wide", -1); mouth(hx, hy, r, "flat"); }
  else {
    // trinkt Kaffee, Augen zu, zufrieden
    eyes(hx, hy, r, "happy"); mouth(hx, hy, r, "smile");
  }
  // Pult
  ctx.fillStyle = "#6b5039"; rr(x - 150, top, 300, 24, 6); ctx.fill();
  ctx.fillStyle = "#58402c"; ctx.fillRect(x - 140, top + 24, 280, FLOOR_Y - top + 60);
  ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(x - 140, top + 24, 280, 6);
  // Kaffeetasse (in Wirklichkeit) / Notizblock mit wildem Schreiben (im Kopf)
  if (real) {
    const sip = Math.max(0, Math.sin((t - REAL.sip[0]) * 1.6)) * ramp(t, REAL.sip[0], REAL.sip[0] + 0.3) * (1 - ramp(t, REAL.sip[1], REAL.sip[1] + 0.3));
    const mx = lerp(x - 70, hx + 10, sip), my = lerp(top - 20, hy + 34, sip);
    arm(x - 52, top - 60, mx - 4, my + 8, col, 26);
    ctx.fillStyle = "#e9e4da"; rr(mx - 20, my - 26, 40, 46, 8); ctx.fill();
    ctx.strokeStyle = "#e9e4da"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(mx + 22, my - 4, 10, -1.3, 1.3); ctx.stroke();
    for (let k = 0; k < 2; k++) {
      const ph = (t * 0.8 + k * 0.5) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * Math.sin(ph * Math.PI)})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(mx - 6 + k * 12, my - 32 - ph * 40); ctx.quadraticCurveTo(mx + 6 + k * 12, my - 44 - ph * 40, mx - 6 + k * 12, my - 58 - ph * 40); ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#f4f1e6"; rr(x - 60, top - 26, 120, 30, 4); ctx.fill();
    const px = x - 40 + ((t * 300) % 80), py = top - 20 + Math.sin(t * 40) * 4;
    arm(x + 50, top - 60, px, py, col, 26);
    ctx.strokeStyle = "#e5232f"; ctx.lineWidth = 3;
    ctx.beginPath(); for (let k = 0; k < 8; k++) ctx.lineTo(x - 50 + k * 10, top - 14 + (k % 2) * 6); ctx.stroke();
  }
  return [hx, hy, r];
}

// ------------------------------------------------------------------ Mitschüler (von hinten)
const SCOL = ["#e58bc0", "#e58e4f", "#5fbfad"];
function student(i, t, real, stare) {
  const x = STUD[i], col = SCOL[i];
  const sleeping = real && i === 1;
  const hy = sleeping ? DESK_Y - 46 : DESK_Y - 150, hx = sleeping ? x - 20 : x, r = 52;
  // Körper (Rücken)
  ctx.fillStyle = col; rr(x - 66, DESK_Y - 115, 132, 150, 60); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)"; rr(x + 8, DESK_Y - 105, 46, 130, 22); ctx.fill();
  if (stare) {   // im Kopf: alle drehen sich um und starren
    head(hx, hy, r, col);
    eyes(hx, hy, r, "wide", 0);
    mouth(hx, hy, r, "flat");
  } else {
    head(hx, hy, r, col);
    ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.beginPath(); ctx.arc(hx + 10, hy + 8, r * 0.9, 0, 7); ctx.fill();
  }
  // Frisuren
  if (i === 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx + 4, hy - r - 6, 17, 0, 7); ctx.fill(); }
  if (i === 1) { ctx.fillStyle = "#e3373f"; ctx.fillRect(hx - r + 4, hy - r * 0.6, 2 * r - 8, 12); }
  if (i === 2) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(hx + r * 0.9, hy - r * 0.15, 12, 26, 0.5, 0, 7); ctx.fill(); }
  // Tätigkeit in Wirklichkeit
  if (real && i === 0) {           // Selfie
    let flash = 0;
    for (const tf of REAL.flashes) flash = Math.max(flash, 1 - Math.abs(t - tf) / 0.15);
    arm(x + 52, DESK_Y - 80, x + 82, DESK_Y - 200, col);
    phoneUp(x + 86, DESK_Y - 222, clamp(flash));
  }
  if (real && i === 2) {           // Kritzeln
    const px = x - 30 + Math.sin(t * 9) * 26, py = DESK_Y - 12 + Math.cos(t * 13) * 5;
    arm(x + 40, DESK_Y - 80, px + 20, py, col);
    ctx.strokeStyle = "#ffcf3f"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px + 20, py); ctx.lineTo(px + 6, py - 26); ctx.stroke();
  }
  // Pult
  ctx.fillStyle = "#7a5c40"; rr(x - 140, DESK_Y, 280, 22, 5); ctx.fill();
  ctx.fillStyle = "#5e4530"; ctx.fillRect(x - 130, DESK_Y + 22, 260, SCENE_BOT - DESK_Y);
  ctx.fillStyle = "#f4f1e6"; ctx.save(); ctx.translate(x - 50, DESK_Y + 4); ctx.rotate(-0.08); ctx.fillRect(-30, -4, 70, 12); ctx.restore();
  if (real && i === 2) {           // Gekritzel auf dem Blatt
    ctx.strokeStyle = "#3a6fd8"; ctx.lineWidth = 2;
    ctx.beginPath(); for (let k = 0; k < 10; k++) ctx.lineTo(x - 76 + k * 6, DESK_Y + 3 + Math.sin(k * 1.7) * 3); ctx.stroke();
  }
  if (sleeping) {                  // Kopf auf dem Pult, Zzz
    arm(x - 60, DESK_Y - 60, x - 70, DESK_Y - 8, col, 30);
    for (let k = 0; k < 3; k++) {
      const ph = ((t - REAL.snore[0]) * 0.7 + k / 3) % 1;
      if (t < REAL.snore[0]) continue;
      ctx.globalAlpha = Math.sin(ph * Math.PI);
      ctx.fillStyle = "#cfd6ff"; ctx.font = `900 ${26 + ph * 22}px InterBlk`;
      ctx.fillText("Z", hx + 40 + ph * 50, hy - 40 - ph * 90);
      ctx.globalAlpha = 1;
    }
  }
  return [hx, hy, r];
}

// ------------------------------------------------------------------ Hauptfigur mit Karteikarten
function indexCards(x, y, rot, n = 3) {
  for (let k = n - 1; k >= 0; k--) {
    ctx.save(); ctx.translate(x + k * 4, y - k * 4); ctx.rotate(rot + k * 0.06);
    ctx.fillStyle = "#fbfaf3"; rr(-28, -20, 56, 40, 4); ctx.fill();
    ctx.strokeStyle = "rgba(60,90,200,0.5)"; ctx.lineWidth = 2;
    for (let l = 0; l < 3; l++) { ctx.beginPath(); ctx.moveTo(-20, -8 + l * 9); ctx.lineTo(18, -8 + l * 9); ctx.stroke(); }
    ctx.restore();
  }
}
function hero(t, real) {
  let x, f, walkP, face = "worried", alpha = 1, talking = false;
  if (!real) {
    const p = easeIO(ramp(t, HEAD.walk[0], HEAD.walk[1]));
    x = lerp(HERO_A[0], HERO_B[0], p); f = lerp(HERO_A[1], HERO_B[1], p);
    walkP = t > HEAD.walk[0] && t < HEAD.walk[1];
    alpha = easeOut(ramp(t, HEAD.enter, HEAD.enter + 0.3));
    talking = t > HEAD.say[0][0] && t < HEAD.say[1][1];
    if (t >= HEAD.faint && t < HEAD.faint + 0.55) face = "x";
    else if (t >= HEAD.faint + 0.55) face = "sad";
    else if (t > HEAD.alarm[0]) face = "shock";
  } else {
    const p = easeIO(ramp(t, REAL.walk[0], REAL.walk[1]));
    x = lerp(HERO_A[0], HERO_B[0], p); f = lerp(HERO_A[1], HERO_B[1], p);
    walkP = t > REAL.walk[0] && t < REAL.walk[1];
    talking = t > REAL.say[0][0] && t < REAL.say[1][1];
    face = t >= REAL.smile ? "happy" : "neutral";
  }
  const bob = walkP ? -Math.abs(Math.sin(t * 11)) * 12 : 0;
  const sway = walkP ? Math.sin(t * 11) * 0.05 : 0;
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.translate(x, f + bob); ctx.rotate(sway); ctx.translate(-x, -(f + bob));
  const col = real ? "#efebe2" : "#f6a3a0", sh = real ? "rgba(0,0,0,0.1)" : "rgba(160,30,40,0.18)";
  const ff = f + bob;
  if (!real) {
    const g = ctx.createRadialGradient(x, ff - 120, 10, x, ff - 120, 230);
    g.addColorStop(0, "rgba(255,170,170,0.35)"); g.addColorStop(1, "rgba(255,170,170,0)");
    ctx.fillStyle = g; ctx.fillRect(x - 240, ff - 360, 480, 480);
  }
  const dropping = !real && t >= HEAD.drop;
  const ax = x + 46, ay = ff - 135;
  const shakeH = !real && t > HEAD.say[1][0] && !dropping ? Math.sin(t * 50) * 4 : 0;
  if (!dropping) {
    arm(ax, ay, ax + 44, ay + 30 + shakeH, col, 24);
    indexCards(ax + 52, ay + 30 + shakeH, -0.15);
  } else arm(ax, ay, ax + 12, ay + 80, col, 24);
  // linker Arm gestikuliert beim Reden
  const gest = talking ? Math.sin(t * 7) * 18 : 0;
  arm(x - 46, ff - 135, x - 70, ff - 70 - gest, col, 24);
  body(x, ff, 112, 190, col, sh);
  ctx.fillStyle = real ? "#c9c4b8" : "#f0f0f0";
  rr(x - 52, ff - 10, 104, 18, 8); ctx.fill();
  if (!real) {
    const beat = 1 + 0.12 * Math.max(0, Math.sin(t * (t > HEAD.alarm[0] ? 22 : 13)));
    ctx.save(); ctx.translate(x - 4, ff - 105); ctx.scale(beat, beat);
    ctx.fillStyle = "#e5232f";
    ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-46, -4, -26, -40, 0, -18); ctx.bezierCurveTo(26, -40, 46, -4, 0, 26); ctx.fill();
    ctx.restore();
    // Schweißtropfen
    if (t > HEAD.pick && t < HEAD.faint) {
      const ph = (t * 1.5) % 1;
      ctx.fillStyle = `rgba(150,210,255,${1 - ph})`;
      ctx.beginPath(); ctx.ellipse(x + 46, ff - 250 + ph * 50, 6, 9, 0, 0, 7); ctx.fill();
    }
  }
  const hx = x, hy = ff - 220, r = 52;
  head(hx, hy, r, col);
  const open = talking && Math.sin(t * 16) > 0;
  if (face === "x") { eyes(hx, hy, r, "x"); mouth(hx, hy, r, "wavy"); }
  else if (face === "sad") { eyes(hx, hy, r, "dot"); brows(hx, hy, r, "worried"); mouth(hx, hy, r, "sad"); }
  else if (face === "shock") { eyes(hx, hy, r, "wide"); brows(hx, hy, r, "worried"); mouth(hx, hy, r, "o"); }
  else if (face === "happy") { eyes(hx, hy, r, "happy"); mouth(hx, hy, r, open ? "o" : "smile"); blush(hx, hy, r); }
  else if (face === "neutral") { eyes(hx, hy, r, "dot", 0.5); mouth(hx, hy, r, open ? "o" : "flat"); }
  else { eyes(hx, hy, r, "dot"); brows(hx, hy, r, "worried"); mouth(hx, hy, r, open ? "o" : "wavy"); }
  ctx.restore();
  ctx.globalAlpha = 1;
  // Karteikarten fliegen davon
  if (dropping) {
    const p = ramp(t, HEAD.drop, HEAD.land + 0.4);
    for (let k = 0; k < 5; k++) {
      const dx = (k - 2) * 70 * p, dy = lerp(0, 120 + (k % 2) * 20, p * p) - Math.sin(p * Math.PI) * 60;
      indexCards(ax + 52 + dx, ay + 30 + dy, k * 0.9 * p - 0.15, 1);
    }
    const fl = ramp(t, HEAD.land, HEAD.land + 0.35);
    if (fl > 0 && fl < 1) {
      ctx.save(); ctx.translate(ax + 52, HERO_B[1] - 10);
      ctx.globalAlpha = 1 - fl;
      ctx.fillStyle = "#fff";
      const s = 1 + fl * 1.2;
      ctx.beginPath(); ctx.moveTo(0, -110 * s); ctx.lineTo(16 * s, -16 * s); ctx.lineTo(110 * s, 0); ctx.lineTo(16 * s, 16 * s); ctx.lineTo(0, 110 * s); ctx.lineTo(-16 * s, 16 * s); ctx.lineTo(-110 * s, 0); ctx.lineTo(-16 * s, -16 * s); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 120 * s, 24 * s, 0, 0, 7); ctx.stroke();
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
  return [hx, hy + bob, r];
}

// Sprechblase der Hauptfigur
function speech(x, y, txt, p, shaky) {
  const sc = back(p);
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x + (shaky ? Math.sin(performance.now ? 0 : 0) : 0), y); ctx.scale(sc, sc);
  ctx.font = "600 34px InterSB";
  const w = ctx.measureText(txt).width + 46, h = 66;
  ctx.fillStyle = "#fbfbfd";
  rr(-w / 2, -h, w, h, 30); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, -4); ctx.lineTo(-10, -4); ctx.lineTo(-50, 26); ctx.fill();
  ctx.fillStyle = "#1d1b26"; ctx.textAlign = "center"; ctx.fillText(txt, 0, -h / 2 + 12); ctx.textAlign = "left";
  ctx.restore();
}
function hearts(t) {        // Herzchen: Selfie-Mädchen findet sich toll
  const [a, b] = REAL.hearts;
  if (t < a || t > b + 0.5) return;
  for (let k = 0; k < 3; k++) {
    const p = ramp(t, a + k * 0.25, a + k * 0.25 + 0.9);
    if (p <= 0 || p >= 1) continue;
    const x = STUD[0] + 110 + k * 22, y = DESK_Y - 260 - p * 80;
    ctx.globalAlpha = 1 - p; ctx.fillStyle = "#ff5a7a";
    ctx.save(); ctx.translate(x, y); ctx.scale(0.5 + 0.3 * back(p), 0.5 + 0.3 * back(p));
    ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-46, -4, -26, -40, 0, -18); ctx.bezierCurveTo(26, -40, 46, -4, 0, 26); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
// Alarm-Sternblase
function burst(t) {
  const [a, b] = HEAD.burst;
  if (t < a || t > b + 0.25) return;
  const p = Math.min(back(ramp(t, a, a + 0.3)), 1 - ramp(t, b, b + 0.25));
  if (p <= 0) return;
  const shake = Math.sin(t * 60) * 4;
  ctx.save(); ctx.translate(610 + shake, 460); ctx.scale(p * 0.92, p * 0.92); ctx.rotate(-0.04);
  ctx.beginPath();
  for (let k = 0; k < 26; k++) {
    const ang = k / 26 * Math.PI * 2, r = k % 2 ? 150 : 185;
    ctx.lineTo(Math.cos(ang) * r * 1.4, Math.sin(ang) * r * 0.8);
  }
  ctx.closePath();
  ctx.fillStyle = "#1a1b21"; ctx.fill();
  ctx.strokeStyle = "#ec4f4a"; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "900 42px InterBlk"; ctx.textAlign = "center";
  ctx.fillText("ACHTUNG:", 0, -38); ctx.fillText("ER HAT „ÄH“", 0, 12); ctx.fillText("GESAGT.", 0, 62);
  ctx.textAlign = "left";
  ctx.restore();
}

// ------------------------------------------------------------------ Szene
function drawScene(t, real) {
  drawRoom(t, real);
  const dark = real ? 0 : easeIO(ramp(t, HEAD.dark[0], HEAD.dark[1]));
  const stare = !real && t > HEAD.enter + 0.2;
  const th = teacher(t, real, stare);
  if (dark > 0) {
    ctx.fillStyle = `rgba(10,4,6,${0.82 * dark})`; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
    ctx.fillStyle = `rgba(120,10,20,${0.16 * dark})`; ctx.fillRect(0, 0, W, SCENE_BOT + 40);
    ctx.globalAlpha = dark * ramp(t, HEAD.enter, HEAD.enter + 0.4);
    eyes(th[0], th[1], th[2], "wide", -1.2);
    ctx.globalAlpha = 1;
  }
  // Mitschüler vorne
  const heads = [0, 1, 2].map(i => student(i, t, real, stare));
  if (dark > 0) {
    ctx.fillStyle = `rgba(10,4,6,${0.8 * dark})`; ctx.fillRect(0, DESK_Y - 220, W, SCENE_BOT - DESK_Y + 260);
    for (const [hx, hy, r] of heads) {
      ctx.globalAlpha = dark * ramp(t, HEAD.enter, HEAD.enter + 0.4);
      eyes(hx, hy, r, "wide", 0);
      ctx.globalAlpha = 1;
    }
  }
  // Scheinwerfer
  if (!real) {
    const p = easeIO(ramp(t, HEAD.walk[0], HEAD.walk[1]));
    const hx = lerp(HERO_A[0], HERO_B[0], p);
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
  // Sprechblasen der Hauptfigur
  if (h) {
    for (const [a, b, txt] of (real ? REAL.say : HEAD.say)) {
      if (t < a || t > b + 0.2) continue;
      const p = Math.min(ramp(t, a, a + 0.2), 1 - ramp(t, b, b + 0.15));
      const shaky = !real && txt.includes("äh");
      speech(clamp(h[0] + 150, 280, 820) + (shaky ? Math.sin(t * 60) * 4 : 0), h[1] - h[2] - 20, txt, p, shaky);
    }
  }
  if (real) hearts(t);
  if (!real) {
    for (const [who, a, b, txt] of WHISPERS) {
      if (t < a || t > b + 0.25) continue;
      const p = Math.min(ramp(t, a, a + 0.25), 1 - ramp(t, b, b + 0.2));
      const [x, y, r] = heads[who];
      const off = who === 1 ? [-40, -r - 24] : who === 2 && txt === "cringe …" ? [-60, -r - 80] : [10, -r - 24];
      ctx.globalAlpha = 0.95;
      whisper(clamp(x + off[0], 190, 860), y + off[1], txt, p);
      ctx.globalAlpha = 1;
    }
    const off = 1 - ramp(t, HEAD.cardsOff, HEAD.cardsOff + 0.2);
    for (const [who, ts, n] of HEAD.cards) {
      const [x, y, r] = heads[who];
      card(x + (who === 2 ? -80 : 80), y - r - 40, n, ramp(t, ts, ts + 0.3) * off);
    }
    burst(t);
  }
}

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
// Wertungstafeln (Schulnoten)
function card(x, y, n, p) {
  if (p <= 0) return;
  const k = back(p);
  ctx.save(); ctx.translate(x, y + (1 - k) * 60); ctx.globalAlpha = clamp(p * 3);
  ctx.fillStyle = "#c79a64"; ctx.fillRect(-4, 0, 8, 110);
  ctx.fillStyle = "#fbfbfb"; rr(-40, -90, 80, 96, 8); ctx.fill();
  ctx.strokeStyle = "#222"; ctx.lineWidth = 4; rr(-40, -90, 80, 96, 8); ctx.stroke();
  ctx.fillStyle = n.startsWith("6") ? "#e5232f" : "#141414"; ctx.font = "900 70px InterBlk"; ctx.textAlign = "center"; ctx.fillText(n, 0, -18); ctx.textAlign = "left";
  ctx.restore(); ctx.globalAlpha = 1;
}

const LABEL_Y = 1145;
function drawLabel(real, k) {
  ctx.textAlign = "center";
  ctx.font = "900 26px InterBlk"; ctx.letterSpacing = "4px";
  ctx.fillStyle = "rgba(220,224,235,0.75)";
  ctx.fillText(LABEL, TEXT_CX, LABEL_Y);
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
  await Promise.all([document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk"), document.fonts.load("500 30px InterMed"), document.fonts.load("italic 60px ISerif")]);
  buildStatic();
  return true;
};
