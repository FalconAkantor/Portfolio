#!/bin/sh
# Voice, render and publish every explainer that is not on the site yet.
#   sh scripts/batch.sh            all projects
#   sh scripts/batch.sh slug ...   only these
# Output for the site: public/video/tools/<slug>.mp4 (720p), .jpg (poster), .es.vtt (captions).
set -u
cd "$(dirname "$0")/.."
OUT=../../public/video/tools
mkdir -p "$OUT" renders
[ -f cache/bed.wav ] || python3 scripts/bed.py
if [ $# -eq 0 ]; then
  set -- $(python3 -c "import json; print(' '.join(p['slug'] for p in json.load(open('../../src/data/catalog/index.json'))['projects']))")
fi
for slug in "$@"; do
  if [ -s "$OUT/$slug.mp4" ]; then echo "skip $slug"; continue; fi
  echo "== $slug"
  python3 scripts/make.py "$slug" || { echo "FAIL voice $slug"; continue; }
  ( cd "build/$slug" && npx --yes hyperframes@0.8.96 render --fps 25 --crf 20 -o "../../renders/$slug.mp4" >"../../renders/$slug.log" 2>&1 ) || { echo "FAIL render $slug"; continue; }
  ffmpeg -loglevel error -y -i "renders/$slug.mp4" -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -tune animation -crf 30 -pix_fmt yuv420p -c:a aac -b:a 112k -movflags +faststart "$OUT/$slug.tmp.mp4" &&
    mv "$OUT/$slug.tmp.mp4" "$OUT/$slug.mp4"
  ffmpeg -loglevel error -y -ss 3.2 -i "renders/$slug.mp4" -frames:v 1 -vf scale=1280:720 -q:v 4 "$OUT/$slug.jpg"
  cp "build/$slug/captions.vtt" "$OUT/$slug.es.vtt"
  python3 -c "import json,sys; m=json.load(open('build/$slug/meta.json')); print(f\"   ok {m['duration']} s\")"
  rm -rf "build/$slug"
done
echo "batch done"
