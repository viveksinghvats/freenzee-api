const express = require("express");
const { isSignedIn, isAdmin, isCorrectUserIdPassed } = require("../controllers/auth");
const { getShopById, createShop } = require("../controllers/shop");
const { getUserById } = require("../controllers/user");
var router = express.Router();

// router params

router.param('userId', getUserById);
router.param('shopId', getShopById);


router.post('/create/:userId', isSignedIn, isCorrectUserIdPassed, isAdmin, createShop);

module.exports = router;