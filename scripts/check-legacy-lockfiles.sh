#!/bin/bash
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
  echo "Legacy lockfile found!"
  exit 1
else
  echo "No legacy lockfiles found."
  exit 0
fi
