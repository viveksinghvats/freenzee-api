const mongoose = require("mongoose");
// Product Schema
const productVariantSchema = new mongoose.Schema({
  unit: {
    type: String,
    required: true
  },
  images: [{
      type: String,
      required: false
    }
  ],
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  }
},  { timestamps: true });

module.exports = mongoose.model('ProductVariant', productVariantSchema);