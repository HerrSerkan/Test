// "SAME SONG. 3 different brains" – 1:1-Nachbau als Canvas-Szene.
// Gezeichnet im Raster 576x1024 (Originalauflösung), hochskaliert auf 1080x1920.
const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const S = 1080 / 576;
const DUR = 14.0;

// ---------- Zeitachse (Sekunden)
const T = {
  closeEyes: 2.0,       // alle schließen die Augen, Musik läuft
  bubbles1: [2.1, 2.45, 2.8], bubbles1Out: 4.65,
  build: 4.65,          // Aufbau: Gänsehaut, Farben nehmen zu
  drop: 7.35,           // Drop: CHILLS / WOAHHH
  dropOut: 10.65,
  bubbles3: [11.1, 11.6, 12.1],
  end: DUR,
};

// ---------- Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const easeOutBack = k => { const c = 1.9; k = clamp(k) - 1; return 1 + (c + 1) * k * k * k + c * k * k; };
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const BEAT = 60 / 128;

const COL = {
  bgTop: "#17122c", bgBot: "#100d20", floor: "#0e0c1b",
  cream: "#ece4dc", lav: "#c7b5f2",
  body: "#efe5ee", bodyShade: "#d8cddb", limb: "#aaa0b4", feet: "#b9aec0",
  band: "#3b3552", dot: "#b3a5cf",
  cups: ["#9c98aa", "#4fcbf2", "#f2639f"],
  spot: ["rgba(88,78,128,0.33)", "rgba(42,92,138,0.38)", "rgba(112,40,92,0.36)"],
  label: ["#e9e1e2", "#6fd6f6", "#f27fb2"],
  sub: "#9a93ad",
};
const PAL = ["#3fae6a", "#7b3fe4", "#c43ab2", "#e07a2a", "#c9c33f", "#2fb3b0", "#4452d6", "#d8435f", "#9b4fe0", "#58c26a"];
const CX = [88, 288, 488];

// ---------- Partikel (Farben der Synästhesie)
const parts = [];
(function makeParts() {
  const r = rnd(11);
  const add = (n, tA, tB, region, big) => {
    for (let i = 0; i < n; i++) {
      const tIn = lerp(tA, tB, r());
      const type = r() < 0.38 ? "tri" : r() < 0.6 ? "circ" : "squig";
      let x, y;
      if (region === "right") { x = lerp(360, 590, r()); y = lerp(330, 760, r()); }
      else if (region === "mid") { x = lerp(200, 590, r()); y = lerp(250, 800, r()); }
      else { x = lerp(-20, 596, r()); y = lerp(220, 820, r()); }
      parts.push({
        tIn, type, x, y,
        col: PAL[Math.floor(r() * PAL.length)],
        size: big && type === "circ" ? lerp(18, 40, r()) : lerp(7, 17, r()) * (big ? 1.3 : 1),
        rot: r() * 6.28, spin: (r() - 0.5) * 1.2,
        vx: (r() - 0.5) * 10, vy: -lerp(2, 9, r()),
        ph: r() * 6.28, alpha: big && type === "circ" ? lerp(0.45, 0.65, r()) : lerp(0.55, 0.85, r()),
        region,
      });
    }
  };
  add(7, 2.6, 4.4, "right");         // erste Farben bei "ooh, purple"
  add(22, 4.6, 7.2, "mid");          // Aufbau
  add(55, 7.3, 8.0, "all", true);    // Drop-Explosion
  add(14, 8.0, 10.4, "all", true);   // Nachschub im Drop
  // Lebensdauer: die meisten verschwinden nach dem Drop, ein Rest bleibt rechts
  for (const p of parts) {
    if (p.region === "right") p.tOut = 99;
    else if (p.region === "mid") p.tOut = p.x > 400 ? 99 : lerp(10.7, 11.3, (p.ph / 6.28));
    else p.tOut = p.x > 430 && p.size < 20 && p.ph < 2.0 ? 99 : lerp(10.6, 11.4, p.ph / 6.28);
  }
})();

// große, weiche Farbflächen im Drop
const blobs = [];
(function () {
  const r = rnd(5);
  for (let i = 0; i < 9; i++) blobs.push({ x: lerp(0, 576, r()), y: lerp(280, 780, r()), rad: lerp(50, 95, r()), col: PAL[Math.floor(r() * PAL.length)], ph: r() * 6.28, t0: 7.35 + r() * 0.6 });
})();

// Gänsehaut-Punkte auf dem mittleren Körper
const dots = [];
(function () {
  const r = rnd(3);
  while (dots.length < 48) {
    const u = r() * 2 - 1, v = r() * 2 - 1;
    if (u * u + v * v > 0.82) continue;
    dots.push({ u, v, rad: lerp(1.6, 2.8, r()), t: lerp(4.9, 7.6, r()) });
  }
  dots.sort((a, b) => a.t - b.t);
})();

// Musiknoten, die hochschweben
const notes = [];
(function () {
  const r = rnd(9);
  for (let i = 0; i < 12; i++) notes.push({ c: i % 3, dx: lerp(-80, 85, r()), t0: r() * 4, per: lerp(3, 4.5, r()), s: lerp(0.8, 1.1, r()) });
})();

// ---------- Zeichenbausteine
function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function noteGlyph(x, y, s, col, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.3 * s;
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 2.5, -0.4, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.moveTo(3, -1); ctx.lineTo(3, -12); ctx.quadraticCurveTo(5, -8, 8, -7); ctx.stroke();
  ctx.restore();
}

function shape(p, t) {
  const age = t - p.tIn;
  if (age < 0 || t > p.tOut + 0.35) return;
  let k = easeOutBack(age / 0.35);
  if (t > p.tOut) k *= 1 - (t - p.tOut) / 0.35;
  const drop = t > T.drop && t < T.dropOut ? 1 : 0;
  const x = p.x + p.vx * age + Math.sin(t * 1.3 + p.ph) * 6;
  const y = p.y + p.vy * age + Math.cos(t * 1.1 + p.ph) * 5 - drop * Math.abs(Math.sin((t - T.drop) * Math.PI / BEAT)) * 3;
  const s = p.size * k * (1 + drop * 0.12 * Math.sin(t * Math.PI * 2 / BEAT + p.ph));
  if (s <= 0.2) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + p.spin * t); ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.col; ctx.strokeStyle = p.col;
  if (p.type === "tri") {
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.95, s * 0.7); ctx.lineTo(-s * 0.95, s * 0.7); ctx.closePath(); ctx.fill();
  } else if (p.type === "circ") {
    ctx.beginPath(); ctx.arc(0, 0, s * 0.8, 0, 6.29); ctx.fill();
  } else {
    ctx.lineWidth = Math.max(2, s * 0.32); ctx.lineCap = "round"; ctx.beginPath();
    for (let i = 0; i <= 16; i++) { const u = i / 16; const xx = (u - 0.5) * s * 3; const yy = Math.sin(u * 6.28 + t * 2 + p.ph) * s * 0.4; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
  }
  ctx.restore();
}

// Armposen relativ zur Figurmitte (Körpermitte y=728). [Ellbogen, Hand] für den rechten Arm; links gespiegelt.
const POSE = {
  down: [[66, 722], [71, 780]],
  chest: [[62, 728], [22, 692]],
  out: [[66, 722], [96, 688]],
  up: [[64, 600], [76, 522]],
  hip: [[92, 698], [60, 738]],
};
function mixPose(a, b, k) { return [[lerp(a[0][0], b[0][0], k), lerp(a[0][1], b[0][1], k)], [lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k)]]; }

function arm(cx, side, pose, by) {
  const sh = [52, 668];
  ctx.beginPath();
  ctx.moveTo(cx + side * sh[0], sh[1] + by);
  ctx.lineTo(cx + side * pose[0][0], pose[0][1] + by);
  ctx.lineTo(cx + side * pose[1][0], pose[1][1] + by);
  ctx.strokeStyle = COL.limb; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
}

function eye(x, y, mode, look) {
  ctx.strokeStyle = "#2b2633"; ctx.fillStyle = "#2b2633"; ctx.lineCap = "round";
  if (mode === "open" || mode === "wide") {
    const r = mode === "wide" ? 8.5 : 7.2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fillStyle = "#fbf7f8"; ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = "#2b2633"; ctx.beginPath(); ctx.arc(x + (look || 0), y + 0.5, mode === "wide" ? 3.6 : 3.4, 0, 6.29); ctx.fill();
  } else if (mode === "happy") {        // ^ geschlossen, lächelnd
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y + 3, 7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  } else if (mode === "closed") {       // ‿ entspannt geschlossen
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y - 4, 7, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke();
  } else if (mode === "dash") {
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke();
  }
}

function mouth(x, y, mode, k) {
  ctx.strokeStyle = "#2b2633"; ctx.fillStyle = "#2b2633"; ctx.lineCap = "round"; ctx.lineWidth = 2.4;
  if (mode === "smile") { ctx.beginPath(); ctx.arc(x, y - 6, 9, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke(); }
  else if (mode === "flat") { ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke(); }
  else if (mode === "o") { ctx.beginPath(); ctx.ellipse(x, y + 1, 4 * (k || 1), 5.5 * (k || 1), 0, 0, 6.29); ctx.fill(); }
  else if (mode === "grin") {
    ctx.beginPath(); ctx.moveTo(x - 11, y - 3); ctx.quadraticCurveTo(x, y - 1, x + 11, y - 3); ctx.quadraticCurveTo(x, y + 14, x - 11, y - 3); ctx.fill();
    ctx.fillStyle = "#e86c86"; ctx.beginPath(); ctx.ellipse(x, y + 5.5, 5, 2.6, 0, 0, 6.29); ctx.fill();
  }
}

// Zustand jeder Figur zur Zeit t
function state(i, t) {
  const st = { eyes: "open", mouth: "smile", pose: POSE.down, look: 0, hairs: 0, rays: 0, dots: 0, shake: 0, bob: 1.2 };
  const drop = t >= T.drop && t < T.dropOut;
  const blink = (t0) => Math.abs(t - t0) < 0.07;
  if (i === 0) {          // MOST PEOPLE
    if (t >= T.closeEyes) st.eyes = "happy";
    if (drop) { st.mouth = "grin"; st.bob = 4.5; st.pose = POSE.down; }
    if (t >= T.dropOut) { st.eyes = "open"; st.mouth = t > 12.4 ? "flat" : "smile"; st.look = 1; }
    if (blink(0.9) || blink(12.9)) st.eyes = "dash";
  } else if (i === 1) {   // GET CHILLS
    if (t >= T.closeEyes) st.eyes = "closed";
    if (t >= T.build) { st.mouth = "o"; st.pose = mixPose(POSE.down, POSE.chest, ss(T.build, T.build + 0.5, t)); }
    st.dots = dots.filter(d => t >= d.t).length;
    st.hairs = ss(T.drop - 0.1, T.drop + 0.15, t);
    if (drop) { st.eyes = "wide"; st.rays = 1; st.shake = 1.1; st.bob = 2; }
    if (t >= T.dropOut) { st.eyes = "closed"; st.mouth = "smile"; st.hairs = 0.8; }
    if (blink(1.1)) st.eyes = "dash";
  } else {                // SEE COLORS
    if (t >= 2.6) st.eyes = "wide";
    if (t >= T.build) { st.mouth = "o"; st.pose = mixPose(POSE.down, POSE.out, ss(T.build, T.build + 0.5, t)); }
    if (drop) { st.mouth = "grin"; st.pose = mixPose(POSE.out, POSE.up, ss(T.drop, T.drop + 0.2, t)); st.bob = 4.5; }
    if (t >= T.dropOut) { st.mouth = "o"; st.pose = mixPose(POSE.up, POSE.out, ss(T.dropOut, T.dropOut + 0.3, t)); }
    if (t >= 12.1) st.eyes = "dash";
    st.look = Math.sin(t * 2.3) * 1.5 * (t > 2.6 && t < T.drop ? 1 : 0);
    if (blink(1.4)) st.eyes = "dash";
  }
  return st;
}

function character(i, t) {
  const cx = CX[i];
  const st = state(i, t);
  const beatPh = (t % BEAT) / BEAT;
  let by = -Math.abs(Math.sin(beatPh * Math.PI)) * st.bob * (t > 1.2 ? 1 : 0.4);
  let sx = st.shake ? Math.sin(t * 90) * st.shake : 0;
  ctx.save(); ctx.translate(sx, 0);

  // Schatten + Füße
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(cx, 826, 62, 6, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = COL.feet; rr(cx - 46, 807 + by * 0.3, 92, 15, 6); ctx.fill();

  // Körper
  const g = ctx.createLinearGradient(cx - 68, 0, cx + 68, 0);
  g.addColorStop(0, COL.body); g.addColorStop(0.62, COL.body); g.addColorStop(1, COL.bodyShade);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, 728 + by, 68, 92, 0, 0, 6.29); ctx.fill();

  // Gänsehaut
  if (st.dots) {
    ctx.fillStyle = COL.dot;
    for (let d = 0; d < st.dots; d++) {
      const p = dots[d], pk = clamp((t - p.t) / 0.15);
      ctx.beginPath(); ctx.arc(cx + p.u * 54, 735 + by + p.v * 72, p.rad * pk, 0, 6.29); ctx.fill();
    }
  }

  // Arme (beide Seiten)
  arm(cx, -1, i === 0 && t >= T.drop && t < T.dropOut ? mixPose(POSE.down, POSE.hip, ss(T.drop, T.drop + 0.2, t)) : st.pose, by);
  arm(cx, 1, st.pose, by);

  // Kopf
  const hy = 595 + by * 1.15;
  ctx.fillStyle = COL.body; ctx.beginPath(); ctx.arc(cx, hy, 44, 0, 6.29); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.beginPath(); ctx.arc(cx + 6, hy + 4, 40, -0.6, 1.6); ctx.fill();

  // aufgestellte Haare (Gänsehaut)
  if (st.hairs > 0) {
    ctx.strokeStyle = "rgba(120,110,140,0.85)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    for (let h = -4; h <= 4; h++) {
      const a = -Math.PI / 2 + h * 0.13, len = 10 * st.hairs + Math.sin(t * 40 + h) * 1.2 * st.rays;
      const x0 = cx + Math.cos(a) * 42, y0 = hy + Math.sin(a) * 42;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); ctx.stroke();
    }
  }
  if (st.rays) {
    ctx.strokeStyle = "rgba(240,235,245,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    const fl = Math.floor(t * 8) % 2;
    for (const a of [-2.55, -2.25, -0.9, -0.6, 3.05, 0.1]) {
      const r0 = 52 + fl * 3, r1 = 62 + fl * 3;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, hy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, hy + Math.sin(a) * r1); ctx.stroke();
    }
  }

  // Kopfhörer
  ctx.strokeStyle = COL.band; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, hy - 2, 49, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.fillStyle = COL.cups[i];
  rr(cx - 59, hy - 16, 18, 34, 7); ctx.fill(); rr(cx + 41, hy - 16, 18, 34, 7); ctx.fill();

  // Gesicht
  eye(cx - 15, hy + 1, st.eyes, st.look); eye(cx + 15, hy + 1, st.eyes, st.look);
  mouth(cx, hy + 22, st.mouth, st.mouth === "o" ? 1 + 0.12 * Math.sin(t * 9) : 1);
  ctx.restore();
}

function bubble(lines, cx, cy, tIn, t, opt = {}) {
  if (t < tIn) return;
  const k = easeOutBack((t - tIn) / 0.28);
  const out = opt.tOut !== undefined && t > opt.tOut ? clamp(1 - (t - opt.tOut) / 0.12) : 1;
  if (out <= 0) return;
  ctx.save();
  ctx.font = `${opt.weight || 700} ${opt.size || 18}px Pop`;
  const lh = (opt.size || 18) * 1.4;
  const w = opt.icon ? 50 : Math.max(...lines.map(l => ctx.measureText(l).width)) + 28;
  const h = lines.length * lh + 14;
  const tail = opt.tail !== undefined ? opt.tail : cx;
  ctx.translate(tail, cy + h / 2 + 8); ctx.scale(k * out, k * out); ctx.translate(-tail, -(cy + h / 2 + 8));
  ctx.fillStyle = "#fbf8f6";
  rr(cx - w / 2, cy - h / 2, w, h, 16); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tail - 7, cy + h / 2 - 1); ctx.lineTo(tail, cy + h / 2 + 8); ctx.lineTo(tail + 7, cy + h / 2 - 1); ctx.fill();
  ctx.fillStyle = "#16131c"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (opt.icon === "notes") { noteGlyph(cx - 7, cy + 4, 1.05, "#2b2633", 1); noteGlyph(cx + 5, cy + 3, 1.05, "#2b2633", 1); }
  else if (opt.icon === "dots") { ctx.fillText("…", cx, cy - 3); }
  else lines.forEach((l, j) => ctx.fillText(l, cx, cy + (j - (lines.length - 1) / 2) * lh + 1));
  ctx.restore();
}

function header(t) {
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COL.cream; ctx.font = "800 44px Pop"; ctx.fillText("SAME SONG.", 288, 69);
  ctx.fillStyle = COL.lav; ctx.font = "700 20px Pop"; ctx.fillText("3 different brains:", 288, 106);

  // Pille "now playing"
  ctx.fillStyle = "rgba(34,28,58,0.85)"; rr(165.5, 138.5, 245, 44, 22); ctx.fill();
  ctx.strokeStyle = "rgba(200,190,235,0.18)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = "#f39a2d"; rr(187, 151, 18, 18, 3); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(193, 155); ctx.lineTo(201, 160); ctx.lineTo(193, 165); ctx.fill();
  ctx.fillStyle = "#e9e2f0"; ctx.font = "600 16px Pop"; ctx.textAlign = "left"; ctx.fillText("now playing", 210, 166);

  // Equalizer
  const drop = t >= T.drop && t < T.dropOut, build = t >= T.build && t < T.drop;
  const energy = t < 1.2 ? 0.25 : drop ? 1 : build ? lerp(0.55, 0.85, (t - T.build) / (T.drop - T.build)) : 0.45;
  for (let b = 0; b < 10; b++) {
    const n = 0.5 + 0.5 * Math.sin(t * (7 + b * 1.7) + b * 2.1) * Math.sin(t * (3.1 + b * 0.6) + b);
    const h = 4 + n * 15 * energy + (drop ? 2 : 0);
    ctx.fillStyle = drop ? PAL[(b * 3 + Math.floor(t * 4)) % PAL.length] : "#f2cf5a";
    rr(312 + b * 8, 160 - h / 2, 4.2, h, 2); ctx.fill();
  }
}

function spotlights(t) {
  const drop = t >= T.drop && t < T.dropOut;
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 576, 830); ctx.clip();
    const pulse = drop ? 0.08 * Math.abs(Math.sin((t - T.drop) * Math.PI / BEAT)) : 0;
    const g = ctx.createLinearGradient(0, 360, 0, 830);
    g.addColorStop(0, COL.spot[i]); g.addColorStop(1, COL.spot[i].replace(/[\d.]+\)$/, m => (parseFloat(m) * 0.8 + pulse) + ")"));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(CX[i], 600, 102, 240, 0, 0, 6.29); ctx.fill();
    ctx.restore();
  }
}

function labels() {
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const L = ["MOST PEOPLE", "GET CHILLS", "SEE COLORS"], SUB = ["", "(FRISSON)", "(CHROMESTHESIA)"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = COL.label[i]; ctx.font = "700 15px Pop"; ctx.letterSpacing = "1px"; ctx.fillText(L[i], CX[i] - 2, 859);
    if (SUB[i]) { ctx.fillStyle = COL.sub; ctx.font = "600 11px Pop"; ctx.letterSpacing = "1.6px"; ctx.fillText(SUB[i], CX[i] - 1, 880); }
  }
  ctx.letterSpacing = "0px";
  // kleine Batterie unten rechts
  ctx.strokeStyle = "#8f88a6"; ctx.lineWidth = 1.5; rr(514, 919, 36, 17, 4); ctx.stroke();
  ctx.fillStyle = "#8f88a6"; rr(551, 924, 3, 7, 1); ctx.fill();
  ["#6e62aa", "#c7a14f", "#5f9f74"].forEach((c, k) => { ctx.fillStyle = c; rr(517 + k * 10.6, 922, 9, 11, 1.5); ctx.fill(); });
}

function frame(t) {
  ctx.setTransform(S, 0, 0, S, 0, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, COL.bgTop); bg.addColorStop(0.75, COL.bgBot); bg.addColorStop(1, "#0b0a16");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 576, 1024);

  // weiche Farbflächen (Drop)
  for (const b of blobs) {
    const a = ss(b.t0, b.t0 + 0.4, t) * (1 - ss(T.dropOut - 0.1, T.dropOut + 0.4, t));
    if (a <= 0) continue;
    ctx.globalAlpha = 0.22 * a; ctx.fillStyle = b.col;
    ctx.beginPath(); ctx.arc(b.x + Math.sin(t + b.ph) * 15, b.y + Math.cos(t * 0.8 + b.ph) * 12, b.rad * (1 + 0.06 * Math.sin(t * 6.7 + b.ph)), 0, 6.29); ctx.fill();
  }
  ctx.globalAlpha = 1;

  spotlights(t);

  // Boden
  ctx.fillStyle = COL.floor; ctx.fillRect(0, 830, 576, 194);
  ctx.fillStyle = "rgba(160,150,200,0.10)"; ctx.fillRect(0, 830, 576, 1);

  // Partikel hinter den Figuren
  for (const p of parts) if (p.size < 14 || p.type !== "circ") shape(p, t);

  // Musiknoten
  for (const n of notes) {
    const ph = ((t + n.t0) % n.per) / n.per;
    const a = Math.sin(ph * Math.PI) * 0.42 * (t > 0.6 ? 1 : t / 0.6);
    noteGlyph(CX[n.c] + n.dx + Math.sin(ph * 6 + n.t0) * 4, 540 - ph * 150, n.s, "#d8c07c", a);
  }

  for (let i = 0; i < 3; i++) character(i, t);

  // große Kreise vor den Figuren (wie im Original teils überlagernd)
  for (const p of parts) if (!(p.size < 14 || p.type !== "circ")) shape(p, t);

  header(t);
  labels();

  // Sprechblasen
  const o1 = { tOut: T.bubbles1Out }, o2 = { tOut: T.dropOut };
  bubble(["nice song"], 86, 437, T.bubbles1[0], t, o1);
  bubble([""], 288, 437, T.bubbles1[1], t, { ...o1, icon: "dots" });
  bubble(["ooh, purple"], 478, 437, T.bubbles1[2], t, o1);
  bubble([""], 86, 437, T.drop + 0.05, t, { ...o2, icon: "notes" });
  bubble(["CHILLS"], 288, 437, T.drop + 0.1, t, { ...o2, weight: 800, size: 19 });
  bubble(["WOAHHH"], 478, 431, T.drop + 0.15, t, { ...o2, weight: 800, size: 19 });
  bubble(["good song."], 86, 437, T.bubbles3[0], t);
  bubble(["again. now."], 288, 437, T.bubbles3[1], t);
  bubble(["wait… you guys", "don’t see the colors?"], 416, 341, T.bubbles3[2], t, { tail: 473 });
}

window.setup = async () => {
  await Promise.all([600, 700, 800].map(w => document.fonts.load(`${w} 20px Pop`)));
  return { duration: DUR };
};
window.renderFrame = frame;
window.exportEvents = () => ({ duration: DUR, ...T });
