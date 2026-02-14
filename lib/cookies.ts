/**
 * Cookie utilities for Pixel Place session management.
 * Uses SameSite=Lax and Secure attributes for proper cross-browser security.
 */

const COOKIE_NAME = 'pixelPlaceUser';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/** Set a session cookie with the logged-in username */
export function setSessionCookie(username: string): void {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(username);
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${MAX_AGE}; SameSite=Lax; Secure`;
}

/** Read the session cookie and return the username, or null */
export function getSessionCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Clear the session cookie */
export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax; Secure`;
}
