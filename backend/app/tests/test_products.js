const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ProductCreate, ProductUpdate } = require('../schemas/product.schema');
const { isCriticalStock } = require('../utils/helpers');

test('ProductCreate — geçerli gövde (katalog adı)', () => {
  const { error, value } = ProductCreate.validate({
    name: 'Ekmek',
    stock_quantity: 10,
    minimum_stock: 2,
    unit: 'adet',
  });
  assert.equal(error, undefined);
  assert.equal(value.name, 'Ekmek');
});

test('ProductCreate — image_url opsiyonel (harici adres)', () => {
  const { error, value } = ProductCreate.validate({
    name: 'Kola',
    stock_quantity: 5,
    minimum_stock: 1,
    unit: 'adet',
    category: 'beverage',
    image_url: 'https://example.com/kola.png',
  });
  assert.equal(error, undefined);
  assert.equal(value.image_url, 'https://example.com/kola.png');
});

test('ProductCreate — image_key istemciden reddedilir', () => {
  const { error } = ProductCreate.validate({
    name: 'Kruvasan',
    stock_quantity: 5,
    minimum_stock: 1,
    unit: 'adet',
    category: 'food',
    image_key: 'bread',
  });
  assert.ok(error);
});

test('ProductCreate — category (sunucu görseli atar)', () => {
  const { error, value } = ProductCreate.validate({
    name: 'Kruvasan',
    stock_quantity: 5,
    minimum_stock: 1,
    unit: 'adet',
    category: 'food',
  });
  assert.equal(error, undefined);
  assert.equal(value.category, 'food');
});

test('ProductCreate — geçersiz category reddedilir', () => {
  const { error } = ProductCreate.validate({
    name: 'Su',
    stock_quantity: 1,
    minimum_stock: 0,
    unit: 'adet',
    category: 'electronics',
  });
  assert.ok(error);
});

test('ProductCreate — katalogda olmayan isim reddedilir', () => {
  const { error } = ProductCreate.validate({
    name: 'Kalem',
    stock_quantity: 1,
    minimum_stock: 0,
    unit: 'adet',
  });
  assert.ok(error);
});

test('ProductCreate — name zorunlu', () => {
  const { error } = ProductCreate.validate({ stock_quantity: 1 });
  assert.ok(error);
});

test('ProductUpdate — en az bir alan', () => {
  const { error } = ProductUpdate.validate({});
  assert.ok(error);
});

test('isCriticalStock', () => {
  assert.equal(isCriticalStock(5, 10), true);
  assert.equal(isCriticalStock(11, 10), false);
});
