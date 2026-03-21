/**
 * Guards dangerous Next.js API routes that should never be open on the public internet.
 * Set ADMIN_SETUP_SECRET in the environment and send header `x-admin-setup-secret` on requests.
 * With static export + Firebase, these routes are not deployed to production hosting — but they
 * still run under `next dev` and could be enabled if the app is ever switched to a Node host.
 */
import { NextRequest, NextResponse } from 'next/server';

export function denyUnlessAdminSetupSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SETUP_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error:
          'This route is disabled. Set ADMIN_SETUP_SECRET in the server environment, then send it as header x-admin-setup-secret.',
      },
      { status: 503 },
    );
  }
  const sent = request.headers.get('x-admin-setup-secret');
  if (sent !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
