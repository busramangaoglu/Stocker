/**
 * Çalışma anında swagger-jsdoc / ref-parser kullanılmaz (Node DEP0169 uyarısı önlenir).
 * API değişince bu dosyayı güncelleyin.
 */
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Stok / Depo Yönetim API',
    version: '1.0.0',
    description:
      'Ürün, stok giriş-çıkış, hareket geçmişi ve raporlar — Node.js, Express, MongoDB.',
  },
  servers: [{ url: '/', description: 'Varsayılan' }],
  tags: [
    { name: 'Products', description: 'Ürün CRUD' },
    { name: 'Stock', description: 'Stok giriş ve çıkış' },
    { name: 'Movements', description: 'Stok hareket geçmişi' },
    { name: 'Reports', description: 'Raporlar ve özet' },
  ],
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          stock_quantity: { type: 'integer' },
          minimum_stock: { type: 'integer' },
          unit: { type: 'string' },
          is_critical: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      StockMovement: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          product_id: { type: 'string' },
          movement_type: { type: 'string', enum: ['IN', 'OUT'] },
          quantity: { type: 'integer' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {},
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/api/products': {
      get: {
        summary: 'Tüm ürünleri listele',
        tags: ['Products'],
        responses: { 200: { description: 'Liste', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } } },
      },
      post: {
        summary: 'Yeni ürün oluştur',
        tags: ['Products'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  stock_quantity: { type: 'integer', minimum: 0 },
                  minimum_stock: { type: 'integer', minimum: 0 },
                  unit: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Oluşturuldu' } },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Tek ürün getir',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Bulunamadı' } },
      },
      put: {
        summary: 'Ürün güncelle (stok_quantity yok)',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  minimum_stock: { type: 'integer' },
                  unit: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 404: { description: 'Bulunamadı' } },
      },
      delete: {
        summary: 'Ürün sil',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Silindi' }, 404: { description: 'Bulunamadı' } },
      },
    },
    '/api/stock/in': {
      post: {
        summary: 'Stok girişi',
        tags: ['Stock'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['product_id', 'quantity'],
                properties: {
                  product_id: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 404: { description: 'Ürün yok' } },
      },
    },
    '/api/stock/out': {
      post: {
        summary: 'Stok çıkışı',
        tags: ['Stock'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['product_id', 'quantity'],
                properties: {
                  product_id: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Yetersiz stok' }, 404: { description: 'Ürün yok' } },
      },
    },
    '/api/movements': {
      get: {
        summary: 'Hareketleri listele',
        tags: ['Movements'],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'skip', in: 'query', schema: { type: 'integer' } },
          { name: 'product_id', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/movements/recent': {
      get: {
        summary: 'Son hareketler',
        tags: ['Movements'],
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/movements/product/{productId}': {
      get: {
        summary: 'Ürüne göre hareketler',
        tags: ['Movements'],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/reports/critical': {
      get: {
        summary: 'Kritik stoktaki ürünler',
        tags: ['Reports'],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/reports/consumption': {
      get: {
        summary: 'En çok çıkış yapılan ürünler',
        tags: ['Reports'],
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/reports/summary': {
      get: {
        summary: 'Toplam stok özeti',
        tags: ['Reports'],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/reports/dashboard': {
      get: {
        summary: 'Dashboard verisi',
        tags: ['Reports'],
        responses: { 200: { description: 'OK' } },
      },
    },
  },
};

module.exports = { openApiSpec };
