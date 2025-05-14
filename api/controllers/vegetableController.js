const ApiError = require('../untiles/apiError')
const asyncHandler = require('express-async-handler');
const CropService = require('../services/cropService')
// Create crop(s)
const createCrop = asyncHandler(async (req, res) => {
  await CropService.createCropService(req.body,req.file)
  return res.status(200).json({
  success: true ? true :false,
  message :' tạo thành công cây trồng',
 })

});

// Get all crops with filters, sorting, and pagination
const getCrops = asyncHandler(async (req, res) => {
  const {data,totalCount} = await CropService.getCropsService(req.query)
      if (data.length === 0) throw new ApiError(400,'data','không tìm cây trồng nào')
      return res.status(200).json({
        success: true,
        data,
        totalCount,
      });
});

// Get a single crop by ID
const getCropById = asyncHandler(async (req, res) => {

    const { cropid } = req.params;
    const data = await CropService.getCropById(cropid)
  if (!data) throw new ApiError(400,'data','không tìm thấy cây trồng này !')
  return res.status(200).json({
    success: true,
    data
  })
});

// Update a crop
const updateCrop = asyncHandler(async (req, res) => {
  const {cropid} = req.params
  const {updatedata} = req.body;
  const updateCrop = await CropService.updateCrops(cropid,updatedata,req.file)
 
  return res.status(200).json({
    success: true,
    updateCrop,
    message:'update cây thành công'
  })
});

// Delete a crop
const deleteCrop = asyncHandler(async (req, res) => {
  const { cropid } = req.params;
    const crop = await CropService.deleteCrops(cropid)
    if (!crop) {
      return res.status(404).json({ success: false, message: "cây trông không tồn tại" });
  }

    return res.status(200).json({ success: true, message: "cây trồng đã xóa thành công" });
});

module.exports = {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop,
};
