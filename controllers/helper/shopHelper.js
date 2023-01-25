const Joi = require("joi");

function validateShopBody(shopDetails) {
    const schema = Joi.object().keys({
        shopName: Joi.string().required().error(() => { return { message: 'Shop name is a required field' }; }),
        shopId: Joi.string().required().error(() => { return { message: 'ShopId is a unique and required field' }; }),
        userId: Joi.string().required(),
        shopHeaderAddress: Joi.string().required().error(() => { return { message: 'Shop address is required' } }),
        shopFullAddress: Joi.string().allow(null),
        contact: Joi.array().items(Joi.string()).min(1),
        gstin: Joi.string().allow(null),
        shopMainLogo: Joi.string().allow(null),
        isShopEnable: Joi.boolean().required()
    });

    return schema.validate(shopDetails, { allowUnknown: true });

}

module.exports = {
    validateShopBody
}