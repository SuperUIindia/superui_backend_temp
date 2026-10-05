const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    lastUpdatedBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

module.exports = SiteContent;
