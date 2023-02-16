const Joi = require("joi");

function validateCreateCategoryBodyRequest(categoryDetails) {
    const schema = Joi.object({
        name: Joi.string().required().error(() => new Error('Category name is a required field')),
        description: Joi.string().required().error(() => new Error('Category description is a required field'))
    });
    return schema.validate(categoryDetails, { allowUnknown: true }); 
}

module.exports = {
    validateCreateCategoryBodyRequest
}