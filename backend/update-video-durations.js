const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Get from https://console.cloud.google.com

async function updateVideoDurations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [videos] = await connection.query('SELECT id, youtube_id FROM videos');
    
    for (const video of videos) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos?id=${video.youtube_id}&part=contentDetails&key=${YOUTUBE_API_KEY}`
        );
        
        if (response.data.items && response.data.items.length > 0) {
          const duration = response.data.items[0].contentDetails.duration;
          const seconds = parseISO8601Duration(duration);
          
          await connection.query('UPDATE videos SET duration = ? WHERE id = ?', [seconds, video.id]);
          console.log(`Updated video ${video.id} (${video.youtube_id}): ${seconds}s`);
        }
      } catch (error) {
        console.error(`Failed to update video ${video.youtube_id}:`, error.message);
      }
    }
    
    console.log('All durations updated!');
  } finally {
    await connection.end();
  }
}

function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

updateVideoDurations();
