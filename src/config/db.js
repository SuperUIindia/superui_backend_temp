const mongoose = require('mongoose');
const { config, redactMongoUri } = require('./env');

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 2000;

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Connects to MongoDB with retry backoff.
 * If connection fails after MAX_RETRIES, exits process cleanly so container restarts.
 */
async function connectDb() {
  const uri = config.mongoUri;
  const redactedUri = redactMongoUri(uri);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Database] Connecting to MongoDB (attempt ${attempt}/${MAX_RETRIES}) at: ${redactedUri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('[Database] MongoDB connection established successfully.');
      return mongoose.connection;
    } catch (err) {
      console.error(`[Database Error] Connection attempt ${attempt} failed: ${err.message}`);

      if (attempt === MAX_RETRIES) {
        console.error('[Database Fatal] Exhausted all connection retries to MongoDB. Terminating process for restart.');
        // Allow the process to exit with non-zero code so orchestrator/Render restarts it
        process.exit(1);
      }

      const delay = INITIAL_RETRY_DELAY_MS * attempt;
      console.log(`[Database] Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    console.log('[Database] Closing MongoDB connection...');
    await mongoose.connection.close(false);
    console.log('[Database] MongoDB connection closed.');
  }
}

module.exports = {
  connectDb,
  disconnectDb,
  isDbConnected
};

