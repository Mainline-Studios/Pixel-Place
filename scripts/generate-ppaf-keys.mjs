#!/usr/bin/env node
/**
 * Generate Ed25519 key pair for PPAF (.ppaf signed account backups).
 *
 * Set on Firebase Functions (api):
 *   PPAF_ED25519_PRIVATE_KEY = <full PEM, use \\n if single-line in console>
 *
 * Set in Next build env (e.g. .env.local, hosting build):
 *   NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY = <PUBLIC PEM only — safe to ship in client>
 *
 * Usage: node scripts/generate-ppaf-keys.mjs
 *
 * In the app: Settings → Privacy & safety → Make backup (.ppaf) — copy the command, run it, paste the output, save keys, then create the file.
 */
import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privPem = String(privateKey.export({ type: 'pkcs8', format: 'pem' })).trim();
const pubPem = String(publicKey.export({ type: 'spki', format: 'pem' })).trim();
const payload = {
  version: 1,
  algorithm: 'ed25519',
  privatePem: privPem,
  publicPem: pubPem,
};
const restorationKey = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

console.log('PPAF RESTORATION KEY:');
console.log(restorationKey);
console.log('KEEP THIS SAFE.');
