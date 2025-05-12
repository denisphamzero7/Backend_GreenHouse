// require('dotenv').config();

const asyncHandler = require("express-async-handler");
const bedsService = require("../services/bedService");
const ApiError = require("../untiles/apiError");
const pick = require("../untiles/pick")
// tạo luống đất

const createBed = asyncHandler(async (req, res) => {
  const createdBed = await bedsService.createBedsService(req.body, req.file);
  res.status(200).json({
    success: true,
    message: `bed created successfully.`,
    beds: createdBed,
  });
});

// lấy tất cả luồng đất

const getBeds = asyncHandler(async (req, res) => {
  const { data, totalCount } = await bedsService.getBedsService(req.query);
  if (data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "không tìm thấy luống rau ",
    });
  }
  return res.status(200).json({
    success: true,
    data,
    totalCount,
  });
});
//lấy 1 luống đất
const getBed = asyncHandler(async (req, res) => {
  const { bedid } = req.params;
  const bed = await bedsService.getBedById(bedid);
  if (!bed) throw new ApiError(400, "data", "not found");
  return res.status(200).json({
    success: true,
    bed: bed,
  });
});
// cập nhật luống rau
const updateBed = asyncHandler(async (req, res) => {
  const { bedid } = req.params;
  const updateBed = await bedsService.updateBed(bedid, req.body, req.file);
  return res.status(200).json({
    success: true,
    updateBed,
    message: " cập nhật thành công",
  });
});
// cập nhật trạng thái trồng rau
const bedstatus = asyncHandler(async (req, res) => {
  const { bedid, crops, status } = pick(req.body, ["bedid", "crops", "status"]);
  const updateBed = await bedsService.updateBedStatus(bedid, crops, status);

  return res.status(200).json({
    success: true,
    message: "Update status successful",
    bed: updateBed,
  });
});
// xoá luống rau

const deleteBed = asyncHandler(async (req, res) => {
  try {
    const { bedid } = req.params;
    const bed = bedsService.deleteBed(bedid)
    return res.status(200).json({
      success: true,
      message: "Delete successful",
      bed: bed,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting bed", error });
  }
});
module.exports = {
  createBed,
  getBeds,
  getBed,
  updateBed,
  bedstatus,
  deleteBed,
};
