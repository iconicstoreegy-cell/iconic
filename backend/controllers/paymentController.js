const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const Order = require('../models/Order');

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/create-intent
// @access  Public
const createStripeIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'egp' } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents/piastres
    currency,
    metadata: { integration_check: 'accept_a_payment' }
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// @desc    Confirm Stripe payment and update order
// @route   POST /api/payment/stripe/confirm
// @access  Public
const confirmStripePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentIntentId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString()
      };
      await order.save();
    }
    res.json({ success: true, message: 'Payment confirmed' });
  } else {
    res.status(400);
    throw new Error('Payment not completed');
  }
});

// @desc    Initiate Paymob payment
// @route   POST /api/payment/paymob/initiate
// @access  Public
const initiatePaymob = asyncHandler(async (req, res) => {
  const { amount, orderId, customerInfo } = req.body;

  // Step 1: Authentication
  const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
    api_key: process.env.PAYMOB_API_KEY
  });
  const authToken = authRes.data.token;

  // Step 2: Register order
  const orderRes = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: Math.round(amount * 100),
    currency: 'EGP',
    merchant_order_id: orderId
  });
  const paymobOrderId = orderRes.data.id;

  // Step 3: Payment key
  const paymentKeyRes = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
    auth_token: authToken,
    amount_cents: Math.round(amount * 100),
    expiration: 3600,
    order_id: paymobOrderId,
    billing_data: {
      apartment: 'NA',
      email: customerInfo.email || 'customer@alshaer.com',
      floor: 'NA',
      first_name: customerInfo.name?.split(' ')[0] || 'Customer',
      last_name: customerInfo.name?.split(' ')[1] || 'Name',
      street: customerInfo.address || 'NA',
      building: 'NA',
      phone_number: customerInfo.phone || '+201000000000',
      shipping_method: 'NA',
      postal_code: 'NA',
      city: customerInfo.city || 'Cairo',
      country: 'EG',
      state: customerInfo.city || 'Cairo'
    },
    currency: 'EGP',
    integration_id: process.env.PAYMOB_INTEGRATION_ID
  });

  const paymentToken = paymentKeyRes.data.token;
  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

  res.json({ iframeUrl, paymentToken });
});

// @desc    Paymob webhook callback
// @route   POST /api/payment/paymob/callback
// @access  Public
const paymobCallback = asyncHandler(async (req, res) => {
  const { success, order } = req.body.obj || {};

  if (success && order?.merchant_order_id) {
    const dbOrder = await Order.findById(order.merchant_order_id);
    if (dbOrder) {
      dbOrder.paymentStatus = 'paid';
      dbOrder.paymentResult = {
        id: req.body.obj?.id?.toString(),
        status: 'paid',
        update_time: new Date().toISOString()
      };
      await dbOrder.save();
    }
  }

  res.json({ received: true });
});

module.exports = {
  createStripeIntent,
  confirmStripePayment,
  initiatePaymob,
  paymobCallback
};
