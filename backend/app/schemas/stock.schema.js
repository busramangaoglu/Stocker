const Joi = require('joi');

const StockInRequest = Joi.object({
  product_id: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  description: Joi.string().allow('').max(2000).default(''),
});

const StockOutRequest = Joi.object({
  product_id: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  description: Joi.string().allow('').max(2000).default(''),
});

function validateStockIn(payload) {
  return StockInRequest.validate(payload, { abortEarly: false, stripUnknown: true });
}

function validateStockOut(payload) {
  return StockOutRequest.validate(payload, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  StockInRequest,
  StockOutRequest,
  validateStockIn,
  validateStockOut,
};
