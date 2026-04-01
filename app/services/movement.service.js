const movementRepository = require('../repositories/movement.repository');

function mapMovement(m) {
  const product = m.product_id && typeof m.product_id === 'object' && m.product_id.name
    ? m.product_id
    : null;
  return {
    _id: m._id,
    product_id: product ? product._id : m.product_id,
    product_name: product ? product.name : undefined,
    unit: product ? product.unit : undefined,
    movement_type: m.movement_type,
    quantity: m.quantity,
    description: m.description,
    created_at: m.created_at,
  };
}

async function listMovements(query) {
  const { limit, skip, product_id } = query;
  const list = await movementRepository.findAll({ limit, skip, productId: product_id || null });
  return list.map(mapMovement);
}

async function listByProduct(productId, { limit = 100, skip = 0 } = {}) {
  const list = await movementRepository.findByProductId(productId, { limit, skip });
  return list.map(mapMovement);
}

async function recentMovements(limit = 20) {
  const list = await movementRepository.findRecent(limit);
  return list.map(mapMovement);
}

module.exports = {
  listMovements,
  listByProduct,
  recentMovements,
  mapMovement,
};
