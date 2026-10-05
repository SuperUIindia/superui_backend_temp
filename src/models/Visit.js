const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      trim: true
    },
    sessionId: {
      type: String,
      required: true,
      trim: true
    },
    path: {
      type: String,
      default: '/'
    },
    referrer: {
      type: String,
      default: ''
    },
    device: {
      type: String,
      default: 'Desktop'
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    ipHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

visitSchema.index({ createdAt: -1, visitorId: 1 });
visitSchema.index({ sessionId: 1 });

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;

