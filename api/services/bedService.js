const Beds = require('../models/bedsModel')
const apiError = require('../untiles/apiError')
 // service của luống đất
const createBedsService = async(data,file)=>{
  const {name}= data
  console.log('name :',name);
  const existingBeds = await Beds.findOne({name})
  if(existingBeds){
     throw new apiError(400,'name','tên của luống đất đã có')
  }
  const image = file ? file.path : null
  const createBed = await Beds.create({...data,image})
  return createBed
}
const getBedsService = async (query) => {
    const queries = { ...query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(field => delete queries[field]);
  
    let queryString = JSON.stringify(queries).replace(/\b(gt|lt|eq|gte|lte)\b/g, (match) => `$${match}`);
    const formattedQueries = JSON.parse(queryString);
  
    if (queries?.name) {
      formattedQueries.name = { $regex: new RegExp(queries.name, 'i') };
    }
  
    let queryCommand = Beds.find(formattedQueries);
  
    if (query.sort) queryCommand = queryCommand.sort(query.sort.split(',').join(' '));
    if (query.fields) queryCommand = queryCommand.select(query.fields.split(',').join(' '));
  
    const page = +query.page || 1;
    const limit = +query.limit || process.env.LIMIT_BEDS || 10;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);
  
    const data = await queryCommand.exec();
    const totalCount = await Beds.countDocuments(formattedQueries);
  
    return { data, totalCount };
  };
  const getBedById = async(bedid)=>{
    return Beds.findById(bedid)
  }
  const updateBed = async(bedid,updatedata,file)=>{
    if(file){
      updatedata.image = file.path
    }
    const updateBed = await Beds.findByIdAndUpdate(bedid,updatedata,{new:true})
    return updateBed
  }
  const updateBedStatus = async(bedid,crops)=>{
    const bed = await Beds.findById(bedid)
    if(!bed)  throw new apiError(400,'bedId','không tìm thấy luống rau này')
    if (bed.status !== 'empty' && status === 'planted') {
      throw new apiError(400, 'status', 'Luống rau đang trồng, bạn không thể thay đổi trạng thái');
    }
    if (status) bed.status = status;
    if (crops) bed.crops = crops;
    await bed.save();
    return bed;
  }
  const deleteBed = async(bedid)=>{
    const bed = await Beds.findByIdAndDelete(bedid)
    if(!bed) throw new apiError(400,'bedId','không thấy luống rau')
    return bed
  }
  
module.exports={createBedsService,getBedsService,getBedById,updateBed,updateBedStatus,deleteBed}