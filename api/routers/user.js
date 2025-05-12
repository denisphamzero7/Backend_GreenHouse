const router =  require('express').Router();
const controller = require('../controllers/usersController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
// const{loginSchema ,registerSchema} = require('../validators/userValidator')
const auth = require('../validators/auth.validation')
router.post('/register',controller.register)
router.post('/login',validate(auth.login),controller.login)
router.post('/refreshtoken',controller.refreshToken)
router.post('/resendotp',controller.resendOTP)
router.post('/verifyotp',controller.verifyOTP)
router.post('/logout', verifyAccessToken, controller.logout); 
router.get('/profile',verifyAccessToken,controller.getCurrentUser)
router.put('/:uid',[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.updateUserById)
router.get('/',[verifyAccessToken,isAdminOrManager],controller.getUsers)
router.get('/:uid',[verifyAccessToken,isAdminOrManager],controller.getUserById)
module.exports = router;
//register,login,getUsers,getUser,updateUser,verifyOTP,resendOTP