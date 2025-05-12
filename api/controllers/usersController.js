const asyncHandler = require("express-async-handler");
const authService = require("../services/authService");
const userService = require("../services/userService");
const ApiError = require("../untiles/apiError");
const { verify } = require("jsonwebtoken");

// Đăng ký tài khoản
const register = asyncHandler(async (req, res) => {
  const newUser = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    newUser,
    message: "User registered successfully",
  });
});

// Đăng nhập
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  // Lưu refresh token vào cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });

  res.status(200).json({
    success: true,
    accessToken,
    user,
    message: "Đăng nhập thành công",
  });
});

// Refresh access token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: oldToken } = req.cookies;
  if (!oldToken) throw new ApiError(403, "token", "Hiện chưa có token");

  const newAccessToken = await authService.refreshAccessToken(oldToken);
  res.status(200).json({
    success: true,
    newAccessToken,
  });
});

// Gửi lại OTP
const resendOTP = asyncHandler(async (req, res) => {
  await authService.sendOTP(req.body.email);
  res.status(200).json({
    success: true,
    message: "OTP đã được gửi đến email",
  });
});

// Xác minh OTP
const verifyOTP = asyncHandler(async (req, res) => {
  await authService.verifyOTP(req.body);
  res.status(200).json({
    success: true,
    message: "Xác minh tài khoản thành công",
  });
});

// Lấy danh sách người dùng
const getUsers = asyncHandler(async (req, res) => {
  const { data, totalCount } = await userService.getUsers(req.query);
  res.status(200).json({ success: true, total: totalCount, users: data });
});

// Lấy thông tin người dùng theo ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, user });
});

// Lấy thông tin người dùng hiện tại
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user._id);
  res.status(200).json({ success: true, user });
});
const updateUserById = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserById(req.params.id, req.body);
  res.status(200).json({ success: true, user: updatedUser });
});
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "Đăng xuất thành công",
  });
});
module.exports = {
  register,
  login,
  refreshToken,
  resendOTP,
  verifyOTP,
  getUsers,
  getUserById,
  getCurrentUser,
  updateUserById,
  logout
};
