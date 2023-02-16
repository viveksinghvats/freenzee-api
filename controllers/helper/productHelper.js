const Joi = require("joi");

function validateCreateProductBodyRequest(productDetails) {
    const schema = Joi.object({
        name: Joi.string().required().error(() => new Error('Product name is a required field')),
        description: Joi.string().allow(null)
    });
    return schema.validate(productDetails, { allowUnknown: true }); 
}

function validateCreateProductVariantBodyRequest(productVariantDetails){
    const schema = Joi.object({
        unit: Joi.string().required().error(() => new Error('Product variant unit is a required field'))
    });
    return schema.validate(productVariantDetails, { allowUnknown: true }); 
}

module.exports = {
    validateCreateProductBodyRequest,
    validateCreateProductVariantBodyRequest
}