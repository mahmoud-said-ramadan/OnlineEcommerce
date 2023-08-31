import bcrypt from 'bcryptjs'
import CryptoJS from "crypto-js";



export const hash = ({ plaintext, salt = process.env.SALT_LENGTH } = {}) => {
    const hashResult = bcrypt.hashSync(plaintext, parseInt(salt))
    return hashResult
}


export const compare = ({ plaintext, hashValue } = {}) => {
    const match = bcrypt.compareSync(plaintext, hashValue)
    return match
}

export const encrypt = ({ value, encryptionKey = process.env.ENCRYPT_PHONE_KEY } = {}) => {
    const encrepted = CryptoJS.AES.encrypt(value, encryptionKey).toString();
    return encrepted
}



export const decryptPhone = async (user) => {
    if (user && user.phone) {
        const bytes = CryptoJS.AES.decrypt(user.phone, process.env.ENCRYPT_PHONE_KEY);
        user.phone = bytes.toString(CryptoJS.enc.Utf8);
    }
    return user;
}

export const decrypt = async (elements) => {
    const decrypted = elements.map((ele) => {
        const decrypted = ele.toObject();
        if (decrypted.userId) {
            decryptPhone(decrypted.userId);
        }
        if (decrypted.assignTo) {
            decryptPhone(decrypted.assignTo);
        }
        return decrypted;
    });
    return await decrypted;
}

export const doHashing = (password) => {
    return bcrypt.hashSync(password, parseInt(process.env.SALT_LENGTH));
}