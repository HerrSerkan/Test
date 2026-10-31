// "Jeder Gruppenchat hat diese 5 Leute" – Canvas-Animation (eigene Zeichnung), ohne Sprecher.
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const TEXT_CX = 500, T_END = 13.4, T_FINAL = 9.7;
const CARD = { x: 100, y: 450, w: 800, h: 450 };
const ROW_Y = 1215;                                   // Fußlinie der Figuren
const CAP_Y = 1345;
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let TL = null;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeBack = x => { const c = 1.7; x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;

// ------------------------------------------------------------------ Leute
const P = [
  { key: "planer", chip: "PLANER", col: "#f2c14e", x: 150, t: 1.3, name: "DER PLANER", sub: "hat einen Plan. Sonst keiner." },
  { key: "sprachi", chip: "SPRACHI", col: "#f07167", x: 320, t: 2.6, name: "DER SPRACHI", sub: "hat noch nie ein Wort getippt." },
  { key: "daumen", chip: "DAUMEN", col: "#5cc98a", x: 490, t: 3.9, name: "DER DAUMEN", sub: "sagt zu. Kommt nie." },
  { key: "geist", chip: "GEIST", col: "#a78bfa", x: 660, t: 5.2, name: "DER GEIST", sub: "ist im Geiste dabei." },
  { key: "lol", chip: "LOL", col: "#60a5fa", x: 830, t: 6.5, name: "DER LOL", sub: "antwortet 3 Tage später. Mit „lol“." },
];
const CAP_END = 8.0;
const GHOST = [5.45, 8.9];                            // als Geist sichtbar

function activeIdx(t) {
  if (t >= CAP_END) return -1;
  let a = -1;
  P.forEach((p, i) => { if (t >= p.t) a = i; });
  return a;
}

// ------------------------------------------------------------------ Chat-Verlauf
const ITEMS = [
  { t: 0.4, who: 0, kind: "msg", text: "Machen wir Samstag was??" },
  { t: 1.55, who: 0, kind: "poll" },
  { t: 2.75, who: 1, kind: "voice", len: "0:47" }, { t: 3.0, who: 1, kind: "voice", len: "2:13" },
  { t: 3.22, who: 1, kind: "voice", len: "1:05" }, { t: 3.44, who: 1, kind: "voice", len: "3:38" },
  { t: 4.25, who: 2, kind: "thumb" },
  { t: 6.7, who: -1, kind: "day", text: "MITTWOCH" },
  { t: 7.15, who: 4, kind: "msg", text: "lol" },
  { t: 8.2, who: 0, kind: "msg", text: "ok vergesst es. Abgesagt." },
  { t: 9.0, who: 3, kind: "msg", text: "was?? ich wär gekommen" },
];
const IH = { msg: 92, poll: 150, voice: 72, thumb: 76, day: 56 };
const VOICE_BADGE = [[2.75, 3], [3.6, 14]];

function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function avatar(x, y, col, r = 16) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath(); ctx.arc(x - 5, y - 2, 2.2, 0, 7); ctx.arc(x + 5, y - 2, 2.2, 0, 7); ctx.fill();
}

function thumbIcon(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col;
  rr(-14, -2, 28, 26, 6); ctx.fill();                 // Faust
  rr(-12, -24, 11, 26, 5); ctx.fill();                // Daumen
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(-14, 6, 28, 2); ctx.fillRect(-14, 13, 28, 2);
  ctx.restore();
}

function drawItem(it, x, y, t) {                      // y = Oberkante
  const p = easeOut(ramp(t, it.t, it.t + 0.22));
  ctx.globalAlpha = p;
  const who = P[it.who];
  const ox = (1 - p) * -14;
  if (it.kind === "day") {
    ctx.font = "700 18px InterSB"; ctx.letterSpacing = "3px";
    const w = ctx.measureText(it.text).width + 30;
    ctx.fillStyle = "#2c3140"; rr(x + 300 - w / 2, y + 12, w, 32, 16); ctx.fill();
    ctx.fillStyle = "#aab2c5"; ctx.fillText(it.text, x + 300 - w / 2 + 15, y + 34);
    ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
    return;
  }
  const ghostNow = it.who === 3 && t >= GHOST[0] && t < GHOST[1];
  avatar(x + 22 + ox, y + IH[it.kind] - 30, ghostNow ? "#e8e8f0" : who.col);
  const bx = x + 52 + ox;
  ctx.fillStyle = "#232734";
  if (it.kind === "msg") {
    ctx.font = "600 28px InterSB";
    const w = Math.max(ctx.measureText(it.text).width, 120) + 40;
    rr(bx, y + 6, w, 76, 18); ctx.fill();
    ctx.font = "700 17px InterSB"; ctx.fillStyle = who.col; ctx.fillText(who.chip.charAt(0) + who.chip.slice(1).toLowerCase(), bx + 20, y + 32);
    ctx.font = "600 28px InterSB"; ctx.fillStyle = "#eef0f5"; ctx.fillText(it.text, bx + 20, y + 66);
  } else if (it.kind === "poll") {
    rr(bx, y + 6, 420, 136, 18); ctx.fill();
    ctx.font = "700 17px InterSB"; ctx.fillStyle = who.col; ctx.fillText("Planer · Umfrage", bx + 20, y + 32);
    ctx.font = "800 26px InterBlk"; ctx.fillStyle = "#eef0f5"; ctx.fillText("Samstag?", bx + 20, y + 64);
    const yes = t >= it.t + 0.45 ? 1 : 0;
    for (const [i, lab, n] of [[0, "ja", yes], [1, "nein", 0]]) {
      const yy = y + 88 + i * 30;
      ctx.strokeStyle = "#6b7387"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx + 30, yy, 8, 0, 7); ctx.stroke();
      if (n) { ctx.fillStyle = who.col; ctx.beginPath(); ctx.arc(bx + 30, yy, 5, 0, 7); ctx.fill(); }
      ctx.font = "600 21px InterSB"; ctx.fillStyle = "#cfd4df"; ctx.fillText(lab, bx + 48, yy + 7);
      ctx.fillStyle = "#353a49"; rr(bx + 120, yy - 4, 230, 8, 4); ctx.fill();
      if (n) { ctx.fillStyle = who.col; rr(bx + 120, yy - 4, 230 * easeOut(ramp(t, it.t + 0.45, it.t + 0.8)), 8, 4); ctx.fill(); }
      ctx.fillStyle = "#cfd4df"; ctx.fillText(String(n), bx + 368, yy + 7);
    }
  } else if (it.kind === "voice") {
    rr(bx, y + 6, 340, 58, 29); ctx.fill();
    ctx.fillStyle = who.col; ctx.beginPath(); ctx.arc(bx + 30, y + 35, 17, 0, 7); ctx.fill();
    ctx.fillStyle = "#232734"; ctx.beginPath(); ctx.moveTo(bx + 25, y + 26); ctx.lineTo(bx + 37, y + 35); ctx.lineTo(bx + 25, y + 44); ctx.fill();
    ctx.fillStyle = "#8d95a8";
    for (let i = 0; i < 26; i++) {
      const hh = 6 + Math.abs(Math.sin(i * 1.7 + it.t * 3)) * 22;
      ctx.fillRect(bx + 62 + i * 8, y + 35 - hh / 2, 4, hh);
    }
    ctx.font = "600 18px InterSB"; ctx.fillStyle = "#aab2c5"; ctx.fillText(it.len, bx + 280, y + 41);
  } else if (it.kind === "thumb") {
    rr(bx, y + 6, 74, 62, 20); ctx.fill();
    thumbIcon(bx + 38, y + 36, 0.9 * easeBack(ramp(t, it.t, it.t + 0.35)), "#f6c35b");
  }
  ctx.globalAlpha = 1;
}

function chat(t) {
  const { x, y, w, h } = CARD;
  // Karte
  ctx.fillStyle = "#151821"; rr(x, y, w, h, 28); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; ctx.stroke();
  // Kopfzeile
  ctx.fillStyle = "#1d212d"; rr(x, y, w, 78, [28, 28, 0, 0]); ctx.fill();
  P.forEach((p, i) => avatar(x + 36 + i * 22, y + 39, t >= GHOST[0] && t < GHOST[1] && i === 3 ? "#e8e8f0" : p.col, 13));
  ctx.font = "800 26px InterBlk"; ctx.fillStyle = "#fff"; ctx.fillText("Die Clique", x + 160, y + 37);
  ctx.font = "600 17px InterSB"; ctx.fillStyle = "#8d95a8";
  const typing = t > 5.7 && t < 6.25 ? "Geist tippt …" : "5 Mitglieder";
  ctx.fillText(typing, x + 160, y + 61);
  // Eingabezeile
  ctx.fillStyle = "#1d212d"; rr(x + 20, y + h - 66, w - 110, 46, 23); ctx.fill();
  ctx.font = "600 19px InterSB"; ctx.fillStyle = "#5d6578"; ctx.fillText("Nachricht", x + 44, y + h - 36);
  ctx.fillStyle = "#5cc98a"; ctx.beginPath(); ctx.arc(x + w - 52, y + h - 43, 23, 0, 7); ctx.fill();
  // Verlauf (neueste unten), weich scrollen
  ctx.save(); rr(x, y + 78, w, h - 156, 0); ctx.clip();
  let bottom = y + h - 84;
  const shown = ITEMS.filter(it => t >= it.t);
  for (let i = shown.length - 1; i >= 0; i--) {
    const it = shown[i];
    const grow = easeIO(ramp(t, it.t, it.t + 0.25));
    const hh = IH[it.kind] * grow;
    drawItem(it, x + 22, bottom - IH[it.kind], t);
    bottom -= hh;
    if (bottom < y + 40) break;
  }
  ctx.restore();
}

// ------------------------------------------------------------------ Figuren (eigene Form: Kapsel-Körper + Kopf)
function person(i, t) {
  const p = P[i];
  const act = activeIdx(t);
  const intro = t >= p.t;
  const isAct = act === i;
  const k = easeIO(ramp(t, p.t, p.t + 0.3)) * (act === i ? 1 : 0);
  const dimmed = act >= 0 && !isAct;
  const s = 1 + 0.14 * (isAct ? easeIO(ramp(t, p.t, p.t + 0.25)) : 0);
  const ghost = i === 3 ? easeIO(ramp(t, GHOST[0], GHOST[0] + 0.4)) * (1 - easeIO(ramp(t, GHOST[1], GHOST[1] + 0.4))) : 0;
  const bob = Math.sin(t * 2 + i * 1.3) * 3;
  const x = p.x, fy = ROW_Y;
  ctx.save();
  ctx.translate(x, fy); ctx.scale(s, s);
  ctx.globalAlpha = dimmed ? 0.45 : 1;
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.ellipse(0, 4, 52, 10, 0, 0, 7); ctx.fill();
  // Sockel mit Nummer
  ctx.fillStyle = "#1c1f29"; rr(-26, 14, 52, 30, 10); ctx.fill();
  ctx.font = "800 20px InterBlk"; ctx.fillStyle = intro ? p.col : "#4a5062";
  const nw = ctx.measureText(String(i + 1)).width; ctx.fillText(String(i + 1), -nw / 2, 37);

  if (ghost > 0.5) {
    // Geist-Laken
    const fl = Math.sin(t * 3) * 6 - 20;
    ctx.fillStyle = "#eceaf6";
    ctx.beginPath();
    ctx.moveTo(-46, fl); ctx.lineTo(-46, -120 + fl);
    ctx.arc(0, -120 + fl, 46, Math.PI, 0);
    ctx.lineTo(46, fl);
    for (let j = 0; j < 4; j++) ctx.quadraticCurveTo(46 - j * 23 - 11, fl + (j % 2 ? -14 : 14), 46 - (j + 1) * 23, fl);
    ctx.fill();
    ctx.fillStyle = "#2a2440";
    ctx.beginPath(); ctx.ellipse(-15, -128 + fl, 7, 10, 0, 0, 7); ctx.ellipse(15, -128 + fl, 7, 10, 0, 0, 7); ctx.fill();
  } else {
    ctx.translate(0, bob * 0.3);
    // Körper
    ctx.fillStyle = p.col;
    rr(-40, -112, 80, 116, 36); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)"; rr(-40, -40, 80, 44, [0, 0, 36, 36]); ctx.fill();
    // Kopf
    const hy = -150;
    ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(0, hy, 38, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.arc(-12, hy - 14, 12, 0, 7); ctx.fill();
    // Gesicht
    const sleepy = i === 4 && t < 6.5;
    const sad = i === 0 && t > 8.2;
    ctx.fillStyle = "#1b1b22"; ctx.strokeStyle = "#1b1b22"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    if (sleepy) {
      for (const dx of [-13, 13]) { ctx.beginPath(); ctx.moveTo(dx - 6, hy - 2); ctx.lineTo(dx + 6, hy - 2); ctx.stroke(); }
    } else {
      for (const dx of [-13, 13]) { ctx.beginPath(); ctx.arc(dx, hy - 3, 4.5, 0, 7); ctx.fill(); }
    }
    const m = sad ? -1 : i === 0 || isAct ? 1 : 0.2;
    ctx.beginPath(); ctx.moveTo(-10, hy + 14 - m * 2); ctx.quadraticCurveTo(0, hy + 14 + m * 8, 10, hy + 14 - m * 2); ctx.stroke();
    // Handy
    ctx.fillStyle = "#14161c"; rr(-14, -84, 28, 44, 5); ctx.fill();
    ctx.fillStyle = "rgba(160,200,255,0.8)"; rr(-10, -80, 20, 34, 3); ctx.fill();
    // Extras
    if (i === 1 && t > 2.7) {                           // Sprachnachrichten-Wellen
      ctx.strokeStyle = p.col; ctx.lineWidth = 4;
      for (let j = 0; j < 3; j++) {
        const ph = (t * 1.6 + j / 3) % 1;
        ctx.globalAlpha = (dimmed ? 0.45 : 1) * (1 - ph);
        ctx.beginPath(); ctx.arc(30, hy + 18, 16 + ph * 34, -0.7, 0.7); ctx.stroke();
      }
      ctx.globalAlpha = dimmed ? 0.45 : 1;
    }
    if (sleepy) {
      ctx.fillStyle = "#9db4ff"; ctx.font = "900 26px InterBlk";
      for (let j = 0; j < 3; j++) {
        const ph = (t * 0.6 + j / 3) % 1;
        ctx.globalAlpha = (dimmed ? 0.45 : 1) * Math.sin(Math.PI * ph);
        ctx.fillText("z", 34 + ph * 30, hy - 30 - ph * 50);
      }
      ctx.globalAlpha = dimmed ? 0.45 : 1;
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  // Namens-Chip über dem Kopf (bleibt nach der Vorstellung)
  if (intro) {
    const a = easeOut(ramp(t, p.t, p.t + 0.3));
    ctx.font = "800 17px InterBlk"; ctx.letterSpacing = "1.5px";
    const w = ctx.measureText(p.chip).width + 20;
    const cy = fy - (ghost > 0.5 ? 232 : 222) * s;
    ctx.globalAlpha = a * (dimmed ? 0.6 : 1);
    ctx.fillStyle = p.col; rr(x - w / 2, cy - 22, w, 30, 15); ctx.fill();
    ctx.fillStyle = "#15161b"; ctx.fillText(p.chip, x - w / 2 + 10, cy - 1);
    ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
  }
  // Badges
  if (i === 1) {
    const b = VOICE_BADGE.filter(v => t >= v[0]).pop();
    if (b && t < CAP_END + 1.5) {
      const pop = easeBack(ramp(t, b[0], b[0] + 0.3));
      ctx.save(); ctx.translate(x - 48, fy - 190); ctx.scale(pop, pop);
      ctx.fillStyle = "#ff3b54"; rr(-30, -18, 60, 34, 17); ctx.fill();
      ctx.font = "900 20px InterBlk"; ctx.fillStyle = "#fff";
      const s2 = "×" + b[1]; const w = ctx.measureText(s2).width; ctx.fillText(s2, -w / 2, 6);
      ctx.restore();
    }
  }
  if (i === 2 && t > 4.25 && t < CAP_END + 1.5) {
    thumbIcon(x + 50, fy - 200, 1.1 * easeBack(ramp(t, 4.25, 4.6)), "#f6c35b");
  }
}

// ------------------------------------------------------------------ Texte
function fitFont(txt, font, size, maxW) {
  ctx.font = `${font.replace("SIZE", size)}`;
  const w = ctx.measureText(txt).width;
  if (w > maxW) { size *= maxW / w; ctx.font = `${font.replace("SIZE", size)}`; }
  return size;
}

function titleTop(t) {
  // groß am Anfang, dann klein oben
  const k = easeIO(ramp(t, 1.0, 1.4));
  const fin = ramp(t, T_FINAL - 0.3, T_FINAL);
  const a = easeOut(ramp(t, 0.05, 0.4)) * (1 - fin);
  if (a <= 0) return;
  ctx.globalAlpha = a;
  const big = lerp(66, 34, k);
  const lines = k < 0.5 ? [["JEDER GRUPPENCHAT", null], ["HAT DIESE ", "5 LEUTE"]] : [["JEDER GRUPPENCHAT HAT DIESE ", "5 LEUTE"]];
  let y = k < 0.5 ? lerp(330, 340, k) : 360;
  for (const [a1, a2] of lines) {
    ctx.font = `900 ${big}px InterBlk`; ctx.letterSpacing = "-1px";
    const w1 = ctx.measureText(a1).width, w2 = a2 ? ctx.measureText(a2).width : 0;
    let x = TEXT_CX - (w1 + w2) / 2;
    ctx.fillStyle = "#fff"; ctx.fillText(a1, x, y);
    if (a2) { ctx.fillStyle = "#f6c35b"; ctx.fillText(a2, x + w1, y); }
    y += big * 1.05;
  }
  ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
}

function caption(t) {
  const i = activeIdx(t);
  if (i < 0) return;
  const p = P[i];
  const nxt = i + 1 < P.length ? P[i + 1].t : CAP_END;
  const a = easeOut(ramp(t, p.t, p.t + 0.2)) * (1 - ramp(t, nxt - 0.15, nxt));
  const dy = (1 - easeOut(ramp(t, p.t, p.t + 0.25))) * 18;
  ctx.globalAlpha = a;
  // Nummernkreis + Name
  const name = p.name;
  const size = fitFont(name, "900 SIZEpx InterBlk", 70, 700);
  const w = ctx.measureText(name).width;
  const total = w + size * 1.0;
  const x0 = TEXT_CX - total / 2;
  ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(x0 + size * 0.38, CAP_Y - size * 0.34 + dy, size * 0.38, 0, 7); ctx.fill();
  ctx.fillStyle = "#15161b"; ctx.font = `900 ${size * 0.5}px InterBlk`;
  const nw = ctx.measureText(String(i + 1)).width;
  ctx.fillText(String(i + 1), x0 + size * 0.38 - nw / 2, CAP_Y - size * 0.16 + dy);
  ctx.font = `900 ${size}px InterBlk`;
  ctx.fillStyle = p.col; ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 10;
  ctx.fillText(name, x0 + size, CAP_Y + dy);
  ctx.shadowBlur = 0;
  fitFont(p.sub, "600 SIZEpx InterSB", 40, 800);
  ctx.fillStyle = "#e9ebf1";
  const sw = ctx.measureText(p.sub).width;
  ctx.fillText(p.sub, TEXT_CX - sw / 2, CAP_Y + 62 + dy);
  ctx.globalAlpha = 1;
}

function finale(t) {
  const a = easeOut(ramp(t, T_FINAL, T_FINAL + 0.3));
  if (a <= 0) return;
  const lines = [["UND DER PLAN", "#fff", 0], ["FINDET NIE STATT.", "#f6c35b", 0.25]];
  lines.forEach(([s, col, d], j) => {
    const p = easeOut(ramp(t, T_FINAL + d, T_FINAL + d + 0.3));
    ctx.globalAlpha = p;
    const size = fitFont(s, "900 SIZEpx InterBlk", 84, 820);
    const w = ctx.measureText(s).width;
    ctx.fillStyle = col; ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 12;
    ctx.fillText(s, TEXT_CX - w / 2, CAP_Y + j * 88 + (1 - p) * 18);
    ctx.shadowBlur = 0;
  });
  const q = easeOut(ramp(t, T_FINAL + 0.9, T_FINAL + 1.2));
  ctx.globalAlpha = q;
  ctx.font = "600 38px InterSB"; ctx.fillStyle = "#cfd4df";
  const s = "Welcher bist du?"; const w = ctx.measureText(s).width;
  ctx.fillText(s, TEXT_CX - w / 2, CAP_Y + 160);
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0c0e14"); g.addColorStop(0.5, "#11141c"); g.addColorStop(1, "#08090d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Bühnenboden hinter den Figuren
  const fl = ctx.createRadialGradient(490, ROW_Y, 40, 490, ROW_Y, 520);
  fl.addColorStop(0, "rgba(255,255,255,0.07)"); fl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = fl; ctx.fillRect(0, ROW_Y - 260, W, 400);

  // Karte am Schluss leicht abdunkeln, Fokus auf den Satz
  chat(t);
  for (let i = 0; i < P.length; i++) person(i, t);
  titleTop(t);
  caption(t);
  finale(t);

  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, T_END - 0.9, T_END - 0.1));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return { items: ITEMS.map(it => ({ t: it.t, kind: it.kind })), people: P.map(p => p.t), ghost: GHOST,
           voiceBadge: VOICE_BADGE.map(v => v[0]), typing: 5.7, final: T_FINAL, end: T_END };
};

window.setup = async function (timeline) {
  TL = timeline;
  await Promise.all([document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk")]);
  return true;
};
