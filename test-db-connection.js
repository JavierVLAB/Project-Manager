const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    // Try to connect and fetch some data
    console.log('1. Checking if we can connect...');
    const healthCheck = await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Connection successful');
    console.log('  Health check response:', healthCheck);
    
    // Try to fetch users
    console.log('\n2. Fetching users...');
    const users = await prisma.person.findMany();
    console.log(`✓ Found ${users.length} users`);
    users.forEach(user => {
      console.log(`  - ${user.id}: ${user.name} (${user.role})`);
    });
    
    // Try to fetch projects
    console.log('\n3. Fetching projects...');
    const projects = await prisma.project.findMany();
    console.log(`✓ Found ${projects.length} projects`);
    projects.forEach(project => {
      console.log(`  - ${project.id}: ${project.name} (${project.color})`);
    });
    
    // Try to fetch assignments
    console.log('\n4. Fetching assignments...');
    const assignments = await prisma.assignment.findMany({
      include: {
        person: true,
        project: true
      }
    });
    console.log(`✓ Found ${assignments.length} assignments`);
    assignments.slice(0, 5).forEach(assignment => {
      console.log(`  - ${assignment.person.name} on ${assignment.project.name}: ${assignment.percentage}%`);
    });
    if (assignments.length > 5) {
      console.log(`  ... and ${assignments.length - 5} more`);
    }
    
    console.log('\n✅ All checks passed! Database connection is working properly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nThis is a connection error. Please check:');
      console.error('  1. Is MySQL running on the server?');
      console.error('  2. Is the port 3306 accessible?');
      console.error('  3. Is the server firewall blocking access?');
      console.error('  4. Are the credentials correct?');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nAccess denied. Please check:');
      console.error('  1. Is the username and password correct?');
      console.error('  2. Does the user have permissions to access the database?');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase not found. Please check:');
      console.error('  1. Is the database name correct?');
      console.error('  2. Does the database exist on the server?');
    }
    return false;
  } finally {
    await prisma.$disconnect();
  }
  
  return true;
}

testConnection();
