import { roles } from "../../middleware/auth.js";



export const endPoint = {
    get: [roles.Admin, roles.Super],
    create: [roles.Admin, roles.Super],
    update: [roles.Admin, roles.Super],
    delete: [roles.Super]
}