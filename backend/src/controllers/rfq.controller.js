const RFQ = require('../models/RFQ.model');
const Vendor = require('../models/Vendor.model');
const Quotation = require('../models/Quotation.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendVendorInvitation } = require('../services/email.service');
const { logActivity } = require('../services/activityLog.service');

// 1. Create RFQ
const createRFQ = asyncHandler(async (req, res) => {
  const rfqData = {
    ...req.body,
    createdBy: req.user._id,
    status: 'draft'
  };

  const rfq = new RFQ(rfqData);
  await rfq.save();

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_CREATED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `RFQ ${rfq.title} (${rfq.rfqNumber}) created in draft mode`,
    req
  });

  res.status(201).json(
    new ApiResponse(201, rfq, 'RFQ created successfully in draft mode')
  );
});

// 2. Get All RFQs (Paginated & Filtered)
const getAllRFQs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const totalCount = await RFQ.countDocuments(filter);
  const rfqs = await RFQ.find(filter)
    .populate('createdBy', 'name')
    .populate('assignedVendors', 'companyName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rfqs,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'RFQs retrieved successfully'
    )
  );
});

// 3. Get My RFQs (Created by procurement officer)
const getMyRFQs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { createdBy: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const totalCount = await RFQ.countDocuments(filter);
  const rfqs = await RFQ.find(filter)
    .populate('createdBy', 'name')
    .populate('assignedVendors', 'companyName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rfqs,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'My RFQs retrieved successfully'
    )
  );
});

// 4. Get RFQ By ID
const getRFQById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id)
    .populate('createdBy', 'name email')
    .populate('assignedVendors');

  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  res.status(200).json(
    new ApiResponse(200, rfq, 'RFQ retrieved successfully')
  );
});

// 5. Update RFQ
const updateRFQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'draft') {
    throw new ApiError(400, 'Cannot update RFQ that is not in draft status');
  }

  // Only creator or admin can update
  if (rfq.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to update this RFQ');
  }

  const updates = { ...req.body };
  delete updates.rfqNumber;
  delete updates.status;
  delete updates.createdBy;

  Object.assign(rfq, updates);
  await rfq.save();

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_UPDATED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `RFQ ${rfq.title} (${rfq.rfqNumber}) details updated`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, rfq, 'RFQ updated successfully')
  );
});

// 6. Cancel RFQ
const cancelRFQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  // Only creator or admin can cancel
  if (rfq.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to cancel this RFQ');
  }

  rfq.status = 'cancelled';
  await rfq.save();

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_CANCELLED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `RFQ ${rfq.title} (${rfq.rfqNumber}) has been cancelled`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, rfq, 'RFQ cancelled successfully')
  );
});

// 7. Publish RFQ
const publishRFQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'draft') {
    throw new ApiError(400, 'Only draft RFQs can be published');
  }

  if (!rfq.assignedVendors || rfq.assignedVendors.length === 0) {
    throw new ApiError(400, 'Must assign at least one vendor before publishing');
  }

  rfq.status = 'published';
  await rfq.save();

  // Send invitation email to each assigned vendor
  const vendors = await Vendor.find({ _id: { $in: rfq.assignedVendors } });
  for (const vendor of vendors) {
    try {
      await sendVendorInvitation(vendor, rfq);
    } catch (err) {
      // Non-blocking log to allow overall request execution
      console.error(`Failed to send RFQ invitation to ${vendor.email}: ${err.message}`);
    }
  }

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_PUBLISHED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `RFQ ${rfq.title} (${rfq.rfqNumber}) has been published to ${vendors.length} vendors`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, rfq, 'RFQ published and vendor invitations sent successfully')
  );
});

// 8. Close RFQ
const closeRFQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'published') {
    throw new ApiError(400, 'Only published RFQs can be closed');
  }

  rfq.status = 'closed';
  await rfq.save();

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_CLOSED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `RFQ ${rfq.title} (${rfq.rfqNumber}) closed for new bids`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, rfq, 'RFQ closed successfully')
  );
});

// 9. Add Vendors to RFQ
const addVendors = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vendorIds } = req.body;

  if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    throw new ApiError(400, 'An array of vendorIds is required');
  }

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  // Push unique values to assignedVendors
  const result = await RFQ.findByIdAndUpdate(
    id,
    { $addToSet: { assignedVendors: { $each: vendorIds } } },
    { new: true }
  ).populate('assignedVendors');

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_VENDOR_ADDED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `Added ${vendorIds.length} vendor(s) to RFQ ${rfq.rfqNumber}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Vendors added successfully to RFQ')
  );
});

// 10. Remove Vendor from RFQ
const removeVendor = asyncHandler(async (req, res) => {
  const { id, vendorId } = req.params;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  const result = await RFQ.findByIdAndUpdate(
    id,
    { $pull: { assignedVendors: vendorId } },
    { new: true }
  ).populate('assignedVendors');

  await logActivity({
    userId: req.user._id,
    action: 'RFQ_VENDOR_REMOVED',
    module: 'rfq',
    targetId: rfq._id,
    targetModel: 'RFQ',
    description: `Removed vendor ${vendorId} from RFQ ${rfq.rfqNumber}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Vendor removed successfully from RFQ')
  );
});

// 11. Get Quotations submitted for this RFQ
const getRFQQuotations = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotations = await Quotation.find({ rfq: id })
    .populate('vendor', 'companyName email rating');

  res.status(200).json(
    new ApiResponse(200, quotations, 'RFQ quotations retrieved successfully')
  );
});

module.exports = {
  createRFQ,
  getAllRFQs,
  getMyRFQs,
  getRFQById,
  updateRFQ,
  cancelRFQ,
  publishRFQ,
  closeRFQ,
  addVendors,
  removeVendor,
  getRFQQuotations
};
