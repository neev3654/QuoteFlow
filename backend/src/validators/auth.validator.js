const { body } = require('express-validator');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

const registerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(passwordRegex).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'procurement_officer', 'vendor', 'manager']).withMessage('Invalid role specified')
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const forgotPasswordValidator = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(passwordRegex).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
