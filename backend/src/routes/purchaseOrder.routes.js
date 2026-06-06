const express = require('express');
const {
  generatePO,
  getAllPOs,
  getPOById,
  updatePO,
  sendPO,
  updatePOStatus,
  cancelPO
} = require('../controllers/purchaseOrder.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(verifyJWT);

router.post(
  '/from-approval/:approvalId',
  authorizeRoles(ROLES.PROCUREMENT_OFFICER),
  generatePO
);

router.get('/', getAllPOs);
router.get('/:id', getPOById);

router.put('/:id', authorizeRoles(ROLES.PROCUREMENT_OFFICER), updatePO);
router.put('/:id/send', authorizeRoles(ROLES.PROCUREMENT_OFFICER), sendPO);
router.put('/:id/status', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), updatePOStatus);

router.delete('/:id', authorizeRoles(ROLES.ADMIN), cancelPO);

module.exports = router;
