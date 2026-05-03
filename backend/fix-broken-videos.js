require('dotenv').config();
const mysql = require('mysql2/promise');

// 100% freeCodeCamp videos — embedding always allowed
const fixes = [
  { id: 69,  youtube_id: 'ulprqHHWlng', title: 'AWS EBS and Storage Tutorial' },
  { id: 72,  youtube_id: 'M988_fsOSWo', title: 'AWS Auto Scaling Tutorial' },
  { id: 78,  youtube_id: 'TNhaISOUy6Q', title: 'React Native Styling Tutorial' },
  { id: 81,  youtube_id: 'CfdGIZkYwEU', title: 'React Native Testing Tutorial' },
  { id: 116, youtube_id: 'MrutJMWxMgE', title: 'Usability Testing Tutorial' },
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, ssl: { rejectUnauthorized: false }
  });

  for (const f of fixes) {
    const [r] = await conn.execute('UPDATE videos SET youtube_id=? WHERE id=?', [f.youtube_id, f.id]);
    console.log(r.affectedRows > 0 ? `✅ ${f.id} → ${f.youtube_id}` : `❌ ${f.id} not found`);
  }

  // Final verify
  const https = require('https');
  function checkEmbed(vid) {
    return new Promise(res => {
      https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`,
        r => res(r.statusCode === 200)).on('error', () => res(false));
    });
  }

  console.log('\nVerifying...');
  for (const f of fixes) {
    const ok = await checkEmbed(f.youtube_id);
    console.log(`${ok ? '✅' : '❌'} ${f.id} | ${f.youtube_id} | ${f.title}`);
  }

  await conn.end();
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
