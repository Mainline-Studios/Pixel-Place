/**
 * Shared config for Cloud Functions.
 * Set ANTHROPIC_API_KEY in functions/.env (see functions/.env.example).
 * Deploy includes .env so no Console or deprecated config needed.
 */
export function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}
