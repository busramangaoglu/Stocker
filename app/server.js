const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { corsOptions } = require('./config/security');
const { openApiSpec } = require('./config/openapi');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const productRoutes = require('./routes/product.routes');
const stockRoutes = require('./routes/stock.routes');
const movementRoutes = require('./routes/movement.routes');
const reportRoutes = require('./routes/report.routes');
const { streamPublicImage } = require('./routes/publicImage.routes');
const { migrateStaleImageUrls } = require('./services/product.service');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

const publicRoot = path.join(__dirname, '..', 'public');
const productImagesDir = path.join(publicRoot, 'product-images');
app.use('/product-images', express.static(productImagesDir));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
app.get('/api/docs.json', (req, res) => {
  res.json(openApiSpec);
});

app.get('/api/public-image', streamPublicImage);

app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  if (env.skipDb && env.nodeEnv !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[SKIP_DB=1] MongoDB bağlantısı atlandı. Ürün/stok API’leri çalışmaz. Atlas IP whitelist veya MONGODB_URI düzeltildikten sonra SKIP_DB kaldırın.\n'
    );
  } else {
    try {
      await connectDatabase();
    } catch (err) {
      if (env.allowDbFail) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DEV_ALLOW_DB_FAIL] MongoDB bağlanamadı; sunucu yine de açılıyor. Atlas IP whitelist veya MONGODB_URI’yi düzeltin.\n'
        );
      } else {
        throw err;
      }
    }
  }
  // DB'deki eski görsel URL'lerini arka planda güncelle (bloklamamak için await yok)
  if (!env.skipDb) migrateStaleImageUrls();

  app.listen(env.port, () => {
    const base = `http://localhost:${env.port}`;
    // eslint-disable-next-line no-console
    console.log(`Sunucu ${base} adresinde çalışıyor`);
    // eslint-disable-next-line no-console
    console.log(`Swagger UI: ${base}/api/docs`);
    let svgCount = 0;
    try {
      svgCount = fs.readdirSync(productImagesDir).filter((f) => f.endsWith('.svg')).length;
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`[product-images] Klasör bulunamadı veya okunamadı: ${productImagesDir}`);
    }
    if (svgCount > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `Ürün SVG görselleri: ${base}/product-images/ (${svgCount} dosya). Arayüz (npm run dev) bu yolu Vite proxy ile buraya yönlendirir.`
      );
    }
    // eslint-disable-next-line no-console
    console.log(
      'Harici ürün fotoğrafları: katalogdaki default_image_url veya DB image_url (HTTPS); yine de API bu sunucudan gelir.'
    );
  });
}

if (require.main === module) {
  start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Başlatma hatası:', err);
    process.exit(1);
  });
}

module.exports = { app, start };
