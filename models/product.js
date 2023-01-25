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
  image: [{
      type: String,
      required: false
    }
  ],
  shopId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);