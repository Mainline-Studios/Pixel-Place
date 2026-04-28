import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getAuthenticatedUser } from '@/lib/server/apiAuth';
import { isModerator } from '@/lib/moderation/roles';
import { getDocuments, COLLECTIONS } from '@/lib/firestore';
import type { AuditLogEntry } from '@/types';

function rowFromDoc(doc: any): AuditLogEntry {
  return {
    id: doc.id,
    actorUsername: doc.actor_username || '',
    action: doc.action || '',
    targetType: doc.target_type || '',
    targetId: doc.target_id || '',
    metadata: doc.metadata || {},
    ipHash: doc.ip_hash || undefined,
    timestamp: doc.created_at || Date.now(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || !isModerator(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 500);

    const docs = await getDocuments(COLLECTIONS.AUDIT_LOGS, (ref: any) =>
      ref.orderBy('created_at', 'desc').limit(limit)
    );

    return NextResponse.json(docs.map(rowFromDoc));
  } catch (e) {
    console.error('[audit]', e);
    /* Fallback without orderBy if index missing */
    try {
      const docs = await getDocuments(COLLECTIONS.AUDIT_LOGS);
      const sorted = docs
        .sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0))
        .slice(0, 100);
      return NextResponse.json(sorted.map(rowFromDoc));
    } catch {
      return NextResponse.json({ error: 'Failed to load audit log' }, { status: 500 });
    }
  }
}
