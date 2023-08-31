import subCategoryModel from '../../../../DB/model/SubCategory.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import categoryModel from '../../../../DB/model/Category.model.js';
import { deleteDocWithProducts, softDeleteDoc } from '../../../utils/handlers/delete-softDelete.js';
import { createDoc, updateDoc } from '../../../utils/handlers/get-create-update.js';


export const getSubCategories = asyncHandler(
    async (req, res, next) => {
        const subCategories = await subCategoryModel.find({ deletedBy: { $eq: null } })
            .populate({
                path: 'category',
                select: 'categoryName'
            });
        return res.status(201).json({ message: 'Done!', subCategories });
    })

export const createSubCategory = asyncHandler(
    async (req, res, next) => {
        const { categoryId } = req.params;
        if (! await categoryModel.findById(categoryId)) {
            return next(new Error('This Category Is NOT Exist!', { cause: 400 }));
        }
        req.body.categoryId = categoryId;
        return createDoc(subCategoryModel)(req, res, next);
        // return createDoc(subCategoryModel);
    })

export const updateSubCategory = asyncHandler(updateDoc(subCategoryModel));

export const deleteSubCategory = asyncHandler(deleteDocWithProducts(subCategoryModel))

export const softDeleteSubCategory = asyncHandler(softDeleteDoc(subCategoryModel));