import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { MVP_PLANTS } from './plantRules.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'plant_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// In-memory store for payment sessions (for simplicity in MVP)
const paymentSessions = new Map();

// Helper for DB queries using Promises
const dbGet = async (query, params) => {
  const [rows] = await pool.execute(query, params);
  return rows[0];
};

const dbRun = async (query, params) => {
  const [result] = await pool.execute(query, params);
  return result;
};

const dbAll = async (query, params) => {
  const [rows] = await pool.execute(query, params);
  return rows;
};

// Initialize Database Schema
async function initDB() {
  try {
    // Create Users Table
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      createdAt VARCHAR(255) NOT NULL
    )`);

    // Create Plants Table
    await pool.query(`CREATE TABLE IF NOT EXISTS plants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      price VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      space_tag VARCHAR(255) NOT NULL,
      sunlight_need VARCHAR(50) NOT NULL,
      min_temp INT DEFAULT 10,
      max_temp INT DEFAULT 35,
      purification_score INT DEFAULT 5,
      is_sold TINYINT(1) DEFAULT 0,
      buyer_id VARCHAR(255)
    )`);

    // Seed initial data if table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM plants');
    if (rows[0].count === 0) {
      console.log('Seeding initial plant data...');
      const insertQuery = 'INSERT INTO plants (name, type, price, location, image, space_tag, sunlight_need, min_temp, max_temp, purification_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      
      for (const plant of MVP_PLANTS) {
        await pool.execute(insertQuery, [
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
      }
      console.log('MVP seed plants added to database.');
    }
    console.log('Connected to MySQL and schema verified.');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

initDB();

// Helper for fetching weather data (Monthly Average)
async function getMonthlyAverage(city) {
  try {
    const API_KEY = 'TFWSDCS3ZFEDCCJUHYLQHR7GD'; 
    const month = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    
    const date1 = `${currentYear}-${month.toString().padStart(2, '0')}-01`;
    const date2 = `${currentYear}-${month.toString().padStart(2, '0')}-28`;
    
    const cleanCity = (city || 'Kathmandu').split(',')[0].trim();
    
    if (API_KEY === 'YOUR_VISUAL_CROSSING_KEY') {
      const nepalClimates = { 'kathmandu': 22, 'pokhara': 24, 'biratnagar': 30, 'mustang': 12, 'chitwan': 28, 'namche': 8 };
      return nepalClimates[cleanCity.toLowerCase()] || 20;
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(cleanCity)}/${date1}/${date2}?unitGroup=metric&include=stats&key=${API_KEY}&contentType=json`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
    
    const data = await response.json();
    return data.currentConditions?.temp || data.days?.[0]?.temp || 20;
  } catch (error) {
    console.error('Weather API Error:', error.message);
    return 22; // Default safe temp for recommendations
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

app.get('/api/plants', async (req, res) => {
  try {
    const plants = await dbAll('SELECT * FROM plants WHERE is_sold = 0');
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

/**
 * SMART RECOMMENDATION SYSTEM
 * Connects 3 User Inputs (Location, Space, Light) to 45+ Plants
 */
app.get('/api/recommend', async (req, res) => {
  try {
    const { space, sunlight, location } = req.query;
    
    // 1. Fetch Temperature based on Location
    const detectedTemp = await getMonthlyAverage(location);
    
    // 2. Build Dynamic Query to match arrangements
    // Filters plants where is_sold=0 AND matches climate AND matches space AND matches light
    let query = 'SELECT * FROM plants WHERE is_sold = 0';
    const params = [];

    // Arrangement Logic: Space Match (Partial string match in space_tag)
    if (space && space !== 'Any') {
      query += ' AND LOWER(space_tag) LIKE ?';
      params.push(`%${space.toLowerCase()}%`);
    }

    // Arrangement Logic: Light Match (Sunlight need is stored as 1, 2, 3)
    if (sunlight && sunlight !== 'Any') {
      const lightMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
      const lightVal = lightMap[sunlight] || sunlight;
      query += ' AND CAST(sunlight_need AS UNSIGNED) <= ?';
      params.push(lightVal);
    }

    // Arrangement Logic: Climate Match
    query += ' AND ? BETWEEN min_temp AND max_temp';
    params.push(Math.round(detectedTemp));

    console.log(`QUERYING RECOMMENDATIONS: Space=${space}, Light=${sunlight}, Temp=${detectedTemp}`);
    
    let plants = await dbAll(query, params);

    // Dynamic Fallback: If exact arrangement yields no results, relax the climate constraint
    let fallbackUsed = false;
    if (plants.length === 0) {
      console.log('RELAXING CLIMATE CONSTRAINT FOR ARRANGEMENTS');
      const fallbackQuery = 'SELECT * FROM plants WHERE is_sold = 0 AND LOWER(space_tag) LIKE ? AND CAST(sunlight_need AS UNSIGNED) <= ?';
      plants = await dbAll(fallbackQuery, params.slice(0, 2));
      fallbackUsed = true;
    }

    res.json({
      summary: {
        location: location || 'Kathmandu',
        averageTemp: `${Math.round(detectedTemp)}°C`,
        space: space || 'Indoor',
        sunlight: sunlight || 'Medium',
        note: fallbackUsed ? "Climate threshold relaxed to find suitable arrangements." : "Found perfect environmental matches."
      },
      plants: plants
    });
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to generate plant arrangements' });
  }
});

app.post('/api/plants/:id/buy', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, quantity = 1 } = req.body;

    const plant = await dbGet('SELECT * FROM plants WHERE id = ?', [id]);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    
    await dbRun('UPDATE plants SET is_sold = 1, buyer_id = ? WHERE id = ?', [userId, id]);

    if (quantity > 1) {
      const insertQuery = 'INSERT INTO plants (name, type, price, location, image, space_tag, sunlight_need, min_temp, max_temp, purification_score, is_sold, buyer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)';
      for (let i = 1; i < quantity; i++) {
        await pool.execute(insertQuery, [plant.name, plant.type, plant.price, plant.location, plant.image, plant.space_tag, plant.sunlight_need, plant.min_temp, plant.max_temp, plant.purification_score, userId]);
      }
    }

    res.json({ message: `Success` });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// --- Payment Endpoints ---

app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { plantId, userId, quantity, amount } = req.body;
    
    // Fetch plant name for the bill
    const plant = await dbGet('SELECT name FROM plants WHERE id = ?', [plantId]);
    const plantName = plant ? plant.name : 'Plant';

    const sessionId = `PAY-${Date.now()}`;
    paymentSessions.set(sessionId, { 
      id: sessionId, 
      plantId, 
      plantName,
      userId, 
      quantity, 
      amount, 
      status: 'pending', 
      createdAt: new Date() 
    });
    res.json({ sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

app.get('/api/payment/status/:sessionId', (req, res) => {
  const session = paymentSessions.get(req.params.sessionId);
  res.json({ status: session?.status || 'expired' });
});

app.get('/api/payment/bill/:sessionId', (req, res) => {
  res.json(paymentSessions.get(req.params.sessionId));
});

app.post('/api/payment/complete/:sessionId', (req, res) => {
  const session = paymentSessions.get(req.params.sessionId);
  if (session) {
    session.status = 'completed';
    paymentSessions.set(req.params.sessionId, session);
  }
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER RUNNING ON ALL INTERFACES: http://192.168.23.42:${PORT}`);
});
