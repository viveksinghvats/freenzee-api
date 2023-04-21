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

function validateProductPriceAvailabilityBodyRequestForShop(stockDetails) {
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

function validateProductPriceStockUpdateBodyRequestForShop(stockDetails) {
    const schema = Joi.object({
        productVariantId: Joi.string().required().error(() => new Error('ProductVariantId is a required field')),
        productId: Joi.string().required().error(() => new Error('ProductId is a required field')),
        categoryId: Joi.string().required().error(() => new Error('CategoryId is a required field')),
        shopId: Joi.string().required().error(() => new Error('ShopId is a required field')),
        productType: Joi.string().valid('food', 'grocery').required(() => new Error('ProductType can either be food or grocery and is a required field')),
        isProductEnable: Joi.boolean().required().error(() => new Error('IsProductEnable is a required field')),
        price: Joi.number().required().error(() => new Error('Price is required field')),
        newStock: Joi.number().required().error(() => Error('newStock of product is a required field'))
    });
    return schema.validate(stockDetails, { allowUnknown: true });
}

function convertShopStockToMenuItems(allProductsOfAShop) {
    let groupedDetails = new Map();
    let categoryProductIndexMap = new Map();
    for (let i = 0; i < allProductsOfAShop.length; i++) {
        const categoryId = allProductsOfAShop[i].categoryId._id;
        const productId = allProductsOfAShop[i].productId._id;
        if (!categoryProductIndexMap.has(allProductsOfAShop[i].categoryId._id)) {
            let categoryObject = {
                'categoryId': categoryId,
                'categoryName': allProductsOfAShop[i].categoryId.name,
                'images': allProductsOfAShop[i].categoryId.images,
                'products': [
                    {
                        'productId': allProductsOfAShop[i].productId._id,
                        'productName': allProductsOfAShop[i].productId.name,
                        'productVariants': [
                            {
                                'productVariantId': allProductsOfAShop[i].productVariantId._id,
                                'unit': allProductsOfAShop[i].productVariantId.unit,
                            }
                        ]
                    }
                ]
            }
            categoryProductIndexMap.set(categoryId, categoryObject);
            groupedDetails.set(categoryId, { [productId]: 0 });
        } else {
            let group = groupedDetails.get(categoryId);
            let groupValue = categoryProductIndexMap.get(categoryId);
            if (group[productId] != null) {
                groupValue['products'][group[productId]]['productVariants'].push({
                    'productVariantId': allProductsOfAShop[i].productVariantId._id,
                    'unit': allProductsOfAShop[i].productVariantId.unit,
                });
            } else {
                groupValue['products'].push({
                    'productId': allProductsOfAShop[i].productId._id,
                    'productName': allProductsOfAShop[i].productId.name,
                    'productVariants': [
                        {
                            'productVariantId': allProductsOfAShop[i].productVariantId._id,
                            'unit': allProductsOfAShop[i].productVariantId.unit,
                        }
                    ]
                });
                group[productId] = Object.keys(group).length;
            }
            categoryProductIndexMap.set(categoryId, groupValue);
            groupedDetails.set(categoryId, group);
        }
    }
    return categoryProductIndexMap;
}

module.exports = {
    validateCreateProductBodyRequestForShop,
    validateCreateProductVariantBodyRequestForShop,
    validateProductPriceAvailabilityBodyRequestForShop,
    validateProductPriceStockUpdateBodyRequestForShop,
    convertShopStockToMenuItems
}