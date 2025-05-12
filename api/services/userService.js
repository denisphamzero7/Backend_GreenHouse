const User = require('../models/userModel');
const ApiError = require('../untiles/apiError');


const getUsers = async(query)=>{
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

    let queryCommand = User.find(formattedQueries).populate('greenhouse','beds category crops').select('-password');

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
    const totalCount = await User.countDocuments(formattedQueries);

    return { data, totalCount };

}

const getUserById = async(id)=>{
    const user = await User.findById(id).populate('greenhouse','beds category crops');
  if (!user) throw new ApiError(404,'user','User not found');
  return user;
}

const getCurrentUser = async(id)=>{
    const user = await User.findById(id)
    .select('-password -otp -otpExpires')
    .populate('greenhouse','beds category crops');
  if (!user) throw new ApiError(404,'user','User not found');
  return user;
}
const updateUserById = async (id, data) => {
    const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
    if (!user) throw new ApiError(404, 'user', 'User not found');
    return user;
};
module.exports = { getUsers, getUserById, getCurrentUser, updateUserById };
