const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode;
  let message = err.message;

  if (err.name === 'ValidationError' && err.errors) {
    // Mongoose schema validation error
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for field(s): ${field}`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${err.value}`;
  }

  statusCode = statusCode || 500;
  message = message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);
    if (!err.isOperational) {
      // eslint-disable-next-line no-console
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details || undefined,
  });
}

module.exports = { notFound, errorHandler };
