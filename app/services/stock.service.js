const mongoose = require('mongoose');
const productRepository = require('../repositories/product.repository');
const movementRepository = require('../repositories/movement.repository');
const { MovementType } = require('../utils/enums');
const productService = require('./product.service');

async function stockIn({ product_id, quantity, description }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const product = await productRepository.findByIdForUpdate(product_id, session);
      if (!product) {
        const err = new Error('Ürün bulunamadı.');
        err.statusCode = 404;
        throw err;
      }
      product.stock_quantity += quantity;
      await product.save({ session });
      const movement = await movementRepository.create(
        {
          product_id,
          movement_type: MovementType.IN,
          quantity,
          description: description || '',
        },
        session
      );
      const plain = product.toObject();
      const enriched = await productService.enrichDocWithResolvedImageUrl(plain);
      result = { product: productService.toProductResponse(enriched), movement };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function stockOut({ product_id, quantity, description }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const product = await productRepository.findByIdForUpdate(product_id, session);
      if (!product) {
        const err = new Error('Ürün bulunamadı.');
        err.statusCode = 404;
        throw err;
      }
      if (product.stock_quantity < quantity) {
        const err = new Error('Yetersiz stok.');
        err.statusCode = 400;
        err.details = {
          available: product.stock_quantity,
          requested: quantity,
        };
        throw err;
      }
      product.stock_quantity -= quantity;
      await product.save({ session });
      const movement = await movementRepository.create(
        {
          product_id,
          movement_type: MovementType.OUT,
          quantity,
          description: description || '',
        },
        session
      );
      const plain = product.toObject();
      const enriched = await productService.enrichDocWithResolvedImageUrl(plain);
      result = { product: productService.toProductResponse(enriched), movement };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  stockIn,
  stockOut,
};
