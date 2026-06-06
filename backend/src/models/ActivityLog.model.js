const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
    },
    module: {
      type: String,
      enum: [
        'auth',
        'vendor',
        'rfq',
        'quotation',
        'approval',
        'purchase_order',
        'invoice',
        'user',
        'notification'
      ],
      required: [true, 'Module category is required'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetModel: {
      type: String,
    },
    description: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on user, module, and createdAt for fast querying
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
