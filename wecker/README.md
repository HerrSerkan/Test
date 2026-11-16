# Gleicher Wecker. Andere Nacht. (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Animation ohne Sprecher, 14 s, Hochformat 1080×1920, Endlosschleife, Hintergrundmusik (ElevenLabs Music) + Soundeffekte.
Haus mit drei Schlafzimmern, die Uhr läuft von 6:00 bis 7:58. „Steht sofort auf“ macht Hampelmänner, Kaffee, liest.
Der „Snooze-Profi“ drückt zwölfmal weg, wacht um 7:45 auf und zieht die Hose verkehrt an. Um 7:58 fliegt der Vorhang
von Fenster 3 auf: „???“ hat die ganze Nacht am Handy verbracht – das Schild dreht sich zu „SCHLÄFT JETZT ERST“, und
sein Wecker klingelt. Titel: „GLEICHER WECKER. / ANDERE NACHT.“, Sticker „WELCHER BIST DU?“.

Eigener Stil: farbige Bohnen-Figuren mit Merkmal (Stirnband, Schlafmaske, Kapuze), Papier-Körnung, weiche Schatten.

    node tools/canvas_render.js wecker --events
    python3 wecker/audio.py
    python3 tools/mix_music.py wecker/build/audio.wav wecker/build/music.mp3 wecker/build/mix.wav -17.5 -17 auto:8 9.97-10.7
    node tools/canvas_render.js wecker --out wecker/gleicher_wecker.mp4 --audio wecker/build/mix.wav

Musik: ElevenLabs eleven_music_v2_5, als build/music.mp3 ablegen (nicht im Repo). Setzt am Höhepunkt kurz aus (Plattenkratzer).
Aktuelle Fassung nutzt vorübergehend die Musik aus mensa/ (die eigene Generierung hing bei ElevenLabs).
Schrift: Inter (SIL Open Font License).
