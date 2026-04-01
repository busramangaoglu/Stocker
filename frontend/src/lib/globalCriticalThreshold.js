const STORAGE_KEY = 'stoker_global_critical_threshold';

function parseIntSafe(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Tüm ürünler için kritik eşik (localStorage). Kartlardaki kırmızı uyarı buna göre. */
export function getGlobalCriticalThreshold() {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null || raw === '') return 0;
  return parseIntSafe(raw, 0);
}

export function setGlobalCriticalThreshold(value) {
  const n = parseIntSafe(value, 0);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, String(n));
    window.dispatchEvent(new CustomEvent('stoker-critical-threshold-changed', { detail: { value: n } }));
  }
  return n;
}

export function isBelowGlobalCritical(stockQuantity, threshold) {
  const t = Number(threshold);
  if (!Number.isFinite(t) || t < 0) return false;
  return Number(stockQuantity) <= t;
}
