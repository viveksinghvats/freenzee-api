const { Shop } = require("../models")
const httpConstants = require('../utils/httpConstants');
const { validateShopCreateBody, validateShopUpdateBody } = require("./helper/shopHelper");

exports.canUpdateShop = (req, res, next) => {
  if (req.profile.role != 'admin') {
    Shop.findById(req.body.shopId).exec((err, shop) => { 
      if(err){
        return res.status(httpConstants.BAD_REQUEST_400).json({
          error: 'Invalid shopId'
        });
      }
      if (shop.userId != req.profile.id) {
        return res.status(httpConstants.NOT_ALLOWED_405).json({
          error: "You cannot update data, Access denied"
        });
      }
    });
    
  }
  next();
};

exports.getShopById = (req, res, next, id) => {
  Shop.findById(id).exec((err, shop) => {
    if (err || !shop) {
      return res.status(400).json({
        error: "No shop was found in DB"
      });
    }
    req.shop = shop;
    next();
  });
}

exports.createShop = (req, res) => {
  try {
    const { error } = validateShopCreateBody(req.body);
    if (error) {
      return res.status(httpConstants.BAD_REQUEST_400).send({
        status: false,
        message: error.message
      });
    }
    const shop = Shop(req.body);
    shop.save((err, shop) => {
      if (err) {
        return res.status(httpConstants.BAD_REQUEST_400).json({
          error: 'Not able to save shop details'
        });
      }
      res.status(httpConstants.OK_200).json({ shop });
    });
  } catch (err) {
    console.log(err);
  }
}

exports.updateShop = async (req, res) => {
  try {
    const { error } = validateShopUpdateBody(req.body);
    if (error) {
      return res.status(httpConstants.BAD_REQUEST_400).send({
        status: false,
        message: error.message
      });
    }
    const shop = req.shop;
    shop.shopName = req.body.shopName; 
    shop.shopNameId = req.body.shopNameId;
    if (req.profile.role == 'admin') {
      shop.userId = req.body.userId;
    }
    shop.shopHeaderAddress = req.body.shopHeaderAddress;
    shop.shopFullAddress = req.body.shopFullAddress;
    shop.contact = req.body.contact;
    shop.gstIn = req.body.gstIn;
    shop.shopMainLogo = req.body.shopMainLogo;
    shop.isShopEnable = req.body.isShopEnable;
    shop.save((err, updateShop) => {
      if (err) {
        return res.status(httpConstants.BAD_REQUEST_400).json({
          error: "Failed to update shop"
        });
      }
      res.status(httpConstants.OK_200).json({ updateShop });
    });
  } catch (err) {
    console.log(err);
  }
}

exports.disableShop = (req, res) => {
  try {
    const shop = req.shop;
    shop.isShopEnable = false;
    shop.save();
    return res.status(httpConstants.OK_200).json({
      error: "Shop Disabled"
    });
  } catch (err) {
    console.log(err);
  }
}


