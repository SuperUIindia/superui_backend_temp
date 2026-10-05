const { config } = require('../src/config/env');
const mongoose = require('mongoose');

// The shared e-commerce connection string lives only in backend/.env
// (SHARED_MONGODB_URI). It is never written into this script.
const HOST = config.sharedMongoUri;
const EMAIL = 'verify.superui.check@example.com';

(async () => {
  if (!HOST) {
    console.error(
      'SHARED_MONGODB_URI is not set in backend/.env, so the isolation check cannot run.\n' +
        'Add it (a read-only connection string to the shared database) and retry.'
    );
    process.exit(1);
  }

  const mine = await mongoose.createConnection(config.mongoUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  const shared = await mongoose.createConnection(HOST, { serverSelectionTimeoutMS: 15000, dbName: 'superui_core' }).asPromise();

  const q = { email: EMAIL };
  const inSuperui = await mine.db.collection('leads').find(q).project({ leadId: 1, email: 1 }).toArray();
  const inShared = await shared.db.collection('leads').find(q).project({ leadId: 1, email: 1 }).toArray();

  console.log('leads in superui (dedicated):', inSuperui.length, JSON.stringify(inSuperui));
  console.log('leads in superui_core (shared):', inShared.length, JSON.stringify(inShared));

  const contentKeys = await shared.db.collection('sitecontents').find({}).project({ key: 1 }).toArray();
  console.log('superui_core sitecontents now:', contentKeys.map((d) => d.key).join(', ') || '(empty)');

  if (process.argv.includes('--cleanup')) {
    const del = await mine.db.collection('leads').deleteMany(q);
    console.log(`removed ${del.deletedCount} verification lead(s) from superui`);
  }

  await mine.close();
  await shared.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });