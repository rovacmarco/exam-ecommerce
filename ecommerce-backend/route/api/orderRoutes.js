const express = require('express');
const router = express.Router();
const {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  seedDemoOrders
} = require('../../controllers/orderController');

router.get('/', getOrders);
router.post('/', createOrder);
router.post('/seed', seedDemoOrders);
router.patch('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;
