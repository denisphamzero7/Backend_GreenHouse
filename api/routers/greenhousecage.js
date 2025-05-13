const router =  require('express').Router();

// const controller = require('../controllers/greenhousecageController')//-
const controller = require('../controllers/greenhouseCageController');//+

const uploadCloud= require('../config/cloudinary.config')
const validate = require('../middlewares/validate')
const greenhouseValidation = require('../validators/greenhouse.validation')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
router.post('/',validate(greenhouseValidation.updateGreenhouseSchema),uploadCloud.single('image'),controller.createGreenhousecage)
router.put('/:cageid',validate(greenhouseValidation.getGreenhouseByIdSchema),uploadCloud.single('image'),controller.updateGreenhousecage)
router.get('/',controller.getGreenhousecages)
router.get('/:cageid',validate(greenhouseValidation.getGreenhouseByIdSchema),controller.getGreenhousecage)
router.delete('/:cageid',validate(greenhouseValidation.deleteGreenhouseSchema),controller.deleteGreenhousecage)
module.exports = router;
// api lồng nhà kính