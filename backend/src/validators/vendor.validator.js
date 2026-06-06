const { body } = require('express-validator');

const vendorValidator = [
  body('companyName')
    .notEmpty().withMessage('Company name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('contactPerson')
    .notEmpty().withMessage('Contact person is required')
    .trim(),
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian phone number'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['IT', 'Manufacturing', 'Services', 'Logistics', 'Raw Materials', 'Other']).withMessage('Invalid category specified'),
  body('gstNumber')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Enter a valid GST number'),
  body('address.city')
    .optional()
    .trim(),
  body('address.state')
    .optional()
    .trim(),
  body('address.pincode')
    .optional({ checkFalsy: true })
    .matches(/^\d{6}$/).withMessage('Enter a valid 6-digit pincode')
];

module.exports = {
  vendorValidator
};
