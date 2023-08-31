import { nanoid } from "nanoid";
import cloudinary from "../cloudinary.js";
import slugify from "slugify";


export const getDocs = (model) => {
    return async (req, res, next) => {
        const docs = await model.find({ deletedBy: { $eq: null } });
        return res.status(201).json({ message: 'Done!', docs });
    }
}


export const createDoc = (model) => {
    return async (req, res, next) => {
        if (await model.findOne({ name: req.body.name })) {
            return next(new Error(`This ${model.modelName} Name is Already Exist!`, { cause: 409 }));
        }
        req.body.slug = slugify(req.body.name);
        req.body.customId = nanoid();
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/${model.modelName}/${req.body.customId}` })
        req.body.image = { secure_url, public_id };
        req.body.createdBy = req.user._id
        const created = await model.create(req.body);
        if (!created) {
            return next(new Error(`Fail To Create ${model.modelName}!`, { cause: 500 }));
        }
        return res.status(201).json({ message: 'Done!', created });
    }
}


export const updateDoc = (model) => {
    return async (req, res, next) => {
        const isExist = await model.findById(req.params.id);
        if (!isExist) {
            return next(new Error(`This ${model.modelName} Is NOT Exist!`, { cause: 404 }));
        }
        if (req.body?.name) {
            let { name } = req.body;
            if (isExist.name !== name) {
                if (! await model.findOne({ name })) {
                    isExist.name = name;
                    isExist.slug = slugify(name);
                }
                else {
                    return next(new Error(`This ${model.modelName} Name Is Already Exist!`, { cause: 409 }));
                }
            }
        }
        if (req?.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/${model.modelName}/${isExist.customId}` });
            await cloudinary.uploader.destroy(isExist.image.public_id);
            isExist.image = { secure_url, public_id };
        }
        isExist.updatedBy = req.user._id;
        await isExist.save();
        return res.status(200).json({ message: 'Done!', isExist });
    }
}