/**
 * One-time backfill: leads that already existed before the `viewedAt` field was
 * introduced are marked as viewed (viewedAt = createdAt) so only genuinely new
 * submissions get the "new lead" highlight in the admin list.
 *
 *   node scripts/backfillLeadViewedAt.js            # dry run
 *   node scripts/backfillLeadViewedAt.js --confirm  # write
 */
const { config } = require('../src/config/env');

const mongoose = require('mongoose');
const Lead = require('../src/models/Lead');

const CONFIRM = process.argv.includes('--confirm');

(async () => {
  await mongoose.connect(config.mongoUri);
  console.log('db     :', mongoose.connection.name);
  console.log('mode   :', CONFIRM ? 'WRITE' : 'DRY RUN (pass --confirm)');

  const pending = await Lead.countDocuments({ viewedAt: null });
  const total = await Lead.countDocuments();
  console.log(`leads  : ${total} total, ${pending} without viewedAt`);

  if (pending === 0) {
    console.log('Nothing to backfill.');
  } else if (!CONFIRM) {
    console.log(`Would set viewedAt = createdAt on ${pending} document(s).`);
  } else {
    // Pipeline update via the raw driver (Mongoose needs updatePipeline for arrays)
    const res = await Lead.collection.updateMany(
      { viewedAt: null },
      [{ $set: { viewedAt: '$createdAt' } }]
    );
    console.log(`Backfilled ${res.modifiedCount} document(s).`);
    await Lead.syncIndexes();
  }

  const stillPending = await Lead.countDocuments({ viewedAt: null });
  console.log(`remaining without viewedAt: ${stillPending}`);

  await mongoose.disconnect();
})().catch((e) => {
  console.error('Backfill failed:', e.message);
  process.exit(1);
});