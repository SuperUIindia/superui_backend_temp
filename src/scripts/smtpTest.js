/**
 * Direct SMTP test: verifies that the Gmail credentials in backend/.env can
 * actually send an email to hello.superui@gmail.com.
 *
 * Usage: node src/scripts/smtpTest.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

async function main() {
  console.log('[SMTP Test] Host:', process.env.SMTP_HOST);
  console.log('[SMTP Test] Port:', process.env.SMTP_PORT);
  console.log('[SMTP Test] Secure:', process.env.SMTP_SECURE);
  console.log('[SMTP Test] User:', process.env.SMTP_USER);
  console.log('[SMTP Test] From:', process.env.SMTP_FROM);
  console.log('[SMTP Test] To:', process.env.ADMIN_NOTIFICATION_EMAIL);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[SMTP Test] Missing SMTP_HOST, SMTP_USER or SMTP_PASS in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  console.log('[SMTP Test] Verifying connection...');
  const verified = await transporter.verify();
  console.log('[SMTP Test] Connection verified:', verified);

  const from = process.env.SMTP_FROM || `"SuperUI" <${process.env.SMTP_USER}>`;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const subject = 'SuperUI Admin Dashboard - Test Email';
  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EDEDED; border-radius: 12px;">
    <h2 style="color: #FF5E00; margin-top: 0;">SMTP Test Successful</h2>
    <p>This test email confirms that your <strong>SuperUI</strong> admin dashboard SMTP configuration is working.</p>
    <p><strong>From:</strong> ${from}</p>
    <p><strong>To:</strong> ${to}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Server:</strong> ${process.env.NODE_ENV}</p>
    <p style="color: #6B6B6B; font-size: 12px;">All future lead submissions will trigger admin alerts to this address.</p>
  </div>`;

  console.log('[SMTP Test] Sending test email to:', to);
  const info = await transporter.sendMail({ from, to, subject, html });
  console.log('[SMTP Test] Message sent!');
  console.log('[SMTP Test] Message ID:', info.messageId);
  console.log('[SMTP Test] Response:', info.response);
  console.log('[SMTP Test] Envelope:', JSON.stringify(info.envelope));

  await transporter.close();
  console.log('[SMTP Test] Done.');
}

main().catch((err) => {
  console.error('[SMTP Test] Failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
