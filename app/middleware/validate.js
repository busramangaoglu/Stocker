const { sendError } = require('../utils/helpers');

function validateBody(schema) {
  return (req, res, next) => {
    const raw = req.body === undefined || req.body === null ? {} : req.body;
    const { error, value } = schema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((d) => ({ message: d.message, path: d.path }));
      return sendError(res, 'Doğrulama hatası', 400, details);
    }
    req.body = value;
    return next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((d) => ({ message: d.message, path: d.path }));
      return sendError(res, 'Sorgu doğrulama hatası', 400, details);
    }
    req.query = value;
    return next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
};
