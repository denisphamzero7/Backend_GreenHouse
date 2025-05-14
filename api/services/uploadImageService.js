// upload image

const handleImageUpload = (file) => {
    if (!file) {
      const error = new Error('No image file provided. Ensure the field name matches the server configuration.');
      error.statusCode = 400;
      throw error;
    }
  
    const imagePath = file.path;
    const imageSize = file.size;
  
    return {
      imageUrl: imagePath,
      imageSize: `${(imageSize / 1024).toFixed(2)} KB`,
    };
  };
  
  module.exports = {
    handleImageUpload,
  };
  