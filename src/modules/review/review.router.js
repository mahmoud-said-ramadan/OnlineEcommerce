import { auth } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js'
import * as validators from './review.validation.js'
import { endPoint } from './review.endPoint.js'
import * as reviewController from './controller/review.js'
import { Router } from "express";


const router = Router({ mergeParams: true })


router.get('/', (req, res) => {
    res.status(200).json({ message: "reviews Module" })
})

router.post('/',
    auth(endPoint.create),
    validation(validators.createReview),
    reviewController.createReview
)

router.put('/:id',
    auth(endPoint.update),
    validation(validators.updateReview),
    reviewController.updateReview
)



export default router