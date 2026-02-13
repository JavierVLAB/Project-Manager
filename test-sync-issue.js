const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');

// Kimai connection config
const kimaiConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

// Function to fetch Kimai users (same as in src/lib/kimai.ts)
async function getKimaiUsers() {
  const connection = await mysql.createConnection(kimaiConfig);
  
  const [users] = await connection.execute(`
    SELECT id, username, alias as name, email, enabled 
    FROM kimai2_users 
  `);
  
  const result = users.map((user) => ({
    id: user.id.toString(),
    name: user.name || user.username, // Use alias (full name) if available
    username: user.username,
    email: user.email,
    role: 'Employee', // Default role
    enabled: Boolean(user.enabled), // Include enabled status
  }));
  
  await connection.end();
  return result;
}

// Function to get current users from projectmanager database
async function getProjectmanagerUsers() {
  const prisma = new PrismaClient();
  const users = await prisma.person.findMany();
  await prisma.$disconnect();
  return users;
}

// Main test function
async function runTest() {
  console.log('=== Kimai to Projectmanager Sync Test ===\n');
  
  // Get users from both databases
  const kimaiUsers = await getKimaiUsers();
  const projectmanagerUsers = await getProjectmanagerUsers();
  
  // Display Kimai users
  console.log(`Kimai Database Users (${kimaiUsers.length} total):`);
  kimaiUsers.forEach(user => {
    console.log(`  - ${user.name} (${user.username}) [${user.enabled ? 'Enabled' : 'Disabled'}]`);
  });
  console.log();
  
  // Display projectmanager users
  console.log(`Projectmanager Database Users (${projectmanagerUsers.length} total):`);
  projectmanagerUsers.forEach(user => {
    console.log(`  - ${user.name} [${user.enabled ? 'Enabled' : 'Disabled'}]`);
  });
  console.log();
  
  // Check synchronization status
  console.log('=== Synchronization Status ===');
  
  // Find users in Kimai not in projectmanager
  const kimaiUserIds = new Set(kimaiUsers.map(u => u.id));
  const projectmanagerUserIds = new Set(projectmanagerUsers.map(u => u.id));
  
  const usersNotSynced = kimaiUsers.filter(u => !projectmanagerUserIds.has(u.id));
  const extraUsers = projectmanagerUsers.filter(u => !kimaiUserIds.has(u.id));
  
  if (usersNotSynced.length > 0) {
    console.log(`❌ ${usersNotSynced.length} Kimai users not synced to Projectmanager:`);
    usersNotSynced.forEach(user => {
      console.log(`  - ${user.name} (${user.username})`);
    });
  }
  
  if (extraUsers.length > 0) {
    console.log(`❌ ${extraUsers.length} users in Projectmanager not found in Kimai:`);
    extraUsers.forEach(user => {
      console.log(`  - ${user.name}`);
    });
  }
  
  if (usersNotSynced.length === 0 && extraUsers.length === 0) {
    console.log('✅ All Kimai users are correctly synchronized with Projectmanager');
  }
  
  console.log();
  console.log('=== Current Sync Function Issue ===');
  console.log('The syncKimaiUsers() function only fetches users from Kimai but');
  console.log('does not actually synchronize them with the local database.');
}

runTest().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
