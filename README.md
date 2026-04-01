# Stok / Depo Yönetim Sistemi — Backend

Node.js, Express.js ve MongoDB (Mongoose) ile geliştirilmiş katmanlı mimaride (Router → Service → Repository) stok yönetim API’si.

## Gereksinimler
- Node.js 18+
- MongoDB (Atlas veya yerel)

## Kurulum
```bash
cd stoker
npm install
cp .env.example .env
# .env içinde MONGODB_URI değerini düzenleyin
npm run dev
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI (YAML): `stoker.yml` — Postman / harici araçlarla import için

## Ana uç noktalar

| Alan | Metot | Yol |
|------|--------|-----|
| Ürünler | CRUD | `/api/products` |
| Stok giriş | POST | `/api/stock/in` |
| Stok çıkış | POST | `/api/stock/out` |
| Hareketler | GET | `/api/movements`, `/api/movements/recent`, `/api/movements/product/:productId` |
| Raporlar | GET | `/api/reports/critical`, `/consumption`, `/summary`, `/dashboard` |

Stok miktarı doğrudan ürün güncelleme ile değişmez; yalnızca stok giriş/çıkış uçları ve (isteğe bağlı) başlangıç stoğu ile ürün oluşturma akışı günceller.

## Testler

```bash
npm test
```

## Örnek veri (seed)

Sunucu çalışırken değil, ayrı bir terminalde (`.env` dolu olmalı):

```bash
npm run seed
```

`products` ve `stock_movements` içindeki **tüm kayıtları siler**, ardından örnek ürünler ve stok hareketleri ekler. Üretim veritabanında kullanmayın.

## Postman

- Koleksiyon dosyası: `postman/stoker-inventory.postman_collection.json` — Postman’da **Import** ile ekleyin.
- Koleksiyon değişkeni `baseUrl` (varsayılan `http://localhost:3000`).
- **Ürün oluştur** (POST) başarılı olunca `productId` otomatik dolar; stok istekleri için elle kopyalamak zorunda değilsiniz.
- **Liste:** `GET /api/products` bağlı olduğunuz MongoDB’deki **tüm** ürünleri döner. Compass’ta gördüğünüz verilerle aynı veritabanını görmek için `MONGODB_URI`’nin doğru olduğundan emin olun.

## Swagger / Compass

- Swagger UI: `GET /api/docs` — çalışma anı tanım `app/config/openapi.js` içindedir.
- Dışa aktarım: kökteki `stoker.yml` ile aynı API; güncellerken `openapi.js` ve `stoker.yml` dosyalarını birlikte tutun.
- MongoDB Compass ile `MONGODB_URI` veritabanına bağlanarak `products` ve `stock_movements` koleksiyonlarını inceleyebilirsiniz.
