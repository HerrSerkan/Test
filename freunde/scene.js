// "Wer geblieben ist" – Canvas-Animation (eigene Zeichnung). Wird von render.js Bild für Bild aufgerufen:
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const TEXT_TOP = 1120;           // Text unter der Szene – frei von TikTok-Tabs oben und Beschreibung unten
const TEXT_CX = 500;             // leicht links, damit die Buttons rechts nichts verdecken
const TEXT_W = 820;
const SCENE_TOP = 230, SCENE_BOT = 1080;
const DY = 860;                  // Tischkante
const SEATS = Array.from({ length: 10 }, (_, i) => 117 + i * 94);
const YOU = 4, BACK = 5;         // du / der, der zurückkommt
const ORDER = [0, 9, 2, 7, 5, 1, 8, 3, 6];   // Reihenfolge, in der sie gehen
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

function interp(keys, t, ease = easeIO) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return lerp(v0, v1, ease(ramp(t, t0, t1)));
    }
  }
  return keys[keys.length - 1][1];
}

function glow(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

function limb(pts, w) {
  ctx.lineWidth = w;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
}

// ------------------------------------------------------------------ Zeitplan
function buildTimes() {
  T.toast = Wt(0, "Freunden") - 0.15;
  T.year = Wt(1, "Und");
  T.leer = Wt(1, "leer.");
  T.streit = Wt(2, "Kein");
  T.d30 = Wt(4, "Mit");
  T.allein = Wt(4, "fast");
  T.back = Wt(5, "Bis");
  T.sit = Wt(5, "neben");
  T.bleibt = Wt(6, "BLEIBT.");
  T.alt = Wt(7, "alt");
  T.ende = Wt(8, "Am");
  T.geblieben = Wt(8, "GEBLIEBEN");
  T.end = TL.sentences[TL.sentences.length - 1].end;

  // Abgänge zwischen "Und jedes Jahr" und "Mit dreißig"
  T.leave = {};
  const a = T.year + 0.25, b = T.d30 - 1.1;
  ORDER.forEach((s, k) => { T.leave[s] = a + ((b - a) * k) / (ORDER.length - 1); });
  T.ageKeys = [[0, 18], [T.year, 18], [T.d30, 30], [T.bleibt - 0.1, 30], [T.ende - 0.2, 72]];
  T.ageFlips = [];
  let prev = age(0);
  for (let t = 0; t < TL.duration; t += 1 / 60) {
    const v = age(t);
    if (v !== prev) { T.ageFlips.push(t); prev = v; }
  }
}

function age(t) { return Math.round(interp(T.ageKeys, t, x => x)); }

// ------------------------------------------------------------------ Szene
function drawRoom(t, light) {
  const g = ctx.createRadialGradient(540, 640, 40, 540, 700, 820);
  g.addColorStop(0, `rgba(${Math.round(40 + 22 * light)},${Math.round(32 + 14 * light)},${Math.round(26 + 6 * light)},1)`);
  g.addColorStop(0.55, "rgb(14,12,12)");
  g.addColorStop(1, "rgb(5,5,6)");
  ctx.fillStyle = g;
  ctx.fillRect(-600, SCENE_TOP - 400, W + 1200, SCENE_BOT - SCENE_TOP + 800);
  // Boden
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(-600, 1010, W + 1200, 600);
}

function lamp(t, light) {
  const x = 540, y = 500;
  ctx.strokeStyle = "#2a2622"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, -400); ctx.lineTo(x, y - 30); ctx.stroke();
  glow(x, y + 30, 620, "255,190,120", 0.16 + 0.22 * light);
  glow(x, y + 10, 140, "255,214,160", 0.35 * light + 0.1);
  ctx.fillStyle = "#3b332b";
  ctx.beginPath();
  ctx.moveTo(x - 90, y + 22); ctx.lineTo(x - 34, y - 32); ctx.lineTo(x + 34, y - 32); ctx.lineTo(x + 90, y + 22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(255,224,170,${0.55 + 0.45 * light})`;
  ctx.beginPath(); ctx.ellipse(x, y + 22, 90, 12, 0, 0, Math.PI * 2); ctx.fill();
}

// Lichtkegel auf dem Tisch
function lightPool(light) {
  const g = ctx.createRadialGradient(540, DY, 20, 540, DY, 520);
  g.addColorStop(0, `rgba(255,200,140,${0.25 * light})`);
  g.addColorStop(1, "rgba(255,200,140,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, DY - 300, W, 500);
}

function chair(x, empty) {
  ctx.fillStyle = empty ? "#2a2522" : "#342e29";
  ctx.beginPath(); ctx.roundRect(x - 34, DY - 160, 68, 170, 12); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.roundRect(x - 24, DY - 146, 48, 120, 8); ctx.fill();
}

function table(light) {
  ctx.fillStyle = "#4a3f36";
  ctx.beginPath(); ctx.roundRect(60, DY, 960, 22, 6); ctx.fill();
  const g = ctx.createLinearGradient(0, DY + 22, 0, DY + 170);
  g.addColorStop(0, "#2c2520");
  g.addColorStop(1, "#16120f");
  ctx.fillStyle = g;
  ctx.fillRect(74, DY + 22, 932, 150);
  // Tischdecke-Saum
  ctx.fillStyle = `rgba(255,210,160,${0.05 + 0.05 * light})`;
  ctx.fillRect(74, DY + 22, 932, 4);
}

function glass(x, a) {
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(220,230,240,0.35)";
  ctx.beginPath(); ctx.roundRect(x - 9, DY - 34, 18, 32, 3); ctx.fill();
  ctx.fillStyle = "rgba(255,190,120,0.55)";
  ctx.fillRect(x - 7, DY - 18, 14, 14);
  ctx.globalAlpha = 1;
}

function candle(t, light) {
  const x = 540;
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(x - 7, DY - 46, 14, 44);
  const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
  glow(x, DY - 58, 90, "255,170,80", 0.45 * (0.6 + 0.4 * light));
  ctx.fillStyle = "#ffcf70";
  ctx.beginPath(); ctx.ellipse(x, DY - 58, 6 * f, 13 * f, 0, 0, Math.PI * 2); ctx.fill();
}

// Sitzende Figur: Punkte relativ zu (x, DY)
function seated(x, t, o) {
  const col = o.col || "#f2f2f2";
  const hunch = o.hunch || 0;
  const rise = o.rise || 0;              // 0 = sitzt, 1 = steht
  const bob = o.bob || 0;
  const hipY = DY + 30 - rise * 95;
  const neck = [x + hunch * 10, DY - 110 - rise * 95 + hunch * 14 + bob];
  const head = [neck[0] + hunch * 8, neck[1] - 40 + hunch * 6];
  ctx.strokeStyle = col; ctx.fillStyle = col;
  limb([[x, hipY], neck], 22);
  ctx.beginPath(); ctx.arc(head[0], head[1], 31, 0, 7); ctx.fill();
  return { neck, head };
}

function arms(x, P, o) {
  const col = o.col || "#f2f2f2";
  ctx.strokeStyle = col; ctx.fillStyle = col;
  const n = P.neck;
  let lE = [x - 32, DY - 50], lH = [x - 20, DY - 6], rE = [x + 32, DY - 50], rH = [x + 20, DY - 6];
  if (o.toast > 0) {                     // Glas heben
    const k = o.toast;
    rE = [lerp(rE[0], x + 46, k), lerp(rE[1], DY - 110, k)];
    rH = [lerp(rH[0], x + 34, k), lerp(rH[1], DY - 168, k)];
  }
  if (o.wave > 0) {                      // Winken
    const k = o.wave, w = Math.sin(o.wt * 16) * 16;
    lE = [lerp(lE[0], x - 52, k), lerp(lE[1], n[1] + 10, k)];
    lH = [lerp(lH[0], x - 60 + w, k), lerp(lH[1], n[1] - 60, k)];
  }
  if (o.rise > 0) {                      // stehend: Arme hängen
    const k = o.rise * (1 - (o.wave || 0));
    rE = [lerp(rE[0], x + 22, k), lerp(rE[1], n[1] + 60, k)];
    rH = [lerp(rH[0], x + 26, k), lerp(rH[1], n[1] + 115, k)];
    if (!o.wave) {
      lE = [lerp(lE[0], x - 22, k), lerp(lE[1], n[1] + 60, k)];
      lH = [lerp(lH[0], x - 26, k), lerp(lH[1], n[1] + 115, k)];
    }
  }
  if (o.lean) {                          // zum Freund neigen
    const d = o.lean;
    rE = [x + 44 * d, DY - 52]; rH = [x + 40 * d, DY - 8];
  }
  limb([n, lE, lH], 16);
  limb([n, rE, rH], 16);
  for (const h of [lH, rH]) { ctx.beginPath(); ctx.arc(h[0], h[1], 9, 0, 7); ctx.fill(); }
  if (o.toast > 0) {
    ctx.globalAlpha = o.toast;
    ctx.fillStyle = "rgba(220,230,240,0.5)";
    ctx.beginPath(); ctx.roundRect(rH[0] - 9, rH[1] - 36, 18, 30, 3); ctx.fill();
    ctx.fillStyle = "rgba(255,190,120,0.7)";
    ctx.fillRect(rH[0] - 7, rH[1] - 22, 14, 12);
    ctx.globalAlpha = 1;
  }
}

// Gehende Figur hinter dem Tisch
function walker(x, t, col, a, dir) {
  ctx.globalAlpha = a;
  const ph = t * 9;
  const hip = [x, DY - 65 + Math.abs(Math.sin(ph)) * -5];
  const neck = [x + dir * 4, hip[1] - 105];
  const head = [neck[0] + dir * 3, neck[1] - 40];
  ctx.strokeStyle = col; ctx.fillStyle = col;
  limb([hip, neck], 22);
  ctx.beginPath(); ctx.arc(head[0], head[1], 31, 0, 7); ctx.fill();
  const s = Math.sin(ph);
  limb([neck, [x + s * 22, neck[1] + 55], [x + s * 34, neck[1] + 105]], 16);
  limb([neck, [x - s * 22, neck[1] + 55], [x - s * 34, neck[1] + 105]], 16);
  limb([hip, [x + s * 26, hip[1] + 70], [x + s * 36, hip[1] + 140]], 18);
  limb([hip, [x - s * 26, hip[1] + 70], [x - s * 36, hip[1] + 140]], 18);
  ctx.globalAlpha = 1;
}

function cane(x, side, k) {
  if (k <= 0) return;
  ctx.globalAlpha = k;
  ctx.strokeStyle = "#b08a62"; ctx.lineWidth = 10; ctx.lineCap = "round";
  const top = [x + side * 58, DY - 70];
  ctx.beginPath(); ctx.moveTo(top[0], DY + 120); ctx.lineTo(top[0] - side * 6, top[1]); ctx.stroke();
  ctx.beginPath(); ctx.arc(top[0] - side * 6 - side * 12, top[1], 12, side > 0 ? Math.PI : 0, side > 0 ? 2 * Math.PI : Math.PI, side < 0); ctx.stroke();
  ctx.globalAlpha = 1;
}

// Zustand eines Platzes zur Zeit t
function seatState(i, t) {
  if (i === YOU) return { kind: "sit" };
  const L = T.leave[i];
  if (i === BACK && t >= T.back) {
    const arrive = T.sit - 0.15;
    if (t < arrive) {                    // kommt von rechts herein
      const p = ramp(t, T.back, arrive);
      return { kind: "walk", x: lerp(1180, SEATS[i] + 30, easeOut(p)), dir: -1, a: 1 };
    }
    return { kind: "sit", rise: 1 - easeOut(ramp(t, arrive, arrive + 0.45)) };
  }
  if (t < L) return { kind: "sit" };
  const tStand = L, tWave = L + 0.3, tGo = L + 0.75;
  if (t < tGo) return { kind: "sit", rise: easeOut(ramp(t, tStand, tStand + 0.35)), wave: Math.sin(Math.PI * ramp(t, tWave - 0.1, tGo)) };
  const dir = SEATS[i] < 540 ? -1 : 1;
  const p = ramp(t, tGo, tGo + 1.3);
  const x = SEATS[i] + dir * easeIO(p) * 560;
  return { kind: "walk", x, dir, a: 1 - ramp(t, tGo + 0.7, tGo + 1.3) };
}

function lightLevel(t) {
  return interp([[0, 1], [T.year, 1], [T.d30, 0.45], [T.back, 0.4], [T.sit + 0.3, 0.85], [T.bleibt, 1.0], [T.end, 1.0]], t);
}

function drawScene(t) {
  const light = lightLevel(t);
  drawRoom(t, light);
  lamp(t, light);

  const states = SEATS.map((_, i) => seatState(i, t));
  // Gehende hinter allem anderen
  states.forEach((s, i) => { if (s.kind === "walk" && s.a > 0) walker(s.x, t, i === BACK && t >= T.back ? "#f2f2f2" : "#bfbfbf", s.a, s.dir); });
  states.forEach((s, i) => chair(SEATS[i], s.kind !== "sit"));

  const old = easeIO(ramp(t, T.alt - 0.3, T.alt + 0.5));
  const P = [];
  states.forEach((s, i) => {
    if (s.kind !== "sit") return;
    const pair = i === YOU || i === BACK;
    const col = pair ? (old > 0 ? `rgb(${Math.round(242 - 22 * old)},${Math.round(242 - 20 * old)},${Math.round(242 - 14 * old)})` : "#f2f2f2") : "#e4e4e4";
    const bob = Math.sin(t * 2.2 + i * 1.7) * 3 * (t < T.year ? 1 : 0.4);
    P[i] = { P: seated(SEATS[i], t, { col, rise: s.rise || 0, hunch: pair ? old : 0, bob }), s, col };
  });

  lightPool(light);
  table(light);
  // Gläser auf leeren und besetzten Plätzen
  SEATS.forEach((x, i) => {
    const toastK = Math.sin(Math.PI * ramp(t, T.toast - 0.25, T.toast + 0.9));
    if (states[i].kind === "sit" && toastK > 0.05 && t < T.year) return;   // wird gerade gehoben
    glass(x + 28, states[i].kind === "sit" ? 1 : 0.45);
  });
  candle(t, light);

  // Arme vor der Tischkante
  P.forEach((p, i) => {
    if (!p) return;
    const toast = t < T.year ? Math.sin(Math.PI * ramp(t, T.toast - 0.25, T.toast + 0.9)) : 0;
    let lean = 0;
    if ((i === YOU || i === BACK) && t > T.sit + 0.4) lean = (i === YOU ? 1 : -1) * easeIO(ramp(t, T.bleibt - 0.4, T.bleibt + 0.3));
    arms(SEATS[i], p.P, { col: p.col, toast, wave: p.s.wave || 0, wt: t, rise: p.s.rise || 0, lean });
  });
  // Gehstöcke
  cane(SEATS[YOU], -1, old);
  cane(SEATS[BACK], 1, old);

  // "DU"-Marke am Anfang
  const du = ramp(t, 0.4, 0.8) * (1 - ramp(t, T.year - 0.4, T.year));
  if (du > 0) {
    const hp = P[YOU].P.head;
    ctx.globalAlpha = du;
    ctx.font = "900 26px InterBlk"; ctx.letterSpacing = "5px";
    ctx.fillStyle = "#ffcf8a";
    const w = ctx.measureText("DU").width - 5;
    ctx.fillText("DU", hp[0] - w / 2, hp[1] - 52);
    ctx.beginPath(); ctx.moveTo(hp[0] - 9, hp[1] - 44); ctx.lineTo(hp[0] + 9, hp[1] - 44); ctx.lineTo(hp[0], hp[1] - 36); ctx.fill();
    ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
  }
  // Wärme um die beiden, wenn er bleibt
  const warm = ramp(t, T.bleibt - 0.2, T.bleibt + 0.6);
  if (warm > 0) glow(540, DY - 120, 260, "255,190,120", 0.18 * warm * (0.85 + 0.15 * Math.sin(t * 2.5)));
}

function drawAge(t) {
  const a = easeOut(ramp(t, 0.15, 0.6));
  const v = age(t);
  const lastFlip = [...T.ageFlips].reverse().find(f => f <= t);
  const pop = lastFlip !== undefined ? 1 - ramp(t, lastFlip, lastFlip + 0.18) : 0;
  ctx.globalAlpha = a;
  ctx.font = "600 26px InterSB"; ctx.letterSpacing = "9px";
  ctx.fillStyle = "rgba(255,230,200,0.7)";
  let w = ctx.measureText("ALTER").width - 9;
  ctx.fillText("ALTER", 540 - w / 2, 272);
  ctx.letterSpacing = "-2px";
  ctx.font = `900 ${80 + pop * 8}px InterBlk`;
  ctx.fillStyle = "#fff4e6";
  ctx.shadowColor = "rgba(255,200,140,0.45)"; ctx.shadowBlur = 26;
  w = ctx.measureText(String(v)).width;
  ctx.fillText(String(v), 540 - w / 2, 350);
  ctx.shadowBlur = 0; ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Kamera
function camera(t) {
  const z = interp([[0, 1.0], [T.d30 - 0.3, 1.0], [T.allein + 0.8, 1.12], [T.back, 1.12], [T.sit + 0.4, 1.18],
                    [T.bleibt, 1.22], [T.ende - 0.2, 1.26], [T.ende + 2.2, 1.0], [TL.duration, 0.96]], t);
  const y = interp([[0, 720], [T.sit + 0.4, 740], [T.ende - 0.2, 760], [T.ende + 2.2, 720]], t);
  return { z, x: 540, y };
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
      ctx.fillStyle = heavy && card.sentence === 8 ? "#ffcf8a" : "#fff";
      ctx.fillText(tok.text, x0 + it.x, TEXT_TOP + line.y + dy);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}

let NOISE = [];
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath(); ctx.rect(0, SCENE_TOP - 40, W, SCENE_BOT - SCENE_TOP + 40); ctx.clip();
  const cam = camera(t);
  ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, cam.y - cam.y * cam.z);
  drawScene(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawAge(t);
  ctx.restore();
  let g = ctx.createLinearGradient(0, SCENE_BOT - 160, 0, SCENE_BOT);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "#000");
  ctx.fillStyle = g; ctx.fillRect(0, SCENE_BOT - 160, W, 161);
  g = ctx.createLinearGradient(0, SCENE_TOP - 40, 0, SCENE_TOP + 60);
  g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, SCENE_TOP - 40, W, 100);

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  for (const card of TL.cards) {
    if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  }

  ctx.globalAlpha = 0.035;
  ctx.fillStyle = NOISE[Math.floor(t * 8) % NOISE.length];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  const fade = Math.max(1 - ramp(t, 0, 0.35), ramp(t, TL.duration - 1.4, TL.duration - 0.2));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

// Zeitpunkte für die Tonspur
window.exportEvents = function () {
  return {
    toast: T.toast, leave: ORDER.map(s => ({ t: T.leave[s], x: SEATS[s] })),
    ageFlips: T.ageFlips, back: T.back, sit: T.sit, bleibt: T.bleibt, alt: T.alt, ende: T.ende, geblieben: T.geblieben,
    d30: T.d30,
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
