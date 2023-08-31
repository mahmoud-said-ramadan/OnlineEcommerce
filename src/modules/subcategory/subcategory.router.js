import * as subController from '../subcategory/controller/subCategory.js'
import * as validators from './subcategory.validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';
import { endPoint } from './subcategory.endPoint.js';
const router = Router({ mergeParams: true, caseSensitive: false })


router.route('/')
    .get(
        subController.getSubCategories
    )
    .post(
        auth(endPoint.create),
        fileUpload(fileValidation.image).single('image'),
        validation(validators.createSubCategory),
        subController.createSubCategory
    )

router.route('/:id')
    .put(
        auth(endPoint.update),
        fileUpload(fileValidation.image).single('image'),
        validation(validators.updateSubCategory),
        subController.updateSubCategory
    )
    .patch(
        auth(endPoint.update),
        validation(validators.softDeleteSubCategory),
        subController.softDeleteSubCategory
    )
    .delete(
        auth(endPoint.delete),
        validation(validators.softDeleteSubCategory),
        subController.deleteSubCategory
    )

export default router