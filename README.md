# Stocker — Envanter Yönetim Sistemi

---

## Proje Hakkında

**Proje Tanımı:**
Stocker, küçük ve orta ölçekli işletmeler için geliştirilmiş web tabanlı bir envanter (stok) yönetim sistemidir. Sabit bir ürün kataloğundan ürün eklenebilir; stoka giriş / stoktan çıkış işlemleri kaydedilir ve tüm hareketler geçmişiyle izlenebilir. Kritik stok eşiği aşıldığında görsel uyarılar gösterilir; özet raporlar ve grafik destekli gösterge paneli ile stok durumu anlık olarak takip edilebilir.

**Proje Kategorisi:** Stok / Envanter Yönetimi

**Referans Uygulama:** [Stocker Canlı Demo](https://stocker-olive.vercel.app)

---

## Proje Linkleri

- **Web Frontend:** [stocker-olive.vercel.app](https://stocker-olive.vercel.app)
- **REST API (Backend):** [stocker-vou5.vercel.app](https://stocker-vou5.vercel.app)
- **Swagger API Dokümantasyonu:** [stocker-vou5.vercel.app/api/docs](https://stocker-vou5.vercel.app/api/docs)

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite 5, React Router v6 |
| Backend | Node.js, Express, Mongoose |
| Veritabanı | MongoDB Atlas |
| Deploy | Vercel (frontend + backend ayrı projeler) |
| API Dokümantasyonu | Swagger UI (OpenAPI 3.0) |

---

## Proje Ekibi

**Grup Adı:** Stocker

**Ekip Üyeleri:**
- Büşra Mangaoğlu

---

## Özellikler

- Sabit ürün kataloğundan ürün ekleme (Ayran, Ekmek, Kola, Su vb.)
- Stoka giriş / stoktan çıkış ve hareket geçmişi
- Global kritik stok eşiği — eşik altı ürünler kırmızı ile vurgulanır
- Ürün görselleri (Wikimedia, Hürriyet CDN — backend proxy üzerinden)
- Gösterge paneli: özet istatistikler ve stok hareket grafiği
- Raporlar: kritik stok listesi, tüketim raporu
- Tam REST API + Swagger UI dokümantasyonu
- Mobil uyumlu arayüz

---

## Dokümantasyon

1. [Gereksinim Analizi](Gereksinim-Analizi.md)
2. [REST API Tasarımı](API-Tasarimi.md)
3. [REST API](Rest-API.md)
4. [Web Front-End](WebFrontEnd.md)
5. [Mobil Front-End](MobilFrontEnd.md)
6. [Mobil Backend](MobilBackEnd.md)
7. [Video Sunum](Sunum.md)

---

## Yerel Geliştirme Ortamı

### Gereksinimler
- Node.js 18+
- MongoDB (yerel veya Atlas)

### Backend'i Başlatma

```bash
cd stoker
cp .env.example .env   # .env içine MONGODB_URI yaz
npm install
npm run dev
```

Backend `http://localhost:3000` adresinde çalışır.
Swagger UI: `http://localhost:3000/api/docs`

### Frontend'i Başlatma

```bash
cd stoker/frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışır. Vite proxy sayesinde API istekleri otomatik `localhost:3000`'e yönlendirilir.

---

## Vercel Deploy Ayarları

### Frontend (stocker-olive)

| Ayar | Değer |
|------|-------|
| Root Directory | `stoker/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment Variables:**

| Değişken | Değer |
|----------|-------|
| `VITE_API_BASE_URL` | `https://stocker-vou5.vercel.app` |

### Backend (stocker-vou5)

| Ayar | Değer |
|------|-------|
| Root Directory | `stoker/backend` |
| Build Command | — |
| Output Directory | — |

**Environment Variables:**

| Değişken | Açıklama |
|----------|----------|
| `MONGODB_URI` | MongoDB Atlas bağlantı dizesi |
| `CORS_ORIGINS` | İzinli frontend adresi (ör. `https://stocker-olive.vercel.app`) |
| `NODE_ENV` | `production` |

> **Not:** MongoDB Atlas → Network Access kısmında `0.0.0.0/0` IP izni tanımlı olmalıdır (Vercel sabit IP kullanmaz).

---

## API Endpoint Özeti

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/products` | Tüm ürünleri listele |
| GET | `/api/products/catalog` | Eklenebilir ürün kataloğu |
| POST | `/api/products` | Yeni ürün oluştur |
| PUT | `/api/products/:id` | Ürün güncelle |
| DELETE | `/api/products/:id` | Ürün sil |
| POST | `/api/stock/in` | Stoka giriş |
| POST | `/api/stock/out` | Stoktan çıkış |
| GET | `/api/movements` | Stok hareketleri |
| GET | `/api/reports/critical` | Kritik stok raporu |
| GET | `/api/reports/dashboard` | Gösterge paneli özeti |

Tam dokümantasyon: [Swagger UI](https://stocker-vou5.vercel.app/api/docs)
