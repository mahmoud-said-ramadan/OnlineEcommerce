import { Router } from "express";
import { validation } from '../../middleware/validation.js'
import * as validators from './order.validation.js'
import express from 'express'
import * as orderController from './controller/order.js'
import { auth } from "../../middleware/auth.js";
import { endPoint } from './order.endPoint.js';

const router = Router()




// router.get('/', (req, res) => {
//     res.status(200).json({ message: "order Module" })
// })


router.post('/',
    auth(endPoint.create),
    validation(validators.createOrder),
    orderController.createOrder
)
router.get('/',
    // auth(endPoint.cancel),
    validation(validators.cancelOrder),
    orderController.cancelOrder
)

router.patch('/updateStatus/:id',
    auth(endPoint.updateStatus),
    validation(validators.updateStatus),
    orderController.updateStatus
)

// This is your Stripe CLI webhook secret for testing your endpoint locally.
// const endpointSecret = "whsec_50c96de4533a55c465b6a25b0fd2ffff29f3d7a45e60178bdf528ce6bdf98221";

router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webhook);


// refund
// router.post('/refund',orderController.refund );

export default router