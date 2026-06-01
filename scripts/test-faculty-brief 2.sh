#!/bin/bash
set -e

FILE="docs/demo/faculty-brief.md"

if [ ! -f "$FILE" ]; then
  echo "Missing $FILE"
  exit 1
fi

grep -q "Four Invariants" "$FILE" || { echo "Missing Four Invariants section"; exit 1; }
grep -q "Technical Deep-Dive" "$FILE" || { echo "Missing Technical Deep-Dive section"; exit 1; }
grep -q "Model Context Protocol" "$FILE" || { echo "Missing MCP deep-dive"; exit 1; }
grep -q "Vercel AI SDK" "$FILE" || { echo "Missing Vercel AI SDK deep-dive"; exit 1; }
grep -q "pgvector" "$FILE" || { echo "Missing pgvector deep-dive"; exit 1; }
grep -q "Student Roster" "$FILE" || { echo "Missing Student Roster section"; exit 1; }

echo "Faculty Brief test passed."
exit 0