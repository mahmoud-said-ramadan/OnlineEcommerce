import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema({
    name: { type: String, required: true, lowercase: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    // productFinalPrice May Be Made With Virtual from productPrice and productDiscount
    // finalPrice: { type: Number, required: true },
    colors: [String],
    sizes: { type: [String], enum: ['s', 'm', 'l', 'xl', 'xxl'] },
    mainImage: { type: Object, required: true },
    subImages: { type: [Object] },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Types.ObjectId, ref: 'SubCategory', required: true },
    brandId: { type: Types.ObjectId, ref: 'Brand', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    wishList: [{ type: Types.ObjectId, ref: 'User' }],
    avgRate: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    // isDeleted: { type: Boolean, default: false },
    customId: String,
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});


// Define a virtual property 'finalPrice' that calculates the final price
productSchema.virtual('finalPrice').get(function () {
    return Number.parseFloat(this.price - (this.price * ((this.discount || 0) / 100))).toFixed(2);
});


productSchema.virtual('review', {
    ref: "Review",
    localField: "_id",
    foreignField: "productId"
})

const productModel = mongoose.model.Product || model('Product', productSchema)
export default productModel;