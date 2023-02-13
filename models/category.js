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
  // will define parent category concept here
  images: [{
    type: String,
    required: false
  }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
