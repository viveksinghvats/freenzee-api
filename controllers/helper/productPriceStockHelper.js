const Joi = require("joi");

function validateCreateProductBodyRequestForShop(productDetails) {
    const schema = Joi.object({
        name: Joi.string().required().error(() => new Error('Product name is a required field')),
        description: Joi.string().allow(null),
        shopId: Joi.string().required().error(() => new Error('ShopId is a required field for this api')),
        categoryId: Joi.string().required().error(() => new Error('CategoryId as a required field'))
    });
    return schema.validate(productDetails, { allowUnknown: true });
}

function validateCreateProductVariantBodyRequestForShop(variantDetails) {
    const schema = Joi.object({
        unit: Joi.string().required().error(() => new Error('Product variant unit is a required field')),
        productId: Joi.string().required().error(() => new Error('ProductId as a required field'))
    });
    return schema.validate(variantDetails, { allowUnknown: true });
}

function validateProductPriceAvailabilityBodyRequestForShop(stockDetails){
    const schema = Joi.object({
        productVariantId: Joi.string().required().error(() => new Error('ProductVariantId is a required field')),
        productId: Joi.string().required().error(() => new Error('ProductId is a required field')),
        categoryId: Joi.string().required().error(() => new Error('CategoryId is a required field')),
        shopId: Joi.string().required().error(() => new Error('ShopId is a required field')),
        productType: Joi.string().valid('food', 'grocery').required(() => new Error('ProductType can either be food or grocery and is a required field')),
        productAvailable: Joi.boolean().required().error(() => new Error('ProductAvailable is a required field')),
        isProductEnable: Joi.boolean().required().error(() => new Error('IsProductEnable is a required field')),
        price: Joi.number().required().error(() => new Error('Price is required field'))
    });
    return schema.validate(stockDetails, { allowUnknown: true });
}

function validateProductPriceStockUpdateBodyRequestForShop(stockDetails){
    const schema = Joi.object({
        productVariantId: Joi.string().required().error(() => new Error('ProductVariantId is a required field')),
        productId: Joi.string().required().error(() => new Error('ProductId is a required field')),
        categoryId: Joi.string().required().error(() => new Error('CategoryId is a required field')),
        shopId: Joi.string().required().error(() => new Error('ShopId is a required field')),
        productType: Joi.string().valid('food', 'grocery').required(() => new Error('ProductType can either be food or grocery and is a required field')),
        isProductEnable: Joi.boolean().required().error(() => new Error('IsProductEnable is a required field')),
        price: Joi.number().required().error(() => new Error('Price is required field')),
        stock: Joi.number().required().error(() => Error('Stock of product is a required field'))
    });
    return schema.validate(stockDetails, { allowUnknown: true });
}

module.exports = {
    validateCreateProductBodyRequestForShop,
    validateCreateProductVariantBodyRequestForShop,
    validateProductPriceAvailabilityBodyRequestForShop,
    validateProductPriceStockUpdateBodyRequestForShop
}