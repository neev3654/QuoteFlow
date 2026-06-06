const mongoose = require('mongoose');
const { generatePONumber } = require('../utils/generateNumber');

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: [true, 'RFQ reference is required'],
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: [true, 'Quotation reference is required'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor reference is required'],
    },
    approvalWorkflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApprovalWorkflow',
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
      },
    ],
    subtotal: {
      type: Number,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
    taxAmount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    deliveryAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    expectedDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'acknowledged', 'delivered', 'cancelled'],
      default: 'draft',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate poNumber and calculate totals
purchaseOrderSchema.pre('save', function (next) {
  if (!this.poNumber) {
    this.poNumber = generatePONumber();
  }

  let calculatedSubtotal = 0;
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      calculatedSubtotal += item.totalPrice;
    });
  }

  this.subtotal = calculatedSubtotal;
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.totalAmount = this.subtotal + this.taxAmount;

  next();
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
