const express = require('express');
const {
  createStripeIntent,
  confirmStripePayment,
  initiatePaymob,
  paymobCallback
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/stripe/create-intent', createStripeIntent);
router.post('/stripe/confirm', confirmStripePayment);
router.post('/paymob/initiate', initiatePaymob);
router.post('/paymob/callback', paymobCallback);

module.exports = router;
