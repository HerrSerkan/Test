# Wer geblieben ist (deutsche Version, eigene Zeichnung)

Idee: @neuronvisuals. Animation mit Sprecherstimme, 26 s, Hochformat 1080×1920, keine Musik – nur Stimme + Effekte.
Zehn Freunde an einem langen Tisch unter einer warmen Lampe, oben zählt das Alter von 18 hoch. Einer nach dem anderen
steht auf, winkt und geht. Mit 30 sitzt du fast allein da – bis einer zurückkommt. Ihr werdet zusammen alt (bis 72).

    python3 falle/voice_prep.py take.mp3 freunde/build/voice_el.wav 1.04   # ElevenLabs-Aufnahme aufbereiten
    python3 freunde/script.py --voice freunde/build/voice_el.wav            # Wortzeiten per Whisper -> timeline.json
    node freunde/render.js --events                                         # Zeitpunkte für die Effekte
    python3 freunde/audio.py                                                # Effekte + Stimme, -14 LUFS -> build/audio.wav
    node freunde/render.js                                                  # Video -> freunde/freunde.mp4

Stimme: ElevenLabs „Thomas – Confidential & calm“, Modell eleven_v4. Schriften aus falle/fonts.
