#!/usr/bin/env node
/** Register opencut.pixelplaceofficial.com on Hosting + Cloudflare. */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../functions/.env');
try {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
} catch {
  /* optional */
}

const require = createRequire(import.meta.url);
admin.initializeApp({ projectId: 'pixel-place-823b1' });

const { registerWebDeployHostingDomain } = require('../functions/lib/webDeployFirebaseHosting.js');
const { applyCloudflareDnsRecords } = require('../functions/lib/webDeployCloudflare.js');

const predomain = 'opencut';

const hosting = await registerWebDeployHostingDomain(predomain);
const dns = await applyCloudflareDnsRecords(predomain);

console.log('Hosting:', hosting);
console.log('DNS:', dns);

await admin
  .firestore()
  .collection('web_deploy_sites')
  .doc(predomain)
  .set(
    {
      predomain,
      project_name: 'OpenCut',
      source_type: 'git',
      status: 'live',
      app_deployed: true,
      live_url: 'https://opencut.pixelplaceofficial.com',
      git_url: 'https://github.com/OpenCut-app/OpenCut',
      license: 'MIT',
      license_url: 'https://opencut.pixelplaceofficial.com/LICENSE',
      upstream: 'https://github.com/OpenCut-app/OpenCut',
      cloud_run_url: process.env.OPENCUT_CLOUD_RUN_URL || '',
      live_at: Date.now(),
    },
    { merge: true },
  );

console.log('Firestore web_deploy_sites/opencut updated');
