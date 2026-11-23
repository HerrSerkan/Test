# Wie groß wirst du? (deutsche Version)

Idee: @neuronvisuals. Erklär-Animation mit Sprecher, ca. 71 s, 1080×1920, Stimme + Musik + Effekte,
Text Wort für Wort unter der Szene (Schlüsselwörter rot). Werte metrisch: Mutter 168 cm, Vater 178 cm,
Formel für Jungen (Mutter + 13 cm, Mittelwert mit Vater) ≈ 180 cm ± 10 cm; Wachstumshormon im Tiefschlaf;
Eiweiß; Springen/Sprinten stärkt Knochen; 23 Bandscheiben, abends ca. 2 cm kleiner; Wachstumsfugen meist mit ~18 zu.

    python3 groesse/script.py --text                                  # Sprechertext für ElevenLabs (Thomas, eleven_v4)
    python3 groesse/voice_prep.py take.mp3 groesse/build/voice_el.wav 1.08
    python3 groesse/script.py --voice groesse/build/voice_el.wav      # Wortzeiten per Whisper
    node groesse/render.js --events
    python3 tools/synth_music.py groesse/build/music_synth.wav 80 92 cool 11   # nur ohne build/music.mp3
    python3 groesse/audio.py && node groesse/render.js                # Video -> groesse/groesse.mp4

Ersatzstimme, solange ElevenLabs nicht verfügbar ist: python3 groesse/script.py --edge (Microsoft „Florian Multilingual“, natürlicher; Tempo 1.08).
