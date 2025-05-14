const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema tạo mới Greenhouse Cage
const createGreenhouseCageSchema = {
  body: Joi.object({
    name: Joi.string().messages({
      'any.required': 'Tên lồng nhà kính là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    image: Joi.any().optional(),
    greenhouse: Joi.string().custom(objectId).optional().messages({
      'any.required': 'ID lồng nhà kính là bắt buộc',
    }),
    beds: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .messages({
        'array.items': 'Mỗi phần tử trong danh sách luống phải là ID hợp lệ',
      }),
  }),
};

// Schema cập nhật Greenhouse Cage
const updateGreenhouseCageSchema = {
  params: Joi.object({
    cageid: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID khung nhà kính là bắt buộc',
    }),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.any().optional(),
    greenhouse: Joi.string().custom(objectId).optional(),
    beds: Joi.array().items(Joi.string().custom(objectId)).optional(),
  })
};

// Schema lấy chi tiết Greenhouse Cage theo ID
const getGreenhouseCageByIdSchema = {
  params: Joi.object().keys({
    cageid: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID khung nhà kính là bắt buộc',
    }),
  }),
};

// Schema xóa Greenhouse Cage
const deleteGreenhouseCageSchema = {
  params: Joi.object({
    cageid: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID khung nhà kính là bắt buộc',
    }),
  }),
};

module.exports = {
  createGreenhouseCageSchema,
  updateGreenhouseCageSchema,
  getGreenhouseCageByIdSchema,deleteGreenhouseCageSchema}