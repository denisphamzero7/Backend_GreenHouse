const Beds = require("../models/bedsModel");
const apiError = require("../untiles/apiError");
const mongoose = require('mongoose');
// service của luống đất
const createBedsService = async (data, file) => {
  const { name } = data;
  console.log("name :", name);
  const existingBeds = await Beds.findOne({ name });
  if (existingBeds) {
    throw new apiError(400, "name", "tên của luống đất đã có");
  }
  const image = file ? file.path : null;
  const createBed = await Beds.create({ ...data, image });
  return createBed;
};
const getBedsService = async (query) => {
  const queries = { ...query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((field) => delete queries[field]);

  let queryString = JSON.stringify(queries).replace(
    /\b(gt|lt|eq|gte|lte)\b/g,
    (match) => `$${match}`
  );
  const formattedQueries = JSON.parse(queryString);
  if (queries?.name) {
    formattedQueries.name = { $regex: new RegExp(queries.name, "i") };
  }
  let queryCommand = Beds.find(formattedQueries);
  if (query.sort)
    queryCommand = queryCommand.sort(query.sort.split(",").join(" "));
  if (query.fields)
    queryCommand = queryCommand.select(query.fields.split(",").join(" "));
  const page = +query.page || 1;
  const limit = +query.limit || process.env.LIMIT_BEDS || 10;
  const skip = (page - 1) * limit;
  queryCommand = queryCommand.skip(skip).limit(limit);

  const data = await queryCommand.exec();
  const totalCount = await Beds.countDocuments(formattedQueries);

  return { data, totalCount };
};
const getBedById = async (bedid) => {
  return Beds.findById(bedid);
};
const updateBed = async (bedid, updatedata, file) => {
  if (file) {
    updatedata.image = file.path;
  }
  const updateBed = await Beds.findByIdAndUpdate(bedid, updatedata, {
    new: true,
  });
  return updateBed;
};
const updateBedStatus = async (bedid, status, crops, note) => {
  const bed = await Beds.findById(bedid);
  if (!bed) throw new apiError(400, "bedId", "Không tìm thấy luống rau này");

 
  if (status === "harvested" && bed.status === "planted") {
   
    const harvestDate = new Date();
    if (!bed.cropCycle.startDate) {
    
      bed.cropCycle.startDate = bed.createdAt;
    }
    bed.cropCycle.harvestDate = harvestDate;

   
    bed.historyLogs.push({
      crops: bed.crops,               
      cropCycle: {
        startDate: bed.cropCycle.startDate,
        harvestDate,
      },
      status: "harvested",
      note: note || "Thu hoạch tự động",
    });

   
    bed.crops = [];
    bed.cropCycle = {};
  }

  if (bed.status !== "empty" && status === "planted") {
    throw new apiError(
      400,
      "status",
      "Luống rau đang trồng, bạn không thể thay đổi trạng thái"
    );
  }

  if (status) bed.status = status;
  if (crops) bed.crops = crops;

  await bed.save();
  return bed;
};
const getBedHistoryLogs = async (bedid) => {
  const bedExists = await Beds.exists({ _id: bedid });
  if (!bedExists) {
    throw new apiError(404, "bedid", "Không tìm thấy luống đất");
  }  
  const queries = { ...query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((field) => delete queries[field]);

  let queryString = JSON.stringify(queries).replace(
    /\b(gt|lt|eq|gte|lte)\b/g,
    (match) => `$${match}`
  );
  const formattedQueries = JSON.parse(queryString);

  const page = Math.max(1, parseInt(query.page, 10)) || 1;
  const limit = Math.max(1, parseInt(query.limit, 10)) || 
                Math.max(1, parseInt(process.env.LIMIT_BEDS, 10)) || 
                10;

  if (isNaN(limit) || limit < 1) {
    throw new apiError(400, "limit", "Giới hạn phải là số nguyên dương");
  }

  const skip = (page - 1) * limit;


  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(bedid) } },
    { $unwind: "$historyLogs" },
  ];

 
  if (Object.keys(formattedQueries).length > 0) {
    pipeline.push({ $match: { "historyLogs": formattedQueries } });
  }

  // Lọc theo status nếu có query.name
  if (queries?.name) {
    pipeline.push({
      $match: {
        "historyLogs.status": { $regex: new RegExp(queries.name, "i") },
      },
    });
  }

  // Sắp xếp (nếu có)
  if (query.sort) {
    const sortQuery = {};
    query.sort.split(",").forEach((field) => {
      sortQuery[`historyLogs.${field}`] = 1;
    });
    pipeline.push({ $sort: sortQuery });
  }

  // Phân trang
  pipeline.push(
    { $skip: skip },
    { $limit: limit }
  );

  // Trả về log đơn lẻ
  pipeline.push({ $replaceRoot: { newRoot: "$monitoringLogs" } });

  // Thực thi pipeline
  const data = await Beds.aggregate(pipeline);

  // Đếm tổng số bản ghi
  const countPipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(bedid) } },
    { $unwind: "$monitoringLogs" },
    ...(Object.keys(formattedQueries).length > 0
      ? [{ $match: { "monitoringLogs": formattedQueries } }]
      : []),
    { $count: "totalCount" },
  ];

  const countResult = await Beds.aggregate(countPipeline);
  const totalCount = countResult[0]?.totalCount || 0;

  return { data, totalCount };
};
const deleteBed = async (bedid) => {
  const bed = await Beds.findByIdAndDelete(bedid);
  if (!bed) throw new apiError(400, "bedId", "không thấy luống rau");
  return bed;
};
const addMonitoringLog = async (bedid, { status: logStatus, remarks }) => {
  const newLog = {
    checkDate: new Date(),
    status: logStatus, 
    remarks,
  };
  const updated = await Beds.findByIdAndUpdate(
    bedid,
    {
      $push: { monitoringLogs: newLog },
      $set: { lastCheckedAt: new Date() },
    },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  if (!updated) throw new apiError(404, "Bed không tìm thấy");
  return updated;
};

const getMonitoringLogs = async (bedid, query) => {
 

  const bedExists = await Beds.exists({ _id: bedid });
  if (!bedExists) {
    throw new apiError(404, "bedid", "Không tìm thấy luống đất");
  }  
  const queries = { ...query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((field) => delete queries[field]);

  let queryString = JSON.stringify(queries).replace(
    /\b(gt|lt|eq|gte|lte)\b/g,
    (match) => `$${match}`
  );
  const formattedQueries = JSON.parse(queryString);

  const page = Math.max(1, parseInt(query.page, 10)) || 1;
  const limit = Math.max(1, parseInt(query.limit, 10)) || 
                Math.max(1, parseInt(process.env.LIMIT_BEDS, 10)) || 
                10;

  if (isNaN(limit) || limit < 1) {
    throw new apiError(400, "limit", "Giới hạn phải là số nguyên dương");
  }

  const skip = (page - 1) * limit;


  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(bedid) } },
    { $unwind: "$monitoringLogs" },
  ];

 
  if (Object.keys(formattedQueries).length > 0) {
    pipeline.push({ $match: { "monitoringLogs": formattedQueries } });
  }

  // Lọc theo status nếu có query.name
  if (queries?.name) {
    pipeline.push({
      $match: {
        "monitoringLogs.status": { $regex: new RegExp(queries.name, "i") },
      },
    });
  }

  // Sắp xếp (nếu có)
  if (query.sort) {
    const sortQuery = {};
    query.sort.split(",").forEach((field) => {
      sortQuery[`monitoringLogs.${field}`] = 1;
    });
    pipeline.push({ $sort: sortQuery });
  }

  // Phân trang
  pipeline.push(
    { $skip: skip },
    { $limit: limit }
  );

  // Trả về log đơn lẻ
  pipeline.push({ $replaceRoot: { newRoot: "$monitoringLogs" } });

  // Thực thi pipeline
  const data = await Beds.aggregate(pipeline);

  // Đếm tổng số bản ghi
  const countPipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(bedid) } },
    { $unwind: "$monitoringLogs" },
    ...(Object.keys(formattedQueries).length > 0
      ? [{ $match: { "monitoringLogs": formattedQueries } }]
      : []),
    { $count: "totalCount" },
  ];

  const countResult = await Beds.aggregate(countPipeline);
  const totalCount = countResult[0]?.totalCount || 0;

  return { data, totalCount };
};
const deleteLogbyId = async(bedid,logid)=>{
 
  const updatedBed = await Beds.findByIdAndUpdate(
    bedid,
    { $pull: { monitoringLogs: { _id:logid} } }, 
    { new: true } 
  );
  if (!updatedBed) {
    throw new Error('Bed không tồn tại');
  }

  return updatedBed;
 
}
const deleteHistoryLogById = async (bedid, logid) => {
  if (!mongoose.Types.ObjectId.isValid(bedId) || !mongoose.Types.ObjectId.isValid(logid)) {
    throw new apiError(400, "id", "ID không hợp lệ");
  }

  const updatedBed = await Beds.findByIdAndUpdate(
    bedid,
    { $pull: { historyLogs: { _id: logid } } },
    { new: true }
  );

  if (!updatedBed) {
    throw new apiError(404, "bedId", "Không tìm thấy luống rau");
  }


  const existed = updatedBed.historyLogs.some((log) => log._id.equals(logid));
  if (existed) {
    throw new apiError(404, "logId", "Xóa lịch sử thu hoạch thất bại");
  }

  return updatedBed;
};

module.exports = {
  createBedsService,
  getBedsService,
  getBedById,
  updateBed,
  updateBedStatus,
  deleteBed,
  addMonitoringLog,
  getMonitoringLogs,
  deleteLogbyId,
  getBedHistoryLogs,
  deleteHistoryLogById
};
