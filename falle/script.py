"""Sprechertext, Stimme (TTS) und Zeitplan für "Die Intelligenzfalle".

Erzeugt:
  build/voice_XX.mp3        Stimme pro Satz (Microsoft Edge TTS, Stimme de-DE-ConradNeural)
  build/timeline.json       Karten, Wort-Zeiten, Satz-Start/Ende
  build/voice.wav           komplette Sprecherspur

Markup in den Karten:
  /        Zeilenumbruch
  *wort*   kursiv (Serif)
  ^WORT^   fett, Großbuchstaben (Black)
  +wort+   groß, halbfett
  ~WORT~   klein, gesperrt
  {100}    Zähler (gesprochen: "hundert")
"""
import asyncio
import difflib
import json
import os
import re
import ssl
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
os.makedirs(BUILD, exist_ok=True)

VOICE = "de-DE-ConradNeural"
RATE = "+3%"
PITCH = "-4Hz"

# (Startzeit im Original, Karten)
SENTENCES = [
    (0.00, ["Zu viel Denken / *kann dich* / ^DUMM MACHEN.^"]),
    (2.90, ["Stell dir zwei Männer vor, / mit genau demselben *Ziel.*"]),
    (5.02, ["Der Erste / verbringt Monate damit,",
            "jedes mögliche / *Szenario* durchzuspielen,",
            "^RISIKEN^ / abzuwägen",
            "und sich auf Probleme / vorzubereiten, / die er *nie* erlebt hat."]),
    (12.9, ["Er ist überzeugt: / je mehr er / +versteht,+",
            "desto eher / wird er es *schaffen.*"]),
    (17.02, ["Der Zweite / fängt einfach an,",
             "mit einem *unfertigen* Plan."]),
    (19.76, ["Er macht / *Fehler,*",
             "stößt auf +Hindernisse,+ / mit denen er / nie gerechnet hat,",
             "und scheitert / ^IMMER WIEDER.^"]),
    (24.74, ["Doch jeder Fehlschlag / +zeigt ihm etwas,+",
             "das sich der Erste / nur *vorstellt.*"]),
    (29.34, ["+Und nach einem Jahr+",
             "ist der Unterschied / ^NICHT MEHR / ZU ÜBERSEHEN.^"]),
    (33.06, ["Der Erste kennt",
             "{100} / Gründe,",
             "warum seine Idee / ^SCHEITERN KÖNNTE.^"]),
    (36.88, ["Der Zweite hat / herausgefunden, / welche davon",
             "*wirklich* / ^ZÄHLEN.^"]),
    (40.66, ["Und genau das / nennt man",
             "~DIE~ / ^INTELLIGENZFALLE.^"]),
    (43.84, ["Der Glaube, / dass es mehr bringt,",
             "jede mögliche / *Folge* / zu durchdenken,",
             "als sich / der *Wirklichkeit* / zu stellen."]),
    (50.18, ["Denn +Intelligenz+ / kann dir zeigen,",
             "was passieren *könnte,*"]),
    (53.16, ["aber nur +Erfahrung+ / zeigt dir,",
             "was / ^WIRKLICH / PASSIERT.^"]),
    (56.44, ["Und manchmal ist es der, / der weniger weiß,",
             "der am Ende / ^MEHR ERREICHT.^"]),
    (59.66, ["Nicht, weil / *Unwissen* / ihn fähig macht,",
             "sondern weil er / bereit war,",
             "^ANZUFANGEN,^",
             "bevor er / *alles wusste.*"]),
]

MARK = re.compile(r"(\*[^*]+\*|\^[^^]+\^|\+[^+]+\+|~[^~]+~|\{\d+\}|/|[^\s/]+)")


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
        elif m.startswith("~"):
            style, m = "spaced", m[1:-1]
        elif m.startswith("{"):
            style, m = "counter", m[1:-1]
        # Gruppen (z.B. ^DUMM MACHEN.^) in einzelne Wörter teilen
        for w in m.split():
            if w == "/":
                lines.append(cur)
                cur = []
            else:
                cur.append(dict(text=w, style=style))
    lines.append(cur)
    return [l for l in lines if l]


def norm(w):
    w = w.lower()
    if w == "100":
        return "hundert"
    return re.sub(r"[^a-z0-9äöüß]", "", w)


def spoken_text(cards):
    words = []
    for c in cards:
        for line in parse_card(c):
            for tok in line:
                t = tok["text"]
                words.append("hundert" if tok["style"] == "counter" else t.lower() if tok["style"] in ("heavy", "spaced") else t)
    s = " ".join(words)
    return s[0].upper() + s[1:]


async def tts(text, out):
    import edge_tts
    import edge_tts.communicate as c
    c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
    com = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, boundary="WordBoundary")
    words = []
    with open(out, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append(dict(w=ch["text"], s=ch["offset"] / 1e7, e=(ch["offset"] + ch["duration"]) / 1e7))
    return words


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def align(tokens, words):
    """Display-Tokens auf TTS-Wörter abbilden (Start/Ende je Token)."""
    a = [norm(t["text"]) if t["style"] != "counter" else "hundert" for t in tokens]
    b = [norm(w["w"]) for w in words]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(a)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = words[blk.b + k]
            times[blk.a + k] = (w["s"], w["e"])
    # Lücken interpolieren
    for i in range(len(times)):
        if times[i] is None:
            prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), (0, 0))
            nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), None)
            s = prev[1] if nxt is None else (prev[1] + nxt[0]) / 2
            times[i] = (s, s + 0.25)
    return times


def main(force=False):
    timeline = dict(sentences=[], cards=[])
    t_cursor = 0.0
    clips = []
    for si, (orig, cards) in enumerate(SENTENCES):
        mp3 = os.path.join(BUILD, f"voice_{si:02d}.mp3")
        wj = mp3 + ".words.json"
        text = spoken_text(cards)
        if force or not os.path.exists(wj) or json.load(open(wj)).get("text") != text:
            words = asyncio.run(tts(text, mp3))
            json.dump(dict(text=text, words=words), open(wj, "w"), ensure_ascii=False)
        words = json.load(open(wj))["words"]
        dur = duration(mp3)
        start = max(orig, t_cursor + (0.35 if si else 0.0))
        clips.append((mp3, start))
        tokens_all = []
        card_tok = []
        for c in cards:
            lines = parse_card(c)
            card_tok.append(lines)
            for line in lines:
                tokens_all.extend(line)
        times = align(tokens_all, words)
        k = 0
        for lines in card_tok:
            for line in lines:
                for tok in line:
                    tok["s"] = round(start + times[k][0], 3)
                    tok["e"] = round(start + times[k][1], 3)
                    k += 1
            first = lines[0][0]["s"]
            timeline["cards"].append(dict(sentence=si, lines=lines, start=first))
        speech_end = start + (words[-1]["e"] if words else dur)
        timeline["sentences"].append(dict(start=round(start, 3), end=round(speech_end, 3), text=text))
        t_cursor = speech_end
        print(f"{si:2d} {start:6.2f}-{speech_end:6.2f}  {text}")
    # Kartenende = Start der nächsten Karte
    for i, c in enumerate(timeline["cards"]):
        nxt = timeline["cards"][i + 1]["start"] if i + 1 < len(timeline["cards"]) else t_cursor + 1.6
        c["end"] = round(nxt, 3)
    total = round(t_cursor + 3.2, 2)
    timeline["duration"] = total
    json.dump(timeline, open(os.path.join(BUILD, "timeline.json"), "w"), ensure_ascii=False, indent=1)

    # Sprecherspur zusammensetzen
    inputs, filt = [], []
    for i, (mp3, st) in enumerate(clips):
        inputs += ["-i", mp3]
        filt.append(f"[{i}:a]aresample=44100,adelay={int(st * 1000)}:all=1[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{total}[out]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt),
                    "-map", "[out]", "-ac", "1", "-ar", "44100", os.path.join(BUILD, "voice.wav")], check=True)
    print("Gesamtdauer:", total)


def transcribe_words(path):
    """Wortzeiten einer fertigen Aufnahme per Spracherkennung (faster-whisper)."""
    import numpy as np
    from faster_whisper import WhisperModel
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    prompt = " ".join(spoken_text(c) for _, c in SENTENCES)
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="de", word_timestamps=True, initial_prompt=prompt[:800])
    return [dict(w=w.word.strip(), s=w.start, e=w.end) for sg in segs for w in sg.words]


def main_external(voice_file, lead=0.25):
    """Timeline aus EINER fertigen Aufnahme (z.B. ElevenLabs) bauen."""
    cache = os.path.join(BUILD, "external_words.json")
    if os.path.exists(cache) and json.load(open(cache)).get("file") == os.path.abspath(voice_file):
        words = json.load(open(cache))["words"]
    else:
        words = transcribe_words(voice_file)
        json.dump(dict(file=os.path.abspath(voice_file), words=words), open(cache, "w"), ensure_ascii=False)
    print(" ".join(w["w"] for w in words))
    timeline = dict(sentences=[], cards=[])
    tokens_all, per_sentence = [], []
    for si, (_, cards) in enumerate(SENTENCES):
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
        text = spoken_text(SENTENCES[si][1])
        timeline["sentences"].append(dict(start=s_start, end=s_end, text=text))
        print(f"{si:2d} {s_start:6.2f}-{s_end:6.2f}  {text}")
    last = timeline["sentences"][-1]["end"]
    for i, c in enumerate(timeline["cards"]):
        nxt = timeline["cards"][i + 1]["start"] if i + 1 < len(timeline["cards"]) else last + 1.6
        c["end"] = round(nxt, 3)
    total = round(max(last + 3.2, lead + duration(voice_file) + 0.5), 2)
    timeline["duration"] = total
    json.dump(timeline, open(os.path.join(BUILD, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", voice_file, "-af",
                    f"adelay={int(lead * 1000)}:all=1,apad,atrim=0:{total}", "-ac", "1", "-ar", "44100",
                    os.path.join(BUILD, "voice.wav")], check=True)
    print("Gesamtdauer:", total)


if __name__ == "__main__":
    if "--voice" in sys.argv:
        main_external(sys.argv[sys.argv.index("--voice") + 1])
    else:
        main(force="--force" in sys.argv)
