const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDemoProducts
} = require('../../controllers/productController');

router.get('/', getProducts);
router.post('/', createProduct);
router.post('/seed', seedDemoProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
