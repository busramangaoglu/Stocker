import { getApiBase } from './apiBase.js';

const API_BASE = getApiBase();

/** Tarayıcıdan doğrudan yüklenince sık engellenen hostlar → backend proxy */
function hostnameForProxy(hostname) {
  const h = (hostname || '').toLowerCase();
  return (
    h === 'upload.wikimedia.org' ||
    h === 'image.hurimg.com' ||
    h === 'encrypted-tbn0.gstatic.com' ||
    h === 'www.bettycrocker.com'
  );
}

/**
 * Ürün image_url: sunucudaki göreli yol (/product-images/...) veya harici HTTPS.
 * Wikimedia / Hürriyet: /api/public-image üzerinden (hotlink sorunu olmaz).
 */
export function resolveProductImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t) return '';
  if (t.startsWith('http://') || t.startsWith('https://')) {
    try {
      const parsed = new URL(t);
      if (hostnameForProxy(parsed.hostname)) {
        const base = API_BASE.replace(/\/$/, '');
        return `${base}/api/public-image?u=${encodeURIComponent(t)}`;
      }
    } catch {
      /* ignore */
    }
    return t;
  }
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${t.startsWith('/') ? '' : '/'}${t}`;
}

/** image_key ile Express’teki /product-images/{key}.svg yedeği (harici URL patlarsa). */
export function productImageFallbackUrl(imageKey) {
  if (!imageKey || typeof imageKey !== 'string') return '';
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/product-images/${encodeURIComponent(imageKey)}.svg`;
}
