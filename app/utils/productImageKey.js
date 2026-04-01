/**
 * Ürün adı ve kategoriye göre sunucu tarafında atanır; kullanıcı görsel seçmez.
 */

const IMAGE_KEYS = [
  'bread',
  'croissant',
  'pastry',
  'coffee',
  'tea',
  'soda',
  'water',
  'juice',
  'dairy',
  'snack',
  'food_default',
  'beverage_default',
];

function normalize(s) {
  return String(s || '').toLowerCase();
}

/**
 * @param {string} name
 * @param {string} [category] food | beverage
 * @returns {string} IMAGE_KEYS içinden biri
 */
function computeImageKey(name, category) {
  const n = normalize(name);
  const c = category || '';

  if (n.includes('ekmek') || n.includes('bread') || n.includes('somun')) return 'bread';
  if (n.includes('kruvasan') || n.includes('croissant')) return 'croissant';
  if (n.includes('simit') || n.includes('borek') || n.includes('börek') || n.includes('poğaça') || n.includes('pogaca'))
    return 'pastry';
  if (n.includes('kahve') || n.includes('coffee') || n.includes('espresso') || n.includes('latte') || n.includes('filtre'))
    return 'coffee';
  if (n.includes('cay') || n.includes('çay') || n.includes('tea')) return 'tea';
  if (
    n.includes('kola') ||
    n.includes('gazoz') ||
    n.includes('fanta') ||
    n.includes('sprite') ||
    n.includes('maden') ||
    n.includes('gazli') ||
    n.includes('gazlı')
  )
    return 'soda';
  if (
    (n.includes('su') && (n.includes('sise') || n.includes('şişe') || n.includes('pet') || n.includes('damacana'))) ||
    n === 'su' ||
    n.startsWith('su ')
  )
    return 'water';
  if (n.includes('meyve') || n.includes('juice') || n.includes('nektar') || n.includes('portakal') || n.includes('limonata'))
    return 'juice';
  if (n.includes('ayran')) return 'dairy';
  if (n.includes('sut') || n.includes('süt') || n.includes('peynir') || n.includes('yogurt') || n.includes('yoğurt'))
    return 'dairy';
  if (n.includes('kurabiye')) return 'snack';
  if (n.includes('cips') || n.includes('kraker') || n.includes('cikolata') || n.includes('çikolata')) return 'snack';

  if (c === 'beverage') return 'beverage_default';
  if (c === 'food') return 'food_default';
  return 'food_default';
}

module.exports = {
  IMAGE_KEYS,
  computeImageKey,
};
