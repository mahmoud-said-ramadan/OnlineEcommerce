import brandModel from '../../../../DB/model/Brand.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import { deleteDocWithProducts, softDeleteDoc } from '../../../utils/handlers/delete-softDelete.js';
import { createDoc, getDocs, updateDoc } from '../../../utils/handlers/get-create-update.js';


export const getBrands = asyncHandler(getDocs(brandModel))

export const createBrand = asyncHandler(createDoc(brandModel));

export const updateBrand = asyncHandler(updateDoc(brandModel));

export const deleteBrand = asyncHandler(deleteDocWithProducts(brandModel))

export const softDeleteBrand = asyncHandler(softDeleteDoc(brandModel));
