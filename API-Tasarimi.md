# API Tasarımı - OpenAPI Specification

**OpenAPI Spesifikasyon Dosyası:** [stoker.yml](backend/stoker.yml)

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış Stocker Envanter Yönetim API tasarımını içermektedir.

Canlı Swagger UI: [stocker-vou5.vercel.app/api/docs](https://stocker-vou5.vercel.app/api/docs)

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Stok / Depo Yönetim API
  description: |
    Ürün CRUD, stok giriş/çıkış, hareket geçmişi, kritik stok ve raporlar.
    Node.js, Express, MongoDB (Mongoose).

    Stok miktarı PUT ile değişmez; stok giriş/çıkış veya ürün oluştururken
    başlangıç stoğu kullanılır.

    Ürün yanıtında `image_url` veritabanında saklanan ham adrestir;
    `image_display_url` kartta kullanılacak çözülmüş adrestir.
  version: 1.0.0

servers:
  - url: https://stocker-vou5.vercel.app
    description: Production server
  - url: http://localhost:3000
    description: Development server

tags:
  - name: Products
    description: Ürün CRUD işlemleri
  - name: Stock
    description: Stok giriş ve çıkış
  - name: Movements
    description: Stok hareket geçmişi
  - name: Reports
    description: Raporlar ve özet

paths:
  /api/products:
    get:
      tags: [Products]
      summary: Tüm ürünleri listele
      responses:
        '200':
          description: Ürün listesi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiSuccess'
    post:
      tags: [Products]
      summary: Yeni ürün oluştur
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name]
              properties:
                name:
                  type: string
                  description: GET /api/products/catalog listesindeki adlardan biri olmalı
                  example: Kola
                description:
                  type: string
                  example: Soğuk içecek
                stock_quantity:
                  type: integer
                  minimum: 0
                  example: 50
                minimum_stock:
                  type: integer
                  minimum: 0
                  example: 0
                unit:
                  type: string
                  example: adet
                category:
                  type: string
                  enum: [food, beverage]
                  example: beverage
            examples:
              example1:
                summary: Kola ürünü oluştur
                value:
                  name: Kola
                  description: Soğuk içecek
                  stock_quantity: 50
                  unit: adet
                  category: beverage
      responses:
        '201':
          description: Ürün başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiSuccess'
        '400':
          $ref: '#/components/responses/BadRequest'

  /api/products/catalog:
    get:
      tags: [Products]
      summary: Eklenebilir ürün kataloğu
      description: POST ile oluşturulabilecek ürün adları, kategori ve birim şablonları (sabit liste).
      responses:
        '200':
          description: Katalog dizisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiSuccess'

  /api/products/{id}:
    get:
      tags: [Products]
      summary: Tek ürün getir
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
          description: MongoDB ObjectId
      responses:
        '200':
          description: Ürün bulundu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiSuccess'
        '404':
          $ref: '#/components/responses/NotFound'
    put:
      tags: [Products]
      summary: Ürün güncelle
      description: stock_quantity doğrudan değiştirilemez; stok giriş/çıkış kullanın.
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                description:
                  type: string
                minimum_stock:
                  type: integer
                unit:
                  type: string
                category:
                  type: string
                  enum: [food, beverage]
                image_url:
                  type: string
      responses:
        '200':
          description: Güncellendi
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
    delete:
      tags: [Products]
      summary: Ürün sil
      description: Ürünü ve tüm stok hareketlerini kalıcı olarak siler.
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Silindi
        '404':
          $ref: '#/components/responses/NotFound'

  /api/stock/in:
    post:
      tags: [Stock]
      summary: Stoka giriş
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [product_id, quantity]
              properties:
                product_id:
                  type: string
                  example: "664abc123def456"
                quantity:
                  type: integer
                  minimum: 1
                  example: 10
                description:
                  type: string
                  example: Haftalık sipariş
      responses:
        '200':
          description: Stok güncellendi
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'

  /api/stock/out:
    post:
      tags: [Stock]
      summary: Stoktan çıkış
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [product_id, quantity]
              properties:
                product_id:
                  type: string
                  example: "664abc123def456"
                quantity:
                  type: integer
                  minimum: 1
                  example: 3
                description:
                  type: string
                  example: Satış
      responses:
        '200':
          description: Stok güncellendi
        '400':
          description: Yetersiz stok
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
        '404':
          $ref: '#/components/responses/NotFound'

  /api/movements:
    get:
      tags: [Movements]
      summary: Hareketleri listele
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
        - name: skip
          in: query
          schema:
            type: integer
            default: 0
        - name: product_id
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Hareket listesi

  /api/movements/recent:
    get:
      tags: [Movements]
      summary: Son hareketler
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Son N hareket

  /api/movements/product/{productId}:
    get:
      tags: [Movements]
      summary: Ürüne göre hareketler
      parameters:
        - name: productId
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 500
        - name: skip
          in: query
          schema:
            type: integer
            minimum: 0
      responses:
        '200':
          description: Hareket listesi

  /api/reports/critical:
    get:
      tags: [Reports]
      summary: Kritik stoktaki ürünler
      responses:
        '200':
          description: Kritik stok listesi

  /api/reports/consumption:
    get:
      tags: [Reports]
      summary: En çok tüketilen ürünler
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 5
      responses:
        '200':
          description: Tüketim raporu

  /api/reports/summary:
    get:
      tags: [Reports]
      summary: Toplam stok özeti
      responses:
        '200':
          description: Özet istatistikler

  /api/reports/dashboard:
    get:
      tags: [Reports]
      summary: Gösterge paneli verisi
      responses:
        '200':
          description: Dashboard için birleşik veri

components:
  schemas:
    Product:
      type: object
      properties:
        _id:
          type: string
          example: "664abc123def456"
        name:
          type: string
          example: Kola
        description:
          type: string
          example: Soğuk içecek
        stock_quantity:
          type: integer
          example: 25
        minimum_stock:
          type: integer
          example: 0
        unit:
          type: string
          example: adet
        category:
          type: string
          enum: [food, beverage]
          example: beverage
        image_key:
          type: string
          example: beverage_kola
        image_url:
          type: string
          description: Veritabanında saklanan görsel adresi (ham)
        image_display_url:
          type: string
          description: Arayüzde kullanılacak çözülmüş adres
        is_critical:
          type: boolean
          example: false
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    StockMovement:
      type: object
      properties:
        _id:
          type: string
        product_id:
          type: string
        product_name:
          type: string
        unit:
          type: string
        movement_type:
          type: string
          enum: [IN, OUT]
        quantity:
          type: integer
        description:
          type: string
        created_at:
          type: string
          format: date-time

    ApiSuccess:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data: {}

    ApiError:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          example: Yetersiz stok
        details:
          type: array
          items:
            type: object

  responses:
    BadRequest:
      description: Geçersiz istek / doğrulama hatası
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
          example:
            success: false
            message: Doğrulama hatası
    NotFound:
      description: Kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
          example:
            success: false
            message: Ürün bulunamadı
```
