#!/bin/bash
set -e

FILE=".agent/rules/dependencies.md"

if [ ! -f "$FILE" ]; then
  echo "Expected $FILE to exist"
  exit 1
fi

grep -q "Dependency Atlas" "$FILE" || { echo "Missing Dependency Atlas reference"; exit 1; }
grep -q "justification checklist" "$FILE" || { echo "Missing justification checklist reference"; exit 1; }
grep -q "Problem solved" "$FILE" || { echo "Missing 'Problem solved' checklist item"; exit 1; }
grep -q "Why existing fails" "$FILE" || { echo "Missing 'Why existing fails' checklist item"; exit 1; }
grep -q "Bundle impact" "$FILE" || { echo "Missing 'Bundle impact' checklist item"; exit 1; }
grep -q "Maintenance signal" "$FILE" || { echo "Missing 'Maintenance signal' checklist item"; exit 1; }

echo "Dependency Rules test passed."
exit 0