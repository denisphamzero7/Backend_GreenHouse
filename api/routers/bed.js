const router =  require('express').Router();
const controller = require('../controllers/bedController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
const bedvalidation = require('../validators/beds.validation')
router.post('/',validate(bedvalidation.updateBedSchema),uploadCloud.single('image'),controller.createBed)
router.put('/:bedid',validate(bedvalidation.updateBedStatusSchema),uploadCloud.single('image'),controller.updateBed)
router.get('/',controller.getBeds)
router.get('/:bedid',validate(bedvalidation.getBedByIdSchema),controller.getBed)
router.delete('/',controller.deleteBed)
module.exports = router;
