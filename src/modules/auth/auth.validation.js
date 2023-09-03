import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const signUp = joi.object({
    userName: joi.string().trim().min(3).max(25).required(),
    email: generalFields.email.lowercase(),
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')),
    phone: joi.string().trim().pattern(/^\+?[1-9]\d{1,11}$/).required(),
    gender: joi.string().trim().valid('male', 'female').default('male').lowercase(),
    DOB: generalFields.DOB,
    file: generalFields.file,
    address: joi.string().trim().max(250),
}).required()

export const logIn = joi.object({
    email: generalFields.email,
    password: generalFields.password,
}).required()

export const forgetPassword = joi.object({
    email: generalFields.email,
}).required()

export const resetPassword = joi.object({
    newPassword: generalFields.password,
    cNewPassword: generalFields.cPassword.valid(joi.ref('newPassword')),
}).required()