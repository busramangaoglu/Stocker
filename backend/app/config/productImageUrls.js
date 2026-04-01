const { computeImageKey } = require('../utils/productImageKey');
const { findCatalogEntry, CATEGORY_DEFAULT_IMAGE_URL } = require('./productCatalog');

/**
 * Öncelik: DB image_url → katalog default_image_url → kategori genel foto → yerel SVG.
 */

/** Hazır görseller: /product-images/*.svg (Express static) — foto yoksa */
const KEY_TO_PATH = {
  bread: '/product-images/bread.svg',
  croissant: '/product-images/croissant.svg',
  pastry: '/product-images/pastry.svg',
  coffee: '/product-images/coffee.svg',
  tea: '/product-images/tea.svg',
  soda: '/product-images/soda.svg',
  water: '/product-images/water.svg',
  juice: '/product-images/juice.svg',
  dairy: '/product-images/dairy.svg',
  snack: '/product-images/snack.svg',
  food_default: '/product-images/food_default.svg',
  beverage_default: '/product-images/beverage_default.svg',
};

function getImageUrlForKey(imageKey) {
  const path = KEY_TO_PATH[imageKey];
  return path || KEY_TO_PATH.food_default;
}

/**
 * API yanıtındaki image_url: önce veritabanındaki adres (harici HTTPS vb.),
 * yoksa image_key / isim+kategoriye göre varsayılan SVG yolu.
 */
function resolveProductImageUrl(doc) {
  if (!doc) {
    return getImageUrlForKey('food_default');
  }
  const stored = (doc.image_url || '').trim();
  if (stored) {
    if (stored.startsWith('http://') || stored.startsWith('https://')) return stored;
    if (stored.startsWith('/')) return stored;
  }
  const catalogUrl = findCatalogEntry(doc.name)?.default_image_url?.trim();
  if (catalogUrl) {
    return catalogUrl;
  }
  const cat = (doc.category || '').toLowerCase();
  if (cat && CATEGORY_DEFAULT_IMAGE_URL[cat]) {
    return CATEGORY_DEFAULT_IMAGE_URL[cat];
  }
  const key = doc.image_key || computeImageKey(doc.name, doc.category);
  return getImageUrlForKey(key);
}

module.exports = {
  getImageUrlForKey,
  resolveProductImageUrl,
};
