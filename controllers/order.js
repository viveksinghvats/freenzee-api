const moment = require('moment/moment');
const { Cart, ProductPriceStock, ProductVariant, Order } = require('../models');
const { constants, httpConstants } = require('../utils');
const { PriorityQueue, productType } = require('../utils/constants');
const productVariant = require('../models/productVariant');
const { isValidSlot, checkProductAvailbility } = require('./helper/cartHelper');


exports.verifyOrder = async (req, res) => {
    try {
        const reserveTime = 10;  // TODO: reserve time needs to be configurable
        const futureSlotDays = 1;
        let productVaraintPriceQuantityMap = {};
        let cartClearObject = {
            isQuick: false,
            slots: []
        };
        if (req.body.slotDelivery && req.body.slotDelivery.length > 0) {
            for (let i = 0; i < req.body.slotDelivery.length; i++) {
                if (req.body.slotDelivery[i].stockProducts && req.body.slotDelivery[i].stockProducts.length > 0) {
                    const slotValue = req.body.slotDelivery[i].slotValue.slice(0, (req.body.slotDelivery[i].slotValue.length - 13));
                    const date = req.body.slotDelivery[i].slotValue.slice((req.body.slotDelivery[i].slotValue.length - 10), req.body.slotDelivery[i].slotValue.length);
                    if (!isValidSlot(slotValue, date, reserveTime, futureSlotDays)) {
                        return res.status(httpConstants.BAD_REQUEST_400).send({
                            isSlotExpired: true,
                            message: `${slotValue} expired`
                        });
                    }
                    req.body.slotDelivery[i].stockProducts.map(product => {
                        if (!productVaraintPriceQuantityMap[product.productVariantId]) {
                            productVaraintPriceQuantityMap[product.productVariantId] = {};
                            productVaraintPriceQuantityMap[product.productVariantId].unitPrice = product.unitPrice;
                            productVaraintPriceQuantityMap[product.productVariantId].quantity = product.allAddedQuantities;
                        } else {
                            productVaraintPriceQuantityMap[product.productVariantId].quantity += product.allAddedQuantities;
                        }
                    });
                    cartClearObject.slots.push({
                        slotValue: slotValue,
                        date: date
                    });
                }
            }
        }
        if (req.body.quickDelivery && req.body.quickDelivery.stockProducts && req.body.quickDelivery.stockProducts.length > 0) {
            req.body.quickDelivery.stockProducts.map(product => {
                if (!productVaraintPriceQuantityMap[product.productVariantId]) {
                    productVaraintPriceQuantityMap[product.productVariantId] = {};
                    productVaraintPriceQuantityMap[product.productVariantId].unitPrice = product.unitPrice;
                    productVaraintPriceQuantityMap[product.productVariantId].quantity = product.allAddedQuantities;
                } else {
                    productVaraintPriceQuantityMap[product.productVariantId].quantity += product.allAddedQuantities;
                }
            });
            cartClearObject.isQuick = true;
        }
        const productPriceStocks = await ProductPriceStock.find({
            productVariantId: Object.keys(productVaraintPriceQuantityMap),
            shopId: req.shop.id,
        }).exec();

        const productStockMap = productPriceStocks.reduce((acc, productStock) => {
            acc[productStock.productVariantId] = productStock;
            return acc;
        }, {});
        const productVariantIds = Object.keys(productVaraintPriceQuantityMap);
        for (let i = 0; i < productVariantIds.length; i++) {
            const productPriceStock = productStockMap[productVariantIds[i]];
            const cartProductPriceStock = productVaraintPriceQuantityMap[productVariantIds[i]];
            if (cartProductPriceStock.unitPrice != productPriceStock.price) {
                return res.status(httpConstants.BAD_REQUEST_400).send({
                    isOrderValueChanged: true,
                    message: 'Order Amount change'
                });
            }
            if (productPriceStock.productType == productType.FOOD && !productPriceStock.isProductAvailable) {
                return res.status(httpConstants.BAD_REQUEST_400).send({
                    isItemUnavailable: true,
                    message: 'Item no longer available'
                });
            }
            if (productPriceStock.productType == productType.GROCERY && (!(productPriceStock.stock > cartProductPriceStock.quantity) || !productPriceStock.isProductAvailable)) {
                return res.status(httpConstants.BAD_REQUEST_400).send({
                    isStockExpired: true,
                    message: 'Item stock expired'
                });
            }
        }
        if (req.body.isVerify) {
            return res.status(httpConstants.OK_200).send({
                message: 'All details are valid'
            });
        } else {
            const orderObjects = [];
            if (req.body.quickDelivery && req.body.quickDelivery.stockProducts && req.body.quickDelivery.stockProducts.length > 0) {
                const quickOrderObject = {
                    products: req.body.quickDelivery.stockProducts.reduce((acc, current) => {
                        acc.push({
                            productVariantId: current.productVariantId,
                            quantity: current.unitPrice
                        });
                        return acc;
                    }, []),
                    user: req.profile.id,
                    total: req.body.quickDelivery.total,
                    transcationId: req.body.transcationId
                };
                orderObjects.push(quickOrderObject);
            }
            if (req.body.slotDelivery && req.body.slotDelivery.length > 0) {
                req.body.slotDelivery.map((slot) => {
                    if (slot.stockProducts && slot.stockProducts.length > 0) {
                        const slotOrderObject = {
                            products: slot.stockProducts.reduce((acc, current) => {
                                acc.push({
                                    productVariantId: current.productVariantId,
                                    quantity: current.unitPrice
                                });
                                return acc;
                            }, []),
                            user: req.profile.id,
                            total: slot.total,
                            isQuick: false,
                            slotValue: slot.slotValue,
                            transcationId: req.body.transcationId
                        };
                        orderObjects.push(slotOrderObject);
                    }
                });
            }
            await Order.insertMany(orderObjects).then(async (result) => {
                let userCart = await Cart.findOne({ userId: req.profile.id }).exec();
                if (cartClearObject) {
                    if (cartClearObject.isQuick) {
                        userCart.quickDeliveryProducts = null;
                    }
                    if (cartClearObject.slots && cartClearObject.slots.length > 0) {
                        const slotValueMap = cartClearObject.slots.reduce((acc, current) => {
                            acc[`${current.slotValue} : ${current.date}`] = current;
                            return acc;
                        }, {});
                        userCart.slotsProducts = userCart.slotsProducts.filter(item => !slotValueMap[`${item.slotValue} : ${item.date}`]);
                        await userCart.save();
                    }
                }
                return res.status(httpConstants.OK_200).send({
                    message: 'Order placed'
                });
            }).catch(err => {
                return res.status(httpConstants.INTERNAL_SERVER_ERROR_500).json({
                    error: err.message
                });
            });
        }

    } catch (err) {
        return res.status(httpConstants.INTERNAL_SERVER_ERROR_500).json({ message: err.message });
    }
}
