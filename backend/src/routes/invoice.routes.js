const express = require('express');
const {
  generateInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  downloadInvoicePDF,
  sendInvoiceByEmail,
  markAsPaid
} = require('../controllers/invoice.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/from-po/:poId',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER),
  generateInvoice
);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);

router.put('/:id', authorizeRoles(ROLES.PROCUREMENT_OFFICER), updateInvoice);
router.put('/:id/status', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), updateInvoiceStatus);

router.get('/:id/pdf', downloadInvoicePDF);

router.post(
  '/:id/send-email',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER),
  sendInvoiceByEmail
);

router.put('/:id/mark-paid', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), markAsPaid);

module.exports = router;
