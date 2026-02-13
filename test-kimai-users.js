const mysql = require('mysql2/promise');

const connectionConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

async function testUsersTable() {
  console.log('Checking Kimai users table structure and data...');

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    
    // Check kimai2_users table structure
    console.log('\nKimai2 Users table structure:');
    const [columns] = await connection.execute('DESCRIBE kimai2_users');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Get sample data from kimai2_users
    console.log('\nSample users (first 10):');
    const [users] = await connection.execute('SELECT id, username, alias, email, active FROM kimai2_users LIMIT 10');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Alias: ${user.alias}, Email: ${user.email}, Active: ${user.active}`);
    });

    // Check if there are any activities and customers tables
    console.log('\nKimai2 Activities table structure:');
    const [activityColumns] = await connection.execute('DESCRIBE kimai2_activities');
    activityColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\nSample activities (first 10):');
    const [activities] = await connection.execute('SELECT id, name, project_id, visible FROM kimai2_activities LIMIT 10');
    activities.forEach(activity => {
      console.log(`  - ID: ${activity.id}, Name: ${activity.name}, Project ID: ${activity.project_id}, Visible: ${activity.visible}`);
    });

    console.log('\nKimai2 Customers table structure:');
    const [customerColumns] = await connection.execute('DESCRIBE kimai2_customers');
    customerColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\nSample customers (first 10):');
    const [customers] = await connection.execute('SELECT id, name, visible FROM kimai2_customers LIMIT 10');
    customers.forEach(customer => {
      console.log(`  - ID: ${customer.id}, Name: ${customer.name}, Visible: ${customer.visible}`);
    });

    console.log('\n✅ Kimai database exploration completed!');
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

testUsersTable();
