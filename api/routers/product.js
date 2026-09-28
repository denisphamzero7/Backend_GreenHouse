//createProduct,getProducts,getProduct
const router =  require('express').Router();
const controller = require('../controllers/productController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
const validate = require('../middlewares/validate')
const productvalidation = require('../validators/product.validation')
router.post('/',validate(productvalidation.createProductSchema),[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.createProduct)
router.put('/:pid',validate(productvalidation.updateProductSchema),[verifyAccessToken,isAdminOrManager],uploadCloud.single('image'),controller.updateProduct)

// API Truy xuất nguồn gốc nông sản công khai (Dành cho người quét mã QR)
router.get('/trace/:pid', controller.getTraceability)

// API Xác thực tính toàn vẹn dữ liệu so với Blockchain
router.get('/verify-blockchain/:pid', controller.verifyIntegrity)

router.get('/:pid',validate(productvalidation.updateProductSchema),controller.getProduct)
router.get('/', controller.getProducts)
router.delete('/:pid',validate(productvalidation.deleteProduct),[verifyAccessToken,isAdminOrManager], controller.deleteProduct)
module.exports = router;