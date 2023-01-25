const mongoose = require("mongoose");
// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  shopId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  images: [{
      type: String,
      required: false
    }
  ]
});

module.exports = mongoose.model('Category', categorySchema);
