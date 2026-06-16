const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    multipleStatements: true
  });
  
  console.log('Connected to MySQL server. Creating database ddgnsdb if it doesn\'t exist...');
  await connection.query('CREATE DATABASE IF NOT EXISTS ddgnsdb;');
  await connection.query('USE ddgnsdb;');
  
  console.log('Reading ddgnsdb.sql file...');
  const sqlPath = path.join(__dirname, '../ddgnsdb.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('Executing SQL dump to initialize tables...');
  await connection.query(sql);
  
  console.log('Database ddgnsdb initialized successfully with all tables, constraints, and seeding data!');
  await connection.end();
}

main().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
