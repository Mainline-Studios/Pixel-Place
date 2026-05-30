#!/usr/bin/env node
/** Provision DNS + Firestore site doc for a Web Deploy subdomain. */
import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const predomain = process.argv[2];
const liveUrl = process.argv[3] || `https://${predomain}.pixelplaceofficial.com`;

if (!predomain) {
  console.error('Usage: node scripts/provision-web-deploy-subdomain.mjs <predomain> [liveUrl]');
  process.exit(1);
}

admin.initializeApp({ projectId: process.env.GCP_PROJECT || 'pixel-place-823b1' });
const db = admin.firestore();

await db.collection('web_deploy_sites').doc(predomain).set(
  {
    predomain,
    project_name: 'OpenCut',
    source_type: 'git',
    status: 'live',
    app_deployed: true,
    live_url: liveUrl,
    git_url: 'https://github.com/OpenCut-app/OpenCut',
    customer_note: 'OpenCut — MIT licensed; served via Cloud Run proxy',
    live_at: Date.now(),
  },
  { merge: true },
);

console.log(`Updated web_deploy_sites/${predomain}`);
