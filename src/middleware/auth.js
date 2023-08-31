import userModel from "../../DB/model/User.model.js";
import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
import { asyncHandler } from "../utils/errorHandling.js";


export const roles = {
    Admin: "Admin",
    User: "User",
    Super: "Super",
}
Object.freeze(roles);

export const auth = (accesRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization?.startsWith(process.env.BEARER_TOKEN)) {
            return next(new Error('In-Valid Bearer Key!', { cause: 400 }))
        }
        const token = authorization.split(process.env.BEARER_TOKEN)[1];
        if (!token) {
            return next(new Error('In-Valid Token!', { cause: 400 }))
        }
        
        const decoded = verifyToken({ token });
        if (!decoded?.id) {
            return next(new Error('In-Valid Payload!', { cause: 400 }))
        }
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return next(new Error('Not Registered User!', { cause: 401 }))
        }
        if (token.iat < user.changedAt) {
            return next(new Error('You have to Login Again!', { cause: 401 }))
        }
        if (user.status !== 'online' || !user.confirmEmail) {
            return next(new Error('You have to Login Again!', { cause: 401 }))
        }
        if (!accesRoles.includes(user.role)) {
            return next(new Error('Not Authorized User!', { cause: 403 }))
        }
        req.user = user;
        return next();
    })
}