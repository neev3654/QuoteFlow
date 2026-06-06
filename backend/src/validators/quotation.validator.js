const { body } = require('express-validator');

const quotationValidator = [
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemName')
    .notEmpty().withMessage('Item name is required'),
  body('items.*.quantity')
    .isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('validUntil')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Valid until must be a valid ISO8601 date')
    .custom((value) => {
      const validUntilDate = new Date(value);
      const today = new Date();
      if (validUntilDate <= today) {
        throw new Error('Valid until must be a future date');
      }
      return true;
    }),
  body('totalAmount')
    .isFloat({ min: 0 }).withMessage('Total amount must be a positive number')
];

module.exports = {
  quotationValidator
};
