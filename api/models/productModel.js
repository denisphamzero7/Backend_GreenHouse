const mongoose = require('mongoose');

// Schema cho sản phẩm
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    // required: true,
  },
  crops:{
   type: mongoose.Schema.Types.ObjectId,
    ref: 'Vegetable',
    // required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    // required: true,
  },
  greenhouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Greenhouse',
    // required: true,
  },
  beds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      // required: true,
    },
  ],
  totalQuantity: {
    type: Number,
    // required: true,
  },
  harvestDate: {
    type: Date,
    default: Date.now,
  },
  // blockchain: {
  //   blockchainHash: {
  //     type: String,
  //     required: true,
  //   },
  //   transactionId: {
  //     type: String,
  //     required: true,
  //   },
  //   blockchainType: {
  //     type: String,
  //     required: true,
  //   },
  // },
  qualityStatus: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'good',
  },
  seedOrigin: {
    type: String,
  },
  status: {
    type: String,
    enum: ['processing', 'packaged', 'shipped', 'delivered'],
    default: 'processing',
  },
  unit: {
    type: String,
    enum: ['kg', 'bundle', 'piece'],
    default: 'kg',
  },
  notes: {
    type: String,
  },
},
{  versionKey: false }); // loại bỏ __v của mongoose
productSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
module.exports = mongoose.model('Product', productSchema);
