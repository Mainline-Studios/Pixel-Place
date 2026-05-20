/**
 * Email verification API paths. Always use via apiUrl() — Firebase Hosting only
 * rewrites `/api/**` to Cloud Functions (bare `/auth/...` returns the SPA HTML).
 */
export const EMAIL_VERIFICATION_API = {
  status: '/api/auth/email/status',
  requestVerification: '/api/auth/email/request-verification',
  verify: '/api/auth/email/verify',
} as const;

/** Reject Hosting SPA HTML mistaken for a successful API response. */
export function assertEmailApiJsonResponse(res: Response, data: unknown): void {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Email API returned a non-JSON response. Hard refresh the page (Cmd+Shift+R) and try again.',
    );
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(
      'Email API returned an invalid response. Hard refresh the page (Cmd+Shift+R) and try again.',
    );
  }
}
