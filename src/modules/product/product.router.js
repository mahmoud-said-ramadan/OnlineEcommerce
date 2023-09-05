import * as productController from '../product/controller/product.js'
import * as validators from './product.validation.js'
import * as commonValidation from '../../utils/handlers/commonValidation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import { auth, roles } from '../../middleware/auth.js';
import { endPoint } from './product.endPoint.js';
import reviewRouter from '../review/review.router.js'
const router = Router({ caseSensitive: false })


router.use('/:productId/review', reviewRouter)


router.route('/')
    .get(productController.getProducts)
    .post(
        auth(endPoint.create),
        fileUpload(fileValidation.image).fields([
            { name: "mainImage", maxCount: 1 },
            { name: "subImages", maxCount: 5 },
        ]),
        validation(validators.createProduct),
        productController.createProduct
    )

router

router.route('/:id')
    .get(
        productController.getOneProduct)
    .put(
        auth(endPoint.update),
        fileUpload(fileValidation.image).fields([
            { name: "mainImage", maxCount: 1 },
            { name: "subImages", maxCount: 5 },
        ]),
        validation(validators.updateProduct),
        productController.updateProduct
    )
    .patch(
        auth(endPoint.update),
        validation(commonValidation.validateId),
        productController.softDeleteProduct
    )
    .delete(
        auth(endPoint.delete),
        validation(commonValidation.validateId),
        productController.deleteProduct
    )


router.patch('/:id/wishlist',
    auth(endPoint.wishlist),
    validation(commonValidation.validateId),
    productController.addToWishlist
)

router.patch('/:id/wishlist/remove',
    auth(endPoint.wishlist),
    validation(commonValidation.validateId),
    productController.removeFromWishlist
)



export default router