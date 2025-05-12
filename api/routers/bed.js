const router =  require('express').Router();
const controller = require('../controllers/bedController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')

router.post('/',uploadCloud.single('image'),controller.createBed)
router.put('/:bedid',uploadCloud.single('image'),controller.updateBed)
router.get('/',controller.getBeds)
router.get('/:bedid',controller.getBed)
router.delete('/',controller.deleteBed)
module.exports = router;
