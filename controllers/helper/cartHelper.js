const Joi = require("joi");
const moment = require('moment/moment');
const { constants, httpConstants } = require('../../utils');


function validateAddProductToCart(categoryDetails) {
    const schema = Joi.object({
        shopId: Joi.string().required().error(() => new Error('ShopId is a required field')),
        isQuickDelivery: Joi.boolean().required().error(() => new Error('IsQuickDelivery is a required field')),
        slotValue: Joi.string().error(() => new Error('Slot value is a string field')),
        date: Joi.string().required().error(() => new Error('Date is a required field')),  // dd-mm-yyyy
        productVariantId: Joi.string().required(() => new Error('ProductVariantId is a required field')),
        isAdd: Joi.boolean().required(() => new Error('IsAdd is a required field'))

    });
    return schema.validate(categoryDetails, { allowUnknown: true });
}

function isValidSlot(slotValue, date, reserveTime, futureSlotDays) {
    try {
        if (moment(date, 'DD/MM/YYYY') > moment(new Date()).add(futureSlotDays, 'days')) {
            return false;
        }
        let is2Digits = slotValue.length == 4;
        let time = is2Digits ? Number(slotValue.slice(0, 2)) : Number(slotValue.slice(0, 1));
        let clock = is2Digits ? slotValue.slice(2, 4) : slotValue.slice(1, 3);
        const slotDate = moment(date, 'DD/MM/YYYY').startOf('day').add(clock === constants.clockValue.AM ? time : (12 + time), 'hours');
        if (moment().add(reserveTime, 'minutes') < slotDate) {
            return true;
        }
        else return false;
    } catch (error) {
        return false;
    }
}

function checkProductAvailbility(productStock) {
    let message;
    let status = true;
    if (productStock.productType == constants.productType.FOOD && !productStock.isProductAvailable) {
        message = 'Product is no longer available';
        status = false;
    } else if (productStock.productType == constants.productType.GROCERY && (!(productStock.stock > 0) || !productStock.isProductAvailable)) {
        message = 'Product is out of stock';
        status = false;
    }
    return {
        status: status,
        message: message
    }
}


module.exports = {
    validateAddProductToCart,
    isValidSlot,
    checkProductAvailbility
}