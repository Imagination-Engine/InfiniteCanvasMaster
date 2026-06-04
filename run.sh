#!/usr/bin/env bash
set -euo pipefail

SCRIPT_SOURCE="${BASH_SOURCE[0]}"
if [[ "${SCRIPT_SOURCE}" == */* ]]; then
  SCRIPT_DIR="$(cd -- "${SCRIPT_SOURCE%/*}" >/dev/null 2>&1 && pwd)"
else
  SCRIPT_DIR="$(pwd)"
fi
APP_DIR="${SCRIPT_DIR}/imagination-canvas"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH." >&2
  exit 1
fi

cd "${APP_DIR}"

if [ ! -d node_modules ] || ! npm ls --silent >/dev/null 2>&1; then
  echo "Dependencies missing or out of sync. Installing dependencies..."
  npm install
fi

npm run dev:all
