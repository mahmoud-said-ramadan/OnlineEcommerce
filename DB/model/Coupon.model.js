import mongoose, { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    image: { type: Object },
    amount: { type: Number, default: 1 },
    expireDate: { type: Date },
    customId: String,
    usedBy: [{ type: Types.ObjectId, ref: 'User' }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },

}, {
    timestamps: true,
});


const couponModel = mongoose.model.Coupon || model('Coupon', couponSchema)
export default couponModel;