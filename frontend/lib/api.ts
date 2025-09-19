const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api').replace(/\/+$/, '');

function join(path: string) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function buildQuery(params: Record<string, any> = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const qs = new URLSearchParams(cleaned as Record<string, string>).toString();
  return qs ? `?${qs}` : '';
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = join(path);
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.message || j?.error || '';
    } catch {
    }
    throw new Error(`API ${res.status} ${res.statusText}${detail ? ` – ${detail}` : ''}`);
  }
  return res.json();
}

export const api = {
  listReviews: (params: Record<string, any> = {}) =>
    http<{ status: string; data: { reviews: any[]; total: number; pages: number } }>(
      `/reviews${buildQuery(params)}`
    ),

  analytics: (params: Record<string, any> = {}) =>
    http<{ status: string; data: any }>(`/reviews/analytics${buildQuery(params)}`),

  approve: (id: string, body: { approved: boolean; displayOnWebsite?: boolean }) =>
    http(`/reviews/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
      },
      body: JSON.stringify(body),
    }),

  sync: () =>
    http(`/reviews/sync`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
      },
    }),
};
