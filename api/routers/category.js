const router =  require('express').Router();
const controller = require('../controllers/categoryController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')

router.post('/',controller.createCategories)
router.get('/',controller.getCategories)
router.get('/:cid',controller.getCategory)
router.put('/:cid',controller.updateCategory)
router.delete('/:cid',controller.deleteCategory)
module.exports = router;
// createCategories,
//   getCategories,
//   getCategory,
//   updateCategory,
//   deleteCategory