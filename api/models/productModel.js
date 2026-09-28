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
    default: 0,
  },
  batchCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  harvestDate: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    default: null,
  },
  qrCode: {
    type: String, // DataURL Base64 hoặc URL ảnh Cloudinary
    default: null,
  },
  blockchain: {
    dataHash: {
      type: String,
      default: null,
    },
    txHash: {
      type: String,
      default: null,
    },
    contractAddress: {
      type: String,
      default: null,
    },
    network: {
      type: String,
      default: 'Sepolia Testnet / Provenance Ledger',
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    recordedAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  qualityStatus: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'good',
  },
  seedOrigin: {
    type: String,
    default: 'Nhập khẩu chuẩn F1',
  },
  status: {
    type: String,
    enum: ['processing', 'packaged', 'shipped', 'delivered'],
    default: 'processing',
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['processing', 'packaged', 'shipped', 'delivered'],
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      updatedBy: {
        type: String,
        default: 'System / Manager',
      },
      notes: {
        type: String,
        default: '',
      },
      location: {
        type: String,
        default: '',
      },
    },
  ],
  unit: {
    type: String,
    enum: ['kg', 'bundle', 'piece'],
    default: 'kg',
  },
  notes: {
    type: String,
  },
},
{ timestamps: true, versionKey: false }); // loại bỏ __v của mongoose
productSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
module.exports = mongoose.model('Product', productSchema);
