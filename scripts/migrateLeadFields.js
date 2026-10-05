const { config } = require('../src/config/env');
const mongoose = require('mongoose');
const Lead = require('../src/models/Lead');

const OBSOLETE = ['service', 'projectType', 'budget', 'deadline', 'preferredContact'];

(async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const col = db.collection('leads');

  const before = await col.countDocuments({ service: { $exists: true } });

  // Carry the old service title into purpose so historic leads stay meaningful
  const migrated = await col.updateMany(
    { purpose: { $in: [null, ''] }, service: { $exists: true } },
    [{ $set: { purpose: '$service' } }]
  );

  const unset = await col.updateMany({}, { $unset: OBSOLETE.reduce((a, k) => ({ ...a, [k]: '' }), {}) });

  const sample = await col.find({}).limit(3).project({ leadId: 1, purpose: 1, phone: 1, service: 1 }).toArray();

  console.log('legacy docs before:', before);
  console.log('purpose backfilled from service:', migrated.modifiedCount);
  console.log('obsolete fields removed:', unset.modifiedCount);
  console.log('total leads:', await col.countDocuments());
  console.log('docs still having obsolete fields:',
    await col.countDocuments({ service: { $exists: true } }));
  console.log('sample:', JSON.stringify(sample));

  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });