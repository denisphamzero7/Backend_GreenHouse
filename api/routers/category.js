const router =  require('express').Router();
const controller = require('../controllers/categoryController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
const categoryValidation = require('../validators/category.validation')
router.post('/',validate(categoryValidation.createCategorySchema),controller.createCategories)
router.get('/',controller.getCategories)
router.get('/:cid',validate(categoryValidation.createCategorySchema),controller.getCategory)
router.put('/:cid',validate(categoryValidation.updateCategorySchema),controller.updateCategory)
router.delete('/:cid',validate(categoryValidation.deleteCategoryByIdSchema),controller.deleteCategory)
module.exports = router;
// createCategories,
//   getCategories,
//   getCategory,
//   updateCategory,
//   deleteCategory