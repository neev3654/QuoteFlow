const mongoose = require('mongoose');
const { generateRFQNumber } = require('../utils/generateNumber');

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'RFQ Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: [true, 'Item name is required'],
        },
        description: {
          type: String,
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        unit: {
          type: String,
          default: 'pcs',
        },
        estimatedPrice: {
          type: Number,
        },
      },
    ],
    deadline: {
      type: Date,
      required: [true, 'RFQ Deadline is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'cancelled'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user reference is required'],
    },
    assignedVendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
      },
    ],
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        mimetype: { type: String },
        size: { type: Number },
      },
    ],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate rfqNumber
rfqSchema.pre('save', function (next) {
  if (!this.rfqNumber) {
    this.rfqNumber = generateRFQNumber();
  }
  next();
});

const RFQ = mongoose.model('RFQ', rfqSchema);

module.exports = RFQ;
