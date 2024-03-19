import Joi from "joi";

const addProductValidaton = Joi.object({
    productName: Joi.string().max(100).required(),
    foto: Joi.string().optional(),
    harga:Joi.number().required()
});

const updateProductValidaton = Joi.object({
    id: Joi.number().positive().required(),
    productName: Joi.string().max(100).optional(),
    foto: Joi.string().optional(),
    harga:Joi.number().required()
});

const getProductValidaton = Joi.object({
    productName: Joi.string().max(100).optional(),
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
});

const deleteProductValidation = Joi.object({
    id: Joi.number().positive().required(),
});

export {
    addProductValidaton,
    updateProductValidaton,
    getProductValidaton,
    deleteProductValidation,
}