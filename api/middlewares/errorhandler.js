const ApiError = require('../untiles/apiError')
const httpStatus = require('http-status');
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};
const errorHandler = (err, req, res, next) => {
  const statusCode = Number(err.statusCode || err.status) || 500;

  if (statusCode === 500) {
    console.error('Lỗi 500:', err.stack);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};



module.exports = {
  notFound,
  errorHandler
};
