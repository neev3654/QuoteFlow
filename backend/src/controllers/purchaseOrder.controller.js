const PurchaseOrder = require('../models/PurchaseOrder.model');
const ApprovalWorkflow = require('../models/ApprovalWorkflow.model');
const Quotation = require('../models/Quotation.model');
const Vendor = require('../models/Vendor.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendPOToVendor } = require('../services/email.service');
const { logActivity } = require('../services/activityLog.service');

// 1. Generate Purchase Order from Approved ApprovalWorkflow
const generatePO = asyncHandler(async (req, res) => {
  const { approvalId } = req.params;

  const approval = await ApprovalWorkflow.findById(approvalId);
  if (!approval) {
    throw new ApiError(404, 'Approval workflow not found');
  }

  if (approval.status !== 'approved') {
    throw new ApiError(400, 'Cannot generate PO. Approval status must be approved');
  }

  // Check if PO already generated for this approval
  const existingPO = await PurchaseOrder.findOne({ approvalWorkflow: approvalId });
  if (existingPO) {
    throw new ApiError(400, 'A Purchase Order has already been generated for this approval workflow');
  }

  const quotation = await Quotation.findById(approval.quotation);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  // Map quotation items to PO items and compute totalPrices
  const poItems = (quotation.items || []).map(item => ({
    itemName: item.itemName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.quantity * item.unitPrice
  }));

  const subtotal = poItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 18;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  const po = new PurchaseOrder({
    rfq: approval.rfq,
    quotation: approval.quotation,
    vendor: quotation.vendor,
    approvalWorkflow: approvalId,
    createdBy: req.user._id,
    items: poItems,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    status: 'draft'
  });

  // Assign deliveryAddress from Vendor if available
  const vendorObj = await Vendor.findById(quotation.vendor);
  if (vendorObj && vendorObj.address) {
    po.deliveryAddress = {
      street: vendorObj.address.street || '',
      city: vendorObj.address.city || '',
      state: vendorObj.address.state || '',
      pincode: vendorObj.address.pincode || '',
      country: vendorObj.address.country || ''
    };
  }

  await po.save();

  // Increment vendor orders count
  if (vendorObj) {
    vendorObj.totalOrders = (vendorObj.totalOrders || 0) + 1;
    await vendorObj.save();
  }

  // Update approval's purchaseOrder reference
  approval.purchaseOrder = po._id;
  await approval.save();

  await logActivity({
    userId: req.user._id,
    action: 'PO_GENERATED',
    module: 'purchase_order',
    targetId: po._id,
    targetModel: 'PurchaseOrder',
    description: `Purchase Order ${po.poNumber} generated successfully from approval workflow`,
    req
  });

  res.status(201).json(
    new ApiResponse(201, po, 'Purchase Order generated successfully in draft status')
  );
});

// 2. Get All POs (Paginated)
const getAllPOs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.vendor) filter.vendor = req.query.vendor;

  const totalCount = await PurchaseOrder.countDocuments(filter);
  const pos = await PurchaseOrder.find(filter)
    .populate('vendor', 'companyName')
    .populate('rfq', 'title rfqNumber')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        pos,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'Purchase Orders retrieved successfully'
    )
  );
});

// 3. Get PO By ID
const getPOById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const po = await PurchaseOrder.findById(id)
    .populate('vendor')
    .populate('rfq')
    .populate('quotation')
    .populate('approvalWorkflow');

  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  res.status(200).json(
    new ApiResponse(200, po, 'Purchase Order retrieved successfully')
  );
});

// 4. Update PO (Draft status only)
const updatePO = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const po = await PurchaseOrder.findById(id);
  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  if (po.status !== 'draft') {
    throw new ApiError(400, 'Only Purchase Orders in draft status can be updated');
  }

  // Only creator or admin can update
  if (po.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to update this Purchase Order');
  }

  const updates = { ...req.body };
  delete updates.poNumber;
  delete updates.rfq;
  delete updates.quotation;
  delete updates.vendor;
  delete updates.approvalWorkflow;
  delete updates.createdBy;

  // Recalculate totals if items changed
  if (updates.items && Array.isArray(updates.items)) {
    updates.items = updates.items.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    }));
    updates.subtotal = updates.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = updates.taxRate !== undefined ? updates.taxRate : po.taxRate;
    updates.taxAmount = (updates.subtotal * taxRate) / 100;
    updates.totalAmount = updates.subtotal + updates.taxAmount;
  } else if (updates.taxRate !== undefined) {
    updates.taxAmount = (po.subtotal * updates.taxRate) / 100;
    updates.totalAmount = po.subtotal + updates.taxAmount;
  }

  Object.assign(po, updates);
  await po.save();

  await logActivity({
    userId: req.user._id,
    action: 'PO_UPDATED',
    module: 'purchase_order',
    targetId: po._id,
    targetModel: 'PurchaseOrder',
    description: `Purchase Order ${po.poNumber} details updated`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, po, 'Purchase Order updated successfully')
  );
});

// 5. Send PO to Vendor (status -> sent)
const sendPO = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const po = await PurchaseOrder.findById(id);
  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  po.status = 'sent';
  await po.save();

  const vendorObj = await Vendor.findById(po.vendor);
  if (vendorObj) {
    try {
      await sendPOToVendor(vendorObj, po);
    } catch (err) {
      console.error(`Failed to email PO to vendor: ${err.message}`);
    }
  }

  await logActivity({
    userId: req.user._id,
    action: 'PO_SENT',
    module: 'purchase_order',
    targetId: po._id,
    targetModel: 'PurchaseOrder',
    description: `Purchase Order ${po.poNumber} sent to vendor ${vendorObj?.companyName}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, po, `Purchase Order ${po.poNumber} successfully sent to vendor`)
  );
});

// 6. Update PO Status (Admin/Manager delivery status transitions)
const updatePOStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['draft', 'sent', 'acknowledged', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status specified');
  }

  const po = await PurchaseOrder.findById(id);
  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  const validTransitions = {
    draft: ['sent', 'cancelled'],
    sent: ['acknowledged', 'cancelled'],
    acknowledged: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[po.status].includes(status)) {
    throw new ApiError(400, `Invalid status transition from ${po.status} to ${status}`);
  }

  po.status = status;
  await po.save();

  await logActivity({
    userId: req.user._id,
    action: 'PO_STATUS_UPDATED',
    module: 'purchase_order',
    targetId: po._id,
    targetModel: 'PurchaseOrder',
    description: `Purchase Order ${po.poNumber} status updated to ${status}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, po, `Purchase Order status updated to ${status}`)
  );
});

// 7. Cancel Purchase Order (Admin only)
const cancelPO = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const po = await PurchaseOrder.findById(id);
  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  if (po.status === 'cancelled') {
    throw new ApiError(400, 'Purchase Order is already cancelled');
  }

  if (po.status === 'delivered') {
    throw new ApiError(400, 'Delivered Purchase Orders cannot be cancelled');
  }

  po.status = 'cancelled';
  await po.save();

  // Decrement vendor's order count
  const vendorObj = await Vendor.findById(po.vendor);
  if (vendorObj && vendorObj.totalOrders > 0) {
    vendorObj.totalOrders -= 1;
    await vendorObj.save();
  }

  await logActivity({
    userId: req.user._id,
    action: 'PO_CANCELLED',
    module: 'purchase_order',
    targetId: po._id,
    targetModel: 'PurchaseOrder',
    description: `Purchase Order ${po.poNumber} cancelled`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, po, 'Purchase Order cancelled successfully')
  );
});

module.exports = {
  generatePO,
  getAllPOs,
  getPOById,
  updatePO,
  sendPO,
  updatePOStatus,
  cancelPO
};
