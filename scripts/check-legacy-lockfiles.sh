#!/bin/bash
set -e

LOCKFILES=("package-lock.json" "yarn.lock" "imagination-canvas/package-lock.json" "imagination-canvas/yarn.lock")
FOUND=0

for file in "${LOCKFILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Found legacy lockfile: $file"
    FOUND=1
  fi
done

if [ $FOUND -eq 1 ]; then
  echo "Legacy lockfiles found. Run cleanup."
  exit 1
fi

echo "No legacy lockfiles found."
exit 0