const mongoose = require('mongoose');
const { MovementType } = require('../utils/enums');

const stockMovementSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    movement_type: {
      type: String,
      required: true,
      enum: [MovementType.IN, MovementType.OUT],
      index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    created_at: { type: Date, default: Date.now, index: true },
  },
  {
    collection: 'stock_movements',
    versionKey: false,
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
