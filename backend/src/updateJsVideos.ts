import { pool } from './config/db';

const updateJavaScriptVideos = async () => {
  try {
    console.log('🔄 Updating JavaScript videos...');

    const updates = [
      // Section 1 - Introduction to JavaScript
      {
        old_title: 'What is JavaScript?',
        title: 'JavaScript Crash Course for Beginners',
        youtube_id: 'PkZNo7MFNFg',
        duration: 4980
      },
      {
        old_title: 'JavaScript Variables',
        title: 'JavaScript Variables & Data Types',
        youtube_id: 'edlFjlzxkSI',
        duration: 780
      },
      {
        old_title: 'JavaScript Functions',
        title: 'JavaScript Functions Tutorial',
        youtube_id: 'N8ap4k_1QEQ',
        duration: 2940
      },
      // Section 2 - Advanced JavaScript
      {
        old_title: 'Advanced Functions',
        title: 'JavaScript Higher Order Functions',
        youtube_id: 'rRgD1yVwIvE',
        duration: 1560
      },
      {
        old_title: 'Closures and Scope',
        title: 'JavaScript Closures Explained',
        youtube_id: '3a0I8ICR1Vg',
        duration: 660
      },
      {
        old_title: 'Async JavaScript',
        title: 'Async JavaScript - Callbacks Promises Async Await',
        youtube_id: 'PoRJizFvM7s',
        duration: 2520
      },
      // Section 3 - JavaScript Projects
      {
        old_title: 'Build a Calculator',
        title: 'Build a Calculator with JavaScript',
        youtube_id: 'j59qQ7YWLxw',
        duration: 2640
      },
      {
        old_title: 'Todo App Project',
        title: 'JavaScript Todo List App',
        youtube_id: 'G0jO8kUrg-I',
        duration: 3120
      },
      {
        old_title: 'Weather App',
        title: 'Build a Weather App with JavaScript',
        youtube_id: 'MIYQR-Ybrn4',
        duration: 3600
      },
    ];

    for (const v of updates) {
      const [result]: any = await pool.query(
        `UPDATE videos SET title = ?, youtube_id = ?, duration = ? WHERE title = ?`,
        [v.title, v.youtube_id, v.duration, v.old_title]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Updated: "${v.old_title}" → "${v.title}" | ${v.youtube_id} | ${v.duration}s`);
      } else {
        console.log(`⚠️  Not found in DB: "${v.old_title}" — trying partial match...`);
        const [result2]: any = await pool.query(
          `UPDATE videos SET title = ?, youtube_id = ?, duration = ? WHERE title LIKE ?`,
          [v.title, v.youtube_id, v.duration, `%${v.old_title}%`]
        );
        if (result2.affectedRows > 0) {
          console.log(`✅ Partial match updated: "${v.old_title}"`);
        } else {
          console.log(`❌ Could not find: "${v.old_title}"`);
        }
      }
    }

    // Show final state
    const [videos]: any = await pool.query(
      `SELECT v.title, v.youtube_id, v.duration, sec.title as section
       FROM videos v
       JOIN sections sec ON v.section_id = sec.id
       JOIN subjects sub ON sec.subject_id = sub.id
       WHERE sub.title = 'JavaScript Fundamentals'
       ORDER BY sec.display_order, v.display_order`
    );

    console.log('\n📋 Final JavaScript videos in DB:');
    videos.forEach((v: any) => {
      const m = Math.floor(v.duration / 60);
      const s = v.duration % 60;
      console.log(`  [${v.section}] ${v.title} | ${v.youtube_id} | ${m}:${String(s).padStart(2,'0')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
};

updateJavaScriptVideos();
