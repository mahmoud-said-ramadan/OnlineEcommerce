import cartModel from "../../../../DB/model/Cart.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const getUserCart = asyncHandler(
    async (req, res, next) => {
        const userId = req.user._id;
        const cart = await cartModel.findOne({ userId }).populate([{
            path: 'products.productId',
        }]);
        if (!cart) {
            return next(new Error(`In-Valid Cart`, { cause: 404 }))
        }
        let totalCartPrice = 0;
        // Calculate the final price for each product in the cart
        cart.products = cart.products.filter(product => {
            if (product?.productId && product?.productId.deletedBy == undefined) {
                return product
            }
        })

        await cart.save()
        let productsWithFinalPrice = cart.products.map((product) => {
            const { price, discount } = product.productId;
            const finalPrice = price - (price * (discount || 0)) / 100;
            totalCartPrice += finalPrice * product.quantity;
            return {
                ...product.toObject(),
                finalPrice: finalPrice,
                totalProductPrice: finalPrice * product.quantity,
            };
        });
        res.status(202).json({ productsWithFinalPrice, totalCartPrice });
    }
)

export const createCart = asyncHandler(
    async (req, res, next) => {
        const { productId, quantity } = req.body;
        const product = await productModel.findById(productId);
        if (!product) {
            return next(new Error("In-Valid Product", { cause: 404 }))
        }
        if (product.stock < quantity) {
            await productModel.updateOne({ _id: productId }, { $addToSet: { wishList: req.user._id } })
            return next(new Error(`In-Valid Product Quantity, The Available Quantity Is ${product.stock}`, { cause: 404 }))
        }
        if (product.deletedBy) {
            await productModel.updateOne({ _id: productId }, { $addToSet: { wishList: req.user._id } })
            return next(new Error(`In-Valid Product`, { cause: 404 }))
        }

        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart) {
            const newCart = await cartModel.create({
                userId: req.user._id,
                products: [{
                    productId,
                    quantity
                }]
            })
            return res.status(201).json({ message: "Done!", cart: newCart });
        }

        let match = false;
        for (let i = 0; i < cart.products.length; i++) {
            if (cart.products[i].productId.toString() === productId) {
                cart.products[i].quantity = quantity;
                match = true;
                break;
            }
        }

        if (!match) {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        return res.status(201).json({ message: "Done!", cart });
    })

export const deleteFromCart = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const product = await cartModel.findOne({
            userId: req.user._id,
            'products.productId': id
        });
        if ((!product)) {
            return next(new Error(`In-Valid Product!`, { cause: 404 }))
        }
        await cartModel.updateOne({ userId: req.user._id }, {
            $pull: {
                products: { productId: id }
            }
        })
        return res.status(201).json({ message: "Done!" });
    });


export const clearCart = asyncHandler(
    async (req, res, next) => {
        await cartModel.updateOne({ userId: req.user._id }, { products: [] })
        return res.status(201).json({ message: "Done!" });
    });