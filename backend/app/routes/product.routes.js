const express = require('express');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { ProductCreate, ProductUpdate } = require('../schemas/product.schema');
const { sendSuccess, sendError } = require('../utils/helpers');
const productService = require('../services/product.service');
const { PRODUCT_CATALOG } = require('../config/productCatalog');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await productService.listProducts();
    return sendSuccess(res, data);
  })
);

router.get(
  '/catalog',
  asyncHandler(async (req, res) => {
    return sendSuccess(res, PRODUCT_CATALOG);
  })
);

router.post(
  '/',
  validateBody(ProductCreate),
  asyncHandler(async (req, res) => {
    const data = await productService.createProduct(req.body);
    return sendSuccess(res, data, 201);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Geçersiz ürün kimliği', 400);
    }
    const data = await productService.getProductById(req.params.id);
    if (!data) return sendError(res, 'Ürün bulunamadı', 404);
    return sendSuccess(res, data);
  })
);

router.put(
  '/:id',
  validateBody(ProductUpdate),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Geçersiz ürün kimliği', 400);
    }
    const data = await productService.updateProduct(req.params.id, req.body);
    if (!data) return sendError(res, 'Ürün bulunamadı', 404);
    return sendSuccess(res, data);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Geçersiz ürün kimliği', 400);
    }
    const data = await productService.deleteProduct(req.params.id);
    if (!data) return sendError(res, 'Ürün bulunamadı', 404);
    return sendSuccess(res, { deleted: true, _id: data._id });
  })
);

module.exports = router;
