const User = require("../models/userModel");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const { sendOtpEmail } = require("../untiles/sendemail");
const ApiError = require("../untiles/apiError");
const { verify } = require("jsonwebtoken");
//  authentication service
const registerUser = async ({ email, name, password, phone, role }) => {
  if (!email || !name || !password || !phone) {
    throw new ApiError(400, "fields", "Missing required fields");
  }
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    const duplicates = [];
    if (existing.email === email) duplicates.push("email");
    if (existing.phone === phone) duplicates.push("phone");
    throw new ApiError(
      400,
      duplicates.join(","),
      "Email or phone already exists"
    );
  }
  const adminExists = await User.exists({ role: "admin" });
  const userRole =
    role && ["admin", "user"].includes(role)
      ? role
      : !adminExists
      ? "admin"
      : "user";
  const user = await User.create({
    email,
    name,
    password,
    phone,
    role: userRole,
  });
  return user;
};
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "email", "Email not found");
  if (!user.isVerified)
    throw new ApiError(403, "isVerified", "Account not verified");
  const match = await user.isCorrectPassword(password);
  if (!match) throw new ApiError(400, "password", "Incorrect password");

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  const userData = user.toObject();
  delete userData.password;
  delete userData.otp;
  delete userData.otpExpires;

  return { user: userData, accessToken, refreshToken };
};
const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "user", "User not found");

  user.refreshToken = null;
  await user.save();
};
const refreshAccessToken =async(cookies)=>{
  if (!cookies || !cookies.refreshToken) {
    throw new ApiError(403, 'Chưa có refresh token');
  }

  let payload;
  try {
    payload = verify(cookies.refreshToken, process.env.JWT_SECRET);
    console.log(payload);
  } catch (err) {
    throw new ApiError(403, 'Refresh token không hợp lệ');
  }

  const user = await User.findOne({
    _id: payload._id,
    refreshToken: cookies.refreshToken,
  });

  if (!user) {
    throw new ApiError(403, 'Token không hợp lệ');
  }

  const newAccessToken = generateAccessToken({ _id: user._id, role: user.role });
  return { newAccessToken };
}
const sendOTP= async(email)=>{
    if (!email) throw new ApiError(400, 'email', 'Email required');
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'email', 'User not found');
  if (user.isVerified) throw new ApiError(400, 'verified', 'Already verified');
  const otp = Math.floor(1000 + Math.random()*9000);
  user.otp = otp;
  user.otpExpires = Date.now() + 10*60*1000;
  await user.save();
  await sendOtpEmail(email, otp);
}
const verifyOTP = async({email,otp})=>{
    if (!email || !otp) throw new ApiError(400, 'fields', 'Missing required fields');
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'email', 'User not found');
  if (user.otpExpires < Date.now()) throw new ApiError(400, 'otp', 'OTP expired');
  if (user.otp !== otp) throw new ApiError(400, 'otp', 'Invalid OTP');
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();
}

module.exports = { registerUser, loginUser, refreshAccessToken, sendOTP, verifyOTP,logoutUser  };