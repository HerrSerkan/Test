// Gemeinsame Bausteine für die "GLEICHER …"-Reihe (drei Figuren nebeneinander).
// Zeichenraster 576x1024, wird auf 1080x1920 skaliert. Wird von <ordner>/scene.js genutzt.
(function () {
  const cv = document.getElementById("c");
  const ctx = cv.getContext("2d");
  const S = 1080 / 576;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
  const easeOutBack = k => { const c = 1.9; k = clamp(k) - 1; return 1 + (c + 1) * k * k * k + c * k * k; };
  function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const CX = [88, 288, 488];
  const FONT = "Pop, 'Noto Color Emoji'";

  const COL = {
    cream: "#ece4dc", lav: "#c7b5f2", body: "#efe5ee", bodyShade: "#d8cddb",
    limb: "#aaa0b4", feet: "#b9aec0", ink: "#2b2633", sub: "#9a93ad",
  };

  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // Armposen relativ zur Figurmitte: [Ellbogen, Hand] für den rechten Arm (x nach außen positiv).
  const POSE = {
    down: [[66, 722], [71, 780]],
    chest: [[62, 728], [22, 692]],
    out: [[66, 722], [96, 688]],
    outLow: [[74, 720], [100, 760]],
    up: [[64, 600], [76, 522]],
    hip: [[92, 698], [60, 738]],
    head: [[78, 610], [36, 572]],          // Hand an den Kopf
    headBack: [[84, 600], [40, 590]],      // Hände hinter dem Kopf
    phone: [[60, 735], [18, 700]],         // Handy vor dem Bauch
    bed: [[64, 700], [78, 716]],           // im Bett sitzend, Arme auf der Decke
    reach: [[92, 680], [130, 660]],        // zur Seite greifen
    point: [[80, 690], [122, 676]],        // zeigen
    wave: [[70, 700], [86, 668]],          // kleine Geste
  };
  const mixPose = (a, b, k) => [[lerp(a[0][0], b[0][0], k), lerp(a[0][1], b[0][1], k)], [lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k)]];
  // Pose-Übergang über eine Liste [[t, pose], ...] (je 0.25 s Überblendung)
  function poseAt(list, t, dur = 0.25) {
    let cur = list[0][1];
    for (let i = 1; i < list.length; i++) {
      if (t >= list[i][0]) cur = mixPose(list[i - 1][1] === cur ? cur : cur, list[i][1], ss(list[i][0], list[i][0] + dur, t));
    }
    return cur;
  }
  // Wert, der zu Zeitpunkten wechselt: [[t, wert], ...]
  function at(list, t) { let v = list[0][1]; for (const [k, x] of list) if (t >= k) v = x; return v; }

  function arm(cx, side, pose, by, col) {
    ctx.beginPath();
    ctx.moveTo(cx + side * 52, 668 + by);
    ctx.lineTo(cx + side * pose[0][0], pose[0][1] + by);
    ctx.lineTo(cx + side * pose[1][0], pose[1][1] + by);
    ctx.strokeStyle = col || COL.limb; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
  }

  function eye(x, y, mode, lx, ly) {
    ctx.strokeStyle = COL.ink; ctx.fillStyle = COL.ink; ctx.lineCap = "round";
    if (mode === "open" || mode === "wide") {
      const r = mode === "wide" ? 8.5 : 7.2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fillStyle = "#fbf7f8"; ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x + (lx || 0), y + 0.5 + (ly || 0), mode === "wide" ? 3.6 : 3.4, 0, 6.29); ctx.fill();
    } else if (mode === "happy") {
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y + 3, 7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (mode === "closed") {
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y - 4, 7, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke();
    } else if (mode === "dash") {
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke();
    } else if (mode === "squeeze") {        // > < zusammengekniffen
      ctx.lineWidth = 2.4; const d = x < 0 ? 1 : 1; ctx.beginPath();
      ctx.moveTo(x - 6, y - 4); ctx.lineTo(x + 5, y); ctx.lineTo(x - 6, y + 4); ctx.stroke();
    }
  }

  function brows(cx, hy, mode) {
    if (!mode) return;
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      if (mode === "worried") { ctx.moveTo(cx + s * 22, hy - 11); ctx.lineTo(cx + s * 9, hy - 16); }
      else if (mode === "raised") { ctx.arc(cx + s * 15, hy - 6, 9, Math.PI * 1.25, Math.PI * 1.75); }
      else if (mode === "flat") { ctx.moveTo(cx + s * 21, hy - 13); ctx.lineTo(cx + s * 9, hy - 13); }
      else if (mode === "angry") { ctx.moveTo(cx + s * 22, hy - 16); ctx.lineTo(cx + s * 8, hy - 11); }
      ctx.stroke();
    }
  }

  function mouth(x, y, mode, k) {
    ctx.strokeStyle = COL.ink; ctx.fillStyle = COL.ink; ctx.lineCap = "round"; ctx.lineWidth = 2.4;
    if (mode === "smile") { ctx.beginPath(); ctx.arc(x, y - 6, 9, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke(); }
    else if (mode === "flat") { ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke(); }
    else if (mode === "frown") { ctx.beginPath(); ctx.arc(x, y + 7, 8, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke(); }
    else if (mode === "o") { ctx.beginPath(); ctx.ellipse(x, y + 1, 4 * (k || 1), 5.5 * (k || 1), 0, 0, 6.29); ctx.fill(); }
    else if (mode === "talk") { ctx.beginPath(); ctx.ellipse(x, y + 1, 5, 2 + 3.5 * (k || 1), 0, 0, 6.29); ctx.fill(); }
    else if (mode === "grin") {
      ctx.beginPath(); ctx.moveTo(x - 11, y - 3); ctx.quadraticCurveTo(x, y - 1, x + 11, y - 3); ctx.quadraticCurveTo(x, y + 14, x - 11, y - 3); ctx.fill();
      ctx.fillStyle = "#e86c86"; ctx.beginPath(); ctx.ellipse(x, y + 5.5, 5, 2.6, 0, 0, 6.29); ctx.fill();
    } else if (mode === "teeth") {
      ctx.fillStyle = "#fbf7f8"; rr(x - 11, y - 5, 22, 11, 5); ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 10, y + 0.5); ctx.lineTo(x + 10, y + 0.5); ctx.stroke();
    } else if (mode === "wobble") {
      ctx.beginPath(); for (let i = 0; i <= 8; i++) { const xx = x - 8 + i * 2; const yy = y + Math.sin(i * 1.6) * 1.6; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    }
  }

  // Eine Figur. o: {x, eyes, mouth, brows, look:[x,y], armL, armR, jump, bob, shake, sweat, alarm, blush,
  //                hairs, mouthK, body, limb, lean}
  function figure(o, t) {
    const cx = o.x;
    const by = (o.bob || 0) - (o.jump || 0);
    const sx = o.shake ? Math.sin(t * 90) * o.shake : 0;
    ctx.save(); ctx.translate(sx, 0);
    if (o.lean) { ctx.translate(cx, 822); ctx.rotate(o.lean); ctx.translate(-cx, -822); }
    if (!o.noFeet) {
      ctx.fillStyle = "rgba(0,0,0,0.32)"; ctx.beginPath(); ctx.ellipse(cx, 826, 62 * (1 - (o.jump || 0) / 120), 6, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = o.feet || COL.feet; rr(cx - 46, 807 + by, 92, 15, 6); ctx.fill();
    }
    if (o.behind) o.behind(cx, by);
    const g = ctx.createLinearGradient(cx - 68, 0, cx + 68, 0);
    g.addColorStop(0, o.body || COL.body); g.addColorStop(0.62, o.body || COL.body); g.addColorStop(1, o.bodyShade || COL.bodyShade);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, 728 + by, 68, 92, 0, 0, 6.29); ctx.fill();
    if (o.onBody) o.onBody(cx, by);
    if (o.cover) o.cover(cx, by);               // Decke etc. zwischen Körper und Armen
    arm(cx, -1, o.armL || POSE.down, by, o.limb);
    arm(cx, 1, o.armR || POSE.down, by, o.limb);
    if (o.front) o.front(cx, by);               // Dinge in der Hand
    const hy = 595 + by * 1.1;
    ctx.fillStyle = o.body || COL.body; ctx.beginPath(); ctx.arc(cx, hy, 44, 0, 6.29); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.beginPath(); ctx.arc(cx + 6, hy + 4, 40, -0.6, 1.6); ctx.fill();
    if (o.hairs) {
      ctx.strokeStyle = "rgba(120,110,140,0.85)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      for (let h = -4; h <= 4; h++) { const a = -Math.PI / 2 + h * 0.13, len = 10 * o.hairs; const x0 = cx + Math.cos(a) * 42, y0 = hy + Math.sin(a) * 42; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len); ctx.stroke(); }
    }
    if (o.headExtra) o.headExtra(cx, hy);
    const lk = o.look || [0, 0];
    eye(cx - 15, hy + 1, o.eyes || "open", lk[0], lk[1]); eye(cx + 15, hy + 1, o.eyes || "open", lk[0], lk[1]);
    brows(cx, hy, o.brows);
    if (o.blush) { ctx.fillStyle = "rgba(240,120,150,0.55)"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 27, hy + 13, 7, 4.5, 0, 0, 6.29); ctx.fill(); } }
    mouth(cx, hy + 22, o.mouth || "smile", o.mouthK);
    if (o.sweat) { ctx.fillStyle = "#7fc6f2"; ctx.beginPath(); ctx.moveTo(cx + 33, hy - 4); ctx.quadraticCurveTo(cx + 39, hy + 6, cx + 33, hy + 8); ctx.quadraticCurveTo(cx + 27, hy + 6, cx + 33, hy - 4); ctx.fill(); }
    if (o.alarm) {
      ctx.strokeStyle = o.alarmCol || "#f2c94c"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      const f = 1 + 0.15 * Math.sin(t * 30);
      for (const a of [-2.6, -2.15, -0.95, -0.5, 3.1, 0.05]) {
        const r0 = 54 * f, r1 = 66 * f;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, hy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, hy + Math.sin(a) * r1); ctx.stroke();
      }
    }
    if (o.after) o.after(cx, hy);
    ctx.restore();
  }

  function bubble(lines, cx, cy, tIn, t, opt = {}) {
    if (t < tIn) return;
    const out = opt.tOut !== undefined ? (t > opt.tOut ? clamp(1 - (t - opt.tOut) / 0.12) : 1) : 1;
    if (out <= 0) return;
    const k = easeOutBack((t - tIn) / 0.28);
    ctx.save();
    const size = opt.size || 17;
    ctx.font = `${opt.weight || 700} ${size}px ${FONT}`;
    const lh = size * 1.32;
    const w = Math.max(opt.minW || 0, Math.max(...lines.map(l => ctx.measureText(l).width)) + 28);
    const h = lines.length * lh + 13;
    let tail = opt.tail !== undefined ? opt.tail : cx;
    cx = clamp(cx, w / 2 + 5, 571 - w / 2);              // nicht aus dem Bild ragen
    tail = clamp(tail, cx - w / 2 + 16, cx + w / 2 - 16);
    const tipY = cy + h / 2 + 8;
    ctx.translate(tail, tipY); ctx.scale(k * out, k * out); ctx.translate(-tail, -tipY);
    ctx.fillStyle = "#fbf8f6";
    rr(cx - w / 2, cy - h / 2, w, h, Math.min(17, h / 2)); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tail - 7, cy + h / 2 - 1); ctx.lineTo(tail, tipY); ctx.lineTo(tail + 7, cy + h / 2 - 1); ctx.fill();
    ctx.fillStyle = "#16131c"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    lines.forEach((l, j) => ctx.fillText(l, cx, cy + (j - (lines.length - 1) / 2) * lh + 1));
    ctx.restore();
  }

  // großes Comic-Wort (BUMM!, *KLICK* …)
  function popText(txt, x, y, tIn, tOut, t, opt = {}) {
    if (t < tIn || t > tOut + (opt.fade || 0.5)) return;
    let k = easeOutBack((t - tIn) / 0.22);
    let a = t > tOut ? 1 - (t - tOut) / (opt.fade || 0.5) : 1;
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x, y); ctx.rotate(opt.rot || -0.1); ctx.scale(k, k);
    if (opt.shake) ctx.translate(Math.sin(t * 70) * opt.shake * clamp(1 - (t - tIn) / 0.6), 0);
    ctx.font = `${opt.italic ? "italic " : ""}${opt.weight || 800} ${opt.size || 50}px ${FONT}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (opt.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = opt.strokeW || 7; ctx.strokeStyle = opt.stroke; ctx.strokeText(txt, 0, 0); }
    if (opt.shadow) { ctx.fillStyle = opt.shadow; ctx.fillText(txt, 3, 4); }
    ctx.fillStyle = opt.fill || "#f6d36d"; ctx.fillText(txt, 0, 0);
    ctx.restore();
  }

  function header(title, sub, opt = {}) {
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    let size = opt.size || 44;
    ctx.font = `800 ${size}px Pop`;
    while (ctx.measureText(title).width > 520 && size > 26) { size--; ctx.font = `800 ${size}px Pop`; }
    ctx.fillStyle = opt.titleCol || COL.cream; ctx.fillText(title, 288, 69);
    ctx.fillStyle = opt.subCol || COL.lav; ctx.font = "700 20px Pop"; ctx.fillText(sub, 288, 106);
  }

  function labels(L, SUB, cols, opt = {}) {
    ctx.save();
    if (opt.alpha !== undefined) ctx.globalAlpha = opt.alpha;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    for (let i = 0; i < 3; i++) {
      let size = 15; ctx.letterSpacing = "1px"; ctx.font = `700 ${size}px Pop`;
      while (ctx.measureText(L[i]).width > 182 && size > 11) { size -= 0.5; ctx.font = `700 ${size}px Pop`; }
      ctx.fillStyle = cols[i]; ctx.fillText(L[i], CX[i] - 2, opt.y || 859);
      if (SUB[i]) {
        let s2 = 11; ctx.letterSpacing = "1.6px"; ctx.font = `600 ${s2}px Pop`;
        while (ctx.measureText(SUB[i]).width > 180 && s2 > 8) { s2 -= 0.5; ctx.font = `600 ${s2}px Pop`; }
        ctx.fillStyle = COL.sub; ctx.fillText(SUB[i], CX[i] - 1, (opt.y || 859) + 21);
      }
    }
    ctx.letterSpacing = "0px";
    ctx.strokeStyle = "#8f88a6"; ctx.lineWidth = 1.5; rr(514, 919, 36, 17, 4); ctx.stroke();
    ctx.fillStyle = "#8f88a6"; rr(551, 924, 3, 7, 1); ctx.fill();
    ["#6e62aa", "#c7a14f", "#5f9f74"].forEach((c, k) => { ctx.fillStyle = c; rr(517 + k * 10.6, 922, 9, 11, 1.5); ctx.fill(); });
    ctx.restore();
  }

  function begin() { ctx.setTransform(S, 0, 0, S, 0, 0); ctx.globalAlpha = 1; }

  async function loadFonts() {
    await Promise.all([600, 700, 800].map(w => document.fonts.load(`${w} 20px Pop`)));
    await document.fonts.load("20px 'Noto Color Emoji'", "😌😭😍😴");
  }

  window.SL = { ctx, S, CX, COL, POSE, FONT, clamp, lerp, ss, easeOutBack, rnd, rr, mixPose, poseAt, at, figure, bubble, popText, header, labels, begin, loadFonts };
})();
