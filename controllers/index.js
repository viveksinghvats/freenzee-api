const authController = require('./auth');
const categoryController = require('./category');
const shopController = require('./shop');
const userController = require('./user');
const productController = require('./product');
const productPriceStockController = require('./productPriceStock');
const cartController = require('./cart');
const orderController = require('./order')
module.exports = {
    authController,
    categoryController,
    shopController,
    userController,
    productController,
    productPriceStockController,
    cartController,
    orderController
}