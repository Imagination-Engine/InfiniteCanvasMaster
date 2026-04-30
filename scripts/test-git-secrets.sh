#!/bin/bash
set -e

# Test the mock scanner directly
echo "sk-ant-12345" > bad-file.txt
set +e
node scripts/scan-secrets.js bad-file.txt > output.log 2>&1
EXIT_CODE=$?
set -e

rm bad-file.txt

if [ $EXIT_CODE -eq 0 ]; then
  echo "Adversarial test failed: Scanner did not catch sk-ant- pattern."
  exit 1
fi

echo "valid-code-here" > good-file.txt
node scripts/scan-secrets.js good-file.txt > output.log 2>&1
rm good-file.txt

echo "git-secrets scanning test passed."
exit 0