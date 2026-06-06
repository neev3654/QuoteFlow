const mongoose = require('mongoose');

const approvalWorkflowSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: [true, 'Quotation reference is required'],
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: [true, 'RFQ reference is required'],
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested by user reference is required'],
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    level: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const ApprovalWorkflow = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);

module.exports = ApprovalWorkflow;
