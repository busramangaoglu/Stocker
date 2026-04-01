const mongoose = require('mongoose');

/**
 * Ürün adı (normalize) → görsel URL kalıcı eşlemesi.
 * Ürün silinse bile aynı isimle yeniden eklenince URL buradan gelir.
 */
const productNameImageSchema = new mongoose.Schema(
  {
    name_normalized: { type: String, required: true, unique: true, trim: true, maxlength: 500 },
    image_url: { type: String, required: true, trim: true, maxlength: 2048 },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'product_name_images',
    versionKey: false,
  }
);

module.exports = mongoose.model('ProductNameImage', productNameImageSchema);
