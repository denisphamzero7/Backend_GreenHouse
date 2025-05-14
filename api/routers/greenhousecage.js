const router =  require('express').Router();

// const controller = require('../controllers/greenhousecageController')//-
const controller = require('../controllers/greenhouseCageController');//+

const uploadCloud= require('../config/cloudinary.config')
const validate = require('../middlewares/validate')
const greenhousecageValidation = require('../validators/greenhousecage.validation')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
router.post('/',validate(greenhousecageValidation.createGreenhouseCageSchema),uploadCloud.single('image'),controller.createGreenhousecage)
router.put('/:cageid',validate(greenhousecageValidation.updateGreenhouseCageSchema),uploadCloud.single('image'),controller.updateGreenhousecage)
router.get('/',controller.getGreenhousecages)
router.get('/:cageid',validate(greenhousecageValidation.getGreenhouseCageByIdSchema),controller.getGreenhousecage)
router.delete('/:cageid',validate(greenhousecageValidation.deleteGreenhouseCageSchema),controller.deleteGreenhousecage)
module.exports = router;
// api lồng nhà kính