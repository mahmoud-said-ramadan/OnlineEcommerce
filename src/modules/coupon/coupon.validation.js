import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'



export const createCoupon = joi.object({
    name: joi.string().trim().min(3).max(25).required(),
    amount: joi.number().positive().min(1).required(),
    expireDate: joi.date().greater(Date.now()),
    file: generalFields.file
}).required();

export const updateCoupon = joi.object({
    id: generalFields.id,
    name: joi.string().trim().min(3).max(25),
    amount: joi.number().positive().min(1),
    expireDate: joi.date().greater(Date.now()),
    file: generalFields.file
}).required();