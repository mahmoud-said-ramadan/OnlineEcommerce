import * as brandController from '../brand/controller/brand.js'
import * as commonValidation from '../../utils/handlers/commonValidation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';
import { endPoint } from './brand.endPoint.js';

const router = Router({ caseSensitive: false })


router.route('/')
    .get(
        brandController.getBrands
    )
    .post(
        auth(endPoint.create),
        fileUpload(fileValidation.image).single('image'),
        validation(commonValidation.validateCreate),
        brandController.createBrand
    )

router.route('/:id')
    .put(
        auth(endPoint.update),
        fileUpload(fileValidation.image).single('image'),
        validation(commonValidation.validateUpdate),
        brandController.updateBrand
    )
    .patch(
        auth(endPoint.update),
        validation(commonValidation.validateId),
        brandController.softDeleteBrand
    )
    .delete(
        auth(endPoint.delete),
        validation(commonValidation.validateId),
        brandController.deleteBrand
    )

export default router