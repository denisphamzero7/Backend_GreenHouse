const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, 
  },
  description: {
    type: String,
    default: 'No description available',  
  },
  vegetables:[{
    type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' 
  }]
}, {
  timestamps: true,
  versionKey: false   
});
CategorySchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
module.exports = mongoose.model('Category', CategorySchema);
