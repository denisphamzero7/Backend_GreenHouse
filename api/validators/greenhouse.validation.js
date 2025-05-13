const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema tạo mới Greenhouse
const createGreenhouseSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Tên nhà kính là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    image: Joi.any().optional(),
    operator: Joi.array()
      .items(objectId())
      .optional()
      .messages({
        'array.items': 'Mỗi phần tử trong danh sách người quản lý phải là ID hợp lệ',
      }),
    cages: Joi.array()
      .items(objectId())
      .optional()
      .messages({
        'array.items': 'Mỗi phần tử trong danh sách lồng phải là ID hợp lệ',
      }),
  }),
};

// Schema cập nhật Greenhouse
const updateGreenhouseSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.any().optional(),
    operator: Joi.array().items(objectId()).optional(),
    cages: Joi.array().items(objectId()).optional(),
  }).min(1),
};

// Schema lấy chi tiết / xóa / cập nhật theo ID
const getGreenhouseByIdSchema = {
  params: Joi.object({
    greenhouseId: objectId().required().messages({
      'any.required': 'ID nhà kính là bắt buộc',
    }),
  }),
};

// Schema xóa Greenhouse
const deleteGreenhouseSchema = {
  params: Joi.object({
    greenhouseId: objectId().required(),
  }),
};

module.exports = {
  createGreenhouseSchema,
  updateGreenhouseSchema,
  getGreenhouseByIdSchema,
  deleteGreenhouseSchema,
};