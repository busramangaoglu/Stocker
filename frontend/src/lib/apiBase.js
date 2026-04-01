/**
 * API kök URL: VITE_API_BASE_URL doluysa onu kullan.
 * Geliştirmede boş string → istekler Vite proxy üzerinden backend'e gider.
 * Production'da Vercel'e VITE_API_BASE_URL=https://backend-url.vercel.app eklenmeli.
 */
export function getApiBase() {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (v !== undefined && v !== null && String(v).trim() !== '') {
    return String(v).trim().replace(/\/$/, '');
  }
  // Geliştirmede Vite proxy kullan; production'da env var zorunlu
  return '';
}
