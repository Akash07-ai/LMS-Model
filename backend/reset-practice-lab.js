const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function resetPracticeLab() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Dropping existing practice lab tables...');
    await connection.query(`
      DROP TABLE IF EXISTS coding_submissions;
      DROP TABLE IF EXISTS quiz_attempts;
      DROP TABLE IF EXISTS coding_problems;
      DROP TABLE IF EXISTS quiz_questions;
    `);
    console.log('✓ Old tables dropped');

    console.log('Creating practice lab tables...');
    const schema = fs.readFileSync('./schema-practice-lab.sql', 'utf8');
    await connection.query(schema);
    console.log('✓ Tables created');

    console.log('Seeding practice lab data...');
    const seed = fs.readFileSync('./seed-practice-lab.sql', 'utf8');
    await connection.query(seed);
    console.log('✓ Data seeded');

    console.log('\n✓ Practice Lab initialized successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

resetPracticeLab();
