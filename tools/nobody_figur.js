// Gemeinsame Bausteine für die Videos im Stil von @nobodytoldme_1 (runde Figuren, Titel unter der Szene).
// Einbinden in scene.html vor scene.js:  <script src="../tools/nobody_figur.js"></script>
// Alles hängt an window.NB; Zeichnen auf NB.ctx (in setup() setzen).
"use strict";
(function () {
  const NB = {};
  NB.ctx = null;
  NB.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  NB.ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : NB.clamp((t - a) / (b - a)));
  NB.easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  NB.easeOut = x => 1 - Math.pow(1 - NB.clamp(x), 3);
  NB.back = x => { x = NB.clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  NB.lerp = (a, b, k) => a + (b - a) * k;
  NB.keys = function (K, t) {
    if (t <= K[0][0]) return K[0].slice(1);
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) {
      const a = K[i - 1], b = K[i], k = NB.easeIO((t - a[0]) / (b[0] - a[0]));
      return a.slice(1).map((v, j) => NB.lerp(v, b[j + 1], k));
    }
    return K[K.length - 1].slice(1);
  };
  NB.stateAt = (L, t) => { let v = L[0][1]; for (const [a, s] of L) if (t >= a) v = s; return v; };
  NB.rng = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  NB.rr = function (x, y, w, h, r) {
    const c = NB.ctx; r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };

  // ---------------------------------------------------------------- Figur
  const BODY = "#efe8dd", SHADE = "#d6ccbd", ARM = "#cfc8bd", INK = "#3a3230";
  NB.INK = INK;
  function eyes(kind, side) {
    const c = NB.ctx, lx = -22, rx = 22, y = -6;
    c.lineCap = "round"; c.strokeStyle = INK; c.fillStyle = INK; c.lineWidth = 4;
    if (kind === "happy" || kind === "love" || kind === "bliss" || kind === "awe") {
      for (const x of [lx, rx]) { c.beginPath(); c.arc(x, y + 6, 10, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); }
      return;
    }
    if (kind === "calm" || kind === "tired") {
      for (const x of [lx, rx]) { c.beginPath(); c.arc(x, y - 2, 10, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
      return;
    }
    const big = kind === "hope" || kind === "shock" || kind === "worried" || kind === "curious";
    for (const x of [lx, rx]) {
      c.fillStyle = "#fff"; c.beginPath(); c.ellipse(x, y, big ? 12 : 11, big ? 14 : 11, 0, 0, 7); c.fill();
      c.lineWidth = 2.5; c.stroke();
      const py = kind === "zone" ? -3 : 1;
      c.fillStyle = INK; c.beginPath(); c.arc(x + side * 4, y + py, kind === "zone" ? 4 : 5, 0, 7); c.fill();
      if (kind === "neutral" || kind === "side" || kind === "whistle" || kind === "squint" || kind === "smug" || kind === "think") {
        const lid = kind === "squint" || kind === "smug" ? 7 : 4;
        c.fillStyle = BODY; c.beginPath(); c.ellipse(x, y - lid, 13, 9, 0, Math.PI, 0); c.fill();
        c.lineWidth = 3; c.beginPath(); c.moveTo(x - 12, y - lid + 1); c.lineTo(x + 12, y - lid + 1); c.stroke();
      }
    }
  }
  NB.face = function (kind, side = 0) {
    const c = NB.ctx;
    eyes(kind, side);
    c.strokeStyle = INK; c.fillStyle = INK; c.lineWidth = 4; c.lineCap = "round";
    const my = 24;
    if (kind === "worried") { c.beginPath(); c.moveTo(-34, -30); c.lineTo(-12, -36); c.moveTo(34, -30); c.lineTo(12, -36); c.stroke(); }
    if (kind === "annoyed" || kind === "squint") { c.beginPath(); c.moveTo(-34, -32); c.lineTo(-12, -26); c.moveTo(34, -32); c.lineTo(12, -26); c.stroke(); }
    if (kind === "curious") { c.beginPath(); c.moveTo(-34, -34); c.lineTo(-12, -38); c.stroke(); }
    switch (kind) {
      case "smile": case "calm": c.beginPath(); c.arc(0, my - 10, 13, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); break;
      case "happy": case "love": case "bliss": c.beginPath(); c.arc(0, my - 12, 15, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
        c.fillStyle = "rgba(240,120,140,0.35)"; for (const x of [-34, 34]) { c.beginPath(); c.ellipse(x, 10, 10, 6, 0, 0, 7); c.fill(); } break;
      case "awe": c.beginPath(); c.ellipse(0, my, 7, 9, 0, 0, 7); c.fill();
        c.fillStyle = "rgba(240,120,140,0.4)"; for (const x of [-34, 34]) { c.beginPath(); c.ellipse(x, 10, 10, 6, 0, 0, 7); c.fill(); } break;
      case "hope": case "curious": c.beginPath(); c.ellipse(0, my, 6, 7, 0, 0, 7); c.fill(); break;
      case "worried": c.beginPath(); c.moveTo(-14, my); c.quadraticCurveTo(-7, my - 6, 0, my); c.quadraticCurveTo(7, my + 6, 14, my); c.stroke(); break;
      case "annoyed": case "tired": c.beginPath(); c.moveTo(-13, my + 2); c.lineTo(13, my - 2); c.stroke(); break;
      case "neutral": case "side": case "zone": case "think": c.beginPath(); c.moveTo(-11, my); c.lineTo(11, my); c.stroke(); break;
      case "shock": c.beginPath(); c.ellipse(0, my + 2, 8, 10, 0, 0, 7); c.fill(); break;
      case "whistle": c.lineWidth = 3.5; c.beginPath(); c.arc(10, my, 6, 0, 7); c.stroke(); break;
      case "squint": c.beginPath(); c.moveTo(-12, my); c.lineTo(12, my); c.stroke(); break;
      case "smug": c.beginPath(); c.moveTo(-12, my + 2); c.quadraticCurveTo(4, my + 8, 14, my - 4); c.stroke(); break;
    }
  };
  function arm(sx, sy, ang, side, len = 105) {
    const c = NB.ctx, a = ang * Math.PI / 180;
    const ex = sx + Math.sin(a) * len * side, ey = sy + Math.cos(a) * len;
    c.strokeStyle = ARM; c.lineWidth = 24; c.lineCap = "round";
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = "rgba(0,0,0,0.08)"; c.lineWidth = 3; c.stroke();
    return [ex, ey];
  }
  // Figur: Füße bei (x, y). o: {lean, aR, aL (Grad, 0 = hängt; negativ = hinter dem Körper), face, side, s, walk, t, sit, badge, goose, tint}
  NB.blob = function (x, y, o = {}) {
    const c = NB.ctx, t = o.t || 0, s = o.s || 1;
    c.save();
    c.translate(x, y); c.scale(s, s);
    if (!o.sit) {
      c.fillStyle = "rgba(0,0,0,0.25)"; c.beginPath(); c.ellipse(0, 4, 78, 12, 0, 0, 7); c.fill();
      const step = o.walk ? Math.sin(t * 8 + (o.ph || 0)) : 0;
      c.fillStyle = "#bdb4a8";
      NB.rr(-42, -16 - Math.max(0, step) * 12, 38, 18, 9); c.fill();
      NB.rr(4, -16 - Math.max(0, -step) * 12, 38, 18, 9); c.fill();
      if (o.walk) c.translate(0, -Math.abs(Math.cos(t * 8 + (o.ph || 0))) * 7);
    }
    if (o.shiver) c.translate(Math.sin(t * 70) * 2.5, 0);
    c.rotate((o.lean || 0) * Math.PI / 180);
    const bh = o.sit ? 170 : 220, bw = 74, by = -14;
    const aR = o.aR ?? 8, aL = o.aL ?? 8;
    let hands = {};
    if (aR < 0) hands.R = arm(bw - 14, by - bh * 0.62, -aR, -1);
    if (aL < 0) hands.L = arm(-bw + 14, by - bh * 0.62, -aL, 1);
    c.beginPath();
    c.moveTo(0, by - bh);
    c.bezierCurveTo(bw * 0.95, by - bh, bw * 1.1, by - bh * 0.35, bw, by - bh * 0.1);
    c.bezierCurveTo(bw * 0.9, by, -bw * 0.9, by, -bw, by - bh * 0.1);
    c.bezierCurveTo(-bw * 1.1, by - bh * 0.35, -bw * 0.95, by - bh, 0, by - bh);
    c.closePath();
    c.fillStyle = BODY; c.fill();
    c.save(); c.clip(); c.fillStyle = SHADE; c.globalAlpha = 0.6; c.beginPath(); c.ellipse(bw * 0.95, by - bh * 0.45, 38, bh * 0.75, 0, 0, 7); c.fill(); c.restore();
    if (o.goose > 0) {          // Gänsehaut: kleine Stacheln am Rand
      c.save(); c.strokeStyle = `rgba(150,140,128,${o.goose})`; c.lineWidth = 2;
      const R = NB.rng(5);
      for (let i = 0; i < 70; i++) {
        const u = i / 70, side2 = i % 2 ? 1 : -1;
        const yy = by - bh * (0.08 + 0.85 * R()), xx = side2 * bw * (0.92 + 0.12 * Math.sin(u * 9)) * Math.sqrt(1 - Math.pow((yy - (by - bh * 0.45)) / (bh * 0.62), 2) || 0);
        c.beginPath(); c.moveTo(xx * 0.9, yy); c.lineTo(xx * 1.02 + side2 * 6, yy - 3); c.stroke();
      }
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(160,150,135,${0.6 * o.goose})`; c.beginPath(); c.arc((R() - 0.5) * bw * 1.4, by - bh * (0.1 + 0.75 * R()), 1.6, 0, 7); c.fill(); }
      c.restore();
    }
    if (o.badge) {
      c.fillStyle = o.badge.col; c.beginPath(); c.arc(0, by - bh * 0.32, 26 * (o.badge.s ?? 1), 0, 7); c.fill();
      c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 3; c.stroke();
      c.fillStyle = "#fff"; c.font = "900 30px InterBlk"; c.textAlign = "center"; c.textBaseline = "middle";
      if ((o.badge.s ?? 1) > 0.3) c.fillText(o.badge.l, 0, by - bh * 0.32 + 2);
    }
    if (aR >= 0) hands.R = arm(bw - 10, by - bh * 0.66, aR, 1, o.armLenR || 105);
    if (aL >= 0) hands.L = arm(-bw + 10, by - bh * 0.66, aL, -1, o.armLenL || 105);
    const hy = by - bh - 50;
    c.fillStyle = BODY; c.beginPath(); c.arc(0, hy, 56, 0, 7); c.fill();
    c.save(); c.beginPath(); c.arc(0, hy, 56, 0, 7); c.clip(); c.fillStyle = SHADE; c.globalAlpha = 0.5; c.beginPath(); c.arc(28, hy + 10, 48, 0, 7); c.fill(); c.restore();
    if (o.earbuds) { c.fillStyle = "#ffffff"; c.strokeStyle = INK; c.lineWidth = 2; for (const ex of [-54, 54]) { c.beginPath(); c.arc(ex, hy + 6, 7, 0, 7); c.fill(); c.stroke(); } }
    c.save(); c.translate(0, hy); NB.face(o.face || "neutral", o.side || 0); c.restore();
    if (o.sweat) { c.fillStyle = "#8fc8ff"; c.beginPath(); c.moveTo(48, hy - 30); c.quadraticCurveTo(60, hy - 12, 48, hy - 8); c.quadraticCurveTo(38, hy - 12, 48, hy - 30); c.fill(); }
    c.restore();
    const rad = (o.lean || 0) * Math.PI / 180;
    const toWorld = p => p && [x + s * (p[0] * Math.cos(rad) - p[1] * Math.sin(rad)), y + s * (p[0] * Math.sin(rad) + p[1] * Math.cos(rad))];
    return { headX: x + Math.sin(rad) * s * (bh + 64), headY: y - s * (14 + bh + 50), handR: toWorld(hands.R), handL: toWorld(hands.L) };
  };

  // ---------------------------------------------------------------- Schilder, Blasen, Titel
  NB.label = function (txt, x, y, size = 26) {
    const c = NB.ctx; c.save(); c.font = `900 ${size}px InterBlk`; c.letterSpacing = `${size * 0.1}px`;
    const w = c.measureText(txt).width + 24;
    c.fillStyle = "rgba(20,14,16,0.85)"; NB.rr(x - w / 2, y - size * 0.78, w, size * 1.55, 10); c.fill();
    c.fillStyle = "#f2ece2"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, x + 1.5, y + 1);
    c.restore();
  };
  // Sprechblase mit Spitze nach unten zu (tx, ty); Text in Zeilen
  NB.bubble = function (lines, x, y, tx, ty, p, size = 34) {
    if (p <= 0) return;
    const c = NB.ctx; c.save();
    c.font = `900 ${size}px InterBlk`;
    const w = Math.max(...lines.map(l => c.measureText(l).width)) + 44, h = lines.length * size * 1.15 + 30;
    x = NB.clamp(x, 40 + w / 2, 900 - w / 2);
    c.translate(x, y); const s = NB.back(Math.min(1, p * 1.3)); c.scale(s, s); c.globalAlpha = NB.clamp(p * 3);
    c.fillStyle = "#ffffff"; c.strokeStyle = INK; c.lineWidth = 4;
    NB.rr(-w / 2, -h / 2, w, h, 26); c.fill(); c.stroke();
    c.beginPath(); const bx = NB.clamp(tx - x, -w / 2 + 30, w / 2 - 30);
    c.moveTo(bx - 14, h / 2 - 2); c.lineTo(bx + (tx - x) * 0.15, h / 2 + 26); c.lineTo(bx + 14, h / 2 - 2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(bx - 14, h / 2); c.lineTo(bx + (tx - x) * 0.15, h / 2 + 26); c.lineTo(bx + 14, h / 2); c.stroke();
    c.fillStyle = INK; c.textAlign = "center"; c.textBaseline = "middle";
    lines.forEach((l, i) => c.fillText(l, 0, -h / 2 + 15 + size * 0.6 + i * size * 1.15));
    c.restore();
  };
  NB.heart = function (x, y, s, a) {
    const c = NB.ctx; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
    c.fillStyle = "#f2557a";
    c.beginPath(); c.moveTo(0, 10); c.bezierCurveTo(-26, -8, -14, -30, 0, -16); c.bezierCurveTo(14, -30, 26, -8, 0, 10); c.fill();
    c.restore();
  };
  NB.note = function (x, y, a, col = "#f6e7b8", s = 1) {
    const c = NB.ctx; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 4;
    c.beginPath(); c.ellipse(0, 0, 9, 7, -0.4, 0, 7); c.fill();
    c.beginPath(); c.moveTo(8, -2); c.lineTo(8, -34); c.quadraticCurveTo(20, -26, 22, -16); c.stroke();
    c.restore();
  };
  // Zweizeiliger Titel unter der Szene; wechselt bei sw auf die Pointe
  NB.title = function (t, sw, first, second, x, y) {
    const c = NB.ctx;
    const lines = t < sw ? first : second;
    const p = t < sw ? 1 - NB.ramp(t, sw - 0.12, sw) : NB.back(NB.ramp(t, sw, sw + 0.25));
    c.save(); c.textAlign = "center"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
    c.globalAlpha = t < sw ? 1 - NB.ramp(t, sw - 0.12, sw) : NB.clamp(NB.ramp(t, sw, sw + 0.15));
    let yy = y;
    for (const [txt, size, col] of lines) {
      c.save(); c.translate(x, yy); c.scale(p, p);
      c.font = `900 ${size}px InterBlk`;
      c.lineWidth = 10; c.strokeStyle = "rgba(20,10,20,0.9)"; c.strokeText(txt, 0, 0);
      c.fillStyle = col; c.fillText(txt, 0, 0);
      c.restore();
      yy += size * 1.14;
    }
    if (t > sw && t < sw + 0.6) {
      const u = (t - sw) / 0.6;
      for (let i = 0; i < 12; i++) {
        const an = i / 12 * Math.PI * 2;
        c.fillStyle = `rgba(244,183,64,${1 - u})`;
        c.beginPath(); c.arc(x + Math.cos(an) * (200 + 160 * u), y + 30 + Math.sin(an) * (40 + 60 * u), 4, 0, 7); c.fill();
      }
    }
    c.restore();
  };
  window.NB = NB;
})();
