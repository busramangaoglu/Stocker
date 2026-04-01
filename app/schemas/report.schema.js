const Joi = require('joi');

const ConsumptionReportQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const RecentMovementsQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
});

function validateConsumptionQuery(payload) {
  return ConsumptionReportQuery.validate(payload, { abortEarly: false, stripUnknown: true });
}

function validateRecentMovementsQuery(payload) {
  return RecentMovementsQuery.validate(payload, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  ConsumptionReportQuery,
  RecentMovementsQuery,
  validateConsumptionQuery,
  validateRecentMovementsQuery,
};
