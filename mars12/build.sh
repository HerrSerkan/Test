#!/bin/sh
# scene.js zusammensetzen
cd "$(dirname "$0")" && cat base.js helpers3.js lib6c.js pre12.js lib11.js tag12.js > scene.js
