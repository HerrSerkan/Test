# Echter Horror. (eigenes Video, Halloween)

Eigene Idee, kein Typen-Vergleich: ein Mini-Horrorfilm mit einer Figur. Aufbau nach dem Skill kurzvideo-regeln
(Hook, Rehook „Nicht A, sondern …“, Wort-für-Wort-Text, Perspektivwechsel, Loop). Ohne Sprecher, 13,3 s, 1080×1920, 60 fps.
Halloween-Nacht im Zimmer: Gewitter, die Tür knarrt auf, Augen im Spalt, Fledermaus, Gespenst („BUUUH!“), Skeletthand –
die Figur scrollt ungerührt weiter, der Puls oben bleibt bei 62. Dann fährt die Kamera ins Handy: 3 % … 2 % … 1 %.
Schrei, Puls 180, sogar das Gespenst flieht, „WO IST DAS LADEKABEL?!“, Handy aus. Titel „ECHTER HORROR. / 1 % AKKU.“

    node tools/canvas_render.js horror --events
    python3 horror/audio.py
    python3 tools/synth_music.py horror/build/music.wav 34 92 spuk 13        # Ersatz, solange ElevenLabs fehlt
    python3 tools/mix_music.py horror/build/audio.wav horror/build/music.wav horror/build/mix.wav -18.5 -16.5 auto:9.0
    node tools/canvas_render.js horror --out horror/echter_horror.mp4 --audio horror/build/mix.wav --fps 60

Schrift: Inter (SIL Open Font License).
