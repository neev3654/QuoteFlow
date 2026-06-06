const { body } = require('express-validator');

const invoiceValidator = [
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid ISO8601 date')
    .custom((value) => {
      const dueDate = new Date(value);
      const today = new Date();
      if (dueDate <= today) {
        throw new Error('Due date must be a future date');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemName')
    .notEmpty().withMessage('Item name is required'),
  body('items.*.quantity')
    .isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number')
];

module.exports = {
  invoiceValidator
};
