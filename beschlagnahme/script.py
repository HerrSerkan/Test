"""Sprechertext und Zeitplan für "Wie die Polizei dein Geld nehmen kann – erklärt mit Minecraft".

    python3 kurden/script.py --text                      # Sprechertext (für ElevenLabs, am Stück)
    python3 kurden/script.py --voice build/voice_el.wav  # Wortzeiten per Whisper -> build/timeline.json

Markup in den Karten (Text unter der Szene):
  /        Zeilenumbruch
  *wort*   kursiv (Serif, grün)
  ^WORT^   fett, Großbuchstaben (Black)
  +wort+   groß, halbfett
  {500}    Zahl, zählt hoch (gesprochen: "fünfhundert")
"""
import difflib
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
os.makedirs(BUILD, exist_ok=True)

NUM_WORDS = {"64": "vierundsechzig", "2014": "zweitausendvierzehn"}

# Ein Eintrag pro Satz (eine Karte je Satz; angezeigt wird Wort für Wort, wie im Original)
SENTENCES = [
    ["Wie die Polizei dir dein Geld wegnehmen kann – erklärt mit Minecraft."],   # 0
    ["Paul spart schon seit Monaten."],                                            # 1
    ["Heute trägt er {64} Smaragde bei sich, einen vollen Stapel, zum Spawn, um seine erste Farm zu kaufen."],  # 2
    ["Unterwegs hält ihn ein Mod an."],                                            # 3
    ["„Ganz schön viele Smaragde“, sagt der Mod. „Woher hast du die?“"],          # 4
    ["Paul sagt, er hat sie selbst abgebaut."],                                    # 5
    ["Er zeigt dem Mod sogar seine Spitzhacke."],                                  # 6
    ["Der Mod glaubt ihm nicht und nimmt alle {64}."],                             # 7
    ["Paul hat gegen keine Regel verstoßen."],                                     # 8
    ["Das behauptet auch niemand."],                                               # 9
    ["Der Mod vermutet nur, dass die Smaragde gestohlen sein könnten – und das reicht."],  # 10
    ["Paul will seine Smaragde zurück."],                                          # 11
    ["Die Mods sagen: Klar, aber erst muss er beweisen, dass er sie nicht gestohlen hat."],  # 12
    ["Paul hat keine Ahnung, wie er das beweisen soll."],                          # 13
    ["Und der Versuch würde Monate dauern und mehr Smaragde kosten, als er noch hat."],  # 14
    ["Also gibt Paul auf, so wie die meisten Spieler."],                           # 15
    ["Und die Smaragde?"],                                                         # 16
    ["Die behalten die Mods."],                                                    # 17
    ["Diese Woche haben sie sich davon neue Diamantrüstungen gekauft."],           # 18
    ["Das nennt sich Civil Forfeiture."],                                          # 19
    ["Die Polizei darf dein Geld nehmen, ohne dich wegen einer Straftat anzuklagen."],  # 20
    ["Die Mods sagen, so können Diebe ihre Beute nicht behalten."],               # 21
    ["Paul sagt, er hat alles verloren, obwohl er nie etwas falsch gemacht hat."],  # 22
    ["In echt kann die Polizei in den USA Bargeld und Autos von Leuten einziehen, die nie angeklagt werden."],  # 23
    ["Und oft darf sie behalten, was sie nimmt."],                                 # 24
    ["Laut einer Zählung hat die Polizei {2014} auf diesem Weg mehr genommen, als Einbrecher gestohlen haben."],  # 25
    ["Paul hat immer noch keine Farm."],                                           # 26
    ["Und die Mods tragen glänzende neue Rüstungen. Und das zeigt dir …"],        # 27
]

MARK = re.compile(r"(\*[^*]+\*|\^[^^]+\^|\+[^+]+\+|\{\d+\}|/|[^\s/]+)")


def parse_card(card):
    """Karte -> Zeilen mit Tokens {text, style}."""
    lines, cur = [], []
    for m in MARK.findall(card):
        if m == "/":
            lines.append(cur)
            cur = []
            continue
        style = "plain"
        if m.startswith("*"):
            style, m = "italic", m[1:-1]
        elif m.startswith("^"):
            style, m = "heavy", m[1:-1]
        elif m.startswith("+"):
            style, m = "big", m[1:-1]
        elif m.startswith("{"):
            style, m = "counter", m[1:-1]
        for w in m.split():
            cur.append(dict(text=w, style=style))
    lines.append(cur)
    return [l for l in lines if l]


def norm(w):
    w = re.sub(r"[^a-z0-9äöüß]", "", w.lower())
    return NUM_WORDS.get(w, w)


def spoken_sentence(cards):
    words = []
    for c in cards:
        for line in parse_card(c):
            for tok in line:
                t = tok["text"]
                if tok["style"] == "counter":
                    t = NUM_WORDS[t]
                elif tok["style"] == "heavy":
                    t = t.lower()
                words.append(t)
    s = " ".join(words)
    return s[0].upper() + s[1:]


def spoken_text():
    return "\n".join(spoken_sentence(c) for c in SENTENCES)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def align(tokens, words):
    """Display-Tokens auf erkannte Wörter abbilden (Start/Ende je Token)."""
    a = [norm(t["text"]) for t in tokens]
    b = [norm(w["w"]) for w in words]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(a)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = words[blk.b + k]
            times[blk.a + k] = (w["s"], w["e"])
    miss = sum(1 for x in times if x is None)
    if miss:
        print("nicht erkannt:", [tokens[i]["text"] for i, x in enumerate(times) if x is None])
    for i in range(len(times)):
        if times[i] is None:
            prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), (0, 0))
            nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), None)
            s = prev[1] if nxt is None else (prev[1] + nxt[0]) / 2
            times[i] = (s, s + 0.25)
    return times


def transcribe_words(path):
    """Wortzeiten einer fertigen Aufnahme per Spracherkennung (faster-whisper)."""
    import numpy as np
    from faster_whisper import WhisperModel
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="de", word_timestamps=True, condition_on_previous_text=False,
                              initial_prompt="Paul, Smaragde, Spawn, Mod, Mods, Spitzhacke, Civil Forfeiture, Minecraft.")
    words = []
    for sg in segs:
        for w in sg.words:
            # Zahlen als Ziffern ("500") in mehrere Tokens zerlegen ist nicht nötig: norm() bildet sie ab
            words.append(dict(w=w.word.strip(), s=w.start, e=w.end))
    return words


def main_external(voice_file, lead=0.3):
    cache = os.path.join(BUILD, "external_words.json")
    if os.path.exists(cache) and json.load(open(cache)).get("file") == os.path.abspath(voice_file) \
            and json.load(open(cache)).get("mtime") == os.path.getmtime(voice_file):
        words = json.load(open(cache))["words"]
    else:
        words = transcribe_words(voice_file)
        json.dump(dict(file=os.path.abspath(voice_file), mtime=os.path.getmtime(voice_file), words=words),
                  open(cache, "w"), ensure_ascii=False)
    print(" ".join(w["w"] for w in words))
    timeline = dict(sentences=[], cards=[])
    tokens_all, per_sentence = [], []
    for cards in SENTENCES:
        cl = [parse_card(c) for c in cards]
        per_sentence.append(cl)
        for lines in cl:
            for line in lines:
                tokens_all.extend(line)
    times = align(tokens_all, words)
    k = 0
    for si, cl in enumerate(per_sentence):
        s_start = None
        for lines in cl:
            for line in lines:
                for tok in line:
                    tok["s"] = round(lead + times[k][0], 3)
                    tok["e"] = round(lead + times[k][1], 3)
                    s_start = tok["s"] if s_start is None else s_start
                    s_end = tok["e"]
                    k += 1
            timeline["cards"].append(dict(sentence=si, lines=lines, start=lines[0][0]["s"]))
        text = spoken_sentence(SENTENCES[si])
        timeline["sentences"].append(dict(start=s_start, end=s_end, text=text))
        print(f"{si:2d} {s_start:6.2f}-{s_end:6.2f}  {text}")
    last = timeline["sentences"][-1]["end"]
    for i, c in enumerate(timeline["cards"]):
        nxt = timeline["cards"][i + 1]["start"] if i + 1 < len(timeline["cards"]) else last + 2.2
        c["end"] = round(nxt, 3)
    total = round(max(last + 2.6, lead + duration(voice_file) + 0.5), 2)
    timeline["duration"] = total
    json.dump(timeline, open(os.path.join(BUILD, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", voice_file, "-af",
                    f"adelay={int(lead * 1000)}:all=1,apad,atrim=0:{total}", "-ac", "1", "-ar", "44100",
                    os.path.join(BUILD, "voice.wav")], check=True)
    print("Gesamtdauer:", total)


if __name__ == "__main__":
    if "--text" in sys.argv:
        print(spoken_text())
    else:
        main_external(sys.argv[sys.argv.index("--voice") + 1])
