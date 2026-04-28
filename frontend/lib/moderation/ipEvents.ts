import { addDocument, COLLECTIONS } from '@/lib/firestore';

export async function logIpEvent(
  usernameLower: string,
  ipHash: string,
  kind: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    await addDocument(COLLECTIONS.IP_EVENTS, {
      username_lower: usernameLower,
      ip_hash: ipHash,
      kind,
      meta: meta || {},
      created_at: Date.now(),
    });
  } catch {
    /* non-fatal */
  }
}
