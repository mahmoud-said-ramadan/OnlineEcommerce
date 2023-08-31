import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { endPoint } from "./cart.endPoint.js";
import * as validators from "./cart.validation.js";
import * as commonValidation from '../../utils/handlers/commonValidation.js'
import * as cartController from './controller/cart.js'
import { Router } from "express";
const router = Router()


router.route('/')
    .get(
        auth(endPoint.create),
        cartController.getUserCart
    )
    .post(
        auth(endPoint.create),
        validation(validators.createCart),
        cartController.createCart
    )

router.patch('/:id',
    auth(endPoint.delete),
    validation(commonValidation.validateId),
    cartController.deleteFromCart
)

router.put('/cleare',
    auth(endPoint.delete),
    cartController.clearCart
)


export default router