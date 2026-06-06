const { logActivity } = require('./activityLog.service');

/**
 * Log a notification activity log entry by wrapping the logActivity utility.
 */
const createNotification = async (userId, action, description, targetId, targetModel, req) => {
  await logActivity({
    userId,
    action,
    module: 'notification',
    targetId,
    targetModel,
    description,
    req
  });
};

module.exports = { createNotification };
