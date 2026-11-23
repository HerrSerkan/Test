# Welcher Geburtsmonat gewinnt? – Das Zauberschul-Rennen (deutsche Version)

Idee: @the_best_month_wins. Animation ohne Sprecher, 64 s, 1080×1920, Musik + Soundeffekte.
12 Tiere (je ein Monat) laufen vor einem Zauberschloss; einer nach dem anderen fliegt raus
(beißendes Buch, Kessel, Eule, Gespenst, Ball, Treppe, Besen, Hut, Zauberer, Puff). Anzeigetafel,
„#12 APRIL IST RAUS“, Lautwörter, Bibliothek-Zwischenszenen, Ziel: September gewinnt, Februar knapp dahinter.
Schluss: „SCHICK DAS JEMANDEM, DER VERLOREN HAT“.

    node monate/render.js --events
    python3 tools/synth_music.py monate/build/music_synth.wav 66 120 verspielt 23   # nur ohne build/music.mp3
    python3 monate/audio.py && node monate/render.js     # Video -> monate/monate.mp4 (-14 LUFS)
