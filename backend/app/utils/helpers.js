function isCriticalStock(stockQuantity, minimumStock) {
  return stockQuantity <= minimumStock;
}

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function sendError(res, message, statusCode = 400, details = undefined) {
  const body = { success: false, message };
  if (details !== undefined) body.details = details;
  return res.status(statusCode).json(body);
}

module.exports = {
  isCriticalStock,
  sendSuccess,
  sendError,
};
