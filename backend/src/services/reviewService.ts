import { prisma } from '../lib/prisma';
import { hostawayClient, HostawayReview } from '../lib/hostawayClient';
import type { Review } from '@prisma/client';

export type Filters = {
  propertyId?: string;
  channel?: string;
  rating?: number;
  minRating?: number;
  maxRating?: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  approved?: boolean;
  displayOnWebsite?: boolean;
  sortBy?: 'submittedAt' | 'rating' | 'property';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
};

export const reviewService = {
  async fetchHostawayAndUpsert(): Promise<number> {
    const raw = await hostawayClient.getReviews();
    if (!raw.length) return 0;

    const normalized = raw.map(this.normalizeHostaway);

    const chunks: typeof normalized[] = [];
    const size = 100;
    for (let i = 0; i < normalized.length; i += size) chunks.push(normalized.slice(i, i + size));

    let upserts = 0;
    for (const chunk of chunks) {
      await prisma.$transaction(
        chunk.map((r) =>
          prisma.review.upsert({
            where: { sourceId_source: { sourceId: r.sourceId, source: r.source } },
            update: {
              propertyId: r.propertyId,
              propertyName: r.propertyName,
              guestName: r.guestName,
              rating: r.rating,
              publicReview: r.publicReview,
              privateNotes: r.privateNotes,
              reviewCategories: JSON.stringify(r.reviewCategories),
              channel: r.channel,
              reviewType: r.reviewType,
              submittedAt: r.submittedAt,
              status: r.status,
            },
            create: r,
          })
        )
      );
      upserts += chunk.length;
    }
    return upserts;
  },

  normalizeHostaway(r: HostawayReview) {
    const rating = (() => {
      if (typeof r.rating === 'number') return Math.max(1, Math.min(5, r.rating));
      const cats = r.reviewCategory ?? [];
      if (cats.length) {
        const sum = cats.reduce((acc, c) => acc + (typeof c.rating === 'number' ? c.rating : 0), 0);
        // convert 0-10 to 1-5
        const avg10 = sum / cats.length;
        return Math.round(avg10 / 2) || 0;
      }
      return 0;
    })();

    return {
      sourceId: String(r.id),
      source: 'hostaway' as const,
      propertyId: String(r.listingId ?? r.listingName ?? 'unknown'),
      propertyName: r.listingName ?? 'Unknown Property',
      guestName: r.guestName ?? 'Guest',
      rating,
      publicReview: r.publicReview ?? '',
      privateNotes: r.privateNotes ?? null,
      reviewCategories: JSON.stringify(r.reviewCategory ?? []),
      channel: r.channel ?? 'direct',
      reviewType: r.type ?? 'guest-to-host',
      submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
      status: r.status ?? 'published',
      approved: false,
      displayOnWebsite: false,
    };
  },

  buildWhere(filters: Filters) {
    const where: any = {};
    if (filters.propertyId) where.propertyId = filters.propertyId;
    if (filters.channel) where.channel = filters.channel;
    if (typeof filters.approved === 'boolean') where.approved = filters.approved;
    if (typeof filters.displayOnWebsite === 'boolean') where.displayOnWebsite = filters.displayOnWebsite;
  
    if (
      typeof filters.rating === 'number' ||
      typeof filters.minRating === 'number' ||
      typeof filters.maxRating === 'number'
    ) {
      where.rating = {};
      if (typeof filters.rating === 'number') where.rating.equals = filters.rating;
      if (typeof filters.minRating === 'number') where.rating.gte = filters.minRating;
      if (typeof filters.maxRating === 'number') where.rating.lte = filters.maxRating;
    }
  
    if (filters.startDate || filters.endDate) {
      where.submittedAt = {};
      if (filters.startDate) where.submittedAt.gte = filters.startDate;
      if (filters.endDate) where.submittedAt.lte = filters.endDate;
    }
    return where;
  },

  orderBy(filters: Filters) {
    if (filters.sortBy === 'rating') return { rating: filters.sortOrder ?? 'desc' } as const;
    if (filters.sortBy === 'property') return { propertyName: filters.sortOrder ?? 'asc' } as const;
    return { submittedAt: filters.sortOrder ?? 'desc' } as const;
  },

  async list(filters: Filters) {
    const where = this.buildWhere(filters);
    const orderBy = this.orderBy(filters);
    const skip = (filters.page - 1) * filters.limit;
    const take = filters.limit;
  
    let items = await prisma.review.findMany({ where, orderBy, skip, take });
    let total = await prisma.review.count({ where });
  
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      const matchesCategory = (row: any) => {
        const arr = typeof row.reviewCategories === 'string'
          ? JSON.parse(row.reviewCategories || '[]')
          : row.reviewCategories || [];
        return Array.isArray(arr) && arr.some((c: any) => (c?.category || '').toLowerCase() === cat);
      };
  
      const filtered = items.filter(matchesCategory);
      total = filtered.length;
      items = filtered.slice(0, take);
    }
  
    const reviews = items.map((it: any) => ({
      ...it,
      reviewCategories: typeof it.reviewCategories === 'string'
        ? JSON.parse(it.reviewCategories || '[]')
        : (it.reviewCategories ?? []),
    }));
  
    return {
      reviews,
      total,
      pages: Math.ceil(total / filters.limit),
    };
  }
  ,

  async setApproval(id: string, data: { approved: boolean; displayOnWebsite?: boolean }) {
    const updated = await prisma.review.update({
      where: { id },
      data: {
        approved: data.approved,
        displayOnWebsite: typeof data.displayOnWebsite === 'boolean' ? data.displayOnWebsite : data.approved,
      },
    });
    return updated;
  },

  async analytics(filters: Filters) {
    const where = this.buildWhere(filters);
    const reviews: Review[] = await prisma.review.findMany({ where });

    const totalReviews = reviews.length;
    const averageRating = totalReviews ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map((r) => ({ rating: r, count: reviews.filter((x) => x.rating === r).length }));

    const channelBreakdown = reviews.reduce((acc: Record<string, number>, r) => {
      acc[r.channel] = (acc[r.channel] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Reviews over time by YYYY-MM
    const overTimeMap = new Map<string, { month: string; count: number; total: number }>();
    for (const r of reviews) {
      const dt = new Date(r.submittedAt);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const slot = overTimeMap.get(key) ?? { month: key, count: 0, total: 0 };
      slot.count += 1;
      slot.total += r.rating;
      overTimeMap.set(key, slot);
    }
    const reviewsOverTime = Array.from(overTimeMap.values())
      .map((m) => ({ month: m.month, count: m.count, averageRating: +(m.total / m.count).toFixed(2) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Property performance
    const byProperty = new Map<string, { propertyId: string; propertyName: string; totalReviews: number; total: number }>();
    for (const r of reviews) {
      const slot = byProperty.get(r.propertyId) ?? { propertyId: r.propertyId, propertyName: r.propertyName, totalReviews: 0, total: 0 };
      slot.totalReviews += 1;
      slot.total += r.rating;
      byProperty.set(r.propertyId, slot);
    }
    const propertyPerformance = Array.from(byProperty.values())
      .map((p) => ({ ...p, averageRating: +(p.total / p.totalReviews).toFixed(2) }))
      .sort((a, b) => b.averageRating - a.averageRating);

    return {
      totalReviews,
      averageRating: +averageRating.toFixed(1),
      ratingDistribution,
      channelBreakdown,
      reviewsOverTime,
      propertyPerformance,
      approvalRate: totalReviews ? reviews.filter((r) => r.approved).length / totalReviews : 0,
    };
  },
};
