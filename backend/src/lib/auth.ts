import { FastifyRequest, FastifyReply } from 'fastify';

export function requireAdmin(req: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) {
  const header = req.headers['x-api-key'];
  if (!header || header !== process.env.ADMIN_API_KEY) {
    reply.code(401).send({ status: 'error', message: 'Unauthorized' });
    return;
  }
  done();
}
