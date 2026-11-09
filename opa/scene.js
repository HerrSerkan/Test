// "Wie viele Stunden noch?" – eigene Geschichte, eigene Zeichnung. Stimme: Edge TTS (de-DE-ConradNeural).
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";
const W = 1080, H = 1920;
const TEXT_TOP = 1130, TEXT_CX = 500, TEXT_W = 820;
const SC = [300, 1080];                     // Szene
const FL = 960;                             // Boden
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let TL = null, TOK = [], S = [];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function Wt(si, text, nth = 0) {
  const n = norm(text); const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) return S[si] + 0.3;
  return hits[Math.min(nth, hits.length - 1)].s;
}
function sentenceAt(t) { let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k] - 0.15) i = k; return i; }

// ------------------------------------------------------------ Figuren (eigene Bohnen-Form)
function face(x, y, r, f, look = 0) {
  const k = r / 40; ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = "#24262e"; ctx.strokeStyle = "#24262e"; ctx.lineWidth = 3.4; ctx.lineCap = "round";
  const lx = look * 6;
  const eyes = (big) => { for (const s of [-1, 1]) { circle(s * 13 + lx, -4, big ? 6 : 4.4, "#24262e"); if (big) circle(s * 13 + lx + 2, -6, 2, "#fff"); } };
  const happy = () => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 13, -1, 6, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); } };
  switch (f) {
    case "smile": eyes(false); ctx.beginPath(); ctx.arc(0, 8, 9, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); break;
    case "happy": happy(); ctx.beginPath(); ctx.arc(0, 8, 10, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); break;
    case "laugh": happy(); ctx.beginPath(); ctx.arc(0, 8, 11, 0, Math.PI); ctx.closePath(); ctx.fill(); break;
    case "sad": eyes(false); ctx.beginPath(); ctx.arc(0, 22, 9, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); break;
    case "wide": eyes(true); ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(6, 16); ctx.stroke(); break;
    case "whistle": eyes(false); ctx.beginPath(); ctx.ellipse(8, 16, 4, 5, 0, 0, Math.PI * 2); ctx.fill(); break;
    case "annoyed": for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 13 - 6, -4); ctx.lineTo(s * 13 + 6, -4); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(6, 14); ctx.stroke(); break;
    default: eyes(false); ctx.beginPath(); ctx.moveTo(-6, 15); ctx.lineTo(6, 15); ctx.stroke();
  }
  ctx.restore();
}
// Figur stehend: Füße auf fy. o: {c1,c2, f, look, hair, hat, beard, apron, hood, walk, arm:[{side, ang}], s}
function person(x, fy, o) {
  const s = (o.s || 1) * 1.35, r = 40 * s;   // Grundgröße etwas größer
  const bob = o.walk ? Math.abs(Math.sin(o.walk)) * 5 : 0;
  const hy = fy - r * 4.3 - bob;
  // Beine
  ctx.fillStyle = o.legs || "#2b2f45";
  for (const sd of [-1, 1]) { const sw = o.walk ? Math.sin(o.walk + (sd > 0 ? 0 : Math.PI)) * 12 * s : 0; rr(x + sd * r * 0.36 - r * 0.2 + sw, fy - r * 1.4, r * 0.4, r * 1.4, r * 0.18); ctx.fill(); circle(x + sd * r * 0.36 + sw, fy - 4, r * 0.25, "#f4f4f2"); }
  // Körper
  ctx.fillStyle = o.c2; rr(x - r * 1.0, hy + r * 0.8, r * 2.0, r * 2.4, [r, r, r * 0.3, r * 0.3]); ctx.fill();
  if (o.apron) { ctx.fillStyle = "#6b4a2c"; rr(x - r * 0.6, hy + r * 1.4, r * 1.2, r * 1.8, r * 0.15); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(x - r * 0.3, hy + r * 2.0, r * 0.6, r * 0.25); }
  if (o.hood) { ctx.fillStyle = "rgba(0,0,0,0.12)"; rr(x - r * 0.7, hy + r * 0.8, r * 1.4, r * 0.4, r * 0.2); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 8 * s, hy + r * 1.1); ctx.lineTo(x - 8 * s, hy + r * 1.6); ctx.moveTo(x + 8 * s, hy + r * 1.1); ctx.lineTo(x + 8 * s, hy + r * 1.6); ctx.stroke(); }
  // Arme
  for (const a of o.arm || [{ side: -1, ang: 0.15 }, { side: 1, ang: -0.15 }]) {
    ctx.save(); ctx.translate(x + a.side * r * 0.85, hy + r * 1.25); ctx.rotate(a.ang);
    ctx.fillStyle = o.c2; rr(-r * 0.17, -r * 0.1, r * 0.34, r * 1.6, r * 0.17); ctx.fill();
    circle(0, r * 1.55, r * 0.2, o.c1);
    ctx.restore();
  }
  // Kopf
  const g = ctx.createRadialGradient(x - r * 0.35, hy - r * 0.4, r * 0.1, x, hy, r);
  g.addColorStop(0, o.c1); g.addColorStop(1, o.c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, hy, r, 0, Math.PI * 2); ctx.fill();
  if (o.hair) { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(x, hy - r * 0.15, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
  if (o.white) { ctx.fillStyle = "#eef0f4"; circle(x - r * 0.9, hy - r * 0.1, r * 0.32, "#eef0f4"); circle(x + r * 0.9, hy - r * 0.1, r * 0.32, "#eef0f4"); }
  face(x, hy + (o.hair ? 4 : 0), r, o.f || "neutral", o.look || 0);
  if (o.beard) { ctx.fillStyle = "#eef0f4"; ctx.beginPath(); ctx.ellipse(x, hy + r * 0.36, r * 0.42, r * 0.14, 0, 0, Math.PI * 2); ctx.fill(); }
  if (o.glasses) { ctx.strokeStyle = "#3a3d4a"; ctx.lineWidth = 2.6; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sd * 13 * s, hy - 2, 10 * s, 0, Math.PI * 2); ctx.stroke(); } }
  if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.arc(x, hy - r * 0.3, r * 0.98, Math.PI, 0); ctx.fill(); rr(x - 4, hy - r * 0.38, r * 1.3, 8, 3); ctx.fill(); }
  return { hx: x, hy };
}
// Hauptfigur DU (gelber Hoodie)
const DU = { c1: "#ffe08a", c2: "#f2c14e", hair: "#3a2a22", hood: true };
const OPA = { c1: "#f6e3cf", c2: "#8fa8c8", white: true, beard: true, glasses: true, apron: true };

// Stunden-Anzeige über dem Kopf
function badge(x, y, val, a = 1, opt = {}) {
  if (a <= 0) return;
  const s = (opt.s || 1) * (0.6 + 0.4 * a);
  ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.translate(x, y); ctx.scale(s, s);
  const txt = typeof val === "number" ? val.toLocaleString("de-DE") : val;
  ctx.font = "900 30px InterX"; const w = ctx.measureText(txt).width + 104;
  ctx.fillStyle = opt.up ? "rgba(36,90,60,0.95)" : "rgba(22,24,36,0.92)"; rr(-w / 2, -26, w, 52, 26); ctx.fill();
  ctx.strokeStyle = opt.up ? "#7fe0a6" : "#f6b23a"; ctx.lineWidth = 2.5; rr(-w / 2, -26, w, 52, 26); ctx.stroke();
  // Sanduhr
  const ix = -w / 2 + 28; ctx.fillStyle = opt.up ? "#7fe0a6" : "#f6b23a";
  ctx.beginPath(); ctx.moveTo(ix - 9, -14); ctx.lineTo(ix + 9, -14); ctx.lineTo(ix, 0); ctx.lineTo(ix + 9, 14); ctx.lineTo(ix - 9, 14); ctx.lineTo(ix, 0); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(txt, ix + 18, 2);
  ctx.font = "700 14px InterX"; ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.fillText("STD", ix + 22 + ctx.measureText(txt).width + (30 - 14) * 0 + 8, 6);
  ctx.restore();
}
const pop = (t, t0) => back(ramp(t, t0, t0 + 0.3));

// ------------------------------------------------------------ Hintergründe
function bgStreet(t) {
  let g = ctx.createLinearGradient(0, SC[0], 0, FL); g.addColorStop(0, "#8fc6ec"); g.addColorStop(1, "#d8eef9");
  ctx.fillStyle = g; ctx.fillRect(0, SC[0], W, FL - SC[0]);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = ["#c9a98a", "#b8c2d4", "#d9b48a", "#a8b8c8"][i % 4]; const x = i * 140 - 20, h = 300 + (i % 3) * 90; ctx.fillRect(x, FL - h, 130, h); ctx.fillStyle = "rgba(255,255,255,0.55)"; for (let k = 0; k < 6; k++) ctx.fillRect(x + 18 + (k % 2) * 56, FL - h + 30 + Math.floor(k / 2) * 70, 36, 40); }
  ctx.fillStyle = "#8a8f9c"; ctx.fillRect(0, FL, W, 120); ctx.fillStyle = "#6a6f7c"; ctx.fillRect(0, FL, W, 8);
}
function bgOffice() {
  ctx.fillStyle = "#dfe6f0"; ctx.fillRect(0, SC[0], W, FL - SC[0]);
  ctx.fillStyle = "#c8d4e4"; ctx.fillRect(60, 380, 420, 260); ctx.fillStyle = "#a8c8ea"; ctx.fillRect(74, 394, 392, 232);
  ctx.fillStyle = "#5a6a82"; ctx.fillRect(0, FL, W, 120);
  ctx.fillStyle = "#7a5a3a"; ctx.fillRect(160, FL - 170, 360, 18); ctx.fillRect(180, FL - 152, 14, 152); ctx.fillRect(490, FL - 152, 14, 152);
  ctx.fillStyle = "#1d1d22"; rr(320, FL - 290, 150, 110, 8); ctx.fill(); ctx.fillStyle = "#7fd0ff"; ctx.fillRect(332, FL - 280, 126, 88);
  circle(560, FL - 200, 30, "#4a9a5a"); ctx.fillStyle = "#c8743a"; rr(540, FL - 180, 40, 50, 6); ctx.fill();
}
function bgElevator(t, open) {
  ctx.fillStyle = "#c8ccd6"; ctx.fillRect(0, SC[0], W, FL - SC[0]);
  ctx.fillStyle = "#e9ecf2"; ctx.fillRect(240, 360, 600, FL - 360);
  ctx.fillStyle = "#f6f2e6"; ctx.fillRect(250, 370, 580, FL - 370);
  const o = open * 280;
  ctx.fillStyle = "#9aa3b4"; ctx.fillRect(250, 370, 290 - o, FL - 370); ctx.fillRect(540 + o, 370, 290 - o, FL - 370);
  ctx.fillStyle = "#1d1d22"; rr(870, 560, 50, 90, 8); ctx.fill(); circle(895, 590, 10, "#ffd36e"); circle(895, 620, 10, "#5a6070");
  ctx.fillStyle = "#4a4f5c"; ctx.fillRect(0, FL, W, 120);
}
function bgHome() {
  ctx.fillStyle = "#3a3458"; ctx.fillRect(0, SC[0], W, FL - SC[0]);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(700, 380, 220, 220); ctx.fillStyle = "#1a2448"; ctx.fillRect(712, 392, 196, 196); circle(860, 440, 18, "#f3f0d6");
  ctx.fillStyle = "#5a4a8a"; rr(120, FL - 240, 520, 150, 30); ctx.fill(); ctx.fillStyle = "#6a5a9a"; rr(100, FL - 120, 560, 120, 24); ctx.fill();
  ctx.fillStyle = "#2a2340"; ctx.fillRect(0, FL, W, 120);
}
function bgWorkshop(t, outside) {
  if (outside) {
    let g = ctx.createLinearGradient(0, SC[0], 0, FL); g.addColorStop(0, "#9ad0f2"); g.addColorStop(1, "#e2f2fa"); ctx.fillStyle = g; ctx.fillRect(0, SC[0], W, FL - SC[0]);
    circle(880, 400, 50, "#ffe27a"); glow(880, 400, 140, "255,226,122", 0.4);
    ctx.fillStyle = "#c86a4a"; ctx.fillRect(140, 470, 640, FL - 470); ctx.fillStyle = "#8a3a2a"; ctx.beginPath(); ctx.moveTo(110, 480); ctx.lineTo(460, 340); ctx.lineTo(810, 480); ctx.fill();
    ctx.fillStyle = "#3a2a22"; rr(340, 640, 240, FL - 640, [16, 16, 0, 0]); ctx.fill(); ctx.fillStyle = "#ffd88a"; rr(352, 652, 216, FL - 652, [12, 12, 0, 0]); ctx.fill();
    ctx.fillStyle = "#f6f2e6"; rr(330, 520, 260, 60, 8); ctx.fill(); ctx.fillStyle = "#3a2a22"; ctx.font = "900 26px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("FAHRRÄDER", 460, 551);
    ctx.fillStyle = "#6aaa5a"; ctx.fillRect(0, FL, W, 120);
  } else {
    ctx.fillStyle = "#6a4a3a"; ctx.fillRect(0, SC[0], W, FL - SC[0]);
    ctx.fillStyle = "#5a3e30"; for (let i = 0; i < 12; i++) ctx.fillRect(i * 92, SC[0], 4, FL - SC[0]);
    ctx.fillStyle = "#3a2a22"; ctx.fillRect(80, 420, 540, 16);                                         // Werkzeugwand
    for (let i = 0; i < 8; i++) { ctx.strokeStyle = "#c8ccd6"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(110 + i * 64, 444); ctx.lineTo(110 + i * 64, 520 + (i % 3) * 14); ctx.stroke(); }
    ctx.fillStyle = "#e9e4d8"; ctx.fillRect(700, 400, 220, 180); ctx.fillStyle = "#a8d8f0"; ctx.fillRect(712, 412, 196, 156);
    ctx.fillStyle = "#4a3a30"; ctx.fillRect(0, FL, W, 120);
    glow(540, 380, 300, "255,214,150", 0.18);
  }
}
function bike(x, y, s = 1, flatK = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = "#2a2d38"; ctx.lineWidth = 7;
  for (const wx of [-70, 70]) { ctx.beginPath(); ctx.arc(wx, 0, 46, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(wx, 0); ctx.lineTo(wx + Math.cos(k) * 44, Math.sin(k) * 44); ctx.stroke(); } ctx.lineWidth = 7; }
  ctx.strokeStyle = "#d9443c"; ctx.lineWidth = 8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-10, -70); ctx.lineTo(50, -70); ctx.lineTo(70, 0); ctx.moveTo(-10, -70); ctx.lineTo(0, 0); ctx.lineTo(-70, 0); ctx.moveTo(50, -70); ctx.lineTo(56, -96); ctx.stroke();
  ctx.fillStyle = "#2a2d38"; rr(-30, -84, 44, 12, 5); ctx.fill(); rr(44, -102, 34, 8, 4); ctx.fill();
  ctx.restore();
}
function bgTrain(t) {
  ctx.fillStyle = "#e6e2d8"; ctx.fillRect(0, SC[0], W, FL - SC[0]);
  ctx.fillStyle = "#cfd6e2"; rr(120, 380, 840, 300, 40); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(140, 400, 800, 260, 30); ctx.clip();
  let g = ctx.createLinearGradient(0, 400, 0, 660); g.addColorStop(0, "#9ad0f2"); g.addColorStop(1, "#d9f0e0"); ctx.fillStyle = g; ctx.fillRect(140, 400, 800, 260);
  for (let i = 0; i < 6; i++) { const x = 940 - ((t * 260 + i * 170) % 900); ctx.fillStyle = "#6aaa5a"; ctx.fillRect(x, 560, 140, 100); circle(x + 60, 560, 40, "#4a8a4a"); }
  ctx.restore();
  ctx.fillStyle = "#3a5a8a"; rr(80, FL - 260, 260, 260, 26); ctx.fill();
  ctx.fillStyle = "#5a5f6c"; ctx.fillRect(0, FL, W, 120);
}

// ------------------------------------------------------------ Szenen je Satz
function scene(t, si) {
  const st = S[si];
  if (si <= 1) {                                                        // Straße mit Zahlen über den Köpfen
    bgStreet(t);
    const zahl = Wt(0, "ZAHL");
    const ppl = [[150, { c1: "#ffd2b0", c2: "#e8a07a", cap: "#3b7dd8" }, 820], [340, { c1: "#d6e8ff", c2: "#8fb0e0", hair: "#5a3a2a" }, 3100], [560, DU, null], [760, { c1: "#e3d3ff", c2: "#b89ae8", glasses: true }, 46], [930, { c1: "#c8f0d8", c2: "#7fc8a0" }, 2200]];
    ppl.forEach(([x, o, v], i) => {
      const P = person(x + Math.sin(t * 0.8 + i) * 6, FL, { ...o, s: 0.9, f: i === 2 ? (t > zahl ? "wide" : "neutral") : "neutral", look: i === 2 ? Math.sin(t * 1.5) : 0, walk: i % 2 ? t * 6 : 0 });
      if (v) badge(P.hx, P.hy - 80, v, pop(t, zahl + i * 0.12));
    });
  } else if (si === 2) {                                                // Büro: Kollegin
    bgOffice();
    const P = person(260, FL, { c1: "#ffd2e0", c2: "#e88aa8", hair: "#3a2a22", f: "smile" });
    person(760, FL, { ...DU, f: "neutral", look: -1 });
    badge(P.hx, P.hy - 84, 3400, pop(t, Wt(2, "3.400") - 0.1));
  } else if (si === 3 || si === 18) {                                   // Aufzug: der Pfeifer
    const op = easeOut(ramp(t, st, st + 0.6));
    bgElevator(t, op);
    const P = person(460, FL, { c1: "#d8f0c8", c2: "#9ad07a", cap: "#c8302c", f: "whistle" });
    for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * p); ctx.fillStyle = "#3a3d4a"; ctx.font = "900 34px InterX"; ctx.fillText("♪", P.hx + 50 + p * 40, P.hy - 30 - p * 60); ctx.globalAlpha = 1; }
    person(680, FL, { ...DU, f: "annoyed", look: -1 });
    badge(P.hx, P.hy - 84, 90, pop(t, Wt(si, "90.") - 0.1));
  } else if (si === 4 || si === 16) {                                   // Sofa + Handy: Bruder
    bgHome();
    const call = si === 16;
    person(380, FL - 40, { ...DU, f: call ? "happy" : "neutral", arm: [{ side: 1, ang: -2.3, len: 1 }] });
    const ring = Math.sin(t * 30) * (call ? 0 : 3);
    ctx.save(); ctx.translate(520 + ring, 560); ctx.rotate(0.1);
    ctx.fillStyle = "#14161c"; rr(-60, -110, 120, 220, 16); ctx.fill();
    ctx.fillStyle = "#2a3048"; rr(-52, -100, 104, 200, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "800 20px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BRUDER", 0, -50);
    circle(0, -10, 22, "#c8d8f0");
    const swipe = call ? 0 : ramp(t, Wt(4, "weg."), Wt(4, "weg.") + 0.4);
    circle(-30 + swipe * 30, 60, 18, swipe > 0.5 ? "#d9443c" : "#d9443c"); circle(30, 60, 18, call ? "#3fbf6a" : "#3fbf6a");
    ctx.restore();
    if (!call) { badge(640, 400, 260, pop(t, Wt(4, "260.") - 0.1)); }
    else { const k = ramp(t, Wt(16, "Plus"), Wt(16, "Plus") + 0.6); badge(640, 400, Math.round(260 + 4 * k), 1, { up: k > 0 }); plusPop(720, 340, "+4", t, Wt(16, "Plus")); }
  } else if (si === 5 || si === 17) {                                   // Hamburg
    if (si === 5) {
      bgHome();
      ctx.fillStyle = "#14161c"; rr(330, 380, 420, 520, 24); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(346, 396, 388, 488, 16); ctx.clip();
      ctx.fillStyle = "#8ab8e0"; ctx.fillRect(346, 396, 388, 488); ctx.fillStyle = "#6aa0c8"; ctx.fillRect(346, 700, 388, 200);
      person(540, 900, { c1: "#ffe0d0", c2: "#e86a5a", hair: "#a8442a", f: "smile", s: 0.9 });
      ctx.restore();
      ctx.fillStyle = "#d9443c"; ctx.beginPath(); ctx.arc(420, 450, 16, Math.PI, 0); ctx.lineTo(420, 480); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "800 18px InterX"; ctx.textAlign = "left"; ctx.fillText("HAMBURG", 444, 454);
      badge(540, 360, 140, pop(t, Wt(5, "140.") - 0.1));
    } else {
      bgTrain(t);
      person(420, FL, { ...DU, f: "laugh", arm: [{ side: 1, ang: -1.2 }] });
      person(640, FL, { c1: "#ffe0d0", c2: "#e86a5a", hair: "#a8442a", f: "laugh", arm: [{ side: -1, ang: 1.2 }] });
      const k = ramp(t, Wt(17, "Plus"), Wt(17, "Plus") + 0.6);
      badge(640, 520, Math.round(140 + 12 * k), 1, { up: k > 0 }); plusPop(760, 460, "+12", t, Wt(17, "Plus"));
    }
  } else if (si === 6 || si === 7) {                                    // Opas Werkstatt
    bgWorkshop(t, false);
    bike(600, FL - 64, 1.4);
    const P = person(300, FL, { ...OPA, f: "smile", arm: [{ side: 1, ang: -1.0 + Math.sin(t * 6) * 0.15 }] });
    if (si === 7) {
      const vis = ramp(t, st, st + 0.4) * (1 - ramp(t, Wt(7, "immer.") - 0.2, Wt(7, "immer.") + 0.3));
      ctx.globalAlpha = vis; person(820, FL, { ...DU, f: "smile" }); ctx.globalAlpha = 1;
      // Osterei + Uhr "1 h"
      ctx.save(); ctx.translate(820, 420); ctx.fillStyle = "#f2c94c"; ctx.beginPath(); ctx.ellipse(0, 0, 26, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#d9443c"; ctx.fillRect(-26, -4, 52, 8); ctx.restore();
      badge(900, 500, "1 h", pop(t, Wt(7, "Stunde,")) * vis);
    }
  } else if (si === 8 || si === 9) {                                    // Opa groß + 23
    bgWorkshop(t, false);
    const z = 1 + 0.25 * easeIO(ramp(t, S[8], S[8] + 1.0));
    ctx.save(); ctx.translate(540, FL); ctx.scale(z, z); ctx.translate(-540, -FL);
    const P = person(540, FL, { ...OPA, f: si === 9 ? "smile" : "neutral" });
    badge(P.hx, P.hy - 84, 23, pop(t, Wt(8, "23.") - 0.1), { s: 1.3 });
    ctx.restore();
    if (si === 9) {                                                     // 23 Sanduhren
      for (let i = 0; i < 23; i++) {
        const k = pop(t, S[9] + 0.2 + i * 0.06); if (k <= 0) continue;
        const x = 190 + (i % 8) * 100, y = 380 + Math.floor(i / 8) * 70;
        ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = "#f6b23a";
        ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(14, -20); ctx.lineTo(0, 0); ctx.lineTo(14, 20); ctx.lineTo(-14, 20); ctx.lineTo(0, 0); ctx.fill(); ctx.restore();
      }
    }
  } else if (si === 10) {                                               // Zug: rechnen
    bgTrain(t);
    person(220, FL - 20, { ...DU, f: t > Wt(10, "WOCHENENDE.") ? "sad" : "neutral", look: 1 });
    const y0 = 760;
    const years = ramp(t, Wt(10, "Einmal"), Wt(10, "Jahren.") + 0.3);
    const n = Math.round(years * 23);
    const collapse = ramp(t, Wt(10, "Es"), Wt(10, "WOCHENENDE.") + 0.2);
    for (let i = 0; i < n; i++) {
      const x = 420 + (i % 8) * 64, y = y0 + Math.floor(i / 8) * 56;
      const tx = lerp(x, 560, easeIO(collapse)), ty = lerp(y, 800, easeIO(collapse));
      ctx.globalAlpha = 1 - collapse * 0.9; ctx.fillStyle = "#fff"; rr(tx - 24, ty - 20, 48, 40, 6); ctx.fill(); ctx.fillStyle = "#d9443c"; ctx.fillRect(tx - 24, ty - 20, 48, 10); ctx.globalAlpha = 1;
    }
    if (collapse > 0.6) {
      const k = back(ramp(t, Wt(10, "WOCHENENDE."), Wt(10, "WOCHENENDE.") + 0.3));
      ctx.save(); ctx.translate(640, 800); ctx.scale(k, k);
      for (const [dx, lab] of [[-70, "SA"], [70, "SO"]]) { ctx.fillStyle = "#fff"; rr(dx - 60, -60, 120, 120, 12); ctx.fill(); ctx.fillStyle = "#d9443c"; rr(dx - 60, -60, 120, 34, [12, 12, 0, 0]); ctx.fill(); ctx.fillStyle = "#1d1d22"; ctx.font = "900 40px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(lab, dx, 18); }
      ctx.restore();
    }
  } else if (si === 11 || si === 12) {                                  // gemeinsam schrauben
    bgWorkshop(t, false);
    bike(600, FL - 64, 1.4);
    person(260, FL, { ...OPA, f: si === 12 && t > Wt(12, "platt") ? "laugh" : "happy", look: 1, arm: [{ side: 1, ang: -1.1 }] });
    const arrive = easeOut(ramp(t, S[11], S[11] + 0.8));
    person(lerp(1120, 850, arrive), FL, { ...DU, f: si === 12 && t > Wt(12, "platt") ? "laugh" : "smile", look: -1, walk: arrive < 1 ? t * 8 : 0, arm: si === 12 ? [{ side: -1, ang: 1.1 }] : undefined });
    if (si === 12) { const k = pop(t, Wt(12, "Schraubenschlüssel")); ctx.save(); ctx.translate(690, 700); ctx.rotate(0.6); ctx.scale(k, k); ctx.strokeStyle = "#c8ccd6"; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(40, 0); ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(52, 0, 16, -2.2, 2.2); ctx.stroke(); ctx.restore(); }
  } else if (si >= 13 && si <= 15) {                                    // Tür, Blick nach oben: 23 -> 31
    bgWorkshop(t, true);
    const P = person(460, FL, { ...OPA, f: "happy", s: 0.95, arm: [{ side: 1, ang: -2.6 + Math.sin(t * 8) * 0.2 }] });
    person(780, FL, { ...DU, f: si === 13 && t > Wt(13, "31.") ? "wide" : "smile", look: -1 });
    const k = ramp(t, Wt(13, "31.") - 0.3, Wt(13, "31.") + 0.5);
    const v = Math.round(23 + 8 * easeIO(k));
    badge(P.hx, P.hy - 84, v, 1, { s: si >= 14 ? 1.25 : 1, up: k > 0.5 });
    if (si >= 14) { ctx.fillStyle = "#7fe0a6"; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6); ctx.beginPath(); ctx.moveTo(P.hx + 150, P.hy - 70); ctx.lineTo(P.hx + 174, P.hy - 110); ctx.lineTo(P.hx + 198, P.hy - 70); ctx.fill(); ctx.fillRect(P.hx + 166, P.hy - 72, 16, 40); ctx.globalAlpha = 1; }
    if (si === 15) {                                                    // "kein Countdown": Pfeil zeigt die Richtung
      const g = ctx.createLinearGradient(0, 380, 0, 520); g.addColorStop(0, "rgba(20,24,36,0.85)"); g.addColorStop(1, "rgba(20,24,36,0.85)");
      ctx.fillStyle = g; rr(140, 380, 800, 150, 20); ctx.fill();
      ctx.strokeStyle = "#ff6a6a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(200, 420); ctx.lineTo(420, 490); ctx.stroke();
      ctx.strokeStyle = "#7fe0a6"; ctx.beginPath(); ctx.moveTo(560, 490); ctx.lineTo(880, 410); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "800 22px InterX"; ctx.textAlign = "center"; ctx.fillText("nichts ändern", 310, 512); ctx.fillText("vorbeischauen", 720, 512);
    }
  } else if (si === 19) {                                               // zwei Fahrräder vor der Werkstatt
    bgWorkshop(t, true);
    bike(170, FL - 60, 1.0); bike(860, FL - 60, 1.0);
    const P = person(460, FL, { ...OPA, f: "laugh", s: 0.95, arm: [{ side: 1, ang: -2.6 + Math.sin(t * 8) * 0.25 }] });
    const k = ramp(t, S[19] + 0.4, S[19] + 2.5);
    badge(P.hx, P.hy - 84, Math.round(31 + 33 * easeOut(k)), 1, { up: true, s: 1.2 });
  }
}
function plusPop(x, y, txt, t, t0) {
  const k = ramp(t, t0, t0 + 1.2); if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * k); ctx.fillStyle = "#7fe0a6"; ctx.font = "900 54px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 8; ctx.fillText(txt, x, y - k * 50); ctx.restore();
}

// ------------------------------------------------------------------ Text
const SIZES = { plain: 64, big: 82, italic: 96, heavy: 120, spaced: 36, counter: 250 };
const LH = { plain: 1.22, big: 1.18, italic: 1.08, heavy: 1.0, spaced: 1.7, counter: 0.98 };
const ASC = { plain: 0.95, big: 0.95, italic: 0.88, heavy: 0.86, spaced: 1.0, counter: 0.86 };

function setFont(style, size) {
  ctx.letterSpacing = "0px";
  if (style === "italic") ctx.font = `italic 400 ${size}px ISerif`;
  else if (style === "heavy" || style === "counter") { ctx.font = `900 ${size}px InterBlk`; ctx.letterSpacing = `${-size * 0.015}px`; }
  else if (style === "spaced") { ctx.font = `600 ${size}px InterSB`; ctx.letterSpacing = `${size * 0.45}px`; }
  else ctx.font = `600 ${size}px InterSB`;
}

const LAYOUT = new Map();
function layoutCard(card) {
  if (LAYOUT.has(card)) return LAYOUT.get(card);
  const lines = [];
  let y = 0;
  for (const line of card.lines) {
    let scale = 1, items, width;
    for (let pass = 0; pass < 2; pass++) {
      items = []; width = 0;
      line.forEach((tok, i) => {
        const size = SIZES[tok.style] * scale;
        setFont(tok.style, size);
        const w = ctx.measureText(tok.text).width;
        const gap = i ? (tok.style === "heavy" ? size * 0.22 : size * 0.27) : 0;
        width += gap;
        items.push({ tok, size, x: width, w });
        width += w;
      });
      if (width <= TEXT_W) break;
      scale *= TEXT_W / width;
    }
    const big = items.reduce((a, b) => (b.size > a.size ? b : a));
    const st = big.tok.style;
    const lh = big.size * LH[st];
    lines.push({ items, width, y: y + big.size * ASC[st], lh });
    y += lh;
  }
  const res = { lines, height: y };
  LAYOUT.set(card, res);
  return res;
}

function drawCard(card, t) {
  const L = layoutCard(card);
  const out = ramp(t, card.end - 0.22, card.end);
  if (out >= 1) return;
  for (const line of L.lines) {
    const x0 = TEXT_CX - line.width / 2;
    for (const it of line.items) {
      const tok = it.tok;
      const p = ramp(t, tok.s - 0.04, tok.s + 0.26);
      if (p <= 0) continue;
      const a = easeOut(p) * (1 - out);
      const blur = (1 - p) * 10 + out * 14;
      const dy = (1 - easeOut(p)) * 18;
      setFont(tok.style, it.size);
      ctx.globalAlpha = a;
      ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      const heavy = tok.style === "heavy";
      ctx.shadowColor = `rgba(255,255,255,${heavy ? 0.5 : 0.3})`;
      ctx.shadowBlur = heavy ? 30 : 14;
      ctx.fillStyle = heavy && card.sentence === 19 ? "#7fe0a6" : "#fff";
      ctx.fillText(tok.text, x0 + it.x, TEXT_TOP + line.y + dy);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}


// ------------------------------------------------------------------ Bild
let GRAIN = [];
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#0b0c12"; ctx.fillRect(0, 0, W, H);
  const si = sentenceAt(t);
  ctx.save(); ctx.beginPath(); ctx.roundRect(24, SC[0], W - 48, SC[1] - SC[0], 26); ctx.clip();
  // leichter Zoom pro Satz (ständige Bewegung)
  const z = 1 + 0.03 * ramp(t, S[si] - 0.15, (S[si + 1] || TL.duration) - 0.15);
  ctx.translate(540, 690); ctx.scale(z, z); ctx.translate(-540, -690);
  scene(t, si);
  ctx.restore();
  // Überblendung beim Szenenwechsel
  const d = Math.min(...S.map(s => Math.abs(t - (s - 0.15))));
  if (d < 0.12 && si > 0) { ctx.fillStyle = `rgba(11,12,18,${0.6 * (1 - d / 0.12)})`; ctx.fillRect(24, SC[0], W - 48, SC[1] - SC[0]); }
  for (const card of TL.cards) if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  ctx.globalAlpha = 0.035; ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, TL.duration - 1.4, TL.duration - 0.2));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};
window.exportEvents = function () {
  return { scenes: S, badges: [Wt(0, "ZAHL"), Wt(2, "3.400"), Wt(3, "90."), Wt(4, "260."), Wt(5, "140."), Wt(8, "23."), Wt(13, "31."), Wt(18, "90.")],
    plus: [Wt(16, "Plus"), Wt(17, "Plus")], ring: [S[4], Wt(4, "weg.")], wochenende: Wt(10, "WOCHENENDE."), wrench: Wt(12, "Schraubenschlüssel"),
    whistle: [[S[3], S[4]], [S[18], S[19]]], duration: TL.duration };
};
window.setup = async function (timeline) {
  TL = timeline; S = TL.sentences.map(s => s.start);
  TOK = []; for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX"), document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk")]);
  let seed = 53; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return true;
};
