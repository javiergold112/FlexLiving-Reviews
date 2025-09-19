import { reviewService } from '../src/services/reviewService';

test('buildWhere supports exact, min, max, dates', () => {
  const w = (reviewService as any).buildWhere({
    propertyId: 'prop-1',
    channel: 'airbnb',
    rating: 4,
    minRating: 3,
    maxRating: 5,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-11-30'),
    approved: true,
    displayOnWebsite: false,
    page: 1,
    limit: 10,
  });

  expect(w.propertyId).toBe('prop-1');
  expect(w.channel).toBe('airbnb');
  expect(w.approved).toBe(true);
  expect(w.displayOnWebsite).toBe(false);
  expect(w.rating.gte).toBe(3);
  expect(w.rating.lte).toBe(5);
  expect(w.rating.equals).toBe(4);
  expect(w.submittedAt.gte).toBeInstanceOf(Date);
  expect(w.submittedAt.lte).toBeInstanceOf(Date);
});
