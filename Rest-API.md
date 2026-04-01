# Stocker REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

**Canlı Swagger UI:** [stocker-vou5.vercel.app/api/docs](https://stocker-vou5.vercel.app/api/docs)

**Base URL:** `https://stocker-vou5.vercel.app`

---

## 1. Tüm Ürünleri Listele
- **Endpoint:** `GET /api/products`
- **Açıklama:** Envanterdeki tüm ürünleri stok bilgileriyle döndürür.
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "664abc123def456",
        "name": "Kola",
        "description": "Soğuk içecek",
        "stock_quantity": 25,
        "minimum_stock": 0,
        "unit": "adet",
        "category": "beverage",
        "image_display_url": "https://...",
        "is_critical": false,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

---

## 2. Ürün Kataloğunu Getir
- **Endpoint:** `GET /api/products/catalog`
- **Açıklama:** Envantere eklenebilecek sabit ürün listesini döndürür (Ayran, Ekmek, Kola, Su vb.).
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      { "name": "Ayran",  "category": "beverage", "unit": "adet" },
      { "name": "Ekmek",  "category": "food",     "unit": "adet" },
      { "name": "Kola",   "category": "beverage", "unit": "adet" }
    ]
  }
  ```

---

## 3. Tek Ürün Getir
- **Endpoint:** `GET /api/products/{id}`
- **Path Parameters:**
  - `id` (string, required) — Ürün MongoDB ObjectId'si
- **Response:** `200 OK` — Ürün bulundu
- **Hata:** `404 Not Found` — Ürün bulunamadı
  ```json
  { "success": false, "message": "Ürün bulunamadı" }
  ```

---

## 4. Yeni Ürün Oluştur
- **Endpoint:** `POST /api/products`
- **Açıklama:** Katalogdan seçilen bir isimle envantere yeni ürün ekler. Aynı isimde kayıt varsa hata döner.
- **Request Body:**
  ```json
  {
    "name": "Kola",
    "description": "Soğuk içecek",
    "stock_quantity": 50,
    "minimum_stock": 0,
    "unit": "adet",
    "category": "beverage"
  }
  ```
- **Response:** `201 Created` — Ürün başarıyla oluşturuldu
- **Hata:** `400 Bad Request` — Doğrulama hatası veya geçersiz ürün adı

---

## 5. Ürün Güncelle
- **Endpoint:** `PUT /api/products/{id}`
- **Path Parameters:**
  - `id` (string, required) — Ürün ObjectId'si
- **Açıklama:** Ürün açıklaması ve kategorisi güncellenebilir. `name` ve `stock_quantity` bu endpoint ile değiştirilemez.
- **Request Body:**
  ```json
  {
    "description": "Güncel açıklama",
    "category": "beverage"
  }
  ```
- **Response:** `200 OK` — Ürün başarıyla güncellendi
- **Hata:** `404 Not Found` — Ürün bulunamadı

---

## 6. Ürün Sil
- **Endpoint:** `DELETE /api/products/{id}`
- **Path Parameters:**
  - `id` (string, required) — Ürün ObjectId'si
- **Açıklama:** Ürünü ve ilgili tüm stok hareketlerini kalıcı olarak siler.
- **Response:** `200 OK`
  ```json
  { "success": true, "data": { "deleted": true, "_id": "664abc123def456" } }
  ```
- **Hata:** `404 Not Found` — Ürün bulunamadı

---

## 7. Stoka Giriş
- **Endpoint:** `POST /api/stock/in`
- **Açıklama:** Seçilen ürünün stok miktarını artırır ve bir IN hareketi kaydeder.
- **Request Body:**
  ```json
  {
    "product_id": "664abc123def456",
    "quantity": 10,
    "description": "Haftalık sipariş"
  }
  ```
- **Response:** `200 OK` — Stok güncellendi
- **Hata:** `404 Not Found` — Ürün bulunamadı

---

## 8. Stoktan Çıkış
- **Endpoint:** `POST /api/stock/out`
- **Açıklama:** Seçilen ürünün stok miktarını azaltır ve bir OUT hareketi kaydeder. Stok yetersizse hata döner.
- **Request Body:**
  ```json
  {
    "product_id": "664abc123def456",
    "quantity": 3,
    "description": "Satış"
  }
  ```
- **Response:** `200 OK` — Stok güncellendi
- **Hata:** `400 Bad Request` — Yetersiz stok
  ```json
  { "success": false, "message": "Yetersiz stok" }
  ```

---

## 9. Tüm Stok Hareketlerini Listele
- **Endpoint:** `GET /api/movements`
- **Query Parameters:**
  - `limit` (integer, opsiyonel, varsayılan: 50) — Sayfa başına kayıt
  - `skip` (integer, opsiyonel, varsayılan: 0) — Atlanacak kayıt
  - `product_id` (string, opsiyonel) — Belirli ürüne göre filtre
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "665xyz789",
        "product_id": "664abc123def456",
        "product_name": "Kola",
        "movement_type": "IN",
        "quantity": 10,
        "description": "Haftalık sipariş",
        "created_at": "2024-01-20T09:00:00Z"
      }
    ]
  }
  ```

---

## 10. Son Hareketleri Getir
- **Endpoint:** `GET /api/movements/recent`
- **Query Parameters:**
  - `limit` (integer, opsiyonel, varsayılan: 20) — Getirilecek hareket sayısı
- **Response:** `200 OK` — Son N stok hareketi

---

## 11. Ürüne Göre Hareketler
- **Endpoint:** `GET /api/movements/product/{productId}`
- **Path Parameters:**
  - `productId` (string, required) — Ürün ObjectId'si
- **Query Parameters:**
  - `limit` (integer, opsiyonel, max: 500)
  - `skip` (integer, opsiyonel)
- **Response:** `200 OK` — İlgili ürünün tüm hareketleri

---

## 12. Kritik Stok Raporu
- **Endpoint:** `GET /api/reports/critical`
- **Açıklama:** Stoğu minimum eşiğin altında veya eşit olan ürünleri listeler.
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      { "name": "Ayran", "stock_quantity": 0, "minimum_stock": 0, "is_critical": true }
    ]
  }
  ```

---

## 13. Tüketim Raporu
- **Endpoint:** `GET /api/reports/consumption`
- **Query Parameters:**
  - `limit` (integer, opsiyonel, varsayılan: 5) — Kaç ürün gösterilsin
- **Açıklama:** En çok stoktan çıkış yapılan ürünleri döndürür.
- **Response:** `200 OK`

---

## 14. Özet İstatistikler
- **Endpoint:** `GET /api/reports/summary`
- **Açıklama:** Toplam ürün sayısı, kritik ürün sayısı ve toplam stok miktarı.
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "totalProducts": 5,
      "criticalProducts": 2,
      "totalStock": 183
    }
  }
  ```

---

## 15. Gösterge Paneli Verisi
- **Endpoint:** `GET /api/reports/dashboard`
- **Açıklama:** Gösterge paneli için özet istatistikler ve son hareketleri tek istekle döndürür.
- **Response:** `200 OK`
