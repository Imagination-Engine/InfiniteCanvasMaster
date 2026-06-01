#!/bin/bash
set -e

DIRECTORIES=(
  "apps/web"
  "apps/server"
  "packages/core"
  "packages/db"
  "packages/ui"
  "packages/surface-playable"
  "packages/surface-conductor"
  "packages/surface-reel"
  "packages/surface-forge"
  "packages/surface-atlas"
)

MISSING=0

for dir in "${DIRECTORIES[@]}"; do
  if [ -d "$dir" ] && [ ! -f "$dir/README.md" ]; then
    echo "Missing README.md in $dir"
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo "100% Strict README Coverage test failed."
  exit 1
fi

echo "All required directories have a README.md."
exit 0