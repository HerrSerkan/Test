// "Nicht jeder will, dass du es schaffst." – deutsche Version (Idee: @rovo.animation), ohne Sprecher, 16,5 s.
// Nacht, Schlucht: einer klettert raus, die Menge will ihn runterziehen; oben angekommen zieht er den Freund hoch.
"use strict";
const W = 1080, H = 1920;
window.DURATION = 16.5;
const { ramp, clamp, lerp, back, easeOut, easeIO, keys, rr } = NB;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const TITLE_Y = 450, TOP = 760, FLOOR = 1480, WALL = 720, LWALL = 130;
const CLIMB = [1.6, 6.6], ALERT = 2.5, STACK = [3.0, 4.2], GRAB = [4.2, 4.9], FALL = 4.9, SUMMIT = 6.6;
const ROPE = 11.0, PULL = [12.2, 13.5], ALERT2 = 13.2, YANK = 14.0, SW = 12.2;
const CROWD_X = [205, 240, 275, 310, 345, 380, 415, 450, 485, 520];
const FRIEND_X = 585;

function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
  g.addColorStop(0, "#1a2350"); g.addColorStop(0.5, "#2c3a74"); g.addColorStop(1, "#3a4a86");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const R = NB.rng(5);
  for (let i = 0; i < 90; i++) { const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)); ctx.fillStyle = `rgba(255,255,255,${(0.2 + 0.6 * R()) * tw})`; ctx.beginPath(); ctx.arc(R() * W, R() * 740, R() * 1.8 + 0.5, 0, 7); ctx.fill(); }
  // Mond
  ctx.fillStyle = "#f4f1e0"; ctx.beginPath(); ctx.arc(150, 640, 34, 0, 7); ctx.fill();
  ctx.fillStyle = "#1f2a5c"; ctx.beginPath(); ctx.arc(166, 630, 30, 0, 7); ctx.fill();
}
function rock(x0, x1, top) {
  const g = ctx.createLinearGradient(0, top, 0, FLOOR);
  g.addColorStop(0, "#3b4a7a"); g.addColorStop(1, "#283357");
  ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, H - top);
  ctx.fillStyle = "#7f9be0"; ctx.fillRect(x0, top - 6, x1 - x0, 10);
  ctx.strokeStyle = "rgba(10,15,40,0.35)"; ctx.lineWidth = 3;
  const R = NB.rng(x0 + 3);
  for (let i = 0; i < 16; i++) {
    const y = top + 40 + R() * (FLOOR - top - 60), x = x0 + R() * (x1 - x0);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + R() * 40, y + (R() - 0.5) * 12); ctx.stroke();
  }
}
function scene(t) {
  // Schlucht-Hintergrund (dunkler)
  ctx.fillStyle = "#222b4e"; ctx.fillRect(LWALL, TOP + 60, WALL - LWALL, FLOOR - TOP);
  ctx.fillStyle = "rgba(0,0,0,0.15)"; for (let y = TOP + 120; y < FLOOR; y += 90) ctx.fillRect(LWALL, y, WALL - LWALL, 3);
  rock(-10, LWALL, TOP - 10);
  rock(WALL, W + 10, TOP);
  // Wandkante (Struktur)
  ctx.strokeStyle = "#1a2244"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(WALL, TOP); for (let y = TOP; y < FLOOR; y += 40) ctx.lineTo(WALL + (Math.sin(y * 0.07) * 5), y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(LWALL, TOP); for (let y = TOP; y < FLOOR; y += 40) ctx.lineTo(LWALL + (Math.cos(y * 0.06) * 5), y); ctx.stroke();
  // Boden
  const fg = ctx.createLinearGradient(0, FLOOR, 0, H); fg.addColorStop(0, "#4a5888"); fg.addColorStop(1, "#2a3358");
  ctx.fillStyle = fg; ctx.fillRect(0, FLOOR, W, H - FLOOR);
  const R = NB.rng(8);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(150,170,220,${0.15 + 0.2 * R()})`; ctx.beginPath(); ctx.ellipse(R() * W, FLOOR + 20 + R() * 480, 6 + R() * 8, 3 + R() * 3, 0, 0, 7); ctx.fill(); }
}

// Strichfigur. o: {body, head, face ("troll"|"hero"|"friend"), aL, aR (Grad, 0 = hängt, 180 = hoch), lL, lR (Bein-Winkel), s, dir}
function fig(x, y, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s); if (o.rot) ctx.rotate(o.rot);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  const legC = o.legs || "#2a2d3a";
  // Beine
  ctx.strokeStyle = legC; ctx.lineWidth = 11;
  for (const [a, sx] of [[o.lL || 0, -7], [o.lR || 0, 7]]) { const r = a * Math.PI / 180; ctx.beginPath(); ctx.moveTo(sx, -44); ctx.lineTo(sx + Math.sin(r) * 44, -44 + Math.cos(r) * 44); ctx.stroke(); }
  // Rumpf
  ctx.fillStyle = o.body; rr(-17, -94, 34, 54, 12); ctx.fill();
  // Arme
  ctx.strokeStyle = o.arm || o.body; ctx.lineWidth = 10;
  for (const [a, sx] of [[o.aL || 10, -1], [o.aR || 10, 1]]) {
    const r = a * Math.PI / 180, ex = sx * (16 + Math.sin(r) * 38), ey = -86 + Math.cos(r) * 38;
    ctx.beginPath(); ctx.moveTo(sx * 15, -86); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = o.skin || "#e8e8ee"; ctx.beginPath(); ctx.arc(ex, ey, 5.5, 0, 7); ctx.fill();
  }
  // Kopf
  ctx.fillStyle = o.head; ctx.beginPath(); ctx.arc(0, -114, 20, 0, 7); ctx.fill();
  if (o.face === "troll") {
    ctx.strokeStyle = "#2a2d3a"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(-7, -118, 4, 0, 7); ctx.arc(7, -118, 4, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-11, -107); ctx.quadraticCurveTo(0, -100, 11, -107); ctx.stroke();
  } else {
    ctx.fillStyle = "#1a1d2a"; for (const ex of [-6, 8]) { ctx.beginPath(); ctx.arc(ex, -117, 2.6, 0, 7); ctx.fill(); }
    if (o.smile) { ctx.strokeStyle = "#1a1d2a"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(1, -110, 6, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  }
  if (o.scarf) { ctx.strokeStyle = o.scarf; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-14, -92); ctx.lineTo(14, -92); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, -92); ctx.quadraticCurveTo(-24 - Math.sin(T * 6) * 4, -78, -30, -62); ctx.stroke(); }
  if (o.hood) { ctx.strokeStyle = o.body; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -114, 22, 0.75 * Math.PI, 2.25 * Math.PI); ctx.stroke(); }
  ctx.restore();
}
let T = 0;
const HERO = { body: "#1d2140", head: "#f2f2f6", hood: true, scarf: "#2f6bff", legs: "#14172e", skin: "#f2f2f6" };
const FRIEND = { body: "#f2f2f6", head: "#8a5a3c", skin: "#8a5a3c", legs: "#2a2d3a" };
const TROLL = { body: "#5c6070", head: "#d8dbe2", face: "troll", legs: "#3a3d48", skin: "#d8dbe2" };

function marks(x, y, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#ff4d4d"; ctx.font = "900 30px InterBlk"; ctx.textAlign = "center"; ctx.fillText("!", x, y - Math.abs(Math.sin(T * 12 + x)) * 4); ctx.restore();
}
function bubble(lines, x, y, tx, ty, p, size, yellow) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `900 ${size}px InterBlk`;
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 36, h = lines.length * size * 1.15 + 22;
  ctx.translate(x, y); const s = back(Math.min(1, p * 1.3)); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 3);
  ctx.fillStyle = yellow ? "#ffe9a8" : "#ffffff"; ctx.strokeStyle = "#1a1d2a"; ctx.lineWidth = 4;
  rr(-w / 2, -h / 2, w, h, 16); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, h / 2 - 2); ctx.lineTo((tx - x) * 0.4, h / 2 + 22); ctx.lineTo(10, h / 2 - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#1a1d2a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + 11 + size * 0.6 + i * size * 1.15));
  ctx.restore();
}
function title(t) {
  ctx.save(); ctx.textAlign = "center"; ctx.lineJoin = "round";
  const a = 1 - ramp(t, SW - 0.2, SW);
  const draw = (l1, l2, k) => {
    ctx.save(); ctx.translate(540, TITLE_Y); ctx.scale(k, k);
    ctx.font = "900 54px InterBlk"; ctx.lineWidth = 9; ctx.strokeStyle = "rgba(10,12,30,0.8)";
    ctx.strokeText(l1, 0, 0); ctx.fillStyle = "#ffffff"; ctx.fillText(l1, 0, 0);
    ctx.strokeText(l2, 0, 64); ctx.fillStyle = "#f4c430"; ctx.fillText(l2, 0, 64);
    ctx.restore();
  };
  if (a > 0) { ctx.globalAlpha = a; draw("NICHT JEDER WILL,", "DASS DU ES SCHAFFST.", 1); }
  const b = ramp(t, SW + 0.1, SW + 0.4);
  if (b > 0) { ctx.globalAlpha = clamp(b * 2); draw("ZIEH DEN HOCH,", "DER AN DICH GLAUBT.", back(b)); }
  ctx.restore();
}

window.renderFrame = function (t) {
  NB.ctx = ctx; T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bg(t); scene(t); title(t);

  // ---------------- Held: Klettern an der rechten Wand (x = WALL - 14)
  let hx, hy, hpose;
  const cu = ramp(t, CLIMB[0], CLIMB[1]);
  // langsamer, solange er festgehalten wird
  const prog = t < GRAB[0] ? ramp(t, CLIMB[0], GRAB[0]) * 0.6 : t < FALL ? 0.6 + ramp(t, GRAB[0], FALL) * 0.03 : 0.63 + ramp(t, FALL, CLIMB[1]) * 0.37;
  if (t < CLIMB[0]) { hx = 650; hy = FLOOR; hpose = { aL: 10, aR: t < 1.4 ? 10 : 150 }; }
  else if (t < CLIMB[1]) {
    hx = WALL - 16; hy = lerp(FLOOR - 10, TOP + 40, prog);
    const c = Math.sin(t * 9) * (t > GRAB[0] && t < FALL ? 0.3 : 1);
    hpose = { aL: 165 + c * 12, aR: 165 - c * 12, lL: 20 + c * 25, lR: 20 - c * 25, dir: 1 };
    if (t > GRAB[0] && t < FALL) hpose.lR = 20 + Math.sin(t * 30) * 30;   // strampelt sich frei
  } else {
    const st = ramp(t, SUMMIT, SUMMIT + 0.5);
    hx = lerp(WALL - 16, 790, st); hy = lerp(TOP + 30, TOP, st);
    const look = t > 7.6;
    hpose = t < ROPE ? { aL: t < 7.6 ? 160 : 10, aR: t < 7.6 ? 160 : 10, dir: look ? -1 : 1 } : t < PULL[1] + 0.2 ? { aL: 120, aR: 140, dir: -1, lL: -15, lR: 20 } : { aL: 10, aR: 10, dir: -1 };
    if (t > YANK && t < YANK + 0.8) hpose = { aL: 160, aR: 150, dir: -1, lL: -20, lR: 25 };
    if (t > 15.0) hpose = { aL: 10, aR: 170, dir: 1 };
    if (t > 7.6 && t < ROPE) hx = lerp(790, 760, ramp(t, 7.6, 8.4));
    else if (t >= ROPE) hx = 760;
  }
  // Leuchten beim Gipfel
  const glow = ramp(t, SUMMIT - 0.3, SUMMIT + 0.3) * (1 - ramp(t, 7.8, 8.8));
  if (glow > 0) {
    const gg = ctx.createRadialGradient(hx, hy - 80, 10, hx, hy - 80, 220); gg.addColorStop(0, `rgba(200,220,255,${0.55 * glow})`); gg.addColorStop(1, "rgba(200,220,255,0)");
    ctx.fillStyle = gg; ctx.fillRect(hx - 240, hy - 300, 480, 480);
  }

  // ---------------- Seil
  let ropeEnd = null;
  if (t > ROPE) {
    const down = easeOut(ramp(t, ROPE, ROPE + 0.8));
    const up = ramp(t, PULL[0], PULL[1]);
    const yank = easeOut(ramp(t, YANK, YANK + 0.6));
    const len = (FLOOR - 40 - TOP) * down * (1 - up * 0.0) ;
    let endY = TOP + len;
    if (t > PULL[0]) endY = lerp(FLOOR - 40, TOP + 20, easeIO(up));
    if (t > ALERT2 + 0.3) endY = Math.min(endY, lerp(TOP + 20, TOP + 20, yank));
    ropeEnd = [WALL + 6, endY];
    if (!(t > PULL[1] && t > YANK + 0.6)) {
      ctx.strokeStyle = "#2f6bff"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(hx - 20, hy - 86); ctx.quadraticCurveTo(WALL + 10, TOP - 10, WALL + 6, TOP + 4); ctx.lineTo(ropeEnd[0], ropeEnd[1]); ctx.stroke();
    }
  }

  // ---------------- Freund
  let fx = FRIEND_X, fy = FLOOR, fpose = { aL: 10, aR: 10, smile: true };
  if (t < 1.5) fpose = { aL: 150 + Math.sin(t * 10) * 15, aR: 160, smile: true };
  else if (t < FALL + 0.4) fpose = { aL: 120 + Math.sin(t * 8) * 30, aR: 110 - Math.sin(t * 8) * 30, smile: true, dir: 1 };
  else if (t < SUMMIT + 0.2) fpose = { aL: 10, aR: 10 };
  else if (t < ROPE) fpose = { aL: 165, aR: 165, smile: true };
  if (t > ROPE + 0.8 && t < PULL[0]) { fx = lerp(FRIEND_X, WALL - 20, ramp(t, ROPE + 0.8, PULL[0] - 0.1)); fpose = { aL: 10, aR: 160, smile: true }; }
  if (t >= PULL[0] && ropeEnd) {
    fx = WALL - 14; fy = Math.min(FLOOR, ropeEnd[1] + 140);
    fpose = { aL: 170, aR: 170, lL: 15 + Math.sin(t * 8) * 15, lR: -10 - Math.sin(t * 8) * 15 };
  }
  if (t >= PULL[1]) { const k = ramp(t, PULL[1], PULL[1] + 0.4); fx = lerp(WALL - 14, 830, k); fy = lerp(TOP + 20, TOP, k); fpose = { aL: 10, aR: 10, smile: true, dir: -1 }; }
  if (t > 15.0) fpose = { aL: 170, aR: 10, smile: true, dir: -1 };

  // ---------------- Menge
  const crowd = CROWD_X.map((x, i) => {
    let cx = x, cy = FLOOR, pose = { aL: 10, aR: 10 }, rot = 0;
    const bob = Math.abs(Math.sin(t * 3 + i)) * 2;
    cy -= bob;
    // Pyramide: 4-3-2-1
    const lvl = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3][i], pos = [0, 1, 2, 3, 0, 1, 2, 0, 1, 0][i];
    const stackX = 545 + pos * 42 + lvl * 21, stackY = FLOOR - lvl * 135;
    const k = easeIO(ramp(t, STACK[0] + lvl * 0.25, STACK[0] + 0.5 + lvl * 0.25));
    const fallK = ramp(t, FALL, FALL + 0.6);
    if (k > 0 && fallK < 1) {
      cx = lerp(x, stackX, k); cy = lerp(cy, stackY, k) ;
      pose = { aL: 170, aR: 170 };
      if (fallK > 0) { const dir = i % 2 ? 1 : -1; cx = stackX + dir * fallK * (60 + i * 8); cy = lerp(stackY, FLOOR, fallK * fallK) - Math.sin(fallK * Math.PI) * 40; rot = dir * fallK * 1.4; }
    } else if (fallK >= 1) {
      const dir = i % 2 ? 1 : -1; const back2 = ramp(t, FALL + 1.2, FALL + 2.2);
      cx = lerp(stackX + dir * (60 + i * 8), x, back2); cy = FLOOR - bob; rot = dir * 1.4 * (1 - ramp(t, FALL + 0.6, FALL + 1.0));
    }
    // Angriff aufs Seil
    if (t > ALERT2 + 0.2) {
      const r = easeIO(ramp(t, ALERT2 + 0.2 + i * 0.03, YANK + 0.1));
      cx = lerp(cx, 600 + (i % 5) * 22, r); pose = { aL: 170, aR: 160 };
      if (t > YANK + 0.4) { const fk = ramp(t, YANK + 0.4, YANK + 1.0); const dir = i % 2 ? 1 : -1; rot = dir * Math.sin(fk * Math.PI) * 0.9; cy = FLOOR - Math.sin(fk * Math.PI) * 30; if (t > YANK + 1) pose = { aL: 60, aR: 60 }; }
    }
    return { cx, cy, pose, rot, i };
  });
  // Zeichnen (hinten zuerst)
  crowd.forEach(c => fig(c.cx, c.cy, { ...TROLL, ...c.pose, rot: c.rot, s: 1.25 }));
  fig(fx, fy, { ...FRIEND, ...fpose, s: 1.25 });
  fig(hx, hy, { ...HERO, ...hpose, s: 1.25 });
  // Staub beim Sturz
  const dust = ramp(t, FALL + 0.4, FALL + 1.2);
  if (dust > 0 && dust < 1) for (let i = 0; i < 8; i++) { ctx.fillStyle = `rgba(200,210,240,${0.5 * (1 - dust)})`; ctx.beginPath(); ctx.arc(560 + (i - 3.5) * 40 * (0.6 + dust), FLOOR - 10 - dust * 20, 18 + dust * 14, 0, 7); ctx.fill(); }
  // Ausrufezeichen
  const a1 = ramp(t, ALERT, ALERT + 0.1) * (1 - ramp(t, ALERT + 0.9, ALERT + 1.1));
  const a2 = ramp(t, ALERT2, ALERT2 + 0.1) * (1 - ramp(t, ALERT2 + 0.7, ALERT2 + 0.9));
  crowd.forEach(c => { marks(c.cx, c.cy - 190, a1); marks(c.cx, c.cy - 190, a2); });
  // Sprechblasen
  bubble(["DU SCHAFFST DAS!"], 470, FLOOR - 270, FRIEND_X, FLOOR - 175, ramp(t, 0.1, 0.3) * (1 - ramp(t, 1.4, 1.6)), 30, true);
  bubble(["KOMM HOCH!"], 560, TOP - 120, hx - 30, TOP - 120, ramp(t, ROPE + 0.2, ROPE + 0.4) * (1 - ramp(t, PULL[0], PULL[0] + 0.2)), 28, true);
  bubble(["MIST!"], 420, FLOOR - 270, 470, FLOOR - 180, ramp(t, YANK + 0.7, YANK + 0.9) * (1 - ramp(t, 16.0, 16.3)), 32, false);
  // Abschluss: Herz zwischen beiden
  const hk = ramp(t, 15.0, 15.3);
  if (hk > 0) NB.heart((hx + fx) / 2, TOP - 200 - Math.sin(t * 3) * 4, 1.0 * back(hk), 1);
};
window.exportEvents = function () {
  return { duration: window.DURATION, climb: CLIMB, alert: ALERT, stack: STACK, grab: GRAB, fall: FALL, summit: SUMMIT, rope: ROPE, pull: PULL, alert2: ALERT2, yank: YANK, sw: SW };
};
window.setup = async function () {
  await document.fonts.load("900 50px InterBlk");
  return { duration: window.DURATION };
};
