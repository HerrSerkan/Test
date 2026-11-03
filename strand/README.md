# Stell dir einen Strand vor. (1:1-Nachbau, deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 11,9 s, 1080×1920, 60 fps, Endlosschleife, Musik + Effekte.
Drei Figuren meditieren vor einem Bogenfenster: „SCHLIESS DIE AUGEN.“ – „STELL DIR EINEN STRAND VOR.“ –
HYPERPHANTASIE sieht ihn in 4K (mit Sonnenbrille), DIE MEISTEN verschwommen, APHANTASIE nur das getippte Wort.
„JETZT NOCH DIE WELLEN.“ – Pointe: „1 VON 25 MENSCHEN / SIEHT FAST NICHTS.“ (Schätzungen zur Aphantasie: ca. 2–4 %).

    node tools/canvas_render.js strand --events
    python3 strand/audio.py
    python3 tools/synth_music.py strand/build/music.wav 30 84 cool 3     # Ersatz, bis eine Lofi-Spur von vidIQ da ist
    python3 tools/mix_music.py strand/build/audio.wav strand/build/music.wav strand/build/mix.wav -18 -15 0
    node tools/canvas_render.js strand --out strand/strand_vorstellen.mp4 --audio strand/build/mix.wav --fps 60

Schrift: Inter (SIL OFL).
