const nodemailer = require('nodemailer');
const { config } = require('../config/env');

/** Brand name from .env (BRAND_NAME), so emails never hard-code it. */
const BRAND = config.brandName || 'AKHILTHADAKA';

/**
 * Creates and configures Nodemailer transporter using secure environment variables
 */
function createTransporter() {
  const { host, port, user, pass, secure } = config.smtp;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: port || 587,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: config.isProduction
      }
    });
  }

  // If credentials are not yet set, return null (handled gracefully in sendLeadEmails)
  return null;
}

/**
 * Generates branded, responsive HTML template for client confirmation email
 */
function generateClientEmailHtml(lead, siteUrl) {
  const brandOrange = '#FF5E00';
  const brandViolet = '#7C3AED';
  const textDark = '#111111';
  const textMuted = '#6B6B6B';
  const bgLight = '#FAFAFA';
  const borderLight = '#EDEDED';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Project Inquiry Received – ${BRAND}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F4F4F5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: ${textDark};
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      border: 1px solid ${borderLight};
    }
    .header-bar {
      background: linear-gradient(135deg, ${brandOrange}, ${brandViolet});
      height: 6px;
      width: 100%;
    }
    .header-content {
      padding: 32px 36px 20px 36px;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, ${brandOrange}, ${brandViolet});
      border-radius: 14px;
      color: #FFFFFF;
      font-size: 26px;
      font-weight: 800;
      line-height: 50px;
      text-align: center;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: ${textDark};
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-accent {
      color: ${brandOrange};
    }
    .main-body {
      padding: 10px 36px 36px 36px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: ${textDark};
    }
    .intro-text {
      font-size: 15px;
      color: ${textMuted};
      margin-bottom: 24px;
    }
    .lead-card {
      background: ${bgLight};
      border: 1px solid ${borderLight};
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 24px;
    }
    .lead-card-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${brandViolet};
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid ${borderLight};
      padding-bottom: 8px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
      border-bottom: 1px dashed #E4E4E7;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: ${textMuted};
      font-weight: 500;
    }
    .detail-val {
      color: ${textDark};
      font-weight: 600;
      text-align: right;
    }
    .description-box {
      margin-top: 14px;
      padding: 14px;
      background: #FFFFFF;
      border: 1px solid ${borderLight};
      border-radius: 10px;
      font-size: 13px;
      color: ${textDark};
      white-space: pre-wrap;
    }
    .timeline-banner {
      background: #FFF1E8;
      border: 1px solid rgba(255, 94, 0, 0.25);
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 24px;
      text-align: center;
      font-size: 14px;
      color: ${brandOrange};
      font-weight: 600;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .cta-btn {
      display: inline-block;
      background: ${brandOrange};
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(255,94,0,0.3);
    }
    .footer {
      background: ${bgLight};
      border-top: 1px solid ${borderLight};
      padding: 24px 36px;
      text-align: center;
      font-size: 12px;
      color: ${textMuted};
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-bar"></div>
    <div class="header-content">
      <div class="logo-badge">S</div>
      <h1 class="brand-title">Super<span class="brand-accent">UI</span> Services</h1>
    </div>

    <div class="main-body">
      <p class="greeting">Hello ${lead.name || 'there'},</p>
      <p class="intro-text">
        Thank you for submitting your project requirement with <strong>${BRAND}</strong>. We have received your inquiry and our engineering team is currently reviewing your technical specifications.
      </p>

      <div class="timeline-banner">
        ⚡ <strong>Next Step:</strong> The ${BRAND} team will shortly reach out to you within 24 hours with an architecture breakdown and tailored proposal.
      </div>

      <div class="lead-card">
        <div class="lead-card-title">Inquiry Summary (${lead.leadId})</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td style="color: ${textMuted}; font-weight: 500;">Reference ID:</td>
            <td align="right" style="color: ${brandOrange}; font-weight: 700; font-family: monospace;">${lead.leadId}</td>
          </tr>
          <tr>
            <td style="color: ${textMuted}; font-weight: 500;">Phone:</td>
            <td align="right" style="color: ${textDark}; font-weight: 600;">${lead.phone}</td>
          </tr>
          ${
            lead.instagramId
              ? `<tr>
            <td style="color: ${textMuted}; font-weight: 500;">Instagram Handle:</td>
            <td align="right" style="color: ${brandViolet}; font-weight: 600;">${lead.instagramId}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="color: ${textMuted}; font-weight: 500;">Purpose:</td>
            <td align="right" style="color: ${textDark}; font-weight: 600;">${lead.purpose}</td>
          </tr>
        </table>

        <div style="margin-top: 14px;">
          <div style="font-size: 12px; font-weight: 600; color: ${textMuted}; margin-bottom: 6px;">Your Reason / Note:</div>
          <div class="description-box">${lead.description}</div>
        </div>
      </div>

      <div class="cta-container">
        <a href="${siteUrl}" class="cta-btn">Visit ${BRAND}</a>
      </div>

      <p style="font-size: 13px; color: ${textMuted}; text-align: center; margin-top: 20px;">
        Need to share supplementary wireframes or files? Simply reply directly to this email or reach us at <a href="mailto:hello.superui@gmail.com" style="color: ${brandOrange}; text-decoration: none; font-weight: 600;">hello.superui@gmail.com</a>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>${BRAND} Digital Engineering Studio</strong></p>
      <p style="margin: 0 0 6px 0;">Bengaluru, India • Global Remote Delivery</p>
      <p style="margin: 0; color: #A1A1AA;">© ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates admin notification email
 */
function generateAdminEmailHtml(lead, clientUrl) {
  return `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EDEDED; border-radius: 12px;">
    <h2 style="color: #FF5E00; margin-top: 0;">🚀 New Client Lead Received: ${lead.leadId}</h2>
    <p>A new client submitted their project requirements on ${BRAND}.</p>
    <div style="background: #FAFAFA; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p><strong>Lead ID:</strong> ${lead.leadId}</p>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
      <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
      <p><strong>Instagram ID:</strong> ${lead.instagramId || 'None provided'}</p>
      <p><strong>Purpose:</strong> ${lead.purpose}</p>
      <p><strong>Reason / Note:</strong></p>
      <div style="background: white; padding: 10px; border: 1px solid #EDEDED; border-radius: 6px; white-space: pre-wrap;">${lead.description}</div>
    </div>
    <p><a href="${clientUrl}/admin" style="background: #7C3AED; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Open Admin Dashboard</a></p>
  </div>
  `;
}

/**
 * Sends confirmation email to client and alert to admin
 * Never throws an error so lead creation is never blocked
 */
async function sendLeadEmails(lead) {
  try {
    const transporter = createTransporter();
    // Both origins come from backend/.env - nothing is hard-coded here.
    const clientUrl = config.clientUrl;
    const siteUrl = config.siteUrl;
    const fromAddress = config.smtp.from || `"${BRAND}" <${config.smtp.user}>`;

    if (!transporter) {
      console.log(`[Email Notice] SMTP credentials not configured in environment variables. Email to ${lead.email} logged to console for review.`);
      console.log(`[Email Preview] Recipient: ${lead.email} | Subject: We've received your project inquiry [${lead.leadId}] – ${BRAND}`);
      return { success: false, reason: 'SMTP not configured' };
    }

    // 1. Send Confirmation Email to Client
    const clientMailOptions = {
      from: fromAddress,
      to: lead.email,
      subject: `We've received your project inquiry [${lead.leadId}] – ${BRAND}`,
      html: generateClientEmailHtml(lead, siteUrl),
      text: `Hello ${lead.name},\n\nThank you for choosing ${BRAND}! The ${BRAND} team will shortly reach out to you within 24 hours to review your requirements.\n\nReference ID: ${lead.leadId}\nPurpose: ${lead.purpose}\n\nBest regards,\n${BRAND} Team\n${config.smtp.user}`
    };

    const clientSendPromise = transporter.sendMail(clientMailOptions);

    // 2. Send Alert Email to Admin (if admin email is configured)
    const adminEmail = config.smtp.notificationEmail || config.smtp.user;
    let adminSendPromise = Promise.resolve();

    if (adminEmail) {
      const adminMailOptions = {
        from: fromAddress,
        to: adminEmail,
        subject: `⚡ New Project Lead: ${lead.leadId} from ${lead.name}`,
        html: generateAdminEmailHtml(lead, clientUrl),
        text: `New Lead: ${lead.leadId}\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nInstagram: ${lead.instagramId || 'N/A'}\nPurpose: ${lead.purpose}\nReason / Note: ${lead.description}`
      };
      adminSendPromise = transporter.sendMail(adminMailOptions);
    }

    await Promise.allSettled([clientSendPromise, adminSendPromise]);
    console.log(`[Email Sent] Confirmation email dispatched successfully to ${lead.email} for ${lead.leadId}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email Error] Failed to send email for lead ${lead.leadId}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendLeadEmails, createTransporter };
