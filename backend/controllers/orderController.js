const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendOrderEmail } = require('../utils/email');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { customerInfo, orderItems, totalPrice, shippingPrice, paymentMethod, transferReceiptUrl } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (['instapay', 'vodafone_cash'].includes(paymentMethod) && !transferReceiptUrl) {
    res.status(400);
    throw new Error('Transfer receipt is required for this payment method');
  }

  // Sanitize orderItems — product field must be a valid ObjectId
  const sanitizedItems = orderItems.map((item) => {
    const isValidId = mongoose.Types.ObjectId.isValid(item.product);
    return {
      product: isValidId ? item.product : new mongoose.Types.ObjectId(),
      name: item.name || { en: item.name, ar: item.name },
      image: item.image || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: item.size || '',
      color: item.color || ''
    };
  });

  const order = await Order.create({
    user: req.user ? req.user._id : undefined,
    customerInfo,
    orderItems: sanitizedItems,
    totalPrice: Number(totalPrice),
    shippingPrice: Number(shippingPrice) || 0,
    paymentMethod,
    transferReceiptUrl: transferReceiptUrl || null,
    paymentStatus: transferReceiptUrl ? 'transfer_submitted' : 'pending'
  });

  // Send email notification — non-blocking
  sendOrderEmail(order).then((sent) => {
    if (sent) Order.findByIdAndUpdate(order._id, { emailSent: true }).exec();
  }).catch(() => {});

  res.status(201).json(order);
});

// @desc    Upload transfer receipt for existing order
// @route   PUT /api/orders/:id/receipt
// @access  Private
const uploadReceipt = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  if (order.user?.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  order.transferReceiptUrl = req.body.transferReceiptUrl;
  order.paymentStatus = 'transfer_submitted';
  await order.save();
  res.json(order);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400); throw new Error('Invalid order ID');
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const isOwner = req.user && (
    order.user?._id?.toString() === req.user._id.toString() || 
    order.user?.toString() === req.user._id.toString()
  );

  // If order has a user, restrict access. If no user (guest), allow read access via ID
  if (order.user) {
    if (!req.user || (req.user.role !== 'admin' && !isOwner)) {
      res.status(403); throw new Error('Not authorized');
    }
  }

  res.json(order);
});

// @desc    Get my orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const query = {};
  if (req.query.status) query.orderStatus = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.orderStatus = req.body.orderStatus || order.orderStatus;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;

  const updated = await order.save();
  res.json(updated);
});

// @desc    Dashboard stats (admin)
// @route   GET /api/orders/stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();

  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    ordersByStatus,
    recentOrders,
    monthlyRevenue
  });
});

module.exports = {
  createOrder,
  uploadReceipt,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
};
