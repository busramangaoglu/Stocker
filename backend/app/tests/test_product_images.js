const { test } = require('node:test');
const assert = require('node:assert/strict');
const { computeImageKey } = require('../utils/productImageKey');

test('computeImageKey — ekmek', () => {
  assert.equal(computeImageKey('Taze ekmek', 'food'), 'bread');
});

test('computeImageKey — kategori içecek varsayılan', () => {
  assert.equal(computeImageKey('Bilinmeyen içecek', 'beverage'), 'beverage_default');
});
