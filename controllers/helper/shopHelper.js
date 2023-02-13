const Joi = require("joi");

function validateShopCreateBody(shopDetails) {
    const schema = Joi.object({
        shopName: Joi.string().required().error(() => new Error('Shop name is a required field')),
        shopNameId: Joi.string().required().error(() => new Error('shopNameId is an unique and required field')),
        userId: Joi.string().required().error(() => new Error('Shop operator or owner id is required')),
        shopHeaderAddress: Joi.string().required().error(() => new Error('Shop main address is required')),
        shopFullAddress: Joi.string().allow(null),
        contact: Joi.array().items(Joi.string()).min(1).error(() => new Error('Shop contact is required')),
        gstin: Joi.string().allow(null),
        shopMainLogo: Joi.string().allow(null),
        isShopEnable: Joi.boolean().required().error(() => new Error('Shop is enable or not is required'))
    });
    return schema.validate(shopDetails, { allowUnknown: true });
}

function validateShopUpdateBody(shopDetails) {
    const schema = Joi.object({
        shopId: Joi.string().required().error(() => new Error('Shop id is required to update details')),
        shopName: Joi.string().required().error(() => new Error('Shop name is a required field')),
        shopNameId: Joi.string().required().error(() => new Error('shopNameId is an unique and required field')),
        userId: Joi.string().required().error(() => new Error('Shop operator or owner id is required')),
        shopHeaderAddress: Joi.string().required().error(() => new Error('Shop main address is required')),
        shopFullAddress: Joi.string().allow(null),
        contact: Joi.array().items(Joi.string()).min(1).error(() => new Error('Shop contact is required')),
        gstin: Joi.string().allow(null),
        shopMainLogo: Joi.string().allow(null),
        isShopEnable: Joi.boolean().required().error(() => new Error('Shop is enable or not is required'))
    });
    return schema.validate(shopDetails, { allowUnknown: true });
}

module.exports = {
    validateShopCreateBody,
    validateShopUpdateBody
}