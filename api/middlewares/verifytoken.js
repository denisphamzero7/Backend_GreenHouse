const jwt = require('jsonwebtoken');

const asyncHandler = require("express-async-handler");

const verifyAccessToken = asyncHandler(async (req, res,next) => {
  console.log('Authorization Header:', req.headers.authorization); // Debugging log
     if(req?.headers?.authorization?.startsWith('Bearer')){
        const token = req.headers?.authorization?.split(' ')[1]
        jwt.verify(token,process.env.JWT_SECRET,(err,decode)=>{
            if(err){
              console.log('Token Error:', err);  
                return res.status(401).json({
                    success:false,
                    message:'invalid access token'})
            }
            req.user = decode;
            console.log('Decoded User:',req.user);
            next()
        })
     } else{
        return res.status(401).json({
            success:false,
            message:'requires authentication'
        })
     }
})
const isAdminOrManager = asyncHandler((req, res, next) => {
    if (req.user?.role === 'admin' || req.user?.role === 'manager') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied !!!'
      });
    }
  });
  const isStaff = asyncHandler((req, res, next) => {
    if (req.user?.role === 'staff') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  });
module.exports ={ verifyAccessToken,isAdminOrManager,isStaff  }