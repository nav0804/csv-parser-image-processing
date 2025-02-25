const dotenv = require('dotenv');

dotenv.config();

const config = {
  DB_URL: process.env.DB_URL || '',
};

if (!config.DB_URL) {
  console.error('Environment Variables Not Configured.');
  process.exit(1);
}

module.exports = config;
