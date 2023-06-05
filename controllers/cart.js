const moment = require('moment/moment');
const { Cart, ProductPriceStock } = require('../models');
const { constants, httpConstants } = require('../utils');
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
                return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Invalid productVariantId passed' });
            } else {
                if (productStock.productType == constants.productType.FOOD && !productStock.isProductAvailable) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Product is no longer available' });
                } else if (productStock.productType == constants.productType.GROCERY && (!(productStock.stock > 0) || !productStock.isProductAvailable)) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Product is out of stock' });
                }
                if (req.body.isQuickDelivery) {
                    req.body.quickDeliveryProducts = [
                        {
                            productVariantId: req.body.productVariantId,
                            quantity: 1
                        }
                    ]
                    req.body.slotProducts = [];
                } else {
                    if (!req.body.slotValue) {
                        res.status(httpConstants.BAD_REQUEST_400).json({
                            error: 'Slot value cannot be empty if not quick delivery'
                        });
                    }
                    let dateCheck = moment(req.body.date, 'DD/MM/YYYY');
                    if (!dateCheck.isValid()) {
                        return res.status(httpConstants.BAD_REQUEST_400).json({
                            error: 'DD/MM/YYYY date format is supported only'
                        });
                    }
                    if (isValidSlot(req.body.slotValue, req.body.date, 10)) // TODO: reserve time needs to be configurable
                    {
                       req.body.slotsProducts = [
                        {
                            slotValue: req.body.slotValue,
                            date:  req.body.date,
                            products: [
                                {
                                    productVariantId: req.body.productVariantId,
                                    quantity: 1
                                }
                            ]
                        }
                       ]
                       req.body.quickDeliveryProducts = [];
                    } else {
                       return res.status(httpConstants.BAD_REQUEST_400).json({ message: 'Slot no longer available to book' });
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

function isValidSlot(slotValue, date, reserveTime) {
    let time = Number(slotValue.slice(0, 1));
    let clock = slotValue.slice(1, 3);
    const slotDate = moment(date, 'DD/MM/YYYY').startOf('day').add(clock === constants.clockValue.AM ? time : (12 + time), 'hours');
    if (moment().add(reserveTime, 'minutes') < slotDate) {
        return true;
    }
    else return false;

}