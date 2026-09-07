const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Items
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request('/items?' + query.toString());
  },
  createItem: (body) => request('/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id, body) => request(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request('/tags'),

  // Metadata scraper
  scrapeMetadata: (url) => request('/metadata', { method: 'POST', body: JSON.stringify({ url }) }),

  // Seed sample data
  seed: () => request('/seed', { method: 'POST' }),
};
