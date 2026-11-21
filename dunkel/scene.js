// "GLEICHE DUNKELHEIT." – Nachbau von "SAME DARK ROOM. 3 different eyes" (deutsch)
const { ctx, CX, POSE, clamp, lerp, ss, rnd, rr, at, figure, bubble, popText, header, labels, begin } = SL;
const DUR = 14.0;
const T = { click: 0.75, figure: 1.75, snow: 2.3, beam: 6.0, beamEnd: 6.62, black: 6.65, back: 6.95, wave: 9.0, waveEnd: 10.55, end: DUR };

const TXT = {
  title: "GLEICHE DUNKELHEIT.", sub: "3 verschiedene Augen:",
  labels: ["DIE MEISTEN", "SIEHT GESTALTEN", "SIEHT RAUSCHEN"],
  subs: ["", "(PAREIDOLIE)", "(VISUAL SNOW)"],
  cols: ["#ece4e6", "#f08aa8", "#c9cfe8"],
};

const stars = []; (function () { const r = rnd(8); for (let i = 0; i < 14; i++) stars.push([210 + r() * 155, 168 + r() * 140, 0.6 + r() * 0.8]); })();
const snow = []; (function () { const r = rnd(21); for (let i = 0; i < 420; i++) { const a = r() * 6.28, d = Math.sqrt(r()); snow.push({ a, d, s: 0.6 + r() * 1.2, ph: r() * 100 }); } })();

const HEAD = ["#6c55a8", "#b05088", "#5373ad"];
const BLANKET = ["#7258b8", "#c45a8e", "#5a7cbf"];

function room(t, lampOn) {
  const bg = ctx.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, lampOn ? "#2f2a5c" : "#181430"); bg.addColorStop(0.8, lampOn ? "#2a2550" : "#120f24"); bg.addColorStop(1, "#0c0a17");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 576, 1024);
  if (lampOn) {
    const g = ctx.createRadialGradient(80, 300, 10, 80, 300, 250);
    g.addColorStop(0, "rgba(255,235,190,0.16)"); g.addColorStop(1, "rgba(255,235,190,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 576, 830);
  }
  // Fenster mit Mond
  ctx.fillStyle = "#2a2346"; rr(199, 156, 178, 166, 6); ctx.fill();
  ctx.fillStyle = "#0c0f2c"; rr(206, 163, 76, 152, 3); ctx.fill(); rr(292, 163, 78, 152, 3); ctx.fill();
  ctx.fillStyle = "#cfd3ff"; for (const [x, y, s] of stars) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + x); ctx.beginPath(); ctx.arc(x, y, s, 0, 6.29); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#e9dda0"; ctx.beginPath(); ctx.arc(252, 204, 16, 0, 6.29); ctx.fill();
  ctx.fillStyle = "#0c0f2c"; ctx.beginPath(); ctx.arc(262, 197, 15, 0, 6.29); ctx.fill();
  // Lampe
  ctx.strokeStyle = "#5d567a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(80, 135); ctx.lineTo(80, 230); ctx.stroke();
  ctx.fillStyle = lampOn ? "#f6c04f" : "#3a3356"; ctx.beginPath(); ctx.arc(80, 245, 26, Math.PI, 0); ctx.fill();
  // Stuhl
  ctx.strokeStyle = "#7a5636"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(258, 432); ctx.lineTo(258, 495); ctx.moveTo(318, 432); ctx.lineTo(318, 495); ctx.stroke();
  ctx.fillStyle = "#8a6440"; rr(248, 426, 80, 9, 3); ctx.fill();
}

function hoodiePile() {
  ctx.fillStyle = "#4a5f95";
  ctx.beginPath(); ctx.moveTo(250, 428); ctx.bezierCurveTo(246, 395, 262, 352, 285, 357); ctx.bezierCurveTo(300, 360, 300, 380, 312, 398);
  ctx.bezierCurveTo(322, 410, 326, 420, 324, 428); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3d5083"; ctx.beginPath(); ctx.ellipse(282, 372, 15, 13, 0.3, 0, 6.29); ctx.fill();
}

function hoodieFigure(t, waveK) {
  const g = ctx.createRadialGradient(288, 380, 10, 288, 380, 120);
  g.addColorStop(0, "rgba(90,110,210,0.22)"); g.addColorStop(1, "rgba(90,110,210,0)");
  ctx.fillStyle = g; ctx.fillRect(160, 250, 260, 260);
  ctx.strokeStyle = "#26335e"; ctx.lineWidth = 2;
  // Arme
  ctx.fillStyle = "#3d4f86";
  const armR = (side, up) => {
    ctx.save(); ctx.translate(288 + side * 42, 352); ctx.rotate(side * (0.12 + up * 1.15) + (up ? Math.sin(t * 9) * 0.25 * up : 0));
    rr(-9, 0, 18, 62, 9); ctx.fill(); ctx.stroke(); ctx.restore();
  };
  armR(-1, 0); armR(1, waveK);
  // Körper
  ctx.beginPath(); ctx.moveTo(250, 432); ctx.bezierCurveTo(246, 380, 256, 348, 288, 345); ctx.bezierCurveTo(320, 348, 330, 380, 326, 432); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#5e70a8"; ctx.lineWidth = 1.6; rr(268, 395, 40, 18, 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(280, 345); ctx.lineTo(280, 372); ctx.moveTo(296, 345); ctx.lineTo(296, 372); ctx.stroke();
  // Kapuze
  ctx.fillStyle = "#3d4f86"; ctx.strokeStyle = "#26335e"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(288, 330, 27, 32, 0, 0, 6.29); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#06050c"; ctx.beginPath(); ctx.ellipse(288, 334, 14, 20, 0, 0, 6.29); ctx.fill();
}

function bedBack(i) {
  const cx = CX[i];
  ctx.fillStyle = HEAD[i]; rr(cx - 92, 586, 184, 140, 16); ctx.fill();
}
function pillow(cx) { ctx.save(); ctx.translate(cx - 50, 662); ctx.rotate(-0.12); ctx.fillStyle = "#e9e3f0"; rr(-32, -14, 64, 30, 12); ctx.fill(); ctx.restore(); }
function blanket(i) {
  return (cx) => {
    ctx.fillStyle = BLANKET[i];
    ctx.beginPath(); ctx.moveTo(cx - 100, 724); ctx.quadraticCurveTo(cx, 708, cx + 100, 724); ctx.lineTo(cx + 100, 820); ctx.lineTo(cx - 100, 820); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx - 98, 736); ctx.quadraticCurveTo(cx, 721, cx + 98, 736); ctx.stroke();
  };
}

const lit = t => t < T.click;
const beamK = t => (t >= T.beam && t < T.beamEnd) ? (t - T.beam) / (T.beamEnd - T.beam) : -1;

function left(t) {
  const o = { x: CX[0], eyes: "closed", mouth: "smile", armL: POSE.bed, armR: POSE.bed, noFeet: true, behind: (cx) => pillow(cx), front: blanket(0) };
  if (lit(t)) { o.eyes = "happy"; o.mouth = "o"; o.armR = POSE.reach; }
  const awake = (t >= 7.2 && t < 7.85) || (t >= 11.2 && t < 11.7);
  if (awake) { o.eyes = "open"; o.mouth = "flat"; o.look = [1.5, 0]; }
  return o;
}
function middle(t) {
  const o = { x: CX[1], eyes: "open", mouth: "smile", armL: POSE.bed, armR: POSE.bed, noFeet: true, behind: (cx) => pillow(cx), front: blanket(1), look: [0, -1.5] };
  if (!lit(t)) { o.mouth = "flat"; o.brows = "flat"; }
  if (t >= T.figure) { o.eyes = "wide"; o.mouth = "o"; o.brows = "worried"; }
  if (beamK(t) >= 0.25) { o.eyes = "open"; o.mouth = "smile"; o.brows = null; }
  if (t >= T.back) { o.eyes = "closed"; o.mouth = "flat"; o.brows = "worried"; o.armL = o.armR = POSE.headBack; }
  if (t >= T.wave && t < T.waveEnd) { o.eyes = "wide"; o.mouth = "o"; o.alarm = true; }
  if (t >= T.waveEnd) { o.eyes = "closed"; o.mouth = "flat"; o.brows = "worried"; }
  return o;
}
function right(t) {
  const o = { x: CX[2], eyes: "open", mouth: "smile", armL: POSE.bed, armR: POSE.bed, noFeet: true, behind: (cx) => pillow(cx), front: blanket(2) };
  if (!lit(t)) { o.mouth = "flat"; }
  if (t >= T.snow) { o.brows = "worried"; o.mouth = "wobble"; }
  const bk = beamK(t);
  if (bk >= 0.3) { o.jump = 60 * ss(0.3, 0.45, bk); o.eyes = "wide"; o.mouth = "o"; o.brows = null; o.alarm = true; o.alarmCol = "#c9c3d6"; o.armL = o.armR = POSE.down; o.front = null; }
  if (t >= T.back) { o.mouth = "o"; o.armL = o.armR = POSE.headBack; }
  if (t >= 8.0 && t < 8.7) o.eyes = Math.floor(t * 6) % 2 ? "dash" : "open";
  if (t >= 11.0) o.look = [-1.5, 0];
  return o;
}

function zzz(t) {
  for (let k = 0; k < 3; k++) {
    const ph = ((t * 0.6 + k / 3) % 1);
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.85;
    ctx.fillStyle = "#a99ad0"; ctx.font = `800 ${13 + ph * 9}px Pop`; ctx.textAlign = "center";
    ctx.fillText("Z", 132 + ph * 18, 525 - ph * 70);
  }
  ctx.globalAlpha = 1;
}

function visualSnow(t) {
  const a = ss(T.snow, T.snow + 0.5, t) * (beamK(t) >= 0 ? 0.3 : 1);
  if (a <= 0) return;
  const R = 122 * ss(T.snow, T.snow + 0.6, t);
  ctx.save(); ctx.globalAlpha = a * 0.12; ctx.fillStyle = "#c8c8e8";
  ctx.beginPath(); ctx.arc(490, 540, R, 0, 6.29); ctx.fill();
  ctx.fillStyle = "#ffffff";
  const fr = Math.floor(t * 15);
  for (let i = 0; i < snow.length; i++) {
    const p = snow[i];
    const j = Math.sin(p.ph + fr * 12.9898 * (i % 7 + 1)) * 43758.5453;
    const on = (j - Math.floor(j)) > 0.45;
    if (!on) continue;
    const jx = (j * 7) % 1, jy = (j * 13) % 1;
    const x = 490 + Math.cos(p.a) * p.d * R + (jx - 0.5) * 3, y = 540 + Math.sin(p.a) * p.d * R + (jy - 0.5) * 3;
    ctx.globalAlpha = a * (0.45 + 0.55 * jx);
    ctx.fillRect(x, y, p.s, p.s);
  }
  ctx.restore();
}

function frame(t) {
  begin();
  const lampOn = lit(t);
  room(t, lampOn);
  for (let i = 0; i < 3; i++) bedBack(i);
  const showFigure = t >= T.figure && !(t >= T.beam && t < T.back);
  if (!showFigure) hoodiePile();
  figure(left(t), t); figure(middle(t), t); figure(right(t), t);
  ctx.fillStyle = "#0f0d1c"; ctx.fillRect(0, 820, 576, 204);
  ctx.fillStyle = "rgba(160,150,200,0.14)"; ctx.fillRect(0, 828, 576, 1.5);

  // Dunkelheit
  if (!lampOn) {
    let d = 0.6 * ss(T.click, T.click + 0.08, t);
    const bk = beamK(t);
    if (bk >= 0) d *= 0.55;
    ctx.fillStyle = `rgba(10,8,24,${d})`; ctx.fillRect(0, 0, 576, 820);
    if (bk >= 0) {        // Scheinwerfer streift durchs Fenster
      const off = lerp(-230, 260, bk);
      ctx.fillStyle = `rgba(255,246,228,${0.22 * Math.sin(bk * Math.PI)})`;
      ctx.beginPath(); ctx.moveTo(292, 160); ctx.lineTo(372, 160); ctx.lineTo(322 + off, 830); ctx.lineTo(48 + off, 830); ctx.closePath(); ctx.fill();
    }
  }
  if (showFigure) { ctx.globalAlpha = ss(T.figure, T.figure + 0.4, t) * (t >= T.back ? ss(T.back, T.back + 0.2, t) : 1); hoodieFigure(t, t >= T.wave && t < T.waveEnd ? ss(T.wave, T.wave + 0.2, t) * (1 - ss(T.waveEnd - 0.2, T.waveEnd, t)) : 0); ctx.globalAlpha = 1; }
  visualSnow(t);
  if (!lampOn && left(t).eyes === "closed") zzz(t);

  popText("*KLICK*", 284, 352, T.click, 1.45, t, { size: 42, rot: -0.07, fill: "#f6d36d", shadow: "rgba(0,0,0,0.5)", fade: 0.15 });

  header(TXT.title, TXT.sub);
  labels(TXT.labels, TXT.subs, TXT.cols);

  if (t >= T.black && t < T.back + 0.1) { ctx.fillStyle = `rgba(4,3,10,${0.75 * Math.sin((t - T.black) / (T.back + 0.1 - T.black) * Math.PI)})`; ctx.fillRect(0, 0, 576, 1024); }

  bubble(["Licht aus! 😴"], 86, 480, 0.0, t, { tOut: 0.7 });
  bubble(["…ist da jemand?"], 288, 298, 1.85, t, { tOut: 5.95 });
  bubble(["…schon wieder Rauschen."], 490, 384, 2.55, t, { tOut: 5.95 });
  bubble(["oh. mein Hoodie."], 288, 298, 6.2, t, { tOut: 6.62 });
  bubble(["ES IST WIEDER DA"], 288, 277, 7.0, t, { tOut: 8.95, weight: 800, size: 18 });
  bubble(["…?"], 86, 480, 7.25, t, { tOut: 7.8 });
  bubble(["*blinzel blinzel*"], 490, 373, 8.0, t, { tOut: 8.7 });
  bubble(["es geht nicht weg"], 490, 373, 8.75, t, { tOut: 10.6 });
  bubble(["hat es gerade GEWUNKEN?!"], 288, 277, 9.0, t, { tOut: 10.6 });
  bubble(["nicht. hinschauen."], 288, 480, 10.75, t);
  bubble(["…?"], 86, 480, 11.25, t, { tOut: 11.65 });
  bubble(["…Moment, ihr seht", "kein Bildrauschen??"], 430, 298, 11.75, t, { tail: 500 });
}

window.setup = async () => { await SL.loadFonts(); return { duration: DUR }; };
window.renderFrame = frame;
