#!/bin/bash
set -e

if [ ! -f ".github/CODEOWNERS" ]; then
  echo "Expected .github/CODEOWNERS to exist"
  exit 1
fi

if [ ! -f ".github/pull_request_template.md" ]; then
  echo "Expected .github/pull_request_template.md to exist"
  exit 1
fi

echo "GitHub collaboration files exist."
exit 0