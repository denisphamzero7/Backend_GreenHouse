const router =  require('express').Router();
const controller = require('../controllers/uploadimage')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')

router.post('/',uploadCloud.single('image'),controller.uploadImage)

module.exports = router;