const express = require('express');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const { validateQuery } = require('../middleware/validate');
const { MovementListQuery } = require('../schemas/stockMovement.schema');
const { RecentMovementsQuery } = require('../schemas/report.schema');
const { sendSuccess, sendError } = require('../utils/helpers');
const movementService = require('../services/movement.service');

const router = express.Router();

router.get(
  '/',
  validateQuery(MovementListQuery),
  asyncHandler(async (req, res) => {
    const data = await movementService.listMovements(req.query);
    return sendSuccess(res, data);
  })
);

router.get(
  '/recent',
  validateQuery(RecentMovementsQuery),
  asyncHandler(async (req, res) => {
    const data = await movementService.recentMovements(req.query.limit);
    return sendSuccess(res, data);
  })
);

router.get(
  '/product/:productId',
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return sendError(res, 'Geçersiz ürün kimliği', 400);
    }
    const limit = Math.min(500, Math.max(1, parseInt(String(req.query.limit), 10) || 100));
    const skip = Math.max(0, parseInt(String(req.query.skip), 10) || 0);
    const data = await movementService.listByProduct(req.params.productId, { limit, skip });
    return sendSuccess(res, data);
  })
);

module.exports = router;
