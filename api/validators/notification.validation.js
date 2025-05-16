const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema tạo mới Greenhouse Cage
const createNotification = {
  body: Joi.object({
    greenhouseId: Joi.string().optional(),
    cageId: Joi.string().optional(),
    taskType: Joi.string().valid("Tưới nước", "Bón phân", "Phun thuốc", "Kiểm tra nhiệt độ", "Thu hoạch"),
    bedId: Joi.string().optional(),
    message: Joi.string().required(),
  }),
};


const updateNotification = {
  params: Joi.object({
    noId: Joi.string().required().custom(objectId).messages({
      'any.required': 'id thông báo là bắt buộc',
    }),
  }),
  body: Joi.object({
    greenhouseId: Joi.string().optional(),
    cageId: Joi.string().optional(),
    taskType: Joi.string().valid("Tưới nước", "Bón phân", "Phun thuốc", "Kiểm tra nhiệt độ", "Thu hoạch"),
    bedId: Joi.string().optional(),
    message: Joi.string().required(),
  })
};

const deleteNotification = {
  params: Joi.object().keys({
    noId: Joi.string().required().custom(objectId).messages({
      'any.required': 'id thông báo là bắt buộc',
    }),
  }),
};


module.exports = {
    createNotification,
    updateNotification,
    deleteNotification }