// "Wie die Polizei dein Geld nehmen kann – erklärt mit Minecraft" (deutsche Version).
// Klötzchenwelt mit three.js; alle Texturen und Figuren werden hier im Code gezeichnet.
// render.js: await window.setup(timeline) -> window.renderFrame(t)
import * as THREE from "three";

const W = 1080, H = 1920;
const CAP_Y = 1265;                       // Untertitel unter dem Geschehen, über der TikTok-Beschreibung
const CAP_X = 500;                        // leicht links (Buttons rechts)
const out = document.getElementById("c");
const octx = out.getContext("2d");
const glc = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 400);

let TL = null, S = [], E = [], TOK = [], WORDS = [];

// ------------------------------------------------------------------ Hilfen
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => (b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const easeIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
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

// ------------------------------------------------------------------ Pixel-Texturen
const R = rng(42);
function pix(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestMipmapNearestFilter;
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}
const hex = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
function noisy(g, w, h, base, vary, seed) {
  const r = rng(seed);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = 1 + (r() - 0.5) * vary;
    g.fillStyle = hex(base[0] * k, base[1] * k, base[2] * k);
    g.fillRect(x, y, 1, 1);
  }
}
const TX = {};
function buildTextures() {
  TX.grassTop = pix(16, 16, (g, w, h) => noisy(g, w, h, [104, 170, 64], 0.28, 1));
  TX.grassSide = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [134, 96, 67], 0.3, 2);
    const r = rng(3);
    for (let x = 0; x < 16; x++) { const d = 3 + Math.floor(r() * 3); for (let y = 0; y < d; y++) { g.fillStyle = hex(104 * (0.85 + r() * 0.3), 170 * (0.85 + r() * 0.3), 64); g.fillRect(x, y, 1, 1); } }
  });
  TX.dirt = pix(16, 16, (g, w, h) => noisy(g, w, h, [134, 96, 67], 0.32, 4));
  TX.path = pix(16, 16, (g, w, h) => noisy(g, w, h, [148, 122, 72], 0.3, 5));
  TX.tile = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [168, 168, 166], 0.12, 6);
    g.fillStyle = "rgba(90,90,90,0.55)"; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(1, 1, 15, 1); g.fillRect(1, 1, 1, 15);
  });
  TX.cobble = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [122, 122, 122], 0.25, 7);
    const r = rng(8);
    g.fillStyle = "rgba(40,40,40,0.6)";
    for (let k = 0; k < 14; k++) { const x = Math.floor(r() * 16), y = Math.floor(r() * 16); g.fillRect(x, y, 1 + Math.floor(r() * 3), 1); g.fillRect(x, y, 1, 1 + Math.floor(r() * 2)); }
  });
  TX.stoneBrick = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [128, 128, 128], 0.14, 9);
    g.fillStyle = "rgba(50,50,50,0.7)";
    g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(3, 8, 1, 7); g.fillRect(12, 8, 1, 7);
  });
  TX.planks = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [162, 130, 78], 0.16, 10);
    g.fillStyle = "rgba(70,50,25,0.6)";
    for (const y of [3, 7, 11, 15]) g.fillRect(0, y, 16, 1);
    g.fillRect(5, 0, 1, 3); g.fillRect(11, 4, 1, 3); g.fillRect(3, 8, 1, 3); g.fillRect(9, 12, 1, 3);
  });
  TX.darkPlanks = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [104, 74, 44], 0.16, 11);
    g.fillStyle = "rgba(40,25,10,0.6)";
    for (const y of [3, 7, 11, 15]) g.fillRect(0, y, 16, 1);
  });
  TX.log = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [104, 82, 50], 0.2, 12);
    g.fillStyle = "rgba(40,28,14,0.55)";
    for (let x = 1; x < 16; x += 3) g.fillRect(x, 0, 1, 16);
  });
  TX.leaves = pix(16, 16, (g, w, h) => {
    const r = rng(13);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const k = 0.6 + r() * 0.6; g.fillStyle = hex(60 * k, 130 * k, 40 * k); g.fillRect(x, y, 1, 1); }
  });
  TX.ore = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [125, 125, 125], 0.2, 14);
    const r = rng(15);
    for (let k = 0; k < 6; k++) { const x = 1 + Math.floor(r() * 13), y = 1 + Math.floor(r() * 13); g.fillStyle = "#17dd62"; g.fillRect(x, y, 2, 2); g.fillStyle = "#0b8a3a"; g.fillRect(x + 1, y + 1, 1, 1); g.fillStyle = "#b8ffd0"; g.fillRect(x, y, 1, 1); }
  });
  TX.emerald = pix(16, 16, (g, w, h) => {
    g.fillStyle = "#0e7f3a"; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const px = x * 4, py = y * 4;
      g.fillStyle = "#19c95a"; g.fillRect(px + 1, py, 2, 4); g.fillRect(px, py + 1, 4, 2);
      g.fillStyle = "#7dffad"; g.fillRect(px + 1, py + 1, 1, 1);
      g.fillStyle = "#0a5e2b"; g.fillRect(px + 2, py + 2, 1, 1);
    }
  });
  TX.chestSide = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [160, 112, 50], 0.14, 16);
    g.fillStyle = "#3b2610"; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
  });
  TX.chestFront = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [160, 112, 50], 0.14, 17);
    g.fillStyle = "#3b2610"; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16); g.fillRect(0, 5, 16, 1);
    g.fillStyle = "#c8c8c8"; g.fillRect(7, 4, 2, 4);
  });
  TX.red = pix(16, 16, (g, w, h) => noisy(g, w, h, [180, 36, 36], 0.12, 18));
  TX.glass = pix(16, 16, (g, w, h) => { g.fillStyle = "#bfe4ff"; g.fillRect(0, 0, 16, 16); g.fillStyle = "#ffffff"; g.fillRect(3, 3, 2, 2); g.fillRect(5, 5, 2, 2); g.fillStyle = "#7f9fb8"; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16); g.fillRect(0, 15, 16, 1); });
  TX.farmland = pix(16, 16, (g, w, h) => { noisy(g, w, h, [88, 58, 34], 0.25, 19); g.fillStyle = "rgba(40,25,10,0.5)"; for (let y = 1; y < 16; y += 4) g.fillRect(0, y, 16, 1); });
  TX.asphalt = pix(16, 16, (g, w, h) => noisy(g, w, h, [60, 60, 64], 0.2, 20));
  TX.iron = pix(16, 16, (g, w, h) => { noisy(g, w, h, [70, 70, 72], 0.15, 21); g.fillStyle = "#2c2c2e"; for (let k = 2; k < 16; k += 4) { g.fillRect(k, 0, 1, 16); g.fillRect(0, k, 16, 1); } });
  TX.diamond = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [96, 222, 214], 0.12, 22);
    g.fillStyle = "#e8fffd"; for (let k = 0; k < 6; k++) g.fillRect(Math.floor(R() * 15), Math.floor(R() * 15), 1, 1);
    g.fillStyle = "#2a9f98"; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
  });
  TX.cash = pix(16, 16, (g, w, h) => {
    noisy(g, w, h, [120, 170, 110], 0.1, 23);
    g.fillStyle = "#e6f2de"; g.fillRect(0, 6, 16, 4);
    g.fillStyle = "#3b6b35"; g.fillRect(6, 6, 4, 4);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1);
  });
  TX.carBlue = pix(16, 16, (g, w, h) => noisy(g, w, h, [50, 82, 160], 0.08, 24));
  TX.black = pix(16, 16, (g, w, h) => noisy(g, w, h, [28, 28, 30], 0.2, 25));
  TX.white = pix(16, 16, (g, w, h) => noisy(g, w, h, [220, 222, 222], 0.06, 26));
}
// Schilder mit Schrift
function signTex(lines, w, h, bg, fg, size, wood = true) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (wood) {
    const r = rng(31);
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.fillStyle = `rgba(0,0,0,${r() * 0.12})`; g.fillRect(x, y, 8, 8); }
    g.strokeStyle = "rgba(60,35,15,0.9)"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  }
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size}px InterBlk`;
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.02));
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

// ------------------------------------------------------------------ Welt
const M = {};
function mat(tx, opts = {}) { return new THREE.MeshLambertMaterial({ map: tx, ...opts }); }
function rep(tx, x, y) { const t = tx.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.needsUpdate = true; return t; }
function plane(tx, x0, z0, x1, z1, y = 0.001) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat(rep(tx, x1 - x0, z1 - z0)));
  m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  scene.add(m);
  return m;
}
// Blöcke sammeln, dann je Material als InstancedMesh
const BLOCKS = new Map();
function block(type, x, y, z) { if (!BLOCKS.has(type)) BLOCKS.set(type, []); BLOCKS.get(type).push([x, y, z]); }
function boxFill(type, x0, y0, z0, x1, y1, z1) { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) block(type, x, y, z); }
function flushBlocks() {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  for (const [type, list] of BLOCKS) {
    let m = M[type];
    const im = new THREE.InstancedMesh(geo, m, list.length);
    const o = new THREE.Object3D();
    list.forEach(([x, y, z], i) => { o.position.set(x + 0.5, y + 0.5, z + 0.5); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    scene.add(im);
  }
}
function boxMesh(w, h, d, material, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
function texPlane(tex, w, h, x, y, z, ry = 0, transparent = false) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent, side: THREE.DoubleSide, alphaTest: transparent ? 0.5 : 0 }));
  m.position.set(x, y, z); m.rotation.y = ry;
  scene.add(m);
  return m;
}

const CHESTS = [];
function chest(x, z, ry = 0) {
  const g = new THREE.Group();
  const side = mat(TX.chestSide), front = mat(TX.chestFront);
  const base = boxMesh(0.88, 0.62, 0.88, [side, side, side, side, front, side], 0, 0.31, 0, g);
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.62, -0.44); g.add(lidPivot);
  boxMesh(0.88, 0.26, 0.88, [side, side, side, side, side, side], 0, 0.13, 0.44, lidPivot);
  const inside = new THREE.Group(); g.add(inside);
  g.position.set(x, 0, z); g.rotation.y = ry;
  scene.add(g);
  const c = { g, lid: lidPivot, inside };
  CHESTS.push(c);
  return c;
}
function tree(x, z, h = 4) {
  boxFill("log", x, 0, z, x, h - 1, z);
  for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = h - 2; dy <= h; dy++) {
    if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
    if (dy === h && (Math.abs(dx) > 1 || Math.abs(dz) > 1)) continue;
    if (dx === 0 && dz === 0 && dy < h) continue;
    block("leaves", x + dx, dy, z + dz);
  }
  block("leaves", x, h + 1, z);
}
let ARMOR_STANDS = [];
function buildWorld() {
  scene.background = new THREE.Color(0x9ccbff);
  scene.fog = new THREE.Fog(0x9ccbff, 45, 140);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a7a50, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(20, 40, 15);
  scene.add(sun);
  for (const k of ["cobble", "planks", "darkPlanks", "log", "ore", "stoneBrick", "dirt", "iron", "red", "black", "white", "cash", "carBlue", "diamond", "emerald"]) M[k] = mat(TX[k]);
  M.leaves = mat(TX.leaves);
  M.glass = mat(TX.glass, { transparent: true, opacity: 0.8 });
  M.grass = [mat(TX.grassSide), mat(TX.grassSide), mat(TX.grassTop), mat(TX.dirt), mat(TX.grassSide), mat(TX.grassSide)];

  // Boden
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(rep(TX.grassTop, 400, 400)));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  plane(TX.tile, -13, -15, 13, 4, 0.004);                 // Platz am Spawn
  plane(TX.path, -1.5, 4, 1.5, 44, 0.003);                // Weg zu Pauls Haus
  plane(TX.path, -6, 40, -1.5, 43, 0.003);
  plane(TX.farmland, 3, -14, 11, -9, 0.02);               // Farm zu verkaufen
  plane(TX.iron, 3, -4, 11, 1, 0.008);                   // Rüstungsständer
  // Mod-Stand: Bruchsteinmauer, Theke, Schild
  boxFill("cobble", -12, 0, -14, -1, 3, -14);
  boxFill("cobble", -12, 0, -13, -12, 2, -10);
  boxFill("cobble", -1, 0, -13, -1, 1, -12);
  texPlane(signTex(["MODS"], 512, 140, "#a8743a", "#b81c1c", 104), 3.6, 1.0, -6.5, 2.6, -12.98);
  boxMesh(6, 0.3, 1, mat(TX.darkPlanks), -6.5, 1.0, -10.2);
  boxMesh(6, 0.85, 0.9, mat(TX.red), -6.5, 0.43, -10.2);
  // Kalender/Aushang an der Wand
  texPlane(signTex(["REGELN", "1. fair", "2. nett", "3. ehrlich"], 256, 300, "#efefe8", "#333", 34, false), 1.0, 1.15, -10.6, 2.0, -12.98);
  // Farm: Pfosten + Schild + Pflanzen
  boxMesh(0.3, 3.2, 0.3, mat(TX.log), 4.2, 1.6, -8.6);
  boxMesh(0.3, 3.2, 0.3, mat(TX.log), 9.8, 1.6, -8.6);
  boxMesh(5.9, 1.9, 0.2, mat(TX.darkPlanks), 7, 2.25, -8.75);
  texPlane(signTex(["FARM ZU", "VERKAUFEN"], 600, 200, "#b8854a", "#b81c1c", 78), 5.4, 1.75, 7, 2.25, -8.63);
  const sprout = pix(16, 16, (g) => { g.fillStyle = "#3fae2f"; g.fillRect(7, 6, 2, 10); g.fillRect(4, 8, 3, 2); g.fillRect(9, 5, 3, 2); });
  for (let x = 3.5; x < 11; x += 1) for (let z = -13.5; z < -9; z += 1) {
    const s = texPlane(sprout, 0.5, 0.5, x, 0.25, z, R() * 3, true);
  }
  // Rüstungsständer
  for (let k = 0; k < 4; k++) ARMOR_STANDS.push(armorStand(4.2 + k * 2, -1.5));
  // Pauls Haus
  boxFill("planks", -8, 0, 37, -3, 3, 37); boxFill("planks", -8, 0, 43, -3, 3, 43);
  boxFill("planks", -8, 0, 38, -8, 3, 42); boxFill("planks", -3, 0, 38, -3, 3, 42);
  for (const [x, z] of [[-8, 37], [-3, 37], [-8, 43], [-3, 43]]) boxFill("log", x, 0, z, x, 3, z);
  for (let k = 0; k < 4; k++) boxFill("darkPlanks", -9 + k, 4 + k, 36, 0 - k - 2, 4 + k, 44);
  boxMesh(1, 2, 0.1, mat(TX.darkPlanks), -2.94, 1, 40.5).rotation.y = Math.PI / 2;
  boxMesh(1.4, 1.1, 0.05, M.glass, -5.5, 2.0, 36.96);
  boxMesh(0.05, 1.1, 1.4, M.glass, -2.96, 2.2, 38.7);
  // Smaragderz am Haus
  boxFill("ore", -1, 0, 33, 0, 1, 34); block("ore", -1, 2, 34); block("cobble", 0, 2, 33);
  // Fackel
  boxMesh(0.12, 0.6, 0.12, mat(TX.log), 1.9, 0.3, 36.2);
  const flame = boxMesh(0.14, 0.14, 0.14, new THREE.MeshBasicMaterial({ color: 0xffd34d }), 1.9, 0.66, 36.2);
  // Bäume
  const tr = rng(77);
  for (let k = 0; k < 40; k++) {
    const x = Math.floor(-50 + tr() * 100), z = Math.floor(-50 + tr() * 110);
    if (x > -16 && x < 15 && z > -18 && z < 8) continue;
    if (x > -12 && x < 6 && z > 4 && z < 48) continue;
    if (x > 55) continue;
    tree(x, z, 4 + Math.floor(tr() * 2));
  }
  // "Echtes Leben": Straße, Auto, Wache, 2014-Schild
  plane(TX.asphalt, 58, -1, 100, 5, 0.005);
  car(72, 1.8);
  boxFill("stoneBrick", 78, 0, -12, 92, 5, -8);
  boxMesh(1.2, 2.2, 0.1, mat(TX.black), 84, 1.1, -7.95);
  boxMesh(2.4, 0.2, 1.2, M.stoneBrick, 84, 0.1, -7.2);
  boxMesh(0.5, 0.25, 0.1, new THREE.MeshBasicMaterial({ color: 0xfff1b0 }), 84, 2.55, -7.95);
  boxFill("iron", 62, 0, -9, 62, 4, -9); boxFill("iron", 70, 0, -9, 70, 4, -9); boxFill("iron", 62, 5, -9, 70, 5, -9);
  texPlane(signTex(["2014"], 700, 260, "#d9dad5", "#2b2b2b", 200, false), 6.6, 2.4, 66.5, 3.5, -8.4);
  // Geldstapel
  for (let x = 0; x < 5; x++) for (let z = 0; z < 3; z++) for (let y = 0; y < (x + z) % 3 + 1; y++) block("cash", 72 + x, y, -7 + z);
  flushBlocks();
}
function car(x, z) {
  const g = new THREE.Group();
  boxMesh(4.2, 1.0, 1.9, M.carBlue, 0, 0.75, 0, g);
  boxMesh(2.2, 0.8, 1.8, M.carBlue, -0.3, 1.65, 0, g);
  boxMesh(2.0, 0.6, 1.82, M.glass, -0.3, 1.65, 0, g);
  for (const [dx, dz] of [[-1.4, 0.95], [1.4, 0.95], [-1.4, -0.95], [1.4, -0.95]]) { const w = boxMesh(0.8, 0.8, 0.3, M.black, dx, 0.4, dz, g); }
  boxMesh(0.1, 0.3, 0.5, new THREE.MeshBasicMaterial({ color: 0xfff4c0 }), 2.11, 0.9, 0.6, g);
  boxMesh(0.1, 0.3, 0.5, new THREE.MeshBasicMaterial({ color: 0xfff4c0 }), 2.11, 0.9, -0.6, g);
  g.position.set(x, 0, z);
  scene.add(g);
}
function armorStand(x, z) {
  const g = new THREE.Group();
  const wood = mat(TX.planks);
  boxMesh(0.8, 0.08, 0.8, M.stoneBrick, 0, 0.04, 0, g);
  boxMesh(0.12, 1.9, 0.12, wood, 0, 1.0, 0, g);
  boxMesh(0.75, 0.12, 0.12, wood, 0, 1.45, 0, g);
  boxMesh(0.56, 0.8, 0.32, M.diamond, 0, 1.15, 0, g);
  boxMesh(0.28, 0.6, 0.3, M.diamond, -0.42, 1.2, 0, g);
  boxMesh(0.28, 0.6, 0.3, M.diamond, 0.42, 1.2, 0, g);
  boxMesh(0.56, 0.5, 0.56, M.diamond, 0, 1.85, 0, g);
  boxMesh(0.27, 0.6, 0.3, M.diamond, -0.13, 0.45, 0, g);
  boxMesh(0.27, 0.6, 0.3, M.diamond, 0.13, 0.45, 0, g);
  g.position.set(x, 0, z);
  scene.add(g);
  return g;
}

// ------------------------------------------------------------------ Figuren
function faceTex(o) {
  return pix(8, 8, (g) => {
    g.fillStyle = o.skin; g.fillRect(0, 0, 8, 8);
    g.fillStyle = o.hair; g.fillRect(0, 0, 8, o.hairRows ?? 2);
    if (o.sideburns !== false) { g.fillRect(0, 2, 1, 1); g.fillRect(7, 2, 1, 1); }
    // Augen
    g.fillStyle = "#ffffff"; g.fillRect(1, 4, 2, 1); g.fillRect(5, 4, 2, 1);
    g.fillStyle = o.eye || "#3b2a8a"; g.fillRect(2, 4, 1, 1); g.fillRect(5, 4, 1, 1);
    if (o.brow) { g.fillStyle = o.hair; g.fillRect(1, 3, 2, 1); g.fillRect(5, 3, 2, 1); }
    // Nase, Mund/Bart
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(3, 5, 2, 1);
    if (o.beard) { g.fillStyle = o.beard; g.fillRect(2, 6, 4, 1); g.fillRect(1, 7, 6, 1); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(3, 6, 2, 1); }
    else { g.fillStyle = "rgba(90,30,30,0.6)"; g.fillRect(3, 6, 2, 1); }
  });
}
function headSideTex(o, back = false) {
  return pix(8, 8, (g) => {
    g.fillStyle = o.skin; g.fillRect(0, 0, 8, 8);
    g.fillStyle = o.hair; g.fillRect(0, 0, 8, back ? (o.longHair ? 8 : 4) : (o.hairRows ?? 2) + 1);
    if (!back) g.fillRect(back ? 0 : 5, 0, 3, 4);
  });
}
function clothTex(col, o = {}) {
  return pix(8, 12, (g) => {
    noisy(g, 8, 12, col, 0.1, Math.floor(col[0] + col[1] * 3));
    if (o.belt) { g.fillStyle = o.belt; g.fillRect(0, 10, 8, 1); }
    if (o.badge) { g.fillStyle = "#ffd94a"; g.fillRect(5, 3, 1, 1); }
    if (o.collar) { g.fillStyle = o.collar; g.fillRect(2, 0, 4, 1); g.fillRect(3, 1, 2, 1); }
  });
}
function armTex(top, skin, sleeve = 5) {
  return pix(4, 12, (g) => { g.fillStyle = skin; g.fillRect(0, 0, 4, 12); noisy(g, 4, sleeve, top, 0.1, 9); });
}
const CHARS = [];
function makeChar(o) {
  const g = new THREE.Group();
  const skin = o.skin, sk = mat(pix(4, 4, gg => { gg.fillStyle = skin; gg.fillRect(0, 0, 4, 4); }));
  const hairM = mat(pix(4, 4, gg => { gg.fillStyle = o.hair; gg.fillRect(0, 0, 4, 4); }));
  const side = mat(headSideTex(o)), back = mat(headSideTex(o, true));
  const headMats = [side, side, hairM, sk, mat(faceTex(o)), back];
  const shirt = mat(clothTex(o.shirt, o));
  const pants = mat(clothTex(o.pants));
  const shoes = mat(pix(4, 4, gg => { gg.fillStyle = o.shoes || "#3a3a3a"; gg.fillRect(0, 0, 4, 4); }));
  const armM = mat(armTex(o.shirt, skin, o.longSleeve ? 12 : 5));
  // Beine
  const legL = new THREE.Group(), legR = new THREE.Group();
  legL.position.set(-0.125, 0.75, 0); legR.position.set(0.125, 0.75, 0);
  for (const L of [legL, legR]) {
    boxMesh(0.25, 0.66, 0.25, pants, 0, -0.33, 0, L);
    boxMesh(0.25, 0.09, 0.25, shoes, 0, -0.705, 0, L);
    g.add(L);
  }
  // Körper
  const body = boxMesh(0.5, 0.75, 0.25, shirt, 0, 1.125, 0);
  g.add(body);
  // Arme
  const armL = new THREE.Group(), armR = new THREE.Group();
  armL.position.set(-0.375, 1.44, 0); armR.position.set(0.375, 1.44, 0);
  boxMesh(0.25, 0.75, 0.25, armM, 0, -0.31, 0, armL);
  boxMesh(0.25, 0.75, 0.25, armM, 0, -0.31, 0, armR);
  g.add(armL, armR);
  // Kopf
  const head = new THREE.Group(); head.position.set(0, 1.5, 0); g.add(head);
  boxMesh(0.5, 0.5, 0.5, headMats, 0, 0.25, 0, head);
  if (o.cap) {
    const cm = mat(pix(4, 4, gg => { gg.fillStyle = o.cap; gg.fillRect(0, 0, 4, 4); gg.fillStyle = "rgba(255,255,255,0.15)"; gg.fillRect(0, 0, 4, 1); }));
    boxMesh(0.56, 0.2, 0.56, cm, 0, 0.5, 0, head);
    boxMesh(0.5, 0.06, 0.24, cm, 0, 0.42, 0.36, head);
  }
  if (o.beanie) boxMesh(0.56, 0.22, 0.56, mat(TX.black), 0, 0.46, 0, head);
  // Rüstung (optional sichtbar)
  const armor = new THREE.Group();
  boxMesh(0.6, 0.62, 0.34, M.diamond, 0, 1.17, 0, armor);
  const aL = boxMesh(0.32, 0.38, 0.32, M.diamond, 0, -0.12, 0, armL), aR = boxMesh(0.32, 0.38, 0.32, M.diamond, 0, -0.12, 0, armR);
  const lL = boxMesh(0.3, 0.5, 0.3, M.diamond, 0, -0.3, 0, legL), lR = boxMesh(0.3, 0.5, 0.3, M.diamond, 0, -0.3, 0, legR);
  const armorParts = [armor, aL, aR, lL, lR];
  g.add(armor);
  // Schatten
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; g.add(sh);
  // Halte-Punkt vor der Brust (Smaragdstapel, Koffer)
  const hold = new THREE.Group(); hold.position.set(0, 1.05, 0.42); g.add(hold);
  // Werkzeug in der rechten Hand
  const tool = new THREE.Group(); tool.position.set(0, -0.62, 0.1); armR.add(tool);
  scene.add(g);
  const c = { g, head, armL, armR, legL, legR, armorParts, hold, tool, o };
  CHARS.push(c);
  return c;
}
// Gegenstände
let PICK = null;
function pickaxe() {
  const tex = pix(16, 16, (g) => {
    g.fillStyle = "#6b4a24"; for (let k = 3; k < 14; k++) g.fillRect(k, 15 - k + 1, 2, 2);
    g.fillStyle = "#d8d8d8";
    const pts = [[2, 3], [3, 2], [4, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 2], [11, 2], [12, 3], [13, 4], [13, 5], [14, 6], [14, 7], [14, 8]];
    for (const [x, y] of pts) g.fillRect(x, y, 1, 2);
    g.fillStyle = "#9a9a9a"; for (const [x, y] of pts) g.fillRect(x, y + 2, 1, 1);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  m.rotation.y = Math.PI / 2; m.rotation.x = 0;
  return m;
}
function stackItem() {
  const g = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const b = boxMesh(0.32, 0.32, 0.32, M.emerald, (k % 3 - 1) * 0.2, Math.floor(k / 3) * 0.24, (k % 2) * 0.05, g);
    b.rotation.y = k * 0.4;
  }
  return g;
}
function briefcase() {
  const g = new THREE.Group();
  boxMesh(0.62, 0.42, 0.18, M.black, 0, 0, 0, g);
  boxMesh(0.5, 0.16, 0.19, M.cash, 0, 0.08, 0.01, g);
  boxMesh(0.2, 0.06, 0.06, M.black, 0, 0.24, 0, g);
  return g;
}
function sack() {
  const g = new THREE.Group();
  const m = mat(pix(8, 8, gg => noisy(gg, 8, 8, [176, 146, 96], 0.2, 51)));
  boxMesh(0.45, 0.5, 0.35, m, 0, 0, 0, g);
  boxMesh(0.2, 0.12, 0.2, m, 0, 0.3, 0, g);
  return g;
}

// Pose setzen
function pose(c, p, t) {
  const { g, head, armL, armR, legL, legR } = c;
  g.visible = p.vis !== false;
  if (!g.visible) return;
  g.position.set(p.x, p.y || 0, p.z);
  g.rotation.y = p.ry || 0;
  const wk = p.walk ? Math.sin(t * (p.walkSpeed || 9)) * 0.7 : 0;
  legL.rotation.x = wk; legR.rotation.x = -wk;
  head.rotation.set(p.hx || 0, p.hy || 0, p.hz || 0);
  armL.rotation.set(0, 0, 0.05); armR.rotation.set(0, 0, -0.05);
  const idle = Math.sin(t * 1.7 + p.x) * 0.04;
  switch (p.arms || "idle") {
    case "idle": armL.rotation.x = -wk * 0.8 + idle; armR.rotation.x = wk * 0.8 - idle; break;
    case "hold": armL.rotation.x = armR.rotation.x = -1.15; armL.rotation.z = 0.25; armR.rotation.z = -0.25; break;
    case "holdL": armL.rotation.x = -1.15; armL.rotation.z = 0.15; armR.rotation.x = wk * 0.8; break;
    case "raiseR": armL.rotation.x = -1.1; armR.rotation.x = -2.6; break;          // links halten, rechts hoch
    case "swing": { const s = Math.sin(t * 9); armR.rotation.x = -1.6 + s * 0.9; armL.rotation.x = idle; break; }
    case "stop": armR.rotation.x = -1.75; armR.rotation.z = -0.1; armL.rotation.x = idle; break;
    case "point": armR.rotation.x = -1.5; armL.rotation.x = idle; break;
    case "up": armL.rotation.z = 2.6 + Math.sin(t * 6) * 0.2; armR.rotation.z = -2.6 - Math.sin(t * 6) * 0.2; break;
    case "talk": armR.rotation.x = -0.6 + Math.sin(t * 5) * 0.3; armL.rotation.x = idle; break;
    case "sad": armL.rotation.x = armR.rotation.x = 0.05; break;
    case "carry": armL.rotation.x = wk * 0.8; armR.rotation.x = -0.2; break;
  }
  for (const a of c.armorParts) a.visible = !!p.armor;
  // Gegenstände
  c.hold.clear(); c.tool.clear();
  if (p.item === "stack") { const s = stackItem(); s.position.set(0, -0.05, 0.05); c.hold.add(s); }
  if (p.item === "case") { const b = briefcase(); b.position.set(0, -0.1, 0); c.hold.add(b); }
  if (p.tool === "pick") { const k = pickaxe(); k.position.set(0, 0.25, 0.25); c.tool.add(k); }
  if (p.tool === "case") { const b = briefcase(); b.rotation.x = Math.PI / 2; b.position.set(0, -0.1, 0); c.tool.add(b); }
  if (p.tool === "sack") { const b = sack(); b.position.set(0, -0.25, 0); c.tool.add(b); }
  if (p.tool === "stack") { const s = stackItem(); s.scale.setScalar(0.8); s.position.set(0, -0.1, 0.1); c.tool.add(s); }
}

// ------------------------------------------------------------------ Darsteller
let PAUL, MOD, MOD2, MOD3, CROWD = [], COP1, COP2, DRIVER, THIEF, BURGLAR;
function buildCast() {
  PAUL = makeChar({ skin: "#c8946c", hair: "#3b2614", beard: "#4a3020", shirt: [40, 170, 170], pants: [52, 60, 150], shoes: "#444", brow: true });
  MOD = makeChar({ skin: "#d6a37e", hair: "#5a3a1e", beard: "#6b4524", shirt: [30, 38, 70], pants: [26, 26, 32], cap: "#c62424", brow: true });
  MOD2 = makeChar({ skin: "#7a4f32", hair: "#1c120b", beard: "#24170e", shirt: [70, 72, 78], pants: [30, 30, 36], cap: "#c62424" });
  MOD3 = makeChar({ skin: "#e0b08a", hair: "#7a4b23", shirt: [62, 90, 48], pants: [40, 40, 44], cap: "#c62424" });
  const looks = [
    { skin: "#e3b48d", hair: "#2b1d12", shirt: [196, 92, 40], pants: [70, 70, 80] },
    { skin: "#8a5a3a", hair: "#151010", shirt: [200, 170, 60], pants: [60, 50, 40] },
    { skin: "#f0c8a8", hair: "#d8b04a", shirt: [150, 50, 50], pants: [40, 60, 110] },
    { skin: "#c08a64", hair: "#3c2a1a", shirt: [90, 130, 200], pants: [50, 50, 60] },
    { skin: "#d9a882", hair: "#111", shirt: [235, 235, 235], pants: [90, 70, 50] },
  ];
  CROWD = looks.map(l => makeChar(l));
  COP1 = makeChar({ skin: "#8a5a3a", hair: "#151010", shirt: [24, 32, 60], pants: [20, 24, 44], cap: "#121624", badge: true, longSleeve: true });
  COP2 = makeChar({ skin: "#efc9a6", hair: "#e0c060", shirt: [24, 32, 60], pants: [20, 24, 44], cap: "#121624", badge: true, longSleeve: true });
  DRIVER = makeChar({ skin: "#d8a47c", hair: "#8d8d8d", beard: "#a0a0a0", shirt: [190, 120, 60], pants: [52, 60, 120] });
  THIEF = makeChar({ skin: "#6b4a30", hair: "#111", shirt: [26, 26, 28], pants: [26, 26, 28], beanie: true, longSleeve: true });
}
const HIDE = { vis: false };

// ------------------------------------------------------------------ Einstellungen (Shots)
// Jede Einstellung: [Start, Funktion(t, u, d)] – Ende = Start der nächsten.
let SHOTS = [];
function cam(p, l) { camera.position.set(...p); camera.lookAt(...l); }
function camMove(p0, l0, p1, l1, u) { const k = easeIO(u); cam(lerp3(p0, p1, k), lerp3(l0, l1, k)); }
function setChest(c, open, items) {
  c.lid.rotation.x = -open * 1.6;
  c.inside.clear();
  for (let k = 0; k < items; k++) boxMesh(0.22, 0.22, 0.22, M.emerald, -0.25 + (k % 3) * 0.25, 0.5, -0.2 + Math.floor(k / 3) * 0.25, c.inside);
}
let CH_HOME, CH_MODS, CH_MODS2;
const OVER = { tag: null, n64: null };     // 2D-Einblendungen an 3D-Positionen

function buildShots() {
  const sp = i => S[i] - 0.15;
  const crowdWalk = (t, z0, dir = 1) => CROWD.forEach((c, i) => {
    const sx = -12 + ((t * 1.2 * (i % 2 ? 1 : -1) + i * 5.3) % 24 + 24) % 24;
    pose(c, { x: sx, z: z0 - i * 1.2, ry: i % 2 ? Math.PI / 2 : -Math.PI / 2, walk: true }, t + i);
  });
  SHOTS = [
    // 0 Intro: Paul streitet mit dem Mod am Stand
    [-1, (t, u) => {
      pose(PAUL, { x: -3.6, z: -5.6, ry: -1.9, arms: "swing", tool: "pick" }, t);
      pose(MOD, { x: -5.3, z: -6.2, ry: 1.2, arms: "hold", item: "stack" }, t);
      pose(MOD2, { x: -8, z: -11.3, ry: 0, armor: true, arms: "talk" }, t);
      pose(MOD3, { x: -5, z: -11.3, ry: 0, armor: true }, t);
      camMove([1.6, 3.3, -0.4], [-5.6, 1.2, -8.0], [0.6, 2.9, -1.6], [-5.6, 1.2, -8.0], u);
    }],
    // 1 Paul baut Smaragde ab
    [sp(1), (t, u) => {
      pose(PAUL, { x: 0, z: 36, ry: Math.PI, arms: "swing", tool: "pick" }, t);
      setChest(CH_HOME, 0, 0);
      OVER.tag = [0, 2.35, 36, "Paul"];
      camMove([5.4, 2.7, 40.6], [-0.2, 1.1, 34.8], [4.8, 2.5, 40.0], [-0.2, 1.1, 34.8], u);
    }],
    // 2 Paul trägt den Stapel zum Spawn
    [sp(2), (t, u) => {
      const tsp = Wt(2, "Spawn");
      if (t < tsp) {
        const z = lerp(30, 24.5, ramp(t, S[2], tsp));
        pose(PAUL, { x: 0, z, ry: Math.PI, walk: true, arms: "hold", item: "stack" }, t);
        cam([0.6, 1.9, z - 3.2], [0, 1.25, z]);
        if (t > Wt(2, "64") - 0.1) OVER.n64 = [0.4, 1.6, z - 0.5, 64, Wt(2, "64")];
      } else {
        const z = lerp(14, 8.5, ramp(t, tsp, S[3]));
        pose(PAUL, { x: 0, z, ry: Math.PI, walk: true, arms: "hold", item: "stack" }, t);
        cam([0.7, 2.6, z + 4.2], [0, 1.0, z - 6]);
      }
      crowdWalk(t, -2);
    }],
    // 3 Ein Mod hält ihn an
    [sp(3), (t, u) => {
      const k = easeOut(ramp(t, S[3], S[3] + 1.0));
      pose(PAUL, { x: 0, z: lerp(7, 5.5, k), ry: Math.PI, walk: k < 1, arms: "hold", item: "stack" }, t);
      pose(MOD, { x: lerp(-3.5, 0, k), z: lerp(1.5, 3.7, k), ry: lerp(0.9, 0, k), walk: k < 1, arms: k > 0.7 ? "stop" : "idle" }, t);
      crowdWalk(t, -3);
      camMove([4.6, 2.2, 7.0], [0, 1.2, 4.6], [4.0, 2.0, 6.4], [0, 1.2, 4.6], u);
    }],
    // 4 "Ganz schön viele Smaragde" – über Pauls Schulter
    [sp(4), (t, u) => {
      pose(PAUL, { x: 0, z: 5.5, ry: Math.PI, arms: "hold", item: "stack" }, t);
      pose(MOD, { x: 0, z: 3.7, ry: 0, arms: "talk", hx: Math.sin(t * 4) * 0.08 }, t);
      crowdWalk(t, -1);
      camMove([1.25, 2.5, 8.6], [-0.1, 1.6, 3.6], [1.05, 2.4, 8.1], [-0.1, 1.6, 3.6], u);
    }],
    // 5 Paul: selbst abgebaut / zeigt Spitzhacke
    [sp(5), (t, u) => {
      const showPick = t > Wt(6, "Spitzhacke") - 0.4;
      pose(PAUL, { x: 0, z: 5.5, ry: Math.PI, arms: showPick ? "raiseR" : "talk", item: showPick ? "stack" : null, tool: showPick ? "pick" : null, hx: Math.sin(t * 4) * 0.06 }, t);
      if (!showPick) pose(PAUL, { x: 0, z: 5.5, ry: Math.PI, arms: "holdL", item: "stack", hx: Math.sin(t * 4) * 0.06 }, t);
      pose(MOD, { x: 0, z: 3.7, ry: 0, arms: "idle", hz: Math.sin(t * 1.5) * 0.1 }, t);
      camMove([-1.7, 2.3, 0.6], [0, 1.45, 5.5], [-1.5, 2.2, 1.0], [0, 1.45, 5.5], u);
    }],
    // 7 Der Mod nimmt alle 64
    [sp(7), (t, u) => {
      const tn = Wt(7, "nimmt");
      const taken = t > tn;
      const away = ramp(t, tn + 0.8, S[8]);
      pose(PAUL, { x: 0, z: 5.5, ry: Math.PI, arms: taken ? "sad" : "hold", item: taken ? null : "stack", hx: taken ? 0.25 : 0 }, t);
      pose(MOD, { x: lerp(0, -2.5, away), z: lerp(3.7, 1.2, away), ry: away > 0 ? -2.3 : 0, walk: away > 0 && away < 1, arms: taken ? "hold" : "point", item: taken ? "stack" : null }, t);
      if (taken) OVER.n64 = [lerp(0, -2.5, away), 1.7, lerp(3.9, 1.0, away), 64, tn];
      camMove([4.0, 2.0, 4.8], [-0.3, 1.2, 4.4], [3.6, 2.1, 5.6], [-0.6, 1.2, 4.0], u);
    }],
    // 8 Paul hat keine Regel gebrochen
    [sp(8), (t, u) => {
      pose(PAUL, { x: 0, z: 5.5, ry: 0, arms: "sad", hy: Math.sin(t * 1.2) * 0.3 }, t);
      camMove([0, 1.85, 8.6], [0, 1.4, 5.5], [0, 1.9, 8.0], [0, 1.4, 5.5], u);
    }],
    // 9 Niemand behauptet das – Spieler laufen vorbei
    [sp(9), (t, u) => {
      pose(PAUL, { x: 0, z: 5.5, ry: 0.3, arms: "sad" }, t);
      CROWD.forEach((c, i) => pose(c, { x: -6 + i * 0.6 + (t - S[9]) * 2.2 * (i % 2 ? 1 : -1) + (i % 2 ? 0 : 10), z: 4 - i * 1.4, ry: i % 2 ? Math.PI / 2 : -Math.PI / 2, walk: true }, t + i));
      camMove([-3.5, 3.0, 11.5], [0, 1.0, 3.0], [-2.5, 3.2, 11.0], [0, 1.0, 3.0], u);
    }],
    // 10 Der Mod vermutet nur ... – Smaragde in die Truhe
    [sp(10), (t, u) => {
      const tr = Wt(10, "reicht");
      pose(MOD, { x: -3.2, z: -11.2, ry: t < tr - 0.6 ? Math.PI / 2 : 0, arms: t < tr - 0.6 ? "hold" : "idle", item: t < tr - 0.6 ? "stack" : null }, t);
      setChest(CH_MODS, t > S[10] + 0.8 ? 1 : 0, t > tr - 0.6 ? 6 : 0);
      if (t < tr - 0.6) camMove([-1.0, 3.6, -6.5], [-2.6, 0.8, -11.4], [-1.4, 3.4, -7.4], [-2.6, 0.8, -11.4], ramp(t, S[10], tr - 0.6));
      else cam([-3.2, 1.95, -8.4], [-3.2, 1.75, -11.2]);
    }],
    // 11+12 Paul an der Theke, drei Mods dahinter
    [sp(11), (t, u) => {
      pose(PAUL, { x: -6.5, z: -8.2, ry: Math.PI, arms: S[12] > t ? "talk" : "idle" }, t);
      pose(MOD, { x: -8.3, z: -11.3, ry: 0, arms: t > S[12] ? "talk" : "idle" }, t);
      pose(MOD2, { x: -6.5, z: -11.3, ry: 0 }, t);
      pose(MOD3, { x: -4.7, z: -11.3, ry: 0, hz: Math.sin(t) * 0.1 }, t);
      setChest(CH_MODS, 0, 0);
      camMove([-6.3, 5.4, -3.2], [-6.5, 0.9, -10.0], [-6.3, 4.4, -4.6], [-6.5, 1.0, -10.0], u);
    }],
    // 13 Paul ratlos (von hinter der Theke)
    [sp(13), (t, u) => {
      pose(PAUL, { x: -6.5, z: -8.2, ry: Math.PI, arms: "idle", hz: Math.sin(t * 2) * 0.22 }, t);
      pose(MOD2, { x: -6.5, z: -11.3, ry: 0 }, t);
      camMove([-6.9, 2.5, -11.6], [-6.5, 1.5, -8.2], [-6.7, 2.3, -11.2], [-6.5, 1.5, -8.2], u);
    }],
    // 14 Pauls Truhe zu Hause: kaum noch Smaragde
    [sp(14), (t, u) => {
      pose(PAUL, { x: -0.5, z: 39.6, ry: -Math.PI / 2, arms: "idle", hx: 0.5 }, t);
      setChest(CH_HOME, easeOut(ramp(t, S[14] + 0.2, S[14] + 0.8)), 2);
      camMove([1.9, 4.4, 43.2], [-1.2, 0.5, 39.6], [1.5, 4.0, 42.6], [-1.2, 0.5, 39.6], u);
    }],
    // 15 Paul gibt auf
    [sp(15), (t, u) => {
      const k = ramp(t, S[15], S[16]);
      pose(PAUL, { x: 0, z: lerp(-3, 4, k), ry: 0, walk: true, arms: "sad" }, t);
      CROWD.slice(0, 3).forEach((c, i) => pose(c, { x: -2 + i * 2, z: lerp(-4.5 - i, 2.5 - i, k), ry: 0, walk: true }, t + i));
      camMove([1.2, 4.2, -9.5], [0, 0.8, 1], [0.8, 4.6, -10.5], [0, 0.8, 3], u);
    }],
    // 16+17 Die Mods behalten die Smaragde
    [sp(16), (t, u) => {
      pose(MOD, { x: -8.3, z: -11.3, ry: 0.2, arms: "hold", item: "stack" }, t);
      pose(MOD2, { x: -6.5, z: -11.3, ry: 0, arms: "up" }, t);
      pose(MOD3, { x: -4.7, z: -11.3, ry: -0.2, arms: "hold", item: "stack" }, t);
      setChest(CH_MODS, 1, 6);
      camMove([-5.4, 3.5, -4.6], [-6.5, 1.4, -11], [-6.0, 3.3, -5.3], [-6.5, 1.4, -11], u);
    }],
    // 18 Neue Diamantrüstungen
    [sp(18), (t, u) => {
      [MOD, MOD2, MOD3].forEach((c, i) => pose(c, { x: 5.2 + i * 2, z: 0.5, ry: Math.sin(t * 1.5 + i) * 0.6, armor: true, arms: i === 1 ? "up" : "idle" }, t));
      camMove([7.2, 2.4, 6.2], [7.2, 1.3, -0.5], [7.2, 2.0, 5.2], [7.2, 1.4, -0.5], u);
    }],
    // 19 "Civil Forfeiture" – Totale
    [sp(19), (t, u) => {
      pose(PAUL, { x: 0, z: 6, ry: Math.PI, arms: "hold", item: "stack" }, t);
      pose(MOD, { x: 0, z: 4.2, ry: 0, arms: "stop" }, t);
      [MOD2, MOD3].forEach((c, i) => pose(c, { x: 5.2 + i * 2, z: 0.5, armor: true }, t));
      crowdWalk(t, -6);
      const a = 0.6 + u * 0.4;
      cam([Math.sin(a) * 22, 17, 2 + Math.cos(a) * 22], [-1, 0, -2]);
    }],
    // 20 Die Polizei darf nehmen, ohne Anklage
    [sp(20), (t, u) => {
      const tn = Wt(20, "nehmen");
      const taken = t > tn;
      pose(PAUL, { x: 0, z: 6, ry: Math.PI, arms: taken ? "sad" : "hold", item: taken ? null : "stack" }, t);
      pose(MOD, { x: 0, z: 4.2, ry: 0, arms: taken ? "hold" : "point", item: taken ? "stack" : null }, t);
      camMove([-3.2, 2.0, 5.6], [0, 1.3, 5.0], [-2.8, 1.9, 4.9], [0, 1.3, 5.0], u);
    }],
    // 21 Diebe sollen ihre Beute nicht behalten
    [sp(21), (t, u) => {
      pose(MOD, { x: -3.6, z: -5, ry: Math.PI / 2, armor: true, arms: "point" }, t);
      pose(THIEF, { x: -2.1, z: -5, ry: -Math.PI / 2, tool: "sack", arms: "carry", hx: 0.2 }, t);
      camMove([-3.0, 2.1, 0.2], [-2.85, 1.2, -5], [-2.6, 2.0, -0.4], [-2.85, 1.2, -5], u);
    }],
    // 22 Paul hat alles verloren
    [sp(22), (t, u) => {
      pose(PAUL, { x: -0.4, z: 38.6, ry: 0.5, arms: "sad", hx: 0.35 }, t);
      setChest(CH_HOME, 1, 0);
      camMove([2.2, 1.9, 42.6], [-0.6, 1.1, 38.8], [1.8, 1.8, 41.8], [-0.6, 1.1, 38.8], u);
    }],
    // 23 In echt: Polizei, Auto, Bargeld
    [sp(23), (t, u) => {
      const tc = Wt(23, "Bargeld");
      pose(DRIVER, { x: 70.2, z: 3.6, ry: 0.6, arms: t < tc ? "carry" : "sad", tool: t < tc ? "case" : null }, t);
      pose(COP1, { x: 71.6, z: 4.2, ry: -1.6, arms: t < tc ? "point" : "carry", tool: t > tc ? "case" : null }, t);
      pose(COP2, { x: 72.8, z: 3.6, ry: -2.2, arms: "idle" }, t);
      camMove([69.2, 1.75, 8.3], [71.6, 1.3, 2.6], [69.8, 1.7, 7.6], [72.2, 1.3, 2.4], u);
    }],
    // 24 ... und oft behalten
    [sp(24), (t, u) => {
      const k = ramp(t, S[24], E[24] + 0.2);
      pose(COP1, { x: 84, z: lerp(-3.5, -7.4, k), ry: Math.PI, walk: k < 1, arms: "carry", tool: "case" }, t);
      pose(COP2, { x: 85.3, z: -6.4, ry: -0.5, arms: "idle" }, t);
      camMove([81.2, 2.1, -1.0], [84, 1.6, -7], [81.8, 2.2, -1.6], [84, 1.7, -7], u);
    }],
    // 25 2014: mehr als Einbrecher
    [sp(25), (t, u) => {
      const tb = Wt(25, "Einbrecher");
      pose(THIEF, { x: lerp(62.5, 66, ramp(t, S[25], E[25])), z: -4.5, ry: Math.PI / 2, walk: true, tool: "sack", arms: "carry" }, t);
      pose(COP1, { x: 71.2, z: -3.4, ry: -0.4, arms: "point" }, t);
      pose(COP2, { x: 73.2, z: -3.6, ry: -0.8, arms: "idle" }, t);
      if (t < tb - 0.3) camMove([66.0, 3.0, 9.0], [66.2, 2.2, -8], [66.0, 2.8, 7.6], [66.2, 2.1, -8], ramp(t, S[25], tb - 0.3));
      else camMove([66.0, 2.8, 7.6], [66.2, 2.1, -8], [69.6, 5.4, 4.4], [72.6, 0.9, -5.0], ramp(t, tb - 0.3, E[25]));
    }],
    // 26 Paul hat immer noch keine Farm
    [sp(26), (t, u) => {
      pose(PAUL, { x: 6.6, z: -6.8, ry: Math.PI * 0.95, arms: "sad", hx: -0.15 }, t);
      camMove([9.0, 2.7, -1.2], [6.8, 1.9, -8.6], [8.6, 2.7, -1.8], [6.8, 2.0, -8.6], u);
    }],
    // 27 Die Mods glänzen – und zurück zum Anfang
    [sp(27), (t, u) => {
      const loop = t > Wt(27, "zeigt") - 0.1;
      if (!loop) {
        [MOD, MOD2, MOD3].forEach((c, i) => pose(c, { x: 5.2 + i * 2, z: 0.5 + Math.sin(t * 2 + i) * 0.15, ry: t * 1.4 + i * 2, armor: true, arms: i === 1 ? "up" : "idle" }, t));
        camMove([7.2, 1.9, 5.4], [7.2, 1.5, 0.5], [7.2, 2.2, 4.6], [7.2, 1.4, 0.5], u);
      } else SHOTS[0][1](t, 0);
    }],
  ];
}

// ------------------------------------------------------------------ Bild
function project(x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(camera);
  return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z];
}
function caption(t) {
  // immer nur das aktuelle Wort (wie im Original)
  let cur = null;
  for (const w of WORDS) { if (w.s - 0.03 <= t) cur = w; else break; }
  if (!cur || t > cur.until) return;
  const p = easeOut(ramp(t, cur.s - 0.03, cur.s + 0.09));
  const txt = cur.text;
  let size = 112;
  octx.font = `900 ${size}px InterBlk`;
  const w = octx.measureText(txt).width;
  if (w > 860) size *= 860 / w;
  octx.save();
  octx.translate(CAP_X, CAP_Y);
  octx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
  octx.font = `900 ${size}px InterBlk`;
  octx.textAlign = "center"; octx.textBaseline = "middle";
  octx.lineJoin = "round";
  octx.fillStyle = "rgba(0,0,0,0.55)"; octx.fillText(txt, 7, 9);
  octx.strokeStyle = "rgba(0,0,0,0.75)"; octx.lineWidth = 12; octx.strokeText(txt, 0, 0);
  octx.fillStyle = "#ffffff"; octx.fillText(txt, 0, 0);
  octx.restore();
}
function overlays(t) {
  if (OVER.tag) {
    const [x, y, z, txt] = OVER.tag;
    const [sx, sy] = project(x, y, z);
    octx.font = "600 56px InterSB"; octx.textAlign = "center";
    const w = octx.measureText(txt).width + 30;
    octx.fillStyle = "rgba(0,0,0,0.35)"; octx.fillRect(sx - w / 2, sy - 40, w, 56);
    octx.fillStyle = "#fff"; octx.fillText(txt, sx, sy + 2);
  }
  if (OVER.n64) {
    const [x, y, z, n, t0] = OVER.n64;
    const [sx, sy] = project(x, y, z);
    const p = easeOut(ramp(t, t0 - 0.05, t0 + 0.2));
    octx.save(); octx.translate(sx, sy); octx.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
    octx.font = "900 120px InterBlk"; octx.textAlign = "center"; octx.textBaseline = "middle";
    octx.fillStyle = "rgba(40,40,40,0.9)"; octx.fillText(String(n), 8, 8);
    octx.fillStyle = "#fff"; octx.fillText(String(n), 0, 0);
    octx.restore();
  }
}
let NOISE = [];
function hideAll() { for (const c of CHARS) c.g.visible = false; }

window.renderFrame = function (t) {
  hideAll();
  OVER.tag = null; OVER.n64 = null;
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const t0 = SHOTS[i][0] < 0 ? 0 : SHOTS[i][0];
  const t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : TL.duration;
  SHOTS[i][1](t, ramp(t, t0, t1), t1 - t0);
  renderer.render(scene, camera);
  octx.setTransform(1, 0, 0, 1, 0, 0);
  octx.drawImage(glc, 0, 0);
  // leichte Vignette, damit der Text gut lesbar bleibt
  const vg = octx.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.5, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.3)");
  octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  overlays(t);
  caption(t);
  // kurzes Weiß-Blinzeln bei harten Schnitten vermeiden: nur Ein-/Ausblenden
  const fade = Math.max(1 - ramp(t, 0, 0.2), ramp(t, TL.duration - 0.25, TL.duration));
  if (fade > 0) { octx.fillStyle = `rgba(0,0,0,${fade})`; octx.fillRect(0, 0, W, H); }
};

window.exportEvents = function () {
  return {
    cuts: SHOTS.slice(1).map(s => s[0]),
    mine: [S[1], S[2] - 0.2],
    walk: [[S[2], S[3]], [S[3], S[3] + 1.0], [S[15], S[16]], [S[24], E[24]], [S[25], E[25]]],
    n64: [Wt(2, "64"), Wt(7, "64")],
    stop: S[3] + 0.7,
    take: [Wt(7, "nimmt"), Wt(20, "nehmen")],
    pick: Wt(6, "Spitzhacke"),
    chestOpen: [S[10] + 0.8, S[14] + 0.2],
    emeraldsIn: Wt(10, "reicht") - 0.6,
    armor: S[18], whoosh: S[19], sad: [S[8], S[22]],
    cash: Wt(23, "Bargeld"), door: E[24], sign: S[25], cheer: [S[16], S[27]],
    loop: Wt(27, "zeigt"),
    duration: TL.duration,
  };
};

window.setup = async function (timeline) {
  TL = timeline;
  S = TL.sentences.map(s => s.start);
  E = TL.sentences.map(s => s.end);
  TOK = [];
  for (const c of TL.cards) for (const l of c.lines) for (const k of l) TOK.push({ ...k, si: c.sentence });
  // Wortliste für die Untertitel (ohne reine Satzzeichen); jedes Wort bleibt bis zum nächsten stehen
  WORDS = TOK.filter(k => norm(k.text)).map(k => ({ s: k.s, e: k.e, text: k.text.replace(/[„“"]/g, "") }));
  WORDS.forEach((w, i) => { const nx = WORDS[i + 1]; w.until = nx && nx.s - w.e < 0.7 ? nx.s : w.e + 0.35; });
  // Video endet direkt nach dem letzten Wort (Schleife zum Anfang)
  TL.duration = Math.round((E[E.length - 1] + 0.45) * 100) / 100;
  window.DURATION = TL.duration;
  await Promise.all([document.fonts.load("900 50px InterBlk"), document.fonts.load("600 50px InterSB")]);
  buildTextures();
  buildWorld();
  CH_HOME = chest(-1.6, 39.6, -Math.PI / 2);
  CH_MODS = chest(-2.6, -11.4, 0);
  CH_MODS2 = chest(-10.5, -11.4, 0); setChest(CH_MODS2, 0, 0);
  buildCast();
  buildShots();
  return true;
};
