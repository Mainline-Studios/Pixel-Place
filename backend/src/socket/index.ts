import type { Server as IOServer } from 'socket.io';
import { logger } from '../lib/logger.js';
import { setIoInstance } from './socketHub.js';
import { registerFactionSockets } from './factionsNamespace.js';

/** Room / game namespaces can be added incrementally without breaking the legacy Next Socket.io server. */
export function registerSocketIo(io: IOServer): void {
  setIoInstance(io);
  registerFactionSockets(io);

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'socket connected');
    socket.emit('welcome', { ok: true, api: 'pixel-place-backend', version: 1 });

    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'socket disconnected');
    });
  });
}
