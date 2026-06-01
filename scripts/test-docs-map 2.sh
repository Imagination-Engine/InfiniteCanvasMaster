#!/bin/bash
set -e

# Run the map generation script
tsx scripts/docs-map.ts

# Verify MAP.md is generated
if [ ! -f "docs/MAP.md" ]; then
  echo "Expected docs/MAP.md to exist"
  exit 1
fi

# Verify it contains some expected sections
grep -q "apps/web" docs/MAP.md || { echo "MAP.md missing apps/web"; exit 1; }
grep -q "apps/server" docs/MAP.md || { echo "MAP.md missing apps/server"; exit 1; }
grep -q "packages/core" docs/MAP.md || { echo "MAP.md missing packages/core"; exit 1; }

echo "Semantic Document Map tests passed."
exit 0