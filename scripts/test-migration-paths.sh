#!/bin/bash
set -e

# Before migration tests
if [ ! -d "imagination-canvas/src" ]; then
  echo "Expected imagination-canvas/src to exist before migration"
  exit 1
fi

if [ ! -d "imagination-canvas/server" ]; then
  echo "Expected imagination-canvas/server to exist before migration"
  exit 1
fi

echo "Migration path test passed: Legacy directories exist."
exit 0