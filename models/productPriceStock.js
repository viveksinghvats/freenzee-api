const mongoose = require("mongoose");

const productPriceStockSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
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
    stock: {
        type: Number,
        default: 0
    }
});

productPriceStockSchema
    .virtual("productAvailable")
    .set(function (productAvailable) {
        if (this.isProductEnable) {
        if(this.productType == 'food'){
            this._isProductAvailable = productAvailable;
            this.isProductAvailable = productAvailable;
        } else{
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