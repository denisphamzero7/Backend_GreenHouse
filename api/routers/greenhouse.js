const router =  require('express').Router();
const controller = require('../controllers/greenhouseController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
router.post('/',[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.creategreenhouse)
router.put('/:grid',[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.updateGreenhouse)
router.get('/',controller.getGreenhouses)
router.get('/:grid',controller.getGreenhouse)
router.delete('/:grid',[verifyAccessToken,isAdminOrManager,isStaff],controller.deleteGreenhouse)
module.exports = router;