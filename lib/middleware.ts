import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './auth';

// Middleware to require authentication
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

// Middleware to require admin role
export function requireAdmin(request: NextRequest): { user: any; error: null } | { user: null; error: NextResponse } {
  const authResult = requireAuth(request);
  
  if (authResult.error) {
    return authResult;
  }
  
  if (authResult.user.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }),
    };
  }
  
  return authResult;
}
