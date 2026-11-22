"""Originalvideo übernehmen, nur die englischen Texte (Untertitel + Tacho) durch deutsche ersetzen.

  python3 tempo_de/process.py <original.mp4> --preview 5.5 41 58   -> build/cmp_*.png (links Original, rechts Deutsch)
  python3 tempo_de/process.py <original.mp4>                       -> tempo_de/immer_schneller_original_de.mp4
"""
import math
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "tempo", "fonts")
SRC = sys.argv[1]
W, H, FPS = 576, 1024, 30
os.makedirs(os.path.join(HERE, "build"), exist_ok=True)

SERIF = os.path.join(FONTS, "InstrumentSerif-Regular.ttf")
SERIF_I = os.path.join(FONTS, "InstrumentSerif-Italic.ttf")
SANS = os.path.join(FONTS, "Inter.ttf")
_fc = {}


def font(path, size, wght=None):
    k = (path, size, wght)
    if k not in _fc:
        f = ImageFont.truetype(path, size)
        if wght:
            try:
                f.set_variation_by_axes([14, wght])
            except Exception:
                pass
        _fc[k] = f
    return _fc[k]


# ---------------------------------------------------------------- Tempo-Rechnung (wie im Original)
C_KMH = 1079252848.8
T0 = 0.7
OFF = 0.25                              # Original-Tacho läuft 0,25 s hinter der Formel
vC = lambda t: 0 if t < T0 else 260 * 2 ** ((t - 10) / 2)
rap = lambda t: vC(t) / C_KMH
beta = lambda t: math.tanh(rap(t))
gamma = lambda t: math.cosh(rap(t))


def de(n, dec=0):
    s = f"{n:,.{dec}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def speed_label(v, t):
    if t < T0:
        return "DRÜCK DEN KNOPF"
    for lim, s in [(12, "SCHRITTTEMPO"), (25, "WIE EIN FAHRRAD"), (45, "WIE EIN MOFA"), (70, "TEMPOLIMIT IN DER STADT"), (150, "SCHNELLER ALS AUF DER LANDSTRASSE"),
                   (300, "SCHNELLER ALS AUF DER AUTOBAHN"), (360, "SCHNELLER ALS EIN ICE"), (900, "SCHNELLER ALS EIN FORMEL-1-AUTO"), (1235, "SCHNELLER ALS EIN PASSAGIERJET"),
                   (4000, "SCHNELLER ALS DER SCHALL"), (28000, "SCHNELLER ALS DER SCHNELLSTE JET"), (40270, "ORBITALGESCHWINDIGKEIT"), (700000, "SCHNELLER ALS DIE FLUCHTGESCHWINDIGKEIT")]:
        if v < lim:
            return s
    return "SCHNELLER ALS JEDES RAUMSCHIFF"


def hud_texts(t):
    b, v = beta(t), vC(t)
    light = b >= 0.0112
    label = "DEIN TEMPO · % DER LICHTGESCHWINDIGKEIT" if light else "DEIN TEMPO"
    if not light:
        big = f"{de(round(v))} km/h"
        sub = speed_label(v, t)
    else:
        p = b * 100
        dec = max(0, 2 - math.floor(math.log10(p))) if b < 0.99 else max(1, math.ceil(-math.log10(100 - p))) + 1
        big = f"{de(p, min(dec, 6))} %"
        g = gamma(t)
        sub = f"{de(round(b * C_KMH))} KM/H" if g < 1.25 else f"DIE ZEIT LÄUFT {de(g, 1) if g < 10 else de(round(g))}× LANGSAMER FÜR DICH"
    rem = 2 - ((t - 10) % 2)
    cnt = f"×2 IN {de(rem, 1)} S" if t >= T0 else None
    return label, big, sub, cnt


CAPS = [
    (0.0, 2.45, ["Was wäre, wenn dein Auto", "nie aufhört zu beschleunigen?"]),
    (2.5, 5.35, ["Dein Tempo verdoppelt sich", "alle 2 Sekunden."]),
    (5.45, 7.85, ["5 Sekunden:", "Tempolimit in der Stadt."]),
    (8.0, 9.95, ["Rote Ampel.", "*Du kannst nicht bremsen."]),
    (10.05, 11.95, ["Die Polizei versucht zu folgen …"]),
    (12.0, 14.05, ["… für etwa eine Sekunde."]),
    (14.45, 16.6, ["*BUMM.", "Die Schallmauer."]),
    (16.95, 18.7, ["Jedes Fenster zerspringt."]),
    (18.9, 20.9, ["Deine Druckwelle walzt", "alles hinter dir platt."]),
    (21.0, 23.1, ["Die Luft wird zu Feuer", "um dich herum."]),
    (23.4, 25.15, ["Orbitalgeschwindigkeit: Die Straße", "krümmt sich unter dir weg."]),
    (25.4, 27.4, ["Fluchtgeschwindigkeit.", "Die Schwerkraft lässt los."]),
    (27.7, 30.9, ["Du steigst schneller", "als jede Rakete."]),
    (31.0, 32.9, ["Höher als der Everest."]),
    (32.95, 34.7, ["Das Glühen verblasst:", "keine Luft mehr zum Verbrennen."]),
    (35.0, 36.6, ["Der Himmel wird schwarz."]),
    (36.75, 38.95, ["Du kreuzt die Bahn", "der Raumstation."]),
    (39.0, 41.3, ["Die Erde schrumpft hinter dir."]),
    (41.5, 44.15, ["Alle 2 Sekunden legst du mehr zurück", "als auf der ganzen bisherigen Fahrt."]),
    (44.25, 47.3, ["Du passierst die Satelliten,", "36.000 km hoch."]),
    (47.45, 49.45, ["10 % der Lichtgeschwindigkeit."]),
    (49.5, 51.55, ["Der Mond: 384.400 km entfernt …"]),
    (51.7, 52.9, ["… weg in einem Wimpernschlag."]),
    (53.0, 55.4, ["Jetzt greift die Relativität:", "Die Sterne drängen sich vor dir."]),
    (55.5, 57.4, ["Jeder Schub bringt", "nur noch mehr Neunen."]),
    (57.45, 59.3, ["1 Sekunde für dich =", "@"]),
    (59.4, 60.0, ["*Aber nie 100 %."]),
]
END_OF_TEXT = 60.0                     # danach kommt der TikTok-Abspann, unverändert


def earth_time(t):
    g = gamma(t)
    return f"{de(round(g))} Sekunden auf der Erde." if g < 120 else f"{de(g / 60, 1)} Minuten auf der Erde."


def ss(a, b, t):
    k = min(1, max(0, (t - a) / (b - a)))
    return k * k * (3 - 2 * k)


# Bereiche, in denen die englischen Texte stehen (576x1024)
CAP_BOX = (18, 650, 558, 738)
HUD_BOX = (4, 418, 380, 530)


def remove_text(img, box, k, thr, maxh):
    x0, y0, x1, y1 = box
    roi = img[y0:y1, x0:x1]
    g = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(roi, cv2.COLOR_RGB2HSV)
    th = cv2.morphologyEx(g, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_RECT, (k, k)))
    white = (g > 200) & (hsv[..., 1] < 50)
    m = (((th > thr) & (g > 105) & (hsv[..., 1] < 80)) | white).astype(np.uint8)
    # dicke helle Flächen (Zebrastreifen, Karosserie, Himmel) herausnehmen: Schrift ist dünn
    op = maxh // 5 | 1
    solid = cv2.dilate(cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((op, op), np.uint8)), np.ones((3, 3), np.uint8))
    m = m & (1 - solid)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        keep[i] = h <= maxh and a >= 2
    m = keep[lab].astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=2)
    img[y0:y1, x0:x1] = cv2.inpaint(roi, m, 5, cv2.INPAINT_TELEA)


EN_CAPS = [
    ["What if your car", "never stopped accelerating?"], ["Your speed doubles", "every 2 seconds."], ["5 seconds:", "city speed limit."],
    ["Red light.", "*You can't stop."], ["The police try to follow..."], ["...for about one second."], ["*BOOM.", "The sound barrier."],
    ["Every window shatters."], ["Your shock wave flattens", "everything behind you."], ["The air turns to fire", "around you."],
    ["Orbital speed: the road", "curves away beneath you."], ["Escape velocity.", "Gravity lets go."], ["You climb faster", "than any rocket."],
    ["Higher than Everest."], ["The glow fades:", "no more air to burn."], ["The sky turns black."], ["You cross the", "Space Station's orbit."],
    ["Earth shrinks behind you."], ["Every 2 seconds, you cover", "more than the whole trip so far."], ["You pass the satellites,", "36,000 km up."],
    ["10% of the speed of light."], ["The Moon: 384,400 km away..."], ["...gone in a blink."], ["Now relativity kicks in:", "the stars crowd ahead."],
    ["Each push only adds", "more nines."], ["1 second for you =", "@"], ["*But never 100%."],
]


def en_big(t):
    b, v = beta(t), vC(t)
    if b < 0.0112:
        return f"{round(v):,} km/h"
    p = b * 100
    dec = max(0, 2 - math.floor(math.log10(p))) if b < 0.99 else max(1, math.ceil(-math.log10(100 - p))) + 1
    return f"{p:.{min(dec, 6)}f}%"


def en_earth(t):
    g = gamma(t)
    return f"{round(g)} seconds on Earth." if g < 120 else f"{g / 60:.1f} minutes on Earth."


_tc = {}
LAST_DT = 0.0
READ = None
PCT_MODE = False
OCR_RAW = ''


def glyphs(s, size, italic=False):
    k = (s, size, italic)
    if k not in _tc:
        f = font(SERIF_I if italic else SERIF, size)
        w = int(f.getlength(s)) + 8
        im = Image.new("L", (w, size + 14), 0)
        ImageDraw.Draw(im).text((4, size + 5), s, font=f, fill=255, anchor="ls")
        _tc[k] = np.asarray(im)
    return _tc[k]


def place_mask(gray, mask, tp, x, y, search=3):
    """Schablone tp (Grundlinie bei x/links, y) im Bild suchen (±search px) und als Maske eintragen."""
    h, w = tp.shape
    X0, Y0 = x - 4 - search, y - (h - 9) - search
    roi = gray[max(0, Y0):Y0 + h + 2 * search, max(0, X0):X0 + w + 2 * search].astype(np.float32)
    if roi.shape[0] < h or roi.shape[1] < w:
        return 0
    r = cv2.matchTemplate(roi, tp.astype(np.float32), cv2.TM_CCOEFF_NORMED)
    _, mx, _, loc = cv2.minMaxLoc(r)
    ox, oy = max(0, X0) + loc[0], max(0, Y0) + loc[1]
    m = (tp > 50).astype(np.uint8) * 255
    sub = mask[oy:oy + h, ox:ox + w]
    sub[:] = np.maximum(sub, m[:sub.shape[0], :sub.shape[1]])
    return mx


_dt = None


def digit_templates():
    global _dt
    if _dt is None:
        f = font(SERIF, 46); _dt = {}
        for ch in "0123456789":
            im = Image.new("L", (60, 70), 0); ImageDraw.Draw(im).text((5, 55), ch, font=f, fill=255, anchor="ls")
            a = np.asarray(im); ys, xs = np.nonzero(a > 100); _dt[ch] = cv2.resize(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1], (20, 30)).astype(np.float32)
    return _dt


def read_big(gray):
    """Liest die große Tacho-Zahl des Originals (Ziffern, Komma, Punkt, %). Gibt (Wert, ist_prozent) oder None zurück."""
    x0, y0, x1, y1 = 8, 436, 400, 484
    b = gray[y0:y1, x0:x1]
    th = cv2.morphologyEx(b, cv2.MORPH_TOPHAT, np.ones((19, 19), np.uint8))
    m = ((b > 170) & (th > 35)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    comps = sorted([st[i] for i in range(1, n) if st[i][4] >= 6 and st[i][0] < 60 + 400 * (st[i][0] > 60) and st[i][1] + st[i][3] <= 44], key=lambda c: c[0])
    comps = [c for c in comps if c[0] >= 14] or comps
    T = digit_templates(); s = ""; lastx = None
    for x, y, w, h, a in comps:
        if lastx is not None and x - lastx > 14:
            break
        if h >= 22 and w <= 34:
            crop = cv2.resize((lab[y:y + h, x:x + w] > 0).astype(np.float32) * 255, (20, 30))
            best = max(T, key=lambda ch: float(np.sum(crop * T[ch]) / (np.linalg.norm(crop) * np.linalg.norm(T[ch]) + 1)))
            s += best
        elif h < 12 and y + h > 30:
            s += "."
        elif h >= 22 and w > 34:
            s += "%"; break
        else:
            break
        lastx = x + w
    global OCR_RAW
    OCR_RAW = s
    pct = PCT_MODE
    num = s.replace("%", "")
    if not pct:
        num = num.replace(".", "")
    try:
        if pct:
            return float(num), True
        return float(num.replace(".", "")), False
    except ValueError:
        return None


def clean(img, t):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    mask = np.zeros(gray.shape, np.uint8)
    te = t - OFF
    # große Tacho-Zahl: beste von mehreren Nachbarwerten
    global READ, PCT_MODE
    PCT_MODE = beta(te) >= 0.0112
    b = gray[436:484, 8:400]
    th = cv2.morphologyEx(b, cv2.MORPH_TOPHAT, np.ones((15, 15), np.uint8))
    mask[436:484, 8:400] |= (((b > 175) & (th > 18)) | (b > 225)).astype(np.uint8) * 255
    # kleine Tacho-Zeilen: helle Pixel in schmalen Bändern
    for (x0, y0, x1, y1) in [(12, 421, 330, 435), (12, 487, 360, 501), (12, 509, 140, 524)]:
        b = gray[y0:y1, x0:x1]
        th = cv2.morphologyEx(b, cv2.MORPH_TOPHAT, np.ones((7, 7), np.uint8))
        mask[y0:y1, x0:x1] |= ((th > 25) | (b > 205)).astype(np.uint8) * 255
    # Untertitel
    for i, (a, b, _) in enumerate(CAPS):
        if a - 0.25 <= t < b + 0.25:
            lines = EN_CAPS[i]
            for j, l in enumerate(lines):
                if l == "@":
                    l = en_earth(te)
                it = l.startswith("*"); l = l.lstrip("*")
                tp = glyphs(l, 29, it)
                place_mask(gray, mask, tp, 288 - (tp.shape[1] - 8) // 2, 692 + j * 33, 5)
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
    return cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)


def text_spaced(d, xy, s, f, fill, spacing):
    x, y = xy
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + spacing


def draw_overlay(img, t):
    im = Image.fromarray(img)
    lay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    # Tacho
    label, big, sub, cnt = hud_texts(t - OFF)
    if False:
        val, pct = READ
        if pct and "%" in big:
            dec = len(f"{val}".split(".")[1]) if "." in f"{val}" and val != int(val) else 0
            big = f"{de(val, dec)} %"
        elif not pct and "km/h" in big:
            big = f"{de(val)} km/h"
    small = font(SANS, 8, 700)
    shadow = (0, 0, 0, 90)
    for dx, dy, col in [(1, 1, shadow), (0, 0, (255, 255, 255, 220))]:
        text_spaced(d, (15 + dx, 426 + dy), label, small, col, 0.9)
    fb = font(SERIF, 49)
    d.text((14 + 1, 476 + 1), big, font=fb, fill=(0, 0, 0, 90), anchor="ls")
    d.text((14, 476), big, font=fb, fill=(255, 255, 255, 255), anchor="ls")
    s7 = font(SANS, 7, 700)
    text_spaced(d, (15, 491), sub, s7, (255, 255, 255, 205), 0.8)
    if cnt:
        d.ellipse((15, 512, 21, 518), fill=(232, 50, 42, 255))
        text_spaced(d, (26, 511), cnt, s7, (255, 255, 255, 215), 0.8)
    # Untertitel
    for a, b, lines in CAPS:
        if a <= t < b:
            al = min(ss(a, a + 0.2, t), 1 - ss(b - 0.2, b, t))
            for i, l in enumerate(lines):
                if l == "@":
                    l = earth_time(t - OFF)
                it = l.startswith("*")
                l = l.lstrip("*")
                size = 29
                f = font(SERIF_I if it else SERIF, size)
                while d.textlength(l, font=f) > 520:
                    size -= 1
                    f = font(SERIF_I if it else SERIF, size)
                y = 691 + i * 34
                d.text((288 + 1, y + 1), l, font=f, fill=(0, 0, 0, int(110 * al)), anchor="ms")
                d.text((288, y), l, font=f, fill=(255, 255, 255, int(255 * al)), anchor="ms")
    im = Image.alpha_composite(im.convert("RGBA"), lay).convert("RGB")
    return np.asarray(im).copy()


def process(img, t):
    if t >= END_OF_TEXT:
        return img
    return draw_overlay(clean(img, t), t)


def read_frames(ss_=None, n=None):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(ss_)] if ss_ is not None else []) + ["-i", SRC] + (["-frames:v", str(n)] if n else []) + ["-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    while True:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        yield np.frombuffer(buf, np.uint8).reshape(H, W, 3)


if "--preview" in sys.argv:
    for s in sys.argv[sys.argv.index("--preview") + 1:]:
        t = float(s)
        f = next(read_frames(t, 1))
        out = process(f, t)
        Image.fromarray(np.hstack([f, out])).save(os.path.join(HERE, "build", f"cmp_{s}.png"))
    sys.exit()

dst = os.path.join(HERE, "immer_schneller_original_de.mp4")
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", SRC,
                        "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", "-movflags", "+faststart", dst],
                       stdin=subprocess.PIPE)
for i, f in enumerate(read_frames()):
    enc.stdin.write(process(f, i / FPS).tobytes())
    if i % 300 == 0:
        print(i)
enc.stdin.close(); enc.wait()
print("Fertig:", dst)
