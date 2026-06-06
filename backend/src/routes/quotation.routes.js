const express = require('express');
const {
  submitQuotation,
  getAllQuotations,
  getMyQuotations,
  getQuotationById,
  editQuotation,
  finalizeQuotation,
  acceptQuotation,
  rejectQuotation,
  compareQuotations
} = require('../controllers/quotation.controller');
const { quotationValidator } = require('../validators/quotation.validator');
const { validate } = require('../middlewares/validate.middleware');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/rfq/:rfqId',
  authorizeRoles(ROLES.VENDOR),
  quotationValidator,
  validate,
  submitQuotation
);

router.get(
  '/',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER, ROLES.ADMIN),
  getAllQuotations
);

router.get('/my', authorizeRoles(ROLES.VENDOR), getMyQuotations);

router.get(
  '/compare/:rfqId',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER),
  compareQuotations
);

router.get('/:id', getQuotationById);

router.put(
  '/:id',
  authorizeRoles(ROLES.VENDOR),
  quotationValidator,
  validate,
  editQuotation
);

router.put('/:id/finalize', authorizeRoles(ROLES.VENDOR), finalizeQuotation);
router.put('/:id/accept', authorizeRoles(ROLES.PROCUREMENT_OFFICER), acceptQuotation);
router.put('/:id/reject', authorizeRoles(ROLES.PROCUREMENT_OFFICER), rejectQuotation);

module.exports = router;
