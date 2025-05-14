const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Schema tạo mới Product
const createProductSchema = {
  body: Joi.object({
    name: Joi.string().messages({
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.empty': 'Tên không được để trống',
    }),
    type: Joi.string().optional(),
    crops: Joi.string().custom(objectId).optional(),
    category: Joi.string().custom(objectId).optional(),
    greenhouse: Joi.string().custom(objectId).optional(),
    beds: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .messages({
        'array.items': 'Mỗi phần tử trong danh sách luống phải là ID hợp lệ',
      }),
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
      .valid('kg', 'bundle', 'piece')
      .default('kg'),
    notes: Joi.string().optional(),
  }).required(),
};

// Schema cập nhật Product
const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().optional(),
    crops: Joi.string().custom(objectId).optional(),
    category: Joi.string().custom(objectId).optional(),
    greenhouse: Joi.string().custom(objectId).optional(),
    beds: Joi.array()
      .items(Joi.string().custom(objectId))
      .optional()
      .messages({
        'array.items': 'Mỗi phần tử trong danh sách luống phải là ID hợp lệ',
      }),
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
      .valid('kg', 'bundle', 'piece')
      .optional(),
    notes: Joi.string().optional(),
  })
};
const deleteProduct ={
  params: Joi.object().keys({
    pid: Joi.string().required().custom(objectId),
  }), 
}
module.exports={
  createProductSchema,updateProductSchema,deleteProduct
}