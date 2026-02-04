const mysql = require('mysql2/promise');

const kimaiConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

async function test() {
  try {
    const pool = mysql.createPool(kimaiConfig);
    
    console.log('=== Kimai Users Status ===');
    
    // Get active users
    const [activeUsers] = await pool.execute('SELECT id, username, alias as name, email, enabled FROM kimai2_users WHERE enabled = 1');
    console.log(`\nActive users (enabled = 1):`);
    activeUsers.forEach(user => {
      console.log(`  - ${user.name || user.username} (${user.username})`);
    });
    console.log(`Total: ${activeUsers.length}`);
    
    // Get inactive users
    const [inactiveUsers] = await pool.execute('SELECT id, username, alias as name, email, enabled FROM kimai2_users WHERE enabled = 0');
    console.log(`\nInactive users (enabled = 0):`);
    inactiveUsers.forEach(user => {
      console.log(`  - ${user.name || user.username} (${user.username})`);
    });
    console.log(`Total: ${inactiveUsers.length}`);
    
    console.log(`\n=== Total Users: ${activeUsers.length + inactiveUsers.length} ===`);
    
  } catch (error) {
    console.error('Error:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}

test();
