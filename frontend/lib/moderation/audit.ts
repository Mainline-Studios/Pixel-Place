import { addDocument, COLLECTIONS } from '@/lib/firestore';

export async function writeAuditLog(entry: {
  actorUsername: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
}): Promise<string | null> {
  try {
    return await addDocument(COLLECTIONS.AUDIT_LOGS, {
      actor_username: entry.actorUsername,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      metadata: entry.metadata || {},
      ip_hash: entry.ipHash || '',
      created_at: Date.now(),
    });
  } catch (e) {
    console.error('[audit]', e);
    return null;
  }
}
