import * as couponController from '../coupon/controller/coupon.js'
import * as validators from './coupon.validation.js'
import * as commonValidation from '../../utils/handlers/commonValidation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import { auth } from '../../middleware/auth.js';
import { endPoint } from './coupon.endPoint.js';
const router = Router({ caseSensitive: false })


router.route('/')
    .get(
        auth(endPoint.get),
        couponController.getCoupons
    )
    .post(
        auth(endPoint.create),
        fileUpload(fileValidation.image).single('image'),
        validation(validators.createCoupon),
        couponController.createCoupon
    )

router.route('/:id')
    .put(
        auth(endPoint.update),
        fileUpload(fileValidation.image).single('image'),
        validation(validators.updateCoupon),
        couponController.updateCoupon
    )
    .patch(
        auth(endPoint.update),
        validation(commonValidation.validateId),
        couponController.softDeleteCoupon
    )
    .delete(
        auth(endPoint.delete),
        validation(commonValidation.validateId),
        couponController.deleteCoupon
    )

router.get('/getOneCoupon', couponController.getOneCoupon)

export default router