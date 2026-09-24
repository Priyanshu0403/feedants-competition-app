const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const config = require('../config/env');
const { registerSchema, loginSchema } = require('../validators/authValidators');

function issueToken(user) {
  return jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

const register = catchAsync(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = issueToken(user);
  success(res, 201, { token, user: user.toPublicJSON() });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid email or password.');

  const token = issueToken(user);
  success(res, 200, { token, user: user.toPublicJSON() });
});

const me = catchAsync(async (req, res) => {
  success(res, 200, { user: req.user.toPublicJSON() });
});

module.exports = { register, login, me };
