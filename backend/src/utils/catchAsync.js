/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * next(err) instead of crashing the process / hanging the request.
 */
module.exports = function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
