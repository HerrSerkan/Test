// "GLEICHER STURM." – Nachbau von "SAME STORM. 3 different brains" (deutsch)
const { ctx, CX, POSE, clamp, lerp, ss, rnd, rr, poseAt, at, figure, bubble, popText, header, labels, begin } = SL;
const DUR = 14.0;
const FL = [3.0, 7.25, 12.25];            // Blitze
const DAY = 10.75;                        // Sonne kommt raus

const TXT = {
  title: "GLEICHER STURM.", sub: "3 verschiedene Gehirne:",
  labels: ["DIE MEISTEN", "LIEBEN REGEN", "ANGST VOR DONNER"],
  subs: ["", "(PLUVIOPHILIE)", "(ASTRAPHOBIE)"],
  cols: ["#e9e1e2", "#7fc8f5", "#f28aa8"],
  boom: "BUMM!", rumble: "*grummel*",
};

// Regentropfen
const drops = [];
(function () { const r = rnd(4); for (let i = 0; i < 70; i++) drops.push({ x: r() * 560, y: r() * 320, len: 10 + r() * 12, sp: 520 + r() * 200 }); })();

function windowScene(t) {
  const x0 = 44, y0 = 155, w = 488, h = 307;
  const day = ss(DAY - 0.05, DAY + 0.15, t);
  ctx.save(); rr(x0, y0, w, h, 8); ctx.clip();
  // Himmel
  const n = ctx.createLinearGradient(0, y0, 0, y0 + h); n.addColorStop(0, "#1d2235"); n.addColorStop(1, "#2b3249");
  ctx.fillStyle = n; ctx.fillRect(x0, y0, w, h);
  if (day > 0) {
    ctx.globalAlpha = day;
    const d = ctx.createLinearGradient(0, y0, 0, y0 + h); d.addColorStop(0, "#6aa9e6"); d.addColorStop(1, "#92c3ef");
    ctx.fillStyle = d; ctx.fillRect(x0, y0, w, h);
    const sunA = ss(DAY, DAY + 0.6, t);
    ctx.fillStyle = `rgba(247,213,106,${0.35 + 0.65 * sunA})`; ctx.beginPath(); ctx.arc(436, 222, 36, 0, 6.29); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Stadt
  const city = [[44, 380], [95, 372], [135, 395], [178, 345], [228, 372], [262, 398], [300, 360], [350, 340], [400, 375], [440, 362], [480, 385], [532, 385]];
  ctx.fillStyle = day > 0.5 ? "#566a8e" : "#151a28";
  ctx.beginPath(); ctx.moveTo(x0, y0 + h);
  for (let i = 0; i < city.length - 1; i++) { ctx.lineTo(city[i][0], city[i][1]); ctx.lineTo(city[i + 1][0], city[i][1]); }
  ctx.lineTo(x0 + w, y0 + h); ctx.fill();
  // Gewitterwolke am Ende
  if (t > FL[2] - 0.05) {
    ctx.globalAlpha = ss(FL[2] - 0.05, FL[2] + 0.2, t);
    ctx.fillStyle = "#5c6274";
    for (const [cx, cy, r] of [[150, 196, 26], [182, 186, 32], [214, 196, 24]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.29); ctx.fill(); }
    rr(124, 190, 118, 22, 11); ctx.fill(); ctx.globalAlpha = 1;
  }
  // Regen
  if (t < DAY) {
    ctx.strokeStyle = "rgba(220,225,245,0.35)"; ctx.lineWidth = 1.3;
    for (const d of drops) {
      const y = y0 + ((d.y + t * d.sp) % (h + 40)) - 20;
      const x = x0 + ((d.x - (y - y0) * 0.28) % w + w) % w;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - d.len * 0.28, y + d.len); ctx.stroke();
    }
  }
  // Blitze
  const bolts = [[FL[0], 172, 1], [FL[1], 400, 1], [FL[2], 330, 0.7]];
  for (const [tb, bx, s] of bolts) {
    if (t >= tb && t < tb + 0.35) {
      ctx.strokeStyle = "rgba(255,250,235,0.95)"; ctx.lineWidth = 3; ctx.lineJoin = "miter";
      ctx.beginPath(); ctx.moveTo(bx, 160); ctx.lineTo(bx - 14 * s, 160 + 50 * s); ctx.lineTo(bx + 6 * s, 160 + 58 * s); ctx.lineTo(bx - 10 * s, 160 + 120 * s); ctx.stroke();
    }
  }
  ctx.restore();
  // Rahmen
  ctx.strokeStyle = "#6b4a30"; ctx.lineWidth = 7;
  rr(x0, y0, w, h, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(288, y0); ctx.lineTo(288, y0 + h); ctx.moveTo(x0, 308); ctx.lineTo(x0 + w, 308); ctx.stroke();
}

function phone(cx, by) {
  ctx.save(); ctx.translate(cx - 4, 690 + by); ctx.rotate(0.12);
  ctx.fillStyle = "#1f2430"; rr(-12, -24, 24, 46, 6); ctx.fill();
  ctx.fillStyle = "#4f9cf2"; rr(-9, -20, 18, 38, 4); ctx.fill();
  ctx.restore();
}
function blueBlanket(cx, by) {
  ctx.fillStyle = "#5ea8ef"; ctx.beginPath();
  ctx.moveTo(cx - 86, 830); ctx.lineTo(cx - 86, 720); ctx.bezierCurveTo(cx - 86, 650, cx + 86, 650, cx + 86, 720); ctx.lineTo(cx + 86, 830); ctx.fill();
  ctx.strokeStyle = "rgba(200,230,255,0.55)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 72, 727); ctx.lineTo(cx + 72, 727); ctx.moveTo(cx - 76, 779); ctx.lineTo(cx + 76, 779); ctx.stroke();
  ctx.font = "24px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("☕", cx - 30, 688 + by * 0.3);
}
function purpleBlanket(a) {
  return (cx, by) => {
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "#9a67e0"; ctx.beginPath();
    ctx.moveTo(cx - 88, 830); ctx.lineTo(cx - 88, 690); ctx.bezierCurveTo(cx - 88, 568, cx + 88, 568, cx + 88, 690); ctx.lineTo(cx + 88, 830); ctx.fill();
    ctx.strokeStyle = "rgba(225,205,255,0.45)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 76, 693); ctx.lineTo(cx + 76, 693); ctx.moveTo(cx - 80, 760); ctx.lineTo(cx + 80, 760); ctx.stroke();
    ctx.restore();
  };
}
const jumpAt = (t0, t, hgt) => (t >= t0 && t < t0 + 0.5) ? Math.sin((t - t0) / 0.5 * Math.PI) * hgt : 0;

function left(t) {
  const o = { x: CX[0], eyes: "open", brows: "raised", mouth: "flat", look: [0, -1] };
  if (t >= FL[0] && t < FL[0] + 0.5) { o.jump = jumpAt(FL[0], t, 26); o.eyes = "wide"; o.mouth = "o"; o.lean = -0.07; o.armL = o.armR = POSE.outLow; }
  if (t >= 3.55 && t < DAY) { o.armL = o.armR = POSE.phone; o.front = phone; o.look = [0, 1.5]; o.brows = "flat"; }
  if (t >= 4.75 && t < DAY) o.brows = t > FL[1] ? "raised" : "flat";
  if (t >= DAY) { o.eyes = "happy"; o.mouth = "smile"; o.brows = null; }
  if (t >= FL[2]) { o.eyes = "open"; o.brows = "raised"; o.mouth = "flat"; o.look = [0, 0]; }
  return o;
}
function middle(t) {
  const o = { x: CX[1], eyes: "happy", mouth: "smile", front: blueBlanket };
  const cheer = (t >= FL[0] + 0.15 && t < 4.6) || (t >= FL[1] && t < DAY) ;
  if (t >= FL[0] && t < 4.6) { o.eyes = "wide"; o.mouth = "grin"; }
  if (cheer) { o.armL = o.armR = POSE.up; o.bob = -Math.abs(Math.sin(t * 7)) * 4; }
  if (t >= FL[1] && t < DAY) { o.eyes = "wide"; o.mouth = "grin"; }
  if (t >= DAY) { o.front = null; o.eyes = "open"; o.brows = "worried"; o.mouth = "o"; o.armL = o.armR = POSE.outLow; }
  if (t >= FL[2]) { o.eyes = "wide"; o.brows = null; o.mouth = "grin"; o.armL = o.armR = POSE.up; o.bob = -Math.abs(Math.sin(t * 7)) * 4; }
  return o;
}
function right(t) {
  const o = { x: CX[2], eyes: "open", brows: "worried", mouth: "wobble", sweat: true };
  const hide = (a) => { o.cover = null; o.front = purpleBlanket(a); o.eyes = "squeeze"; o.armL = o.armR = [[80, 598], [40, 562]]; o.alarm = true; o.shake = 0.6; };
  if (t >= FL[0] && t < 3.5) { o.jump = jumpAt(FL[0], t, 38) + (t > FL[0] + 0.25 ? 18 : 0); o.eyes = "wide"; o.mouth = "o"; o.armL = o.armR = POSE.hip; o.alarm = true; o.alarmCol = "#c9c3d6"; o.sweat = false; }
  if (t >= 3.45 && t < DAY + 0.2) hide(clamp((t - 3.45) / 0.15));
  if (t >= DAY + 0.2) { o.eyes = "open"; o.look = [-1.5, 1]; o.mouth = "flat"; o.brows = "worried"; o.sweat = false; }
  if (t >= FL[2] && t < 12.6) { o.jump = jumpAt(FL[2], t, 30); o.eyes = "wide"; o.mouth = "o"; o.alarm = true; o.alarmCol = "#c9c3d6"; }
  if (t >= 12.6) hide(clamp((t - 12.6) / 0.15));
  return o;
}

function frame(t) {
  begin();
  const bg = ctx.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, "#1a1530"); bg.addColorStop(0.8, "#120f22"); bg.addColorStop(1, "#0c0a17");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 576, 1024);
  windowScene(t);
  ctx.fillStyle = "#0f0d1c"; ctx.fillRect(0, 830, 576, 194);
  ctx.fillStyle = "rgba(160,150,200,0.10)"; ctx.fillRect(0, 830, 576, 1);

  figure(left(t), t); figure(middle(t), t); figure(right(t), t);

  // Comic-Wörter
  popText(TXT.boom, 284, 300, FL[0], 3.9, t, { size: 62, rot: -0.1, fill: "#f8d67a", shadow: "rgba(30,20,10,0.55)", shake: 6 });
  popText(TXT.boom, 280, 300, FL[1], 8.3, t, { size: 74, rot: -0.1, fill: "#f8d67a", shadow: "rgba(30,20,10,0.55)", shake: 7 });
  popText(TXT.rumble, 288, 312, FL[2] + 0.1, 99, t, { size: 32, rot: -0.07, fill: "#f4f0ff", stroke: "#4a3d8f", strokeW: 6 });

  header(TXT.title, TXT.sub);
  labels(TXT.labels, TXT.subs, TXT.cols);

  // Blitz-Aufhellung
  for (const f of FL) {
    if (t >= f && t < f + 0.7) {
      const a = (f === FL[2] ? 0.35 : 0.55) * (1 - (t - f) / 0.7);
      ctx.fillStyle = `rgba(205,205,220,${a})`; ctx.fillRect(0, 0, 576, 1024);
    }
  }

  // Sprechblasen
  const Y = 496;
  const B = (l, i, a, b) => bubble(l, i === 0 ? 86 : i === 1 ? 288 : 490, Y, a, t, { tOut: b });
  B(["boah, Regen."], 0, 0.0, 2.95); B(["endlich 😌"], 1, 0.5, 2.95); B(["…oh nein."], 2, 0.75, 2.95);
  B(["oh."], 0, 3.25, 4.6); B(["OOOH!!"], 1, 3.25, 4.6); B(["NEIN."], 2, 3.3, 4.6);
  B(["wann hört's auf"], 0, 4.8, 7.2); B(["bester Tag ever"], 1, 5.0, 7.2); B(["1… 2… 3…"], 2, 5.2, 7.2);
  B(["…nervig."], 0, 7.5, 10.6); B(["NOCHMAL!! 😍"], 1, 7.5, 10.6); B(["😭😭😭"], 2, 7.55, 10.6);
  B(["endlich."], 0, 11.0, 12.2); B(["komm zurück 😭"], 1, 11.4, 12.2); B(["ist es vorbei?"], 2, 11.75, 12.2);
  B(["…echt jetzt?"], 0, 12.5, 99); B(["JAAA 😍"], 1, 12.5, 99); B(["NEIN."], 2, 12.55, 99);
}

window.setup = async () => { await SL.loadFonts(); return { duration: DUR }; };
window.renderFrame = frame;
