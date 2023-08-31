import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    image: { type: Object, required: true, lowercase: true },
    customId: String,
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },

}, {
    timestamps: true,
});



const brandModel = mongoose.model.Brand || model('Brand', brandSchema)
export default brandModel;