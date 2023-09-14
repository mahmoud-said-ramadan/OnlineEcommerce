import couponModel from '../../../../DB/model/Coupon.model.js';
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js';
import { getDocs } from '../../../utils/handlers/get-create-update.js';
import { deleteDoc, softDeleteDoc } from '../../../utils/handlers/delete-softDelete.js';
import { nanoid } from 'nanoid';


export const getOneCoupon = (model) => {
    return async (req, res, next) => {
        const docs = await model.findOne({ name: req.body.name }, { deletedBy: { $eq: null } });
        return res.status(201).json({ message: 'Done!', docs });
    }
}

export const getCoupons = asyncHandler(getDocs(couponModel))

export const createCoupon = asyncHandler(
    async (req, res, next) => {
        if (await couponModel.findOne({ name: req.body.name })) {
            return next(new Error('This Coupon Name Is Already Exist!', { cause: 409 }));
        }
        req.body.customId = nanoid();

        if (req.body?.expireDate) {
            const expireDate = new Date(req.body.expireDate);
            if (expireDate < Date.now()) {
                return next(new Error(`Cant't Create A Coupon With An Expired Date!`, { cause: 500 }));
            }
            req.body.expireDate = expireDate;
        }

        if (req?.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon/${req.body.customId}` })
            req.body.image = { secure_url, public_id }
        }

        req.body.createdBy = req.user._id;
        const coupon = await couponModel.create(req.body);
        if (!coupon) {
            return next(new Error('Fail To Create Coupon!', { cause: 500 }));
        }
        return res.status(201).json({ message: 'Done!', coupon });
    })

export const updateCoupon = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const couponExist = await couponModel.findById(id);
        if (!couponExist) {
            return next(new Error('This Coupon Is NOT Exist!', { cause: 404 }));
        }

        if (req.body?.name) {
            let { name } = req.body;
            if (couponExist?.name !== name) {
                const nameExist = await couponModel.findOne({ name });
                if (!nameExist) {
                    couponExist.name = name;
                }
                else {
                    return next(new Error('This Coupon Name Is Already Exist!', { cause: 409 }));
                }
            }
        }

        if (req.body?.amount) {
            couponExist.amount = req.body.amount
        }

        if (req.body?.expireDate) {
            const expireDate = new Date(req.body.expireDate);
            if (expireDate < Date.now()) {
                return next(new Error(`Cant't Create A Coupon With An Expired Date!`, { cause: 500 }));
            }
            couponExist.expireDate = expireDate;
        }

        if (req?.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon/${couponExist.customId}` });
            if (couponExist?.image) {
                await cloudinary.uploader.destroy(couponExist.image.public_id);
            }
            couponExist.image = { secure_url, public_id };
        }
        couponExist.updatedBy = req.user._id;
        await couponExist.save();
        return res.status(200).json({ message: 'Done!', couponExist });
    })

export const deleteCoupon = asyncHandler(deleteDoc(couponModel));

export const softDeleteCoupon = asyncHandler(softDeleteDoc(couponModel));
