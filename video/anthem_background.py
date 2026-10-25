"""Ästhetischer Hintergrund im Lana-Del-Rey-Stil (Vintage-Americana, schwarz-weiß, Regen, Filmkorn).

Ohne Ton und ohne Liedtext: Song und Lyrics kommen in TikTok dazu
(Sound aus der TikTok-Bibliothek, Text über das Text-Werkzeug).
Aufruf: python3 video/anthem_background.py  ->  video/anthem_background.mp4
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, DUR = 1080, 1920, 30, 20.0
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "anthem_background.mp4")
rng = np.random.default_rng(7)

yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]


def lerp_stops(stops, t):
    """Farbverlauf aus (Position, RGB)-Stopps für Werte t (0..1)."""
    pos = np.array([p for p, _ in stops], np.float32)
    cols = np.array([c for _, c in stops], np.float32)
    return np.stack([np.interp(t, pos, cols[:, k]) for k in range(3)], -1)


# Zwei Himmels-Varianten, zwischen denen langsam überblendet wird
SKY_A = [(0.0, (14, 12, 40)), (0.35, (58, 28, 78)), (0.58, (196, 84, 118)),
         (0.72, (246, 150, 110)), (0.82, (255, 200, 140)), (1.0, (60, 30, 50))]
SKY_B = [(0.0, (22, 14, 52)), (0.35, (88, 36, 92)), (0.58, (220, 100, 128)),
         (0.72, (255, 168, 120)), (0.82, (255, 214, 160)), (1.0, (70, 34, 56))]
sky_a = np.repeat(lerp_stops(SKY_A, yy[:, 0])[:, None, :], W, 1)
sky_b = np.repeat(lerp_stops(SKY_B, yy[:, 0])[:, None, :], W, 1)

HORIZON = int(H * 0.80)

# Sonne mit Retro-Streifen, weich ausgeblendet
SUN_R = 300
sun = Image.new("L", (SUN_R * 2, SUN_R * 2), 0)
d = ImageDraw.Draw(sun)
d.ellipse((0, 0, SUN_R * 2 - 1, SUN_R * 2 - 1), fill=255)
for i in range(7):  # Streifen in der unteren Hälfte, nach unten breiter
    y0 = SUN_R + 40 + i * 38
    d.rectangle((0, y0, SUN_R * 2, y0 + 4 + i * 3), fill=0)
sun_mask = np.asarray(sun.filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
sun_grad = lerp_stops([(0.0, (255, 236, 170)), (0.6, (255, 160, 120)), (1.0, (240, 90, 130))],
                      np.linspace(0, 1, SUN_R * 2, dtype=np.float32))[:, None, :]

# großes, weiches Leuchten um die Sonne
glow = np.exp(-(((xx - 0.5) * W) ** 2 + ((yy - HORIZON / H) * H) ** 2) / (2 * 520 ** 2))
glow = glow[..., None] * np.array([255, 150, 120], np.float32)

# Sterne im oberen Bereich
N_STARS = 140
stars = np.stack([rng.uniform(0, W, N_STARS), rng.uniform(0, H * 0.45, N_STARS),
                  rng.uniform(0.3, 1.0, N_STARS), rng.uniform(0, 6.28, N_STARS),
                  rng.uniform(0.6, 2.2, N_STARS)], 1)

# Wasser-/Straßenreflexion unter dem Horizont: dunkler, mit Lichtstreifen
water_rows = np.arange(HORIZON, H)

# Vignette
vig = 1 - 0.55 * np.clip(np.sqrt(((xx - 0.5) * 1.1) ** 2 + ((yy - 0.48) * 0.9) ** 2) * 1.6 - 0.25, 0, 1)
vig = vig[..., None]

# Staubpartikel, die langsam nach oben treiben
N_DUST = 60
dust = np.stack([rng.uniform(0, W, N_DUST), rng.uniform(0, H, N_DUST),
                 rng.uniform(8, 30, N_DUST), rng.uniform(1.5, 4, N_DUST),
                 rng.uniform(0, 6.28, N_DUST)], 1)

# Regen: dünne, schräge Striche
N_RAIN = 220
rain = np.stack([rng.uniform(-200, W + 200, N_RAIN), rng.uniform(0, H, N_RAIN),
                 rng.uniform(40, 110, N_RAIN), rng.uniform(900, 1500, N_RAIN),
                 rng.uniform(40, 110, N_RAIN)], 1)

# Kleine Einblendung oben links im Camcorder-Stil
mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 40)
serif = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 46)


def overlay_text(img, t):
    d = ImageDraw.Draw(img)
    a = 200
    if int(t * 2) % 2 == 0:  # blinkender Punkt
        d.ellipse((100, 236, 124, 260), fill=(235, 235, 235))
    d.text((140, 226), "PLAY", font=mono, fill=(235, 235, 235, a))
    d.text((100, 280), "JUL. 04 1969", font=mono, fill=(235, 235, 235, a))
    d.text((100, 340), "national anthem", font=serif, fill=(235, 235, 235, a))


def render(fi):
    t = fi / FPS
    mix = 0.5 + 0.5 * math.sin(t * 2 * math.pi / DUR)
    img = sky_a * (1 - mix) + sky_b * mix
    img = img + glow * (0.35 + 0.08 * math.sin(t * 1.3))

    # Sterne funkeln
    for x, y, b, ph, r in stars:
        tw = b * (0.55 + 0.45 * math.sin(t * 2.2 + ph))
        xi, yi, ri = int(x), int(y), int(r)
        img[yi - ri:yi + ri + 1, xi - ri:xi + ri + 1] += 255 * tw * 0.8

    # Sonne, die ganz langsam sinkt
    sy = int(HORIZON - SUN_R * 1.55 + t * 4)
    sx = W // 2 - SUN_R
    sub = img[sy:sy + 2 * SUN_R, sx:sx + 2 * SUN_R]
    m = sun_mask[: sub.shape[0], : sub.shape[1], None]
    sub[:] = sub * (1 - m) + sun_grad[: sub.shape[0]] * m
    # Sonne hinter dem Horizont abschneiden
    img[HORIZON:] = img[HORIZON:] * 0  # wird gleich durch Wasser ersetzt

    # Wasser: gespiegelter, abgedunkelter Himmel mit flimmernden Lichtstreifen
    depth = (water_rows - HORIZON) / (H - HORIZON)
    src = np.clip(2 * HORIZON - water_rows, 0, H - 1)
    refl = (sky_a * (1 - mix) + sky_b * mix)[src] + glow[src] * 0.4
    refl *= (0.55 - 0.3 * depth)[:, None, None]
    shimmer = 0.5 + 0.5 * np.sin(water_rows[:, None] * 0.35 + t * 3
                                 + np.sin(xx * 9 + t) * 2)
    band = np.exp(-((xx - 0.5) / (0.18 + 0.25 * depth[:, None])) ** 2)
    refl += (shimmer * band * (1 - depth[:, None]) * 110)[..., None] * np.array(
        [1.0, 0.75, 0.55], np.float32)
    img[HORIZON:] = refl
    img[HORIZON - 2:HORIZON + 1] = img[HORIZON - 2:HORIZON + 1] * 0.6 + 255 * 0.4 * np.array(
        [1, 0.8, 0.6], np.float32)

    # Lichtschimmer (Light Leak), wandert von links nach rechts
    lx = 0.15 + 0.7 * (0.5 + 0.5 * math.sin(t * 0.35))
    leak = np.exp(-((xx - lx) ** 2) / 0.02 - ((yy - 0.25) ** 2) / 0.08)
    img += leak[..., None] * np.array([255, 120, 90], np.float32) * 0.28

    # Staub
    for x, y, r, sp, ph in dust:
        px = int((x + 20 * math.sin(t * 0.7 + ph)) % W)
        py = int((y - t * sp * 12) % H)
        ri = int(r * 0.12) + 1
        img[max(py - ri, 0):py + ri, max(px - ri, 0):px + ri] += 60

    # Filmlook: Vignette, leichtes Flackern, Korn, warmer Schleier
    img *= vig * (0.97 + 0.03 * math.sin(t * 23))
    img = img * 0.92 + np.array([18, 8, 14], np.float32)
    img += rng.normal(0, 9, (H // 2, W // 2, 1)).repeat(2, 0).repeat(2, 1)
    # Schwarz-Weiß, flaue Kontraste, angehobene Schwärzen (melancholischer Look)
    g = img[..., 0] * 0.299 + img[..., 1] * 0.587 + img[..., 2] * 0.114
    g = 28 + 0.72 * 255 * (np.clip(g, 0, 255) / 255) ** 1.15
    out = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8), "L").convert("RGBA")
    rl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rl)
    for x, y, ln, sp, a in rain:
        py = (y + t * sp) % (H + 200) - 100
        px = x + (py - y) * 0.12
        rd.line((px, py, px + ln * 0.12, py + ln), fill=(230, 230, 230, int(a)), width=2)
    out.alpha_composite(rl)
    overlay_text(out, t)
    return out.convert("RGB")


def main():
    n = int(DUR * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
           "-preset", "medium", "-crf", "26", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fi in range(n):
        p.stdin.write(render(fi).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("ffmpeg ist fehlgeschlagen")
    print(f"Fertig: {OUT}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--preview":
        for s in sys.argv[2:]:
            render(int(float(s) * FPS)).save(os.path.join(HERE, f"_preview_{s}.png"))
    else:
        main()
