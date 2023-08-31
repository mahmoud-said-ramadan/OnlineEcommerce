import joi from 'joi'
import { Types } from 'mongoose'

// the DOB Must be a 12 years ago at least
// const yearsAgo = moment().subtract(12, 'years').startOf('day');
const currentDate = new Date();
const minAllowedDate = new Date(currentDate.getFullYear() - 12, currentDate.getMonth(), currentDate.getDate());


const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('In-valid objectId')
}

const validateDOB = (value, helper) => {
    if (value > minAllowedDate) {
        return helper.message(`Date must be less than the current date - 12 years (${minAllowedDate.format('YYYY-MM-DD')})`);
    }
    return value;
}

export const generalFields = {
    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ['com', 'net',] }
    }).required(),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
    cPassword: joi.string().required(),
    id: joi.string().custom(validateObjectId).required(),
    idNotRequired: joi.string().custom(validateObjectId),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),
    }),
    DOB: joi.date()
        .max(minAllowedDate)
        .raw()
        .custom(validateDOB),
}

export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = { ...req.body, ...req.query, ...req.params }
        if (req.file || req.files) {
            inputData.file = req.file || req.files
        }
        const validationResult = schema.validate(inputData, { abortEarly: false })
        if (validationResult.error?.details) {
            return res.status(400).json({
                message: "Validation Err",
                validationErr: validationResult.error.details
            })
        }
        return next()
    }
}