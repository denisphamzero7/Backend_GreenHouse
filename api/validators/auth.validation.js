const Joi = require('joi')
const {password,phone} = require('./custom.validation')
const register ={
    body:Joi.object().keys({
        name: Joi.string().min(2).max(50).lowercase().required(),
        email:Joi.string().required().email(),
        phone:Joi.string().required().custom(phone),
        password:Joi.string().required().custom(password)
       
    })
}
const login ={
    body:Joi.object().keys({
        email:Joi.string().required().email().messages({
            'any.required': ' bạn chưa nhập email',
            'string.empty':'email của bạn không được để trống'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Bạn chưa nhập mật khẩu',
            'string.empty': 'Mật khẩu không được để trống',
          })
    })
}
const logout = {
    body: Joi.object().keys({
      refreshToken: Joi.string().required(),
    }),
  };
const refreshTokens ={
    body:Joi.object().keys({
        refreshToken:Joi.string().required()
    }),
}
const forgotPassword = {
    body:Joi.object().keys({
        email:Joi.string().required()
    })  
}
const resetPassword ={
    body:Joi.object().keys({
        password:Joi.string().required().custom(password)
    })
}
const verifyEmail ={
    body:Joi.object().keys({
        email:Joi.string().required()
    })
}
module.exports ={
    register,login,logout,refreshTokens,forgotPassword,resetPassword,verifyEmail
}