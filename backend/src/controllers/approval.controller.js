const ApprovalWorkflow = require('../models/ApprovalWorkflow.model');
const Quotation = require('../models/Quotation.model');
const RFQ = require('../models/RFQ.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendApprovalNotification, sendApprovalResult } = require('../services/email.service');
const { logActivity } = require('../services/activityLog.service');

// 1. Initiate Approval Workflow
const initiateApproval = asyncHandler(async (req, res) => {
  const { quotationId, approverId } = req.body;

  if (!quotationId || !approverId) {
    throw new ApiError(400, 'Quotation ID and Approver ID are required');
  }

  const quotation = await Quotation.findById(quotationId).populate('vendor');
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  if (quotation.status !== 'accepted') {
    throw new ApiError(400, 'Only accepted quotations can be sent for approval');
  }

  const approver = await User.findById(approverId);
  if (!approver || approver.role !== 'manager') {
    throw new ApiError(400, 'Specified approver must be a registered manager');
  }

  // Check for existing pending/approved approval for this quotation
  const existingApproval = await ApprovalWorkflow.findOne({
    quotation: quotationId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingApproval) {
    throw new ApiError(400, 'An approval workflow is already pending or approved for this quotation');
  }

  const rfq = await RFQ.findById(quotation.rfq);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  const approval = new ApprovalWorkflow({
    quotation: quotationId,
    rfq: quotation.rfq,
    requestedBy: req.user._id,
    approver: approverId,
    status: 'pending'
  });

  await approval.save();

  // Send email to approver
  try {
    await sendApprovalNotification(approver, rfq, quotation, quotation.vendor);
  } catch (err) {
    console.error(`Failed to send approval email: ${err.message}`);
  }

  await logActivity({
    userId: req.user._id,
    action: 'APPROVAL_INITIATED',
    module: 'approval',
    targetId: approval._id,
    targetModel: 'ApprovalWorkflow',
    description: `Approval workflow initiated for RFQ ${rfq.rfqNumber} quotation by ${req.user.name}`,
    req
  });

  res.status(201).json(
    new ApiResponse(201, approval, 'Approval workflow initiated successfully')
  );
});

// 2. Get All Approvals (Paginated)
const getAllApprovals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const totalCount = await ApprovalWorkflow.countDocuments(filter);
  const approvals = await ApprovalWorkflow.find(filter)
    .populate('quotation')
    .populate('rfq')
    .populate('purchaseOrder')
    .populate('requestedBy', 'name email')
    .populate('approver', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        approvals,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'Approvals retrieved successfully'
    )
  );
});

// 3. Get Pending Approvals (Manager only)
const getPendingApprovals = asyncHandler(async (req, res) => {
  const approvals = await ApprovalWorkflow.find({
    approver: req.user._id,
    status: 'pending'
  })
    .populate('quotation')
    .populate('rfq')
    .populate('requestedBy', 'name email');

  res.status(200).json(
    new ApiResponse(200, approvals, 'Pending approvals retrieved successfully')
  );
});

// 4. Get Approval By ID
const getApprovalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const approval = await ApprovalWorkflow.findById(id)
    .populate('quotation')
    .populate('rfq')
    .populate('purchaseOrder')
    .populate('requestedBy', 'name email')
    .populate('approver', 'name email');

  if (!approval) {
    throw new ApiError(404, 'Approval workflow not found');
  }

  res.status(200).json(
    new ApiResponse(200, approval, 'Approval workflow retrieved successfully')
  );
});

// 5. Approve Approval
const approveApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const approval = await ApprovalWorkflow.findById(id);
  if (!approval) {
    throw new ApiError(404, 'Approval workflow not found');
  }

  if (approval.status !== 'pending') {
    throw new ApiError(400, 'This approval workflow is not pending action');
  }

  if (approval.approver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not the designated approver for this request');
  }

  approval.status = 'approved';
  approval.approvedAt = new Date();
  approval.remarks = remarks || '';
  await approval.save();

  // Load resources for notifications/emails
  const officer = await User.findById(approval.requestedBy);
  const quotation = await Quotation.findById(approval.quotation).populate('vendor');
  const rfq = await RFQ.findById(approval.rfq);

  if (officer && quotation && rfq) {
    try {
      await sendApprovalResult(officer, quotation, rfq, true);
    } catch (err) {
      console.error(`Failed to send approval result email: ${err.message}`);
    }
  }

  await logActivity({
    userId: req.user._id,
    action: 'APPROVAL_APPROVED',
    module: 'approval',
    targetId: approval._id,
    targetModel: 'ApprovalWorkflow',
    description: `Approval workflow approved by ${req.user.name}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, approval, 'Approval workflow approved successfully')
  );
});

// 6. Reject Approval
const rejectApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!remarks) {
    throw new ApiError(400, 'Remarks are required for rejecting approval workflows');
  }

  const approval = await ApprovalWorkflow.findById(id);
  if (!approval) {
    throw new ApiError(404, 'Approval workflow not found');
  }

  if (approval.status !== 'pending') {
    throw new ApiError(400, 'This approval workflow is not pending action');
  }

  if (approval.approver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not the designated approver for this request');
  }

  approval.status = 'rejected';
  approval.rejectedAt = new Date();
  approval.remarks = remarks;
  await approval.save();

  // Load resources for notifications/emails
  const officer = await User.findById(approval.requestedBy);
  const quotation = await Quotation.findById(approval.quotation).populate('vendor');
  const rfq = await RFQ.findById(approval.rfq);

  if (officer && quotation && rfq) {
    try {
      await sendApprovalResult(officer, quotation, rfq, false);
    } catch (err) {
      console.error(`Failed to send approval rejection email: ${err.message}`);
    }
  }

  await logActivity({
    userId: req.user._id,
    action: 'APPROVAL_REJECTED',
    module: 'approval',
    targetId: approval._id,
    targetModel: 'ApprovalWorkflow',
    description: `Approval workflow rejected by ${req.user.name}. Reason: ${remarks}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, approval, 'Approval workflow rejected successfully')
  );
});

// 7. Get Approval by Quotation ID
const getQuotationApproval = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const approval = await ApprovalWorkflow.findOne({ quotation: quotationId })
    .populate('requestedBy', 'name email')
    .populate('approver', 'name email');

  if (!approval) {
    throw new ApiError(404, 'No approval workflow found for this quotation');
  }

  res.status(200).json(
    new ApiResponse(200, approval, 'Approval workflow retrieved successfully')
  );
});

module.exports = {
  initiateApproval,
  getAllApprovals,
  getPendingApprovals,
  getApprovalById,
  approveApproval,
  rejectApproval,
  getQuotationApproval
};
