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
        let dateCheck = moment(req.body.date, 'DD/MM/YYYY');
        if (!dateCheck.isValid()) {
            return res.status(httpConstants.BAD_REQUEST_400).json({
                error: 'DD/MM/YYYY date format is supported only'
            });
        }
        const reserveTime = 10;  // TODO: reserve time needs to be configurable
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
                checkProductAvailbility(productStock);
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
                    if (isValidSlot(req.body.slotValue, req.body.date, reserveTime)) {
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
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update userCart'
                    })
                }
                return res.status(httpConstants.OK_200).json({ userCart });
            });
        } else {
            if (!req.body.isQuickDelivery) {
                if (!req.body.slotValue) {
                    res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Slot value cannot be empty if not quick delivery'
                    });
                }
                if (isValidSlot(req.body.slotValue, req.body.date, reserveTime)) {
                    const productStock = await findProductVariantDetails(req.body.productVariantId, req.body.shopId);
                    if (!productStock) {
                        return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Invalid productVariantId passed' });
                    }
                    if (req.body.isAdd) {
                        checkProductAvailbility(productStock);
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
                                            if (productStock.productType == constants.productType.GROCERY) {
                                                if (productStock.stock < slotValues[i].products[j].quantity) {
                                                    return res.status(httpConstants.BAD_REQUEST_400).json({ error: `Only ${productStock.stock} available in stock` });
                                                }
                                            }
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
                                for(let j = 0; j < slotValues[i].products.length; j++){
                                  if(slotValues[i].products[j] != null){
                                    products.push(slotValues[i].products[j]);
                                  }
                                }
                                if(products.length > 0){
                                    slotValues[i].products = products;
                                    if (!isProductExists) {
                                    if(req.body.isAdd){
                                        slotValues[i].products.push({
                                        productVariantId: req.body.productVariantId,
                                        quantity: 1
                                    });
                                    } else{
                                         return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                                    }
                                }
                                } else{
                                    slotValues[i] = null;
                                }
                                break;
                            }
                        }
                        if (!isSlotFound) {
                            if(req.body.isAdd){
                                slotValues.push({
                                slotValue: req.body.slotValue,
                                date: req.body.date,
                                products: [{
                                    productVariantId: req.body.productVariantId,
                                    quantity: 1
                                }]
                            });
                            } else{
                                 return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                            }
                        }
                    } else {
                        if(req.body.isAdd){
                            slotValues = [{
                            slotValue: req.body.slotValue,
                            date: req.body.date,
                            products: [{
                                productVariantId: req.body.productVariantId,
                                quantity: 1
                            }]
                        }];
                        } else{
                            return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                        }
                    }
                    let slotData = [];
                    for(let j = 0; j < slotValues.length; j++){
                        if(slotValues[j] != null){
                            slotData.push(slotValues[j]);
                        }
                    }
                    userCart.slotsProducts = slotData;
                } else {
                    return res.status(httpConstants.BAD_REQUEST_400).json({ message: 'Slot no longer available to book' });
                }
            } else {
                const productStock = await findProductVariantDetails(req.body.productVariantId, req.body.shopId);
                if (!productStock) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Invalid productVariantId passed' });
                }
                checkProductAvailbility(productStock);
                let quickDeliveryProducts = userCart.quickDeliveryProducts;
                if (quickDeliveryProducts.length > 0) {
                    let isProductExists = false;
                    for (let i = 0; i < quickDeliveryProducts.length; i++) {
                        if (quickDeliveryProducts[i].productVariantId == req.body.productVariantId) {
                            isProductExists = true;
                            if(req.body.isAdd){
                                quickDeliveryProducts[i].quantity += 1;
                                if (productStock.productType == constants.productType.GROCERY) {
                                    if (productStock.stock < quickDeliveryProducts[i].quantity) {
                                        return res.status(httpConstants.BAD_REQUEST_400).json({ error: `Only ${productStock.stock} available in stock` });
                                    }
                                }
                            } else{
                                if(quickDeliveryProducts[i].quantity > 1){
                                    quickDeliveryProducts[i].quantity -= 1; 
                                } else{
                                    quickDeliveryProducts[i] = null;
                                }
                            }
                            break;
                        }
                    }
                    if (!isProductExists) {
                        if(req.body.isAdd){
                            quickDeliveryProducts.push({
                                productVariantId: req.body.productVariantId,
                                quantity: 1
                            });
                        } else{
                            return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                        }
                    }
                } else {
                    if(req.body.isAdd){
                        quickDeliveryProducts = [{
                            productVariantId: req.body.productVariantId,
                            quantity: 1
                        }];
                    } else{
                        return res.status(httpConstants.BAD_REQUEST_400).json({ message: `Cannot remove a product if it's not there` });
                    }
                }
                let temp = [];
                for(let i = 0; i < quickDeliveryProducts.length; i++){
                    if(quickDeliveryProducts[i] != null){
                        temp.push(quickDeliveryProducts[i]);
                    }
                }
                userCart.quickDeliveryProducts = temp;
            }
            userCart.save((error, userCart) => {
                if (error) {
                    return res.status(httpConstants.BAD_REQUEST_400).json({
                        error: 'Not able to update userCart'
                    })
                }
                return res.status(httpConstants.OK_200).json({ userCart });
            });
        }
    } catch (error) {
        console.log(error);
    }
}

async function findProductVariantDetails(productVariantId, shopId) {
    const cart = await ProductPriceStock.findOne({
        productVariantId: productVariantId,
        shopId: shopId
    });
    return cart;
}

function checkProductAvailbility(productStock) {
    if (productStock.productType == constants.productType.FOOD && !productStock.isProductAvailable) {
        return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Product is no longer available' });
    } else if (productStock.productType == constants.productType.GROCERY && (!(productStock.stock > 0) || !productStock.isProductAvailable)) {
        return res.status(httpConstants.BAD_REQUEST_400).json({ error: 'Product is out of stock' });
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