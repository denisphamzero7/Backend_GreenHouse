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
  params: Joi.object({
    cid: Joi.string().required().custom(objectId),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
  }).min(1),
};

const getCategoryByIdSchema = {
  params: Joi.object({
    cid: Joi.string().required().custom(objectId),
  }),
};

const deleteCategoryByIdSchema = {
  params: Joi.object({
    cid: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  deleteCategoryByIdSchema,
};