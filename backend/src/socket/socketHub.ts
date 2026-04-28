import type { Server as IOServer } from 'socket.io';

let ioInstance: IOServer | null = null;

export function setIoInstance(io: IOServer): void {
  ioInstance = io;
}

export function getIoInstance(): IOServer | null {
  return ioInstance;
}
