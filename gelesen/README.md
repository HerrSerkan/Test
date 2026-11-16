# Lass sie nicht auf Gelesen (deutsche Version, eigene Zeichnung)

Idee: @noir.mind3. Animation ohne Sprecher, 15,4 s, Hochformat 1080×1920, keine Musik – nur Soundeffekte.
Oben schreibt einer neun Nachrichten, alle „Gesehen“, keine Antwort – nur kurz „schreibt…“, dann nichts; er sackt zusammen.
Unten kommt sofort eine Antwort, die beiden telefonieren und lachen. Schluss: „ES DAUERT ZEHN SEKUNDEN.“

    echo '{"duration": 15.4}' > gelesen/build/timeline.json
    node gelesen/render.js --events   # Zeitpunkte für die Effekte
    python3 gelesen/audio.py          # Effekte, -14 LUFS -> build/audio.wav
    node gelesen/render.js            # Video -> gelesen/gelesen.mp4

Schrift: JetBrains Mono (System, SIL Open Font License).
