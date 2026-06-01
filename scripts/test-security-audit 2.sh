#!/bin/bash
set -e

# Run the security audit
npx tsx scripts/security/audit.ts > output.log 2>&1

# Verify it creates a markdown file
if ! ls docs/security/audit/week-*.md 1> /dev/null 2>&1; then
  echo "Expected docs/security/audit/week-*.md to be created"
  exit 1
fi

# Basic check of the output content
LATEST_REPORT=$(ls -t docs/security/audit/week-*.md | head -1)
grep -q "Security Audit Report" "$LATEST_REPORT" || { echo "Missing report title"; exit 1; }
grep -q "NPM Audit" "$LATEST_REPORT" || { echo "Missing NPM Audit section"; exit 1; }
grep -q "Auth Events" "$LATEST_REPORT" || { echo "Missing Auth Events section"; exit 1; }

echo "Security Audit tests passed."
rm output.log
exit 0