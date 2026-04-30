#!/bin/bash
set -e

# Test rule existence
FILE=".agent/rules/security.md"
if [ ! -f "$FILE" ]; then
  echo "Expected $FILE to exist"
  exit 1
fi

# Verify the rules exist
grep -q "Never echo" "$FILE" || { echo "Missing 'Never echo' constraint"; exit 1; }
grep -q "Never write" "$FILE" || { echo "Missing 'Never write' constraint"; exit 1; }

# Test boot script integration
npx tsx scripts/boot/index.ts > output.log 2>&1
grep -q "security.md" output.log || { echo "Boot script did not list security.md"; exit 1; }

echo "Security Governance rules test passed."
rm output.log
exit 0