var express = require("express");
const { authController, userController, shopController, orderController } = require("../controllers/index");
var router = express.Router();

router.param('userId', userController.getUserById);
router.param('shopId', shopController.getShopById);


router.post('/verifyOrder/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, orderController.verifyOrder);

module.exports = router;