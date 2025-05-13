const Joi = require('joi')
const {objectId} = require('./custom.validation');
const monitoringLogSchema = {
    body: Joi.object().keys({
        checkDate: Joi.date(),
        status: Joi.string().valid('normal', 'warning', 'critical'),
        remarks: Joi.string().optional(),
    }),
  };
  const updateBedSchema = {
   body: Joi.object({
      name: Joi.string().optional(),
      image: Joi.any().optional(), 
      size: Joi.number().positive().optional(),
      status: Joi.string().valid('empty', 'planted', 'harvested', 'under_renovation').optional(),
      growthStatus: Joi.string().valid('excellent', 'good', 'average', 'poor').optional(),
      pestStatus: Joi.string().valid('none', 'low', 'medium', 'high').optional(),
      crops: Joi.array().items(Joi.string().hex().length(24)).optional(),
      cropCycle: cropCycleSchema.optional(),
      monitoringLogs: Joi.array().items(monitoringLogSchema).optional(),
    })
  }
    .min(1)
    .unknown(true)
    
    const updateBedStatusSchema = {
      params: Joi.object().keys({
        bedid: Joi.string().required(objectId),
      }),
      body : Joi.object({
        crops: Joi.array().items(Joi.string().hex().length(24)).optional(),
        status: Joi.string().valid('empty', 'planted', 'harvested', 'under_renovation').required(),
      })
    }
    const deleteBedSchema = {
      params: Joi.object({
        bedid: Joi.string().required(objectId),
         })
    }
    

module.exports={monitoringLogSchema,updateBedSchema,updateBedStatusSchema,deleteBedSchema }