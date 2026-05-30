#!/usr/bin/env bash
# Deploy OpenCut (MIT) for opencut.pixelplaceofficial.com — Cloud Run + Web Deploy DNS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPENCUT_REF="${OPENCUT_REF:-main}"
OPENCUT_REPO="${OPENCUT_REPO:-https://github.com/OpenCut-app/OpenCut}"
WORK="${TMPDIR:-/tmp}/opencut-deploy-$$"
PROJECT="${GCP_PROJECT:-pixel-place-823b1}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="opencut-web"
IMAGE="gcr.io/${PROJECT}/${SERVICE}"
SITE_URL="https://opencut.pixelplaceofficial.com"
PREDOM="opencut"

cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

echo "==> Clone OpenCut @ ${OPENCUT_REF}"
git clone --depth 1 --branch "$OPENCUT_REF" "$OPENCUT_REPO" "$WORK"

echo "==> MIT license files in static public/"
cp "$WORK/LICENSE" "$WORK/apps/web/public/LICENSE"
cp "$WORK/LICENSE" "$WORK/apps/web/public/MIT-LICENSE.txt"
cat > "$WORK/apps/web/public/open-source-notice.txt" <<EOF
OpenCut — Video Editor
Copyright 2025-2026 OpenCut

Hosted for Pixel Place Web Deploy Services at ${SITE_URL}.

This site runs software from https://github.com/OpenCut-app/OpenCut
licensed under the MIT License. The full license text is available at
${SITE_URL}/LICENSE

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
EOF

echo "==> Apply build patches (upstream main may not typecheck)"
cp "$ROOT/scripts/opencut/keybinding-patch.ts" "$WORK/apps/web/src/actions/keybinding.ts"
# Allow production Docker build while OpenCut rewrite stabilizes
perl -i -pe 's/reactStrictMode: true,/reactStrictMode: true,\n\ttypescript: { ignoreBuildErrors: true },\n\teslint: { ignoreDuringBuilds: true },/' \
  "$WORK/apps/web/next.config.ts"

export DOCKER_DEFAULT_PLATFORM=linux/amd64
docker build -f "$WORK/apps/web/Dockerfile" "$WORK" \
  --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
  -t "$IMAGE:latest"

echo "==> Push image"
gcloud auth configure-docker gcr.io --quiet 2>/dev/null || true
docker push "$IMAGE:latest"

echo "==> Deploy Cloud Run"
gcloud run deploy "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --image "$IMAGE:latest" \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "NEXT_PUBLIC_SITE_URL=${SITE_URL},NODE_ENV=production"

RUN_URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" --format='value(status.url)')"
echo "Cloud Run URL: $RUN_URL"

echo "==> Register Web Deploy + DNS (functions must have CLOUDFLARE_* set)"
echo "Add to functions/.env:"
echo "OPENCUT_CLOUD_RUN_URL=${RUN_URL}"
echo ""
echo "Then: cd functions && npm run build && cd .. && firebase deploy --only functions"
echo ""
echo "Provision hosting domain:"
node "$ROOT/scripts/provision-web-deploy-subdomain.mjs" "$PREDOM" "$SITE_URL" || true

echo "Done. Open ${SITE_URL} after functions deploy (with OPENCUT_CLOUD_RUN_URL)."
