const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const ApiError = require('./utils/ApiError');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// 1. helmet() — security headers
app.use(helmet());

// 2. cors()
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// 3. express-rate-limit — 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. express.json
app.use(express.json({ limit: '10mb' }));

// 5. express.urlencoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Workaround for express-mongo-sanitize compatibility with Express 5+
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

// 7. hpp()
app.use(hpp());

// 8. morgan('dev') — only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
  });
});

// 404 Handler for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global error handler middleware
app.use(errorHandler);

module.exports = app;
