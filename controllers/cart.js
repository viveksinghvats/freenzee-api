const moment = require('moment/moment');
const { Cart, ProductPriceStock, ProductVariant } = require('../models');
const { constants, httpConstants } = require('../utils');
const { validateAddProductToCart, isValidSlot, checkProductAvailbility } = require('./helper/cartHelper');
const { PriorityQueue, productType } = require('../utils/constants');
const productVariant = require('../models/productVariant');

exports.updateProductToCart = async (req, res) => {
    try {
        req.body.shopId = req.shop.id;
        const { error } = validateAddProductToCart(req.body);
        if (error) {
            return res.status(httpConstants.BAD_REQUEST_400).send({
                status: false,
                message: error.message
            });
        }
        let dateCheck = moment(req.body.date, 'DD/MM/YYYY').endOf('day');
        let currentDate = moment(new Date()).startOf('day');
        if (!dateCheck.isValid()) {
            return res.status(httpConstants.BAD_REQUEST_400).json({
                error: 'DD/MM/YYYY date format is supported only'
            });
        }
        if (dateCheck.isBefore(currentDate)) {
            return res.status(httpConstants.BAD_REQUEST_400).json({
                error: 'Old date passed'
            });
        }
        const reserveTime = 10;  // TODO: reserve time needs to be configurable
        const futureSlotDays = 1;
        let checkProductAvail = true;
        let userCart = await Cart.findOne({ userId: req.profile.id }).populate({
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
            const productStock = await findProductVariantDetails(req.body.productVariantId, req.body.shopId);
            if (!productStock) {
                return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Invalid productVariantId passed' });
            } else {
                let response = checkProductAvailbility(productStock);
                if (!response.status) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({ message: response.message });
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
                    if (isValidSlot(req.body.slotValue, req.body.date, reserveTime, futureSlotDays)) {
                        req.body.slotsProducts = [
                            {
                                slotValue: req.body.slotValue,
                                date: req.body.date,
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
                    return res.status(httpConstants.INTERNAL_SERVER_ERROR_500).json({
                        error: 'Not able to update userCart'
                    })
                }
                return res.status(httpConstants.OK_200).json({ userCart });
            });
        } else {
            let productQuantityMap = {};
            if (userCart.quickDeliveryProducts.length > 0) {
                const quickProducts = userCart.quickDeliveryProducts;
                for (let i = 0; i < quickProducts.length; i++) {
                    productQuantityMap[quickProducts[i].productVariantId] = {
                        quantities: {
                            'Quick': quickProducts[i].quantity
                        },
                        total: quickProducts[i].quantity
                    };
                }
            }
            let slotProducts = new PriorityQueue();
            if (userCart.slotsProducts.length > 0) {
                for (let i = 0; i < userCart.slotsProducts.length; i++) {
                    if (userCart.slotsProducts[i].products.length > 0) {
                        if (isValidSlot(userCart.slotsProducts[i].slotValue, userCart.slotsProducts[i].date, reserveTime, futureSlotDays)) {
                            for (let j = 0; j < userCart.slotsProducts[i].products.length; j++) {
                                let previousQuantities = productQuantityMap[userCart.slotsProducts[i].products[j].productVariantId];
                                if (previousQuantities) {
                                    previousQuantities.quantities[userCart.slotsProducts[i].slotValue + " : " + userCart.slotsProducts[i].date] = userCart.slotsProducts[i].products[j].quantity;
                                    previousQuantities.total += userCart.slotsProducts[i].products[j].quantity;
                                    productQuantityMap[userCart.slotsProducts[i].products[j].productVariantId] = previousQuantities;
                                } else {
                                    productQuantityMap[userCart.slotsProducts[i].products[j].productVariantId] = {
                                        quantities: {
                                            [userCart.slotsProducts[i].slotValue + " : " + userCart.slotsProducts[i].date]: userCart.slotsProducts[i].products[j].quantity
                                        },
                                        total: userCart.slotsProducts[i].products[j].quantity
                                    };
                                }
                            }
                            slotProducts.push(convertSlotValueToDate(userCart.slotsProducts[i].date, userCart.slotsProducts[i].slotValue), userCart.slotsProducts[i]);
                        }
                    }
                }
            }
            slotProducts = slotProducts.convertArray();
            userCart.slotsProducts = slotProducts;
            if (req.body.isAdd && productQuantityMap[req.body.productVariantId]) {
                let productPriceStock = await ProductPriceStock.findOne({
                    productVariantId: req.body.productVariantId,
                    shopId: req.body.shopId
                });
                if (productPriceStock.isProductAvailable) {
                    checkProductAvail = false;
                    if (productPriceStock.productType === productType.GROCERY) {
                        let temp = productQuantityMap[req.body.productVariantId];
                        if ((temp.total + 1) > productPriceStock.stock) {
                            temp.availableStock = productPriceStock.stock;
                            return res.status(httpConstants.BAD_REQUEST_400).json({ data: temp });
                        }
                    }
                }
            }

            if (!req.body.isQuickDelivery) {
                if (!req.body.slotValue) {
                    res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Slot value cannot be empty if not quick delivery'
                    });
                }
                if (isValidSlot(req.body.slotValue, req.body.date, reserveTime, futureSlotDays)) {
                    if (req.body.isAdd && checkProductAvail) {
                        const productStock = await findProductVariantDetails(req.body.productVariantId, req.body.shopId);
                        if (!productStock) {
                            return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Invalid productVariantId passed' });
                        }
                        const tempRes = checkProductAvailbility(productStock, res);
                        if (!tempRes.status) {
                            return res.status(httpConstants.IM_USED_226).json({ message: tempRes.message });
                        }
                    }
                    let slotValues = userCart.slotsProducts;
                    if (slotValues.length > 0) {
                        let isSlotFound = false;
                        for (let i = 0; i < slotValues.length; i++) {
                            if (slotValues[i].date == req.body.date && slotValues[i].slotValue == req.body.slotValue) {
                                isSlotFound = true;
                                let isProductExists = false;
                                for (let j = 0; j < slotValues[i].products.length; j++) {
                                    if (slotValues[i].products[j].productVariantId == req.body.productVariantId) {
                                        isProductExists = true;
                                        if (req.body.isAdd) {
                                            slotValues[i].products[j].quantity += 1;
                                        } else {
                                            if (slotValues[i].products[j].quantity > 1) {
                                                slotValues[i].products[j].quantity -= 1;
                                            } else {
                                                slotValues[i].products[j] = null;
                                            }
                                        }
                                        break;
                                    }
                                }
                                let products = [];
                                for (let j = 0; j < slotValues[i].products.length; j++) {
                                    if (slotValues[i].products[j] != null) {
                                        products.push(slotValues[i].products[j]);
                                    }
                                }
                                if (products.length > 0) {
                                    slotValues[i].products = products;
                                    if (!isProductExists) {
                                        if (req.body.isAdd) {
                                            slotValues[i].products.push({
                                                productVariantId: req.body.productVariantId,
                                                quantity: 1
                                            });
                                        } else {
                                            return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                                        }
                                    }
                                } else {
                                    slotValues[i] = null;
                                }
                                break;
                            }
                        }
                        if (!isSlotFound) {
                            if (req.body.isAdd) {
                                slotValues.push({
                                    slotValue: req.body.slotValue,
                                    date: req.body.date,
                                    products: [{
                                        productVariantId: req.body.productVariantId,
                                        quantity: 1
                                    }]
                                });
                            } else {
                                return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                            }
                        }
                    } else {
                        if (req.body.isAdd) {
                            slotValues = [{
                                slotValue: req.body.slotValue,
                                date: req.body.date,
                                products: [{
                                    productVariantId: req.body.productVariantId,
                                    quantity: 1
                                }]
                            }];
                        } else {
                            return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                        }
                    }
                    let slotData = [];
                    for (let j = 0; j < slotValues.length; j++) {
                        if (slotValues[j] != null) {
                            slotData.push(slotValues[j]);
                        }
                    }
                    userCart.slotsProducts = slotData;
                } else {
                    return res.status(httpConstants.BAD_REQUEST_400).json({ message: 'Slot no longer available to book' });
                }
            } else {
                if (req.body.isAdd && checkProductAvail) {
                    const productStock = await findProductVariantDetails(req.body.productVariantId, req.body.shopId);
                    if (!productStock) {
                        return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Invalid productVariantId passed' });
                    }
                    let tempRes = checkProductAvailbility(productStock, res);
                    if (!tempRes.status) {
                        return res.status(httpConstants.STAT_226_IM_USED).json({ message: tempRes.message });
                    }
                }
                let quickDeliveryProducts = userCart.quickDeliveryProducts;
                if (quickDeliveryProducts.length > 0) {
                    let isProductExists = false;
                    for (let i = 0; i < quickDeliveryProducts.length; i++) {
                        if (quickDeliveryProducts[i].productVariantId == req.body.productVariantId) {
                            isProductExists = true;
                            if (req.body.isAdd) {
                                quickDeliveryProducts[i].quantity += 1;
                            } else {
                                if (quickDeliveryProducts[i].quantity > 1) {
                                    quickDeliveryProducts[i].quantity -= 1;
                                } else {
                                    quickDeliveryProducts[i] = null;
                                }
                            }
                            break;
                        }
                    }
                    if (!isProductExists) {
                        if (req.body.isAdd) {
                            quickDeliveryProducts.push({
                                productVariantId: req.body.productVariantId,
                                quantity: 1
                            });
                        } else {
                            return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                        }
                    }
                } else {
                    if (req.body.isAdd) {
                        quickDeliveryProducts = [{
                            productVariantId: req.body.productVariantId,
                            quantity: 1
                        }];
                    } else {
                        return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                    }
                }
                let temp = [];
                for (let i = 0; i < quickDeliveryProducts.length; i++) {
                    if (quickDeliveryProducts[i] != null) {
                        temp.push(quickDeliveryProducts[i]);
                    }
                }
                userCart.quickDeliveryProducts = temp;
            }
            await userCart.save();
            let result;
            if (productQuantityMap[req.body.productVariantId]) {
                result = productQuantityMap[req.body.productVariantId];
                if (req.body.isQuickDelivery) {
                    if (result.quantities['Quick']) {
                        if (req.body.isAdd) {
                            result.quantities['Quick'] += 1;
                            result.total += 1;
                        } else {
                            if (result.quantities['Quick'] > 1) {
                                result.quantities['Quick'] -= 1;
                            } else {
                                delete result.quantities['Quick'];
                            }
                            result.total -= 1;
                        }
                    } else {
                        result.quantities['Quick'] = 1;
                        result.total += 1;
                    }
                } else {
                    if (result.quantities[`${req.body.slotValue} : ${req.body.date}`]) {
                        if (req.body.isAdd) {
                            result.quantities[`${req.body.slotValue} : ${req.body.date}`] += 1;
                            result.total += 1;
                        } else {
                            if (result.quantities[`${req.body.slotValue} : ${req.body.date}`] > 1) {
                                result.quantities[`${req.body.slotValue} : ${req.body.date}`] -= 1;
                            } else {
                                delete result.quantities[`${req.body.slotValue} : ${req.body.date}`];
                            }
                            result.total -= 1;
                        }
                    } else {
                        result.quantities[`${req.body.slotValue} : ${req.body.date}`] = 1;
                        result.total += 1;
                    }
                }
            } else {
                if (req.body.isQuickDelivery) {
                    result = {
                        quantities: {
                            'Quick': 1
                        },
                        total: 1
                    }
                } else {
                    result = {
                        quantities: {
                            [`${req.body.slotValue} : ${req.body.date}`]: 1
                        },
                        total: 1
                    }
                }
            }
            return res.status(httpConstants.OK_200).json({ data: result });
        }
    } catch (err) {
        return res.status(httpConstants.INTERNAL_SERVER_ERROR_500).json({ message: err.message });
    }
}

exports.getUserCart = async (req, res) => {
    try {
        let userCart = await Cart.findOne({ userId: req.profile.id }).populate({
            path: 'quickDeliveryProducts',
            populate: {
                path: 'productPriceStockId',
                model: 'ProductPriceStock'
            }
        }).exec();
        const reserveTime = 10;  // TODO: reserve time needs to be configurable
        const futureSlotDays = 1;
        let productQuantityMap = {};
        if (userCart.quickDeliveryProducts.length > 0) {
            const quickProducts = userCart.quickDeliveryProducts;
            for (let i = 0; i < quickProducts.length; i++) {
                productQuantityMap[quickProducts[i].productVariantId] = {
                    quantities: {
                        'Quick': quickProducts[i].quantity
                    },
                    total: quickProducts[i].quantity
                };
            }
        }

        let slotProducts = new PriorityQueue();
        if (userCart.slotsProducts.length > 0) {
            for (let i = 0; i < userCart.slotsProducts.length; i++) {
                if (userCart.slotsProducts[i].products.length > 0) {
                    if (isValidSlot(userCart.slotsProducts[i].slotValue, userCart.slotsProducts[i].date, reserveTime, futureSlotDays)) {
                        for (let j = 0; j < userCart.slotsProducts[i].products.length; j++) {
                            let previousQuantities = productQuantityMap[userCart.slotsProducts[i].products[j].productVariantId];
                            if (previousQuantities) {
                                previousQuantities.quantities[userCart.slotsProducts[i].slotValue + " : " + userCart.slotsProducts[i].date] = userCart.slotsProducts[i].products[j].quantity;
                                previousQuantities.total += userCart.slotsProducts[i].products[j].quantity;
                                productQuantityMap[userCart.slotsProducts[i].products[j].productVariantId] = previousQuantities;
                            } else {
                                productQuantityMap[userCart.slotsProducts[i].products[j].productVariantId] = {
                                    quantities: {
                                        [userCart.slotsProducts[i].slotValue + " : " + userCart.slotsProducts[i].date]: userCart.slotsProducts[i].products[j].quantity
                                    },
                                    total: userCart.slotsProducts[i].products[j].quantity
                                };
                            }
                        }
                        slotProducts.push(convertSlotValueToDate(userCart.slotsProducts[i].date, userCart.slotsProducts[i].slotValue), userCart.slotsProducts[i]);
                    }
                }
            }
        }
        slotProducts = slotProducts.convertArray();
        userCart.slotsProducts = slotProducts;
        const allProductStock = await ProductPriceStock.find({
            productVariantId: Object.keys(productQuantityMap),
            shopId: req.shop.id,
        }).populate({
            path: 'productVariantId',
            populate: {
                path: 'productId'
            }
        }).exec();
        let allProductStockMap = {};
        allProductStock.map(productStock => {
            allProductStockMap[productStock.productVariantId.id] = productStock;
        });
        await userCart.save();
        const responseCart = userCart;
        // Transforming the response as per UI
        let result = {};
        // For Quick delivery only
        if (responseCart.quickDeliveryProducts && responseCart.quickDeliveryProducts.length > 0) {
            const quickProducts = responseCart.quickDeliveryProducts;
            for (let i = 0; i < quickProducts.length; i++) {
                if (i == 0) {
                    result['quickDelivery'] = {
                        stockProducts: [],
                        outOfStockProducts: [],
                        needAttentionProducts: [],
                        total: 0
                    }
                }
                const productStockDetails = allProductStockMap[quickProducts[i].productVariantId];
                if (productStockDetails && productStockDetails.isProductAvailable) {
                    const currentQuantity = quickProducts[i].quantity;
                    const totalQuantityAdded = productQuantityMap[quickProducts[i].productVariantId].total;
                    if (productStockDetails.productType === productType.FOOD) {
                        const itemTotal = currentQuantity * productStockDetails.price;
                        result.quickDelivery.total = Number(Number(result.quickDelivery.total + itemTotal).toFixed(2));
                        result.quickDelivery.stockProducts.push({
                            productVariantId: productStockDetails.productVariantId,
                            addedQuantity: currentQuantity,
                            allAddedQuantities: totalQuantityAdded,
                            productType: productType.FOOD,
                            availableStock: 0,
                            unitPrice: productStockDetails.price,
                            itemTotal: itemTotal,
                            productDetails: productStockDetails.productVariantId
                        });
                    } else if (productStockDetails.productType === productType.GROCERY) {
                        if (totalQuantityAdded <= productStockDetails.stock) {
                            const itemTotal = currentQuantity * productStockDetails.price;
                            result.quickDelivery.total = Number(Number(result.quickDelivery.total + itemTotal).toFixed(2));
                            result.quickDelivery.stockProducts.push({
                                productVariantId: productStockDetails.productVariantId,
                                addedQuantity: currentQuantity,
                                allAddedQuantities: totalQuantityAdded,
                                productType: productType.GROCERY,
                                availableStock: productStockDetails.stock,
                                unitPrice: productStockDetails.price,
                                itemTotal: itemTotal,
                                productDetails: productStockDetails.productVariantId
                            });
                        } else {
                            result.quickDelivery.needAttentionProducts.push({
                                productVariantId: productStockDetails.productVariantId,
                                addedQuantity: currentQuantity,
                                allAddedQuantities: totalQuantityAdded,
                                productType: productType.GROCERY,
                                availableStock: productStockDetails.stock,
                                productDetails: productStockDetails.productVariantId
                            });
                        }
                    }
                } else if (productStockDetails) {
                    result.quickDelivery.outOfStockProducts.push({
                        productVariantId: productStockDetails.productVariantId,
                        productDetails: productStockDetails.productVariantId
                    });
                }
            }
        }
        // For SlotDelivery only
        if (responseCart.slotsProducts && responseCart.slotsProducts.length > 0) {
            const slots = responseCart.slotsProducts;
            result['slotDelivery'] = []
            for (let j = 0; j < slots.length; j++) {
                const slotValue = `${slots[j].slotValue} : ${slots[j].date}`;
                const slotProducts = slots[j].products;
                let slotResult = {
                    slotValue: slotValue,
                    stockProducts: [],
                    outOfStockProducts: [],
                    needAttentionProducts: [],
                    total: 0
                }
                for (let i = 0; i < slotProducts.length; i++) {
                    const productStockDetails = allProductStockMap[slotProducts[i].productVariantId];
                    if (productStockDetails && productStockDetails.isProductAvailable) {
                        const currentQuantity = slotProducts[i].quantity;
                        const totalQuantityAdded = productQuantityMap[slotProducts[i].productVariantId].total;
                        if (productStockDetails.productType === productType.FOOD) {
                            const itemTotal = currentQuantity * productStockDetails.price;
                            slotResult.total = Number(Number(slotResult.total + itemTotal).toFixed(2));
                            slotResult.stockProducts.push({
                                productVariantId: productStockDetails.productVariantId,
                                addedQuantity: currentQuantity,
                                allAddedQuantities: totalQuantityAdded,
                                productType: productType.FOOD,
                                availableStock: 0,
                                unitPrice: productStockDetails.price,
                                itemTotal: itemTotal,
                                productDetails: productStockDetails.productVariantId
                            });
                        } else if (productStockDetails.productType === productType.GROCERY) {
                            if (totalQuantityAdded <= productStockDetails.stock) {
                                const itemTotal = currentQuantity * productStockDetails.price;
                                slotResult.total = Number(Number(slotResult.total + itemTotal).toFixed(2));
                                slotResult.stockProducts.push({
                                    productVariantId: productStockDetails.productVariantId,
                                    addedQuantity: currentQuantity,
                                    allAddedQuantities: totalQuantityAdded,
                                    productType: productType.GROCERY,
                                    availableStock: productStockDetails.stock,
                                    unitPrice: productStockDetails.price,
                                    itemTotal: itemTotal,
                                    productDetails: productStockDetails.productVariantId
                                });
                            } else {
                                slotResult.needAttentionProducts.push({
                                    productVariantId: productStockDetails.productVariantId,
                                    addedQuantity: currentQuantity,
                                    allAddedQuantities: totalQuantityAdded,
                                    productType: productType.GROCERY,
                                    availableStock: productStockDetails.stock,
                                    productDetails: productStockDetails.productVariantId
                                });
                            }
                        }
                    } else if (productStockDetails) {
                        slotResult.outOfStockProducts.push({
                            productVariantId: productStockDetails.productVariantId,
                            productDetails: productStockDetails.productVariantId
                        });
                    }
                }
                result.slotDelivery.push(slotResult);
            }
        }
        return res.status(httpConstants.OK_200).json({ data: result });
    } catch (err) {
        return res.status(httpConstants.INTERNAL_SERVER_ERROR_500).json({ message: err.message });
    }
}

async function findProductVariantDetails(productVariantId, shopId) {
    const product = await ProductPriceStock.findOne({
        productVariantId: productVariantId,
        shopId: shopId
    });
    return product;
}

function convertSlotValueToDate(date, slotValue) {
    let is2Digits = slotValue.length == 4;
    let time = is2Digits ? Number(slotValue.slice(0, 2)) : Number(slotValue.slice(0, 1));
    let clock = is2Digits ? slotValue.slice(2, 4) : slotValue.slice(1, 3);
    return moment(date, 'DD/MM/YYYY').startOf('day').add(clock === constants.clockValue.AM ? time : (12 + time), 'hours');
}
