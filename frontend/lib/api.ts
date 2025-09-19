type ListReviewsResponse = {
  status: 'success';
  data: {
    reviews: any[];
    total: number;
    pages: number;
  };
};

type AnalyticsResponse = {
  status: 'success';
  data: any;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api').replace(/\/+$/, '');
const join = (path: string) => `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
const buildQuery = (params: Record<string, any> = {}) => {
  const cleaned = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const qs = new URLSearchParams(cleaned as Record<string, string>).toString();
  return qs ? `?${qs}` : '';
};
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(join(path), { cache: 'no-store', ...init });
  if (!res.ok) {
    let detail = '';
    try { const j = await res.json(); detail = j?.message || j?.error || ''; } catch {}
    throw new Error(`API ${res.status} ${res.statusText}${detail ? ` – ${detail}` : ''}`);
  }
  return res.json();
}

export const api = {
  listReviews: (params: Record<string, any> = {}) =>
    http<ListReviewsResponse>(`/reviews${buildQuery(params)}`),

  analytics: (params: Record<string, any> = {}) =>
    http<AnalyticsResponse>(`/reviews/analytics${buildQuery(params)}`),

  approve: (id: string, body: { approved: boolean; displayOnWebsite?: boolean }) =>
    http(`/reviews/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' },
      body: JSON.stringify(body),
    }),

  sync: () =>
    http(`/reviews/sync`, { method: 'POST', headers: { 'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' } }),
};
