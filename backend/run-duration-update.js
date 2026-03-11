const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function updateAllDurations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync('./update-all-durations.sql', 'utf8');
    await connection.query(sql);
    console.log('✓ All video durations updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateAllDurations();
