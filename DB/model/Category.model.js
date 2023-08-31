import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    slug: { type: String, required: true, lowercase: true },
    image: { type: Object, required: true },
    customId: String,
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

categorySchema.virtual('subCategory', {
    localField: '_id',
    foreignField: 'categoryId',
    ref: 'SubCategory',
})


const categoryModel = mongoose.model.Category || model('Category', categorySchema)
export default categoryModel;