#!/bin/bash
set -e

# Create an intentional failing test
echo "import { it, expect } from 'vitest'; it('fails intentionally', () => { expect(1).toBe(2); });" > apps/server/src/fail.test.ts

# Run turbo test to see if it fails (it should)
set +e
npx turbo run test > /dev/null 2>&1
EXIT_CODE=$?
set -e

# Cleanup
rm apps/server/src/fail.test.ts

if [ $EXIT_CODE -eq 0 ]; then
  echo "Adversarial test failed: Turbo did not exit with error when a test failed."
  exit 1
fi

echo "Adversarial test passed: Turbo exited with non-zero status on test failure."
exit 0