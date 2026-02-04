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

// Function to fetch Kimai users
async function getKimaiUsers() {
  const connection = await mysql.createConnection(kimaiConfig);
  
  const [users] = await connection.execute(`
    SELECT id, username, alias as name, email, enabled 
    FROM kimai2_users 
  `);
  
  const result = users.map((user) => ({
    id: user.id.toString(),
    name: user.name || user.username,
    username: user.username,
    email: user.email,
    enabled: Boolean(user.enabled),
  }));
  
  await connection.end();
  return result;
}

// Function to sync Kimai users
async function syncKimaiUsers() {
  const kimaiUsers = await getKimaiUsers();
  console.log(`Found ${kimaiUsers.length} users in Kimai (${kimaiUsers.filter(u => u.enabled).length} enabled)`);
  
  const prisma = new PrismaClient();
  
  try {
    // Synchronize with local database
    await prisma.person.deleteMany();
    const createdUsers = await prisma.person.createMany({
      data: kimaiUsers.map(user => ({
        id: user.id,
        name: user.name,
        enabled: user.enabled !== undefined ? user.enabled : true,
      })),
    });
    
    console.log(`Synchronized ${createdUsers.count} users to local database`);
    
    // Verify the users are actually in the database
    const verifyUsers = await prisma.person.findMany();
    console.log(`Verified ${verifyUsers.length} users in database`);
    
    // Show a sample of the users
    console.log('\nSample Users in Database:');
    verifyUsers.slice(0, 5).forEach(user => {
      console.log(`- ${user.id}: ${user.name} (${user.enabled ? 'Enabled' : 'Disabled'})`);
    });
    
    if (verifyUsers.length !== kimaiUsers.length) {
      console.log(`\n❌ Mismatch: Kimai has ${kimaiUsers.length}, Database has ${verifyUsers.length}`);
    }
    
    return kimaiUsers;
  } catch (error) {
    console.error('Error syncing Kimai users:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

// Main test function
async function runTest() {
  console.log('=== Testing syncKimaiUsers Function ===');
  
  const startTime = Date.now();
  await syncKimaiUsers();
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`\n=== Test Completed in ${duration.toFixed(2)} seconds ===`);
}

runTest().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
