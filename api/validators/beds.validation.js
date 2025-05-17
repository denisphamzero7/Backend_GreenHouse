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
const createBedSchema = {
  body: Joi.object({
    name: Joi.string(),
    image: Joi.any().optional(), // Image sẽ được upload qua multipart/form-data
    size: Joi.number().positive(),
    status: Joi.string()
      .valid('empty', 'planted', 'harvested', 'under_renovation')
      .default('empty'),
    growthStatus: Joi.string()
      .valid('excellent', 'good', 'average', 'poor')
      .default('good'),
    pestStatus: Joi.string()
      .valid('none', 'low', 'medium', 'high')
      .default('none'),
    crops: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .default([]),
    cropCycle: Joi.object({
      startDate: Joi.date().optional(),
      harvestDate: Joi.date().optional(),
    }).optional(),
    monitoringLogs: Joi.array()
      .items(monitoringLogSchema.body)
      .optional(),
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
    status: Joi.string().required().valid('empty', 'planted', 'harvested', 'under_renovation')
    .messages({
      'any.required': 'Trường "status" là bắt buộc',
      'any.only': 'Giá trị "status" không hợp lệ. Phải là một trong: empty, planted, harvested, under_renovation'
  }),
})
};
const createlogSchema = {
  params: Joi.object().keys({
    bedid: Joi.string().required().custom(objectId),
  }),
  body: Joi.object({
    status: Joi.string().required().valid('normal', 'warning', 'critical')
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
const deletelogschema = {
  params: Joi.object({
    bedid: Joi.string().required().custom(objectId),
    logid:Joi.string().required().custom(objectId)
  }),
};

module.exports = {
  createBedSchema,
  monitoringLogSchema,
  updateBedSchema,
  updateBedStatusSchema,
  deleteBedSchema,
  getBedByIdSchema,
  deletelogschema,createlogSchema
};