# Kennst du Déjà-vus? (deutsche Version)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 11,8 s, 1080×1920, Musik + Effekte.
Küche mit Katze und Tasse: blauer Rückblick („DAS HAB ICH SCHON MAL GESEHEN.“), die Tasse fällt;
in Wirklichkeit fängt der andere sie nebenbei auf. Pointe: „FÜHLT SICH AN WIE EIN SPOILER. IST ES ABER NICHT.“
Figuren, Blasen und Titel aus tools/nobody_figur.js.

    node dejavu/render.js --events
    python3 tools/synth_music.py dejavu/build/music_synth.wav 14 90 cool 47   # nur ohne build/music.mp3
    python3 dejavu/audio.py && node dejavu/render.js
