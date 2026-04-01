import { getApiBase } from './apiBase.js';

const API_BASE_URL = getApiBase();

async function apiFetch(path, { method = 'GET', body } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = { Accept: 'application/json' };
  if (!isForm && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = payload?.message || payload?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = payload?.details;
    err.payload = payload;
    throw err;
  }

  // Backend sendSuccess returns { success: true, data: ... }
  // When happy, return "data" directly.
  return payload?.data ?? payload;
}

export const api = {
  getProducts: () => apiFetch('/api/products'),
  getProductCatalog: () => apiFetch('/api/products/catalog'),
  getProductById: (id) => apiFetch(`/api/products/${id}`),
  createProduct: (payload) => apiFetch('/api/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => apiFetch(`/api/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),

  stockIn: (payload) => apiFetch('/api/stock/in', { method: 'POST', body: payload }),
  stockOut: (payload) => apiFetch('/api/stock/out', { method: 'POST', body: payload }),

  listMovements: (query) => {
    const q = query?.product_id ? `&product_id=${encodeURIComponent(query.product_id)}` : '';
    const limit = query?.limit ?? 50;
    const skip = query?.skip ?? 0;
    return apiFetch(`/api/movements?limit=${limit}&skip=${skip}${q}`);
  },
  listMovementsRecent: (limit = 20) => apiFetch(`/api/movements/recent?limit=${limit}`),

  listMovementsByProduct: (productId, { limit = 100, skip = 0 } = {}) => {
    // Backend has dedicated route; keep simple.
    return apiFetch(`/api/movements/product/${productId}?limit=${limit}&skip=${skip}`);
  },

  reportCritical: () => apiFetch('/api/reports/critical'),
  reportConsumption: (limit = 5) => apiFetch(`/api/reports/consumption?limit=${limit}`),
  reportSummary: () => apiFetch('/api/reports/summary'),
  reportDashboard: () => apiFetch('/api/reports/dashboard'),
};

