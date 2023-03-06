var express = require("express");
const { authController, userController, categoryController, shopController, productController, productPriceStockController } = require("../controllers/index");
var router = express.Router();

// params

router.param('userId', userController.getUserById);
router.param('shopId', shopController.getShopById);
router.param('productId', productController.getProductById);
router.param('productVariantId', productController.getProductVariantById);

// create new product by shop
// edit a product by shop

// create new product variant by shop
// edit a product variant by shop

// disable a product by shop
// disable a product variant by shop

// update a product stock (Grocery)
// update a product availabiltiy (Food)

router.post('/product/create/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.createNewProductForShop);
router.put('/product/update/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductShop);
// router.delete('/product/delete/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.deleteProductShop);

router.post('/productVariant/create/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.createNewProductVariantForShop);
router.put('/productVariant/update/:productVariantId/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductVariantForShop);
// router.delete('/productVariant/delete/:productId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.deleteProductVariantForShop);

router.put('/update/availability/:productVariantId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductPriceAvailabilityForShop);
router.put('/update/stock/:productVariantId/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, productPriceStockController.isAuthenticatedToUpdateShopDetails, productPriceStockController.updateProductStockDetails);



module.exports = router;
