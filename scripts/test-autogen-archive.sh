#!/bin/bash
set -e

if [ ! -f "autogen_exploration/README.md" ]; then
  echo "Expected autogen_exploration/README.md to exist"
  exit 1
fi

grep -q "retire" "autogen_exploration/README.md" || { echo "README missing retirement explanation"; exit 1; }
grep -q "TypeScript" "autogen_exploration/README.md" || { echo "README missing mention of TypeScript"; exit 1; }

echo "Autogen archive tests passed."
exit 0