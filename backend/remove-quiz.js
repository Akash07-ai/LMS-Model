const mysql = require('mysql2/promise');
require('dotenv').config();

async function removeQuizTables() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Dropping quiz tables...');
    await conn.query('DROP TABLE IF EXISTS quiz_attempts');
    await conn.query('DROP TABLE IF EXISTS quiz_questions');
    console.log('✓ Quiz tables removed from database');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

removeQuizTables();
