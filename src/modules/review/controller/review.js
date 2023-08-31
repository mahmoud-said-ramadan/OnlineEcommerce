import orderModel from "../../../../DB/model/Order.model.js";
import reviewModel from "../../../../DB/model/Review.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


export const createReview = asyncHandler(
    async (req, res, next) => {
        const { productId } = req.params;
        const { comment, rate } = req.body;
        const orderExist = await orderModel.findOne({
            userId: req.user._id,
            status: 'delivered',
            'products.productId': productId
        });
        if (!orderExist) {
            return next(new Error('Can NOT review Product Before Receive', { cause: 400 }));
        }

        if (await reviewModel.findOne({ createdBy: req.user._id, productId })) {
            return next(new Error('Already Reviewed By You', { cause: 400 }));
        }
        await reviewModel.create({
            comment,
            rate,
            createdBy: req.user._id,
            orderId: orderExist._id,
            productId
        });
        return res.status(201).json({ message: "Done!" })
    })

export const updateReview = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const { comment, rate } = req.body;
        const review = await reviewModel.findOneAndUpdate({ _id: id }, { comment, rate });
        if (!review) {
            return next(new Error('In-Valid Review', { cause: 404 }));
        }
        return res.status(201).json({ message: "Done!" })
    })