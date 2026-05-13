import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function resetDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'plant_app'
  });

  try {
    console.log('Dropping plants table to upgrade schema...');
    await connection.query('DROP TABLE IF EXISTS plants');
    console.log('Plants table dropped successfully.');

    console.log('Dropping users table...');
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('Users table dropped successfully.');

  } catch (err) {
    console.error('Error resetting database:', err.message);
  } finally {
    await connection.end();
    console.log('Database connection closed. Now restart your server.');
  }
}

resetDB();
