require('dotenv').config();
const Greenhousecage = require('../models/greenhouseCageModel');
const asyncHandler = require('express-async-handler');
const GreenhousecageService= require('../services/greenhousecageService')
// Tạo lồng nhà kính
const createGreenhousecage = asyncHandler(async (req, res) => {
     await GreenhousecageService.createGreenhousecage(req.body,req.file)
    return res.status(200).json({
    success: true ? true :false,
    message :' tạo thành công lồng kính',
   })
  
  
});

// Lấy danh sách các nhà kính
const getGreenhousecages = asyncHandler(async (req, res) => {
  const {data,totalCount}= await GreenhousecageService.getGreenhousecages(req.query)
  return res.status(200).json({
    success:true,
    data,totalCount
  })
});

// Lấy 1 nhà kính
const getGreenhousecage = asyncHandler(async (req, res) => {
  const { cageid } = req.params;
 const data = await GreenhousecageService.getGreenhousecage(cageid)
 return res.status(200).json({
  success:true,
  data
 })

});

// Cập nhật 1 nhà kính
const updateGreenhousecage = asyncHandler(async (req, res) => {
  const {cageid}= req.params
  await GreenhousecageService.updateGreenhousecage(cageid,req.body,req.file)
  return res.status(200).json({
    success:true,
    message:'cập nhật thành công lồng kính'
  })
});

// Xóa 1 nhà kính
const deleteGreenhousecage = asyncHandler(async (req, res) => {
  const { cageid } = req.params;
  await GreenhousecageService.deleteGreenhousecage(cageid)
  return res.status(200).json({
    success:true,
    message:'xoá thành công lồng kính'
  })
  
});

module.exports = {
  createGreenhousecage,
  getGreenhousecages,
  getGreenhousecage,
  updateGreenhousecage,
  deleteGreenhousecage,
};
