#!/usr/bin/env bash
set -e

echo "Starting Vite with E2E mock..."
VITE_E2E=true bunx vite --port 5173 --strictPort &
VITE_PID=$!

# Wait for Vite to be ready
for i in $(seq 1 15); do
  if curl -s -o /dev/null http://localhost:5173/ 2>/dev/null; then
    echo "Vite ready"
    break
  fi
  sleep 1
done

# Run Playwright tests
UPDATE_FLAG=""
if [ "$1" = "--update" ]; then
  UPDATE_FLAG="--update-snapshots"
  shift
fi

npx playwright test $UPDATE_FLAG --config e2e/playwright.config.ts "$@"
EXIT_CODE=$?

# Cleanup
kill $VITE_PID 2>/dev/null
wait $VITE_PID 2>/dev/null

exit $EXIT_CODE
