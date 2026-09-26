const router = require('express').Router();
const controller = require('../controllers/diagnosisController');
const uploadCloud = require('../config/cloudinary.config');

// API chẩn đoán sâu bệnh qua ảnh (kèm upload Cloudinary) và triệu chứng
router.post('/pest', uploadCloud.single('image'), controller.diagnosePest);

// API tra cứu chẩn đoán bằng triệu chứng chữ (không cần ảnh)
router.post('/symptoms', controller.diagnoseBySymptomsOnly);

// API lấy toàn bộ từ điển bệnh học nông nghiệp nội bộ
router.get('/knowledge-base', controller.getKnowledgeBase);

module.exports = router;
