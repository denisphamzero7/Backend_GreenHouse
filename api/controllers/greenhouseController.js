require('dotenv').config();
const apiError = require("../untiles/apiError")

const asyncHandler = require('express-async-handler');
const GreenhouseService = require('../services/greenhouseService')
// Tạo lồng nhà kính
const creategreenhouse = asyncHandler(async (req, res) => {
 
  await  GreenhouseService.createGreenhouse(req.body,req.file)
  return res.status(200).json({
  success: true ? true :false,
  message :' tạo thành công nhà  kính',
 })
    
});


// Lấy danh sách các nhà kính
const getGreenhouses = asyncHandler(async (req, res) => {

  const {data,totalCount}= await GreenhouseService.getGreenhouses(req.query)
  return res.status(200).json({
    success:true,
    data,totalCount
  })
});
// lấy 1 nhà kính

const getGreenhouse = asyncHandler(async (req, res) => {
    const { grid } = req.params;
    const data = await GreenhouseService.getGreenhouse(grid)
    return res.status(200).json({
     success:true,
     data
    })
});
// cập nhật 1 nhà kính

const updateGreenhouse = asyncHandler(async (req, res) => {
  const {grid} = req.params;
  await GreenhouseService.updateGreenhouse(grid,req.body,req.file)
  return res.status(200).json({
    success:true,
    message:'cập nhật thành công nhà kính'
  })
});
// xoá 1 nhà kính
const deleteGreenhouse = asyncHandler(async(req, res)=>{
  const { grid } = req.params;

  await GreenhouseService.deleteGreenhouse(grid)
  res.status(200).json({ 
    success: true,
     message: `đã xoá nhà kính  thành công` });
})
module.exports = {
  creategreenhouse,
  getGreenhouses,
  getGreenhouse,
  updateGreenhouse,
  deleteGreenhouse
};
