const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/auth.validator');
const { validate } = require('../middlewares/validate.middleware');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', verifyJWT, logout);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, resetPassword);
router.get('/me', verifyJWT, getMe);

module.exports = router;
