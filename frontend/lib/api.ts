const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store', ...init });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  listReviews: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return http<{ status: string; data: any[]; meta: any }>(`/reviews?${qs}`);
  },
  analytics: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return http<{ status: string; data: any }>(`/reviews/analytics?${qs}`);
  },
  approve: (id: string, body: { approved: boolean; displayOnWebsite?: boolean }) =>
    http(`/reviews/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' },
      body: JSON.stringify(body),
    }),
  sync: () =>
    http(`/reviews/sync`, { method: 'POST', headers: { 'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '' } }),
};
