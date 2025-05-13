const router =  require('express').Router();
const controller = require('../controllers/vegetableController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
const vegetableValidation = require('../validators/vegetable.validation')
router.post('/',validate(vegetableValidation.createVegetableSchema),uploadCloud.single('image'),controller.createCrop)
router.get('/',controller.getCrops)
router.get('/:cropid',validate(vegetableValidation.getVegetableByIdSchema),controller.getCropById)    
router.put('/:cropid',validate(vegetableValidation.updateVegetableSchema),controller.updateCrop)
router.delete('/:cropid',validate(vegetableValidation.deleteVegetableSchema),controller.deleteCrop)
module.exports = router;
//getCropById,updateCrop,deleteCrop, createCrop,getCrops,