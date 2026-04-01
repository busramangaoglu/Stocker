# Gereksinim Analizi — Stocker Envanter Yönetim Sistemi

---

## 1. Proje Genel Bakış

Stocker, işletmelerin ürün stoklarını dijital ortamda takip etmesini sağlayan web tabanlı bir envanter yönetim sistemidir. Kullanıcılar ürün ekleyebilir, stok giriş/çıkış işlemi yapabilir ve raporlar aracılığıyla stok durumunu anlık olarak izleyebilir.

---

## 2. Fonksiyonel Gereksinimler

### 2.1 Ürün Yönetimi
- **GRN-001:** Sistem, sabit bir ürün kataloğu sunmalıdır (Ayran, Ekmek, Kola, Su vb.).
- **GRN-002:** Kullanıcı katalogdan seçerek envantere yeni ürün ekleyebilmelidir.
- **GRN-003:** Aynı isimde ikinci bir ürün kaydı açılamamalıdır.
- **GRN-004:** Kullanıcı mevcut ürünün açıklama ve kategori bilgisini güncelleyebilmelidir.
- **GRN-005:** Kullanıcı ürünü ve ilgili stok hareketlerini silebilmelidir.
- **GRN-006:** Her ürün için görsel (resim) atanmalı; görsel yoksa baş harf avatarı gösterilmelidir.

### 2.2 Stok Hareketleri
- **GRN-007:** Kullanıcı ürüne stoka giriş (IN) işlemi yapabilmelidir.
- **GRN-008:** Kullanıcı üründen stoktan çıkış (OUT) işlemi yapabilmelidir.
- **GRN-009:** Her işlemde miktar ve açıklama girilebilmelidir.
- **GRN-010:** Stok miktarı hiçbir zaman 0'ın altına düşürülememeli (sunucu kuralı).
- **GRN-011:** Tüm giriş/çıkış hareketleri tarih sırasıyla listelenebilmelidir.

### 2.3 Kritik Stok Uyarısı
- **GRN-012:** Kullanıcı global bir kritik stok eşiği belirleyebilmelidir.
- **GRN-013:** Stoğu eşik değerinin altında veya eşit olan ürün kartları kırmızıyla vurgulanmalıdır.
- **GRN-014:** Kritik ürünlerin listesi sayfa üstünde uyarı olarak gösterilmelidir.
- **GRN-015:** Eşik değeri tarayıcıda (localStorage) saklanmalıdır.

### 2.4 Raporlar ve Gösterge Paneli
- **GRN-016:** Gösterge paneli toplam ürün sayısı, kritik ürün sayısı ve toplam stok özetini göstermelidir.
- **GRN-017:** Son stok hareketleri grafik üzerinde görselleştirilmelidir.
- **GRN-018:** Kritik stok raporu, eşik altındaki ürünleri listeleyerek dışarı aktarılabilir olmalıdır.
- **GRN-019:** Tüketim raporu en çok çıkış yapılan ürünleri göstermelidir.

### 2.5 Arama ve Filtreleme
- **GRN-020:** Ürünler isim veya açıklamaya göre aranabilmelidir.
- **GRN-021:** Ürünler kategoriye (Yiyecek / İçecek) göre filtrelenebilmelidir.
- **GRN-022:** Yalnızca kritik stoktaki ürünler filtresiyle gösterilebilmelidir.

---

## 3. Fonksiyonel Olmayan Gereksinimler

| ID | Gereksinim | Açıklama |
|----|-----------|----------|
| NFR-001 | Performans | API yanıt süresi 2 saniyenin altında olmalıdır. |
| NFR-002 | Güvenilirlik | Servis %99 uptime ile çalışmalıdır. |
| NFR-003 | Güvenlik | API, geçersiz girdilere karşı Joi şema doğrulaması uygulamalıdır. |
| NFR-004 | Ölçeklenebilirlik | Serverless mimarisi ile Vercel üzerinde konuşlandırılabilmelidir. |
| NFR-005 | Erişilebilirlik | Arayüz mobil cihazlarda da kullanılabilir olmalıdır. |
| NFR-006 | Dokümantasyon | Tüm API endpoint'leri Swagger UI ile belgelenmelidir. |

---

## 4. Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|---------|
| Kullanıcı | Ürün ekleme, düzenleme, silme; stok giriş/çıkış; raporlar görüntüleme |

> Mevcut sürümde kimlik doğrulama (auth) bulunmamaktadır; tüm kullanıcılar tam yetkilidir.

---

## 5. Kısıtlamalar

- Ürün adları sabit katalogla sınırlıdır; serbest isim girilemez.
- Stok miktarı yalnızca giriş/çıkış endpoint'leri aracılığıyla değiştirilebilir.
- Görseller yalnızca katalogda tanımlı URL'lerden veya önceki kayıtlardan devralınır.
