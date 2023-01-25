const { Shop } = require("../models")
const httpConstants = require('../utils/httpConstants');
const { validateShopBody } = require("./helper/shopHelper");

exports.getShopById = (req, res, next, id) => {
Shop.findById(id).exec((err, shop) => {
    if(err|| !shop){
        return res.status(400).json({
            error: "No shop was found in DB"
          });
    }
    req.shop = shop;
    next();
});
}

exports.createShop = (req, res) => {
    try{
      const {error} = validateShopBody(req.body); 
      if (error) {
        return res.status(httpConstants.BAD_REQUEST_400).send({
          status: false,
          message: error.details[0].message
        });
      } 
    } catch(err){
        console.log(err);
    }
}