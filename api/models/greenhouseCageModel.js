const mongoose = require('mongoose');

const GreenhouseCageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  
  },
  image:{
    type: String,
    default: null,
},
  greenhouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Greenhouse',
    // required: true,  // Liên kết bắt buộc với nhà kính
  },
  
  beds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    // required: true,  // Liên kết bắt buộc với các luống đất
  }],
}, {
  timestamps: true , // Tự động tạo createdAt và updatedAt
  versionKey: false 
});
GreenhouseCageSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
module.exports = mongoose.model('GreenhouseCage', GreenhouseCageSchema);
