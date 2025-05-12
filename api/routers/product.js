//createProduct,getProducts,getProduct
const router =  require('express').Router();
const controller = require('../controllers/productController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')

router.post('/',uploadCloud.single('image'),controller.createProduct)
router.put('/:pid',uploadCloud.single('image'),controller.updateProduct)
router.get('/:pid',controller.getProduct)
router.get('/', controller.getProducts)
router.delete('/', controller.deleteProduct)
module.exports = router;