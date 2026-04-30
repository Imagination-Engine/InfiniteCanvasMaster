#!/bin/bash
set -e

# Verify package directory exists
if [ ! -d "apps/desktop" ]; then
  echo "Missing apps/desktop directory"
  exit 1
fi

if [ ! -f "apps/desktop/package.json" ]; then
  echo "Missing apps/desktop/package.json"
  exit 1
fi

if [ ! -f "apps/desktop/bun.build.ts" ]; then
  echo "Missing apps/desktop/bun.build.ts"
  exit 1
fi

echo "Electrobun scaffolding test passed."
exit 0