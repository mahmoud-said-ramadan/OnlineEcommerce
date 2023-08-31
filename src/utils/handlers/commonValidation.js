import joi from "joi"
import { generalFields } from "../../middleware/validation.js"


export const validateId = joi.object({
    id: generalFields.id,
}).required()

export const validateCreate = joi.object({
    name: joi.string().trim().min(3).max(25).required(),
    file: generalFields.file.required()
}).required();

export const validateUpdate = joi.object({
    id: generalFields.id,
    name: joi.string().trim().min(3).max(25),
    file: generalFields.file
}).required();