#!/bin/bash
# Deploy Pixel Place on VPS - run from project root on server
# Pull from GitHub, install, build, restart PM2

set -e

APP_DIR="${APP_DIR:-/var/www/pixel-place}"
APP_NAME="${APP_NAME:-pixel-place}"

cd "$APP_DIR"

echo "=== Pulling from GitHub ==="
git fetch origin
git reset --hard origin/main

echo "=== Installing dependencies ==="
npm ci --production=false

echo "=== Building ==="
npm run build

echo "=== Restarting app ==="
pm2 restart "$APP_NAME" --update-env || pm2 start npm --name "$APP_NAME" -- start

echo "=== Deploy complete ==="
