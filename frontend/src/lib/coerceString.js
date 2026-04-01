/**
 * UI ve API için güvenli düz metin: nesne gelirse [object Object] yerine anlamlı string.
 */
export function coercePlainString(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    if (typeof value.tr === 'string') return value.tr;
    if (typeof value.en === 'string') return value.en;
    if (typeof value.value === 'string') return value.value;
    const first = Object.values(value).find((v) => typeof v === 'string');
    if (first) return first;
  }
  return '';
}

export function normalizeCatalogItem(item) {
  if (!item || typeof item !== 'object') return null;
  const name = coercePlainString(item.name).trim();
  if (!name) return null;
  return {
    ...item,
    name,
    category: coercePlainString(item.category).trim() || item.category || '',
    description: typeof item.description === 'string' ? item.description : coercePlainString(item.description),
    unit: coercePlainString(item.unit).trim() || item.unit || 'adet',
  };
}

export function normalizeProductRow(p) {
  if (!p || typeof p !== 'object') return p;
  return { ...p, name: coercePlainString(p.name).trim() };
}
