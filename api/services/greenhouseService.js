const Greenhouse =  require('../models/greenhouseModel')

const apiError = require('../untiles/apiError')
const createGreenhouse = async(data,file)=>{

      const {name} = data;
    const existingGreenhouse= await Greenhouse.findOne({name})
    if(existingGreenhouse) throw new apiError(400,'name','tên này đã tồn tại')
    const image = file ? file.path : null;
    const newGreenhousecage = await Greenhouse.create({...data,image})
    return newGreenhousecage 
}
const getGreenhouses= async (query) => {
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

    let queryCommand = Greenhouse.find(formattedQueries).populate('cages');;

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
    const totalCount = await Greenhouse.countDocuments(formattedQueries);

    return { data, totalCount };
};

const getGreenhouse = async(grid)=>{
    const data = Greenhouse.findById(grid)
    return data
}
const updateGreenhouse = async(grid,data,file)=>{
    if(file){
        data.image= file.path
    }
    const existing = await Greenhouse.findById(grid);
  if (!existing) {
    throw new apiError(400,'data','Không tìm thấy lồng kính cần cập nhật');
  }
    const updatedata = await Greenhouse.findByIdAndUpdate(grid,data,{new:true})
    return updatedata
}
const deleteGreenhouse = async(grid)=>{
   const data = await Greenhouse.findByIdAndDelete(grid,{new:true})
   return data
}
module.exports={
    createGreenhouse,getGreenhouses,getGreenhouse,updateGreenhouse,deleteGreenhouse
}
