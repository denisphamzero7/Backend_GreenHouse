
const ProductService = require('../services/productService')
const asyncHandler = require('express-async-handler');
// tạo sản phẩm
const createProduct = asyncHandler(async(req, res)=>{
 
  const product = await  ProductService.createProduct(req.body,req.file)
  return res.status(200).json({
  success: true ? true :false,
  message :' tạo thành công sản phẩm',
  product
 })
    
});
 // lấy danh sách sản phẩm
 const getProducts = asyncHandler(async (req, res) => {
  const {data,totalCount}= await ProductService.getProducts(req.query)
  return res.status(200).json({
    success:true,
    data,totalCount
  })
  });
  
// lấy 1 sản phẩm 

const getProduct = asyncHandler(async(req,res)=>{
  
        const {pid}=req.params
        const data = await ProductService.getProduct(pid)
        return res.status(200).json({
         success:true,
         data
        })
   
})

// cập nhật sản phẩm & trạng thái chuỗi cung ứng (processing -> packaged -> shipped -> delivered)
const updateProduct = asyncHandler(async(req,res)=>{
        const {pid}=req.params
        const updateData = req.body;
        const updatedProduct = await ProductService.updateProduct(pid, updateData, req.file, req.user);
  return res.status(200).json({
    success:true,
    message:'cập nhật thành công sản phẩm',
    product: updatedProduct
  })
})
// xoá 1 sản phẩm
const deleteProduct = asyncHandler(async(req,res)=>{
        const {pid}=req.params
        await ProductService.deleteProduct(pid)
        res.status(200).json({ 
        success: true,
        message: `đã xoá sản phẩm thành công` });
});

// Truy xuất nguồn gốc chi tiết (5 Giai đoạn - Timeline Nông sản cho người quét mã QR)
const getTraceability = asyncHandler(async(req, res) => {
  const { pid } = req.params;
  const traceData = await ProductService.getTraceabilityData(pid);
  return res.status(200).json({
    success: true,
    message: 'Truy xuất nguồn gốc nông sản thành công',
    data: traceData
  });
});

// Xác thực tính toàn vẹn Blockchain
const verifyIntegrity = asyncHandler(async(req, res) => {
  const { pid } = req.params;
  const verificationResult = await ProductService.verifyBlockchainIntegrity(pid);
  return res.status(200).json({
    success: true,
    message: verificationResult.message,
    data: verificationResult
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getTraceability,
  verifyIntegrity,
  updateProduct,
  deleteProduct
};