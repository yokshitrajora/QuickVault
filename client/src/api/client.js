const BASE = '/api';

export function getToken() {
  return localStorage.getItem('qv_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('qv_token', token);
  } else {
    localStorage.removeItem('qv_token');
  }
}

export function removeToken() {
  localStorage.removeItem('qv_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.startsWith('/auth/')) {
      // Token is invalid/expired
      removeToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  demoLogin: () => request('/auth/demo', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

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
