#!/bin/bash
set -e

# Test .env.example
if [ ! -f ".env.example" ]; then
  echo "Expected .env.example to exist"
  exit 1
fi

grep -q "Class A" .env.example || { echo "Missing Class A classification in .env.example"; exit 1; }
grep -q "Class B" .env.example || { echo "Missing Class B classification in .env.example"; exit 1; }
grep -q "Class C" .env.example || { echo "Missing Class C classification in .env.example"; exit 1; }

# Test .gitignore
if [ ! -f ".gitignore" ]; then
  echo "Expected .gitignore to exist"
  exit 1
fi

grep -q "\.env\.\*" .gitignore || { echo "Missing .env.* in .gitignore"; exit 1; }
grep -q "\*\.pem" .gitignore || { echo "Missing *.pem in .gitignore"; exit 1; }
grep -q "\*\.key" .gitignore || { echo "Missing *.key in .gitignore"; exit 1; }
grep -q "\*\.keystore" .gitignore || { echo "Missing *.keystore in .gitignore"; exit 1; }
grep -q "\*service-account\*\.json" .gitignore || { echo "Missing *service-account*.json in .gitignore"; exit 1; }

echo "Environment Blueprint tests passed."
exit 0