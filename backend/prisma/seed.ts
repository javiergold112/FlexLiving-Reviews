import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.review.createMany({
    data: [
      {
        sourceId: 'demo-1',
        source: 'hostaway',
        propertyId: 'prop-1',
        propertyName: '2B N1 A - 29 Shoreditch Heights',
        guestName: 'Sarah Johnson',
        rating: 5,
        publicReview: 'Amazing stay!',
        reviewCategories: JSON.stringify([{ category: 'cleanliness', rating: 10 }]),
        channel: 'airbnb',
        reviewType: 'guest-to-host',
        submittedAt: new Date('2024-11-15T14:30:00Z'),
        status: 'published',
        approved: true,
        displayOnWebsite: true,
      },
    ],
  });
}

main().finally(async () => prisma.$disconnect());
