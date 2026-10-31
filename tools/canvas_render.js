// Allgemeiner Canvas-Renderer: lädt <ordner>/scene.html in Chromium und schreibt ein MP4.
// Die Szene muss window.setup() (liefert {duration}) und window.renderFrame(t) bereitstellen.
//
//   node tools/canvas_render.js <ordner> --preview 1 4.5      -> <ordner>/build/preview_*.png
//   node tools/canvas_render.js <ordner> --out video.mp4 [--audio ton.wav] [--fps 60]
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const WORKERS = 4;
const dir = path.resolve(process.argv[2]);
const args = process.argv.slice(3);
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const FPS = parseInt(opt("--fps") || "30", 10);   // optional: --fps 60
fs.mkdirSync(path.join(dir, "build"), { recursive: true });

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on("pageerror", e => console.error("Seitenfehler:", e.message));
  page.on("console", m => m.type() === "error" && console.error("Konsole:", m.text()));
  await page.goto("file://" + path.join(dir, "scene.html"));
  const info = await page.evaluate(() => window.setup());
  return { page, info };
}

const grab = (page, t, type) =>
  page.evaluate(([t, type]) => {
    window.renderFrame(t);
    return document.getElementById("c").toDataURL(type, 0.93).split(",")[1];
  }, [t, type]);

(async () => {
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  if (args[0] === "--preview") {
    const { page } = await openPage(browser);
    for (const s of args.slice(1)) {
      const b64 = await grab(page, parseFloat(s), "image/png");
      fs.writeFileSync(path.join(dir, "build", `preview_${s}.png`), Buffer.from(b64, "base64"));
    }
    await browser.close();
    return;
  }
  if (args[0] === "--events") {
    const { page } = await openPage(browser);
    const ev = await page.evaluate(() => (window.exportEvents ? window.exportEvents() : {}));
    fs.writeFileSync(path.join(dir, "build", "events.json"), JSON.stringify(ev, null, 1));
    await browser.close();
    return;
  }

  const pages = await Promise.all(Array.from({ length: WORKERS }, () => openPage(browser)));
  const duration = pages[0].info.duration;
  const n = Math.round(duration * FPS);
  const out = path.resolve(opt("--out") || path.join(dir, "video.mp4"));
  const audio = opt("--audio");
  const ffArgs = ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-"];
  if (audio) ffArgs.push("-i", path.resolve(audio));
  ffArgs.push("-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "6M", "-bufsize", "12M", "-pix_fmt", "yuv420p");
  if (audio) ffArgs.push("-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "-shortest");
  ffArgs.push("-movflags", "+faststart", out);
  const ff = spawn("ffmpeg", ffArgs, { stdio: ["pipe", "inherit", "inherit"] });

  const ready = new Map();
  let next = 0, written = 0;
  const flush = () => {
    while (ready.has(written)) {
      ff.stdin.write(ready.get(written));
      ready.delete(written);
      written++;
      if (written % 150 === 0) console.log(`${written}/${n}`);
    }
  };
  await Promise.all(pages.map(async ({ page }) => {
    while (true) {
      const i = next++;
      if (i >= n) break;
      const b64 = await grab(page, i / FPS, "image/jpeg");
      ready.set(i, Buffer.from(b64, "base64"));
      flush();
      while (ready.size > 60) await new Promise(r => setTimeout(r, 5));
    }
  }));
  flush();
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log("Fertig:", out);
})();
