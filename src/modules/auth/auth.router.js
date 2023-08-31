import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js';
import * as validators from './auth.validation.js';
import * as authController from './controller/registration.js'
import { Router } from "express";
const router = Router()


router.post('/signUp',
    fileUpload(fileValidation.image).single('image'),
    validation(validators.signUp),
    authController.signUp
)

router.get("/confirmEmail/:token",
    authController.confirmEmail
);

router.get("/newConfirmEmail/:token",
    authController.newConfirmEmail
);

router.get("/confirmChangeEmail/:token",
    authController.confirmChangeEmail
);

router.post("/forgetPassword",
    validation(validators.forgetPassword),
    authController.forgetPassword
);

router.patch("/resetPassword/:token",
    validation(validators.resetPassword),
    authController.resetPassword
);

router.post("/logIn",
    validation(validators.logIn),
    authController.logIn
);

router.get("/unsubscribe/:token",
    authController.unsubscribe
);


export default router