const mongoose = require('mongoose');

const VegetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Đảm bảo rằng mỗi loại rau củ quả có tên duy nhất
  },
  image: {
    type: String,
    default: null,
  },
 
  harvestTime: {
    type: Number,  // Thời gian thu hoạch (ví dụ: 60 ngày sau khi trồng)
    // required: true,
  },
  soilType: {
    type: String,
    enum: ['Loamy', 'Clay', 'Sandy', 'Peaty', 'Saline'],  // Các loại đất thích hợp cho rau củ quả
    default: 'Loamy',
  },
  // sunlightRequirement: {
  //   type: String,
  //   enum: ['Full sun', 'Partial shade', 'Full shade'],
  //   default: 'Full sun',  // Yêu cầu ánh sáng cho cây trồng
  // },
  // temperatureRange: {
  //   type: String,
  //   required: true,
  //   default: '15-25°C',  // Phạm vi nhiệt độ phù hợp cho cây trồng
  // },
  description: {
    type: String,
    default: 'No description available',  // Mô tả về loại rau củ quả
    description: 'Thông tin mô tả về loại rau củ quả này, giúp người dùng hiểu rõ hơn về đặc điểm của chúng.'
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,  // Tham chiếu tới nhóm rau củ (Category)
    ref: 'Category',  // Tên của model nhóm rau củ
    // required: true,
  },
}, {
  timestamps: true,  // Mongoose tự động thêm createdAt và updatedAt
  versionKey: false 
});
VegetableSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
module.exports = mongoose.model('Vegetable', VegetableSchema);
