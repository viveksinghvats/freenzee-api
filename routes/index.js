const authRoutes = require('./auth');
const shopRoutes = require('./shop');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const productPriceStockRoutes = require('./productPriceStock');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
module.exports = {
    authRoutes,
    shopRoutes,
    categoryRoutes,
    productRoutes,
    productPriceStockRoutes,
    cartRoutes,
    orderRoutes
}