# Wenn ängstlich vermeidend liebt (deutsche Version)

Idee: @nobodytoldme_1 („When anxious loves avoidant“). Animation ohne Sprecher, 11,5 s, 1080×1920,
Hintergrundmusik + Soundeffekte. Zwei Figuren laufen durch ein Museum: „Ängstlich“ sucht Nähe (Herzen,
Hand, Umarmung), „Vermeidend“ weicht aus und pfeift. Pointe: „DAS NENNT MAN DIE NÄHE-DISTANZ-FALLE.“
Titel unter der Szene, alles mittig, Ende geht nahtlos in den Anfang über (Loop).

    node naehe/render.js --events
    python3 tools/synth_music.py naehe/build/music_synth.wav 14 80 cool 5   # nur ohne build/music.mp3
    python3 naehe/audio.py          # Effekte + Musik, -14 LUFS (EBU R128)
    node naehe/render.js            # Video -> naehe/naehe.mp4
