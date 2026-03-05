#!/bin/bash
# Deploy Cloud Functions with retry (Google often returns "operation already in progress")
set -e
cd "$(dirname "$0")/.."
echo "Deploying functions (will retry up to 3 times if 'already in progress')..."
for i in 1 2 3; do
  if firebase deploy --only functions; then
    echo "Deploy succeeded."
    exit 0
  fi
  if [ $i -lt 3 ]; then
    echo "Deploy failed. Waiting 90 seconds before retry $((i+1))/3..."
    sleep 90
  fi
done
echo "Deploy failed after 3 attempts."
exit 1
