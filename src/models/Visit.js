const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    path: {
      type: String,
      default: '/',
      maxlength: 500
    },
    referrer: {
      type: String,
      default: '',
      maxlength: 1000
    },
    device: {
      type: String,
      default: 'Desktop',
      maxlength: 50
    },
    browser: {
      type: String,
      default: 'Unknown',
      maxlength: 100
    },
    ipHash: {
      type: String,
      required: true,
      maxlength: 64
    },
    area: {
      type: String,
      default: 'Unknown',
      maxlength: 150
    },
    deviceCategory: {
      type: String,
      default: 'Desktop',
      maxlength: 50
    },
    deviceModel: {
      type: String,
      default: '',
      maxlength: 100
    },
    deviceVendor: {
      type: String,
      default: '',
      maxlength: 100
    }
  },
  {
    timestamps: true
  }
);

visitSchema.index({ createdAt: -1, visitorId: 1 });
visitSchema.index({ sessionId: 1 });
// TTL index: automatically expire visitor records after 90 days to prevent unbounded collection growth
visitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
