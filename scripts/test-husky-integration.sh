#!/bin/bash
set -e

# Test Husky hook exists
if [ ! -f ".husky/pre-commit" ]; then
  echo "Expected .husky/pre-commit to exist"
  exit 1
fi

grep -q "npx lint-staged" .husky/pre-commit || { echo "Missing npx lint-staged in pre-commit hook"; exit 1; }

# Test lint-staged configuration in package.json
grep -q "\"lint-staged\":" package.json || { echo "Missing lint-staged configuration in package.json"; exit 1; }

echo "Husky Integration tests passed."
exit 0