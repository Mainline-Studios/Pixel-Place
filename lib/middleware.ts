import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './auth';

/** AuthN: require valid JWT. Identity from token only — never trust body/query. */
export function requireAuth(request: NextRequest): { user: any; error: null } | { user: null; error: NextResponse } {
  const authUser = getAuthUser(request);

  if (!authUser) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user: authUser, error: null };
}

/** AuthZ: require admin or head_admin role. Call after requireAuth. */
export function requireAdmin(request: NextRequest): { user: any; error: null } | { user: null; error: NextResponse } {
  const authResult = requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  if (authResult.user.role !== 'admin' && authResult.user.role !== 'head_admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }),
    };
  }

  return authResult;
}

/** AuthZ: require requester to be the resource owner or an admin. Use for user-scoped routes (draft, profile, etc.). */
export function requireOwnerOrAdmin(
  request: NextRequest,
  resourceOwnerUsername: string
): { user: any; error: null } | { user: null; error: NextResponse } {
  const authResult = requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  const ownerLower = (resourceOwnerUsername || '').toLowerCase();
  const selfLower = authResult.user.username.toLowerCase();
  const isAdmin = authResult.user.role === 'admin' || authResult.user.role === 'head_admin';

  if (ownerLower !== selfLower && !isAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden - Not resource owner or admin' }, { status: 403 }),
    };
  }

  return authResult;
}
