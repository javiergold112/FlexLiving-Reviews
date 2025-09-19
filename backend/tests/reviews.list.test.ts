import { vi, test, expect, beforeAll } from 'vitest';

let buildTestApp: () => Promise<any>;

beforeAll(async () => {
  vi.resetModules();
  vi.mock('../../src/services/reviewService', () => {
    const demo = [
      {
        id: 'r1',
        sourceId: 's1',
        source: 'hostaway',
        propertyId: 'prop-1',
        propertyName: '2B N1 A - 29 Shoreditch Heights',
        guestName: 'Sarah',
        rating: 5,
        publicReview: 'Great!',
        privateNotes: null,
        reviewCategories: JSON.stringify([{ category: 'cleanliness', rating: 10 }]),
        channel: 'airbnb',
        reviewType: 'guest-to-host',
        submittedAt: new Date('2024-11-10T00:00:00Z'),
        status: 'published',
        approved: true,
        displayOnWebsite: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'r2',
        sourceId: 's2',
        source: 'hostaway',
        propertyId: 'prop-2',
        propertyName: 'Hoxton Studio',
        guestName: 'Alex',
        rating: 3,
        publicReview: 'Okay',
        privateNotes: null,
        reviewCategories: JSON.stringify([{ category: 'value', rating: 6 }]),
        channel: 'booking.com',
        reviewType: 'guest-to-host',
        submittedAt: new Date('2024-10-10T00:00:00Z'),
        status: 'published',
        approved: false,
        displayOnWebsite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      reviewService: {
        getAllReviews: vi.fn().mockImplementation(async (q: any) => {
          let rows = [...demo];
          if (q?.minRating) rows = rows.filter(r => r.rating >= Number(q.minRating));
          if (q?.category) {
            rows = rows.filter(r => {
              const arr = JSON.parse(r.reviewCategories || '[]');
              return arr.some((c: any) => (c.category || '').toLowerCase() === String(q.category).toLowerCase());
            });
          }
          return { reviews: rows, total: rows.length, pages: 1 };
        }),
      },
    };
  });
  ({ buildTestApp } = await import('./utils/buildApps'));
});

test('GET /api/reviews returns array', async () => {
  const app = await buildTestApp();
  const res = await app.inject({ method: 'GET', url: '/api/reviews' });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body.status).toBe('success');

  const rows = body.data?.reviews ?? body.data;
  expect(Array.isArray(rows)).toBe(true);
  await app.close();
});

test('GET /api/reviews?minRating=4 filters correctly', async () => {
  const app = await buildTestApp();
  const res = await app.inject({ method: 'GET', url: '/api/reviews?minRating=4' });
  const body = res.json();
  const rows = body.data?.reviews ?? body.data;
  expect(rows.length).toBe(1);
  expect(rows[0].rating).toBe(5);
  await app.close();
});

test('GET /api/reviews?category=cleanliness filters by category', async () => {
  const app = await buildTestApp();
  const res = await app.inject({ method: 'GET', url: '/api/reviews?category=cleanliness' });
  const body = res.json();
  const rows = body.data?.reviews ?? body.data;
  expect(rows.length).toBe(1);
  expect(rows[0].propertyId).toBe('prop-1');
  await app.close();
});
