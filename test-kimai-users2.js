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
    
    // Get sample data from kimai2_users
    console.log('\nSample users (first 10):');
    const [users] = await connection.execute('SELECT id, username, alias, email, enabled FROM kimai2_users LIMIT 10');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Alias: ${user.alias}, Email: ${user.email}, Enabled: ${user.enabled}`);
    });

    // Get sample projects with customer information
    console.log('\nSample projects (first 10 with customer):');
    const [projects] = await connection.execute(`
      SELECT p.id, p.name, c.name as customer_name, p.color, p.visible 
      FROM kimai2_projects p 
      LEFT JOIN kimai2_customers c ON p.customer_id = c.id 
      LIMIT 10
    `);
    projects.forEach(project => {
      console.log(`  - ID: ${project.id}, Name: ${project.name}, Customer: ${project.customer_name}, Color: ${project.color}, Visible: ${project.visible}`);
    });

    console.log('\n✅ Kimai database exploration completed!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed');
    }
  }
}

testUsersTable();
