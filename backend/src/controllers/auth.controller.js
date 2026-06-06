const crypto = require('crypto');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog.service');
const { sendPasswordReset } = require('../services/email.service');

// 1. Register User
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new ApiError(409, 'Email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  // Exclude password and refresh token from output
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  res.status(201).json(
    new ApiResponse(
      201,
      { user: userData, accessToken, refreshToken },
      'User registered successfully'
    )
  );
});

// 2. Login User
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  await logActivity({
    userId: user._id,
    action: 'USER_LOGIN',
    module: 'auth',
    targetId: user._id,
    targetModel: 'User',
    description: `User ${user.email} logged in successfully`,
    req
  });

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  res.status(200).json(
    new ApiResponse(
      200,
      { user: userData, accessToken, refreshToken },
      'Login successful'
    )
  );
});

// 3. Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: incomingToken } = req.body;

  if (!incomingToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    const decoded = require('jsonwebtoken').verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded._id, refreshToken: incomingToken });

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const newAccessToken = user.generateAccessToken();

    res.status(200).json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        'Access token refreshed successfully'
      )
    );
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

// 4. Logout User
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save();

    await logActivity({
      userId: user._id,
      action: 'USER_LOGOUT',
      module: 'auth',
      targetId: user._id,
      targetModel: 'User',
      description: `User ${user.email} logged out successfully`,
      req
    });
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

// 5. Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Return same success message either way to prevent enumeration
    res.status(200).json(
      new ApiResponse(200, null, 'If this email exists, a reset link has been sent')
    );
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  try {
    await sendPasswordReset(user, resetUrl);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    throw new ApiError(500, 'Error sending password reset email');
  }

  res.status(200).json(
    new ApiResponse(200, null, 'If this email exists, a reset link has been sent')
  );
});

// 6. Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshToken = null; // Force re-login
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password reset successful')
  );
});

// 7. Get Current User Info
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, req.user, 'Current user data retrieved successfully')
  );
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
