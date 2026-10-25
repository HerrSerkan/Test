"""TikTok-Animation: "Gleicher Akku. Anderes Ladegerät." (Introvertiert vs. Extrovertiert)

Eigene Zeichnungen und eigener Sound (alles im Code erzeugt).
Aufruf:  python3 akku/akku_video.py            -> akku/akku.mp4
         python3 akku/akku_video.py --preview 2 6 9 11.5
"""
import math
import os
import subprocess
import sys
import wave
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
S = 2  # Supersampling für glatte Kanten
DUR = 12.8
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "akku.mp4")
WAV = os.path.join(HERE, "_audio.wav")
FD = "/usr/share/fonts/opentype/inter/"

FLOOR = 1340          # Bodenlinie
IX, EX = 300, 770     # x-Position Introvertiert / Extrovertiert
DOOR = (470, 900, 640, FLOOR)

# ---------------------------------------------------------------- Zeitachse


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ramp(t, t0, t1):
    return clamp((t - t0) / (t1 - t0)) if t1 > t0 else float(t >= t0)


def smooth(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_back(x):
    x = clamp(x)
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def state(t):
    s = {}
    # Party sichtbar: 0-4 voll, 4-5 gehen alle, ab 10.8 wieder da
    s["party"] = 1 - smooth(ramp(t, 4.0, 5.0)) + smooth(ramp(t, 10.9, 11.4))
    s["party"] = clamp(s["party"])
    s["disco"] = 1 - smooth(ramp(t, 4.2, 5.0))
    s["lamp"] = smooth(ramp(t, 5.4, 5.7))
    s["door"] = max(1 - abs(t - 4.5) / 0.6, 0) + smooth(ramp(t, 10.8, 11.1))
    s["door"] = clamp(s["door"])
    # Akkustände (0..5)
    s["iL"] = (5 - 4.3 * smooth(ramp(t, 0.2, 3.8))
               + 4.3 * smooth(ramp(t, 5.8, 7.8))
               - 1.6 * smooth(ramp(t, 11.2, 12.6)))
    s["eL"] = (1 + 4 * smooth(ramp(t, 0.2, 3.6))
               - 4.4 * smooth(ramp(t, 5.8, 7.8))
               + 2.6 * smooth(ramp(t, 11.2, 12.6)))
    s["iC"] = 5.8 <= t < 7.8
    s["eC"] = 0.2 <= t < 3.6 or t >= 11.2
    # Gesichter
    if t < 1.6:
        s["iF"] = "neutral"
    elif t < 3.2:
        s["iF"] = "tired"
    elif t < 5.5:
        s["iF"] = "xx"
    elif t < 10.3:
        s["iF"] = "happy"
    elif t < 11.2:
        s["iF"] = "alert"
    else:
        s["iF"] = "worried"
    if t < 1.0:
        s["eF"] = "happy"
    elif t < 2.3:
        s["eF"] = "woo"
    elif t < 5.0:
        s["eF"] = "happy"
    elif t < 6.6:
        s["eF"] = "neutral"
    elif t < 10.3:
        s["eF"] = "sad"
    elif t < 11.1:
        s["eF"] = "alert"
    else:
        s["eF"] = "woo"
    s["woo"] = ramp(t, 1.0, 1.15) * (1 - ramp(t, 2.2, 2.35))
    # Extrovertiert: Arme hoch auf der Party, Handy zu Hause
    s["eArms"] = 1 - smooth(ramp(t, 4.6, 5.2)) + smooth(ramp(t, 11.0, 11.3))
    s["eArms"] = clamp(s["eArms"])
    s["phone"] = ramp(t, 6.0, 6.3) * (1 - ramp(t, 10.3, 10.4))
    # Farben: zu Hause wird Extrovertiert blau-grau, Introvertiert warm
    s["eBlue"] = smooth(ramp(t, 5.2, 6.6)) * (1 - smooth(ramp(t, 11.0, 11.6)))
    s["iWarm"] = s["lamp"]
    s["book"] = smooth(ramp(t, 5.6, 6.0))
    s["txt1"] = ramp(t, 7.9, 8.25)
    s["txt2"] = ramp(t, 8.6, 8.95)
    s["txtOut"] = 1 - ramp(t, 10.2, 10.45)
    s["bell"] = ramp(t, 10.3, 10.4) * (1 - ramp(t, 11.0, 11.15))
    s["bump"] = 0.5 + 0.5 * math.sin(t * 2 * math.pi * 124 / 60)  # Takt
    return s


# ---------------------------------------------------------------- Hilfen


def mix(a, b, k):
    return tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(len(a)))


def font(name, size):
    return ImageFont.truetype(FD + name, size)


def spaced(d, xy, text, f, fill, track):
    """Text mit Buchstabenabstand, zentriert um xy[0]."""
    widths = [f.getlength(c) for c in text]
    total = sum(widths) + track * (len(text) - 1)
    x = xy[0] - total / 2
    for c, w in zip(text, widths):
        d.text((x, xy[1]), c, font=f, fill=fill)
        x += w + track


def batt_color(level):
    if level <= 1.05:
        return (232, 84, 70)
    if level <= 2.05:
        return (245, 160, 50)
    if level <= 3.05:
        return (200, 215, 70)
    return (80, 200, 110)


# ---------------------------------------------------------------- statische Ebenen


def make_static():
    rng = np.random.default_rng(3)
    yy = np.linspace(0, 1, H)[:, None, None]
    top, mid, bot = np.array([12, 13, 26]), np.array([24, 26, 46]), np.array([10, 10, 18])
    g = np.where(yy < FLOOR / H, top + (mid - top) * (yy / (FLOOR / H)),
                 mid * 0.55 + (bot - mid * 0.55) * ((yy - FLOOR / H) / (1 - FLOOR / H)))
    bg = Image.fromarray(np.repeat(g, W, 1).astype(np.uint8), "RGB").convert("RGBA")
    d = ImageDraw.Draw(bg)
    # Sterne/Staub an der Wand
    for _ in range(70):
        x, y = rng.uniform(0, W), rng.uniform(150, FLOOR - 200)
        r = rng.uniform(1, 2.6)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(120, 120, 170, 120))
    # Wimpelkette
    pts = [(x, 330 + 30 * math.sin(x / W * math.pi)) for x in range(-20, W + 40, 10)]
    d.line(pts, fill=(90, 90, 120), width=3)
    cols = [(230, 110, 140), (120, 170, 240), (250, 200, 90), (150, 220, 170), (190, 140, 240)]
    for i, x in enumerate(range(10, W, 48)):
        y = 330 + 30 * math.sin(x / W * math.pi)
        c = cols[i % len(cols)]
        d.polygon([(x - 15, y), (x + 15, y), (x, y + 30)], fill=c + (170,))
    # Bodenkante
    d.line((0, FLOOR, W, FLOOR), fill=(60, 62, 92), width=3)
    # Becher am Boden (Party-Reste)
    for x in (130, 450, 690, 960):
        d.polygon([(x, FLOOR - 26), (x + 22, FLOOR - 26), (x + 18, FLOOR), (x + 4, FLOOR)],
                  fill=(150, 50, 60))
    # Tür
    x0, y0, x1, y1 = DOOR
    d.rounded_rectangle((x0 - 10, y0 - 10, x1 + 10, y1), radius=6, fill=(44, 38, 58))
    d.rectangle((x0, y0, x1, y1), fill=(58, 46, 70))
    d.rectangle((x0 + 18, y0 + 20, x1 - 18, y0 + 190), outline=(72, 58, 86), width=4)
    d.rectangle((x0 + 18, y0 + 220, x1 - 18, y1 - 30), outline=(72, 58, 86), width=4)
    d.ellipse((x1 - 34, y0 + 230, x1 - 22, y0 + 242), fill=(220, 180, 90))

    def glow(fn, blur):
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        fn(ImageDraw.Draw(im))
        return im.filter(ImageFilter.GaussianBlur(blur))

    lamp_x = 90
    cone = glow(lambda dd: dd.polygon([(lamp_x - 40, 830), (lamp_x + 40, 830),
                                       (IX + 260, FLOOR + 60), (lamp_x - 120, FLOOR + 60)],
                                      fill=(255, 210, 140, 70)), 40)
    cone.alpha_composite(glow(lambda dd: dd.ellipse((IX - 230, FLOOR - 40, IX + 230, FLOOR + 50),
                                                     fill=(255, 210, 140, 90)), 30))
    door_glow = glow(lambda dd: dd.polygon([(x0, y1), (x1, y1), (x1 + 260, H), (x0 - 200, H)],
                                           fill=(255, 220, 150, 70)), 30)

    def beams(off):
        def f(dd):
            for k in range(7):
                a = off + k * math.pi / 7 + 0.2
                ex, ey = 540 + math.cos(a) * 1300, 230 + abs(math.sin(a)) * 1300
                dd.polygon([(540, 230), (ex - 60, ey), (ex + 60, ey)],
                           fill=[(180, 120, 255, 40), (90, 160, 255, 40), (255, 120, 180, 40)][k % 3])
        return glow(f, 20)

    return dict(bg=bg, cone=cone, door_glow=door_glow, beams=[beams(0.0), beams(0.22)])


# ---------------------------------------------------------------- Figuren


def face(d, cx, cy, r, kind, col=(40, 36, 52)):
    """Gesicht in Supersampling-Koordinaten zeichnen."""
    ex, ey, w = r * 0.38, cy - r * 0.08, max(3, int(r * 0.07))
    mw, my = r * 0.32, cy + r * 0.38

    def arc_eye(x, up=True):
        box = (x - r * 0.16, ey - r * 0.12, x + r * 0.16, ey + r * 0.14)
        d.arc(box, 200 if up else 20, 340 if up else 160, fill=col, width=w)

    if kind in ("happy", "woo"):
        arc_eye(cx - ex), arc_eye(cx + ex)
    elif kind == "xx":
        for x in (cx - ex, cx + ex):
            k = r * 0.11
            d.line((x - k, ey - k, x + k, ey + k), fill=col, width=w)
            d.line((x - k, ey + k, x + k, ey - k), fill=col, width=w)
    else:
        er = r * (0.11 if kind == "alert" else 0.085)
        for x in (cx - ex, cx + ex):
            d.ellipse((x - er, ey - er, x + er, ey + er), fill=col)
        if kind in ("tired", "neutral"):  # halb geschlossene Lider
            for x in (cx - ex, cx + ex):
                d.line((x - r * 0.15, ey - r * 0.04, x + r * 0.15, ey - r * 0.04), fill=col, width=w)
        if kind in ("sad", "worried"):
            d.line((cx - ex - r * 0.14, ey - r * 0.18, cx - ex + r * 0.12, ey - r * 0.28), fill=col, width=w)
            d.line((cx + ex + r * 0.14, ey - r * 0.18, cx + ex - r * 0.12, ey - r * 0.28), fill=col, width=w)
    # Mund
    if kind == "woo":
        d.ellipse((cx - r * 0.16, my - r * 0.14, cx + r * 0.16, my + r * 0.2), fill=col)
    elif kind == "alert":
        d.ellipse((cx - r * 0.08, my - r * 0.04, cx + r * 0.08, my + r * 0.14), fill=col)
    elif kind in ("happy", "neutral") and kind == "happy":
        d.arc((cx - mw, my - r * 0.3, cx + mw, my + r * 0.1), 20, 160, fill=col, width=w)
    elif kind in ("sad", "worried", "tired"):
        d.arc((cx - mw * 0.8, my - r * 0.02, cx + mw * 0.8, my + r * 0.3), 205, 335, fill=col, width=w)
    elif kind == "xx":
        d.line((cx - mw * 0.6, my + r * 0.05, cx + mw * 0.6, my + r * 0.02), fill=col, width=w)
    else:
        d.line((cx - mw * 0.5, my + r * 0.05, cx + mw * 0.5, my + r * 0.05), fill=col, width=w)


def person(d, cx, base, col, kind, arms=0.0, bob=0.0, scale=1.0, phone=0.0, seated=False):
    """Eine Figur (Kapsel-Körper, runder Kopf). Koordinaten in 1x, gezeichnet in Sx."""
    k = S * scale
    X = lambda v: cx * S + v * k
    Y = lambda v: (base - bob) * S + v * k
    dark = mix(col, (0, 0, 0), 0.25)
    body_h = 170 if seated else 230
    top = -body_h - 24
    # Füße
    if not seated:
        d.rounded_rectangle((X(-62), Y(-24), X(62), Y(0)), radius=12 * k, fill=mix(col, (0, 0, 0), 0.35))
    # Arme (hinter dem Körper anfangen)
    sh_y = top + 60
    for side in (-1, 1):
        if arms > 0:
            hx = side * (95 + 55 * arms)
            hy = sh_y + 110 - 250 * arms
        else:
            hx, hy = side * 92, sh_y + 130
        if side == 1 and phone > 0 and arms <= 0:
            hx, hy = 20, sh_y + 90
        d.line((X(side * 70), Y(sh_y), X(hx), Y(hy)), fill=dark, width=int(30 * k))
        d.ellipse((X(hx) - 15 * k, Y(hy) - 15 * k, X(hx) + 15 * k, Y(hy) + 15 * k), fill=dark)
    # Körper
    d.rounded_rectangle((X(-85), Y(top), X(85), Y(-20)), radius=80 * k, fill=col)
    if phone > 0 and arms <= 0:
        d.rounded_rectangle((X(8), Y(sh_y + 50), X(42), Y(sh_y + 110)), radius=6 * k,
                            fill=(30, 32, 46), outline=(170, 180, 220), width=int(3 * k))
    # Kopf
    hr = 72
    hy = top - hr + 18
    d.ellipse((X(-hr), Y(hy - hr), X(hr), Y(hy + hr)), fill=mix(col, (255, 255, 255), 0.08))
    face(d, X(0), Y(hy), hr * k, kind)
    return Y(hy - hr) / S  # Oberkante Kopf (1x)


def crowd(d, t, alpha):
    """Partygäste im Hintergrund (Farben mit alpha)."""
    cols = [(150, 130, 210), (120, 150, 220), (200, 140, 190), (110, 120, 180),
            (170, 160, 230), (130, 170, 200), (210, 160, 200)]
    hats = [(240, 120, 160), (120, 190, 250), (250, 200, 90), (160, 230, 170)]
    a = int(255 * alpha)
    for i, x in enumerate(np.linspace(30, 1050, 13)):
        if abs(x - IX) < 70 or abs(x - EX) < 70:
            continue
        sc = 0.48 + 0.08 * ((i * 7) % 3)
        bob = 10 * abs(math.sin(t * math.pi * 124 / 60 + i))
        base = FLOOR - 70 - (i % 2) * 30
        col = cols[i % len(cols)]
        k = S * sc
        cx = x * S
        by = (base - bob) * S
        body = (cx - 80 * k, by - 210 * k, cx + 80 * k, by)
        d.rounded_rectangle(body, radius=70 * k, fill=col + (a,))
        arm = mix(col, (0, 0, 0), 0.2) + (a,)
        up = (i % 3 != 0)
        for sd in (-1, 1):
            d.line((cx + sd * 60 * k, by - 160 * k, cx + sd * 120 * k, by - (300 if up else 60) * k),
                   fill=arm, width=int(26 * k))
        hy = by - 270 * k
        d.ellipse((cx - 64 * k, hy - 64 * k, cx + 64 * k, hy + 64 * k), fill=mix(col, (255, 255, 255), 0.1) + (a,))
        face(d, cx, hy, 64 * k, ["happy", "woo", "happy", "neutral"][i % 4], col=(40, 36, 60, a))
        hc = hats[i % len(hats)] + (a,)
        d.polygon([(cx + 10 * k, hy - 60 * k), (cx + 60 * k, hy - 50 * k), (cx + 50 * k, hy - 150 * k)], fill=hc)


def door_crowd(d, t, alpha):
    """Gäste, die durch die Tür kommen (Silhouetten im Licht)."""
    a = int(200 * alpha)
    x0, y0, x1, y1 = DOOR
    for i, (dx, sc) in enumerate([(-60, 0.42), (0, 0.5), (60, 0.44), (-140, 0.55), (150, 0.55)]):
        if i >= 3 and alpha < 0.5:
            continue
        bob = 8 * abs(math.sin(t * 7 + i))
        k = S * sc
        cx = ((x0 + x1) / 2 + dx) * S
        by = (y1 - 10 - bob) * S
        col = (190, 170, 160, a)
        d.rounded_rectangle((cx - 80 * k, by - 210 * k, cx + 80 * k, by), radius=70 * k, fill=col)
        for sd in (-1, 1):
            d.line((cx + sd * 60 * k, by - 160 * k, cx + sd * 120 * k, by - 300 * k), fill=col, width=int(26 * k))
        hy = by - 270 * k
        d.ellipse((cx - 64 * k, hy - 64 * k, cx + 64 * k, hy + 64 * k), fill=col)
        d.polygon([(cx + 10 * k, hy - 60 * k), (cx + 60 * k, hy - 50 * k), (cx + 50 * k, hy - 150 * k)],
                  fill=(240, 140, 170, a))


def battery(d, cx, y, level, charging, t):
    """Akku in 1x-Koordinaten (Ebene ohne Supersampling)."""
    w, h = 190, 72
    x0 = cx - w / 2
    d.rounded_rectangle((x0, y, x0 + w, y + h), radius=14, outline=(240, 240, 245), width=5, fill=(16, 16, 22))
    d.rounded_rectangle((x0 + w + 2, y + 22, x0 + w + 14, y + h - 22), radius=4, fill=(240, 240, 245))
    n = max(0, min(5, math.ceil(level - 1e-6)))
    col = batt_color(level)
    sw = (w - 24 - 4 * 6) / 5
    for i in range(n):
        sx = x0 + 12 + i * (sw + 6)
        c = col
        if i == n - 1 and charging and int(t * 4) % 2 == 0:
            c = mix(col, (255, 255, 255), 0.55)
        d.rounded_rectangle((sx, y + 12, sx + sw, y + h - 12), radius=5, fill=c)
    if charging:
        bx, by = x0 - 36, y + 8
        d.polygon([(bx + 16, by), (bx + 2, by + 32), (bx + 14, by + 32), (bx + 6, by + 58),
                   (bx + 26, by + 22), (bx + 14, by + 22), (bx + 22, by)], fill=(255, 200, 60))


# ---------------------------------------------------------------- Bild rendern

ST = None
F_LABEL = F_BIG = F_BUB = None


def init():
    global ST, F_LABEL, F_BIG, F_BUB
    ST = make_static()
    F_LABEL = font("Inter-Bold.otf", 34)
    F_BUB = font("Inter-Black.otf", 34)
    size = 96
    while font("Inter-Black.otf", size).getlength("ANDERES LADEGERÄT.") > W - 140:
        size -= 2
    F_BIG = font("Inter-Black.otf", size)


def alpha_mul(img, a):
    if a >= 0.999:
        return img
    r, g, b, al = img.split()
    return Image.merge("RGBA", (r, g, b, al.point(lambda v: int(v * a))))


def render(fi):
    t = fi / FPS
    s = state(t)
    frame = ST["bg"].copy()

    # Licht-Ebenen
    if s["disco"] > 0.01:
        k = 0.5 + 0.5 * math.sin(t * 3)
        frame.alpha_composite(alpha_mul(ST["beams"][0], s["disco"] * k))
        frame.alpha_composite(alpha_mul(ST["beams"][1], s["disco"] * (1 - k)))
    if s["door"] > 0.01:
        d = ImageDraw.Draw(frame)
        x0, y0, x1, y1 = DOOR
        d.rectangle((x0, y0, x1, y1), fill=mix((58, 46, 70), (255, 226, 160), s["door"]))
        frame.alpha_composite(alpha_mul(ST["door_glow"], s["door"]))
    if s["lamp"] > 0.01:
        frame.alpha_composite(alpha_mul(ST["cone"], s["lamp"]))

    # Lampe
    d = ImageDraw.Draw(frame)
    shade = mix((70, 70, 84), (255, 226, 150), s["lamp"])
    d.line((90, 840, 90, FLOOR), fill=(90, 90, 104), width=6)
    d.ellipse((60, FLOOR - 10, 120, FLOOR + 6), fill=(90, 90, 104))
    d.polygon([(55, 830), (125, 830), (110, 760), (70, 760)], fill=shade)

    # Discokugel
    if s["disco"] > 0.01:
        a = int(255 * s["disco"])
        d.line((540, 0, 540, 190), fill=(150, 150, 160, a), width=2)
        for yy in range(-40, 41, 10):
            for xx in range(-40, 41, 10):
                if xx * xx + yy * yy <= 1600:
                    v = 150 + int(100 * abs(math.sin(xx * 0.3 + yy * 0.2 + t * 4)))
                    d.rectangle((540 + xx - 4, 230 + yy - 4, 540 + xx + 4, 230 + yy + 4), fill=(v, v, v + 10, a))

    # Figuren in Supersampling
    big = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(big)
    if s["party"] > 0.01:
        crowd(bd, t, s["party"] if t < 6 else 0)
    if s["door"] > 0.01 and t > 10:
        door_crowd(bd, t, s["door"])

    # Sofa
    sofa = (88, 72, 140)
    bd.rounded_rectangle(((IX - 175) * S, (FLOOR - 150) * S, (IX + 175) * S, FLOOR * S), radius=70 * S, fill=sofa)
    bd.rounded_rectangle(((IX - 150) * S, (FLOOR - 95) * S, (IX + 150) * S, FLOOR * S), radius=40 * S,
                         fill=mix(sofa, (255, 255, 255), 0.08))

    # Introvertiert (sitzt)
    icol = mix((236, 228, 244), (250, 226, 186), s["iWarm"])
    if t > 11.2:
        icol = mix(icol, (236, 228, 244), 0.4)
    person(bd, IX, FLOOR - 70, icol, s["iF"], seated=True)
    # Buch: auf der Party zu, zu Hause offen vor dem Bauch
    if s["book"] > 0:
        bx, by = IX * S, (FLOOR - 165) * S
        bw, bh = 120 * S, 110 * S
        bd.rounded_rectangle((bx - bw, by, bx + bw, by + bh * 1.4), radius=10 * S, fill=(36, 92, 104))
        bd.rounded_rectangle((bx - bw + 12 * S, by + 12 * S, bx + bw - 12 * S, by + bh * 1.4 - 12 * S),
                             radius=6 * S, outline=(60, 130, 140), width=3 * S)
        bd.ellipse((bx - 18 * S, by + 50 * S, bx + 18 * S, by + 86 * S), fill=(240, 180, 70))
    else:
        bd.rounded_rectangle(((IX - 170) * S, (FLOOR - 120) * S, (IX - 80) * S, (FLOOR - 100) * S),
                             radius=4 * S, fill=(70, 110, 170))

    # Extrovertiert (steht)
    ecol = mix((242, 236, 248), (104, 116, 168), s["eBlue"])
    bob = 14 * s["bump"] * s["eArms"]
    arms = s["eArms"] * (0.8 + 0.2 * s["bump"])
    person(bd, EX, FLOOR - 10, ecol, s["eF"], arms=arms, bob=bob, phone=s["phone"])

    small = big.resize((W, H), Image.LANCZOS)
    # Spiegelung am Boden
    refl = small.crop((0, FLOOR - 300, W, FLOOR)).transpose(Image.FLIP_TOP_BOTTOM)
    frame.alpha_composite(alpha_mul(refl, 0.12), (0, FLOOR))
    frame.alpha_composite(small)

    # Konfetti
    if s["disco"] > 0.01:
        rng = np.random.default_rng(11)
        for i in range(70):
            x0, sp, ph = rng.uniform(0, W), rng.uniform(80, 200), rng.uniform(0, 10)
            y = (rng.uniform(0, H) + t * sp) % (FLOOR - 250) + 250
            x = x0 + 20 * math.sin(t * 2 + ph)
            c = [(255, 120, 160), (120, 200, 255), (255, 220, 100), (170, 255, 190)][i % 4]
            a = int(220 * s["disco"])
            d2 = ImageDraw.Draw(frame)
            d2.rectangle((x, y, x + 7, y + 12), fill=c + (a,))

    d = ImageDraw.Draw(frame)
    # Beschriftungen und Akkus
    spaced(d, (IX, 690), "INTROVERTIERT", F_LABEL, (230, 230, 240), 4)
    spaced(d, (EX, 690), "EXTROVERTIERT", F_LABEL, (230, 230, 240), 4)
    battery(d, IX + 10, 750, s["iL"], s["iC"], t)
    battery(d, EX + 10, 750, s["eL"], s["eC"], t)

    # Sprechblase "JUHU!"
    if s["woo"] > 0.01:
        sc = ease_back(s["woo"]) if t < 2 else s["woo"]
        bw, bh = 150 * sc, 64 * sc
        bx, by = EX - 140, 900
        d.rounded_rectangle((bx - bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2), radius=30 * sc, fill=(250, 250, 252))
        d.polygon([(bx + 30 * sc, by + bh / 2 - 4), (bx + 60 * sc, by + bh / 2 + 26 * sc), (bx + 60 * sc, by + bh / 2 - 4)],
                  fill=(250, 250, 252))
        if sc > 0.6:
            tw = F_BUB.getlength("JUHU!")
            d.text((bx - tw / 2, by - 22), "JUHU!", font=F_BUB, fill=(30, 30, 40))

    # Türklingel
    if s["bell"] > 0.01:
        bx, by = EX, 560 + 0 * s["bell"]
        wob = math.sin(t * 40) * 10
        a = int(255 * s["bell"])
        d.pieslice((bx - 40 + wob, by - 40, bx + 40 + wob, by + 50), 180, 360, fill=(255, 205, 70, a))
        d.rectangle((bx - 40 + wob, by + 5, bx + 40 + wob, by + 40), fill=(255, 205, 70, a))
        d.rectangle((bx - 50 + wob, by + 38, bx + 50 + wob, by + 48), fill=(255, 205, 70, a))
        d.ellipse((bx - 10 + wob, by + 46, bx + 10 + wob, by + 64), fill=(255, 205, 70, a))
        for sd in (-1, 1):
            d.arc((bx - 90, by - 50, bx + 90, by + 90), 200 if sd < 0 else 300, 240 if sd < 0 else 340,
                  fill=(255, 205, 70, a), width=6)

    # Text: "GLEICHER AKKU. / ANDERES LADEGERÄT."
    out = s["txtOut"]
    if s["txt1"] > 0 and out > 0:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        l1 = "GLEICHER AKKU."
        w1 = F_BIG.getlength(l1)
        y1 = 440 + (1 - ease_back(s["txt1"])) * 30
        ld.text(((W - w1) / 2, y1), l1, font=F_BIG, fill=(245, 242, 235, int(255 * min(s["txt1"] * 2, 1))))
        if s["txt2"] > 0:
            a = int(255 * min(s["txt2"] * 2, 1))
            pa, pb = "ANDERES ", "LADEGERÄT."
            wa, wb = F_BIG.getlength(pa), F_BIG.getlength(pb)
            x = (W - wa - wb) / 2
            y2 = 440 + F_BIG.size * 1.12 + (1 - ease_back(s["txt2"])) * 30
            ld.text((x, y2), pa, font=F_BIG, fill=(245, 242, 235, a))
            glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(glow).text((x + wa, y2), pb, font=F_BIG, fill=(255, 180, 50, int(a * 0.8)))
            layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(14)))
            ld.text((x + wa, y2), pb, font=F_BIG, fill=(255, 190, 60, a))
        frame.alpha_composite(alpha_mul(layer, out))

    # Abdunkeln, wenn alle weg sind (kurz bevor die Lampe angeht)
    dim = clamp(ramp(t, 4.6, 5.1) - ramp(t, 5.4, 5.7)) * 0.45
    if dim > 0:
        frame.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * dim))))
    return frame.convert("RGB")


# ---------------------------------------------------------------- Ton


def make_audio():
    sr = 44100
    n = int(DUR * sr)
    a = np.zeros(n)
    tt = np.arange(n) / sr
    beat = 60 / 124

    def add(t0, sig, gain=1.0):
        i = int(t0 * sr)
        j = min(n, i + len(sig))
        if i < n:
            a[i:j] += sig[: j - i] * gain

    def env(L, dec):
        x = np.arange(L) / sr
        return np.exp(-x * dec)

    def kick():
        L = int(0.3 * sr)
        x = np.arange(L) / sr
        f = 50 + 90 * np.exp(-x * 30)
        return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-x * 9)

    def hat():
        L = int(0.05 * sr)
        return np.random.default_rng(1).normal(0, 1, L) * env(L, 80) * 0.25

    def tone(freq, L, dec, harm=(1, 0.4, 0.2)):
        x = np.arange(int(L * sr)) / sr
        s = sum(h * np.sin(2 * np.pi * freq * (i + 1) * x) for i, h in enumerate(harm))
        att = np.minimum(1, x / 0.01)
        return s * np.exp(-x * dec) * att

    # Party-Musik: 0-4.8 und ab 10.9
    chords = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 294]]
    bass = [110, 98, 87, 98]

    def party(t0, t1, fade_out=None):
        k = 0
        t = t0
        while t < t1:
            g = 1.0
            if fade_out and t > fade_out[0]:
                g = max(0, 1 - (t - fade_out[0]) / (fade_out[1] - fade_out[0]))
            add(t, kick(), 0.55 * g)
            add(t + beat / 2, hat(), 0.5 * g)
            bar = (k // 4) % 4
            add(t, tone(bass[bar], beat * 0.9, 4, (1, 0.5)), 0.22 * g)
            if k % 2 == 0:
                for f in chords[bar]:
                    add(t + beat / 2, tone(f * 2, beat * 0.4, 10), 0.05 * g)
            t += beat
            k += 1

    party(0.0, 5.0, fade_out=(4.0, 5.0))
    party(10.95, DUR)
    # ruhige Musik zu Hause (5.5 - 10.2): sanfte Töne
    melody = [523, 659, 587, 523, 440, 523, 494, 440]
    for i, f in enumerate(melody):
        add(5.6 + i * 0.6, tone(f, 1.5, 2.5, (1, 0.15)), 0.12)
        add(5.6 + i * 0.6, tone(f / 2, 1.5, 2, (1,)), 0.06)
    # Ladegeräusch
    for t0, up in ((5.8, True), (0.2, True)):
        add(t0, tone(880, 0.25, 12) if up else tone(440, 0.25, 12), 0.15)
    # Text-Pops
    for t0 in (7.9, 8.6):
        add(t0, tone(1046, 0.2, 18), 0.18)
    # Türklingel: Ding-Dong
    add(10.3, tone(659, 0.9, 3.5, (1, 0.3, 0.1)), 0.35)
    add(10.62, tone(523, 1.1, 3.0, (1, 0.3, 0.1)), 0.35)
    # Lampe klick
    add(5.4, np.random.default_rng(2).normal(0, 1, int(0.02 * sr)) * env(int(0.02 * sr), 200), 0.4)

    a = a / max(1e-6, np.max(np.abs(a))) * 0.85
    with wave.open(WAV, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


def main():
    make_audio()
    n = int(DUR * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", WAV,
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(os.cpu_count(), initializer=init) as pool:
        for im in pool.imap(render, range(n), chunksize=4):
            p.stdin.write(im.tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("ffmpeg ist fehlgeschlagen")
    os.remove(WAV)
    print("Fertig:", OUT)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--preview":
        init()
        for sec in sys.argv[2:]:
            render(int(float(sec) * FPS)).save(os.path.join(HERE, f"_preview_{sec}.png"))
    else:
        main()
