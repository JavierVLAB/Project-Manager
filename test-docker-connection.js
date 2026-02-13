const mysql = require('mysql2/promise');

const connectionConfig = {
  host: 'localhost',
  port: 3307,
  user: 'projectmanager',
  password: 'Brewing4-Prankster-Strategic',
  database: 'projectmanagerdb',
  connectTimeout: 10000,
};

async function testConnection() {
  console.log('Testing MySQL connection to Docker container...');
  console.log(`Host: ${connectionConfig.host}:${connectionConfig.port}`);
  console.log(`User: ${connectionConfig.user}`);
  console.log(`Database: ${connectionConfig.database}`);

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('\n✅ Connection successful');

    // Test simple query
    console.log('\nTesting simple query:');
    const [rows] = await connection.execute('SELECT 1');
    console.log(`✓ Query returned: ${JSON.stringify(rows)}`);

    // Check if database has tables
    console.log('\nChecking database tables:');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [connectionConfig.database]);

    if (tables.length === 0) {
      console.log('❗ Database is empty. No tables found.');
    } else {
      console.log(`✓ Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
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
