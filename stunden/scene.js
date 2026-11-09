// "Gleiche 24 Stunden. Anderes Leben." – deutsche Version (eigene Zeichnung), ohne Sprecher.
// Oben DISZIPLINIERT, unten FAUL, die Uhr läuft von 05:30 bis 05:00 am nächsten Morgen.
"use strict";
const W = 1080, H = 1920, DUR = 32.0;
const TOP = [420, 900], BOT = [930, 1410];         // Panels (Bildschirm-y)
const FL = 410;                                    // Boden im Panel (lokal)
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function glow(x, y, r, c, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function line(pts, w) { ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke(); }

// ------------------------------------------------------------ Uhr: Video-Sekunde -> Minuten seit 0:00
const CK = [[0, 330], [3, 454], [6, 600], [8, 737], [11, 1000], [12.6, 1034], [15, 1124], [18, 1258], [21, 1378], [23.5, 1438], [25, 1513],
  [29.4, 1740], [30.0, 1740]];
function minutesAt(t) {
  if (t <= CK[0][0]) return CK[0][1];
  for (let i = 1; i < CK.length; i++) if (t <= CK[i][0]) return lerp(CK[i - 1][1], CK[i][1], (t - CK[i - 1][0]) / (CK[i][0] - CK[i - 1][0]));
  return CK[CK.length - 1][1];
}
const hhmm = m => { m = Math.floor(m) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
const T_TEXT1 = 29.9, T_TEXT2 = 30.5, T_END = DUR;

// Tageslicht 0 (Nacht) .. 1 (Tag), aus der Uhrzeit
function daylight(m) {
  m = m % 1440;
  if (m < 330) return 0;
  if (m < 450) return (m - 330) / 120;
  if (m < 1110) return 1;
  if (m < 1230) return 1 - (m - 1110) / 120;
  return 0;
}
function mixC(a, b, k) { return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(",")})`; }

// ------------------------------------------------------------ Strichfigur (eigene Form, mit Gesicht)
// o: {col, face('smile'|'tired'|'sleep'|'happy'), pose('stand'|'walk'|'sit'|'lie'|'run'|'dance'|'stretch'|'cook'|'type'|'phone'|'couch'), ph, dir}
function figure(x, fy, o) {
  const col = o.col, s = o.s || 1;
  ctx.save(); ctx.translate(x, fy); ctx.scale(s * (o.dir || 1), s);
  ctx.strokeStyle = col; ctx.fillStyle = col;
  const p = o.pose, ph = o.ph || 0;
  if (p === "lie") {                                 // liegt nach links, Kopf aufs Kissen
    line([[-58, -26], [40, -26]], 13); line([[40, -26], [96, -24]], 12);
    circle(-84, -32, 25, col);
    face(-84, -32, o.face, 0);
    ctx.restore(); return;
  }
  let hip = [0, -86], neck = [0, -170], head = [0, -205];
  let lA = [[-26, -128], [-34, -88]], rA = [[26, -128], [34, -88]];
  let lL = [[-14, -44], [-18, 0]], rL = [[14, -44], [18, 0]];
  const sw = Math.sin(ph);
  if (p === "walk" || p === "run") {
    const a = p === "run" ? 38 : 26;
    lL = [[sw * a * 0.5, -44], [sw * a, -Math.max(0, Math.cos(ph)) * 8]]; rL = [[-sw * a * 0.5, -44], [-sw * a, -Math.max(0, -Math.cos(ph)) * 8]];
    lA = [[-18 - sw * 14, -128], [-24 - sw * 28, -94]]; rA = [[18 + sw * 14, -128], [24 + sw * 28, -94]];
    if (p === "run") { neck = [10, -170]; head = [14, -205]; }
  } else if (p === "sit" || p === "type" || p === "couch") {
    hip = [0, -64]; neck = [p === "couch" ? -10 : 6, -146]; head = [neck[0] + 4, -181];
    lL = [[36, -62], [40, 0]]; rL = [[30, -62], [32, 0]];
    const tap = p === "type" ? Math.sin(ph * 3) * 5 : 0;
    lA = [[28, -110], [56, -100 + tap]]; rA = [[22, -112], [52, -96 - tap]];
    if (p === "couch") { lA = [[18, -112], [40, -92]]; rA = [[-24, -116], [-30, -82]]; }
  } else if (p === "stretch") {
    lA = [[-30, -196], [-40, -240]]; rA = [[30, -196], [40, -240]];
  } else if (p === "dance") {
    const k = Math.sin(ph);
    lA = [[-30, -180 + k * 20], [-50, -220 + k * 30]]; rA = [[30, -150 - k * 20], [56, -170 - k * 30]];
    lL = [[-16 - k * 8, -44], [-26 - k * 10, 0]]; rL = [[16 - k * 8, -44], [26 - k * 10, 0]];
    hip = [k * 6, -86]; neck = [k * 10, -170]; head = [k * 12, -205];
  } else if (p === "cook") {
    lA = [[22, -128], [56, -118 + Math.sin(ph * 2) * 4]]; rA = [[26, -132], [58, -126]];
  } else if (p === "phone") {
    lA = [[18, -136], [10, -166]]; rA = [[22, -132], [16, -168]];
  }
  line([hip, lL[0], lL[1]], 13); line([hip, rL[0], rL[1]], 13);
  line([hip, neck], 14);
  line([neck, lA[0], lA[1]], 11); line([neck, rA[0], rA[1]], 11);
  circle(head[0], head[1], 26, col);
  face(head[0], head[1], o.face, p === "type" || p === "phone" || p === "cook" ? 1 : 0);
  if (p === "phone") { ctx.fillStyle = "#14161c"; rr(4, -186, 18, 30, 3); ctx.fill(); glow(13, -175, 34, "140,190,255", 0.35); }
  ctx.restore();
}
function face(x, y, f, look) {
  ctx.fillStyle = "#1b1d26"; ctx.strokeStyle = "#1b1d26"; ctx.lineWidth = 3.2; ctx.lineCap = "round";
  const lx = (look || 0) * 6;
  if (f === "sleep") {
    for (const dx of [-9, 9]) { ctx.beginPath(); ctx.moveTo(x + dx - 5, y - 2); ctx.lineTo(x + dx + 5, y - 2); ctx.stroke(); }
  } else {
    for (const dx of [-9, 9]) { ctx.beginPath(); ctx.arc(x + dx + lx, y - 3, 3.6, 0, 7); ctx.fill(); }
    if (f === "tired") { ctx.lineWidth = 2.4; for (const dx of [-9, 9]) { ctx.beginPath(); ctx.moveTo(x + dx - 6 + lx, y - 9); ctx.lineTo(x + dx + 6 + lx, y - 9); ctx.stroke(); } ctx.lineWidth = 3.2; }
  }
  const m = f === "happy" ? 1.2 : f === "smile" ? 0.8 : f === "tired" ? -0.2 : 0;
  ctx.beginPath(); ctx.moveTo(x - 8 + lx, y + 10 - m * 2); ctx.quadraticCurveTo(x + lx, y + 10 + m * 7, x + 8 + lx, y + 10 - m * 2); ctx.stroke();
}
function zzz(x, y, t, col = "#cfd8ff") {
  for (let i = 0; i < 3; i++) {
    const p = (t * 0.6 + i / 3) % 1;
    ctx.globalAlpha = Math.sin(Math.PI * p); ctx.fillStyle = col;
    ctx.font = `900 ${18 + 12 * p}px InterX`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("z", x + p * 34, y - p * 60);
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------ Räume (Panel-Koordinaten 0..1080 x 0..480)
function wall(c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, FL);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, FL);
}
function floor(c) { ctx.fillStyle = c; ctx.fillRect(0, FL, W, 80); ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(0, FL, W, 4); }
function windowAt(x, y, w, h, m, curtains) {
  const d = daylight(m);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const dawn = Math.max(0, 1 - Math.abs(d - 0.45) * 3);
  g.addColorStop(0, mixC([16, 20, 52], [110, 180, 240], d)); g.addColorStop(1, mixC(mixC([30, 34, 70], [200, 230, 250], d).match(/\d+/g).map(Number), [255, 170, 110], dawn * 0.8));
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  if (d < 0.5) { circle(x + w * 0.7, y + h * 0.3, 12, "#f3f0d6"); }
  else circle(x + w * 0.3, y + h * 0.35, 14, "#ffe27a");
  ctx.fillStyle = "rgba(20,24,44,0.6)"; for (let i = 0; i < 5; i++) ctx.fillRect(x + i * (w / 5), y + h - 24 - (i % 3) * 12, w / 5 - 4, 24 + (i % 3) * 12);
  ctx.fillStyle = "#e9e4d8"; ctx.fillRect(x + w / 2 - 2, y, 4, h); ctx.fillRect(x, y + h / 2 - 2, w, 4);
  if (curtains) { ctx.fillStyle = curtains; ctx.fillRect(x - 10, y - 10, w + 20, h + 20); ctx.fillStyle = "rgba(0,0,0,0.25)"; for (let i = 1; i < 6; i++) ctx.fillRect(x - 10 + i * (w + 20) / 6, y - 10, 3, h + 20); }
}
function bed(x, col) {
  ctx.fillStyle = "#4a3a62"; rr(x - 10, FL - 130, 22, 130, 4); ctx.fill();
  ctx.fillStyle = "#ece8f4"; rr(x + 14, FL - 78, 70, 26, 10); ctx.fill();
  ctx.fillStyle = col; rr(x + 10, FL - 56, 300, 40, 8); ctx.fill();
  ctx.fillStyle = "#2a2348"; ctx.fillRect(x + 14, FL - 16, 10, 16); ctx.fillRect(x + 296, FL - 16, 10, 16);
}
function blanket(x, col) { ctx.fillStyle = col; rr(x + 120, FL - 74, 196, 34, 10); ctx.fill(); }
function lamp(x, on) {
  ctx.fillStyle = "#3a3048"; rr(x - 26, FL - 70, 52, 70, 4); ctx.fill();
  ctx.fillStyle = "#2a2340"; ctx.fillRect(x - 3, FL - 120, 6, 50);
  ctx.fillStyle = on ? "#ffe2a0" : "#5a5070"; ctx.beginPath(); ctx.moveTo(x - 24, FL - 118); ctx.lineTo(x + 24, FL - 118); ctx.lineTo(x + 14, FL - 146); ctx.lineTo(x - 14, FL - 146); ctx.fill();
  if (on) glow(x, FL - 120, 160, "255,214,150", 0.35);
}
function poster(x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 70, 90); ctx.fillStyle = "rgba(255,255,255,0.5)"; circle(x + 35, y + 40, 16, "rgba(255,255,255,0.5)"); }

// --- oben: der Disziplinierte
function sceneTop(t, m) {
  const d = daylight(m);
  const mm = m % 1440;
  const walkPh = t * 9;
  if (m < 380 || m >= 1500) {                                       // Schlafzimmer (morgens / nachts)
    wall(mixC([30, 26, 60], [196, 120, 150], d), mixC([40, 34, 74], [230, 150, 160], d)); floor(mixC([28, 24, 44], [120, 80, 100], d));
    windowAt(700, 70, 160, 170, m); poster(140, 90, "#e07a5f");
    lamp(560, m >= 1500 && m < 1520);
    bed(160, "#3b6fd8");
    if (m < 336) { figure(230, FL - 40, { col: "#f4f1ea", face: "sleep", pose: "lie" }); blanket(160, "#2f5cc0"); zzz(250, 240, t); }
    else if (m < 350) { figure(330, FL, { col: "#f4f1ea", face: "smile", pose: "stretch" }); blanket(160, "#2f5cc0"); }
    else if (m < 380) { figure(lerp(330, 640, (m - 350) / 30), FL, { col: "#f4f1ea", face: "smile", pose: "walk", ph: walkPh }); blanket(160, "#2f5cc0"); }
    else if (m < 1530) { figure(lerp(900, 420, ramp(m, 1500, 1528)), FL, { col: "#f4f1ea", face: "tired", pose: "walk", ph: walkPh, dir: -1 }); blanket(160, "#2f5cc0"); }
    else { figure(230, FL - 40, { col: "#f4f1ea", face: "sleep", pose: "lie" }); blanket(160, "#2f5cc0"); zzz(250, 240, t); }
  } else if (m < 520) {                                             // Küche: Frühstück
    wall("#6a7fc8", "#8a9ad8"); floor("#3a3f6a");
    windowAt(360, 80, 150, 140, m);
    ctx.fillStyle = "#6b4a2c"; ctx.fillRect(520, FL - 120, 360, 120); ctx.fillStyle = "#8a6440"; ctx.fillRect(510, FL - 130, 380, 14);
    ctx.fillStyle = "#e9eef5"; rr(900, FL - 250, 120, 250, 10); ctx.fill(); ctx.fillStyle = "#c8d0dc"; ctx.fillRect(900, FL - 150, 120, 4);
    ctx.fillStyle = "#2a2f45"; ctx.fillRect(560, FL - 280, 300, 70);                                   // Hängeschränke
    ctx.fillStyle = "#1d1d22"; rr(640, FL - 146, 70, 16, 4); ctx.fill();                                   // Pfanne
    circle(675, FL - 150, 10, "#ffd23a"); for (let i = 0; i < 3; i++) { const p = (t * 1.2 + i / 3) % 1; ctx.globalAlpha = 1 - p; circle(670 + i * 8, FL - 160 - p * 50, 6 + p * 6, "#fff"); ctx.globalAlpha = 1; }
    figure(560, FL, { col: "#f4f1ea", face: "smile", pose: "cook", ph: t * 4 });
  } else if (m < 660) {                                             // Straße: zur Arbeit
    wall(mixC([60, 80, 140], [120, 190, 240], d), "#d8eef9"); floor("#4a4f60");
    ctx.fillStyle = "rgba(40,60,100,0.5)"; for (let i = 0; i < 9; i++) ctx.fillRect(i * 124 - (t * 40) % 124, 130 - (i % 3) * 40, 100, 300);
    for (let i = 0; i < 4; i++) { const tx = (i * 300 - (t * 90) % 300); ctx.fillStyle = "#6a4a2a"; ctx.fillRect(tx + 100, 260, 10, 150); circle(tx + 105, 240, 40, "#4a9a5a"); }
    ctx.fillStyle = "#f2f2f2"; for (let i = 0; i < 10; i++) ctx.fillRect(i * 130 - (t * 160) % 130, FL + 40, 60, 6);
    figure(520, FL, { col: "#f4f1ea", face: "smile", pose: "walk", ph: walkPh });
    ctx.fillStyle = "#c8302c"; rr(470, FL - 168, 30, 50, 6); ctx.fill();                                   // Rucksack
  } else if (m < 1020) {                                            // Büro: Diagramm wächst
    wall("#5a8ad0", "#7aa2dc"); floor("#2f3a5a");
    ctx.fillStyle = "rgba(30,50,90,0.6)"; for (let i = 0; i < 6; i++) ctx.fillRect(40 + i * 90, 60 + (i % 3) * 30, 70, 260);
    ctx.fillStyle = "#e9eef5"; ctx.fillRect(30, 40, 520, 8);
    ctx.fillStyle = "#f6f6f2"; rr(720, 70, 260, 170, 8); ctx.fill();                                     // Tafel mit Balken
    const k = ramp(m, 690, 1000);
    const bars = Math.ceil(k * 5);
    for (let i = 0; i < bars; i++) { ctx.fillStyle = ["#e8443c", "#f2a33a", "#f2d23a", "#5cc98a", "#3b7dd8"][i]; const h = 30 + i * 24; ctx.fillRect(750 + i * 44, 220 - h, 30, h); }
    ctx.fillStyle = "#6b4a2c"; ctx.fillRect(330, FL - 110, 300, 14); ctx.fillRect(350, FL - 96, 12, 96); ctx.fillRect(600, FL - 96, 12, 96);
    ctx.fillStyle = "#1d1d22"; rr(440, FL - 190, 110, 76, 6); ctx.fill(); ctx.fillStyle = "#7fd0ff"; ctx.fillRect(450, FL - 182, 90, 58);
    ctx.fillStyle = "#2a8a4a"; circle(660, FL - 130, 18, "#2a8a4a");
    figure(360, FL, { col: "#f4f1ea", face: "smile", pose: "type", ph: t * 6 });
  } else if (m < 1080) {                                            // Fitnessstudio: Laufband
    wall("#b85a4a", "#c86a56"); floor("#3a2420");
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(160, 60, 760, 200);                         // Spiegel
    ctx.fillStyle = "#2a2f40"; rr(340, FL - 26, 360, 22, 6); ctx.fill(); ctx.fillRect(660, FL - 150, 10, 130);
    ctx.fillStyle = "#3b4258"; rr(620, FL - 170, 80, 26, 5); ctx.fill(); ctx.fillStyle = "#5fe08f"; ctx.fillRect(632, FL - 164, 30, 12);
    figure(500, FL - 22, { col: "#f4f1ea", face: "happy", pose: "run", ph: t * 15 });
  } else if (m < 1230) {                                            // zu Hause: am Laptop lernen/programmieren
    wall(mixC([60, 40, 110], [150, 70, 150], d), mixC([80, 50, 130], [180, 90, 160], d)); floor("#2a2040");
    windowAt(800, 60, 170, 160, m);
    ctx.fillStyle = "#14161c"; rr(80, 50, 460, 250, 10); ctx.fill();                                     // großer Bildschirm mit Code
    const n = Math.floor(ramp(m, 1080, 1230) * 12) + 1;
    for (let i = 0; i < n; i++) { ctx.fillStyle = ["#5cc98a", "#7fb0f2", "#f2c94c", "#e8e8f0"][i % 4]; ctx.fillRect(110 + (i % 3) * 20, 76 + i * 18, 120 + ((i * 47) % 200), 8); }
    ctx.fillStyle = "#6b4a2c"; ctx.fillRect(560, FL - 110, 260, 14); ctx.fillRect(580, FL - 96, 12, 96); ctx.fillRect(790, FL - 96, 12, 96);
    lamp(980, d < 0.5);
    figure(560, FL, { col: "#f4f1ea", face: "smile", pose: "type", ph: t * 6 });
  } else if (m < 1290) {                                            // abends: Spaziergang mit Hund
    wall("#141a3a", "#232a52"); floor("#2a2d3a");
    for (let i = 0; i < 20; i++) circle((i * 61) % W, 30 + (i * 37) % 120, 2, "#fff");
    circle(860, 70, 22, "#f3f0d6");
    ctx.fillStyle = "rgba(10,12,30,0.8)"; for (let i = 0; i < 9; i++) ctx.fillRect(i * 124 - (t * 30) % 124, 200 - (i % 3) * 40, 100, 220);
    ctx.fillStyle = "rgba(255,220,140,0.7)"; for (let i = 0; i < 18; i++) ctx.fillRect((i * 67 - (t * 30) % 124) % W, 230 + (i % 4) * 30, 12, 14);
    figure(480, FL, { col: "#f4f1ea", face: "smile", pose: "walk", ph: walkPh });
    // Hund an der Leine
    const dx = 640, dyb = FL - 34 + Math.abs(Math.sin(t * 12)) * -4;
    ctx.strokeStyle = "#e85d5d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(510, FL - 96); ctx.quadraticCurveTo(580, FL - 40, dx - 20, dyb); ctx.stroke();
    ctx.fillStyle = "#c8914e"; rr(dx - 30, dyb - 14, 56, 26, 12); ctx.fill(); circle(dx + 32, dyb - 18, 15, "#c8914e");
    ctx.fillStyle = "#8a5a2e"; ctx.beginPath(); ctx.ellipse(dx + 36, dyb - 30, 6, 10, 0.4, 0, 7); ctx.fill();
    for (const lx of [-22, -8, 6, 18]) { ctx.fillStyle = "#c8914e"; ctx.fillRect(dx + lx, dyb + 8, 6, 22 + Math.sin(t * 12 + lx) * 3); }
  } else if (m < 1440) {                                            // Party mit Freunden
    wall("#120c2a", "#1e1440"); floor("#1a1430");
    for (let i = 0; i < 26; i++) { const c = ["#ff5c8a", "#5cc9f2", "#ffd36e", "#8ad65c"][i % 4]; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6 + i); circle((i * 43) % W, 40 + (i % 3) * 22, 5, c); ctx.globalAlpha = 1; }
    for (const [x, c] of [[90, "#ff3b8a"], [990, "#3bd9ff"]]) { ctx.fillStyle = c; ctx.fillRect(x, 60, 10, 340); glow(x + 5, 220, 120, c === "#ff3b8a" ? "255,59,138" : "59,217,255", 0.35); }
    for (let i = 0; i < 5; i++) figure(260 + i * 140, FL, { col: i === 2 ? "#f4f1ea" : "#d9dbe6", face: "happy", pose: "dance", ph: t * 7 + i });
  } else {                                                          // Heimweg in der Nacht
    wall("#0e1230", "#182046"); floor("#20232e");
    circle(880, 70, 22, "#f3f0d6");
    ctx.fillStyle = "rgba(10,12,30,0.85)"; for (let i = 0; i < 9; i++) ctx.fillRect(i * 124 - (t * 30) % 124, 200 - (i % 3) * 40, 100, 220);
    figure(lerp(300, 700, ramp(m, 1440, 1500)), FL, { col: "#f4f1ea", face: "tired", pose: "walk", ph: walkPh });
  }
}

// --- unten: der Faule (grau, Vorhänge zu)
function sceneBot(t, m) {
  const mm = m;
  wall("#4a4652", "#55505e"); floor("#34303c");
  windowAt(720, 70, 150, 160, m, "#3e3a48");
  poster(140, 90, "#6a6478");
  // Müll auf dem Boden wächst über den Tag
  const trash = Math.floor(ramp(m, 760, 1360) * 8);
  for (let i = 0; i < trash; i++) { ctx.fillStyle = ["#8a8494", "#6a7a8a", "#9a8a6a"][i % 3]; rr(380 + (i * 83) % 560, FL + 14 + (i % 3) * 14, 26, 12, 4); ctx.fill(); }
  const couch = mm >= 780 && mm < 1376;
  if (!couch) {
    bed(160, "#5a5a7a");
    const inBed = mm < 750 || mm >= 1400;
    if (inBed) {
      figure(230, FL - 40, { col: "#b8b4c2", face: "sleep", pose: "lie" }); blanket(160, "#4a4a6a");
      if (mm >= 1400 && mm < 1440) { ctx.fillStyle = "#14161c"; rr(300, FL - 120, 22, 34, 3); ctx.fill(); glow(311, FL - 103, 50, "140,190,255", 0.4); }
      else zzz(250, 240, t, "#a8b0d0");
    } else if (mm < 780) {                                          // steht endlich auf
      figure(lerp(330, 560, ramp(mm, 750, 780)), FL, { col: "#b8b4c2", face: "tired", pose: "walk", ph: t * 6 }); blanket(160, "#4a4a6a");
    } else {                                                        // geht wieder ins Bett
      figure(lerp(560, 330, ramp(mm, 1376, 1400)), FL, { col: "#b8b4c2", face: "tired", pose: "walk", ph: t * 6, dir: -1 }); blanket(160, "#4a4a6a");
    }
  } else {                                                          // Couch, Fernseher, Chips
    ctx.fillStyle = "#4a4060"; rr(150, FL - 130, 320, 90, 16); ctx.fill(); ctx.fillStyle = "#5a5070"; rr(130, FL - 60, 360, 60, 12); ctx.fill();
    ctx.fillStyle = "#14161c"; rr(760, FL - 200, 220, 130, 8); ctx.fill();
    const tv = ["#3b7dd8", "#d9443c", "#2f9d6a", "#e8a33a"][Math.floor(t * 2) % 4];
    ctx.fillStyle = tv; ctx.fillRect(770, FL - 190, 200, 110); glow(870, FL - 135, 220, "120,160,255", 0.18);
    ctx.fillStyle = "#2a2340"; ctx.fillRect(860, FL - 70, 20, 70);
    figure(300, FL - 40, { col: "#b8b4c2", face: "tired", pose: "couch" });
    ctx.fillStyle = "#e8443c"; rr(352, FL - 104, 30, 26, 4); ctx.fill();                                  // Chipstüte
  }
}

function panel(y0, y1, label, fn, t, m, dim) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(24, y0, W - 48, y1 - y0, 18); ctx.clip();
  ctx.translate(0, y0); const k = (y1 - y0) / 480; ctx.scale(1, k);
  fn(t, m);
  ctx.restore();
  ctx.save(); ctx.font = "700 20px InterX"; ctx.letterSpacing = "3px"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  const w = ctx.measureText(label).width + 26;
  ctx.fillStyle = "rgba(0,0,0,0.55)"; rr(44, y0 + 16, w, 34, 8); ctx.fill();
  ctx.fillStyle = dim ? "#c9c6d2" : "#ffffff"; ctx.fillText(label, 57, y0 + 34);
  ctx.restore();
}

function clockTop(t, m) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = "700 22px InterX"; ctx.letterSpacing = "6px"; ctx.fillStyle = "#f6b23a"; ctx.fillText("GLEICHE 24 STUNDEN", 540, 292);
  ctx.letterSpacing = "2px"; ctx.font = "900 104px InterX";
  ctx.fillStyle = "#ffbf47"; ctx.shadowColor = "rgba(255,170,60,0.45)"; ctx.shadowBlur = 24;
  ctx.fillText(hhmm(m), 540, 392);
  ctx.shadowBlur = 0;
  // Vorspul-Pfeile
  const f = t < T_TEXT1 ? 0.5 + 0.5 * Math.sin(t * 10) : 0.25;
  ctx.globalAlpha = f; ctx.fillStyle = "#ffbf47";
  for (const dx of [0, 22]) { ctx.beginPath(); ctx.moveTo(250 + dx, 336); ctx.lineTo(270 + dx, 350); ctx.lineTo(250 + dx, 364); ctx.fill(); }
  ctx.restore();
}

function finalText(t) {
  for (const [txt, y, t0] of [["Gleiche 24 Stunden.", TOP[1] - 70, T_TEXT1], ["Anderes Leben.", BOT[1] - 70, T_TEXT2]]) {
    const p = ramp(t, t0, t0 + 0.4);
    if (p <= 0) continue;
    ctx.save(); ctx.globalAlpha = easeOut(p);
    const g = ctx.createLinearGradient(0, y - 60, 0, y + 30);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(0,0,0,0.6)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(24, y - 60, W - 48, 90);
    ctx.font = "900 58px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffbf47";
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 10;
    ctx.translate(540, y - 14); const s = back(p); ctx.scale(s, s); ctx.fillText(txt, 0, 0);
    ctx.restore();
  }
}

let GRAIN = [];
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#07080d"; ctx.fillRect(0, 0, W, H);
  const m = minutesAt(t);
  clockTop(t, m);
  panel(TOP[0], TOP[1], "DISZIPLINIERT", sceneTop, t, m, false);
  panel(BOT[0], BOT[1], "FAUL", sceneBot, t, m, true);
  finalText(t);
  ctx.globalAlpha = 0.04; ctx.fillStyle = GRAIN[Math.floor(t * 10) % GRAIN.length]; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const fade = Math.max(1 - ramp(t, 0, 0.3), ramp(t, T_END - 0.8, T_END - 0.05));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  // Zeitpunkte, an denen sich die obere Szene ändert (für Wisch-Geräusche) + Ereignisse
  const bounds = [380, 520, 660, 1020, 1080, 1230, 1290, 1440, 1500];
  const at = mm => { for (let t = 0; t < DUR; t += 0.02) if (minutesAt(t) >= mm) return t; return DUR; };
  return { duration: DUR, cuts: bounds.map(at), alarm: 0.25, wakeLazy: at(750), couch: at(780), bedLazy: at(1376), sleepTop: at(1530),
    office: [at(690), at(1020)], code: [at(1080), at(1230)], party: [at(1290), at(1440)], gym: [at(1020), at(1080)], dog: at(1240),
    text: [T_TEXT1, T_TEXT2], minuteTicks: Array.from({ length: 60 }, (_, i) => i * 0.5).filter(x => x < T_TEXT1) };
};
window.setup = async function () {
  await Promise.all([document.fonts.load("900 37px InterX"), document.fonts.load("700 16px InterX")]);
  let seed = 41; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 6; k++) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d"); const im = x.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 120 + r() * 135; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); GRAIN.push(ctx.createPattern(c, "repeat"));
  }
  return { duration: DUR };
};
