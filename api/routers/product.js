//createProduct,getProducts,getProduct
const router =  require('express').Router();
const controller = require('../controllers/productController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
const productvalidation = require('../validators/product.validation')
router.post('/',validate(productvalidation.createProductSchema),uploadCloud.single('image'),controller.createProduct)
router.put('/:pid',validate(productvalidation.updateProductSchema),uploadCloud.single('image'),controller.updateProduct)
router.get('/:pid',validate(productvalidation.updateProductSchema),controller.getProduct)
router.get('/', controller.getProducts)
router.delete('/:pid',validate(productvalidation.deleteProduct), controller.deleteProduct)
module.exports = router;