const mongoose = require('mongoose');
const StockMovement = require('../models/stockMovement.model');
const { MovementType } = require('../utils/enums');

async function create(data, session = null) {
  if (session) {
    const [doc] = await StockMovement.create([data], { session });
    return doc.toObject();
  }
  const doc = await StockMovement.create(data);
  return doc.toObject();
}

async function findAll({ limit = 50, skip = 0, productId = null } = {}) {
  const filter = {};
  if (productId) filter.product_id = new mongoose.Types.ObjectId(productId);
  return StockMovement.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .populate('product_id', 'name unit')
    .lean();
}

async function findByProductId(productId, { limit = 100, skip = 0 } = {}) {
  const id = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : productId;
  return StockMovement.find({ product_id: id })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .populate('product_id', 'name unit')
    .lean();
}

async function findRecent(limit = 20) {
  return StockMovement.find()
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('product_id', 'name unit')
    .lean();
}

async function deleteByProductId(productId, session = null) {
  const q = StockMovement.deleteMany({ product_id: productId });
  if (session) return q.session(session);
  return q;
}

async function aggregateTopOutbound(limit = 10) {
  return StockMovement.aggregate([
    { $match: { movement_type: MovementType.OUT } },
    {
      $group: {
        _id: '$product_id',
        total_out: { $sum: '$quantity' },
        movement_count: { $sum: 1 },
      },
    },
    { $sort: { total_out: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        product_id: '$_id',
        product_name: '$product.name',
        unit: '$product.unit',
        total_out: 1,
        movement_count: 1,
      },
    },
  ]);
}

module.exports = {
  create,
  findAll,
  findByProductId,
  findRecent,
  deleteByProductId,
  aggregateTopOutbound,
};
