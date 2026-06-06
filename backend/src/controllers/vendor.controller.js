const Vendor = require('../models/Vendor.model');
const RFQ = require('../models/RFQ.model');
const Quotation = require('../models/Quotation.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityLog.service');

// 1. Create Vendor
const createVendor = asyncHandler(async (req, res) => {
  const existingEmail = await Vendor.findOne({ email: req.body.email });
  if (existingEmail) {
    throw new ApiError(409, 'Vendor with this email already exists');
  }

  const vendor = new Vendor(req.body);
  await vendor.save();

  await logActivity({
    userId: req.user._id,
    action: 'VENDOR_CREATED',
    module: 'vendor',
    targetId: vendor._id,
    targetModel: 'Vendor',
    description: `Vendor ${vendor.companyName} (${vendor.vendorCode}) created`,
    req
  });

  res.status(201).json(
    new ApiResponse(201, vendor, 'Vendor created successfully')
  );
});

// 2. Get All Vendors (Paginated & Filtered)
const getAllVendors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { companyName: searchRegex },
      { contactPerson: searchRegex },
      { email: searchRegex }
    ];
  }

  const totalCount = await Vendor.countDocuments(filter);
  const vendors = await Vendor.find(filter)
    .populate('linkedUserId', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        vendors,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'Vendors retrieved successfully'
    )
  );
});

// 3. Get Vendor By ID
const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findById(id).populate('linkedUserId', 'name email');
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  res.status(200).json(
    new ApiResponse(200, vendor, 'Vendor retrieved successfully')
  );
});

// 4. Update Vendor
const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  // Update allowed fields (excluding vendorCode to preserve auto-generated value)
  const updates = { ...req.body };
  delete updates.vendorCode;

  Object.assign(vendor, updates);
  await vendor.save();

  await logActivity({
    userId: req.user._id,
    action: 'VENDOR_UPDATED',
    module: 'vendor',
    targetId: vendor._id,
    targetModel: 'Vendor',
    description: `Vendor ${vendor.companyName} (${vendor.vendorCode}) details updated`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, vendor, 'Vendor updated successfully')
  );
});

// 5. Delete Vendor (Soft delete)
const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  vendor.status = 'inactive';
  await vendor.save();

  await logActivity({
    userId: req.user._id,
    action: 'VENDOR_DEACTIVATED',
    module: 'vendor',
    targetId: vendor._id,
    targetModel: 'Vendor',
    description: `Vendor ${vendor.companyName} (${vendor.vendorCode}) set to inactive`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, vendor, 'Vendor deactivated successfully')
  );
});

// 6. Update Vendor Status (Admin only)
const updateVendorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'inactive', 'blacklisted'].includes(status)) {
    throw new ApiError(400, 'Invalid status specified');
  }

  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new ApiError(404, 'Vendor not found');
  }

  vendor.status = status;
  await vendor.save();

  await logActivity({
    userId: req.user._id,
    action: 'VENDOR_STATUS_CHANGED',
    module: 'vendor',
    targetId: vendor._id,
    targetModel: 'Vendor',
    description: `Vendor ${vendor.companyName} status changed to ${status}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, vendor, `Vendor status updated to ${status}`)
  );
});

// 7. Get RFQs assigned to vendor
const getVendorRFQs = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rfqs = await RFQ.find({ assignedVendors: id }).populate('createdBy', 'name');

  res.status(200).json(
    new ApiResponse(200, rfqs, 'Vendor RFQs retrieved successfully')
  );
});

// 8. Get Quotations submitted by vendor
const getVendorQuotations = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotations = await Quotation.find({ vendor: id }).populate('rfq', 'title rfqNumber');

  res.status(200).json(
    new ApiResponse(200, quotations, 'Vendor quotations retrieved successfully')
  );
});

// 9. Get Purchase Orders issued to vendor
const getVendorOrders = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orders = await PurchaseOrder.find({ vendor: id }).populate('rfq', 'title rfqNumber');

  res.status(200).json(
    new ApiResponse(200, orders, 'Vendor purchase orders retrieved successfully')
  );
});

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  getVendorRFQs,
  getVendorQuotations,
  getVendorOrders
};
