#!/bin/bash
set -e

# Verify existence
if [ ! -f "AGENTS.md" ]; then
  echo "Expected AGENTS.md to exist"
  exit 1
fi

# Verify required keywords/sections
grep -q "Architecture Overview" AGENTS.md || { echo "Missing Architecture Overview section"; exit 1; }
grep -q "TDD Workflow" AGENTS.md || { echo "Missing TDD Workflow section"; exit 1; }
grep -q "Workspace Documentation" AGENTS.md || { echo "Missing Workspace Documentation links"; exit 1; }

# Verify aliases
if [ ! -L "CLAUDE.md" ] && [ ! -f "CLAUDE.md" ]; then
  echo "Expected CLAUDE.md alias to exist"
  exit 1
fi

if [ ! -L ".cursorrules" ] && [ ! -f ".cursorrules" ]; then
  echo "Expected .cursorrules alias to exist"
  exit 1
fi

# Adversarial: Verify it parses as Markdown (simple check using a lightweight CLI tool if available, or just checking for unclosed code blocks as a heuristic)
# For simplicity, we just count backticks to ensure they are balanced.
BACKTICKS=$(grep -o "\`\`\`" AGENTS.md | wc -l)
if [ $((BACKTICKS % 2)) -ne 0 ]; then
  echo "Adversarial: Unbalanced code blocks found in AGENTS.md"
  exit 1
fi

echo "Agent Primer tests passed."
exit 0