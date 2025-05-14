
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

// cập nhật sản phẩm

const updateProduct = asyncHandler(async(req,res)=>{
    
        const {pid}=req.params
        const updateData = req.body;
        await ProductService.updateProduct(pid,updateData,req.file)
  return res.status(200).json({
    success:true,
    message:'cập nhật thành công sản phẩm'
  })
})
// xoá 1 sản phẩm

const deleteProduct = asyncHandler(async(req,res)=>{
  
        const {pid}=req.params
        await ProductService.deleteProduct(pid)
        res.status(200).json({ 
        success: true,
        message: `đã xoá sản phẩm  thành công` });
})
module.exports ={
    createProduct,getProducts,getProduct,updateProduct,deleteProduct
}