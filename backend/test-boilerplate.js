// Test script to verify boilerplate codes are in the database
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testBoilerplate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db'
  });

  try {
    console.log('Testing boilerplate codes...\n');
    
    // Get a problem with all fields
    const [problems] = await connection.execute(
      `SELECT id, title, starter_code_js, starter_code_python, starter_code_java FROM coding_problems LIMIT 1`
    );

    if (problems.length === 0) {
      console.log('❌ No problems found in database!');
      return;
    }

    const problem = problems[0];
    console.log(`Problem ID: ${problem.id}`);
    console.log(`Title: ${problem.title}\n`);

    console.log('JavaScript Boilerplate:');
    console.log(problem.starter_code_js ? problem.starter_code_js : '❌ NOT SET\n');

    console.log('Python Boilerplate:');
    console.log(problem.starter_code_python ? problem.starter_code_python : '❌ NOT SET\n');

    console.log('Java Boilerplate:');
    console.log(problem.starter_code_java ? problem.starter_code_java : '❌ NOT SET\n');

    // Check how many problems have boilerplate codes
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN starter_code_js IS NOT NULL THEN 1 ELSE 0 END) as js_count,
        SUM(CASE WHEN starter_code_python IS NOT NULL THEN 1 ELSE 0 END) as python_count,
        SUM(CASE WHEN starter_code_java IS NOT NULL THEN 1 ELSE 0 END) as java_count
      FROM coding_problems
    `);

    console.log('\n📊 Database Statistics:');
    console.log(`Total Problems: ${stats[0].total}`);
    console.log(`Problems with JS boilerplate: ${stats[0].js_count}`);
    console.log(`Problems with Python boilerplate: ${stats[0].python_count}`);
    console.log(`Problems with Java boilerplate: ${stats[0].java_count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testBoilerplate();
