const productRepository = require('../repositories/product.repository');
const movementRepository = require('../repositories/movement.repository');
const movementService = require('./movement.service');

async function criticalStockReport() {
  const products = await productRepository.findCritical();
  return {
    count: products.length,
    products: products.map((p) => ({
      _id: p._id,
      name: p.name,
      stock_quantity: p.stock_quantity,
      minimum_stock: p.minimum_stock,
      unit: p.unit,
      is_critical: true,
    })),
  };
}

async function consumptionReport(limit = 10) {
  const rows = await movementRepository.aggregateTopOutbound(limit);
  return {
    limit,
    items: rows.map((r) => ({
      product_id: r.product_id,
      product_name: r.product_name,
      unit: r.unit,
      total_out: r.total_out,
      movement_count: r.movement_count,
    })),
  };
}

async function stockSummary() {
  const agg = await productRepository.aggregateStockSummary();
  const critical = await productRepository.findCritical();
  return {
    product_count: agg.product_count,
    total_stock: agg.total_stock,
    critical_count: critical.length,
  };
}

async function dashboard() {
  const summary = await stockSummary();
  const recent = await movementService.recentMovements(10);
  const top = await consumptionReport(5);
  return {
    summary,
    recent_movements: recent,
    top_consumption: top.items,
  };
}

module.exports = {
  criticalStockReport,
  consumptionReport,
  stockSummary,
  dashboard,
};
