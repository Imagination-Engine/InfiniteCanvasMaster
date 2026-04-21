#!/bin/bash
set -e

# Verify CI workflow exists
if [ ! -f ".github/workflows/ci.yml" ]; then
  echo "Expected .github/workflows/ci.yml to exist"
  exit 1
fi

# Basic text check for required steps
grep -q "actions/setup-node" .github/workflows/ci.yml || { echo "Missing actions/setup-node"; exit 1; }
grep -q "pnpm install" .github/workflows/ci.yml || { echo "Missing pnpm install"; exit 1; }
grep -q "npx turbo run build test lint" .github/workflows/ci.yml || { echo "Missing turbo run command"; exit 1; }

# Verify Cloudflare Pages configuration for apps/web
if [ ! -f "apps/web/wrangler.toml" ]; then
  echo "Expected apps/web/wrangler.toml for Cloudflare Pages config"
  exit 1
fi

echo "CI/CD Configuration test passed."
exit 0