#!/bin/bash
set -e

# Run the cli with a test command
npx tsx scripts/cli/index.ts test-cmd --param test_value > output.log 2>&1

if grep -q "Executed test-cmd with param: test_value" output.log; then
  echo "CLI test passed."
  rm output.log
  exit 0
else
  echo "CLI test failed. Expected output not found."
  rm output.log
  exit 1
fi
