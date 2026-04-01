const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveProductImageUrl } = require('../config/productImageUrls');

test('resolveProductImageUrl — yeni Kola, image_url yok → katalogdaki harici foto', () => {
  const url = resolveProductImageUrl({
    name: 'Kola',
    category: 'beverage',
    image_url: '',
    image_key: 'soda',
  });
  assert.ok(url.startsWith('https://'));
  assert.ok(url.includes('wikimedia.org'));
});

test('resolveProductImageUrl — image_url doluysa öncelik DB', () => {
  const u = 'https://example.com/x.png';
  const url = resolveProductImageUrl({
    name: 'Kola',
    image_url: u,
    image_key: 'soda',
  });
  assert.equal(url, u);
});
