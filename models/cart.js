const mongoose = require("mongoose");
// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  quickDeliveryProducts: [
    {
      productVariantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  // slot value SLOT_1AM, SLOT_2AM, SLOT_3AM, SLOT_4AM, SLOT_5AM, SLOT_6AM, SLOT_7AM, SLOT_8AM, SLOT_9AM, SLOT_10AM, SLOT_11AM, SLOT_12AM, SLOT_1PM, SLOT_2PM, SLOT_3PM, SLOT_4PM, SLOT_5PM, SLOT_6PM, SLOT_7PM, SLOT_8PM, SLOT_9PM, SLOT_10PM, SLOT_11PM, SLOT_12PM
  slotsProducts: [
    {
      slotValue: {
        type: String
      },
      products: [
        {
          productVariantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: true
          },
          quantity: {
            type: Number,
            required: true
          }
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);