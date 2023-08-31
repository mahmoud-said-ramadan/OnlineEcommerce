import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'



export const createSubCategory = joi.object({
    categoryId: generalFields.id,
    name: joi.string().trim().min(3).max(25).required(),
    file: generalFields.file.required()
}).required();

export const updateSubCategory = joi.object({
    id: generalFields.id,
    // categoryId: generalFields.id,
    name: joi.string().trim().min(3).max(25),
    file: generalFields.file
}).required();

export const softDeleteSubCategory = joi.object({
    // categoryId: generalFields.id,
    id: generalFields.id,
}).required();

export const deleteSubCategory = joi.object({
    // categoryId: generalFields.id,
    id: generalFields.id,
}).required();