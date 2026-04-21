#!/bin/bash
set -e

FILE="docs/DEPENDENCIES.md"

if [ ! -f "$FILE" ]; then
  echo "Expected $FILE to exist"
  exit 1
fi

grep -q "Core Substrate" "$FILE" || { echo "Missing Core Substrate section"; exit 1; }
grep -q "UI Component System" "$FILE" || { echo "Missing UI Component System section"; exit 1; }
grep -q "Database & Persistence" "$FILE" || { echo "Missing Database & Persistence section"; exit 1; }
grep -q "Surface A: Playable" "$FILE" || { echo "Missing Surface A section"; exit 1; }
grep -q "Surface B: Conductor" "$FILE" || { echo "Missing Surface B section"; exit 1; }
grep -q "Surface C: Reel" "$FILE" || { echo "Missing Surface C section"; exit 1; }
grep -q "Surface D: Forge" "$FILE" || { echo "Missing Surface D section"; exit 1; }
grep -q "Surface E: Scribe" "$FILE" || { echo "Missing Surface E section"; exit 1; }

echo "Dependency Atlas test passed."
exit 0