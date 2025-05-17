const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  size: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['empty', 'planted', 'harvested', 'under_renovation'],
    default: 'empty',
  },
  growthStatus: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'good',
  },
  pestStatus: {
    type: String,
    enum: ['none', 'low', 'medium', 'high'],
    default: 'none',
  },
  crops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vegetable',
  }],
  cropCycle: {
    startDate: {
      type: Date,
    },
    harvestDate: {
      type: Date,
    },
  },
  monitoringLogs: [{
    checkDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['normal', 'warning', 'critical'],
      default: 'normal',
    },
    remarks: {
      type: String,
    },
  }],
  lastCheckedAt: {
    type: Date,
    default: Date.now,
  },
  historyLogs: [{
    crops: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vegetable',
    }],
    cropCycle: {
      startDate: Date,
      harvestDate: Date,
    },
    status: {
      type: String,
      enum: ['harvested', 'aborted'],
      default: 'harvested',
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]

}, {
  timestamps: true,
  versionKey: false 
});

// Middleware trước khi lưu
BedSchema.pre('save', function (next) {
  if (this.status === 'planted' && !this.cropCycle.startDate) {
    this.cropCycle.startDate = new Date(); // Cập nhật ngày bắt đầu trồng nếu chưa có
  }
  if (this.status === 'harvested' && !this.cropCycle.harvestDate) {
    this.cropCycle.harvestDate = new Date(); // Cập nhật ngày thu hoạch
  }
  next();
});
BedSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Bed', BedSchema);
