const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema(
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
    service: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

clickEventSchema.index({ service: 1, createdAt: -1 });
clickEventSchema.index({ visitorId: 1 });

const ClickEvent = mongoose.model('ClickEvent', clickEventSchema);

module.exports = ClickEvent;

