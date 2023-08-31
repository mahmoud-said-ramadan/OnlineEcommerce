import { roles } from "../../middleware/auth.js";



export const endPoint = {
    create: [roles.User],
    update: [roles.User],
    delete: [roles.User]
}