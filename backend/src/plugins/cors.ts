import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (app) => {
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  });
});
