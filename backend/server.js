import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { MVP_PLANTS } from './plantRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'database.db');

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`);

    // Create Plants Table with scientific attributes
    db.run(`CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price TEXT NOT NULL,
      location TEXT NOT NULL,
      image TEXT NOT NULL,
      space_tag TEXT NOT NULL,
      sunlight_need TEXT NOT NULL,
      min_temp INTEGER DEFAULT 10,
      max_temp INTEGER DEFAULT 35,
      purification_score INTEGER DEFAULT 5,
      is_sold INTEGER DEFAULT 0,
      buyer_id TEXT
    )`, (err) => {
      if (!err) {
        // Seed initial data if table is empty
        db.get('SELECT COUNT(*) as count FROM plants', (err, row) => {
          if (row && row.count === 0) {
            const stmt = db.prepare('INSERT INTO plants (name, type, price, location, image, space_tag, sunlight_need, min_temp, max_temp, purification_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            
            MVP_PLANTS.forEach(plant => {
              stmt.run([
                plant.name, 
                plant.type, 
                plant.price, 
                plant.location, 
                plant.image, 
                plant.space_tag, 
                plant.sunlight_need, 
                plant.min_temp, 
                plant.max_temp, 
                plant.purification_score
              ]);
            });
            
            stmt.finalize();
            console.log('MVP seed plants added to database.');
          }
        });
      }
    });
  }
});

// Helper for DB queries using Promises
const dbGet = (query, params) => new Promise((resolve, reject) => {
  db.get(query, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbRun = (query, params) => new Promise((resolve, reject) => {
  db.run(query, params, function(err) {
    err ? reject(err) : resolve(this);
  });
});

const dbAll = (query, params) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
});

// Helper for fetching weather data (Monthly Average)
async function getMonthlyAverage(city) {
  try {
    const API_KEY = 'TFWSDCS3ZFEDCCJUHYLQHR7GD'; 
    const month = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    
    // We fetch statistical averages for the current month
    // Format: https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/[location]/[date1]/[date2]
    // Using a sample date range for the current month
    const date1 = `${currentYear}-${month.toString().padStart(2, '0')}-01`;
    const date2 = `${currentYear}-${month.toString().padStart(2, '0')}-28`;
    
    console.log(`Fetching climatology for ${city} in month ${month}...`);
    
    // For development, if no API key, return a reasonable default based on Nepal geography
    if (API_KEY === 'YOUR_VISUAL_CROSSING_KEY') {
      console.warn('No Visual Crossing API Key found. Using Nepal-specific fallbacks.');
      const nepalClimates = {
        'kathmandu': 22,
        'pokhara': 24,
        'biratnagar': 30,
        'mustang': 12,
        'chitwan': 28,
        'namche': 8
      };
      return nepalClimates[city.toLowerCase()] || 20;
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${date1}/${date2}?unitGroup=metric&include=stats&key=${API_KEY}&contentType=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Return the average temperature for the period
    return data.currentConditions?.temp || data.days[0]?.temp || 20;
  } catch (error) {
    console.error('Weather API Error:', error);
    return 20; // Default safe temp
  }
}

// --- User Endpoints ---

app.post('/api/verify-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    res.json({ success: true, message: 'Password verified' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasAlphaNumeric = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    if (password.length < 6 || !hasSpecialChar || !hasAlphaNumeric) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long, contain both letters and numbers, and include at least one special character.' });
    }

    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) return res.status(400).json({ error: 'Email is already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { id: Date.now().toString(), fullName, email, password: hashedPassword, createdAt: new Date().toISOString() };
    await dbRun('INSERT INTO users (id, fullName, email, password, createdAt) VALUES (?, ?, ?, ?, ?)', [newUser.id, newUser.fullName, newUser.email, newUser.password, newUser.createdAt]);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'try again' });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Marketplace Endpoints ---

// Get all available plants
app.get('/api/plants', async (req, res) => {
  try {
    const plants = await dbAll('SELECT * FROM plants WHERE is_sold = 0');
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// Recommend plants based on space, sunlight, and temperature
app.get('/api/recommend', async (req, res) => {
  try {
    const { space, sunlight, location } = req.query;
    let query = 'SELECT * FROM plants WHERE is_sold = 0';
    const params = [];

    if (space) {
      query += ' AND space_tag LIKE ?';
      params.push(`%${space}%`);
    }
    if (sunlight) {
      // Inclusive matching: plants that need LESS than or equal to the available light
      query += ' AND sunlight_need <= ?';
      params.push(sunlight);
    }
    
    // If location is provided, fetch the real climatology data
    if (location) {
      const avgTemp = await getMonthlyAverage(location);
      console.log(`Climatology Match: ${location} Avg Temp = ${avgTemp}°C`);
      query += ' AND ? BETWEEN min_temp AND max_temp';
      params.push(avgTemp);
    }

    const plants = await dbAll(query, params);
    res.json(plants);
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ error: 'Recommendation failed' });
  }
});

// Buy a plant
app.post('/api/plants/:id/buy', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const plant = await dbGet('SELECT * FROM plants WHERE id = ?', [id]);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    if (plant.is_sold) return res.status(400).json({ error: 'Plant already sold' });

    await dbRun('UPDATE plants SET is_sold = 1, buyer_id = ? WHERE id = ?', [userId, id]);
    res.json({ message: 'Plant purchased successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Get plants owned by a specific user
app.get('/api/users/:userId/plants', async (req, res) => {
  try {
    const { userId } = req.params;
    const plants = await dbAll('SELECT * FROM plants WHERE buyer_id = ?', [userId]);
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch owned plants' });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api/plants`);
  console.log(`=========================================`);
});
