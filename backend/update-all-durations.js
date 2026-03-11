const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

const YOUTUBE_API_KEY = 'AIzaSyDUme2hXtX-RYlVwKs_Zt5eFYqVzYqBXnY'; // Replace with your API key from https://console.cloud.google.com

async function updateAllDurations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [videos] = await connection.query('SELECT id, title, youtube_id FROM videos ORDER BY id');
    
    console.log(`Found ${videos.length} videos to update...\n`);
    
    // Process in batches of 50 (YouTube API limit)
    for (let i = 0; i < videos.length; i += 50) {
      const batch = videos.slice(i, i + 50);
      const videoIds = batch.map(v => v.youtube_id).join(',');
      
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=contentDetails&key=${YOUTUBE_API_KEY}`
        );
        
        if (response.data.items) {
          for (const item of response.data.items) {
            const video = batch.find(v => v.youtube_id === item.id);
            if (video) {
              const duration = parseISO8601Duration(item.contentDetails.duration);
              await connection.query('UPDATE videos SET duration = ? WHERE id = ?', [duration, video.id]);
              console.log(`✓ ${video.title}: ${formatDuration(duration)}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing batch: ${error.message}`);
      }
      
      // Wait 1 second between batches to avoid rate limiting
      if (i + 50 < videos.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n✓ All video durations updated successfully!');
  } catch (error) {
    console.error('Error:', error.message);
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

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

updateAllDurations();
