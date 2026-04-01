#!/usr/bin/env node
/**
 * MongoDB bağlantısını adım adım test eder (.env → DNS → Mongoose).
 * Parolayı konsola yazdırmaz.
 */
const path = require('path');
const dns = require('dns').promises;
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const uri = (process.env.MONGODB_URI || '').trim();

function maskUri(u) {
  if (!u) return '(boş)';
  try {
    return u.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
  } catch {
    return '(gizlendi)';
  }
}

function srvHostFromUri(u) {
  if (!u.startsWith('mongodb+srv://')) return null;
  const m = u.match(/@[^/]+/);
  if (!m) return null;
  return m[0].slice(1).split('?')[0];
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('=== Stoker — MongoDB teşhisi ===\n');

  // Adım 1
  // eslint-disable-next-line no-console
  console.log('Adım 1 — .env içinde MONGODB_URI');
  if (!uri) {
    // eslint-disable-next-line no-console
    console.log('  ✖ Tanımsız veya boş.');
    // eslint-disable-next-line no-console
    console.log('  → Kök dizinde .env oluşturun: MONGODB_URI=...');
    // eslint-disable-next-line no-console
    console.log('  → Yerel MongoDB: mongodb://127.0.0.1:27017/inventory_db');
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log('  ✓ Tanımlı:', maskUri(uri));

  // Adım 2
  // eslint-disable-next-line no-console
  console.log('\nAdım 2 — Bağlantı türü');
  if (uri.startsWith('mongodb+srv://')) {
    // eslint-disable-next-line no-console
    console.log('  → MongoDB Atlas (SRV). Host:', srvHostFromUri(uri));
  } else if (uri.startsWith('mongodb://')) {
    // eslint-disable-next-line no-console
    console.log('  → Standart mongodb:// (yerel veya Atlas “direct” host listesi).');
  } else {
    // eslint-disable-next-line no-console
    console.log('  ! Beklenmeyen önek; mongodb:// veya mongodb+srv:// olmalı.');
  }

  // Adım 3 — SRV DNS
  const srvHost = srvHostFromUri(uri);
  if (srvHost) {
    const name = `_mongodb._tcp.${srvHost}`;
    // eslint-disable-next-line no-console
    console.log('\nAdım 3 — SRV DNS sorgusu');
    // eslint-disable-next-line no-console
    console.log('  Sorgu:', name);
    try {
      const records = await dns.resolveSrv(name);
      // eslint-disable-next-line no-console
      console.log('  ✓ SRV yanıtı alındı,', records.length, 'kayıt.');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('  ✖ DNS hatası:', e.code || e.name, '-', e.message);
      // eslint-disable-next-line no-console
      console.log('  → İnternet / VPN / kurumsal DNS engeli olabilir.');
      // eslint-disable-next-line no-console
      console.log('  → Atlas’ta “mongodb://host1:27017,...” standart bağlantı dizesini deneyin.');
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('\nAdım 3 — SRV atlandı (mongodb+srv değil).');
  }

  // Adım 4 — Gerçek bağlantı
  // eslint-disable-next-line no-console
  console.log('\nAdım 4 — Mongoose bağlantısı (en fazla 20 sn)…');
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20_000,
      maxPoolSize: 5,
      family: 4,
    });
    // eslint-disable-next-line no-console
    console.log('  ✓ Bağlantı başarılı.');
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('\n=== Özet: MongoDB’ye erişim OK. Sunucuyu normal npm run dev ile çalıştırabilirsiniz. ===\n');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('  ✖ Bağlantı reddedildi / zaman aşımı.');
    // eslint-disable-next-line no-console
    console.log('  Tür:', e.name);
    // eslint-disable-next-line no-console
    console.log('  Mesaj:', e.message);

    const msg = String(e.message || '');

    // eslint-disable-next-line no-console
    console.log('\n--- Ne yapmalı? ---');
    if (msg.includes('whitelist') || msg.includes('IP')) {
      // eslint-disable-next-line no-console
      console.log('  • Atlas → Network Access → IP adresinizi ekleyin (Add Current IP veya geçici 0.0.0.0/0).');
    }
    if (msg.includes('authentication') || msg.includes('bad auth')) {
      // eslint-disable-next-line no-console
      console.log('  • Atlas → Database Access: kullanıcı adı / şifre doğru mu?');
      // eslint-disable-next-line no-console
      console.log('  • Şifrede @ : # gibi karakter varsa URI’de URL-encode edin veya yeni şifre oluşturun.');
    }
    if (msg.includes('ECONNREFUSED') && uri.includes('127.0.0.1')) {
      // eslint-disable-next-line no-console
      console.log('  • Yerel MongoDB çalışmıyor olabilir: brew services start mongodb-community veya mongod.');
    }
    if (msg.includes('Server selection timed out') || msg.includes('Could not connect')) {
      // eslint-disable-next-line no-console
      console.log('  • Ağ / firewall / Atlas IP listesi / cluster’ın uyku modunda olmaması.');
    }

    // eslint-disable-next-line no-console
    console.log('\n=== Özet: Adım 4 başarısız. Yukarıdaki maddeleri sırayla kontrol edin. ===\n');
    process.exit(1);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
