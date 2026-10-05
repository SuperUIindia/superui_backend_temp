/**
 * Syncs every section in DEFAULT_SECTIONS into the sitecontents collection.
 *
 *   node scripts/syncSectionsToDb.js            # add missing sections only
 *   node scripts/syncSectionsToDb.js --reset-seeded
 *   node scripts/syncSectionsToDb.js --force    # overwrite everything
 *
 * Sections already edited through the admin dashboard are preserved unless
 * --force is passed, so this is safe to re-run after adding a new section.
 * --reset-seeded is narrower: it refreshes only sections that were written by
 * the auto-seeder and never touched by a person, which is how stale default
 * copy from an older release gets refreshed without losing real edits.
 */
const { config } = require('../src/config/env');
const mongoose = require('mongoose');
const SiteContent = require('../src/models/SiteContent');
const { DEFAULT_SECTIONS } = require('../src/utils/defaultContent');

const FORCE = process.argv.includes('--force');
const RESET_SEEDED = process.argv.includes('--reset-seeded');
// Values written by this script or the route auto-seeder, never by an admin.
const SEED_AUTHORS = new Set(['system-seed', 'system', 'default-sync', 'undefined', '']);

(async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 20000 });
  console.log(`connected -> ${mongoose.connection.name}`);
  console.log(
    `mode      -> ${
      FORCE
        ? 'overwrite all sections'
        : RESET_SEEDED
          ? 'refresh never-edited sections, add missing ones'
          : 'insert missing sections only'
    }\n`
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const [rawKey, spec] of Object.entries(DEFAULT_SECTIONS)) {
    // The model lowercases keys, so normalise before querying.
    const key = rawKey.toLowerCase();
    const existing = await SiteContent.findOne({ key }).lean();
    const wasSeedOnly = existing && SEED_AUTHORS.has(existing.lastUpdatedBy);

    if (!existing) {
      await SiteContent.create({
        key,
        title: spec.title,
        description: spec.description,
        data: spec.data,
        lastUpdatedBy: 'default-sync'
      });
      created++;
      console.log(`  CREATED  ${key}`);
      continue;
    }

    if (FORCE || (RESET_SEEDED && wasSeedOnly)) {
      await SiteContent.updateOne(
        { key },
        {
          $set: {
            title: spec.title,
            description: spec.description,
            data: spec.data,
            lastUpdatedBy: 'default-sync',
            updatedAt: new Date()
          }
        }
      );
      updated++;
      console.log(`  UPDATED  ${key}  (was ${wasSeedOnly ? 'auto-seeded, never edited' : 'forced overwrite'})`);
    } else {
      skipped++;
      console.log(`  kept     ${key} (last edited by "${existing.lastUpdatedBy || 'unknown'}")`);
    }
  }

  // Report sections in Mongo that are no longer registered as defaults.
  const registered = new Set(Object.keys(DEFAULT_SECTIONS).map((k) => k.toLowerCase()));
  const orphans = (await SiteContent.find().lean()).filter((d) => !registered.has(d.key));
  if (orphans.length) {
    console.log(`\ncustom sections (not in DEFAULT_SECTIONS, left untouched):`);
    orphans.forEach((o) => console.log(`  ${o.key} (edited by "${o.lastUpdatedBy || 'unknown'}")`));
  }

  console.log(
    `\ndone: ${created} created, ${updated} updated, ${skipped} kept` +
      (orphans.length ? `, ${orphans.length} custom section(s) preserved` : '')
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});