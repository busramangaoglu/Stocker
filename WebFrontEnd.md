# Web Front-End — Stocker

Canlı site: [stocker-olive.vercel.app](https://stocker-olive.vercel.app)

---

## Teknoloji Yığını

| Araç | Versiyon | Kullanım Amacı |
|------|----------|----------------|
| React | 18 | UI bileşenleri |
| Vite | 5 | Build aracı ve geliştirme sunucusu |
| React Router v6 | 6 | Sayfa yönlendirme (SPA) |
| Vanilla CSS | — | Stil (global.css) |

---

## Kurulum

```bash
cd stoker/frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ klasörüne üretim build'i
```

---

## Klasör Yapısı

```
frontend/
├── src/
│   ├── assets/          # Logo ve statik görseller
│   ├── components/      # Ortak bileşenler (Modal, ConfirmModal, TopNav)
│   ├── lib/             # Yardımcı fonksiyonlar (api.js, imageUrl.js, ...)
│   ├── pages/           # Sayfa bileşenleri
│   │   ├── ProductsPage.jsx       # Ana sayfa — ürün listesi ve yönetimi
│   │   ├── DashboardPage.jsx      # Gösterge paneli ve grafik
│   │   ├── StockMovementsPage.jsx # Stok hareket geçmişi
│   │   └── ReportsPage.jsx        # Kritik eşik ayarı ve raporlar
│   ├── styles/
│   │   └── global.css   # Tüm stil tanımları
│   ├── App.jsx           # Route tanımları
│   └── main.jsx          # React uygulaması giriş noktası
├── index.html
├── vite.config.js
└── vercel.json           # Vercel SPA yönlendirmesi
```

---

## Sayfalar

### Ürünler (`/`)
- Ürün kartları grid görünümü
- Stoka giriş / stoktan çıkış butonları
- Ürün ekleme, düzenleme ve silme
- İsim/açıklama arama, kategori filtresi
- Kritik stok filtresi ve uyarı bandı

### Gösterge Paneli (`/dashboard`)
- Toplam ürün, kritik ürün, toplam stok özeti
- Ürüne göre filtrelenebilir stok hareket grafiği

### Stok Hareketleri (`/stock-movements`)
- Tüm giriş/çıkış hareketlerinin zaman sırası ile listesi
- Renk kodlaması: yeşil giriş, kırmızı çıkış

### Kritik Eşik / Raporlar (`/reports`)
- Global kritik eşik değerini ayarlama (localStorage)
- Kritik stok altındaki ürünler listesi
- Tüketim raporu

---

## API Bağlantısı

`src/lib/api.js` — tüm API çağrıları bu dosyada merkezi olarak yönetilir.

```js
// Geliştirme: Vite proxy → localhost:3000
// Üretim:    VITE_API_BASE_URL env değişkeni
```

**Vercel'de gerekli Environment Variable:**

| Değişken | Değer |
|----------|-------|
| `VITE_API_BASE_URL` | `https://stocker-vou5.vercel.app` |

---

## Vercel Deploy

`frontend/vercel.json` dosyası SPA yönlendirmesini sağlar — tüm istekler `index.html`'e yönlendirilir:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
