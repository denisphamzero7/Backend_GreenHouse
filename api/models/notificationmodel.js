const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     
    },
    greenhouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Greenhouse",
    
    },
    cageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GreenhouseCage",
    },
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
    },
    taskType: {
      type: String,
      enum: ["Tưới nước", "Bón phân", "Phun thuốc", "Kiểm tra nhiệt độ", "Thu hoạch"],
    
    },
    message: {
      type: String,
     
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;