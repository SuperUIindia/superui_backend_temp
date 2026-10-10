const nodemailer = require('nodemailer');
const { config } = require('../config/env');
const { escapeHtml } = require('./escapeHtml');

/** Brand name from .env (BRAND_NAME), so emails never hard-code it. */
const BRAND = config.brandName || 'SuperUI';

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
 * Generates branded, responsive HTML template for client confirmation email.
 * Every user-supplied field is strictly HTML-escaped to prevent email injection / phishing.
 */
function generateClientEmailHtml(lead, siteUrl) {
  const brandOrange = '#FF5E00';
  const brandViolet = '#7C3AED';
  const textDark = '#111111';
  const textMuted = '#6B6B6B';
  const bgLight = '#FAFAFA';
  const borderLight = '#EDEDED';

  const safeName = escapeHtml(lead.name || 'there');
  const safeLeadId = escapeHtml(lead.leadId);
  const safePhone = escapeHtml(lead.phone);
  const safeInstagram = escapeHtml(lead.instagramId);
  const safePurpose = escapeHtml(lead.purpose);
  const safeDescription = escapeHtml(lead.description);
  const safeSiteUrl = escapeHtml(siteUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Project Inquiry Received – ${escapeHtml(BRAND)}</title>
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
      <p class="greeting">Hello ${safeName},</p>
      <p class="intro-text">
        Thank you for submitting your project requirement with <strong>${escapeHtml(BRAND)}</strong>. We have received your inquiry and our engineering team is currently reviewing your technical specifications.
      </p>

      <div class="timeline-banner">
        ⚡ <strong>Next Step:</strong> The ${escapeHtml(BRAND)} team will shortly reach out to you within 24 hours with an architecture breakdown and tailored proposal.
      </div>

      <div class="lead-card">
        <div class="lead-card-title">Inquiry Summary (${safeLeadId})</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td style="color: ${textMuted}; font-weight: 500;">Reference ID:</td>
            <td align="right" style="color: ${brandOrange}; font-weight: 700; font-family: monospace;">${safeLeadId}</td>
          </tr>
          <tr>
            <td style="color: ${textMuted}; font-weight: 500;">Phone:</td>
            <td align="right" style="color: ${textDark}; font-weight: 600;">${safePhone}</td>
          </tr>
          ${
            lead.instagramId
              ? `<tr>
            <td style="color: ${textMuted}; font-weight: 500;">Instagram Handle:</td>
            <td align="right" style="color: ${brandViolet}; font-weight: 600;">${safeInstagram}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="color: ${textMuted}; font-weight: 500;">Purpose:</td>
            <td align="right" style="color: ${textDark}; font-weight: 600;">${safePurpose}</td>
          </tr>
        </table>

        <div style="margin-top: 14px;">
          <div style="font-size: 12px; font-weight: 600; color: ${textMuted}; margin-bottom: 6px;">Your Reason / Note:</div>
          <div class="description-box">${safeDescription}</div>
        </div>
      </div>

      <div class="cta-container">
        <a href="${safeSiteUrl}" class="cta-btn">Visit ${escapeHtml(BRAND)}</a>
      </div>

      <p style="font-size: 13px; color: ${textMuted}; text-align: center; margin-top: 20px;">
        Need to share supplementary wireframes or files? Simply reply directly to this email or reach us at <a href="mailto:hello.superui@gmail.com" style="color: ${brandOrange}; text-decoration: none; font-weight: 600;">hello.superui@gmail.com</a>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>${escapeHtml(BRAND)} Digital Engineering Studio</strong></p>
      <p style="margin: 0 0 6px 0;">Bengaluru, India • Global Remote Delivery</p>
      <p style="margin: 0; color: #71717A;">© ${new Date().getFullYear()} ${escapeHtml(BRAND)}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates professional admin notification email with full client details.
 * Every user-supplied field is strictly HTML-escaped.
 */
function generateAdminEmailHtml(lead, clientUrl) {
  const brandOrange = '#FF5E00';
  const brandViolet = '#7C3AED';
  const textDark = '#111111';
  const textMuted = '#6B6B6B';
  const bgLight = '#FAFAFA';
  const borderLight = '#EDEDED';
  const greenBg = '#ECFDF5';
  const greenBorder = '#10B981';
  const greenText = '#065F46';

  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const safeName = escapeHtml(lead.name);
  const safeEmail = escapeHtml(lead.email);
  const safePhone = escapeHtml(lead.phone || 'N/A');
  const safeInstagram = escapeHtml(lead.instagramId);
  const safePurpose = escapeHtml(lead.purpose);
  const safeDescription = escapeHtml(lead.description);
  const safeLeadId = escapeHtml(lead.leadId);
  const safeDevice = escapeHtml(lead.device || 'Desktop');
  const safeBrowser = escapeHtml(lead.browser || 'Unknown');
  const safeArea = escapeHtml(lead.area || 'Unknown');
  const safeClientUrl = escapeHtml(clientUrl);

  const mailtoEmail = encodeURIComponent(lead.email || '');
  const telPhone = encodeURIComponent(lead.phone || '');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Alert: ${safeLeadId} – ${escapeHtml(BRAND)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${textDark}; line-height: 1.6;">
  <div style="max-width: 640px; margin: 30px auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid ${borderLight};">
    
    <!-- Header Bar -->
    <div style="background: linear-gradient(135deg, ${brandOrange}, ${brandViolet}); height: 8px; width: 100%;"></div>
    
    <!-- Header Content -->
    <div style="padding: 32px 36px 24px 36px; text-align: center; border-bottom: 1px solid ${borderLight};">
      <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, ${brandOrange}, ${brandViolet}); border-radius: 16px; color: #FFFFFF; font-size: 28px; font-weight: 800; line-height: 56px; text-align: center; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(255,94,0,0.25);">
        S
      </div>
      <h1 style="font-size: 24px; font-weight: 800; color: ${textDark}; margin: 0; letter-spacing: -0.5px;">
        Super<span style="color: ${brandOrange};">UI</span>
      </h1>
      <p style="font-size: 13px; color: ${textMuted}; margin: 6px 0 0 0;">New Client Lead Notification</p>
    </div>

    <!-- Alert Badge -->
    <div style="padding: 24px 36px 0 36px;">
      <div style="background: ${greenBg}; border: 1px solid ${greenBorder}; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 10px;">
        <div style="width: 20px; height: 20px; background: ${greenBorder}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; flex-shrink: 0;">✓</div>
        <div>
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: ${greenText};">New Inquiry Received</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: ${textMuted};">Submitted at ${escapeHtml(submittedAt)}</p>
        </div>
      </div>
    </div>

    <!-- Main Body -->
    <div style="padding: 24px 36px 36px 36px;">
      
      <!-- Lead ID & Status -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; background: linear-gradient(135deg, ${brandOrange}, ${brandViolet}); color: white; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; letter-spacing: 0.5px; font-family: monospace;">
          ${safeLeadId}
        </span>
      </div>

      <!-- Client Details Card -->
      <div style="background: ${bgLight}; border: 1px solid ${borderLight}; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${brandViolet}; margin: 0 0 18px 0; padding-bottom: 10px; border-bottom: 2px solid ${borderLight};">
          👤 Client Information
        </h2>
        
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; width: 40%; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">Full Name</td>
            <td style="color: ${textDark}; font-weight: 700; text-align: right; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">${safeName}</td>
          </tr>
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">Email Address</td>
            <td style="color: ${brandOrange}; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">
              <a href="mailto:${mailtoEmail}" style="color: ${brandOrange}; text-decoration: none; font-weight: 600;">${safeEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">Phone / WhatsApp</td>
            <td style="color: ${textDark}; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">
              <a href="tel:${telPhone}" style="color: ${textDark}; text-decoration: none; font-weight: 600;">${safePhone}</a>
            </td>
          </tr>
          ${lead.instagramId ? `
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">Instagram</td>
            <td style="color: ${brandViolet}; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px dashed #E4E4E7;">${safeInstagram}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; padding: 8px 0;">Service Interested</td>
            <td style="color: ${textDark}; font-weight: 700; text-align: right; padding: 8px 0;">${safePurpose}</td>
          </tr>
        </table>
      </div>

      <!-- Project Description -->
      <div style="background: ${bgLight}; border: 1px solid ${borderLight}; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${brandViolet}; margin: 0 0 12px 0;">
          📝 Project Requirements
        </h2>
        <div style="background: #FFFFFF; border: 1px solid ${borderLight}; border-radius: 10px; padding: 16px; font-size: 14px; color: ${textDark}; white-space: pre-wrap; line-height: 1.7;">
          ${safeDescription}
        </div>
      </div>

      <!-- Visitor Analytics -->
      <div style="background: ${bgLight}; border: 1px solid ${borderLight}; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${brandViolet}; margin: 0 0 12px 0;">
          📊 Visitor Analytics
        </h2>
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; width: 40%; padding: 6px 0;">Device Type</td>
            <td style="color: ${textDark}; font-weight: 600; text-align: right; padding: 6px 0;">${safeDevice}</td>
          </tr>
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; padding: 6px 0;">Browser</td>
            <td style="color: ${textDark}; font-weight: 600; text-align: right; padding: 6px 0;">${safeBrowser}</td>
          </tr>
          <tr>
            <td style="color: ${textMuted}; font-weight: 500; padding: 6px 0;">Location</td>
            <td style="color: ${textDark}; font-weight: 600; text-align: right; padding: 6px 0;">${safeArea}</td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="${safeClientUrl}/admin" style="display: inline-block; background: linear-gradient(135deg, ${brandOrange}, ${brandViolet}); color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 15px rgba(255,94,0,0.3);">
          Open Admin Dashboard →
        </a>
      </div>

      <!-- Help Text -->
      <p style="font-size: 12px; color: ${textMuted}; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
        Reply directly to this email or contact the client at <a href="mailto:${mailtoEmail}" style="color: ${brandOrange}; text-decoration: none; font-weight: 600;">${safeEmail}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: ${bgLight}; border-top: 1px solid ${borderLight}; padding: 20px 36px; text-align: center;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: ${textDark};">${escapeHtml(BRAND)} Digital Engineering Studio</p>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: ${textMuted};">Warangal, Telangana, India • Global Remote Delivery</p>
      <p style="margin: 0; font-size: 11px; color: #71717A;">© ${new Date().getFullYear()} ${escapeHtml(BRAND)}. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Sends confirmation email to client and alert to admin
 * Never throws an error so lead creation is never blocked
 */
async function sendLeadEmails(lead) {
  try {
    const transporter = createTransporter();
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
    const adminEmail = config.smtp.leadNotificationEmail || config.smtp.notificationEmail || config.smtp.user;
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

    const results = await Promise.allSettled([clientSendPromise, adminSendPromise]);
    const clientOk = results[0].status === 'fulfilled';
    const adminOk = results[1].status === 'fulfilled';

    if (clientOk && adminOk) {
      console.log(`[Email Sent] Both emails sent successfully for ${lead.leadId} (client: ${lead.email}, admin: ${adminEmail})`);
    } else if (clientOk) {
      console.log(`[Email Sent] Client email sent to ${lead.email}, admin email failed for ${lead.leadId}`);
    } else if (adminOk) {
      console.log(`[Email Sent] Admin email sent to ${adminEmail}, client email failed for ${lead.leadId}`);
    } else {
      console.error(`[Email Error] Both emails failed for ${lead.leadId}`);
    }

    return { success: clientOk || adminOk };
  } catch (error) {
    console.error(`[Email Error] Failed to send email for lead ${lead.leadId}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendLeadEmails, createTransporter, generateClientEmailHtml, generateAdminEmailHtml };
