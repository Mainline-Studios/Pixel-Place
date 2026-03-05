/**
 * One-time setup: creates Firestore document config/admin so admin login works
 * without setting env vars in Firebase Console.
 *
 * 1. Get a service account key: Firebase Console → Project Settings (gear) →
 *    Service accounts → "Generate new private key" → save as scripts/serviceAccountKey.json
 * 2. Run: ADMIN_USERNAME=admin ADMIN_PASSWORD=yourpassword node scripts/setup-firebase-admin.js
 *    (Or on Windows: set ADMIN_USERNAME=admin && set ADMIN_PASSWORD=yourpassword && node scripts/setup-firebase-admin.js)
 */

const path = require('path');
const fs = require('fs');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('Missing service account key.');
  console.error('1. Go to https://console.firebase.google.com → your project → Project settings (gear) → Service accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the JSON file as: scripts/serviceAccountKey.json');
  console.error('   (Or set GOOGLE_APPLICATION_CREDENTIALS to its path.)');
  process.exit(1);
}

const admin = require('firebase-admin');
const projectId = process.env.GCLOUD_PROJECT || 'pixel-place-823b1';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(require(keyPath)), projectId });
}

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;
if (!password) {
  console.error('Set ADMIN_PASSWORD (the password for your admin account).');
  console.error('Example: ADMIN_USERNAME=admin ADMIN_PASSWORD=mypass node scripts/setup-firebase-admin.js');
  process.exit(1);
}

async function main() {
  await admin.firestore().collection('config').doc('admin').set({
    admin_username: username.trim(),
    admin_password: password,
    updated_at: Date.now(),
  });
  console.log('Done. Firestore config/admin created with admin_username =', username);
  console.log('Redeploy functions so they use it: firebase deploy --only functions');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
