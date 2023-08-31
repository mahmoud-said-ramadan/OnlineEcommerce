import couponModel from "../../../../DB/model/Coupon.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { createOrderMail } from "../../../utils/order-email.js";
import { sendMail } from "../../../utils/email.js";
import { nanoid } from "nanoid";
import payment from "../../../utils/payment.js";
import Stripe from "stripe";





export const createOrder = asyncHandler(
    async (req, res, next) => {
        let { products, address, phone, note, coupon, paymentType } = req.body;
        if (coupon) {
            const couponExist = await couponModel.findOne({ name: coupon.toLowerCase(), deletedBy: { $eq: null } })
            if (!couponExist) {
                return next(new Error('In-Valid Coupon', { cause: 404 }))
            }
            if (couponExist.expireDate < Date.now()) {
                return next(new Error('Expired Coupon', { cause: 400 }))
            }
            if (couponExist.usedBy.includes(req.user._id)) {
                return next(new Error('This Coupon Used By this User Before!', { cause: 400 }))
            }
            req.body.coupon = couponExist.toObject();
        }

        if (!products) {
            const cart = await cartModel.findOne({ userId: req.user._id })
            if (!cart?.products.length) {
                return next(new Error('Empty Cart!', { cause: 404 }))
            }
            products = cart.products;
        }

        const finalProductList = [];
        const productIds = [];
        let subTotal = 0;
        for (let product of products) {
            const productExist = await productModel.findOne({
                _id: product.productId,
                stock: { $gte: product.quantity },
                deletedBy: { $eq: null }
            });


            if (!productExist) {
                return next(new Error(`In-Valid Product ${product.productId}`, { cause: 404 }))
            }
            if (!req.body?.products) {
                product = product.toObject()
            }
            productIds.push(product.productId)
            product.name = productExist.name;
            product.image = productExist.mainImage;
            // product.unitPrice = productExist.unitPrice;
            // product.price = productExist.price; //Delete
            // product.discount = productExist.discount; //Delete
            product.unitPrice = Number.parseFloat(productExist.finalPrice)
            product.totalPrice = Number.parseFloat(product.quantity * product.unitPrice)
            finalProductList.push(product)
            subTotal += product.totalPrice
        }

        const order = await orderModel.create({
            userId: req.user._id,
            products: finalProductList,
            address,
            phone: phone ? phone : req.user.phone,
            note,
            coupon: req.body.coupon?.name,
            discount: (subTotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2),
            subTotal,
            finalPrice: subTotal - (subTotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2),
            paymentType,
            status: paymentType ? 'waitPayment' : 'placed',
            code: nanoid(7)
        })

        for (const product of products) {
            await productModel.updateOne({ _id: product.productId },
                { $inc: { stock: - parseInt(product.quantity) } })
        }

        if (req.body?.coupon) {
            await couponModel.updateOne({ _id: req.body.coupon._id },
                { $addToSet: { usedBy: req.user._id } })
        }

        if (req.body?.products) {
            await cartModel.updateOne({ userId: req.user._id },
                {
                    $pull:
                    {
                        products:
                        {
                            productId: { $in: productIds }
                        }
                    }
                })
        }
        else {
            await cartModel.updateOne({ userId: req.user._id }, { products: [] })
        }
        //Send Mail with order info.
        const html = createOrderMail({ userName: req.user.userName, order });
        if (!await sendMail({ to: 'mahmoudsaid.r22@gmail.com', subject: "Confirmation E-Mail", html })) {
            return next(new Error("This Email Rejected!", { cause: 400 }));
        }

        // payment process
        if (order.paymentType === 'card') {
            const stripe = new Stripe(process.env.STRIPE_KEY);
            if (req.body?.coupon) {
                const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' })
                console.log(coupon);
                req.body.couponId = coupon.id
            }
            const session = await payment({
                stripe,
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: req.user.email,
                metadata: {
                    orderId: order._id.toString()
                },
                cancel_url: `${process.env.CANCEL_URL}?id=${order._id.toString()}`,
                line_items: order.products.map(product => {
                    return {
                        price_data: {
                            currency: 'egp',
                            product_data: {
                                name: product.name
                            },
                            unit_amount: product.unitPrice * 100,
                        },
                        quantity: product.quantity,
                    }
                }),
                discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []
            });
            return res.status(201).json({ message: "Done", order, session, url: session.url })
        }
        return res.status(201).json({ message: "Done", order })

    });


export const cancelOrder = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const { reason } = req.body;
        const order = await orderModel.findOne({ _id: id, userId: req.user._id })
        if (!order) {
            return next(new Error(`In-Valid Order`, { cause: 404 }));
        }
        if ((order.status != 'placed' && order.paymentType == 'cash') || (order.status != 'waitPayment' && order.paymentType == 'card')) {
            return next(new Error(`Can NOT Cancel Your Order While it is in ${order.status} Step`, { cause: 400 }));
        }

        const cancelOrder = await orderModel.updateOne({ _id: order._id }, { status: 'canceled', reason, updatedBy: req.user._id })
        if (!cancelOrder.matchedCount) {
            return next(new Error(`Fail To Cancel Your Order!`, { cause: 400 }));
        }

        for (const product of order.products) {
            await productModel.updateOne({ _id: product.productId },
                { $inc: { stock: parseInt(product.quantity) } })
        }

        if (order.couponId) {
            await couponModel.updateOne({ _id: order.couponId },
                { $pull: { usedBy: req.user._id } })
        }
        return res.status(200).json({ message: 'Done!' })
    })

export const updateStatus = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const order = await orderModel.findOneAndUpdate({ _id: id }, { status: req.body.status, updatedBy: req.user._id })
        if (!order) {
            return next(new Error(`In-Valid Order`, { cause: 404 }));
        }
        return res.status(200).json({ message: 'Done!' })
    })

export const webhook = asyncHandler(async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    if (event.type != 'checkout.session.completed') {
        await orderModel.updateOne({ _id: event.data.object.metadata.orderId }, { status: "rejected" })
        return res.status(400).json({ message: "REjected Order!" })
    }
    await orderModel.updateOne({ _id: event.data.object.metadata.orderId }, { status: "placed" })
    // Return a 200 res to acknowledge receipt of the event
    res.status(200).send({message:"Done!"});
})