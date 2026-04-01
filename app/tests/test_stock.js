const { test } = require('node:test');
const assert = require('node:assert/strict');
const { StockInRequest, StockOutRequest } = require('../schemas/stock.schema');
const { MovementType } = require('../utils/enums');

test('StockInRequest — geçerli', () => {
  const { error, value } = StockInRequest.validate({
    product_id: '507f1f77bcf86cd799439011',
    quantity: 5,
    description: 'Tedarik',
  });
  assert.equal(error, undefined);
  assert.equal(value.quantity, 5);
});

test('StockOutRequest — miktar en az 1', () => {
  const { error } = StockOutRequest.validate({
    product_id: '507f1f77bcf86cd799439011',
    quantity: 0,
  });
  assert.ok(error);
});

test('MovementType enum', () => {
  assert.equal(MovementType.IN, 'IN');
  assert.equal(MovementType.OUT, 'OUT');
});
