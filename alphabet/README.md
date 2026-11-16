# Alphabet-Armee – Tag 1 (deutsche Version, 3D)

Idee: @naturebeauty2811 („Kommentier deinen Vornamen – dein Buchstabe ist deine Armee“).
3D-Szene mit three.js, ca. 26 s, 1080×1920, Stimme + Hintergrundmusik + Effekte, Text Wort für Wort unter der Szene.
Ehrlich als Tag 1: alle Buchstaben starten bei 0 (keine erfundenen Zahlen oder Namen). Die Armee aus Soldaten,
die das E bildet, ist als BEISPIEL markiert. Klötzchen-Soldat mit Megafon, Feld aus 26 Buchstaben-Kacheln,
Beispiel-Kommentar „Emma“, Rangliste Tag 1 (alles 0), X „LETZTER PLATZ FLIEGT RAUS“, Folgen/Liken/Speichern,
„FINDE DEINEN NAMEN“, „KENNST DU EIN X? SCHICK DAS.“ – letzter Satz führt zurück zum ersten (Loop).

    npm install --prefix alphabet                                     # three.js
    python3 alphabet/script.py --text                                 # Sprechertext für ElevenLabs (Thomas, eleven_v4)
    python3 alphabet/voice_prep.py take.mp3 alphabet/build/voice_el.wav 1.05
    python3 alphabet/script.py --voice alphabet/build/voice_el.wav    # Wortzeiten per Whisper
    node alphabet/render.js --events
    python3 alphabet/audio.py                                         # Stimme + Effekte + Musik, -14 LUFS
    node alphabet/render.js                                           # Video -> alphabet/alphabet.mp4

Musik: build/music.mp3 (ElevenLabs Music); sonst build/music_synth.wav:
    python3 tools/synth_music.py alphabet/build/music_synth.wav 34 112 verspielt 7
Ersatzstimme, solange ElevenLabs nicht verfügbar ist: python3 alphabet/script.py --edge (-> build/take_edge.mp3).
Für Tag 2: echte Kommentare zählen und die Rangliste mit echten Zahlen füllen.
