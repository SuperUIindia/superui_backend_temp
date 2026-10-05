const { config } = require('../src/config/env');
const mongoose = require('mongoose');

const label = process.argv[2] || 'STATE';

(async () => {
  const c = await mongoose.createConnection(config.mongoUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  console.log(`=== ATLAS db "${c.name}" - ${label} ===`);
  let total = 0;
  for (const n of ['admins', 'leads', 'visits', 'clickevents', 'sitecontents', 'counters']) {
    const k = await c.db.collection(n).countDocuments();
    total += k;
    console.log(`  ${n.padEnd(14)}${String(k).padStart(5)}`);
  }
  console.log(`  ${'TOTAL'.padEnd(14)}${String(total).padStart(5)}`);
  console.log('  counters:', JSON.stringify(await c.db.collection('counters').find({}).toArray()));
  await c.close();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });