const { Product, ProductVariant } = require("../models");
const { validateCreateProductVariantBodyRequest, validateCreateProductBodyRequest } = require("./helper/productHelper");
const httpConstants = require('../utils/httpConstants');

exports.getProductById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "No product was found in DB"
        });
      }
      req.product = product;
      next();
    });
  };

exports.getProductVariantById = (req, res, next, id) => {
    ProductVariant.findById(id).exec((err, productVariant) => {
      if(err || !productVariant){
        return res.status(400).json({
            error: "No productVariant was found in DB"
          });
      }
      req.productVariant = productVariant;
      next();
    });
}

exports.createNewProduct = (req, res) => {
  try {
    const { error } = validateCreateProductBodyRequest(req.body);
    if (error) {
        return res.status(httpConstants.BAD_REQUEST_400).send({
            status: false,
            message: error.message
        });
    }
    // assigning the categoryId to product
    req.body.categoryId = req.category.id;
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

exports.updateProduct = (req, res) => {
  try {
    const { error } = validateCreateProductBodyRequest(req.body);
    if (error) {
        return res.status(httpConstants.BAD_REQUEST_400).send({
            status: false,
            message: error.message
        });
    }
    const product = req.product;
    product.name= req.body.name;
    // Assigning categoryId to product
    product.categoryId = req.category.id;
    product.description = req.body.description;
    product.images = req.body.images;
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

exports.createNewProductVariant = (req, res) => {
  try {
    const { error } = validateCreateProductVariantBodyRequest(req.body);
    if (error) {
        return res.status(httpConstants.BAD_REQUEST_400).send({
            status: false,
            message: error.message
        });
    }
    // assigning the productId into variant
    req.body.productId = req.product.id;
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

exports.updateProductVariant = (req, res) => {
  try {
    const { error } = validateCreateProductVariantBodyRequest(req.body);
    if (error) {
        return res.status(httpConstants.BAD_REQUEST_400).send({
            status: false,
            message: error.message
        });
    }
    const productVariant = req.productVariant;
    // assigning the productId into variant
    productVariant.productId = req.product.id;
    productVariant.unit = req.body.unit;
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

