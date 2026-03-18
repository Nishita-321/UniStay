import User from "./user.model.js";
import { generateToken } from "../../utils/jwt.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Contact admin.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: "Login successful.",
    data: { user, token },
  });
});

// GET /api/auth/me
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    req.user.role === "student" ? "hostel" : ""
  );

  res.json({ success: true, data: { user } });
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new passwords are required.");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters.");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully." });
});
