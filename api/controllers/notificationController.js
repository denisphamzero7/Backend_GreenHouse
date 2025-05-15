// controllers/notificationController.js
const { createNotification: createNotifService } = require('../services/notificationService');
const notificationService = require('../services/notificationService')
const asyncHandler = require('express-async-handler');
const { getIO } = require('../config/socket');

const createNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { greenhouseId, cageId, taskType, bedId, message } = req.body;


  const notification = await createNotifService(
    userId,
    { greenhouseId, cageId, taskType, bedId, message }
  );

  
  const io = getIO();
  console.log("Socket IO instance:", io? "Có" : "Không"); 

  io.to(userId.toString()).emit('new_notification', notification);
  console.log(`[Socket] Gửi thông báo đến user: ${userId}`); 

  return res.status(201).json({
    success: true,
    notification,
    message: 'Gửi thông báo thành công'
  });
});
const getAllNotification = asyncHandler(async(req,res)=>{
  const {data,totalCount}= await notificationService.getAllNotification(req.query)
  return res.status(201).json({
    success:true,
    data,totalCount
  })
})
const deleteNotification = asyncHandler(async(req,res)=>{
  const {noId} = req.params
  const userId = req.user._id
  await notificationService.deleteNotification(userId,noId)
  const io = getIO()
  io.to(userId.toString()).emit('notification_deleted', {noId});
  console.log(`[Socket] Gửi thông báo đến user: ${userId}`); 
  return res.status(200).json({
    success: true,
    message: 'Xóa thông báo thành công'
  });
})
const updateNotification = asyncHandler(async (req, res) => {
  const { noId } = req.params; // notificationId
  const userId = req.user._id;
  const updateData = {};
  ['greenhouseId', 'cageId', 'taskType', 'bedId', 'message'].forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'notification', 'Không có dữ liệu để cập nhật');
  }
  await notificationService.updateNotification(userId, noId, updateData);
  const io = getIO();
  io.to(userId.toString()).emit('notification_updated', { notificationId: noId });
  return res.status(200).json({
    success: true,
    message: 'Cập nhật thông báo thành công'
  });
});

module.exports = { createNotification,getAllNotification,deleteNotification,updateNotification };
