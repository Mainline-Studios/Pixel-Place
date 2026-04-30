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
const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const pubPem = publicKey.export({ type: 'spki', format: 'pem' });

console.log('--- Add to Cloud Functions environment (secret) ---\n');
console.log('PPAF_ED25519_PRIVATE_KEY=' + JSON.stringify(privPem.trim()));
console.log('\n--- Add to Next.js env (public, verify-only in browser) ---\n');
console.log('NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY=' + JSON.stringify(pubPem.trim()));
console.log('\nDone. Keep the private key off git and out of the client bundle.\n');
