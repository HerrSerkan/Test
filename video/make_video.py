"""TikTok-Video: "5 Fakten, die du kaum glauben wirst".

Rendert ein Hochformat-Video (1080x1920, 30 fps) mit Pillow und ffmpeg.
Aufruf: python3 video/make_video.py  ->  video/fakten.mp4
"""
import math
import os
import subprocess
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "fakten.mp4")
AUDIO = os.path.join(HERE, "_sfx.wav")

FONT_DIR = "/usr/share/fonts/opentype/inter"
F_BLACK = os.path.join(FONT_DIR, "Inter-Black.otf")
F_BOLD = os.path.join(FONT_DIR, "Inter-Bold.otf")
F_MED = os.path.join(FONT_DIR, "Inter-Medium.otf")
for f in (F_BLACK, F_BOLD, F_MED):
    if not os.path.exists(f):
        raise SystemExit(f"Schrift fehlt: {f}")

# Sicherer Bereich: TikTok legt unten und rechts Buttons/Beschriftung drüber.
MARGIN_X = 100
SAFE_RIGHT = W - 160

# (Dauer in s, Typ, Inhalt, Farben oben/unten, Akzent)
SCENES = [
    dict(dur=3.2, kind="hook", top=(20, 18, 48), bottom=(70, 20, 90), accent=(255, 214, 0)),
    dict(dur=5.0, kind="fact", n=1, title="Oktopusse haben drei Herzen.",
         sub="Und ihr Blut ist blau.",
         top=(5, 40, 70), bottom=(10, 90, 120), accent=(0, 229, 255)),
    dict(dur=5.0, kind="fact", n=2, title="Bananen sind Beeren.",
         sub="Erdbeeren dagegen nicht.",
         top=(60, 45, 0), bottom=(120, 80, 0), accent=(255, 220, 60)),
    dict(dur=5.6, kind="fact", n=3, title="Ein Tag auf der Venus dauert länger als ihr Jahr.",
         sub="243 Erdtage für eine Drehung, nur 225 für eine Runde um die Sonne.",
         top=(70, 20, 10), bottom=(140, 50, 20), accent=(255, 140, 60)),
    dict(dur=5.2, kind="fact", n=4, title="Honig kann Tausende Jahre haltbar bleiben.",
         sub="Archäologen fanden Honig in uralten ägyptischen Gräbern.",
         top=(50, 30, 0), bottom=(110, 70, 10), accent=(255, 190, 40)),
    dict(dur=6.2, kind="fact", n=5,
         title="Kleopatra lebte näher an der Mondlandung als am Bau der Pyramiden.",
         sub="Pyramide: ca. 2560 v. Chr.\nKleopatra: 69–30 v. Chr.\nMondlandung: 1969",
         top=(30, 10, 60), bottom=(90, 20, 110), accent=(255, 80, 200)),
    dict(dur=3.8, kind="outro", top=(15, 15, 30), bottom=(50, 20, 80), accent=(255, 214, 0)),
]


def ease_out_back(t):
    t = min(max(t, 0.0), 1.0)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def ease_out(t):
    t = min(max(t, 0.0), 1.0)
    return 1 - (1 - t) ** 3


def wrap(text, font, max_w):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for word in para.split():
            test = (cur + " " + word).strip()
            if font.getlength(test) <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = word
        lines.append(cur)
    return lines


def text_block(text, font, fill, max_w, line_gap=1.12, shadow=True, align="center"):
    """Text als RGBA-Bild (mit weichem Schatten)."""
    lines = wrap(text, font, max_w)
    asc, desc = font.getmetrics()
    lh = int((asc + desc) * line_gap)
    bw = int(max(font.getlength(l) for l in lines)) + 40
    bh = lh * len(lines) + 40
    img = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, l in enumerate(lines):
        lw = font.getlength(l)
        x = (bw - lw) / 2 if align == "center" else 20
        d.text((x, 20 + i * lh), l, font=font, fill=fill)
    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        alpha = img.split()[3].filter(ImageFilter.GaussianBlur(10))
        sh.putalpha(alpha.point(lambda a: int(a * 0.55)))
        out = Image.new("RGBA", img.size, (0, 0, 0, 0))
        out.alpha_composite(sh, (0, 6))
        out.alpha_composite(img)
        return out
    return img


def paste_anim(frame, layer, cx, cy, t, delay=0.0, dur=0.45, slide=40):
    """Layer mit Pop-/Slide-Animation zentriert bei (cx, cy) einfügen."""
    p = (t - delay) / dur
    if p <= 0:
        return
    s = 0.82 + 0.18 * ease_out_back(p)
    a = ease_out(p)
    lay = layer
    if s != 1.0:
        lay = layer.resize((max(1, int(layer.width * s)), max(1, int(layer.height * s))),
                           Image.BILINEAR)
    if a < 1:
        r, g, b, al = lay.split()
        al = al.point(lambda v: int(v * a))
        lay = Image.merge("RGBA", (r, g, b, al))
    y = cy + (1 - ease_out(p)) * slide
    frame.alpha_composite(lay, (int(cx - lay.width / 2), int(y - lay.height / 2)))


def gradient(top, bottom):
    t = np.linspace(0, 1, H)[:, None]
    top, bottom = np.array(top, float), np.array(bottom, float)
    col = top * (1 - t) + bottom * t
    arr = np.repeat(col[:, None, :], W, axis=1).astype(np.uint8)
    return Image.fromarray(arr, "RGB").convert("RGBA")


def make_blob(radius, color):
    size = radius * 2 + 120
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse((60, 60, 60 + 2 * radius, 60 + 2 * radius),
                                fill=color + (90,))
    return img.filter(ImageFilter.GaussianBlur(50))


def pill(text, font, bg, fg):
    tw = font.getlength(text)
    asc, desc = font.getmetrics()
    w, h = int(tw + 70), int(asc + desc + 34)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=bg)
    d.text((35, 17), text, font=font, fill=fg)
    return img


# --- Szenen vorbereiten (Layer nur einmal rendern) -------------------------
f_huge = ImageFont.truetype(F_BLACK, 300)
f_big = ImageFont.truetype(F_BLACK, 104)
f_title = ImageFont.truetype(F_BLACK, 92)
f_sub = ImageFont.truetype(F_MED, 60)
f_pill = ImageFont.truetype(F_BOLD, 44)
f_small = ImageFont.truetype(F_BOLD, 40)

TEXT_W = SAFE_RIGHT - MARGIN_X
CX = (MARGIN_X + SAFE_RIGHT) // 2  # leicht nach links versetzt (Buttons rechts)
WHITE = (255, 255, 255, 255)

for sc in SCENES:
    sc["bg"] = gradient(sc["top"], sc["bottom"])
    sc["blobs"] = [make_blob(r, sc["accent"]) for r in (260, 200, 320)]
    acc = sc["accent"] + (255,)
    if sc["kind"] == "hook":
        size = 300
        while ImageFont.truetype(F_BLACK, size).getlength("5 FAKTEN") > TEXT_W - 20:
            size -= 6
        sc["l1"] = text_block("5 FAKTEN", ImageFont.truetype(F_BLACK, size), acc, TEXT_W)
        sc["l2"] = text_block("die du kaum glauben wirst", f_big, WHITE, TEXT_W)
        sc["l3"] = pill("Bleib bis #5", f_pill, (255, 255, 255, 235), (20, 18, 48, 255))
    elif sc["kind"] == "fact":
        sc["num"] = text_block(f"#{sc['n']}", ImageFont.truetype(F_BLACK, 220), acc, TEXT_W)
        sc["l1"] = text_block(sc["title"], f_title, WHITE, TEXT_W)
        sc["l2"] = text_block(sc["sub"], f_sub, (255, 255, 255, 220), TEXT_W - 40,
                              line_gap=1.3)
    else:
        sc["l1"] = text_block("Welcher Fakt war neu für dich?", f_big, WHITE, TEXT_W)
        sc["l2"] = pill("Schreib's in die Kommentare", f_pill, acc, (20, 18, 48, 255))
        sc["l3"] = text_block("Folge für Teil 2", f_title, acc, TEXT_W)

def stack(items, center_y=880):
    """items: (layer, Abstand davor, delay, slide) -> vertikal zentrierter Stapel."""
    total = sum(l.height + gap for l, gap, _, _ in items)
    y = center_y - total / 2
    out = []
    for l, gap, delay, slide in items:
        y += gap
        out.append((l, y + l.height / 2, delay, slide))
        y += l.height
    return out


for sc in SCENES:
    if sc["kind"] == "hook":
        sc["layout"] = stack([(sc["l1"], 0, 0.0, 40), (sc["l2"], 10, 0.35, 40),
                              (sc["l3"], 60, 0.9, 40)])
    elif sc["kind"] == "fact":
        sc["layout"] = stack([(sc["num"], 0, 0.0, 0), (sc["l1"], 30, 0.25, 40),
                              (sc["l2"], 60, 1.4, 40)])
    else:
        sc["layout"] = stack([(sc["l1"], 0, 0.0, 40), (sc["l2"], 50, 0.5, 40),
                              (sc["l3"], 70, 1.0, 40)])

TOTAL = sum(s["dur"] for s in SCENES)
N_FRAMES = int(round(TOTAL * FPS))
starts, acc_t = [], 0.0
for s in SCENES:
    starts.append(acc_t)
    acc_t += s["dur"]


def render(fi):
    t_glob = fi / FPS
    si = max(i for i, s in enumerate(starts) if s <= t_glob)
    sc, t = SCENES[si], t_glob - starts[si]
    frame = sc["bg"].copy()

    # schwebende, weiche Farbflecken
    for k, b in enumerate(sc["blobs"]):
        ang = t_glob * (0.5 + 0.2 * k) + k * 2.1
        x = W * (0.25 + 0.5 * ((k * 0.37) % 1)) + math.cos(ang) * 120 - b.width / 2
        y = H * (0.2 + 0.3 * k) + math.sin(ang * 1.3) * 160 - b.height / 2
        frame.alpha_composite(b, (int(x), int(y)))

    for layer, y, delay, slide in sc["layout"]:
        paste_anim(frame, layer, CX, y, t, delay, slide=slide)

    # Fortschrittsbalken oben (unterhalb der TikTok-Kopfzeile)
    d = ImageDraw.Draw(frame)
    y0 = 170
    d.rounded_rectangle((MARGIN_X, y0, W - MARGIN_X, y0 + 12), radius=6,
                        fill=(255, 255, 255, 60))
    d.rounded_rectangle((MARGIN_X, y0, MARGIN_X + (W - 2 * MARGIN_X) * t_glob / TOTAL,
                         y0 + 12), radius=6, fill=sc["accent"] + (255,))

    # kurzer weißer Blitz beim Szenenwechsel
    if si > 0 and t < 0.12:
        flash = Image.new("RGBA", (W, H), (255, 255, 255, int(120 * (1 - t / 0.12))))
        frame.alpha_composite(flash)
    return frame.convert("RGB")


def make_sfx():
    """Kurze 'Pop'-Sounds bei jedem Szenenwechsel (selbst erzeugt, lizenzfrei)."""
    sr = 44100
    n = int(TOTAL * sr)
    audio = np.zeros(n)
    events = []
    for i, s in enumerate(SCENES):
        events.append((starts[i], 520 if s["kind"] != "outro" else 660))
        if s["kind"] == "fact":
            events.append((starts[i] + 1.4, 880))  # Pop, wenn die Erklärung erscheint
    for t0, f0 in events:
        L = int(0.18 * sr)
        tt = np.arange(L) / sr
        freq = f0 * (1 + 1.5 * np.exp(-tt * 40))
        tone = np.sin(2 * np.pi * np.cumsum(freq) / sr) * np.exp(-tt * 22)
        i0 = int(t0 * sr)
        audio[i0:i0 + L] += tone[: max(0, min(L, n - i0))] * 0.35
    audio = np.clip(audio, -1, 1)
    with wave.open(AUDIO, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())


def main():
    make_sfx()
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-i", AUDIO,
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", OUT]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fi in range(N_FRAMES):
        proc.stdin.write(render(fi).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit("ffmpeg ist fehlgeschlagen")
    os.remove(AUDIO)
    print(f"Fertig: {OUT} ({TOTAL:.1f} s, {N_FRAMES} Frames)")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--preview":
        # Einzelbilder zur Kontrolle
        for sec in [float(x) for x in sys.argv[2:]]:
            render(int(sec * FPS)).save(os.path.join(HERE, f"_preview_{sec:.1f}.png"))
    else:
        main()
