"""Sprechertext und Zeitplan für "Wie groß wirst du?" (deutsche Version).

    python3 groesse/script.py --text                      # Sprechertext (für ElevenLabs, am Stück)
    python3 groesse/script.py --edge                      # Ersatzstimme (Edge TTS) -> build/take_edge.mp3
    python3 groesse/voice_prep.py take.mp3 groesse/build/voice_el.wav 1.05
    python3 groesse/script.py --voice build/voice_el.wav  # Wortzeiten per Whisper -> build/timeline.json

Markup in den Karten (Text unter der Szene, alles in Großbuchstaben):
  /        Zeilenumbruch
  ^wort^   Schlüsselwort (gelb hervorgehoben)
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

NUM_WORDS = {"168": "hundertachtundsechzig", "178": "hundertachtundsiebzig", "185": "hundertfünfundachtzig",
             "16": "sechzehn", "13": "dreizehn", "180": "hundertachtzig", "23": "dreiundzwanzig", "18": "achtzehn",
             "10": "zehn", "2": "zwei"}

SENTENCES = [
    ["Seine Mutter / ist ^168^ Zentimeter,", "sein Vater / ^178.^", "Und er selbst / ist mit 16 / schon ^185.^"],   # 0
    ["Glückliche / ^Gene?^", "Das ist nur / die ^halbe^ Wahrheit."],                                          # 1
    ["Ärzte können / die Endgröße / eines Jungen", "aus der Größe / seiner ^Eltern^ / schätzen."],            # 2
    ["Zur Mutter / ^13^ Zentimeter / dazu,", "dann den Mittelwert / mit dem ^Vater.^"],                       # 3
    ["Bei ihm / sind das / etwa ^180.^"],                                                                     # 4
    ["Aber mit / ^Spielraum:^", "10 Zentimeter / nach oben / oder unten."],                                  # 5
    ["Gene geben dir / keine Größe.", "Sie geben dir / einen ^Bereich.^"],                                    # 6
    ["Wo du darin / landest,", "hängt davon ab, / was du tust,", "solange du / noch ^wächst.^"],               # 7
    ["Am meisten / ^Wachstumshormon^", "schüttet dein Körper / im ^Tiefschlaf^ aus."],                        # 8
    ["Kurze Nächte / ^kosten^ davon."],                                                                       # 9
    ["Deine Knochen / wachsen aus dem, / was du isst,", "vor allem / aus ^Eiweiß,^", "besonders / vor der Pubertät."],  # 10
    ["Springen und Sprinten / machen dich / ^nicht^ länger."],                                               # 11
    ["Aber sie bauen / ^dichtere,^ / stärkere Knochen,", "solange du / jung bist."],                          # 12
    ["Und deine Wirbelsäule / hat ^23^ Bandscheiben,", "gestapelt / wie ^Kissen.^"],                          # 13
    ["Den ganzen Tag / werden sie / ^zusammengedrückt.^"],                                                   # 14
    ["Abends bist du / etwa ^2^ Zentimeter / kleiner."],                                                      # 15
    ["Im Schlaf / saugen sie sich / wieder ^voll.^"],                                                         # 16
    ["Aber es gibt / eine ^Frist.^"],                                                                         # 17
    ["Sind deine / ^Wachstumsfugen^ / geschlossen,", "meist mit / etwa ^18,^", "steht deine Größe / ^fest.^"],  # 18
    ["Deine Eltern / haben den ^Bereich^ / gezogen.", "Deine Gewohnheiten / haben den ^Platz^ / darin gewählt."],  # 19
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
    elif "--edge" in sys.argv:
        import asyncio, ssl
        import edge_tts
        import edge_tts.communicate as c
        c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
        txt = " ".join(spoken_text().split("\n"))
        asyncio.run(edge_tts.Communicate(txt, "de-DE-ConradNeural", rate="+4%", pitch="-4Hz").save(os.path.join(BUILD, "take_edge.mp3")))
        print("build/take_edge.mp3")
    else:
        main_external(sys.argv[sys.argv.index("--voice") + 1])
