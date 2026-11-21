// "GLEICHE STILLE." – Nachbau von "SAME QUIET ROOM. 3 different ears" (deutsch)
const { ctx, CX, POSE, clamp, lerp, ss, rnd, rr, at, figure, bubble, popText, header, labels, begin } = SL;
const DUR = 14.0;
const T = { ring: 1.25, hey: 5.0, click: 11.0, end: DUR };

const TXT = {
  title: "GLEICHE STILLE.", sub: "3 verschiedene Ohren:",
  labels: ["DIE MEISTEN", "HÖRT PFEIFEN", "HÖRT WÖRTER"],
  subs: ["", "(TINNITUS)", "(AUDITIVE PAREIDOLIE)"],
  cols: ["#ece4e6", "#7fd6f0", "#f0b060"],
};

// Drehwinkel des Ventilators (läuft bis zum Klick, dann ausrollen)
function fanAngle(t) {
  const w = 22;
  if (t < T.click) return w * t;
  const d = t - T.click, tau = 0.45;
  return w * T.click + w * tau * (1 - Math.exp(-d / tau));
}
const fanOn = t => t < T.click;

function room(t) {
  const bg = ctx.createLinearGradient(0, 0, 0, 830);
  bg.addColorStop(0, "#35265f"); bg.addColorStop(1, "#2b1f52");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 576, 1024);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  for (let y = 150; y < 580; y += 48) for (let x = 30 + ((y / 48) % 2) * 0; x < 576; x += 48) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.29); ctx.fill(); }
  // Lampenschein
  const g = ctx.createRadialGradient(533, 420, 10, 533, 420, 170);
  g.addColorStop(0, "rgba(255,205,150,0.16)"); g.addColorStop(1, "rgba(255,205,150,0)");
  ctx.fillStyle = g; ctx.fillRect(340, 240, 236, 380);
  // Uhr
  ctx.fillStyle = "#f2ecf6"; ctx.beginPath(); ctx.arc(96, 255, 33, 0, 6.29); ctx.fill();
  ctx.strokeStyle = "#d8b46a"; ctx.lineWidth = 4; ctx.stroke();
  const tick = Math.floor(t * 2) / 2;
  const hand = (ang, len, w) => { ctx.strokeStyle = "#2b2633"; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(96, 255); ctx.lineTo(96 + Math.sin(ang) * len, 255 - Math.cos(ang) * len); ctx.stroke(); };
  hand(0.15 + tick * 0.05, 15, 3); hand(tick * 0.9, 24, 2.4);
  // Bilder
  ctx.fillStyle = "#2a1f50"; ctx.strokeStyle = "#d0a85c"; ctx.lineWidth = 4;
  rr(297, 222, 110, 83, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#6a4fb0"; ctx.beginPath(); ctx.moveTo(305, 298); ctx.lineTo(335, 258); ctx.lineTo(355, 280); ctx.lineTo(368, 266); ctx.lineTo(400, 298); ctx.fill();
  ctx.fillStyle = "#f2c94c"; ctx.beginPath(); ctx.arc(384, 244, 6.5, 0, 6.29); ctx.fill();
  ctx.fillStyle = "#2a1f50"; rr(425, 243, 67, 67, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#d0607f"; ctx.beginPath(); ctx.arc(458, 277, 16, 0, 6.29); ctx.fill();
  // Stehlampe
  ctx.strokeStyle = "#1e1835"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(533, 383); ctx.lineTo(533, 828); ctx.stroke();
  ctx.fillStyle = "#f6c97a"; ctx.beginPath(); ctx.moveTo(512, 342); ctx.lineTo(554, 342); ctx.lineTo(566, 383); ctx.lineTo(500, 383); ctx.closePath(); ctx.fill();
  // Sofa
  ctx.fillStyle = "#7b52a8"; rr(10, 575, 556, 118, 18); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.06)"; rr(14, 579, 548, 16, 10); ctx.fill();
  ctx.fillStyle = "#5c3d8a"; rr(0, 688, 576, 14, 4); ctx.fill();
  ctx.fillStyle = "#1c1534"; ctx.fillRect(0, 702, 576, 128);
}

function fan(t) {
  ctx.strokeStyle = "#241c40"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(186, 575); ctx.lineTo(186, 826); ctx.stroke();
  ctx.fillStyle = "#241c40"; rr(160, 820, 52, 8, 4); ctx.fill();
  ctx.fillStyle = fanOn(t) ? "#4fd17a" : "#2f3a34"; ctx.beginPath(); ctx.arc(186, 664, 5, 0, 6.29); ctx.fill();
  ctx.fillStyle = "rgba(150,130,205,0.35)"; ctx.beginPath(); ctx.arc(186, 533, 48, 0, 6.29); ctx.fill();
  const a = fanAngle(t);
  const speed = fanOn(t) ? 1 : Math.exp(-(t - T.click) / 0.45);
  ctx.save(); ctx.translate(186, 533);
  for (let k = 0; k < 3; k++) {
    ctx.save(); ctx.rotate(a + k * 2.094);
    ctx.fillStyle = `rgba(205,185,240,${0.95 - 0.55 * speed})`;
    ctx.beginPath(); ctx.ellipse(0, -21, 11, 22, 0, 0, 6.29); ctx.fill();
    ctx.restore();
  }
  if (speed > 0.1) { ctx.fillStyle = `rgba(205,185,240,${0.25 * speed})`; ctx.beginPath(); ctx.arc(0, 0, 42, 0, 6.29); ctx.fill(); }
  ctx.fillStyle = "#f0e8fa"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.29); ctx.fill();
  ctx.strokeStyle = "#7a6aa8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 48, 0, 6.29); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.strokeStyle = "rgba(122,106,168,0.6)";
  for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(k * 0.5236) * 47, Math.sin(k * 0.5236) * 47); ctx.stroke(); }
  ctx.restore();
}

function airLines(t) {
  if (!fanOn(t)) return;
  ctx.strokeStyle = "rgba(190,175,235,0.35)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  for (const [x0, y0, len] of [[372, 520, 34], [410, 512, 28], [465, 520, 36], [520, 516, 30], [240, 523, 26]]) {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) { const u = i / 12; const x = x0 + u * len; const y = y0 + Math.sin(u * 9 + t * 8 + x0) * 2.5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
}

function rings(cx, hy, t, k) {
  if (k <= 0) return;
  for (let r = 0; r < 3; r++) {
    ctx.strokeStyle = `rgba(150,180,240,${(0.5 - r * 0.12) * k})`; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const a = i / 60 * 6.283;
      const R = 52 + r * 9 + Math.sin(a * 9 + t * 14 + r) * 2.2;
      const x = cx + Math.cos(a) * R, y = hy + Math.sin(a) * R * 0.95;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
}

function left(t) {
  const o = { x: CX[0], eyes: "happy", mouth: "smile" };
  if (t >= 1.5) { o.eyes = "open"; o.look = [2, 0]; o.mouth = "flat"; o.brows = "raised"; o.armL = POSE.outLow; }
  if (t >= 4.0) { o.eyes = "happy"; o.mouth = "smile"; o.brows = null; o.armL = POSE.down; o.look = [0, 0]; }
  if (t >= 6.7) { o.eyes = "open"; o.mouth = "o"; o.mouthK = 0.7; o.brows = "raised"; o.armL = o.armR = POSE.outLow; }
  if (t >= 8.45) { o.mouth = "flat"; o.brows = null; }
  if (t >= 10.9) { o.armR = [[86, 700], [102, 664]]; o.armL = POSE.down; o.mouth = "flat"; }
  if (t >= 11.7) { o.eyes = "happy"; o.mouth = "talk"; o.mouthK = 0.5 + 0.5 * Math.abs(Math.sin(t * 12)); o.armR = [[86, 710], [100, 690]]; }
  if (t >= 12.5) { o.eyes = "open"; o.mouth = "flat"; o.armR = POSE.down; }
  if (t >= 13.1) { o.alarm = true; o.alarmCol = "#c7a14f"; }
  return o;
}
function middle(t) {
  const o = { x: CX[1], eyes: "closed", mouth: "smile", after: (cx, hy) => rings(cx, hy, t, ss(T.ring - 0.05, T.ring + 0.2, t)) };
  if (t >= T.ring) { o.eyes = "wide"; o.mouth = "o"; o.armL = o.armR = POSE.head; }
  if (t >= 4.0) { o.eyes = "closed"; o.mouth = "flat"; o.brows = "worried"; o.sweat = true; }
  if (t >= 8.45 && t < 9.7) { o.eyes = "wide"; o.mouth = "o"; o.alarm = true; o.sweat = false; }
  if (t >= 9.7) { o.eyes = "closed"; o.mouth = "flat"; o.brows = "worried"; }
  if (t >= 11.9) { o.eyes = "open"; o.armL = o.armR = POSE.down; o.look = [0, 1]; }
  if (t >= 12.7) { o.eyes = "wide"; o.mouth = "o"; o.armL = o.armR = POSE.head; o.sweat = true; }
  return o;
}
function right(t) {
  const o = { x: CX[2], eyes: "open", mouth: "smile" };
  if (t >= 4.4) o.look = [-1.5, 0];
  if (t >= T.hey && t < 6.15) { o.jump = 46 * ss(T.hey, T.hey + 0.15, t); o.eyes = "wide"; o.mouth = "o"; o.armL = POSE.head; o.alarm = true; }
  if (t >= 6.15) { o.eyes = "dash"; o.mouth = "o"; o.armL = POSE.head; }
  if (t >= 8.45) { o.eyes = "open"; o.mouth = "flat"; o.look = [0, 0]; }
  if (t >= 9.7) { o.eyes = "wide"; o.mouth = "o"; o.armL = POSE.down; o.armR = POSE.point; }
  if (t >= 11.65) { o.eyes = "open"; o.brows = "worried"; o.mouth = "teeth"; o.blush = true; o.armL = o.armR = POSE.chest; }
  return o;
}

function frame(t) {
  begin();
  room(t);
  fan(t);
  airLines(t);
  figure(left(t), t); figure(middle(t), t); figure(right(t), t);
  ctx.fillStyle = "#0f0d1c"; ctx.fillRect(0, 830, 576, 194);
  ctx.fillStyle = "rgba(160,150,200,0.12)"; ctx.fillRect(0, 830, 576, 1);

  if (t >= 1.6 && t < 3.95) { ctx.fillStyle = "#f2ecf6"; ctx.font = "800 22px Pop"; ctx.textAlign = "center"; ctx.fillText("?", 128, 528 - Math.abs(Math.sin(t * 3)) * 3); }
  popText("hey…", 334, 505, 5.2, 6.0, t, { size: 22, italic: true, weight: 800, rot: 0, fill: "#e0a656", fade: 0.25 });
  popText("*klick*", 186, 627, T.click, 11.6, t, { size: 18, rot: 0, fill: "#f6d36d", stroke: "#2a2040", strokeW: 4, fade: 0.2 });

  header(TXT.title, TXT.sub);
  labels(TXT.labels, TXT.subs, TXT.cols, { y: 864 });

  const C = { weight: 800, size: 14.5 };
  bubble(["himmlische Ruhe 😌"], 86, 490, 0.0, t, { tOut: 1.25 });
  bubble(["WARUM PIEPT ES", "IMMER NOCH?!"], 288, 467, 1.3, t, { ...C, tOut: 3.95 });
  bubble(["hat jemand", "hey gesagt?"], 490, 467, 6.25, t, { tOut: 8.4 });
  bubble(["was?"], 86, 490, 6.75, t, { tOut: 8.4 });
  bubble(["DU HÖRST DAS", "PFEIFEN NICHT?"], 288, 467, 8.5, t, { ...C, tOut: 9.65 });
  bubble(["DER VENTILATOR", "REDET."], 490, 467, 9.75, t, { ...C, tOut: 11.6 });
  bubble(["besser?"], 86, 490, 11.75, t);
  bubble(["…NEIN."], 288, 427, 12.75, t, { weight: 800, size: 18 });
}

window.setup = async () => { await SL.loadFonts(); return { duration: DUR }; };
window.renderFrame = frame;
