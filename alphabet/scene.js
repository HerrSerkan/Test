// "Alphabet-Armee – Tag 1" (deutsche Version nach @naturebeauty2811) – 3D-Szene mit three.js.
// Ehrlich als Tag 1: alle Buchstaben starten bei 0; die Armee aus Soldaten ist als BEISPIEL markiert.
// render.js: await window.setup(timeline) -> window.renderFrame(t)
import * as THREE from "three";

const W = 1080, H = 1920;
const HUD_Y = 400;                 // Abzeichen oben (unter den TikTok-Tabs)
const CAP_Y = 1395, CAP_X = 490;   // Untertitel unter der Szene, frei von den Buttons rechts
const out = document.getElementById("c");
const octx = out.getContext("2d");
const glc = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);

let TL = null, S = [], E = [], TOK = [], WORDS = [];

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const norm = s => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function Wt(si, text, nth = 0) {
  const n = norm(text);
  const hits = TOK.filter(k => k.si === si && norm(k.text) === n);
  if (!hits.length) throw new Error("Wort nicht gefunden: " + si + " " + text);
  return hits[Math.min(nth, hits.length - 1)].s;
}
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// ------------------------------------------------------------------ Buchstaben
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LCOL = ["#ef4b3f", "#1fb8a6", "#9b4de0", "#f4c430", "#3d8ef0", "#ef5ca8", "#3fc35a", "#5b5ff0", "#f08a2c", "#2ec4e0",
  "#e04f8a", "#9ad13b", "#2f6fe8", "#e8503a", "#8d5be8", "#24b37a", "#f0b429", "#e86a2c", "#e0408f", "#3aa0f0",
  "#7b4de0", "#e8a02c", "#3fc38f", "#b04de0", "#f0d22c", "#3e7cf0"];
const COLS = 6, STEP = 7.2;
const tilePos = i => [(i % COLS - (COLS - 1) / 2) * STEP, 0, (Math.floor(i / COLS) - 2) * STEP];
const IDX = l => LETTERS.indexOf(l);

// ------------------------------------------------------------------ Welt
let TILES = [], TILE_MATS = [];
let SOLDIER = null, SOLDIER_PARTS = {}, FACE_OPEN, FACE_SHUT, FACE_SMILE;
let ARMY = null, ARMY_PTS = [], RUNNER = null;
function buildWorld() {
  scene.background = canvasTex(8, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#5f8fd8"); g.addColorStop(0.55, "#a9c8f0"); g.addColorStop(1, "#e6eefa");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  scene.fog = new THREE.Fog(0xdfe8f6, 60, 170);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899bb, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(20, 40, 25); scene.add(sun);
  // Boden mit Raster
  const grid = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = "#a9b8d3"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 6; c.strokeRect(0, 0, w, h);
    c.strokeStyle = "rgba(255,255,255,0.18)"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  });
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping; grid.repeat.set(60, 60);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ map: grid }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  // Buchstaben-Kacheln
  LETTERS.forEach((L, i) => {
    const tex = canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = "#c7d3e8"; rr(c, 6, 6, w - 12, h - 12, 26); c.fill();
      c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = 8; c.stroke();
      c.font = "900 200px InterBlk"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillStyle = "rgba(0,0,0,0.18)"; c.fillText(L, w / 2 + 6, h / 2 + 18);
      c.fillStyle = LCOL[i]; c.fillText(L, w / 2, h / 2 + 12);
    });
    const top = new THREE.MeshLambertMaterial({ map: tex });
    const side = new THREE.MeshLambertMaterial({ color: 0x9fb0cc });
    const m = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.35, 5.6), [side, side, top, side, side, side]);
    const [x, , z] = tilePos(i); m.position.set(x, 0.18, z); scene.add(m);
    TILES.push(m); TILE_MATS.push(top);
  });
  buildSoldier();
  buildArmy("E");
  RUNNER = miniSoldier(LCOL[IDX("E")], 2.2); scene.add(RUNNER);
}

// Soldat mit Megafon (Nahaufnahme), Klötzchen-Stil
function faceTex(kind) {
  return canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#f2c79a"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff"; c.strokeStyle = "#1b1b1b"; c.lineWidth = 7;
    for (const x of [78, 178]) { c.beginPath(); c.ellipse(x, 120, 30, kind === "smile" ? 16 : 34, 0, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = "#1b1b1b";
    if (kind !== "smile") for (const x of [84, 172]) { c.beginPath(); c.arc(x, 124, 13, 0, 7); c.fill(); }
    c.lineWidth = 14; c.lineCap = "round";
    if (kind === "smile") { c.beginPath(); c.moveTo(50, 78); c.lineTo(104, 84); c.moveTo(152, 84); c.lineTo(206, 78); c.stroke(); }
    else { c.beginPath(); c.moveTo(46, 70); c.lineTo(108, 92); c.moveTo(148, 92); c.lineTo(210, 70); c.stroke(); }
    if (kind === "open") { c.fillStyle = "#7a1d22"; c.beginPath(); c.ellipse(128, 200, 40, 30, 0, 0, 7); c.fill(); c.fillStyle = "#fff"; c.fillRect(98, 176, 60, 10); }
    else if (kind === "smile") { c.lineWidth = 10; c.beginPath(); c.arc(128, 170, 44, 0.2, Math.PI - 0.2); c.stroke(); }
    else { c.lineWidth = 10; c.beginPath(); c.moveTo(100, 200); c.lineTo(156, 200); c.stroke(); }
  });
}
function camoTex() {
  return canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#5f7a3c"; c.fillRect(0, 0, w, h);
    const R = rng(7);
    for (const col of ["#3f5428", "#8a9a5b", "#2e3b1f"]) for (let i = 0; i < 18; i++) {
      c.fillStyle = col; c.beginPath(); c.ellipse(R() * w, R() * h, 14 + R() * 26, 9 + R() * 16, R() * 3, 0, 7); c.fill();
    }
  });
}
function buildSoldier() {
  const g = new THREE.Group();
  FACE_OPEN = faceTex("open"); FACE_SHUT = faceTex("shut"); FACE_SMILE = faceTex("smile");
  const skin = new THREE.MeshLambertMaterial({ color: 0xf2c79a });
  const faceMat = new THREE.MeshLambertMaterial({ map: FACE_OPEN });
  const camo = new THREE.MeshLambertMaterial({ map: camoTex() });
  const helmetMat = new THREE.MeshLambertMaterial({ color: 0x4f6b31 });
  const head = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), [skin, skin, skin, skin, faceMat, skin]);
  head.position.y = 4.1;
  const helmet = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.85, 2.25), helmetMat); helmet.position.y = 5.3;
  const brim = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.7), helmetMat); brim.position.set(0, 4.95, 1.2);
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.3, 1.1), camo); body.position.y = 1.95;
  const armL = new THREE.Group(); armL.position.set(-1.35, 2.9, 0);
  const armLm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.1, 0.7), camo); armLm.position.y = -0.9; armL.add(armLm);
  const armR = new THREE.Group(); armR.position.set(1.35, 2.9, 0);
  const armRm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.1, 0.7), camo); armRm.position.y = -0.9; armR.add(armRm);
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skin); hand.position.y = -2.05; armR.add(hand);
  // Megafon in der rechten Hand
  const mega = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.25, 1.5, 24, 1, true), new THREE.MeshLambertMaterial({ color: 0xf2f2f2, side: THREE.DoubleSide }));
  cone.rotation.x = Math.PI / 2; mega.add(cone);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.12, 8, 28), new THREE.MeshLambertMaterial({ color: 0xd8312b }));
  rim.position.z = 0.75; mega.add(rim);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.74, 24), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  inner.position.z = 0.7; mega.add(inner);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), new THREE.MeshLambertMaterial({ color: 0x333333 })); handle.position.set(0, -0.6, -0.5); mega.add(handle);
  g.add(head, helmet, brim, body, armL, armR, mega);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.0), new THREE.MeshLambertMaterial({ color: 0x3b4a2a })); legs.position.y = 0.0; g.add(legs);
  g.position.set(0, 0, 60);
  scene.add(g);
  SOLDIER = g;
  SOLDIER_PARTS = { head, faceMat, armL, armR, mega, helmet, brim };
}
function poseSoldier(t, mode) {
  const P = SOLDIER_PARTS;
  const talk = Math.sin(t * 22) > -0.2;
  if (mode === "shout") {
    P.faceMat.map = talk ? FACE_OPEN : FACE_SHUT;
    P.armR.rotation.set(-1.35, 0, -0.15); P.armL.rotation.set(0, 0, 0.1);
    const shake = Math.sin(t * 40) * 0.04;
    P.mega.position.set(0.75 + shake, 3.3, 1.9); P.mega.rotation.set(0.12, -0.15, 0);
    P.head.rotation.set(0, 0, Math.sin(t * 6) * 0.04);
  } else {      // Gruß
    P.faceMat.map = FACE_SMILE;
    P.armR.rotation.set(-0.45, 0, -2.6); P.armL.rotation.set(0, 0, 0.1);
    P.mega.position.set(-1.5, 1.2, 0.6); P.mega.rotation.set(0.4, 0.6, 0);
    P.head.rotation.set(0, 0, 0);
  }
  P.faceMat.needsUpdate = true;
}

// Kleine Soldaten als Instanzen (Beispiel-Armee in Buchstabenform)
function miniSoldier(col, s = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.28), new THREE.MeshLambertMaterial({ color: col }));
  body.position.y = 0.42;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshLambertMaterial({ color: 0xf2c79a })); head.position.y = 0.82;
  const helm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.32), new THREE.MeshLambertMaterial({ color: 0x3e5527 })); helm.position.y = 1.0;
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.24), new THREE.MeshLambertMaterial({ color: 0x2c3a20 })); legs.position.y = 0.09;
  g.add(body, head, helm, legs); g.scale.setScalar(s); g.visible = false;
  return g;
}
function buildArmy(L) {
  const c = document.createElement("canvas"); c.width = c.height = 200;
  const x = c.getContext("2d");
  x.font = "900 190px InterBlk"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#000";
  x.fillText(L, 100, 112);
  const d = x.getImageData(0, 0, 200, 200).data;
  const R = rng(3);
  const [cx, , cz] = tilePos(IDX(L));
  const SIZE = 13;
  for (let py = 0; py < 200; py += 6) for (let px = 0; px < 200; px += 6) {
    if (d[(py * 200 + px) * 4 + 3] > 128) ARMY_PTS.push({ x: cx + (px - 100) / 200 * SIZE + (R() - 0.5) * 0.12, z: cz + 3 + (py - 100) / 200 * SIZE, d: R() });
  }
  ARMY_PTS.sort((a, b) => a.d - b.d);
  const n = ARMY_PTS.length;
  const mk = (geo, col) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: col }), n); m.frustumCulled = false; scene.add(m); return m; };
  ARMY = {
    body: mk(new THREE.BoxGeometry(0.36, 0.5, 0.28), LCOL[IDX(L)]),
    head: mk(new THREE.BoxGeometry(0.28, 0.28, 0.28), 0xf2c79a),
    helm: mk(new THREE.BoxGeometry(0.3, 0.12, 0.3), new THREE.Color(LCOL[IDX(L)]).multiplyScalar(0.55)),
  };
}
const _m = new THREE.Matrix4();
function placeArmy(t, t0, t1, gone) {
  const n = ARMY_PTS.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const p = ARMY_PTS[i];
    const ta = lerp(t0, t1, i / n);
    let y = -50, sc = 1;
    if (t >= ta) {
      const u = t - ta;
      y = Math.max(0, 6 - 55 * u * u);
      if (y === 0) { const b = u - Math.sqrt(6 / 55); y = b < 0.18 ? Math.sin(b / 0.18 * Math.PI) * 0.25 : 0; }
      count++;
    }
    if (gone != null && t > gone) { sc = Math.max(0.001, 1 - (t - gone - p.d * 0.25) / 0.2); if (sc <= 0.001) y = -50; }
    for (const [mesh, off] of [[ARMY.body, 0.42], [ARMY.head, 0.82], [ARMY.helm, 1.0]]) {
      _m.makeScale(sc, sc, sc).setPosition(p.x, y + off * sc, p.z);
      mesh.setMatrixAt(i, _m);
    }
  }
  for (const m of [ARMY.body, ARMY.head, ARMY.helm]) m.instanceMatrix.needsUpdate = true;
  return count;
}

// ------------------------------------------------------------------ Kamera
function look(pos, tgt) { camera.position.set(...pos); camera.lookAt(...tgt); }

// ------------------------------------------------------------------ 2D-Elemente
function pill(x, y, txt, bg, fg, size, p = 1, opts = {}) {
  if (p <= 0) return;
  const c = octx; c.save(); c.translate(x, y); const s = back(p); c.scale(s, s); c.globalAlpha = clamp(p * 3);
  c.font = `900 ${size}px InterBlk`; c.letterSpacing = "1px";
  const w = c.measureText(txt).width + size * 1.2 + (opts.icon ? size * 1.1 : 0), h = size * 1.75;
  c.shadowColor = "rgba(0,0,0,0.35)"; c.shadowBlur = 14; c.shadowOffsetY = 5;
  c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, opts.round ?? h / 2); c.fill();
  c.shadowColor = "transparent";
  c.lineWidth = 4; c.strokeStyle = opts.stroke || "rgba(0,0,0,0.85)"; c.stroke();
  c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(txt, (opts.icon ? size * 0.55 : 0), 2);
  if (opts.icon) opts.icon(c, -w / 2 + size * 0.95, 0, size);
  c.restore();
}
function helmetIcon(c, x, y, s) {
  c.fillStyle = "#3e5527"; c.beginPath(); c.arc(x, y + s * 0.1, s * 0.42, Math.PI, 0); c.fill();
  c.fillRect(x - s * 0.55, y + s * 0.08, s * 1.1, s * 0.14);
}
function comment(t, t0) {
  const p = ramp(t, t0, t0 + 0.3);
  if (p <= 0) return;
  const c = octx; c.save(); c.translate(490, 610); c.scale(back(p), back(p)); c.globalAlpha = clamp(p * 3);
  c.shadowColor = "rgba(0,0,0,0.3)"; c.shadowBlur = 20; c.shadowOffsetY = 6;
  c.fillStyle = "#ffffff"; rr(c, -330, -80, 660, 160, 30); c.fill(); c.shadowColor = "transparent";
  c.fillStyle = "#f2a6c8"; c.beginPath(); c.arc(-250, 0, 44, 0, 7); c.fill();
  c.fillStyle = "#fff"; c.font = "900 44px InterBlk"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("E", -250, 3);
  c.textAlign = "left"; c.fillStyle = "#9a9a9a"; c.font = "600 26px InterSB"; c.fillText("@du", -185, -28);
  c.fillStyle = "#151515"; c.font = "900 52px InterBlk"; c.fillText("Emma", -185, 18);
  c.fillStyle = "#e8e8e8"; rr(c, 150, -54, 150, 40, 20); c.fill();
  c.fillStyle = "#8a8a8a"; c.font = "900 20px InterBlk"; c.textAlign = "center"; c.fillText("BEISPIEL", 225, -33);
  const q = ramp(t, Wt(4, "Plus"), Wt(4, "Plus") + 0.25);
  if (q > 0) { c.save(); c.translate(225, 28); c.scale(back(q), back(q)); c.fillStyle = "#3fc35a"; rr(c, -60, -24, 120, 48, 24); c.fill(); c.fillStyle = "#fff"; c.font = "900 32px InterBlk"; c.fillText("+1", 0, 2); c.restore(); }
  c.restore();
}
function scoreboard(t, t0, t1) {
  const p = easeOut(ramp(t, t0, t0 + 0.4)) * (1 - ramp(t, t1 - 0.2, t1));
  if (p <= 0) return;
  const c = octx; c.save(); c.globalAlpha = p; c.translate(490, 850 + (1 - p) * 60);
  c.fillStyle = "rgba(18,22,34,0.92)"; rr(c, -380, -360, 760, 720, 36); c.fill();
  c.lineWidth = 5; c.strokeStyle = "#f4c430"; c.stroke();
  c.fillStyle = "#f4c430"; rr(c, -220, -390, 440, 64, 32); c.fill();
  c.fillStyle = "#151515"; c.font = "900 32px InterBlk"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("RANGLISTE · TAG 1", 0, -357);
  const zero = Wt(6, "null");
  LETTERS.forEach((L, i) => {
    const col = Math.floor(i / 13), row = i % 13;
    const x = -330 + col * 380, y = -300 + row * 50;
    const a = ramp(t, t0 + 0.1 + i * 0.02, t0 + 0.3 + i * 0.02);
    c.globalAlpha = p * a;
    c.fillStyle = LCOL[i]; rr(c, x, y - 20, 40, 40, 9); c.fill();
    c.fillStyle = "#fff"; c.font = "900 26px InterBlk"; c.textAlign = "center"; c.fillText(L, x + 20, y + 1);
    c.textAlign = "left"; c.fillStyle = "rgba(255,255,255,0.75)"; c.font = "600 24px InterSB"; c.fillText(`#${i + 1}`, x + 56, y + 1);
    c.fillStyle = "rgba(255,255,255,0.12)"; rr(c, x + 112, y - 9, 150, 18, 9); c.fill();
    const pulse = t > zero && t < zero + 0.6 ? 1 + 0.25 * Math.sin((t - zero) / 0.6 * Math.PI) : 1;
    c.save(); c.translate(x + 300, y + 1); c.scale(pulse, pulse);
    c.fillStyle = "#ffffff"; c.font = "900 30px InterBlk"; c.textAlign = "right"; c.fillText("0", 0, 0); c.restore();
  });
  c.restore();
}
function nameBoard(t, t0, t1) {
  const p = easeOut(ramp(t, t0, t0 + 0.4)) * (1 - ramp(t, t1 - 0.2, t1));
  if (p <= 0) return;
  const c = octx; c.save(); c.globalAlpha = p; c.translate(490, 860 + (1 - p) * 60);
  c.fillStyle = "rgba(18,22,34,0.92)"; rr(c, -380, -330, 760, 660, 36); c.fill();
  c.lineWidth = 5; c.strokeStyle = "#ffffff"; c.stroke();
  c.fillStyle = "#ffffff"; rr(c, -250, -360, 500, 64, 32); c.fill();
  c.fillStyle = "#151515"; c.font = "900 30px InterBlk"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("⏸  FINDE DEINEN NAMEN", 0, -327);
  const blink = 0.6 + 0.4 * Math.sin(t * 9);
  for (let r = 0; r < 9; r++) for (let k = 0; k < 3; k++) {
    const x = -335 + k * 228, y = -265 + r * 62;
    const you = r === 3 && k === 1;
    c.fillStyle = you ? `rgba(244,196,48,${0.25 + 0.35 * blink})` : "rgba(255,255,255,0.07)";
    rr(c, x, y, 212, 48, 12); c.fill();
    if (you) { c.strokeStyle = "#f4c430"; c.lineWidth = 3; c.stroke(); }
    c.fillStyle = you ? "#ffffff" : "rgba(255,255,255,0.35)"; c.font = you ? "900 26px InterBlk" : "600 24px InterSB";
    c.fillText(you ? "DEIN NAME?" : "…", x + 106, y + 25);
  }
  c.restore();
}
function icons(t, keys) {
  const items = [["FOLGEN", "#ef4b3f", keys[0], "plus"], ["LIKEN", "#ef5ca8", keys[1], "heart"], ["SPEICHERN", "#f4c430", keys[2], "save"]];
  items.forEach(([txt, col, tk, ic], i) => {
    const p = ramp(t, tk, tk + 0.3);
    if (p <= 0) return;
    const c = octx; c.save(); c.translate(250 + i * 240, 660); c.scale(back(p), back(p)); c.globalAlpha = clamp(p * 3);
    c.shadowColor = "rgba(0,0,0,0.3)"; c.shadowBlur = 16; c.shadowOffsetY = 6;
    c.fillStyle = "#fff"; rr(c, -100, -110, 200, 220, 30); c.fill(); c.shadowColor = "transparent";
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 12; c.lineCap = "round";
    if (ic === "plus") { c.beginPath(); c.arc(0, -25, 48, 0, 7); c.fill(); c.strokeStyle = "#fff"; c.beginPath(); c.moveTo(-22, -25); c.lineTo(22, -25); c.moveTo(0, -47); c.lineTo(0, -3); c.stroke(); }
    if (ic === "heart") { c.beginPath(); c.moveTo(0, 15); c.bezierCurveTo(-70, -30, -35, -85, 0, -50); c.bezierCurveTo(35, -85, 70, -30, 0, 15); c.fill(); }
    if (ic === "save") { c.beginPath(); c.moveTo(-32, -72); c.lineTo(32, -72); c.lineTo(32, 18); c.lineTo(0, -10); c.lineTo(-32, 18); c.closePath(); c.fill(); }
    c.fillStyle = "#151515"; c.font = "900 30px InterBlk"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, 0, 70);
    c.restore();
  });
}
function warn(c, x, y, s) {
  c.fillStyle = "#151515"; c.beginPath(); c.moveTo(x, y - s * 0.5); c.lineTo(x + s * 0.55, y + s * 0.45); c.lineTo(x - s * 0.55, y + s * 0.45); c.closePath(); c.fill();
  c.fillStyle = "#ffd43b"; c.font = `900 ${s * 0.6}px InterBlk`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("!", x, y + s * 0.1);
}
function share(c, x, y, s) {
  c.strokeStyle = "#151515"; c.lineWidth = s * 0.14; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(x - s * 0.4, y + s * 0.3); c.quadraticCurveTo(x - s * 0.3, y - s * 0.2, x + s * 0.25, y - s * 0.2); c.stroke();
  c.beginPath(); c.moveTo(x + s * 0.05, y - s * 0.45); c.lineTo(x + s * 0.35, y - s * 0.2); c.lineTo(x + s * 0.05, y + s * 0.05); c.stroke();
}

// ------------------------------------------------------------------ Untertitel (Wort für Wort, unter der Szene)
const CAPS = [];
function buildCaptions() {
  for (const card of TL.cards) {
    const lines = card.lines.map(l => l.map(k => ({ ...k })));
    CAPS.push({ start: card.start, end: card.end, lines });
  }
}
function caption(t) {
  const card = CAPS.find(c => t >= c.start - 0.05 && t < c.end);
  if (!card) return;
  const c = octx; c.save();
  c.textBaseline = "alphabetic"; c.lineJoin = "round";
  const size = 74, lh = 92;
  card.lines.forEach((line, li) => {
    c.font = `900 ${size}px InterBlk`;
    const words = line.map(k => k.text.toUpperCase());
    const ws = words.map(w => c.measureText(w).width), gap = size * 0.28;
    const tot = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    const scale = Math.min(1, 860 / tot);
    let x = CAP_X - tot * scale / 2;
    const y = CAP_Y + li * lh;
    line.forEach((k, i) => {
      const p = ramp(t, k.s - 0.03, k.s + 0.12);
      if (p <= 0) { x += (ws[i] + gap) * scale; return; }
      const s = scale * (1 + 0.18 * (1 - easeOut(p)));
      c.save(); c.translate(x + ws[i] * scale / 2, y); c.scale(s, s);
      c.font = `900 ${size}px InterBlk`; c.textAlign = "center";
      c.lineWidth = 14; c.strokeStyle = "#111"; c.strokeText(words[i], 0, 0);
      const hot = k.style === "heavy";
      c.fillStyle = hot ? "#ffd43b" : "#ffffff";
      c.fillText(words[i], 0, 0);
      c.restore();
      x += (ws[i] + gap) * scale;
    });
  });
  c.restore();
}

// ------------------------------------------------------------------ Einstellungen
let SHOTS = [];
const ARMY_END = () => S[5] + 0.5 * (S[6] - S[5]);
function buildShots() {
  const E_I = IDX("E"), X_I = IDX("X");
  const [ex, , ez] = tilePos(E_I), [xx, , xz] = tilePos(X_I);
  const sold = SOLDIER.position;
  SHOTS = [
    // 1 Nahaufnahme: Soldat mit Megafon
    [0, (t, u) => {
      SOLDIER.visible = true; poseSoldier(t, "shout");
      const punch = easeOut(ramp(t, Wt(1, "deiner") - 0.1, Wt(1, "deiner") + 0.15));
      const z = lerp(12, 10.5, u) - punch * 1.6;
      look([sold.x + Math.sin(t * 2) * 0.3, 4.8, sold.z + z], [sold.x, 3.9, sold.z]);
    }],
    // 2 Kranfahrt über das Buchstaben-Feld
    [S[2], (t, u) => {
      look(lerp3([0, 34, 46], [0, 24, 30], easeIO(u)), [0, 0, -2]);
      const v = Wt(2, "Vorname");
      TILES.forEach((m, i) => { const d = (i % COLS + Math.floor(i / COLS)) * 0.05; const b = ramp(t, v + d, v + d + 0.35); m.position.y = 0.18 + Math.sin(b * Math.PI) * 1.2; });
    }],
    // 3 Ein Kommentar = ein Soldat; Emma -> +1 für E
    [S[3], (t, u) => {
      look(lerp3([ex - 8, 13, ez + 20], [ex - 2, 10, ez + 15], easeIO(u)), [ex, 0, ez + 1]);
      const drop = Wt(4, "Plus");
      if (t > drop) {
        RUNNER.visible = true;
        const k = t - drop;
        const y = Math.max(0, 10 - 35 * k * k);
        RUNNER.position.set(ex, 0.35 + y + (y === 0 ? Math.max(0, Math.sin((k - 0.53) * 18) * 0.4 * Math.exp(-(k - 0.53) * 6)) : 0), ez);
        RUNNER.rotation.y = Math.sin(t * 3) * 0.2;
      }
    }],
    // 4 Beispiel: Armee wächst in Buchstabenform
    [S[5], (t, u) => {
      look(lerp3([ex, 21, ez + 19], [ex, 31, ez + 16], easeIO(u)), [ex, 0, ez + 2.5]);
      placeArmy(t, S[5], ARMY_END(), S[6] + 0.35);
    }],
    // 5 Tag 1: alle bei null (Rangliste über dem Feld)
    [S[6], (t, u) => {
      placeArmy(t, S[5], ARMY_END(), S[6] + 0.35);
      look([Math.sin(u * 0.8) * 10, 30, 36 - u * 4], [0, 0, -4]);
    }],
    // 6 Letzter Platz fliegt raus: X
    [S[7], (t, u) => {
      look(lerp3([xx - 6, 7, xz + 13], [xx - 3, 5, xz + 9], easeIO(u)), [xx, 0.5, xz]);
      const r = Wt(7, "raus");
      const f = 0.5 + 0.5 * Math.sin(t * 16);
      TILE_MATS[X_I].color.setRGB(1, lerp(1, 0.55, f), lerp(1, 0.55, f));
      if (t > r) { TILES[X_I].position.y = 0.18 - easeOut(ramp(t, r, r + 0.4)) * 0.6; TILES[X_I].rotation.z = Math.sin((t - r) * 30) * 0.05 * (1 - ramp(t, r, r + 0.6)); }
    }],
    // 7 Folgen, liken, speichern: Soldat grüßt
    [S[8], (t, u) => {
      SOLDIER.visible = true; poseSoldier(t, "salute");
      look([sold.x - 1.5, 4.3, sold.z + lerp(11.5, 10, u)], [sold.x - 0.3, 4.0, sold.z]);
    }],
    // 8 Morgen: Namen finden
    [S[9], (t, u) => {
      look([lerp(-6, 6, u), 26, 32], [0, 0, -4]);
    }],
    // 9 Kennst du ein X?
    [S[10], (t, u) => {
      look(lerp3([xx + 2, 6, xz + 10], [xx + 0.5, 4.5, xz + 7], easeIO(u)), [xx, 0.4, xz]);
      const v = Wt(11, "verschwindet");
      const shake = Math.sin(t * 38) * 0.06;
      TILES[X_I].position.set(xx + shake, 0.18, xz);
      TILES[X_I].rotation.z = 0;
      const fl = t > v ? (Math.sin(t * 50) > 0 ? 0.35 : 1) : 1;
      TILE_MATS[X_I].color.setRGB(1, fl, fl);
    }],
  ];
}

// ------------------------------------------------------------------ Bild
function resetWorld() {
  SOLDIER.visible = false; RUNNER.visible = false;
  TILES.forEach((m, i) => { const [x, , z] = tilePos(i); m.position.set(x, 0.18, z); m.rotation.set(0, 0, 0); TILE_MATS[i].color.setRGB(1, 1, 1); });
  for (const m of [ARMY.body, ARMY.head, ARMY.helm]) { for (let i = 0; i < ARMY_PTS.length; i++) { _m.makeTranslation(0, -50, 0); m.setMatrixAt(i, _m); } m.instanceMatrix.needsUpdate = true; }
}
function overlays(t) {
  // Abzeichen oben
  pill(200, HUD_Y, "TAG 1", "#e8392f", "#ffffff", 34, ramp(t, 0.05, 0.3), { round: 16 });
  pill(700, HUD_Y, "ALPHABET-ARMEE", "#f4c430", "#151515", 34, ramp(t, 0.15, 0.4), { round: 16, icon: helmetIcon });
  // Hook: Fragezeichen
  const q = Wt(1, "deiner");
  if (t < S[2]) pill(490, 640, "?", "#ffffff", "#151515", 90, ramp(t, q - 0.15, q + 0.1), { round: 24 });
  // 1 Kommentar = 1 Soldat
  if (t >= S[3] && t < S[5]) {
    pill(490, 560, "1 KOMMENTAR = 1 SOLDAT", "#ffffff", "#151515", 40, ramp(t, Wt(3, "Kommentar"), Wt(3, "Kommentar") + 0.3) * (1 - ramp(t, S[4] - 0.15, S[4])));
    comment(t, S[4]);
  }
  if (t >= S[5] && t < S[6]) {
    pill(490, 560, "BEISPIEL", "#ffffff", "#151515", 40, ramp(t, S[5], S[5] + 0.25));
    const n = Math.round(ARMY_PTS.length * clamp((t - S[5]) / (ARMY_END() - S[5])));
    pill(490, 670, `E · ${n} SOLDATEN`, "#3d8ef0", "#ffffff", 40, ramp(t, S[5] + 0.1, S[5] + 0.35));
  }
  if (t >= S[6] && t < S[7]) scoreboard(t, S[6] + 0.1, S[7]);
  if (t >= S[7] && t < S[8]) pill(490, 600, "LETZTER PLATZ FLIEGT RAUS", "#e8392f", "#ffffff", 40, ramp(t, Wt(7, "letzte") - 0.1, Wt(7, "letzte") + 0.2), { round: 18, icon: warn });
  if (t >= S[8] && t < S[9]) icons(t, [Wt(8, "Folgen"), Wt(8, "Folgen") + Math.max(0.35, (S[9] - Wt(8, "Folgen")) * 0.3), Wt(8, "speichern")]);
  if (t >= S[9] && t < S[10]) nameBoard(t, S[9] + 0.05, S[10]);
  if (t >= S[10]) pill(490, 600, "KENNST DU EIN X? SCHICK DAS.", "#f4c430", "#151515", 38, ramp(t, S[10] + 0.1, S[10] + 0.4), { round: 18, icon: share });
}
window.renderFrame = function (t) {
  resetWorld();
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const t0 = SHOTS[i][0], t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : TL.duration;
  SHOTS[i][1](t, ramp(t, t0, t1), t1 - t0);
  renderer.render(scene, camera);
  octx.setTransform(1, 0, 0, 1, 0, 0);
  octx.drawImage(glc, 0, 0);
  // dunkler Verlauf unten, damit der Text gut lesbar ist (läuft ohne Kante aus)
  const vg = octx.createLinearGradient(0, 1150, 0, H);
  vg.addColorStop(0, "rgba(10,14,28,0)"); vg.addColorStop(0.45, "rgba(10,14,28,0.45)"); vg.addColorStop(1, "rgba(10,14,28,0.6)");
  octx.fillStyle = vg; octx.fillRect(0, 1150, W, H - 1150);
  overlays(t);
  caption(t);
  // Weißblitz bei harten Schnitten
  for (const s of SHOTS.slice(1)) { const f = 1 - ramp(t, s[0], s[0] + 0.12); if (t >= s[0] && f > 0) { octx.fillStyle = `rgba(255,255,255,${0.35 * f})`; octx.fillRect(0, 0, W, H); } }
};

window.exportEvents = function () {
  return {
    duration: TL.duration,
    cuts: SHOTS.slice(1).map(s => s[0]),
    question: Wt(1, "deiner"),
    tiles: Wt(2, "Vorname"), equal: Wt(3, "Kommentar"), card: S[4], drop: Wt(4, "Plus") + 0.53, plus: Wt(4, "Plus"),
    army: [S[5], ARMY_END(), ARMY_PTS.length], poof: S[6] + 0.35, board: S[6] + 0.1, zero: Wt(6, "null"),
    alarm: [S[7], S[8]], raus: Wt(7, "raus"), icons: [Wt(8, "Folgen"), Wt(8, "speichern")], names: S[9] + 0.05,
    share: S[10] + 0.1, vanish: Wt(11, "verschwindet"),
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  S = TL.sentences.map(s => s.start);
  E = TL.sentences.map(s => s.end);
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  TL.duration = Math.round((E[E.length - 1] + 0.6) * 100) / 100;     // endet direkt nach dem letzten Wort (Loop)
  window.DURATION = TL.duration;
  await Promise.all([document.fonts.load("900 50px InterBlk"), document.fonts.load("600 50px InterSB")]);
  buildWorld();
  buildCaptions();
  buildShots();
  return true;
};
