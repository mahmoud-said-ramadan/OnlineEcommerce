import subCategory from '../subcategory/subcategory.router.js'
import * as categoryController from '../category/controller/category.js'
import * as commonValidation from '../../utils/handlers/commonValidation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import { auth, roles } from '../../middleware/auth.js';
import { endPoint } from './category.endPoint.js';
const router = Router({ caseSensitive: false })


router.use('/:categoryId/subCategory', subCategory)


router.route('/')
    .get(
        categoryController.getCategories
    )
    .post(
        auth(endPoint.create),
        fileUpload(fileValidation.image).single('image'),
        validation(commonValidation.validateCreate),
        categoryController.createCategory
    )

router.route('/:id')
    .put(
        auth(endPoint.update),
        fileUpload(fileValidation.image).single('image'),
        validation(commonValidation.validateUpdate),
        categoryController.updateCategory
    )
    .patch(
        auth(endPoint.update),
        validation(commonValidation.validateId),
        categoryController.softDeleteCategory
    )
    .delete(
        auth(endPoint.delete),
        validation(commonValidation.validateId),
        categoryController.deleteCategory
    )


export default router