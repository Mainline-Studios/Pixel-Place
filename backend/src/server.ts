import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { registerSocketIo } from './socket/index.js';
import { disconnectPrisma } from './lib/prisma.js';
import { initRedisIoAdapterClients, shutdownRedis } from './lib/redisClients.js';

async function main(): Promise<void> {
  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    path: env.SOCKET_PATH,
    cors: {
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      methods: ['GET', 'POST'],
    },
  });

  const redisPair = await initRedisIoAdapterClients();
  if (redisPair) {
    io.adapter(createAdapter(redisPair.pubClient, redisPair.subClient));
    logger.info('Socket.IO Redis adapter enabled (horizontal scaling)');
  }

  registerSocketIo(io);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, socketPath: env.SOCKET_PATH }, 'Backend API listening');
  });

  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutting down');
    await shutdownRedis();
    await disconnectPrisma();
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'Server failed to start');
  process.exit(1);
});
