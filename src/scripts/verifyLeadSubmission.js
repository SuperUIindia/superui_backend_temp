/**
 * Quick verification: submit a test lead via API and confirm it persists in MongoDB,
 * then check the admin notification email target.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { config } = require('../config/env');

async function main() {
  console.log('[Test] Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);
  console.log('[Test] Connected.');

  const testLead = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '9876543210',
    instagramId: '@testuser',
    purpose: 'Web Development',
    description: 'This is a test lead submitted automatically to verify DB storage and email routing.',
    visitorId: 'test-visitor-' + Date.now(),
    honeypot: ''
  };

  console.log('[Test] Submitting lead via API...');
  const apiBase = config.apiPublicUrl || 'http://localhost:5000';
  const res = await fetch(`${apiBase}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testLead)
  });

  const data = await res.json();
  console.log('[Test] API response status:', res.status);
  console.log('[Test] API response:', data);

  if (!res.ok || !data.success) {
    throw new Error('Lead submission failed: ' + JSON.stringify(data));
  }

  const leadId = data.data.leadId;
  console.log('[Test] Lead created with ID:', leadId);

  const fetched = await Lead.findOne({ leadId }).lean();
  if (!fetched) {
    throw new Error('Lead not found in DB after submission!');
  }
  console.log('[Test] Fetched from DB:', fetched.leadId, fetched.name, fetched.email, fetched.status);

  const count = await Lead.countDocuments();
  console.log('[Test] Total leads in collection:', count);

  console.log('[Test] Admin notification email target:', config.smtp.notificationEmail);
  console.log('[Test] SMTP user (from address):', config.smtp.user);
  console.log('[Test] Brand:', config.brandName);

  await mongoose.disconnect();
  console.log('[Test] Done. Lead is stored and admin email is routed to:', config.smtp.notificationEmail);
}

main().catch((err) => {
  console.error('[Test] Failed:', err);
  process.exit(1);
});
