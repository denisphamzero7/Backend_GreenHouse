const Crops = require('../models/vegetablesModel')
const apiError = require('../untiles/apiError')

const createCropService = async(data,file)=>{
  const {name}= data
  console.log('name :',name);
  const existingBeds = await Crops.findOne({name})
  if(existingBeds){
     throw new apiError(400,'name','tên của cây trồng đã có')
  }
  const image = file ? file.path : null
  const createCrop = await Crops.create({...data,image})
  return createCrop
}
const getCropsService = async (query) => {
    const queries = { ...query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(field => delete queries[field]);
  
    let queryString = JSON.stringify(queries).replace(/\b(gt|lt|eq|gte|lte)\b/g, (match) => `$${match}`);
    const formattedQueries = JSON.parse(queryString);
  
    if (queries?.name) {
      formattedQueries.name = { $regex: new RegExp(queries.name, 'i') };
    }
  
    let queryCommand = Crops.find(formattedQueries);
  
    if (query.sort) queryCommand = queryCommand.sort(query.sort.split(',').join(' '));
    if (query.fields) queryCommand = queryCommand.select(query.fields.split(',').join(' '));
  
    const page = +query.page || 1;
    const limit = +query.limit || process.env.LIMIT_BEDS || 10;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);
  
    const data = await queryCommand.exec();
    const totalCount = await Crops.countDocuments(formattedQueries);
  
    return { data, totalCount };
  };
  const getCropById = async(bedId)=>{
    return Crops.findById(bedId)
  }
  const updateCrops = async(cropId,updatedata,file)=>{
    if(file){
      updatedata.image = file.path
    }
    const updateCrops = await Crops.findByIdAndUpdate(cropId,updatedata,{new:true})
    return updateCrops
  }

  const deleteCrops = async(cropId)=>{
    const Crop = await Crops.findByIdAndDelete(cropId)
    if(!Crop) throw new apiError(400,'cropId','không thấy cây trồng')
    return bed
  }
  
module.exports={createCropService,getCropsService,getCropById,updateCrops,deleteCrops}