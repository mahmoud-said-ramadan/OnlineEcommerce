import productModel from "../../../DB/model/Product.model.js";
import cloudinary from "../cloudinary.js";


export const softDeleteDoc = (model) => {
    return async (req, res, next) => {
        const { id } = req.params;
        if (!await model.findByIdAndUpdate(id, { deletedBy: req.user._id })) {
            return next(new Error(`This ${model.modelName} Is NOT Exist!`, { cause: 404 }));
        }
        return res.status(200).json({ message: 'Done!' });
    }
}

export const deleteDoc = (model) => {
    return async (req, res, next) => {
        const { id } = req.params;
        const isDeleted = await model.findByIdAndDelete(id);
        if (!isDeleted) {
            return next(new Error(`This ${model.modelName} Is NOT Exist!`, { cause: 404 }));
        }
        if (isDeleted?.image) {
            await cloudinary.uploader.destroy(isDeleted.image.public_id);
        }
        return res.status(202).json({
            message: "Done!",
            status: { cause: 202 }
        });
    }
}

export const deleteDocWithProducts = (model) => {
    return async (req, res, next) => {
        const { id } = req.params;
        // Delete the subCategory and its image from Cloudinary
        const isExist = await model.findByIdAndDelete(id);
        if (!isExist) {
            return next(new Error(`This ${model.modelName} Is NOT Exist!`, { cause: 404 }));
        }
        if (isExist?.image) {
            await cloudinary.uploader.destroy(isExist.image.public_id);
        }

        // Delete associated products and their images
        let products;
        model.modelName == 'Brand' ? products = await productModel.deleteMany({ brandId: id })
            : products = await productModel.deleteMany({ subCategoryId: id })
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
        return res.status(200).json({ message: 'Done!' });
    }
}