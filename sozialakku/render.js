// Rendert scene.html Bild für Bild mit Chromium (Playwright) und schreibt das Video mit ffmpeg.
//   node render.js --events          -> build/events.json (Zeitpunkte für die Soundeffekte)
//   node render.js --preview 1 5.5   -> build/preview_*.png
//   node render.js                   -> <name>.mp4 (mit build/audio.wav)
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const NAME = path.basename(HERE);
const FPS = 30;
const WORKERS = 4;
fs.mkdirSync(path.join(HERE, "build"), { recursive: true });

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on("pageerror", e => console.error("Seitenfehler:", e.message));
  await page.goto("file://" + path.join(HERE, "scene.html"));
  await page.evaluate(() => window.setup());
  return page;
}

const grab = (page, t, type) =>
  page.evaluate(([t, type]) => {
    window.renderFrame(t);
    return document.getElementById("c").toDataURL(type, 0.93).split(",")[1];
  }, [t, type]);

(async () => {
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const args = process.argv.slice(2);
  if (args[0] === "--events") {
    const page = await openPage(browser);
    const ev = await page.evaluate(() => window.exportEvents());
    fs.writeFileSync(path.join(HERE, "build", "events.json"), JSON.stringify(ev, null, 1));
    await browser.close();
    return;
  }
  if (args[0] === "--preview") {
    const page = await openPage(browser);
    for (const s of args.slice(1)) {
      const b64 = await grab(page, parseFloat(s), "image/png");
      fs.writeFileSync(path.join(HERE, "build", `preview_${s}.png`), Buffer.from(b64, "base64"));
    }
    await browser.close();
    return;
  }
  const page0 = await openPage(browser);
  const duration = await page0.evaluate(() => window.DURATION);
  await page0.close();
  const n = Math.round(duration * FPS);
  const out = path.join(HERE, NAME + ".mp4");
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", path.join(HERE, "build", "audio.wav"),
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "8M", "-bufsize", "16M", "-pix_fmt", "yuv420p",
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out],
    { stdio: ["pipe", "inherit", "inherit"] });

  const pages = await Promise.all(Array.from({ length: WORKERS }, () => openPage(browser)));
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
  await Promise.all(pages.map(async page => {
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
