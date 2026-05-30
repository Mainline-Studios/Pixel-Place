#!/usr/bin/env node
/**
 * Publish a GitHub repo to a Web Deploy subdomain in Storage.
 * Usage: node scripts/publish-web-deploy-git.mjs <predomain> <github-repo-url> [branch]
 */
import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const predomain = process.argv[2];
const gitUrl = process.argv[3];
const branch = process.argv[4] || 'main';

if (!predomain || !gitUrl) {
  console.error('Usage: node scripts/publish-web-deploy-git.mjs <predomain> <github-repo-url> [branch]');
  process.exit(1);
}

admin.initializeApp({
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'pixel-place-823b1.firebasestorage.app',
});

const { deployGithubRepoToStorage } = require('../functions/lib/webDeployGitDeploy.js');

const bucket = admin.storage().bucket();
deployGithubRepoToStorage(bucket, predomain, gitUrl, branch)
  .then((r) => {
    console.log(`Published ${r.filesUploaded} file(s) to web-deploy-hosting/${predomain}/`);
    console.log(`Entry: ${r.entryPath}`);
    console.log(`https://${predomain}.pixelplaceofficial.com`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
