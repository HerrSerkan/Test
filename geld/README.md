# Warum Geld sich bewegt (deutsche Version)

Erklär-Animation mit Sprecherstimme, 75,8 s, Hochformat 1080×1920, Stimme + Soundeffekte, keine Musik.
Feine weiße Linien auf Schwarz: Münzenjagd, Ziel-Zähler, Eisberg „Wert“, Automat, Waage,
Globus mit Brille, Geschäft mit Grund, Gründe-Netz, Komplex vs. einfach, Verhalten,
drei Kreise -> Chance, Reichtum ≠ mehr Geld wollen, Geldströme zu dir. Alles im Canvas gezeichnet.
Szene und Text darunter sind zusammen vertikal mittig.

    python3 geld/script.py --text                                    # Sprechertext für ElevenLabs
    python3 geld/voice_prep.py take.mp3 geld/build/voice_el.wav 1.12 # Pausen ≤ 0,6 s, Tempo +12 %, EQ, Kompressor
    python3 geld/script.py --voice geld/build/voice_el.wav           # Wortzeiten per Whisper
    node geld/render.js --events && python3 geld/audio.py && node geld/render.js

Stimme: ElevenLabs „Thomas – Confidential & calm“ (CU0jw02q6zyti7Fzfgx5), Modell eleven_v4.
audio.py misst die Lautheit nach EBU R128 und bringt sie auf -14 LUFS.
Schriften aus falle/fonts (Inter, Instrument Serif – SIL Open Font License).
