var express = require("express");
const { authController, userController, productController, cartController } = require("../controllers/index");
var router = express.Router();

router.param('productVariantId', productController.getProductVariantById);
router.param('userId', userController.getUserById);

// router.put('updateProduct', )

// get userCart for given shop. (Do validation for the avaialble products);
router.post('/addProduct/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, cartController.updateProductToCart);

// add product to cart (slotValue, quick delivery constant, isFutureSlot, date, quantity, shopId, userId); => Do validation of stock.
// will return current cartValue, without delivery charges.

// move cart to order with status((paid, pending, credit, cod,) canModify). => Do validation of slot check, and future date.

// Make invoice of order.


// evaluate delivery price for quickDelivery.






module.exports = router;