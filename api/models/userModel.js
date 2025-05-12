const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Dùng bcrypt để mã hóa mật khẩu
const crypto = require('crypto');

// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image:{
        type: String,
        default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,  // Đảm bảo email là duy nhất
      lowercase: true,  // Chuyển tất cả ký tự trong email thành chữ thường
    },
    phone:{
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
      minlength: 6,  // Mật khẩu phải có ít nhất 6 ký tự
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager','staff'],  // Các vai trò của người dùng
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,  // Kiểm tra xem người dùng đã xác thực hay chưa
    },
    otp:{
      type: String,
      default: null,
      required:false,
    },
    otpExpires :{
      type: Date,
      default: null,
      required:false,
    },
    greenhouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Greenhouse' } 
    
  },
  {
    timestamps: true,  // Tự động thêm trường createdAt và updatedAt
    versionKey: false 
  }
);

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // Nếu mật khẩu không thay đổi thì không làm gì
  try {
    const salt = await bcrypt.genSalt(10);  // Tạo salt với độ dài 10
    this.password = await bcrypt.hash(this.password, salt);  // Mã hóa mật khẩu
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
// Phương thức xác thực mật khẩu
userSchema.methods={
  isCorrectPassword: async function(password){
      return await bcrypt.compare(password,this.password);
  },
  createPasswordToken: function(){
       const resetToken = crypto.randomBytes(32).toString("hex");
       this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
       this.passwordResetExpires = Date.now() + 15*60*1000;
       return resetToken;
  },
 
}

// Tạo model người dùng
const User = mongoose.model('User', userSchema);

module.exports = User;
