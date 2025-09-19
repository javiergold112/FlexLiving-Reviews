import { reviewService } from '../src/services/reviewService';

test('normalizeHostaway converts categories 0–10 to 1–5 avg', () => {
  const r: any = {
    id: 1,
    listingId: 'L1',
    listingName: 'Apt',
    guestName: 'G',
    reviewCategory: [{ category: 'cleanliness', rating: 10 }, { category: 'value', rating: 8 }],
    type: 'guest-to-host',
    status: 'published',
    submittedAt: '2024-11-01 10:00:00',
  };

  const n = reviewService.normalizeHostaway(r);
  expect(n.rating).toBe(5);
  expect(typeof n.reviewCategories).toBe('string');
  expect(JSON.parse(n.reviewCategories).length).toBe(2);
});
