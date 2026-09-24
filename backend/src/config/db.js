const mongoose = require('mongoose');
const config = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  // eslint-disable-next-line no-console
  console.log(`[db] Connected to MongoDB at ${config.mongoUri}`);

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('[db] MongoDB disconnected');
  });
}

module.exports = connectDB;
