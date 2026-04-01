const Joi = require('joi');

const MovementListQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(200).default(50),
  skip: Joi.number().integer().min(0).default(0),
  product_id: Joi.string().hex().length(24),
});

function validateMovementListQuery(payload) {
  return MovementListQuery.validate(payload, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  MovementListQuery,
  validateMovementListQuery,
};
