const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

function getTokenFromHeader(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Requires a valid token; rejects the request otherwise. */
const protect = catchAsync(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) throw new ApiError(401, 'Authentication required.');

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'User no longer exists.');

  req.user = user;
  next();
});

/**
 * Attaches req.user when a valid token is present, but never rejects the
 * request — used on public-but-personalizable routes like the competition
 * details GET, which should work for anonymous visitors too.
 */
const attachUserIfPresent = catchAsync(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch (err) {
    // Invalid/expired token on an optional-auth route: treat as anonymous.
  }
  next();
});

module.exports = { protect, attachUserIfPresent };
