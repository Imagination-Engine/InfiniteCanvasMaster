#!/bin/bash
set -e

SURFACES=(
  "playable"
  "conductor"
  "reel"
  "forge"
  "atlas"
)

MISSING=0

for surface in "${SURFACES[@]}"; do
  file="packages/surface-$surface/demo-script.md"
  if [ ! -f "$file" ]; then
    echo "Missing $file"
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo "Localized Demo Scripts test failed."
  exit 1
fi

echo "All demo scripts exist."
exit 0