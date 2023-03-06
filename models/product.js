const mongoose = require("mongoose");
// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  images: [{
      type: String,
      required: false
    }
  ],
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: false
  }
},  { timestamps: true });

module.exports = mongoose.model('Product', productSchema);