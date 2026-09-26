const asyncHandler = require('express-async-handler');
const aiDiagnosisService = require('../services/aiDiagnosisService');
const bedsService = require('../services/bedService');
const ApiError = require('../untiles/apiError');
const { getIO } = require('../config/socket');
const Notification = require('../models/notificationmodel');

/**
 * Controller: Chẩn đoán sâu bệnh qua ảnh chụp & triệu chứng lâm sàng
 * Endpoint: POST /api/diagnosis/pest
 * Hỗ trợ multipart/form-data kèm file ảnh upload lên Cloudinary
 */
const diagnosePest = asyncHandler(async (req, res) => {
  const { symptoms, cropType, bedId, greenhouseId, cageId } = req.body;
  
  // Lấy URL ảnh từ Cloudinary middleware
  const imageUrl = req.file ? req.file.path : req.body.imageUrl;

  if (!imageUrl && !symptoms) {
    throw new ApiError(400, 'input', 'Vui lòng tải lên một ảnh chụp lá cây hoặc nhập triệu chứng bệnh!');
  }

  // 1. Thực hiện chẩn đoán qua AI (Gemini Vision hoặc Knowledge Base)
  let diagnosisResult;
  if (imageUrl) {
    diagnosisResult = await aiDiagnosisService.diagnosePlantDisease({
      imageUrl,
      symptoms: symptoms || '',
      cropType: cropType || ''
    });
  } else {
    diagnosisResult = aiDiagnosisService.fallbackDiagnose(symptoms, cropType);
  }

  let autoSavedToBed = false;
  let savedLog = null;
  let createdNotification = null;

  // 2. Nếu người dùng gửi kèm ID luống đất (bedId), tự động lưu kết quả vào luống
  if (bedId) {
    try {
      const severity = diagnosisResult.severity === 'critical' ? 'critical' : 
                       (diagnosisResult.severity === 'warning' ? 'warning' : 'normal');
      
      const remarks = `[AI Bác Sĩ Cây Trồng] ${diagnosisResult.disease_name}. ${diagnosisResult.summary_message || ''} | Hữu cơ: ${diagnosisResult.treatment?.organic || ''}`;

      savedLog = await bedsService.addMonitoringLog(bedId, {
        status: severity,
        remarks: remarks
      });
      autoSavedToBed = true;

      // Phát sự kiện Socket.io cập nhật trực tiếp luống rau
      try {
        const io = getIO();
        io.to(bedId.toString()).emit('new_monitoring_log', savedLog);
      } catch (sockErr) {
        console.log('[Socket] Bỏ qua emit socket nếu chưa có client kết nối');
      }

      // 3. Nếu mức độ nguy hiểm (warning/critical), tự động tạo Thông Báo Nhiệm Vụ
      if (severity === 'warning' || severity === 'critical') {
        const taskType = 'Phun thuốc';
        const alertMessage = `[CẢNH BÁO BỆNH] Luống ${bedId}: ${diagnosisResult.disease_name}. ${diagnosisResult.treatment?.chemical || diagnosisResult.treatment?.organic || ''}`;

        const newNotification = await Notification.create({
          userId: req.user ? req.user._id : null,
          greenhouseId: greenhouseId || null,
          cageId: cageId || null,
          bedId: bedId,
          taskType: taskType,
          message: alertMessage,
          isRead: false
        });
        createdNotification = newNotification;

        try {
          const io = getIO();
          if (req.user && req.user._id) {
            io.to(req.user._id.toString()).emit('new_notification', newNotification);
          } else {
            io.emit('new_notification', newNotification);
          }
        } catch (sockErr) {}
      }
    } catch (err) {
      console.error('[Diagnosis Controller] Lỗi khi tự động lưu log luống đất:', err.message);
    }
  }

  // 4. Trả về kết quả JSON chuẩn hóa cho React Frontend
  return res.status(200).json({
    success: true,
    message: "Chẩn đoán sâu bệnh thành công",
    data: {
      ...diagnosisResult,
      imageUrl: imageUrl || null,
      auto_saved_to_bed: autoSavedToBed,
      monitoring_log: savedLog,
      notification: createdNotification
    }
  });
});

/**
 * Controller: Tra cứu nhanh từ điển sâu bệnh theo triệu chứng chữ (Không cần ảnh)
 * Endpoint: POST /api/diagnosis/symptoms
 */
const diagnoseBySymptomsOnly = asyncHandler(async (req, res) => {
  const { symptoms, cropType } = req.body;
  if (!symptoms) {
    throw new ApiError(400, 'symptoms', 'Vui lòng nhập triệu chứng cây trồng cần tra cứu!');
  }

  const result = aiDiagnosisService.fallbackDiagnose(symptoms, cropType);

  return res.status(200).json({
    success: true,
    message: "Tra cứu triệu chứng thành công",
    data: result
  });
});

/**
 * Controller: Lấy danh mục các bệnh phổ biến trong từ điển nông nghiệp
 * Endpoint: GET /api/diagnosis/knowledge-base
 */
const getKnowledgeBase = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    total: aiDiagnosisService.AGRICULTURAL_KNOWLEDGE_BASE.length,
    data: aiDiagnosisService.AGRICULTURAL_KNOWLEDGE_BASE
  });
});

module.exports = {
  diagnosePest,
  diagnoseBySymptomsOnly,
  getKnowledgeBase
};
