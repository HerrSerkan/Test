// "Lass sie nicht auf Gelesen" – Canvas-Animation (eigene Zeichnung), ohne Sprecher.
//   await window.setup(timeline)  ->  window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const TOP = [430, 840], BOT = [880, 1290];
const T_END = 15.4, T_LINE = 11.0;
const TEXT_CX = 500;
const RED = "#ff4d5e";
const MONO = "'JetBrains Mono'";
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
let TL = null;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;

function glowAt(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function line(pts, w) {
  ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
}

// ------------------------------------------------------------------ Nachrichten
// oben: alles bleibt unbeantwortet
const TOP_MSGS = [
  [0.5, "Hab den Job!!"], [2.2, "Wollen wir feiern?"], [3.2, "Hallo??"], [4.1, "Alles okay bei dir?"],
  [5.0, "Alles Gute zum Geburtstag!"], [6.0, "Sah das hier. Lol"], [6.9, "Hey"], [7.6, "Ist alles gut zwischen uns?"],
  [8.4, "Ich vermisse unsere Gespräche."],
];
const TYPING = [9.1, 10.3];
const SLUMP = 10.5;
// unten: wird zurückgeschrieben, dann telefonieren sie
const BOT_FIRST = 0.5, BOT_REPLY = 1.7, CALL = 3.3;
const SPOKEN = [
  [3.9, -1, "Montag fang ich an!"], [5.0, 1, "Wusste, dass du's packst!"], [6.3, -1, "Haha!"], [6.6, 1, "Haha!"],
  [7.7, 1, "Essen geht auf mich!"], [9.0, -1, "Deal!"],
];

// ------------------------------------------------------------------ Figur sitzend, seitlich
// dir = +1 schaut nach rechts. o = {lean (0..1), pose: 'phone'|'ear'|'slump', bob, col}
function seated(x, fy, dir, o) {
  const X = (dx) => x + dx * dir;
  const col = o.col || "#f2f2f2";
  // Stuhl
  ctx.strokeStyle = "#7d7d7d"; ctx.lineWidth = 7; ctx.lineCap = "round";
  line([[X(-34), fy - 64], [X(34), fy - 64]], 7);
  line([[X(-30), fy - 64], [X(-30), fy]], 6);
  line([[X(28), fy - 64], [X(28), fy]], 6);
  line([[X(-34), fy - 64], [X(-40), fy - 160]], 7);
  const lean = o.lean || 0, bob = o.bob || 0;
  const hip = [X(-4), fy - 76];
  const neck = [X(4 + lean * 34), fy - 168 + lean * 30 + bob];
  const head = [neck[0] + dir * (4 + lean * 22), neck[1] - 38 + lean * 18 - bob * 0.5];
  ctx.strokeStyle = col; ctx.fillStyle = col;
  line([hip, [X(46), fy - 78], [X(50), fy]], 16);      // Bein
  line([hip, neck], 18);
  let el, ha, phone;
  if (o.pose === "ear") {
    el = [neck[0] + dir * 30, neck[1] + 34]; ha = [head[0] + dir * 6, head[1] + 14]; phone = ha;
  } else if (o.pose === "slump") {
    el = [neck[0] + dir * 18, neck[1] + 56]; ha = [neck[0] + dir * 30, neck[1] + 100]; phone = ha;
  } else {
    el = [neck[0] + dir * 22, neck[1] + 50]; ha = [neck[0] + dir * 48, neck[1] + 24]; phone = ha;
  }
  line([neck, el, ha], 14);
  ctx.beginPath(); ctx.arc(head[0], head[1], 30, 0, 7); ctx.fill();
  // Handy
  const lit = o.lit === undefined ? 1 : o.lit;
  if (lit > 0 && o.pose !== "ear") glowAt(phone[0], phone[1], 70, o.glow || "150,190,255", 0.35 * lit);
  ctx.save(); ctx.translate(phone[0], phone[1]); ctx.rotate(o.pose === "ear" ? -0.4 * dir : 0.2 * dir);
  ctx.fillStyle = "#111"; ctx.fillRect(-9, -15, 18, 30);
  ctx.fillStyle = `rgba(170,205,255,${0.25 + 0.7 * lit})`; ctx.fillRect(-6, -12, 12, 24);
  ctx.restore();
  return { head };
}

// ------------------------------------------------------------------ Sprechblasen
function bubble(x, y, text, o) {
  ctx.font = `700 25px ${MONO}`;
  const w = ctx.measureText(text).width + 32, h = 46;
  const bx = o.right ? x - w : x;
  ctx.globalAlpha = o.a;
  ctx.fillStyle = o.fill || "rgba(20,20,22,0.9)";
  ctx.beginPath(); ctx.roundRect(bx, y - h, w, h, 10); ctx.fill();
  ctx.strokeStyle = o.stroke || "rgba(255,255,255,0.75)"; ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = o.color || "#fff";
  ctx.fillText(text, bx + 16, y - 15);
  if (o.seen > 0) {
    ctx.globalAlpha = o.a * o.seen;
    ctx.font = `700 15px ${MONO}`;
    ctx.fillStyle = RED;
    ctx.fillText("✓✓ Gesehen", bx + 4, y + 20);
  }
  ctx.globalAlpha = 1;
}

function counter(x, y, n, red) {
  ctx.font = `700 22px ${MONO}`; ctx.letterSpacing = "4px";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("GESEHEN", x, y);
  const w = ctx.measureText("GESEHEN ").width;
  ctx.font = `800 30px ${MONO}`;
  ctx.fillStyle = red ? RED : "#fff";
  ctx.fillText(String(n).padStart(2, "0"), x + w, y + 1);
  ctx.letterSpacing = "0px";
}

function panelLabel(txt, y) {
  ctx.font = `700 24px ${MONO}`; ctx.letterSpacing = "8px";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  const w = ctx.measureText(txt).width - 8;
  ctx.fillText(txt, TEXT_CX - w / 2, y);
  ctx.letterSpacing = "0px";
}

function floor(y0, y1, fy) {
  ctx.fillStyle = "#050505"; ctx.fillRect(0, y0, W, y1 - y0);
  const g = ctx.createLinearGradient(0, fy - 4, 0, fy + 4);
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(30, fy); ctx.lineTo(W - 30, fy); ctx.stroke();
  ctx.save(); ctx.translate(540, fy); ctx.scale(1, 0.06); glowAt(0, 0, 520, "255,255,255", 0.18); ctx.restore();
}

// ------------------------------------------------------------------ oben
function topPanel(t) {
  const [y0, y1] = TOP;
  const fy = y1 - 70;
  floor(y0, y1, fy);
  const seen = TOP_MSGS.filter(m => t >= m[0] + 0.45).length;
  counter(60, y0 + 46, seen, true);
  // Nachrichten-Stapel (neueste unten)
  const sent = TOP_MSGS.filter(m => t >= m[0]);
  const baseY = fy - 150;
  sent.forEach((m, i) => {
    const age = sent.length - 1 - i;                      // 0 = neueste
    const nextT = i + 1 < sent.length ? sent[i + 1][0] : null;
    const slide = nextT === null ? 0 : easeIO(ramp(t, nextT, nextT + 0.25));
    const pos = nextT === null ? 0 : (age - 1) + slide;
    const appear = easeOut(ramp(t, m[0], m[0] + 0.22));
    const fadeOld = 1 - ramp(pos, 1.0, 1.6);
    const dim = t > SLUMP ? 1 - 0.55 * ramp(t, SLUMP, SLUMP + 0.8) : 1;
    if (fadeOld <= 0) return;
    bubble(262, baseY - pos * 64 + (1 - appear) * 14, m[1],
      { a: appear * fadeOld * dim, seen: ramp(t, m[0] + 0.45, m[0] + 0.6) });
  });
  // "schreibt ..." vom Gegenüber, dann wieder weg
  const ty = ramp(t, TYPING[0], TYPING[0] + 0.15) * (1 - ramp(t, TYPING[1], TYPING[1] + 0.15));
  if (ty > 0) {
    const dots = ".".repeat(1 + (Math.floor(t * 4) % 3));
    bubble(965, fy - 250, "schreibt" + dots.padEnd(3, " "), { right: true, a: ty, stroke: "rgba(255,255,255,0.4)", color: "rgba(255,255,255,0.7)" });
  }
  // Figuren
  const slump = easeIO(ramp(t, SLUMP, SLUMP + 0.8));
  const sag = Math.min(1, seen / 9) * 0.35;
  seated(170, fy, 1, { lean: Math.max(sag, slump), pose: slump > 0.5 ? "slump" : "phone", lit: 1 - slump * 0.8 });
  seated(840, fy, -1, { lean: 0.15, pose: "phone", lit: 1 });
  panelLabel("LÄSST SIE AUF GELESEN", y1 - 18);
}

// ------------------------------------------------------------------ unten
function botPanel(t) {
  const [y0, y1] = BOT;
  const fy = y1 - 70;
  floor(y0, y1, fy);
  const call = easeIO(ramp(t, CALL, CALL + 0.5));
  // warmes Licht zwischen beiden
  if (call > 0) {
    ctx.save(); ctx.globalAlpha = call;
    glowAt(505, fy - 130, 380, "255,90,90", 0.22 + 0.05 * Math.sin(t * 3));
    ctx.restore();
  }
  counter(60, y0 + 46, t >= BOT_FIRST + 0.45 ? 1 : 0, false);
  // Chat vor dem Anruf
  const chatA = 1 - ramp(t, CALL - 0.2, CALL + 0.2);
  if (chatA > 0) {
    const shift = easeIO(ramp(t, BOT_REPLY, BOT_REPLY + 0.25));
    if (t >= BOT_FIRST) bubble(262, fy - 150 - shift * 64, "Hab den Job!!",
      { a: easeOut(ramp(t, BOT_FIRST, BOT_FIRST + 0.22)) * chatA, seen: ramp(t, BOT_FIRST + 0.45, BOT_FIRST + 0.6) });
    if (t >= BOT_REPLY) {
      const p = easeOut(ramp(t, BOT_REPLY, BOT_REPLY + 0.22));
      bubble(780, fy - 150 + (1 - p) * 14, "Nein!! Ruf mich an!", { right: true, a: p * chatA, fill: "#e8384f", stroke: "#ff8090", color: "#fff" });
    }
  }
  // Gesprochenes beim Telefonieren
  for (const [ts, side, txt] of SPOKEN) {
    const p = ramp(t, ts, ts + 1.4);
    if (p <= 0 || p >= 1) continue;
    const a = Math.sin(Math.PI * p);
    ctx.font = `800 26px ${MONO}`;
    const w = ctx.measureText(txt).width;
    const x = side < 0 ? 245 : 775 - w;
    ctx.globalAlpha = a; ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(255,120,120,0.6)"; ctx.shadowBlur = 16;
    ctx.fillText(txt, x, fy - 228 - p * 30);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
  // Figuren: freuen sich, lachen
  const laugh = (s) => (t > 6.2 && t < 7.4 ? Math.abs(Math.sin(t * 14 + s)) * 6 : Math.sin(t * 2.4 + s) * 2) * call;
  const pose = call > 0.5 ? "ear" : "phone";
  seated(170, fy, 1, { lean: 0.05 * (1 - call), pose, bob: -laugh(0), lit: 1 });
  seated(840, fy, -1, { lean: 0.15 * (1 - call), pose, bob: -laugh(1), lit: 1 });
  panelLabel("SCHREIBT ZURÜCK", y1 - 18);
}

// ------------------------------------------------------------------ Titel + Schlusszeile
function title(t) {
  const a = easeOut(ramp(t, 0.1, 0.5));
  ctx.globalAlpha = a;
  ctx.font = `800 46px ${MONO}`; ctx.letterSpacing = "9px";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(255,255,255,0.35)"; ctx.shadowBlur = 14;
  for (const [s, y] of [["LASS SIE NICHT", 320], ["AUF GELESEN.", 380]]) {
    const w = ctx.measureText(s).width - 9;
    ctx.fillText(s, TEXT_CX - w / 2, y);
  }
  ctx.shadowBlur = 0; ctx.letterSpacing = "0px"; ctx.globalAlpha = 1;
}

const LINE = "ES DAUERT ZEHN SEKUNDEN.";
function endLine(t) {
  const n = Math.floor(ramp(t, T_LINE, T_LINE + 1.5) * LINE.length + 0.001);
  if (n <= 0) return;
  ctx.font = `800 44px ${MONO}`; ctx.letterSpacing = "5px";
  const full = ctx.measureText(LINE).width - 5;
  const x0 = TEXT_CX - full / 2;
  const s = LINE.slice(0, n);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(255,255,255,0.4)"; ctx.shadowBlur = 16;
  ctx.fillText(s, x0, 1370);
  ctx.shadowBlur = 0;
  const cw = ctx.measureText(s).width;
  if (Math.floor(t * 2.5) % 2 === 0 || n < LINE.length) { ctx.fillStyle = RED; ctx.fillRect(x0 + cw + 4, 1336, 18, 40); }
  ctx.letterSpacing = "0px";
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  title(t);
  ctx.save(); ctx.beginPath(); ctx.rect(0, TOP[0], W, TOP[1] - TOP[0]); ctx.clip(); topPanel(t); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, BOT[0], W, BOT[1] - BOT[0]); ctx.clip(); botPanel(t); ctx.restore();
  endLine(t);
  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, T_END - 0.9, T_END - 0.1));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return {
    topMsgs: TOP_MSGS.map(m => m[0]), typing: TYPING, slump: SLUMP,
    botFirst: BOT_FIRST, reply: BOT_REPLY, call: CALL, spoken: SPOKEN.map(s => s[0]),
    line: [T_LINE, T_LINE + 1.5, LINE.length], end: T_END,
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  await Promise.all([document.fonts.load(`700 25px ${MONO}`), document.fonts.load(`800 25px ${MONO}`)]);
  return true;
};
