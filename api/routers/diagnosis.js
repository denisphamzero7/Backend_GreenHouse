const router = require('express').Router();
const controller = require('../controllers/diagnosisController');
const uploadCloud = require('../config/cloudinary.config');
const { optionalVerifyToken } = require('../middlewares/verifyToken');

// API chẩn đoán sâu bệnh qua ảnh (kèm upload Cloudinary) và triệu chứng
// Hỗ trợ cả người dùng đã đăng nhập (staff/manager/admin) để lưu vết và người dùng chưa đăng nhập
router.post('/pest', optionalVerifyToken, uploadCloud.single('image'), controller.diagnosePest);

// API tra cứu chẩn đoán bằng triệu chứng chữ (không cần ảnh)
router.post('/symptoms', optionalVerifyToken, controller.diagnoseBySymptomsOnly);

// API lấy toàn bộ từ điển bệnh học nông nghiệp nội bộ
router.get('/knowledge-base', controller.getKnowledgeBase);

module.exports = router;
