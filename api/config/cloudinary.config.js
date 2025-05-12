const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'greenhouse',
    format: async (req, file) => file.mimetype.split('/')[1], // Tự động lấy định dạng từ file
    allowedFormats: ['jpg', 'png'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const uploadCloud = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
});

module.exports = uploadCloud;
