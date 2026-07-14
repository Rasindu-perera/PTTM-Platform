const { Pool } = require('pg');
require('dotenv').config();

// Enforce that DATABASE_URL must be provided via .env
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from the .env file.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
