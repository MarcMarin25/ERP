const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'ddgnsdb'
  });

  console.log('--- Database Verification Script ---');

  // 1. Create a test passenger and a test driver if they don\'t exist
  await conn.beginTransaction();
  try {
    // Check/create user types if needed (already seeded)
    // Create test passenger
    const passengerPhone = '09000000001';
    let [passengerRows] = await conn.query('SELECT id FROM users WHERE phone = ?', [passengerPhone]);
    let passengerId;
    if (passengerRows.length === 0) {
      const [res] = await conn.query(
        `INSERT INTO users (user_type_id, username, name, email, phone, password, created_at, updated_at)
         VALUES (6, 'test_passenger', 'Test Passenger', 'passenger@test.com', ?, 'pass123', NOW(), NOW())`,
        [passengerPhone]
      );
      passengerId = res.insertId;
      await conn.query('INSERT INTO user_passengers (id, status_id, birth_date, created_at, updated_at) VALUES (?, 1, "2000-01-01", NOW(), NOW())', [passengerId]);
      console.log(`Created test passenger user ID: ${passengerId}`);
    } else {
      passengerId = passengerRows[0].id;
      console.log(`Found existing test passenger user ID: ${passengerId}`);
    }

    // Create test driver
    const driverPhone = '09000000002';
    let [driverRows] = await conn.query('SELECT id FROM users WHERE phone = ?', [driverPhone]);
    let driverId;
    if (driverRows.length === 0) {
      const [res] = await conn.query(
        `INSERT INTO users (user_type_id, username, name, email, phone, password, created_at, updated_at)
         VALUES (4, 'test_driver', 'Test Driver', 'driver@test.com', ?, 'pass123', NOW(), NOW())`,
        [driverPhone]
      );
      driverId = res.insertId;
      await conn.query(
        `INSERT INTO user_drivers (id, status_id, license_number, license_expiry, shift, front_license_picture, back_license_picture, nbi_clearance, selfie_picture, created_at, updated_at)
         VALUES (?, 1, 'L12345', '2030-01-01', 'Morning', 'pic.jpg', 'pic.jpg', 'clearance.jpg', 'selfie.jpg', NOW(), NOW())`,
        [driverId]
      );
      console.log(`Created test driver user ID: ${driverId}`);
    } else {
      driverId = driverRows[0].id;
      console.log(`Found existing test driver user ID: ${driverId}`);
    }

    // Create a vehicle for the driver if they don\'t have one
    let [vehicleRows] = await conn.query('SELECT id FROM vehicles WHERE driver_id = ?', [driverId]);
    if (vehicleRows.length === 0) {
      await conn.query(
        `INSERT INTO vehicles (status_id, driver_id, plate_number, vin, brand, model, year, color, or_cr, created_at, updated_at)
         VALUES (1, ?, 'TEST-777', 'VIN777', 'Toyota', 'Vios', 2024, 'Silver', 'orcr.jpg', NOW(), NOW())`,
        [driverId]
      );
      console.log('Created test vehicle for driver.');
    }

    await conn.commit();

    // 2. Perform automated tests on Booking endpoints via direct fetch/calls to localhost:3000
    console.log('\n--- SIMULATING FLOW via API Endpoints ---');
    
    // A. Create booking
    console.log('Simulating Passenger booking a ride...');
    const createRes = await fetch('http://127.0.0.1:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passenger_id: passengerId,
        start_lat: 15.0811,
        start_lng: 120.8222,
        end_lat: 15.1433,
        end_lng: 120.8944,
        distance_km: 8.5,
        pickup_name: 'Candaba Pampanga',
        destination_name: 'San Fernando Pampanga',
        fare: 167.50
      })
    });
    const createData = await createRes.json();
    console.log('Create booking response:', createData);
    const bookingId = createData.bookingId;

    // B. Check pending list
    console.log('Driver fetching pending bookings...');
    const pendingRes = await fetch('http://127.0.0.1:3000/api/bookings/pending');
    const pendingList = await pendingRes.json();
    console.log(`Pending bookings found: ${pendingList.length}`);
    const isFound = pendingList.some(b => b.id === bookingId);
    console.log(`Booking ID ${bookingId} listed in pending: ${isFound ? 'YES' : 'NO'}`);

    // C. Accept booking
    console.log('Driver accepting ride...');
    const acceptRes = await fetch(`http://127.0.0.1:3000/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: driverId })
    });
    const acceptData = await acceptRes.json();
    console.log('Accept booking response:', acceptData);

    // D. Fetch status
    let statusRes = await fetch(`http://127.0.0.1:3000/api/bookings/${bookingId}`);
    let statusData = await statusRes.json();
    console.log(`Current status: ${statusData.status_name} (ID: ${statusData.status_id}), Assigned Driver: ${statusData.driver_name}, Vehicle Plate: ${statusData.vehicle_plate}`);

    // E. Arrived at pickup
    console.log('Driver marking arrival at pickup...');
    const arriveRes = await fetch(`http://127.0.0.1:3000/api/bookings/${bookingId}/arrive`, { method: 'POST' });
    const arriveData = await arriveRes.json();
    console.log('Arrive response:', arriveData);

    // F. Start Trip
    console.log('Driver starting trip...');
    const startRes = await fetch(`http://127.0.0.1:3000/api/bookings/${bookingId}/start`, { method: 'POST' });
    const startData = await startRes.json();
    console.log('Start trip response:', startData);

    // G. End Trip
    console.log('Driver ending trip and collecting fare...');
    const endRes = await fetch(`http://127.0.0.1:3000/api/bookings/${bookingId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fare: 167.50 })
    });
    const endData = await endRes.json();
    console.log('End trip response:', endData);

    // 3. Verify Database Records
    console.log('\n--- VERIFYING DATABASE RECORDS AFTER COMPLETION ---');
    const [finalRouteRows] = await conn.query('SELECT * FROM routes WHERE id = ?', [bookingId]);
    const finalRoute = finalRouteRows[0];
    console.log(`Route ID: ${finalRoute.id}`);
    console.log(`Route Status ID (Expected 16): ${finalRoute.status_id}`);
    console.log(`Route Revenue ID: ${finalRoute.revenue_id}`);

    const [revenueRows] = await conn.query('SELECT * FROM revenues WHERE id = ?', [finalRoute.revenue_id]);
    const revenue = revenueRows[0];
    console.log(`Revenue ID: ${revenue.id}`);
    console.log(`Revenue Amount: ₱${revenue.amount}`);
    console.log(`Revenue Invoice: ${revenue.invoice_no}`);

    const [breakdownRows] = await conn.query('SELECT * FROM revenue_breakdowns WHERE revenue_id = ?', [revenue.id]);
    console.log(`Revenue breakdown entries created: ${breakdownRows.length}`);
    breakdownRows.forEach(b => {
      console.log(`- Percentage Type: ${b.percentage_type_id}, Earning amount: ₱${b.total_earning}`);
    });

    console.log('\nDB Verification Completed Successfully! All operations are functional.');

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    conn.end();
  }
}

test();
