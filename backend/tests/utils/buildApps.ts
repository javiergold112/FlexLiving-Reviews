import Fastify from 'fastify';
import cors from '@fastify/cors';
import { reviewRoutes } from '../../src/routes/reviews';

export async function buildTestApp() {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: '*' });
  await app.register(reviewRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
