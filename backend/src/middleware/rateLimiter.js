const rateLimit = require('express-rate-limit');

// Registration is the endpoint most exposed to abuse/bots trying to hoard
// limited spots, so it gets a tighter, dedicated limiter.
const registrationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts. Please slow down and try again shortly.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

module.exports = { registrationLimiter, authLimiter };
