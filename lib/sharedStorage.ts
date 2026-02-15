/**
 * Shared storage - syncs localStorage across browser tabs via BroadcastChannel.
 * When the same app is open in multiple tabs, changes in one tab propagate to others.
 * Use this for game data that would otherwise be "stuck" in a single tab's localStorage.
 */

const CHANNEL_NAME = 'pixelplace-storage-sync';

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return channel;
}

export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

/**
 * Save to localStorage and broadcast to other tabs. Other tabs can subscribe to receive updates.
 */
export function saveLocal(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    getChannel()?.postMessage({ type: 'storage-update', key, value });
  } catch {}
}

export type StorageUpdateCallback = (key: string, value: unknown) => void;

/**
 * Subscribe to storage updates from other tabs. Returns unsubscribe function.
 */
export function subscribeToStorage(callback: StorageUpdateCallback): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type === 'storage-update') {
      callback(e.data.key, e.data.value);
    }
  };
  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
}
