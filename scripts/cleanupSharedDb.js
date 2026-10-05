/**
 * Remove SuperUI documents that an earlier migration pushed into the shared
 * e-commerce database (superui_core), restoring that database to its prior state.
 *
 *   node scripts/cleanupSharedDb.js            # dry run
 *   node scripts/cleanupSharedDb.js --confirm  # delete
 *
 * Safety:
 *   - Only touches documents whose _id is byte-identical to a copy that now
 *     lives in the dedicated SuperUI database.
 *   - Only touches collection/key combinations owned exclusively by SuperUI.
 *   - Never drops collections or indexes.
 */
const { config } = require('../src/config/env');

const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
// Both connection strings come from backend/.env (MONGODB_URI and
// SHARED_MONGODB_URI). Neither is ever written into this script.
const SHARED_DB = config.sharedMongoUri;
const SUPERUI_DB = 'superui';

if (!SHARED_DB) {
  console.error('ERROR: SHARED_MONGODB_URI is not set in backend/.env');
  process.exit(1);
}

// SuperUI-owned content keys. The e-commerce app does not use these.
const CONTENT_KEYS = ['services', 'hero', 'whyus', 'howitworks'];

function stripMongoId(doc) {
  const { _id, __v, ...rest } = doc;
  return JSON.stringify(rest);
}

(async () => {
  const shared = await mongoose.createConnection(SHARED_DB, { serverSelectionTimeoutMS: 15000, dbName: 'superui_core' }).asPromise();
  const mine = await mongoose.createConnection(config.mongoUri, { serverSelectionTimeoutMS: 15000, dbName: SUPERUI_DB }).asPromise();

  const sharedDb = shared.db;
  const myDb = mine.db;

  console.log('SHARED   :', 'superui_core');
  console.log('SUPERUI  :', SUPERUI_DB);
  console.log('MODE     :', CONFIRM ? 'DELETE' : 'DRY RUN (pass --confirm to delete)');
  console.log('');

  const owned = await myDb.collection('sitecontents').find({ key: { $in: CONTENT_KEYS } }).toArray();
  const ownedById = new Map(owned.map((d) => [String(d._id), d]));

  const sharedDocs = await sharedDb.collection('sitecontents').find({ key: { $in: CONTENT_KEYS } }).toArray();
  const removable = sharedDocs.filter((d) => {
    const twin = ownedById.get(String(d._id));
    return twin && stripMongoId(twin) === stripMongoId(d);
  });
  const kept = sharedDocs.filter((d) => !removable.includes(d));

  console.log(`sitecontents in superui_core matching SuperUI keys: ${sharedDocs.length}`);
  console.log(`  identical copy present in "${SUPERUI_DB}" -> removable: ${removable.length}`);
  kept.forEach((d) => console.log(`  NOT removable (no identical copy): ${d.key} (${d._id})`));
  console.log('');

  if (removable.length === 0) {
    console.log('Nothing to do.');
  } else if (!CONFIRM) {
    removable.forEach((d) => console.log(`  would delete ${d.key} (${d._id})`));
    console.log('');
    console.log('Dry run complete. Re-run with --confirm to delete.');
  } else {
    const ids = removable.map((d) => d._id);
    const res = await sharedDb.collection('sitecontents').deleteMany({ _id: { $in: ids } });
    console.log(`Deleted ${res.deletedCount} document(s) from superui_core.sitecontents.`);
  }

  await shared.close();
  await mine.close();
})().catch((err) => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});