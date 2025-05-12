const CategoriesService = require ('../services/categoryService')
const asyncHandler = require("express-async-handler");
const ApiError = require('../untiles/apiError');

// Tạo danh mục
const createCategories = asyncHandler(async (req, res) => {
  const categories = await CategoriesService.createCategories(req.body)
  return res.status(200).json({
   success:true,
   message:"Tạo thành công loại rau",
   categories
  })
});

// Lấy danh sách danh mục
const getCategories = asyncHandler(async (req, res) => {
      const {data,totalCount} = await CategoriesService.getCategories(req.query)
      if (data.length === 0) throw new ApiError(400,'data','không tìm thấy thể loại nào')
      return res.status(200).json({
        success: true,
        data,
        totalCount,
      });
});
// lấy 1 danh mục

const getCategory = asyncHandler(async (req, res) => {
  const {cid} = req.params
  const data = await CategoriesService.getCategoryService(cid)
  if (!data) throw new ApiError(400,'data','không tìm thấy thể loại')
  return res.status(200).json({
    success: true,
    data
  })
});
// cập nhật danh mục
const updateCategory = asyncHandler(async(req, res)=>{
  const {cid} = req.params
  const {data} = req.body
  const updateCategory = CategoriesService.updateCategory({cid},{data})
  return res.status(200).json({
    success: true,
    updateCategory
  })
})

// xoá danh mục

const deleteCategory = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const category = await CategoriesService.deleteCategory(cid)
    if (!category) {
      return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });
  }

    return res.status(200).json({ success: true, message: "Danh mục đã xóa thành công" });
});


module.exports = {
  createCategories,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};
