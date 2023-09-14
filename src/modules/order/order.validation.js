import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'



export const createOrder = joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    note: joi.string().min(0),
    address: joi.string().min(1).required(),
    phone: joi.array().items(
        joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/))
    ).min(1).max(3),
    coupon: joi.string(),
    paymentType: joi.string().valid('cash', 'card'),
    products: joi.array().items(
        joi.object({
            productId: generalFields.id,
            quantity: joi.number().positive().integer().min(1).required()
        }).required()
    ).min(1)
}).required()


export const cancelOrder = joi.object({
    // reason: joi.string().min(1).required(),
    id: generalFields.id,
}).required()


export const updateStatus = joi.object({
    status: joi.string().valid('waitPayment', 'placed', 'canceled', 'onWay', 'rejected', 'delivered').required(),
    id: generalFields.id,
}).required()