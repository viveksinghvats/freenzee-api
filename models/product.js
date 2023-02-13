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
  }
},  { timestamps: true });

module.exports = mongoose.model('Product', productSchema);