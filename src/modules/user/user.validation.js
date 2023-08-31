import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const changePassword = joi.object({
    oldPassword: generalFields.password,
    newPassword: generalFields.password,
    cNewPassword: generalFields.cPassword.valid(joi.ref('newPassword')),
}).required()

export const changeEmail = joi.object({
    currentPassword: generalFields.password,
    newEmail: generalFields.email,
}).required()

export const updateUser = joi.object({
    userName: joi.string().trim().alphanum().min(3).max(25),
    phone: joi.string().trim().pattern(/^\+?[1-9]\d{1,11}$/),
    gender: joi.string().trim().valid('male', 'female').default('male'),
    DOB: generalFields.DOB,
    file: generalFields.file,
    address: joi.string().trim().max(250),
}).required()
