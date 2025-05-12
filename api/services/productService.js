const Product =  require('../models/greenhouseModel')

const apiError = require('../untiles/apiError')
const createProduct = async(data,file)=>{

    const {name,quantity,greenhouse,beds,category,crops} = data;
    const existing = await Product.findOne({name})
    if(existing) throw new apiError(400,'name','tên này đã tồn tại')
    const image = file ? file.path : null;
    const newProduct = await Product.create({data,image})
    return newProduct
}
const getProducts= async (query) => {
    const queries = { ...query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(field => delete queries[field]);

    // Build formatted query
    let queryString = JSON.stringify(queries).replace(
        /\b(gt|lt|eq|gte|lte)\b/g,
        (match) => `$${match}`
    );
    const formattedQueries = JSON.parse(queryString);

    // Handle name filter (case-insensitive)
    if (query.name) {
        formattedQueries.name = { $regex: new RegExp(query.name, 'i') };
    }

    let queryCommand = Product.find(formattedQueries).populate('greenhouse', 'beds category crops');

    if (query.sort) {
        queryCommand = queryCommand.sort(query.sort.split(',').join(' '));
    }

    if (query.fields) {
        queryCommand = queryCommand.select(query.fields.split(',').join(' '));
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || parseInt(process.env.LIMIT_GREENHOUSECAGES) || 10;
    const skip = (page - 1) * limit;

    queryCommand = queryCommand.skip(skip).limit(limit);

    const data = await queryCommand.exec();
    const totalCount = await Product.countDocuments(formattedQueries);

    return { data, totalCount };
};

const getProduct = async(pid)=>{
    const data = Product.findById(grid).populate('greenhouse', 'beds category crops')
    return data
}
const updateProduct= async(pid,data,file)=>{
    if(file){
        data.image= file.path
    }
    const existing = await Product.findById(pid);
  if (!existing) {
    throw new apiError(400,'data','Không tìm thấy lồng kính cần cập nhật');
  }
    const updatedata = await Product.findByIdAndUpdate(grid,data,{new:true})
    return updatedata
}
const deleteProduct = async(pid)=>{
   const data = await Product.findByIdAndDelete(pid,{new:true})
   return data
}
module.exports={
    createProduct,getProducts,getProduct,updateProduct,deleteProduct
}
