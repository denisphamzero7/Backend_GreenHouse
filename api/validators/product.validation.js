const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema tạo mới Product
const createProductSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    type: Joi.string().optional(),
    crops: objectId().optional(),
    category: objectId().optional(),
    greenhouse: objectId().optional(),
    beds: Joi.array().items(objectId()).optional(),
    totalQuantity: Joi.number().positive().optional(),
    harvestDate: Joi.date().optional(),
    qualityStatus: Joi.string()
      .valid('excellent', 'good', 'average', 'poor')
      .default('good'),
    seedOrigin: Joi.string().optional(),
    status: Joi.string()
      .valid('processing', 'packaged', 'shipped', 'delivered')
      .default('processing'),
    unit: Joi.string()
      .valid(['kg', 'bundle', 'piece'])
      .default('kg'),
    notes: Joi.string().optional(),
  }).required(),
};

// Schema cập nhật Product
const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().optional(),
    crops: objectId().optional(),
    category: objectId().optional(),
    greenhouse: objectId().optional(),
    beds: Joi.array().items(objectId()).optional(),
    totalQuantity: Joi.number().positive().optional(),
    harvestDate: Joi.date().optional(),
    qualityStatus: Joi.string()
      .valid('excellent', 'good', 'average', 'poor')
      .optional(),
    seedOrigin: Joi.string().optional(),
    status: Joi.string()
      .valid('processing', 'packaged', 'shipped', 'delivered')
      .optional(),
    unit: Joi.string()
      .valid(['kg', 'bundle', 'piece'])
      .optional(),
    notes: Joi.string().optional(),
  }).min(1),
};

// Schema lấy chi tiết / xóa / cập nhật theo ID
const getProductByIdSchema = {
  params: Joi.object({
    productId: objectId().required().messages({
      'any.required': 'ID sản phẩm là bắt buộc',
    }),
  }),
};

// Schema xóa Product
const deleteProductSchema = {
  params: Joi.object({
    productId: objectId().required(),
  }),
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  deleteProductSchema,
};