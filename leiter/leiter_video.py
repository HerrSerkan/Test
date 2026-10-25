"""TikTok-Animation: "Perfektionist vs. Macher – Bau sie, während du kletterst."

Eigene Strichmännchen, eigener Sound (alles im Code erzeugt).
Aufruf:  python3 leiter/leiter_video.py              -> leiter/leiter.mp4
         python3 leiter/leiter_video.py --preview 1 5 7.5 11
"""
import math
import os
import subprocess
import sys
import wave
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, S = 1080, 1920, 30, 2
DUR = 12.6
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "leiter.mp4")
WAV = os.path.join(HERE, "_audio.wav")

GROUND = 1400
SP = 150                       # Sprossenabstand
LX = 730                       # Leitermitte
RAIL_L, RAIL_R = 600, 860
POLE_L, POLE_R = 120, 360
POLE_TOP = 560
HATCH_K = 13                   # Luke auf Höhe von Sprosse 13
MAX_RUNG = 12
LINE = 30                      # Strichstärke Figuren
WHITE = (245, 245, 245)
WOOD = (196, 176, 146)
RED = (215, 50, 50)


def rung_y(k):
    return GROUND - 110 - k * SP


HATCH_Y = rung_y(HATCH_K)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ramp(t, a, b):
    return clamp((t - a) / (b - a))


def smooth(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_io(x):
    x = clamp(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


# ------------------------------------------------------------ Zeitplan Kletterer

P1_END, P1_PER, P1_HAM = 4.0, 1.0, 0.45
P2_END, P2_PER, P2_HAM = 7.2, 0.6, 0.24
EXIT_END = 8.0


def climb_state(t):
    """-> (p = Sprosse unter den Füßen, Hammer-Phase oder -1, gebaute Sprossen)."""
    if t < P1_END:
        n, f = divmod(t, P1_PER)
        n = int(n)
        if f < P1_HAM:
            return n, f / P1_HAM, min(MAX_RUNG, n + 4)
        return n + smooth((f - P1_HAM) / (P1_PER - P1_HAM)), -1, min(MAX_RUNG, n + 4)
    base = int(P1_END / P1_PER)
    if t < P2_END:
        n, f = divmod(t - P1_END, P2_PER)
        n = int(n) + base
        if f < P2_HAM:
            return n, f / P2_HAM, min(MAX_RUNG, n + 4)
        return n + smooth((f - P2_HAM) / (P2_PER - P2_HAM)), -1, min(MAX_RUNG, n + 4)
    p_end, _, _ = climb_state(P2_END - 1e-6)
    return p_end + (14.6 - p_end) * smooth(ramp(t, P2_END, EXIT_END)), -1, MAX_RUNG


def hammer_hits():
    """Zeitpunkte der Hammerschläge (für den Ton)."""
    hits = []
    t = 0.0
    while t < P2_END:
        per, ham = (P1_PER, P1_HAM) if t < P1_END else (P2_PER, P2_HAM)
        hits += [t + ham * 0.25, t + ham * 0.75] if per == P1_PER else [t + ham * 0.5]
        t += per
    return hits


def _follow(t):
    """Kamera hält den Kopf des Kletterers bei etwa y=400 (geglättet)."""
    ps = [climb_state(max(0.0, t - k * 0.06))[0] for k in range(10)]
    p = sum(ps) / len(ps)
    head_y = rung_y(p) - 14 - 476
    target = 400 + 420 * smooth(ramp(t, 4.0, 6.5))
    return max(-1220.0, min(0.0, head_y - target))


def camera(t):
    cy = _follow(min(t, 8.1))
    back = ease_io(ramp(t, 8.1, 9.3))
    cy = cy * (1 - back)
    cx = -330 * back
    return cx, cy


# ------------------------------------------------------------ Zeichnen


class Pen:
    """Zeichnet in Welt-Koordinaten auf eine Supersampling-Ebene."""

    def __init__(self, draw, cx, cy):
        self.d, self.cx, self.cy = draw, cx, cy

    def p(self, x, y):
        return ((x - self.cx) * S, (y - self.cy) * S)

    def line(self, pts, fill=WHITE, width=LINE):
        q = [self.p(*pt) for pt in pts]
        self.d.line(q, fill=fill, width=int(width * S), joint="curve")
        r = width * S / 2
        for x, y in (q[0], q[-1]):
            self.d.ellipse((x - r, y - r, x + r, y + r), fill=fill)

    def circle(self, x, y, r, fill=WHITE):
        X, Y = self.p(x, y)
        self.d.ellipse((X - r * S, Y - r * S, X + r * S, Y + r * S), fill=fill)

    def poly(self, pts, fill):
        self.d.polygon([self.p(*pt) for pt in pts], fill=fill)

    def rect(self, x0, y0, x1, y1, fill, r=0):
        a, b = self.p(x0, y0), self.p(x1, y1)
        self.d.rounded_rectangle((a[0], a[1], b[0], b[1]), radius=r * S, fill=fill)


def limb(a, b, bend, side):
    """Gelenk zwischen a und b, seitlich ausgelenkt."""
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1
    return (mx - dy / L * bend * side, my + dx / L * bend * side)


def stick(pen, head, neck, hip, hands, feet, elbow_b=(40, 40), knee_b=(50, 50), head_r=48):
    for i, f in enumerate(feet):
        knee = limb(hip, f, knee_b[i], 1 if f[0] > hip[0] else -1)
        pen.line([hip, knee, f])
    pen.line([neck, hip])
    for i, h in enumerate(hands):
        el = limb(neck, h, elbow_b[i], -1 if h[0] > neck[0] else 1)
        pen.line([(neck[0], neck[1] + 15), el, h])
    pen.circle(head[0], head[1], head_r)


def draw_ladder(pen, built, pop, t):
    top = HATCH_Y + 10
    # Seile mit kleinen Zweigen
    for x in (RAIL_L, RAIL_R):
        pts = [(x + 4 * math.sin(y / 90), y) for y in range(int(top), GROUND + 1, 20)]
        pen.line(pts, fill=WOOD, width=12)
        for y in range(int(top) + 40, GROUND, 170):
            sd = 1 if (y // 170) % 2 else -1
            pen.line([(x + 2, y), (x + sd * 20, y - 18)], fill=WOOD, width=5)
    # Sprossen (leicht schief, Holz)
    rng = np.random.default_rng(5)
    tilts = rng.uniform(-14, 14, MAX_RUNG + 2)
    for k in range(0, built + 1):
        y = rung_y(k)
        a = 1.0
        off = 0
        if k == built and pop < 1:
            off = (1 - smooth(pop)) * -40
            a = smooth(pop)
        if a <= 0:
            continue
        x0, x1 = RAIL_L - 32, RAIL_R + 32
        tl = tilts[k]
        col = tuple(int(c * a) for c in WOOD)
        pen.poly([(x0, y - 13 + tl + off), (x1, y - 13 - tl + off),
                  (x1, y + 13 - tl + off), (x0, y + 13 + tl + off)], fill=col)


def draw_climber(pen, t):
    p, ham, built = climb_state(t)
    fl = math.floor(p)
    c = p - fl
    pl = fl + smooth(c * 2)
    pr = fl + smooth(c * 2 - 1)
    fy_l, fy_r = rung_y(pl) - 14, rung_y(pr) - 14
    hip_y = (fy_l + fy_r) / 2 - 210
    hip = (LX, hip_y)
    neck = (LX + 5, hip_y - 200)
    head = (LX + 10, neck[1] - 66)
    feet = [(LX - 70, fy_l), (LX + 70, fy_r)]
    hand_l = (LX - 95, neck[1] - 80 + 30 * math.sin(c * math.pi))
    if ham >= 0:
        # Ausholen und Schlagen (2 Schläge in der ruhigen Phase, sonst 1)
        hits = 2 if t < P1_END else 1
        sw = abs(math.sin(ham * math.pi * hits))
        ang = math.radians(-150 + 85 * (1 - sw))
        sh = (neck[0] + 10, neck[1] + 10)
        hand_r = (sh[0] + 150 * math.cos(ang) + 120, sh[1] + 150 * math.sin(ang) - 40)
        hand_r = (min(hand_r[0], RAIL_R + 20), hand_r[1])
        # Hammer
        hx, hy = hand_r
        a2 = ang + math.pi / 2
        hd = (hx + 70 * math.cos(ang), hy + 70 * math.sin(ang))
        pen.line([hand_r, hd], fill=(170, 150, 120), width=12)
        pen.line([(hd[0] - 30 * math.cos(a2), hd[1] - 30 * math.sin(a2)),
                  (hd[0] + 30 * math.cos(a2), hd[1] + 30 * math.sin(a2))], fill=(140, 140, 150), width=22)
    else:
        hand_r = (LX + 95, neck[1] - 120 + 40 * math.sin(c * math.pi + 1))
    stick(pen, head, neck, hip, [hand_l, hand_r], feet, elbow_b=(-40, 40), knee_b=(60, 60))


def draw_perfectionist_work(pen, t):
    # Brett am Boden, Figur kniet und poliert mit roter Wasserwaage
    pen.rect(POLE_L + 10, GROUND - 26, POLE_R - 10, GROUND - 4, fill=(225, 225, 225), r=3)
    breath = 6 * math.sin(t * 3)
    hip = (215, 1235)
    neck = (262, 1055 + breath)
    head = (300, 1005 + breath)
    hx = 250 + 55 * math.sin(t * 7)
    hand = (hx, GROUND - 46)
    hand2 = (hx - 40, GROUND - 40)
    feet = [(300, GROUND - 6), (150, GROUND - 6)]
    knee_front = (305, 1300)
    knee_back = (205, GROUND - 14)
    pen.line([hip, knee_front, feet[0]])
    pen.line([hip, knee_back, feet[1]])
    pen.line([neck, hip])
    for h, b in ((hand, 40), (hand2, 30)):
        el = limb((neck[0], neck[1] + 15), h, b, -1)
        pen.line([(neck[0], neck[1] + 15), el, h])
    pen.circle(head[0], head[1], 48)
    pen.rect(hx - 50, GROUND - 52, hx + 50, GROUND - 30, fill=RED, r=4)
    pen.rect(hx - 8, GROUND - 48, hx + 8, GROUND - 34, fill=(255, 220, 120), r=3)


def draw_perfectionist_end(pen, t):
    # eine einzige, perfekte Sprosse – mit Wasserwaage drauf
    y = 1250
    pen.rect(POLE_L, y - 12, POLE_R, y + 12, fill=(235, 235, 235), r=3)
    pen.rect(205, y - 34, 275, y - 12, fill=RED, r=4)
    pen.rect(232, y - 30, 248, y - 16, fill=(255, 220, 120), r=3)
    pen.rect(POLE_R + 40, GROUND - 40, POLE_R + 70, GROUND - 2, fill=(110, 110, 115), r=4)  # Werkzeugdose
    b = 5 * math.sin(t * 2.2)
    hip = (-80, GROUND - 22)
    neck = (-140, 1210 + b)
    head = (-160, 1150 + b)
    feet = [(150, GROUND - 8), (130, GROUND - 6)]
    hands = [(-200, GROUND - 8), (-185, GROUND - 6)]
    pen.line([hip, (60, 1290), feet[0]])
    pen.line([hip, (45, 1305), feet[1]])
    pen.line([neck, hip])
    for h in hands:
        pen.line([(neck[0], neck[1] + 15), (-190, 1300), h])
    pen.circle(head[0], head[1], 48)


# ------------------------------------------------------------ statische Ebenen

GLOW = None
FONT_LABEL = FONT_TXT = None


def init():
    global GLOW, FONT_LABEL, FONT_TXT
    g = Image.new("RGBA", (1400, 2600), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    cx = 700
    d.ellipse((cx - 330, 0, cx + 330, 560), fill=(255, 255, 255, 70))
    d.polygon([(cx - 170, 280), (cx + 170, 280), (cx + 260, 2600), (cx - 260, 2600)], fill=(255, 255, 255, 22))
    GLOW = g.filter(ImageFilter.GaussianBlur(70))
    FONT_LABEL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 34)
    FONT_TXT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 36)


def spaced(d, cx, y, text, f, fill, track=7):
    ws = [f.getlength(ch) for ch in text]
    total = sum(ws) + track * (len(text) - 1)
    x = cx - total / 2
    d.rectangle((x - 14, y - 6, x + total + 14, y + f.size + 10), fill=(0, 0, 0, 200))
    for ch, w in zip(text, ws):
        d.text((x, y), ch, font=f, fill=fill)
        x += w + track


def alpha_mul(img, a):
    r, g, b, al = img.split()
    return Image.merge("RGBA", (r, g, b, al.point(lambda v: int(v * a))))


def render(fi):
    t = fi / FPS
    cx, cy = camera(t)
    frame = Image.new("RGBA", (W, H), (0, 0, 0, 255))

    # Licht von oben (Luke)
    frame.alpha_composite(GLOW, (int(LX - 700 - cx), int(HATCH_Y - 280 - cy)))

    big = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    pen = Pen(ImageDraw.Draw(big), cx, cy)

    # Pfosten des Perfektionisten
    for x in (POLE_L, POLE_R):
        pen.rect(x - 13, POLE_TOP, x + 13, GROUND, fill=(200, 200, 205), r=3)

    p, ham, built = climb_state(t)
    pop = ham * 2.5 if ham >= 0 else 1.0
    draw_ladder(pen, built, pop, t)

    if t < 8.3:
        draw_perfectionist_work(pen, t)
    else:
        draw_perfectionist_end(pen, t)

    # Kletterer (oberhalb der Luke ausgeblendet)
    if t < EXIT_END + 0.1:
        cl = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
        draw_climber(Pen(ImageDraw.Draw(cl), cx, cy), t)
        cut = int((HATCH_Y + 5 - cy) * S)
        if cut > 0:
            ImageDraw.Draw(cl).rectangle((0, 0, W * S, min(cut, H * S)), fill=(0, 0, 0, 0))
        big.alpha_composite(cl)

    # Luke: helle, schräge Platte
    hx0, hx1 = RAIL_L - 60, RAIL_R + 60
    pen.poly([(hx0 + 30, HATCH_Y - 40), (hx1 + 10, HATCH_Y - 40), (hx1 - 10, HATCH_Y + 10), (hx0, HATCH_Y + 10)],
             fill=(250, 250, 250))
    pen.poly([(hx0, HATCH_Y + 10), (hx1 - 10, HATCH_Y + 10), (hx1 - 10, HATCH_Y + 22), (hx0, HATCH_Y + 22)],
             fill=(200, 200, 200))

    small = big.resize((W, H), Image.LANCZOS)
    gy = int(GROUND - cy)
    if 0 < gy < H:
        refl = small.crop((0, max(0, gy - 360), W, gy)).transpose(Image.FLIP_TOP_BOTTOM)
        frame.alpha_composite(alpha_mul(refl, 0.13), (0, gy))
    frame.alpha_composite(small)

    d = ImageDraw.Draw(frame)
    # Beschriftungen (bewegen sich mit der Kamera)
    ly = 380 - cy
    if ly > -60 and t < 8.5:
        spaced(d, POLE_L / 2 + POLE_R / 2 - cx, ly, "PERFEKTIONIST", FONT_LABEL, (235, 235, 235))
        spaced(d, LX - cx, ly, "MACHER", FONT_LABEL, (235, 235, 235))
    # Schreibmaschinen-Text
    txt = "BAU SIE, WÄHREND DU KLETTERST."
    n = int(len(txt) * ramp(t, 6.4, 7.4))
    if n > 0:
        spaced(d, W / 2, 300, txt[:n], FONT_TXT, (240, 240, 240), track=5)
    # Schluss-Beschriftung
    if t > 9.6:
        a = int(255 * ramp(t, 9.6, 10.1))
        spaced(d, 120 - cx + 30 + 40, 1440, "PERFEKTIONIST", FONT_LABEL, (235, 235, 235, a))
    return frame.convert("RGB")


# ------------------------------------------------------------ Ton


def make_audio():
    sr = 44100
    n = int(DUR * sr)
    a = np.zeros(n)
    rng = np.random.default_rng(4)

    def add(t0, sig, g=1.0):
        i = int(t0 * sr)
        if i >= n:
            return
        j = min(n, i + len(sig))
        a[i:j] += sig[: j - i] * g

    def tone(f, L, dec, harm=(1, 0.3)):
        x = np.arange(int(L * sr)) / sr
        s = sum(h * np.sin(2 * np.pi * f * (i + 1) * x) for i, h in enumerate(harm))
        return s * np.exp(-x * dec) * np.minimum(1, x / 0.01)

    def knock():
        L = int(0.09 * sr)
        x = np.arange(L) / sr
        return (np.sin(2 * np.pi * 180 * x) * 0.7 + rng.normal(0, 1, L) * 0.5) * np.exp(-x * 60)

    # Puls: tiefer Herzschlag-Bass, wird schneller beim Klettern
    t = 0.0
    while t < 7.6:
        per = 0.5 if t < 4 else 0.25
        add(t, tone(55, 0.4, 7, (1, 0.5)), 0.5)
        t += per
    # aufsteigende Fläche während des Kletterns
    x = np.arange(int(7.6 * sr)) / sr
    f = 110 * 2 ** (x / 7.6 * 1.5)
    pad = (np.sin(2 * np.pi * np.cumsum(f) / sr) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / sr))
    pad *= np.minimum(1, x / 1.0) * np.clip((7.6 - x) / 0.4, 0, 1) * (0.3 + 0.7 * x / 7.6)
    add(0, pad, 0.07)
    for h in hammer_hits():
        add(h, knock(), 0.5)
    # Licht: heller Akkord
    for fr in (523, 659, 784, 1046):
        add(7.4, tone(fr, 2.5, 1.2, (1, 0.1)), 0.08)
    # Schluss: leise, traurige Töne
    for i, fr in enumerate((330, 294, 262, 247)):
        add(9.4 + i * 0.75, tone(fr, 2.0, 1.6, (1, 0.2)), 0.12)
    a = a / max(1e-6, np.abs(a).max()) * 0.85
    with wave.open(WAV, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


def main():
    make_audio()
    nf = int(DUR * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", WAV,
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(os.cpu_count(), initializer=init) as pool:
        for im in pool.imap(render, range(nf), chunksize=4):
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
