// services/notificationService.js
const Notification= require('../models/notificationmodel');
const ApiError = require('../untiles/apiError');
const User = require('../models/userModel');

const createNotification = async (userId, data) => {
  const { greenhouseId,cageId, taskType, bedId, message } = data;
  const user = await User.findById(userId).select('avatar name');
  if (!user) throw new ApiError(400, 'user', 'Không tìm thấy user');

  const newNotification = await Notification.create({
    userId,
    greenhouseId,
    cageId,
    taskType,
    bedId,
    message,
    isRead: false
  });

  return {
    ...newNotification.toObject(),
    user: {
      uid: user._id,
      name: user.name
    }
  };
};
const getAllNotification = async (query) => {
  const queries = { ...query };
  const excludeFields = ['limit', 'sort', 'page', 'fields'];
  excludeFields.forEach(field => delete queries[field]);

  // Build query conditions
  let queryString = JSON.stringify(queries).replace(
      /\b(gt|lt|eq|gte|lte)\b/g,
      match => `$${match}`
  );
  const formattedQueries = JSON.parse(queryString);


  if (query.name) {
      formattedQueries.name = { $regex: new RegExp(query.name, 'i') };
  }
  let queryCommand = Notification.find(formattedQueries)
      .populate("userId", "name avatar")
      .populate("cageId", "name")
   
  if (query.sort) {
      queryCommand = queryCommand.sort(query.sort.split(',').join(' '));
  }

  // Apply field selection
  if (query.fields) {
      queryCommand = queryCommand.select(query.fields.split(',').join(' '));
  }

  // Pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || parseInt(process.env.LIMIT_GREENHOUSECAGES) || 10;
  const skip = (page - 1) * limit;

  queryCommand = queryCommand.skip(skip).limit(limit);

  // Execute query
  const data = await queryCommand.exec();
  const totalCount = await Notification.countDocuments(formattedQueries);

  return { data, totalCount };
};
const deleteNotification = async(userId,noId) =>{
   const notification = await Notification.findOne({
    _id:noId,
    userId:userId
   })
   if(!notification) throw new ApiError(400,'notification','thông báo không tồn tại')
   await Notification.findByIdAndDelete(notification)
   return {
    success: true,
    message: 'Xóa thông báo thành công'
   }
}
const updateNotification = async(userId,noId,data)=>{
     const notification = await Notification.findOne({
      _id :noId,
      userId:userId
     })
     const { greenhouseId,cageId, taskType, bedId, message } = data;
     if(!notification) throw new ApiError(400,'notification','thông báo không tồn tại')
     await Notification.findByIdAndUpdate(notification,{greenhouseId,cageId,taskType,bedId,message })
     return {
      success: true,
      message: 'cật nhật thông báo thành công'
     }
}
module.exports = { createNotification,getAllNotification,deleteNotification,updateNotification };
