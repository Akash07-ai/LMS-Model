import { pool } from './config/db';
import fs from 'fs';
import path from 'path';

const initDatabase = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
