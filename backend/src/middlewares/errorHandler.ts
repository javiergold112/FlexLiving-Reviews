import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ status: 'error', message: 'Validation failed', issues: error.issues });
    }
    if ((error as any).code === 'P2025') {
      return reply.code(404).send({ status: 'error', message: 'Not found' });
    }
    app.log.error(error);
    return reply.code(500).send({ status: 'error', message: 'Internal server error' });
  });
}
