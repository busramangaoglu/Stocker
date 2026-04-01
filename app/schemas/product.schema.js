const Joi = require('joi');
const { ALLOWED_PRODUCT_NAMES } = require('../config/productCatalog');

const ProductCreate = Joi.object({
  name: Joi.string().trim().valid(...ALLOWED_PRODUCT_NAMES).required(),
  description: Joi.string().allow('').max(5000).default(''),
  stock_quantity: Joi.number().integer().min(0).default(0),
  minimum_stock: Joi.number().integer().min(0).default(0),
  unit: Joi.string().trim().min(1).max(50).default('adet'),
  category: Joi.string().valid('food', 'beverage').optional(),
  image_url: Joi.string().trim().max(2048).allow('').optional(),
  image_key: Joi.forbidden(),
});

const ProductUpdate = Joi.object({
  name: Joi.string().trim().min(1).max(500),
  description: Joi.string().allow('').max(5000),
  minimum_stock: Joi.number().integer().min(0),
  unit: Joi.string().trim().min(1).max(50),
  category: Joi.string().valid('food', 'beverage').optional(),
  image_url: Joi.string().trim().max(2048).allow('').optional(),
  image_key: Joi.forbidden(),
  stock_quantity: Joi.forbidden(),
}).min(1);

function validateProductCreate(payload) {
  return ProductCreate.validate(payload, { abortEarly: false, stripUnknown: true });
}

function validateProductUpdate(payload) {
  return ProductUpdate.validate(payload, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  ProductCreate,
  ProductUpdate,
  validateProductCreate,
  validateProductUpdate,
};
