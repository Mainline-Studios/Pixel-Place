import { io, type Socket } from 'socket.io-client';
import { getBackendBaseUrl } from '@/lib/backendV1';

/** Authenticated Socket.IO connection to the backend `/factions` namespace (real-time chat, territory, leaderboards). */
export function createFactionSocket(accessToken: string): Socket | null {
  const base = getBackendBaseUrl();
  if (!base) return null;
  return io(`${base}/factions`, {
    path: '/socket.io',
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
  });
}
