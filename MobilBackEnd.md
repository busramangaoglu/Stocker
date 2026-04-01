# Mobil Backend — Stocker

> Bu projede ayrı bir mobil backend geliştirilmemiştir.
> Web ve mobil istemciler aynı REST API'yi kullanır.

---

## Mevcut Backend

| Özellik | Detay |
|---------|-------|
| URL | `https://stocker-vou5.vercel.app` |
| Mimari | Serverless (Vercel) |
| Framework | Node.js + Express |
| Veritabanı | MongoDB Atlas |
| API Formatı | REST / JSON |
| Dokümantasyon | Swagger UI — `/api/docs` |

---

## Mobil İstemci Entegrasyonu

Mobil uygulama (gelecekte) aşağıdaki endpoint'leri doğrudan kullanabilir:

```
GET    https://stocker-vou5.vercel.app/api/products
POST   https://stocker-vou5.vercel.app/api/products
POST   https://stocker-vou5.vercel.app/api/stock/in
POST   https://stocker-vou5.vercel.app/api/stock/out
GET    https://stocker-vou5.vercel.app/api/movements
GET    https://stocker-vou5.vercel.app/api/reports/dashboard
```

Tam endpoint listesi: [Swagger UI](https://stocker-vou5.vercel.app/api/docs)

---

## CORS Ayarı

Backend'e `CORS_ORIGINS` environment variable eklenerek mobil uygulama origin'i izin listesine alınabilir.
