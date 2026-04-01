const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

/** Bazı ağlarda IPv6 kaynaklı Atlas sorunlarını azaltır (Node 17+) */
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  const opts = {
    serverSelectionTimeoutMS: 15_000,
    maxPoolSize: 10,
    family: 4,
  };

  try {
    await mongoose.connect(env.mongoUri, opts);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' && err.syscall === 'querySrv') {
      // eslint-disable-next-line no-console
      console.error(`
[MongoDB] SRV DNS sorgusu reddedildi (${err.hostname || 'Atlas'}).
  • İnternet / VPN / kurumsal güvenlik duvarı DNS’i engelliyor olabilir.
  • Atlas → Cluster → Connect → bağlantı dizesinde "mongodb+srv" yerine
    "mongodb://..." ile başlayan standart (direct) URI’yi kopyalayıp .env içindeki MONGODB_URI olarak deneyin.
  • Veya yerel MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/inventory_db
`);
    } else if (
      err.name === 'MongoServerSelectionError' ||
      err.name === 'MongooseServerSelectionError' ||
      err.name === 'MongoNetworkError'
    ) {
      // eslint-disable-next-line no-console
      console.error(`
[MongoDB] Atlas’a bağlanılamıyor (sunucu seçilemedi).
  • Atlas → Network Access: IP adresiniz izin listesinde olsun (geliştirme için geçici 0.0.0.0/0).
  • Database Access: kullanıcı adı / şifre .env içindeki MONGODB_URI ile aynı olsun.
`);
    }
    throw err;
  }

  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  mongoose,
};
