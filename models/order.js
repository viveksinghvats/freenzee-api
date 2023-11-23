const mongoose = require("mongoose");
const { orderStatusType } = require("../utils/constants");
// Order Schema
const orderSchema = new mongoose.Schema({
  products: [{
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: [orderStatusType.PENDING, orderStatusType.PACKED, orderStatusType.IN_TRANSIT, orderStatusType.DELIVERED, orderStatusType.CANCELLED],
    default: orderStatusType.PENDING
  },
  isQuick: {
    type: Boolean,
    default: true
  },
  slotValue: {
    type: String,
    required: false
  },
  transcationId: {
    type: String,
    required: false
  },
  deliveryTime: {
    type: Date,
    required: false,
  },
  cancellationTime: {
    type: Date,
    required: false,
  },
  deliveredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);