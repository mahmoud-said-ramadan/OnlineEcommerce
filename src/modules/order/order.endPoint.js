import { roles } from "../../middleware/auth.js";



export const endPoint = {
    create: [roles.User],
    cancel: [roles.User],
    updateStatus: [roles.Admin]
}