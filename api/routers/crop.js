const router =  require('express').Router();
const controller = require('../controllers/vegetableController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')

router.post('/',uploadCloud.single('image'),controller.createCrop)
router.get('/',controller.getCrops)
router.get('/:cropid',controller.getCropById)    
router.put('/:cropid',controller.updateCrop)
router.delete('/:cropid',controller.deleteCrop)
module.exports = router;
//getCropById,updateCrop,deleteCrop, createCrop,getCrops,