/**
 * Ed25519 public key for verifying `.ppaf` files in the browser (offline).
 * Safe to ship in the client bundle — cannot mint signatures without the private key on Cloud Functions.
 * Override with NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY if you rotate keys.
 */
export const PPAF_EMBEDDED_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEANiH3C7zzy6y9ULniuAG9R0LzDVsJPnes2OZY3bHPgtk=
-----END PUBLIC KEY-----`;
