#!/bin/bash
# Test DB connection
DATABASE_URL=${DATABASE_URL:-"postgres://postgres:postgres@localhost:5433/imagination_canvas"}
echo "Testing connection to $DATABASE_URL..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "Database is reachable and DB exists!"
  exit 0
else
  echo "Database is NOT reachable or DB does not exist."
  exit 1
fi
