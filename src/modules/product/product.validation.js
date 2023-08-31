import joi from "joi";
import { generalFields } from "../../middleware/validation.js";





export const createProduct = joi.object({
    name: joi.string().trim().min(3).max(150).required(),
    description: joi.string().trim().min(3).max(15000),
    stock: joi.number().integer().positive().min(1).required(),
    price: joi.number().integer().positive().min(1).required(),
    discount: joi.number().positive().min(1),
    sizes: joi.array(),
    colors: joi.array(),
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
    file: joi.object({
        mainImage: joi.array().items(generalFields.file.required()).length(1).required(),
        subImages: joi.array().items(generalFields.file).min(1).max(5),
    }),
}).required()


export const updateProduct = joi.object({
    id: generalFields.id,
    name: joi.string().trim().min(3).max(150),
    description: joi.string().trim().min(3).max(15000),
    stock: joi.number().integer().positive().min(1),
    price: joi.number().integer().positive().min(1),
    discount: joi.number().positive().min(1),
    sizes: joi.array(),
    colors: joi.array(),
    // brandId: generalFields.idNotRequired,
    file: joi.object({
        mainImage: joi.array().items(generalFields.file).length(1),
        subImages: joi.array().items(generalFields.file).min(1).max(5),
    }),
}).required()