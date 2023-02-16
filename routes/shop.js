const express = require("express");
const { authController, userController, shopController } = require("../controllers/index");
var router = express.Router();

// router params

router.param('userId', userController.getUserById);
router.param('shopId', shopController.getShopById);


router.post('/create/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, shopController.createShop);
router.put('/update/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, shopController.canUpdateShop, shopController.updateShop);
router.delete('/disable/:shopId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, shopController.disableShop);


module.exports = router;