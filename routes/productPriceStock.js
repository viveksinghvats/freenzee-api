var express = require("express");
const { authController, userController, shopController, productController, productPriceStockController, categoryController } = require("../controllers/index");
var router = express.Router();

// params

router.param('userId', userController.getUserById);
router.param('shopId', shopController.getShopById);
router.param('productId', productController.getProductById);
router.param('productVariantId', productController.getProductVariantById);
router.param('categoryId', categoryController.getCategoryById);

// create new product by shop
// edit a product by shop

// create new product variant by shop
// edit a product variant by shop

// disable a product by shop
// disable a product variant by shop

// update a product stock (Grocery)
// update a product availabiltiy (Food)

// get all products of a shop grouped by variant and also grouped by category (menuItems)
// get all categories of a shop 
// get all product grouped with variants for a category by shop
// get all product grouped with variants for a shop

router.post('/product/create/:categoryId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.createNewProductForShop);
router.put('/product/update/:categoryId/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductForShop);
// router.delete('/product/delete/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.deleteProductShop);

router.post('/productVariant/create/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.createNewProductVariantForShop);
router.put('/productVariant/update/:productVariantId/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductVariantForShop);
// router.delete('/productVariant/delete/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.deleteProductVariantForShop);

router.post('/update/availability/:productVariantId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductPriceAvailabilityForShop);
router.post('/update/stock/:productVariantId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductStockDetails);

router.get('/products/all/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.getAllProducts);
router.get('/categories/all/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.getAllCategories);
router.get('/products/all/:categoryId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.getAllProductsOfCategory);
router.get('/products/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.getProductDetails); 







module.exports = router;
