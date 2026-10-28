# Aufschieber vs. Planer (deutsche Version, eigene Zeichnung)

Idee: @neuronvisuals. Animation mit Sprecherstimme, 30,8 s, Hochformat 1080×1920, keine Musik – nur Stimme + Effekte.
Zwei Schreibtische, ein Abreißkalender zählt von 30 Tagen bis „HEUTE“. Der Aufschieber hängt am Handy, über ihm wächst
eine Regenwolke, in der letzten Nacht macht er alles auf einmal. Der Planer arbeitet jeden Tag ein Stück (Balken am Tisch).
Beide bekommen eine 1 – nur einer bricht danach zusammen und fängt beim nächsten Mal wieder am letzten Tag an.

    python3 falle/voice_prep.py take.mp3 aufschieber/build/voice_el.wav 1.06   # ElevenLabs-Aufnahme aufbereiten
    python3 aufschieber/script.py --voice aufschieber/build/voice_el.wav        # Wortzeiten per Whisper -> timeline.json
    node aufschieber/render.js --events                                         # Zeitpunkte für die Effekte
    python3 aufschieber/audio.py                                                # Effekte + Stimme, -14 LUFS -> build/audio.wav
    node aufschieber/render.js                                                  # Video -> aufschieber/aufschieber.mp4

Stimme: ElevenLabs „Thomas – Confidential & calm“, Modell eleven_v4. Schriften aus falle/fonts.
