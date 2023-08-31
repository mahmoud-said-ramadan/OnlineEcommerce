import userModel from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { hash, compare, encrypt } from "../../../utils/Hash-Encrypt.js";
import { sendMail, createMail } from "../../../utils/email.js";
import { generateToken, verifyToken } from "../../../utils/GenerateAndVerifyToken.js";
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/cloudinary.js";

export const signUp = asyncHandler(async (req, res, next) => {
    const protocol = req.protocol;
    const host = req.headers.host;
    let { userName, email } = req.body;
    if (!await userModel.findOne({ email })) {
        // Hash password
        req.body.password = hash({ plaintext: req.body.password });
        // Encrypt phone
        req.body.phone = encrypt({ value: req.body.phone }).toString();
        req.body.customId = nanoid();
        if (req?.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/profile/${req.body.customId}` });
            req.body.image = { secure_url, public_id };
        }
        // addUser
        const createdUser = await userModel.create(req.body);
        if (createdUser) {
            const { _id } = createdUser;
            //Generate Token
            const createdToken = generateToken({ userName, id: _id }, process.env.EMAIL_TOKEN_KEY, 60 * 60 * 24);
            //Generate Alternative Token
            const newConfirmEmailToken = generateToken({ userName, id: _id }, process.env.EMAIL_TOKEN_KEY, 60 * 60 * 24 * 30);
            //Generate unsubscribe Token
            const unsubscribeToken = generateToken({ userName, id: _id }, process.env.EMAIL_TOKEN_KEY, 60 * 60 * 24 * 7);
            //Generate html form
            const html = createMail({ protocol, host, createdToken, newConfirmEmailToken, unsubscribeToken });
            //Send Confirmation Mail
            if (!await sendMail({ to: email, subject: "Confirmation E-Mail", html })) {
                return next(new Error("This Email Rejected!", { cause: 400 }));
            }

            // let message = "Thank you for Registering! \n We have sent a confirmation email to your email address.\n Please check your inbox!";
            // return res.redirect(201, `http://google.com`);
            return res.status(201).json({
                message: "Thank you for Registering! \n We have sent a confirmation email to your email address.\n Please check your inbox!",
                status: { cause: 201 }
            })
        }
    }
    return next(new Error("This Email Already Exist!", { cause: 409 }));
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    // const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_KEY);
    const decoded = verifyToken({ token, signature: process.env.EMAIL_TOKEN_KEY });
    if (decoded) {
        const user = await userModel.findByIdAndUpdate(decoded.id, { confirmEmail: true });
        if (user) {
            // let message = "Email Confirmed Successfully!";
            // return res.redirect(`../../../../front/html/confirmation.html?message=${message}`);
            return res.status(202).json({
                message: "Email Confirmed Successfully!",
                status: { cause: 202 }
            });
        }
        return next(new Error("NOT REGISTERED!", { cause: 404 }));
    }
    return next(new Error("In-Valid!", { cause: 404 }));
});

export const newConfirmEmail = asyncHandler(async (req, res, next) => {
    const protocol = req.protocol;
    const host = req.headers.host;
    const { token } = req.params;
    const decoded = verifyToken({ token, signature: process.env.EMAIL_TOKEN_KEY });
    if (decoded) {
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return next(new Error("NOT REGISTERED!... Please signUp!", { cause: 404 }));
        }
        if (user?.confirmEmail) {
            // let message = "Already Confirmed!... GO to login";
            // return res.redirect(`../../../../front/html/confirmation.html?message=${message}`);
            return res.status(202).json({
                message: "Already Confirmed!... GO to login",
                status: { cause: 202 }
            });
        }
        const newToken = generateToken({ userName: user.userName, id: user._id }, process.env.EMAIL_TOKEN_KEY, 60 * 2);
        //Generate unsubscribe Token
        const unsubscribeToken = generateToken({ userName: user.userName, id: user._id }, process.env.EMAIL_TOKEN_KEY, 60 * 60 * 24 * 7);
        const html = createMail({ protocol, host, createdToken: newToken, unsubscribeToken });
        //Send New Confirmation Mail
        if (!await sendMail({ to: user.email, subject: "Confirmation E-Mail", html })) {
            return next(new Error("This Email Rejected!", { cause: 400 }));
        }
        // let message = 'Sent Again!... Please Check Your inbox!';
        // return res.redirect(`../../../../front/html/confirmation.html?message=${message}`);
        return res.status(202).json({
            message: "Sent Again!... Please Check Your inbox!",
            status: { cause: 202 }
        });
    }
    return next(new Error("In-Valid!", { cause: 404 }));
});

export const confirmChangeEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    // const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_KEY);
    const decoded = verifyToken({ token, signature: process.env.EMAIL_TOKEN_KEY });
    if (decoded) {
        // check if the email Not Confirmed to other user
        if (await userModel.findOne({ email: decoded.email })) {
            return next(new Error("This Email Already Confirmed To Another User!", { cause: 409 }));
        }
        const user = await userModel.findByIdAndUpdate(decoded.id, { confirmEmail: true, email: decoded.email, tempEmail: '' }, { new: true });
        if (user) {
            // let message = "Email Confirmed Successfully!";
            // return res.redirect(`../../../../front/html/confirmation.html?message=${message}`);
            return res.status(202).json({
                message: "Email Confirmed Successfully!",
                status: { cause: 202 }
            });
        }
        return next(new Error("NOT REGISTERED!", { cause: 404 }));
    }
    return next(new Error("In-Valid!", { cause: 404 }));
});

export const forgetPassword = asyncHandler(
    async (req, res, next) => {
        const protocol = req.protocol;
        const host = req.headers.host;
        const { email } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return next(new Error("This User Is NOT Found!"));
        }
        //Generate Alternative Token
        const forgetPasswordToken = generateToken({ email, id: user._id }, process.env.EMAIL_TOKEN_KEY, 60 * 30);
        //Generate unsubscribe Token
        const unsubscribeToken = generateToken({ email, id: user._id }, process.env.EMAIL_TOKEN_KEY, 60 * 60 * 24 * 3);
        //Generate html form
        const html = createMail({ protocol, host, forgetPasswordToken, unsubscribeToken });
        //Send Confirmation Mail
        if (!await sendMail({ to: email, subject: "Reset Password", html })) {
            return next(new Error("This Email Rejected!", { cause: 400 }));
        }
        return res.status(202).json({
            message: "We Have Sent a confirmation Mail, With A Link To Reset Your PASSWORD, This Link Will Expire in 30 Minutes!",
            status: { cause: 202 }
        })
    }
)

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const decoded = verifyToken({ token, signature: process.env.EMAIL_TOKEN_KEY });
    if (decoded) {
        // Hash password
        const hashed = hash({ plaintext: req.body.newPassword });
        if (!await userModel.findByIdAndUpdate(decoded.id, { password: hashed })) {
            return next(new Error("NOT REGISTERED!", { cause: 404 }));
        }
        // let message = "Email Confirmed Successfully!";
        // return res.redirect(`../../../../front/html/confirmation.html?message=${message}`);
        return res.status(202).json({
            message: "Email Password Changed Successfully!",
            status: { cause: 202 }
        });
    }
    return next(new Error("In-Valid!", { cause: 404 }));
});


export const logIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new Error("In-Valid logIn Data!", { cause: 404 }));
    }
    if (!user?.confirmEmail) {
        return next(new Error("Please Confirm Email First!", { cause: 404 }));
    }
    if (!compare({ plaintext: password, hashValue: user.password })) {
        return next(new Error("In-Valid logIn Data!", { cause: 404 }));
    }
    if (user.status === 'blocked') {
        return next(new Error("This User Blocked!", { cause: 403 }));
    }
    // Generate an authentication Token for the user
    const createdToken = generateToken({ userName: user.userName, id: user._id }, process.env.LOGIN_TOKEN_KEY, 60 * 60 * 24);
    if (createdToken) {
        user.status = 'online';
        await user.save();
        return res.status(202).json({
            message: "logIn Successfully!",
            token: createdToken,
            status: { cause: 202 }
        });
    }
    return next(new Error("Fail To logIn!", { cause: 500 }));
});

export const unsubscribe = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const decoded = verifyToken({ token, signature: process.env.EMAIL_TOKEN_KEY });
    if (decoded?.id) {
        if (await userModel.findByIdAndDelete(decoded.id)) {
            // let message = "Already Confirmed!... GO to login";
            // return res.redirect(`/unSubscribe.html?message=${message}`);
            return res.status(202).json({
                message: "UnSubscribed Successfully!",
                status: { cause: 202 }
            });
        }
        return next(new Error("NOT REGISTERED!", { cause: 404 }));
    }
    return next(new Error("In-Valid!", { cause: 500 }));
});