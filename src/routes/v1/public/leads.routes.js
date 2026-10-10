const express = require('express');
const { z } = require('zod');
const Lead = require('../../../models/Lead');
const { getNextLeadId } = require('../../../models/Counter');
const validate = require('../../../middleware/validate');
const { leadsLimiter } = require('../../../middleware/rateLimit');
const { sendLeadEmails } = require('../../../utils/mailer');

const router = express.Router();

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name cannot exceed 80 characters'),
  email: z.string().trim().email('Please provide a valid email address').max(120),
  phone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number')
    .max(20, 'Phone number is too long'),
  instagramId: z.string().trim().max(40, 'Instagram ID cannot exceed 40 characters').optional().default(''),
  purpose: z
    .string()
    .trim()
    .min(2, 'Please select a purpose')
    .max(120, 'Purpose cannot exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Reason / note must be at least 10 characters')
    .max(2000, 'Reason / note cannot exceed 2000 characters'),
  visitorId: z.string().trim().min(1, 'Visitor ID is required').max(128),
  honeypot: z.string().optional().default('')
});

/**
 * POST /api/v1/leads - Submit a client lead
 */
router.post('/', leadsLimiter, validate(leadSchema), async (req, res, next) => {
  try {
    const { name, email, phone, instagramId, purpose, description, visitorId, honeypot } = req.body;

    // Honeypot anti-spam check: silently succeed without saving if filled
    if (honeypot && honeypot.trim().length > 0) {
      console.warn(`[Spam Guard] Lead submission blocked via honeypot from IP: ${req.ip}`);
      return res.status(200).json({
        success: true,
        message: "Thanks! We'll reply within 24 hours.",
        data: { leadId: 'SUP-SPAM-GUARD' }
      });
    }

    // Generate unique sequential leadId
    const leadId = await getNextLeadId();

    const newLead = await Lead.create({
      leadId,
      name,
      email,
      phone,
      instagramId: instagramId || '',
      purpose,
      description,
      status: 'New',
      notes: '',
      visitorId
    });

    // Send confirmation email to client and alert to admin asynchronously
    sendLeadEmails(newLead).catch((mailErr) => {
      console.warn('[Email Warning] Background email notification error:', mailErr.message);
    });

    return res.status(201).json({
      success: true,
      message: "Thanks! We'll reply within 24 hours.",
      data: {
        leadId: newLead.leadId,
        id: newLead._id
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

