import { pool } from './config/db';
import fs from 'fs';
import path from 'path';

const resetDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('🗑️  Clearing existing data...');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE video_progress');
    await connection.query('TRUNCATE TABLE videos');
    await connection.query('TRUNCATE TABLE sections');
    await connection.query('TRUNCATE TABLE subjects');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Data cleared');
    console.log('🔧 Checking and updating schema...');
    
    // Add concept column to videos table if it doesn't exist
    try {
      await connection.query('ALTER TABLE videos ADD COLUMN concept TEXT AFTER duration');
      console.log('✅ Added concept column to videos table');
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Concept column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('🌱 Seeding database...');

    const seedSQL = fs.readFileSync(path.join(__dirname, '../seed.sql'), 'utf-8');
    const statements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      await connection.query(statement);
    }

    const [subjects]: any = await connection.query('SELECT COUNT(*) as count FROM subjects');
    const [sections]: any = await connection.query('SELECT COUNT(*) as count FROM sections');
    const [videos]: any = await connection.query('SELECT COUNT(*) as count FROM videos');

    console.log('✅ Database seeded successfully');
    console.log('📊 Data added:');
    console.log(`   - ${subjects[0].count} Subjects`);
    console.log(`   - ${sections[0].count} Sections`);
    console.log(`   - ${videos[0].count} Videos`);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    connection.release();
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

resetDatabase();
