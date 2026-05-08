import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  console.log('Dropping plants table to upgrade schema...');
  db.run('DROP TABLE IF EXISTS plants', (err) => {
    if (err) console.error('Error dropping table:', err.message);
    else console.log('Plants table dropped successfully.');
  });
});

db.close((err) => {
  if (err) console.error(err.message);
  else console.log('Database connection closed. Now restart your server.');
});
