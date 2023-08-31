import { roles } from "../../middleware/auth.js";



export const endPoint = {
    create: [roles.Admin, roles.Super],
    update: [roles.Admin, roles.Super],
    delete: [roles.Super],
    wishlist: [roles.User],
}