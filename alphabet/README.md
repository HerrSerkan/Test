# Alphabet-Armee – Tag 1 (deutsche Version, eigene Figur)

Idee: @naturebeauty2811 (Format „Kommentier deinen Vornamen – dein Buchstabe ist deine Armee“).
Mit Sprecherstimme (Edge TTS, tiefer + schneller, Ansager-Klang: Bass, Kompression, Arena-Hall), 27,2 s, 1080×1920, Musik + Effekte, Untertitel Wort für Wort oben.
Ehrlich als Tag 1: alle Buchstaben starten bei 0 (keine erfundenen Namen oder Zahlen). Eigener Soldat mit Megafon,
Feld aus 26 Buchstaben-Kacheln, Beispiel-Kommentar „Emma“ (als BEISPIEL markiert), „+1 SOLDAT“, „TAG 1“, Rangliste mit
lauter Nullen, X als Warnung „LETZTER PLATZ FLIEGT RAUS“, Folgen/Liken/Speichern, „KENNST DU EIN X? SCHICK DAS.“
Für Tag 2: echte Kommentare zählen und Rangliste mit echten Zahlen füllen.

    python3 alphabet/script.py               # Stimme (Edge TTS, über den Proxy) + Zeitplan -> build/
    node alphabet/render.js --events
    python3 alphabet/audio.py                # Stimme + Effekte -> build/audio.wav
    python3 tools/synth_music.py alphabet/build/music.wav 40 112 verspielt 101
    python3 tools/mix_music.py alphabet/build/audio.wav alphabet/build/music.wav alphabet/build/mix.wav -21 -14.5 0
    cp alphabet/build/mix.wav alphabet/build/audio_final.wav
    node alphabet/render.js                  # Video -> alphabet/alphabet_armee.mp4
