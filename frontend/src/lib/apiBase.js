/**
 * API kök URL: VITE_API_BASE_URL doluysa onu kullan.
 * Geliştirmede boş string → istekler Vite sunucusuna gider, vite.config proxy 3000’e yollar (CORS/port karışıklığını azaltır).
 */
export function getApiBase() {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (v !== undefined && v !== null && String(v).trim() !== '') {
    return String(v).trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return 'http://localhost:3000';
}
