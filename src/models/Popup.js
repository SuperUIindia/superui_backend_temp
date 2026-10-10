const mongoose = require('mongoose');

/**
 * A promotional popup shown to visitors as a 1:1 poster modal.
 *
 * The poster is referenced by URL, and the popup is only served while it is
 * active and the current time falls inside [fromDate, toDate], so it expires
 * automatically once the end date passes.
 */
const popupSchema = new mongoose.Schema(
  {
    // Poster image (1:1). Stored as a URL so no file storage is required.
    imageUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
      maxlength: 500,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return /^https?:\/\//i.test(v) || /^\//.test(v);
        },
        message: 'Poster image URL must begin with https:// or /'
      }
    },

    // Header / body / footer copy. The header is optional so an offer can be a
    // poster on its own; the visitor-facing popup renders no heading when it is
    // blank.
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120
    },
    bodyText: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    footerText: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300
    },

    // Contact button. An empty ctaUrl opens the site's contact form instead.
    ctaLabel: {
      type: String,
      default: 'Contact Us',
      trim: true,
      maxlength: 40
    },
    ctaUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
      validate: {
        validator: function (v) {
          if (!v) return true; // empty allowed, opens contact form
          return /^(https?:\/\/|mailto:|tel:|\/)/i.test(v);
        },
        message: 'CTA URL must be a valid http(s) link, relative path (/), mailto:, or tel: URL'
      }
    },

    // Availability window (inclusive). Expires automatically after toDate.
    fromDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    toDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: { type: String, default: 'admin' },
    updatedBy: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

popupSchema.index({ isActive: 1, fromDate: 1, toDate: 1 });
popupSchema.index({ createdAt: -1 });

/** True when the popup should be shown to a visitor right now. */
popupSchema.methods.isLive = function isLive(now = new Date()) {
  return this.isActive && this.fromDate <= now && this.toDate >= now;
};

/** Shared predicate for the public endpoint. */
popupSchema.statics.liveFilter = function liveFilter(now = new Date()) {
  return { isActive: true, fromDate: { $lte: now }, toDate: { $gte: now } };
};

const Popup = mongoose.model('Popup', popupSchema);

module.exports = Popup;