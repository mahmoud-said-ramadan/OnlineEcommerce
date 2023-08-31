import productModel from '../../../../DB/model/Product.model.js';
import subCategoryModel from '../../../../DB/model/SubCategory.model.js';
import brandModel from '../../../../DB/model/Brand.model.js';
import { nanoid } from 'nanoid';
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js';
import slugify from 'slugify';
import { softDeleteDoc } from '../../../utils/handlers/delete-softDelete.js';
import { ApiFeatures } from '../../../utils/apiFeatures.js';
import userModel from '../../../../DB/model/User.model.js';


// edit the product to be added and updated by admins only

export const getProducts = asyncHandler(
    async (req, res, next) => {
        const apiFeatures = new ApiFeatures(productModel.find().populate({ path: 'review' }), req.query)
            .pagination(productModel)
            .search()
            .filter()
            .select()
        // .sort();

        const products = await apiFeatures.mongooseQuery;
        // Add 'finalPrice' to each product object in the response
        const productsWithFinalPrice = products.map((product) => {
            return {
                ...product.toObject(),
                finalPrice: product.finalPrice,
            };
        });
        return res.status(201).json({
            message: 'Done!',
            productsWithFinalPrice,
            count: apiFeatures.queryData.count,
            totalPages: apiFeatures.queryData.totalPages,
            next: apiFeatures.queryData.next,
            previuos: apiFeatures.queryData.previuos
        });
    })

export const createProduct = asyncHandler(async (req, res, next) => {
    let { categoryId, subCategoryId, brandId } = req.body;
    if (!await subCategoryModel.findOne({ _id: subCategoryId, categoryId })) {
        return next(new Error('In-Valid Category Or SubCategory!', { cause: 400 }));
    }
    if (!await brandModel.findById(brandId)) {
        return next(new Error('In-Valid Brand!', { cause: 400 }));
    }
    req.body.slug = slugify(req.body.name);
    req.body.customId = nanoid();
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/mainImage` })
    req.body.mainImage = { secure_url, public_id };
    if (req.files?.subImages) {
        req.body.subImages = [];
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id });
        }
    }
    req.body.createdBy = req.user._id;
    const product = await productModel.create(req.body);
    if (!product) {
        return next(new Error('Fail To Create Product!', { cause: 400 }));
    }
    return res.status(201).json({ message: 'Done!', product });
})

export const updateProduct = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        const productExist = await productModel.findById(id);
        if (!productExist) {
            return next(new Error('This Product Is NOT Exist!', { cause: 404 }));
        }

        if (req.body?.name) {
            let { name } = req.body;
            if (productExist?.name !== name) {
                if (!await productModel.findOne({ name })) {
                    productExist.name = name;
                    productExist.slug = slugify(name);
                }
                else {
                    return next(new Error('This Product Name Is Already Exist!', { cause: 409 }));
                }
            }
        }
        // req.body.productFinalPrice = Number.parseFloat(productPrice - (productPrice * ((productDiscount || 0) / 100))).toFixed(2);
        if (req.files?.mainImage) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${productExist?.customeId}/mainImage` })
            await cloudinary.uploader.destroy(productExist.mainImage.public_id);
            productExist.mainImage = { secure_url, public_id };
        }

        if (req.files?.subImages) {
            for (const file of productExist.subImages) {
                await cloudinary.uploader.destroy(file.public_id);
                productExist.subImages.shift();
            }
            productExist.subImages = [];
            for (const file of productExist.subImages) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${productExist?.customeId}/subImages` })
                productExist.subImages.push({ secure_url, public_id });
            }
        }
        productExist.updatedBy = req.user._id;
        await productExist.save();
        return res.status(200).json({ message: 'Done!', productExist });
    })


export const deleteProduct = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        // Delete the product and its image from Cloudinary
        const product = await productModel.findByIdAndDelete(id);
        if (!product) {
            return next(new Error('This product Is NOT Exist!', { cause: 404 }));
        }
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
        return res.status(200).json({ message: 'Done!' });
    })

export const softDeleteProduct = asyncHandler(softDeleteDoc(productModel));

export const addToWishlist = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        if (!await productModel.findById(id)) {
            return next(new Error('In-Valid Product!', { cause: 404 }));
        }
        await userModel.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: id } })
        return res.status(200).json({ message: 'Done!' });
    })

export const removeFromWishlist = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        await userModel.updateOne({ _id: req.user._id }, { $pull: { wishlist: id } })
        return res.status(200).json({ message: 'Done!' });
    })