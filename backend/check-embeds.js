require('dotenv').config();
const https = require('https');
const mysql = require('mysql2/promise');

function checkEmbed(videoId) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    https.get(url, (res) => resolve(res.statusCode === 200)).on('error', () => resolve(false));
  });
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, ssl: { rejectUnauthorized: false }
  });

  const [rows] = await conn.execute('SELECT id, youtube_id, title FROM videos ORDER BY id');
  console.log(`Checking ${rows.length} videos...\n`);

  const broken = [];
  for (const v of rows) {
    const ok = await checkEmbed(v.youtube_id);
    if (!ok) { broken.push(v); console.log(`❌ ${v.id} | ${v.youtube_id} | ${v.title}`); }
    else process.stdout.write(`✅${v.id} `);
  }

  console.log(`\n\nBroken: ${broken.length}`);
  await conn.end();
}
main().catch(e => { console.error(e); process.exit(1); });
