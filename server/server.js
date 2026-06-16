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

    const createBookingsTableSql = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        passenger_id bigint(20) unsigned NULL,
        pickup_location VARCHAR(255) NOT NULL,
        destination_location VARCHAR(255) NOT NULL,
        distance_km DECIMAL(10, 2) NOT NULL,
        duration_min INT NOT NULL,
        fare DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await conn.query(createBookingsTableSql);

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

// --- NEW BOOKING ENDPOINTS ---

// 1. Create Booking (Passenger)
app.post('/api/bookings', async (req, res) => {
  const { passenger_id, start_lat, start_lng, end_lat, end_lng, distance_km, pickup_name, destination_name, fare } = req.body;

  if (!passenger_id || !start_lat || !start_lng) {
    return res.status(400).json({ message: 'Missing required booking fields (passenger_id, start_lat, start_lng).' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const routePath = `${pickup_name || 'Pickup'} -> ${destination_name || 'Destination'}`;
    
    // A. Insert into routes table (for driver matching flow)
    const routeSql = `
      INSERT INTO routes (status_id, passenger_id, start_lat, start_lng, end_lat, end_lng, distance_km, route_path, created_at, updated_at)
      VALUES (6, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [routeResult] = await conn.query(routeSql, [
      passenger_id, start_lat, start_lng,
      end_lat || null, end_lng || null,
      distance_km || null, routePath
    ]);
    const routeId = routeResult.insertId;

    // B. Also insert into bookings table (clear record for phpMyAdmin visibility)
    const durationMin = Math.round((distance_km || 0) * 2.5 + 3);
    const bookingSql = `
      INSERT INTO bookings (passenger_id, pickup_location, destination_location, distance_km, duration_min, fare, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `;
    await conn.query(bookingSql, [
      passenger_id,
      pickup_name || 'Pickup',
      destination_name || 'Destination',
      parseFloat(distance_km || 0).toFixed(2),
      durationMin,
      parseFloat(fare || 0).toFixed(2)
    ]);

    // C. Log to action_history
    await conn.query(
      `INSERT INTO action_history (user_id, role, action, details, created_at) VALUES (?, 'passenger', 'Create Booking', ?, NOW())`,
      [passenger_id, `Booking route #${routeId}: ${pickup_name} → ${destination_name} | ${distance_km} km | ₱${fare}`]
    );

    await conn.commit();
    res.status(201).json({ bookingId: routeId, status_id: 6, message: 'Booking created successfully!' });
  } catch (err) {
    await conn.rollback();
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Failed to create booking.', error: err.message });
  } finally {
    conn.release();
  }
});


// 2. Fetch Pending/Unassigned Bookings (Driver)
app.get('/api/bookings/pending', async (req, res) => {
  try {
    const sql = `
      SELECT r.*, u.name as passenger_name
      FROM routes r
      JOIN users u ON r.passenger_id = u.id
      WHERE r.status_id = 6 AND r.driver_id IS NULL
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending bookings:', err);
    res.status(500).json({ message: 'Failed to fetch pending bookings.', error: err.message });
  }
});

// Fetch passenger bookings history
app.get('/api/bookings/passenger/:passenger_id', async (req, res) => {
  const { passenger_id } = req.params;

  try {
    const sql = `
      SELECT r.id, r.status_id, r.start_lat, r.start_lng, r.end_lat, r.end_lng, r.distance_km, r.route_path, r.created_at,
             s.name as status_name,
             u.name as driver_name,
             rev.amount as fare
      FROM routes r
      LEFT JOIN statuses s ON r.status_id = s.id
      LEFT JOIN users u ON r.driver_id = u.id
      LEFT JOIN revenues rev ON r.revenue_id = rev.id
      WHERE r.passenger_id = ?
      ORDER BY r.id DESC
    `;
    const [rows] = await pool.query(sql, [passenger_id]);
    res.json(rows);
  } catch (err) {
    console.error('Fetch passenger bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch passenger bookings.', error: err.message });
  }
});

// 3. Get Booking Details and Status (Passenger and Driver polling)
app.get('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT 
        r.*, 
        s.name as status_name,
        u_pass.name as passenger_name,
        u_pass.phone as passenger_phone,
        u_driver.name as driver_name,
        u_driver.phone as driver_phone,
        v.plate_number as vehicle_plate,
        v.brand as vehicle_brand,
        v.model as vehicle_model
      FROM routes r
      LEFT JOIN statuses s ON r.status_id = s.id
      LEFT JOIN users u_pass ON r.passenger_id = u_pass.id
      LEFT JOIN users u_driver ON r.driver_id = u_driver.id
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching booking details:', err);
    res.status(500).json({ message: 'Failed to fetch booking details.', error: err.message });
  }
});

// 4. Accept Booking (Driver)
app.post('/api/bookings/:id/accept', async (req, res) => {
  const { id } = req.params;
  const { driver_id } = req.body;

  if (!driver_id) {
    return res.status(400).json({ message: 'Driver ID is required to accept booking.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify booking is still pending
    const [booking] = await conn.query('SELECT status_id FROM routes WHERE id = ? FOR UPDATE', [id]);
    if (booking.length === 0) {
      conn.release();
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking[0].status_id !== 6) {
      conn.release();
      return res.status(400).json({ message: 'Booking is no longer pending or has been accepted by another driver.' });
    }

    // Lookup driver vehicle
    const [vehicle] = await conn.query('SELECT id FROM vehicles WHERE driver_id = ? LIMIT 1', [driver_id]);
    const vehicleId = vehicle[0] ? vehicle[0].id : null;

    // Update status to 11 (to_pick_up), assign driver and vehicle
    const sql = `
      UPDATE routes 
      SET driver_id = ?, vehicle_id = ?, status_id = 11, updated_at = NOW() 
      WHERE id = ?
    `;
    await conn.query(sql, [driver_id, vehicleId, id]);

    // Log action
    await conn.query(
      `INSERT INTO action_history (user_id, role, action, details, created_at) VALUES (?, 'driver', 'Accept Booking', ?, NOW())`,
      [driver_id, `Accepted booking route ID ${id} with vehicle ID ${vehicleId}`]
    );

    await conn.commit();
    res.json({ message: 'Booking accepted successfully!', status_id: 11 });
  } catch (err) {
    await conn.rollback();
    console.error('Error accepting booking:', err);
    res.status(500).json({ message: 'Failed to accept booking.', error: err.message });
  } finally {
    conn.release();
  }
});

// 5. Driver Arrived at Pickup
app.post('/api/bookings/:id/arrive', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      UPDATE routes 
      SET status_id = 12, updated_at = NOW() 
      WHERE id = ? AND status_id = 11
    `;
    const [result] = await pool.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Booking cannot be marked as arrived (invalid status).' });
    }
    res.json({ message: 'Driver marked as arrived at pickup.', status_id: 12 });
  } catch (err) {
    console.error('Error marking arrival:', err);
    res.status(500).json({ message: 'Failed to mark arrival.', error: err.message });
  }
});

// 6. Start Trip
app.post('/api/bookings/:id/start', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      UPDATE routes 
      SET status_id = 13, start_trip = NOW(), updated_at = NOW() 
      WHERE id = ? AND status_id = 12
    `;
    const [result] = await pool.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Trip cannot be started (invalid status).' });
    }
    res.json({ message: 'Trip started successfully.', status_id: 13 });
  } catch (err) {
    console.error('Error starting trip:', err);
    res.status(500).json({ message: 'Failed to start trip.', error: err.message });
  }
});

// 7. End/Complete Trip (Generates Revenue & Breakdowns)
app.post('/api/bookings/:id/end', async (req, res) => {
  const { id } = req.params;
  const { fare } = req.body; // Fare calculated by distance

  if (!fare) {
    return res.status(400).json({ message: 'Fare is required to complete trip.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch booking details
    const [booking] = await conn.query('SELECT driver_id, status_id FROM routes WHERE id = ? FOR UPDATE', [id]);
    if (booking.length === 0) {
      conn.release();
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking[0].status_id !== 13) {
      conn.release();
      return res.status(400).json({ message: 'Trip is not in progress and cannot be completed.' });
    }

    const driverId = booking[0].driver_id;

    // A. Create Invoice entry in revenues
    const invoiceNo = `INV-${Date.now()}`;
    const revenueSql = `
      INSERT INTO revenues (status_id, driver_id, invoice_no, amount, currency, service_type, payment_date, notes, created_at, updated_at)
      VALUES (8, ?, ?, ?, 'PHP', 'Trips', NOW(), ?, NOW(), NOW())
    `;
    const [revenueResult] = await conn.query(revenueSql, [driverId, invoiceNo, fare, `Payment for ride booking #${id}`]);
    const revenueId = revenueResult.insertId;

    // B. Calculate & Create Revenue Breakdowns
    // percentage_types: 1=tax (1%), 2=bank (1%), 3=markup_fee (10 PHP flat), 4=system_fee (10 PHP flat)
    const taxEarning = parseFloat((fare * 0.01).toFixed(2));
    const bankEarning = parseFloat((fare * 0.01).toFixed(2));
    const markupEarning = 10.00;
    const systemEarning = 10.00;

    const breakdownSql = `
      INSERT INTO revenue_breakdowns (revenue_id, percentage_type_id, total_earning, created_at, updated_at)
      VALUES 
        (?, 1, ?, NOW(), NOW()),
        (?, 2, ?, NOW(), NOW()),
        (?, 3, ?, NOW(), NOW()),
        (?, 4, ?, NOW(), NOW())
    `;
    await conn.query(breakdownSql, [
      revenueId, taxEarning,
      revenueId, bankEarning,
      revenueId, markupEarning,
      revenueId, systemEarning
    ]);

    // C. Update routes with revenue_id, status_id = 16 (completed), and end_trip = NOW()
    const routeUpdateSql = `
      UPDATE routes 
      SET status_id = 16, revenue_id = ?, end_trip = NOW(), updated_at = NOW() 
      WHERE id = ?
    `;
    await conn.query(routeUpdateSql, [revenueId, id]);

    // D. Update bookings table status to Completed
    await conn.query(
      `UPDATE bookings SET status = 'Completed', fare = ? WHERE passenger_id = ? AND status = 'Pending' ORDER BY created_at DESC LIMIT 1`,
      [fare, driverId]
    ).catch(() => {}); // Non-fatal if bookings table update fails

    // E. Log Action
    await conn.query(
      `INSERT INTO action_history (user_id, role, action, details, created_at) VALUES (?, 'driver', 'Complete Trip', ?, NOW())`,
      [driverId, `Completed trip route ID ${id}. Revenue ID ${revenueId} created. Fare: PHP ${fare}`]
    );

    await conn.commit();
    res.json({ message: 'Trip completed successfully! Transaction logged.', status_id: 16, revenueId });
  } catch (err) {
    await conn.rollback();
    console.error('Error completing trip:', err);
    res.status(500).json({ message: 'Failed to complete trip.', error: err.message });
  } finally {
    conn.release();
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

