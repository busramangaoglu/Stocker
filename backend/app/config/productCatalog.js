/**
 * Yalnızca bu listedeki ürün adlarıyla POST /api/products kabul edilir.
 * Arayüz GET /api/products/catalog ile aynı listeyi alır.
 *
 * default_image_url: Ürün kaydında image_url yokken kartta gösterilir (HTTPS).
 * Kaynak: Wikimedia Commons (ücretsiz içerik). Proxy: GET /api/public-image?u=...
 */
const PRODUCT_CATALOG = [
  {
    name: 'Ayran',
    category: 'beverage',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://upload.wikimedia.org/wikipedia/commons/4/45/Some_ayran_in_copper_cups.jpg',
  },
  {
    name: 'Ekmek',
    category: 'food',
    unit: 'adet',
    description: '',
    default_image_url: 'https://image.hurimg.com/i/hurriyet/90/0x0/6956400da576256bb5920261.jpg',
  },
  {
    name: 'Fanta',
    category: 'beverage',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV9liDQUzV7J9lgD8bbcfpvy0KfaYmG3ZIeA&s',
  },
  {
    name: 'Kola',
    category: 'beverage',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://upload.wikimedia.org/wikipedia/commons/c/c2/Coca-Cola.jpg',
  },
  {
    name: 'Kruvasan',
    category: 'food',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://upload.wikimedia.org/wikipedia/commons/2/2a/Croissant-Petr_Kratochvil.jpg',
  },
  {
    name: 'Kurabiye',
    category: 'food',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://www.bettycrocker.com/-/media/GMI/Core-Sites/BC/Images/Shared/myaccount/footer-acq-landing-page-2025/09-2025_EmailSignUp_Cookies.jpg?sc_lang=en',
  },
  {
    name: 'Poğaça',
    category: 'food',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4jhWma4LL8pJ_DHdz3KoFLUBQzT1ZThzVRw&s',
  },
  {
    name: 'Soğuk Çay',
    category: 'beverage',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://upload.wikimedia.org/wikipedia/commons/e/e7/Iced_Tea.jpg',
  },
  {
    name: 'Sprite',
    category: 'beverage',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://upload.wikimedia.org/wikipedia/commons/b/b9/Sprite_Logo.svg',
  },
  {
    name: 'Su',
    category: 'beverage',
    unit: 'adet',
    description: '',
    default_image_url:
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Bottled_water.jpg',
  },
];

/** Katalog dışı / eksik satır için son çare: kategoriye göre genel görsel */
const CATEGORY_DEFAULT_IMAGE_URL = {
  food: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Croissant-Petr_Kratochvil.jpg',
  beverage: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Bottled_water.jpg',
};

const ALLOWED_PRODUCT_NAMES = PRODUCT_CATALOG.map((p) => p.name);

/**
 * Eski/bozuk URL'ler (404 veya taşınmış Wikimedia dosyaları).
 * Bu adreslerden biri DB'de bulunursa katalogdaki güncel URL ile değiştirilir.
 */
const STALE_DEFAULT_IMAGE_URLS = new Set([
  // Eski Ayran (404)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ayran_in_an_earthenware_cup.jpg/640px-Ayran_in_an_earthenware_cup.jpg',
  // Eski Fanta (thumb + yanlış görsel)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Fanta_2017.jpg/640px-Fanta_2017.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/da/Fanta.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/Fanta_Orange.jpg',
  // Eski Kola (404)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Coca-Cola_can_and_glass.jpg/640px-Coca-Cola_can_and_glass.jpg',
  // Eski Kruvasan (404 thumb, farklı hash)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Croissant-Petr_Kratochvil.jpg/640px-Croissant-Petr_Kratochvil.jpg',
  // Eski Kurabiye
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chocolate_chip_cookie.jpg/640px-Chocolate_chip_cookie.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/ab/Chocolate_chip_cookie.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/26/Turkish_cookies.jpg',
  // Eski Poğaça
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/B%C3%B6rek.jpg/640px-B%C3%B6rek.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/7/7d/Borek.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/06/Po%C4%9Fa%C3%A7a_bread.jpg',
  // Eski Soğuk Çay (404)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Lipton_Ice_Tea_lemon.jpg/640px-Lipton_Ice_Tea_lemon.jpg',
  // Eski Sprite (404)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sprite_can_edited.png/320px-Sprite_can_edited.png',
  // Eski Su (404)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Plastic_water_bottle.jpg/640px-Plastic_water_bottle.jpg',
  // Eski kategori varsayılanları (thumb, 429)
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Bread_loaves.jpg/640px-Bread_loaves.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Assorted_soft_drinks.jpg/640px-Assorted_soft_drinks.jpg',
]);

function findCatalogEntry(name) {
  const n = (name || '').trim().toLowerCase();
  return PRODUCT_CATALOG.find((p) => p.name.toLowerCase() === n);
}

module.exports = {
  PRODUCT_CATALOG,
  ALLOWED_PRODUCT_NAMES,
  CATEGORY_DEFAULT_IMAGE_URL,
  STALE_DEFAULT_IMAGE_URLS,
  findCatalogEntry,
};
