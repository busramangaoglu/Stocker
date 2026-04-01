/**
 * products koleksiyonundaki image_url değerlerini ada göre product_name_images ile eşitler.
 * Eski veride görsel vardı ama eşleme yoksa bir kez çalıştırın: npm run sync-name-images
 */
require('../app/config/env');
const { connectDatabase, disconnectDatabase } = require('../app/config/database');
const productService = require('../app/services/product.service');

async function main() {
  try {
    await connectDatabase();
    await productService.syncNameImageRegistryFromProducts();
    await productService.applyCatalogDefaultsToRegistry();
    // eslint-disable-next-line no-console
    console.log('Tamam: ürün adı ↔ görsel URL eşlemesi ve katalog varsayılanları güncellendi.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase().catch(() => {});
  }
}

main();
