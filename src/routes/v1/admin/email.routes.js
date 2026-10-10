const express = require('express');
const { z } = require('zod');
const { config } = require('../../../config/env');
const { createTransporter } = require('../../../utils/mailer');
const { escapeHtml } = require('../../../utils/escapeHtml');

const router = express.Router();
const BRAND = config.brandName || 'SuperUI';

const testSchema = z.object({
  to: z.string().email('Valid email is required'),
  subject: z.string().optional().default('Test Email from Admin Dashboard')
});

async function handleTestEmail(req, res, next) {
  try {
    const parsed = testSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({
        success: false,
        message: 'SMTP is not configured on the server. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment.'
      });
    }

    const safeTo = escapeHtml(parsed.data.to);
    const testMailOptions = {
      from: config.smtp.from || `"${BRAND}" <${config.smtp.user}>`,
      to: parsed.data.to,
      subject: parsed.data.subject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EDEDED; border-radius: 12px;">
        <h2 style="color: #FF5E00; margin-top: 0;">Test Email Successful</h2>
        <p>This is a test email sent from the <strong>${escapeHtml(BRAND)}</strong> admin dashboard.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Server Environment:</strong> ${escapeHtml(config.nodeEnv)}</p>
        <p style="color: #6B6B6B; font-size: 12px;">If you received this, your SMTP configuration is working correctly.</p>
      </div>`,
      text: `Test Email from ${BRAND} admin dashboard.\n\nTime: ${new Date().toLocaleString()}\nServer Environment: ${config.nodeEnv}\n\nIf you received this, your SMTP configuration is working correctly.`
    };

    await transporter.sendMail(testMailOptions);

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${parsed.data.to}`
    });
  } catch (error) {
    const smtpHint = error.message.includes('not accepted') || error.message.includes('Invalid login')
      ? ' If using Gmail, you must use an App Password (not your regular account password).'
      : '';
    const smtpError = new Error(`SMTP send failed: ${error.message}.${smtpHint}`);
    smtpError.status = 502;
    next(smtpError);
  }
}

router.post('/test', handleTestEmail);
router.post('/test-email', handleTestEmail); // Backward compatibility

module.exports = router;

