const { ProductPriceStock, Product, ProductVariant } = require("../models");
const { productType } = require("../utils/constants");
const { validateCreateProductBodyRequestForShop, validateCreateProductVariantBodyRequestForShop, validateProductPriceAvailabilityBodyRequestForShop } = require("./helper/productPriceStockHelper");

exports.isAuthenticatedToUpdateShopDetails = (req, res, next) => {
    if (req.profile.role != 'admin') {
        const shop = req.shop;
        if (shop.userId != req.profile.id) {
            return res.status(httpConstants.NOT_ALLOWED_405).json({
                error: "You cannot update data, Access denied"
            });
        }
    }
    next();
};

exports.getProductPriceStockById = (req, res, next, id) => {
    ProductPriceStock.findById(id).exec((err, productPriceStock) => {
        if (err || !productPriceStock) {
            return res.status(400).json({
                error: "No productPriceStock was found in DB"
            });
        }
        req.productPriceStock = productPriceStock;
        next();
    });
}

exports.createNewProductForShop = (req, res) => {
    try {
        req.body.shopId = req.shop.id;
        const { error } = validateCreateProductBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        // assigning the categoryId to product
        const product = Product(req.body);
        product.save((err, product) => {
            if (err) {
                return res.status(httpConstants.BAD_REQUEST_400).json({
                    error: 'Not able to save product details'
                });
            }
            res.status(httpConstants.OK_200).json({ product });
        });
    } catch (error) {
        console.log(err);
    }
}

exports.updateProductShop = (req, res) => {
    try {
        const { error } = validateCreateProductBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        // assigning the categoryId to product
        const product = req.product;
        product.name = req.body.name;
        product.description = req.body.description;
        product.images = req.body.images;
        product.categoryId = req.category.id;
        product.shopId = req.shop.id;
        product.save((err, product) => {
            if (err) {
                return res.status(httpConstants.BAD_REQUEST_400).json({
                    error: 'Not able to update product details'
                });
            }
            res.status(httpConstants.OK_200).json({ product });
        });
    } catch (error) {
        console.log(err);
    }
}

// exports.deleteProductShop = (req, res) => {
// }

exports.createNewProductVariantForShop = (req, res) => {
    try {
        req.body.productId = req.product.id;
        const { error } = validateCreateProductVariantBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        // assigning the categoryId to product
        const productVariant = ProductVariant(req.body);
        productVariant.save((err, productVariant) => {
            if (err) {
                return res.status(httpConstants.BAD_REQUEST_400).json({
                    error: 'Not able to save product variant details'
                });
            }
            res.status(httpConstants.OK_200).json({ productVariant });
        });
    } catch (error) {
        console.log(err);
    }
}

exports.updateProductVariantForShop = (req, res) => {
    try {
        req.body.productId = req.product.id;
        const { error } = validateCreateProductVariantBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        // assigning the categoryId to product
        const productVariant = req.productVariant;
        productVariant.unit = req.body.unit;
        productVariant.images = req.body.images;
        productVariant.productId = req.body.productId;
        productVariant.save((err, productVariant) => {
            if (err) {
                return res.status(httpConstants.BAD_REQUEST_400).json({
                    error: 'Not able to update product variant details'
                });
            }
            res.status(httpConstants.OK_200).json({ productVariant });
        });
    } catch (error) {
        console.log(err);
    }
}

exports.updateProductPriceAvailabilityForShop = async (req, res) => {
    try {
        req.body.productVariantId = req.productVariant.id;
        req.body.productId = req.product.id;
        req.body.categoryId = req.product.categoryId;
        req.body.shopId = req.shop.id;
        req.body.productType = productType.FOOD;
        const { error } = validateProductPriceAvailabilityBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const productStock = await ProductPriceStock.findOne({
            where: {
                productVariantId: req.body.productVariantId
            }
        });
        if (productStock) {
            productStock.productVariantId = req.body.productVariantId;
            productStock.productId = req.body.productId;
            productStock.categoryId = req.body.categoryId;
            productStock.shopId = req.body.shopId;
            productStock.productType = req.body.productType;
            productStock.price = req.body.price;
            productStock.isProductEnable = req.body.isProductEnable;
            productStock.save((err, updatedProductStock) => {
                if (err) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update product availability details'
                    });
                }
                res.status(httpConstants.OK_200).json({ updatedProductStock });
            });
        } else {
            const productStock = ProductPriceStock(req.body);
            productStock.save((err, createdStock) => {
                if (err) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to create product availability'
                    });
                }
                res.status(httpConstants.OK_200).json({ createdStock });
            })
        }
    } catch (error) {
        console.log(err);
    }
}

exports.updateProductStockDetails = async (req, res) => {
    try {
        req.body.productVariantId = req.productVariant.id;
        req.body.productId = req.product.id;
        req.body.categoryId = req.product.categoryId;
        req.body.shopId = req.shop.id;
        req.body.productType = productType.GROCERY;
        const { error } = validateProductPriceStockUpdateBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const productStock = await ProductPriceStock.findOne({
            where: {
                productVariantId: req.body.productVariantId
            }
        });
        if (productStock) {
            productStock.productVariantId = req.body.productVariantId;
            productStock.productId = req.body.productId;
            productStock.categoryId = req.body.categoryId;
            productStock.shopId = req.body.shopId;
            productStock.productType = req.body.productType;
            productStock.price = req.body.price;
            productStock.stock = req.body.stock;
            productStock.isProductEnable = req.body.isProductEnable;
            productStock.save((err, updatedProductStock) => {
                if (err) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update product availability details'
                    });
                }
                res.status(httpConstants.OK_200).json({ updatedProductStock });
            });
        } else {
            const productStock = ProductPriceStock(req.body);
            productStock.save((err, createdStock) => {
                if (err) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to create product availability'
                    });
                }
                res.status(httpConstants.OK_200).json({ createdStock });
            })
        }
    } catch (error) {
        console.log(err);
    }
}
