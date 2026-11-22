// "Was wäre, wenn dein Auto nie aufhört zu beschleunigen?" – 1:1-Nachbau mit deutschen Texten (three.js + 2D-Overlay)
import * as THREE from "./vendor/three.module.min.js";

const W = 1080, H = 1920, GW = 720, GH = 1280;
const out = document.getElementById("c");
const ctx = out.getContext("2d");
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const DUR = 60.4;
const C_KMH = 1079252848.8;

// ---------------------------------------------------------------- Physik: verdoppelt sich alle 2 s, relativistisch ab ~1 % c
const T0 = 0.7;
const vClassic = t => (t < T0 ? 0 : 260 * Math.pow(2, (t - 10) / 2));          // km/h
const rapid = t => vClassic(t) / C_KMH;
const beta = t => Math.tanh(rapid(t));
const gamma = t => Math.cosh(rapid(t));
const dist = t => (t < T0 ? 0 : 208.4 * (Math.pow(2, (t - 10) / 2) - Math.pow(2, (T0 - 10) / 2)));   // Meter

// ---------------------------------------------------------------- three.js Grundgerüst
const glc = document.createElement("canvas"); glc.width = GW; glc.height = GH;
const R = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(GW, GH, false);
R.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(55, GW / GH, 0.6, 60000);
const hemi = new THREE.HemisphereLight(0xdfeeff, 0x8a7a5a, 1.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.2); sun.position.set(-40, 80, 30); scene.add(sun);
const fog = new THREE.Fog(0xcfdbe6, 120, 900); scene.fog = fog;

function canvasTex(w, h, fn, rep) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.anisotropy = 4; return t; }
const lam = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));

// Himmel als Hintergrund
const skyTex = {
  city: canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5f8fc8"); gr.addColorStop(0.55, "#a9c6e2"); gr.addColorStop(1, "#e6e2da"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
  desert: canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#7fa6cf"); gr.addColorStop(0.5, "#c8d4dc"); gr.addColorStop(1, "#e8d6b8"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
  haze: canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6f8fbf"); gr.addColorStop(0.45, "#b8bfc9"); gr.addColorStop(1, "#b39776"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
  high: canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2a4f9a"); gr.addColorStop(0.55, "#8faad0"); gr.addColorStop(1, "#d6dbe4"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
};

// ---------------------------------------------------------------- Auto (Low-Poly)
function makeCar(color, o = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 4.1), lam(color)); body.position.y = 0.62; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.72, o.van ? 1.3 : 0.62, o.van ? 3.2 : 2.3), lam(color)); cab.position.set(0, o.van ? 1.6 : 1.3, o.van ? 0.3 : 0.45); g.add(cab);
  const glass = lam(0x2b3442, { emissive: 0x0c1220 });
  const fw = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.05), glass); fw.position.set(0, o.van ? 1.75 : 1.3, o.van ? -1.31 : -0.72); fw.rotation.x = -0.25; g.add(fw);
  const rw = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.48, 0.05), glass); rw.position.set(0, o.van ? 1.75 : 1.32, o.van ? 1.91 : 1.62); g.add(rw);
  for (const sd of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.44, o.van ? 2.8 : 1.9), glass); sw.position.set(sd * 0.87, o.van ? 1.75 : 1.32, o.van ? 0.3 : 0.45); g.add(sw); }
  const tl = lam(0xd81a1a, { emissive: 0x8a0606 }); for (const sd of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.06), tl); l.position.set(sd * 0.7, 0.78, 2.07); g.add(l); }
  const hl = lam(0xfff6d8, { emissive: 0xcfc6a0 }); for (const sd of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.06), hl); l.position.set(sd * 0.68, 0.74, -2.07); g.add(l); }
  const bump = lam(0x5a5f68); for (const z of [-2.1, 2.1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.22, 0.12), bump); b.position.set(0, 0.36, z); g.add(b); }
  const wg = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 10); wg.rotateZ(Math.PI / 2); const wm = lam(0x1d1f24); const hub = lam(0xb9bec6);
  for (const sx of [-0.92, 0.92]) for (const sz of [-1.35, 1.35]) { const w = new THREE.Mesh(wg, wm); w.position.set(sx, 0.36, sz); g.add(w); const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 8).rotateZ(Math.PI / 2), hub); hb.position.copy(w.position); g.add(hb); }
  if (o.police) { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.16, 0.3), lam(0x2a6aff, { emissive: 0x1030ff })); bar.position.set(0, 1.7, 0.4); g.add(bar); const st = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.18, 4.12), lam(0xf4f4f4)); st.position.y = 0.66; g.add(st); }
  if (o.taxi) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.3), lam(0xfff3c0)); s.position.set(0, 1.72, 0.4); g.add(s); }
  if (o.van) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.28, 3.3), lam(0xd83030)); s.position.set(0, 1.2, 0.3); g.add(s); }
  return g;
}
const hero = makeCar(0xd8221e); scene.add(hero);

// ---------------------------------------------------------------- Stadt
const city = new THREE.Group(); scene.add(city);
const L = 1600;
const asphalt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#3b3d42"; g.fillRect(0, 0, w, h); const r = rnd(2); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 2, 2); } }, [6, 400]);
const road = new THREE.Mesh(new THREE.PlaneGeometry(30, 20000), new THREE.MeshLambertMaterial({ map: asphalt })); road.rotation.x = -Math.PI / 2; city.add(road);
const median = new THREE.Mesh(new THREE.PlaneGeometry(5, 20000), lam(0x3f8a2f)); median.rotation.x = -Math.PI / 2; median.position.set(-17.5, 0.03, 0); city.add(median);
const median2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 20000), lam(0x3f8a2f)); median2.rotation.x = -Math.PI / 2; median2.position.set(17, 0.03, 0); city.add(median2);
const walk = new THREE.Mesh(new THREE.PlaneGeometry(200, 20000), lam(0xc9c2b4)); walk.rotation.x = -Math.PI / 2; walk.position.y = -0.02; city.add(walk);
// Fahrbahnmarkierungen (Instanzen, wandern mit)
const dashGeo = new THREE.PlaneGeometry(0.25, 4).rotateX(-Math.PI / 2);
const dashes = new THREE.InstancedMesh(dashGeo, new THREE.MeshBasicMaterial({ color: 0xf4f2ea }), 800); city.add(dashes);
const edgeGeo = new THREE.PlaneGeometry(0.4, 20000).rotateX(-Math.PI / 2);
for (const x of [-14.6, 14.6]) { const e = new THREE.Mesh(edgeGeo, new THREE.MeshBasicMaterial({ color: 0xf4f2ea })); e.position.set(x, 0.04, 0); city.add(e); }
const zebra = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xf2f0ea }), 400); city.add(zebra);

// Gebäude: Prototypen mit Fenstertextur
function winTex(base, win, cols, rows) { return canvasTex(256, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { g.fillStyle = win; g.fillRect(c * cw + cw * 0.2, r * rh + rh * 0.22, cw * 0.6, rh * 0.56); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(c * cw + cw * 0.2, r * rh + rh * 0.22, cw * 0.6, rh * 0.12); } }); }
const PROTOS = [
  { w: 22, h: 24, d: 22, tex: winTex("#e8dcc4", "#6f8fae", 6, 7) },
  { w: 18, h: 32, d: 20, tex: winTex("#c9785a", "#5e7d98", 5, 9) },
  { w: 26, h: 18, d: 24, tex: winTex("#d8cfc0", "#7a96b0", 7, 5) },
  { w: 20, h: 48, d: 22, tex: winTex("#b9b3aa", "#4f6a86", 5, 14) },
  { w: 24, h: 70, d: 24, tex: winTex("#8a9bb0", "#3a5470", 6, 20) },
  { w: 16, h: 28, d: 18, tex: winTex("#e2c9a0", "#6a88a6", 4, 8) },
  { w: 30, h: 120, d: 30, tex: winTex("#9aa4b4", "#2f4a68", 8, 34) },
  { w: 28, h: 160, d: 28, tex: winTex("#c48a6a", "#3f5a78", 7, 44) },
];
const bR = rnd(11);
const buildings = PROTOS.map(p => {
  const n = 46;
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(p.w, p.h, p.d), [lam(0xffffff, { map: p.tex }), lam(0xffffff, { map: p.tex }), lam(0x9a9284), lam(0x9a9284), lam(0xffffff, { map: p.tex }), lam(0xffffff, { map: p.tex })], n);
  m.userData.items = Array.from({ length: n }, () => { const side = bR() < 0.5 ? -1 : 1; return { x: side * (34 + p.w / 2 + bR() * 30), z: -bR() * L, y: p.h / 2 }; });
  city.add(m); return m;
});
// Bäume
const tree = new THREE.InstancedMesh(new THREE.ConeGeometry(1.8, 6, 7).translate(0, 5, 0), lam(0x3f8a6a), 260);
const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.3, 2.4, 6).translate(0, 1.2, 0), lam(0x6a4a30), 260);
city.add(tree, trunk);
const treeItems = Array.from({ length: 260 }, (_, i) => ({ x: [-17.5, 17, -24, 24][i % 4] + (bR() - 0.5), z: -bR() * L }));
// Ampeln
const poleGeo = new THREE.BoxGeometry(0.3, 7, 0.3).translate(0, 3.5, 0), armGeo = new THREE.BoxGeometry(12, 0.3, 0.3).translate(6, 7, 0), lightGeo = new THREE.BoxGeometry(0.7, 1.8, 0.6).translate(11, 6.2, 0);
const poles = new THREE.InstancedMesh(poleGeo, lam(0x2a2d33), 30), arms = new THREE.InstancedMesh(armGeo, lam(0x2a2d33), 30), lights = new THREE.InstancedMesh(lightGeo, lam(0x22252b), 30);
const redL = new THREE.InstancedMesh(new THREE.SphereGeometry(0.28, 8, 6).translate(11, 6.7, 0.32), new THREE.MeshBasicMaterial({ color: 0xff2a1a }), 30);
city.add(poles, arms, lights, redL);
const INTER = 160;
// Verkehr
const TRAFFIC = [];
const tr = rnd(5);
const tcol = [[0xf2c230, { taxi: true }], [0xf2c230, { taxi: true }], [0xeae6de, {}], [0x3a6ac8, {}], [0x9aa0a8, {}], [0x4a4e56, {}], [0xf2c230, { taxi: true }], [0xffffff, { van: true }]];
for (let i = 0; i < 46; i++) { const [c, o] = tcol[i % tcol.length]; const car = makeCar(c, o); const lanes = [-10.5, -3.5, 3.5, 10.5]; car.userData = { x: lanes[Math.floor(tr() * 4)], z0: -tr() * 900 + 120, v: 9 + tr() * 6 }; TRAFFIC.push(car); city.add(car); }
const police = makeCar(0x1a3a8a, { police: true }); city.add(police);

// Staub / Trümmer
function softTex(col) { return canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }); }
const dustMat = new THREE.SpriteMaterial({ map: softTex("rgba(214,186,140,0.9)"), depthWrite: false, fog: true });
const dust = []; const dr = rnd(9);
for (let i = 0; i < 160; i++) { const s = new THREE.Sprite(dustMat.clone()); s.userData = { ox: (dr() - 0.5) * 2, oy: dr(), oz: dr(), ph: dr() }; s.visible = false; city.add(s); dust.push(s); }
const debris = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam(0x7a8a9a), 120); city.add(debris);
const debItems = Array.from({ length: 120 }, () => ({ x: (dr() - 0.5) * 60, y: 10 + dr() * 60, z: (dr() - 0.5) * 200, vx: (dr() - 0.5) * 30, vy: 5 + dr() * 20, vz: (dr() - 0.5) * 40, s: 0.4 + dr() * 1.8, r: dr() * 6 }));

const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sv = new THREE.Vector3(1, 1, 1);
const wrapZ = (z0, ref, ahead = 80) => ref + ahead - (((ref + ahead - z0) % L) + L) % L;

function updateCity(t, ref, o = {}) {
  city.visible = true;
  const dl = 18; let k = 0;
  for (let i = 0; i < 800 && k < 800; i++) { const z = wrapZ(-i * 10, ref, 60); for (const x of [-7, 0, 7]) { if (k >= 800) break; M4.makeTranslation(x, 0.05, z); dashes.setMatrixAt(k++, M4); } }
  dashes.count = k; dashes.instanceMatrix.needsUpdate = true;
  k = 0; for (let n = 0; n < 12; n++) { const zi = wrapZ(-n * INTER, ref, 120); for (let j = -5; j <= 5; j++) { if (k >= 400) break; M4.makeTranslation(j * 2.6, 0.06, zi); zebra.setMatrixAt(k++, M4); } } zebra.count = k; zebra.instanceMatrix.needsUpdate = true;
  k = 0; for (let n = 0; n < 12; n++) { const zi = wrapZ(-n * INTER, ref, 120) - 6; M4.makeTranslation(-15.5, 0, zi); for (const m of [poles, arms, lights, redL]) m.setMatrixAt(k, M4); k++; } for (const m of [poles, arms, lights, redL]) { m.count = k; m.instanceMatrix.needsUpdate = true; }
  buildings.forEach((m, pi) => { const tall = pi >= 6; m.userData.items.forEach((it, i) => { const z = wrapZ(it.z, ref, 200); const sc = tall ? (o.downtown ? 1 : 0.0001) : 1; M4.compose(V.set(it.x, it.y * sc, z), Q.identity(), Sv.set(1, sc, 1)); m.setMatrixAt(i, M4); }); m.instanceMatrix.needsUpdate = true; });
  treeItems.forEach((it, i) => { M4.makeTranslation(it.x, 0, wrapZ(it.z, ref, 150)); tree.setMatrixAt(i, M4); trunk.setMatrixAt(i, M4); }); tree.instanceMatrix.needsUpdate = trunk.instanceMatrix.needsUpdate = true;
  for (const c of TRAFFIC) { const u = c.userData; const z = wrapZ(u.z0 - u.v * t, ref, 150); c.position.set(u.x, 0, z); c.rotation.set(0, 0, 0); c.visible = !o.noTraffic && !(o.camZ !== undefined && z > o.camZ - 22 && z < o.camZ + 6 && Math.abs(u.x - o.camX) < 6); }
}

// ---------------------------------------------------------------- Wüste / Felder
const fieldTex = canvasTex(512, 512, (g, w, h) => { const r = rnd(4); g.fillStyle = "#b39a6c"; g.fillRect(0, 0, w, h); const cols = ["#b99a6a", "#c8a878", "#a88a5a", "#8fa25a", "#a8b46a", "#c4b080", "#9a8a5a"]; for (let i = 0; i < 70; i++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(r() * w, r() * h, 40 + r() * 140, 30 + r() * 120); } }, [60, 60]);
const desert = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshLambertMaterial({ map: fieldTex })); desert.rotation.x = -Math.PI / 2; scene.add(desert);
const dRoad = new THREE.Mesh(new THREE.PlaneGeometry(12, 40000), lam(0x3a3b40)); dRoad.rotation.x = -Math.PI / 2; dRoad.position.y = 0.05; scene.add(dRoad);
const dLine = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 40000), new THREE.MeshBasicMaterial({ color: 0xf2efe6 })); dLine.rotation.x = -Math.PI / 2; dLine.position.y = 0.08; scene.add(dLine);
// Wolken
const cloudMat = new THREE.SpriteMaterial({ map: softTex("rgba(255,255,255,1)"), depthWrite: false, fog: false });
const clouds = []; const cr = rnd(13);
for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(cloudMat); s.userData = { x: (cr() - 0.5) * 900, z: -cr() * 1800, y: 1500 + cr() * 900, s: 120 + cr() * 220 }; s.scale.set(s.userData.s * 1.6, s.userData.s, 1); scene.add(s); clouds.push(s); }

// Hitzeschild vor dem Auto (Plasma)
const plasmaTex = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, "rgba(255,240,210,0.0)"); gr.addColorStop(0.45, "rgba(255,210,170,0.35)"); gr.addColorStop(0.8, "rgba(240,150,110,0.75)"); gr.addColorStop(1, "rgba(240,150,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); const r = rnd(3); g.strokeStyle = "rgba(255,230,200,0.6)"; g.lineWidth = 2; for (let i = 0; i < 90; i++) { const a = r() * 6.28; g.beginPath(); g.moveTo(128 + Math.cos(a) * 50, 128 + Math.sin(a) * 50); g.lineTo(128 + Math.cos(a) * 118, 128 + Math.sin(a) * 118); g.stroke(); } });
const plasma = new THREE.Sprite(new THREE.SpriteMaterial({ map: plasmaTex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); scene.add(plasma);

// ---------------------------------------------------------------- Weltraum
const starGeo = new THREE.BufferGeometry(); { const r = rnd(21), n = 5000, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * 6.283, s = Math.sqrt(1 - u * u); p.set([s * Math.cos(a) * 20000, u * 20000, s * Math.sin(a) * 20000], i * 3); } starGeo.setAttribute("position", new THREE.BufferAttribute(p, 3)); }
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true });
const stars = new THREE.Points(starGeo, starMat); scene.add(stars);
const earthTex = canvasTex(2048, 1024, (g, w, h) => {
  g.fillStyle = "#1d3f78"; g.fillRect(0, 0, w, h); const r = rnd(7);
  for (let i = 0; i < 90; i++) { const x = r() * w, y = h * 0.15 + r() * h * 0.7, s = 40 + r() * 220; g.fillStyle = ["#4f6a3a", "#7a7048", "#5a7a42", "#9a8656"][Math.floor(r() * 4)]; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, q = s * (0.6 + r() * 0.5); g.lineTo(x + Math.cos(a) * q * 1.4, y + Math.sin(a) * q * 0.7); } g.fill(); }
  g.fillStyle = "rgba(255,160,70,0.55)"; for (let i = 0; i < 2500; i++) { const x = r() * w, y = h * 0.25 + r() * h * 0.5; g.fillRect(x, y, 2, 2); }
  for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, s = 30 + r() * 140; const gr = g.createRadialGradient(x, y, 2, x, y, s); gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2); }
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(1000, 96, 64), new THREE.MeshLambertMaterial({ map: earthTex })); scene.add(earth);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(1035, 96, 64), new THREE.MeshBasicMaterial({ color: 0x4f8fff, transparent: true, opacity: 0.22, side: THREE.BackSide, blending: THREE.AdditiveBlending, fog: false })); scene.add(atmo);
const moon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 24), lam(0xc8c8cc, { flatShading: false })); scene.add(moon);

// ---------------------------------------------------------------- Kamera-Helfer
const look = new THREE.Vector3();
function setCam(px, py, pz, lx, ly, lz, fov = 55, roll = 0) { cam.position.set(px, py, pz); look.set(lx, ly, lz); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(look); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } }
function show(o) { city.visible = !!o.city; desert.visible = dRoad.visible = dLine.visible = !!o.desert; for (const c of clouds) c.visible = !!o.clouds; stars.visible = !!o.stars; earth.visible = atmo.visible = !!o.earth; moon.visible = !!o.moon; plasma.visible = !!o.plasma; police.visible = !!o.police; for (const d of dust) d.visible = false; debris.visible = false; hero.visible = o.hero !== false; scene.fog = o.fog === false ? null : fog; }

// ---------------------------------------------------------------- 3D-Szenen pro Zeitabschnitt
function render3D(t) {
  const d = dist(t), hz = -d;
  hero.rotation.set(0, 0, 0); hero.scale.set(1, 1, 1);
  if (t < 16.5) {
    show({ city: true, police: t >= 8 && t < 12.2, hero: true });
    scene.background = skyTex.city; fog.color.set(0xcfdbe6); fog.near = 150; fog.far = 1000;
    hero.position.set(3.5, 0, hz);
    const pz = hz + lerp(14, 160, ss(9.4, 12.2, t)); police.position.set(-3.5, 0, pz); police.rotation.set(0, 0, 0);
    if (t < 1.6) setCam(3.5, 1.15, hz + 0.2, 3.2, 1.0, hz - 40, 62);
    else if (t < 5.3) { const back = lerp(75, 10, ss(1.6, 5.3, t)); setCam(1.2, lerp(1.1, 2.0, ss(1.6, 5.3, t)), hz + back, 2.5, 1.0, hz - 30, 50); }
    else if (t < 8.0) setCam(5.8, 1.35, hz + 6.4, 2.6, 1.0, hz - 14, 58);
    else if (t < 10.0) setCam(-6 + (t - 8), 3.2, hz + 26, 1, 1.5, hz - 60, 52);
    else if (t < 12.2) setCam(-1.5, 3.4, pz + 11, -2, 1.4, pz - 40, 52);
    else if (t < 14.2) { const sw = Math.sin(t * 2.4) * 2.2; hero.position.x = 3.5 + sw; setCam(3.5 + sw * 0.8, 0.9, hz + 5.2, 3.2 + sw, 0.9, hz - 30, 66, Math.sin(t * 2.4) * 0.05); }
    else { setCam(2, 9, hz + 34, 3.5, 2, hz - 60, 56); }
    updateCity(t, hz, { downtown: t > 12, camZ: cam.position.z, camX: cam.position.x });
    hero.visible = t >= 1.6;
    if (t >= 14.2 && t < 16.5) { // Dampfkegel / Staub hinter dem Auto
      dust.forEach((s, i) => { const u = s.userData, age = t - 14.2 - u.ph * 0.5; if (age < 0) return; s.visible = true; s.position.set(3.5 + u.ox * (4 + age * 14), 1 + u.oy * (2 + age * 10), hz + 6 + u.oz * 80 * age); const sc = 6 + age * 26; s.scale.set(sc, sc, 1); s.material.opacity = clamp(0.18 - age * 0.08); }); }
    return;
  }
  if (t < 21) {
    show({ city: true, hero: false, noTraffic: false });
    scene.background = skyTex.city; fog.color.set(0xd8cdb8); fog.near = 80; fog.far = 900;
    const ref = -dist(16.5);
    updateCity(t, ref, { downtown: true });
    debris.visible = true;
    if (t < 19) {
      const pass = 16.7, age = Math.max(0, t - pass);
      setCam(-10, 26, ref - 120, 4, 6, ref - 20 + age * 12, 60, 0.08);
      for (const c of TRAFFIC) if (age > 0 && Math.abs(c.position.z - (ref - 120)) < 200) { c.position.y = age * age * 6 * (0.4 + (c.userData.v % 1)); c.rotation.set(age * 2.2, age * 1.4, age); c.position.x += Math.sign(c.position.x) * age * 9; }
      debItems.forEach((it, i) => { M4.compose(V.set(it.x + it.vx * age, it.y + it.vy * age - 4.9 * age * age * 0.2, ref - 120 + it.z + it.vz * age), Q.setFromEuler(new THREE.Euler(it.r + age * 3, it.r * 2 + age * 2, 0)), Sv.set(it.s, it.s * 0.1, it.s)); debris.setMatrixAt(i, M4); }); debris.count = age > 0 ? 120 : 0; debris.instanceMatrix.needsUpdate = true;
      dust.forEach((s) => { const u = s.userData; const a2 = age - u.ph * 0.4; if (a2 <= 0) return; s.visible = true; s.position.set(u.ox * 18, 2 + u.oy * (6 + a2 * 22), ref - 120 + (u.oz - 0.5) * 260); const sc = 14 + a2 * 30; s.scale.set(sc, sc, 1); s.material.opacity = clamp(0.85 - a2 * 0.1); });
    } else {
      const k = ss(19, 21, t);
      setCam(0, 140 + k * 40, ref - 300 + k * -120, 0, 0, ref - 1400, 50);
      updateCity(t, cam.position.z - 60, { downtown: true }); fog.near = 300; fog.far = 3200;
      debris.count = 0;
      dust.forEach((s, i) => { const u = s.userData; s.visible = true; s.position.set(u.ox * 12, 3 + u.oy * 14, ref - 300 - u.oz * 1200 * (0.3 + k)); s.scale.set(40, 30, 1); s.material.opacity = 0.75; });
      for (const c of TRAFFIC) c.visible = false;
    }
    return;
  }
  if (t < 31) {
    show({ desert: true, clouds: t > 28.5, plasma: t > 22.8, fog: true });
    const alt = t < 25.5 ? 0 : Math.pow(t - 25.5, 3) * 14;
    scene.background = t < 28.5 ? skyTex.desert : skyTex.haze; fog.color.set(0xe0d2b8); fog.near = 400; fog.far = 12000 + alt * 4;
    const z = -(t - 21) * 900;
    dRoad.position.z = dLine.position.z = z; desert.position.z = z;
    fieldTex.offset.y = (t - 21) * 1.6;
    if (t < 23) { hero.visible = false; setCam(0, 1.2, z, 0, 1.0, z - 100, 62); }
    else if (t < 25.5) { hero.position.set(0, 0, z); setCam(-14, 2.4, z - 1, 0, 1.0, z - 1, 30); hero.position.y = 0.05 * Math.sin(t * 40); plasma.position.set(0, 1.0, z - 3.0); plasma.scale.set(4.2, 4.2, 1); }
    else {
      hero.position.set(0, alt + 1, z); hero.rotation.x = 0.35 * ss(25.5, 26.5, t); dLine.visible = false;
      setCam(0, alt + 7, z + 13, 0, alt - 6, z - 25, 55);
      plasma.position.set(0, alt + 1.6, z - 1.5); plasma.scale.set(7.5, 7.5, 1);
      for (const c of clouds) { const u = c.userData; c.position.set(u.x, u.y, z - 200 + u.z * 0.4); }
    }
    return;
  }
  // Weltraum-Teil: Auto im Ursprung, Kamera relativ dazu
  show({ stars: t > 34.2, earth: t > 38.7 && t < 44.2, moon: t > 47.5 && t < 52.5, plasma: t < 35.2, fog: false, hero: t < 55.5 });
  starMat.opacity = ss(34.2, 36, t);
  scene.background = t < 34.2 ? skyTex.high : new THREE.Color(0x000000);
  hero.position.set(0, 0, 0);
  if (t < 35.2) { hero.rotation.set(-0.5, 0.15, 0); setCam(1.4, 3.2, 8.5, 0, 0.5, -4, 50); plasma.position.set(0, 0.4, -1.6); const ps = 5 * (1 - ss(32.8, 35.0, t)) + 0.01; plasma.scale.set(ps, ps, 1); }
  else if (t < 39) { hero.rotation.set(-0.35, 0.45, 0.05); setCam(-3.0, -1.6, 15, -1.7, -0.9, 0, 45); }
  else if (t < 44) {
    const k = ss(39, 44, t);
    earth.position.set(-200, -1000 - lerp(14, 60, k), -lerp(60, 160, k)); atmo.position.copy(earth.position); earth.rotation.set(Math.PI / 2.4, t * 0.01, 0.4);
    hero.rotation.set(-0.2, 0.1, 0); setCam(0.3, 3.2, 11, 0, -2.6, -8, 55);
  } else if (t < 53) { hero.rotation.set(-0.3, -0.35, 0); setCam(-2.0, -1.0, 14, -1.1, 0.1, 0, 42); moon.position.set(lerp(-16, -6, ss(47.5, 52, t)), lerp(34, 16, ss(47.5, 52, t)), lerp(-150, -50, ss(47.5, 52.5, t))); }
  else { hero.rotation.set(-0.15, -0.3, 0); setCam(-1.6, 2.4, 7.0 - (t - 53) * 0.3, -0.7, 2.3, -3, 55); }
}

// ---------------------------------------------------------------- 2D-Overlay
const fmt = (n, dec = 0) => n.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
function speedLabel(v, t) {
  if (t < T0) return "DRÜCK DEN KNOPF";
  const L = [[12, "SCHRITTTEMPO"], [25, "WIE EIN FAHRRAD"], [45, "WIE EIN MOFA"], [70, "TEMPOLIMIT IN DER STADT"], [150, "SCHNELLER ALS AUF DER LANDSTRASSE"], [300, "SCHNELLER ALS AUF DER AUTOBAHN"], [360, "SCHNELLER ALS EIN ICE"], [900, "SCHNELLER ALS EIN FORMEL-1-AUTO"], [1235, "SCHNELLER ALS EIN PASSAGIERJET"], [4000, "SCHNELLER ALS DER SCHALL"], [28000, "SCHNELLER ALS DER SCHNELLSTE JET"], [40270, "ORBITALGESCHWINDIGKEIT"], [700000, "SCHNELLER ALS DIE FLUCHTGESCHWINDIGKEIT"]];
  for (const [lim, s] of L) if (v < lim) return s;
  return "SCHNELLER ALS JEDES RAUMSCHIFF";
}
function hud(t) {
  if (t > 59.95) return;
  const x = 28;
  const b = beta(t), v = vClassic(t);
  const light = b >= 0.0112;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "600 17px Sans"; ctx.letterSpacing = "1.5px"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(light ? "DEIN TEMPO · % DER LICHTGESCHWINDIGKEIT" : "DEIN TEMPO", x, 806);
  ctx.letterSpacing = "0px";
  let big;
  if (!light) big = `${fmt(Math.round(t < T0 ? 0 : v))} km/h`;
  else { const p = b * 100; let dec; if (b < 0.99) dec = Math.max(0, 2 - Math.floor(Math.log10(p))); else dec = Math.max(1, Math.ceil(-Math.log10(100 - p))) + 1; big = `${fmt(p, Math.min(dec, 6))} %`; }
  ctx.fillStyle = "#ffffff"; ctx.font = "104px Serif"; ctx.fillText(big, x - 4, 892);
  ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = "600 15px Sans"; ctx.letterSpacing = "1.2px";
  let sub;
  if (!light) sub = speedLabel(v, t);
  else { const g = gamma(t); sub = g < 1.25 ? `${fmt(Math.round(b * C_KMH))} KM/H` : `DIE ZEIT LÄUFT ${g < 10 ? fmt(g, 1) : fmt(Math.round(g))}× LANGSAMER FÜR DICH`; }
  ctx.fillText(sub, x, 930);
  if (t >= T0) { ctx.fillStyle = "#e8322a"; ctx.beginPath(); ctx.arc(x + 7, 966, 6, 0, 7); ctx.fill(); const rem = 2 - (((t - 10) % 2) + 2) % 2; ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillText(`×2 IN ${fmt(rem, 1)} S`, x + 22, 972); }
  ctx.restore();
}

const CAPS = [
  [0.0, 2.45, ["Was wäre, wenn dein Auto", "nie aufhört zu beschleunigen?"]],
  [2.5, 5.35, ["Dein Tempo verdoppelt sich", "alle 2 Sekunden."]],
  [5.45, 7.85, ["5 Sekunden:", "Tempolimit in der Stadt."]],
  [8.0, 9.95, ["Rote Ampel.", "*Du kannst nicht bremsen.*"]],
  [10.05, 11.95, ["Die Polizei versucht zu folgen …"]],
  [12.0, 14.05, ["… für etwa eine Sekunde."]],
  [14.45, 16.6, ["*BUMM.*", "Die Schallmauer."]],
  [16.95, 18.7, ["Jedes Fenster zerspringt."]],
  [18.9, 20.9, ["Deine Druckwelle walzt", "alles hinter dir platt."]],
  [21.0, 23.1, ["Die Luft wird zu Feuer", "um dich herum."]],
  [23.4, 25.15, ["Orbitalgeschwindigkeit: Die Straße", "krümmt sich unter dir weg."]],
  [25.4, 27.4, ["Fluchtgeschwindigkeit.", "Die Schwerkraft lässt los."]],
  [27.7, 30.9, ["Du steigst schneller", "als jede Rakete."]],
  [31.0, 32.9, ["Höher als der Everest."]],
  [32.95, 34.7, ["Das Glühen verblasst:", "keine Luft mehr zum Verbrennen."]],
  [34.9, 36.45, ["Der Himmel wird schwarz."]],
  [36.55, 38.7, ["Du kreuzt die Bahn", "der Raumstation."]],
  [38.9, 41.1, ["Die Erde schrumpft hinter dir."]],
  [41.4, 44.1, ["Alle 2 Sekunden legst du mehr zurück", "als auf der ganzen bisherigen Fahrt."]],
  [44.4, 46.6, ["Du passierst die Satelliten,", "36.000 km hoch."]],
  [46.9, 48.7, ["10 % der Lichtgeschwindigkeit."]],
  [48.9, 50.7, ["Der Mond: 384.400 km entfernt …"]],
  [50.9, 52.7, ["… weg in einem Wimpernschlag."]],
  [52.9, 55.4, ["Jetzt greift die Relativität:", "Die Sterne drängen sich vor dir."]],
  [55.5, 57.4, ["Jeder Schub bringt", "nur noch mehr Neunen."]],
  [57.45, 59.3, ["1 Sekunde für dich =", "@"]],
  [59.4, 59.95, ["*Aber nie 100 %.*"]],
];
function earthTime(t) { const g = gamma(t); if (g < 120) return `${fmt(Math.round(g))} Sekunden auf der Erde.`; return `${fmt(g / 60, 1)} Minuten auf der Erde.`; }
function captions(t) {
  const c = CAPS.find(c => t >= c[0] && t < c[1]); if (!c) return;
  const a = Math.min(ss(c[0], c[0] + 0.2, t), 1 - ss(c[1] - 0.2, c[1], t));
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 10;
  c[2].forEach((l, i) => {
    if (l === "@") l = earthTime(t);
    const it = l.startsWith("*"); l = l.replace(/\*/g, "");
    let fs = 50; ctx.font = `${it ? "italic " : ""}${fs}px Serif`; while (ctx.measureText(l).width > 960) { fs--; ctx.font = `${it ? "italic " : ""}${fs}px Serif`; }
    ctx.fillStyle = "#ffffff"; ctx.fillText(l, 540, 1292 + i * 60);
  });
  ctx.restore();
}

// Cockpit (Innenansicht)
function cockpit(t, o = {}) {
  ctx.save();
  ctx.fillStyle = o.light ? "#5a4038" : "#141216";
  ctx.beginPath(); ctx.moveTo(0, 1300); ctx.quadraticCurveTo(540, 1220, 1080, 1300); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.fill();
  ctx.fillStyle = "#1e1b20"; ctx.beginPath(); ctx.ellipse(540, 1960, 520, 380, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = "#2c282e"; ctx.lineWidth = 60; ctx.beginPath(); ctx.ellipse(240, 1900, 330, 300, 0, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
  // Tacho-Bogen
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(540, 1900, 230, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.font = "600 30px Sans"; ctx.textAlign = "center"; ctx.fillText("80", 450, 1715); ctx.fillText("160", 640, 1715);
  ctx.strokeStyle = "#e8322a"; ctx.lineWidth = 6; const a = Math.PI * (1.2 + 0.6 * clamp(t < 2 ? t / 2 : 1)); ctx.beginPath(); ctx.moveTo(540, 1900); ctx.lineTo(540 + Math.cos(a) * 210, 1900 + Math.sin(a) * 210); ctx.stroke();
  if (o.button) {
    const press = ss(0.45, 0.65, t) * (1 - ss(0.9, 1.2, t));
    ctx.save(); ctx.translate(720, 1060); ctx.rotate(-0.2);
    ctx.fillStyle = "#f2c230"; ctx.beginPath(); ctx.ellipse(0, 30, 150, 70, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#1e1e1e"; ctx.lineWidth = 14; for (let k = -6; k < 7; k++) { ctx.beginPath(); ctx.moveTo(k * 26 - 20, -10); ctx.lineTo(k * 26 + 20, 70); ctx.stroke(); }
    ctx.fillStyle = "#1e1e1e"; ctx.font = "800 34px Sans"; ctx.fillText("BOOST", 40, 96);
    ctx.fillStyle = "#8a1010"; ctx.beginPath(); ctx.ellipse(0, 22 + press * 10, 70, 34, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#e8301e"; ctx.beginPath(); ctx.ellipse(0, 6 + press * 16, 70, 34, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(-20, -6 + press * 16, 26, 10, -0.3, 0, 7); ctx.fill();
    ctx.restore();
    // Hand
    const hy = lerp(-220, 0, ss(0.15, 0.55, t)) * (1 - ss(1.0, 1.5, t)) + (1 - ss(0.15, 0.55, t)) * 0;
    ctx.save(); ctx.translate(820 + hy * -0.4, 900 + hy); ctx.rotate(-0.55);
    ctx.fillStyle = "#e8c4a0"; ctx.beginPath(); ctx.roundRect(-60, -40, 380, 150, 60); ctx.fill();
    ctx.fillStyle = "#dcb490"; ctx.beginPath(); ctx.roundRect(-140, 10, 170, 56, 28); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function fireRays(t, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = "lighter";
  const cx = 540, cy = 1010;
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 900); g.addColorStop(0, "rgba(255,230,180,0.9)"); g.addColorStop(0.3, "rgba(255,160,90,0.45)"); g.addColorStop(1, "rgba(200,90,60,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rnd(4);
  for (let i = 0; i < 70; i++) { const ang = r() * Math.PI * 2, w = 0.01 + r() * 0.03, fl = 0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i)); ctx.fillStyle = `rgba(255,${180 + r() * 60 | 0},${120 + r() * 80 | 0},${0.25 * fl})`; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang - w) * 1400, cy + Math.sin(ang - w) * 1400); ctx.lineTo(cx + Math.cos(ang + w) * 1400, cy + Math.sin(ang + w) * 1400); ctx.fill(); }
  ctx.restore();
}
function limb(t, a) {           // Erdhorizont von oben (31–35 s)
  ctx.save(); ctx.globalAlpha = a;
  const y = lerp(2600, 1620, ss(32.5, 35, t)), R2 = 2400;
  const g = ctx.createRadialGradient(540, y + R2, R2 - 10, 540, y + R2, R2 + 120); g.addColorStop(0, "rgba(120,180,255,0.9)"); g.addColorStop(1, "rgba(120,180,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#d4dce6"; ctx.beginPath(); ctx.arc(540, y + R2, R2, 0, 7); ctx.fill();
  ctx.restore();
}
function orbitLine(t, t0, t1, y0, y1, text, mark) {
  const a = Math.min(ss(t0, t0 + 0.3, t), 1 - ss(t1 - 0.3, t1, t)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = mark || "rgba(220,230,255,0.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(1080, y1); ctx.stroke();
  const px = 230, py = y0 + (y1 - y0) * px / 1080; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px + 6, py - 6); ctx.lineTo(px + 50, py - 50); ctx.lineTo(px + 70, py - 50); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "600 15px Sans"; ctx.letterSpacing = "1.2px"; ctx.textAlign = "left"; ctx.fillText(text, px + 78, py - 45); ctx.restore();
}
function pointer(t, t0, t1, x, y, text, dx = 60) {
  const a = Math.min(ss(t0, t0 + 0.3, t), 1 - ss(t1 - 0.3, t1, t)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x + dx, y - 50); ctx.lineTo(x + dx + 20, y - 50); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "600 15px Sans"; ctx.letterSpacing = "1.2px"; ctx.textAlign = "left"; ctx.fillText(text, x + dx + 26, y - 45); ctx.restore();
}
function starGlow(t) {           // 53–60 s: Sterne drängen sich vorn zusammen
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  if (t < 55.5) { const k = ss(53, 55.5, t); const g = ctx.createRadialGradient(1300, 2300, 600 - k * 200, 1300, 2300, 1200 - k * 200); g.addColorStop(0, "rgba(140,170,255,0)"); g.addColorStop(0.5, "rgba(150,175,240,0.35)"); g.addColorStop(1, "rgba(150,175,240,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  else {
    const k = ss(55.5, 59.5, t), cx = 540 + lerp(-200, 0, k), cy = lerp(700, 900, k), rad = lerp(500, 140, k);
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(220,230,255,0.85)"); g.addColorStop(1, "rgba(140,160,240,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (t < 57) { ctx.strokeStyle = "rgba(150,170,240,0.35)"; ctx.lineWidth = 120; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.6, 0, 7); ctx.stroke(); }
    const r = rnd(31), n = Math.floor(lerp(150, 1100, k));
    for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.pow(r(), 0.6) * lerp(1500, 700, k); const sx = cx + Math.cos(a) * d, sy = cy + Math.sin(a) * d * 0.9; const s = 1.5 + r() * 3; ctx.fillStyle = `rgba(255,255,255,${0.5 + r() * 0.5})`; ctx.fillRect(sx, sy, s, s); }
  }
  ctx.restore();
}
function vaporFlash(t) {
  const a = Math.max(0, 1 - Math.abs(t - 14.45) / 0.35) * 0.9;
  if (a > 0) { ctx.fillStyle = `rgba(245,245,240,${a})`; ctx.fillRect(0, 0, W, H); }
  if (t > 14.3 && t < 16.4) { const k = ss(14.3, 16.4, t); ctx.save(); ctx.globalAlpha = 0.5 * (1 - k); const g = ctx.createRadialGradient(560, 1050, 80, 560, 1050, 700); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.6, "rgba(240,240,236,0.8)"); g.addColorStop(1, "rgba(240,240,236,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

function frame(t) {
  render3D(t);
  R.render(scene, cam);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(glc, 0, 0, W, H);
  // Overlays je Abschnitt
  if (t < 1.6) cockpit(t, { button: true });
  if (t >= 21 && t < 23) { fireRays(t, ss(20.95, 21.3, t) * (1 - ss(22.9, 23.1, t))); cockpit(t, { light: true }); }
  if (t >= 31 && t < 35.2) limb(t, ss(32.4, 33, t));
  if (t >= 53) starGlow(t);
  if (t >= 55.5 && t < 60) cockpit(t, {});
  vaporFlash(t);
  if (t >= 10.3 && t < 12.1) pointer(t, 10.4, 12.0, 880, 1010, "POLIZEI", 40);
  if (t >= 23.4 && t < 26) pointer(t, 23.5, 25.9, 600, 640, "DU", 50);
  orbitLine(t, 36.6, 38.7, 330, 230, "BAHN DER RAUMSTATION · 420 KM");
  pointer(t, 41.4, 43.0, 900, 1700, "ERDE", -160);
  orbitLine(t, 43.0, 44.4, 1420, 1360, "GEOSTATIONÄRE BAHN · 35.786 KM", "rgba(240,200,120,0.9)");
  if (moon.visible) { V.copy(moon.position).project(cam); pointer(t, 48.6, 51.0, (V.x + 1) / 2 * W + 24, (1 - V.y) / 2 * H - 24, "DER MOND", 40); }
  // dunkler Verlauf unten für Lesbarkeit
  const g = ctx.createLinearGradient(0, 1150, 0, 1500); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(0,0,0,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 1150, W, 350);
  hud(t);
  captions(t);
  if (t > 59.95) { ctx.fillStyle = `rgba(0,0,0,${ss(59.95, 60.3, t)})`; ctx.fillRect(0, 0, W, H); }
}

window.setup = async () => { await document.fonts.load("50px Serif"); await document.fonts.load("italic 50px Serif"); await document.fonts.load("600 16px Sans"); return { duration: DUR }; };
window.renderFrame = frame;
window.exportEvents = () => ({ duration: DUR });
