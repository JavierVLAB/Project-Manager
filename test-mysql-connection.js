const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Extract connection details from DATABASE_URL
const urlPattern = /mysql:\/\/([^:]+):([^@]+)@([^:]+):([^/]+)\/([^?]+)/;
const matches = process.env.DATABASE_URL.match(urlPattern);

if (!matches) {
  console.error('Invalid DATABASE_URL format');
  process.exit(1);
}

const connectionConfig = {
  host: matches[3],
  port: parseInt(matches[4]),
  user: matches[1],
  password: matches[2],
  database: matches[5],
  connectTimeout: 10000,
};

async function testConnection() {
  console.log('Testing MySQL connection...');
  console.log(`Host: ${connectionConfig.host}:${connectionConfig.port}`);
  console.log(`User: ${connectionConfig.user}`);
  console.log(`Database: ${connectionConfig.database}`);

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('\n✅ Connection successful');

    // Test 1: Simple query
    console.log('\n1. Testing simple query:');
    const [rows] = await connection.execute('SELECT 1');
    console.log('  ✓ Query returned:', rows);

    // Test 2: Check if database exists and has tables
    console.log('\n2. Testing database and tables:');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [connectionConfig.database]);

    if (tables.length === 0) {
      console.log('  ❗ Database is empty. No tables found.');
    } else {
      console.log(`  ✓ Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`    - ${table.TABLE_NAME}`);
      });
    }

    // Test 3: Check if there's any data in people table
    console.log('\n3. Testing people table:');
    try {
      const [people] = await connection.execute('SELECT * FROM people LIMIT 3');
      if (people.length === 0) {
        console.log('  ❗ People table is empty');
      } else {
        console.log(`  ✓ Found ${people.length} people (first 3):`);
        people.forEach(person => {
          console.log(`    - ${person.name} (${person.role})`);
        });
      }
    } catch (error) {
      console.log('  ❗ Table "people" not found');
    }

    console.log('\n✅ All connection tests passed!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  Access denied: Check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('  Database not found');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  Connection refused: Check host/port');
    } else {
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed');
    }
  }
}

testConnection();
