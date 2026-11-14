// Bausteine aus Tag 11 (mars11/tag11.js), unverändert übernommen bis auf TAG-Nummer und Bordkarten-Abriss
function box(w, h, c, x0 = 0, r = 5, yb = 0) { ctx.fillStyle = c; rr(x0 - w / 2, yb - h, w, h, r); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(x0 - w / 2, yb - h, w, h, r); ctx.clip(); ctx.fillStyle = "rgba(0,0,0,0.10)"; ctx.fillRect(x0 + w * 0.2, yb - h, w, h); ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(x0 - w / 2, yb - h, w, 5); ctx.restore(); rr(x0 - w / 2, yb - h, w, h, r); ctx.stroke(); }
function tri(w, yb, h, c, x0 = 0) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0 - w / 2, yb); ctx.lineTo(x0, yb - h); ctx.lineTo(x0 + w / 2, yb); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function flat(w, yb, c = "#3a3f4e", h = 12, x0 = 0) { ctx.fillStyle = c; rr(x0 - w / 2, yb - h, w, h, 4); ctx.fill(); ctx.stroke(); }
function win(wx, wy, t, w = 16, h = 14) { const g = 0.75 + 0.25 * Math.sin(t * 2 + wx); ctx.fillStyle = `rgb(255,${Math.round(225 * g + 20)},140)`; rr(wx - w / 2, wy - h / 2, w, h, 3); ctx.fill(); ctx.stroke(); }
function door(dx, w = 14, h = 24, c = "#6b3f1e") { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(dx - w / 2, 0); ctx.lineTo(dx - w / 2, -h + w / 2); ctx.arc(dx, -h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(dx + w / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function sgn(txt, sy, bg = "#2a2a30", fg = GOLD, sz = 9, x0 = 0) { ctx.font = `900 ${sz}px InterX`; const w = ctx.measureText(txt).width + 10; ctx.fillStyle = bg; rr(x0 - w / 2, sy - sz * 0.8, w, sz * 1.6, 3); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 3; ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x0, sy + 0.5); }
function emo(e, ex, ey, sz = 18) { ctx.font = `${sz}px 'Noto Color Emoji'`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, ex, ey); }
function pole(x, h, yb = 0) { ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x, yb - h); ctx.stroke(); }
function wave(x, y, c = "#e5262b", t = 0, w = 14) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + 5 + Math.sin(t * 5) * 2); ctx.lineTo(x, y + 10); ctx.fill(); }
function eye(x, y, r = 3) { circle(x, y, r, "#fff"); circle(x + r * 0.2, y + r * 0.1, r * 0.5, INK); }
function bld(k, x, y, s, t, lt = 9) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(70,20,70,0.25)"; ctx.beginPath(); ctx.ellipse(0, 2, k === "stadion" || k === "schule" ? 64 : 46, 6, 0, 0, Math.PI * 2); ctx.fill();
  switch (k) {
    case "stadion": {
      ctx.fillStyle = "#e9edf5"; ctx.beginPath(); ctx.moveTo(-62, 0); ctx.lineTo(-68, -34); ctx.quadraticCurveTo(0, -56, 68, -34); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let i = -3; i <= 3; i++) { ctx.fillStyle = i % 2 ? "#ff4f8b" : "#3fd3f2"; ctx.fillRect(i * 17 - 6, -30 - (9 - i * i) * 0.9, 12, 5); }
      ctx.fillStyle = "#3bb273"; ctx.beginPath(); ctx.ellipse(0, -14, 50, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(0, -1); ctx.moveTo(8, -14); ctx.arc(0, -14, 8, 0, Math.PI * 2); ctx.stroke(); ctx.strokeRect(34, -20, 10, 12); ctx.strokeRect(-44, -20, 10, 12); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (const d of [-1, 1]) { pole(d * 58, 84); ctx.fillStyle = "#3a3f4e"; rr(d * 58 - 9, -92, 18, 10, 3); ctx.fill(); ctx.stroke(); if (lt > 0.3) { const a = 0.55 + 0.15 * Math.sin(t * 20); ctx.fillStyle = `rgba(255,250,190,${a * 0.5})`; ctx.beginPath(); ctx.moveTo(d * 58, -84); ctx.lineTo(d * 10, -8); ctx.lineTo(d * -30, -8); ctx.closePath(); ctx.fill(); circle(d * 58, -86, 4, "#fffbd0"); } }
      if (lt > 0.35) { const u = ((lt - 0.35) / 0.7) % 1; emo("⚽", lerp(-36, 38, u), -18 - Math.sin(Math.PI * u) * 38, 11); }
      sgn("STADION", -46, "#1c2f6b", "#fff", 8);
      break; }
    case "militaer": {
      box(92, 34, "#6f8f5a"); for (const [bx, by, br] of [[-30, -20, 9], [5, -12, 11], [30, -24, 8], [-8, -28, 6]]) { ctx.fillStyle = "#4f6b40"; ctx.beginPath(); ctx.ellipse(bx, by, br, br * 0.6, 0.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = "#1c2416"; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(4, -14); ctx.arc(22, -14, 18, Math.PI, 0); ctx.lineTo(40, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      box(22, 62, "#7d9c66", -32, 4); win(-32, -44, t, 14, 8); ctx.save(); ctx.translate(-32, -64); ctx.rotate(Math.sin(t * 3) * 0.6); ctx.fillStyle = "#cfd6dc"; ctx.beginPath(); ctx.arc(0, -6, 11, 0.15, Math.PI - 0.15); ctx.closePath(); ctx.fill(); ctx.stroke(); pole(0, 6, 0); ctx.restore();
      circle(-32, -76, 3, Math.sin(t * 10) > 0 ? "#ff3b3b" : "#7a1a1a"); emo("⭐", 22, -44, 12); pole(44, 56); wave(44, -56, "#2f8f4a", t);
      sgn("BASIS", -8, "#2a3a22", "#d9f2c4", 7, -32);
      break; }
    case "zoo": {
      for (let i = -4; i <= 4; i++) pole(i * 11, 16); ctx.beginPath(); ctx.moveTo(-46, -10); ctx.lineTo(46, -10); ctx.stroke();
      // Alien-Giraffe
      ctx.fillStyle = "#b06bff"; ctx.beginPath(); ctx.ellipse(-20, -22, 14, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.save(); ctx.translate(-12, -26); ctx.rotate(Math.sin(t * 3) * 0.08); ctx.fillStyle = "#b06bff"; rr(-4, -44, 8, 46, 4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(2, -48, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); for (const sy of [-34, -22, -10]) circle(0, sy, 2, "#ffe14a"); eye(-2, -50, 2.4); eye(5, -50, 2.4); ctx.lineWidth = 1.5; pole(-2, 8, -53); pole(5, 8, -53); circle(-2, -62, 2, "#5ffff0"); circle(5, -62, 2, "#5ffff0"); ctx.restore(); ctx.lineWidth = 3; pole(-28, 12, 0); pole(-14, 12, 0);
      // dreiäugiger Elefant
      const ey = -18 - Math.abs(Math.sin(t * 5)) * 2; circle(24, ey, 15, INK); circle(24, ey, 13.5, "#7bd0c4"); ctx.fillStyle = "#5fb8ac"; ctx.beginPath(); ctx.ellipse(38, ey - 4, 6, 9, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(14, ey + 3); ctx.quadraticCurveTo(4, ey + 8, 6, ey + 16); ctx.stroke(); ctx.strokeStyle = "#7bd0c4"; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = INK; for (const ex of [17, 23, 29]) eye(ex, ey - 4, 2.2);
      for (const d of [-1, 1]) box(12, 58, "#ffb43a", d * 50, 3); flat(120, -58, "#3bb273", 18); sgn("ZOO", -67, "#fff", "#1f7a48", 11);
      break; }
    case "tierheim": {
      box(74, 42, "#8fd3ff"); tri(88, -42, 28, "#ff8f6b"); win(-22, -24, t); ctx.fillStyle = "#3a2a1a"; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(4, -20); ctx.arc(16, -20, 12, Math.PI, 0); ctx.lineTo(28, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      sgn("TIERHEIM", -48, "#fff", "#d2553a", 7); emo("🐾", 0, -60, 10);
      ctx.restore(); astronaut(x + 16 * s, y, 0.24 * s, "happy", { t, acc: "#ff79c6" });
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      const py = -13 - Math.abs(Math.sin(t * 7)) * 2; for (const d of [-1, 1]) { ctx.fillStyle = "#4fd67a"; ctx.beginPath(); ctx.ellipse(31 + d * 5, py - 5, 2.5, 4.5, d * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } circle(31, py, 7, INK); circle(31, py, 5.8, "#6ff29a"); eye(28.5, py - 1, 1.8); eye(33.5, py - 1, 1.8); circle(31, py + 2.5, 1, INK); pole(31, 5, py - 6); circle(31, py - 12, 1.8, "#ffe14a");
      emo("❤️", 42, -40 - ((t * 20) % 16), 8);
      break; }
    case "burek": {
      box(66, 40, "#f2c27a"); win(-18, -22, t); door(10);
      circle(0, -58, 27, INK); circle(0, -58, 25.5, "#e8a84a"); ctx.strokeStyle = "#a8641e"; ctx.lineWidth = 3.5; ctx.beginPath(); for (let a = 0; a < 15; a += 0.2) { const r = 1.5 * a + 1; const px = Math.cos(a) * r, py = -58 + Math.sin(a) * r; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      sgn("BUREK", -38, "#7a3b12", "#ffe7b8", 8);
      const rc = lt > 0.3 && lt < 0.5 ? -6 * (1 - (lt - 0.3) / 0.2) : 0; ctx.save(); ctx.translate(44 + rc * 0.4, -14 - rc * 0.2); ctx.rotate(-0.55); ctx.fillStyle = "#4a4f5c"; rr(-6, -8, 40, 16, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#2b2f3c"; rr(30, -10, 8, 20, 3); ctx.fill(); ctx.stroke(); ctx.restore(); circle(44, -6, 9, INK); circle(44, -6, 7.5, "#8a5a3a"); circle(44, -6, 2.5, INK);
      if (lt > 0.3 && lt < 0.48) { glow(74, -34, 30, "255,200,80", 0.9); emo("💥", 74, -34, 22); }
      break; }
    case "token": {
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { const cx = -25.5 + c * 17 + (r % 2) * 0, cy = -5 - r * 9; ctx.fillStyle = "#b8860b"; ctx.beginPath(); ctx.ellipse(cx, cy + 2.5, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = (r + c) % 2 ? "#ffd23a" : "#ffe27a"; ctx.beginPath(); ctx.ellipse(cx, cy, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3; }
      door(0, 14, 22, "#7a4a12");
      ctx.save(); ctx.translate(0, -68); ctx.scale(Math.cos(t * 3) * 0.6 + 0.4 > 0 ? Math.max(0.25, Math.abs(Math.cos(t * 3))) : 1, 1); circle(0, 0, 25, INK); circle(0, 0, 23.5, "#ffd23a"); circle(0, 0, 18, "#ffe27a"); ctx.fillStyle = "#b8860b"; ctx.font = "900 24px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("T", 0, 1.5); ctx.restore();
      for (let i = 0; i < 4; i++) { const a = (t * 2 + i * 1.7) % 1; ctx.globalAlpha = Math.sin(Math.PI * a); emo("✨", -40 + i * 27, -30 - i * 13 % 50, 9); ctx.globalAlpha = 1; }
      break; }
    case "schule": {
      box(124, 66, "#ff8f6b"); tri(138, -66, 24, "#b3402e"); ctx.fillStyle = "#fff6e6"; rr(-9, -108, 18, 26, 3); ctx.fill(); ctx.stroke(); circle(0, -96, 6, "#fff"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -96, 6, 0, Math.PI * 2); ctx.moveTo(0, -96); ctx.lineTo(0, -100); ctx.moveTo(0, -96); ctx.lineTo(3, -95); ctx.stroke(); ctx.lineWidth = 3;
      sgn("SCHULE", -73, "#fff", INK, 8);
      const op = easeOut(ramp(lt, 0.15, 0.5));
      ctx.fillStyle = "#fff3d6"; rr(-54, -58, 108, 58, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#c98f5a"; ctx.fillRect(-53, -9, 106, 8);
      ctx.fillStyle = "#1f6b4a"; rr(-48, -53, 70, 36, 3); ctx.fill(); ctx.strokeStyle = "#8a5a3a"; ctx.stroke(); ctx.strokeStyle = INK;
      ctx.fillStyle = "#fff"; ctx.font = "900 9px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("HIER BIST", -13, -41); ctx.fillStyle = GOLD; ctx.fillText("DU! 👋", -13, -28);
      ctx.restore(); astronaut(x + 37 * s, y - 2 * s, 0.4 * s, "happy", { t, acc: "#ff4f8b", armR: -2.4 + Math.sin(t * 5) * 0.3 });
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      if (op < 1) for (const d of [-1, 1]) { ctx.fillStyle = "#8a4a2a"; rr(d > 0 ? 54 - 54 * (1 - op) : -54, -58, 54 * (1 - op), 58, 2); ctx.fill(); ctx.stroke(); }
      break; }
    case "rampe": {
      flat(96, 0, "#8a8f9a", 9); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#ffd23a" : INK; ctx.fillRect(-46 + i * 15.5, -8, 15.5, 3); }
      ctx.lineWidth = 2.5; for (const px of [-40, -26]) pole(px, 96, -9); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-40, -9 - i * 16); ctx.lineTo(-26, -25 - i * 16); ctx.moveTo(-26, -9 - i * 16); ctx.lineTo(-40, -25 - i * 16); ctx.stroke(); } ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(-6, -70); ctx.stroke(); ctx.lineWidth = 3;
      ctx.restore(); rocket(x + 10 * s, y - 9 * s, 0.62 * s, 0); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) { const d = (t * 0.9 + i / 4) % 1; ctx.globalAlpha = 0.6 * (1 - d); circle(10 + (i % 2 ? 1 : -1) * (10 + d * 26), -10 - d * 8, 6 + d * 8, "#fff"); ctx.globalAlpha = 1; }
      sgn("RAKETE 4", -104, "#e5262b", "#fff", 7, -33);
      break; }
    case "bahn": {
      const f = px => -34 - 24 * Math.sin(px * 0.075 + 0.6);
      ctx.lineWidth = 2; for (let px = -54; px <= 54; px += 12) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, f(px)); ctx.stroke(); if (px < 54) { ctx.beginPath(); ctx.moveTo(px, f(px) * 0.5); ctx.lineTo(px + 12, 0); ctx.stroke(); } }
      for (const [lw, c] of [[8, INK], [4.5, "#ff3b5c"]]) { ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath(); for (let px = -58; px <= 58; px += 3) { px === -58 ? ctx.moveTo(px, f(px)) : ctx.lineTo(px, f(px)); } ctx.stroke(); ctx.beginPath(); ctx.arc(8, -42, 17, 0, Math.PI * 2); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 2;
      const u = (t * 0.9) % 1, px = lerp(-56, 56, u), ang = Math.atan2(f(px + 2) - f(px - 2), 4); for (let c = 0; c < 2; c++) { const qx = px - c * 13, qy = f(qx); ctx.save(); ctx.translate(qx, qy - 4); ctx.rotate(ang); ctx.fillStyle = c ? "#3fd3f2" : "#ffd23a"; rr(-6, -5, 12, 9, 3); ctx.fill(); ctx.stroke(); circle(0, -8, 3.2, "#ffd7b0"); ctx.restore(); }
      break; }
    case "wasser": {
      ctx.fillStyle = "#3fb8f2"; ctx.beginPath(); ctx.ellipse(10, -5, 50, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#d9f6ff"; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-10 + i * 22 + Math.sin(t * 3 + i) * 3, -5, 6, 3.6, 5.8); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 3;
      box(16, 78, "#ffb43a", -40, 3); flat(26, -78, "#ff4f8b", 8, -40);
      for (const [lw, c] of [[12, INK], [8, "#5ffff0"]]) { ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(-34, -70); ctx.bezierCurveTo(30, -76, 40, -50, 0, -44); ctx.bezierCurveTo(-30, -38, -10, -16, 28, -10); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const d = (t * 1.6 + i / 5) % 1; circle(30 + (i - 2) * 6 * d * 2, -10 - Math.sin(Math.PI * d) * 22, 2.5 * (1 - d) + 1, "#d9f6ff"); }
      emo("🛟", 44, -8 + Math.sin(t * 4) * 1.5, 11);
      break; }
    case "kuppel": {
      for (const [hx, hc] of [[-24, "#ff6b6b"], [-4, "#ffe14a"], [14, "#7bf27a"]]) { ctx.lineWidth = 2; ctx.fillStyle = hc; rr(hx - 7, -14, 14, 14, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#5a3a6b"; ctx.beginPath(); ctx.moveTo(hx - 9, -14); ctx.lineTo(hx, -23); ctx.lineTo(hx + 9, -14); ctx.closePath(); ctx.fill(); ctx.stroke(); } ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(140,225,255,0.38)"; ctx.beginPath(); ctx.arc(-5, 0, 44, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.ellipse(-5, 0, 22, 44, 0, Math.PI, 0); ctx.moveTo(-43, -22); ctx.quadraticCurveTo(-5, -32, 33, -22); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(-26, -28, 5, 10, 0.7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      box(12, 72, "#4a4f5c", 50, 3); circle(50, -78, 8, INK); circle(50, -78, 6.5, Math.sin(t * 14) > 0 ? "#ff3b3b" : "#ff9a9a");
      if (lt > 0.15) { const a = 0.6 + 0.4 * Math.sin(t * 30); for (const [lw, c] of [[7, `rgba(255,60,60,${0.45 * a})`], [2.5, "#fff"]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(50, -78); ctx.lineTo(150, -150); ctx.stroke(); } ctx.strokeStyle = INK; ctx.lineWidth = 3; }
      break; }
    case "kino": {
      for (const d of [-1, 1]) pole(d * 40, 80); ctx.fillStyle = "#1a1030"; rr(-50, -86, 100, 56, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; rr(-45, -81, 90, 46, 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.rect(-45, -81, 90, 46); ctx.clip(); ctx.fillStyle = "#2a1a55"; ctx.fillRect(-45, -81, 90, 46); circle(-14 + Math.sin(t * 2) * 6, -56, 13, "#ffb43a"); ctx.strokeStyle = "#ffe7b8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-14 + Math.sin(t * 2) * 6, -56, 20, 5, -0.3, 0, Math.PI * 2); ctx.stroke(); emo("🚀", 22, -60 + Math.sin(t * 5) * 3, 13); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(255,255,220,0.22)"; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-45, -35); ctx.lineTo(45, -35); ctx.closePath(); ctx.fill();
      for (let i = -2; i <= 2; i++) { ctx.fillStyle = "#e5262b"; ctx.beginPath(); ctx.arc(i * 17, 0, 7, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 3; } emo("🍿", 52, -10, 12); emo("⭐", -40, -98 + Math.sin(t * 4) * 2, 8); emo("⭐", 30, -100 - Math.sin(t * 4) * 2, 8);
      break; }
    case "hoehle": {
      ctx.fillStyle = "#6b5bd6"; ctx.beginPath(); for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI, r = i % 2 ? 44 : 40; const px = Math.cos(a) * r, py = Math.sin(a) * r * 1.15; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1a1030"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 28, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (const d of [-1, 1]) { glow(d * 8, -14, 14, "255,60,60", 0.7); ctx.fillStyle = "#ff4040"; ctx.beginPath(); ctx.ellipse(d * 8, -14, 5, 3, d * 0.4, 0, Math.PI * 2); ctx.fill(); }
      break; }
  }
  ctx.restore();
}

// ------------------------------------------------------------ Bühne (Seitenansicht: fremder Planet)
const STG = (() => { const r = rng(7), st = [], cr = []; for (let i = 0; i < 70; i++) st.push([r() * W, r() * HZ * 0.9, 0.6 + r() * 1.4, r() * 6]); for (let i = 0; i < 22; i++) cr.push([r() * W, HZ + 20 + r() * 430, 10 + r() * 26]); return { st, cr }; })();
function stage(t, hz = HZ) {
  const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, "#160d2e"); g.addColorStop(0.55, "#4a2470"); g.addColorStop(1, "#f08ab8"); ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, hz + 40);
  for (const [x, y, r, p] of STG.st) { if (y > hz - 30) continue; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + p); circle(x, y, r, "#fff"); } ctx.globalAlpha = 1;
  circle(96, Math.min(410, hz - 70), 34, "#19b8a6"); ctx.strokeStyle = "#b8fff6"; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(96, Math.min(410, hz - 70), 52, 12, -0.3, 0, Math.PI * 2); ctx.stroke(); circle(500, Math.min(300, hz - 40), 14, "#ffd7ec");
  ctx.fillStyle = "#c66aa0"; ctx.beginPath(); ctx.moveTo(-40, hz); for (let x = -40; x <= W + 40; x += 40) ctx.lineTo(x, hz - 14 - 12 * Math.sin(x * 0.02) - 8 * Math.sin(x * 0.05 + 1)); ctx.lineTo(W + 40, hz + 4); ctx.lineTo(-40, hz + 4); ctx.fill();
  const g2 = ctx.createLinearGradient(0, hz, 0, H); g2.addColorStop(0, "#f7b3d2"); g2.addColorStop(1, "#e88bb8"); ctx.fillStyle = g2; ctx.fillRect(-40, hz, W + 80, H - hz + 40);
  for (const [x, y, r] of STG.cr) { if (y < hz + 14) continue; ctx.fillStyle = "rgba(190,90,140,0.35)"; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(255,225,240,0.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, 3.4, 6.0); ctx.stroke(); }
  for (const [lw, c] of [[26, "rgba(63,211,200,0.35)"], [14, "#3fd3c8"], [4, "#b8fff6"]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.beginPath(); for (let x = -40; x <= W + 40; x += 20) { const y = 905 + Math.sin(x * 0.012 + t * 0.4) * 18; x === -40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
}
function plot(a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(CX, GY + 4, 150, 22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
function dustBurst(x, y, lt, big = 1) { if (lt < 0 || lt > 0.9) return; const k = lt / 0.9; for (let i = 0; i < 10; i++) { const d = i % 2 ? 1 : -1, r = rng(i + 3); ctx.globalAlpha = 0.85 * (1 - k); circle(x + d * (30 + i * 16) * easeOut(k) * big, y - 6 - r() * 40 * k, (14 + 22 * k) * big, "#ffe1ee"); } ctx.globalAlpha = 1;
  ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - ramp(lt, 0, 0.35))})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y, 60 + 380 * easeOut(ramp(lt, 0, 0.35)), 10 + 40 * easeOut(ramp(lt, 0, 0.35)), 0, 0, Math.PI * 2); ctx.stroke(); }
function speedLines(a, col = "255,255,255") { if (a <= 0.01) return; ctx.save(); ctx.translate(CX, 520); for (let i = 0; i < 26; i++) { const r = rng(i + 77), an = i / 26 * Math.PI * 2 + r() * 0.2, r0 = 250 + r() * 90; ctx.strokeStyle = `rgba(${col},${a * (0.4 + r() * 0.5)})`; ctx.lineWidth = 2 + r() * 5; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0 * 1.5); ctx.lineTo(Math.cos(an) * 700, Math.sin(an) * 700 * 1.5); ctx.stroke(); } ctx.restore(); }
function jet(x, y, s, dir = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.5 - i * 0.09; circle(-52 - i * 22, 2, 9 - i, "#fff"); } ctx.globalAlpha = 1; glow(-44, 2, 16, "255,160,60", 0.9);
  ctx.fillStyle = "#7d8a99"; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.lineTo(-30, 26); ctx.lineTo(-14, 26); ctx.lineTo(14, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-34, -2); ctx.lineTo(-44, -20); ctx.lineTo(-34, -20); ctx.lineTo(-22, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#aab6c4"; ctx.beginPath(); ctx.moveTo(48, 2); ctx.quadraticCurveTo(20, -12, -40, -6); ctx.lineTo(-44, 8); ctx.quadraticCurveTo(10, 12, 48, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#5ffff0"; ctx.beginPath(); ctx.ellipse(18, -4, 10, 4.5, -0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); emo("⭐", -12, 1, 9);
  ctx.restore(); }
function fireworks(t, t0) { for (let i = 0; i < 9; i++) { const r = rng(i + 50), st = t0 + i * 0.13, lt = (t - st) % 1.0; if (t < st) continue; const fx = 50 + r() * 470, fy = 250 + r() * 300, col = ["#ffd23a", "#ff4f8b", "#5ffff0", "#fff", "#7bf27a"][i % 5], k = lt / 1.0; for (let j = 0; j < 14; j++) { const a = j / 14 * Math.PI * 2, d = 75 * easeOut(k); ctx.globalAlpha = 1 - k; circle(fx + Math.cos(a) * d, fy + Math.sin(a) * d + 30 * k * k, 4 - 2 * k, col); } } ctx.globalAlpha = 1; }
function header(t) {
  ctx.save(); ctx.translate(SX, 146);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.fillStyle = CREAM; rr(-215, -36, 430, 68, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = "900 20px InterX, 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🪐 ROTANIEN 2.0", 0, -17);
  const chips = [["TAG 12", "#e5262b", "#fff"], [FOLLOWERS + " Bewohner", "#fff", INK], [TALER.toLocaleString("de-DE") + " Taler", GOLD, INK]];
  ctx.font = "900 12.5px InterX"; let wsum = chips.reduce((a, c) => a + ctx.measureText(c[0]).width + 22 + 8, -8), x = -wsum / 2;
  for (const [txt, bg, fg] of chips) { const w = ctx.measureText(txt).width + 22; ctx.fillStyle = bg; rr(x, 0, w, 22, 11); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.fillText(txt, x + w / 2, 11.5); x += w + 8; }
  ctx.restore();
}
function card(b, s, hot = 0) { // kleine Kommentarkarte oben
  if (s <= 0.01) return; ctx.save(); ctx.translate(SX, 322); ctx.rotate(-0.015); ctx.scale(s * (1 + 0.06 * hot), s * (1 + 0.06 * hot));
  ctx.font = "800 16px InterX"; const tw = Math.max(150, ctx.measureText(b.txt).width), w = Math.min(430, tw + 78);
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-w / 2, -28, w, 56, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = hot ? PINK : INK; ctx.lineWidth = hot ? 5 : 3; ctx.stroke();
  const av = AV[b.av], ax = -w / 2 + 30; circle(ax, 0, 20, "#3a4256"); if (av) { ctx.save(); ctx.beginPath(); ctx.arc(ax, 0, 19, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, ax - 19, -19, 38, 38); ctx.restore(); }
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX"; ctx.fillText("@" + b.u, ax + 28, -13);
  ctx.fillStyle = INK; ctx.font = "800 16px InterX"; const fit = Math.min(1, (w - 74) / tw); ctx.save(); ctx.translate(ax + 28, 8); ctx.scale(fit, 1); ctx.fillText(b.txt, 0, 0); ctx.restore();
  ctx.restore();
}
function tagLabel(txt, x, y, s, bg = PINK, fg = "#fff", rot = -0.04, size = 22) {
  if (s <= 0.01) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.font = `900 ${size}px InterX, 'Noto Color Emoji'`; const w = ctx.measureText(txt).width + 26;
  ctx.fillStyle = bg; rr(-w / 2, -size * 0.8, w, size * 1.6, 9); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 1); ctx.restore();
}
function emptyComment(t, s, y, q) { if (s <= 0.01) return; ctx.save(); ctx.translate(SX, y); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.fillStyle = "#fff"; rr(-215, -42, 430, 84, 14); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  circle(-182, -4, 20, "#2b3a55"); ctx.fillStyle = "#fff"; ctx.font = "900 16px InterX"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", -182, -3);
  ctx.textAlign = "left"; ctx.fillStyle = PINK; ctx.font = "900 12px InterX, 'Noto Color Emoji'"; ctx.fillText("@dein.name  ⭐", -152, -20); ctx.fillStyle = INK; ctx.font = "800 18px InterX, 'Noto Color Emoji'"; ctx.fillText(q, -152, 6);
  ctx.fillStyle = "#fe2c55"; ctx.font = "18px 'Noto Color Emoji'"; ctx.textAlign = "center"; ctx.fillText("❤️", 190, -4 + Math.sin(t * 6) * 2); ctx.restore(); }
function pass(s, t) { if (s <= 0.01) return; ctx.save(); ctx.translate(SX, 412); ctx.rotate(-0.03); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.fillStyle = "#fff"; rr(-205, -70, 410, 140, 12); ctx.fill(); ctx.shadowColor = "transparent"; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#e5262b"; rr(105, -70, 100, 140, [0, 12, 12, 0]); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#c9ced6"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(105, -62); ctx.lineTo(105, 62); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e5262b"; ctx.font = "900 13px InterX"; ctx.fillText("B O R D K A R T E", -186, -44);
  ctx.fillStyle = "#121a2a"; ctx.font = "900 42px InterX"; ctx.fillText("RAKETE 4", -188, -6);
  ctx.fillStyle = "#6a7180"; ctx.font = "700 13px InterX"; ctx.fillText("Name: DU?   ·   Ziel: ROTANIEN 2.0", -186, 38);
  emo("🚀", 155, -8 + Math.sin(t * 5) * 3, 44); ctx.fillStyle = "#fff"; ctx.font = "900 11px InterX"; ctx.textAlign = "center"; ctx.fillText("EIN-", 155, 36); ctx.fillText("STEIGEN", 155, 50);
  ctx.restore(); }
