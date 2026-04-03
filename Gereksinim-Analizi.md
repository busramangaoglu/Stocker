# Gereksinim Analizi — Stocker Envanter Yönetim Sistemi

1. **Tüm Ürünleri Listeleme**
   - **API Metodu:** `GET /api/products`
   - **Açıklama:** Envanterde kayıtlı tüm ürünlerin stok bilgileriyle birlikte listelenmesini sağlar. Her ürün için ad, açıklama, mevcut stok miktarı, kategori, görsel ve kritik stok durumu bilgileri gösterilir. Kullanıcılar bu liste üzerinden ürün kartlarını görüntüleyebilir.

2. **Ürün Kataloğunu Görüntüleme**
   - **API Metodu:** `GET /api/products/catalog`
   - **Açıklama:** Sisteme eklenebilecek sabit ürün listesini getirir. Katalog; Ayran, Ekmek, Kola, Su gibi önceden tanımlanmış ürün adlarını, kategorilerini ve birim bilgilerini içerir. Yeni ürün eklenirken yalnızca bu listedeki adlar kullanılabilir.

3. **Tek Ürün Görüntüleme**
   - **API Metodu:** `GET /api/products/{id}`
   - **Açıklama:** Belirli bir ürünün tüm detay bilgilerini getirir. Ürün adı, açıklama, stok miktarı, minimum stok eşiği, kategori ve görsel URL bilgileri döndürülür. Ürün bulunamazsa 404 hatası döner.

4. **Yeni Ürün Oluşturma**
   - **API Metodu:** `POST /api/products`
   - **Açıklama:** Katalogdan seçilen bir ürün adıyla envantere yeni ürün kaydı oluşturur. Aynı isimde daha önce eklenmiş bir ürün varsa işlem reddedilir. Oluşturma sırasında başlangıç stok miktarı belirtilebilir; bu durumda otomatik olarak bir stok giriş hareketi de kaydedilir.

5. **Ürün Güncelleme**
   - **API Metodu:** `PUT /api/products/{id}`
   - **Açıklama:** Mevcut bir ürünün açıklama ve kategori bilgilerini günceller. Ürün adı ve stok miktarı bu işlemle değiştirilemez; stok yalnızca giriş/çıkış endpoint'leri aracılığıyla güncellenebilir. Ürün bulunamazsa 404 hatası döner.

6. **Ürün Silme**
   - **API Metodu:** `DELETE /api/products/{id}`
   - **Açıklama:** Seçilen ürünü ve bu ürüne ait tüm stok hareketlerini kalıcı olarak siler. Bu işlem geri alınamaz. Silme işlemi bir transaction içinde gerçekleştirilir; hareket silme başarısız olursa ürün de silinmez.

7. **Stoka Giriş**
   - **API Metodu:** `POST /api/stock/in`
   - **Açıklama:** Seçilen ürünün stok miktarını artırır ve bir IN (giriş) hareketi kaydeder. Girilecek miktar ve açıklama bilgisi istekle birlikte gönderilir. Tedarik, sipariş veya iade gibi durumlarda kullanılır. Ürün bulunamazsa 404 hatası döner.

8. **Stoktan Çıkış**
   - **API Metodu:** `POST /api/stock/out`
   - **Açıklama:** Seçilen ürünün stok miktarını azaltır ve bir OUT (çıkış) hareketi kaydeder. Mevcut stok, çıkış miktarından az ise işlem reddedilerek 400 hatası döner; stok hiçbir zaman eksi değere düşürülemez. Satış, kullanım veya fire gibi durumlarda kullanılır.

9. **Tüm Stok Hareketlerini Listeleme**
   - **API Metodu:** `GET /api/movements`
   - **Açıklama:** Tüm ürünlere ait stoka giriş ve stoktan çıkış hareketlerini zaman sırасıyla listeler. Limit, skip ve ürün ID'si ile sayfalama ve filtreleme yapılabilir. Her hareket için ürün adı, hareket tipi (IN/OUT), miktar, açıklama ve tarih bilgileri döndürülür.

10. **Son Hareketleri Getirme**
    - **API Metodu:** `GET /api/movements/recent`
    - **Açıklama:** En son gerçekleştirilen N adet stok hareketini getirir. Gösterge panelinde son işlemlerin hızlıca görüntülenmesi için kullanılır. Limit parametresiyle kaç hareket getirileceği belirlenebilir.

11. **Ürüne Göre Hareketleri Listeleme**
    - **API Metodu:** `GET /api/movements/product/{productId}`
    - **Açıklama:** Belirli bir ürüne ait tüm stok giriş ve çıkış hareketlerini listeler. Gösterge panelinde tek bir ürün seçildiğinde o ürünün tam hareket geçmişi bu endpoint aracılığıyla alınır. Limit ve skip parametreleriyle sayfalama desteklenir.

12. **Kritik Stok Raporu**
    - **API Metodu:** `GET /api/reports/critical`
    - **Açıklama:** Stok miktarı minimum stok eşiğinin altında olan veya eşit olan ürünleri listeler. Bu rapor sayesinde tükenmek üzere olan ürünler tespit edilerek zamanında tedarik yapılabilir. Arayüzde kırmızı uyarı olarak da gösterilir.

13. **Tüketim Raporu**
    - **API Metodu:** `GET /api/reports/consumption`
    - **Açıklama:** Belirli bir dönemde en çok stoktan çıkış yapılan ürünleri sıralar. Hangi ürünlerin daha hızlı tüketildiğini gösterir; sipariş ve planlama kararlarına yardımcı olur. Limit parametresiyle kaç ürünün listeleneceği belirlenebilir.

14. **Özet İstatistikler**
    - **API Metodu:** `GET /api/reports/summary`
    - **Açıklama:** Envanterin genel durumunu özetleyen istatistikleri döndürür. Toplam ürün sayısı, kritik stokta olan ürün sayısı ve tüm ürünlerin toplam stok miktarı tek istekle elde edilir. Gösterge panelindeki özet kartları bu verilerle doldurulur.

15. **Gösterge Paneli Verisi**
    - **API Metodu:** `GET /api/reports/dashboard`
    - **Açıklama:** Gösterge panelinin ihtiyaç duyduğu özet istatistikler ve son stok hareketlerini tek bir istekle döndürür. Sayfa yüklenirken birden fazla istek yerine tek bir çağrıyla tüm panel verileri alınabilir; böylece performans artırılır.
