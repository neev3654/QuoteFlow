const mongoose = require('mongoose');
const { generateInvoiceNumber } = require('../utils/generateNumber');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'Purchase order reference is required'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor reference is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user reference is required'],
    },
    items: [
      {
        itemName: {
          type: String,
          required: [true, 'Item name is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
        },
        unitPrice: {
          type: Number,
          required: [true, 'Unit price is required'],
        },
        totalPrice: {
          type: Number,
        },
        hsnCode: {
          type: String,
        },
      },
    ],
    subtotal: {
      type: Number,
    },
    cgstRate: {
      type: Number,
      default: 9,
    },
    sgstRate: {
      type: Number,
      default: 9,
    },
    igstRate: {
      type: Number,
      default: 0,
    },
    cgstAmount: {
      type: Number,
    },
    sgstAmount: {
      type: Number,
    },
    igstAmount: {
      type: Number,
    },
    totalTax: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    emailSentAt: {
      type: Date,
    },
    emailSentTo: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate invoiceNumber and calculate tax amounts
invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = generateInvoiceNumber();
  }

  let calculatedSubtotal = 0;
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      calculatedSubtotal += item.totalPrice;
    });
  }

  this.subtotal = calculatedSubtotal;
  this.cgstAmount = (this.subtotal * this.cgstRate) / 100;
  this.sgstAmount = (this.subtotal * this.sgstRate) / 100;
  this.igstAmount = (this.subtotal * this.igstRate) / 100;
  this.totalTax = this.cgstAmount + this.sgstAmount + this.igstAmount;
  this.totalAmount = this.subtotal + this.totalTax;

  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
