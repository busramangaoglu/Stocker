const Product = require('../models/product.model');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Aynı ürün adına (trim, büyük/küçük harf duyarsız) sahip, image_url dolu bir kayıt varsa onun URL’sini döner.
 * En son güncellenen kayıt tercih edilir (aynı isimde birden fazla görsel tanımı varsa).
 */
async function findImageUrlFromPeerByName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const peer = await Product.findOne({
    image_url: { $nin: [null, ''] },
    name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
  })
    .sort({ updated_at: -1 })
    .select('image_url')
    .lean();
  const u = (peer?.image_url || '').trim();
  return u || null;
}

async function create(data, session = null) {
  if (session) {
    const [doc] = await Product.create([data], { session });
    return doc.toObject();
  }
  const doc = await Product.create(data);
  return doc.toObject();
}

async function findById(id) {
  const doc = await Product.findById(id).lean();
  return doc;
}

async function findAll(filter = {}) {
  return Product.find(filter).sort({ name: 1 }).lean();
}

async function updateById(id, data) {
  const doc = await Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  return doc;
}

async function deleteById(id, session = null) {
  if (session) {
    return Product.findByIdAndDelete(id).session(session).lean();
  }
  return Product.findByIdAndDelete(id).lean();
}

async function findByIdForUpdate(id, session) {
  return Product.findById(id).session(session);
}

async function findCritical() {
  return Product.find({
    $expr: { $lte: ['$stock_quantity', '$minimum_stock'] },
  })
    .sort({ stock_quantity: 1 })
    .lean();
}

async function aggregateStockSummary() {
  const agg = await Product.aggregate([
    {
      $group: {
        _id: null,
        total_stock: { $sum: '$stock_quantity' },
        product_count: { $sum: 1 },
      },
    },
  ]);
  return agg[0] || { total_stock: 0, product_count: 0 };
}

module.exports = {
  create,
  findById,
  findAll,
  findImageUrlFromPeerByName,
  updateById,
  deleteById,
  findByIdForUpdate,
  findCritical,
  aggregateStockSummary,
};
