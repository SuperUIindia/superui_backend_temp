const { config, validateStartupEnv, describe } = require('./config/env');
const { connectDb, disconnectDb } = require('./config/db');
const app = require('./app');

// Validate all required environment variables fail-fast before binding
validateStartupEnv();

let server = null;

async function startServer() {
  try {
    // Connect to MongoDB with retries
    await connectDb();

    server = app.listen(config.port, () => {
      console.log(`\n-----------------------------------------------------`);
      console.log(`${config.brandName} API Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Client URL:  ${config.clientUrl}`);
      console.log(`API Ready:   http://localhost:${config.port}/api/health`);
      console.log(`-----------------------------------------------------\n`);
      console.log('Runtime configuration summary:', describe());
    });

    return server;
  } catch (err) {
    console.error('[Server Fatal] Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function handleShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed to new connections.');
      try {
        await disconnectDb();
        console.log('[Shutdown] Cleanup complete. Exiting.');
        process.exit(0);
      } catch (err) {
        console.error('[Shutdown Error] Error during DB disconnect:', err);
        process.exit(1);
      }
    });

    // Force close after 10 seconds if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[Shutdown Timeout] Forcefully terminating process.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

if (config.nodeEnv !== 'test') {
  startServer();
}

module.exports = { app, startServer };
