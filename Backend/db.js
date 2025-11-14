// backend/db.js

const { Pool } = require('pg');
require('dotenv').config();

// Create the database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Check if the connection is successful
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to database:', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database! 🐘');
  client.release();
});

// Export the pool so other files can "borrow" it
module.exports = { pool };