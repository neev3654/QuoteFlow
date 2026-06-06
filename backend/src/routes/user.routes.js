const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateMyProfile,
  changeMyPassword
} = require('../controllers/user.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

const router = express.Router();

// Require JWT for all routes in this file
router.use(verifyJWT);

// Admin-only routes
router.get('/', authorizeRoles(ROLES.ADMIN), getAllUsers);
router.get('/:id', authorizeRoles(ROLES.ADMIN), getUserById);
router.put('/:id', authorizeRoles(ROLES.ADMIN), updateUser);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteUser);

// Self routes
router.put('/me/profile', updateMyProfile);
router.put('/me/password', changeMyPassword);

module.exports = router;
