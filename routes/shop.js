const express = require("express");
const { isSignedIn, isAdmin, isCorrectUserIdPassed } = require("../controllers/auth");
const { getShopById, createShop, updateShop, canUpdateShop, disableShop } = require("../controllers/shop");
const { getUserById } = require("../controllers/user");
var router = express.Router();

// router params

router.param('userId', getUserById);
router.param('shopId', getShopById);


router.post('/create/:userId', isSignedIn, isCorrectUserIdPassed, isAdmin, createShop);
router.put('/update/:userId', isSignedIn, isCorrectUserIdPassed, canUpdateShop, updateShop);
router.delete('/disable/:shopId/:userId', isSignedIn, isCorrectUserIdPassed, isAdmin, disableShop);


module.exports = router;