/**
 * One-off: persist the DEFAULT_SERVICES catalogue into MongoDB SiteContent.
 * Run from the backend folder: node scripts/syncServicesToDb.js
 * Reuses the app's own mongoose connection and .env loading - the connection
 * string is never hard-coded here.
 */
const { config } = require('../src/config/env');

const mongoose = require('mongoose');
const SiteContent = require('../src/models/SiteContent');
const { DEFAULT_SECTIONS } = require('../src/utils/defaultContent');

const MONGODB_URI = config.mongoUri;

async function run() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB');

  const section = DEFAULT_SECTIONS.services;

  const existing = await SiteContent.findOne({ key: 'services' });
  const before = existing && existing.data && Array.isArray(existing.data.categories)
    ? existing.data.categories.length
    : Array.isArray(existing && existing.data) ? existing.data.length : 0;

  const doc = await SiteContent.findOneAndUpdate(
    { key: 'services' },
    {
      $set: {
        title: section.title,
        description: section.description,
        data: section.data,
        lastUpdatedBy: 'system-seed',
        updatedAt: new Date()
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  console.log('services doc _id:', doc._id.toString());
  console.log('header:', JSON.stringify(doc.data.header));
  console.log('categories before:', before, '-> after:', doc.data.categories.length);
  console.log('total sub-services:', doc.data.categories.reduce((n, s) => n + (s.items ? s.items.length : 0), 0));
  console.log('keys:', doc.data.categories.map((s) => s.key).join(', '));

  await mongoose.disconnect();
  console.log('Done. Services are now stored in MongoDB.');
}

run().catch((err) => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});