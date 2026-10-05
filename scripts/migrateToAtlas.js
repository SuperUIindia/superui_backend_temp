/**
 * Copy the SuperUI database from local MongoDB to MongoDB Atlas.
 *
 *   npm run migrate:atlas            # dry run - reports what would happen
 *   npm run migrate:atlas -- --confirm    # actually writes to Atlas
 *
 * Env (all read from backend/.env):
 *   LOCAL_MONGODB_URI  source - required by this script
 *   MONGODB_URI        target Atlas URI - required
 *   TARGET_DB          optional Atlas database name (default: same as URI)
 *
 * Safety:
 *   - Refuses to run against a target database that already holds collections
 *     this app does not own, unless --allow-mixed is also passed.
 *   - Never drops collections. Existing documents are left untouched; only
 *     _id collisions are reported.
 */
const mongoose = require('mongoose');
const { config } = require('../src/config/env');

// Collections owned by this app. Anything else found in the target database
// means the target is shared with another project and we refuse to write.
const SOURCE_COLLECTIONS = [
  'admins', 'admin_users', 'leads', 'visits', 'clickevents', 'pageviews',
  'sitecontents', 'counters', 'categories', 'products', 'notifications',
  'heroimages', 'settings', 'sitesettings', 'messages'
];
const CONFIRM = process.argv.includes('--confirm');
const ALLOW_MIXED = process.argv.includes('--allow-mixed');

// Both connection strings come from backend/.env. LOCAL_MONGODB_URI is required
// for this script specifically, so there is no fallback to a guessed host.
const LOCAL_URI = config.localMongoUri;
const ATLAS_URI = config.mongoUri;
const TARGET_DB = process.env.TARGET_DB || null;

function dbNameFromUri(uri) {
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const afterAt = rest.includes('@') ? rest.slice(rest.indexOf('@') + 1) : rest;
  const [hostAndDb] = afterAt.split('?');
  const slash = hostAndDb.indexOf('/');
  return slash === -1 ? null : hostAndDb.slice(slash + 1);
}

function hostFromUri(uri) {
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const afterAt = rest.includes('@') ? rest.slice(rest.indexOf('@') + 1) : rest;
  return afterAt.split('?')[0].split('/')[0];
}

(async () => {
  if (!LOCAL_URI) {
    console.error('ERROR: LOCAL_MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  const targetDb = TARGET_DB || dbNameFromUri(ATLAS_URI);
  if (!targetDb) {
    console.error('ERROR: could not determine target database name; set TARGET_DB');
    process.exit(1);
  }

  console.log('SOURCE :', hostFromUri(LOCAL_URI), '/', dbNameFromUri(LOCAL_URI));
  console.log('TARGET :', hostFromUri(ATLAS_URI), '/', targetDb);
  console.log('MODE   :', CONFIRM ? 'WRITE' : 'DRY RUN (pass --confirm to write)');
  console.log('');

  const src = await mongoose.createConnection(LOCAL_URI, { serverSelectionTimeoutMS: 8000 }).asPromise();
  const dst = await mongoose.createConnection(ATLAS_URI, { serverSelectionTimeoutMS: 15000, dbName: targetDb }).asPromise();

  const srcDb = src.db;
  const dstDb = dst.db;
  const srcCols = (await srcDb.listCollections().toArray()).map((c) => c.name);
  const dstCols = (await dstDb.listCollections().toArray()).map((c) => c.name);

  console.log('source collections:', srcCols.join(', ') || '(none)');
  console.log('target collections:', dstCols.join(', ') || '(empty)');
  console.log('');

  const foreign = dstCols.filter((c) => !SOURCE_COLLECTIONS.includes(c));
  if (foreign.length > 0) {
    console.log('!! Target database already contains collections that are NOT part of SuperUI:');
    foreign.forEach((c) => console.log('     -', c));
    console.log('');
    if (!ALLOW_MIXED) {
      console.error('ABORTED: refusing to mix SuperUI data into this database.');
      console.error('Fix one of these and re-run:');
      console.error('  a) point MONGODB_URI at a database dedicated to SuperUI (recommended), or');
      console.error('  b) set TARGET_DB=<dedicated-name> to write into a different database, or');
      console.error('  c) re-run with --allow-mixed if you really want to share the database.');
      await src.close();
      await dst.close();
      process.exit(2);
    }
    console.log('   --allow-mixed given: continuing.');
    console.log('');
  }

  let totalCopied = 0;
  for (const name of SOURCE_COLLECTIONS) {
    if (!srcCols.includes(name)) {
      console.log(`- ${name.padEnd(14)} skipped (not in source)`);
      continue;
    }

    const docs = await srcDb.collection(name).find({}).toArray();
    const indexes = await srcDb.collection(name).indexes();

    if (!CONFIRM) {
      console.log(`- ${name.padEnd(14)} would copy ${docs.length} document(s)` +
        (indexes.length ? `, ${indexes.length - 1} index(es)` : ''));
      totalCopied += docs.length;
      continue;
    }

    let inserted = 0;
    let skipped = 0;
    for (const doc of docs) {
      try {
        await dstDb.collection(name).insertOne(doc);
        inserted++;
      } catch (err) {
        if (err.code === 11000) skipped++;
        else throw err;
      }
    }

    // Recreate secondary indexes (skip the default _id index)
    for (const idx of indexes) {
      if (idx.name === '_id_') continue;
      try {
        await dstDb.collection(name).createIndex(idx.key, { name: idx.name, ...(idx.unique ? { unique: true } : {}), ...(idx.sparse ? { sparse: true } : {}) });
      } catch (err) {
        console.log(`    index ${idx.name}: ${err.code || err.message}`);
      }
    }

    console.log(`- ${name.padEnd(14)} copied ${inserted}, skipped ${skipped} duplicate(s)` +
      (indexes.length > 1 ? `, ${indexes.length - 1} index(es)` : ''));
    totalCopied += inserted;
  }

  console.log('');
  console.log(CONFIRM
    ? `Done. ${totalCopied} document(s) written to ${targetDb} on Atlas.`
    : `Dry run complete. ${totalCopied} document(s) would be copied. Re-run with --confirm to apply.`);

  await src.close();
  await dst.close();
})().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});