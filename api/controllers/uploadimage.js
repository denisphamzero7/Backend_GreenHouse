// controllers/uploadController.js
const asyncHandler = require('express-async-handler');
const { handleImageUpload } = require('../services/uploadImageService');

const uploadImage = asyncHandler(async (req, res) => {
  
    const result = handleImageUpload(req.file);
    return res.status(200).json({ 
      success: true, 
      message: 'Image uploaded successfully', 
      ...result,
    });

});

module.exports = {
  uploadImage,
};
