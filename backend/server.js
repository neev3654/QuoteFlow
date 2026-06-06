require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');
const logger = require('./src/config/logger');
const { verifyEmailConnection } = require('./src/config/email');


// Handle uncaughtException
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  if (err.stack) {
    logger.error(err.stack);
  }
  process.exit(1);
});

let server;

// Connect to Database
connectDB().then(() => {
  // Verify email connection
  verifyEmailConnection();

  const port = process.env.PORT || 5000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  server = app.listen(port, () => {
    logger.info(`QuoteFlow server running on port ${port} in ${nodeEnv} mode`);
  });
});

// Handle unhandledRejection
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  if (err.stack) {
    logger.error(err.stack);
  }
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
