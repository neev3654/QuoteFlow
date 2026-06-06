const ActivityLog = require('../models/ActivityLog.model');
const logger = require('../config/logger');

const logActivity = async (options) => {
  try {
    const {
      userId,
      action,
      module,
      targetId,
      targetModel,
      description,
      metadata,
      req
    } = options;

    let ipAddress = '';
    let userAgent = '';

    if (req) {
      ipAddress = req.ip ||
        (req.headers && req.headers['x-forwarded-for']) ||
        (req.connection && req.connection.remoteAddress) ||
        (req.socket && req.socket.remoteAddress) ||
        '';
      
      userAgent = (req.headers && req.headers['user-agent']) || '';
    }

    const log = new ActivityLog({
      user: userId,
      action,
      module,
      targetId,
      targetModel,
      description,
      metadata,
      ipAddress,
      userAgent
    });

    await log.save();
  } catch (error) {
    // Wrap in try/catch — log errors but NEVER throw
    logger.error(`Failed to create activity log: ${error.message}`);
  }
};

module.exports = { logActivity };
