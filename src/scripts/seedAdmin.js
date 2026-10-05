/**
 * Seeds (or rotates) the single admin account.
 *
 * Credentials come exclusively from backend/.env:
 *   ADMIN_USERNAME  required
 *   ADMIN_PASSWORD  required, hashed with bcrypt (cost 12) before storage
 *
 * There is no default username, no default password and no hard-coded value
 * anywhere in this file. If either variable is missing the script refuses to
 * run so a weak credential can never be written to the database by accident.
 */
const { config } = require('../config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function seedAdmin() {
  let username;
  let password;

  try {
    username = config.admin.username;
    password = config.admin.password;
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  // Cheap guard against a placeholder still sitting in .env.example
  const looksLikePlaceholder = /^(your-|change|replace|todo)/i.test(password);

  if (password.length < 12 || looksLikePlaceholder) {
    console.error(
      'Refusing to seed: ADMIN_PASSWORD must be at least 12 characters and not a placeholder value.'
    );
    process.exit(1);
  }

  const mongoUri = config.mongoUri;
  const normalizedUsername = username.toLowerCase().trim();

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for admin seeding.');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.findOneAndUpdate(
      { username: normalizedUsername },
      {
        username: normalizedUsername,
        passwordHash
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // The password itself is never echoed back.
    console.log(`Admin user "${admin.username}" seeded/updated successfully.`);
  } catch (error) {
    console.error('Failed to seed admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedAdmin();
