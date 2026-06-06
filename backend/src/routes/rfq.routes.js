const express = require('express');
const {
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
} = require('../controllers/rfq.controller');
const { rfqValidator } = require('../validators/rfq.validator');
const { validate } = require('../middlewares/validate.middleware');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER),
  rfqValidator,
  validate,
  createRFQ
);

router.get('/', getAllRFQs);

router.get('/my', authorizeRoles(ROLES.PROCUREMENT_OFFICER), getMyRFQs);

router.get('/:id', getRFQById);

router.put(
  '/:id',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN),
  rfqValidator,
  validate,
  updateRFQ
);

router.delete('/:id', authorizeRoles(ROLES.PROCUREMENT_OFFICER, ROLES.ADMIN), cancelRFQ);

router.put('/:id/publish', authorizeRoles(ROLES.PROCUREMENT_OFFICER), publishRFQ);
router.put('/:id/close', authorizeRoles(ROLES.PROCUREMENT_OFFICER), closeRFQ);

router.post('/:id/vendors', authorizeRoles(ROLES.PROCUREMENT_OFFICER), addVendors);
router.delete('/:id/vendors/:vendorId', authorizeRoles(ROLES.PROCUREMENT_OFFICER), removeVendor);

router.get(
  '/:id/quotations',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER),
  getRFQQuotations
);

module.exports = router;
