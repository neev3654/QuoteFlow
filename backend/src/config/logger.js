const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, simple } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Error log file
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error'
    }),
    // Combined log file
    new transports.File({
      filename: path.join('logs', 'combined.log')
    })
  ]
});

// Console transport in development only
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), simple())
    })
  );
}

module.exports = logger;
