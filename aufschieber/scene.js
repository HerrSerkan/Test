// "Aufschieber vs. Planer" – Canvas-Animation (eigene Zeichnung). Wird von render.js Bild für Bild aufgerufen:
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const TEXT_TOP = 1120;           // Text unter der Szene – frei von TikTok-Tabs oben und Beschreibung unten
const TEXT_CX = 500;             // leicht links, damit die Buttons rechts nichts verdecken
const TEXT_W = 820;
const SCENE_TOP = 230, SCENE_BOT = 1080;
const DY = 860;                  // Oberkante Schreibtisch
const LX = 290, RX = 790;        // Aufschieber / Planer
const CAL = { x: 540, y: 470, w: 200, h: 226 };
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

let TL = null, TOK = [], T = {};

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
const mix = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Wt(si, text, nth = 0) {
  const n = norm(text);
  const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) throw new Error("Wort nicht gefunden: " + si + " " + text);
  return hits[Math.min(nth, hits.length - 1)].s;
}

function interp(keys, t) {        // keys: [[t, v], ...]
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return lerp(v0, v1, easeIO(ramp(t, t0, t1)));
    }
  }
  return keys[keys.length - 1][1];
}

// ------------------------------------------------------------------ Zeitplan
function buildTimes() {
  T.labels = 0.3;
  T.phone = Wt(2, "Der");
  T.morgen = Wt(3, "Morgen");
  T.plan = Wt(4, "Der");
  T.stueck = Wt(4, "kleines");
  T.cloud = Wt(5, "Je");
  T.dark = Wt(5, "DUNKLER");
  T.night = Wt(6, "Letzte");
  T.panic = Wt(6, "PANIK,");
  T.coffee = Wt(6, "Kaffee,");
  T.sleep = Wt(6, "Schlaf.");
  T.due = Wt(7, "ABGABETAG.");
  T.grade = Wt(8, "Eins.");
  T.broke = Wt(9, "nicht");
  T.next = Wt(10, "Und");
  T.again = Wt(11, "Fängt");
  T.last = Wt(11, "LETZTEN");
  T.end = TL.sentences[TL.sentences.length - 1].end;

  // Kalender: Tage übrig (Schritte)
  T.dayKeys = [[0, 30], [T.phone, 30], [T.plan, 24], [T.cloud, 19], [T.dark, 12], [T.night - 0.5, 2], [T.night - 0.05, 2]];
  // Wechselzeitpunkte vorberechnen
  T.flips = [];
  let prev = calValue(0);
  for (let t = 0; t < TL.duration; t += 1 / 30) {
    const v = calValue(t);
    if (v.key !== prev.key) { T.flips.push({ t, from: prev, to: v }); prev = v; }
  }
}

function calValue(t) {
  if (t >= T.next + 0.35) return { key: "30n", big: "30", small: "TAGE ÜBRIG", red: false };
  if (t >= T.due) return { key: "due", big: "HEUTE", small: "ABGABE", red: true };
  if (t >= T.night) return { key: "1", big: "1", small: "TAG ÜBRIG", red: true };
  const d = Math.round(interp(T.dayKeys, t));
  return { key: String(d), big: String(d), small: d === 1 ? "TAG ÜBRIG" : "TAGE ÜBRIG", red: false };
}

// ------------------------------------------------------------------ Posen
// Punkte relativ zu (Tischmitte, DY). Hüfte fest bei (0, 40).
const POSES = {
  idle:     { neck: [0, -150], head: [0, -202], lE: [-62, -52], lH: [-48, -6], rE: [62, -52], rH: [48, -6] },
  phone:    { neck: [0, -138], head: [0, -184], lE: [-58, -66], lH: [-12, -112], rE: [58, -66], rH: [12, -112] },
  write:    { neck: [4, -146], head: [10, -194], lE: [-64, -50], lH: [-52, -6], rE: [66, -48], rH: [44, -8] },
  panic:    { neck: [0, -140], head: [4, -186], lE: [-66, -48], lH: [-30, -8], rE: [66, -48], rH: [40, -8] },
  relax:    { neck: [-6, -152], head: [-10, -204], lE: [-84, -214], lH: [-28, -222], rE: [84, -214], rH: [28, -222] },
  raise:    { neck: [0, -152], head: [-6, -204], lE: [-62, -52], lH: [-48, -6], rE: [74, -230], rH: [66, -306] },
  collapse: { neck: [0, -66], head: [10, -46], lE: [-96, -30], lH: [-150, -6], rE: [96, -30], rH: [150, -6] },
};

function poseAt(track, t) {
  // track: [[t, name], ...] – weicher Übergang 0.35 s
  let i = 0;
  while (i + 1 < track.length && t >= track[i + 1][0]) i++;
  const cur = POSES[track[i][1]];
  const prev = i > 0 ? POSES[track[i - 1][1]] : cur;
  const k = i > 0 ? easeIO(ramp(t, track[i][0], track[i][0] + 0.35)) : 1;
  const out = { name: track[i][1], since: track[i][0] };
  for (const key of Object.keys(cur)) out[key] = [lerp(prev[key][0], cur[key][0], k), lerp(prev[key][1], cur[key][1], k)];
  return out;
}

let LTRACK, RTRACK;
function buildTracks() {
  LTRACK = [[0, "idle"], [T.phone - 0.2, "phone"], [T.night, "panic"], [T.due, "raise"], [T.broke - 0.1, "collapse"],
            [T.again, "idle"], [T.last - 0.1, "phone"]];
  RTRACK = [[0, "idle"], [T.plan - 0.2, "write"], [T.dark + 0.6, "relax"], [T.due, "raise"], [T.broke - 0.1, "relax"],
            [T.again + 0.2, "write"]];
}

// ------------------------------------------------------------------ Zeichnen
function glow(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function nightK(t) {
  return Math.max(ramp(t, T.night - 0.4, T.night + 0.3) * (1 - ramp(t, T.due - 0.1, T.due + 0.5)), 0);
}

function drawRoom(t) {
  const n = nightK(t);
  const c0 = mix([30, 36, 46], [10, 12, 20], n), c1 = mix([12, 14, 19], [3, 4, 7], n);
  const g = ctx.createRadialGradient(W / 2, 560, 60, W / 2, 620, 760);
  g.addColorStop(0, rgb(c0));
  g.addColorStop(1, rgb(c1));
  ctx.fillStyle = g;
  ctx.fillRect(0, SCENE_TOP - 40, W, SCENE_BOT - SCENE_TOP + 80);
  // Boden
  const fg = ctx.createLinearGradient(0, 1000, 0, SCENE_BOT);
  fg.addColorStop(0, `rgba(0,0,0,${0.35 + 0.2 * n})`);
  fg.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = fg;
  ctx.fillRect(0, 1000, W, SCENE_BOT - 1000 + 40);
  ctx.strokeStyle = `rgba(255,255,255,${0.07 - 0.03 * n})`;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(60, 1000); ctx.lineTo(W - 60, 1000); ctx.stroke();
  // Trennlinie in der Mitte (zwei Welten)
  const lg = ctx.createLinearGradient(0, 600, 0, 1000);
  lg.addColorStop(0, "rgba(255,255,255,0)");
  lg.addColorStop(1, "rgba(255,255,255,0.06)");
  ctx.fillStyle = lg;
  ctx.fillRect(538, 600, 4, 400);
}

function drawLabels(t) {
  const a = easeOut(ramp(t, T.labels, T.labels + 0.5));
  ctx.globalAlpha = a;
  ctx.font = "900 30px InterBlk";
  ctx.letterSpacing = "7px";
  ctx.fillStyle = "#e9edf2";
  for (const [x, s] of [[LX, "AUFSCHIEBER"], [RX, "PLANER"]]) {
    const w = ctx.measureText(s).width - 7;
    ctx.fillText(s, x - w / 2, 300 + (1 - a) * 12);
  }
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 1;
}

function calPage(x, y, v, a = 1) {
  const { w, h } = CAL;
  ctx.globalAlpha = a;
  ctx.fillStyle = v.red ? "#e8384f" : "#f2f2ee";
  rrect(x - w / 2, y, w, h, 14); ctx.fill();
  // Kopfband
  ctx.fillStyle = v.red ? "#b8243a" : "#2b2f37";
  rrect(x - w / 2, y, w, 40, [14, 14, 0, 0]); ctx.fill();
  ctx.fillStyle = v.red ? "#fff" : "#16181d";
  const big = v.big.length > 3 ? 64 : 112;
  ctx.font = `900 ${big}px InterBlk`;
  ctx.letterSpacing = `${-big * 0.02}px`;
  const bw = ctx.measureText(v.big).width;
  ctx.fillText(v.big, x - bw / 2, y + 40 + (h - 40) * 0.5 + big * 0.36 - 10);
  ctx.letterSpacing = "3px";
  ctx.font = "600 20px InterSB";
  const sw = ctx.measureText(v.small).width - 3;
  ctx.fillStyle = v.red ? "rgba(255,255,255,0.9)" : "#5b616b";
  ctx.fillText(v.small, x - sw / 2, y + h - 22);
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 1;
}

function drawCalendar(t) {
  const { x, y, w } = CAL;
  const a = easeOut(ramp(t, 0.1, 0.6));
  ctx.globalAlpha = a;
  // Blätter darunter (Stapel)
  ctx.fillStyle = "#bdbdb6";
  rrect(x - w / 2 + 6, y + 8, w - 12, CAL.h, 14); ctx.fill();
  let cur = calValue(t);
  const drop = T.flips.find(f => f.to.key === "30n" && t >= f.t && t < f.t + 0.7);
  if (drop) cur = drop.from;
  // Glühen bei rot
  if (cur.red) glow(x, y + CAL.h / 2, 260, "232,56,79", 0.22 + 0.08 * Math.sin(t * 6));
  calPage(x, y, cur, a);
  // abgerissenes Blatt fällt
  const f = [...T.flips].reverse().find(f => t >= f.t && t < f.t + 0.7);
  if (f) {
    const p = ramp(t, f.t, f.t + 0.7);
    ctx.save();
    if (f.to.key === "30n") {           // neues Blatt fällt von oben drauf
      ctx.translate(0, -(1 - easeOut(p)) * 260);
      calPage(x, y, f.to, 1);
      ctx.restore();
    } else {
      ctx.translate(x + p * 70, y + p * p * 520);
      ctx.rotate(p * 0.9);
      calPage(0, 0, f.from, 1 - p);
      ctx.restore();
    }
  }
  // Ringe
  ctx.globalAlpha = a;
  for (const dx of [-48, 48]) {
    ctx.fillStyle = "#0e1014";
    ctx.beginPath(); ctx.arc(x + dx, y + 18, 9, 0, 7); ctx.fill();
    ctx.strokeStyle = "#c9ccd2"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x + dx, y - 14); ctx.lineTo(x + dx, y + 18); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function chair(cx) {
  ctx.fillStyle = "#3a3f49";
  rrect(cx - 78, DY - 200, 156, 210, 18); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  rrect(cx - 60, DY - 180, 120, 170, 12); ctx.fill();
}

function desk(cx, t, prog, label, lamp) {
  // Lampe (nachts)
  if (lamp > 0) glow(cx - 120, DY - 30, 360, "255,196,120", 0.35 * lamp);
  // Platte
  ctx.fillStyle = "#4d525c";
  rrect(cx - 175, DY, 350, 24, 6); ctx.fill();
  ctx.fillStyle = "#2b2f37";
  rrect(cx - 160, DY + 24, 320, 120, 4); ctx.fill();
  // Beine
  ctx.fillStyle = "#24272e";
  ctx.fillRect(cx - 160, DY + 144, 22, 56);
  ctx.fillRect(cx + 138, DY + 144, 22, 56);
  // Fortschrittsbalken auf der Vorderseite
  const bx = cx - 120, by = DY + 72, bw = 240, bh = 22;
  ctx.fillStyle = "#16181d";
  rrect(bx, by, bw, bh, 11); ctx.fill();
  if (prog > 0.005) {
    const col = prog >= 0.999 ? "#5fe08f" : label === "L" ? "#f0a64b" : "#7fb6ff";
    ctx.fillStyle = col;
    rrect(bx, by, Math.max(bh, bw * prog), bh, 11); ctx.fill();
  }
  ctx.font = "600 20px InterSB";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  const s = `${Math.round(prog * 100)} %`;
  const w = ctx.measureText(s).width;
  ctx.fillText(s, cx - w / 2, by - 12);
  ctx.letterSpacing = "0px";
}

function limb(pts, w) {
  ctx.lineWidth = w;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
}

// Körper (hinter der Tischplatte) und Arme (davor) getrennt
function bodyBack(cx, P, col) {
  const at = p => [cx + p[0], DY + p[1]];
  ctx.strokeStyle = col; ctx.fillStyle = col;
  limb([at([0, 40]), at(P.neck)], 30);
  ctx.beginPath(); ctx.arc(...at(P.head), 44, 0, 7); ctx.fill();
}
function armsFront(cx, P, col) {
  const at = p => [cx + p[0], DY + p[1]];
  ctx.strokeStyle = col;
  limb([at(P.neck), at(P.lE), at(P.lH)], 22);
  limb([at(P.neck), at(P.rE), at(P.rH)], 22);
}

function paperStack(x, n) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? "#e9e9e3" : "#d9d9d2";
    ctx.fillRect(x - 46 + (i % 3) - 1, DY - 6 - i * 5, 92, 6);
  }
}

function coffee(x, k) {
  ctx.globalAlpha = k;
  ctx.fillStyle = "#e7e3da";
  rrect(x - 16, DY - 44 + (1 - k) * 20, 32, 42, 5); ctx.fill();
  ctx.strokeStyle = "#e7e3da"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x + 18, DY - 24 + (1 - k) * 20, 9, -1.4, 1.4); ctx.stroke();
  ctx.fillStyle = "#5b3b25";
  ctx.fillRect(x - 12, DY - 40 + (1 - k) * 20, 24, 6);
  ctx.globalAlpha = 1;
}

function gradePaper(x, y, t, stampT, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "#f4f4ef";
  ctx.fillRect(-62, -80, 124, 160);
  ctx.fillStyle = "#b9bcc3";
  for (let i = 0; i < 6; i++) ctx.fillRect(-46, -50 + i * 18, i === 5 ? 50 : 92, 5);
  const p = ramp(t, stampT, stampT + 0.25);
  if (p > 0) {
    const s = 1 + (1 - easeOut(p)) * 1.4;
    ctx.globalAlpha = easeOut(p);
    ctx.strokeStyle = "#e3263f"; ctx.fillStyle = "#e3263f"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(20, 26, 40 * s, 0, 7); ctx.stroke();
    ctx.font = `900 ${58 * s}px InterBlk`;
    const w = ctx.measureText("1").width;
    ctx.fillText("1", 20 - w / 2, 26 + 21 * s);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function cloud(x, y, s, dark, a, t) {
  if (a <= 0.01 || s <= 0.01) return;
  const c = mix([150, 156, 166], [62, 66, 76], dark);
  ctx.globalAlpha = a;
  ctx.fillStyle = rgb(c);
  const bob = Math.sin(t * 1.6) * 4;
  ctx.beginPath();
  for (const [dx, dy, r] of [[-60, 10, 44], [-20, -22, 56], [32, -12, 50], [70, 14, 38], [0, 18, 48]]) {
    ctx.moveTo(x + dx * s + r * s, y + dy * s + bob);
    ctx.arc(x + dx * s, y + dy * s + bob, r * s, 0, 7);
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

function rain(x, y, s, k, t) {
  if (k <= 0) return;
  const r = rng(11);
  ctx.strokeStyle = `rgba(150,180,230,${0.55 * k})`;
  ctx.lineWidth = 4; ctx.lineCap = "round";
  for (let i = 0; i < 16; i++) {
    const dx = (r() - 0.5) * 150 * s, sp = 360 + r() * 140, ph = r();
    const yy = y + 30 * s + (((t * sp) / 170 + ph) % 1) * 170;
    ctx.beginPath(); ctx.moveTo(x + dx, yy); ctx.lineTo(x + dx - 4, yy + 18); ctx.stroke();
  }
}

function zzz(x, y, t, a) {
  if (a <= 0) return;
  ctx.font = "900 34px InterBlk";
  for (let i = 0; i < 3; i++) {
    const p = ((t * 0.6 + i / 3) % 1);
    ctx.globalAlpha = a * Math.sin(p * Math.PI);
    ctx.fillStyle = "#cfd8ff";
    ctx.font = `900 ${24 + 14 * p}px InterBlk`;
    ctx.fillText("z", x + p * 50, y - p * 80);
  }
  ctx.globalAlpha = 1;
}

function figure(cx, track, t, extra) {
  const P = poseAt(track, t);
  // Bewegungen
  if (P.name === "write" || P.name === "panic") {
    const fast = P.name === "panic";
    const sp = fast ? 34 : 9, amp = fast ? 16 : 9;
    P.rH = [P.rH[0] + Math.sin(t * sp) * amp, P.rH[1] + Math.cos(t * sp * 1.3) * 4];
    P.rE = [P.rE[0] + Math.sin(t * sp) * amp * 0.4, P.rE[1]];
    if (fast) {
      P.lH = [P.lH[0] + Math.sin(t * sp + 1) * 10, P.lH[1]];
      P.head = [P.head[0] + Math.sin(t * 21) * 5, P.head[1] + Math.abs(Math.sin(t * 17)) * 6];
    } else {
      P.head = [P.head[0], P.head[1] + Math.sin(t * 2.4) * 2];
    }
  }
  if (P.name === "phone") {
    P.rH = [P.rH[0], P.rH[1] + Math.sin(t * 5) * 2];
    P.head = [P.head[0], P.head[1] + Math.sin(t * 1.5) * 2];
  }
  if (P.name === "relax") P.head = [P.head[0] + Math.sin(t * 1.2) * 3, P.head[1]];
  if (P.name === "collapse") P.head = [P.head[0], P.head[1] + Math.sin(t * 2) * 1.5];
  extra.before && extra.before(P);
  chair(cx);
  bodyBack(cx, P, "#f4f5f7");
  extra.desk();
  armsFront(cx, P, "#f4f5f7");
  // Hände
  ctx.fillStyle = "#f4f5f7";
  for (const h of [P.lH, P.rH]) { ctx.beginPath(); ctx.arc(cx + h[0], DY + h[1], 12, 0, 7); ctx.fill(); }
  extra.after && extra.after(P);
  return P;
}

function drawLeft(t) {
  const P0 = poseAt(LTRACK, t);
  const lamp = nightK(t);
  const prog = ramp(t, T.panic - 0.2, T.due - 0.15);
  const progE = easeIO(prog) * (t < T.again ? 1 : 1 - ramp(t, T.next + 0.35, T.next + 0.8));
  // Wolke
  const grow = interp([[0, 0], [T.morgen, 0.0], [T.morgen + 0.6, 0.45], [T.cloud, 0.6], [T.dark, 1.05], [T.night, 1.25], [T.due, 1.3],
                       [T.grade, 0.9], [T.broke, 1.0], [T.next, 0.5], [T.last, 0.7]], t);
  const dark = interp([[0, 0], [T.cloud, 0.2], [T.dark, 0.85], [T.due, 1], [T.grade, 0.6], [T.broke, 0.9], [T.next, 0.4]], t);
  const rainK = ramp(t, T.dark, T.dark + 0.4) * (1 - ramp(t, T.grade - 0.2, T.grade + 0.2)) +
                ramp(t, T.broke, T.broke + 0.3) * (1 - ramp(t, T.next, T.next + 0.4));
  const cloudA = ramp(t, T.morgen - 0.1, T.morgen + 0.5);
  const cx = LX + 10, cy = 600 - 20 * grow;

  // Nachts: Licht der Schreibtischlampe
  const coffees = [T.coffee - 0.15, T.coffee + 0.35, T.sleep - 0.1];
  cloud(cx, cy, grow, dark, cloudA, t);
  rain(cx, cy, grow, rainK, t);
  figure(LX, LTRACK, t, {
    desk: () => {
      desk(LX, t, progE, "L", lamp * (t < T.due ? 1 : 0));
      // Kaffeebecher
      for (let i = 0; i < coffees.length; i++) {
        const k = easeOut(ramp(t, coffees[i], coffees[i] + 0.25)) * (1 - ramp(t, T.next, T.next + 0.5));
        if (k > 0) {
          ctx.save(); ctx.translate(0, -i * 46); coffee(LX + 128, k); ctx.restore();
        }
      }
      // Papierchaos beim Endspurt
      const mess = Math.round(8 * prog * (t < T.again ? 1 : 0));
      if (mess > 0) {
        const r = rng(5);
        for (let i = 0; i < mess; i++) {
          ctx.save();
          ctx.translate(LX - 60 + r() * 120, DY - 4);
          ctx.rotate((r() - 0.5) * 0.6);
          ctx.fillStyle = "#e4e4de"; ctx.fillRect(-40, -4, 80, 6);
          ctx.restore();
        }
      }
    },
    after: P => {
      const at = p => [LX + p[0], DY + p[1]];
      if (P.name === "phone" || (P.name === "idle" && t > T.last - 0.4)) {
        const m = [(P.lH[0] + P.rH[0]) / 2, (P.lH[1] + P.rH[1]) / 2 - 10];
        const [mx, my] = at(m);
        glow(mx, my - 40, 150, "120,170,255", 0.35 + 0.08 * Math.sin(t * 7));
        ctx.fillStyle = "#14161b";
        rrect(mx - 20, my - 34, 40, 66, 8); ctx.fill();
        ctx.fillStyle = `rgba(150,195,255,${0.85 + 0.15 * Math.sin(t * 9)})`;
        rrect(mx - 15, my - 28, 30, 52, 5); ctx.fill();
      }
      if (P.name === "panic") {
        // Stift
        const [hx, hy] = at(P.rH);
        ctx.strokeStyle = "#f0a64b"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 18, hy - 30); ctx.stroke();
        // Schweißtropfen
        const [hx2, hy2] = at(P.head);
        for (let i = 0; i < 2; i++) {
          const p = (t * 1.8 + i * 0.5) % 1;
          ctx.globalAlpha = Math.sin(p * Math.PI);
          ctx.fillStyle = "#9cc8ff";
          ctx.beginPath(); ctx.arc(hx2 + (i ? 52 : -54), hy2 - 10 + p * 40, 7, 0, 7); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      if (P.name === "raise" || (t >= T.due && t < T.broke + 0.2)) {
        const hp = at(P.rH);
        const k = 1 - ramp(t, T.broke - 0.1, T.broke + 0.2);
        if (k > 0) { ctx.globalAlpha = k; gradePaper(hp[0], hp[1] - 70, t, T.grade, -0.06); ctx.globalAlpha = 1; }
      }
      if (P.name === "collapse") {
        // Benommen: kreisende Punkte über dem Kopf
        const [hx, hy] = at(P.head);
        for (let i = 0; i < 3; i++) {
          const a = t * 3 + (i * Math.PI * 2) / 3;
          ctx.fillStyle = "#ffd36b";
          ctx.beginPath(); ctx.arc(hx + Math.cos(a) * 46, hy - 58 + Math.sin(a) * 12, 6, 0, 7); ctx.fill();
        }
      }
    },
  });
}

function drawRight(t) {
  const prog = interp([[0, 0], [T.plan - 0.2, 0.0], [T.dark + 0.5, 1.0]], t) * (t < T.again ? 1 : 0) +
               (t >= T.again ? 0.12 * ramp(t, T.again + 0.3, T.end + 1.5) : 0);
  const sleepK = nightK(t);
  figure(RX, RTRACK, t, {
    desk: () => {
      desk(RX, t, prog, "R", 0);
      paperStack(RX - 70, Math.round(prog * 14));
    },
    after: P => {
      const at = p => [RX + p[0], DY + p[1]];
      if (P.name === "write") {
        const [hx, hy] = at(P.rH);
        ctx.strokeStyle = "#7fb6ff"; ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 18, hy - 30); ctx.stroke();
      }
      if (P.name === "raise" || (t >= T.due && t < T.broke + 0.2)) {
        const hp = at(P.rH);
        const k = 1 - ramp(t, T.broke - 0.1, T.broke + 0.2);
        if (k > 0) { ctx.globalAlpha = k; gradePaper(hp[0], hp[1] - 70, t, T.grade, 0.06); ctx.globalAlpha = 1; }
      }
      const [hx, hy] = at(P.head);
      zzz(hx + 40, hy - 40, t, sleepK);
      // kleine Sonne/Ruhe-Glanz, wenn fertig
      const done = ramp(t, T.dark + 0.5, T.dark + 1.0) * (1 - ramp(t, T.again, T.again + 0.4));
      if (done > 0) {
        ctx.globalAlpha = done * 0.9;
        ctx.fillStyle = "#5fe08f";
        ctx.font = "900 40px InterBlk";
        const s = "✓";
        ctx.fillText(s, RX + 132, DY + 60 - 70);
        ctx.globalAlpha = 1;
      }
    },
  });
}

// ------------------------------------------------------------------ Kamera
function camera(t) {
  const z = interp([[0, 1.0], [T.cloud, 1.0], [T.dark, 1.05], [T.night - 0.1, 1.05], [T.night + 0.5, 1.14], [T.due - 0.1, 1.14],
                    [T.due + 0.4, 1.0], [T.broke - 0.1, 1.0], [T.broke + 0.4, 1.08], [T.next, 1.08], [T.next + 0.5, 1.0]], t);
  const x = interp([[0, 540], [T.night - 0.1, 540], [T.night + 0.5, 470], [T.due - 0.1, 470], [T.due + 0.4, 540],
                    [T.broke - 0.1, 540], [T.broke + 0.4, 500], [T.next, 500], [T.next + 0.5, 540]], t);
  return { z, x, y: 700 };
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
      ctx.fillStyle = heavy && card.sentence === 7 ? "#ff5a6e" : "#fff";
      ctx.fillText(tok.text, x0 + it.x, TEXT_TOP + line.y + dy);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}

// ------------------------------------------------------------------ Bild
let NOISE = [];
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Szene (oben), weich abgeschnitten
  ctx.save();
  ctx.beginPath(); ctx.rect(0, SCENE_TOP - 40, W, SCENE_BOT - SCENE_TOP + 40); ctx.clip();
  const cam = camera(t);
  ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, cam.y - cam.y * cam.z);
  drawRoom(t);
  drawCalendar(t);
  drawLeft(t);
  drawRight(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawLabels(t);
  ctx.restore();
  // weiche Kanten oben/unten
  let g = ctx.createLinearGradient(0, SCENE_BOT - 140, 0, SCENE_BOT);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "#000");
  ctx.fillStyle = g; ctx.fillRect(0, SCENE_BOT - 140, W, 141);
  g = ctx.createLinearGradient(0, SCENE_TOP - 40, 0, SCENE_TOP + 60);
  g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, SCENE_TOP - 40, W, 100);

  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  for (const card of TL.cards) {
    if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  }

  ctx.globalAlpha = 0.03;
  ctx.fillStyle = NOISE[Math.floor(t * 8) % NOISE.length];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  const fade = Math.max(1 - ramp(t, 0, 0.35), ramp(t, TL.duration - 1.4, TL.duration - 0.2));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

// Zeitpunkte für die Tonspur
window.exportEvents = function () {
  return {
    flips: T.flips.map(f => ({ t: f.t, newPage: f.to.key === "30n" })),
    phone: [[T.phone, T.night], [T.last, TL.duration]],
    writeR: [[T.plan, T.dark + 0.6], [T.again + 0.2, TL.duration]],
    panic: [T.night, T.due],
    cloud: T.morgen, dark: T.dark,
    rain: [[T.dark, T.grade], [T.broke, T.next + 0.4]],
    coffee: [T.coffee - 0.15, T.coffee + 0.35, T.sleep - 0.1],
    night: [T.night, T.due],
    due: T.due, grade: T.grade, broke: T.broke, next: T.next, done: T.dark + 0.5,
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([
    document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk"),
  ]);
  buildTimes();
  buildTracks();
  const r = rng(7);
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = r() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    NOISE.push(ctx.createPattern(c, "repeat"));
  }
  return true;
};
