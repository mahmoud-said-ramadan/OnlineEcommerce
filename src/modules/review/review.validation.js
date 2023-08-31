import joi from "joi";
import { generalFields } from '../../middleware/validation.js';


export const createReview = joi.object({
    productId: generalFields.id,
    comment: joi.string().min(2).max(500).required(),
    rate: joi.number().positive().min(1).max(5).required()
}).required();

export const updateReview = joi.object({
    id: generalFields.id,
    comment: joi.string().min(2).max(500),
    rate: joi.number().positive().min(1).max(5)
}).required();