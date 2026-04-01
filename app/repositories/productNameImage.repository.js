const ProductNameImage = require('../models/productNameImage.model');

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

async function findUrlByName(name) {
  const n = normalizeName(name);
  if (!n) return null;
  const doc = await ProductNameImage.findOne({ name_normalized: n }).lean();
  const u = (doc?.image_url || '').trim();
  return u || null;
}

async function upsertByName(name, imageUrl) {
  const n = normalizeName(name);
  const u = (imageUrl || '').trim();
  if (!n || !u) return null;
  await ProductNameImage.findOneAndUpdate(
    { name_normalized: n },
    { $set: { image_url: u, updated_at: new Date() } },
    { upsert: true, new: true, runValidators: true },
  );
  return true;
}

module.exports = {
  normalizeName,
  findUrlByName,
  upsertByName,
};
