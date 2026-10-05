// Configuration (MongoDB URI, DNS resolvers) is read from backend/.env only.
const { config } = require('../src/config/env');
const mongoose = require('mongoose');

const CLEANUP = process.argv.includes('--cleanup');
const EMAILS = [/^inline\.\d+@example\.com$/, /^modal\.\d+@example\.com$/];

(async () => {
  await mongoose.connect(config.mongoUri);
  const leads = mongoose.connection.db.collection('leads');
  const rows = await leads
    .find({ email: { $in: [EMAILS[0], EMAILS[1]] } })
    .sort({ createdAt: 1 })
    .toArray();

  console.log(`found ${rows.length} verification lead(s) in db "${mongoose.connection.name}"`);
  rows.forEach((l) => {
    console.log(
      `  ${l.leadId}  name="${l.name}"  email=${l.email}  phone=${l.phone}  ` +
        `ig=${l.instagramId}  purpose="${l.purpose}"  desc=${l.description.length}ch  ` +
        `visitor=${l.visitorId ? 'yes' : 'no'}  status=${l.status}`
    );
  });

  if (CLEANUP) {
    const res = await leads.deleteMany({ email: { $in: [EMAILS[0], EMAILS[1]] } });
    console.log(`cleaned up ${res.deletedCount} verification lead(s)`);
  }

  await mongoose.disconnect();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });