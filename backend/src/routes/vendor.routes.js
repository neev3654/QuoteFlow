const express = require('express');
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  getVendorRFQs,
  getVendorQuotations,
  getVendorOrders
} = require('../controllers/vendor.controller');
const { vendorValidator } = require('../validators/vendor.validator');
const { validate } = require('../middlewares/validate.middleware');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/',
  authorizeRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  vendorValidator,
  validate,
  createVendor
);

router.get('/', getAllVendors);
router.get('/:id', getVendorById);

router.put(
  '/:id',
  authorizeRoles(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  vendorValidator,
  validate,
  updateVendor
);

router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteVendor);
router.put('/:id/status', authorizeRoles(ROLES.ADMIN), updateVendorStatus);

router.get('/:id/rfqs', getVendorRFQs);
router.get('/:id/quotations', getVendorQuotations);
router.get('/:id/orders', getVendorOrders);

module.exports = router;
