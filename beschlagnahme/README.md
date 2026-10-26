# Wie die Polizei dein Geld nehmen kann – erklärt mit Minecraft (deutsche Version)

3D-Klötzchenwelt mit three.js, 87,6 s, Hochformat 1080×1920, Stimme + Soundeffekte, keine Musik.
Alle Texturen (Gras, Weg, Stein, Holz, Smaragde, Truhen, Rüstung) und Figuren werden im Code
als Pixel-Art gezeichnet – keine Original-Grafiken. Untertitel: immer das aktuelle Wort.

    npm install --prefix beschlagnahme                                      # three.js
    python3 beschlagnahme/script.py --text                                  # Sprechertext für ElevenLabs
    python3 beschlagnahme/voice_prep.py take.mp3 beschlagnahme/build/voice_el.wav 1.15 0.45
    python3 beschlagnahme/script.py --voice beschlagnahme/build/voice_el.wav
    node beschlagnahme/render.js --events && python3 beschlagnahme/audio.py && node beschlagnahme/render.js

voice_prep.py: 3. Argument Tempo, 4. Argument längste Pause (s).
Stimme: ElevenLabs „Thomas – Confidential & calm“ (CU0jw02q6zyti7Fzfgx5), Modell eleven_v4.
Schriften aus falle/fonts (Inter, SIL Open Font License).
