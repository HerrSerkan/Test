// "Warum Geld sich bewegt" – Canvas-Animation (deutsche Version) im Stil feiner weißer Linien auf Schwarz.
// render.js: await window.setup(timeline) -> window.renderFrame(t)
"use strict";

const W = 1080, H = 1920;
const SCX = 540, SCY = 830;             // Mitte der Szene; Szene + Text zusammen vertikal mittig
const TEXT_TOP = 1265, TEXT_CX = 490, TEXT_W = 820;
const INK = "#f1f1f1";
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

let TL = null, S = [], E = [], TOK = [], SC = [];

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
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
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function Wt(si, text, nth = 0) {
  const n = norm(text);
  const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) throw new Error("Wort nicht gefunden: " + si + " " + text);
  return hits[Math.min(nth, hits.length - 1)].s;
}
const pop = (t, t0, d = 0.35) => back(ramp(t, t0, t0 + d));
function glowOn(b = 14, a = 0.7) { ctx.shadowColor = `rgba(255,255,255,${a})`; ctx.shadowBlur = b; }
function glowOff() { ctx.shadowBlur = 0; }
function halo(x, y, r, a) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function line(pts, close) {
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  if (close) ctx.closePath();
}
function stroke(w = 3, col = INK) { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); }
// Teilstück einer Linie (Zeichnen-Effekt)
function partial(pts, u) {
  if (u <= 0) return [];
  let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(u); const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (rem >= seg[i - 1]) { out.push(pts[i]); rem -= seg[i - 1]; continue; }
    const k = rem / seg[i - 1];
    out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]);
    break;
  }
  return out;
}
function label(txt, x, y, size = 22, a = 1, spacing = 0.28, col = "rgba(235,235,235,") {
  if (a <= 0) return;
  ctx.save();
  ctx.font = `600 ${size}px InterSB`; ctx.letterSpacing = `${size * spacing}px`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = col + a + ")";
  ctx.fillText(txt, x + size * spacing / 2, y);
  ctx.restore();
}
function pill(x, y, txt, p, size = 24) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = back(p); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 3);
  ctx.font = `600 ${size}px InterSB`; ctx.letterSpacing = `${size * 0.22}px`;
  const w = ctx.measureText(txt).width + 50, h = size * 2;
  halo(0, 0, w * 0.9, 0.18);
  glowOn(22, 0.8);
  ctx.fillStyle = "#f6f6f6"; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  glowOff();
  ctx.fillStyle = "#111"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(txt, size * 0.11, 1);
  ctx.restore();
}
// Figur (Spielfigur): Kopf + Körper, Fuß bei (x, y)
function pawn(x, y, s = 1, a = 1, fill = true) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, -76, 17, 0, 7);
  ctx.moveTo(-26, 0); ctx.lineTo(-26, -30); ctx.quadraticCurveTo(-26, -54, 0, -54); ctx.quadraticCurveTo(26, -54, 26, -30); ctx.lineTo(26, 0); ctx.closePath();
  if (fill) { glowOn(12, 0.5); ctx.fillStyle = INK; ctx.fill(); glowOff(); } else { ctx.lineWidth = 3 / s; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function coin(x, y, r, a = 1, filled = true, spin = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(spin, 1);
  if (filled) {
    halo(0, 0, r * 2.6, 0.25);
    glowOn(18, 0.8); ctx.fillStyle = "#fafafa"; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); glowOff();
    ctx.fillStyle = "#0b0b0b";
  } else {
    glowOn(10, 0.6); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); stroke(Math.max(2, r * 0.07)); glowOff();
    ctx.fillStyle = INK;
  }
  ctx.font = `900 ${r * 1.15}px InterBlk`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("€", -r * 0.03, r * 0.05);
  ctx.restore();
}
const fmtEUR = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";

// ------------------------------------------------------------------ Szenen (Koordinaten relativ zur Szenenmitte)
// 1 Geld hinterherjagen
function sRun(t, sc) {
  const lt = t - sc.t0;
  ctx.save();
  // Speed-Linien
  const R = rng(4);
  for (let i = 0; i < 26; i++) {
    const y = -230 + R() * 400, len = 60 + R() * 200, sp = 500 + R() * 600;
    const x = 480 - ((lt * sp + R() * 2000) % 1100);
    ctx.globalAlpha = 0.25 + R() * 0.4;
    line([[x, y], [x + len, y]]); stroke(2);
  }
  ctx.globalAlpha = 1;
  // gestrichelter Boden
  ctx.setLineDash([18, 14]); ctx.lineDashOffset = lt * 600;
  line([[-460, 130], [460, 130]]); stroke(2.5, "rgba(240,240,240,0.7)");
  ctx.setLineDash([]);
  const bob = Math.abs(Math.sin(lt * 11)) * 12;
  ctx.save(); ctx.translate(-150, 130 - bob); ctx.rotate(0.12); pawn(0, 0, 1.25); ctx.restore();
  coin(160, 20 - Math.sin(lt * 4) * 10, 50, 1, true, Math.cos(lt * 5));
  ctx.restore();
}
// 2 Durcheinander: viele Münzen, wirre Wege
let CHAOS = null;
function sChaos(t, sc) {
  const u = ramp(t, sc.t0, sc.t1);
  if (!CHAOS) {
    const R = rng(8); CHAOS = { paths: [], coins: [] };
    for (let i = 0; i < 9; i++) {
      const pts = []; let x = -150, y = 60;
      for (let k = 0; k < 40; k++) { x += (R() - 0.45) * 90; y += (R() - 0.5) * 80; x = clamp(x, -380, 380); y = clamp(y, -240, 220); pts.push([x, y]); }
      CHAOS.paths.push(pts);
    }
    for (let i = 0; i < 18; i++) CHAOS.coins.push([-360 + R() * 720, -230 + R() * 440, 10 + R() * 14, R()]);
  }
  for (const p of CHAOS.paths) {
    const pp = partial(p, u * 1.4);
    if (pp.length > 1) {
      ctx.beginPath(); ctx.moveTo(pp[0][0], pp[0][1]);
      for (let i = 1; i < pp.length - 1; i++) ctx.quadraticCurveTo(pp[i][0], pp[i][1], (pp[i][0] + pp[i + 1][0]) / 2, (pp[i][1] + pp[i + 1][1]) / 2);
      stroke(1.6, "rgba(235,235,235,0.55)");
    }
  }
  for (const [x, y, r, ph] of CHAOS.coins) coin(x + Math.sin(t * 2 + ph * 9) * 12, y + Math.cos(t * 1.7 + ph * 7) * 10, r, 0.9 * ramp(t, sc.t0 + ph * 0.5, sc.t0 + ph * 0.5 + 0.2), ph < 0.5, Math.cos(t * 3 + ph * 6));
  pawn(-150, 100, 1.1, 1);
}
// 3 Fokus auf die Münze
function sFocus(t, sc) {
  const k = easeOut(ramp(t, sc.t0, sc.t0 + 0.6));
  ctx.save(); ctx.scale(lerp(0.7, 1, k), lerp(0.7, 1, k));
  halo(0, 0, 330, 0.12);
  coin(0, 0, 115, 1, false);
  ctx.beginPath(); ctx.arc(0, 0, 135, 0, 7); stroke(2, "rgba(240,240,240,0.5)");
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    line([[Math.cos(a) * 150, Math.sin(a) * 150], [Math.cos(a) * 185, Math.sin(a) * 185]]); stroke(2.5);
  }
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 360, i * Math.PI / 2 + 0.3 + t * 0.2, i * Math.PI / 2 + 1.0 + t * 0.2); stroke(2); }
  ctx.restore();
}
// 4 Bauplan "Wie entsteht es?"
function sBlueprint(t, sc) {
  const u = ramp(t, sc.t0, sc.t0 + 0.8);
  halo(0, -20, 260, 0.1);
  coin(0, -20, 100, 1, false);
  ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.arc(0, -20, 82, 0, 7); stroke(1.5, "rgba(240,240,240,0.6)"); ctx.setLineDash([]);
  const L = [[[-100, -160], [100, -160]], [[150, -120], [150, 80]]];
  for (const l of L) { const pp = partial(l, u); if (pp.length > 1) { line(pp); stroke(1.8); } }
  line([[-100, -170], [-100, -150]]); stroke(1.8); line([[100, -170], [100, -150]]); stroke(1.8);
  const marks = [[0, -160], [150, -20], [-200, -170], [-200, 120], [210, 130]];
  marks.forEach(([x, y], i) => {
    const p = ramp(t, sc.t0 + 0.2 + i * 0.12, sc.t0 + 0.4 + i * 0.12);
    if (p <= 0) return;
    if (i >= 2) { line(partial([[x * 0.45, -20 + (y + 20) * 0.45], [x, y]], p)); stroke(1.5, "rgba(240,240,240,0.6)"); }
    ctx.globalAlpha = p;
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill(); stroke(2);
    label("?", x - 2, y + 1, 18, 1, 0);
    ctx.globalAlpha = 1;
  });
  label("WIE ENTSTEHT ES?", 0, 230, 34, ramp(t, sc.t0 + 0.3, sc.t0 + 0.7), 0.3);
}
// 5 Das Ziel: Zahl steigt, Menschen schauen hoch
function sGoal(t, sc) {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = -300 + i * 75, a = ramp(t, sc.t0 + i * 0.04, sc.t0 + 0.3 + i * 0.04);
    pawn(x, 250, 0.62, a);
    const lp = ramp(t, sc.k1, sc.k1 + 0.6);
    if (lp > 0) {
      ctx.setLineDash([3, 7]);
      line(partial([[x, 185], [0, -40]], lp)); stroke(1.5, "rgba(230,230,230,0.45)");
      ctx.setLineDash([]);
    }
  }
  const cu = ramp(t, sc.k1, sc.k2);
  const v = 1e6 * Math.pow(cu, 2.2);
  const steps = [0, 20900, 159400, 529200, 1000000];
  const shown = cu >= 1 ? 1e6 : steps.reduce((acc, s) => (v >= s ? s : acc), 0) + (v - steps.reduce((acc, s) => (v >= s ? s : acc), 0)) * 0.35;
  const blur = 8 * (1 - ramp(t, sc.t0, sc.t0 + 0.5));
  ctx.save();
  ctx.filter = blur > 0.3 ? `blur(${blur}px)` : "none";
  label("DAS ZIEL", 0, -175, 20, ramp(t, sc.k1 - 0.3, sc.k1), 0.35);
  halo(0, -100, 300, 0.12 + 0.1 * cu);
  glowOn(26, 0.75);
  ctx.font = "900 104px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fafafa";
  ctx.fillText(fmtEUR(shown), 0, -100);
  glowOff();
  ctx.restore();
}
// 6 Eisberg
function sIceberg(t, sc) {
  const wl = 40;
  const wave = [];
  for (let x = -420; x <= 420; x += 10) wave.push([x, wl + Math.sin(x * 0.03 + t * 2) * 4]);
  line(wave); stroke(2, "rgba(240,240,240,0.8)");
  const tip = [[-170, wl], [0, -230], [170, wl]];
  line(tip); stroke(3);
  ctx.save(); ctx.font = "900 46px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = INK;
  glowOn(12, 0.5); ctx.fillText("1.000.000 €", 0, -30); glowOff(); ctx.restore();
  const under = [[-170, wl], [-280, 170], [-220, 330], [0, 390], [230, 320], [290, 160], [170, wl]];
  const u = ramp(t, sc.k1, sc.k1 + 1.0);
  if (u > 0) {
    ctx.save();
    line(under, true); ctx.clip();
    const g = ctx.createRadialGradient(0, 230, 10, 0, 230, 300);
    g.addColorStop(0, `rgba(255,255,255,${0.16 * u})`); g.addColorStop(1, "rgba(255,255,255,0.02)");
    ctx.fillStyle = g; ctx.fillRect(-300, wl, 600, 400);
    ctx.restore();
    ctx.setLineDash([8, 9]); line(partial(under, u)); stroke(2.2, "rgba(240,240,240,0.85)"); ctx.setLineDash([]);
    const R = rng(3);
    for (let i = 0; i < 14; i++) { ctx.globalAlpha = u * 0.5; ctx.beginPath(); ctx.arc(-200 + R() * 400, 90 + R() * 260, 3 + R() * 4, 0, 7); stroke(1.5); }
    ctx.globalAlpha = 1;
  }
  const lv = ramp(t, sc.k2, sc.k2 + 0.4);
  if (lv > 0) { halo(0, 225, 220, 0.25 * lv); ctx.save(); glowOn(24, 0.9); label("WERT", 0, 225, 56, lv, 0.4, "rgba(255,255,255,"); ctx.restore(); }
}
// 7 Automat mit "WILL"-Knopf
function sDevice(t, sc) {
  ctx.save(); glowOn(12, 0.6);
  rr(-150, -250, 300, 470, 34); stroke(3);
  rr(-105, -200, 210, 90, 16); stroke(2.5);
  const shake = sc.presses.some(p => t > p && t < p + 0.35) ? Math.sin(t * 80) * 4 : 0;
  ctx.font = "900 50px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = INK;
  ctx.fillText("0 €", shake, -153);
  let press = 0;
  for (const p of sc.presses) press = Math.max(press, ramp(t, p, p + 0.08) * (1 - ramp(t, p + 0.12, p + 0.35)));
  const r = 62 * (1 - 0.12 * press);
  ctx.beginPath(); ctx.arc(0, 15, 74, 0, 7); stroke(2, "rgba(240,240,240,0.4)");
  if (press > 0) halo(0, 15, 160, 0.3 * press);
  ctx.fillStyle = press > 0.1 ? `rgba(255,255,255,${0.85 * press})` : "rgba(0,0,0,0)";
  ctx.beginPath(); ctx.arc(0, 15, r, 0, 7); ctx.fill(); stroke(3);
  glowOff();
  label("WILL", 0, 16, 22, 1, 0.25, press > 0.5 ? "rgba(10,10,10," : "rgba(240,240,240,");
  rr(-80, 140, 160, 36, 12); stroke(2.5);
  ctx.restore();
}
// 8 Waage: Preis gegen Wert
function sScale(t, sc) {
  const gift = ramp(t, sc.k1, sc.k1 + 0.3);
  const ang = lerp(-12, -3, easeOut(gift)) + 16 * easeIO(ramp(t, sc.k2, sc.k2 + 0.6));
  const a = ang * Math.PI / 180;
  ctx.save(); glowOn(10, 0.5);
  line([[0, -150], [0, 230]]); stroke(3);
  line([[-90, 230], [90, 230]]); stroke(3);
  const L = 270;
  const le = [-Math.cos(a) * L, -150 - Math.sin(a) * L], re = [Math.cos(a) * L, -150 + Math.sin(a) * L];
  line([le, re]); stroke(3);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -150, 8, 0, 7); ctx.fill();
  for (const [e, side] of [[le, -1], [re, 1]]) {
    const by = e[1] + 110;
    line([e, [e[0] - 58, by]]); stroke(1.8); line([e, [e[0] + 58, by]]); stroke(1.8);
    ctx.beginPath(); ctx.moveTo(e[0] - 75, by); ctx.lineTo(e[0] + 75, by); ctx.arc(e[0], by, 75, 0, Math.PI); stroke(3);
    if (side < 0) {
      coin(e[0], by + 22, 26, 1, true);
      label("PREIS", e[0], by + 112, 22, 1, 0.3);
    } else if (gift > 0) {
      ctx.save(); ctx.globalAlpha = gift; ctx.translate(e[0], by + 18); ctx.scale(back(gift), back(gift));
      rr(-30, -28, 60, 50, 5); stroke(2.5); line([[-36, -28], [36, -28]]); stroke(2.5);
      line([[0, -28], [0, 22]]); stroke(2.5);
      ctx.beginPath(); ctx.ellipse(-11, -38, 11, 7, -0.4, 0, 7); stroke(2.2); ctx.beginPath(); ctx.ellipse(11, -38, 11, 7, 0.4, 0, 7); stroke(2.2);
      ctx.restore();
      label("WERT", e[0], by + 112, 22, gift, 0.3);
      if (t > sc.k2) halo(e[0], by, 160, 0.18 * ramp(t, sc.k2, sc.k2 + 0.5));
    }
  }
  glowOff(); ctx.restore();
  pill(0, -235, "LOHNT SICH", ramp(t, sc.k2 + 0.15, sc.k2 + 0.5), 24);
}
// 9 Globus und Brille
function globe(t, alpha, width) {
  const r = 175, cy = -30;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.arc(0, cy, r, 0, 7); stroke(width);
  for (let k = -2; k <= 2; k++) {
    const y = cy + r * Math.sin(k * 0.5), rx = r * Math.cos(k * 0.5);
    ctx.beginPath(); ctx.ellipse(0, y, rx, rx * 0.12, 0, 0, 7); stroke(width * 0.7);
  }
  for (let k = 0; k < 6; k++) {
    const ph = t * 0.6 + k * Math.PI / 6;
    const rx = Math.abs(Math.cos(ph)) * r;
    ctx.beginPath(); ctx.ellipse(0, cy, rx, r, 0, 0, 7); stroke(width * 0.7);
  }
  ctx.restore();
}
function sGlobe(t, sc) {
  const k = easeIO(ramp(t, sc.k1, sc.k2));
  const gy = lerp(260, -30, k), gs = lerp(0.6, 1, k);
  halo(0, -30, 320, 0.1);
  ctx.save(); ctx.filter = "blur(2.5px)"; globe(t, 0.45, 3); ctx.restore();
  // durch die Gläser: scharf und hell
  const lens = [[-98, gy], [98, gy]];
  if (ramp(t, sc.k1, sc.k1 + 0.2) > 0) {
    ctx.save();
    ctx.beginPath(); for (const [x, y] of lens) { ctx.moveTo(x + 82 * gs, y); ctx.arc(x, y, 82 * gs, 0, 7); } ctx.clip();
    glowOn(14, 0.9); globe(t, 1, 3.2); glowOff();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = ramp(t, sc.k1, sc.k1 + 0.3); glowOn(16, 0.8);
    for (const [x, y] of lens) { ctx.beginPath(); ctx.arc(x, y, 82 * gs, 0, 7); stroke(4); }
    ctx.beginPath(); ctx.arc(0, gy + 4, 22 * gs, Math.PI * 1.15, Math.PI * 1.85); stroke(4);
    line([[-180 * gs, gy - 10], [-232 * gs, gy - 30]]); stroke(4); line([[180 * gs, gy - 10], [232 * gs, gy - 30]]); stroke(4);
    glowOff(); ctx.restore();
  }
}
// 10 Unternehmen mit Grund
function sBuilding(t, sc) {
  const gy = 230;
  const gu = easeOut(ramp(t, sc.t0, sc.t0 + 0.7));
  line([[-420 * gu, gy], [420 * gu, gy]]); stroke(2.5);
  const hgt = 300 * easeOut(ramp(t, sc.k1, sc.k1 + 0.6));
  ctx.save(); glowOn(12, 0.6);
  if (hgt > 2) {
    ctx.save(); ctx.beginPath(); ctx.rect(-130, gy - hgt, 260, hgt + 2); ctx.clip();
    line([[-100, gy], [-100, gy - 300], [100, gy - 300], [100, gy]]); stroke(3);
    const lit = ramp(t, sc.k2, sc.k2 + 0.5);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const x = -66 + c * 52, y = gy - 270 + r * 66;
      rr(x - 18, y, 36, 40, 6);
      ctx.fillStyle = `rgba(250,250,250,${lit})`; ctx.fill(); stroke(2.5);
    }
    rr(-24, gy - 92, 48, 92, 3); stroke(3);
    ctx.restore();
  }
  glowOff(); ctx.restore();
  // Kunden kommen
  const pk = ramp(t, sc.k3, sc.k3 + 2.4);
  if (pk > 0) for (const [x0, d] of [[-400, 1], [-300, 1], [400, -1], [310, -1]]) {
    const x = x0 + d * 150 * easeOut(pk);
    pawn(x, gy, 0.55, ramp(t, sc.k3, sc.k3 + 0.3) * (1 - 0.6 * ramp(Math.abs(x), 220, 0)));
  }
  // Grund mit Wellen
  const pr = ramp(t, sc.k4, sc.k4 + 0.4);
  if (pr > 0) {
    for (let i = 0; i < 3; i++) {
      const u = ((t - sc.k4) * 0.6 + i / 3) % 1;
      ctx.globalAlpha = (1 - u) * 0.5 * pr;
      ctx.beginPath(); ctx.arc(0, gy - 365, 50 + u * 170, 0, 7); stroke(2);
    }
    ctx.globalAlpha = 1;
    pill(0, gy - 365, "EIN GRUND", pr, 24);
  }
  // Münzen fliegen ins Geschäft
  if (t > sc.k5) for (let i = 0; i < 6; i++) {
    const u = ramp(t, sc.k5 + i * 0.12, sc.k5 + i * 0.12 + 0.7);
    if (u <= 0 || u >= 1) continue;
    const sx = i % 2 ? -260 : 260, x = lerp(sx, 0, u), y = gy - 110 - Math.sin(u * Math.PI) * 120 - u * 40;
    coin(x, y, 13, 1 - u * 0.5, true);
  }
}
// Icons für die Gründe
function icon(kind, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round";
  if (kind === "bolt") { line([[6, -24], [-12, 3], [2, 3], [-6, 24], [14, -5], [0, -5], [6, -24]], true); stroke(2.6); }
  if (kind === "glass") { line([[-14, -22], [14, -22], [-14, 22], [14, 22]], true); stroke(2.6); line([[-18, -22], [18, -22]]); stroke(2.6); line([[-18, 22], [18, 22]]); stroke(2.6); }
  if (kind === "lock") { rr(-16, -4, 32, 26, 4); stroke(2.6); ctx.beginPath(); ctx.arc(0, -6, 11, Math.PI, 0); stroke(2.6); line([[-11, -6], [-11, -4]]); stroke(2.6); line([[11, -6], [11, -4]]); stroke(2.6); }
  if (kind === "key") { ctx.beginPath(); ctx.arc(-10, 8, 9, 0, 7); stroke(2.6); line([[-3, 1], [18, -20]]); stroke(2.6); line([[10, -12], [16, -6]]); stroke(2.6); line([[14, -16], [20, -10]]); stroke(2.6); }
  ctx.restore();
}
// 11 Gründe als Netz, danach Lösung vs. Problem
function sMind(t, sc) {
  const shrink = easeIO(ramp(t, sc.k5, sc.k5 + 0.6));
  ctx.save();
  ctx.translate(lerp(0, -205, shrink), lerp(-10, -30, shrink)); ctx.scale(lerp(1, 0.52, shrink), lerp(1, 0.52, shrink));
  const nodes = [["BEQUEMLICHKEIT", "bolt", -235, -215, sc.k1], ["ZEIT GESPART", "glass", 235, -215, sc.k2],
    ["SICHERHEIT", "lock", 235, 205, sc.k3], ["PROBLEM GELÖST", "key", -235, 205, sc.k4]];
  for (const [txt, ic, x, y, tk] of nodes) {
    const p = ramp(t, tk, tk + 0.35);
    if (p <= 0) continue;
    line(partial([[x * 0.3, y * 0.3], [x * 0.78, y * 0.78]], p)); stroke(2, "rgba(235,235,235,0.6)");
    ctx.save(); ctx.globalAlpha = p; ctx.translate(x, y); ctx.scale(back(p), back(p));
    halo(0, 0, 110, 0.12);
    glowOn(14, 0.7); ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.fill(); stroke(3); icon(ic, 0, 0, 1.15); glowOff();
    ctx.restore();
    label(txt, x, y + (y < 0 ? 84 : 84), 21, p, 0.25);
  }
  const c = ramp(t, sc.t0, sc.t0 + 0.4);
  ctx.save(); ctx.globalAlpha = c; halo(0, 0, 200, 0.15); glowOn(18, 0.8);
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 0, 82, 0, 7); ctx.fill(); stroke(3.5); glowOff();
  ctx.restore();
  label("GRUND", 0, 1, 24, c, 0.25);
  ctx.restore();
  // Balken: Lösung vs. Problem
  const b = ramp(t, sc.k5 + 0.2, sc.k5 + 0.6);
  if (b > 0) {
    const by = 280, X1 = 125, X2 = 285;
    line([[45, by], [365, by]]); stroke(2, `rgba(235,235,235,${b})`);
    const h1 = 50 * easeOut(b), h2 = 330 * easeOut(ramp(t, sc.k6, sc.k6 + 0.8));
    ctx.save(); glowOn(16, 0.8);
    ctx.fillStyle = `rgba(250,250,250,${b})`; rr(X1 - 45, by - h1, 90, h1, 8); ctx.fill();
    if (h2 > 1) { rr(X2 - 45, by - h2, 90, h2, 8); ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill(); stroke(2.5); }
    glowOff(); ctx.restore();
    ctx.save(); ctx.font = "900 38px InterBlk"; ctx.textAlign = "center"; ctx.fillStyle = `rgba(250,250,250,${b})`;
    ctx.fillText("49 €", X1, by - h1 - 18);
    if (h2 > 1) { ctx.globalAlpha = ramp(t, sc.k6, sc.k6 + 0.3); ctx.fillText(fmtEUR(900 * easeOut(ramp(t, sc.k6, sc.k6 + 0.8))), X2, by - h2 - 18); }
    ctx.restore();
    label("LÖSUNG", X1, by + 32, 20, b, 0.25);
    label("PROBLEM", X2, by + 32, 20, ramp(t, sc.k6, sc.k6 + 0.3), 0.25);
  }
}
// Zahnräder und Büroklammer
function gear(x, y, r, n, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a0 = i * 2 * Math.PI / n, d = Math.PI / n;
    ctx.lineTo(Math.cos(a0 - d * 0.5) * r * 0.8, Math.sin(a0 - d * 0.5) * r * 0.8);
    ctx.lineTo(Math.cos(a0 - d * 0.3) * r, Math.sin(a0 - d * 0.3) * r);
    ctx.lineTo(Math.cos(a0 + d * 0.3) * r, Math.sin(a0 + d * 0.3) * r);
    ctx.lineTo(Math.cos(a0 + d * 0.5) * r * 0.8, Math.sin(a0 + d * 0.5) * r * 0.8);
  }
  ctx.closePath(); stroke(2.6);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.33, 0, 7); stroke(2.6);
  ctx.restore();
}
function clip(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-12, 40); ctx.lineTo(-12, -46); ctx.arc(2, -46, 14, Math.PI, 0); ctx.lineTo(16, 58);
  ctx.arc(-6, 58, 22, 0, Math.PI); ctx.lineTo(-28, -62); ctx.arc(2, -62, 30, Math.PI, 0); ctx.lineTo(32, 30);
  ctx.lineJoin = "round"; stroke(3.2 / s);
  ctx.restore();
}
function bar(x, y, name, pct, a) {
  if (a <= 0) return;
  label(name, x - 58, y - 24, 19, a, 0.25);
  ctx.save(); ctx.font = "600 21px InterSB"; ctx.textAlign = "right"; ctx.fillStyle = `rgba(240,240,240,${a})`;
  ctx.fillText(Math.round(pct) + " %", x + 120, y - 16); ctx.restore();
  line([[x - 120, y], [x + 120, y]]); stroke(3, `rgba(255,255,255,${0.25 * a})`);
  if (pct > 0.5) { ctx.save(); glowOn(12, 0.9); line([[x - 120, y], [x - 120 + 240 * pct / 100, y]]); stroke(4, `rgba(255,255,255,${a})`); glowOff(); ctx.restore(); }
}
function sComplex(t, sc) {
  const out = easeIO(ramp(t, sc.k5, sc.k5 + 0.6));      // Komplex-Spalte geht, Käufer kommt
  const lx = -200 - 250 * out, rx = lerp(200, -110, out);
  ctx.save(); glowOn(10, 0.6);
  ctx.globalAlpha = 1 - out;
  gear(lx - 20, -110, 62, 12, t * 0.6); gear(lx + 60, -45, 40, 9, -t * 0.9 + 0.2); gear(lx - 40, -20, 30, 8, -t * 1.1);
  ctx.globalAlpha = 1;
  clip(rx, -80, 1);
  glowOff(); ctx.restore();
  label("KOMPLEX", lx, 60, 20, 1 - out, 0.3);
  label("EINFACH", rx, 60, 20, 1 - ramp(t, sc.k4, sc.k4 + 0.3), 0.3);
  ctx.setLineDash([4, 8]); line([[0, -260], [0, 220]]); stroke(1.5, `rgba(230,230,230,${0.35 * (1 - out)})`); ctx.setLineDash([]);
  // Balken: erst Aufwand, dann Wert
  const effA = ramp(t, sc.t0 + 0.3, sc.t0 + 0.6) * (1 - ramp(t, sc.k2 - 0.25, sc.k2));
  const ef = easeOut(ramp(t, sc.k1, sc.k1 + 0.8));
  bar(lx, 140, "AUFWAND", 94 * ef, effA * (1 - out)); bar(rx, 140, "AUFWAND", 5 * ef, effA);
  const valA = ramp(t, sc.k2, sc.k2 + 0.25);
  const vf = easeOut(ramp(t, sc.k2 + 0.1, sc.k3));
  bar(lx, 140, "WERT", 15 * vf, valA * (1 - out)); bar(rx, 140, "WERT", 100 * vf, valA);
  // Ergebnis-Kreis
  const oc = ramp(t, sc.k4, sc.k4 + 0.5);
  if (oc > 0) {
    halo(rx, -80, 200, 0.18 * oc);
    ctx.save(); glowOn(14, 0.8); ctx.beginPath(); ctx.arc(rx, -80, 135, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * easeOut(oc)); stroke(2.5); glowOff(); ctx.restore();
    label("ERGEBNIS", rx, -240, 20, oc, 0.3);
  }
  // Käufer
  if (out > 0) {
    const bx = 250, by = 20;
    ctx.setLineDash([5, 7]); line(partial([[rx + 140, -80], [bx - 40, -80]], out)); stroke(2, "rgba(235,235,235,0.6)"); ctx.setLineDash([]);
    pawn(bx, by, 1.05, out);
    label("KÄUFER", bx, by + 34, 20, out, 0.3);
    for (let i = 0; i < 5; i++) {
      const u = ramp(t, sc.k6 + i * 0.16, sc.k6 + i * 0.16 + 0.7);
      if (u <= 0 || u >= 1) continue;
      coin(lerp(bx, rx + 60, u), -110 - Math.sin(u * Math.PI) * 120, 14, 1, true);
    }
  }
}
// 12 Menschliches Verhalten
let PEOPLE = null;
function sBehavior(t, sc) {
  if (!PEOPLE) {
    const R = rng(21); PEOPLE = [];
    for (let i = 0; i < 16; i++) {
      const x = -320 + (i % 4) * 200 + (R() - 0.5) * 110, y = -170 + Math.floor(i / 4) * 125 + (R() - 0.5) * 60;
      const a = R() * 6.28, d = 50 + R() * 50;
      PEOPLE.push({ x, y, tx: x + Math.cos(a) * d, ty: y + Math.sin(a) * d * 0.6, k: R() });
    }
  }
  const pathP = ramp(t, sc.t0 + 0.4, sc.t0 + 1.6);
  const adv = ramp(t, sc.k1, sc.k1 + 0.5);
  for (const p of PEOPLE) {
    pawn(p.x, p.y + 20, 0.45, ramp(t, sc.t0 + p.k * 0.4, sc.t0 + p.k * 0.4 + 0.3));
    if (pathP > 0) {
      if (adv < 0.5) ctx.setLineDash([3, 6]);
      line(partial([[p.x + 14, p.y + 8], [p.tx, p.ty]], pathP)); stroke(adv > 0.5 ? 2.5 : 1.5, `rgba(235,235,235,${0.5 + 0.4 * adv})`);
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p.tx, p.ty, 6, 0, 7); stroke(1.8, `rgba(235,235,235,${pathP})`);
    }
  }
  pill(0, -300, "VORTEIL", adv, 24);
  // Rahmen + Scanlinie
  const fr = ramp(t, sc.k2, sc.k2 + 0.4);
  if (fr > 0) {
    const x0 = -400, x1 = 400, y0 = -245, y1 = 290, c = 34;
    ctx.save(); ctx.globalAlpha = fr;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { line([[x + dx * c, y], [x, y], [x, y + dy * c]]); stroke(2.5); }
    ctx.restore();
    label("MENSCHLICHES VERHALTEN", -400 + 200, 316, 19, fr, 0.25);
    const su = ramp(t, sc.k2 + 0.2, sc.k2 + 1.8);
    if (su > 0 && su < 1) {
      const sx = lerp(x0, x1, easeIO(su));
      halo(sx, 20, 120, 0.12);
      ctx.save(); glowOn(16, 0.9); line([[sx, y0 + 10], [sx, y1 - 10]]); stroke(2.5); glowOff(); ctx.restore();
    }
  }
}
// 13 Drei Kreise -> Chance
function sVenn(t, sc) {
  const m = easeIO(ramp(t, sc.k4, sc.k4 + 0.8));
  const C = [["WÜNSCHE", 0, -175, 0, -95, sc.k1], ["FRUST", -175, 90, -82, 45, sc.k2], ["BEREIT ZU ZAHLEN", 175, 90, 82, 45, sc.k3]];
  for (const [txt, x0, y0, x1, y1, tk] of C) {
    const p = ramp(t, tk, tk + 0.4);
    if (p <= 0) continue;
    const x = lerp(x0, x1, m), y = lerp(y0, y1, m), r = 135;
    ctx.save(); ctx.globalAlpha = p;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(1, "rgba(255,255,255,0.02)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * back(p), 0, 7); ctx.fill();
    glowOn(12, 0.6); stroke(2.5); glowOff();
    ctx.restore();
    const ly = y0 < 0 ? y - r + 32 : lerp(y + r - 34, y + r + 30, m);
    label(txt, x + (x0 < 0 ? -60 : x0 > 0 ? 60 : 0) * m, ly, 19, p, 0.22);
  }
  // Mitte leuchtet
  const c = ramp(t, sc.k5, sc.k5 + 0.4);
  if (c > 0) {
    halo(0, 0, 160, 0.4 * c);
    ctx.save(); ctx.globalAlpha = c; ctx.beginPath();
    ctx.arc(0, -4, 34 * back(c), 0, 7); glowOn(26, 1); ctx.fillStyle = "#fff"; ctx.fill(); glowOff();
    ctx.fillStyle = "#111"; ctx.font = "900 40px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+", 0, -2);
    ctx.restore();
  }
  const op = ramp(t, sc.k6, sc.k6 + 0.4);
  if (op > 0) {
    ctx.setLineDash([4, 6]); line(partial([[28, -26], [200, -250]], op)); stroke(1.8, "rgba(235,235,235,0.7)"); ctx.setLineDash([]);
    pill(220, -275, "CHANCE", op, 24);
  }
  pawn(0, 340, 0.7, ramp(t, sc.t0, sc.t0 + 0.4));
  label("DU", 0, 364, 20, ramp(t, sc.t0, sc.t0 + 0.4), 0.3);
}
// 14 Reichtum ≠ mehr Geld wollen
function sWealth(t, sc) {
  ctx.save();
  const a = ramp(t, sc.t0, sc.t0 + 0.5);
  halo(0, -120, 320, 0.12 * a);
  ctx.filter = a < 1 ? `blur(${(1 - a) * 10}px)` : "none";
  glowOn(26, 0.85);
  label("REICHTUM", 0, -120, 92, a, 0.2, "rgba(255,255,255,");
  ctx.filter = "none";
  const ne = ramp(t, sc.k1, sc.k1 + 0.4);
  ctx.font = "300 110px InterSB"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = `rgba(255,255,255,${ne})`;
  ctx.fillText("≠", 0, 10);
  glowOff();
  const words = [["MEHR", sc.k2], ["GELD", sc.k3], ["WOLLEN", sc.k4]];
  ctx.font = "600 44px InterSB"; ctx.letterSpacing = "12px";
  const ws = words.map(([w]) => ctx.measureText(w).width), gap = 30, tot = ws.reduce((a, b) => a + b) + gap * 2;
  let x = -tot / 2;
  words.forEach(([w, tk], i) => {
    const p = ramp(t, tk, tk + 0.35);
    ctx.filter = p < 1 ? `blur(${(1 - p) * 8}px)` : "none";
    ctx.fillStyle = `rgba(235,235,235,${p})`; ctx.textAlign = "left";
    ctx.fillText(w, x, 140);
    x += ws[i] + gap;
  });
  ctx.restore();
}
// 15 Geldströme, die sich zu dir bewegen
function sFlow(t, sc) {
  const conv = easeIO(ramp(t, sc.k4, sc.k4 + 1.4));
  const tx = 150, ty = 40;
  const lbl = ramp(t, sc.k1, sc.k1 + 0.4) * (1 - ramp(t, sc.k2 - 0.2, sc.k2 + 0.2));
  label("WARUM GELD FLIESST", 0, -300, 20, lbl, 0.3);
  const n = 13;
  for (let i = 0; i < n; i++) {
    const y0 = -230 + i * 38;
    const pts = [];
    const xEnd = lerp(470, tx, conv);
    for (let x = -480; x <= xEnd; x += 12) {
      let y = y0 + Math.sin(x * 0.012 + t * 1.2 + i * 0.7) * 18;
      const k = conv * Math.pow(clamp((x + 480) / (tx + 480)), 2.2);
      y = lerp(y, ty, k);
      pts.push([x, y]);
    }
    ctx.setLineDash([2, 9]); line(pts); stroke(1.6, "rgba(230,230,230,0.5)"); ctx.setLineDash([]);
    for (let j = 0; j < 3; j++) {
      const u = ((t * (0.12 + (i % 3) * 0.03) + j / 3 + i * 0.13) % 1);
      const p = pts[Math.min(pts.length - 1, Math.floor(u * pts.length))];
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, 7);
      if ((i + j) % 3 === 0) { ctx.fillStyle = INK; ctx.fill(); } else stroke(1.8);
    }
  }
  // Bausteine
  const B = [[-36, 0, sc.k2], [36, 0, sc.k2 + 0.15], [0, -72, sc.k3], [0, -144, sc.k4]];
  const bx = tx + 40, by = 150;
  B.forEach(([dx, dy, tk], i) => {
    const p = ramp(t, tk, tk + 0.35);
    if (p <= 0) return;
    const yy = by + dy - 34 - (1 - easeOut(p)) * 60;
    ctx.save(); ctx.globalAlpha = p;
    if (i === 3) { halo(bx + dx, yy + 34, 170 * conv + 40, 0.35 * conv + 0.1); glowOn(28, 1); ctx.fillStyle = "#fafafa"; rr(bx + dx - 33, yy, 66, 66, 10); ctx.fill(); glowOff(); ctx.fillStyle = "#111"; ctx.font = "900 40px InterBlk"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+", bx + dx, yy + 34); }
    else { ctx.fillStyle = "#000"; rr(bx + dx - 33, yy, 66, 66, 10); ctx.fill(); glowOn(10, 0.6); stroke(2.5); glowOff(); }
    ctx.restore();
  });
  if (ramp(t, sc.k2, sc.k2 + 0.3) > 0) { line([[bx - 110, by + 2], [bx + 110, by + 2]]); stroke(2, `rgba(235,235,235,${ramp(t, sc.k2, sc.k2 + 0.3)})`); }
  label("DU", bx, by + 40, 24, ramp(t, sc.k5, sc.k5 + 0.4), 0.35);
}

// ------------------------------------------------------------------ Text unter der Szene (Wort für Wort)
const SIZES = { plain: 56, big: 70, italic: 82, heavy: 96 };
const LH = { plain: 1.22, big: 1.18, italic: 1.08, heavy: 1.0 };
const ASC = { plain: 0.95, big: 0.95, italic: 0.88, heavy: 0.86 };
function setFont(style, size) {
  ctx.letterSpacing = "0px";
  if (style === "italic") ctx.font = `italic 400 ${size}px ISerif`;
  else if (style === "heavy") { ctx.font = `900 ${size}px InterBlk`; ctx.letterSpacing = `${-size * 0.015}px`; }
  else ctx.font = `600 ${size}px InterSB`;
}
const LAYOUT = new Map();
function layoutCard(card) {
  if (LAYOUT.has(card)) return LAYOUT.get(card);
  const lines = [];
  let y = 0;
  for (const ln of card.lines) {
    let scale = 1, items, width;
    for (let pass = 0; pass < 2; pass++) {
      items = []; width = 0;
      ln.forEach((tok, i) => {
        const size = SIZES[tok.style] * scale;
        setFont(tok.style, size);
        const w = ctx.measureText(tok.text).width;
        const gap = i ? size * 0.26 : 0;
        width += gap;
        items.push({ tok, size, x: width, w });
        width += w;
      });
      if (width <= TEXT_W) break;
      scale *= TEXT_W / width;
    }
    const big = items.reduce((a, b) => (b.size > a.size ? b : a));
    const lh = big.size * LH[big.tok.style];
    lines.push({ items, width, y: y + big.size * ASC[big.tok.style], lh });
    y += lh;
  }
  const res = { lines, height: y };
  LAYOUT.set(card, res);
  return res;
}
function drawCard(card, t) {
  const L = layoutCard(card);
  const out = ramp(t, card.end - 0.2, card.end);
  if (out >= 1) return;
  for (const ln of L.lines) {
    const x0 = TEXT_CX - ln.width / 2;
    for (const it of ln.items) {
      const tok = it.tok;
      const p = ramp(t, tok.s - 0.04, tok.s + 0.24);
      if (p <= 0) continue;
      const a = easeOut(p) * (1 - out);
      const blur = (1 - p) * 10 + out * 12;
      setFont(tok.style, it.size);
      ctx.globalAlpha = a;
      ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
      const strong = tok.style === "heavy" || tok.style === "italic";
      ctx.shadowColor = `rgba(255,255,255,${strong ? 0.55 : 0.3})`;
      ctx.shadowBlur = strong ? 28 : 12;
      ctx.fillStyle = "#f4f4f4";
      ctx.fillText(tok.text, x0 + it.x, TEXT_TOP + ln.y + (1 - easeOut(p)) * 18);
    }
  }
  ctx.filter = "none"; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.letterSpacing = "0px";
}

// ------------------------------------------------------------------ Bild
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = "none";
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(SCX, SCY, 0, SCX, SCY, 760);
  bg.addColorStop(0, "#0d0d0d"); bg.addColorStop(1, "#000");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.lineCap = "round";
  for (const sc of SC) {
    const fi = sc.t0 <= 0.01 ? 1 : ramp(t, sc.t0 - 0.12, sc.t0 + 0.28);
    const fo = 1 - ramp(t, sc.t1 - 0.12, sc.t1 + 0.28);
    const a = Math.min(fi, fo);
    if (a <= 0) continue;
    ctx.save();
    ctx.translate(SCX, SCY);
    ctx.globalAlpha = a;
    if (a < 1) { const s = 1 + (1 - a) * (fo < 1 ? 0.06 : -0.06); ctx.scale(s, s); }
    if (sc.z) ctx.scale(sc.z, sc.z);
    sc.f(t, sc);
    ctx.restore();
  }
  ctx.globalAlpha = 1; ctx.filter = "none"; ctx.shadowBlur = 0;
  for (const card of TL.cards) if (t >= card.start - 0.1 && t <= card.end + 0.05) drawCard(card, t);
  const fade = Math.max(1 - ramp(t, 0, 0.2), ramp(t, TL.duration - 1.2, TL.duration - 0.2));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

function buildScenes() {
  const end = TL.duration + 1;
  const w = (si, x, n) => Wt(si, x, n);
  SC = [
    { f: sRun, z: 1.15, t0: 0, t1: w(0, "desto") },
    { f: sChaos, t0: w(0, "desto"), t1: w(0, "verstehst") + 0.3 },
    { f: sFocus, t0: w(0, "verstehst") + 0.3, t1: w(0, "eigentlich") },
    { f: sBlueprint, t0: w(0, "eigentlich"), t1: S[1] },
    { f: sGoal, t0: S[1], t1: S[2], k1: w(1, "denken"), k2: w(1, "möchten") + 0.2 },
    { f: sIceberg, t0: S[2], t1: S[3], k1: w(2, "was"), k2: w(2, "WERTVOLL") },
    { f: sDevice, t0: S[3], t1: S[4], presses: [w(3, "haben"), w(3, "will") + 0.05, w(3, "will") + 0.45] },
    { f: sScale, t0: S[4], t1: S[5], k1: w(4, "glauben"), k2: w(4, "WERT") },
    { f: sGlobe, t0: S[5], t1: S[6], k1: w(5, "sieht"), k2: w(5, "anderen") },
    { f: sBuilding, t0: S[6], t1: S[7], k1: w(6, "Unternehmen"), k2: w(6, "existiert"), k3: w(6, "Kunden"), k4: w(6, "Grund"), k5: w(6, "auszugeben") },
    { f: sMind, t0: S[7], t1: S[9], k1: w(7, "BEQUEMLICHKEIT"), k2: w(7, "gesparte"), k3: w(7, "Unsicherheit"), k4: w(8, "Problem"), k5: w(8, "das"), k6: w(8, "teurer") },
    { f: sComplex, z: 1.2, t0: S[9], t1: S[11], k1: w(9, "schwer"), k2: S[10], k3: w(10, "ERGEBNIS"), k4: w(10, "ERGEBNIS"), k5: w(10, "für"), k6: w(10, "bezahlt") },
    { f: sBehavior, t0: S[11], t1: S[12], k1: w(11, "VORTEIL"), k2: w(11, "menschliches") },
    { f: sVenn, t0: S[12], t1: S[14], k1: w(12, "wollen"), k2: w(12, "frustriert"), k3: w(13, "zahlen"), k4: w(13, "desto"), k5: w(13, "erkennst"), k6: w(13, "CHANCEN") },
    { f: sWealth, t0: S[14], t1: S[15], k1: w(14, "heißt"), k2: w(14, "mehr"), k3: w(14, "Geld"), k4: w(14, "wollen") },
    { f: sFlow, t0: S[15], t1: end, k1: w(15, "warum"), k2: w(16, "etwas"), k3: w(16, "aufzubauen"), k4: w(16, "Grund"), k5: w(16, "DIR") },
  ];
}

window.exportEvents = function () {
  const sc = Object.fromEntries(SC.map(s => [s.f.name, s]));
  return {
    duration: TL.duration,
    scenes: SC.map(s => s.t0).filter(x => x > 0.1),
    run: [0, SC[0].t1], chaos: SC[1].t0, focus: SC[2].t0, blueprint: SC[3].t0,
    count: [sc.sGoal.k1, sc.sGoal.k2], iceberg: [sc.sIceberg.k1, sc.sIceberg.k2],
    presses: sc.sDevice.presses, gift: sc.sScale.k1, tip: sc.sScale.k2,
    glasses: [sc.sGlobe.k1, sc.sGlobe.k2], building: [sc.sBuilding.k1, sc.sBuilding.k2, sc.sBuilding.k3, sc.sBuilding.k4, sc.sBuilding.k5],
    nodes: [sc.sMind.k1, sc.sMind.k2, sc.sMind.k3, sc.sMind.k4], bars: [sc.sMind.k5, sc.sMind.k6],
    effort: sc.sComplex.k1, value: sc.sComplex.k2, outcome: sc.sComplex.k4, buyer: [sc.sComplex.k5, sc.sComplex.k6],
    advantage: sc.sBehavior.k1, scan: sc.sBehavior.k2,
    venn: [sc.sVenn.k1, sc.sVenn.k2, sc.sVenn.k3], merge: sc.sVenn.k4, plus: sc.sVenn.k5, chance: sc.sVenn.k6,
    wealth: [sc.sWealth.t0, sc.sWealth.k1, sc.sWealth.k2, sc.sWealth.k3, sc.sWealth.k4],
    flow: sc.sFlow.t0, blocks: [sc.sFlow.k2, sc.sFlow.k2 + 0.15, sc.sFlow.k3, sc.sFlow.k4], you: sc.sFlow.k5,
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  window.DURATION = TL.duration;
  S = TL.sentences.map(s => s.start);
  E = TL.sentences.map(s => s.end);
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  await Promise.all([document.fonts.load("italic 80px ISerif"), document.fonts.load("600 50px InterSB"),
    document.fonts.load("900 50px InterBlk")]);
  buildScenes();
  return true;
};
