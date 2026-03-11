import { pool } from './config/db';
import fs from 'fs';
import path from 'path';

const seedDatabase = async () => {
  try {
    const seedSQL = fs.readFileSync(path.join(__dirname, '../seed.sql'), 'utf-8');
    const statements = seedSQL.split(';').filter(stmt => stmt.trim());

    console.log('🌱 Seeding database...');

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    // Get actual counts
    const [subjects]: any = await pool.query('SELECT COUNT(*) as count FROM subjects');
    const [sections]: any = await pool.query('SELECT COUNT(*) as count FROM sections');
    const [videos]: any = await pool.query('SELECT COUNT(*) as count FROM videos');

    console.log('✅ Database seeded successfully');
    console.log('📊 Sample data added:');
    console.log(`   - ${subjects[0].count} Subjects`);
    console.log(`   - ${sections[0].count} Sections`);
    console.log(`   - ${videos[0].count} Videos`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
