const Invoice = require('../models/Invoice.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');
const Vendor = require('../models/Vendor.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoicePDF } = require('../services/pdf.service');
const { sendInvoiceEmail } = require('../services/email.service');
const { logActivity } = require('../services/activityLog.service');

// 1. Generate Invoice from Purchase Order
const generateInvoice = asyncHandler(async (req, res) => {
  const { poId } = req.params;

  const po = await PurchaseOrder.findById(poId);
  if (!po) {
    throw new ApiError(404, 'Purchase Order not found');
  }

  // Check if PO status is valid
  if (po.status !== 'sent' && po.status !== 'acknowledged') {
    throw new ApiError(400, 'Cannot generate invoice. Purchase Order must be in sent or acknowledged status');
  }

  // Check if invoice already exists for this PO
  const existingInvoice = await Invoice.findOne({ purchaseOrder: poId });
  if (existingInvoice) {
    throw new ApiError(400, 'An invoice has already been generated for this Purchase Order');
  }

  // Map PO items to invoice items
  const invoiceItems = (po.items || []).map(item => ({
    itemName: item.itemName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.quantity * item.unitPrice,
    hsnCode: '' // Placeholder
  }));

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const cgstRate = 9;
  const sgstRate = 9;
  const igstRate = 0;

  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const igstAmount = (subtotal * igstRate) / 100;

  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = subtotal + totalTax;

  const dueDate = req.body.dueDate
    ? new Date(req.body.dueDate)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const invoice = new Invoice({
    purchaseOrder: poId,
    vendor: po.vendor,
    createdBy: req.user._id,
    items: invoiceItems,
    subtotal,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    totalAmount,
    dueDate,
    status: 'draft'
  });

  await invoice.save();

  await logActivity({
    userId: req.user._id,
    action: 'INVOICE_GENERATED',
    module: 'invoice',
    targetId: invoice._id,
    targetModel: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} generated for Purchase Order ${po.poNumber}`,
    req
  });

  res.status(201).json(
    new ApiResponse(201, invoice, 'Invoice generated successfully in draft status')
  );
});

// 2. Get All Invoices (Paginated & Filtered)
const getAllInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const totalCount = await Invoice.countDocuments(filter);
  const invoices = await Invoice.find(filter)
    .populate('vendor', 'companyName')
    .populate('purchaseOrder', 'poNumber')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        invoices,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      'Invoices retrieved successfully'
    )
  );
});

// 3. Get Invoice By ID
const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id)
    .populate('vendor')
    .populate('purchaseOrder')
    .populate('createdBy', 'name email');

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  res.status(200).json(
    new ApiResponse(200, invoice, 'Invoice retrieved successfully')
  );
});

// 4. Update Invoice (Draft status only)
const updateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  if (invoice.status !== 'draft') {
    throw new ApiError(400, 'Only invoices in draft status can be updated');
  }

  const updates = { ...req.body };
  delete updates.invoiceNumber;
  delete updates.purchaseOrder;
  delete updates.vendor;
  delete updates.createdBy;

  // Recalculate totals if items changed
  if (updates.items && Array.isArray(updates.items)) {
    updates.items = updates.items.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      hsnCode: item.hsnCode || ''
    }));

    updates.subtotal = updates.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const cgstRate = updates.cgstRate !== undefined ? updates.cgstRate : invoice.cgstRate;
    const sgstRate = updates.sgstRate !== undefined ? updates.sgstRate : invoice.sgstRate;
    const igstRate = updates.igstRate !== undefined ? updates.igstRate : invoice.igstRate;

    updates.cgstAmount = (updates.subtotal * cgstRate) / 100;
    updates.sgstAmount = (updates.subtotal * sgstRate) / 100;
    updates.igstAmount = (updates.subtotal * igstRate) / 100;
    updates.totalTax = updates.cgstAmount + updates.sgstAmount + updates.igstAmount;
    updates.totalAmount = updates.subtotal + updates.totalTax;
  }

  Object.assign(invoice, updates);
  await invoice.save();

  await logActivity({
    userId: req.user._id,
    action: 'INVOICE_UPDATED',
    module: 'invoice',
    targetId: invoice._id,
    targetModel: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} details updated`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, invoice, 'Invoice updated successfully')
  );
});

// 5. Update Invoice Status
const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status specified');
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  invoice.status = status;
  await invoice.save();

  await logActivity({
    userId: req.user._id,
    action: 'INVOICE_STATUS_UPDATED',
    module: 'invoice',
    targetId: invoice._id,
    targetModel: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} status updated to ${status}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, invoice, `Invoice status updated successfully to ${status}`)
  );
});

// 6. Download Invoice PDF Buffer
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id)
    .populate('vendor')
    .populate('purchaseOrder')
    .populate('createdBy', 'name email');

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  const pdfBuffer = await generateInvoicePDF(invoice);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  res.send(pdfBuffer);
});

// 7. Send Invoice by Email
const sendInvoiceByEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id)
    .populate('vendor')
    .populate('purchaseOrder')
    .populate('createdBy', 'name email');

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  const pdfBuffer = await generateInvoicePDF(invoice);

  const vendorObj = invoice.vendor;
  if (!vendorObj) {
    throw new ApiError(400, 'Vendor details are missing on this invoice');
  }

  try {
    await sendInvoiceEmail(vendorObj, invoice, pdfBuffer);
  } catch (err) {
    throw new ApiError(500, `Email delivery failure: ${err.message}`);
  }

  invoice.emailSentAt = new Date();
  invoice.emailSentTo = vendorObj.email;
  invoice.status = 'sent';
  await invoice.save();

  await logActivity({
    userId: req.user._id,
    action: 'INVOICE_SENT',
    module: 'invoice',
    targetId: invoice._id,
    targetModel: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} emailed to vendor ${vendorObj.companyName}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, invoice, `Invoice successfully emailed to ${vendorObj.email}`)
  );
});

// 8. Mark Invoice as Paid
const markAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    throw new ApiError(400, 'Payment method is required');
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paymentMethod = paymentMethod;
  await invoice.save();

  await logActivity({
    userId: req.user._id,
    action: 'INVOICE_PAID',
    module: 'invoice',
    targetId: invoice._id,
    targetModel: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} marked as paid via ${paymentMethod}`,
    req
  });

  res.status(200).json(
    new ApiResponse(200, invoice, 'Invoice successfully marked as paid')
  );
});

module.exports = {
  generateInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  downloadInvoicePDF,
  sendInvoiceByEmail,
  markAsPaid
};
