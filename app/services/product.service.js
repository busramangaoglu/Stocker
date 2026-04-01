const mongoose = require('mongoose');
const productRepository = require('../repositories/product.repository');
const productNameImageRepository = require('../repositories/productNameImage.repository');
const movementRepository = require('../repositories/movement.repository');
const { MovementType } = require('../utils/enums');
const { isCriticalStock } = require('../utils/helpers');
const { computeImageKey } = require('../utils/productImageKey');
const { resolveProductImageUrl } = require('../config/productImageUrls');
const { findCatalogEntry, STALE_DEFAULT_IMAGE_URLS } = require('../config/productCatalog');

/**
 * Ürün belgesinde image_url boşsa: önce product_name_images, sonra katalog varsayılanı ile doldurur (yalnızca yanıt için).
 */
async function enrichDocWithResolvedImageUrl(doc) {
  if (!doc) return doc;
  const stored = (doc.image_url || '').trim();
  const entry = findCatalogEntry(doc.name);

  if (stored && entry?.default_image_url && STALE_DEFAULT_IMAGE_URLS.has(stored)) {
    return { ...doc, image_url: entry.default_image_url.trim() };
  }
  if (stored) return doc;

  if (entry?.default_image_url) {
    return { ...doc, image_url: entry.default_image_url.trim() };
  }

  const url = await productNameImageRepository.findUrlByName(doc.name);
  if (!url) return doc;
  return { ...doc, image_url: url };
}

function toProductResponse(doc) {
  if (!doc) return null;
  const critical = isCriticalStock(doc.stock_quantity, doc.minimum_stock);
  const storedImageUrl = (doc.image_url || '').trim();
  return {
    _id: doc._id,
    name: doc.name,
    description: doc.description,
    stock_quantity: doc.stock_quantity,
    minimum_stock: doc.minimum_stock,
    unit: doc.unit,
    category: doc.category,
    image_key: doc.image_key || computeImageKey(doc.name, doc.category),
    /** Veritabanında saklanan ham adres (form / entegrasyon) */
    image_url: storedImageUrl,
    /** Kart ve img için çözülmüş URL (image_url boşsa varsayılan SVG vb.) */
    image_display_url: resolveProductImageUrl(doc),
    is_critical: critical,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

async function persistNameImageRegistry(name, imageUrl) {
  const u = (imageUrl || '').trim();
  if (!u || !String(name || '').trim()) return;
  try {
    await productNameImageRepository.upsertByName(name, u);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[productNameImage]', err.message);
  }
}

async function createProduct(payload) {
  const initialStock = payload.stock_quantity ?? 0;
  const image_key = computeImageKey(payload.name, payload.category);
  let image_url = typeof payload.image_url === 'string' ? payload.image_url.trim() : '';
  if (!image_url) {
    const catEntry = findCatalogEntry(payload.name);
    if (catEntry?.default_image_url) image_url = catEntry.default_image_url.trim();
  }
  if (!image_url) {
    const fromRegistry = await productNameImageRepository.findUrlByName(payload.name);
    if (fromRegistry) image_url = fromRegistry;
  }
  if (!image_url) {
    const inherited = await productRepository.findImageUrlFromPeerByName(payload.name);
    if (inherited) image_url = inherited;
  }
  const base = {
    name: payload.name,
    description: payload.description ?? '',
    stock_quantity: initialStock,
    minimum_stock: payload.minimum_stock ?? 0,
    unit: payload.unit ?? 'adet',
    ...(payload.category ? { category: payload.category } : {}),
    image_key,
    ...(image_url ? { image_url } : {}),
  };

  if (initialStock <= 0) {
    const created = await productRepository.create(base);
    await persistNameImageRegistry(payload.name, created.image_url);
    const enriched = await enrichDocWithResolvedImageUrl(created);
    return toProductResponse(enriched);
  }

  // Transaction bazı Atlas / sürücü kombinasyonlarında 500 üretebiliyor; aynı mantık
  // transaction olmadan: önce ürün (nihai stok), sonra hareket — hareket patlarsa ürünü geri al.
  const productRow = {
    ...base,
    stock_quantity: initialStock,
  };
  const created = await productRepository.create(productRow);
  try {
    await movementRepository.create({
      product_id: created._id,
      movement_type: MovementType.IN,
      quantity: initialStock,
      description: 'Başlangıç stok girişi',
    });
  } catch (movementErr) {
    await productRepository.deleteById(created._id);
    throw movementErr;
  }
  await persistNameImageRegistry(payload.name, created.image_url);
  const enriched = await enrichDocWithResolvedImageUrl(created);
  return toProductResponse(enriched);
}

async function listProducts() {
  const list = await productRepository.findAll();
  const out = await Promise.all(
    list.map(async (p) => {
      const d = await enrichDocWithResolvedImageUrl(p);
      return toProductResponse(d);
    }),
  );
  return out;
}

async function getProductById(id) {
  const doc = await productRepository.findById(id);
  if (!doc) return null;
  const d = await enrichDocWithResolvedImageUrl(doc);
  return toProductResponse(d);
}

async function updateProduct(id, payload) {
  const forbidden = Object.prototype.hasOwnProperty.call(payload, 'stock_quantity');
  if (forbidden) {
    const err = new Error('stock_quantity doğrudan güncellenemez; stok giriş/çıkış kullanın.');
    err.statusCode = 400;
    throw err;
  }
  const current = await productRepository.findById(id);
  if (!current) return null;

  const nextName = payload.name !== undefined ? payload.name : current.name;
  const nextCategory = payload.category !== undefined ? payload.category : current.category;
  const image_key = computeImageKey(nextName, nextCategory);

  const { image_key: _k, ...rest } = payload;
  const updated = await productRepository.updateById(id, { ...rest, image_key });
  if (updated) await persistNameImageRegistry(updated.name, updated.image_url);
  if (!updated) return null;
  const d = await enrichDocWithResolvedImageUrl(updated);
  return toProductResponse(d);
}

async function deleteProduct(id) {
  const before = await productRepository.findById(id);
  if (!before) return null;
  if (before.image_url?.trim()) {
    await persistNameImageRegistry(before.name, before.image_url);
  }
  const session = await mongoose.startSession();
  try {
    let deleted;
    await session.withTransaction(async () => {
      await movementRepository.deleteByProductId(id, session);
      deleted = await productRepository.deleteById(id, session);
    });
    return deleted;
  } finally {
    await session.endSession();
  }
}

/** Mevcut products kayıtlarındaki image_url değerlerini ada göre kalıcı eşlemeye yazar (seed / bakım). */
async function syncNameImageRegistryFromProducts() {
  const list = await productRepository.findAll();
  for (const p of list) {
    const u = (p.image_url || '').trim();
    if (u) await productNameImageRepository.upsertByName(p.name, u);
  }
}

/** Katalogdaki default_image_url değerlerini product_name_images tablosuna yazar (Ekmek vb.). */
async function applyCatalogDefaultsToRegistry() {
  const { PRODUCT_CATALOG } = require('../config/productCatalog');
  for (const p of PRODUCT_CATALOG) {
    const u = (p.default_image_url || '').trim();
    if (u) await productNameImageRepository.upsertByName(p.name, u);
  }
}

/**
 * DB'deki eski/bozuk görsel URL'lerini (STALE_DEFAULT_IMAGE_URLS) katalogdaki
 * güncel adresle değiştirir. Sunucu başlangıcında çalıştırılır; log dışında
 * hiçbir şeyi bloklamaz.
 */
async function migrateStaleImageUrls() {
  const {
    PRODUCT_CATALOG,
    STALE_DEFAULT_IMAGE_URLS,
  } = require('../config/productCatalog');

  const catalogMap = new Map(PRODUCT_CATALOG.map((p) => [p.name.toLowerCase(), p.default_image_url]));

  try {
    const list = await productRepository.findAll();
    let fixed = 0;
    for (const p of list) {
      const stored = (p.image_url || '').trim();
      if (!stored || !STALE_DEFAULT_IMAGE_URLS.has(stored)) continue;
      const freshUrl = catalogMap.get((p.name || '').trim().toLowerCase());
      if (!freshUrl || freshUrl === stored) continue;
      await productRepository.updateById(p._id, { image_url: freshUrl });
      await productNameImageRepository.upsertByName(p.name, freshUrl);
      fixed++;
    }
    if (fixed > 0) {
      // eslint-disable-next-line no-console
      console.log(`[migrateStaleImageUrls] ${fixed} ürünün görseli güncellendi.`);
    }
    // registry'yi de her zaman güncel katalogla yenile
    for (const p of PRODUCT_CATALOG) {
      const u = (p.default_image_url || '').trim();
      if (u) await productNameImageRepository.upsertByName(p.name, u);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migrateStaleImageUrls] Hata (kritik değil):', err.message);
  }
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  syncNameImageRegistryFromProducts,
  applyCatalogDefaultsToRegistry,
  migrateStaleImageUrls,
  enrichDocWithResolvedImageUrl,
  toProductResponse,
};
