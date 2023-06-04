const moment = require('moment/moment');
const { Cart, ProductPriceStock } = require('../models');
const { productType } = require('../utils/constants');
const httpConstants = require('../utils/httpConstants');
const { validateAddProductToCart } = require('./helper/cartHelper');

exports.updateProductToCart = async (req, res) => {
    try {
        const { error } = validateAddProductToCart(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        const userCart = await Cart.findOne({ userId: req.profile.id }).populate({
            path: 'quickDeliveryProducts',
            populate: {
                path: 'productPriceStockId',
                model: 'ProductPriceStock'
            }
        }).exec();
        if (!userCart) {
            req.body.userId = req.profile.id;
            if (!req.body.isAdd) {
                return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'No user cart found' });
            }
            const productStock = await ProductPriceStock.findOne({
                productVariantId: req.body.productVariantId,
                shopId: req.body.shopId
            });
            if (!productStock) {
                return res.status(httpConstants.BAD_REQUEST_400).json({error: 'Invalid productVariantId passed'});
            } else{
                if(productStock.productType == productType.FOOD && !productStock.isProductAvailable){
                    return res.status(httpConstants.BAD_REQUEST_400).json({error: 'Product is no longer available'}); 
                } else if(productStock.productType == productType.GROCERY && (!(productStock.stock > 0) || !productStock.isProductAvailable)){
                    return res.status(httpConstants.BAD_REQUEST_400).json({error: 'Product is out of stock'});
                }
                if(req.body.isQuickDelivery){
                    req.body.quickDeliveryProducts = [
                        {
                            productVariantId: req.body.productVariantId,
                            quantity: 1 
                        }
                    ]
                    req.body.slotProducts = [];
                } else{
                    if(!req.body.slotValue){
                        res.status(httpConstants.BAD_REQUEST_400).json({
                            error: 'Slot value cannot be empty if not quick delivery'
                        });
                    }
                    try {
                        let time = Number(req.body.slotValue.slice(0,1));
                        let clock = req.body.slotValue.slice(1,3);

                        let dateCheck = moment(req.body.date).format('DD/MM/YYYY');
                        const error = 1; 
                    } catch (error) {
                        res.status(httpConstants.BAD_REQUEST_400).json({
                            error: 'dd-mm-yyyy date format is supported only'
                        });
                    }
                }
            }
            let userCart = Cart(req.body); 
            userCart.save((error, userCart) => {
                if (error) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update userCart'
                    })
                }
                res.status(httpConstants.OK_200).json({ userCart });
            });
        }
    } catch (error) {
        console.log(error);
    }
}