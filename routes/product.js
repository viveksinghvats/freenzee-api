var express = require("express");
const { authController, userController, productController, categoryController } = require("../controllers/index");
var router = express.Router();

// params

router.param('userId', userController.getUserById);
router.param('categoryId', categoryController.getCategoryById);
router.param('productId', productController.getProductById);
router.param('productVariantId', productController.getProductVariantById);


router.post('/create/:categoryId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, productController.createNewProduct);
router.put('/update/:categoryId/:productId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, productController.updateProduct);
router.post('/createVariant/:productId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, productController.createNewProductVariant);
router.put('/updateVariant/:productId/:productVariantId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, productController.updateProductVariant);


module.exports = router;
