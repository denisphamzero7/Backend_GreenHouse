const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema tạo mới Vegetable (rau củ)
const createVegetableSchema = {
  body: Joi.object({
    name: Joi.string().messages({
      'any.required': 'Tên loại rau củ là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    image: Joi.any().optional(),
    harvestTime: Joi.number().positive().optional(),
    soilType: Joi.string()
      .valid('Loamy', 'Clay', 'Sandy', 'Peaty', 'Saline')
      .default('Loamy'),
    description: Joi.string().optional(),
    category: Joi.string().custom(objectId).optional().messages({
      'any.custom': 'ID danh mục không hợp lệ',
    }),
  }).required(),
};

// Schema cập nhật Vegetable
const updateVegetableSchema = {
  params: Joi.object({
    cropid: Joi.string().custom(objectId).messages({
      'any.required': 'ID loại rau củ là bắt buộc',
      'any.custom': 'ID không hợp lệ',
    }),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.any().optional(),
    harvestTime: Joi.number().positive().optional(),
    soilType: Joi.string()
      .valid('Loamy', 'Clay', 'Sandy', 'Peaty', 'Saline')
      .optional(),
    description: Joi.string().optional(),
    category: Joi.string().custom(objectId).optional().messages({
      'any.custom': 'ID danh mục không hợp lệ',
    }),
  })
};

// Schema lấy chi tiết Vegetable theo ID
const getVegetableByIdSchema = {
  params: Joi.object({
    cropid: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID loại rau củ là bắt buộc',
      'any.custom': 'ID không hợp lệ',
    }),
  }),
};

// Schema xóa Vegetable
const deleteVegetableSchema = {
  params: Joi.object({
    cropid: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID loại rau củ là bắt buộc',
      'any.custom': 'ID không hợp lệ',
    }),
  }),
};

module.exports = {
  createVegetableSchema,
  updateVegetableSchema,
  getVegetableByIdSchema,
  deleteVegetableSchema,
};