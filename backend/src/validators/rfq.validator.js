const { body } = require('express-validator');

const rfqValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value) => {
      const deadlineDate = new Date(value);
      const today = new Date();
      if (deadlineDate <= today) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemName')
    .notEmpty().withMessage('Item name is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1'),
  body('assignedVendors')
    .optional()
    .isArray().withMessage('Assigned vendors must be an array')
];

module.exports = {
  rfqValidator
};
