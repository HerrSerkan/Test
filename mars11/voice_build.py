"""Tag 11: Stimme sicher zusammensetzen (ersetzt voice_prep + Pausen-Einfügen).
Geschnitten wird nur in echter Stille (< -48 dB) ZWISCHEN von Whisper erkannten Wörtern, mit Rand – nie in einem Wort.
Leise Wörter (ElevenLabs haucht „willst“) werden gezielt angehoben."""
import subprocess, json, numpy as np
from faster_whisper import WhisperModel
SR, TEMPO = 44100, 1.18
M = WhisperModel("small", device="cpu", compute_type="int8")
def rd(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout,np.float32).copy()
def words(a):
    idx = np.arange(0, len(a), SR/16000).astype(int); segs, _ = M.transcribe(a[idx], language="de", word_timestamps=True)
    return [[w.word.strip(), w.start, w.end] for s in segs for w in s.words]
def db(a):
    w = int(0.01*SR); n = len(a)//w; return 20*np.log10(np.sqrt((a[:n*w].reshape(n, w)**2).mean(1))+1e-9)

def islands(a, W, keep, pause):  # keep: Wort-Indizes; pause[i] = gewünschte Pause (nach Tempo) VOR Wort i
    D = db(a); out = []; cur = None; prev = None
    for i in keep:
        s, e = W[i][1], W[i][2]
        if prev is None: cur = [max(0, s - 0.15), None]; prev = i; continue
        lo, hi = W[prev][2] + 0.03, s - 0.03                     # nur in der Lücke zwischen den Wörtern suchen
        fr = [k for k in range(int(lo*100), int(hi*100)) if 0 <= k < len(D) and D[k] < -48]
        runs, r = [], []
        for k in fr:
            if r and k != r[-1] + 1: runs.append(r); r = []
            r.append(k)
        if r: runs.append(r)
        jump = i != prev + 1                                     # herausgeschnittener Satz dazwischen
        if jump:                                                 # Ende nach prev, Anfang vor i getrennt suchen
            fr1 = [k for k in range(int((W[prev][2]+0.03)*100), int((W[prev+1][1]-0.03)*100)) if D[k] < -48]
            fr2 = [k for k in range(int((W[i-1][2]+0.03)*100), int((s-0.03)*100)) if D[k] < -48]
            cur[1] = fr1[0]/100 + 0.06; out.append((cur, pause.get(i, 0.4))); cur = [fr2[-1]/100 - 0.04, None]
        elif runs:
            run = max(runs, key=len); nat = len(run)/100/TEMPO
            want = pause.get(i, min(nat, 0.2))
            cur[1] = run[0]/100 + 0.06; out.append((cur, want)); cur = [(run[-1]+1)/100 - 0.04, None]
        prev = i
    cur[1] = W[prev][2] + 0.25; out.append((cur, 0))
    return out

def render(parts):
    b = []
    for (x0, x1), src, p in parts:
        seg = src[int(x0*SR):int(x1*SR)].copy(); f = int(0.005*SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        b += [seg, np.zeros(int(max(0.0, p*TEMPO - (0.10 if p else 0))*SR), np.float32)]   # Rand (0,06 + 0,04 s Stille) zählt mit
    return np.concatenate(b)

I = rd("build/intro_raw1.mp3"); WI = words(I)
A = rd("build/voice_raw.mp3"); WA = words(A)
print(len(WI), [w[0] for w in WI]); print(len(WA), [w[0] for w in WA])
for i, w in enumerate(WI):                                       # leise „willst“ anheben (+7 dB, weiche Rampen)
    if w[0].lower().startswith("willst"):
        s0, s1 = int((w[1]-0.02)*SR), int((w[2]+0.08)*SR); g = np.ones(s1-s0); r = int(0.03*SR); g[:r] = np.linspace(0, 1, r); g[-r:] = np.linspace(1, 0, r)
        I[s0:s1] *= 1 + (10**(7/20) - 1) * g
import re
fi = lambda W, s: [k for k, w in enumerate(W) if re.sub(r"[^a-zäöüß0-9]", "", w[0].lower()).startswith(s) and (len(s) > 3 or re.sub(r"[^a-zäöüß0-9]", "", w[0].lower()) == s)]
und_i, nun_i = fi(WI, "und")[0], fi(WI, "nun")[0]
pi = {und_i: 0.25, nun_i: 0.35}
ia = islands(I, WI, list(range(len(WI))), pi)
cut0, cut1 = fi(WA, "ein")[0], fi(WA, "was")[0]                 # „Ein Follow ist ein Platz in Rakete vier.“ fällt weg
keep = [k for k in range(len(WA)) if not (cut0 <= k < cut1)]
P = {fi(WA, "stadion")[0]: 0.3, fi(WA, "militär")[0]: 0.5, fi(WA, "zoo")[0]: 0.5, fi(WA, "tierheim")[0]: 0.45, fi(WA, "bure")[0]: 0.45,
     fi(WA, "token")[0]: 0.5, fi(WA, "und")[0]: 0.4, fi(WA, "hier")[0]: 0.5, fi(WA, "plus")[0]: 0.4, fi(WA, "start")[0]: 0.22,
     fi(WA, "achter")[0]: 0.22, fi(WA, "wasser")[0]: 0.22, fi(WA, "laser")[0]: 0.22, fi(WA, "kino")[0]: 0.22, fi(WA, "geschafft")[0]: 0.3,
     fi(WA, "alarm")[0]: 0.5, fi(WA, "etwas")[0]: 0.35, cut1: 0.45, fi(WA, "dein")[0]: 0.3}
aa = islands(A, WA, keep, P)
ia[-1] = (ia[-1][0], 0.3)                                        # Pause zwischen Einstieg und „Zwölf Gebäude“
parts = [(c, I, p) for c, p in ia] + [(c, A, p) for c, p in aa]
raw = render(parts)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-af", f"atempo={TEMPO},equalizer=f=110:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.2:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=2",
                "-ar", str(SR), "build/voice.wav"], input=raw.tobytes(), check=True)
print("voice.wav", round(len(raw)/SR/TEMPO, 2), "s")
