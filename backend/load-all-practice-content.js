const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function loadAllContent() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Clearing existing practice lab data...');
    await connection.query(`
      DELETE FROM coding_submissions;
      DELETE FROM quiz_attempts;
      DELETE FROM coding_problems;
      DELETE FROM quiz_questions;
    `);
    console.log('✓ Cleared');

    console.log('Loading 200 quiz questions...');
    const quizSql = fs.readFileSync('./seed-quiz-large.sql', 'utf8');
    await connection.query(quizSql);
    console.log('✓ Quiz questions loaded');

    console.log('Loading 50 coding problems...');
    const codingSql = fs.readFileSync('./seed-coding-large.sql', 'utf8');
    await connection.query(codingSql);
    console.log('✓ Coding problems loaded');

    console.log('\n✓ All content loaded successfully!');
    console.log('  - 200 Quiz Questions');
    console.log('  - 50 Coding Problems');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

loadAllContent();
