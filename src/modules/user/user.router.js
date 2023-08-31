import { auth, roles } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js';
import * as validators from './user.validation.js'
import * as userController from './controller/user.js'
import { Router } from "express";
import { endPoint } from './user.endPoint.js';
import * as commonValidation from '../../utils/handlers/commonValidation.js';
const router = Router();

// ///////////////////
//   User Can Do   //
// /////////////////

router.route('/')
    .get(
        auth(Object.values(roles)),
        userController.getUserData
    )
    .patch(
        auth(Object.values(roles)),
        validation(validators.changePassword),
        userController.changePassword
    )
    .post(
        auth(Object.values(roles)),
        validation(validators.changeEmail),
        userController.changeEmail
    )
    .put(
        auth(Object.values(roles)),
        fileUpload(fileValidation.image).single('image'),
        validation(validators.updateUser),
        userController.updateUser
    );

router.patch("/logOut",
    auth(Object.values(roles)),
    userController.logOutUser
);

// ////////////////////////////
//  Admin And Super Can Do  //
// //////////////////////////

router.get("/allUsers",
    auth(endPoint.get),
    userController.getAllUsers
);

router.route('/:id')
    .delete(
        auth(endPoint.delete),
        validation(commonValidation.validateId),
        userController.deleteUser
    )
    .patch(
        auth(endPoint.update),
        validation(commonValidation.validateId),
        userController.softDeleteUser
    )


export default router;