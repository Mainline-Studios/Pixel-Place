/**
 * Socket.io server URL for real-time games (chess, multiplayer).
 * Empty string = same origin (when Next.js + Socket.io run together).
 * In prod: Set NEXT_PUBLIC_SOCKET_URL if the game server is on a different host.
 */
export function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SOCKET_URL ?? '';
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? '';
}
