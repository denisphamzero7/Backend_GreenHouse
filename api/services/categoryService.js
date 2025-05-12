
const Category = require('../models/categoryModel')
const apiError = require('../untiles/apiError')

const createCategories = async(data)=>{
    console.log('dhd');
      const {name,description} = data;
      if (!data || !data.name) {
        throw new apiError(400, 'data', 'Thiếu thông tin tên loại rau');
      }
      console.log("name",name);
    const existingCategory = await Category.findOne({name})
    if(existingCategory) throw new apiError(400,'name','tên này đã tồn tại')
    const createCategories = await Category.create({name,description})
    return createCategories
}
const getCategories = async (query) => {
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

    let queryCommand = Category.find(formattedQueries);

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
    const totalCount = await Category.countDocuments(formattedQueries);

    return { data, totalCount };
};

const getCategoryService = async(cid)=>{
    const category = Category.findById(cid)
    return category
}
const updateCategory = async(cid,data)=>{
    const categories = await Category.findByIdAndUpdate(cid,...data,{new:true})
    return categories
}
const deleteCategory = async(cid)=>{
   const deleteCategory = await Category.findByIdAndDelete(cid,{new:true})
   return deleteCategory
}
module.exports={
    createCategories,getCategories,getCategoryService,updateCategory,deleteCategory
}