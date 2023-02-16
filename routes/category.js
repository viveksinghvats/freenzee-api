var express = require("express");
const { authController, userController, categoryController } = require("../controllers/index");
var router = express.Router();

// params

router.param('userId', userController.getUserById);
router.param('categoryId', categoryController.getCategoryById);


router.post('/create/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, categoryController.createNewCategory);
router.put('/update/:categoryId/:userId', authController.isSignedIn, authController.isCorrectUserIdPassed, authController.isAdmin, categoryController.updateCategory);

module.exports = router;
