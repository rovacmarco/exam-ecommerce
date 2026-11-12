const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  items: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'Card'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
