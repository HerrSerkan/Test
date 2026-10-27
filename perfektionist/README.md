# Perfektionist vs. Macher (deutsche Version)

Animation ohne Sprecher, 13,8 s, Hochformat 1080×1920, nur Soundeffekte (keine Musik).
Links prüft der Perfektionist seine niedrige Mauer immer wieder mit der Wasserwaage,
rechts baut der Macher eine hohe Mauer fertig, sie leuchtet grün auf, er sitzt oben,
langweilt sich und springt weiter. Gliederpuppen, Ziegel und Spiegelung im Canvas gezeichnet.

    node perfektionist/render.js --events   # Zeitpunkte für die Effekte
    python3 perfektionist/audio.py          # Effekte + Limiter -> build/audio.wav
    node perfektionist/render.js            # Video -> perfektionist/perfektionist.mp4 (-14 LUFS)

Vorschaubilder: `node perfektionist/render.js --preview 2.6 8.4`
Aufbau nach falle/ bzw. gymangst/. Schriften aus falle/fonts (Inter, SIL Open Font License).
