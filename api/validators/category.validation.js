const Joi = require('joi');
const { objectId } = require('./custom.validation');


const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Tên danh mục là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    description: Joi.string().optional(),
  }),
};


const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
  }).min(1),
};


const getCategoryByIdSchema = {
  params: Joi.object({
    categoryId: objectId().required(),
  }),
};

const deleteCategoryByIdSchema = {
    params: Joi.object({
      categoryId: objectId().required(),
    }),
  };

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  deleteCategoryByIdSchema
};