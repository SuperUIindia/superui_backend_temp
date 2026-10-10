const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema(
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
    service: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    }
  },
  {
    timestamps: true
  }
);

clickEventSchema.index({ service: 1, createdAt: -1 });
clickEventSchema.index({ visitorId: 1 });
// TTL index: automatically expire click records after 90 days to prevent unbounded collection growth
clickEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ClickEvent = mongoose.model('ClickEvent', clickEventSchema);

module.exports = ClickEvent;
