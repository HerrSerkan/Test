# „Bin gleich da.“ (eigenes Video im Stil von fruehaufsteher/ + mensa/)

Animation ohne Sprecher, 14 s, Hochformat 1080×1920, Endlosschleife, Hintergrundmusik + Soundeffekte.
Vor dem Kino: „Immer pünktlich“ wartet mit drei Tickets, „5 Min zu spät“ kommt gehetzt und stolpert.
„???“ schreibt nur Nachrichten („BIN UNTERWEGS!“ … „SEHE EUCH SCHON 👀“), die Kinouhr rast von 19:50 bis 20:45.
Höhepunkt: Zoom ins Fenster nebenan – „???“ steht im Bademantel im Bad, Schild dreht sich zu „NOCH UNTER DER DUSCHE“.
Titel: „„BIN GLEICH DA.““ / „GLEICH = 1 STUNDE.“, Sticker „WELCHER BIST DU?“.

Eigener Stil: farbige Bohnen-Figuren mit Merkmal (Brille, Cap, Handtuch), Papier-Körnung, weiche Schatten.

    node tools/canvas_render.js kino --events
    python3 kino/audio.py
    python3 tools/mix_music.py kino/build/audio.wav kino/build/music.mp3 kino/build/mix.wav -17.5 -17 auto:10 9.97-10.5
    node tools/canvas_render.js kino --out kino/bin_gleich_da.mp4 --audio kino/build/mix.wav

Musik: als build/music.mp3 ablegen (nicht im Repo). Geplant war ein eigener Funk-Groove (ElevenLabs eleven_music_v2_5);
die aktuelle Fassung nutzt die Lofi-Musik aus fruehaufsteher/, weil das ElevenLabs-Guthaben aufgebraucht war.
Schriften: Inter (SIL Open Font License), Emoji: Noto Color Emoji.
