var express = require("express");
const { getUserById } = require("../controllers/user");
var router = express.Router();

// params

router.param('userId', getUserById);

module.exports = router;
