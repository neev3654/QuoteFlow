const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ActivityLog = require('../models/ActivityLog.model');

/**
 * @desc    Get activity logs
 * @route   GET /api/v1/activity-logs
 * @access  Private/Admin
 */
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, module: filterModule, action, userId } = req.query;

  const query = {};
  if (filterModule) query.module = filterModule;
  if (action) query.action = action;
  if (userId) query.user = userId;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const logs = await ActivityLog.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  const total = await ActivityLog.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      logs,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    }, 'Activity logs retrieved successfully')
  );
});
