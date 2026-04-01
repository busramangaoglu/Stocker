const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { validateQuery } = require('../middleware/validate');
const { ConsumptionReportQuery } = require('../schemas/report.schema');
const { sendSuccess } = require('../utils/helpers');
const reportService = require('../services/report.service');

const router = express.Router();

router.get(
  '/critical',
  asyncHandler(async (req, res) => {
    const data = await reportService.criticalStockReport();
    return sendSuccess(res, data);
  })
);

router.get(
  '/consumption',
  validateQuery(ConsumptionReportQuery),
  asyncHandler(async (req, res) => {
    const data = await reportService.consumptionReport(req.query.limit);
    return sendSuccess(res, data);
  })
);

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const data = await reportService.stockSummary();
    return sendSuccess(res, data);
  })
);

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const data = await reportService.dashboard();
    return sendSuccess(res, data);
  })
);

module.exports = router;
