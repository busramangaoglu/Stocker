/**
 * Örnek ürün ve stok hareketleri ekler. Mevcut products + stock_movements kayıtlarını siler.
 * Kullanım: npm run seed  (önce .env ve çalışan Atlas / MongoDB gerekir)
 */
require('../app/config/env');
const { connectDatabase, disconnectDatabase } = require('../app/config/database');
const Product = require('../app/models/product.model');
const StockMovement = require('../app/models/stockMovement.model');
const productService = require('../app/services/product.service');
const stockService = require('../app/services/stock.service');

async function clear() {
  await StockMovement.deleteMany({});
  await Product.deleteMany({});
  // eslint-disable-next-line no-console
  console.log('Mevcut koleksiyonlar temizlendi.');
}

async function seed() {
  const p1 = await productService.createProduct({
    name: 'Kruvasan',
    description: 'Tereyağlı, günlük',
    stock_quantity: 120,
    minimum_stock: 0,
    unit: 'adet',
    category: 'food',
    image_url: '',
  });

  const p2 = await productService.createProduct({
    name: 'Soğuk Çay',
    description: 'Şişe, 500 ml',
    stock_quantity: 8,
    minimum_stock: 0,
    unit: 'adet',
    category: 'beverage',
    image_url: '',
  });

  const p3 = await productService.createProduct({
    name: 'Su',
    description: 'Pet şişe',
    stock_quantity: 0,
    minimum_stock: 0,
    unit: 'adet',
    category: 'beverage',
    image_url: '',
  });

  await stockService.stockIn({
    product_id: p3._id.toString(),
    quantity: 15,
    description: 'Seed: ilk giriş',
  });

  await stockService.stockOut({
    product_id: p1._id.toString(),
    quantity: 15,
    description: 'Seed: örnek çıkış',
  });

  await stockService.stockOut({
    product_id: p2._id.toString(),
    quantity: 3,
    description: 'Seed: örnek çıkış',
  });

  await productService.syncNameImageRegistryFromProducts();
  await productService.applyCatalogDefaultsToRegistry();

  // eslint-disable-next-line no-console
  console.log('Örnek veri eklendi:', {
    urunler: [p1.name, p2.name, p3.name],
    not: 'Kritik stok ve raporları GET /api/reports ile kontrol edebilirsiniz.',
  });
}

async function main() {
  try {
    await connectDatabase();
    await clear();
    await seed();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed hatası:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase().catch(() => {});
  }
}

main();
