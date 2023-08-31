import categoryModel from '../../../../DB/model/Category.model.js';
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js';
import subCategoryModel from '../../../../DB/model/SubCategory.model.js';
import productModel from '../../../../DB/model/Product.model.js';
import { softDeleteDoc } from '../../../utils/handlers/delete-softDelete.js';
import { createDoc, updateDoc } from '../../../utils/handlers/get-create-update.js';


export const getCategories = asyncHandler(
    async (req, res, next) => {
        const categories = await categoryModel.find({ deletedBy: { $eq: null } })
            .populate({
                path: 'subCategory',
                select: '-_id -categoryId name slug image'
            });
        return res.status(201).json({ message: 'Done!', categories });
    })

export const createCategory = asyncHandler(createDoc(categoryModel));

export const updateCategory = asyncHandler(updateDoc(categoryModel));

export const deleteCategory = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        // Delete the category and its image from Cloudinary
        const category = await categoryModel.findByIdAndDelete(id);
        if (!category) {
            return next(new Error('This Category Is NOT Exist!', { cause: 404 }));
        }
        if (category?.image) {
            await cloudinary.uploader.destroy(category.image.public_id);
        }

        // Delete associated subCategories and their images
        const subCategories = await subCategoryModel.deleteMany({ categoryId: id });
        if (subCategories.length) {
            for (const subCategory of subCategories) {
                // Delete subCategory image from Cloudinary
                if (subCategory?.image) {
                    await cloudinary.uploader.destroy(subCategory.image.public_id);
                }
            }
            const subCategoryIds = subCategories.map((subCategory) => subCategory._id);
            // Delete associated products and their images
            const products = await productModel.deleteMany({ subCategoryId: { $in: subCategoryIds } });
            if (products.length) {
                for (const product of products) {
                    // Delete product mainImage from Cloudinary
                    if (product?.mainImage) {
                        await cloudinary.uploader.destroy(product.mainImage.public_id);
                    }
                    // Delete product subImages from Cloudinary
                    if (product?.subImages) {
                        for (const image of product.subImages) {
                            await cloudinary.uploader.destroy(image.public_id);
                        }
                    }
                }
            }
        }
        return res.status(200).json({ message: 'Done!' });
    })

export const softDeleteCategory = asyncHandler(softDeleteDoc(categoryModel));
