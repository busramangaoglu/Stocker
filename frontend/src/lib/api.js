import { getApiBase } from './apiBase.js';
import { coercePlainString } from './coerceString.js';

const API_BASE_URL = getApiBase();

function messageFromErrorPayload(payload, status) {
  const raw = payload?.message ?? payload?.error;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw)) {
    const parts = raw.map((x) => coercePlainString(x) || (typeof x === 'object' ? JSON.stringify(x) : String(x))).filter(Boolean);
    if (parts.length) return parts.join('; ');
  }
  if (raw && typeof raw === 'object') {
    if (typeof raw.message === 'string') return raw.message;
    const details = payload?.details;
    if (Array.isArray(details)) {
      const msgs = details
        .map((d) => coercePlainString(d?.message) || (typeof d === 'string' ? d : ''))
        .filter(Boolean);
      if (msgs.length) return msgs.join('; ');
    }
    try {
      return JSON.stringify(raw);
    } catch {
      /* ignore */
    }
  }
  return `Request failed (${status})`;
}

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
    const msg = messageFromErrorPayload(payload, res.status);
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

