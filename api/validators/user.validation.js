const Joi = require('joi');
const {password,objectId} = require('./custom.validation');


// validate  người dùng
const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};
const getUsers ={
  query:Joi.object().keys({
    email:Joi.string(),
    name:Joi.string(),
    phone:Joi.string().required().custom(phone),
    role:Joi.string().valid('user','admin','manager','staff'),
    greenhouse: Joi.string().optional().custom(objectId),
    image: Joi.string().uri().optional(),
  })
}
const getUser={
  params:Joi.object().keys({
    uid:Joi.string().required(objectId)
  })
}
const resendOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
}
const verifyOTP = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    otp: Joi.number().required().min(1000).max(9999),
  }),
}
const updateUser = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      phone: Joi.string().custom(phone),
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      role: Joi.string().valid('user', 'admin'),
    })
    .min(1),
};
module.exports={
  createUser,getUsers,getUser,resendOTP,verifyOTP,updateUser
}