import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    slug: { type: String, required: true, lowercase: true },
    image: { type: Object, required: true },
    customId: String,
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

// virtual to display the categoryId as category
subCategorySchema.virtual('category', {
    localField: 'categoryId',
    foreignField: '_id',
    ref: 'Category',
    justOne: true
})


const subCategoryModel = mongoose.model.SubCategory || model('SubCategory', subCategorySchema)
export default subCategoryModel;







// const subCategoryIdToDelete = '...'; // ID of the subcategory to be deleted

// SubCategory.findById(subCategoryIdToDelete, (err, subCategory) => {
//     if (err) {
//         // Handle the error
//     } else if (!subCategory) {
//         // The subcategory does not exist
//     } else {
//         // Proceed with deleting the subcategory and associated products
//     }
// });

// Product.deleteMany({ subCategoryId: subCategoryIdToDelete }, (err) => {
//     if (err) {
//         // Handle the error
//     } else {
//         // Proceed with deleting the subcategory
//     }
// });

// SubCategory.findByIdAndDelete(subCategoryIdToDelete, (err, deletedSubCategory) => {
//     if (err) {
//         // Handle the error
//     } else if (!deletedSubCategory) {
//         // The subcategory does not exist or has already been deleted
//     } else {
//         // Subcategory and associated products have been deleted successfully
//     }
// });




