const mongoose = require('mongoose');
const { IMAGE_KEYS } = require('../utils/productImageKey');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    stock_quantity: { type: Number, required: true, default: 0, min: 0 },
    minimum_stock: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true, default: 'adet', trim: true },
    category: { type: String, enum: ['food', 'beverage'], required: false },
    /** Harici veya tam URL (ör. senkron/import); doluysa API bu adresi öncelikli döner */
    image_url: { type: String, default: '', trim: true, maxlength: 2048 },
    /** Sunucunun ürün adı + kategoriye göre atadığı hazır görsel anahtarı (image_url yoksa kullanılır) */
    image_key: { type: String, enum: IMAGE_KEYS, default: 'food_default' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'products',
    versionKey: false,
  }
);

// Mongoose 9: senkron middleware — next() kullanılmaz
productSchema.pre('save', function preSave() {
  this.updated_at = new Date();
});

productSchema.pre('findOneAndUpdate', function preFindOneAndUpdate() {
  this.set({ updated_at: new Date() });
});

module.exports = mongoose.model('Product', productSchema);
