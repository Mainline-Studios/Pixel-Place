/**
 * Lightweight ID factory for scene entities.
 * Keeps names debugger-friendly while guaranteeing uniqueness within a session.
 */
let serial = 0;

export function createObjectId(prefix = "Object"): string {
  serial += 1;
  return `${prefix}_${serial}`;
}
