const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: [true, 'RFQ reference is required'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor reference is required'],
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
          min: [0, 'Unit price cannot be negative'],
        },
        totalPrice: {
          type: Number,
        },
        deliveryDays: {
          type: Number,
        },
        notes: {
          type: String,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    validUntil: {
      type: Date,
    },
    deliveryTerms: {
      type: String,
    },
    paymentTerms: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'accepted', 'rejected'],
      default: 'submitted',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one quotation per vendor per RFQ
quotationSchema.index({ rfq: 1, vendor: 1 }, { unique: true });

// Pre-save hook to calculate items' totalPrice and optionally totalAmount
quotationSchema.pre('save', function (next) {
  let computedTotal = 0;
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      computedTotal += item.totalPrice;
    });
  }
  // If totalAmount is not set, we can assign the computedTotal
  if (this.totalAmount === undefined || this.totalAmount === null) {
    this.totalAmount = computedTotal;
  }
  next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
