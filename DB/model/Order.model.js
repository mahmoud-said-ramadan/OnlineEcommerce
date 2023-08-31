import mongoose, { Schema, model, Types } from "mongoose";


const orderSchema = new Schema({
    address: { type: String, required: true },
    phone: [{ type: String, required: true }],
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },

    note: String,
    reason: String,
    products: [{
        name: { type: String },
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, default: 1, required: true },
        image: { type: Object, required: true },
        // price: { type: Number, default: 1, required: true },
        // discount: { type: Number, default: 1, required: true },

        //FinalPrice
        totalPrice: { type: Number, default: 1, required: true },
    }],

    subTotal: { type: Number, default: 1, required: true },
    coupon: { type: String, lowerCase: true },
    discount: { type: Number, default: 1 },
    //FinalPrice
    finalPrice: { type: Number, default: 1, required: true },
    paymentType: {
        type: String,
        default: 'cash',
        enum: ['cash', 'card']
    },
    status: {
        type: String,
        default: 'placed',
        enum: ['waitPayment', 'placed', 'canceled', 'onWay', 'rejected', 'delivered']
    },
    code: {
        type: String, required: true
    }
}, {
    timestamps: true,
});


const orderModel = mongoose.model.Order || model('Order', orderSchema);
export default orderModel;