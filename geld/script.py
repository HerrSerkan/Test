"""Sprechertext und Zeitplan für "Warum Geld sich bewegt" (deutsche Version).

    python3 geld/script.py --text                      # Sprechertext (für ElevenLabs, am Stück)
    python3 geld/script.py --voice build/voice_el.wav  # Wortzeiten per Whisper -> build/timeline.json

Markup in den Karten (Text unter der Szene):
  /        Zeilenumbruch
  *wort*   kursiv (Serif)
  ^WORT^   fett, Großbuchstaben (Black)
  +wort+   groß, halbfett
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

NUM_WORDS = {}

# Ein Eintrag pro Satz: Liste der Karten (nacheinander unter der Szene)
SENTENCES = [
    ["Je mehr du dem +Geld+ / hinterherjagst,", "desto weniger verstehst du, / wie es *eigentlich entsteht.*"],   # 0
    ["Die meisten, / die *reich* werden wollen,", "denken ständig / darüber nach,", "wie viel sie / +verdienen möchten,+"],  # 1
    ["statt zu verstehen,", "was Geld überhaupt / ^WERTVOLL^ macht."],                                            # 2
    ["Denn Geld taucht nicht / *einfach auf,*", "nur weil jemand / es haben will."],                               # 3
    ["Es wechselt / den Besitzer,", "wenn Menschen glauben, / etwas zu bekommen,", "das den Preis / ^WERT IST.^"],  # 4
    ["Und wer das einmal / verstanden hat,", "sieht die Welt / mit völlig *anderen Augen.*"],                     # 5
    ["Jedes erfolgreiche / Unternehmen / existiert nur,", "weil es Kunden / einen +Grund+ gibt,", "ihr Geld / *auszugeben.*"],  # 6
    ["Manchmal ist / dieser Grund", "^BEQUEMLICHKEIT.^", "Manchmal / +gesparte Zeit,+", "weniger / *Unsicherheit,*"],  # 7
    ["oder ein gelöstes / +Problem,+", "das sonst viel / *teurer* geworden wäre."],                               # 8
    ["Und das *Spannende* / daran:", "Der Wert einer Lösung / hängt nicht unbedingt / davon ab,", "wie +schwer+ sie / herzustellen ist."],  # 9
    ["Sondern davon, / wie wertvoll / das ^ERGEBNIS^", "für den ist, / der dafür *bezahlt.*"],                   # 10
    ["Genau deshalb / kann es im Geschäft", "ein riesiger / ^VORTEIL^ sein,", "menschliches Verhalten / zu *verstehen.*"],  # 11
    ["Je besser du weißt, / was Menschen +wollen,+", "was sie / +frustriert,+"],                                 # 12
    ["und wofür sie / bereit sind / zu +zahlen,+", "desto leichter / erkennst du / ^CHANCEN.^"],                  # 13
    ["Denn reich zu werden / heißt nicht einfach,", "*mehr Geld* / zu wollen."],                                 # 14
    ["Es heißt / zu verstehen,", "warum Geld / sich +bewegt,+"],                                                 # 15
    ["und etwas / aufzubauen,", "das ihm / einen Grund gibt,", "zu ^DIR^ / zu kommen."],                         # 16
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
    segs, _ = model.transcribe(audio, language="de", word_timestamps=True, initial_prompt=spoken_text()[:800])
    words = []
    for sg in segs:
        for w in sg.words:
            # Zahlen als Ziffern ("500") in mehrere Tokens zerlegen ist nicht nötig: norm() bildet sie ab
            words.append(dict(w=w.word.strip(), s=w.start, e=w.end))
    return words


def clean_words(words):
    """Whisper klebt an Satzgrenzen manchmal Müll vor ein Wort (".BRUNDenn"): Wort herauslösen,
    Startzeit auf das Wortende beziehen (der Müll deckt die Pause davor ab)."""
    out = []
    for w in words:
        m = re.search(r"[A-ZÄÖÜ][a-zäöüß]+[,.!?:]*$", w["w"])
        if re.match(r"^[^A-Za-zÄÖÜäöüß]", w["w"]) and m:
            w = dict(w=m.group(0), s=max(w["s"], w["e"] - 0.32), e=w["e"])
        out.append(w)
    return out


def main_external(voice_file, lead=0.35):
    cache = os.path.join(BUILD, "external_words.json")
    if os.path.exists(cache) and json.load(open(cache)).get("file") == os.path.abspath(voice_file) \
            and json.load(open(cache)).get("mtime") == os.path.getmtime(voice_file):
        words = json.load(open(cache))["words"]
    else:
        words = transcribe_words(voice_file)
        json.dump(dict(file=os.path.abspath(voice_file), mtime=os.path.getmtime(voice_file), words=words),
                  open(cache, "w"), ensure_ascii=False)
    words = clean_words(words)
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
