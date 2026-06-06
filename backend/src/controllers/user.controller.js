const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog.service');

// 1. Get All Users (Paginated & Filtered)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  const totalCount = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password -refreshToken -passwordResetToken -passwordResetExpiry')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'Users retrieved successfully'
    )
  );
});

// 2. Get User By ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password -refreshToken -passwordResetToken -passwordResetExpiry');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'User retrieved successfully')
  );
});

// 3. Admin updates user name, role, isActive
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Cannot change own role or deactivate self
  if (req.user._id.toString() === id) {
    if (role && role !== user.role) {
      throw new ApiError(400, 'Cannot change your own role');
    }
    if (isActive !== undefined && isActive === false) {
      throw new ApiError(400, 'Cannot deactivate your own account');
    }
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  await logActivity({
    userId: req.user._id,
    action: 'USER_UPDATED',
    module: 'user',
    targetId: user._id,
    targetModel: 'User',
    description: `User ${user.email} updated by admin`,
    req
  });

  const updatedUser = user.toObject();
  delete updatedUser.password;
  delete updatedUser.refreshToken;

  res.status(200).json(
    new ApiResponse(200, updatedUser, 'User updated successfully')
  );
});

// 4. Soft Delete User (set isActive = false)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'Cannot delete your own account');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = false;
  await user.save();

  await logActivity({
    userId: req.user._id,
    action: 'USER_DEACTIVATED',
    module: 'user',
    targetId: user._id,
    targetModel: 'User',
    description: `User ${user.email} deactivated (soft deleted) by admin`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully')
  );
});

// 5. Update Profile (Name only)
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, 'Name is required');
  }

  const user = await User.findById(req.user._id);
  user.name = name;
  await user.save();

  await logActivity({
    userId: user._id,
    action: 'USER_UPDATED',
    module: 'user',
    targetId: user._id,
    targetModel: 'User',
    description: `User ${user.email} updated their profile name`,
    req
  });

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  res.status(200).json(
    new ApiResponse(200, userData, 'Profile updated successfully')
  );
});

// 6. Change Password
const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long');
  }

  const user = await User.findById(req.user._id).select('+password');
  
  const isCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isCorrect) {
    throw new ApiError(401, 'Invalid current password');
  }

  user.password = newPassword;
  user.refreshToken = null; // force re-login
  await user.save();

  await logActivity({
    userId: user._id,
    action: 'USER_PASSWORD_CHANGED',
    module: 'user',
    targetId: user._id,
    targetModel: 'User',
    description: `User ${user.email} changed their password`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully. Please log in again.')
  );
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateMyProfile,
  changeMyPassword
};
