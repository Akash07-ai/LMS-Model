const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDuration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Update the first video duration to match YouTube (48:17 = 2897 seconds)
    await connection.query("UPDATE videos SET duration = 2897 WHERE youtube_id = 'W6NZfCO5SIk'");
    console.log('Duration updated successfully!');
  } finally {
    await connection.end();
  }
}

fixDuration();
