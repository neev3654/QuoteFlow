const express = require('express');
const {
  initiateApproval,
  getAllApprovals,
  getPendingApprovals,
  getApprovalById,
  approveApproval,
  rejectApproval,
  getQuotationApproval
} = require('../controllers/approval.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(verifyJWT);

router.post('/', authorizeRoles(ROLES.PROCUREMENT_OFFICER), initiateApproval);

router.get(
  '/',
  authorizeRoles(ROLES.MANAGER, ROLES.ADMIN),
  getAllApprovals
);

router.get('/pending', authorizeRoles(ROLES.MANAGER), getPendingApprovals);

router.get('/:id', getApprovalById);

router.put('/:id/approve', authorizeRoles(ROLES.MANAGER), approveApproval);
router.put('/:id/reject', authorizeRoles(ROLES.MANAGER), rejectApproval);

router.get('/quotation/:quotationId', getQuotationApproval);

module.exports = router;
