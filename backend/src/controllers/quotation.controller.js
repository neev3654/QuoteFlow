const Quotation = require('../models/Quotation.model');
const RFQ = require('../models/RFQ.model');
const Vendor = require('../models/Vendor.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog.service');

// 1. Submit Quotation
const submitQuotation = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Find the vendor linked to the current logged-in user
  const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
  if (!vendor) {
    throw new ApiError(400, 'Your account is not linked to any vendor profile');
  }

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.status !== 'published') {
    throw new ApiError(400, 'Cannot submit quotation. RFQ is not in published status');
  }

  const isAssigned = rfq.assignedVendors.some(id => id.toString() === vendor._id.toString());
  if (!isAssigned) {
    throw new ApiError(403, 'You are not assigned to bid on this RFQ');
  }

  // Calculate items pricing
  const items = (req.body.items || []).map(item => {
    const qty = parseFloat(item.quantity);
    const price = parseFloat(item.unitPrice);
    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  try {
    const quotation = new Quotation({
      ...req.body,
      rfq: rfqId,
      vendor: vendor._id,
      items,
      totalAmount,
      status: 'submitted',
      submittedAt: new Date(),
      isEditable: true
    });

    await quotation.save();

    await logActivity({
      userId: req.user._id,
      action: 'QUOTATION_SUBMITTED',
      module: 'quotation',
      targetId: quotation._id,
      targetModel: 'Quotation',
      description: `Quotation submitted for RFQ ${rfq.rfqNumber} by vendor ${vendor.companyName}`,
      req
    });

    res.status(201).json(
      new ApiResponse(201, quotation, 'Quotation submitted successfully')
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'You have already submitted a quotation for this RFQ');
    }
    throw error;
  }
});

// 2. Get All Quotations (Paginated)
const getAllQuotations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.rfq) filter.rfq = req.query.rfq;
  if (req.query.vendor) filter.vendor = req.query.vendor;
  if (req.query.status) filter.status = req.query.status;

  const totalCount = await Quotation.countDocuments(filter);
  const quotations = await Quotation.find(filter)
    .populate('rfq', 'title rfqNumber')
    .populate('vendor', 'companyName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        quotations,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'Quotations retrieved successfully'
    )
  );
});

// 3. Get My Quotations (Vendor only)
const getMyQuotations = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
  if (!vendor) {
    throw new ApiError(400, 'Your account is not linked to any vendor profile');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { vendor: vendor._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const totalCount = await Quotation.countDocuments(filter);
  const quotations = await Quotation.find(filter)
    .populate('rfq', 'title rfqNumber')
    .populate('vendor', 'companyName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        quotations,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'My Quotations retrieved successfully'
    )
  );
});

// 4. Get Quotation By ID
const getQuotationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotation = await Quotation.findById(id)
    .populate('rfq')
    .populate('vendor');

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation retrieved successfully')
  );
});

// 5. Edit Quotation (Submitting vendor only)
const editQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
  if (!vendor) {
    throw new ApiError(400, 'Your account is not linked to any vendor profile');
  }

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  if (quotation.vendor.toString() !== vendor._id.toString()) {
    throw new ApiError(403, 'You do not have permission to edit this quotation');
  }

  if (!quotation.isEditable || quotation.status !== 'submitted') {
    throw new ApiError(400, 'This quotation is finalized or not in submitted status and cannot be edited');
  }

  // Recalculate items pricing
  const items = (req.body.items || []).map(item => {
    const qty = parseFloat(item.quantity);
    const price = parseFloat(item.unitPrice);
    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Apply updates
  const updates = { ...req.body };
  updates.items = items;
  updates.totalAmount = totalAmount;
  delete updates.rfq;
  delete updates.vendor;
  delete updates.status;
  delete updates.submittedAt;

  Object.assign(quotation, updates);
  await quotation.save();

  await logActivity({
    userId: req.user._id,
    action: 'QUOTATION_UPDATED',
    module: 'quotation',
    targetId: quotation._id,
    targetModel: 'Quotation',
    description: `Quotation updated for RFQ ${quotation.rfq} by vendor ${vendor.companyName}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation updated successfully')
  );
});

// 6. Finalize Quotation (Lock it from further edits)
const finalizeQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
  if (!vendor) {
    throw new ApiError(400, 'Your account is not linked to any vendor profile');
  }

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  if (quotation.vendor.toString() !== vendor._id.toString()) {
    throw new ApiError(403, 'You do not have permission to finalize this quotation');
  }

  quotation.isEditable = false;
  await quotation.save();

  await logActivity({
    userId: req.user._id,
    action: 'QUOTATION_FINALIZED',
    module: 'quotation',
    targetId: quotation._id,
    targetModel: 'Quotation',
    description: `Quotation finalized (edit locked) by vendor ${vendor.companyName}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation finalized successfully')
  );
});

// 7. Accept Quotation (Move to accepted status, make others under_review)
const acceptQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  quotation.status = 'accepted';
  quotation.isEditable = false;
  await quotation.save();

  // Set all other quotations for the same RFQ to 'under_review'
  await Quotation.updateMany(
    { rfq: quotation.rfq, _id: { $ne: quotation._id } },
    { $set: { status: 'under_review', isEditable: false } }
  );

  await logActivity({
    userId: req.user._id,
    action: 'QUOTATION_ACCEPTED',
    module: 'quotation',
    targetId: quotation._id,
    targetModel: 'Quotation',
    description: `Quotation accepted for RFQ ${quotation.rfq}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation accepted successfully. Other bids put under review.')
  );
});

// 8. Reject Quotation
const rejectQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  quotation.status = 'rejected';
  quotation.isEditable = false;
  quotation.notes = quotation.notes
    ? `${quotation.notes}\nRejection Reason: ${reason}`
    : `Rejection Reason: ${reason}`;
  
  await quotation.save();

  await logActivity({
    userId: req.user._id,
    action: 'QUOTATION_REJECTED',
    module: 'quotation',
    targetId: quotation._id,
    targetModel: 'Quotation',
    description: `Quotation rejected. Reason: ${reason}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation rejected successfully')
  );
});

// 9. Compare Quotations (Analytics / Selection grid)
const compareQuotations = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const sortBy = req.query.sortBy || 'price';

  const quotations = await Quotation.find({
    rfq: rfqId,
    status: { $ne: 'rejected' }
  }).populate('vendor', 'companyName rating category');

  if (quotations.length === 0) {
    res.status(200).json(new ApiResponse(200, [], 'No quotations found for comparison'));
    return;
  }

  // Find lowest price
  const lowestPrice = Math.min(...quotations.map(q => q.totalAmount));

  // Convert to lean objects and add custom fields
  let comparedList = quotations.map(q => {
    const qObj = q.toObject();
    qObj.isLowestPrice = q.totalAmount === lowestPrice;

    // Calculate maximum delivery lead time from items
    const deliveryDaysArray = (q.items || []).map(item => item.deliveryDays || 0);
    qObj.maxDeliveryDays = deliveryDaysArray.length > 0 ? Math.max(...deliveryDaysArray) : 0;
    
    return qObj;
  });

  // Sort
  if (sortBy === 'delivery') {
    comparedList.sort((a, b) => a.maxDeliveryDays - b.maxDeliveryDays);
  } else {
    // default: price
    comparedList.sort((a, b) => a.totalAmount - b.totalAmount);
  }

  res.status(200).json(
    new ApiResponse(200, comparedList, 'Quotations comparison completed successfully')
  );
});

module.exports = {
  submitQuotation,
  getAllQuotations,
  getMyQuotations,
  getQuotationById,
  editQuotation,
  finalizeQuotation,
  acceptQuotation,
  rejectQuotation,
  compareQuotations
};
