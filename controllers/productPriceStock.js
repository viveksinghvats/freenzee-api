const { ProductPriceStock, Product, ProductVariant } = require("../models");
const { productType } = require("../utils/constants");
const httpConstants = require('../utils/httpConstants');
const { validateCreateProductBodyRequestForShop, validateCreateProductVariantBodyRequestForShop, validateProductPriceAvailabilityBodyRequestForShop, validateProductPriceStockUpdateBodyRequestForShop, convertShopStockToMenuItems } = require("./helper/productPriceStockHelper");

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
        req.body.categoryId = req.category.id;
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

exports.updateProductForShop = (req, res) => {
    try {
        req.body.shopId = req.shop.id;
        req.body.categoryId = req.category.id;
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
        console.log(error);
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
        req.body.productId = req.productVariant.productId + '';
        req.body.shopId = req.shop.id;
        req.body.productType = productType.FOOD;
        const product = await Product.findById(req.body.productId).exec();
        req.body.categoryId = product.categoryId + '';
        const { error } = validateProductPriceAvailabilityBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const productStock = await ProductPriceStock.findOne({
            productVariantId: req.body.productVariantId,
            productType: productType.FOOD
        });
        if (productStock) {
            productStock.productVariantId = req.body.productVariantId;
            productStock.productId = req.body.productId;
            productStock.categoryId = req.body.categoryId;
            productStock.shopId = req.body.shopId;
            productStock.productType = req.body.productType;
            productStock.price = req.body.price;
            productStock.isProductEnable = req.body.isProductEnable;
            productStock.productAvailable = req.body.productAvailable;
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
        req.body.productId = req.productVariant.productId + '';
        req.body.shopId = req.shop.id;
        req.body.productType = productType.GROCERY;
        const product = await Product.findById(req.body.productId).exec();
        req.body.categoryId = product.categoryId + '';
        const { error } = validateProductPriceStockUpdateBodyRequestForShop(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const productStock = await ProductPriceStock.findOne({
            productVariantId: req.body.productVariantId,
            productType: productType.GROCERY
        });
        if (productStock) {
            productStock.productVariantId = req.body.productVariantId;
            productStock.productId = req.body.productId;
            productStock.categoryId = req.body.categoryId;
            productStock.shopId = req.body.shopId;
            productStock.productType = req.body.productType;
            productStock.price = req.body.price;
            productStock.newStock = req.body.newStock;
            productStock.isProductEnable = req.body.isProductEnable;
            productStock.save((err, updatedProductStock) => {
                if (err) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update product stock details'
                    });
                }
                res.status(httpConstants.OK_200).json({ updatedProductStock });
            });
        } else {
            const productStock = ProductPriceStock(req.body);
            productStock.save((err, createdStock) => {
                if (err) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update product stock details'
                    });
                }
                res.status(httpConstants.OK_200).json({ createdStock });
            })
        }
    } catch (error) {
        console.log(err);
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const allProductsOfAShop = await ProductPriceStock.find({
            isProductAvailable: true,
            shopId: req.shop.id
        }).populate('productVariantId').populate('productId').populate('categoryId').exec();
        const categoryProductIndexMap = convertShopStockToMenuItems(allProductsOfAShop);
        res.status(httpConstants.OK_200).json(Array.from(categoryProductIndexMap.values()));
    } catch (error) {
        console.log(error);
    }
}

exports.getAllCategories = async (req, res) => {
    try {
        const allProductsOfAShop = await ProductPriceStock.find({
            isProductAvailable: true,
            shopId: req.shop.id
        }).populate('productVariantId').populate('productId').populate('categoryId').exec();
        const categoryProductIndexMap = convertShopStockToMenuItems(allProductsOfAShop);
        const menuArr = Array.from(categoryProductIndexMap.values());
        let allCategories = [];
        for (let i = 0; i < menuArr.length; i++) {
            allCategories.push({
                'categoryId': menuArr[i].categoryId,
                'categoryName': menuArr[i].categoryName,
                'images': menuArr[i].images
            });
        }
        res.status(httpConstants.OK_200).json(Array.from(allCategories));
    } catch (error) {
        console.log(error);
    }
}

exports.getAllProductsOfCategory = async (req, res) => {
    try {
        const allProductsOfAShop = await ProductPriceStock.find({
            isProductAvailable: true,
            shopId: req.shop.id,
            categoryId: req.category.id
        }).populate('productVariantId').populate('productId').populate('categoryId').exec();
        if (allProductsOfAShop.length > 0) {
            const categoryProductIndexMap = convertShopStockToMenuItems(allProductsOfAShop);
            res.status(httpConstants.OK_200).json(Array.from(categoryProductIndexMap.values())[0]);
        } else {
            res.status(httpConstants.OK_200).json({
                message: 'No product found'
            });
        }
    } catch (error) {
        console.log(error);
    }
}

exports.getProductDetails = async (req, res) => {
    try {
        const allProductsOfAShop = await ProductPriceStock.find({
            isProductAvailable: true,
            shopId: req.shop.id,
            productId: req.product.id
        }).populate('productVariantId').populate('productId').exec();
        let product = {};
        for (let i = 0; i < allProductsOfAShop.length; i++) {
            if (i == 0) {
                product = {
                    'productId': allProductsOfAShop[i].productId._id,
                    'productName': allProductsOfAShop[i].productId.name,
                    'images': allProductsOfAShop[i].productId.images,
                    'productVariants': [
                        {
                            'productVariantId': allProductsOfAShop[i].productVariantId._id,
                            'unit': allProductsOfAShop[i].productVariantId.unit,
                            'images': allProductsOfAShop[i].productVariantId.images,
                            'price': allProductsOfAShop[i].price
                        }
                    ]
                }
            } else {
                product['productVariants'].push({
                    'productVariantId': allProductsOfAShop[i].productVariantId._id,
                    'unit': allProductsOfAShop[i].productVariantId.unit,
                    'images': allProductsOfAShop[i].productVariantId.images,
                    'price': allProductsOfAShop[i].price 
                });
            }
        }
        res.status(httpConstants.OK_200).json(product);
    } catch (error) {

    }
}