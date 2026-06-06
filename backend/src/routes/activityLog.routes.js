const express = require('express');
const { getActivityLogs } = require('../controllers/activityLog.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(verifyJWT);

router.route('/')
  .get(authorizeRoles('admin', 'manager'), getActivityLogs);

module.exports = router;
