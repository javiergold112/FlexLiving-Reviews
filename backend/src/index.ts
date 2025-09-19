import Fastify from 'fastify';
import cors from '@fastify/cors';
import swaggerPlugin from './plugins/swagger';
import { reviewRoutes } from './routes/reviews';
import { registerErrorHandler } from './middlewares/errorHandler';
import { prisma } from './lib/prisma';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  }
});

async function main() {
  await app.register(cors, { origin: process.env.FRONTEND_URL || 'http://localhost:3000' });

  if (process.env.NODE_ENV !== 'production') {
    await app.register(swaggerPlugin);
  }

  registerErrorHandler(app);

  await app.register(reviewRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`API listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
