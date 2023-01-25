const mongoose = require("mongoose");
const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
        trim: true
    },
    shopId: {    // Admin defined Unique shopId
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopHeaderAddress: {
        type: String,
        require: true,
        trim: true
    },
    shopFullAddress: {
        type: String,
        required: false,
        trim: false
    },
    contact: [{
        type: String,
        required: true
    }
    ],
    gstin: {
        type: String,
        required: false
    },
    shopMainLogo: {
        type: String,
        required: false
    },
    isShopEnable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Shop', shopSchema);