const Joi = require("joi");

function validateAddProductToCart(categoryDetails) {
    const schema = Joi.object({
        shopId: Joi.string().required().error(() => new Error('ShopId is a required field')),
        isQuickDelivery: Joi.boolean().required().error(() => new Error('IsQuickDelivery is a required field')),
        slotValue: Joi.string().error(() => new Error('Slot value is a string field')),
        date: Joi.string().required().error(() => new Error('Date is a required field')),  // dd-mm-yyyy
        productVariantId: Joi.string().required(() => new Error('ProductVariantId is a required field')),
        isAdd: Joi.boolean().required(() => new Error('IsAdd is a required field'))

    });
    return schema.validate(categoryDetails, { allowUnknown: true }); 
}

module.exports = {
    validateAddProductToCart
}