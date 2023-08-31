import { roles } from "../../middleware/auth.js";



export const endPoint = {
    delete: [roles.Super],
    get: [roles.Admin, roles.Super],
    update: [roles.Admin, roles.Super]
}