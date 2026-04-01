const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { StockInRequest, StockOutRequest } = require('../schemas/stock.schema');
const { sendSuccess } = require('../utils/helpers');
const stockService = require('../services/stock.service');

const router = express.Router();

router.post(
  '/in',
  validateBody(StockInRequest),
  asyncHandler(async (req, res) => {
    const data = await stockService.stockIn(req.body);
    return sendSuccess(res, data);
  })
);

router.post(
  '/out',
  validateBody(StockOutRequest),
  asyncHandler(async (req, res) => {
    const data = await stockService.stockOut(req.body);
    return sendSuccess(res, data);
  })
);

module.exports = router;
