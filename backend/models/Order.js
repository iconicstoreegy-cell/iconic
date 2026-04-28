const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { en: String, ar: String },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  size: String,
  color: String
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: { type: String }
    },
    orderItems: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'instapay', 'vodafone_cash'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'transfer_submitted', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transferReceiptUrl: { type: String },   // Cloudinary URL of payment screenshot
    paymentResult: {
      id: String,
      status: String,
      update_time: String
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    emailSent: { type: Boolean, default: false },
    trackingNumber: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
