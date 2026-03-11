const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateStarterCode() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Updating starter code for all problems...');
    
    await conn.query(`
      UPDATE coding_problems 
      SET starter_code_java = 'class Solution {\n    // Write your code here\n}'
      WHERE starter_code_java IS NULL OR starter_code_java = ''
    `);
    
    console.log('✓ Starter code updated');
    
    const [rows] = await conn.query('SELECT id, title, starter_code_js FROM coding_problems LIMIT 3');
    console.log('\nSample problems:');
    rows.forEach(r => console.log(`  ${r.id}. ${r.title}: ${r.starter_code_js ? 'Has code' : 'Empty'}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

updateStarterCode();
