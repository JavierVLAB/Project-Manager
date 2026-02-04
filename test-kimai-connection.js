const mysql = require('mysql2/promise');

// Kimai database connection configuration
const connectionConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

async function testConnection() {
  console.log('Testing connection to Kimai database...');
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

    // Get list of tables in the database
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

    // Check if there are any user/employee or project related tables
    const userRelatedTables = tables.filter(table => 
      ['user', 'employee', 'person', 'team', 'customer'].some(keyword => 
        table.TABLE_NAME.toLowerCase().includes(keyword)
      )
    );

    const projectRelatedTables = tables.filter(table => 
      ['project', 'task', 'activity'].some(keyword => 
        table.TABLE_NAME.toLowerCase().includes(keyword)
      )
    );

    console.log('\nUser/Employee related tables:');
    if (userRelatedTables.length > 0) {
      userRelatedTables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('  ❗ No user/employee related tables found');
    }

    console.log('\nProject/Task related tables:');
    if (projectRelatedTables.length > 0) {
      projectRelatedTables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('  ❗ No project/task related tables found');
    }

    // If we found user and project tables, check their structure
    if (userRelatedTables.length > 0 && projectRelatedTables.length > 0) {
      console.log('\nChecking user table structure:');
      const [userColumns] = await connection.execute(`
        DESCRIBE ${userRelatedTables[0].TABLE_NAME}
      `);
      userColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });

      console.log('\nChecking project table structure:');
      const [projectColumns] = await connection.execute(`
        DESCRIBE ${projectRelatedTables[0].TABLE_NAME}
      `);
      projectColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
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
