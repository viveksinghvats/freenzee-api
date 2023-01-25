var express = require("express");
var router = express.Router();
const { check } = require("express-validator");
const { authController } = require("../controllers/index");

router.post(
    "/signup",
    [
        check("firstName", "name should be at least 3 char").isLength({ min: 3 }),
        check("email", "email is required").isEmail(),
        check("password", "password should be at least 3 char").isLength({ min: 3 })
    ],
    authController.signup
);

router.post(
    "/signin",
    [
        check("email", "email is required").isEmail(),
        check("password", "password field is required").isLength({ min: 1 })
    ],
    authController.signin
);

router.post(
    "/category",
    authController.isSignedIn,
    authController.isAuthenticated,
    authController.isAdmin,
    authController.signin
  );

router.get("/signout", authController.signout);

module.exports = router;