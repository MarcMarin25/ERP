const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool setup
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ddgnsdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initDb() {
  try {
    const conn = await pool.getConnection();
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS action_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id bigint(20) unsigned NULL,
        role VARCHAR(50) NULL,
        username VARCHAR(255) NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.query(createTableSql);
    console.log('Database tables verified/created successfully.');
    conn.release();
  } catch (err) {
    console.error('Failed to initialize database tables:', err.message);
  }
}
initDb();

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Test Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Passenger Registration Endpoint
app.post('/api/passengers/register', async (req, res) => {
  const { username, name, gender, birth_date, phone, email, region, province, city, barangay, address, password } = req.body;
  
  if (!username || !phone || !email || !password) {
    return res.status(400).json({ message: 'Missing required registration fields.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if phone or email or username already exists in users table
    const [existing] = await conn.query('SELECT id FROM users WHERE phone = ? OR email = ? OR username = ?', [phone, email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A user with this username, phone number, or email already exists.' });
    }

    // 1. Insert into users table
    const userSql = `
      INSERT INTO users (user_type_id, username, name, email, phone, gender, address, region, province, city, barangay, password, created_at, updated_at)
      VALUES (6, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [userResult] = await conn.query(userSql, [username, name, email, phone, gender, address, region, province, city, barangay, password]);
    const userId = userResult.insertId;

    // 2. Insert into user_passengers table (status_id = 1: active)
    const passengerSql = `
      INSERT INTO user_passengers (id, status_id, birth_date, created_at, updated_at)
      VALUES (?, 1, ?, NOW(), NOW())
    `;
    await conn.query(passengerSql, [userId, birth_date]);

    // Log passenger registration action
    const logSql = `
      INSERT INTO action_history (user_id, role, username, action, details, created_at)
      VALUES (?, 'passenger', ?, 'Register', 'Passenger registered successfully', NOW())
    `;
    await conn.query(logSql, [userId, username]);

    await conn.commit();
    res.status(201).json({ id: userId, username, name, phone, email, message: 'Passenger registered successfully!' });
  } catch (err) {
    await conn.rollback();
    console.error('Passenger registration error:', err);
    res.status(500).json({ message: 'Registration failed due to a database error.', error: err.message });
  } finally {
    conn.release();
  }
});

// Passenger Login Endpoint
app.post('/api/passengers/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone number and password are required.' });
  }

  try {
    const sql = `
      SELECT u.id, u.username, u.name, u.email, u.phone, u.gender, u.address, u.region, u.province, u.city, u.barangay, u.created_at, up.birth_date
      FROM users u
      JOIN user_passengers up ON u.id = up.id
      WHERE u.phone = ? AND u.password = ? AND u.user_type_id = 6
    `;
    const [rows] = await pool.query(sql, [phone, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    // Log passenger login action
    const logSql = `
      INSERT INTO action_history (user_id, role, username, action, details, created_at)
      VALUES (?, 'passenger', ?, 'Login', 'Passenger logged in successfully', NOW())
    `;
    await pool.query(logSql, [rows[0].id, rows[0].username]);

    res.json(rows[0]);
  } catch (err) {
    console.error('Passenger login error:', err);
    res.status(500).json({ message: 'Login failed due to a server error.', error: err.message });
  }
});

// Driver Registration Endpoint
app.post('/api/drivers/register', async (req, res) => {
  const { username, name, birth_date, phone, email, region, province, city_barangay, address, license_number, license_issued, license_expiry, shift, password } = req.body;

  if (!username || !phone || !email || !password || !license_number || !license_expiry) {
    return res.status(400).json({ message: 'Missing required registration fields.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if phone, email, or username already exists in users table
    const [existing] = await conn.query('SELECT id FROM users WHERE phone = ? OR email = ? OR username = ?', [phone, email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A user with this username, phone number, or email already exists.' });
    }

    // For user drivers, we split city_barangay to populate both city and barangay columns, or store it in both to prevent null constraint violations.
    const city = city_barangay;
    const barangay = city_barangay;

    // 1. Insert into users table
    const userSql = `
      INSERT INTO users (user_type_id, username, name, email, phone, address, region, province, city, barangay, password, created_at, updated_at)
      VALUES (4, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [userResult] = await conn.query(userSql, [username, name, email, phone, address, region, province, city, barangay, password]);
    const userId = userResult.insertId;

    // 2. Insert into user_drivers table (status_id = 1: active, including placeholder fields for required NOT NULL document pictures)
    const driverSql = `
      INSERT INTO user_drivers (
        id, status_id, license_number, license_expiry, shift, 
        front_license_picture, back_license_picture, nbi_clearance, selfie_picture, 
        created_at, updated_at
      )
      VALUES (?, 1, ?, ?, ?, 'uploads/placeholder.jpg', 'uploads/placeholder.jpg', 'uploads/placeholder.jpg', 'uploads/placeholder.jpg', NOW(), NOW())
    `;
    await conn.query(driverSql, [userId, license_number, license_expiry, shift]);

    // Log driver registration action
    const logSql = `
      INSERT INTO action_history (user_id, role, username, action, details, created_at)
      VALUES (?, 'driver', ?, 'Register', 'Driver registered successfully', NOW())
    `;
    await conn.query(logSql, [userId, username]);

    await conn.commit();
    res.status(201).json({ id: userId, username, name, phone, email, message: 'Driver registered successfully!' });
  } catch (err) {
    await conn.rollback();
    console.error('Driver registration error:', err);
    res.status(500).json({ message: 'Registration failed due to a database error.', error: err.message });
  } finally {
    conn.release();
  }
});

// Driver Login Endpoint
app.post('/api/drivers/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone number and password are required.' });
  }

  try {
    const sql = `
      SELECT u.id, u.username, u.name, u.email, u.phone, u.address, u.region, u.province, u.city as city_barangay, u.created_at, 
             ud.license_number, ud.license_expiry, ud.shift
      FROM users u
      JOIN user_drivers ud ON u.id = ud.id
      WHERE u.phone = ? AND u.password = ? AND u.user_type_id = 4
    `;
    const [rows] = await pool.query(sql, [phone, password]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    // Log driver login action
    const logSql = `
      INSERT INTO action_history (user_id, role, username, action, details, created_at)
      VALUES (?, 'driver', ?, 'Login', 'Driver logged in successfully', NOW())
    `;
    await pool.query(logSql, [rows[0].id, rows[0].username]);

    res.json(rows[0]);
  } catch (err) {
    console.error('Driver login error:', err);
    res.status(500).json({ message: 'Login failed due to a server error.', error: err.message });
  }
});

// Update Profile Endpoint
app.post('/api/session/update', async (req, res) => {
  const { id, role, name, email, phone, gender, address, region, province, city, barangay, city_barangay, birth_date, license_number, license_expiry, shift } = req.body;

  if (!id || !role) {
    return res.status(400).json({ message: 'User ID and Role are required to update profile.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (role === 'passenger') {
      // 1. Update basic users info
      const userSql = `
        UPDATE users 
        SET name = ?, email = ?, phone = ?, gender = ?, address = ?, region = ?, province = ?, city = ?, barangay = ?, updated_at = NOW()
        WHERE id = ? AND user_type_id = 6
      `;
      await conn.query(userSql, [name, email, phone, gender, address, region, province, city, barangay, id]);

      // 2. Update user_passengers info
      const passengerSql = `
        UPDATE user_passengers 
        SET birth_date = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await conn.query(passengerSql, [birth_date, id]);
    } else if (role === 'driver') {
      const dbCity = city_barangay || city;
      const dbBarangay = city_barangay || barangay;

      // 1. Update basic users info
      const userSql = `
        UPDATE users 
        SET name = ?, email = ?, phone = ?, address = ?, region = ?, province = ?, city = ?, barangay = ?, updated_at = NOW()
        WHERE id = ? AND user_type_id = 4
      `;
      await conn.query(userSql, [name, email, phone, address, region, province, dbCity, dbBarangay, id]);

      // 2. Update user_drivers info
      const driverSql = `
        UPDATE user_drivers 
        SET license_number = ?, license_expiry = ?, shift = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await conn.query(driverSql, [license_number, license_expiry, shift, id]);
    }

    // Log profile update action
    const logSql = `
      INSERT INTO action_history (user_id, role, username, action, details, created_at)
      VALUES (?, ?, ?, 'Update Profile', ?, NOW())
    `;
    const [userRow] = await conn.query('SELECT username FROM users WHERE id = ?', [id]);
    const uName = userRow[0] ? userRow[0].username : '';
    await conn.query(logSql, [id, role, uName, `Profile details updated for role: ${role}`]);

    await conn.commit();
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    await conn.rollback();
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  } finally {
    conn.release();
  }
});

// Log Action Endpoint
app.post('/api/actions/log', async (req, res) => {
  const { user_id, role, username, action, details } = req.body;

  if (!action) {
    return res.status(400).json({ message: 'Action name is required.' });
  }

  try {
    const sql = `
      INSERT INTO action_history (user_id, role, username, action, details, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await pool.query(sql, [user_id || null, role || null, username || null, action, details || null]);
    res.status(201).json({ message: 'Action logged successfully!' });
  } catch (err) {
    console.error('Action logging error:', err);
    res.status(500).json({ message: 'Failed to log action.', error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
