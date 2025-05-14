const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema cho monitoringLog
const monitoringLogSchema = {
  body: Joi.object().keys({
    checkDate: Joi.date(),
    status: Joi.string().valid('normal', 'warning', 'critical'),
    remarks: Joi.string().optional(),
  }),
};

// Schema cho cập nhật Bed
const updateBedSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.any().optional(), 
    size: Joi.number().positive().optional(),
    status: Joi.string()
      .valid('empty', 'planted', 'harvested', 'under_renovation')
      .optional(),
    growthStatus: Joi.string()
      .valid('excellent', 'good', 'average', 'poor')
      .optional(),
    pestStatus: Joi.string()
      .valid('none', 'low', 'medium', 'high')
      .optional(),
    crops: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .default([]),
    cropCycle: Joi.string().optional(),
    monitoringLogs: Joi.array()
      .items(monitoringLogSchema.body) 
      .optional(),
  }),
};
const getBedByIdSchema = {
  params: Joi.object().keys({
    bedid: Joi.string().required().custom(objectId).messages({
      'any.required': 'ID nhà kính là bắt buộc',
    }),
  }),
};

const updateBedStatusSchema = {
  params: Joi.object().keys({
    bedid: Joi.string().required().custom(objectId),
  }),
  body: Joi.object({
    crops: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional(),
    status: Joi.string().required()
    .valid('empty', 'planted', 'harvested', 'under_renovation')
    .messages({
      'any.required': 'Trường "status" là bắt buộc',
      'any.only': 'Giá trị "status" không hợp lệ. Phải là một trong: empty, planted, harvested, under_renovation'
  }),
})
};

// Schema cho xóa Bed
const deleteBedSchema = {
  params: Joi.object({
    bedid: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  monitoringLogSchema,
  updateBedSchema,
  updateBedStatusSchema,
  deleteBedSchema,
  getBedByIdSchema
};