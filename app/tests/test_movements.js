const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mapMovement } = require('../services/movement.service');

test('mapMovement — populate edilmiş product_id ile product_name döner', () => {
  const m = {
    _id: '507f1f77bcf86cd799439011',
    product_id: {
      _id: '507f191e810c19729de860ea',
      name: 'Kruvasan',
      unit: 'adet',
    },
    movement_type: 'IN',
    quantity: 10,
    description: '',
    created_at: new Date('2024-01-01'),
  };
  const out = mapMovement(m);
  assert.equal(out.product_name, 'Kruvasan');
  assert.equal(out.unit, 'adet');
  assert.equal(String(out.product_id), '507f191e810c19729de860ea');
});
