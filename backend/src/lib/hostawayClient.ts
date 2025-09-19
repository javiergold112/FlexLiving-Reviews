import axios from 'axios';

const HOSTAWAY_API_URL = process.env.HOSTAWAY_API_URL!;
const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID!;
const API_KEY = process.env.HOSTAWAY_API_KEY!;

export interface HostawayReview {
  id: number | string;
  type?: string;
  status?: string;
  rating?: number;
  publicReview?: string;
  privateNotes?: string;
  reviewCategory?: { category: string; rating: number }[];
  submittedAt?: string;
  guestName?: string;
  listingName?: string;
  listingId?: string | number;
  channel?: string;
}

class HostawayClient {
  private client = axios.create({
    baseURL: HOSTAWAY_API_URL,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  async getReviews(listingId?: string | number): Promise<HostawayReview[]> {
    try {
      const url = listingId ? `/listings/${listingId}/reviews` : `/reviews`;
      const res = await this.client.get(url, { params: { accountId: ACCOUNT_ID } });
      const result = res.data?.result ?? [];
      if (!Array.isArray(result)) return [];
      return result as HostawayReview[];
    } catch (e) {
      return [];
    }
  }
}

export const hostawayClient = new HostawayClient();
