// "Alphabet-Armee – Tag 1" – eigene Figur, eigene Zeichnung. Stimme: Edge TTS (de-DE-ConradNeural).
"use strict";
const W = 1080, H = 1920;
const TEXT_TOP = 250, TEXT_CX = 510, TEXT_W = 820;
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
function Wt(si, text) { const n = norm(text); const h = TOK.find(k => k.si === si && norm(k.text) === n); return h ? h.s : S[si] + 0.3; }
function sentenceAt(t) { let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k] - 0.15) i = k; return i; }
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LCOL = ["#e8443c", "#3b7dd8", "#f2a33a", "#2f9d6a", "#8a4ad9", "#e86a9a", "#3ab0c8", "#c8743a", "#5a6ad0", "#2fbf8a"];

// ------------------------------------------------------------ eigener Soldat (Helm, Tarnhemd, Megafon)
function soldier(x, fy, s, o = {}) {
  RIG_T = o.t || 0;
  const P = person(x, fy, { s, c2: "#5a7a3a", skin: "#e0a982", legs: "#3a4a2a", shoes: "#2a2a22", f: o.f || "wide", seed: 7, arm: o.arm, look: o.look || 0 });
  const u = s * 1.45;
  // Tarnflecken
  ctx.fillStyle = "rgba(40,60,30,0.55)";
  for (const [dx, dy, r] of [[-18, 110, 9], [14, 130, 11], [-6, 160, 8], [20, 175, 7], [-24, 185, 9]]) { ctx.beginPath(); ctx.ellipse(x + dx * u, P.hy + dy * u * 0.6, r * u, r * 0.7 * u, 0.4, 0, Math.PI * 2); ctx.fill(); }
  // Helm
  ctx.fillStyle = "#4a6a2e"; ctx.beginPath(); ctx.ellipse(x, P.hy - 6 * u, 36 * u, 26 * u, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#3a5424"; rr(x - 40 * u, P.hy - 8 * u, 80 * u, 9 * u, 4 * u); ctx.fill();
  if (o.mega) {                                               // Megafon vor dem Mund
    ctx.save(); ctx.translate(x + 30 * u, P.hy + 18 * u); ctx.rotate(-0.2);
    ctx.fillStyle = "#e9e4d8"; ctx.beginPath(); ctx.moveTo(0, -8 * u); ctx.lineTo(40 * u, -22 * u); ctx.lineTo(40 * u, 22 * u); ctx.lineTo(0, 8 * u); ctx.fill();
    ctx.fillStyle = "#d9443c"; ctx.fillRect(-6 * u, -9 * u, 10 * u, 18 * u);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) { const p = ((o.t || 0) * 2 + i / 3) % 1; ctx.globalAlpha = 1 - p; ctx.beginPath(); ctx.arc(x + 80 * u, P.hy + 14 * u, (20 + p * 50) * u, -0.6, 0.6); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  return P;
}
function miniSoldier(x, y, s, col) {                        // kleiner Soldat für die Armee
  circle(x, y - 22 * s, 9 * s, "#e0a982");
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y - 25 * s, 10 * s, 7 * s, 0, Math.PI, 0); ctx.fill();
  rr(x - 8 * s, y - 14 * s, 16 * s, 16 * s, 4 * s); ctx.fill();
}

// ------------------------------------------------------------ Hintergründe
function sky() {
  const g = ctx.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, "#6aa8e0"); g.addColorStop(1, "#cfe6f6");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1100);
  for (const [x, y, s] of [[160, 620, 1], [820, 560, 1.3], [520, 720, 0.8]]) { ctx.fillStyle = "rgba(255,255,255,0.9)"; for (const [dx, r] of [[-40, 30], [0, 42], [44, 32]]) { ctx.beginPath(); ctx.arc(x + dx * s, y, r * s, 0, Math.PI * 2); ctx.fill(); } }
}
function field(t, k, highlight) {                          // 26 Buchstaben-Kacheln in Perspektive
  sky();
  const g = ctx.createLinearGradient(0, 1000, 0, H); g.addColorStop(0, "#6aaa4a"); g.addColorStop(1, "#3a7a2a");
  ctx.fillStyle = g; ctx.fillRect(0, 1000, W, H - 1000);
  for (let i = 0; i < 26; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    const rows = 7, depth = row / (rows - 1);
    const y = lerp(1060, 1760, 1 - depth) ;
    const sc = lerp(0.55, 1.15, 1 - depth);
    const x = 540 + (col - 1.5) * 200 * sc;
    const p = back(ramp(k, i / 26 * 0.8, i / 26 * 0.8 + 0.2));
    if (p <= 0) continue;
    const L = LETTERS[25 - i];
    ctx.save(); ctx.translate(x, y); ctx.scale(sc * p, sc * p * 0.62);
    const hi = highlight === L;
    ctx.fillStyle = hi ? `rgba(255,70,80,${0.6 + 0.4 * Math.sin(t * 10)})` : "rgba(255,255,255,0.18)"; rr(-86, -86, 172, 172, 18); ctx.fill();
    ctx.strokeStyle = hi ? "#ff3b4b" : "rgba(255,255,255,0.55)"; ctx.lineWidth = 6; rr(-86, -86, 172, 172, 18); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(x, y - 10 * sc); ctx.scale(sc * p, sc * p);
    ctx.fillStyle = hi ? "#fff" : LCOL[i % LCOL.length]; ctx.font = "900 84px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 6; ctx.fillText(L, 0, 0);
    ctx.restore();
  }
}
function badge(txt, x, y, s, col = "#ffd23a", tc = "#1d1d22", size = 44) {
  if (s <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px InterX`; const w = ctx.measureText(txt).width + 60;
  ctx.fillStyle = col; ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 12; rr(-w / 2, -size * 0.75, w, size * 1.5, size * 0.5); ctx.fill();
  ctx.shadowColor = "transparent"; ctx.fillStyle = tc; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
function rankBoard(t, t0) {                                 // Rangliste: alle Buchstaben bei 0
  ctx.fillStyle = "rgba(14,18,30,0.92)"; rr(90, 760, 900, 820, 30); ctx.fill();
  ctx.fillStyle = "#ffd23a"; ctx.font = "900 40px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("RANGLISTE · TAG 1", 540, 820);
  for (let i = 0; i < 26; i++) {
    const p = back(ramp(t, t0 + i * 0.03, t0 + i * 0.03 + 0.25)); if (p <= 0) continue;
    const col = i % 4, row = Math.floor(i / 4);
    const x = 210 + col * 220, y = 900 + row * 96;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.fillStyle = LCOL[i % LCOL.length]; rr(-90, -36, 76, 72, 14); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "900 42px InterX"; ctx.fillText(LETTERS[i], -52, 2);
    ctx.fillStyle = "#e9ebf1"; ctx.font = "800 34px InterX"; ctx.textAlign = "left"; ctx.fillText("0", 2, 2); ctx.textAlign = "center";
    ctx.restore();
  }
}

// ------------------------------------------------------------ Szenen je Satz
function scene(t, si) {
  const st = S[si];
  if (si <= 1) {
    if (si === 0) {
      sky(); ctx.fillStyle = "#5a9a3a"; ctx.fillRect(0, 1400, W, H - 1400);
      soldier(480, 1900, 2.2, { t, mega: true, f: "wide", arm: [{ side: 1, ang: -1.6 }] });
      const L = LETTERS[Math.floor(t * 8) % 26];
      badge(L, 760, 620, back(ramp(t, 0.2, 0.5)), "#3b7dd8", "#fff", 110);
    } else {
      field(t, ramp(t, st, st + 1.6), null);
      badge("ALPHABET-ARMEE", 540, 700, back(ramp(t, Wt(1, "ARMEE!"), Wt(1, "ARMEE!") + 0.3)), "#ffd23a", "#1d1d22", 52);
    }
  } else if (si === 2 || si === 3) {
    field(t, 1, "E");
    // Beispiel-Kommentar
    const k = back(ramp(t, S[2], S[2] + 0.35));
    ctx.save(); ctx.translate(540, 760); ctx.scale(k, k);
    ctx.fillStyle = "rgba(255,255,255,0.97)"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 16; rr(-380, -80, 760, 160, 28); ctx.fill(); ctx.shadowColor = "transparent";
    circle(-300, 0, 40, "#e86a9a"); ctx.fillStyle = "#fff"; ctx.font = "900 40px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("E", -300, 2);
    ctx.textAlign = "left"; ctx.fillStyle = "#8a8f9c"; ctx.font = "700 26px InterX"; ctx.fillText("@du", -240, -26);
    ctx.fillStyle = "#1d1d22"; ctx.font = "800 46px InterX"; ctx.fillText("Emma", -240, 22);
    ctx.fillStyle = "#b8bcc6"; ctx.font = "800 22px InterX"; ctx.letterSpacing = "3px"; ctx.fillText("BEISPIEL", 150, -40); ctx.letterSpacing = "0px";
    ctx.restore();
    if (si === 3) {
      const m = ramp(t, S[3], S[3] + 1.4);
      miniSoldier(lerp(540, 450, m), lerp(900, 1330, m), 2.4, "#4a6a2e");
      badge("+1 SOLDAT", 700, 980, back(ramp(t, Wt(3, "Soldat"), Wt(3, "Soldat") + 0.3)), "#2fbf6a", "#fff", 46);
    }
  } else if (si === 4 || si === 5) {
    field(t, 1, null);
    if (si === 4) badge("TAG 1", 540, 900, back(ramp(t, Wt(4, "TAG"), Wt(4, "TAG") + 0.35)), "#ffd23a", "#1d1d22", 120);
    else rankBoard(t, S[5]);
  } else if (si === 6) {
    field(t, 1, "X");
    badge("LETZTER PLATZ FLIEGT RAUS", 540, 760, back(ramp(t, Wt(6, "LETZTE"), Wt(6, "LETZTE") + 0.35)), "#e8343c", "#fff", 40);
    soldier(860, 1950, 1.5, { t, f: "sad", arm: [{ side: 1, ang: -2.7 }] });
  } else if (si === 7) {
    sky(); ctx.fillStyle = "#5a9a3a"; ctx.fillRect(0, 1400, W, H - 1400);
    soldier(540, 1950, 1.9, { t, f: "happy", arm: [{ side: -1, ang: 2.4 }, { side: 1, ang: -2.4 }] });
    [["FOLGEN", "#e8343c", "Folgen,"], ["LIKEN", "#e86a9a", "liken,"], ["SPEICHERN", "#f2a33a", "speichern"]].forEach(([lab, col, w], i) => {
      const k = back(ramp(t, Wt(7, w), Wt(7, w) + 0.3));
      badge(lab, 220 + i * 320, 760, k, col, "#fff", 40);
    });
  } else if (si === 8) {
    field(t, 1, null);
    ctx.fillStyle = "rgba(14,18,30,0.9)"; rr(140, 760, 800, 560, 28); ctx.fill();
    ctx.fillStyle = "#ffd23a"; ctx.font = "900 38px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DEINE ARMEE", 540, 820);
    for (let i = 0; i < 8; i++) {
      const p = back(ramp(t, S[8] + 0.3 + i * 0.12, S[8] + 0.6 + i * 0.12)); if (p <= 0) continue;
      const x = 330 + (i % 2) * 420, y = 900 + Math.floor(i / 2) * 100;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.setLineDash([10, 8]); ctx.lineWidth = 3; rr(-170, -34, 340, 68, 14); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = i === 0 ? "#fff" : "rgba(255,255,255,0.35)"; ctx.font = "800 30px InterX"; ctx.fillText(i === 0 ? "DEIN NAME?" : "…", 0, 2);
      ctx.restore();
    }
  } else {
    sky(); ctx.fillStyle = "#5a9a3a"; ctx.fillRect(0, 1400, W, H - 1400);
    soldier(380, 1950, 1.9, { t, f: si === 9 ? "wide" : "smile", mega: si === 10, arm: [{ side: 1, ang: -1.9 }] });
    const k = back(ramp(t, Wt(9, "X?"), Wt(9, "X?") + 0.35));
    ctx.save(); ctx.translate(780, 900); ctx.scale(k, k); ctx.rotate(Math.sin(t * 4) * 0.06);
    ctx.fillStyle = "#8a4ad9"; rr(-130, -130, 260, 260, 30); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "900 190px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("X", 0, 10);
    ctx.restore();
    if (si === 10) {
      badge("KENNST DU EIN X? SCHICK DAS.", 540, 1180, back(ramp(t, S[10], S[10] + 0.35)), "#ffd23a", "#1d1d22", 36);
      badge("1 KOMMENTAR = 1 SOLDAT · RANGLISTE MORGEN", 540, 1290, back(ramp(t, S[10] + 0.8, S[10] + 1.1)), "#ffffff", "#1d1d22", 28);
    }
  }
}

// ------------------------------------------------------------ Figuren-Rig (eigener Flat-Stil: Gelenke, Kleidung, Blinzeln, Atmen)
// Kompatibel zur alten person(x, fy, o): o.f = Ausdruck, o.arm = [{side, ang}], o.walk = Phase, o.look, o.s
const SKINS = ["#f2c7a5", "#e0a982", "#c98e6a", "#f6d6bd", "#a8714f"];
function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function shade(hex, k) {             // k < 0 dunkler, k > 0 heller
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function limb(a, b, c, w, col) {     // zweiteiliges Glied mit runden Gelenken
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
}
function polar(p, ang, len) { return [p[0] + Math.sin(ang) * len, p[1] + Math.cos(ang) * len]; }
const BLINK = t => { const p = (t % 3.7) / 3.7; return p > 0.965 ? 1 : 0; };

function eyesMouth(x, y, u, f, look, t, seed) {
  const blink = f === "happy" || f === "laugh" || f === "closed" ? 0 : BLINK(t + seed);
  const lx = look * 3.2 * u, ey = y - 2 * u;
  ctx.lineCap = "round";
  // Augenbrauen
  ctx.strokeStyle = "#3a2a24"; ctx.lineWidth = 2.6 * u;
  const bro = f === "sad" ? 1 : f === "annoyed" ? -1 : f === "wide" ? -0.6 : 0;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 13 * u - 6 * u + lx, ey - 12 * u - (s * bro > 0 ? 3 * u : 0)); ctx.lineTo(x + s * 13 * u + 6 * u + lx, ey - 12 * u - (s * bro < 0 ? 3 * u : 0)); ctx.stroke(); }
  // Augen
  for (const s of [-1, 1]) {
    const ex = x + s * 12.5 * u + lx;
    if (f === "happy" || f === "laugh") { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(ex, ey + 2 * u, 5 * u, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); continue; }
    if (f === "closed") { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(ex, ey - 2 * u, 5 * u, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); continue; }
    if (f === "annoyed" || blink) { ctx.strokeStyle = "#2a2226"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(ex - 5 * u, ey); ctx.lineTo(ex + 5 * u, ey); ctx.stroke(); continue; }
    const big = f === "wide" ? 1.25 : 1;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, 6.2 * u * big, 7 * u * big, 0, 0, Math.PI * 2); ctx.fill();
    circle(ex + look * 1.8 * u, ey + 0.8 * u, 3.6 * u * big, "#2a2226");
    circle(ex + look * 1.8 * u + 1.4 * u, ey - 1 * u, 1.2 * u, "#fff");
  }
  // Nase
  ctx.strokeStyle = "rgba(120,60,40,0.35)"; ctx.lineWidth = 2.2 * u; ctx.beginPath(); ctx.arc(x + lx * 0.6, y + 6 * u, 3 * u, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  // Mund
  const my = y + 15 * u;
  ctx.strokeStyle = "#5a2a2a"; ctx.fillStyle = "#6a2a30"; ctx.lineWidth = 2.6 * u;
  if (f === "laugh") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my - 1 * u, 8 * u, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#f6f2ee"; ctx.fillRect(x + lx * 0.5 - 6 * u, my - 1 * u, 12 * u, 3 * u); }
  else if (f === "smile" || f === "happy" || f === "closed") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my - 4 * u, 7 * u, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else if (f === "sad") { ctx.beginPath(); ctx.arc(x + lx * 0.5, my + 5 * u, 6 * u, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (f === "whistle") { ctx.beginPath(); ctx.ellipse(x + lx * 0.5 + 4 * u, my, 3 * u, 3.8 * u, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (f === "wide") { ctx.beginPath(); ctx.ellipse(x + lx * 0.5, my, 3.6 * u, 4.6 * u, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(x + lx * 0.5 - 5 * u, my); ctx.quadraticCurveTo(x + lx * 0.5, my + 1.5 * u, x + lx * 0.5 + 5 * u, my); ctx.stroke(); }
}

function person(x, fy, o) {
  const t = RIG_T;
  const u = (o.s || 1) * 1.45;
  const seed = (o.seed !== undefined ? o.seed : hashStr(JSON.stringify(o.c2 || "") + (o.hair || ""))) % 7;
  const skin = o.skin || SKINS[seed % SKINS.length];
  const top = o.c2 || "#7fa8d8", topD = shade(top, -0.18), topL = shade(top, 0.15);
  const pants = o.legs || "#34405e", shoes = o.shoes || "#f4f2ee";
  const walking = !!o.walk, ph = o.walk || 0;
  const breath = walking ? 0 : Math.sin(t * 2.2 + seed) * 1.2 * u;
  const bob = walking ? Math.abs(Math.sin(ph)) * 4 * u : 0;
  const hipY = fy - 92 * u - bob, shY = hipY - 78 * u - breath, neckY = shY - 6 * u, hy = neckY - 36 * u;
  const tilt = (o.look || 0) * 0.04 + Math.sin(t * 0.9 + seed) * 0.015;
  // Schatten
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(x, fy + 2, 44 * u, 8 * u, 0, 0, Math.PI * 2); ctx.fill();
  // Beine (Hüfte -> Knie -> Fuß)
  for (const sd of [-1, 1]) {
    const swing = walking ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.42 : 0;
    const hip = [x + sd * 13 * u, hipY];
    const knee = polar(hip, swing, 46 * u);
    const kneeBend = walking ? Math.max(0, -Math.sin(ph + (sd > 0 ? 0 : Math.PI))) * 0.6 : 0;
    const foot = polar(knee, swing - kneeBend, 44 * u);
    limb(hip, knee, foot, 21 * u, pants);
    ctx.fillStyle = shoes; ctx.beginPath(); ctx.ellipse(foot[0] + sd * 4 * u, foot[1] + 1 * u, 13 * u, 7 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(foot[0] + sd * 4 * u - 12 * u, foot[1] + 4 * u, 24 * u, 2.5 * u);
  }
  // Rumpf (Oberteil)
  const g = ctx.createLinearGradient(x - 40 * u, 0, x + 40 * u, 0);
  g.addColorStop(0, topL); g.addColorStop(0.55, top); g.addColorStop(1, topD);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 36 * u, shY + 10 * u); ctx.quadraticCurveTo(x - 38 * u, shY - 2 * u, x - 22 * u, shY - 2 * u);
  ctx.lineTo(x + 22 * u, shY - 2 * u); ctx.quadraticCurveTo(x + 38 * u, shY - 2 * u, x + 36 * u, shY + 10 * u);
  ctx.lineTo(x + 31 * u, hipY + 6 * u); ctx.quadraticCurveTo(x, hipY + 12 * u, x - 31 * u, hipY + 6 * u); ctx.closePath(); ctx.fill();
  if (o.hood) {                                       // Kapuze, Tasche, Kordeln
    ctx.fillStyle = topD; ctx.beginPath(); ctx.ellipse(x, shY + 2 * u, 26 * u, 9 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(top, -0.1); rr(x - 20 * u, hipY - 30 * u, 40 * u, 24 * u, 8 * u); ctx.fill();
    ctx.strokeStyle = "#f6f2ee"; ctx.lineWidth = 2.4 * u; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sd * 7 * u, shY + 8 * u); ctx.lineTo(x + sd * 8 * u, shY + 30 * u); ctx.stroke(); circle(x + sd * 8 * u, shY + 31 * u, 2.4 * u, "#f6f2ee"); }
  }
  if (o.apron) {
    ctx.fillStyle = "#7a5034"; rr(x - 24 * u, shY + 18 * u, 48 * u, hipY - shY + 20 * u, 6 * u); ctx.fill();
    ctx.fillStyle = "#64412a"; rr(x - 14 * u, hipY - 26 * u, 28 * u, 18 * u, 4 * u); ctx.fill();
    ctx.strokeStyle = "#7a5034"; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(x - 20 * u, shY + 20 * u); ctx.lineTo(x - 10 * u, shY - 1 * u); ctx.moveTo(x + 20 * u, shY + 20 * u); ctx.lineTo(x + 10 * u, shY - 1 * u); ctx.stroke();
  }
  if (o.collar) { ctx.fillStyle = "#f6f2ee"; ctx.beginPath(); ctx.moveTo(x - 12 * u, shY - 2 * u); ctx.lineTo(x, shY + 12 * u); ctx.lineTo(x + 12 * u, shY - 2 * u); ctx.fill(); }
  // Hals + Kopf
  ctx.fillStyle = shade(skin, -0.12); rr(x - 7 * u, neckY - 10 * u, 14 * u, 16 * u, 4 * u); ctx.fill();
  ctx.save(); ctx.translate(x, hy + 30 * u); ctx.rotate(tilt); ctx.translate(-x, -(hy + 30 * u));
  for (const sd of [-1, 1]) circle(x + sd * 31 * u, hy + 2 * u, 7 * u, shade(skin, -0.06));        // Ohren
  const hg = ctx.createRadialGradient(x - 10 * u, hy - 12 * u, 4 * u, x, hy, 36 * u);
  hg.addColorStop(0, shade(skin, 0.12)); hg.addColorStop(1, skin);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(x, hy, 31 * u, 34 * u, 0, 0, Math.PI * 2); ctx.fill();
  // Haare
  if (o.white) {                                      // Opa: Glatze, weiße Seiten
    ctx.fillStyle = "#eceef2"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sd * 26 * u, hy - 6 * u, 9 * u, 16 * u, sd * 0.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(x - 8 * u, hy - 24 * u, 10 * u, 5 * u, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (o.hair) {
    ctx.fillStyle = o.hair;
    ctx.beginPath(); ctx.ellipse(x, hy - 16 * u, 33 * u, 22 * u, 0, Math.PI, 0); ctx.lineTo(x + 33 * u, hy - 4 * u);
    ctx.quadraticCurveTo(x + 18 * u, hy - 20 * u, x - 6 * u, hy - 18 * u); ctx.quadraticCurveTo(x - 24 * u, hy - 16 * u, x - 33 * u, hy - 2 * u); ctx.closePath(); ctx.fill();
    if (o.long) { ctx.beginPath(); ctx.ellipse(x - 28 * u, hy + 14 * u, 9 * u, 26 * u, 0.1, 0, Math.PI * 2); ctx.ellipse(x + 28 * u, hy + 14 * u, 9 * u, 26 * u, -0.1, 0, Math.PI * 2); ctx.fill(); }
  }
  eyesMouth(x, hy + 2 * u, u, o.f || "neutral", o.look || 0, t, seed);
  if (o.beard) { ctx.fillStyle = "#eceef2"; ctx.beginPath(); ctx.ellipse(x - 7 * u, hy + 12 * u, 9 * u, 4.5 * u, 0.25, 0, Math.PI * 2); ctx.ellipse(x + 7 * u, hy + 12 * u, 9 * u, 4.5 * u, -0.25, 0, Math.PI * 2); ctx.fill(); }
  if (o.glasses) { ctx.strokeStyle = "#3a3d4a"; ctx.lineWidth = 2.4 * u; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sd * 12.5 * u + (o.look || 0) * 3.2 * u, hy, 9.5 * u, 0, Math.PI * 2); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - 3 * u, hy - 1 * u); ctx.lineTo(x + 3 * u, hy - 1 * u); ctx.stroke(); }
  if (o.cap) { ctx.fillStyle = o.cap; ctx.beginPath(); ctx.ellipse(x, hy - 16 * u, 33 * u, 22 * u, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = shade(o.cap, -0.2); rr(x - 4 * u, hy - 20 * u, 46 * u, 9 * u, 4 * u); ctx.fill(); }
  if (o.blush) { ctx.fillStyle = "rgba(240,110,110,0.3)"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sd * 19 * u, hy + 10 * u, 6 * u, 3.6 * u, 0, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
  // Arme (Schulter -> Ellbogen -> Hand), Ärmel in Oberteil-Farbe
  const arms = o.arm || [];
  for (const sd of [-1, 1]) {
    const a = arms.find(q => q.side === sd);
    let ang;
    if (a) ang = -a.ang;                             // alte Konvention: negativer Winkel = Arm nach oben (rechts)
    else ang = walking ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * 0.45 : sd * 0.12 + Math.sin(t * 2.2 + seed) * 0.02;
    const sh = [x + sd * 32 * u, shY + 8 * u];
    const elbow = polar(sh, ang * (sd > 0 ? 1 : 1), 38 * u);
    const bend = a ? (Math.abs(a.ang) > 1.6 ? 0.35 : 0.2) * sd : (walking ? 0.25 : 0.12) * sd;
    const hand = polar(elbow, ang + bend * (a && a.ang < 0 ? -1 : 1), 34 * u);
    limb(sh, elbow, hand, 17 * u, top);
    ctx.strokeStyle = topD; ctx.lineWidth = 3 * u; ctx.beginPath(); const cuff = polar(elbow, ang + bend, 26 * u); ctx.moveTo(cuff[0] - 7 * u, cuff[1]); ctx.lineTo(cuff[0] + 7 * u, cuff[1]); ctx.stroke();
    circle(hand[0], hand[1], 8.5 * u, skin);
  }
  return { hx: x, hy: hy - 6 * u };
}
let RIG_T = 0;

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
      ctx.fillStyle = heavy && card.sentence === 1 ? "#ffd23a" : "#fff";
      ctx.fillText(tok.text, x0 + it.x, TEXT_TOP + line.y + dy);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}


// ------------------------------------------------------------------ Bild
let GRAIN = [];
window.renderFrame = function (t) {
  RIG_T = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#0b0c12"; ctx.fillRect(0, 0, W, H);
  const si = sentenceAt(t);
  const drawSc = (k, dx) => {
    ctx.save(); ctx.translate(dx, 0);
    const z = 1 + 0.03 * ramp(t, S[k] - 0.15, (S[k + 1] || TL.duration) - 0.15);
    ctx.translate(540, 1200); ctx.scale(z, z); ctx.translate(-540, -1200);
    scene(t, k);
    ctx.restore();
  };
  const tr = si > 0 ? ramp(t, S[si] - 0.15, S[si] + 0.2) : 1;
  if (tr < 1) { const k = easeIO(tr); drawSc(si - 1, -W * k); drawSc(si, W * (1 - k)); } else drawSc(si, 0);
  const tg = ctx.createLinearGradient(0, 100, 0, 620);
  tg.addColorStop(0, "rgba(8,9,14,0.7)"); tg.addColorStop(1, "rgba(8,9,14,0)");
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 620); ctx.fillStyle = "rgba(8,9,14,0.7)"; ctx.fillRect(0, 0, W, 100);
  for (const card of TL.cards) if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  ctx.globalAlpha = 0.03; ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.25), ramp(t, TL.duration - 1.0, TL.duration - 0.1));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};
window.exportEvents = function () {
  return { scenes: S, duration: TL.duration, armee: Wt(1, "ARMEE!"), soldat: Wt(3, "Soldat"), tag: Wt(4, "TAG"), rank: S[5], letzte: Wt(6, "LETZTE"),
    buttons: [Wt(7, "Folgen,"), Wt(7, "liken,"), Wt(7, "speichern")], x: Wt(9, "X?"), end: [S[10], S[10] + 0.8] };
};
window.setup = async function (timeline) {
  TL = timeline; S = TL.sentences.map(s => s.start);
  TOK = []; for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("800 16px InterX"), document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"), document.fonts.load("900 50px InterBlk")]);
  let seed = 97; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return true;
};
