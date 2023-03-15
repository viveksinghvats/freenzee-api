const mongoose = require("mongoose");
const { productType } = require("../utils/constants");

const productPriceStockSchema = mongoose.Schema({
    productVariantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: true,
        unique: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    productType: {
        type: String,
        enum: ['food', 'grocery'],
        default: 'food'
    },
    isProductAvailable: {
        type: Boolean,
        default: false
    },
    isProductEnable: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

productPriceStockSchema
    .virtual("productAvailable")
    .set(function (productAvailable) {
        if (this.isProductEnable) {
            if (this.productType == productType.FOOD) {
                this._isProductAvailable = productAvailable;
                this.isProductAvailable = productAvailable;
            } else {
                this._isProductAvailable = this.stock > 0;
                this.isProductAvailable = this.stock > 0;
            }
        } else {
            this._isProductAvailable = false;
            this.isProductAvailable = false;
        }
    })
    .get(function () {
        return this._isProductAvailable
    });

module.exports = mongoose.model('ProductPriceStock', productPriceStockSchema);