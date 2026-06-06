const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const RFQ = require('../models/RFQ.model');
const Quotation = require('../models/Quotation.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private/Admin/Manager
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    userCount,
    vendorCount,
    rfqStats,
    quotationStats,
    poStats,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Vendor.countDocuments({ status: 'approved' }),
    RFQ.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Quotation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    PurchaseOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ])
  ]);

  const stats = {
    users: userCount,
    activeVendors: vendorCount,
    rfqs: rfqStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    quotations: quotationStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    purchaseOrders: poStats.reduce((acc, curr) => {
      acc[curr._id] = {
        count: curr.count,
        totalAmount: curr.totalAmount
      };
      return acc;
    }, {})
  };

  res.status(200).json(
    new ApiResponse(200, stats, 'Dashboard statistics retrieved successfully')
  );
});
