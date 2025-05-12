const Greenhousecage  =  require('../models/greenhouseCageModel')
// service của lồng kính
const apiError = require('../untiles/apiError')
const createGreenhousecage = async(data,file)=>{

      const {name} = data;
    const existingGreenhousecage = await Greenhousecage.findOne({name})
    if(existingGreenhousecage) throw new apiError(400,'name','tên này đã tồn tại')
    const image = file ? file.path : null;
    const newGreenhousecage = await Greenhousecage.create({...data,image})
    return newGreenhousecage 
}
const getGreenhousecages= async (query) => {
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

    let queryCommand = Greenhousecage.find(formattedQueries);

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
    const totalCount = await Greenhousecage.countDocuments(formattedQueries);

    return { data, totalCount };
};

const getGreenhousecage = async(cid)=>{
    const data = Greenhousecage.findById(cid)
    return data
}
const updateGreenhousecage = async(cid,data,file)=>{
    if(file){
        data.image= file.path
    }
    const existing = await Greenhousecage.findById(cid);
  if (!existing) {
    throw new apiError(400,'data','Không tìm thấy lồng kính cần cập nhật');
  }
    const updatedata = await Greenhousecage.findByIdAndUpdate(cid,data,{new:true})
    return updatedata
}
const deleteGreenhousecage = async(cid)=>{
   const data = await Greenhousecage.findByIdAndDelete(cid,{new:true})
   return data
}
module.exports={
    createGreenhousecage,getGreenhousecages,getGreenhousecage,updateGreenhousecage,deleteGreenhousecage 
}
