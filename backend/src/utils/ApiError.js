/**
 * Operational error used throughout the app for anything that should be
 * reported to the client with a specific status code (validation failures,
 * "not found", business-rule violations, etc.) as opposed to unexpected
 * programmer errors/bugs.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
