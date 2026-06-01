#!/bin/bash
set -e

# Test onboarding template
FILE="docs/security/onboarding/template.md"
if [ ! -f "$FILE" ]; then
  echo "Expected $FILE to exist"
  exit 1
fi
grep -q "5-Minute Hardening Checklist" "$FILE" || { echo "Missing 5-Minute Checklist"; exit 1; }
grep -q "Did You Leak?" "$FILE" || { echo "Missing Leak Drill"; exit 1; }

# Test rotation log script
if [ ! -f "docs/security/rotation-log.md" ]; then
  echo "Expected rotation-log.md to exist"
  exit 1
fi

npx tsx scripts/security/check-rotation.ts > output.log 2>&1
grep -q "Rotation Status" output.log || { echo "Rotation script failed"; exit 1; }

echo "Onboarding and Rotation tests passed."
rm output.log
exit 0