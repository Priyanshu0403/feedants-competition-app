require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(
      `[config] Warning: environment variable ${key} is not set. Falling back to an insecure default — do not use this in production.`
    );
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedants',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  reservationWindowMinutes: Number(process.env.RESERVATION_WINDOW_MINUTES) || 10,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 25,
};
