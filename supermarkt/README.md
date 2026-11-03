# Gleicher Supermarkt. (1:1-Nachbau, deutsche Version, eigene Zeichnung)

Idee: @nobodytoldme_1. Animation ohne Sprecher, 11,9 s, 1080×1920, 60 fps, Endlosschleife, Musik + Effekte.
INTROVERTIERT und HSP (HOCHSENSIBEL) im selben Supermarkt: Neonröhre flackert, zweimal „DING DONG!“, Lärm –
die HSP hält sich die Ohren zu und flüchtet in den Tiefkühlschrank („ahh …“). Die introvertierte Person wird von einer
Bekannten zugetextet („OMG HIII!!“, „WIE GEHT'S DIR?!“, „UND DEINE MAMA?“ …) und wird grau. Pointe: „INTROVERTIERT: MENSCHEN. / HSP: ALLES.“

    node tools/canvas_render.js supermarkt --events
    python3 supermarkt/audio.py
    python3 tools/synth_music.py supermarkt/build/music.wav 30 96 verspielt 4     # Ersatz, bis eine Lofi-Spur von vidIQ da ist
    python3 tools/mix_music.py supermarkt/build/audio.wav supermarkt/build/music.wav supermarkt/build/mix.wav -18 -15 0
    node tools/canvas_render.js supermarkt --out supermarkt/gleicher_supermarkt.mp4 --audio supermarkt/build/mix.wav --fps 60

Schrift: Inter (SIL OFL), Notenzeichen: DejaVu Sans.
