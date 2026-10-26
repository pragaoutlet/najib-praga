#!/usr/bin/env bash
# Renders one ProductAd video per entry in products.json -> out/ads/
# Add "media": "file.mp4" (or .jpg) to an entry, with the file in public/media/, to use real footage.
set -e
mkdir -p out/ads
n=$(node -p "require('./products.json').length")
for i in $(seq 0 $((n-1))); do
  name=$(node -p "require('./products.json')[$i].brand.toLowerCase().replace(/[^a-z0-9]+/g,'-')")
  node -p "JSON.stringify(require('./products.json')[$i])" > /tmp/props.json
  npx remotion render src/index.ts ProductAd "out/ads/$name.mp4" --props=/tmp/props.json "$@"
done
