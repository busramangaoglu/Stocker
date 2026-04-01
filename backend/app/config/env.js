const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_db',
  /** Yalnızca geliştirme: MongoDB olmadan sunucuyu ayağa kaldırır (API DB hataları verir) */
  skipDb: process.env.SKIP_DB === '1',
  /** Geliştirme: Atlas bağlantısı düşerse yine de dinlemeye geç (tekrar dene / IP whitelist) */
  allowDbFail: process.env.DEV_ALLOW_DB_FAIL === '1' && (process.env.NODE_ENV || 'development') !== 'production',
};
