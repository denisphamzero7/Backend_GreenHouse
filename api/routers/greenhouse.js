const router =  require('express').Router();
const controller = require('../controllers/greenhouseController')
const uploadCloud= require('../config/cloudinary.config')
const validate = require('../middlewares/validate')
const greenhouseValidation = require('../validators/greenhouse.validation')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
router.post('/',validate(greenhouseValidation.updateGreenhouseSchema),[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.creategreenhouse)
router.put('/:grid',validate(greenhouseValidation.updateGreenhouseSchema),[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.updateGreenhouse)
router.get('/',controller.getGreenhouses)
router.get('/:grid',validate(greenhouseValidation.getGreenhouseByIdSchema),controller.getGreenhouse)
router.delete('/:grid',validate(greenhouseValidation.deleteGreenhouseSchema),[verifyAccessToken,isAdminOrManager],controller.deleteGreenhouse)
module.exports = router;