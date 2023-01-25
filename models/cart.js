const mongoose = require("mongoose");
// Cart Schema
const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }, 
    shopId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  });

  module.exports = mongoose.model('Cart', cartSchema);