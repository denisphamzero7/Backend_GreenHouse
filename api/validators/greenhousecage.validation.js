const Joi = require('joi');
const { objectId } = require('./custom.validation');


const createGreenhouseCageSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Tên khung nhà kính là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    image: Joi.any().optional(),
    greenhouse: objectId().required().messages({
      'any.required': 'ID nhà kính là bắt buộc',
    }),
    beds: Joi.array().items(objectId()).optional().messages({
      'array.items': 'Mỗi phần tử trong danh sách luống phải là ID hợp lệ',
    }),
  }),
};

const updateGreenhouseCageSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.any().optional(),
    greenhouse: objectId().optional(),
    beds: Joi.array().items(objectId()).optional(),
  }).min(1),
};


const getGreenhouseCageByIdSchema = {
  params: Joi.object({
    cageId: objectId().required().messages({
      'any.required': 'ID khung nhà kính là bắt buộc',
    }),
  }),
};

const deleteGreenhouseCageSchema = {
  params: Joi.object({
    cageId: objectId().required(),
  }),
};

module.exports = {
  createGreenhouseCageSchema,
  updateGreenhouseCageSchema,
  getGreenhouseCageByIdSchema,
  deleteGreenhouseCageSchema,
};