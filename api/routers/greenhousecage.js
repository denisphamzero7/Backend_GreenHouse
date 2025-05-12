const router =  require('express').Router();

// const controller = require('../controllers/greenhousecageController')//-
const controller = require('../controllers/greenhouseCageController');//+

const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
router.post('/',uploadCloud.single('image'),controller.createGreenhousecage)
router.put('/:cageid',uploadCloud.single('image'),controller.updateGreenhousecage)
router.get('/',controller.getGreenhousecages)
router.get('/:cageid',controller.getGreenhousecage)
router.delete('/:cageid',controller.deleteGreenhousecage)
module.exports = router;
// api lồng nhà kính