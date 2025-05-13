const router =  require('express').Router();
const controller = require('../controllers/usersController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
// const{loginSchema ,registerSchema} = require('../validators/userValidator')
const auth = require('../validators/auth.validation')
const user = require('../validators/user.validation')
router.post('/register',(auth.register),controller.register)
router.post('/login',validate(auth.login),controller.login)
router.post('/refreshtoken',validate(auth.refreshTokens),controller.refreshToken)
router.post('/resendotp',validate(user.resendOTP),controller.resendOTP)
router.post('/verifyotp',validate(user.verifyOTP),controller.verifyOTP)
router.post('/logout',validate(auth.logout), verifyAccessToken, controller.logout); 
router.get('/profile',verifyAccessToken,controller.getCurrentUser)
router.put('/:uid',validate(user.updateUser),[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.updateUserById)
router.get('/',[verifyAccessToken,isAdminOrManager],controller.getUsers)
router.get('/:uid',validate(user.getUser),[verifyAccessToken,isAdminOrManager],controller.getUserById)
module.exports = router;
//register,login,getUsers,getUser,updateUser,verifyOTP,resendOTP