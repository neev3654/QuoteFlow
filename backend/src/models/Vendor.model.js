const mongoose = require('mongoose');
const { generateVendorCode } = require('../utils/generateNumber');

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    category: {
      type: String,
      enum: ['IT', 'Manufacturing', 'Services', 'Logistics', 'Raw Materials', 'Other'],
      required: [true, 'Category is required'],
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      branchName: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blacklisted'],
      default: 'active',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    linkedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate vendorCode
vendorSchema.pre('save', function (next) {
  if (!this.vendorCode) {
    this.vendorCode = generateVendorCode();
  }
  next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
