const Joi = require('joi');
const { objectId } = require('./custom.validation');


const createVegetableSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Tên loại rau củ là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    image: Joi.any().optional(),
    harvestTime: Joi.number().positive().optional(),
    soilType: Joi.string()
      .valid(['Loamy', 'Clay', 'Sandy', 'Peaty', 'Saline'])
      .default('Loamy'),
    description: Joi.string().optional(),
    category: objectId().optional(),
  }).required(),
};


const updateVegetableSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.any().optional(),
    harvestTime: Joi.number().positive().optional(),
    soilType: Joi.string()
      .valid(['Loamy', 'Clay', 'Sandy', 'Peaty', 'Saline'])
      .optional(),
    description: Joi.string().optional(),
    category: objectId().optional(),
  }).min(1),
};


const getVegetableByIdSchema = {
  params: Joi.object({
    cropId: objectId().required().messages({
      'any.required': 'ID loại rau củ là bắt buộc',
    }),
  }),
};

// Schema xóa Vegetable
const deleteVegetableSchema = {
  params: Joi.object({
    cropId: objectId().required(),
  }),
};

module.exports = {
  createVegetableSchema,
  updateVegetableSchema,
  getVegetableByIdSchema,
  deleteVegetableSchema,
};