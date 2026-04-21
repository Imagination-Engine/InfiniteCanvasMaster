#!/bin/bash
set -e

# Run the boot script
npx tsx scripts/boot/index.ts > output.log 2>&1

# Verify it contains sections
grep -q "STAGE 1: IDENTITY" output.log || { echo "Missing STAGE 1"; exit 1; }
grep -q "STAGE 2: SYSTEM RULES" output.log || { echo "Missing STAGE 2"; exit 1; }
grep -q "STAGE 3: GIT CONTEXT" output.log || { echo "Missing STAGE 3"; exit 1; }
grep -q "STAGE 4: TRIAGE BACKLOG" output.log || { echo "Missing STAGE 4"; exit 1; }

echo "Boot Protocol tests passed."
rm output.log
exit 0