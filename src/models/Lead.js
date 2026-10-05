const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 20
    },
    instagramId: {
      type: String,
      trim: true,
      default: '',
      maxlength: 40
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Discussion', 'Won', 'Lost'],
      default: 'New'
    },
    notes: {
      type: String,
      default: ''
    },
    // Set the first time an admin opens the lead, so unread submissions can be
    // highlighted in the list until they have been reviewed.
    viewedAt: {
      type: Date,
      default: null
    },
    visitorId: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ createdAt: -1, status: 1, purpose: 1 });
leadSchema.index({ visitorId: 1 });
leadSchema.index({ viewedAt: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;