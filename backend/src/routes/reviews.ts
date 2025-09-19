import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { reviewService } from '../services/reviewService';
import { requireAdmin } from '../lib/auth';

const FilterQuerySchema = z.object({
  propertyId: z.string().optional(),
  channel: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxRating: z.coerce.number().min(1).max(5).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  approved: z.coerce.boolean().optional(),
  displayOnWebsite: z.coerce.boolean().optional(),
  sortBy: z.enum(['submittedAt', 'rating', 'property']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const ApprovalBody = z.object({
  approved: z.boolean(),
  displayOnWebsite: z.boolean().optional(),
});

export async function reviewRoutes(app: FastifyInstance) {
  app.addSchema({ $id: 'Pagination', type: 'object', properties: { page: { type: 'number' }, limit: { type: 'number' }, total: { type: 'number' } } });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  app.post('/reviews/sync', { preHandler: (req, reply, done) => requireAdmin(req, reply, done) }, async (_req, reply) => {
    const count = await reviewService.fetchHostawayAndUpsert();
    return reply.send({ status: 'success', data: { synced: count } });
  });

  app.get('/reviews', async (req: FastifyRequest, reply) => {
    const q = FilterQuerySchema.parse(req.query);
    const res = await reviewService.list({ ...q });
    return reply.send({ status: 'success', data: res.reviews, meta: { page: q.page, limit: q.limit, total: res.total, pages: res.pages } });
  });

  app.get('/reviews/hostaway', async (req: FastifyRequest, reply) => {
    const q = FilterQuerySchema.parse(req.query);
    const res = await reviewService.list({ ...q });
    return reply.send({ status: 'success', data: { reviews: res.reviews }, meta: { page: q.page, limit: q.limit, total: res.total, pages: res.pages } });
  });

  app.post('/reviews/:id/approve', { preHandler: (req, reply, done) => requireAdmin(req, reply, done) }, async (req: FastifyRequest, reply) => {
    const { id } = req.params as { id: string };
    const body = ApprovalBody.parse(req.body);
    const updated = await reviewService.setApproval(id, body);
    return reply.send({ status: 'success', data: updated });
  });

  app.get('/reviews/analytics', async (req: FastifyRequest, reply) => {
    const q = FilterQuerySchema.parse(req.query);
    const data = await reviewService.analytics({ ...q });
    return reply.send({ status: 'success', data });
  });
}
