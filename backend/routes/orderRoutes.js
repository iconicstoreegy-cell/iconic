const express = require('express');
const {
  createOrder, uploadReceipt, getOrderById, getMyOrders,
  getAllOrders, updateOrderStatus, getDashboardStats
} = require('../controllers/orderController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, createOrder);      // guests and logged-in users
router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, admin, getDashboardStats);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', optionalAuth, getOrderById);   // guests and logged-in users
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/receipt', protect, uploadReceipt);

module.exports = router;
