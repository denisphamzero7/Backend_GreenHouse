const router =  require('express').Router();
const controller = require('../controllers/notificationController')
const uploadCloud= require('../config/cloudinary.config')
const {verifyAccessToken,isAdminOrManager,isStaff } = require('../middlewares/verifytoken')
// const validate = require('../middlewares/validate')
// const bedvalidation = require('../validators/beds.validation')
router.post('/',[verifyAccessToken],controller.createNotification)
router.put('/:noId',[verifyAccessToken],controller.updateNotification)
router.get('/',controller.getAllNotification)
router.delete('/:noId',[verifyAccessToken],controller.deleteNotification)

module.exports = router;
